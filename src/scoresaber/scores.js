import {parseSsFloat, parseSsInt} from './other'
import {getFirstRegexpMatch} from '../utils/js'
import {getDiffAndTypeFromOnlyDiffName} from '../song'
import {dateFromString} from '../utils/date'
import {trans} from '../Svelte/stores/i18n'

export const parseSsLeaderboardScores = doc => [...doc.querySelectorAll('table.ranking tbody tr')].map(tr => {
  let ret = {tr};

  const picture = tr.querySelector('td.picture img');
  ret.picture = picture ? picture.src : null;

  const rank = tr.querySelector('td.rank');
  ret.rank = rank ? parseSsInt(rank.innerText) : null;

  const player = tr.querySelector('td.player a');
  if (player) {
    ret.playerId = getFirstRegexpMatch(/(\d+)$/, player.href);

    const img = player.querySelector('img');
    ret.country = img ? getFirstRegexpMatch(/^.*?\/flags\/([^.]+)\..*$/, img.src) : null;

    const name = player.querySelector('.songTop.pp');
    ret.playerName = name ? name.innerText.trim() : null;
  } else {
    ret.playerId = null;
    ret.playerName = null;
    ret.country = null;
  }

  const score = tr.querySelector('td.score');
  ret.score = score ? parseSsInt(score.innerText) : null;

  const timeset = tr.querySelector('td.timeset');
  ret.timesetAgo = timeset ? timeset.innerText.trim() : null;

  const mods = tr.querySelector('td.mods center');
  ret.mods = mods ? mods.innerText.trim() : null;

  const percent = tr.querySelector('td.percentage center');
  ret.percent = percent && percent.innerText.trim() !== '-' ? parseFloat(percent.innerText.replace(/[^0-9.]/g, '')) / 100 : null;

  const pp = tr.querySelector('td.pp .scoreTop.ppValue');
  ret.pp = pp ? parseSsFloat(pp.innerText) : null;

  return ret;
});

export const parseSsProfilePage = doc => ({
  name: doc.querySelector('.content .column:not(.avatar) .title a')?.innerText?.trim() ?? null,
  steamUrl: doc.querySelector('.content .column:not(.avatar) .title a')?.href ?? null,
  avatarUrl: doc.querySelector('.column.avatar img')?.src ?? null,
  country: getFirstRegexpMatch(/^.*?\/flags\/([^.]+)\..*$/, doc.querySelector('.content .column .title img').src)?.toLowerCase() ?? null,
  chartHistory: (getFirstRegexpMatch(/data:\s*\[([0-9,]+)\]/, doc.body.innerHTML) ?? '').split(',').map(i => parseInt(i, 10)),
  stats: [{key: 'Player ranking', label: trans('profile.stats.ranking'), type: 'rank', value: parseSsInt(doc.querySelector('.content .column ul li:first-of-type a:first-of-type').innerText ?? ""), countryRank: parseSsInt(doc.querySelector('.content .column ul li:first-of-type a[href^="/global?country="]').innerText ?? ""),},]
    .concat(
    [...doc.querySelectorAll('.content .column ul li:not(:first-child)')]
      .map(li => {
        const matches = li.innerHTML.match(/^\s*<strong>([^:]+)\s*:?\s*<\/strong>\s*(.*)$/);
        if (!matches) return null;

        const mapping = [
          {key: 'Performance Points', type: 'number', precision: 2, suffix: 'pp', label: trans('profile.stats.pp'), number: true,},
          {key: 'Play Count', type: 'number', precision: 0, label: trans('profile.stats.playCount'), number: true, colorVar: 'selected',},
          {key: 'Total Score', type: 'number', precision: 0, label: trans('profile.stats.totalScore'), number: true, colorVar: 'selected',},
          {key: 'Replays Watched by Others', type: 'number', precision: 0, label: trans('profile.stats.replaysShort'), title: trans('profile.stats.replays'), number: true, colorVar: 'dimmed',},
          {key: 'Role', label: trans('profile.stats.role'), number: false, colorVar: 'dimmed'},
          {key: 'Inactive Account', label: trans('profile.stats.inactiveAccount'), number: false, colorVar: 'decrease'},
        ];

        const value = mapping.filter(m => m.number).map(m => m.key).includes(matches[1])
          ? parseSsFloat(matches[2])
          : matches[2];

        const item = mapping.find(m => m.key === matches[1]);
        return item ? {...item, value} : {label: matches[1], value};
      })
      .filter(s => s)
  ).reduce((cum, item) => {
      if(item.key)
        switch(item.key) {
          case 'Player ranking':
            cum.rank = item.value;
            cum.countryRank = item.countryRank;
            break;

          case 'Performance Points': cum.pp = item.value; break;
          case 'Play Count': cum.playCount = item.value; break;
          case 'Total Score': cum.totalScore = item.value; break;
          case 'Replays Watched by Others': cum.replays = item.value; break;
          case 'Role': cum.role = item.value; break;
          case 'Inactive Account': cum.inactiveAccount = true; break;
        }

      return cum;
    }, {inactiveAccount: false}),
  ssBadges: [...doc.querySelectorAll('.column.avatar center img')].map(img => ({src: img.src, title: img.title})),
  pageNum: parseInt(doc.querySelector('.pagination .pagination-list li a.is-current')?.innerText ?? '0', 10),
  pageQty: parseInt(doc.querySelector('.pagination .pagination-list li:last-of-type')?.innerText ?? '0', 10),
  totalItems: parseSsFloat(getFirstRegexpMatch(/^\s*<strong>(?:[^:]+)\s*:?\s*<\/strong>\s*(.*)$/, doc.querySelector('.columns .column:not(.is-narrow) ul li:nth-of-type(3)')?.innerHTML)) ?? 0,
  scores:
    [...doc.querySelectorAll('table.ranking tbody tr')].map(tr => {
      let ret = {lastUpdated: new Date()};

      const rank = tr.querySelector('th.rank');
      if (rank) {
        const rankMatch = parseSsInt(rank.innerText);
        ret.rank = rankMatch ?? null;
      } else {
        ret.rank = null;
      }

      const song = tr.querySelector('th.song a');
      if (song) {
        const leaderboardMatch = getFirstRegexpMatch(/leaderboard\/(\d+)/, song.href);
        ret.leaderboardId = leaderboardMatch ? parseInt(leaderboardMatch, 10) : null;
      } else {
        ret.leaderboardId = null;
      }

      const img = tr.querySelector('th.song img');
      ret.songImg = img ? img.src : null;

      const imgMatch = img ? img.src.match(/([^\/]+)\.(jpg|jpeg|png)$/) : null;
      ret.hash = imgMatch ? imgMatch[1] : null;

      const songPp = tr.querySelector('th.song a .songTop.pp');
      const songMatch = songPp ? songPp.innerHTML.replace(/&amp;/g,'&').match(/^(.*?)\s*<span[^>]+>(.*?)<\/span>/) : null;
      if (songMatch) {
        const songAuthorMatch = songMatch[1].match(/^(.*?)\s-\s(.*)$/);
        if (songAuthorMatch) {
          ret.songName = songAuthorMatch[2];
          ret.songAuthorName = songAuthorMatch[1];
        } else {
          ret.songName = songMatch[1];
          ret.songAuthorName = '';
        }
        ret.songDiff = songMatch[2];
        ret.diffInfo = getDiffAndTypeFromOnlyDiffName(ret.songDiff);
      } else {
        ret = Object.assign(ret, {songName: null, songAuthorName: null, songDiff: null, diffInfo: null});
      }

      const songMapper = tr.querySelector('th.song a .songTop.mapper');
      ret.levelAuthorName = songMapper ? songMapper.innerText : null;

      const songDate = tr.querySelector('th.song span.songBottom.time');
      ret.timeset = songDate ? dateFromString(songDate.title) : null;
      ret.timesetStr = songDate ? songDate.title : null;

      const pp = tr.querySelector('th.score .scoreTop.ppValue');
      if (pp) ret.pp = parseFloat(pp.innerText.replace(/[^0-9.]/g, ''));

      const ppWeighted = tr.querySelector('th.score .scoreTop.ppWeightedValue');
      const ppWeightedMatch = ppWeighted ? getFirstRegexpMatch(/^\(([0-9.]+)pp\)$/, ppWeighted.innerText) : null;
      ret.ppWeighted = ppWeightedMatch ? parseFloat(ppWeightedMatch) : null;

      const scoreInfo = tr.querySelector('th.score .scoreBottom');
      const scoreInfoMatch = scoreInfo ? scoreInfo.innerText.match(/^([^:]+):\s*([0-9,.]+)(?:.*?\((.*?)\))?/) : null;
      if (scoreInfoMatch) {
        switch (scoreInfoMatch[1]) {
          case "score":
            ret.percent = null;
            ret.mods = scoreInfoMatch[3] ? scoreInfoMatch[3] : "";
            ret.score = parseFloat(scoreInfoMatch[2].replace(/[^0-9.]/g, ''));
            break;

          case "accuracy":
            ret.score = null;
            ret.mods = scoreInfoMatch[3] ? scoreInfoMatch[3] : "";
            ret.percent = parseFloat(scoreInfoMatch[2].replace(/[^0-9.]/g, '')) / 100;
            break;
        }
      }

      return ret;
    }),
});
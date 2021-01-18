import {parseSsFloat, parseSsInt} from './other'
import {getFirstRegexpMatch} from '../utils/js'
import {getDiffAndTypeFromOnlyDiffName} from '../song'
import {dateFromString} from '../utils/date'
import {trans} from '../Svelte/stores/i18n'
import {substituteVars} from '../utils/format'
import {SCORES_PER_PAGE, SONG_LEADERBOARD_URL} from '../network/scoresaber/consts'

export const getSongLeaderboardUrl = (leaderboardId, page = 1) => substituteVars(SONG_LEADERBOARD_URL, {leaderboardId, page})

export const parseSsLeaderboardScores = doc => [...doc.querySelectorAll('table.ranking tbody tr')].map(tr => {
  let ret = {lastUpdated: new Date()};

  const parseValue = selector => parseSsFloat(tr.querySelector(selector)?.innerText ?? '') ?? null

  ret.picture = tr.querySelector('.picture img')?.src ?? null;

  ret.rank = parseSsInt(tr.querySelector('td.rank')?.innerText ?? '') ?? null;

  const player = tr.querySelector('.player a');
  if (player) {
    ret.country = getFirstRegexpMatch(/^.*?\/flags\/([^.]+)\..*$/, player.querySelector('img')?.src ?? '') ?? null;
    ret.playerName = player.querySelector('span.songTop.pp')?.innerText ?? null;
    ret.playerId = getFirstRegexpMatch(/\/u\/(\d+)((\?|&|#).*)?$/, player.href ?? '') ?? null;
  } else {
    ret.country = null;
    ret.playerId = null;
    ret.playerName = null;
  }

  ret.score = parseValue('td.score');

  ret.timesetAgo = tr.querySelector('td.timeset')?.innerText?.trim() ?? null;

  ret.mods = tr.querySelector('td.mods')?.innerText?.replace('-','').split(',').filter(m => m && m.trim().length) ?? null;
  ret.mods = ret.mods && ret.mods.length ? ret.mods.join(',') : null;

  ret.pp = parseValue('td.pp .scoreTop.ppValue');

  ret.acc = parseValue('td.percentage');

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
      const songMatch = songPp
        ? songPp.innerHTML
          .replace(/&amp;/g, '&')
          .replace(/<span class="__cf_email__" data-cfemail="[^"]+">\[email&nbsp;protected]<\/span>/g, '')
          .match(/^(.*?)\s*<span[^>]+>(.*?)<\/span>/)
        : null;
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
      if (pp) ret.pp = parseSsFloat(pp.innerText) ?? null;

      const ppWeighted = tr.querySelector('th.score .scoreTop.ppWeightedValue');
      const ppWeightedMatch = ppWeighted ? getFirstRegexpMatch(/^\(([0-9.]+)pp\)$/, ppWeighted.innerText) : null;
      ret.ppWeighted = ppWeightedMatch ? parseSsFloat(ppWeightedMatch) : null;

      const scoreInfo = tr.querySelector('th.score .scoreBottom');
      const scoreInfoMatch = scoreInfo ? scoreInfo.innerText.match(/^([^:]+):\s*([0-9,.]+)(?:.*?\((.*?)\))?/) : null;
      if (scoreInfoMatch) {
        switch (scoreInfoMatch[1]) {
          case "score":
            ret.acc = null;
            ret.mods = scoreInfoMatch[3] ? scoreInfoMatch[3] : "";
            ret.score = parseSsFloat(scoreInfoMatch[2]);
            break;

          case "accuracy":
            ret.score = null;
            ret.mods = scoreInfoMatch[3] ? scoreInfoMatch[3] : "";
            ret.acc = parseSsFloat(scoreInfoMatch[2]);
            break;
        }
      }

      return ret;
    }),
});

export const parseSsSongLeaderboardPage = doc => {
  const diffs = [...doc.querySelectorAll('.tabs ul li a') ?? []].map(a => ({name: a.innerText, id: parseInt(getFirstRegexpMatch(/leaderboard\/(\d+)$/, a.href), 10), color: a.querySelector('span')?.style?.color}));
  const currentDiffHuman = doc.querySelector('.tabs li.is-active a span')?.innerText ?? null;
  const song = [
    {id: 'hash', label: 'ID', value: null},
    {id: 'scores', label: 'Scores', value: null},
    {id: 'status', label: 'Status', value: null},
    {id: 'totalScores', label: 'Total Scores', value: null},
    {id: 'noteCount', label: 'Note Count', value: null},
    {id: 'bpm', label: 'BPM', value: null},
    {id: 'stars', label: 'Star Difficulty', value: null},
    {id: 'levelAuthorName', label: 'Mapped by', value: null},
  ]
    .map(sid => ({...sid, value: doc.querySelector('.column.is-one-third-desktop .box:first-of-type').innerHTML.match(new RegExp(sid.label + ':\\s*<b>(.*?)</b>', 'i'))}))
    .concat([{id: 'songName', value: [null, doc.querySelector('.column.is-one-third-desktop .box:first-of-type .title a')?.innerText]}])
    .reduce((cum, sid) => {
      let value = Array.isArray(sid.value) ? sid.value[1] : null;
      if (value !== null && ['scores', 'totalScores', 'stars', 'bpm', 'noteCount'].includes(sid.id)) value = parseSsFloat(value);
      if (value && sid.id === 'songName') {
        const songAuthorMatch = value.match(/^(.*?)\s-\s(.*)$/);
        if (songAuthorMatch) {
          value = songAuthorMatch[2];
          cum.songAuthorName = songAuthorMatch[1];
        } else {
          cum.songAuthorName = '';
        }
      }
      if (value && sid.id === 'levelAuthorName') {
        const el = doc.createElement('div'); el.innerHTML = value;
        value = el.innerText;
      }
      if (value !== null) cum[sid.id] = value;

      return cum;
    }, {});

  const pageQty = parseInt(doc.querySelector('.pagination .pagination-list li:last-of-type')?.innerText ?? '0', 10)
  const scoresQty = song?.scores ?? 0;
  const totalItems = Math.ceil(scoresQty / SCORES_PER_PAGE) > pageQty ? pageQty * SCORES_PER_PAGE : scoresQty;

  return {
    currentDiff: currentDiffHuman?.toLowerCase()?.replace('+', 'Plus') ?? null,
    currentDiffHuman,
    diffs,
    song,
    diffChart: (getFirstRegexpMatch(/'difficulty',\s*([0-9.,\s]+)\s*\]/, doc.body.innerHTML) ?? '').split(',').map(i => parseFloat(i)).filter(i => i),
    pageNum: parseInt(doc.querySelector('.pagination .pagination-list li a.is-current')?.innerText ?? '0', 10),
    pageQty,
    totalItems,
    scores: parseSsLeaderboardScores(doc),
  }
};
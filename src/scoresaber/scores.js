import {parseSsFloat, parseSsInt} from './other'
import {getFirstRegexpMatch} from '../utils/js'

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

export const parseSsUserScores = doc => [...doc.querySelectorAll('table.ranking tbody tr')].map(tr => {
  let ret = {tr, lastUpdated: new Date()};

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
  ret.id = imgMatch ? imgMatch[1] : null;

  const songPp = tr.querySelector('th.song a .songTop.pp');
  const songMatch = songPp ? songPp.innerHTML.match(/^(.*?)\s*<span[^>]+>(.*?)<\/span>/) : null;
  if (songMatch) {
    ret.songName = songMatch[1];
    ret.songDiff = songMatch[2];
  } else {
    ret = Object.assign(ret, {songName: null, songDiff: null});
  }

  const songMapper = tr.querySelector('th.song a .songTop.mapper');
  ret.levelAuthorName = songMapper ? songMapper.innerText : null;

  const songDate = tr.querySelector('th.song span.songBottom.time');
  ret.timeset = songDate ? songDate.title : null;

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
});
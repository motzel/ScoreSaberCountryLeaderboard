import Profile from './Svelte/Components/Player/Profile.svelte';
import CountryRanking from './Svelte/Components/Country/Ranking.svelte';
import SongLeaderboard from './Svelte/Components/Song/Leaderboard.svelte';
import WhatIfpp from './Svelte/Components/Song/WhatIfPp.svelte';
import SongScore from './Svelte/Components/SsEnhance/Score.svelte';
import Refresh from './Svelte/Components/Common/Refresh.svelte';
import SongBrowser from './Svelte/Components/Song/Browser.svelte';

import log from './utils/logger';
import {default as config, getMainUserId} from './temp';
import {getCacheAndConvertIfNeeded, Globals} from "./store";
import {convertArrayToObjectByKey, getFirstRegexpMatch} from "./utils/js";
import {getLeaderboard, getSongMaxScore} from "./song";
import {shouldBeHidden} from "./eastereggs";
import {filterByCountry, mapUsersToObj} from "./scoresaber/players";

import {getRankedSongs} from "./scoresaber/rankeds";
import {
    findRawPp,
    getAllRankedsWithUserScores,
    getEstimatedAcc,
    PP_PER_STAR,
    ppFromScore,
    getWhatIfScore,
    getTotalUserPp
} from "./scoresaber/pp";
import {dateFromString} from "./utils/date";
import {formatNumber} from "./utils/format";

const getLeaderboardId = () => getFirstRegexpMatch(/\/leaderboard\/(\d+)(\?page=.*)?#?/, window.location.href.toLowerCase());
const getSongHash = () => document.querySelector('.title~b')?.innerText;
const isLeaderboardPage = () => null !== getLeaderboardId();
const getProfileId = () => getFirstRegexpMatch(/\u\/(\d+)((\?|&).*)?$/, window.location.href.toLowerCase());
const isProfilePage = () => null !== getProfileId();
const isCountryRankingPage = () =>
    [
        'https://scoresaber.com/global?country=' + config.COUNTRY,
        'https://scoresaber.com/global/1&country=' + config.COUNTRY
    ].indexOf(window.location.href) >= 0;

function assert(el) {
    if (null === el) throw new Error('Assertion failed');

    return el;
}

function getBySelector(sel, el = null) {
    return assert((el ?? document).querySelector(sel));
}

async function setupPlTable() {
    let scoreTableNode = getBySelector('.ranking table.global');
    const leaderboardId = getLeaderboardId();
    const leaderboard = await getLeaderboard(getSongHash(), leaderboardId);
    if(leaderboard?.length) {
        let tblContainer = document.createElement('div');
        tblContainer["id"] = "sspl";
        tblContainer.style["display"] = "none";
        scoreTableNode.parentNode.appendChild(tblContainer);

        const songLeaderboard = new SongLeaderboard({
            target: tblContainer,
            props: {
                leaderboardId,
                leaderboard
            }
        });
        songLeaderboard.$on('data-refreshed', async _ => {
            const leaderboard = await getLeaderboard(getSongHash(), leaderboardId);
            songLeaderboard.$set({leaderboard});
        });
    }

    return leaderboard;
}

async function setupLeaderboard() {
    log.info("Setup leaderboard page");

    const leaderboardId = getLeaderboardId();
    if (!leaderboardId) return;

    const leaderboard = await setupPlTable();
    if(!leaderboard || !leaderboard.length) return;

    const tabs = getBySelector('.tabs > ul');
    tabs.appendChild(
        generate_tab(
            'pl_tab',
            null === document.querySelector('.filter_tab')
        )
    );

    document.addEventListener(
        'click',
        function (e) {
            let clickedTab = e.target.closest('.filter_tab');
            if (!clickedTab) return;

            const box = assert(e.target.closest('.box'));

            const sspl = getBySelector('#sspl', box);
            const originalTable = getBySelector('table.ranking', box);
            if (clickedTab.classList.contains('sspl')) {
                originalTable.style.display = 'none';
                sspl.style.display = '';
                getBySelector('.pagination').style.display = 'none';
            } else {
                originalTable.style.display = '';
                sspl.style.display = 'none';
                getBySelector('.pagination').style.display = '';
            }
        },
        { passive: true }
    );

    // TODO: dont show when no user data is available
    const sseUserId = getMainUserId();
    if (sseUserId) {
        [].forEach.call(document.querySelectorAll('.scoreTop.ppValue'), async function (span) {
            const pp = parseFloat(
                span.innerText.replace(/\s/, '').replace(',', '.')
            );
            if (pp && pp > 0.0 + Number.EPSILON) {
                new WhatIfpp({
                    target: span.parentNode,
                    props: {
                        leaderboardId,
                        pp
                    }
                });
            }
        });
    }

    log.info("Setup leaderboard page / Done")
}

function setupChart() {
    log.info("Setup chart");

    const chart = document.getElementById('rankChart');
    if(!chart) return;

    const history = getFirstRegexpMatch(/data:\s*\[([0-9,]+)\]/, document.body.innerHTML);
    if(!history) return;

    chart.parentNode.innerHTML = '<canvas class="chartjs-render-monitor" id="rankChart"></canvas>';

    let myChart = new Chart(document.getElementById("rankChart"), {
        responsive: true,
        onResize: function(chart, size){
            chart.resize();
            chart.render(true);
        },
        type: 'line',
        data: {
            labels: Array(50).fill(0).map((v,i) => 0===i ? 'now' : 1===i ? 'yesterday' : i + ' days ago').reverse(),
            datasets: [{
                data: history.split(','),
                label: "Rank",
                borderColor: "#3e95cd",
                fill: false
            },]
        },
        options: {
            maintainAspectRatio: false,
            title: {
                display: false,
            },
            tooltips: {
                mode: 'index',
                intersect: false,

            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                yAxes: [{
                    ticks: {
                        reverse: true,
                        userCallback: function(label, index, labels) {
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        },
                    }
                }],
            }
        }
    });

    log.info("Setup chart / Done")
}

async function setupProfile() {
    log.info("Setup profile page");

    if (document.readyState == 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupChart()
        })
    } else {
        // DOM is ready
        setupChart();
    }

    const profileId = getProfileId();
    if (!profileId) return;

    const data = await getCacheAndConvertIfNeeded();

    const tbl = document.querySelector('table.ranking');
    if(tbl) tbl.classList.add('sspl');

    (await Promise.all([...document.querySelectorAll('table.ranking tbody tr')].map(async tr => {
        let ret = {tr};

        const rank = tr.querySelector('th.rank');
        if(rank) {
            const rankMatch = getFirstRegexpMatch(/#(\d+)/, rank.innerText);
            ret.rank = rankMatch ? parseInt(rankMatch, 10) : null;
        } else {
            ret.rank = null;
        }

        const song = tr.querySelector('th.song a');
        if(song) {
            const leaderboardMatch = getFirstRegexpMatch(/leaderboard\/(\d+)/, song.href);
            ret.leaderboardId = leaderboardMatch ? parseInt(leaderboardMatch, 10): null;
        } else {
            ret.leaderboardId = null;
        }

        const img = tr.querySelector('th.song img');
        ret.songImg = img ? img.src : null;

        const songPp = tr.querySelector('th.song a .songTop.pp');
        const songMatch = songPp ? songPp.innerHTML.match(/^(.*?)\s*<span[^>]+>(.*?)<\/span>/) : null;
        if(songMatch) {
            ret.songName = songMatch[1];
            ret.songDiff = songMatch[2];
        } else {
            ret = Object.assign(ret, {songName: null, songDiff: null});
        }

        const songMapper = tr.querySelector('th.song a .songTop.mapper');
        ret.songMapper = songMapper ? songMapper.innerText : null;

        const songDate = tr.querySelector('th.song span.songBottom.time');
        ret.timeset = songDate ? songDate.title : null;

        const pp = tr.querySelector('th.score .scoreTop.ppValue');
        if(pp) ret.pp = parseFloat(pp.innerText);

        const ppWeighted = tr.querySelector('th.score .scoreTop.ppWeightedValue');
        const ppWeightedMatch = ppWeighted ? getFirstRegexpMatch(/^\(([0-9.]+)pp\)$/, ppWeighted.innerText) : null;
        ret.ppWeighted = ppWeightedMatch ? parseFloat(ppWeightedMatch) : null;

        const scoreInfo = tr.querySelector('th.score .scoreBottom');
        const scoreInfoMatch = scoreInfo ? scoreInfo.innerText.match(/^([^:]+):\s*([0-9,.]+)(?:.*?\((.*?)\))?/) : null;
        if(scoreInfoMatch) {
            switch(scoreInfoMatch[1]) {
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

        const leaderboard = data.users?.[profileId]?.scores?.[ret.leaderboardId];
        if (leaderboard) {
            try {
                const maxSongScore = await getSongMaxScore(leaderboard.id, leaderboard.diff);

                if (!ret.percent && ret.score) {
                    ret.percent = maxSongScore
                        ? ret.score / maxSongScore
                        : (leaderboard.maxScoreEx
                            ? ret.score / leaderboard.maxScoreEx
                            : null);
                }

                if(!ret.score && ret.percent) {
                    ret.score = maxSongScore || leaderboard.maxScoreEx ? Math.round(ret.percent * (maxSongScore ? maxSongScore : leaderboard.maxScoreEx)) : null;
                }

                ret.hidden = shouldBeHidden(Object.assign({}, leaderboard, {id: leaderboard.playerId, percent: leaderboard.percent}))

                const history = leaderboard.history && leaderboard.history.length ? leaderboard.history[0] : null;
                ret.prevRank = history ? history.rank : null;
                ret.prevPp = history ? history.pp : null;
                ret.prevScore = history ? history.score : null;
                ret.prevTimeset = history ? new Date(Date.parse(history.rank)) : null;
                ret.prevPercent = history && ret.prevScore ? (maxSongScore
                    ? ret.prevScore / maxSongScore
                    : (leaderboard.maxScoreEx
                        ? ret.prevScore / leaderboard.maxScoreEx
                        : null)) : null;
            } catch (e) {} // swallow error
        }

        return ret;
    })))
        .filter(s => null !== s.tr)
        .forEach(s => {
            const score = s.tr.querySelector('.score');
            if(!score) return;

            score.innerHTML = "";

            new SongScore({
                target: score,
                props: {song: s}
            })
        });

    const stats = document.querySelector('.content .column ul');
    if (stats && data.users?.[profileId]?.stats) {
        new Profile({
            target: stats,
            props: {
                profile: data.users?.[profileId] ?? null,
            }
        });

        const level = document.querySelector('.content .box .level');
        if(level) {
            const box = document.createElement('div');
            box.classList.add('box');
            box.classList.add('has-shadow');
            level.parentNode.parentNode.insertBefore(box, level.parentNode);

            new SongBrowser({
                target: box,
                props: {
                    playerId: profileId
                }
            })
        }
    }

    const header = document.querySelector('.content .column h5');
    if (header) {
        const refreshDiv = document.createElement('div');
        refreshDiv.classList.add('refresh');
        header.appendChild(refreshDiv);
        const refresh = new Refresh({
            target: refreshDiv,
            props: {}
        })
        refresh.$on('data-refreshed', async _ => {
            window.location.reload(false);
        })
    }

    log.info("Setup profile page / Done")
}

async function setupCountryRanking(diffOffset = 6) {
    log.info("Setup country ranking");

    const users = (await getCacheAndConvertIfNeeded())?.users;
    if (!users) return;

    const origTable = getBySelector('table.ranking.global');

    const pagination = getBySelector(
        '.pagination',
        origTable.parentNode.parentNode
    );
    const typeSel = document.createElement('select');
    typeSel.classList.add('type');
    [
        {value: 'sspl', text: 'Cached'},
        {value: 'original', text: 'Original'}
    ].map((o) => {
            const option = document.createElement('option');
            option.selected = o.value === 'sspl';
            option.value = o.value;
            option.text = o.text;
            typeSel.appendChild(option);
        }
    );
    pagination.insertBefore(typeSel, getBySelector('br', pagination));
    typeSel.addEventListener('change', (e) =>
        Array.prototype.slice
            .apply(
                e.target
                    .closest('.box')
                    .querySelectorAll('table.ranking.global')
            )
            .map(
                (tbl) =>
                    (tbl.style.display = tbl.classList.contains(
                        e.target.options[e.target.selectedIndex].value
                    )
                        ? ''
                        : 'none')
            )
    );

    origTable.style.display = 'none';
    origTable.classList.add('original');

    new CountryRanking({
        target: origTable.parentNode,
        props: {
            users: mapUsersToObj(filterByCountry(users), users)
        }
    });

    log.info("Setup country ranking / Done")
}

function generate_tab(css_id, has_offset) {
    const tabClass = 'filter_tab sspl ' + (has_offset ? ' offset_tab' : '');

    const li = document.createElement('li');
    li.id = css_id;
    tabClass.split(' ').filter(cls => cls.length).map(cls => li.classList.add(cls));

    const a = document.createElement('a');
    a.classList.add('has-text-info');

    const img = document.createElement('img');
    img.classList.add('bloodtrail');
    img.src = require('./resource/img/bloodtrail.png').default;
    a.appendChild(img);
    li.appendChild(a);

    a.addEventListener('click', () => {
        document
            .querySelectorAll('.tabs > ul .filter_tab')
            .forEach((x) => x.classList.remove('is-active'));
        assert(document.getElementById(css_id)).classList.add('is-active');
    });

    return li;
}

function setupStyles() {
    log.info("Setup styles");

    const addStyles = GM_addStyle ? GM_addStyle : () => {};

    addStyles(require('./resource/style/style.css').toString());

    // set css variables
    let cssVars = [];
    if(!getComputedStyle(document.documentElement).getPropertyValue('--foreground').length) {
        // light mode
        cssVars = [
            ['background', 'white'],
            ['foreground', 'white'],
            ['textColor', '#4a4a4a'],
            ['ppColour', '#6772E5'],
            ['alternate', '#3273dc'],
            ['hover', '#ddd']
        ]
    } else {
        cssVars = [
            ['hover', '#444']
        ]
    }
    cssVars.map(s => document.documentElement.style.setProperty('--' + s[0], s[1]));
}

async function setupDelayed() {
    initialized = true;

    if (isLeaderboardPage()) {
        // wait for SSE or given timeout
        await waitForSSEInit(config.SSE_CHECK_DELAY);

        await setupLeaderboard();
    }
}

function rafAsync() {
    return new Promise(resolve => {
        requestAnimationFrame(resolve); //faster than set time out
    });
}

function checkElement(selector) {
    if (document.querySelector(selector) === null) {
        return rafAsync().then(() => checkElement(selector));
    } else {
        return Promise.resolve(true);
    }
}

async function waitForSSEInit(timeout) {
    log.info("Waiting for SSE initialization");

    return new Promise(function(resolve, reject) {
        // whatever comes first
        checkElement('#all_scores_tab').then(el => resolve(el))
        setTimeout(() => resolve(null), timeout);
    });
}

let initialized = false;

async function init() {
    log.info("init");

    if (initialized) {
        return;
    }

    // fetch cache
    const data = await getCacheAndConvertIfNeeded();

    setupStyles();

    if (isProfilePage()) {
        setupProfile();
    }

    if (isCountryRankingPage()) {
        setupCountryRanking();
    }

    await setupDelayed();

    log.info("Setup complete");
}

init();
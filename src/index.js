import Profile from './Svelte/Components/Player/Profile.svelte';
import ProfileStats from './Svelte/Components/Player/ProfileStats.svelte';
import CountryDashboard from './Svelte/Components/Country/Dashboard.svelte';
import SongLeaderboard from './Svelte/Components/Song/Leaderboard.svelte';
import SongIcons from './Svelte/Components/Song/Icons.svelte';
import SongCard from './Svelte/Components/Song/LeaderboardCard.svelte';
import WhatIfpp from './Svelte/Components/Song/WhatIfPp.svelte';
import SongScore from './Svelte/Components/SsEnhance/Score.svelte';
import Refresh from './Svelte/Components/Player/Refresh.svelte';
import SongBrowser from './Svelte/Components/Song/Browser.svelte';
import Button from './Svelte/Components/Common/Button.svelte';
import Avatar from './Svelte/Components/Common/Avatar.svelte';
import PlayerSettings from './Svelte/Components/Player/Settings.svelte';
import Chart from './Svelte/Components/Player/Chart.svelte';

import log from './utils/logger';
import config from './temp';
import {getCacheAndConvertIfNeeded, setCache} from "./store";
import {getFirstRegexpMatch} from "./utils/js";
import {getSongMaxScore} from "./song";
import {shouldBeHidden} from "./eastereggs";

import twitch from './services/twitch';
import {getConfig, getMainPlayerId} from "./plugin-config";
import {setSsDefaultTheme, setTheme} from "./theme";
import eventBus from './utils/broadcast-channel-pubsub';
import initDownloadManager from './network/download-manager';
import logger from "./utils/logger";
import {getPlayerScores, removePlayerFromGroup} from "./scoresaber/players";
import {getPlayerWithUpdatedScores, updateActivePlayers} from "./network/scoresaber/players";
import {getRankedSongs} from "./scoresaber/rankeds";
import {formatDateRelative, formatNumber, round, roundToPrecision} from "./utils/format";
import {dateFromString} from "./utils/date";
import {trans, setLangFromConfig} from "./Svelte/stores/i18n";

const getLeaderboardId = () => getFirstRegexpMatch(/\/leaderboard\/(\d+)(\?page=.*)?#?/, window.location.href.toLowerCase());
const isLeaderboardPage = () => null !== getLeaderboardId();
const getProfileId = () => getFirstRegexpMatch(/\u\/(\d+)((\?|&|#).*)?$/, window.location.href.toLowerCase());
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
    if (!leaderboardId) return null;

    let tblContainer = document.createElement('div');
    tblContainer["id"] = "sspl";
    tblContainer.style["display"] = "none";
    scoreTableNode.parentNode.appendChild(tblContainer);

    new SongLeaderboard({
        target: tblContainer,
        props: {leaderboardId}
    });
}

async function setupLeaderboard() {
    log.info("Setup leaderboard page");

    const leaderboardId = getLeaderboardId();
    if (!leaderboardId) return;

    await setupPlTable();

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
    const config = await getConfig('songLeaderboard');
    const mainPlayerId = await getMainPlayerId();
    if (mainPlayerId && !!config.showWhatIfPp) {
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

    const songInfoBox = document.querySelector('.column.is-one-third-desktop .box:first-of-type');

    const songInfoData = [
        {id: 'hash', label: 'ID', value: null},
        {id: 'scores', label: 'Scores', value: null},
        {id: 'status', label: 'Status', value: null},
        {id: 'totalScores', label: 'Total Scores', value: null},
        {id: 'noteCount', label: 'Note Count', value: null},
        {id: 'bpm', label: 'BPM', value: null},
        {id: 'stars', label: 'Star Difficulty', value: null},
    ]
        .map(sid => ({...sid, value: document.querySelector('.column.is-one-third-desktop .box:first-of-type').innerHTML.match(new RegExp(sid.label + ':\\s*<b>(.*?)</b>', 'i'))}))
        .reduce((cum, sid) => {
            let value = Array.isArray(sid.value) ? sid.value[1] : null;
            if (value && ['scores', 'totalScores', 'stars', 'bpm', 'noteCount'].includes(sid.id)) value = parseFloat(value.replace(/[^0-9\.]/, ''));
            if (value) cum[sid.id] = value;

            return cum;
        }, {})
    const difficulty = document.querySelector('.tabs.is-centered li.is-active a span');
    songInfoData.difficulty =  difficulty ? difficulty.innerText.toLowerCase().replace('+', 'Plus') : null;
    if (songInfoBox && songInfoData && songInfoData.hash && songInfoData.hash.length) {
        const newSongBox = document.createElement('div');
        newSongBox.style.marginBottom = '1.5rem';
        songInfoBox.parentNode.insertBefore(newSongBox, songInfoBox);

        const songCard = new SongCard({
            target: newSongBox,
            props: {...songInfoData, leaderboardId}
        });
        songCard.$on('initialized', e => {
            if (e.detail) songInfoBox.remove()
            else {
                newSongBox.remove();
                new SongIcons({target: songInfoBox, props: {hash: songInfoData.hash}});
            }
        });

    }

    log.info("Setup leaderboard page / Done")
}

async function setupChart() {
    log.info("Setup chart");

    const chart = document.getElementById('rankChart');
    if(!chart) return;

    const box = chart.closest('.box');
    if(!box) return;

    chart.closest('section').remove();

    const profileConfig = await getConfig('profile');
    if (profileConfig && !profileConfig.showChart) return;

    const profileId = getProfileId();
    if(profileId) {
        new Chart({
            target: box,
            props: {
                profileId,
                history: getFirstRegexpMatch(/data:\s*\[([0-9,]+)\]/, document.body.innerHTML),
            }
        });
    }

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

    const profileConfig = await getConfig('profile');
    if (profileConfig && profileConfig.enlargeAvatar) {
        const avatarCol = document.querySelector('.column.avatar');
        if (avatarCol) avatarCol.classList.add('enlarge')

        const usersConfig = await getConfig('users');
        if(usersConfig && usersConfig.main && usersConfig.main === profileId) avatarCol.classList.add('main')
    }

    const tbl = document.querySelector('table.ranking');
    if(tbl) tbl.classList.add('sspl');

    const ssConfig = await getConfig('ss');
    const showDiff = !!ssConfig.song.showDiff;
    const showWhatIfPp = !!ssConfig.song.showWhatIfPp;
    if (ssConfig && ssConfig.song && !!ssConfig.song.enhance)
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
                    ret.prevRank = showDiff && history ? history.rank : null;
                    ret.prevPp = showDiff && history ? history.pp : null;
                    ret.prevScore = showDiff && history ? history.score : null;
                    ret.prevTimeset = showDiff && history ? new Date(Date.parse(history.rank)) : null;
                    ret.prevPercent = showDiff && history && ret.prevScore ? (maxSongScore
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
                    props: {song: s, showWhatIfPp}
                })
            });

    const header = document.querySelector('.content .column h5').closest('.box');
    if (header) {
        const refreshDiv = document.createElement('div');
        refreshDiv.classList.add('refresh');
        header.appendChild(refreshDiv);
        new Refresh({
            target: refreshDiv,
            props: {profileId}
        })
    }

    const mainUl = document.querySelector('.content .column ul');
    const mainColumn = mainUl.closest('.column');
    if (mainColumn) {
        if (data.users?.[profileId]?.stats) {
            let ssplCountryRank = data?.users?.[profileId]?.ssplCountryRank;
            ssplCountryRank = ssplCountryRank && typeof ssplCountryRank === "object" && ssplCountryRank[config.COUNTRY] ? ssplCountryRank[config.COUNTRY] : (typeof ssplCountryRank === "number" ? ssplCountryRank : null)
            const rankLi = mainColumn.querySelector('ul li:first-of-type');
            if (rankLi) {
                const globalRankA = rankLi.querySelector('a:first-of-type');
                const rankA = rankLi.querySelector('a[href^="/global?country="]');
                if(globalRankA && rankA) {
                    const originalGlobalRank = parseInt(globalRankA.innerText.replace(/[^\d]/g,''), 10);
                    const originalRank = parseInt(getFirstRegexpMatch(/([0-9,]+)$/, rankA.innerText).replace(/[^\d]/g, ''), 10);
                    const originalCountry = getFirstRegexpMatch(/flags\/(.*).png$/, rankA.querySelector('img')?.src)
                    if (originalGlobalRank && originalRank && originalCountry) {
                        const pageStats =
                            [
                                {label: trans('profile.stats.ranking'), type: 'rank', value: originalGlobalRank, originalCountry: originalCountry, ssplCountryRank, originalRank}
                            ].concat(
                                [...document.querySelectorAll('.content .column ul li:not(:first-child)')]
                                    .map(li => {
                                        const matches = li.innerHTML.match(/^\s*<strong>([^:]+)\s*:\s*<\/strong>\s*(.*)$/);
                                        if (!matches) return null;

                                        const mapping = [
                                            {key: 'Performance Points', type: 'number', precision: 2, suffix: 'pp', label: trans('profile.stats.pp'), number: true},
                                            {key: 'Play Count', type: 'number', precision: 0, label: trans('profile.stats.playCount'), number: true},
                                            {key: 'Total Score', type: 'number', precision: 0, label: trans('profile.stats.totalScore'), number: true},
                                            {key: 'Replays Watched by Others', type: 'number', precision: 0, label: trans('profile.stats.replays'), number: true},
                                            {key: 'Role', label: trans('profile.stats.role'), number: false},
                                        ];

                                        const value = mapping.filter(m => m.number).map(m => m.key).includes(matches[1])
                                            ? parseFloat(matches[2].replace(/[^0-9.]/g, ''))
                                            : matches[2];

                                        const item = mapping.find(m => m.key === matches[1]);
                                        return item ? {...item, value} : {label: matches[1], value};
                                    })
                                    .filter(s => s)
                            );

                        mainUl.innerHTML = '';
                        new ProfileStats({
                            target: mainColumn,
                            props: {stats: pageStats}
                        })
                    }
                }
            }

            const additionalProfile = document.createElement('div');
            additionalProfile.classList.add('column');
            const ul = document.createElement('ul');
            ul.style.marginTop = sseInstalled ? '3.375rem' : '2.875rem';
            additionalProfile.appendChild(ul);
            new Profile({
                target: ul,
                props: {
                    profile: data.users?.[profileId] ?? null,
                }
            });
            mainColumn.closest('.columns').appendChild(additionalProfile);

            const div = document.createElement('div')
            div.classList.add('el-group');
            div.classList.add('flex-center');
            div.style.marginTop = "1em";
            div.style.fontSize = "0.875rem";
            mainColumn.closest('.box').appendChild(div);

            const transformBtn = new Button({
                target: div,
                props: {
                    label: trans('plugin.transformButton'),
                    iconFa: "fas fa-expand-arrows-alt",
                    type: 'primary'
                }
            })
            const transformSongs = () => {
                const content = mainColumn.closest('.content');
                const songBox = content.querySelector('.box:nth-child(2)');
                if (songBox) {
                    const box = document.createElement('div');
                    box.classList.add('box');
                    box.classList.add('has-shadow');
                    content.insertBefore(box, songBox);

                    new SongBrowser({
                        target: box,
                        props: {playerId: profileId}
                    })

                    songBox.remove();
                    transformBtn.$destroy();

                    document.querySelector('.el-group.flex-center').remove();
                }
            }
            const songBrowserConfig = await getConfig('songBrowser');
            if (songBrowserConfig && songBrowserConfig.autoTransform) transformSongs()
            else transformBtn.$on('click', transformSongs)
        }

        const avatarColumn = document.querySelector('.column.avatar');
        if (avatarColumn) {
            const div = document.createElement('div')
            div.style.marginTop = "1rem";
            div.style.fontSize = "0.75rem";
            div.classList.add('buttons')
            div.classList.add('flex-center');
            avatarColumn.appendChild(div);

            new PlayerSettings({
                target: div,
                props: {profileId}
            })
        }
    }

    log.info("Setup profile page / Done")
}

async function setupCountryRanking(diffOffset = 6) {
    log.info("Setup country ranking");

    const cont = document.querySelector('body > .section > .container');
    if(!cont) {
        log.error("Setup country ranking / container not found")
        return;
    }

    cont.classList.add('original');
    cont.style.display = 'none';
    cont.parentNode.style.position = 'relative';

    const newCont = document.createElement('main');
    newCont.classList.add('container-fluid');
    newCont.style.paddingTop = '3rem';
    cont.parentNode.appendChild(newCont);

    new CountryDashboard({target: newCont});

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

async function setupStyles() {
    log.info("Setup styles");

    const addStyles = GM_addStyle ? GM_addStyle : () => {};

    addStyles(require('./resource/style/style.css').toString());

    document.querySelector('head').innerHTML += '<link rel="stylesheet" href="https://scoresaber.com/imports/css/darkmode.css?v=1.0.3" type="text/css"/>';

    const configOthers = await getConfig('others');
    if(configOthers && configOthers.theme) setTheme(configOthers.theme); else setSsDefaultTheme();
}

async function setupPlayerAvatar() {
    log.info("Setup player avatar");

    const usersConfig = await getConfig('users');
    if (!usersConfig || !usersConfig.main) return;

    const navbarBurger = document.querySelector('.navbar-brand .navbar-burger')
    if(!navbarBurger) return;

    const cont = document.createElement('div');
    cont.classList.add('navbar-item');
    cont.classList.add('sspl-avatar');
    navbarBurger.parentNode.insertBefore(cont, navbarBurger)

    // set newest avatar taken from user profile
    const profileId = getProfileId();
    const url = usersConfig.main === profileId ? document.querySelector('.column.avatar img')?.src : null;

    new Avatar({target: cont, props: {playerId: usersConfig.main, url}})
}

async function setupTwitch() {
    await twitch.processTokenIfAvailable();
    await twitch.createTwitchUsersCache();
}

async function setupDelayed() {
    initialized = true;

    // wait for SSE or given timeout
    await waitForSSEInit(config.SSE_CHECK_DELAY);

    if (isLeaderboardPage()) {
        await setupLeaderboard();
    }

    if (isProfilePage()) {
        await setupProfile();
    }

    await initDownloadManager();
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

let sseInstalled = false;
async function waitForSSEInit(timeout) {
    log.info("Waiting for SSE initialization");

    return new Promise(function(resolve, reject) {
        // whatever comes first
        checkElement('#all_scores_tab').then(el => {sseInstalled = true; resolve(el)})
        checkElement('#user_compare').then(el => {sseInstalled = true; resolve(el)})
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

    // reload page when data was imported
    eventBus.on('data-imported', () => window.location.reload());

    await Promise.allSettled([
        setLangFromConfig(),
        setupStyles(),
        setupPlayerAvatar(),
        setupTwitch()
    ])

    if (isCountryRankingPage()) {
        setupCountryRanking();
    }

    await setupDelayed();

    log.info("Setup complete");
}

init();
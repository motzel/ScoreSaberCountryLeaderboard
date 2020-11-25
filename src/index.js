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
import Flag from './Svelte/Components/Common/Flag.svelte';
import PlayerSettings from './Svelte/Components/Player/Settings.svelte';
import Chart from './Svelte/Components/Player/Chart.svelte';
import SetCountry from './Svelte/Components/Country/SetCountry.svelte';

import log from './utils/logger';
import tempConfig from './temp';
import {getThemeFromFastCache} from "./store";
import {convertArrayToObjectByKey, getFirstRegexpMatch} from "./utils/js";
import {
    getAccFromScore,
    getDiffAndTypeFromOnlyDiffName,
    getSongMaxScoreWithDiffAndType, getSongScores,
} from "./song";
import {shouldBeHidden} from "./eastereggs";

import twitch from './services/twitch';
import {getConfig, getMainPlayerId} from "./plugin-config";
import {getSsDefaultTheme, setTheme} from "./theme";
import eventBus from './utils/broadcast-channel-pubsub';
import initDownloadManager from './network/download-manager';
import initDatabase from './db/db';
import {trans, setLangFromConfig} from "./Svelte/stores/i18n";
import {getActiveCountry} from "./scoresaber/country";
import nodeSync from "./network/multinode-sync";
import {
    getPlayerInfo,
    getPlayerProfileUrl,
    getScoresByPlayerId,
} from "./scoresaber/players";
import {dateFromString} from "./utils/date";
import {setRefreshedPlayerScores} from "./network/scoresaber/players";
import {parseSsInt} from "./scoresaber/other";
import {formatNumber, round} from "./utils/format";
import {parseSsLeaderboardScores, parseSsUserScores} from './scoresaber/scores'

const getLeaderboardId = () => parseInt(getFirstRegexpMatch(/\/leaderboard\/(\d+)(\?page=.*)?#?/, window.location.href.toLowerCase()), 10);
const isLeaderboardPage = () => null !== getLeaderboardId();
const getProfileId = () => getFirstRegexpMatch(/\u\/(\d+)((\?|&|#).*)?$/, window.location.href.toLowerCase());
const isProfilePage = () => null !== getProfileId();
const getRankingCountry = () => {
    const match = window.location.href.match(new RegExp('^https://scoresaber.com/global(?:\\?|/1[&?])country=(.{1,3})'));
    return match && match.length > 1 ? match[1] : null;
}
const isCurrentCountryRankingPage = async () => getRankingCountry() === (await getActiveCountry());

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
        props: {leaderboardId, country: await getActiveCountry()}
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

        const ssConfig = await getConfig('ssSong');
        const songEnhanceEnabled = ssConfig && !!ssConfig.enhance;

        if (songEnhanceEnabled) {
            const scores = parseSsLeaderboardScores(document);
            if (scores) {
                let diffInfo = {diff: songInfoData.difficulty, type: 'Standard'};
                if (leaderboardId) {
                    const leaderboardScores = await getSongScores(leaderboardId, 1);
                    if (leaderboardScores && leaderboardScores.length) diffInfo = leaderboardScores[0].diffInfo;
                }

                const maxScore = await getSongMaxScoreWithDiffAndType(songInfoData.hash, diffInfo);
                scores.forEach(s => {
                    if (s.score) {
                        const score = s.tr.querySelector('td.score');
                        if (score) {
                            score.innerHTML = formatNumber(s.score, 0);
                        }
                    }

                    const percentage = s.tr.querySelector('td.percentage center');
                    if (percentage && s.score && maxScore && maxScore > 0) {
                        percentage.innerHTML = formatNumber(s.mods && s.mods.length && s.mods !== '-' && s.percent ? s.percent * 100 : s.score * 100 / maxScore) + '%';
                    }

                    if (s.pp !== null) {
                        const pp = s.tr.querySelector('td.pp .scoreTop.ppValue');
                        if (pp) {
                            pp.innerHTML = formatNumber(s.pp);
                        }
                    }
                });
            }
        }
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

    const profileId = getProfileId();
    if (!profileId) return;

    const playerInfo = await getPlayerInfo(profileId);

    const playerScores = await getScoresByPlayerId(profileId);
    const isPlayerDataAvailable = playerScores && Object.keys(playerScores).length;

    // redirect to recent plays if auto-transform is enabled or transforming was requested
    const url = new URL(window.location.href);
    const urlParams = new URLSearchParams(url.search);

    const songBrowserConfig = await getConfig('songBrowser');
    const urlHasTransformParam = urlParams.has('transform');
    const autoTransformEnabled = isPlayerDataAvailable && ((songBrowserConfig && songBrowserConfig.autoTransform) || urlHasTransformParam);
    const isRecentPlaysPage = urlParams.get('sort') === '2';

    if (autoTransformEnabled && !isRecentPlaysPage) {
        window.location.href = getPlayerProfileUrl(profileId, true);
    }

    if (urlHasTransformParam) {
        urlParams.delete('transform');
        url.search = urlParams.toString();
        history.replaceState(null, '', url.toString());
    }

    // setup chart when ready
    if (document.readyState == 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupChart()
        })
    } else {
        // DOM is ready
        setupChart();
    }

    const profileConfig = await getConfig('profile');
    if (profileConfig && profileConfig.enlargeAvatar) {
        const avatarCol = document.querySelector('.column.avatar');
        if (avatarCol) avatarCol.classList.add('enlarge')

        const usersConfig = await getConfig('users');
        if(usersConfig && usersConfig.main && usersConfig.main === profileId) avatarCol.classList.add('main')
    }

    const tbl = document.querySelector('table.ranking');
    if(tbl) tbl.classList.add('sspl');

    const ssConfig = await getConfig('ssSong');
    const showDiff = !!ssConfig?.showDiff;
    const showWhatIfPp = !!ssConfig?.showWhatIfPp;

    const songEnhanceEnabled = ssConfig && !!ssConfig.enhance;

    const parsedScores = await Promise.all(parseSsUserScores(document).map(async s => {
        const leaderboard = playerScores.find(ps => ps.leaderboardId === s.leaderboardId);

        if (songEnhanceEnabled && !autoTransformEnabled) {
            try {
                const maxSongScore = await getSongMaxScoreWithDiffAndType(
                  leaderboard?.hash ? leaderboard.hash : s.hash,
                  leaderboard?.diffInfo ? leaderboard.diffInfo : getDiffAndTypeFromOnlyDiffName(s.songDiff)
                );

                const maxScoreEx = leaderboard?.maxScoreEx;

                s.acc = s.percent ? s.percent * 100 : null;

                const useCurrentScoreAsPrev = (s.pp && leaderboard?.pp && round(leaderboard.pp) < round(s.pp)) ||
                  (s.score && leaderboard?.score && leaderboard.score < s.score);

                if (!s.acc && s.score && (maxSongScore || maxScoreEx)) {
                    s.acc = getAccFromScore({score: s.score, maxScoreEx}, maxSongScore);
                }

                if(!s.score && s.percent) {
                    s.score = maxSongScore || maxScoreEx ? Math.round(s.percent * (maxSongScore ? maxSongScore : maxScoreEx)) : null;
                }

                s.hidden = leaderboard?.acc ? shouldBeHidden(Object.assign({}, leaderboard, {id: leaderboard.playerId, acc: leaderboard.acc})) : false;

                const history = leaderboard?.history?.[0];
                if (showDiff && (useCurrentScoreAsPrev || history)) {
                    s.prevRank = useCurrentScoreAsPrev ? leaderboard.rank : history.rank;
                    s.prevPp = useCurrentScoreAsPrev ? leaderboard.pp : history.pp;
                    s.prevScore = useCurrentScoreAsPrev ? leaderboard.score : history.score;
                    s.prevTimeset = dateFromString(useCurrentScoreAsPrev ? leaderboard.timeset : history.timeset);
                    s.prevAcc = getAccFromScore({
                        score: useCurrentScoreAsPrev ? leaderboard.score : history.score,
                        uScore: useCurrentScoreAsPrev ? leaderboard.uScore : history.uScore,
                        maxScoreEx,
                    }, maxSongScore);
                }
            } catch (e) {} // swallow error
        }

        return s;
    }));

    await setRefreshedPlayerScores(profileId, parsedScores.map(s => ({
        leaderboardId: s.leaderboardId,
        rank         : s.rank,
    })));

    if (songEnhanceEnabled && !autoTransformEnabled)
        parsedScores
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
        if (isPlayerDataAvailable) {
            let ssplCountryRank = playerInfo?.ssplCountryRank;
            const country = await getActiveCountry();
            ssplCountryRank = ssplCountryRank && typeof ssplCountryRank === "object" && ssplCountryRank[country] ? ssplCountryRank[country] : (typeof ssplCountryRank === "number" ? ssplCountryRank : null)
            const rankLi = mainColumn.querySelector('ul li:first-of-type');
            if (rankLi) {
                const globalRankA = rankLi.querySelector('a:first-of-type');
                const rankA = rankLi.querySelector('a[href^="/global?country="]');
                if(globalRankA && rankA) {
                    const originalGlobalRank = parseSsInt(globalRankA.innerText);
                    const originalRank = parseSsInt(rankA.innerText);
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
                            props: {profileId, stats: pageStats}
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
                    profile: playerInfo,
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
            const transformSongs = async () => {
                if (!isRecentPlaysPage) {
                    window.location.href = getPlayerProfileUrl(profileId, true) + '&transform=true';
                    return;
                }

                const content = mainColumn.closest('.content');
                const songBox = content.querySelector('.box:nth-child(2)');
                if (songBox) {
                    const box = document.createElement('div');
                    box.classList.add('box');
                    box.classList.add('has-shadow');
                    content.insertBefore(box, songBox);

                    new SongBrowser({
                        target: box,
                        props: {
                            playerId: profileId,
                            country,
                            recentPlay: parsedScores && parsedScores.length ? dateFromString(parsedScores[0].timeset) : null
                        }
                    })

                    songBox.remove();
                    transformBtn.$destroy();

                    document.querySelector('.el-group.flex-center').remove();
                }
            }
            if (autoTransformEnabled) await transformSongs();
            else transformBtn.$on('click', transformSongs)
        }

        const avatarColumn = document.querySelector('.column.avatar');
        if (avatarColumn) {
            const div = document.createElement('div')
            div.style.marginTop = "1rem";
            div.style.fontSize = "0.75rem";
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
    const country = getRankingCountry();
    if (!country) return; // not a country leaderboard page

    log.info("Setup country ranking");

    if(!(await isCurrentCountryRankingPage())) {
        const rankingTable = document.querySelector('table.ranking.global');
        if (!rankingTable) return;

        const pagination = rankingTable.parentNode.parentNode.querySelector('.pagination');
        if (!pagination) return;

        const setCountryDiv = document.createElement('div');
        setCountryDiv.style.fontSize = '.875rem';
        pagination.insertBefore(setCountryDiv, pagination.querySelector('br'));

        new SetCountry({target: setCountryDiv, props: {country}});

        return;
    }

    const cont = document.querySelector('body > .section > .container');
    if(!cont) {
        log.error("Setup country ranking / container not found")
        return;
    }

    const actualPlayersPp = convertArrayToObjectByKey(parseSsLeaderboardScores(document).map(s => ({playerId: s.playerId, pp: s.pp})), 'playerId');

    cont.classList.add('original');
    cont.style.display = 'none';
    cont.parentNode.style.position = 'relative';

    const newCont = document.createElement('main');
    newCont.classList.add('container-fluid');
    newCont.style.paddingTop = '1.75rem';
    cont.parentNode.appendChild(newCont);

    new CountryDashboard({target: newCont, props: {country: await getActiveCountry(), overridePlayersPp: actualPlayersPp}});

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

    document.querySelector('head').innerHTML += '<link rel="stylesheet" href="https://scoresaber.com/imports/css/darkmode.css?v=1.0.3" type="text/css"/>';

    let theme = getThemeFromFastCache();
    if(!theme) theme = getSsDefaultTheme();

    setTheme(theme);

    return theme;
}

async function refinedThemeSetup(currentTheme) {
    const configOthers = await getConfig('others');
    if(configOthers && configOthers.theme && configOthers.theme !== currentTheme)
        setTheme(configOthers.theme);
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

    new Avatar({target: cont, props: {playerId: usersConfig.main, url}});
    new Flag({target: cont, props: {country: await getActiveCountry()}});
}

async function setupTwitch() {
    await twitch.processTokenIfAvailable();
    await twitch.createTwitchUsersCache();

    eventBus.on('player-twitch-linked', async ({nodeId, playerId, twitchLogin}) => {
        if (nodeId !== nodeSync.getId()) {
            await twitch.updateTwitchUser(playerId, twitchLogin);
        }
    })
}

async function setupGlobalEventsListeners() {
    // update scores done on other node
    eventBus.on('player-score-updated', async ({nodeId, playerId, leaderboardId, ...data}) => {
        if (nodeId === nodeSync.getId() || !playerId || !leaderboardId) return;

        const playerScores = await getScoresByPlayerId(playerId);
        if (!playerScores || !playerScores[leaderboardId]) return;

        playerScores[leaderboardId] = {...playerScores[leaderboardId], ...data};
    })
}

async function setupDelayed() {
    initialized = true;

    // wait for SSE or given timeout
    await waitForSSEInit(tempConfig.SSE_CHECK_DELAY);

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
    try {
        log.info("init");

        if (initialized) {
            return;
        }

        // TODO: add modal when DB conversion in progress
        const db = await initDatabase();

        // pre-warm config cache
        const config = await getConfig();

        // reload page when data was imported
        eventBus.on('data-imported', () => window.location.reload());

        await Promise.allSettled(
            [
                refinedThemeSetup(),
                setLangFromConfig(),
                setupGlobalEventsListeners(),
                setupCountryRanking(),
                setupPlayerAvatar(),
                setupTwitch(),
            ]
        )

        await setupDelayed();

        log.info("Setup complete");
    }
    catch (e) {
        console.error(e);
    }
}

// setup styles as fast as possible
setupStyles();

document.addEventListener('DOMContentLoaded', init);
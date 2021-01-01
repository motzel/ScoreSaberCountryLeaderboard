import Profile from './Svelte/Components/Player/Profile.svelte';
import CountryDashboard from './Svelte/Components/Country/Dashboard.svelte';
import SongLeaderboard from './Svelte/Components/Song/Leaderboard.svelte';
import SongIcons from './Svelte/Components/Song/Icons.svelte';
import SongCard from './Svelte/Components/Song/LeaderboardCard.svelte';
import WhatIfpp from './Svelte/Components/Song/WhatIfPp.svelte';
import Avatar from './Svelte/Components/Common/Avatar.svelte';
import Flag from './Svelte/Components/Common/Flag.svelte';
import SetCountry from './Svelte/Components/Country/SetCountry.svelte';
import Message from './Svelte/Components/Global/Message.svelte';

import log from './utils/logger';
import tempConfig from './temp';
import {getThemeFromFastCache} from "./store";
import {convertArrayToObjectByKey, getFirstRegexpMatch} from "./utils/js";
import {
    getSongMaxScore, getSongScores,
} from "./song";

import twitch from './services/twitch';
import {getConfig, getMainPlayerId} from "./plugin-config";
import {getSsDefaultTheme, setTheme} from "./theme";
import eventBus from './utils/broadcast-channel-pubsub';
import initDownloadManager from './network/download-manager';
import initDatabase from './db/db';
import {trans, setLangFromConfig} from "./Svelte/stores/i18n";
import {getActiveCountry} from "./scoresaber/country";
import {
    getPlayerProfileUrl,
    isPlayerDataAvailable,
} from "./scoresaber/players";
import {parseSsFloat, parseSsInt} from "./scoresaber/other";
import {formatNumber} from "./utils/format";
import {parseSsLeaderboardScores, parseSsUserScores} from './scoresaber/scores'
import {setupDataFixes} from './db/fix-data'
import scores from './db/repository/scores'

const getLeaderboardId = () => parseInt(getFirstRegexpMatch(/\/leaderboard\/(\d+)(\?page=.*)?#?/, window.location.href.toLowerCase()), 10);
const isLeaderboardPage = () => null !== getLeaderboardId();
const getProfileId = () => getFirstRegexpMatch(/\/u\/(\d+)((\?|&|#).*)?$/, window.location.href.toLowerCase());
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
                    const leaderboardScores = await getSongScores(leaderboardId);
                    if (leaderboardScores && leaderboardScores.length) diffInfo = leaderboardScores[0].diffInfo;
                }

                const maxScore = await getSongMaxScore(songInfoData.hash, diffInfo);
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

async function setupProfile() {
    log.info("Setup profile page");

    const profileId = getProfileId();
    if (!profileId) return;

    // redirect to recent plays if auto-transform is enabled or transforming was requested

    // fix url search params
    let urlStr = window.location.href
    const urlMatches = /(.*)\/u\/(\d+)(.*?)$/.exec(urlStr);
    if (urlMatches && urlMatches[3] && urlMatches[3].length) {
        urlStr = urlMatches[1] + '/u/' + urlMatches[2] + (urlMatches[3][0] === '&' ? '?' + urlMatches[3].slice(1) : urlMatches[3]);
    }
    const url = new URL(urlStr);
    const urlParams = new URLSearchParams(url.search);

    const songBrowserConfig = await getConfig('songBrowser');
    const urlHasTransformParam = urlParams.has('transform');
    const autoTransform = await isPlayerDataAvailable(profileId) && ((songBrowserConfig && songBrowserConfig.autoTransform) || urlHasTransformParam);
    const isRecentPlaysPage = urlParams.get('sort') === '2';
    const pageNum = urlParams.has('page') ? parseInt(urlParams.get('page') ?? '1', 10) : 1;

    if (autoTransform && !isRecentPlaysPage) {
        window.location.href = getPlayerProfileUrl(profileId, true, urlHasTransformParam);
        return;
    }

    if (urlHasTransformParam) {
        urlParams.delete('transform');
        url.search = urlParams.toString();
        history.replaceState(null, '', url.toString());
    }

    const avatarCol = document.querySelector('.column.avatar');
    if (avatarCol) avatarCol.classList.add('enlarge')

    const usersConfig = await getConfig('users');
    if(usersConfig && usersConfig.main && usersConfig.main === profileId) avatarCol.classList.add('main')

    const tbl = document.querySelector('table.ranking');
    if(tbl) tbl.classList.add('sspl');

    const container = document.querySelector('.section .container');
    const profileDiv = document.createElement('div');
    profileDiv.classList.add('sspl-page');
    container.prepend(profileDiv);

    const column = container.querySelector('.content .column:not(.avatar)');
    const playerA = column.querySelector('.title a');
    const props = {
        profileId,
        name: playerA?.innerText?.trim() ?? null,
        steamUrl: playerA?.href ?? null,
        avatarUrl: document.querySelector('.column.avatar img')?.src ?? null,
        country: getFirstRegexpMatch(/^.*?\/flags\/([^.]+)\..*$/, document.querySelector('.content .column .title img').src)?.toLowerCase() ?? null,
        prefetchedScores: {...parseSsUserScores(document), type: isRecentPlaysPage ? 'recent' : 'top', pageNum},
        autoTransform,
        ssBadges: [...document.querySelectorAll('.column.avatar center img')].map(img => ({
            src: img.src,
            title: img.title,
        })),
        chartHistory: (getFirstRegexpMatch(/data:\s*\[([0-9,]+)\]/, document.body.innerHTML) ?? '').split(',').map(i => parseInt(i, 10)),
        ssStats: convertArrayToObjectByKey([
              {key: 'Player ranking', label: trans('profile.stats.ranking'), type: 'rank', value: parseSsInt(document.querySelector('.content .column ul li:first-of-type a:first-of-type').innerText ?? ""), countryRank: parseSsInt(document.querySelector('.content .column ul li:first-of-type a[href^="/global?country="]').innerText ?? ""),},
          ].concat(
          [...document.querySelectorAll('.content .column ul li:not(:first-child)')]
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
        ), 'key')
    }

    const originalContent = document.querySelector('.content');
    if (originalContent) originalContent.remove();

    new Profile({target: profileDiv, props})

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
}

async function setupGlobalEventsListeners() {
    const reloadPage = () => window.location.reload();

    // reload page when data was imported
    eventBus.on('data-imported', reloadPage);

    eventBus.on('reload-browser-cmd', reloadPage);

    eventBus.on('player-twitch-linked', async ({playerId}) => {
        await twitch.updateVideosForPlayerId(playerId);
    });
}

async function setupDelayed() {
    initialized = true;

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

let initialized = false;

async function init() {
    try {
        log.info("init");

        if (initialized) {
            return;
        }

        new Message({
            target: document.body,
        });

        await initDatabase();

        await setupDataFixes();

        // pre-warm config cache
        const config = await getConfig();

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
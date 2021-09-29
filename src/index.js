import initNodeSync from './utils/multinode-sync'
import Profile from './Svelte/Components/Player/ProfilePage.svelte';
import CountryDashboard from './Svelte/Components/Country/Dashboard.svelte';
import Avatar from './Svelte/Components/Common/Avatar.svelte';
import FriendsDropdown from './Svelte/Components/Common/FriendsDropdown.svelte';
import Flag from './Svelte/Components/Common/Flag.svelte';
import SetCountry from './Svelte/Components/Country/SetCountry.svelte';
import Message from './Svelte/Components/Global/Message.svelte';
import LeaderboardPage from './Svelte/Components/Leaderboard/LeaderboardPage.svelte';

import header from '../header.json';
import log from './utils/logger';
import {getThemeFromFastCache} from "./store";
import {convertArrayToObjectByKey, getFirstRegexpMatch} from "./utils/js";
import twitch from './services/twitch';
import {getConfig, getMainPlayerId} from "./plugin-config";
import {getSsDefaultTheme, setTheme} from "./theme";
import eventBus from './utils/broadcast-channel-pubsub';
import initDownloadManager from './network/download-manager';
import initDatabase from './db/db';
import {setLangFromConfig} from "./Svelte/stores/i18n";
import {getActiveCountry} from "./scoresaber/country";
import {
    getPlayerProfileUrl, getPlayers, getScoresByPlayerId,
    isPlayerDataAvailable, updatePlayer,
} from "./scoresaber/players";
import {parseSsLeaderboardScores, parseSsProfilePage, parseSsSongLeaderboardPage} from './scoresaber/scores'
import {setupDataFixes} from './db/fix-data'
import {getSsplCountryRanks} from './scoresaber/sspl-cache'
import {getRankedSongs} from './scoresaber/rankeds'
import {getHumanDiffInfo, getSongScores} from './song'

const getLeaderboardId = () => parseInt(getFirstRegexpMatch(/\/leaderboard\/(\d+)(\?page=.*)?#?/, window.location.href.toLowerCase()), 10);
const isLeaderboardPage = () => null !== getLeaderboardId();
const getProfileId = () => getFirstRegexpMatch(/\/u\/(\d+)((\?|&|#).*)?$/, window.location.href.toLowerCase());
const isProfilePage = () => null !== getProfileId();
const getRankingCountry = () => {
    const match = window.location.href.match(new RegExp('^https://scoresaber.com/global(?:\\?|/1[&?])country=(.{1,3})'));
    return match && match.length > 1 ? match[1] : null;
}
const isCurrentCountryRankingPage = async () => getRankingCountry() === (await getActiveCountry());

async function setupLeaderboard() {
    log.info("Setup leaderboard page");

    const section = document.querySelector('body > .section');
    if (!section) return;

    const leaderboardId = getLeaderboardId();
    if (!leaderboardId) return;

    // fix url search params
    let urlStr = window.location.href
    const urlMatches = /(.*)\/leaderboard\/(\d+)(.*?)$/.exec(urlStr);
    if (urlMatches && urlMatches[3] && urlMatches[3].length) {
        urlStr = urlMatches[1] + '/leaderboard/' + urlMatches[2] + (urlMatches[3][0] === '&' ? '?' + urlMatches[3].slice(1) : urlMatches[3]);
    }
    const url = new URL(urlStr);
    const urlParams = new URLSearchParams(url.search);
    const pageNum = urlParams.has('page') ? parseInt(urlParams.get('page') ?? '1', 10) : 1;

    const props = {
        leaderboardId,
        leaderboardPage: {...parseSsSongLeaderboardPage(document), pageNum}
    }

    if (!props.leaderboardPage?.currentDiff) {
        const leaderboardScores = await getSongScores(leaderboardId);
        if (leaderboardScores && leaderboardScores.length && leaderboardScores[0]?.diffInfo?.diff) {
            const diffInfo = getHumanDiffInfo(leaderboardScores[0].diffInfo);

            props.leaderboardPage.currentDiff = leaderboardScores[0].diffInfo.diff;
            props.leaderboardPage.currentDiffHuman = diffInfo?.name ? diffInfo.name : '???';
            props.leaderboardPage.diffs.push({id: leaderboardId, name: diffInfo?.name ? diffInfo.name : '???', color: diffInfo?.color ? diffInfo.color : '#444'})
        } else {
            props.leaderboardPage.currentDiff = '???';
            props.leaderboardPage.currentDiffHuman = '???';
            props.leaderboardPage.diffs.push({id: leaderboardId, name: '???', color: '#444'})
        }
    }

    const profileDiv = document.createElement('div');
    profileDiv.classList.add('sspl-page');
    section.prepend(profileDiv);

    const originalContent = document.querySelector('.content');
    if (originalContent) originalContent.remove();

    new LeaderboardPage({target: profileDiv, props});

    log.info("Setup leaderboard page / Done")
}

function fullSizeNavbar() {
    const navBarContainer = document.querySelector('nav.navbar > .container');
    if (navBarContainer) navBarContainer.classList.add('sspl-page-container');
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

    const section = document.querySelector('body .section');
    if (!section) return;

    const profileDiv = document.createElement('div');
    profileDiv.classList.add('sspl-page');
    section.prepend(profileDiv);

    const props = {
        profileId,
        profilePage: {...parseSsProfilePage(document), type: isRecentPlaysPage ? 'recent' : 'top', pageNum, playerId: profileId},
        autoTransform,
    }

    const originalContent = document.querySelector('.content');
    if (originalContent) originalContent.remove();

    fullSizeNavbar();

    new Profile({target: profileDiv, props})

    log.info("Setup profile page / Done")
}

async function setupCountryRanking() {
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
    newCont.classList.add('sspl-page');
    cont.parentNode.appendChild(newCont);

    fullSizeNavbar();

    new CountryDashboard({target: newCont, props: {country: await getActiveCountry(), overridePlayersPp: actualPlayersPp}});

    log.info("Setup country ranking / Done")
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

async function setupFriendsDropdown() {
    log.info("Setup friends dropdown");

    const navbar = document.querySelector('.navbar-start')
    if(!navbar) return;

    const cont = document.createElement('div');
    cont.classList.add('navbar-item');
    navbar.appendChild(cont);

    new FriendsDropdown({target: cont});
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

    eventBus.on('refetch-all-player-scores-cmd', async playerId => {
        if (!playerId) {
            console.error('Command requires a player ID');
            return;
        }

        const player = (await getPlayers() ?? []).find(p => p.id === playerId);
        if (!player) {
            console.error(`The player with the ID "${playerId}" does not exist in the cache`)
            return;
        }

        await updatePlayer({...player, lastUpdated: null});

        eventBus.publish('refresh-all-cmd');
    });

    if (unsafeWindow) unsafeWindow.ssplEventBus = eventBus;
}

function addVersionInfoToFooter() {
    const footer = document.querySelector('footer .content');
    if (!footer) return;

    // remove original theme switch
    const themeSwitch = footer.querySelector('p:nth-child(2)');
    if (themeSwitch) themeSwitch.remove();

    const p = document.createElement('p');
    p.innerText = header.name;

    const a1 = document.createElement('a');
    a1.href = header.updateURL;
    a1.innerText = ' v' + header.version;

    p.append(a1);
    p.innerHTML +=  ' by ';

    const a2 = document.createElement('a');
    a2.href = 'https://www.github.com/motzel';
    a2.innerText = header.author;
    p.append(a2);

    footer.append(p);
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
    addVersionInfoToFooter();
}

let initialized = false;

async function init() {
    try {
        log.info("init");

        if (initialized) {
            return;
        }

        if (unsafeWindow) {
            if(unsafeWindow.ssplInitalizing) {
                log.info("It looks like initialization has already started, skipping.");
                return;
            }

            unsafeWindow.ssplInitalizing = true;
        }

        await initNodeSync();

        new Message({
            target: document.body,
        });

        await initDatabase();
        await setupDataFixes();

        // pre-warm cache
        const mainPlayerId = await getMainPlayerId();
        await Promise.all([
            getConfig(),
            getSsplCountryRanks(),
            getRankedSongs(),
            getScoresByPlayerId(mainPlayerId),
        ]);

        await Promise.allSettled(
            [
                refinedThemeSetup(),
                setLangFromConfig(),
                setupGlobalEventsListeners(),
                setupCountryRanking(),
                setupPlayerAvatar(),
                setupFriendsDropdown(),
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
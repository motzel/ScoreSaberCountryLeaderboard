import Profile from './Svelte/Components/Player/Profile.svelte';
import CountryRanking from './Svelte/Components/Country/Ranking.svelte';
import SongLeaderboard from './Svelte/Components/Song/Leaderboard.svelte';
import WhatIfpp from './Svelte/Components/Common/WhatIfPp.svelte';

import log from './utils/logger';
import {default as config, getMainUserId} from './temp';
import {getCacheAndConvertIfNeeded, Globals} from "./store";
import {round, formatNumber} from './utils/format';
import {getFirstRegexpMatch} from "./utils/js";
import {getLeaderboard, getMaxScore} from "./song";
import {findDiffInfo, getSongByHash} from "./network/beatsaver";
import {shouldBeHidden} from "./eastereggs";

const getFlag = (name) => Globals.data?.flags?.[name];

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
}

async function setupLeaderboard() {
    log.info("Setup leaderboard page");

    const leaderboardId = getLeaderboardId();
    if (!leaderboardId) return;

    const tabs = getBySelector('.tabs > ul');
    tabs.appendChild(
        generate_tab(
            'pl_tab',
            null === document.querySelector('.filter_tab')
        )
    );

    await setupPlTable();

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

    const sseUserId = getMainUserId();
    if (sseUserId) {
        var scoreSpans = document.querySelectorAll('.scoreTop.ppValue');
        [].forEach.call(scoreSpans, async function (span) {
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
}

async function setupProfile() {
    log.info("Setup profile page");

    const profileId = getProfileId();
    if (!profileId) return;

    const data = await getCacheAndConvertIfNeeded();

    const sseUserId = getMainUserId();

    var scoreSpans = document.querySelectorAll('.score .scoreBottom');
    [].forEach.call(scoreSpans, async function (span) {
        const songLink = span.closest('tr').querySelector('.song a');
        if (songLink) {
            const leaderboardId = getFirstRegexpMatch(
                /\/leaderboard\/(\d+$)/,
                songLink.href
            );
            if (leaderboardId) {
                const leaderboard =
                    data.users?.[profileId]?.scores?.[leaderboardId];

                if (leaderboard) {
                    try {
                        const songInfo = await getSongByHash(leaderboard.id);
                        const songCharacteristics = songInfo?.metadata?.characteristics;
                        const diffInfo = findDiffInfo(songCharacteristics, leaderboard.diff);
                        const maxSongScore = diffInfo?.length && diffInfo?.notes ? getMaxScore(diffInfo.notes) : 0;
                        const percent = maxSongScore
                            ? leaderboard.score / maxSongScore
                            : maxScoreEx
                                ? leaderboard.score / maxScoreEx
                                : null;

                        if (
                            shouldBeHidden(
                                Object.assign({}, leaderboard, {
                                    id: leaderboard.playerId,
                                    percent
                                })
                            )
                        )
                            songLink.closest('tr').classList.add('hidden');

                        if(!span.innerHTML.includes("accuracy:")) {
                            span.innerHTML =
                                'score: ' +
                                formatNumber(leaderboard.score, 0) +
                                (percent
                                    ? '<br />accuracy: ' +
                                    formatNumber(percent * 100, 2) +
                                    '%'
                                    : '') +
                                (leaderboard.mods.length
                                    ? '<br />(' + leaderboard.mods + ')'
                                    : '');
                      } else {
                            let score = leaderboard.score;
                            let matches = null;
                            if(matches = span.innerHTML.match(/accuracy:\s(\d+(\.\d+))%/)) {
                                const pagePercent = parseFloat(matches[1])/100;
                                if(pagePercent > round(percent,4)) score = pagePercent * maxSongScore;
                            }
                            span.innerHTML = 'score: ' + formatNumber(score, 0) + '<br />' + span.innerHTML;
                      }
                    } catch (e) {} // swallow error
                }

                if (sseUserId) {
                    const pp = parseFloat(
                        span.parentNode.querySelector('.scoreTop.ppValue')
                            ?.innerText
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
                }
            }
        }
    });

    const stats = document.querySelector('.content .column ul');
    if (stats) {
        if (data.users?.[profileId]?.stats) {
            new Profile({
                target: stats,
                props: {
                    profile: data.users?.[profileId] ?? null,
                }
            });
        }
    }
}

async function setupCountryRanking(diffOffset = 6) {
    log.info("Setup country ranking");

    const users = (await getCacheAndConvertIfNeeded())?.users;
    if (!users || !getFlag('rankHistoryAvailable')) return;

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
            users
        }
    });
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
    await getCacheAndConvertIfNeeded();

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
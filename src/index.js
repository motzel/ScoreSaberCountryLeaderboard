import Profile from './Svelte/Components/Profile/Profile.svelte';
import CountryRanking from './Svelte/Components/Country/Ranking.svelte';
import SongLeaderboard from './Svelte/Components/Song/Leaderboard.svelte';
import WhatIfpp from './Svelte/Components/Common/WhatIfPp.svelte';

import {default as config, getMainUserId} from './config';
import {getCacheAndConvertIfNeeded, setCache, Globals} from "./store";
import {fetchApiPage, fetchRankedSongs} from "./network/api";
import {round, substituteVars, formatNumber, formatNumberWithSuffix} from './utils/format';
import {capitalize, isEmpty, convertArrayToObjectByKey, arrayIntersection, nullIfUndefined, defaultIfFalsy, dateFromString, getFirstRegexpMatch} from "./utils/js";
import log from './utils/logger';

const SCORESABER_URL = 'https://scoresaber.com';
const SCORESABER_API_URL = 'https://new.scoresaber.com/api';
const BEATSAVER_API_URL = 'https://beatsaver.com/api';
const USERS_URL = SCORESABER_URL + '/global/${page}?country=' + config.COUNTRY;
const USER_PROFILE_URL = SCORESABER_URL + '/u/${userId}';
const SCORES_URL = SCORESABER_API_URL + '/player/${userId}/scores/recent/${page}';
const PLAYER_INFO_URL = SCORESABER_API_URL + '/player/${userId}/full';
const SONG_BY_HASH_URL = BEATSAVER_API_URL + '/maps/by-hash/${songHash}';

const ADDITIONAL_USER_IDS = ['76561198967371424', '76561198093469724'];

const SS_SCORES_PER_PAGE = 12; // song leaderboard
const SS_PLAYS_PER_PAGE = 8; // top/recent plays

const easterEggConditions = [
    [
        { field: 'id', value: '76561198165064325', cond: '===' },
        { field: 'percent', value: 0.85, cond: '<' }
    ]
];

let enableEasterEggs = true;

const getMaxScore = (blocks, maxScorePerBlock = 115) =>
    Math.floor(
        (blocks >= 14 ? 8 * maxScorePerBlock * (blocks - 13) : 0) +
        (blocks >= 6
            ? 4 * maxScorePerBlock * (Math.min(blocks, 13) - 5)
            : 0) +
        (blocks >= 2
            ? 2 * maxScorePerBlock * (Math.min(blocks, 5) - 1)
            : 0) +
        Math.min(blocks, 1) * maxScorePerBlock
    );

const getFlag = (name) => Globals.data?.flags?.[name];

const getLeaderboardId = () =>
    getFirstRegexpMatch(
        /\/leaderboard\/(\d+)(\?page=.*)?#?/,
        window.location.href.toLowerCase()
    );
const getSongHash = () => document.querySelector('.title~b')?.innerText;
const isLeaderboardPage = () => null !== getLeaderboardId();
const getProfileId = () =>
    getFirstRegexpMatch(
        /\u\/(\d+)((\?|&).*)?$/,
        window.location.href.toLowerCase()
    );
const isProfilePage = () => null !== getProfileId();
const isCountryRankingPage = () =>
    [
        'https://scoresaber.com/global?country=' + config.COUNTRY,
        'https://scoresaber.com/global/1&country=' + config.COUNTRY
    ].indexOf(window.location.href) >= 0;

const fetchHtmlPage = async (url, page = 1) =>
    new DOMParser().parseFromString(
        await (await fetch(substituteVars(url, { page }))).text(),
        'text/html'
    );

const fetchSongByHash = async (songHash) =>
    await fetchApiPage(substituteVars(SONG_BY_HASH_URL, { songHash }));

const fetchPlayerInfo = async (userId) =>
    await fetchApiPage(substituteVars(PLAYER_INFO_URL, { userId }));
const getUserIds = async (page = 1) =>
    (
        await Promise.all(
            Array.prototype.map.call(
                (await fetchHtmlPage(USERS_URL, page)).querySelectorAll(
                    '.ranking.global .player a'
                ),
                async (a) => getFirstRegexpMatch(/\/(\d+)$/, a.href)
            )
        )
    ).concat(ADDITIONAL_USER_IDS);
const fetchUsers = async (page = 1) =>
    Promise.all(
        Array.prototype.map.call(await getUserIds(page), async (userId) => {
            const info = await fetchPlayerInfo(userId);
            const {
                name,
                playerid,
                role,
                badges,
                banned,
                inactive,
                ...playerInfo
            } = info.playerInfo;

            // history is fetched as comma separated values string, let's make it a proper array
            playerInfo.history = playerInfo.history
                ? playerInfo.history
                    .split(',')
                    .map((rank) => {
                        const i = parseInt(rank, 10);
                        return !isNaN(i) ? i : null;
                    })
                    .reverse()
                : null;

            return Object.assign(
                {
                    id: playerid,
                    name: name,
                    url: substituteVars(USER_PROFILE_URL, {
                        userId: playerid
                    }),
                    lastUpdated: null,

                    scores: {}
                },
                playerInfo,
                { stats: info.scoreStats }
            );
        })
    );
const fetchScores = async (userId, page = 1, ...leaderboards) =>
    fetchApiPage(substituteVars(SCORES_URL, { userId }), page).then((s) =>
        s && s.scores
            ? s.scores.filter(
            (s) =>
                !leaderboards.length ||
                leaderboards.includes(s.leaderboardId)
            )
            : null
    );

async function getNewlyRanked() {
    const fetchedRankedSongs = await fetchRankedSongs();
    if (!fetchedRankedSongs) return null;

    const oldRankedSongs = Globals.data.rankedSongs;

    // find differences between old and new ranked songs
    return {
        allRanked: fetchedRankedSongs,
        newRanked: arrayIntersection(
            Object.keys(fetchedRankedSongs),
            Object.keys(oldRankedSongs)
        ).map((k) => fetchedRankedSongs[k]),
        changed: Object.values(oldRankedSongs)
            .filter(
                (s) =>
                    s.stars !== fetchedRankedSongs?.[s.leaderboardId]?.stars
            )
            .map((s) =>
                Object.assign({}, s, {
                    oldStars: s.stars,
                    stars: nullIfUndefined(
                        fetchedRankedSongs?.[s.leaderboardId]?.stars
                    )
                })
            )
    };
}

async function updateNewRankedsPpScores(progressCallback = null) {
    const data = await getCacheAndConvertIfNeeded();

    const ssplHeader = document.querySelector('#sspl_progress_head');
    if (ssplHeader)
        ssplHeader.innerHTML = 'Aktualizacja wyników nowych rankedów';

    // check if scores has been updated max 1 minute ago
    if (
        new Date().getTime() -
        dateFromString(Globals.data.lastUpdated).getTime() >
        60000
    ) {
        log.error('Please update song data first');
        return null;
    }

    const newlyRanked = await getNewlyRanked();
    if (!newlyRanked) return null;

    const leaderboardsToUpdate = newlyRanked.newRanked
        .map((s) => s.leaderboardId)
        .concat(newlyRanked.changed.map((s) => s.leaderboardId));

    const users = data.users;

    // fetch all user pages that need to be fetched
    // {userId: {pageId: [leaderboardId, leaderboardId...]}}
    const usersToUpdate = Object.values(users).reduce((cum, u) => {
        const userScoresToUpdate = Object.values(u.scores)
            .map((s) => ({
                leaderboardId: s.leaderboardId,
                timeset: dateFromString(s.timeset)
            }))
            .sort((a, b) => b.timeset.getTime() - a.timeset.getTime())
            .reduce((scum, s, idx) => {
                if (leaderboardsToUpdate.includes(s.leaderboardId)) {
                    const page = Math.floor(idx / SS_PLAYS_PER_PAGE) + 1;
                    scum[page] = defaultIfFalsy(scum?.[page], []).concat([
                        s.leaderboardId
                    ]);
                }
                return scum;
            }, {});

        if (!isEmpty(userScoresToUpdate)) {
            cum[u.id] = userScoresToUpdate;
        }

        return cum;
    }, {});

    const totalPages = Object.values(usersToUpdate).reduce(
        (sum, u) => (sum += Object.keys(u).length),
        0
    );

    let idxGlobal = 0;
    for (var userId in usersToUpdate) {
        let idxLocal = 0;
        for (var page in usersToUpdate[userId]) {
            const scores = convertArrayToObjectByKey(
                await fetchScores(
                    userId,
                    page,
                    ...usersToUpdate[userId][page]
                ),
                'leaderboardId'
            );
            users[userId].scores = Object.assign(
                {},
                users[userId].scores,
                scores
            );

            if (progressCallback)
                progressCallback({
                    id: userId,
                    name: users[userId].name,
                    page: idxLocal + 1,
                    percent: Math.floor((idxGlobal / totalPages) * 100)
                });

            idxLocal++;
            idxGlobal++;
        }
    }

    data.rankedSongs = newlyRanked.allRanked;
    data.rankedSongsLastUpdated = JSON.parse(JSON.stringify(new Date()));

    setCache(data);

    return newlyRanked;
}

async function fetchAllNewScores(
    user,
    lastUpdated = null,
    progressCallback = null
) {
    let allScores = {
        lastUpdated,
        scores: {}
    };

    let page = 0;
    let recentPlay = null;
    while (++page) {
        if (progressCallback)
            progressCallback({
                id: user.id,
                name: user.name,
                page: page,
                total: null
            });

        let scorePage = await fetchScores(user.id, page);
        if (!scorePage) break;

        // remember most recent play time
        if (page === 1 && scorePage.length) {
            recentPlay = dateFromString(scorePage[0].timeset);
        }

        for (let i in scorePage) {
            if (
                lastUpdated &&
                dateFromString(scorePage[i].timeset) <= lastUpdated
            ) {
                // remember most recent play time
                if (recentPlay) allScores.lastUpdated = recentPlay;

                return allScores;
            }

            allScores.scores[scorePage[i].leaderboardId] = scorePage[i];
        }

        // remember most recent play time
        if (recentPlay) allScores.lastUpdated = recentPlay;

        if (scorePage.length < 8) break;
    }

    allScores.lastUpdated = recentPlay;

    return allScores;
}

function isAnyData() {
    return Globals.data && Object.keys(Globals.data.users).length;
}

function getHumanDiffName(diffInfo) {
    return (
        capitalize(diffInfo.diff).replace('ExpertPlus', 'Expert+') +
        (diffInfo.type !== 'Standard' ? '/' + diffInfo.type : '')
    );
}

function getDiffColor(diffInfo) {
    const colors = {
        easy: 'MediumSeaGreen',
        normal: '#59b0f4',
        hard: 'tomato',
        expert: '#bf2a42',
        expertPlus: '#8f48db'
    };
    return colors[diffInfo.diff] ? colors[diffInfo.diff] : null;
}

function extractDiffAndType(ssDiff) {
    const match = /^_([^_]+)_Solo(.*)$/.exec(ssDiff);
    if (!match) return null;

    return {
        diff: match[1].toLowerCase().replace('plus', 'Plus'),
        type: match[2] ?? 'Standard'
    };
}

function findDiffInfo(characteristics, ssDiff) {
    if (!characteristics) return null;
    const diffAndType = extractDiffAndType(ssDiff);
    if (!diffAndType) return null;

    return characteristics.reduce((cum, ch) => {
        if (ch.name === diffAndType.type) {
            return ch.difficulties?.[diffAndType.diff];
        }

        return cum;
    }, null);
}

async function getLeaderboard(leadId) {
    const data = await getCacheAndConvertIfNeeded();

    const songHash = getSongHash() ?? null;
    const songInfo = songHash ? await fetchSongByHash(songHash) : null;
    const songCharacteristics = songInfo?.metadata?.characteristics;
    let diffInfo = null,
        maxSongScore = 0;

    return Object.keys(data.users)
        .reduce((cum, userId) => {
            if (!data.users[userId].scores[leadId]) return cum;

            if (!maxSongScore && !cum.length) {
                diffInfo = findDiffInfo(
                    songCharacteristics,
                    data.users[userId].scores[leadId].diff
                );
                maxSongScore =
                    diffInfo?.length && diffInfo?.notes
                        ? getMaxScore(diffInfo.notes)
                        : 0;
            }

            const { scores, ...user } = data.users[userId];
            const {
                score,
                timeset,
                rank,
                mods,
                pp,
                maxScoreEx,
                diff,
                ..._
            } = data.users[userId].scores[leadId];

            cum.push(
                Object.assign({}, user, {
                    score,
                    timeset,
                    rank,
                    mods,
                    pp,
                    percent: maxSongScore
                        ? score / maxSongScore
                        : maxScoreEx
                            ? score / maxScoreEx
                            : null
                })
            );

            return cum;
        }, [])
        .map((u) => Object.assign({}, u, {hidden: shouldBeHidden(u)}))
        .sort((a, b) => b.score - a.score);
}

function assert(el) {
    if (null === el) throw new Error('Assertion failed');

    return el;
}

function getBySelector(sel, el = null) {
    return assert((el ?? document).querySelector(sel));
}

function shouldBeHidden(u) {
    return (
        enableEasterEggs &&
        easterEggConditions.reduce((ret, conditions) => {
            return (
                ret ||
                conditions.reduce((subret, cond) => {
                    let userFieldValue = u?.[cond?.field];
                    let currentConditionFulfilled = true;
                    switch (cond?.cond) {
                        case '===':
                            currentConditionFulfilled =
                                userFieldValue === cond?.value;
                            break;
                        case '<':
                            currentConditionFulfilled =
                                userFieldValue < cond?.value;
                            break;
                        case '>':
                            currentConditionFulfilled =
                                userFieldValue > cond?.value;
                            break;
                        default:
                            log.error(
                                'Unknown condition: ',
                                cond?.cond
                            );
                            currentConditionFulfilled = false;
                    }
                    return subret && currentConditionFulfilled;
                }, true)
            );
        }, false)
    );
}

function newTdWithNumber(num, suffix) {
    return create('td', {}, formatNumberWithSuffix(num, suffix));
}

function createDiffSpan(diffInfo) {
    const span = create('span', {}, getHumanDiffName(diffInfo, true));
    const col = getDiffColor(diffInfo);
    if (col) span.style.color = col;
    return span;
}

function newRankedRow(r) {
    return create(
        'tr',
        {},
        create(
            'td',
            {},
            create(
                'a',
                {
                    href:
                        SCORESABER_URL +
                        '/leaderboard/' +
                        encodeURIComponent(r.leaderboardId)
                },
                r.songAuthor + ' - ' + r.name
            )
        ),
        create('td', {}, r.levelAuthor),
        create('td', {}, createDiffSpan(r.diff)),
        create(
            'td',
            {},
            create(
                'span',
                { class: 'scoreTop ppValue' },
                formatNumberWithSuffix(r.pp, 'pp')
            )
        ),
        newTdWithNumber(r.stars, '*'),
        newTdWithNumber(r.oldStars, '*')
    );
}

function showNewRankeds(info) {
    if (!Globals.data.flags.rankedSongsAvailable) return;

    document.getElementById('new-rankeds')?.remove();

    if(!info) return;

    const allChanges = info.newRanked.concat(info.changed);
    if (!allChanges.length) return;

    const container = getBySelector('#sspl');
    const ssplTable = getBySelector('#sspl table.ranking');
    const newRankedsTbody = create('tbody', {}, '');
    const newRankedsTbl = create(
        'table',
        { id: 'new-rankeds' },
        create(
            'thead',
            {},
            create(
                'tr',
                {},
                create('th', {}, 'Nuta'),
                create('th', {}, 'Mapper'),
                create('th', {}, 'Trudność'),
                create('th', {}, 'PP'),
                create('th', {}, '*'),
                create('th', {}, 'Stare *')
            )
        ),
        newRankedsTbody
    );

    const sseUserId = getMainUserId();
    allChanges
        .sort((a, b) => b.stars - a.stars)
        .map((m) =>
            newRankedsTbody.appendChild(
                newRankedRow(
                    Object.assign({}, m, {
                        pp:
                        Globals.data?.users?.[sseUserId].scores?.[
                            m.leaderboardId
                            ]?.pp
                    })
                )
            )
        );
    if(allChanges.length) {
        container.insertBefore(
            create('h3', {}, 'Nowe/zmienione rankedy'),
            ssplTable
        );
        container.insertBefore(newRankedsTbl, ssplTable);
    }
}

/*
async function fillLeaderboard() {
    const leaderboardId = getLeaderboardId();
    const leaderboard = await getLeaderboard(leaderboardId);
    const container = getBySelector('.ranking.global .ssplcont');
    const ssplTable = getBySelector('#sspl table.ranking');
    const ssplTableBody = getBySelector('tbody', ssplTable);

    container.innerHTML = '';
    ssplTableBody.innerHTML = '';

    if (leaderboard?.length) {
        const sseUserId = getMainUserId();
        let idx = 1;
        leaderboard.map((u) => {
            let row = generate_song_table_row(
                u,
                leaderboardId,
                idx++,
                shouldBeHidden(u) ? 'hidden' : ''
            );
            if (u.id === sseUserId)
                row.style = 'background-color: var(--color-highlight);';
            ssplTableBody.appendChild(row);
        });

        ssplTable.style.display = '';
    } else {
        ssplTable.style.display = 'none';
        container.appendChild(create('h3', {}, 'Strasznie tu pusto...'));
    }

    if (!isAnyData()) {
        const firstFetch = create('div', {}, '');
        firstFetch.appendChild(
            create(
                'p',
                {},
                'Wygląda na to, że nie ma jeszcze żadnych danych.'
            )
        );
        firstFetch.appendChild(
            create(
                'p',
                {},
                'Usiądź sobie wygodnie, otwórz harnasia, kliknij Pobierz i poczekaj, bo trochę to potrwa...'
            )
        );
        firstFetch.appendChild(
            create(
                'button',
                {
                    onclick: (e) => {
                        e.target.disabled = true;

                        refresh().then((_) => {
                            firstFetch.remove();
                            fillLeaderboard();
                        });
                    }
                },
                'Pobierz'
            )
        );
        firstFetch.appendChild(
            create(
                'div',
                {},
                create(
                    'progress',
                    {
                        id: 'sspl_progress',
                        value: 0,
                        max: 100
                    },
                    '0'
                ),
                create('div', { id: 'sspl_progress_info' }, '')
            )
        );
        container.appendChild(firstFetch);

        getBySelector('#ssplrefresh').style.display = 'none';
    } else {
        const refresh = getBySelector('#ssplrefresh');
        refresh.style.display = '';
        getBySelector('span', refresh).innerText = formatDate(
            Globals.data.lastUpdated
        );
    }
}
*/

async function setupPlTable() {
    let scoreTableNode = getBySelector('.ranking table.global');
    /*
    const refreshDiv = create('div', { id: 'ssplrefresh' }, '');
    refreshDiv.appendChild(
        create(
            'button',
            {
                title: 'Odśwież',
                onclick: (e) => {
                    refreshDiv.appendChild(
                        create(
                            'div',
                            { id: 'sspl_progress_cont' },
                            create(
                                'header',
                                { id: 'sspl_progress_head' },
                                ''
                            ),
                            create(
                                'progress',
                                {
                                    id: 'sspl_progress',
                                    value: 0,
                                    max: 100
                                },
                                '0'
                            ),
                            create('div', { id: 'sspl_progress_info' }, '')
                        )
                    );

                    e.target.disabled = true;

                    refresh()
                        .then((_) => updateNewRankedsPpScores(updateProgress))
                        .then((rankeds) => showNewRankeds(rankeds))
                        .then((_) => {
                            getBySelector('#sspl_progress_cont').remove();
                            e.target.disabled = false;
                            fillLeaderboard();
                        });
                }
            },
            '↻'
        )
    );
    refreshDiv.appendChild(create('strong', {}, ' Data pobrania:'));
    refreshDiv.appendChild(create('span', {}, '-'));

    sspl.appendChild(refreshDiv);
    sspl.appendChild(clonedTable);
    sspl.appendChild(create('div', { class: 'ssplcont text-center' }, ''));
*/
    const leaderboardId = getLeaderboardId();
    const leaderboard = await getLeaderboard(leaderboardId);
    if(leaderboard?.length) {
        let tblContainer = document.createElement('div');
        tblContainer["id"] = "sspl";
        tblContainer.style["display"] = "none";
        scoreTableNode.parentNode.appendChild(tblContainer);
        new SongLeaderboard({
            target: tblContainer,
            props: {
                leaderboardId,
                leaderboard
            }
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
            false,
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
                        const songInfo = await fetchSongByHash(
                            leaderboard.id
                        );
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
    const typeSel = create('select', { class: 'type' }, '');
    [
        { value: 'sspl', text: 'Cached' },
        { value: 'original', text: 'Original' }
    ].map((o) =>
        typeSel.appendChild(
            create(
                'option',
                { value: o.value, selected: o.value === 'sspl' },
                o.text
            )
        )
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

function updateProgress(info) {
    const ssplProgress = document.querySelector('#sspl_progress');
    const ssplProgressInfo = document.querySelector('#sspl_progress_info');

    if (ssplProgress) ssplProgress.value = info.percent;
    if (ssplProgressInfo)
        ssplProgressInfo.innerHTML =
            '<strong>' + info.name + '</strong> / ' + info.page;
}

async function refresh() {
    const ssplHeader = document.querySelector('#sspl_progress_head');
    if (ssplHeader) ssplHeader.innerHTML = 'Pobieranie nowych wyników';

    const users = await fetchUsers();

    let idx = 0;
    let cache = await users.reduce(async (promisedCum, u) => {
        let cum = await promisedCum;

        let newScores = await fetchAllNewScores(
            u,
            dateFromString(
                cum.users[u.id] ? cum.users[u.id].lastUpdated : null
            ),
            (info) =>
                updateProgress(
                    Object.assign({}, info, {
                        percent: Math.floor((idx / users.length) * 100)
                    })
                )
        );

        cum.users[u.id] = Object.assign({}, u, {
            lastUpdated: newScores.lastUpdated,
            scores: Object.assign(
                {},
                cum.users[u.id] ? cum.users[u.id].scores : {},
                newScores.scores
            )
        });

        idx++;

        return cum;
    }, await getCacheAndConvertIfNeeded());

    cache.lastUpdated = new Date().toISOString();

    return setCache(cache);
}

// Taken from ScoreSaberEnhanced to play nicely with SSE running: https://github.com/Splamy/ScoreSaberEnhanced
function toggled_class(bool, css_class) {
    return bool ? css_class : '';
}
function into(parent, ...children) {
    for (const child of children) {
        if (typeof child === 'string') {
            if (children.length > 1) {
                parent.appendChild(create('div', {}, child));
            } else {
                parent.innerText = child;
            }
        } else {
            parent.appendChild(child);
        }
    }
    return parent;
}
function create(tag, attrs, ...children) {
    if (!tag) throw new SyntaxError("'tag' not defined");
    const ele = document.createElement(tag);
    if (attrs) {
        for (const attrName in attrs) {
            if (attrName === 'style') {
                for (const styleName in attrs.style) {
                    ele.style[styleName] = attrs.style[styleName];
                }
            } else if (attrName === 'class') {
                if (typeof attrs.class === 'string') {
                    const classes = attrs.class
                        .split(/ /g)
                        .filter((c) => c.trim().length > 0);
                    ele.classList.add(...classes);
                } else {
                    ele.classList.add(...attrs.class);
                }
            } else if (attrName === 'for') {
                ele.htmlFor = attrs[attrName];
            } else if (attrName === 'selected') {
                ele.selected = attrs[attrName] ? 'selected' : undefined;
            } else if (attrName === 'disabled') {
                if (attrs[attrName])
                    ele.setAttribute('disabled', undefined);
            } else if (attrName === 'data') {
                const data_dict = attrs[attrName];
                for (const data_key in data_dict) {
                    ele.setAttribute(
                        `data-${data_key}`,
                        data_dict[data_key]
                    );
                }
            } else {
                ele[attrName] = attrs[attrName];
            }
        }
    }
    into(ele, ...children);
    return ele;
}
function generate_tab(css_id, is_active, has_offset) {
    const tabClass = `filter_tab sspl ${toggled_class(
        is_active,
        'is-active'
    )} ${toggled_class(has_offset, 'offset_tab')}`;
    return create(
        'li',
        {
            id: css_id,
            class: tabClass
        },
        create(
            'a',
            {
                class: 'has-text-info',
                onclick: () => {
                    document
                        .querySelectorAll('.tabs > ul .filter_tab')
                        .forEach((x) => x.classList.remove('is-active'));
                    assert(document.getElementById(css_id)).classList.add(
                        'is-active'
                    );
                }
            },
            create('img', {
                class: 'bloodtrail',
                src: require('./resource/img/bloodtrail.png').default
            })
        )
    );
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
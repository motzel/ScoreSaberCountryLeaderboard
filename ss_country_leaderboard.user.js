// ==UserScript==
// @name         ScoreSaber country leaderboard
// @namespace    https://motzel.dev
// @version      0.5.5
// @description  Add country leaderboard tab
// @author       motzel
// @match        https://scoresaber.com/leaderboard/*
// @match        https://scoresaber.com/u/*
// @include      /^https://scoresaber\.com\/global(\/\d+&country=pl|\?country=pl)/
// @icon         https://scoresaber.com/imports/images/logo.ico
// @updateURL    https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/ss_country_leaderboard.user.js
// @downloadURL  https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/ss_country_leaderboard.user.js
// @supportURL   https://github.com/motzel/ScoreSaberCountryLeaderboard/issues
// @require      https://cdnjs.cloudflare.com/ajax/libs/localforage/1.7.3/localforage.min.js
// @run-at document-end
// for Tampermonkey
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_info
// for Greasemonkey
// @grant        GM.xmlHttpRequest
// @connect      beatsaver.com
// @connect      githubusercontent.com
// ==/UserScript==

(function () {
    'use strict';

    const COUNTRY = 'pl';

    const SSE_CHECK_DELAY = 500; // in ms

    const SCORESABER_URL = 'https://scoresaber.com';
    const SCORESABER_API_URL = 'https://new.scoresaber.com/api';
    const BEATSAVER_API_URL = 'https://beatsaver.com/api';
    const USERS_URL = SCORESABER_URL + '/global/${page}?country=' + COUNTRY;
    const USER_PROFILE_URL = SCORESABER_URL + '/u/${userId}';
    const SCORES_URL = SCORESABER_API_URL + '/player/${userId}/scores/recent/${page}';
    const PLAYER_INFO_URL = SCORESABER_API_URL + '/player/${userId}/full';
    const SONG_BY_HASH_URL = BEATSAVER_API_URL + '/maps/by-hash/${songHash}';

    const CACHE_KEY = 'sspl_users';
    const ADDITIONAL_USER_IDS = ['76561198967371424', '76561198093469724'];

    const SS_PLAYERS_PER_PAGE = 50; // global ranking
    const SS_SCORES_PER_PAGE = 12; // song leaderboard
    const SS_PLAYS_PER_PAGE = 8; // top/recent plays
    const MAGIC_HISTORY_NUMBER = 999999; // just ask Umbra

    const changeDiff = [{value: 0, text: 'Daily change'}, {value: 6, text: 'Weekly change'}, {value: 29, text: 'Monthly change'}];
    const easterEggConditions = [[{field:"id", value:"76561198165064325", cond:"==="}, {field:"percent", value:0.85, cond:"<"}]];

    let enableEasterEggs = true;

    const Globals = {data: null};

    const substituteVars = (url, vars) => Object.keys(vars).reduce((cum, key) => cum.replace(new RegExp('\\${' + key + '}', 'gi'), vars[key]), url);
    const dateFromString = str => str ? new Date(Date.parse(str)) : null;
    const getFirstRegexpMatch = (regexp, str) => {
        let _ = regexp.exec(str);
        return _ ? _[1] : null
    }
    const getMaxScore = (blocks, maxScorePerBlock = 115) =>
        Math.floor(
            (blocks >= 14 ? 8 * maxScorePerBlock * (blocks - 13) : 0) +
            (blocks >= 6 ? 4 * maxScorePerBlock * (Math.min(blocks, 13) - 5) : 0) +
            (blocks >= 2 ? 2 * maxScorePerBlock * (Math.min(blocks, 5) - 1) : 0) +
            Math.min(blocks, 1) * maxScorePerBlock
        );

    const getFlag = name => Globals.data?.flags?.[name];

    const getLeaderboardId = () => getFirstRegexpMatch(/\/leaderboard\/(\d+$)/, window.location.href.toLowerCase());
    const getSongHash = () => document.querySelector('.title~b')?.innerText;
    const isLeaderboardPage = () => null !== getLeaderboardId();
    const getProfileId = () => getFirstRegexpMatch(/\u\/(\d+)((\?|&).*)?$/, window.location.href.toLowerCase());
    const isProfilePage = () => null !== getProfileId();
    const isCountryRankingPage = () => ['https://scoresaber.com/global?country=pl', 'https://scoresaber.com/global/1&country=pl'].indexOf(window.location.href) >= 0;

    const fetchHtmlPage = async (url, page = 1) => new DOMParser().parseFromString(await (await fetch(substituteVars(url, {page}))).text(), 'text/html');
    const fetchApiPage = async (url, page = 1) => (await fetch(substituteVars(url, {page}))).json();

    const fetchSongByHash = async (songHash) => await fetchApiPage(substituteVars(SONG_BY_HASH_URL, {songHash}));

    const fetchPlayerInfo = async (userId) => await (fetchApiPage(substituteVars(PLAYER_INFO_URL, {userId})));
    const getUserIds = async (page = 1) => (await Promise.all(Array.prototype.map.call((await fetchHtmlPage(USERS_URL, page)).querySelectorAll('.ranking.global .player a'), async (a) => getFirstRegexpMatch(/\/(\d+)$/, a.href)))).concat(ADDITIONAL_USER_IDS);
    const fetchUsers = async (page = 1) => Promise.all(Array.prototype.map.call(await getUserIds(page), async userId => {
        const info = await fetchPlayerInfo(userId);
        const {name, playerid, role, badges, banned, inactive, ...playerInfo} = info.playerInfo;

        // history is fetched as comma separated values string, let's make it a proper array
        playerInfo.history = playerInfo.history ? playerInfo.history.split(',').map(rank => {
            const i = parseInt(rank, 10);
            return !isNaN(i) ? i : null;
        }).reverse() : null;

        return Object.assign(
            {
                id: playerid,
                name: name,
                url: substituteVars(USER_PROFILE_URL, {userId: playerid}),
                lastUpdated: null,

                scores: {}
            },
            playerInfo,
            {stats: info.scoreStats}
        );
    }));
    const fetchScores = async (userId, page = 1) => fetchApiPage(substituteVars(SCORES_URL, {userId}), page);

    async function fetchAllNewScores(user, lastUpdated = null, progressCallback = null) {
        let allScores = {
            lastUpdated,
            scores: {}
        };

        let page = 0;
        let recentPlay = null;
        while (++page) {
            if (progressCallback) progressCallback({id: user.id, name: user.name, page: page, total: null});

            let scorePage = await fetchScores(user.id, page);
            if (!scorePage || !scorePage.scores) break;

            // remember most recent play time
            if (page === 1 && scorePage.scores.length) {
                recentPlay = dateFromString(scorePage.scores[0].timeset);
            }

            for (let i in scorePage.scores) {
                if (lastUpdated && dateFromString(scorePage.scores[i].timeset) <= lastUpdated) {
                    // remember most recent play time
                    if (recentPlay) allScores.lastUpdated = recentPlay;

                    return allScores;
                }

                allScores.scores[scorePage.scores[i].leaderboardId] = scorePage.scores[i];
            }

            // remember most recent play time
            if (recentPlay) allScores.lastUpdated = recentPlay;

            if (scorePage.scores.length < 8) break;
        }

        allScores.lastUpdated = recentPlay;

        return allScores;
    }

    function isAnyData() {
        return Globals.data && Object.keys(Globals.data.users).length;
    }

    async function getCache() {
        return new Promise((resolve, reject) => localforage.getItem(CACHE_KEY, function (err, value) {
            resolve(value);
        }));
    }

    async function setCache(value) {
        Globals.data = value;

        localforage.setItem(CACHE_KEY, value);

        return value;
    }

    async function getCacheAndConvertIfNeeded() {
        if(Globals.data) return Globals.data;

        let cache = await getCache() ?? {version: 1, lastUpdated: null, users: {}};

        // CONVERSION FROM OLDER CACHE VERSION IF NEEDED
        let flags = {rankHistoryAvailable: false};
        if(Object.values(cache?.users)?.[0]?.history?.length) {
            flags.rankHistoryAvailable = true;
        }

        Globals.data = Object.assign(cache, {flags});

        return cache;
    }

    function findDiffInfo(characteristics, ssDiff) {
        const match = /^_([^_]+)_Solo(.*)$/.exec(ssDiff);
        if (!match) return null;

        const diff = match[1].toLowerCase().replace('plus', 'Plus');
        const type = match[2] ?? 'Standard';

        return characteristics.reduce((cum, ch) => {
            if (ch.name === type) {
                return ch.difficulties?.[diff];
            }

            return cum;
        }, null);
    }

    async function getLeaderboard(leadId) {
        const data = await getCacheAndConvertIfNeeded();

        const songHash = getSongHash() ?? null;
        const songInfo = songHash ? await fetchSongByHash(songHash) : null;
        const songCharacteristics = songInfo?.metadata?.characteristics;
        let diffInfo = null, maxSongScore = 0;

        return Object.keys(data.users)
            .reduce((cum, userId) => {
                if (!data.users[userId].scores[leadId]) return cum;

                if (!maxSongScore && !cum.length) {
                    diffInfo = findDiffInfo(songCharacteristics, data.users[userId].scores[leadId].diff);
                    maxSongScore = diffInfo?.length && diffInfo?.notes ? getMaxScore(diffInfo.notes) : 0;
                }

                const {scores, ...user} = data.users[userId];
                const {score, timeset, rank, mods, pp, maxScoreEx, diff, ..._} = data.users[userId].scores[leadId];

                cum.push(Object.assign({}, user, {
                    score,
                    timeset,
                    rank,
                    mods,
                    pp,
                    percent: maxSongScore ? score / maxSongScore : (maxScoreEx ? score / maxScoreEx : null)
                }));

                return cum;
            }, [])
            .sort((a, b) => b.score - a.score)
            ;
    }

    function assert(el) {
        if (null === el) throw new Error("Assertion failed");

        return el;
    }

    function getBySelector(sel, el = null) {
        return assert((el ?? document).querySelector(sel));
    }

    function setupPlTable() {
        let scoreTableNode = getBySelector(".ranking table.global");

        let clonedTable = document.querySelector(".ranking table.sspl");
        if (!clonedTable) clonedTable = scoreTableNode.cloneNode(true);

        clonedTable.classList.remove('global');
        clonedTable.classList.add('sspl');
        getBySelector('tbody', clonedTable).innerHTML = '';

        const clonedTableHead = getBySelector('thead', clonedTable);
        getBySelector('.rank', clonedTableHead).innerHTML = 'Miejsce';
        getBySelector('.player', clonedTableHead).innerHTML = 'Gracz';
        getBySelector('.score', clonedTableHead).innerHTML = 'Wynik';
        getBySelector('.timeset', clonedTableHead).innerHTML = 'Czas';
        getBySelector('.mods', clonedTableHead).innerHTML = 'Mody';
        getBySelector('.percentage', clonedTableHead).innerHTML = 'Procent';

        const sspl = create("div", {id: "sspl"}, "");
        sspl.style.display = 'none';
        scoreTableNode.parentElement.appendChild(sspl);

        const refreshDiv = create("div", {id: "ssplrefresh"}, "");
        refreshDiv.appendChild(create("button", {
            title: "Odśwież", onclick: (e) => {
                refreshDiv.appendChild(create("div", {id: "sspl_progress_cont"}, create("progress", {
                    id: "sspl_progress",
                    value: 0,
                    max: 100
                }, "0"), create("div", {id: "sspl_progress_info"}, "")));
                e.target.disabled = true;

                refresh().then(_ => {
                    getBySelector('#sspl_progress_cont').remove();
                    e.target.disabled = false;
                    fillLeaderboard();
                });
            }
        }, "↻"));
        refreshDiv.appendChild(create("strong", {}, " Data pobrania:"));
        refreshDiv.appendChild(create("span", {}, "-"));

        sspl.appendChild(refreshDiv);
        sspl.appendChild(clonedTable);
        sspl.appendChild(create("div", {class: "ssplcont text-center"}, ""));
    }

    function shouldBeHidden(u) {
        return enableEasterEggs && easterEggConditions.reduce((ret, conditions) => {
            return ret || conditions.reduce((subret, cond) => {
                let userFieldValue = u?.[cond?.field];
                let currentConditionFulfilled = true;
                switch (cond?.cond) {
                    case '===':
                        currentConditionFulfilled = userFieldValue === cond?.value;
                        break;
                    case '<':
                        currentConditionFulfilled = userFieldValue < cond?.value;
                        break;
                    case '>':
                        currentConditionFulfilled = userFieldValue > cond?.value;
                        break;
                    default:
                        console.log("Unknown condition: ", cond?.cond);
                        currentConditionFulfilled = false;
                }
                return subret && currentConditionFulfilled;
            }, true);
        }, false);
    }

    async function fillLeaderboard() {
        const leaderboardId = getLeaderboardId();
        const leaderboard = await getLeaderboard(leaderboardId);
        const container = getBySelector('.ranking.global .ssplcont');
        const ssplTable = getBySelector('#sspl table');
        const ssplTableBody = getBySelector('tbody', ssplTable);

        container.innerHTML = '';
        ssplTableBody.innerHTML = '';

        if (leaderboard?.length) {
            const sseUserId = getSSEUser();
            let idx = 1;
            leaderboard.map(u => {
                let row = generate_song_table_row(u, leaderboardId, idx++, shouldBeHidden(u) ? "hidden" : "");
                if (u.id === sseUserId) row.style = "background-color: var(--color-highlight);";
                ssplTableBody.appendChild(row);
            });

            ssplTable.style.display = '';
        } else {
            ssplTable.style.display = 'none';
            container.appendChild(create("h3", {}, "Strasznie tu pusto..."));
        }

        if (!isAnyData()) {
            const firstFetch = create("div", {}, "");
            firstFetch.appendChild(create("p", {}, "Wygląda na to, że nie ma jeszcze żadnych danych."));
            firstFetch.appendChild(create("p", {}, "Usiądź sobie wygodnie, otwórz harnasia, kliknij Pobierz i poczekaj, bo trochę to potrwa..."));
            firstFetch.appendChild(create("button", {
                onclick: (e) => {
                    e.target.disabled = true;

                    refresh().then(_ => {
                        firstFetch.remove();
                        fillLeaderboard();
                    });
                }
            }, "Pobierz"));
            firstFetch.appendChild(create("div", {}, create("progress", {
                id: "sspl_progress",
                value: 0,
                max: 100
            }, "0"), create("div", {id: "sspl_progress_info"}, "")));
            container.appendChild(firstFetch);

            getBySelector('#ssplrefresh').style.display = 'none';
        } else {
            const refresh = getBySelector('#ssplrefresh');
            refresh.style.display = '';
            getBySelector('span', refresh).innerText = formatDate(Globals.data.lastUpdated);
        }
    }

    async function setupLeaderboard() {
        const leadId = getLeaderboardId();
        if (!leadId) return;

        const tabs = getBySelector(".tabs > ul");
        tabs.appendChild(generate_tab("pl_tab", false, null === document.querySelector('.filter_tab')));
        setupPlTable();

        fillLeaderboard();

        document.addEventListener('click', function (e) {
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
        }, {passive: true});
    }

    async function setupProfile() {
        const profileId = getProfileId();
        if (!profileId) return;

        const data = await getCacheAndConvertIfNeeded();

        var scoreSpans = document.querySelectorAll('.score .scoreBottom');
        [].forEach.call(scoreSpans, async function (span) {
            const songLink = span.closest('tr').querySelector('.song a');
            if (songLink) {
                const leaderboardId = getFirstRegexpMatch(/\/leaderboard\/(\d+$)/, songLink.href);
                if (leaderboardId) {
                    const leaderboard = data.users?.[profileId].scores?.[leaderboardId];

                    if (leaderboard) {
                        try {
                            const songInfo = await fetchSongByHash(leaderboard.id);
                            const songCharacteristics = songInfo?.metadata?.characteristics;
                            const diffInfo = findDiffInfo(songCharacteristics, leaderboard.diff);
                            const maxSongScore = diffInfo?.length && diffInfo?.notes ? getMaxScore(diffInfo.notes) : 0;
                            const percent = maxSongScore ? leaderboard.score / maxSongScore : (maxScoreEx ? leaderboard.score / maxScoreEx : null);

                            if(shouldBeHidden(Object.assign({}, leaderboard, {id:leaderboard.playerId, percent}))) songLink.closest('tr').classList.add("hidden");

                            span.innerHTML = "score: " + formatNumber(leaderboard.score, 0) + (percent ? '<br />accuracy: ' + formatNumber(percent * 100, 2) + '%' : '') + (leaderboard.mods.length ? '<br />(' + leaderboard.mods + ')' : '');
                        }
                        catch(e) {} // swallow error
                    }
                }
            }
        });

        if (data.users?.[profileId]?.stats) {
            const stats = document.querySelector('.content .column ul');
            if (stats) {
                stats.appendChild(create("li", {}, create("strong", {}, "Ranked play count: "), create("span", {}, formatNumber(data.users[profileId].stats.rankedPlayCount, 0))));
                stats.appendChild(create("li", {}, create("strong", {}, "Total ranked score: "), create("span", {}, formatNumber(data.users[profileId].stats.totalRankedScore, 0))));
                stats.appendChild(create("li", {}, create("strong", {}, "Ranked accuracy: "), create("span", {}, formatNumber(data.users[profileId].stats.averageRankedAccuracy, 2).toString() + "%")));
            }
        }
    }

    function generateRankingRow(u) {
        return create("tr", {},
            //create("td", {class: "picture"}),
            create("td", {class: "rank"}, create("span", {}, "#" + u.idx), create("small", {}, create("a", {href: "/global/" + encodeURIComponent(Math.ceil(u.rank / SS_PLAYERS_PER_PAGE))}, "#" + u.rank))),
            create("td", {class: "player"}, generate_song_table_player(u)),
            create("td", {class: "pp"}, create("span", {class: "scoreTop ppValue"}, formatNumber(u.pp, 2)), create("span", {class: "scoreTop ppLabel"}, 'pp')),
            create("td", {class: "diff " + (u.weeklyChange ? (u.weeklyChange > 0 ? 'inc' : 'dec') : '')}, formatNumber(u.weeklyChange ?? 0, 0, true))
        );
    }

    async function fillCountryRanking(diffOffset = 6) {
        const tblBody = getBySelector('table.ranking.global.sspl tbody');
        const users = (await getCacheAndConvertIfNeeded())?.users;
        if(!users) return;

        const ranking = Object.keys(users).reduce((cum, userId) => {
            const {id, name, country, pp, rank, history} = users[userId];

            cum.push({
                id,
                name,
                country,
                pp,
                rank,
                history,
                weeklyChange: rank && history?.[diffOffset] && rank !== MAGIC_HISTORY_NUMBER && history?.[diffOffset] !== MAGIC_HISTORY_NUMBER ? history[diffOffset] - rank : null
            });

            return cum;
        }, [])
            .sort((a, b) => b.pp - a.pp)
            .slice(0, 50);

        tblBody.innerHTML = '';

        document.querySelector('table.ranking.global.sspl thead .picture')?.remove();

        let idx = 1;
        const sseUserId = getSSEUser();
        ranking.forEach(u => {
            const row = generateRankingRow(Object.assign({}, u, {idx}));
            if (u.id === sseUserId) row.style = "background-color: var(--color-highlight);";
            tblBody.appendChild(row);
            idx++;
        });
    }

    async function setupCountryRanking(diffOffset = 6) {
        if(!getFlag('rankHistoryAvailable')) return;

        const origTable = getBySelector("table.ranking.global");
        const clonedTable = origTable.cloneNode(true);

        const pagination = getBySelector(".pagination", origTable.parentNode.parentNode);
        const typeSel = create('select', {class: "type"}, '');
        [{value: "sspl", text: 'Cached'}, {value: "original", text: 'Original'}].map(o => typeSel.appendChild(create('option', {value: o.value, selected: o.value === 'sspl'}, o.text)));
        pagination.insertBefore(typeSel, getBySelector("br", pagination));
        typeSel.addEventListener('change', e => Array.prototype.slice.apply(e.target.closest('.box').querySelectorAll('table.ranking.global')).map(tbl => tbl.style.display = tbl.classList.contains(e.target.options[e.target.selectedIndex].value) ? '' : 'none'));

        clonedTable.classList.add("sspl");

        origTable.style.display = 'none';
        origTable.classList.add("original");
        origTable.parentNode.appendChild(clonedTable);

        const headDiff = getBySelector('thead .diff', clonedTable);
        headDiff.innerHTML = '';

        const changeSel = create('select', {}, '');
        changeDiff.map(o => changeSel.appendChild(create('option', {value: o.value, selected: o.value === diffOffset}, o.text)));
        headDiff.appendChild(changeSel);
        changeSel.addEventListener('change', e => fillCountryRanking(e.target.options[e.target.selectedIndex].value))

        await fillCountryRanking(diffOffset);
    }

    function updateProgress(info) {
        const ssplProgress = document.querySelector("#sspl_progress");
        const ssplProgressInfo = document.querySelector("#sspl_progress_info");

        if (ssplProgress) ssplProgress.value = info.percent;
        if (ssplProgressInfo) ssplProgressInfo.innerHTML = '<strong>' + info.name + '</strong> / ' + info.page;
    }

    async function refresh() {
        const users = await fetchUsers();

        let idx = 0;
        let cache = await users.reduce(async (promisedCum, u) => {
            let cum = await promisedCum;

            let newScores = await fetchAllNewScores(u, dateFromString(cum.users[u.id] ? cum.users[u.id].lastUpdated : null), (info) => updateProgress(Object.assign({}, info, {percent: Math.floor(idx / users.length * 100)})));

            cum.users[u.id] = Object.assign(
                {},
                u,
                {
                    lastUpdated: newScores.lastUpdated,
                    scores: Object.assign({}, cum.users[u.id] ? cum.users[u.id].scores : {}, newScores.scores)
                }
            );

            idx++;

            return cum;
        }, await getCacheAndConvertIfNeeded());

        cache.lastUpdated = (new Date()).toISOString();

        return setCache(cache);
    }

    // Taken from ScoreSaberEnhanced to play nicely with SSE running: https://github.com/Splamy/ScoreSaberEnhanced
    function toggled_class(bool, css_class) {
        return bool ? css_class : "";
    }

    function into(parent, ...children) {
        for (const child of children) {
            if (typeof child === "string") {
                if (children.length > 1) {
                    parent.appendChild(create("div", {}, child));
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
        if (!tag)
            throw new SyntaxError("'tag' not defined");
        const ele = document.createElement(tag);
        if (attrs) {
            for (const attrName in attrs) {
                if (attrName === "style") {
                    for (const styleName in attrs.style) {
                        ele.style[styleName] = attrs.style[styleName];
                    }
                } else if (attrName === "class") {
                    if (typeof attrs.class === "string") {
                        const classes = attrs.class.split(/ /g).filter(c => c.trim().length > 0);
                        ele.classList.add(...classes);
                    } else {
                        ele.classList.add(...attrs.class);
                    }
                } else if (attrName === "for") {
                    ele.htmlFor = attrs[attrName];
                } else if (attrName === "selected") {
                    ele.selected = attrs[attrName] ? "selected" : undefined;
                } else if (attrName === "disabled") {
                    if (attrs[attrName])
                        ele.setAttribute("disabled", undefined);
                } else if (attrName === "data") {
                    const data_dict = attrs[attrName];
                    for (const data_key in data_dict) {
                        ele.setAttribute(`data-${data_key}`, data_dict[data_key]);
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
        const tabClass = `filter_tab sspl ${toggled_class(is_active, "is-active")} ${toggled_class(has_offset, "offset_tab")}`;
        return create("li", {
            id: css_id,
            class: tabClass,
        }, create("a", {
            class: "has-text-info",
            onclick: () => {
                document.querySelectorAll(".tabs > ul .filter_tab").forEach(x => x.classList.remove("is-active"));
                assert(document.getElementById(css_id)).classList.add("is-active");
            },
        }, create("img", {
            class: "bloodtrail",
            src: "data:image/png;base64,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"
        })));
    }

    function generate_song_table_row(user, leaderboardId, idx, cls) {
        return create("tr", {class: cls}, create("td", {class: "picture"}), create("td", {class: "rank"}, create("span", {}, "#" + idx), create("small", {}, create("a", {href: "/leaderboard/"+encodeURIComponent(leaderboardId)+"?page=" + encodeURIComponent(Math.ceil(user.rank / SS_SCORES_PER_PAGE))}, "#" + user.rank))), create("td", {class: "player"}, generate_song_table_player(user)), create("td", {class: "score"}, user.score ? formatNumber(user.score, 0) : "-"), create("td", {
            class: "timeset",
            title: dateFromString(user.timeset).toLocaleString()
        }, formatDate(user.timeset)), create("td", {class: "mods"}, user.mods ? user.mods.toString() : "-"), create("td", {class: "percentage"}, user.percent ? (formatNumber(user.percent * 100, 2) + "%") : "-"), create("td", {class: "pp"}, create("span", {class: "scoreTop ppValue"}, formatNumber(user.pp, 2)), create("span", {class: "scoreTop ppLabel"}, "pp")));
    }

    function generate_song_table_player(user) {
        const country = user.country.toLowerCase();
        return create("a", {href: substituteVars(USER_PROFILE_URL, {userId: user.id})}, create("img", {src: `/imports/images/flags/${country}.png`}), create("span", {class: "player-name"}, " " + user.name));
    }

    // needed by removed SSE dependencies
    function formatNumber(num, digits = 2, addSign = false) {
        return (addSign && num > 0 ? '+' : '') + num.toLocaleString(COUNTRY, {minimumFractionDigits: digits, maximumFractionDigits: digits});
    }

    function formatDate(val) {
        const rtf = new Intl.RelativeTimeFormat(
            COUNTRY,
            {
                localeMatcher: "best fit",
                numeric: "auto",
                style: "long",
            }
        );

        const diffInSecs = (Date.now() - dateFromString(val)) / 1000;

        if (diffInSecs < 60) return rtf.format(-Math.ceil(diffInSecs), 'second');
        else if (diffInSecs < 60 * 60) return rtf.format(-Math.ceil(diffInSecs / 60), 'minute');
        else if (diffInSecs < 60 * 60 * 24) return rtf.format(-Math.ceil(diffInSecs / (60 * 60)), 'hour');
        else if (diffInSecs < 60 * 60 * 24 * 30) return rtf.format(-Math.ceil(diffInSecs / (60 * 60 * 24)), 'day');
        else if (diffInSecs < 60 * 60 * 24 * 365) return rtf.format(-Math.ceil(diffInSecs / (60 * 60 * 24 * 30)), 'month');
        else return rtf.format(-Math.floor(diffInSecs / (60 * 60 * 24 * 365)), 'year');
    }

    function getSSEUser() {
        let user = localStorage.getItem("home_user");
        return user ? JSON.parse(user).id : null
    }

    function setupStyles() {
        const styles = `
            .sspl .player-name {font-size: 1.1rem; font-weight: 700;}
            .sspl .diff.inc {color: #42B129 !important;}
            .sspl .diff.dec {color: #F94022 !important;}
            .sspl thead .diff select, .pagination select.type {font-size: 1rem; font-weight: 700; border: none; color: var(--textColor, black); background-color: var(--background, white); outline: none;}
            table.ranking tbody tr.hidden {opacity: 0.05;}
            .content table.ranking.global.sspl .pp, .content table.ranking.global.sspl .diff {text-align: center;}
            .box .tabs a {border-bottom: none;}
            .box .tabs li:hover {border-bottom: 1px solid black; margin-bottom: -1px;}
            .tabs li.is-active {border-bottom: 1px solid #3273dc; margin-bottom: -1px;}
            img.bloodtrail {height:24px;}
            .sspl .rank small {font-size: .75rem; margin-left: .5rem; color: lightgray;}
            .sspl .rank span {display: inline-block; width: 1.5rem; text-align: right;}
            .text-center {text-align: center;}
            #sspl progress {width: 20rem; max-width: 90%;}
            #ssplrefresh {text-align: right; margin-bottom: 1rem;}
            #ssplrefresh button {margin-right: .5rem;}
            #ssplrefresh strong {margin-right: .5rem;}
            .offset_tab {margin-left: auto;}
        `;

        const addStyles = GM_addStyle ? GM_addStyle : () => {
        };
        addStyles(styles);
    }

    function setupDelayed() {
        if (initialized) {
            return;
        }

        initialized = true;

        if (isLeaderboardPage()) {
            setupLeaderboard();
        }
    }

    let initialized = false;

    async function init() {
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

        // wait a sec for SSE
        setTimeout(setupDelayed, SSE_CHECK_DELAY);
    }

    init();
})();
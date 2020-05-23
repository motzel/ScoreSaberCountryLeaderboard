// ==UserScript==
// @name         ScoreSaber country leaderboard
// @namespace    https://motzel.dev
// @version      0.6.9
// @description  Add country leaderboard tab
// @author       motzel
// @icon         https://scoresaber.com/imports/images/logo.ico
// @updateURL    https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/dist/scoresaber-country-leaderboard.user.js
// @downloadURL  https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/dist/scoresaber-country-leaderboard.user.js
// @supportURL   https://github.com/motzel/ScoreSaberCountryLeaderboard/issues
//
// @match        https://scoresaber.com/leaderboard/*
// @match        https://scoresaber.com/u/*
//
// @include      /^https://scoresaber\.com\/global(\/\d+&country=pl|\?country=pl)/
//
// @require      https://cdnjs.cloudflare.com/ajax/libs/localforage/1.7.3/localforage.min.js
//
// @grant        GM_addStyle
// @grant        GM_info
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

!function(modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: !1,
            exports: {}
        };
        return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), 
        module.l = !0, module.exports;
    }
    __webpack_require__.m = modules, __webpack_require__.c = installedModules, __webpack_require__.d = function(exports, name, getter) {
        __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
            enumerable: !0,
            get: getter
        });
    }, __webpack_require__.r = function(exports) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(exports, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(exports, "__esModule", {
            value: !0
        });
    }, __webpack_require__.t = function(value, mode) {
        if (1 & mode && (value = __webpack_require__(value)), 8 & mode) return value;
        if (4 & mode && "object" == typeof value && value && value.__esModule) return value;
        var ns = Object.create(null);
        if (__webpack_require__.r(ns), Object.defineProperty(ns, "default", {
            enumerable: !0,
            value: value
        }), 2 & mode && "string" != typeof value) for (var key in value) __webpack_require__.d(ns, key, function(key) {
            return value[key];
        }.bind(null, key));
        return ns;
    }, __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? function() {
            return module.default;
        } : function() {
            return module;
        };
        return __webpack_require__.d(getter, "a", getter), getter;
    }, __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    }, __webpack_require__.p = "", __webpack_require__(__webpack_require__.s = 0);
}([ function(module, exports, __webpack_require__) {
    function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key, i, target = function(source, excluded) {
            if (null == source) return {};
            var key, i, target = {}, sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++) key = sourceKeys[i], excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
        }(source, excluded);
        if (Object.getOwnPropertySymbols) {
            var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
            for (i = 0; i < sourceSymbolKeys.length; i++) key = sourceSymbolKeys[i], excluded.indexOf(key) >= 0 || Object.prototype.propertyIsEnumerable.call(source, key) && (target[key] = source[key]);
        }
        return target;
    }
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
        try {
            var info = gen[key](arg), value = info.value;
        } catch (error) {
            return void reject(error);
        }
        info.done ? resolve(value) : Promise.resolve(value).then(_next, _throw);
    }
    function _asyncToGenerator(fn) {
        return function() {
            var self = this, args = arguments;
            return new Promise((function(resolve, reject) {
                var gen = fn.apply(self, args);
                function _next(value) {
                    asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
                }
                function _throw(err) {
                    asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
                }
                _next(void 0);
            }));
        };
    }
    var log = __webpack_require__(1), USERS_URL = "https://scoresaber.com/global/${page}?country=pl", USER_PROFILE_URL = "https://scoresaber.com/u/${userId}", SCORES_URL = "https://new.scoresaber.com/api/player/${userId}/scores/recent/${page}", ADDITIONAL_USER_IDS = [ "76561198967371424", "76561198093469724" ], changeDiff = [ {
        value: 0,
        text: "Daily change"
    }, {
        value: 6,
        text: "Weekly change"
    }, {
        value: 29,
        text: "Monthly change"
    } ], easterEggConditions = [ [ {
        field: "id",
        value: "76561198165064325",
        cond: "==="
    }, {
        field: "percent",
        value: .85,
        cond: "<"
    } ] ], Globals = {
        data: null
    }, isEmpty = obj => 0 === Object.keys(obj).length && obj.constructor === Object, convertArrayToObjectByKey = (arr, key) => arr.reduce((cum, item) => (cum[item[key]] = item, 
    cum), {}), arrayIntersection = (arr1, arr2) => arr1.filter(x => !arr2.includes(x)), nullIfUndefined = val => void 0 !== val ? val : null, defaultIfFalsy = (val, def) => val || def, substituteVars = (url, vars) => Object.keys(vars).reduce((cum, key) => cum.replace(new RegExp("\\${" + key + "}", "gi"), vars[key]), url), dateFromString = str => str ? new Date(Date.parse(str)) : null, getFirstRegexpMatch = (regexp, str) => {
        var _ = regexp.exec(str);
        return _ ? _[1] : null;
    }, getMaxScore = function(blocks) {
        var maxScorePerBlock = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 115;
        return Math.floor((blocks >= 14 ? 8 * maxScorePerBlock * (blocks - 13) : 0) + (blocks >= 6 ? 4 * maxScorePerBlock * (Math.min(blocks, 13) - 5) : 0) + (blocks >= 2 ? 2 * maxScorePerBlock * (Math.min(blocks, 5) - 1) : 0) + Math.min(blocks, 1) * maxScorePerBlock);
    }, getTotalPp = scores => Object.values(scores).filter(s => s.pp > 0).map(s => s.pp).sort((a, b) => b - a).reduce((cum, pp, idx) => cum + Math.pow(.965, idx) * pp, 0), getTotalUserPp = function() {
        var _ref = _asyncToGenerator((function*(userId) {
            var _yield$getCacheAndCon, _yield$getCacheAndCon2, modifiedScores = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            return getTotalPp(Object.assign({}, null === (_yield$getCacheAndCon = (yield getCacheAndConvertIfNeeded()).users) || void 0 === _yield$getCacheAndCon || null === (_yield$getCacheAndCon2 = _yield$getCacheAndCon[userId]) || void 0 === _yield$getCacheAndCon2 ? void 0 : _yield$getCacheAndCon2.scores, modifiedScores));
        }));
        return function(_x) {
            return _ref.apply(this, arguments);
        };
    }(), getWhatIfScore = function() {
        var _ref2 = _asyncToGenerator((function*(userId, leaderboardId, pp) {
            var currentTotalPp = yield getTotalUserPp(userId), newTotalPp = yield getTotalUserPp(userId, {
                [leaderboardId]: {
                    pp: pp
                }
            });
            return {
                currentTotalPp: currentTotalPp,
                newTotalPp: newTotalPp,
                diff: newTotalPp - currentTotalPp
            };
        }));
        return function(_x2, _x3, _x4) {
            return _ref2.apply(this, arguments);
        };
    }(), getFlag = name => {
        var _Globals$data, _Globals$data$flags;
        return null === (_Globals$data = Globals.data) || void 0 === _Globals$data || null === (_Globals$data$flags = _Globals$data.flags) || void 0 === _Globals$data$flags ? void 0 : _Globals$data$flags[name];
    }, getLeaderboardId = () => getFirstRegexpMatch(/\/leaderboard\/(\d+)($|\?page=.*)/, window.location.href.toLowerCase()), getSongHash = () => {
        var _document$querySelect;
        return null === (_document$querySelect = document.querySelector(".title~b")) || void 0 === _document$querySelect ? void 0 : _document$querySelect.innerText;
    }, getProfileId = () => getFirstRegexpMatch(/\u\/(\d+)((\?|&).*)?$/, window.location.href.toLowerCase()), isProfilePage = () => null !== getProfileId(), isCountryRankingPage = () => [ "https://scoresaber.com/global?country=pl", "https://scoresaber.com/global/1&country=pl" ].indexOf(window.location.href) >= 0, fetchHtmlPage = function() {
        var _ref4 = _asyncToGenerator((function*(url) {
            var page = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1;
            return (new DOMParser).parseFromString(yield (yield fetch(substituteVars(url, {
                page: page
            }))).text(), "text/html");
        }));
        return function(_x5) {
            return _ref4.apply(this, arguments);
        };
    }(), fetchApiPage = function() {
        var _ref5 = _asyncToGenerator((function*(url) {
            var page = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1;
            return fetch(substituteVars(url, {
                page: page
            })).then(r => r.json()).catch(e => null);
        }));
        return function(_x6) {
            return _ref5.apply(this, arguments);
        };
    }(), fetchSongByHash = function() {
        var _ref6 = _asyncToGenerator((function*(songHash) {
            return yield fetchApiPage(substituteVars("https://beatsaver.com/api/maps/by-hash/${songHash}", {
                songHash: songHash
            }));
        }));
        return function(_x7) {
            return _ref6.apply(this, arguments);
        };
    }(), fetchPlayerInfo = function() {
        var _ref7 = _asyncToGenerator((function*(userId) {
            return yield fetchApiPage(substituteVars("https://new.scoresaber.com/api/player/${userId}/full", {
                userId: userId
            }));
        }));
        return function(_x8) {
            return _ref7.apply(this, arguments);
        };
    }(), getUserIds = function() {
        var _ref8 = _asyncToGenerator((function*() {
            var page = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1;
            return (yield Promise.all(Array.prototype.map.call((yield fetchHtmlPage(USERS_URL, page)).querySelectorAll(".ranking.global .player a"), function() {
                var _ref9 = _asyncToGenerator((function*(a) {
                    return getFirstRegexpMatch(/\/(\d+)$/, a.href);
                }));
                return function(_x9) {
                    return _ref9.apply(this, arguments);
                };
            }()))).concat(ADDITIONAL_USER_IDS);
        }));
        return function() {
            return _ref8.apply(this, arguments);
        };
    }(), fetchUsers = function() {
        var _ref10 = _asyncToGenerator((function*() {
            var page = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1;
            return Promise.all(Array.prototype.map.call(yield getUserIds(page), function() {
                var _ref11 = _asyncToGenerator((function*(userId) {
                    var info = yield fetchPlayerInfo(userId), _info$playerInfo = info.playerInfo, {name: name, playerid: playerid, role: role, badges: badges, banned: banned, inactive: inactive} = _info$playerInfo, playerInfo = _objectWithoutProperties(_info$playerInfo, [ "name", "playerid", "role", "badges", "banned", "inactive" ]);
                    return playerInfo.history = playerInfo.history ? playerInfo.history.split(",").map(rank => {
                        var i = parseInt(rank, 10);
                        return isNaN(i) ? null : i;
                    }).reverse() : null, Object.assign({
                        id: playerid,
                        name: name,
                        url: substituteVars(USER_PROFILE_URL, {
                            userId: playerid
                        }),
                        lastUpdated: null,
                        scores: {}
                    }, playerInfo, {
                        stats: info.scoreStats
                    });
                }));
                return function(_x10) {
                    return _ref11.apply(this, arguments);
                };
            }()));
        }));
        return function() {
            return _ref10.apply(this, arguments);
        };
    }(), fetchScores = function() {
        var _ref12 = _asyncToGenerator((function*(userId) {
            for (var page = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1, _len = arguments.length, leaderboards = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) leaderboards[_key - 2] = arguments[_key];
            return fetchApiPage(substituteVars(SCORES_URL, {
                userId: userId
            }), page).then(s => s && s.scores ? s.scores.filter(s => !leaderboards.length || leaderboards.includes(s.leaderboardId)) : null);
        }));
        return function(_x11) {
            return _ref12.apply(this, arguments);
        };
    }(), fetchRankedSongsArray = function() {
        var _ref13 = _asyncToGenerator((function*() {
            return fetchApiPage("https://scoresaber.com/api.php?function=get-leaderboards&cat=1&page=1&limit=5000&ranked=1").then(songs => (null == songs ? void 0 : songs.songs) ? null == songs ? void 0 : songs.songs.map(s => ({
                leaderboardId: s.uid,
                id: s.id,
                name: s.name + " " + s.songSubName,
                songAuthor: s.songAuthorName,
                levelAuthor: s.levelAuthorName,
                diff: extractDiffAndType(s.diff),
                stars: s.stars,
                oldStars: null
            })) : []);
        }));
        return function() {
            return _ref13.apply(this, arguments);
        };
    }(), convertFetchedRankedSongsToObj = songs => songs.length ? songs.reduce((cum, s) => (cum[s.leaderboardId] = s, 
    cum), {}) : null, fetchRankedSongs = function() {
        var _ref14 = _asyncToGenerator((function*() {
            return convertFetchedRankedSongsToObj(yield fetchRankedSongsArray());
        }));
        return function() {
            return _ref14.apply(this, arguments);
        };
    }();
    function getNewlyRanked() {
        return _getNewlyRanked.apply(this, arguments);
    }
    function _getNewlyRanked() {
        return (_getNewlyRanked = _asyncToGenerator((function*() {
            var fetchedRankedSongs = yield fetchRankedSongs();
            if (!fetchedRankedSongs) return null;
            var oldRankedSongs = Globals.data.rankedSongs;
            return {
                newRanked: arrayIntersection(Object.keys(fetchedRankedSongs), Object.keys(oldRankedSongs)).map(k => fetchedRankedSongs[k]),
                changed: Object.values(oldRankedSongs).filter(s => {
                    var _fetchedRankedSongs$s;
                    return s.stars !== (null == fetchedRankedSongs || null === (_fetchedRankedSongs$s = fetchedRankedSongs[s.leaderboardId]) || void 0 === _fetchedRankedSongs$s ? void 0 : _fetchedRankedSongs$s.stars);
                }).map(s => {
                    var _fetchedRankedSongs$s2;
                    return Object.assign({}, s, {
                        oldStars: s.stars,
                        stars: nullIfUndefined(null == fetchedRankedSongs || null === (_fetchedRankedSongs$s2 = fetchedRankedSongs[s.leaderboardId]) || void 0 === _fetchedRankedSongs$s2 ? void 0 : _fetchedRankedSongs$s2.stars)
                    });
                })
            };
        }))).apply(this, arguments);
    }
    function _updateNewRankedsPpScores() {
        return (_updateNewRankedsPpScores = _asyncToGenerator((function*() {
            var progressCallback = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null, data = yield getCacheAndConvertIfNeeded(), ssplHeader = document.querySelector("#sspl_progress_head");
            if (ssplHeader && (ssplHeader.innerHTML = "Aktualizacja wyników nowych rankedów"), 
            (new Date).getTime() - dateFromString(Globals.data.lastUpdated).getTime() > 6e4) return console.error("Please update song data first"), 
            null;
            var newlyRanked = yield getNewlyRanked();
            if (!newlyRanked) return null;
            var leaderboardsToUpdate = newlyRanked.newRanked.map(s => s.leaderboardId).concat(newlyRanked.changed.map(s => s.leaderboardId)), users = data.users, usersToUpdate = Object.values(users).reduce((cum, u) => {
                var userScoresToUpdate = Object.values(u.scores).map(s => ({
                    leaderboardId: s.leaderboardId,
                    timeset: dateFromString(s.timeset)
                })).sort((a, b) => b.timeset.getTime() - a.timeset.getTime()).reduce((scum, s, idx) => {
                    if (leaderboardsToUpdate.includes(s.leaderboardId)) {
                        var _page = Math.floor(idx / 8) + 1;
                        scum[_page] = defaultIfFalsy(null == scum ? void 0 : scum[_page], []).concat([ s.leaderboardId ]);
                    }
                    return scum;
                }, {});
                return isEmpty(userScoresToUpdate) || (cum[u.id] = userScoresToUpdate), cum;
            }, {}), totalPages = Object.values(usersToUpdate).reduce((sum, u) => sum + Object.keys(u).length, 0), idxGlobal = 0;
            for (var userId in usersToUpdate) {
                var idxLocal = 0;
                for (var page in usersToUpdate[userId]) {
                    var scores = convertArrayToObjectByKey(yield fetchScores(userId, page, ...usersToUpdate[userId][page]), "leaderboardId");
                    users[userId].scores = Object.assign({}, users[userId].scores, scores), progressCallback && progressCallback({
                        id: userId,
                        name: users[userId].name,
                        page: idxLocal + 1,
                        percent: Math.floor(idxGlobal / totalPages * 100)
                    }), idxLocal++, idxGlobal++;
                }
            }
            return data.rankedSongs = Object.assign({}, data.rankedSongs, convertArrayToObjectByKey(newlyRanked.newRanked, "leaderboardId"), convertArrayToObjectByKey(newlyRanked.changed, "leaderboardId")), 
            data.rankedSongsLastUpdated = JSON.parse(JSON.stringify(new Date)), setCache(data), 
            newlyRanked;
        }))).apply(this, arguments);
    }
    function fetchAllNewScores(_x12) {
        return _fetchAllNewScores.apply(this, arguments);
    }
    function _fetchAllNewScores() {
        return (_fetchAllNewScores = _asyncToGenerator((function*(user) {
            for (var lastUpdated = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null, progressCallback = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null, allScores = {
                lastUpdated: lastUpdated,
                scores: {}
            }, page = 0, recentPlay = null; ++page; ) {
                progressCallback && progressCallback({
                    id: user.id,
                    name: user.name,
                    page: page,
                    total: null
                });
                var scorePage = yield fetchScores(user.id, page);
                if (!scorePage) break;
                for (var i in 1 === page && scorePage.length && (recentPlay = dateFromString(scorePage[0].timeset)), 
                scorePage) {
                    if (lastUpdated && dateFromString(scorePage[i].timeset) <= lastUpdated) return recentPlay && (allScores.lastUpdated = recentPlay), 
                    allScores;
                    allScores.scores[scorePage[i].leaderboardId] = scorePage[i];
                }
                if (recentPlay && (allScores.lastUpdated = recentPlay), scorePage.length < 8) break;
            }
            return allScores.lastUpdated = recentPlay, allScores;
        }))).apply(this, arguments);
    }
    function isAnyData() {
        return Globals.data && Object.keys(Globals.data.users).length;
    }
    function getCache() {
        return _getCache.apply(this, arguments);
    }
    function _getCache() {
        return (_getCache = _asyncToGenerator((function*() {
            return new Promise((resolve, reject) => localforage.getItem("sspl_users", (function(err, value) {
                resolve(value);
            })));
        }))).apply(this, arguments);
    }
    function setCache(_x13) {
        return _setCache.apply(this, arguments);
    }
    function _setCache() {
        return (_setCache = _asyncToGenerator((function*(value) {
            return Globals.data = value, localforage.setItem("sspl_users", value), value;
        }))).apply(this, arguments);
    }
    function getCacheAndConvertIfNeeded() {
        return _getCacheAndConvertIfNeeded.apply(this, arguments);
    }
    function _getCacheAndConvertIfNeeded() {
        return (_getCacheAndConvertIfNeeded = _asyncToGenerator((function*() {
            var _yield$getCache, _Object$values, _Object$values$, _Object$values$$histo;
            if (Globals.data) return Globals.data;
            var cache = null !== (_yield$getCache = yield getCache()) && void 0 !== _yield$getCache ? _yield$getCache : {
                version: 1.1,
                lastUpdated: null,
                users: {},
                rankedSongs: null,
                rankedSongsLastUpdated: null
            }, flags = {
                rankHistoryAvailable: !1,
                rankedSongsAvailable: !1
            };
            if ((null === (_Object$values = Object.values(null == cache ? void 0 : cache.users)) || void 0 === _Object$values || null === (_Object$values$ = _Object$values[0]) || void 0 === _Object$values$ || null === (_Object$values$$histo = _Object$values$.history) || void 0 === _Object$values$$histo ? void 0 : _Object$values$$histo.length) && (flags.rankHistoryAvailable = !0), 
            1 === cache.version) {
                var allRankeds = yield fetchRankedSongsArray(), nanomoriApproached = !1;
                cache.rankedSongs = convertFetchedRankedSongsToObj(allRankeds.filter(s => (221711 === s.leaderboardId && (nanomoriApproached = !0), 
                nanomoriApproached))), cache.version = 1.1, cache.rankedSongsLastUpdated = JSON.parse(JSON.stringify(new Date)), 
                flags.rankedSongsAvailable = !1;
            } else flags.rankedSongsAvailable = !0;
            return Globals.data = Object.assign(cache, {
                flags: flags
            }), cache;
        }))).apply(this, arguments);
    }
    function extractDiffAndType(ssDiff) {
        var _match$, match = /^_([^_]+)_Solo(.*)$/.exec(ssDiff);
        return match ? {
            diff: match[1].toLowerCase().replace("plus", "Plus"),
            type: null !== (_match$ = match[2]) && void 0 !== _match$ ? _match$ : "Standard"
        } : null;
    }
    function findDiffInfo(characteristics, ssDiff) {
        if (!characteristics) return null;
        var diffAndType = extractDiffAndType(ssDiff);
        return diffAndType ? characteristics.reduce((cum, ch) => {
            var _ch$difficulties;
            return ch.name === diffAndType.type ? null === (_ch$difficulties = ch.difficulties) || void 0 === _ch$difficulties ? void 0 : _ch$difficulties[diffAndType.diff] : cum;
        }, null) : null;
    }
    function getLeaderboard(_x14) {
        return _getLeaderboard.apply(this, arguments);
    }
    function _getLeaderboard() {
        return (_getLeaderboard = _asyncToGenerator((function*(leadId) {
            var _getSongHash, _songInfo$metadata, data = yield getCacheAndConvertIfNeeded(), songHash = null !== (_getSongHash = getSongHash()) && void 0 !== _getSongHash ? _getSongHash : null, songInfo = songHash ? yield fetchSongByHash(songHash) : null, songCharacteristics = null == songInfo || null === (_songInfo$metadata = songInfo.metadata) || void 0 === _songInfo$metadata ? void 0 : _songInfo$metadata.characteristics, diffInfo = null, maxSongScore = 0;
            return Object.keys(data.users).reduce((cum, userId) => {
                if (!data.users[userId].scores[leadId]) return cum;
                var _diffInfo, _diffInfo2;
                maxSongScore || cum.length || (diffInfo = findDiffInfo(songCharacteristics, data.users[userId].scores[leadId].diff), 
                maxSongScore = (null === (_diffInfo = diffInfo) || void 0 === _diffInfo ? void 0 : _diffInfo.length) && (null === (_diffInfo2 = diffInfo) || void 0 === _diffInfo2 ? void 0 : _diffInfo2.notes) ? getMaxScore(diffInfo.notes) : 0);
                var _data$users$userId = data.users[userId], {scores: scores} = _data$users$userId, user = _objectWithoutProperties(_data$users$userId, [ "scores" ]), _data$users$userId$sc = data.users[userId].scores[leadId], {score: score, timeset: timeset, rank: rank, mods: mods, pp: pp, maxScoreEx: maxScoreEx, diff: diff} = _data$users$userId$sc;
                _objectWithoutProperties(_data$users$userId$sc, [ "score", "timeset", "rank", "mods", "pp", "maxScoreEx", "diff" ]);
                return cum.push(Object.assign({}, user, {
                    score: score,
                    timeset: timeset,
                    rank: rank,
                    mods: mods,
                    pp: pp,
                    percent: maxSongScore ? score / maxSongScore : maxScoreEx ? score / maxScoreEx : null
                })), cum;
            }, []).sort((a, b) => b.score - a.score);
        }))).apply(this, arguments);
    }
    function assert(el) {
        if (null === el) throw new Error("Assertion failed");
        return el;
    }
    function getBySelector(sel) {
        var el = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
        return assert((null != el ? el : document).querySelector(sel));
    }
    function setupPlTable() {
        var scoreTableNode = getBySelector(".ranking table.global"), clonedTable = document.querySelector(".ranking table.sspl");
        clonedTable || (clonedTable = scoreTableNode.cloneNode(!0)), clonedTable.classList.remove("global"), 
        clonedTable.classList.add("sspl"), getBySelector("tbody", clonedTable).innerHTML = "";
        var clonedTableHead = getBySelector("thead", clonedTable);
        getBySelector(".rank", clonedTableHead).innerHTML = "Miejsce", getBySelector(".player", clonedTableHead).innerHTML = "Gracz", 
        getBySelector(".score", clonedTableHead).innerHTML = "Wynik", getBySelector(".timeset", clonedTableHead).innerHTML = "Czas", 
        getBySelector(".mods", clonedTableHead).innerHTML = "Mody", getBySelector(".percentage", clonedTableHead).innerHTML = "Procent";
        var sspl = create("div", {
            id: "sspl"
        }, "");
        sspl.style.display = "none", scoreTableNode.parentElement.appendChild(sspl);
        var refreshDiv = create("div", {
            id: "ssplrefresh"
        }, "");
        refreshDiv.appendChild(create("button", {
            title: "Odśwież",
            onclick: e => {
                refreshDiv.appendChild(create("div", {
                    id: "sspl_progress_cont"
                }, create("header", {
                    id: "sspl_progress_head"
                }, ""), create("progress", {
                    id: "sspl_progress",
                    value: 0,
                    max: 100
                }, "0"), create("div", {
                    id: "sspl_progress_info"
                }, ""))), e.target.disabled = !0, refresh().then(_ => function() {
                    return _updateNewRankedsPpScores.apply(this, arguments);
                }(updateProgress)).then(rankeds => function(info) {
                    var _document$getElementB;
                    if (!Globals.data.flags.rankedSongsAvailable) return;
                    null === (_document$getElementB = document.getElementById("new-rankeds")) || void 0 === _document$getElementB || _document$getElementB.remove();
                    var allChanges = info.newRanked.concat(info.changed);
                    if (!allChanges.length) return;
                    var container = getBySelector("#sspl"), ssplTable = getBySelector("#sspl table.ranking"), newRankedsTbody = create("tbody", {}, ""), newRankedsTbl = create("table", {
                        id: "new-rankeds"
                    }, create("thead", {}, create("tr", {}, create("th", {}, "Nuta"), create("th", {}, "Mapper"), create("th", {}, "Trudność"), create("th", {}, "PP"), create("th", {}, "*"), create("th", {}, "Stare *"))), newRankedsTbody), sseUserId = getSSEUser();
                    allChanges.sort((a, b) => b.stars - a.stars).map(m => {
                        var _Globals$data2, _Globals$data2$users, _Globals$data2$users$, _Globals$data2$users$2, diffInfo, span, col, r;
                        return newRankedsTbody.appendChild((r = Object.assign({}, m, {
                            pp: null === (_Globals$data2 = Globals.data) || void 0 === _Globals$data2 || null === (_Globals$data2$users = _Globals$data2.users) || void 0 === _Globals$data2$users || null === (_Globals$data2$users$ = _Globals$data2$users[sseUserId].scores) || void 0 === _Globals$data2$users$ || null === (_Globals$data2$users$2 = _Globals$data2$users$[m.leaderboardId]) || void 0 === _Globals$data2$users$2 ? void 0 : _Globals$data2$users$2.pp
                        }), create("tr", {}, create("td", {}, create("a", {
                            href: "https://scoresaber.com/leaderboard/" + encodeURIComponent(r.leaderboardId)
                        }, r.songAuthor + " - " + r.name)), create("td", {}, r.levelAuthor), create("td", {}, (diffInfo = r.diff, 
                        span = create("span", {}, function(diffInfo) {
                            return (str = diffInfo.diff, str.charAt(0).toUpperCase() + str.slice(1)).replace("ExpertPlus", "Expert+") + ("Standard" !== diffInfo.type ? "/" + diffInfo.type : "");
                            var str;
                        }(diffInfo)), (col = function(diffInfo) {
                            var colors = {
                                easy: "MediumSeaGreen",
                                normal: "#59b0f4",
                                hard: "tomato",
                                expert: "#bf2a42",
                                expertPlus: "#8f48db"
                            };
                            return colors[diffInfo.diff] ? colors[diffInfo.diff] : null;
                        }(diffInfo)) && (span.style.color = col), span)), create("td", {}, create("span", {
                            class: "scoreTop ppValue"
                        }, formatNumberWithSuffix(r.pp, "pp"))), newTdWithNumber(r.stars, "*"), newTdWithNumber(r.oldStars, "*"))));
                    }), container.insertBefore(create("h3", {}, "Nowe/zmienione rankedy"), ssplTable), 
                    container.insertBefore(newRankedsTbl, ssplTable);
                }(rankeds)).then(_ => {
                    getBySelector("#sspl_progress_cont").remove(), e.target.disabled = !1, fillLeaderboard();
                });
            }
        }, "↻")), refreshDiv.appendChild(create("strong", {}, " Data pobrania:")), refreshDiv.appendChild(create("span", {}, "-")), 
        sspl.appendChild(refreshDiv), sspl.appendChild(clonedTable), sspl.appendChild(create("div", {
            class: "ssplcont text-center"
        }, ""));
    }
    function shouldBeHidden(u) {
        return easterEggConditions.reduce((ret, conditions) => ret || conditions.reduce((subret, cond) => {
            var userFieldValue = null == u ? void 0 : u[null == cond ? void 0 : cond.field], currentConditionFulfilled = !0;
            switch (null == cond ? void 0 : cond.cond) {
              case "===":
                currentConditionFulfilled = userFieldValue === (null == cond ? void 0 : cond.value);
                break;

              case "<":
                currentConditionFulfilled = userFieldValue < (null == cond ? void 0 : cond.value);
                break;

              case ">":
                currentConditionFulfilled = userFieldValue > (null == cond ? void 0 : cond.value);
                break;

              default:
                console.error("Unknown condition: ", null == cond ? void 0 : cond.cond), currentConditionFulfilled = !1;
            }
            return subret && currentConditionFulfilled;
        }, !0), !1);
    }
    function formatNumberWithSuffix(num, suffix) {
        return (num ? formatNumber(num) : "-") + (num && suffix ? suffix : "");
    }
    function newTdWithNumber(num, suffix) {
        return create("td", {}, formatNumberWithSuffix(num, suffix));
    }
    function fillLeaderboard() {
        return _fillLeaderboard.apply(this, arguments);
    }
    function _fillLeaderboard() {
        return (_fillLeaderboard = _asyncToGenerator((function*() {
            var leaderboardId = getLeaderboardId(), leaderboard = yield getLeaderboard(leaderboardId), container = getBySelector(".ranking.global .ssplcont"), ssplTable = getBySelector("#sspl table.ranking"), ssplTableBody = getBySelector("tbody", ssplTable);
            if (container.innerHTML = "", ssplTableBody.innerHTML = "", null == leaderboard ? void 0 : leaderboard.length) {
                var sseUserId = getSSEUser(), idx = 1;
                leaderboard.map(u => {
                    var row = generate_song_table_row(u, leaderboardId, idx++, shouldBeHidden(u) ? "hidden" : "");
                    u.id === sseUserId && (row.style = "background-color: var(--color-highlight);"), 
                    ssplTableBody.appendChild(row);
                }), ssplTable.style.display = "";
            } else ssplTable.style.display = "none", container.appendChild(create("h3", {}, "Strasznie tu pusto..."));
            if (isAnyData()) {
                var _refresh2 = getBySelector("#ssplrefresh");
                _refresh2.style.display = "", getBySelector("span", _refresh2).innerText = formatDate(Globals.data.lastUpdated);
            } else {
                var firstFetch = create("div", {}, "");
                firstFetch.appendChild(create("p", {}, "Wygląda na to, że nie ma jeszcze żadnych danych.")), 
                firstFetch.appendChild(create("p", {}, "Usiądź sobie wygodnie, otwórz harnasia, kliknij Pobierz i poczekaj, bo trochę to potrwa...")), 
                firstFetch.appendChild(create("button", {
                    onclick: e => {
                        e.target.disabled = !0, refresh().then(_ => {
                            firstFetch.remove(), fillLeaderboard();
                        });
                    }
                }, "Pobierz")), firstFetch.appendChild(create("div", {}, create("progress", {
                    id: "sspl_progress",
                    value: 0,
                    max: 100
                }, "0"), create("div", {
                    id: "sspl_progress_info"
                }, ""))), container.appendChild(firstFetch), getBySelector("#ssplrefresh").style.display = "none";
            }
        }))).apply(this, arguments);
    }
    function _setupLeaderboard() {
        return (_setupLeaderboard = _asyncToGenerator((function*() {
            var leadId = getLeaderboardId();
            if (leadId) {
                getBySelector(".tabs > ul").appendChild(generate_tab("pl_tab", !1, null === document.querySelector(".filter_tab"))), 
                setupPlTable(), yield fillLeaderboard();
                var sseUserId = getSSEUser();
                if (sseUserId) {
                    var scoreSpans = document.querySelectorAll(".scoreTop.ppValue");
                    [].forEach.call(scoreSpans, function() {
                        var _ref15 = _asyncToGenerator((function*(span) {
                            var pp = parseFloat(span.innerText.replace(/\s/, "").replace(",", "."));
                            pp && pp > 0 + Number.EPSILON && span.parentNode.appendChild(yield createWhatIfPpButton(sseUserId, leadId, pp));
                        }));
                        return function(_x20) {
                            return _ref15.apply(this, arguments);
                        };
                    }());
                }
                document.addEventListener("click", (function(e) {
                    var clickedTab = e.target.closest(".filter_tab");
                    if (clickedTab) {
                        var box = assert(e.target.closest(".box")), sspl = getBySelector("#sspl", box), originalTable = getBySelector("table.ranking", box);
                        clickedTab.classList.contains("sspl") ? (originalTable.style.display = "none", sspl.style.display = "", 
                        getBySelector(".pagination").style.display = "none") : (originalTable.style.display = "", 
                        sspl.style.display = "none", getBySelector(".pagination").style.display = "");
                    }
                }), {
                    passive: !0
                });
            }
        }))).apply(this, arguments);
    }
    function createWhatIfPpButton(_x15, _x16, _x17) {
        return _createWhatIfPpButton.apply(this, arguments);
    }
    function _createWhatIfPpButton() {
        return (_createWhatIfPpButton = _asyncToGenerator((function*(userId, leaderboardId, pp) {
            var whatIfPp = yield getWhatIfScore(userId, leaderboardId, pp);
            return create("button", {
                class: "what-if",
                title: "Jeśli tak zagrasz: \n" + formatNumber(whatIfPp.currentTotalPp) + formatNumber(whatIfPp.diff, 2, !0) + "=" + formatNumber(whatIfPp.newTotalPp) + "pp"
            }, "?");
        }))).apply(this, arguments);
    }
    function setupProfile() {
        return _setupProfile.apply(this, arguments);
    }
    function _setupProfile() {
        return (_setupProfile = _asyncToGenerator((function*() {
            var profileId = getProfileId();
            if (profileId) {
                var data = yield getCacheAndConvertIfNeeded(), sseUserId = getSSEUser(), scoreSpans = document.querySelectorAll(".score .scoreBottom");
                [].forEach.call(scoreSpans, function() {
                    var _ref16 = _asyncToGenerator((function*(span) {
                        var songLink = span.closest("tr").querySelector(".song a");
                        if (songLink) {
                            var leaderboardId = getFirstRegexpMatch(/\/leaderboard\/(\d+$)/, songLink.href);
                            if (leaderboardId) {
                                var _data$users, _data$users$profileId, _data$users$profileId2, leaderboard = null === (_data$users = data.users) || void 0 === _data$users || null === (_data$users$profileId = _data$users[profileId]) || void 0 === _data$users$profileId || null === (_data$users$profileId2 = _data$users$profileId.scores) || void 0 === _data$users$profileId2 ? void 0 : _data$users$profileId2[leaderboardId];
                                if (leaderboard) try {
                                    var _songInfo$metadata2, songInfo = yield fetchSongByHash(leaderboard.id), diffInfo = findDiffInfo(null == songInfo || null === (_songInfo$metadata2 = songInfo.metadata) || void 0 === _songInfo$metadata2 ? void 0 : _songInfo$metadata2.characteristics, leaderboard.diff), maxSongScore = (null == diffInfo ? void 0 : diffInfo.length) && (null == diffInfo ? void 0 : diffInfo.notes) ? getMaxScore(diffInfo.notes) : 0, percent = maxSongScore ? leaderboard.score / maxSongScore : maxScoreEx ? leaderboard.score / maxScoreEx : null;
                                    shouldBeHidden(Object.assign({}, leaderboard, {
                                        id: leaderboard.playerId,
                                        percent: percent
                                    })) && songLink.closest("tr").classList.add("hidden"), span.innerHTML = "score: " + formatNumber(leaderboard.score, 0) + (percent ? "<br />accuracy: " + formatNumber(100 * percent, 2) + "%" : "") + (leaderboard.mods.length ? "<br />(" + leaderboard.mods + ")" : "");
                                } catch (e) {}
                                if (sseUserId) {
                                    var _span$parentNode$quer, pp = parseFloat(null === (_span$parentNode$quer = span.parentNode.querySelector(".scoreTop.ppValue")) || void 0 === _span$parentNode$quer ? void 0 : _span$parentNode$quer.innerText);
                                    pp && pp > 0 + Number.EPSILON && span.parentNode.appendChild(yield createWhatIfPpButton(sseUserId, leaderboardId, pp));
                                }
                            }
                        }
                    }));
                    return function(_x21) {
                        return _ref16.apply(this, arguments);
                    };
                }());
                var stats = document.querySelector(".content .column ul");
                if (stats) {
                    var _data$users2, _data$users2$profileI, _data$users3;
                    (null === (_data$users2 = data.users) || void 0 === _data$users2 || null === (_data$users2$profileI = _data$users2[profileId]) || void 0 === _data$users2$profileI ? void 0 : _data$users2$profileI.stats) && stats && (stats.appendChild(create("li", {}, create("strong", {}, "Ranked play count: "), create("span", {}, formatNumber(data.users[profileId].stats.rankedPlayCount, 0)))), 
                    stats.appendChild(create("li", {}, create("strong", {}, "Total ranked score: "), create("span", {}, formatNumber(data.users[profileId].stats.totalRankedScore, 0)))), 
                    stats.appendChild(create("li", {}, create("strong", {}, "Ranked accuracy: "), create("span", {}, formatNumber(data.users[profileId].stats.averageRankedAccuracy, 2).toString() + "%"))));
                    var userScores = Object.values(null === (_data$users3 = data.users) || void 0 === _data$users3 ? void 0 : _data$users3[profileId].scores).filter(s => s.pp > 0).map(s => s.pp).sort((a, b) => b - a), rawPp = yield findRawPp(userScores, 1);
                    stats.appendChild(create("li", {}, create("strong", {}, "+"), create("input", {
                        id: "pp-boundary",
                        value: formatNumber(1)
                    }, "boundary: "), create("strong", {}, "pp: "), create("span", {
                        id: "pp-boundary-value"
                    }, formatNumber(rawPp)), create("span", {}, " raw pp new play"))), document.getElementById("pp-boundary").addEventListener("keyup", function() {
                        var _ref17 = _asyncToGenerator((function*(e) {
                            var result = document.getElementById("pp-boundary-value");
                            if (result) {
                                var val = e.target.value;
                                /^\s*\d+((,|.)\d+)?$/.test(val) ? result.innerHTML = formatNumber(yield findRawPp(userScores, parseFloat(val.replace(/\s/, "").replace(",", ".")))) : result.innerHTML = "???";
                            }
                        }));
                        return function(_x22) {
                            return _ref17.apply(this, arguments);
                        };
                    }());
                }
            }
        }))).apply(this, arguments);
    }
    function generateRankingRow(u) {
        var _u$weeklyChange;
        return create("tr", {}, create("td", {
            class: "rank"
        }, create("span", {}, "#" + u.idx), create("small", {}, create("a", {
            href: "/global/" + encodeURIComponent(Math.ceil(u.rank / 50))
        }, "#" + u.rank))), create("td", {
            class: "player"
        }, generate_song_table_player(u)), create("td", {
            class: "pp"
        }, create("span", {
            class: "scoreTop ppValue"
        }, formatNumber(u.pp, 2)), create("span", {
            class: "scoreTop ppLabel"
        }, "pp")), create("td", {
            class: "diff " + (u.weeklyChange ? u.weeklyChange > 0 ? "inc" : "dec" : "")
        }, formatNumber(null !== (_u$weeklyChange = u.weeklyChange) && void 0 !== _u$weeklyChange ? _u$weeklyChange : 0, 0, !0)));
    }
    function fillCountryRanking() {
        return _fillCountryRanking.apply(this, arguments);
    }
    function _fillCountryRanking() {
        return (_fillCountryRanking = _asyncToGenerator((function*() {
            var _yield$getCacheAndCon4, _document$querySelect2, diffOffset = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 6, tblBody = getBySelector("table.ranking.global.sspl tbody"), users = null === (_yield$getCacheAndCon4 = yield getCacheAndConvertIfNeeded()) || void 0 === _yield$getCacheAndCon4 ? void 0 : _yield$getCacheAndCon4.users;
            if (users) {
                var ranking = Object.keys(users).reduce((cum, userId) => {
                    var {id: id, name: name, country: country, pp: pp, rank: rank, history: history} = users[userId];
                    return cum.push({
                        id: id,
                        name: name,
                        country: country,
                        pp: pp,
                        rank: rank,
                        history: history,
                        weeklyChange: rank && (null == history ? void 0 : history[diffOffset]) && 999999 !== rank && 999999 !== (null == history ? void 0 : history[diffOffset]) ? history[diffOffset] - rank : null
                    }), cum;
                }, []).sort((a, b) => b.pp - a.pp).slice(0, 50);
                tblBody.innerHTML = "", null === (_document$querySelect2 = document.querySelector("table.ranking.global.sspl thead .picture")) || void 0 === _document$querySelect2 || _document$querySelect2.remove();
                var idx = 1, sseUserId = getSSEUser();
                ranking.forEach(u => {
                    var row = generateRankingRow(Object.assign({}, u, {
                        idx: idx
                    }));
                    u.id === sseUserId && (row.style = "background-color: var(--color-highlight);"), 
                    tblBody.appendChild(row), idx++;
                });
            }
        }))).apply(this, arguments);
    }
    function setupCountryRanking() {
        return _setupCountryRanking.apply(this, arguments);
    }
    function _setupCountryRanking() {
        return (_setupCountryRanking = _asyncToGenerator((function*() {
            var diffOffset = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 6;
            if (getFlag("rankHistoryAvailable")) {
                var origTable = getBySelector("table.ranking.global"), clonedTable = origTable.cloneNode(!0), pagination = getBySelector(".pagination", origTable.parentNode.parentNode), typeSel = create("select", {
                    class: "type"
                }, "");
                [ {
                    value: "sspl",
                    text: "Cached"
                }, {
                    value: "original",
                    text: "Original"
                } ].map(o => typeSel.appendChild(create("option", {
                    value: o.value,
                    selected: "sspl" === o.value
                }, o.text))), pagination.insertBefore(typeSel, getBySelector("br", pagination)), 
                typeSel.addEventListener("change", e => Array.prototype.slice.apply(e.target.closest(".box").querySelectorAll("table.ranking.global")).map(tbl => tbl.style.display = tbl.classList.contains(e.target.options[e.target.selectedIndex].value) ? "" : "none")), 
                clonedTable.classList.add("sspl"), origTable.style.display = "none", origTable.classList.add("original"), 
                origTable.parentNode.appendChild(clonedTable);
                var headDiff = getBySelector("thead .diff", clonedTable);
                headDiff.innerHTML = "";
                var changeSel = create("select", {}, "");
                changeDiff.map(o => changeSel.appendChild(create("option", {
                    value: o.value,
                    selected: o.value === diffOffset
                }, o.text))), headDiff.appendChild(changeSel), changeSel.addEventListener("change", e => fillCountryRanking(e.target.options[e.target.selectedIndex].value)), 
                yield fillCountryRanking(diffOffset);
            }
        }))).apply(this, arguments);
    }
    function updateProgress(info) {
        var ssplProgress = document.querySelector("#sspl_progress"), ssplProgressInfo = document.querySelector("#sspl_progress_info");
        ssplProgress && (ssplProgress.value = info.percent), ssplProgressInfo && (ssplProgressInfo.innerHTML = "<strong>" + info.name + "</strong> / " + info.page);
    }
    function refresh() {
        return _refresh.apply(this, arguments);
    }
    function _refresh() {
        return (_refresh = _asyncToGenerator((function*() {
            var ssplHeader = document.querySelector("#sspl_progress_head");
            ssplHeader && (ssplHeader.innerHTML = "Pobieranie nowych wyników");
            var users = yield fetchUsers(), idx = 0, cache = yield users.reduce(function() {
                var _ref18 = _asyncToGenerator((function*(promisedCum, u) {
                    var cum = yield promisedCum, newScores = yield fetchAllNewScores(u, dateFromString(cum.users[u.id] ? cum.users[u.id].lastUpdated : null), info => updateProgress(Object.assign({}, info, {
                        percent: Math.floor(idx / users.length * 100)
                    })));
                    return cum.users[u.id] = Object.assign({}, u, {
                        lastUpdated: newScores.lastUpdated,
                        scores: Object.assign({}, cum.users[u.id] ? cum.users[u.id].scores : {}, newScores.scores)
                    }), idx++, cum;
                }));
                return function(_x23, _x24) {
                    return _ref18.apply(this, arguments);
                };
            }(), yield getCacheAndConvertIfNeeded());
            return cache.lastUpdated = (new Date).toISOString(), setCache(cache);
        }))).apply(this, arguments);
    }
    function toggled_class(bool, css_class) {
        return bool ? css_class : "";
    }
    function into(parent) {
        for (var _len2 = arguments.length, children = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) children[_key2 - 1] = arguments[_key2];
        for (var child of children) "string" == typeof child ? children.length > 1 ? parent.appendChild(create("div", {}, child)) : parent.innerText = child : parent.appendChild(child);
        return parent;
    }
    function create(tag, attrs) {
        if (!tag) throw new SyntaxError("'tag' not defined");
        var ele = document.createElement(tag);
        if (attrs) for (var attrName in attrs) if ("style" === attrName) for (var styleName in attrs.style) ele.style[styleName] = attrs.style[styleName]; else if ("class" === attrName) if ("string" == typeof attrs.class) {
            var classes = attrs.class.split(/ /g).filter(c => c.trim().length > 0);
            ele.classList.add(...classes);
        } else ele.classList.add(...attrs.class); else if ("for" === attrName) ele.htmlFor = attrs[attrName]; else if ("selected" === attrName) ele.selected = attrs[attrName] ? "selected" : void 0; else if ("disabled" === attrName) attrs[attrName] && ele.setAttribute("disabled", void 0); else if ("data" === attrName) {
            var data_dict = attrs[attrName];
            for (var data_key in data_dict) ele.setAttribute("data-".concat(data_key), data_dict[data_key]);
        } else ele[attrName] = attrs[attrName];
        for (var _len3 = arguments.length, children = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) children[_key3 - 2] = arguments[_key3];
        return into(ele, ...children), ele;
    }
    function generate_tab(css_id, is_active, has_offset) {
        var tabClass = "filter_tab sspl ".concat(toggled_class(is_active, "is-active"), " ").concat(toggled_class(has_offset, "offset_tab"));
        return create("li", {
            id: css_id,
            class: tabClass
        }, create("a", {
            class: "has-text-info",
            onclick: () => {
                document.querySelectorAll(".tabs > ul .filter_tab").forEach(x => x.classList.remove("is-active")), 
                assert(document.getElementById(css_id)).classList.add("is-active");
            }
        }, create("img", {
            class: "bloodtrail",
            src: "data:image/png;base64,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"
        })));
    }
    function generate_song_table_row(user, leaderboardId, idx, cls) {
        return create("tr", {
            class: cls
        }, create("td", {
            class: "picture"
        }), create("td", {
            class: "rank"
        }, create("span", {}, "#" + idx), create("small", {}, create("a", {
            href: "/leaderboard/" + encodeURIComponent(leaderboardId) + "?page=" + encodeURIComponent(Math.ceil(user.rank / 12))
        }, "#" + user.rank))), create("td", {
            class: "player"
        }, generate_song_table_player(user)), create("td", {
            class: "score"
        }, user.score ? formatNumber(user.score, 0) : "-"), create("td", {
            class: "timeset",
            title: dateFromString(user.timeset).toLocaleString()
        }, formatDate(user.timeset)), create("td", {
            class: "mods"
        }, user.mods ? user.mods.toString() : "-"), create("td", {
            class: "percentage"
        }, user.percent ? formatNumber(100 * user.percent, 2) + "%" : "-"), create("td", {
            class: "pp"
        }, create("span", {
            class: "scoreTop ppValue"
        }, formatNumber(user.pp, 2)), create("span", {
            class: "scoreTop ppLabel"
        }, "pp")));
    }
    function generate_song_table_player(user) {
        var country = user.country.toLowerCase();
        return create("a", {
            href: substituteVars(USER_PROFILE_URL, {
                userId: user.id
            })
        }, create("img", {
            src: "/imports/images/flags/".concat(country, ".png")
        }), create("span", {
            class: "player-name"
        }, " " + user.name));
    }
    function formatNumber(num) {
        var digits = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 2, addSign = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
        return (addSign && num > 0 ? "+" : "") + num.toLocaleString("pl", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    }
    function formatDate(val) {
        var rtf = new Intl.RelativeTimeFormat("pl", {
            localeMatcher: "best fit",
            numeric: "auto",
            style: "long"
        }), diffInSecs = (Date.now() - dateFromString(val)) / 1e3;
        return diffInSecs < 60 ? rtf.format(-Math.ceil(diffInSecs), "second") : diffInSecs < 3600 ? rtf.format(-Math.ceil(diffInSecs / 60), "minute") : diffInSecs < 86400 ? rtf.format(-Math.ceil(diffInSecs / 3600), "hour") : diffInSecs < 2592e3 ? rtf.format(-Math.ceil(diffInSecs / 86400), "day") : diffInSecs < 31536e3 ? rtf.format(-Math.ceil(diffInSecs / 2592e3), "month") : rtf.format(-Math.floor(diffInSecs / 31536e3), "year");
    }
    function getSSEUser() {
        var user = localStorage.getItem("home_user");
        return user ? JSON.parse(user).id : null;
    }
    function setupStyles() {
        var addStyles = GM_addStyle || (() => {});
        addStyles("\n            .sspl .player-name {font-size: 1.1rem; font-weight: 700;}\n            .sspl .diff.inc {color: #42B129 !important;}\n            .sspl .diff.dec {color: #F94022 !important;}\n            .sspl thead .diff select, .pagination select.type {font-size: 1rem; font-weight: 700; border: none; color: var(--textColor, black); background-color: var(--background, white); outline: none;}\n            #new-rankeds {margin-bottom: 2rem;}\n            #new-rankeds th, #new-rankeds td {text-align: center;}\n            #new-rankeds tbody tr td:nth-child(1) {text-align: left;}\n            #pp-boundary {border: none; background: transparent; color: color: var(--textColor, black); font-weight: 700; font-size: 1rem; width: 3rem; text-align: center; margin-right: .25rem; outline: none;}\n            .what-if {position: absolute; top: 1em; right: 0em; font-weight: 700; padding:0;}\n            table.ranking.songs th.score, table.ranking td.pp {position: relative;}\n            table.ranking tbody tr.hidden {opacity: 0.05;}\n            .content table.ranking.global.sspl .pp, .content table.ranking.global.sspl .diff {text-align: center;}\n            .box .tabs a {border-bottom: none;}\n            .box .tabs li:hover {border-bottom: 1px solid black; margin-bottom: -1px;}\n            .tabs li.is-active {border-bottom: 1px solid #3273dc; margin-bottom: -1px;}\n            img.bloodtrail {height:24px;}\n            .sspl .rank small {font-size: .75rem; margin-left: .5rem; color: lightgray;}\n            .sspl .rank span {display: inline-block; width: 1.5rem; text-align: right;}\n            .text-center {text-align: center;}\n            #sspl progress {width: 20rem; max-width: 90%;}\n            #ssplrefresh {text-align: right; margin-bottom: 1rem;}\n            #ssplrefresh button {margin-right: .5rem;}\n            #ssplrefresh strong {margin-right: .5rem;}\n            .offset_tab {margin-left: auto;}\n        "), 
        addStyles(__webpack_require__(4).toString());
    }
    function setupDelayed() {
        initialized || (initialized = !0, null !== getLeaderboardId() && function() {
            _setupLeaderboard.apply(this, arguments);
        }());
    }
    function calcPp(scores) {
        var startIdx = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
        return scores.reduce((cum, pp, idx) => cum + Math.pow(.965, idx + startIdx) * pp, 0);
    }
    function calcRawPpAtIdx(bottomScores, idx, expected) {
        return (expected + calcPp(bottomScores, idx) - calcPp(bottomScores, idx + 1)) / Math.pow(.965, idx);
    }
    function findRawPp(_x18, _x19) {
        return _findRawPp.apply(this, arguments);
    }
    function _findRawPp() {
        return (_findRawPp = _asyncToGenerator((function*(scores, expected) {
            if (!scores.length) return expected;
            for (var idx = scores.length - 1; idx >= 0; ) {
                var bottomSlice = scores.slice(idx), bottomPp = calcPp(bottomSlice, idx);
                if (bottomSlice.unshift(scores[idx]), calcPp(bottomSlice, idx) - bottomPp > expected) return calcRawPpAtIdx(scores.slice(idx + 1), idx + 1, expected);
                idx--;
            }
            return calcRawPpAtIdx(scores, 0, expected);
        }))).apply(this, arguments);
    }
    var initialized = !1;
    function _init() {
        return (_init = _asyncToGenerator((function*() {
            log.info("init"), initialized || (yield getCacheAndConvertIfNeeded(), setupStyles(), 
            isProfilePage() && setupProfile(), isCountryRankingPage() && setupCountryRanking(), 
            setTimeout(setupDelayed, 500));
        }))).apply(this, arguments);
    }
    !function() {
        _init.apply(this, arguments);
    }();
}, function(module, exports, __webpack_require__) {
    var monkey = __webpack_require__(2);
    module.exports = {
        info: message => {
            console.info("[".concat(monkey.header.name, "]"), message);
        },
        debug: message => {
            console.debug("[".concat(monkey.header.name, "]"), message);
        },
        warn: message => {
            console.warn("[".concat(monkey.header.name, "]"), message);
        }
    };
}, function(module, exports, __webpack_require__) {
    var header = __webpack_require__(3);
    module.exports.config = {
        entry: "./src/index.js"
    }, module.exports.header = header, module.exports.buildedHeader = () => {
        var headerString = [];
        for (var headerKey in headerString.push("// ==UserScript=="), header) if (Array.isArray(header[headerKey])) for (var p in header[headerKey].length > 0 && headerString.push("//"), 
        header[headerKey]) headerString.push("// @" + headerKey.padEnd(13) + header[headerKey][p]); else headerString.push("// @" + headerKey.padEnd(13) + header[headerKey]);
        return headerString.push("// ==/UserScript=="), headerString.push(""), headerString.join("\n");
    };
}, function(module) {
    module.exports = JSON.parse('{"name":"ScoreSaber country leaderboard","namespace":"https://motzel.dev","version":"0.6.9","description":"Add country leaderboard tab","author":"motzel","icon":"https://scoresaber.com/imports/images/logo.ico","updateURL":"https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/dist/scoresaber-country-leaderboard.user.js","downloadURL":"https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/dist/scoresaber-country-leaderboard.user.js","supportURL":"https://github.com/motzel/ScoreSaberCountryLeaderboard/issues","match":["https://scoresaber.com/leaderboard/*","https://scoresaber.com/u/*"],"include":["/^https://scoresaber\\\\.com\\\\/global(\\\\/\\\\d+&country=pl|\\\\?country=pl)/"],"require":["https://cdnjs.cloudflare.com/ajax/libs/localforage/1.7.3/localforage.min.js"],"grant":["GM_addStyle","GM_info","GM_xmlhttpRequest"],"run-at":"document-end"}');
}, function(module, exports, __webpack_require__) {
    (exports = __webpack_require__(5)(!1)).push([ module.i, '.navbar-brand .navbar-item b{background:#fff;background:-webkit-gradient(left top,left bottom,color-stop(0,#fff),color-stop(55%,#fff),color-stop(55%,red),color-stop(100%,#ff1500));background:linear-gradient(180deg,#fff 0,#fff 55%,red 0,#ff1500);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#ffffff",endColorstr="#ff1500",GradientType=0);-webkit-background-clip:text;-webkit-text-fill-color:transparent}', "" ]), 
    module.exports = exports;
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(useSourceMap) {
        var list = [];
        return list.toString = function() {
            return this.map((function(item) {
                var content = function(item, useSourceMap) {
                    var content = item[1] || "", cssMapping = item[3];
                    if (!cssMapping) return content;
                    if (useSourceMap && "function" == typeof btoa) {
                        var sourceMapping = (sourceMap = cssMapping, base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), 
                        data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64), 
                        "/*# ".concat(data, " */")), sourceURLs = cssMapping.sources.map((function(source) {
                            return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
                        }));
                        return [ content ].concat(sourceURLs).concat([ sourceMapping ]).join("\n");
                    }
                    var sourceMap, base64, data;
                    return [ content ].join("\n");
                }(item, useSourceMap);
                return item[2] ? "@media ".concat(item[2], " {").concat(content, "}") : content;
            })).join("");
        }, list.i = function(modules, mediaQuery, dedupe) {
            "string" == typeof modules && (modules = [ [ null, modules, "" ] ]);
            var alreadyImportedModules = {};
            if (dedupe) for (var i = 0; i < this.length; i++) {
                var id = this[i][0];
                null != id && (alreadyImportedModules[id] = !0);
            }
            for (var _i = 0; _i < modules.length; _i++) {
                var item = [].concat(modules[_i]);
                dedupe && alreadyImportedModules[item[0]] || (mediaQuery && (item[2] ? item[2] = "".concat(mediaQuery, " and ").concat(item[2]) : item[2] = mediaQuery), 
                list.push(item));
            }
        }, list;
    };
} ]);
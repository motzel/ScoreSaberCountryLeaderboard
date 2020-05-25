// ==UserScript==
// @name         ScoreSaber country leaderboard
// @namespace    https://motzel.dev
// @version      0.6.9.3
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
}([ function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var _Svelte_Profile_Profile_svelte__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1), _utils_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8), _utils_logger__WEBPACK_IMPORTED_MODULE_1___default = __webpack_require__.n(_utils_logger__WEBPACK_IMPORTED_MODULE_1__), _config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
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
    var USERS_URL = "https://scoresaber.com/global/${page}?country=" + _config__WEBPACK_IMPORTED_MODULE_2__.default.COUNTRY, USER_PROFILE_URL = "https://scoresaber.com/u/${userId}", SCORES_URL = "https://new.scoresaber.com/api/player/${userId}/scores/recent/${page}", ADDITIONAL_USER_IDS = [ "76561198967371424", "76561198093469724" ], changeDiff = [ {
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
    }, getProfileId = () => getFirstRegexpMatch(/\u\/(\d+)((\?|&).*)?$/, window.location.href.toLowerCase()), isProfilePage = () => null !== getProfileId(), isCountryRankingPage = () => [ "https://scoresaber.com/global?country=" + _config__WEBPACK_IMPORTED_MODULE_2__.default.COUNTRY, "https://scoresaber.com/global/1&country=" + _config__WEBPACK_IMPORTED_MODULE_2__.default.COUNTRY ].indexOf(window.location.href) >= 0, fetchHtmlPage = function() {
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
                var _sseUserId = getSSEUser();
                if (_sseUserId) {
                    var scoreSpans = document.querySelectorAll(".scoreTop.ppValue");
                    [].forEach.call(scoreSpans, function() {
                        var _ref15 = _asyncToGenerator((function*(span) {
                            var pp = parseFloat(span.innerText.replace(/\s/, "").replace(",", "."));
                            pp && pp > 0 + Number.EPSILON && span.parentNode.appendChild(yield createWhatIfPpButton(_sseUserId, leaderboardId, pp));
                        }));
                        return function(_x19) {
                            return _ref15.apply(this, arguments);
                        };
                    }());
                }
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
            getLeaderboardId() && (getBySelector(".tabs > ul").appendChild(generate_tab("pl_tab", !1, null === document.querySelector(".filter_tab"))), 
            setupPlTable(), yield fillLeaderboard(), document.addEventListener("click", (function(e) {
                var clickedTab = e.target.closest(".filter_tab");
                if (clickedTab) {
                    var box = assert(e.target.closest(".box")), sspl = getBySelector("#sspl", box), originalTable = getBySelector("table.ranking", box);
                    clickedTab.classList.contains("sspl") ? (originalTable.style.display = "none", sspl.style.display = "", 
                    getBySelector(".pagination").style.display = "none") : (originalTable.style.display = "", 
                    sspl.style.display = "none", getBySelector(".pagination").style.display = "");
                }
            }), {
                passive: !0
            }));
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
                    return function(_x20) {
                        return _ref16.apply(this, arguments);
                    };
                }());
                var _data$users2, _data$users2$profileI, _data$users$profileId3, _data$users3, stats = document.querySelector(".content .column ul");
                if (stats) if (null === (_data$users2 = data.users) || void 0 === _data$users2 || null === (_data$users2$profileI = _data$users2[profileId]) || void 0 === _data$users2$profileI ? void 0 : _data$users2$profileI.stats) new _Svelte_Profile_Profile_svelte__WEBPACK_IMPORTED_MODULE_0__.default({
                    target: stats,
                    props: {
                        profile: null !== (_data$users$profileId3 = null === (_data$users3 = data.users) || void 0 === _data$users3 ? void 0 : _data$users3[profileId]) && void 0 !== _data$users$profileId3 ? _data$users$profileId3 : null
                    }
                });
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
                var _ref17 = _asyncToGenerator((function*(promisedCum, u) {
                    var cum = yield promisedCum, newScores = yield fetchAllNewScores(u, dateFromString(cum.users[u.id] ? cum.users[u.id].lastUpdated : null), info => updateProgress(Object.assign({}, info, {
                        percent: Math.floor(idx / users.length * 100)
                    })));
                    return cum.users[u.id] = Object.assign({}, u, {
                        lastUpdated: newScores.lastUpdated,
                        scores: Object.assign({}, cum.users[u.id] ? cum.users[u.id].scores : {}, newScores.scores)
                    }), idx++, cum;
                }));
                return function(_x21, _x22) {
                    return _ref17.apply(this, arguments);
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
            src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAYCAYAAAACqyaBAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5AUGEAksU7ZXQgAAAAFvck5UAc+id5oAAAmGSURBVEjHZdXpc5SHYcfx73Ps8zx7a3UskkAckpCELK0kHJAMSDEGQzCGOnISEjtXDzeexu2LdpLpZPqimabNJJ1hJtNm2pmYxI7DTA7bIBibwxTLBmIjTskWQhwSrM5d7Wp3tcez++xz9EVmMqX5/QOf+b36Chc++IAdAwP86/e/z5l33+XCyAgA/9j6Gb73QGCsdIU7b/yyPbkY65+ZiTpz0RkW5mdZisXIZ1dwLAdJkgWXpjrByiqhvmHNUuTxx+90b+tdem7fgaX+2ga770ufR89mefW11/i/ExzHIewP8J+vHQm9cfRo9bq167pk23kuNTfvTYzfdcRYUthYGd7gD4W6ynoRo6DjVCtInQqCpGPnLYzrJna8gKi4cCmujIgQTWOlc+HAgrdlwy+ae7ecTUZn7H8/fPhRvNal8fyff/1AdGLyFTOW7K20RWX97n53S1Mz9vg9vOk81R9PEiqYSKKIK6zg/tZTCPt24XYLCKZB7rcTlF49iZ3OYmFj4GBVB5neVM9v83P3Mlb5gEuSbv/3kSOsW7/+j7j8m3KRH3x89aXtD1b2bNu8hca9nyW8YwvZDau4dfsWNV4/80fexH3iCi7HRtuqoDRNYVpNWHTjrVmH9VQ19tAlSOcQfT60p7bi//I+Gjc2cP6H/7Lhk3Pnwslk4raqqo88FwfYS2lp2e6vWUuktY3a5/agRlopFnUkQWAhk8LZ+TiBwV0Ifi+O3IEx34UTS+LKnEUy57D9PlbcMvftArFdPSj/9BKuXX2IlRVUhELiwcHBrclcntq6OurDYYxSiffOnEHGlUGpqjCSq2pw79lGKZ3ho/u3mZy6TyhUQXNzM3XtHfh6enEyOcoTc9iTCYSgQ/mlvVg1GvfnoxzXcjxoUrh/8Tg7/8Pgb779CtU1NVRUhATNrR38yeHD5xPJ5I6qqqoPXYoyurGlxZFcfz2IUF3RuXHfUwPtz+4R3h+7zrGhY3ww/D6/PnoUnz/A9m39KOEqhKCX0olh7KlZRFPGs3cfwvp1vPb6z0kIZSy/hwuXLnJ3cpKOzi5aWlu5fu0q+XyuYmFhYX8yvvTC3VsT3e+dOTt05fLlgnjy7bepCoXimflFs5TK8P7wMLcnb5NMJBBFkasjV5i6P00hV0B8rBnXY82guNAGd+Hu7cA2LWKLcY69+TveOX4ct6qiaRrx+BKZ1Aq2DQ8fPgy2trY1/f03/hJv0epJrKT+7MALh4Ly5fgszwQC6ooqCYJbxe124/P62P/Ms3g8XgLBILlsjlLJQDZtkGWUlnWoe7ZhuzXI67RsaCIgq9g+Hz6/n1XhOmrDdZhlE5csMz01RV/fE/iDQdpC1erE9Rs/OvzKPxyQASzHzjiqyxYDXp58cicvvPgioVCI2EIcl6JQKBTJzcySf+8jjGIO+eVBynUhrIVFSqUyfY9FaN7+LP5IK0JvhKLtEIl0oSgKW3t7CQT9RLq6Kbplvvl3f8v0j39WefjciYPy4I4nmZmayje0R2yXYVG3up7Tp09jm2Xcbg/lkoHl2GSno0yfHqautZma6ATG5A1kVSWXSuOSZWTRwHVrHEMsYsoSwUCATe3tdPf00L25B6NkMDF6E3sujVeU8SMiF1vXKM6lTz4f6dqhOaaJqqq89ebv8GgqX/nqi+wY2I4/EOTE229zKjPLK33P88I3vkY2k0Fze0gnkuRLOotPLDExfot3hoZILafYuXMXoiSRzeYRRRFNU6jxBWD+Dr50gYgSQNYnH+zc09GzteWJreDRqKKGp5/ew8TEOOVymVBliIqKEM8cPEiouobOSIT61ath9WrAYV3jem59+ill0yAU8CMIAvv272djSwuqpqIBRb2EXtTRKoOEGtbwIH2acdVCGmjrOPnc4GDz6qZGiskMks/HY5FOvB4PmUwGQRCorq6mtq6ezkgntXW1SJKM4wAI4IBRKlIoFBAEh7q6NTz//JcIh8OUjTKaW6OUL6BPz4JeYhydK4tR/WE+MyT8qLnP+cLGLqSeNjx7tqF2tKB43WRXskQfPuTKyAgLC3OoLhd+QUK0wevzIiouFE0js5TATKRIFXWatveybfsOvF4/Hq+bXDaPKIkk4nGmr960b545N3fXLpy5PXXvLbOgj8g9WgVKYwNxr0J5KsqaSBumYSJLMo2NzTQ0rCWTyTA9Nc1yNIq0mCBbKDITncXl1mhau55w7RrqQ1VUPfEZPBUBVtJZCnkd0zS5NPwhly5dXMjrhZ+uaqh615uVP7138lY5sqkd+Wo6NlVz+kJjwacQ/Odvg1vFSq1g5Aq4QgFUTaNGUamsqkJoaUNxSRhelVQqDQ5UVlYRCgWwYssYLgldLyJKIpIkIYkiD6en7fPn3vtObW390ab6NaSTy1y7O8lHFy4i313l/XHLVOx7/sp1a0urazDSOfSL13E2NSKKEiKgZ3NgWgj3oihbOlH8Hnz+IDgOtmNjOVCWRYyPx8j7PGiNa1Arg4CDJIj2Uix+z7Zsfn91hJOnTvHTI6/+oWrZr+5+9UaV61v/4y2/np5dyOTeOEE5kaKUyiCVy9hFA/P+DPrlMURVoSgKlIsGRr6AgI1glHFsG0vTsGwbxu9hxZKIgD0bw86sWI4sCaZtcfLUqUeTqg6PWhtdvtMPZOu/9J8cTZvXxin7PAgXbyI4Dnp0nqXxSWLTD0n4FOJLS8TGJ0l+dIN0PEni4xvM3Z8im88itzchLa9gX7gGRhl9dJLi2d+XbMMw7UyO/z/56NAxFju6kWYtqSgLorC9D/v4eVyVQcy8TmHoPImbY9xcG+D0d9/KedzuMblo5DVBQgpXCtbMQu9fvPyyv/tzT+MEFRxVwTgxTGlLB8XpWZYnp+SyXhCLovGnOEBZc2HZsqrnikr5xDBSLInTv5mVX70DvzlDi8+D3N3KWWf0emdX55d/8G8/XBAEQQDUQ+2Pnw3fme+X+/KYooCgF3GiC+RfH8JeWKJomaotIFk4f4JLAF1d3Shet1oRTXxWTmZWFRxLysbipK6OEc+keGAX9VuVin43mzz2+hu/Or571y6y6TRLA51sxjvgi2c6nQ+vCYJHxVxfy/LIKIuXbzK3OL/yiWyM3rbyRzVJXl4xH30vAGxu2sj1e3fYv7att3G52LxKdHndjkDZcVhyykyg51JNdfkde3ePlg3jQX//ALZt88VDh/irLx7aUPzw2m6PIH4tH67YLG9q1PxzyeHqsemhWcWZz7atHctlc3dHRq+zhPUI/r/tqWm1gKHlswAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMC0wNS0wNlQxNjowOTo0NCswMDowMNB9vSQAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjAtMDUtMDZUMTY6MDk6NDQrMDA6MDChIAWYAAAAAElFTkSuQmCC"
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
        return (addSign && num > 0 ? "+" : "") + num.toLocaleString(_config__WEBPACK_IMPORTED_MODULE_2__.default.COUNTRY, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    }
    function formatDate(val) {
        var rtf = new Intl.RelativeTimeFormat(_config__WEBPACK_IMPORTED_MODULE_2__.default.COUNTRY, {
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
        addStyles("\n            .sspl thead .diff select, .pagination select.type {font-size: 1rem; font-weight: 700; border: none; color: var(--textColor, black); background-color: var(--background, white); outline: none;}\n            .pp-boundary {color: var(--textColor, black);}\n        "), 
        addStyles(__webpack_require__(11).toString());
    }
    function setupDelayed() {
        initialized || (initialized = !0, null !== getLeaderboardId() && function() {
            _setupLeaderboard.apply(this, arguments);
        }());
    }
    function checkElement(selector) {
        return null === document.querySelector(selector) ? new Promise(resolve => {
            requestAnimationFrame(resolve);
        }).then(() => checkElement(selector)) : Promise.resolve(!0);
    }
    function waitForSSEInit(_x18) {
        return _waitForSSEInit.apply(this, arguments);
    }
    function _waitForSSEInit() {
        return (_waitForSSEInit = _asyncToGenerator((function*(timeout) {
            return new Promise((function(resolve, reject) {
                checkElement("#all_scores_tab").then(el => resolve(el)), setTimeout(() => resolve(null), timeout);
            }));
        }))).apply(this, arguments);
    }
    var initialized = !1;
    function _init() {
        return (_init = _asyncToGenerator((function*() {
            _utils_logger__WEBPACK_IMPORTED_MODULE_1___default.a.info("init"), initialized || (yield getCacheAndConvertIfNeeded(), 
            setupStyles(), isProfilePage() && setupProfile(), isCountryRankingPage() && setupCountryRanking(), 
            yield waitForSSEInit(_config__WEBPACK_IMPORTED_MODULE_2__.default.SSE_CHECK_DELAY), 
            setupDelayed());
        }))).apply(this, arguments);
    }
    !function() {
        _init.apply(this, arguments);
    }();
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _ProfileLine_svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3), _ProfilePpCalc_svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
    function create_if_block_1(ctx) {
        let t0, t1, current;
        const profileline0 = new _ProfileLine_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: {
                label: "Ranked play count",
                value: ctx[0].stats.rankedPlayCount,
                precision: 0
            }
        }), profileline1 = new _ProfileLine_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: {
                label: "Total ranked score",
                value: ctx[0].stats.totalRankedScore,
                precision: 0
            }
        }), profileline2 = new _ProfileLine_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: {
                label: "Average ranked accuracy",
                value: ctx[0].stats.averageRankedAccuracy,
                suffix: "%"
            }
        });
        return {
            c() {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(profileline0.$$.fragment), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(profileline1.$$.fragment), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(profileline2.$$.fragment);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(profileline0, target, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t0, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(profileline1, target, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(profileline2, target, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                const profileline0_changes = {};
                1 & dirty && (profileline0_changes.value = ctx[0].stats.rankedPlayCount), profileline0.$set(profileline0_changes);
                const profileline1_changes = {};
                1 & dirty && (profileline1_changes.value = ctx[0].stats.totalRankedScore), profileline1.$set(profileline1_changes);
                const profileline2_changes = {};
                1 & dirty && (profileline2_changes.value = ctx[0].stats.averageRankedAccuracy), 
                profileline2.$set(profileline2_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(profileline0.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(profileline1.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(profileline2.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(profileline0.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(profileline1.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(profileline2.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(profileline0, detaching), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(profileline1, detaching), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(profileline2, detaching);
            }
        };
    }
    function create_if_block(ctx) {
        let li, current;
        const profileppcalc = new _ProfilePpCalc_svelte__WEBPACK_IMPORTED_MODULE_2__.default({
            props: {
                scores: ctx[1]
            }
        });
        return {
            c() {
                li = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("li"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(profileppcalc.$$.fragment);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, li, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(profileppcalc, li, null), 
                current = !0;
            },
            p(ctx, dirty) {
                const profileppcalc_changes = {};
                2 & dirty && (profileppcalc_changes.scores = ctx[1]), profileppcalc.$set(profileppcalc_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(profileppcalc.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(profileppcalc.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(li), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(profileppcalc);
            }
        };
    }
    function create_fragment(ctx) {
        let t, if_block1_anchor, current, if_block0 = ctx[0] && ctx[0].stats && create_if_block_1(ctx), if_block1 = ctx[1] && create_if_block(ctx);
        return {
            c() {
                if_block0 && if_block0.c(), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                if_block1 && if_block1.c(), if_block1_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_block0 && if_block0.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t, anchor), 
                if_block1 && if_block1.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block1_anchor, anchor), 
                current = !0;
            },
            p(ctx, [dirty]) {
                ctx[0] && ctx[0].stats ? if_block0 ? (if_block0.p(ctx, dirty), 1 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0, 1)) : (if_block0 = create_if_block_1(ctx), 
                if_block0.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0, 1), 
                if_block0.m(t.parentNode, t)) : if_block0 && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block0, 1, 1, () => {
                    if_block0 = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)()), ctx[1] ? if_block1 ? (if_block1.p(ctx, dirty), 
                2 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1, 1)) : (if_block1 = create_if_block(ctx), 
                if_block1.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1, 1), 
                if_block1.m(if_block1_anchor.parentNode, if_block1_anchor)) : if_block1 && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block1, 1, 1, () => {
                    if_block1 = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)());
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1), current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block1), 
                current = !1;
            },
            d(detaching) {
                if_block0 && if_block0.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t), 
                if_block1 && if_block1.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block1_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let scores, {profile: profile} = $$props;
        return $$self.$set = $$props => {
            "profile" in $$props && $$invalidate(0, profile = $$props.profile);
        }, $$self.$$.update = () => {
            1 & $$self.$$.dirty && $$invalidate(1, scores = profile.scores ? Object.values(profile.scores).filter(s => s.pp > 0).map(s => s.pp).sort((a, b) => b - a) : null);
        }, [ profile, scores ];
    }
    class Profile extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            super(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                profile: 0
            });
        }
    }
    __webpack_exports__.default = Profile;
}, function(__webpack_module__, __webpack_exports__, __webpack_require__) {
    "use strict";
    function noop() {}
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "HtmlTag", (function() {
        return HtmlTag;
    })), __webpack_require__.d(__webpack_exports__, "SvelteComponent", (function() {
        return SvelteComponent;
    })), __webpack_require__.d(__webpack_exports__, "SvelteComponentDev", (function() {
        return SvelteComponentDev;
    })), __webpack_require__.d(__webpack_exports__, "SvelteElement", (function() {
        return SvelteElement;
    })), __webpack_require__.d(__webpack_exports__, "action_destroyer", (function() {
        return action_destroyer;
    })), __webpack_require__.d(__webpack_exports__, "add_attribute", (function() {
        return add_attribute;
    })), __webpack_require__.d(__webpack_exports__, "add_classes", (function() {
        return add_classes;
    })), __webpack_require__.d(__webpack_exports__, "add_flush_callback", (function() {
        return add_flush_callback;
    })), __webpack_require__.d(__webpack_exports__, "add_location", (function() {
        return add_location;
    })), __webpack_require__.d(__webpack_exports__, "add_render_callback", (function() {
        return add_render_callback;
    })), __webpack_require__.d(__webpack_exports__, "add_resize_listener", (function() {
        return add_resize_listener;
    })), __webpack_require__.d(__webpack_exports__, "add_transform", (function() {
        return add_transform;
    })), __webpack_require__.d(__webpack_exports__, "afterUpdate", (function() {
        return afterUpdate;
    })), __webpack_require__.d(__webpack_exports__, "append", (function() {
        return append;
    })), __webpack_require__.d(__webpack_exports__, "append_dev", (function() {
        return append_dev;
    })), __webpack_require__.d(__webpack_exports__, "assign", (function() {
        return assign;
    })), __webpack_require__.d(__webpack_exports__, "attr", (function() {
        return attr;
    })), __webpack_require__.d(__webpack_exports__, "attr_dev", (function() {
        return attr_dev;
    })), __webpack_require__.d(__webpack_exports__, "beforeUpdate", (function() {
        return beforeUpdate;
    })), __webpack_require__.d(__webpack_exports__, "bind", (function() {
        return bind;
    })), __webpack_require__.d(__webpack_exports__, "binding_callbacks", (function() {
        return binding_callbacks;
    })), __webpack_require__.d(__webpack_exports__, "blank_object", (function() {
        return blank_object;
    })), __webpack_require__.d(__webpack_exports__, "bubble", (function() {
        return bubble;
    })), __webpack_require__.d(__webpack_exports__, "check_outros", (function() {
        return check_outros;
    })), __webpack_require__.d(__webpack_exports__, "children", (function() {
        return children;
    })), __webpack_require__.d(__webpack_exports__, "claim_component", (function() {
        return claim_component;
    })), __webpack_require__.d(__webpack_exports__, "claim_element", (function() {
        return claim_element;
    })), __webpack_require__.d(__webpack_exports__, "claim_space", (function() {
        return claim_space;
    })), __webpack_require__.d(__webpack_exports__, "claim_text", (function() {
        return claim_text;
    })), __webpack_require__.d(__webpack_exports__, "clear_loops", (function() {
        return clear_loops;
    })), __webpack_require__.d(__webpack_exports__, "component_subscribe", (function() {
        return component_subscribe;
    })), __webpack_require__.d(__webpack_exports__, "compute_rest_props", (function() {
        return compute_rest_props;
    })), __webpack_require__.d(__webpack_exports__, "createEventDispatcher", (function() {
        return createEventDispatcher;
    })), __webpack_require__.d(__webpack_exports__, "create_animation", (function() {
        return create_animation;
    })), __webpack_require__.d(__webpack_exports__, "create_bidirectional_transition", (function() {
        return create_bidirectional_transition;
    })), __webpack_require__.d(__webpack_exports__, "create_component", (function() {
        return create_component;
    })), __webpack_require__.d(__webpack_exports__, "create_in_transition", (function() {
        return create_in_transition;
    })), __webpack_require__.d(__webpack_exports__, "create_out_transition", (function() {
        return create_out_transition;
    })), __webpack_require__.d(__webpack_exports__, "create_slot", (function() {
        return create_slot;
    })), __webpack_require__.d(__webpack_exports__, "create_ssr_component", (function() {
        return create_ssr_component;
    })), __webpack_require__.d(__webpack_exports__, "current_component", (function() {
        return current_component;
    })), __webpack_require__.d(__webpack_exports__, "custom_event", (function() {
        return custom_event;
    })), __webpack_require__.d(__webpack_exports__, "dataset_dev", (function() {
        return dataset_dev;
    })), __webpack_require__.d(__webpack_exports__, "debug", (function() {
        return debug;
    })), __webpack_require__.d(__webpack_exports__, "destroy_block", (function() {
        return destroy_block;
    })), __webpack_require__.d(__webpack_exports__, "destroy_component", (function() {
        return destroy_component;
    })), __webpack_require__.d(__webpack_exports__, "destroy_each", (function() {
        return destroy_each;
    })), __webpack_require__.d(__webpack_exports__, "detach", (function() {
        return detach;
    })), __webpack_require__.d(__webpack_exports__, "detach_after_dev", (function() {
        return detach_after_dev;
    })), __webpack_require__.d(__webpack_exports__, "detach_before_dev", (function() {
        return detach_before_dev;
    })), __webpack_require__.d(__webpack_exports__, "detach_between_dev", (function() {
        return detach_between_dev;
    })), __webpack_require__.d(__webpack_exports__, "detach_dev", (function() {
        return detach_dev;
    })), __webpack_require__.d(__webpack_exports__, "dirty_components", (function() {
        return dirty_components;
    })), __webpack_require__.d(__webpack_exports__, "dispatch_dev", (function() {
        return dispatch_dev;
    })), __webpack_require__.d(__webpack_exports__, "each", (function() {
        return each;
    })), __webpack_require__.d(__webpack_exports__, "element", (function() {
        return element;
    })), __webpack_require__.d(__webpack_exports__, "element_is", (function() {
        return element_is;
    })), __webpack_require__.d(__webpack_exports__, "empty", (function() {
        return empty;
    })), __webpack_require__.d(__webpack_exports__, "escape", (function() {
        return escape;
    })), __webpack_require__.d(__webpack_exports__, "escaped", (function() {
        return escaped;
    })), __webpack_require__.d(__webpack_exports__, "exclude_internal_props", (function() {
        return exclude_internal_props;
    })), __webpack_require__.d(__webpack_exports__, "fix_and_destroy_block", (function() {
        return fix_and_destroy_block;
    })), __webpack_require__.d(__webpack_exports__, "fix_and_outro_and_destroy_block", (function() {
        return fix_and_outro_and_destroy_block;
    })), __webpack_require__.d(__webpack_exports__, "fix_position", (function() {
        return fix_position;
    })), __webpack_require__.d(__webpack_exports__, "flush", (function() {
        return flush;
    })), __webpack_require__.d(__webpack_exports__, "getContext", (function() {
        return getContext;
    })), __webpack_require__.d(__webpack_exports__, "get_binding_group_value", (function() {
        return get_binding_group_value;
    })), __webpack_require__.d(__webpack_exports__, "get_current_component", (function() {
        return get_current_component;
    })), __webpack_require__.d(__webpack_exports__, "get_slot_changes", (function() {
        return get_slot_changes;
    })), __webpack_require__.d(__webpack_exports__, "get_slot_context", (function() {
        return get_slot_context;
    })), __webpack_require__.d(__webpack_exports__, "get_spread_object", (function() {
        return get_spread_object;
    })), __webpack_require__.d(__webpack_exports__, "get_spread_update", (function() {
        return get_spread_update;
    })), __webpack_require__.d(__webpack_exports__, "get_store_value", (function() {
        return get_store_value;
    })), __webpack_require__.d(__webpack_exports__, "globals", (function() {
        return globals;
    })), __webpack_require__.d(__webpack_exports__, "group_outros", (function() {
        return group_outros;
    })), __webpack_require__.d(__webpack_exports__, "handle_promise", (function() {
        return handle_promise;
    })), __webpack_require__.d(__webpack_exports__, "has_prop", (function() {
        return has_prop;
    })), __webpack_require__.d(__webpack_exports__, "identity", (function() {
        return identity;
    })), __webpack_require__.d(__webpack_exports__, "init", (function() {
        return init;
    })), __webpack_require__.d(__webpack_exports__, "insert", (function() {
        return insert;
    })), __webpack_require__.d(__webpack_exports__, "insert_dev", (function() {
        return insert_dev;
    })), __webpack_require__.d(__webpack_exports__, "intros", (function() {
        return intros;
    })), __webpack_require__.d(__webpack_exports__, "invalid_attribute_name_character", (function() {
        return invalid_attribute_name_character;
    })), __webpack_require__.d(__webpack_exports__, "is_client", (function() {
        return is_client;
    })), __webpack_require__.d(__webpack_exports__, "is_crossorigin", (function() {
        return is_crossorigin;
    })), __webpack_require__.d(__webpack_exports__, "is_function", (function() {
        return is_function;
    })), __webpack_require__.d(__webpack_exports__, "is_promise", (function() {
        return is_promise;
    })), __webpack_require__.d(__webpack_exports__, "listen", (function() {
        return listen;
    })), __webpack_require__.d(__webpack_exports__, "listen_dev", (function() {
        return listen_dev;
    })), __webpack_require__.d(__webpack_exports__, "loop", (function() {
        return loop;
    })), __webpack_require__.d(__webpack_exports__, "loop_guard", (function() {
        return loop_guard;
    })), __webpack_require__.d(__webpack_exports__, "missing_component", (function() {
        return missing_component;
    })), __webpack_require__.d(__webpack_exports__, "mount_component", (function() {
        return mount_component;
    })), __webpack_require__.d(__webpack_exports__, "noop", (function() {
        return noop;
    })), __webpack_require__.d(__webpack_exports__, "not_equal", (function() {
        return not_equal;
    })), __webpack_require__.d(__webpack_exports__, "now", (function() {
        return now;
    })), __webpack_require__.d(__webpack_exports__, "null_to_empty", (function() {
        return null_to_empty;
    })), __webpack_require__.d(__webpack_exports__, "object_without_properties", (function() {
        return object_without_properties;
    })), __webpack_require__.d(__webpack_exports__, "onDestroy", (function() {
        return onDestroy;
    })), __webpack_require__.d(__webpack_exports__, "onMount", (function() {
        return onMount;
    })), __webpack_require__.d(__webpack_exports__, "once", (function() {
        return once;
    })), __webpack_require__.d(__webpack_exports__, "outro_and_destroy_block", (function() {
        return outro_and_destroy_block;
    })), __webpack_require__.d(__webpack_exports__, "prevent_default", (function() {
        return prevent_default;
    })), __webpack_require__.d(__webpack_exports__, "prop_dev", (function() {
        return prop_dev;
    })), __webpack_require__.d(__webpack_exports__, "query_selector_all", (function() {
        return query_selector_all;
    })), __webpack_require__.d(__webpack_exports__, "raf", (function() {
        return raf;
    })), __webpack_require__.d(__webpack_exports__, "run", (function() {
        return run;
    })), __webpack_require__.d(__webpack_exports__, "run_all", (function() {
        return run_all;
    })), __webpack_require__.d(__webpack_exports__, "safe_not_equal", (function() {
        return safe_not_equal;
    })), __webpack_require__.d(__webpack_exports__, "schedule_update", (function() {
        return schedule_update;
    })), __webpack_require__.d(__webpack_exports__, "select_multiple_value", (function() {
        return select_multiple_value;
    })), __webpack_require__.d(__webpack_exports__, "select_option", (function() {
        return select_option;
    })), __webpack_require__.d(__webpack_exports__, "select_options", (function() {
        return select_options;
    })), __webpack_require__.d(__webpack_exports__, "select_value", (function() {
        return select_value;
    })), __webpack_require__.d(__webpack_exports__, "self", (function() {
        return self;
    })), __webpack_require__.d(__webpack_exports__, "setContext", (function() {
        return setContext;
    })), __webpack_require__.d(__webpack_exports__, "set_attributes", (function() {
        return set_attributes;
    })), __webpack_require__.d(__webpack_exports__, "set_current_component", (function() {
        return set_current_component;
    })), __webpack_require__.d(__webpack_exports__, "set_custom_element_data", (function() {
        return set_custom_element_data;
    })), __webpack_require__.d(__webpack_exports__, "set_data", (function() {
        return set_data;
    })), __webpack_require__.d(__webpack_exports__, "set_data_dev", (function() {
        return set_data_dev;
    })), __webpack_require__.d(__webpack_exports__, "set_input_type", (function() {
        return set_input_type;
    })), __webpack_require__.d(__webpack_exports__, "set_input_value", (function() {
        return set_input_value;
    })), __webpack_require__.d(__webpack_exports__, "set_now", (function() {
        return set_now;
    })), __webpack_require__.d(__webpack_exports__, "set_raf", (function() {
        return set_raf;
    })), __webpack_require__.d(__webpack_exports__, "set_store_value", (function() {
        return set_store_value;
    })), __webpack_require__.d(__webpack_exports__, "set_style", (function() {
        return set_style;
    })), __webpack_require__.d(__webpack_exports__, "set_svg_attributes", (function() {
        return set_svg_attributes;
    })), __webpack_require__.d(__webpack_exports__, "space", (function() {
        return space;
    })), __webpack_require__.d(__webpack_exports__, "spread", (function() {
        return spread;
    })), __webpack_require__.d(__webpack_exports__, "stop_propagation", (function() {
        return stop_propagation;
    })), __webpack_require__.d(__webpack_exports__, "subscribe", (function() {
        return subscribe;
    })), __webpack_require__.d(__webpack_exports__, "svg_element", (function() {
        return svg_element;
    })), __webpack_require__.d(__webpack_exports__, "text", (function() {
        return text;
    })), __webpack_require__.d(__webpack_exports__, "tick", (function() {
        return tick;
    })), __webpack_require__.d(__webpack_exports__, "time_ranges_to_array", (function() {
        return time_ranges_to_array;
    })), __webpack_require__.d(__webpack_exports__, "to_number", (function() {
        return to_number;
    })), __webpack_require__.d(__webpack_exports__, "toggle_class", (function() {
        return toggle_class;
    })), __webpack_require__.d(__webpack_exports__, "transition_in", (function() {
        return transition_in;
    })), __webpack_require__.d(__webpack_exports__, "transition_out", (function() {
        return transition_out;
    })), __webpack_require__.d(__webpack_exports__, "update_keyed_each", (function() {
        return update_keyed_each;
    })), __webpack_require__.d(__webpack_exports__, "validate_component", (function() {
        return validate_component;
    })), __webpack_require__.d(__webpack_exports__, "validate_each_argument", (function() {
        return validate_each_argument;
    })), __webpack_require__.d(__webpack_exports__, "validate_each_keys", (function() {
        return validate_each_keys;
    })), __webpack_require__.d(__webpack_exports__, "validate_slots", (function() {
        return validate_slots;
    })), __webpack_require__.d(__webpack_exports__, "validate_store", (function() {
        return validate_store;
    })), __webpack_require__.d(__webpack_exports__, "xlink_attr", (function() {
        return xlink_attr;
    }));
    const identity = x => x;
    function assign(tar, src) {
        for (const k in src) tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && "object" == typeof value && "function" == typeof value.then;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: {
                file: file,
                line: line,
                column: column,
                char: char
            }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return "function" == typeof thing;
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || a && "object" == typeof a || "function" == typeof a;
    }
    function not_equal(a, b) {
        return a != a ? b == b : a !== b;
    }
    function validate_store(store, name) {
        if (null != store && "function" != typeof store.subscribe) throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
    function subscribe(store, ...callbacks) {
        if (null == store) return noop;
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        return subscribe(store, _ => value = _)(), value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (void 0 === $$scope.dirty) return lets;
            if ("object" == typeof lets) {
                const merged = [], len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) merged[i] = $$scope.dirty[i] | lets[i];
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props) "$" !== k[0] && (result[k] = props[k]);
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props) keys.has(k) || "$" === k[0] || (rest[k] = props[k]);
        return rest;
    }
    function once(fn) {
        let ran = !1;
        return function(...args) {
            ran || (ran = !0, fn.call(this, ...args));
        };
    }
    function null_to_empty(value) {
        return null == value ? "" : value;
    }
    function set_store_value(store, ret, value = ret) {
        return store.set(value), ret;
    }
    const has_prop = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    const is_client = "undefined" != typeof window;
    let now = is_client ? () => window.performance.now() : () => Date.now(), raf = is_client ? cb => requestAnimationFrame(cb) : noop;
    function set_now(fn) {
        now = fn;
    }
    function set_raf(fn) {
        raf = fn;
    }
    const tasks = new Set;
    function run_tasks(now) {
        tasks.forEach(task => {
            task.c(now) || (tasks.delete(task), task.f());
        }), 0 !== tasks.size && raf(run_tasks);
    }
    function clear_loops() {
        tasks.clear();
    }
    function loop(callback) {
        let task;
        return 0 === tasks.size && raf(run_tasks), {
            promise: new Promise(fulfill => {
                tasks.add(task = {
                    c: callback,
                    f: fulfill
                });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) iterations[i] && iterations[i].d(detaching);
    }
    function element(name) {
        return document.createElement(name);
    }
    function element_is(name, is) {
        return document.createElement(name, {
            is: is
        });
    }
    function object_without_properties(obj, exclude) {
        const target = {};
        for (const k in obj) has_prop(obj, k) && -1 === exclude.indexOf(k) && (target[k] = obj[k]);
        return target;
    }
    function svg_element(name) {
        return document.createElementNS("http://www.w3.org/2000/svg", name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(" ");
    }
    function empty() {
        return text("");
    }
    function listen(node, event, handler, options) {
        return node.addEventListener(event, handler, options), () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function(event) {
            return event.preventDefault(), fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function(event) {
            return event.stopPropagation(), fn.call(this, event);
        };
    }
    function self(fn) {
        return function(event) {
            event.target === this && fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        null == value ? node.removeAttribute(attribute) : node.getAttribute(attribute) !== value && node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) null == attributes[key] ? node.removeAttribute(key) : "style" === key ? node.style.cssText = attributes[key] : "__value" === key ? node.value = node[key] = attributes[key] : descriptors[key] && descriptors[key].set ? node[key] = attributes[key] : attr(node, key, attributes[key]);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) attr(node, key, attributes[key]);
    }
    function set_custom_element_data(node, prop, value) {
        prop in node ? node[prop] = value : attr(node, prop, value);
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS("http://www.w3.org/1999/xlink", attribute, value);
    }
    function get_binding_group_value(group) {
        const value = [];
        for (let i = 0; i < group.length; i += 1) group[i].checked && value.push(group[i].__value);
        return value;
    }
    function to_number(value) {
        return "" === value ? void 0 : +value;
    }
    function time_ranges_to_array(ranges) {
        const array = [];
        for (let i = 0; i < ranges.length; i += 1) array.push({
            start: ranges.start(i),
            end: ranges.end(i)
        });
        return array;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                for (;j < node.attributes.length; ) {
                    const attribute = node.attributes[j];
                    attributes[attribute.name] ? j++ : node.removeAttribute(attribute.name);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (3 === node.nodeType) return node.data = "" + data, nodes.splice(i, 1)[0];
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, " ");
    }
    function set_data(text, data) {
        data = "" + data, text.data !== data && (text.data = data);
    }
    function set_input_value(input, value) {
        (null != value || input.value) && (input.value = value);
    }
    function set_input_type(input, type) {
        try {
            input.type = type;
        } catch (e) {}
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? "important" : "");
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) return void (option.selected = !0);
        }
    }
    function select_options(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            option.selected = ~value.indexOf(option.__value);
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(":checked") || select.options[0];
        return selected_option && selected_option.__value;
    }
    function select_multiple_value(select) {
        return [].map.call(select.querySelectorAll(":checked"), option => option.__value);
    }
    let crossorigin;
    function is_crossorigin() {
        if (void 0 === crossorigin) {
            crossorigin = !1;
            try {
                "undefined" != typeof window && window.parent && window.parent.document;
            } catch (error) {
                crossorigin = !0;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node), z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        "static" === computed_style.position && (node.style.position = "relative");
        const iframe = element("iframe");
        let unsubscribe;
        return iframe.setAttribute("style", `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`), 
        iframe.setAttribute("aria-hidden", "true"), iframe.tabIndex = -1, is_crossorigin() ? (iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}<\/script>", 
        unsubscribe = listen(window, "message", event => {
            event.source === iframe.contentWindow && fn();
        })) : (iframe.src = "about:blank", iframe.onload = () => {
            unsubscribe = listen(iframe.contentWindow, "resize", fn);
        }), append(node, iframe), () => {
            detach(iframe), unsubscribe && unsubscribe();
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? "add" : "remove"](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent("CustomEvent");
        return e.initCustomEvent(type, !1, !1, detail), e;
    }
    function query_selector_all(selector, parent = document.body) {
        return Array.from(parent.querySelectorAll(selector));
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element("div"), this.a = anchor, this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) insert(target, this.n[i], anchor);
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html, this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d(), this.u(html), this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }
    const active_docs = new Set;
    let current_component, active = 0;
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = "{\n";
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += 100 * p + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`, name = `__svelte_${function(str) {
            let hash = 5381, i = str.length;
            for (;i--; ) hash = (hash << 5) - hash ^ str.charCodeAt(i);
            return hash >>> 0;
        }(rule)}_${uid}`, doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element("style")).sheet), current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        current_rules[name] || (current_rules[name] = !0, stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length));
        const animation = node.style.animation || "";
        return node.style.animation = `${animation ? animation + ", " : ""}${name} ${duration}ms linear ${delay}ms 1 both`, 
        active += 1, name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || "").split(", "), next = previous.filter(name ? anim => anim.indexOf(name) < 0 : anim => -1 === anim.indexOf("__svelte")), deleted = previous.length - next.length;
        deleted && (node.style.animation = next.join(", "), active -= deleted, active || raf(() => {
            active || (active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                for (;i--; ) stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            }), active_docs.clear());
        }));
    }
    function create_animation(node, from, fn, params) {
        if (!from) return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom) return noop;
        const {delay: delay = 0, duration: duration = 300, easing: easing = identity, start: start_time = now() + delay, end: end = start_time + duration, tick: tick = noop, css: css} = fn(node, {
            from: from,
            to: to
        }, params);
        let name, running = !0, started = !1;
        function stop() {
            css && delete_rule(node, name), running = !1;
        }
        return loop(now => {
            if (!started && now >= start_time && (started = !0), started && now >= end && (tick(1, 0), 
            stop()), !running) return !1;
            if (started) {
                const t = 0 + 1 * easing((now - start_time) / duration);
                tick(t, 1 - t);
            }
            return !0;
        }), css && (name = create_rule(node, 0, 1, duration, delay, easing, css)), delay || (started = !0), 
        tick(0, 1), stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if ("absolute" !== style.position && "fixed" !== style.position) {
            const {width: width, height: height} = style, a = node.getBoundingClientRect();
            node.style.position = "absolute", node.style.width = width, node.style.height = height, 
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node), transform = "none" === style.transform ? "" : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component) throw new Error("Function called outside component initialization");
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        callbacks && callbacks.slice().forEach(fn => fn(event));
    }
    const dirty_components = [], intros = {
        enabled: !1
    }, binding_callbacks = [], render_callbacks = [], flush_callbacks = [], resolved_promise = Promise.resolve();
    let update_scheduled = !1;
    function schedule_update() {
        update_scheduled || (update_scheduled = !0, resolved_promise.then(flush));
    }
    function tick() {
        return schedule_update(), resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = !1;
    const seen_callbacks = new Set;
    function flush() {
        if (!flushing) {
            flushing = !0;
            do {
                for (let i = 0; i < dirty_components.length; i += 1) {
                    const component = dirty_components[i];
                    set_current_component(component), update(component.$$);
                }
                for (dirty_components.length = 0; binding_callbacks.length; ) binding_callbacks.pop()();
                for (let i = 0; i < render_callbacks.length; i += 1) {
                    const callback = render_callbacks[i];
                    seen_callbacks.has(callback) || (seen_callbacks.add(callback), callback());
                }
                render_callbacks.length = 0;
            } while (dirty_components.length);
            for (;flush_callbacks.length; ) flush_callbacks.pop()();
            update_scheduled = !1, flushing = !1, seen_callbacks.clear();
        }
    }
    function update($$) {
        if (null !== $$.fragment) {
            $$.update(), run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [ -1 ], $$.fragment && $$.fragment.p($$.ctx, dirty), $$.after_update.forEach(add_render_callback);
        }
    }
    let promise;
    function wait() {
        return promise || (promise = Promise.resolve(), promise.then(() => {
            promise = null;
        })), promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
    }
    const outroing = new Set;
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros
        };
    }
    function check_outros() {
        outros.r || run_all(outros.c), outros = outros.p;
    }
    function transition_in(block, local) {
        block && block.i && (outroing.delete(block), block.i(local));
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block)) return;
            outroing.add(block), outros.c.push(() => {
                outroing.delete(block), callback && (detach && block.d(1), callback());
            }), block.o(local);
        }
    }
    const null_transition = {
        duration: 0
    };
    function create_in_transition(node, fn, params) {
        let animation_name, task, config = fn(node, params), running = !1, uid = 0;
        function cleanup() {
            animation_name && delete_rule(node, animation_name);
        }
        function go() {
            const {delay: delay = 0, duration: duration = 300, easing: easing = identity, tick: tick = noop, css: css} = config || null_transition;
            css && (animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++)), 
            tick(0, 1);
            const start_time = now() + delay, end_time = start_time + duration;
            task && task.abort(), running = !0, add_render_callback(() => dispatch(node, !0, "start")), 
            task = loop(now => {
                if (running) {
                    if (now >= end_time) return tick(1, 0), dispatch(node, !0, "end"), cleanup(), running = !1;
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = !1;
        return {
            start() {
                started || (delete_rule(node), is_function(config) ? (config = config(), wait().then(go)) : go());
            },
            invalidate() {
                started = !1;
            },
            end() {
                running && (cleanup(), running = !1);
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let animation_name, config = fn(node, params), running = !0;
        const group = outros;
        function go() {
            const {delay: delay = 0, duration: duration = 300, easing: easing = identity, tick: tick = noop, css: css} = config || null_transition;
            css && (animation_name = create_rule(node, 1, 0, duration, delay, easing, css));
            const start_time = now() + delay, end_time = start_time + duration;
            add_render_callback(() => dispatch(node, !1, "start")), loop(now => {
                if (running) {
                    if (now >= end_time) return tick(0, 1), dispatch(node, !1, "end"), --group.r || run_all(group.c), 
                    !1;
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        return group.r += 1, is_function(config) ? wait().then(() => {
            config = config(), go();
        }) : go(), {
            end(reset) {
                reset && config.tick && config.tick(1, 0), running && (animation_name && delete_rule(node, animation_name), 
                running = !1);
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params), t = intro ? 0 : 1, running_program = null, pending_program = null, animation_name = null;
        function clear_animation() {
            animation_name && delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            return duration *= Math.abs(d), {
                a: t,
                b: program.b,
                d: d,
                duration: duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const {delay: delay = 0, duration: duration = 300, easing: easing = identity, tick: tick = noop, css: css} = config || null_transition, program = {
                start: now() + delay,
                b: b
            };
            b || (program.group = outros, outros.r += 1), running_program ? pending_program = program : (css && (clear_animation(), 
            animation_name = create_rule(node, t, b, duration, delay, easing, css)), b && tick(0, 1), 
            running_program = init(program, duration), add_render_callback(() => dispatch(node, b, "start")), 
            loop(now => {
                if (pending_program && now > pending_program.start && (running_program = init(pending_program, duration), 
                pending_program = null, dispatch(node, running_program.b, "start"), css && (clear_animation(), 
                animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css))), 
                running_program) if (now >= running_program.end) tick(t = running_program.b, 1 - t), 
                dispatch(node, running_program.b, "end"), pending_program || (running_program.b ? clear_animation() : --running_program.group.r || run_all(running_program.group.c)), 
                running_program = null; else if (now >= running_program.start) {
                    const p = now - running_program.start;
                    t = running_program.a + running_program.d * easing(p / running_program.duration), 
                    tick(t, 1 - t);
                }
                return !(!running_program && !pending_program);
            }));
        }
        return {
            run(b) {
                is_function(config) ? wait().then(() => {
                    config = config(), go(b);
                }) : go(b);
            },
            end() {
                clear_animation(), running_program = pending_program = null;
            }
        };
    }
    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token) return;
            info.resolved = value;
            let child_ctx = info.ctx;
            void 0 !== key && (child_ctx = child_ctx.slice(), child_ctx[key] = value);
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = !1;
            info.block && (info.blocks ? info.blocks.forEach((block, i) => {
                i !== index && block && (group_outros(), transition_out(block, 1, 1, () => {
                    info.blocks[i] = null;
                }), check_outros());
            }) : info.block.d(1), block.c(), transition_in(block, 1), block.m(info.mount(), info.anchor), 
            needs_flush = !0), info.block = block, info.blocks && (info.blocks[index] = block), 
            needs_flush && flush();
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            if (promise.then(value => {
                set_current_component(current_component), update(info.then, 1, info.value, value), 
                set_current_component(null);
            }, error => {
                set_current_component(current_component), update(info.catch, 2, info.error, error), 
                set_current_component(null);
            }), info.current !== info.pending) return update(info.pending, 0), !0;
        } else {
            if (info.current !== info.then) return update(info.then, 1, info.value, promise), 
            !0;
            info.resolved = promise;
        }
    }
    const globals = "undefined" != typeof window ? window : "undefined" != typeof globalThis ? globalThis : global;
    function destroy_block(block, lookup) {
        block.d(1), lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_destroy_block(block, lookup) {
        block.f(), destroy_block(block, lookup);
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f(), outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length, n = list.length, i = o;
        const old_indexes = {};
        for (;i--; ) old_indexes[old_blocks[i].key] = i;
        const new_blocks = [], new_lookup = new Map, deltas = new Map;
        for (i = n; i--; ) {
            const child_ctx = get_context(ctx, list, i), key = get_key(child_ctx);
            let block = lookup.get(key);
            block ? dynamic && block.p(child_ctx, dirty) : (block = create_each_block(key, child_ctx), 
            block.c()), new_lookup.set(key, new_blocks[i] = block), key in old_indexes && deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set, did_move = new Set;
        function insert(block) {
            transition_in(block, 1), block.m(node, next, lookup.has(block.key)), lookup.set(block.key, block), 
            next = block.first, n--;
        }
        for (;o && n; ) {
            const new_block = new_blocks[n - 1], old_block = old_blocks[o - 1], new_key = new_block.key, old_key = old_block.key;
            new_block === old_block ? (next = new_block.first, o--, n--) : new_lookup.has(old_key) ? !lookup.has(new_key) || will_move.has(new_key) ? insert(new_block) : did_move.has(old_key) ? o-- : deltas.get(new_key) > deltas.get(old_key) ? (did_move.add(new_key), 
            insert(new_block)) : (will_move.add(old_key), o--) : (destroy(old_block, lookup), 
            o--);
        }
        for (;o--; ) {
            const old_block = old_blocks[o];
            new_lookup.has(old_block.key) || destroy(old_block, lookup);
        }
        for (;n; ) insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set;
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) throw new Error("Cannot have duplicate keys in a keyed each");
            keys.add(key);
        }
    }
    function get_spread_update(levels, updates) {
        const update = {}, to_null_out = {}, accounted_for = {
            $$scope: 1
        };
        let i = levels.length;
        for (;i--; ) {
            const o = levels[i], n = updates[i];
            if (n) {
                for (const key in o) key in n || (to_null_out[key] = 1);
                for (const key in n) accounted_for[key] || (update[key] = n[key], accounted_for[key] = 1);
                levels[i] = n;
            } else for (const key in o) accounted_for[key] = 1;
        }
        for (const key in to_null_out) key in update || (update[key] = void 0);
        return update;
    }
    function get_spread_object(spread_props) {
        return "object" == typeof spread_props && null !== spread_props ? spread_props : {};
    }
    const boolean_attributes = new Set([ "allowfullscreen", "allowpaymentrequest", "async", "autofocus", "autoplay", "checked", "controls", "default", "defer", "disabled", "formnovalidate", "hidden", "ismap", "loop", "multiple", "muted", "nomodule", "novalidate", "open", "playsinline", "readonly", "required", "reversed", "selected" ]), invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
    function spread(args, classes_to_add) {
        const attributes = Object.assign({}, ...args);
        classes_to_add && (null == attributes.class ? attributes.class = classes_to_add : attributes.class += " " + classes_to_add);
        let str = "";
        return Object.keys(attributes).forEach(name => {
            if (invalid_attribute_name_character.test(name)) return;
            const value = attributes[name];
            !0 === value ? str += " " + name : boolean_attributes.has(name.toLowerCase()) ? value && (str += " " + name) : null != value && (str += ` ${name}="${String(value).replace(/"/g, "&#34;").replace(/'/g, "&#39;")}"`);
        }), str;
    }
    const escaped = {
        '"': "&quot;",
        "'": "&#39;",
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    };
    function escape(html) {
        return String(html).replace(/["'&<>]/g, match => escaped[match]);
    }
    function each(items, fn) {
        let str = "";
        for (let i = 0; i < items.length; i += 1) str += fn(items[i], i);
        return str;
    }
    const missing_component = {
        $$render: () => ""
    };
    function validate_component(component, name) {
        if (!component || !component.$$render) throw "svelte:component" === name && (name += " this={...}"), 
        new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
        return component;
    }
    function debug(file, line, column, values) {
        return console.log(`{@debug} ${file ? file + " " : ""}(${line}:${column})`), console.log(values), 
        "";
    }
    let on_destroy, SvelteElement;
    function create_ssr_component(fn) {
        function $$render(result, props, bindings, slots) {
            const parent_component = current_component;
            set_current_component({
                $$: {
                    on_destroy: on_destroy,
                    context: new Map(parent_component ? parent_component.$$.context : []),
                    on_mount: [],
                    before_update: [],
                    after_update: [],
                    callbacks: blank_object()
                }
            });
            const html = fn(result, props, bindings, slots);
            return set_current_component(parent_component), html;
        }
        return {
            render: (props = {}, options = {}) => {
                on_destroy = [];
                const result = {
                    title: "",
                    head: "",
                    css: new Set
                }, html = $$render(result, props, {}, options);
                return run_all(on_destroy), {
                    html: html,
                    css: {
                        code: Array.from(result.css).map(css => css.code).join("\n"),
                        map: null
                    },
                    head: result.title + result.head
                };
            },
            $$render: $$render
        };
    }
    function add_attribute(name, value, boolean) {
        return null == value || boolean && !value ? "" : ` ${name}${!0 === value ? "" : "=" + ("string" == typeof value ? JSON.stringify(escape(value)) : `"${value}"`)}`;
    }
    function add_classes(classes) {
        return classes ? ` class="${classes}"` : "";
    }
    function bind(component, name, callback) {
        const index = component.$$.props[name];
        void 0 !== index && (component.$$.bound[index] = callback, callback(component.$$.ctx[index]));
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor) {
        const {fragment: fragment, on_mount: on_mount, on_destroy: on_destroy, after_update: after_update} = component.$$;
        fragment && fragment.m(target, anchor), add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            on_destroy ? on_destroy.push(...new_on_destroy) : run_all(new_on_destroy), component.$$.on_mount = [];
        }), after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        null !== $$.fragment && (run_all($$.on_destroy), $$.fragment && $$.fragment.d(detaching), 
        $$.on_destroy = $$.fragment = null, $$.ctx = []);
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [ -1 ]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {}, $$ = component.$$ = {
            fragment: null,
            ctx: null,
            props: props,
            update: noop,
            not_equal: not_equal,
            bound: blank_object(),
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            callbacks: blank_object(),
            dirty: dirty
        };
        let ready = !1;
        if ($$.ctx = instance ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            return $$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value) && ($$.bound[i] && $$.bound[i](value), 
            ready && function(component, i) {
                -1 === component.$$.dirty[0] && (dirty_components.push(component), schedule_update(), 
                component.$$.dirty.fill(0)), component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
            }(component, i)), ret;
        }) : [], $$.update(), ready = !0, run_all($$.before_update), $$.fragment = !!create_fragment && create_fragment($$.ctx), 
        options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                $$.fragment && $$.fragment.l(nodes), nodes.forEach(detach);
            } else $$.fragment && $$.fragment.c();
            options.intro && transition_in(component.$$.fragment), mount_component(component, options.target, options.anchor), 
            flush();
        }
        set_current_component(parent_component);
    }
    "function" == typeof HTMLElement && (SvelteElement = class extends HTMLElement {
        constructor() {
            super(), this.attachShadow({
                mode: "open"
            });
        }
        connectedCallback() {
            for (const key in this.$$.slotted) this.appendChild(this.$$.slotted[key]);
        }
        attributeChangedCallback(attr, _oldValue, newValue) {
            this[attr] = newValue;
        }
        $destroy() {
            destroy_component(this, 1), this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
            return callbacks.push(callback), () => {
                const index = callbacks.indexOf(callback);
                -1 !== index && callbacks.splice(index, 1);
            };
        }
        $set() {}
    });
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1), this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
            return callbacks.push(callback), () => {
                const index = callbacks.indexOf(callback);
                -1 !== index && callbacks.splice(index, 1);
            };
        }
        $set() {}
    }
    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({
            version: "3.22.3"
        }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", {
            target: target,
            node: node
        }), append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", {
            target: target,
            node: node,
            anchor: anchor
        }), insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", {
            node: node
        }), detach(node);
    }
    function detach_between_dev(before, after) {
        for (;before.nextSibling && before.nextSibling !== after; ) detach_dev(before.nextSibling);
    }
    function detach_before_dev(after) {
        for (;after.previousSibling; ) detach_dev(after.previousSibling);
    }
    function detach_after_dev(before) {
        for (;before.nextSibling; ) detach_dev(before.nextSibling);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = !0 === options ? [ "capture" ] : options ? Array.from(Object.keys(options)) : [];
        has_prevent_default && modifiers.push("preventDefault"), has_stop_propagation && modifiers.push("stopPropagation"), 
        dispatch_dev("SvelteDOMAddEventListener", {
            node: node,
            event: event,
            handler: handler,
            modifiers: modifiers
        });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", {
                node: node,
                event: event,
                handler: handler,
                modifiers: modifiers
            }), dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value), null == value ? dispatch_dev("SvelteDOMRemoveAttribute", {
            node: node,
            attribute: attribute
        }) : dispatch_dev("SvelteDOMSetAttribute", {
            node: node,
            attribute: attribute,
            value: value
        });
    }
    function prop_dev(node, property, value) {
        node[property] = value, dispatch_dev("SvelteDOMSetProperty", {
            node: node,
            property: property,
            value: value
        });
    }
    function dataset_dev(node, property, value) {
        node.dataset[property] = value, dispatch_dev("SvelteDOMSetDataset", {
            node: node,
            property: property,
            value: value
        });
    }
    function set_data_dev(text, data) {
        data = "" + data, text.data !== data && (dispatch_dev("SvelteDOMSetData", {
            node: text,
            data: data
        }), text.data = data);
    }
    function validate_each_argument(arg) {
        if (!("string" == typeof arg || arg && "object" == typeof arg && "length" in arg)) {
            let msg = "{#each} only iterates over array-like objects.";
            throw "function" == typeof Symbol && arg && Symbol.iterator in arg && (msg += " You can use a spread to convert this iterable into an array."), 
            new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) ~keys.indexOf(slot_key) || console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || !options.target && !options.$$inline) throw new Error("'target' is a required option");
            super();
        }
        $destroy() {
            super.$destroy(), this.$destroy = () => {
                console.warn("Component was already destroyed");
            };
        }
        $capture_state() {}
        $inject_state() {}
    }
    function loop_guard(timeout) {
        const start = Date.now();
        return () => {
            if (Date.now() - start > timeout) throw new Error("Infinite loop detected");
        };
    }
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _utils_format__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
    function create_fragment(ctx) {
        let li, strong, t0, t1, t2, t3, t4, t3_value = Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.formatNumber)(ctx[1], ctx[2]) + "";
        return {
            c() {
                li = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("li"), strong = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("strong"), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[0]), t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(":"), 
                t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t3_value), 
                t4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[3]);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, li, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(li, strong), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(strong, t0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(strong, t1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(li, t2), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(li, t3), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(li, t4);
            },
            p(ctx, [dirty]) {
                1 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t0, ctx[0]), 
                6 & dirty && t3_value !== (t3_value = Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.formatNumber)(ctx[1], ctx[2]) + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t3, t3_value), 
                8 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t4, ctx[3]);
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(li);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {label: label} = $$props, {value: value} = $$props, {precision: precision = 2} = $$props, {suffix: suffix = ""} = $$props;
        return $$self.$set = $$props => {
            "label" in $$props && $$invalidate(0, label = $$props.label), "value" in $$props && $$invalidate(1, value = $$props.value), 
            "precision" in $$props && $$invalidate(2, precision = $$props.precision), "suffix" in $$props && $$invalidate(3, suffix = $$props.suffix);
        }, [ label, value, precision, suffix ];
    }
    class ProfileLine extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            super(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                label: 0,
                value: 1,
                precision: 2,
                suffix: 3
            });
        }
    }
    __webpack_exports__.default = ProfileLine;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "formatNumberWithSuffix", (function() {
        return formatNumberWithSuffix;
    })), __webpack_require__.d(__webpack_exports__, "formatNumber", (function() {
        return formatNumber;
    })), __webpack_require__.d(__webpack_exports__, "formatDate", (function() {
        return formatDate;
    }));
    var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
    function formatNumberWithSuffix(num, suffix) {
        return (num ? formatNumber(num) : "-") + (num && suffix ? suffix : "");
    }
    function formatNumber(num) {
        var digits = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 2, addSign = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
        return (addSign && num > 0 ? "+" : "") + num.toLocaleString(_config__WEBPACK_IMPORTED_MODULE_0__.default.COUNTRY, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    }
    function formatDate(val) {
        var rtf = new Intl.RelativeTimeFormat(_config__WEBPACK_IMPORTED_MODULE_0__.default.COUNTRY, {
            localeMatcher: "best fit",
            numeric: "auto",
            style: "long"
        }), diffInSecs = (Date.now() - dateFromString(val)) / 1e3;
        return diffInSecs < 60 ? rtf.format(-Math.ceil(diffInSecs), "second") : diffInSecs < 3600 ? rtf.format(-Math.ceil(diffInSecs / 60), "minute") : diffInSecs < 86400 ? rtf.format(-Math.ceil(diffInSecs / 3600), "hour") : diffInSecs < 2592e3 ? rtf.format(-Math.ceil(diffInSecs / 86400), "day") : diffInSecs < 31536e3 ? rtf.format(-Math.ceil(diffInSecs / 2592e3), "month") : rtf.format(-Math.floor(diffInSecs / 31536e3), "year");
    }
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_exports__.default = {
        COUNTRY: "pl",
        SSE_CHECK_DELAY: 500
    };
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _utils_format__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4), _pp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7);
    function create_else_block(ctx) {
        let span, t;
        return {
            c() {
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[2]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "class", "err svelte-wvtsq");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t);
            },
            p(ctx, dirty) {
                4 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, ctx[2]);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span);
            }
        };
    }
    function create_if_block(ctx) {
        let span, t0, t1;
        return {
            c() {
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[1]), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("\n    raw pp new play");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor);
            },
            p(ctx, dirty) {
                2 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t0, ctx[1]);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1);
            }
        };
    }
    function create_fragment(ctx) {
        let strong0, input, t1, strong1, t3, if_block_anchor, dispose;
        function select_block_type(ctx, dirty) {
            return ctx[2].length ? create_else_block : create_if_block;
        }
        let current_block_type = select_block_type(ctx), if_block = current_block_type(ctx);
        return {
            c() {
                strong0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("strong"), 
                strong0.textContent = "+", input = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("input"), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), strong1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("strong"), 
                strong1.textContent = "pp:", t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "class", "pp-boundary svelte-wvtsq");
            },
            m(target, anchor, remount) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, strong0, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, input, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_input_value)(input, ctx[0]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, strong1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t3, anchor), 
                if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                remount && dispose(), dispose = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(input, "input", ctx[4]);
            },
            p(ctx, [dirty]) {
                1 & dirty && input.value !== ctx[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_input_value)(input, ctx[0]), 
                current_block_type === (current_block_type = select_block_type(ctx)) && if_block ? if_block.p(ctx, dirty) : (if_block.d(1), 
                if_block = current_block_type(ctx), if_block && (if_block.c(), if_block.m(if_block_anchor.parentNode, if_block_anchor)));
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(strong0), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(input), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(strong1), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t3), if_block.d(detaching), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor), 
                dispose();
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {scores: scores} = $$props, expectedStr = "1,00", rawPp = "???", error = "";
        return $$self.$set = $$props => {
            "scores" in $$props && $$invalidate(3, scores = $$props.scores);
        }, $$self.$$.update = () => {
            9 & $$self.$$.dirty && (/^\s*\d+((,|.)\d+)?$/.test(expectedStr) ? ($$invalidate(1, rawPp = Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.formatNumber)(Object(_pp__WEBPACK_IMPORTED_MODULE_2__.findRawPp)(scores, parseFloat(expectedStr.replace(/\s/, "").replace(",", "."))))), 
            $$invalidate(2, error = "")) : $$invalidate(2, error = `Wpisz może jakąś liczbę, ok? 1 jest liczbą, 10 jest, a nawet 100. Ale "${expectedStr}"?`));
        }, [ expectedStr, rawPp, error, scores, function() {
            expectedStr = this.value, $$invalidate(0, expectedStr);
        } ];
    }
    class ProfilePpCalc extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-wvtsq-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-wvtsq-style", 
            style.textContent = ".pp-boundary.svelte-wvtsq{border:none;background:transparent;font-weight:700;font-size:1rem;width:3rem;text-align:center;margin-right:.25rem;outline:none}.err.svelte-wvtsq{color:red}", 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                scores: 3
            });
        }
    }
    __webpack_exports__.default = ProfilePpCalc;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    function calcPp(scores) {
        var startIdx = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
        return scores.reduce((cum, pp, idx) => cum + Math.pow(.965, idx + startIdx) * pp, 0);
    }
    function calcRawPpAtIdx(bottomScores, idx, expected) {
        return (expected + calcPp(bottomScores, idx) - calcPp(bottomScores, idx + 1)) / Math.pow(.965, idx);
    }
    function findRawPp(scores, expected) {
        if (!scores.length) return expected;
        for (var idx = scores.length - 1; idx >= 0; ) {
            var bottomSlice = scores.slice(idx), bottomPp = calcPp(bottomSlice, idx);
            if (bottomSlice.unshift(scores[idx]), calcPp(bottomSlice, idx) - bottomPp > expected) return calcRawPpAtIdx(scores.slice(idx + 1), idx + 1, expected);
            idx--;
        }
        return calcRawPpAtIdx(scores, 0, expected);
    }
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "calcPp", (function() {
        return calcPp;
    })), __webpack_require__.d(__webpack_exports__, "calcRawPpAtIdx", (function() {
        return calcRawPpAtIdx;
    })), __webpack_require__.d(__webpack_exports__, "findRawPp", (function() {
        return findRawPp;
    }));
}, function(module, exports, __webpack_require__) {
    var monkey = __webpack_require__(9);
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
    var header = __webpack_require__(10);
    module.exports.config = {
        entry: "./src/index.js"
    }, module.exports.header = header, module.exports.buildedHeader = () => {
        var headerString = [];
        for (var headerKey in headerString.push("// ==UserScript=="), header) if (Array.isArray(header[headerKey])) for (var p in header[headerKey].length > 0 && headerString.push("//"), 
        header[headerKey]) headerString.push("// @" + headerKey.padEnd(13) + header[headerKey][p]); else headerString.push("// @" + headerKey.padEnd(13) + header[headerKey]);
        return headerString.push("// ==/UserScript=="), headerString.push(""), headerString.join("\n");
    };
}, function(module) {
    module.exports = JSON.parse('{"name":"ScoreSaber country leaderboard","namespace":"https://motzel.dev","version":"0.6.9.3","description":"Add country leaderboard tab","author":"motzel","icon":"https://scoresaber.com/imports/images/logo.ico","updateURL":"https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/dist/scoresaber-country-leaderboard.user.js","downloadURL":"https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/dist/scoresaber-country-leaderboard.user.js","supportURL":"https://github.com/motzel/ScoreSaberCountryLeaderboard/issues","match":["https://scoresaber.com/leaderboard/*","https://scoresaber.com/u/*"],"include":["/^https://scoresaber\\\\.com\\\\/global(\\\\/\\\\d+&country=pl|\\\\?country=pl)/"],"require":["https://cdnjs.cloudflare.com/ajax/libs/localforage/1.7.3/localforage.min.js"],"grant":["GM_addStyle","GM_info","GM_xmlhttpRequest"],"run-at":"document-end"}');
}, function(module, exports, __webpack_require__) {
    (exports = __webpack_require__(12)(!1)).push([ module.i, '.navbar-brand .navbar-item b{background:#fff;background:-webkit-gradient(left top,left bottom,color-stop(0,#fff),color-stop(55%,#fff),color-stop(55%,red),color-stop(100%,#ff1500));background:linear-gradient(180deg,#fff 0,#fff 55%,red 0,#ff1500);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#ffffff",endColorstr="#ff1500",GradientType=0);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.sspl .player-name{font-size:1.1rem;font-weight:700}.sspl .diff.inc{color:#42b129!important}.sspl .diff.dec{color:#f94022!important}#new-rankeds{margin-bottom:2rem}#new-rankeds td,#new-rankeds th{text-align:center}#new-rankeds tbody tr td:first-child{text-align:left}.what-if{position:absolute;top:1em;right:0;font-weight:700;padding:0}table.ranking.songs th.score,table.ranking td.pp{position:relative}table.ranking tbody tr.hidden{opacity:.05}.content table.ranking.global.sspl .diff,.content table.ranking.global.sspl .pp{text-align:center}.box .tabs a{border-bottom:none}.box .tabs li:hover{border-bottom:1px solid #000;margin-bottom:-1px}.tabs li.is-active{border-bottom:1px solid #3273dc;margin-bottom:-1px}img.bloodtrail{height:24px}.sspl .rank small{font-size:.75rem;margin-left:.5rem;color:#d3d3d3}.sspl .rank span{display:inline-block;width:1.5rem;text-align:right}.text-center{text-align:center}#sspl progress{width:20rem;max-width:90%}#ssplrefresh{text-align:right;margin-bottom:1rem}#ssplrefresh button,#ssplrefresh strong{margin-right:.5rem}.offset_tab{margin-left:auto}', "" ]), 
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
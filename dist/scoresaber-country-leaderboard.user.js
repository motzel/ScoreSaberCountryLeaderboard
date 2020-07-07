// ==UserScript==
// @name         ScoreSaber country leaderboard
// @namespace    https://motzel.dev
// @version      0.8.1
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
    var _Svelte_Components_Player_Profile_svelte__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1), _Svelte_Components_Country_Ranking_svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(31), _Svelte_Components_Song_Leaderboard_svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(36), _Svelte_Components_Song_WhatIfPp_svelte__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(39), _Svelte_Components_SsEnhance_Score_svelte__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(50), _Svelte_Components_Common_Refresh_svelte__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(40), _Svelte_Components_Song_Browser_svelte__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(51), _utils_logger__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(10), _temp__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(5), _store__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(9), _utils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(15), _song__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(24), _eastereggs__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(25), _scoresaber_players__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(27);
    __webpack_require__(29), __webpack_require__(8), __webpack_require__(6), __webpack_require__(4);
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
    var getLeaderboardId = () => Object(_utils_js__WEBPACK_IMPORTED_MODULE_10__.getFirstRegexpMatch)(/\/leaderboard\/(\d+)(\?page=.*)?#?/, window.location.href.toLowerCase()), getSongHash = () => {
        var _document$querySelect;
        return null === (_document$querySelect = document.querySelector(".title~b")) || void 0 === _document$querySelect ? void 0 : _document$querySelect.innerText;
    }, isLeaderboardPage = () => null !== getLeaderboardId(), getProfileId = () => Object(_utils_js__WEBPACK_IMPORTED_MODULE_10__.getFirstRegexpMatch)(/\u\/(\d+)((\?|&).*)?$/, window.location.href.toLowerCase()), isProfilePage = () => null !== getProfileId(), isCountryRankingPage = () => [ "https://scoresaber.com/global?country=" + _temp__WEBPACK_IMPORTED_MODULE_8__.default.COUNTRY, "https://scoresaber.com/global/1&country=" + _temp__WEBPACK_IMPORTED_MODULE_8__.default.COUNTRY ].indexOf(window.location.href) >= 0;
    function assert(el) {
        if (null === el) throw new Error("Assertion failed");
        return el;
    }
    function getBySelector(sel) {
        var el = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
        return assert((null != el ? el : document).querySelector(sel));
    }
    function setupPlTable() {
        return _setupPlTable.apply(this, arguments);
    }
    function _setupPlTable() {
        return (_setupPlTable = _asyncToGenerator((function*() {
            var scoreTableNode = getBySelector(".ranking table.global"), leaderboardId = getLeaderboardId(), leaderboard = yield Object(_song__WEBPACK_IMPORTED_MODULE_11__.getLeaderboard)(getSongHash(), leaderboardId);
            if (null == leaderboard ? void 0 : leaderboard.length) {
                var tblContainer = document.createElement("div");
                tblContainer.id = "sspl", tblContainer.style.display = "none", scoreTableNode.parentNode.appendChild(tblContainer);
                var songLeaderboard = new _Svelte_Components_Song_Leaderboard_svelte__WEBPACK_IMPORTED_MODULE_2__.default({
                    target: tblContainer,
                    props: {
                        leaderboardId: leaderboardId,
                        leaderboard: leaderboard
                    }
                });
                songLeaderboard.$on("data-refreshed", function() {
                    var _ref = _asyncToGenerator((function*(_) {
                        var leaderboard = yield Object(_song__WEBPACK_IMPORTED_MODULE_11__.getLeaderboard)(getSongHash(), leaderboardId);
                        songLeaderboard.$set({
                            leaderboard: leaderboard
                        });
                    }));
                    return function(_x2) {
                        return _ref.apply(this, arguments);
                    };
                }());
            }
            return leaderboard;
        }))).apply(this, arguments);
    }
    function setupLeaderboard() {
        return _setupLeaderboard.apply(this, arguments);
    }
    function _setupLeaderboard() {
        return (_setupLeaderboard = _asyncToGenerator((function*() {
            _utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.info("Setup leaderboard page");
            var leaderboardId = getLeaderboardId();
            if (leaderboardId) {
                var leaderboard = yield setupPlTable();
                if (leaderboard && leaderboard.length) getBySelector(".tabs > ul").appendChild(generate_tab("pl_tab", null === document.querySelector(".filter_tab"))), 
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
                }), Object(_temp__WEBPACK_IMPORTED_MODULE_8__.getMainUserId)() && [].forEach.call(document.querySelectorAll(".scoreTop.ppValue"), function() {
                    var _ref2 = _asyncToGenerator((function*(span) {
                        var pp = parseFloat(span.innerText.replace(/\s/, "").replace(",", "."));
                        pp && pp > 0 + Number.EPSILON && new _Svelte_Components_Song_WhatIfPp_svelte__WEBPACK_IMPORTED_MODULE_3__.default({
                            target: span.parentNode,
                            props: {
                                leaderboardId: leaderboardId,
                                pp: pp
                            }
                        });
                    }));
                    return function(_x3) {
                        return _ref2.apply(this, arguments);
                    };
                }()), _utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.info("Setup leaderboard page / Done");
            }
        }))).apply(this, arguments);
    }
    function setupChart() {
        _utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.info("Setup chart");
        var chart = document.getElementById("rankChart");
        if (chart) {
            var history = Object(_utils_js__WEBPACK_IMPORTED_MODULE_10__.getFirstRegexpMatch)(/data:\s*\[([0-9,]+)\]/, document.body.innerHTML);
            if (history) {
                chart.parentNode.innerHTML = '<canvas class="chartjs-render-monitor" id="rankChart"></canvas>';
                new Chart(document.getElementById("rankChart"), {
                    responsive: !0,
                    onResize: function(chart, size) {
                        chart.resize(), chart.render(!0);
                    },
                    type: "line",
                    data: {
                        labels: Array(50).fill(0).map((v, i) => 0 === i ? "now" : 1 === i ? "yesterday" : i + " days ago").reverse(),
                        datasets: [ {
                            data: history.split(","),
                            label: "Rank",
                            borderColor: "#3e95cd",
                            fill: !1
                        } ]
                    },
                    options: {
                        maintainAspectRatio: !1,
                        title: {
                            display: !1
                        },
                        tooltips: {
                            mode: "index",
                            intersect: !1
                        },
                        hover: {
                            mode: "nearest",
                            intersect: !0
                        },
                        scales: {
                            yAxes: [ {
                                ticks: {
                                    reverse: !0,
                                    userCallback: function(label, index, labels) {
                                        if (Math.floor(label) === label) return label;
                                    }
                                }
                            } ]
                        }
                    }
                });
                _utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.info("Setup chart / Done");
            }
        }
    }
    function setupProfile() {
        return _setupProfile.apply(this, arguments);
    }
    function _setupProfile() {
        return (_setupProfile = _asyncToGenerator((function*() {
            var _data$users2, _data$users2$profileI;
            _utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.info("Setup profile page"), "loading" == document.readyState ? document.addEventListener("DOMContentLoaded", () => {
                setupChart();
            }) : setupChart();
            var profileId = getProfileId();
            if (profileId) {
                var data = yield Object(_store__WEBPACK_IMPORTED_MODULE_9__.getCacheAndConvertIfNeeded)(), tbl = document.querySelector("table.ranking");
                tbl && tbl.classList.add("sspl"), (yield Promise.all([ ...document.querySelectorAll("table.ranking tbody tr") ].map(function() {
                    var _ref3 = _asyncToGenerator((function*(tr) {
                        var _data$users, _data$users$profileId, _data$users$profileId2, ret = {
                            tr: tr
                        }, rank = tr.querySelector("th.rank");
                        if (rank) {
                            var rankMatch = Object(_utils_js__WEBPACK_IMPORTED_MODULE_10__.getFirstRegexpMatch)(/#(\d+)/, rank.innerText);
                            ret.rank = rankMatch ? parseInt(rankMatch, 10) : null;
                        } else ret.rank = null;
                        var song = tr.querySelector("th.song a");
                        if (song) {
                            var leaderboardMatch = Object(_utils_js__WEBPACK_IMPORTED_MODULE_10__.getFirstRegexpMatch)(/leaderboard\/(\d+)/, song.href);
                            ret.leaderboardId = leaderboardMatch ? parseInt(leaderboardMatch, 10) : null;
                        } else ret.leaderboardId = null;
                        var img = tr.querySelector("th.song img");
                        ret.songImg = img ? img.src : null;
                        var songPp = tr.querySelector("th.song a .songTop.pp"), songMatch = songPp ? songPp.innerHTML.match(/^(.*?)\s*<span[^>]+>(.*?)<\/span>/) : null;
                        songMatch ? (ret.songName = songMatch[1], ret.songDiff = songMatch[2]) : ret = Object.assign(ret, {
                            songName: null,
                            songDiff: null
                        });
                        var songMapper = tr.querySelector("th.song a .songTop.mapper");
                        ret.songMapper = songMapper ? songMapper.innerText : null;
                        var songDate = tr.querySelector("th.song span.songBottom.time");
                        ret.timeset = songDate ? songDate.title : null;
                        var pp = tr.querySelector("th.score .scoreTop.ppValue");
                        pp && (ret.pp = parseFloat(pp.innerText));
                        var ppWeighted = tr.querySelector("th.score .scoreTop.ppWeightedValue"), ppWeightedMatch = ppWeighted ? Object(_utils_js__WEBPACK_IMPORTED_MODULE_10__.getFirstRegexpMatch)(/^\(([0-9.]+)pp\)$/, ppWeighted.innerText) : null;
                        ret.ppWeighted = ppWeightedMatch ? parseFloat(ppWeightedMatch) : null;
                        var scoreInfo = tr.querySelector("th.score .scoreBottom"), scoreInfoMatch = scoreInfo ? scoreInfo.innerText.match(/^([^:]+):\s*([0-9,.]+)(?:.*?\((.*?)\))?/) : null;
                        if (scoreInfoMatch) switch (scoreInfoMatch[1]) {
                          case "score":
                            ret.percent = null, ret.mods = scoreInfoMatch[3] ? scoreInfoMatch[3] : "", ret.score = parseFloat(scoreInfoMatch[2].replace(/[^0-9.]/g, ""));
                            break;

                          case "accuracy":
                            ret.score = null, ret.mods = scoreInfoMatch[3] ? scoreInfoMatch[3] : "", ret.percent = parseFloat(scoreInfoMatch[2].replace(/[^0-9.]/g, "")) / 100;
                        }
                        var leaderboard = null === (_data$users = data.users) || void 0 === _data$users || null === (_data$users$profileId = _data$users[profileId]) || void 0 === _data$users$profileId || null === (_data$users$profileId2 = _data$users$profileId.scores) || void 0 === _data$users$profileId2 ? void 0 : _data$users$profileId2[ret.leaderboardId];
                        if (leaderboard) try {
                            var maxSongScore = yield Object(_song__WEBPACK_IMPORTED_MODULE_11__.getSongMaxScore)(leaderboard.id, leaderboard.diff);
                            !ret.percent && ret.score && (ret.percent = maxSongScore ? ret.score / maxSongScore : leaderboard.maxScoreEx ? ret.score / leaderboard.maxScoreEx : null), 
                            !ret.score && ret.percent && (ret.score = maxSongScore || leaderboard.maxScoreEx ? Math.round(ret.percent * (maxSongScore || leaderboard.maxScoreEx)) : null), 
                            ret.hidden = Object(_eastereggs__WEBPACK_IMPORTED_MODULE_12__.shouldBeHidden)(Object.assign({}, leaderboard, {
                                id: leaderboard.playerId,
                                percent: leaderboard.percent
                            }));
                            var history = leaderboard.history && leaderboard.history.length ? leaderboard.history[0] : null;
                            ret.prevRank = history ? history.rank : null, ret.prevPp = history ? history.pp : null, 
                            ret.prevScore = history ? history.score : null, ret.prevTimeset = history ? new Date(Date.parse(history.rank)) : null, 
                            ret.prevPercent = history && ret.prevScore ? maxSongScore ? ret.prevScore / maxSongScore : leaderboard.maxScoreEx ? ret.prevScore / leaderboard.maxScoreEx : null : null;
                        } catch (e) {}
                        return ret;
                    }));
                    return function(_x4) {
                        return _ref3.apply(this, arguments);
                    };
                }()))).filter(s => null !== s.tr).forEach(s => {
                    var score = s.tr.querySelector(".score");
                    score && (score.innerHTML = "", new _Svelte_Components_SsEnhance_Score_svelte__WEBPACK_IMPORTED_MODULE_4__.default({
                        target: score,
                        props: {
                            song: s
                        }
                    }));
                });
                var stats = document.querySelector(".content .column ul");
                if (stats && (null === (_data$users2 = data.users) || void 0 === _data$users2 || null === (_data$users2$profileI = _data$users2[profileId]) || void 0 === _data$users2$profileI ? void 0 : _data$users2$profileI.stats)) {
                    var _data$users$profileId3, _data$users3;
                    new _Svelte_Components_Player_Profile_svelte__WEBPACK_IMPORTED_MODULE_0__.default({
                        target: stats,
                        props: {
                            profile: null !== (_data$users$profileId3 = null === (_data$users3 = data.users) || void 0 === _data$users3 ? void 0 : _data$users3[profileId]) && void 0 !== _data$users$profileId3 ? _data$users$profileId3 : null
                        }
                    });
                    var column = stats.closest(".column");
                    if (column) {
                        var div = document.createElement("div");
                        div.style.marginTop = "1em", div.style.textAlign = "center";
                        var button = document.createElement("button");
                        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1.04em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1056 1024"><path d="M1037 429L934 276l51-179q5-18-8.5-31.5T945 57l-178 52L612 6q-15-11-32-2.5T562 31l-5 186l-147 115q-6 5-9.5 13t-1.5 17q0 3 1.5 6.5t3 6t4 5t5.5 4.5t6 3l138 49q-3 2-3 3L23 969q-6 6-8 14.5t0 16.5t8 15q10 9 23 9t23-9l530-531q3-3 5-7l54 148q7 17 25 20q3 1 5 1q16 0 26-13l113-147l184-7q9 0 16.5-4.5T1039 462q8-17-2-33zm-227-6q-15 0-24 12l-88 113l-49-134q-5-14-19-19l-134-49l112-88q4-3 6.5-6.5t4-8t1.5-9.5l5-143l118 80q13 8 27 4l137-40l-39 137q-1 3-1 6v5.5l.5 5.5l2 5.5l2.5 4.5l81 118z" fill="#626262"/><rect x="0" y="0" width="1056" height="1024" fill="rgba(0, 0, 0, 0)" /></svg> &nbsp;Transformuj', 
                        button.addEventListener("click", e => {
                            var content = document.querySelector(".content .box .rankChart").closest(".content"), songBox = content.querySelector(".box:nth-child(2)");
                            if (songBox) {
                                var box = document.createElement("div");
                                box.classList.add("box"), box.classList.add("has-shadow"), content.insertBefore(box, songBox), 
                                new _Svelte_Components_Song_Browser_svelte__WEBPACK_IMPORTED_MODULE_6__.default({
                                    target: box,
                                    props: {
                                        playerId: profileId
                                    }
                                }), songBox.remove(), e.target.remove();
                            }
                        }), div.appendChild(button), column.appendChild(div);
                    }
                }
                var header = document.querySelector(".content .column h5");
                if (header) {
                    var refreshDiv = document.createElement("div");
                    refreshDiv.classList.add("refresh"), header.appendChild(refreshDiv), new _Svelte_Components_Common_Refresh_svelte__WEBPACK_IMPORTED_MODULE_5__.default({
                        target: refreshDiv,
                        props: {}
                    }).$on("data-refreshed", function() {
                        var _ref4 = _asyncToGenerator((function*(_) {
                            window.location.reload(!1);
                        }));
                        return function(_x5) {
                            return _ref4.apply(this, arguments);
                        };
                    }());
                }
                _utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.info("Setup profile page / Done");
            }
        }))).apply(this, arguments);
    }
    function setupCountryRanking() {
        return _setupCountryRanking.apply(this, arguments);
    }
    function _setupCountryRanking() {
        return (_setupCountryRanking = _asyncToGenerator((function*() {
            var _yield$getCacheAndCon;
            _utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.info("Setup country ranking");
            var users = null === (_yield$getCacheAndCon = yield Object(_store__WEBPACK_IMPORTED_MODULE_9__.getCacheAndConvertIfNeeded)()) || void 0 === _yield$getCacheAndCon ? void 0 : _yield$getCacheAndCon.users;
            if (users) {
                var origTable = getBySelector("table.ranking.global"), pagination = getBySelector(".pagination", origTable.parentNode.parentNode), typeSel = document.createElement("select");
                typeSel.classList.add("type"), [ {
                    value: "sspl",
                    text: "Cached"
                }, {
                    value: "original",
                    text: "Original"
                } ].map(o => {
                    var option = document.createElement("option");
                    option.selected = "sspl" === o.value, option.value = o.value, option.text = o.text, 
                    typeSel.appendChild(option);
                }), pagination.insertBefore(typeSel, getBySelector("br", pagination)), typeSel.addEventListener("change", e => Array.prototype.slice.apply(e.target.closest(".box").querySelectorAll("table.ranking.global")).map(tbl => tbl.style.display = tbl.classList.contains(e.target.options[e.target.selectedIndex].value) ? "" : "none")), 
                origTable.style.display = "none", origTable.classList.add("original"), new _Svelte_Components_Country_Ranking_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
                    target: origTable.parentNode,
                    props: {
                        users: Object(_scoresaber_players__WEBPACK_IMPORTED_MODULE_13__.mapUsersToObj)(Object(_scoresaber_players__WEBPACK_IMPORTED_MODULE_13__.filterByCountry)(users), users)
                    }
                }), _utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.info("Setup country ranking / Done");
            }
        }))).apply(this, arguments);
    }
    function generate_tab(css_id, has_offset) {
        var tabClass = "filter_tab sspl " + (has_offset ? " offset_tab" : ""), li = document.createElement("li");
        li.id = css_id, tabClass.split(" ").filter(cls => cls.length).map(cls => li.classList.add(cls));
        var a = document.createElement("a");
        a.classList.add("has-text-info");
        var img = document.createElement("img");
        return img.classList.add("bloodtrail"), img.src = __webpack_require__(57).default, 
        a.appendChild(img), li.appendChild(a), a.addEventListener("click", () => {
            document.querySelectorAll(".tabs > ul .filter_tab").forEach(x => x.classList.remove("is-active")), 
            assert(document.getElementById(css_id)).classList.add("is-active");
        }), li;
    }
    function setupStyles() {
        _utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.info("Setup styles"), (GM_addStyle || (() => {}))(__webpack_require__(58).toString());
        (getComputedStyle(document.documentElement).getPropertyValue("--foreground").length ? [ [ "hover", "#444" ] ] : [ [ "background", "white" ], [ "foreground", "white" ], [ "textColor", "#4a4a4a" ], [ "ppColour", "#6772E5" ], [ "alternate", "#3273dc" ], [ "hover", "#ddd" ] ]).map(s => document.documentElement.style.setProperty("--" + s[0], s[1]));
    }
    function setupDelayed() {
        return _setupDelayed.apply(this, arguments);
    }
    function _setupDelayed() {
        return (_setupDelayed = _asyncToGenerator((function*() {
            initialized = !0, isLeaderboardPage() && (yield waitForSSEInit(_temp__WEBPACK_IMPORTED_MODULE_8__.default.SSE_CHECK_DELAY), 
            yield setupLeaderboard());
        }))).apply(this, arguments);
    }
    function checkElement(selector) {
        return null === document.querySelector(selector) ? new Promise(resolve => {
            requestAnimationFrame(resolve);
        }).then(() => checkElement(selector)) : Promise.resolve(!0);
    }
    function waitForSSEInit(_x) {
        return _waitForSSEInit.apply(this, arguments);
    }
    function _waitForSSEInit() {
        return (_waitForSSEInit = _asyncToGenerator((function*(timeout) {
            return _utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.info("Waiting for SSE initialization"), 
            new Promise((function(resolve, reject) {
                checkElement("#all_scores_tab").then(el => resolve(el)), setTimeout(() => resolve(null), timeout);
            }));
        }))).apply(this, arguments);
    }
    var initialized = !1;
    function _init() {
        return (_init = _asyncToGenerator((function*() {
            if (_utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.info("init"), !initialized) {
                yield Object(_store__WEBPACK_IMPORTED_MODULE_9__.getCacheAndConvertIfNeeded)();
                setupStyles(), isProfilePage() && setupProfile(), isCountryRankingPage() && setupCountryRanking(), 
                yield setupDelayed(), _utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.info("Setup complete");
            }
        }))).apply(this, arguments);
    }
    !function() {
        _init.apply(this, arguments);
    }();
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _ProfileLine_svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3), _ProfilePpCalc_svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7);
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
    })), __webpack_require__.d(__webpack_exports__, "substituteVars", (function() {
        return substituteVars;
    })), __webpack_require__.d(__webpack_exports__, "round", (function() {
        return round;
    })), __webpack_require__.d(__webpack_exports__, "roundToPrecision", (function() {
        return roundToPrecision;
    }));
    var _temp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5), _date__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
    function formatNumberWithSuffix(num, suffix) {
        var digits = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 2, addSign = arguments.length > 3 && void 0 !== arguments[3] && arguments[3];
        return (num ? formatNumber(num, digits, addSign) : "-") + (num && suffix ? suffix : "");
    }
    function formatNumber(num) {
        var digits = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 2, addSign = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
        return (addSign && num > 0 ? "+" : "") + num.toLocaleString(_temp__WEBPACK_IMPORTED_MODULE_0__.default.COUNTRY, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    }
    function formatDate(val) {
        var rtf = new Intl.RelativeTimeFormat(_temp__WEBPACK_IMPORTED_MODULE_0__.default.COUNTRY, {
            localeMatcher: "best fit",
            numeric: "auto",
            style: "long"
        }), diffInSecs = (Date.now() - Object(_date__WEBPACK_IMPORTED_MODULE_1__.dateFromString)(val)) / 1e3;
        return diffInSecs < 60 ? rtf.format(-Math.ceil(diffInSecs), "second") : diffInSecs < 3600 ? rtf.format(-Math.ceil(diffInSecs / 60), "minute") : diffInSecs < 86400 ? rtf.format(-Math.ceil(diffInSecs / 3600), "hour") : diffInSecs < 2592e3 ? rtf.format(-Math.ceil(diffInSecs / 86400), "day") : diffInSecs < 31536e3 ? rtf.format(-Math.ceil(diffInSecs / 2592e3), "month") : rtf.format(-Math.floor(diffInSecs / 31536e3), "year");
    }
    function substituteVars(url, vars) {
        return Object.keys(vars).reduce((cum, key) => cum.replace(new RegExp("\\${" + key + "}", "gi"), vars[key]), url);
    }
    var round = function(val) {
        var places = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 2, mult = Math.pow(10, places);
        return Math.round((val + Number.EPSILON) * mult) / mult;
    };
    function roundToPrecision(num) {
        var precision = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : .1;
        return round(Math.floor(num / precision) * precision);
    }
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    function getMainUserId() {
        var user = localStorage.getItem("home_user");
        return user ? JSON.parse(user).id : null;
    }
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "getMainUserId", (function() {
        return getMainUserId;
    })), __webpack_exports__.default = {
        COUNTRY: "pl",
        SSE_CHECK_DELAY: 500
    };
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "DAY", (function() {
        return DAY;
    })), __webpack_require__.d(__webpack_exports__, "toUTCDate", (function() {
        return toUTCDate;
    })), __webpack_require__.d(__webpack_exports__, "dayTrunc", (function() {
        return dayTrunc;
    })), __webpack_require__.d(__webpack_exports__, "daysAgo", (function() {
        return daysAgo;
    })), __webpack_require__.d(__webpack_exports__, "getFirstNotNewerThan", (function() {
        return getFirstNotNewerThan;
    })), __webpack_require__.d(__webpack_exports__, "dateFromString", (function() {
        return dateFromString;
    }));
    var DAY = 864e5;
    function toUTCDate(date) {
        var year = date.getUTCFullYear(), month = date.getUTCMonth(), day = date.getUTCDate();
        return Date.UTC(year, month, day, 0, 0, 0, 0);
    }
    function dayTrunc(date) {
        return (date = date instanceof Date ? date : dateFromString(date)).setHours(0), 
        date.setMinutes(0), date.setSeconds(0), date.setMilliseconds(0), date;
    }
    var daysAgo = days => new Date((new Date).getTime() - days * DAY), getFirstNotNewerThan = (timestamp, arr) => arr.map(t => parseInt(t)).sort((a, b) => b - a).reduce((val, t) => null === val && t <= timestamp ? t : val, null), dateFromString = str => str ? new Date(Date.parse(str)) : null;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _utils_format__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4), _scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8), _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(30);
    function get_each_context(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[7] = list[i], child_ctx;
    }
    function get_each_context_1(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[7] = list[i], child_ctx;
    }
    function create_else_block(ctx) {
        let span, t;
        return {
            c() {
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[2]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "class", "err svelte-1s29rw0");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t);
            },
            p(ctx, dirty) {
                4 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, ctx[2]);
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span);
            }
        };
    }
    function create_if_block(ctx) {
        let span, t0, table, thead, tr0, t1, tbody, tr1, current, each_blocks_1 = [], each0_lookup = new Map, each_blocks = [], each1_lookup = new Map;
        const value = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_3__.default({
            props: {
                value: ctx[1]
            }
        });
        let each_value_1 = ctx[3];
        const get_key = ctx => ctx[7];
        for (let i = 0; i < each_value_1.length; i += 1) {
            let child_ctx = get_each_context_1(ctx, each_value_1, i), key = get_key(child_ctx);
            each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
        }
        let each_value = ctx[3];
        const get_key_1 = ctx => ctx[7];
        for (let i = 0; i < each_value.length; i += 1) {
            let child_ctx = get_each_context(ctx, each_value, i), key = get_key_1(child_ctx);
            each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
        }
        return {
            c() {
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("\n    raw pp new play\n\n    "), 
                table = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("table"), thead = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("thead"), 
                tr0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tr");
                for (let i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].c();
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), tbody = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tbody"), 
                tr1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tr");
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(table, "class", "svelte-1s29rw0");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, span, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t0, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, table, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table, thead), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(thead, tr0);
                for (let i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].m(tr0, null);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table, t1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table, tbody), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tbody, tr1);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(tr1, null);
                current = !0;
            },
            p(ctx, dirty) {
                const value_changes = {};
                if (2 & dirty && (value_changes.value = ctx[1]), value.$set(value_changes), 8 & dirty) {
                    const each_value_1 = ctx[3];
                    each_blocks_1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, tr0, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_block, create_each_block_1, null, get_each_context_1);
                }
                if (10 & dirty) {
                    const each_value = ctx[3];
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), each_blocks = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, tr1, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.outro_and_destroy_block, create_each_block, null, get_each_context), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
                }
            },
            i(local) {
                if (!current) {
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local);
                    for (let i = 0; i < each_value.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i]);
                    current = !0;
                }
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local);
                for (let i = 0; i < each_blocks.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i]);
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t0), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(table);
                for (let i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].d();
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
            }
        };
    }
    function create_each_block_1(key_1, ctx) {
        let th, t0, t1, t0_value = ctx[7] + "";
        return {
            key: key_1,
            first: null,
            c() {
                th = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("th"), t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t0_value), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("%"), this.first = th;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, th, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(th, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(th, t1);
            },
            p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(th);
            }
        };
    }
    function create_each_block(key_1, ctx) {
        let th, current;
        const value = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_3__.default({
            props: {
                value: ctx[1] / _scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.PP_PER_STAR / Object(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.ppFromScore)(ctx[7]),
                suffix: "*"
            }
        });
        return {
            key: key_1,
            first: null,
            c() {
                th = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("th"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                this.first = th;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, th, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, th, null), 
                current = !0;
            },
            p(ctx, dirty) {
                const value_changes = {};
                2 & dirty && (value_changes.value = ctx[1] / _scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.PP_PER_STAR / Object(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.ppFromScore)(ctx[7])), 
                value.$set(value_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(th), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value);
            }
        };
    }
    function create_fragment(ctx) {
        let strong0, input, t1, strong1, t3, current_block_type_index, if_block, if_block_anchor, current, dispose;
        const if_block_creators = [ create_if_block, create_else_block ], if_blocks = [];
        function select_block_type(ctx, dirty) {
            return ctx[2].length ? 1 : 0;
        }
        return current_block_type_index = select_block_type(ctx), if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
        {
            c() {
                strong0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("strong"), 
                strong0.textContent = "+", input = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("input"), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), strong1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("strong"), 
                strong1.textContent = "pp:", t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "class", "pp-boundary svelte-1s29rw0");
            },
            m(target, anchor, remount) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, strong0, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, input, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_input_value)(input, ctx[0]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, strong1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t3, anchor), 
                if_blocks[current_block_type_index].m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0, remount && dispose(), dispose = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(input, "input", ctx[6]);
            },
            p(ctx, [dirty]) {
                1 & dirty && input.value !== ctx[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_input_value)(input, ctx[0]);
                let previous_block_index = current_block_type_index;
                current_block_type_index = select_block_type(ctx), current_block_type_index === previous_block_index ? if_blocks[current_block_type_index].p(ctx, dirty) : (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_blocks[previous_block_index], 1, 1, () => {
                    if_blocks[previous_block_index] = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)(), if_block = if_blocks[current_block_type_index], 
                if_block || (if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
                if_block.c()), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor));
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(strong0), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(input), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(strong1), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t3), if_blocks[current_block_type_index].d(detaching), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor), 
                dispose();
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {scores: scores = []} = $$props, expectedStr = "1,00", rawPp = null, rawPpFormatted = "???", error = "";
        return $$self.$set = $$props => {
            "scores" in $$props && $$invalidate(4, scores = $$props.scores);
        }, $$self.$$.update = () => {
            19 & $$self.$$.dirty && (/^\s*\d+((,|.)\d+)?$/.test(expectedStr) ? ($$invalidate(1, rawPp = Object(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.findRawPp)(scores, parseFloat(expectedStr.replace(/\s/, "").replace(",", ".")))), 
            rawPpFormatted = Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.formatNumber)(rawPp), 
            $$invalidate(2, error = "")) : $$invalidate(2, error = `Wpisz może jakąś liczbę, ok? 1 jest liczbą, 10 jest, a nawet 100. Ale "${expectedStr}"?`));
        }, [ expectedStr, rawPp, error, [ 90, 91, 92, 93, 94, 95 ], scores, rawPpFormatted, function() {
            expectedStr = this.value, $$invalidate(0, expectedStr);
        } ];
    }
    class ProfilePpCalc extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-1s29rw0-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-1s29rw0-style", 
            style.textContent = ".pp-boundary.svelte-1s29rw0{border:none;background:transparent;font-weight:700;font-size:1rem;width:3rem;text-align:center;margin-right:.25rem;outline:none}.err.svelte-1s29rw0{color:red}table.svelte-1s29rw0{width:auto}", 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                scores: 4
            });
        }
    }
    __webpack_exports__.default = ProfilePpCalc;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "calcPp", (function() {
        return calcPp;
    })), __webpack_require__.d(__webpack_exports__, "calcRawPpAtIdx", (function() {
        return calcRawPpAtIdx;
    })), __webpack_require__.d(__webpack_exports__, "findRawPp", (function() {
        return findRawPp;
    })), __webpack_require__.d(__webpack_exports__, "getTotalPp", (function() {
        return getTotalPp;
    })), __webpack_require__.d(__webpack_exports__, "getTotalUserPp", (function() {
        return getTotalUserPp;
    })), __webpack_require__.d(__webpack_exports__, "getWeightedPp", (function() {
        return getWeightedPp;
    })), __webpack_require__.d(__webpack_exports__, "getWhatIfScore", (function() {
        return getWhatIfScore;
    })), __webpack_require__.d(__webpack_exports__, "getUserScores", (function() {
        return getUserScores;
    })), __webpack_require__.d(__webpack_exports__, "getUserSongScore", (function() {
        return getUserSongScore;
    })), __webpack_require__.d(__webpack_exports__, "getAllRankedsWithUserScores", (function() {
        return getAllRankedsWithUserScores;
    })), __webpack_require__.d(__webpack_exports__, "getEstimatedAcc", (function() {
        return getEstimatedAcc;
    })), __webpack_require__.d(__webpack_exports__, "PP_PER_STAR", (function() {
        return PP_PER_STAR;
    })), __webpack_require__.d(__webpack_exports__, "ppFromScore", (function() {
        return ppFromScore;
    }));
    var _store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9), _utils_date__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6), _rankeds__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(29);
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
    function getTotalPp(scores) {
        return Object.values(scores).filter(s => s.pp > 0).map(s => s.pp).sort((a, b) => b - a).reduce((cum, pp, idx) => cum + Math.pow(.965, idx) * pp, 0);
    }
    function getTotalUserPp(_x) {
        return _getTotalUserPp.apply(this, arguments);
    }
    function _getTotalUserPp() {
        return (_getTotalUserPp = _asyncToGenerator((function*(userId) {
            var _yield$getCacheAndCon, _yield$getCacheAndCon2, modifiedScores = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            return getTotalPp(Object.assign({}, null === (_yield$getCacheAndCon = (yield Object(_store__WEBPACK_IMPORTED_MODULE_0__.getCacheAndConvertIfNeeded)()).users) || void 0 === _yield$getCacheAndCon || null === (_yield$getCacheAndCon2 = _yield$getCacheAndCon[userId]) || void 0 === _yield$getCacheAndCon2 ? void 0 : _yield$getCacheAndCon2.scores, modifiedScores));
        }))).apply(this, arguments);
    }
    function getWeightedPp(scores, leaderboardId) {
        var alreadySortedArray = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], sortedScores = alreadySortedArray ? scores : Object.values(scores).filter(s => s.pp > 0).sort((a, b) => b.pp - a.pp);
        for (var idx in sortedScores) if (sortedScores[idx].leaderboardId === leaderboardId) return Math.pow(.965, idx) * sortedScores[idx].pp;
        return null;
    }
    function getWhatIfScore(_x2, _x3, _x4) {
        return _getWhatIfScore.apply(this, arguments);
    }
    function _getWhatIfScore() {
        return (_getWhatIfScore = _asyncToGenerator((function*(userId, leaderboardId, pp) {
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
        }))).apply(this, arguments);
    }
    function getUserScores(_x5) {
        return _getUserScores.apply(this, arguments);
    }
    function _getUserScores() {
        return (_getUserScores = _asyncToGenerator((function*(userId) {
            var _yield$getCacheAndCon3, _yield$getCacheAndCon4;
            return null === (_yield$getCacheAndCon3 = (yield Object(_store__WEBPACK_IMPORTED_MODULE_0__.getCacheAndConvertIfNeeded)()).users) || void 0 === _yield$getCacheAndCon3 || null === (_yield$getCacheAndCon4 = _yield$getCacheAndCon3[userId]) || void 0 === _yield$getCacheAndCon4 ? void 0 : _yield$getCacheAndCon4.scores;
        }))).apply(this, arguments);
    }
    function getUserSongScore(_x6, _x7) {
        return _getUserSongScore.apply(this, arguments);
    }
    function _getUserSongScore() {
        return (_getUserSongScore = _asyncToGenerator((function*(userId, leaderboardId) {
            var _yield$getUserScores;
            return null === (_yield$getUserScores = yield getUserScores(userId)) || void 0 === _yield$getUserScores ? void 0 : _yield$getUserScores[leaderboardId];
        }))).apply(this, arguments);
    }
    function getAllRankedsWithUserScores(_x8) {
        return _getAllRankedsWithUserScores.apply(this, arguments);
    }
    function _getAllRankedsWithUserScores() {
        return (_getAllRankedsWithUserScores = _asyncToGenerator((function*(userId) {
            var _yield$getCacheAndCon5, _yield$getCacheAndCon6, _yield$getCacheAndCon7, rankedMaps = yield Object(_rankeds__WEBPACK_IMPORTED_MODULE_2__.getRankedSongs)(), userScores = null === (_yield$getCacheAndCon5 = yield Object(_store__WEBPACK_IMPORTED_MODULE_0__.getCacheAndConvertIfNeeded)()) || void 0 === _yield$getCacheAndCon5 || null === (_yield$getCacheAndCon6 = _yield$getCacheAndCon5.users) || void 0 === _yield$getCacheAndCon6 || null === (_yield$getCacheAndCon7 = _yield$getCacheAndCon6[userId]) || void 0 === _yield$getCacheAndCon7 ? void 0 : _yield$getCacheAndCon7.scores;
            return userScores ? Object.values(userScores).filter(s => s.pp > 0).map(s => {
                var _rankedMaps$s$leaderb;
                return Object.assign({}, s, {
                    timeset: Object(_utils_date__WEBPACK_IMPORTED_MODULE_1__.dateFromString)(s.timeset),
                    stars: null == rankedMaps || null === (_rankedMaps$s$leaderb = rankedMaps[s.leaderboardId]) || void 0 === _rankedMaps$s$leaderb ? void 0 : _rankedMaps$s$leaderb.stars,
                    acc: s.score / s.maxScoreEx
                });
            }).filter(s => s.stars).sort((a, b) => b.pp - a.pp) : [];
        }))).apply(this, arguments);
    }
    function getEstimatedAcc(stars, scores) {
        var now = Date.now(), maxStars = Math.max(...scores.map(e => e.stars)), data = scores.reduce((o, score) => {
            var d = 2 * Math.abs(stars - score.stars), front = stars > score.stars ? d * d * d : 1, timeset = score.timeset || now, weight = 1 / (1 + d * (1 + Math.max(now - timeset, 0) / 1296e6) * front);
            return o.weight += weight, o.sum += score.acc * weight, o;
        }, {
            weight: 0,
            sum: 0
        }), result = data.weight ? data.sum / data.weight : 0;
        if (stars > maxStars) {
            var d = 2 * Math.abs(stars - maxStars);
            result /= 1 + d * d;
        }
        return result;
    }
    var PP_PER_STAR = 42.114296, ppCurve = [ {
        at: 0,
        value: 0
    }, {
        at: 45,
        value: .015
    }, {
        at: 50,
        value: .03
    }, {
        at: 55,
        value: .06
    }, {
        at: 60,
        value: .105
    }, {
        at: 65,
        value: .16
    }, {
        at: 68,
        value: .24
    }, {
        at: 70,
        value: .285
    }, {
        at: 80,
        value: .563
    }, {
        at: 84,
        value: .695
    }, {
        at: 88,
        value: .826
    }, {
        at: 94.5,
        value: 1.015
    }, {
        at: 95,
        value: 1.046
    }, {
        at: 100,
        value: 1.12
    }, {
        at: 110,
        value: 1.18
    }, {
        at: 114,
        value: 1.25
    } ];
    function ppFromScore(score) {
        if (!score || score <= 0) return 0;
        var index = ppCurve.findIndex(o => o.at >= score);
        if (-1 === index) return ppCurve[ppCurve.length - 1].value;
        if (!index) return ppCurve[0].value;
        var from = ppCurve[index - 1], to = ppCurve[index], progress = (score - from.at) / (to.at - from.at);
        return from.value + (to.value - from.value) * progress;
    }
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "Globals", (function() {
        return Globals;
    })), __webpack_require__.d(__webpack_exports__, "lastUpdated", (function() {
        return lastUpdated;
    })), __webpack_require__.d(__webpack_exports__, "isAnyData", (function() {
        return isAnyData;
    })), __webpack_require__.d(__webpack_exports__, "getCacheAndConvertIfNeeded", (function() {
        return getCacheAndConvertIfNeeded;
    })), __webpack_require__.d(__webpack_exports__, "setCache", (function() {
        return setCache;
    }));
    var _utils_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10), _network_scoresaber_rankeds__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(13), _utils_date__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
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
    var Globals = {
        data: null
    }, getCache = function() {
        var _ref = _asyncToGenerator((function*() {
            return new Promise((resolve, reject) => window.localforage.getItem("sspl_users", (function(err, value) {
                resolve(value);
            })));
        }));
        return function() {
            return _ref.apply(this, arguments);
        };
    }(), lastUpdated = function() {
        var _ref2 = _asyncToGenerator((function*() {
            return (yield getCacheAndConvertIfNeeded()).lastUpdated;
        }));
        return function() {
            return _ref2.apply(this, arguments);
        };
    }(), isAnyData = function() {
        var _ref3 = _asyncToGenerator((function*() {
            return yield getCacheAndConvertIfNeeded(), Globals.data && Object.keys(Globals.data.users).length;
        }));
        return function() {
            return _ref3.apply(this, arguments);
        };
    }();
    function getCacheAndConvertIfNeeded() {
        return _getCacheAndConvertIfNeeded.apply(this, arguments);
    }
    function _getCacheAndConvertIfNeeded() {
        return (_getCacheAndConvertIfNeeded = _asyncToGenerator((function*() {
            var _yield$getCache;
            if (Globals.data) return Globals.data;
            _utils_logger__WEBPACK_IMPORTED_MODULE_0__.default.info("Data fetch from cache");
            var cache = null !== (_yield$getCache = yield getCache()) && void 0 !== _yield$getCache ? _yield$getCache : {
                version: 1.2,
                lastUpdated: null,
                users: {},
                rankedSongs: null,
                rankedSongsLastUpdated: null
            };
            if (1 === cache.version) {
                var allRankeds = yield Object(_network_scoresaber_rankeds__WEBPACK_IMPORTED_MODULE_1__.fetchRankedSongsArray)(), nanomoriApproached = !1;
                cache.rankedSongs = Object(_network_scoresaber_rankeds__WEBPACK_IMPORTED_MODULE_1__.convertFetchedRankedSongsToObj)(allRankeds.filter(s => (221711 === s.leaderboardId && (nanomoriApproached = !0), 
                nanomoriApproached))), cache.version = 1.1, cache.rankedSongsLastUpdated = JSON.parse(JSON.stringify(new Date));
            }
            if (1.1 === cache.version) {
                var resetDateTimestamp = Date.parse("2020-06-17T00:00:00.000Z");
                if (Object(_utils_date__WEBPACK_IMPORTED_MODULE_2__.dateFromString)(cache.lastUpdated).getTime() > resetDateTimestamp) {
                    cache.lastUpdated = "2020-06-17T00:00:00.000Z";
                    var userLastUpdated = Object(_utils_date__WEBPACK_IMPORTED_MODULE_2__.dateFromString)(cache.lastUpdated);
                    Object.values(cache.users).map(u => u.lastUpdated = userLastUpdated);
                }
                cache.version = 1.2;
            }
            return Globals.data = cache, cache;
        }))).apply(this, arguments);
    }
    function setCache(_x) {
        return _setCache.apply(this, arguments);
    }
    function _setCache() {
        return (_setCache = _asyncToGenerator((function*(value) {
            return Globals.data = value, window.localforage.setItem("sspl_users", value);
        }))).apply(this, arguments);
    }
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var _monkey_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11), _monkey_config__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_monkey_config__WEBPACK_IMPORTED_MODULE_0__);
    __webpack_exports__.default = {
        info: message => console.info("[".concat(_monkey_config__WEBPACK_IMPORTED_MODULE_0___default.a.header.name, "]"), message),
        debug: message => console.debug("[".concat(_monkey_config__WEBPACK_IMPORTED_MODULE_0___default.a.header.name, "]"), message),
        warn: message => console.warn("[".concat(_monkey_config__WEBPACK_IMPORTED_MODULE_0___default.a.header.name, "]"), message),
        error: message => console.error("[".concat(_monkey_config__WEBPACK_IMPORTED_MODULE_0___default.a.header.name, "]"), message)
    };
}, function(module, exports, __webpack_require__) {
    var header = __webpack_require__(12);
    module.exports.config = {
        entry: "./src/index.js"
    }, module.exports.header = header, module.exports.buildedHeader = () => {
        var headerString = [];
        for (var headerKey in headerString.push("// ==UserScript=="), header) if (Array.isArray(header[headerKey])) for (var p in header[headerKey].length > 0 && headerString.push("//"), 
        header[headerKey]) headerString.push("// @" + headerKey.padEnd(13) + header[headerKey][p]); else headerString.push("// @" + headerKey.padEnd(13) + header[headerKey]);
        return headerString.push("// ==/UserScript=="), headerString.push(""), headerString.join("\n");
    };
}, function(module) {
    module.exports = JSON.parse('{"name":"ScoreSaber country leaderboard","namespace":"https://motzel.dev","version":"0.8.1","description":"Add country leaderboard tab","author":"motzel","icon":"https://scoresaber.com/imports/images/logo.ico","updateURL":"https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/dist/scoresaber-country-leaderboard.user.js","downloadURL":"https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/dist/scoresaber-country-leaderboard.user.js","supportURL":"https://github.com/motzel/ScoreSaberCountryLeaderboard/issues","match":["https://scoresaber.com/leaderboard/*","https://scoresaber.com/u/*"],"include":["/^https://scoresaber\\\\.com\\\\/global(\\\\/\\\\d+&country=pl|\\\\?country=pl)/"],"require":["https://cdnjs.cloudflare.com/ajax/libs/localforage/1.7.3/localforage.min.js"],"grant":["GM_addStyle","GM_info","GM_xmlhttpRequest"],"run-at":"document-end"}');
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "convertFetchedRankedSongsToObj", (function() {
        return convertFetchedRankedSongsToObj;
    })), __webpack_require__.d(__webpack_exports__, "fetchRankedSongsArray", (function() {
        return fetchRankedSongsArray;
    })), __webpack_require__.d(__webpack_exports__, "fetchRankedSongs", (function() {
        return fetchRankedSongs;
    })), __webpack_require__.d(__webpack_exports__, "getNewlyRanked", (function() {
        return getNewlyRanked;
    }));
    var _fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14), _store__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9), _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(15), _consts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(16), _queue__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(17), _song__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(24);
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
    var convertFetchedRankedSongsToObj = songs => songs.length ? songs.reduce((cum, s) => (cum[s.leaderboardId] = s, 
    cum), {}) : null, fetchRankedSongsArray = function() {
        var _ref = _asyncToGenerator((function*() {
            return Object(_fetch__WEBPACK_IMPORTED_MODULE_0__.fetchApiPage)(_queue__WEBPACK_IMPORTED_MODULE_4__.default.SCORESABER, _consts__WEBPACK_IMPORTED_MODULE_3__.SCORESABER_URL + "/api.php?function=get-leaderboards&cat=1&page=1&limit=5000&ranked=1").then(songs => (null == songs ? void 0 : songs.songs) ? null == songs ? void 0 : songs.songs.map(s => ({
                leaderboardId: s.uid,
                id: s.id,
                name: s.name + " " + s.songSubName,
                songAuthor: s.songAuthorName,
                levelAuthor: s.levelAuthorName,
                diff: Object(_song__WEBPACK_IMPORTED_MODULE_5__.extractDiffAndType)(s.diff),
                stars: s.stars,
                oldStars: null
            })) : []);
        }));
        return function() {
            return _ref.apply(this, arguments);
        };
    }(), fetchRankedSongs = function() {
        var _ref2 = _asyncToGenerator((function*() {
            return convertFetchedRankedSongsToObj(yield fetchRankedSongsArray());
        }));
        return function() {
            return _ref2.apply(this, arguments);
        };
    }();
    function getNewlyRanked() {
        return _getNewlyRanked.apply(this, arguments);
    }
    function _getNewlyRanked() {
        return (_getNewlyRanked = _asyncToGenerator((function*() {
            var fetchedRankedSongs = yield fetchRankedSongs();
            if (!fetchedRankedSongs) return null;
            var data = yield Object(_store__WEBPACK_IMPORTED_MODULE_1__.getCacheAndConvertIfNeeded)(), oldRankedSongs = data.rankedSongs ? data.rankedSongs : {};
            return {
                allRanked: fetchedRankedSongs,
                newRanked: Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__.arrayIntersection)(Object.keys(fetchedRankedSongs), Object.keys(oldRankedSongs)).map(k => fetchedRankedSongs[k]),
                changed: Object.values(oldRankedSongs).filter(s => {
                    var _fetchedRankedSongs$s;
                    return s.stars !== (null == fetchedRankedSongs || null === (_fetchedRankedSongs$s = fetchedRankedSongs[s.leaderboardId]) || void 0 === _fetchedRankedSongs$s ? void 0 : _fetchedRankedSongs$s.stars);
                }).map(s => {
                    var _fetchedRankedSongs$s2;
                    return Object.assign({}, s, {
                        oldStars: s.stars,
                        stars: Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__.nullIfUndefined)(null == fetchedRankedSongs || null === (_fetchedRankedSongs$s2 = fetchedRankedSongs[s.leaderboardId]) || void 0 === _fetchedRankedSongs$s2 ? void 0 : _fetchedRankedSongs$s2.stars)
                    });
                })
            };
        }))).apply(this, arguments);
    }
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "delay", (function() {
        return delay;
    })), __webpack_require__.d(__webpack_exports__, "SsplError", (function() {
        return SsplError;
    })), __webpack_require__.d(__webpack_exports__, "TimeoutError", (function() {
        return TimeoutError;
    })), __webpack_require__.d(__webpack_exports__, "NotFoundError", (function() {
        return NotFoundError;
    })), __webpack_require__.d(__webpack_exports__, "queueRetriedPromise", (function() {
        return queueRetriedPromise;
    })), __webpack_require__.d(__webpack_exports__, "queueFetch", (function() {
        return queueFetch;
    })), __webpack_require__.d(__webpack_exports__, "queueFetchJson", (function() {
        return queueFetchJson;
    })), __webpack_require__.d(__webpack_exports__, "queueFetchHtml", (function() {
        return queueFetchHtml;
    })), __webpack_require__.d(__webpack_exports__, "fetchHtmlPage", (function() {
        return fetchHtmlPage;
    })), __webpack_require__.d(__webpack_exports__, "fetchApiPage", (function() {
        return fetchApiPage;
    }));
    var _utils_format__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
    function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            enumerableOnly && (symbols = symbols.filter((function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            }))), keys.push.apply(keys, symbols);
        }
        return keys;
    }
    function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = null != arguments[i] ? arguments[i] : {};
            i % 2 ? ownKeys(Object(source), !0).forEach((function(key) {
                _defineProperty(target, key, source[key]);
            })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach((function(key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            }));
        }
        return target;
    }
    function _defineProperty(obj, key, value) {
        return key in obj ? Object.defineProperty(obj, key, {
            value: value,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : obj[key] = value, obj;
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
    var delay = function() {
        var _ref = _asyncToGenerator((function*(time, val) {
            return new Promise(resolve => setTimeout(_ => resolve(val), time));
        }));
        return function(_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }();
    class SsplError extends Error {
        constructor(message) {
            super(message), this.name = "SsplError";
        }
    }
    class TimeoutError extends SsplError {
        constructor(timeout, message) {
            super(message), this.name = "TimeoutError", this.timeout = timeout;
        }
    }
    class NotFoundError extends SsplError {
        constructor(message) {
            super(message), this.name = "NotFoundError";
        }
    }
    function queueRetriedPromise(_x3, _x4) {
        return _queueRetriedPromise.apply(this, arguments);
    }
    function _queueRetriedPromise() {
        return (_queueRetriedPromise = _asyncToGenerator((function*(queue, promiseReturningFunc) {
            for (var error, abortController = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null, retries = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 3, result = void 0, i = 0; i < retries; i++) {
                try {
                    yield queue.add(() => promiseReturningFunc().then(r => result = r).catch(e => {
                        e instanceof SsplError && (i = retries), error = e;
                    }));
                } catch (t) {
                    console.warn(t.name), error = new TimeoutError(queue.timeout, "Your time has come"), 
                    abortController && abortController.abort && abortController.abort();
                }
                if (void 0 !== result) return Promise.resolve(result);
            }
            throw error;
        }))).apply(this, arguments);
    }
    function queueFetch(_x5, _x6, _x7) {
        return _queueFetch.apply(this, arguments);
    }
    function _queueFetch() {
        return (_queueFetch = _asyncToGenerator((function*(queue, url, options) {
            var rateLimitCallback = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null, controller = new AbortController, signal = controller.signal;
            return queueRetriedPromise(queue, () => window.fetch(url, _objectSpread(_objectSpread({}, options), {}, {
                signal: signal,
                mode: "cors"
            })).then(function() {
                var _ref4 = _asyncToGenerator((function*(response) {
                    if (429 === response.status) {
                        var rateLimitReset = parseInt(response.headers.get("x-ratelimit-reset"), 10), waitTimeForLimitReset = rateLimitReset && !isNaN(rateLimitReset) ? new Date(1e3 * rateLimitReset).getTime() - (new Date).getTime() : null;
                        if (waitTimeForLimitReset && waitTimeForLimitReset > 0) {
                            var intId, timer = waitTimeForLimitReset;
                            queue.pause(), rateLimitCallback && (intId = setInterval(_ => rateLimitCallback(timer -= 500), 500)), 
                            yield delay(waitTimeForLimitReset), rateLimitCallback && clearInterval(intId), queue.start();
                        }
                        throw new Error("Rate limit");
                    }
                    if ([ 404, 403 ].includes(response.status)) throw new NotFoundError("404 Not Found");
                    return response;
                }));
                return function(_x18) {
                    return _ref4.apply(this, arguments);
                };
            }()));
        }))).apply(this, arguments);
    }
    function queueFetchJson(_x8, _x9, _x10) {
        return _queueFetchJson.apply(this, arguments);
    }
    function _queueFetchJson() {
        return (_queueFetchJson = _asyncToGenerator((function*(queue, url, options) {
            var rateLimitCallback = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null;
            return queueFetch(queue, url, options, rateLimitCallback).then(response => response.json());
        }))).apply(this, arguments);
    }
    function queueFetchHtml(_x11, _x12, _x13) {
        return _queueFetchHtml.apply(this, arguments);
    }
    function _queueFetchHtml() {
        return (_queueFetchHtml = _asyncToGenerator((function*(queue, url, options) {
            return queueFetch(queue, url, options).then(response => response.text()).then(text => (new DOMParser).parseFromString(text, "text/html"));
        }))).apply(this, arguments);
    }
    var fetchHtmlPage = function() {
        var _ref2 = _asyncToGenerator((function*(queue, url) {
            var page = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1;
            return queueFetchHtml(queue, Object(_utils_format__WEBPACK_IMPORTED_MODULE_0__.substituteVars)(url, {
                page: page
            })).catch(_ => (new DOMParser).parseFromString("", "text/html"));
        }));
        return function(_x14, _x15) {
            return _ref2.apply(this, arguments);
        };
    }(), fetchApiPage = function() {
        var _ref3 = _asyncToGenerator((function*(queue, url) {
            var page = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1, rateLimitCallback = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null;
            return queueFetchJson(queue, Object(_utils_format__WEBPACK_IMPORTED_MODULE_0__.substituteVars)(url, {
                page: page
            }), {}, rateLimitCallback).catch(_ => null);
        }));
        return function(_x16, _x17) {
            return _ref3.apply(this, arguments);
        };
    }();
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "capitalize", (function() {
        return capitalize;
    })), __webpack_require__.d(__webpack_exports__, "isEmpty", (function() {
        return isEmpty;
    })), __webpack_require__.d(__webpack_exports__, "convertArrayToObjectByKey", (function() {
        return convertArrayToObjectByKey;
    })), __webpack_require__.d(__webpack_exports__, "arrayIntersection", (function() {
        return arrayIntersection;
    })), __webpack_require__.d(__webpack_exports__, "arrayUnique", (function() {
        return arrayUnique;
    })), __webpack_require__.d(__webpack_exports__, "nullIfUndefined", (function() {
        return nullIfUndefined;
    })), __webpack_require__.d(__webpack_exports__, "defaultIfFalsy", (function() {
        return defaultIfFalsy;
    })), __webpack_require__.d(__webpack_exports__, "getFirstRegexpMatch", (function() {
        return getFirstRegexpMatch;
    })), __webpack_require__.d(__webpack_exports__, "escapeHtml", (function() {
        return escapeHtml;
    })), __webpack_require__.d(__webpack_exports__, "isDateObject", (function() {
        return isDateObject;
    }));
    var capitalize = str => str.charAt(0).toUpperCase() + str.slice(1), isEmpty = obj => 0 === Object.keys(obj).length && obj.constructor === Object, convertArrayToObjectByKey = (arr, key) => arr.reduce((cum, item) => (cum[item[key]] = item, 
    cum), {}), arrayIntersection = (arr1, arr2) => arr1.filter(x => !arr2.includes(x)), arrayUnique = arr => [ ...new Set(arr) ], nullIfUndefined = val => void 0 !== val ? val : null, defaultIfFalsy = (val, def) => val || def, getFirstRegexpMatch = (regexp, str) => {
        var _ = regexp.exec(str);
        return _ ? _[1] : null;
    }, escapeHtml = unsafe => unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"), isDateObject = date => date && "[object Date]" === Object.prototype.toString.call(date) && !isNaN(date);
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "SCORESABER_URL", (function() {
        return SCORESABER_URL;
    })), __webpack_require__.d(__webpack_exports__, "NEW_SCORESABER_URL", (function() {
        return NEW_SCORESABER_URL;
    })), __webpack_require__.d(__webpack_exports__, "SCORESABER_API_URL", (function() {
        return SCORESABER_API_URL;
    })), __webpack_require__.d(__webpack_exports__, "PLAYER_INFO_URL", (function() {
        return PLAYER_INFO_URL;
    })), __webpack_require__.d(__webpack_exports__, "USERS_URL", (function() {
        return USERS_URL;
    })), __webpack_require__.d(__webpack_exports__, "SCORES_URL", (function() {
        return SCORES_URL;
    })), __webpack_require__.d(__webpack_exports__, "SCORES_PER_PAGE", (function() {
        return SCORES_PER_PAGE;
    })), __webpack_require__.d(__webpack_exports__, "PLAYS_PER_PAGE", (function() {
        return PLAYS_PER_PAGE;
    })), __webpack_require__.d(__webpack_exports__, "PLAYERS_PER_PAGE", (function() {
        return PLAYERS_PER_PAGE;
    })), __webpack_require__.d(__webpack_exports__, "MAGIC_HISTORY_NUMBER", (function() {
        return MAGIC_HISTORY_NUMBER;
    })), __webpack_require__.d(__webpack_exports__, "RATE_LIMITS", (function() {
        return RATE_LIMITS;
    }));
    var _temp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5), SCORESABER_URL = "https://scoresaber.com", NEW_SCORESABER_URL = "https://new.scoresaber.com", SCORESABER_API_URL = NEW_SCORESABER_URL + "/api", PLAYER_INFO_URL = SCORESABER_API_URL + "/player/${userId}/full", USERS_URL = SCORESABER_URL + "/global/${page}?country=" + _temp__WEBPACK_IMPORTED_MODULE_0__.default.COUNTRY, SCORES_URL = SCORESABER_API_URL + "/player/${userId}/scores/recent/${page}", SCORES_PER_PAGE = 12, PLAYS_PER_PAGE = 8, PLAYERS_PER_PAGE = 50, MAGIC_HISTORY_NUMBER = 999999, RATE_LIMITS = {
        concurrency: 8,
        limit: 50,
        time: 6e4
    };
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var p_queue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(18), p_queue__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(p_queue__WEBPACK_IMPORTED_MODULE_0__);
    __webpack_exports__.default = {
        SCORESABER: new p_queue__WEBPACK_IMPORTED_MODULE_0___default.a({
            concurrency: 3,
            timeout: 8e3,
            throwOnTimeout: !0,
            intervalCap: 80,
            interval: 6e4
        }),
        SCORESABER_API: new p_queue__WEBPACK_IMPORTED_MODULE_0___default.a({
            concurrency: 8,
            timeout: 6e4,
            throwOnTimeout: !0
        }),
        BEATSAVER: new p_queue__WEBPACK_IMPORTED_MODULE_0___default.a({
            concurrency: 8,
            timeout: 8e3,
            throwOnTimeout: !0,
            intervalCap: 10,
            interval: 1e3
        })
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    const EventEmitter = __webpack_require__(19), p_timeout_1 = __webpack_require__(20), priority_queue_1 = __webpack_require__(22), empty = () => {}, timeoutError = new p_timeout_1.TimeoutError;
    exports.default = class extends EventEmitter {
        constructor(options) {
            var _a, _b, _c, _d;
            if (super(), Object.defineProperty(this, "_carryoverConcurrencyCount", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: void 0
            }), Object.defineProperty(this, "_isIntervalIgnored", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: void 0
            }), Object.defineProperty(this, "_intervalCount", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: 0
            }), Object.defineProperty(this, "_intervalCap", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: void 0
            }), Object.defineProperty(this, "_interval", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: void 0
            }), Object.defineProperty(this, "_intervalEnd", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: 0
            }), Object.defineProperty(this, "_intervalId", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: void 0
            }), Object.defineProperty(this, "_timeoutId", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: void 0
            }), Object.defineProperty(this, "_queue", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: void 0
            }), Object.defineProperty(this, "_queueClass", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: void 0
            }), Object.defineProperty(this, "_pendingCount", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: 0
            }), Object.defineProperty(this, "_concurrency", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: void 0
            }), Object.defineProperty(this, "_isPaused", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: void 0
            }), Object.defineProperty(this, "_resolveEmpty", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: empty
            }), Object.defineProperty(this, "_resolveIdle", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: empty
            }), Object.defineProperty(this, "_timeout", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: void 0
            }), Object.defineProperty(this, "_throwOnTimeout", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: void 0
            }), !("number" == typeof (options = Object.assign({
                carryoverConcurrencyCount: !1,
                intervalCap: 1 / 0,
                interval: 0,
                concurrency: 1 / 0,
                autoStart: !0,
                queueClass: priority_queue_1.default
            }, options)).intervalCap && options.intervalCap >= 1)) throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${null !== (_b = null === (_a = options.intervalCap) || void 0 === _a ? void 0 : _a.toString()) && void 0 !== _b ? _b : ""}\` (${typeof options.intervalCap})`);
            if (void 0 === options.interval || !(Number.isFinite(options.interval) && options.interval >= 0)) throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${null !== (_d = null === (_c = options.interval) || void 0 === _c ? void 0 : _c.toString()) && void 0 !== _d ? _d : ""}\` (${typeof options.interval})`);
            this._carryoverConcurrencyCount = options.carryoverConcurrencyCount, this._isIntervalIgnored = options.intervalCap === 1 / 0 || 0 === options.interval, 
            this._intervalCap = options.intervalCap, this._interval = options.interval, this._queue = new options.queueClass, 
            this._queueClass = options.queueClass, this.concurrency = options.concurrency, this._timeout = options.timeout, 
            this._throwOnTimeout = !0 === options.throwOnTimeout, this._isPaused = !1 === options.autoStart;
        }
        get _doesIntervalAllowAnother() {
            return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
        }
        get _doesConcurrentAllowAnother() {
            return this._pendingCount < this._concurrency;
        }
        _next() {
            this._pendingCount--, this._tryToStartAnother();
        }
        _resolvePromises() {
            this._resolveEmpty(), this._resolveEmpty = empty, 0 === this._pendingCount && (this._resolveIdle(), 
            this._resolveIdle = empty, this.emit("idle"));
        }
        _onResumeInterval() {
            this._onInterval(), this._initializeIntervalIfNeeded(), this._timeoutId = void 0;
        }
        _isIntervalPaused() {
            const now = Date.now();
            if (void 0 === this._intervalId) {
                const delay = this._intervalEnd - now;
                if (!(delay < 0)) return void 0 === this._timeoutId && (this._timeoutId = setTimeout(() => {
                    this._onResumeInterval();
                }, delay)), !0;
                this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
            }
            return !1;
        }
        _tryToStartAnother() {
            if (0 === this._queue.size) return this._intervalId && clearInterval(this._intervalId), 
            this._intervalId = void 0, this._resolvePromises(), !1;
            if (!this._isPaused) {
                const canInitializeInterval = !this._isIntervalPaused();
                if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) return this.emit("active"), 
                this._queue.dequeue()(), canInitializeInterval && this._initializeIntervalIfNeeded(), 
                !0;
            }
            return !1;
        }
        _initializeIntervalIfNeeded() {
            this._isIntervalIgnored || void 0 !== this._intervalId || (this._intervalId = setInterval(() => {
                this._onInterval();
            }, this._interval), this._intervalEnd = Date.now() + this._interval);
        }
        _onInterval() {
            0 === this._intervalCount && 0 === this._pendingCount && this._intervalId && (clearInterval(this._intervalId), 
            this._intervalId = void 0), this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0, 
            this._processQueue();
        }
        _processQueue() {
            for (;this._tryToStartAnother(); ) ;
        }
        get concurrency() {
            return this._concurrency;
        }
        set concurrency(newConcurrency) {
            if (!("number" == typeof newConcurrency && newConcurrency >= 1)) throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${newConcurrency}\` (${typeof newConcurrency})`);
            this._concurrency = newConcurrency, this._processQueue();
        }
        async add(fn, options = {}) {
            return new Promise((resolve, reject) => {
                this._queue.enqueue(async () => {
                    this._pendingCount++, this._intervalCount++;
                    try {
                        const operation = void 0 === this._timeout && void 0 === options.timeout ? fn() : p_timeout_1.default(Promise.resolve(fn()), void 0 === options.timeout ? this._timeout : options.timeout, () => {
                            (void 0 === options.throwOnTimeout ? this._throwOnTimeout : options.throwOnTimeout) && reject(timeoutError);
                        });
                        resolve(await operation);
                    } catch (error) {
                        reject(error);
                    }
                    this._next();
                }, options), this._tryToStartAnother();
            });
        }
        async addAll(functions, options) {
            return Promise.all(functions.map(async function_ => this.add(function_, options)));
        }
        start() {
            return this._isPaused ? (this._isPaused = !1, this._processQueue(), this) : this;
        }
        pause() {
            this._isPaused = !0;
        }
        clear() {
            this._queue = new this._queueClass;
        }
        async onEmpty() {
            if (0 !== this._queue.size) return new Promise(resolve => {
                const existingResolve = this._resolveEmpty;
                this._resolveEmpty = () => {
                    existingResolve(), resolve();
                };
            });
        }
        async onIdle() {
            if (0 !== this._pendingCount || 0 !== this._queue.size) return new Promise(resolve => {
                const existingResolve = this._resolveIdle;
                this._resolveIdle = () => {
                    existingResolve(), resolve();
                };
            });
        }
        get size() {
            return this._queue.size;
        }
        sizeBy(options) {
            return this._queue.filter(options).length;
        }
        get pending() {
            return this._pendingCount;
        }
        get isPaused() {
            return this._isPaused;
        }
        get timeout() {
            return this._timeout;
        }
        set timeout(milliseconds) {
            this._timeout = milliseconds;
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var has = Object.prototype.hasOwnProperty, prefix = "~";
    function Events() {}
    function EE(fn, context, once) {
        this.fn = fn, this.context = context, this.once = once || !1;
    }
    function addListener(emitter, event, fn, context, once) {
        if ("function" != typeof fn) throw new TypeError("The listener must be a function");
        var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
        return emitter._events[evt] ? emitter._events[evt].fn ? emitter._events[evt] = [ emitter._events[evt], listener ] : emitter._events[evt].push(listener) : (emitter._events[evt] = listener, 
        emitter._eventsCount++), emitter;
    }
    function clearEvent(emitter, evt) {
        0 == --emitter._eventsCount ? emitter._events = new Events : delete emitter._events[evt];
    }
    function EventEmitter() {
        this._events = new Events, this._eventsCount = 0;
    }
    Object.create && (Events.prototype = Object.create(null), (new Events).__proto__ || (prefix = !1)), 
    EventEmitter.prototype.eventNames = function() {
        var events, name, names = [];
        if (0 === this._eventsCount) return names;
        for (name in events = this._events) has.call(events, name) && names.push(prefix ? name.slice(1) : name);
        return Object.getOwnPropertySymbols ? names.concat(Object.getOwnPropertySymbols(events)) : names;
    }, EventEmitter.prototype.listeners = function(event) {
        var evt = prefix ? prefix + event : event, handlers = this._events[evt];
        if (!handlers) return [];
        if (handlers.fn) return [ handlers.fn ];
        for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) ee[i] = handlers[i].fn;
        return ee;
    }, EventEmitter.prototype.listenerCount = function(event) {
        var evt = prefix ? prefix + event : event, listeners = this._events[evt];
        return listeners ? listeners.fn ? 1 : listeners.length : 0;
    }, EventEmitter.prototype.emit = function(event, a1, a2, a3, a4, a5) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return !1;
        var args, i, listeners = this._events[evt], len = arguments.length;
        if (listeners.fn) {
            switch (listeners.once && this.removeListener(event, listeners.fn, void 0, !0), 
            len) {
              case 1:
                return listeners.fn.call(listeners.context), !0;

              case 2:
                return listeners.fn.call(listeners.context, a1), !0;

              case 3:
                return listeners.fn.call(listeners.context, a1, a2), !0;

              case 4:
                return listeners.fn.call(listeners.context, a1, a2, a3), !0;

              case 5:
                return listeners.fn.call(listeners.context, a1, a2, a3, a4), !0;

              case 6:
                return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), !0;
            }
            for (i = 1, args = new Array(len - 1); i < len; i++) args[i - 1] = arguments[i];
            listeners.fn.apply(listeners.context, args);
        } else {
            var j, length = listeners.length;
            for (i = 0; i < length; i++) switch (listeners[i].once && this.removeListener(event, listeners[i].fn, void 0, !0), 
            len) {
              case 1:
                listeners[i].fn.call(listeners[i].context);
                break;

              case 2:
                listeners[i].fn.call(listeners[i].context, a1);
                break;

              case 3:
                listeners[i].fn.call(listeners[i].context, a1, a2);
                break;

              case 4:
                listeners[i].fn.call(listeners[i].context, a1, a2, a3);
                break;

              default:
                if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) args[j - 1] = arguments[j];
                listeners[i].fn.apply(listeners[i].context, args);
            }
        }
        return !0;
    }, EventEmitter.prototype.on = function(event, fn, context) {
        return addListener(this, event, fn, context, !1);
    }, EventEmitter.prototype.once = function(event, fn, context) {
        return addListener(this, event, fn, context, !0);
    }, EventEmitter.prototype.removeListener = function(event, fn, context, once) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return this;
        if (!fn) return clearEvent(this, evt), this;
        var listeners = this._events[evt];
        if (listeners.fn) listeners.fn !== fn || once && !listeners.once || context && listeners.context !== context || clearEvent(this, evt); else {
            for (var i = 0, events = [], length = listeners.length; i < length; i++) (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) && events.push(listeners[i]);
            events.length ? this._events[evt] = 1 === events.length ? events[0] : events : clearEvent(this, evt);
        }
        return this;
    }, EventEmitter.prototype.removeAllListeners = function(event) {
        var evt;
        return event ? (evt = prefix ? prefix + event : event, this._events[evt] && clearEvent(this, evt)) : (this._events = new Events, 
        this._eventsCount = 0), this;
    }, EventEmitter.prototype.off = EventEmitter.prototype.removeListener, EventEmitter.prototype.addListener = EventEmitter.prototype.on, 
    EventEmitter.prefixed = prefix, EventEmitter.EventEmitter = EventEmitter, module.exports = EventEmitter;
}, function(module, exports, __webpack_require__) {
    "use strict";
    const pFinally = __webpack_require__(21);
    class TimeoutError extends Error {
        constructor(message) {
            super(message), this.name = "TimeoutError";
        }
    }
    const pTimeout = (promise, milliseconds, fallback) => new Promise((resolve, reject) => {
        if ("number" != typeof milliseconds || milliseconds < 0) throw new TypeError("Expected `milliseconds` to be a positive number");
        if (milliseconds === 1 / 0) return void resolve(promise);
        const timer = setTimeout(() => {
            if ("function" == typeof fallback) {
                try {
                    resolve(fallback());
                } catch (error) {
                    reject(error);
                }
                return;
            }
            const timeoutError = fallback instanceof Error ? fallback : new TimeoutError("string" == typeof fallback ? fallback : `Promise timed out after ${milliseconds} milliseconds`);
            "function" == typeof promise.cancel && promise.cancel(), reject(timeoutError);
        }, milliseconds);
        pFinally(promise.then(resolve, reject), () => {
            clearTimeout(timer);
        });
    });
    module.exports = pTimeout, module.exports.default = pTimeout, module.exports.TimeoutError = TimeoutError;
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = (promise, onFinally) => (onFinally = onFinally || (() => {}), promise.then(val => new Promise(resolve => {
        resolve(onFinally());
    }).then(() => val), err => new Promise(resolve => {
        resolve(onFinally());
    }).then(() => {
        throw err;
    })));
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    const lower_bound_1 = __webpack_require__(23);
    exports.default = class {
        constructor() {
            Object.defineProperty(this, "_queue", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: []
            });
        }
        enqueue(run, options) {
            const element = {
                priority: (options = Object.assign({
                    priority: 0
                }, options)).priority,
                run: run
            };
            if (this.size && this._queue[this.size - 1].priority >= options.priority) return void this._queue.push(element);
            const index = lower_bound_1.default(this._queue, element, (a, b) => b.priority - a.priority);
            this._queue.splice(index, 0, element);
        }
        dequeue() {
            const item = this._queue.shift();
            return null == item ? void 0 : item.run;
        }
        filter(options) {
            return this._queue.filter(element => element.priority === options.priority).map(element => element.run);
        }
        get size() {
            return this._queue.length;
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = function(array, value, comparator) {
        let first = 0, count = array.length;
        for (;count > 0; ) {
            const step = count / 2 | 0;
            let it = first + step;
            comparator(array[it], value) <= 0 ? (first = ++it, count -= step + 1) : count = step;
        }
        return first;
    };
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "getDiffColor", (function() {
        return getDiffColor;
    })), __webpack_require__.d(__webpack_exports__, "getHumanDiffInfo", (function() {
        return getHumanDiffInfo;
    })), __webpack_require__.d(__webpack_exports__, "getMaxScore", (function() {
        return getMaxScore;
    })), __webpack_require__.d(__webpack_exports__, "extractDiffAndType", (function() {
        return extractDiffAndType;
    })), __webpack_require__.d(__webpack_exports__, "findDiffInfoWithDiffAndType", (function() {
        return findDiffInfoWithDiffAndType;
    })), __webpack_require__.d(__webpack_exports__, "findDiffInfo", (function() {
        return findDiffInfo;
    })), __webpack_require__.d(__webpack_exports__, "getLeaderboard", (function() {
        return getLeaderboard;
    })), __webpack_require__.d(__webpack_exports__, "getSongMaxScore", (function() {
        return getSongMaxScore;
    })), __webpack_require__.d(__webpack_exports__, "getSongMaxScoreWithDiffAndType", (function() {
        return getSongMaxScoreWithDiffAndType;
    }));
    var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(15), _store__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9), _eastereggs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(25), _network_beatsaver__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(26), _scoresaber_players__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(27);
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
    function getDiffColor(diffInfo) {
        var colors = {
            easy: "MediumSeaGreen",
            normal: "#59b0f4",
            hard: "tomato",
            expert: "#bf2a42",
            expertPlus: "#8f48db"
        };
        return colors[diffInfo.diff] ? colors[diffInfo.diff] : null;
    }
    function getHumanDiffInfo(diffInfo) {
        if (!diffInfo || !diffInfo.diff) return null;
        var name = Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__.capitalize)(diffInfo.diff).replace("ExpertPlus", "Expert+"), typeSuffix = "Standard" !== diffInfo.type ? "/" + diffInfo.type : "";
        switch (name) {
          case "Easy":
            return {
                name: name,
                type: diffInfo.type,
                fullName: name + typeSuffix,
                shortName: "Es",
                difficulty: 1,
                color: getDiffColor(diffInfo)
            };

          case "Normal":
            return {
                name: name,
                type: diffInfo.type,
                fullName: name + typeSuffix,
                shortName: "N",
                difficulty: 3,
                color: getDiffColor(diffInfo)
            };

          case "Hard":
            return {
                name: name,
                type: diffInfo.type,
                fullName: name + typeSuffix,
                shortName: "H",
                difficulty: 5,
                color: getDiffColor(diffInfo)
            };

          case "Expert":
            return {
                name: name,
                type: diffInfo.type,
                fullName: name + typeSuffix,
                shortName: "Ex",
                difficulty: 7,
                color: getDiffColor(diffInfo)
            };

          case "Expert+":
            return {
                name: name,
                type: diffInfo.type,
                fullName: name + typeSuffix,
                shortName: "E+",
                difficulty: 9,
                color: getDiffColor(diffInfo)
            };

          default:
            return null;
        }
    }
    var getMaxScore = function(blocks) {
        var maxScorePerBlock = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 115;
        return Math.floor((blocks >= 14 ? 8 * maxScorePerBlock * (blocks - 13) : 0) + (blocks >= 6 ? 4 * maxScorePerBlock * (Math.min(blocks, 13) - 5) : 0) + (blocks >= 2 ? 2 * maxScorePerBlock * (Math.min(blocks, 5) - 1) : 0) + Math.min(blocks, 1) * maxScorePerBlock);
    };
    function extractDiffAndType(ssDiff) {
        var _match$, match = /^_([^_]+)_Solo(.*)$/.exec(ssDiff);
        return match ? {
            diff: match[1].toLowerCase().replace("plus", "Plus"),
            type: null !== (_match$ = match[2]) && void 0 !== _match$ ? _match$ : "Standard"
        } : null;
    }
    function findDiffInfoWithDiffAndType(characteristics, diffAndType) {
        return characteristics && diffAndType ? characteristics.reduce((cum, ch) => {
            var _ch$difficulties;
            return ch.name === diffAndType.type ? null === (_ch$difficulties = ch.difficulties) || void 0 === _ch$difficulties ? void 0 : _ch$difficulties[diffAndType.diff] : cum;
        }, null) : null;
    }
    function findDiffInfo(characteristics, ssDiff) {
        return findDiffInfoWithDiffAndType(characteristics, extractDiffAndType(ssDiff));
    }
    function getLeaderboard(_x, _x2) {
        return _getLeaderboard.apply(this, arguments);
    }
    function _getLeaderboard() {
        return (_getLeaderboard = _asyncToGenerator((function*(songHash, leaderboardId) {
            var _songInfo$metadata, data = yield Object(_store__WEBPACK_IMPORTED_MODULE_1__.getCacheAndConvertIfNeeded)(), songInfo = songHash ? yield Object(_network_beatsaver__WEBPACK_IMPORTED_MODULE_3__.getSongByHash)(songHash) : null, songCharacteristics = null == songInfo || null === (_songInfo$metadata = songInfo.metadata) || void 0 === _songInfo$metadata ? void 0 : _songInfo$metadata.characteristics, diffInfo = null, maxSongScore = 0;
            return Object(_scoresaber_players__WEBPACK_IMPORTED_MODULE_4__.filterByCountry)(data.users).reduce((cum, userId) => {
                if (!data.users[userId].scores[leaderboardId]) return cum;
                var _diffInfo, _diffInfo2;
                maxSongScore || cum.length || (diffInfo = findDiffInfo(songCharacteristics, data.users[userId].scores[leaderboardId].diff), 
                maxSongScore = (null === (_diffInfo = diffInfo) || void 0 === _diffInfo ? void 0 : _diffInfo.length) && (null === (_diffInfo2 = diffInfo) || void 0 === _diffInfo2 ? void 0 : _diffInfo2.notes) ? getMaxScore(diffInfo.notes) : 0);
                var _data$users$userId = data.users[userId], {scores: scores} = _data$users$userId, user = _objectWithoutProperties(_data$users$userId, [ "scores" ]), _data$users$userId$sc = data.users[userId].scores[leaderboardId], {score: score, uScore: uScore, timeset: timeset, rank: rank, mods: mods, pp: pp, maxScoreEx: maxScoreEx, diff: diff, history: history} = _data$users$userId$sc, playHistory = (_objectWithoutProperties(_data$users$userId$sc, [ "score", "uScore", "timeset", "rank", "mods", "pp", "maxScoreEx", "diff", "history" ]), 
                (history || []).sort((a, b) => b.timestamp - a.timestamp).map(h => Object.assign({}, h, {
                    timeset: new Date(h.timestamp),
                    percent: maxSongScore ? h.score / maxSongScore / (h.uScore ? h.score / h.uScore : 1) : maxScoreEx ? h.score / maxScoreEx / (h.uScore ? h.score / h.uScore : 1) : null
                }))), scoreMult = uScore && score ? score / uScore : 1;
                return cum.push(Object.assign({}, user, {
                    score: score,
                    timeset: timeset,
                    rank: rank,
                    mods: mods,
                    pp: pp,
                    playHistory: playHistory,
                    percent: maxSongScore ? score / maxSongScore / scoreMult : maxScoreEx ? score / maxScoreEx / scoreMult : null
                })), cum;
            }, []).map(u => Object.assign({}, u, {
                hidden: Object(_eastereggs__WEBPACK_IMPORTED_MODULE_2__.shouldBeHidden)(u)
            })).sort((a, b) => b.score - a.score);
        }))).apply(this, arguments);
    }
    function getSongMaxScore(_x3, _x4) {
        return _getSongMaxScore.apply(this, arguments);
    }
    function _getSongMaxScore() {
        return (_getSongMaxScore = _asyncToGenerator((function*(hash, diff) {
            var _songInfo$metadata2, songInfo = yield Object(_network_beatsaver__WEBPACK_IMPORTED_MODULE_3__.getSongByHash)(hash), diffInfo = findDiffInfo(null == songInfo || null === (_songInfo$metadata2 = songInfo.metadata) || void 0 === _songInfo$metadata2 ? void 0 : _songInfo$metadata2.characteristics, diff);
            return (null == diffInfo ? void 0 : diffInfo.length) && (null == diffInfo ? void 0 : diffInfo.notes) ? getMaxScore(diffInfo.notes) : 0;
        }))).apply(this, arguments);
    }
    function getSongMaxScoreWithDiffAndType(_x5, _x6) {
        return _getSongMaxScoreWithDiffAndType.apply(this, arguments);
    }
    function _getSongMaxScoreWithDiffAndType() {
        return (_getSongMaxScoreWithDiffAndType = _asyncToGenerator((function*(hash, diffAndType) {
            var _songInfo$metadata3, cacheOnly = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], forceUpdate = arguments.length > 3 && void 0 !== arguments[3] && arguments[3], songInfo = yield Object(_network_beatsaver__WEBPACK_IMPORTED_MODULE_3__.getSongByHash)(hash, forceUpdate, cacheOnly), songCharacteristics = null == songInfo || null === (_songInfo$metadata3 = songInfo.metadata) || void 0 === _songInfo$metadata3 ? void 0 : _songInfo$metadata3.characteristics, diffInfo = findDiffInfoWithDiffAndType(songCharacteristics, diffAndType);
            return (null == diffInfo ? void 0 : diffInfo.length) && (null == diffInfo ? void 0 : diffInfo.notes) ? getMaxScore(diffInfo.notes) : 0;
        }))).apply(this, arguments);
    }
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "shouldBeHidden", (function() {
        return shouldBeHidden;
    }));
    var _utils_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10), easterEggConditions = [ [ {
        field: "id",
        value: "76561198165064325",
        cond: "==="
    }, {
        field: "percent",
        value: .85,
        cond: "<"
    } ] ];
    function shouldBeHidden(data) {
        return easterEggConditions.reduce((ret, conditions) => ret || conditions.reduce((subret, cond) => {
            var userFieldValue = null == data ? void 0 : data[null == cond ? void 0 : cond.field], currentConditionFulfilled = !0;
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
                _utils_logger__WEBPACK_IMPORTED_MODULE_0__.default.error("Unknown condition: ", null == cond ? void 0 : cond.cond), 
                currentConditionFulfilled = !1;
            }
            return subret && currentConditionFulfilled;
        }, !0), !1);
    }
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "getSongByHash", (function() {
        return getSongByHash;
    })), __webpack_require__.d(__webpack_exports__, "getSongByKey", (function() {
        return getSongByKey;
    }));
    var _fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14), _utils_format__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4), _queue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(17), _store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9), _utils_logger__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(10);
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
    var getSongByHash = function() {
        var _ref = _asyncToGenerator((function*(hash) {
            var forceUpdate = arguments.length > 1 && void 0 !== arguments[1] && arguments[1], cacheOnly = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
            hash = hash.toLowerCase();
            var data = yield Object(_store__WEBPACK_IMPORTED_MODULE_3__.getCacheAndConvertIfNeeded)();
            if (!forceUpdate && data.beatSaver && data.beatSaver.hashes && data.beatSaver.hashes[hash]) return Promise.resolve(data.beatSaver.hashes[hash]);
            if (cacheOnly) return null;
            var songInfo = yield Object(_fetch__WEBPACK_IMPORTED_MODULE_0__.fetchApiPage)(_queue__WEBPACK_IMPORTED_MODULE_2__.default.BEATSAVER, Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.substituteVars)("https://beatsaver.com/api/maps/by-hash/${hash}", {
                hash: hash
            }));
            return songInfo ? cacheSongInfo(songInfo) : (_utils_logger__WEBPACK_IMPORTED_MODULE_4__.default.warn("Song with ".concat(hash, " hash is no longer available at Beat Saver.")), 
            Promise.resolve(null));
        }));
        return function(_x) {
            return _ref.apply(this, arguments);
        };
    }(), getSongByKey = function() {
        var _ref2 = _asyncToGenerator((function*(key) {
            var forceUpdate = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
            key = key.toLowerCase();
            var data = yield Object(_store__WEBPACK_IMPORTED_MODULE_3__.getCacheAndConvertIfNeeded)();
            if (!forceUpdate && data.beatSaver && data.beatSaver.keys && data.beatSaver.keys[key] && data.beatSaver.hashes && data.beatSaver.hashes[data.beatSaver.keys[key]]) return Promise.resolve(data.beatSaver.hashes[data.beatSaver.keys[key]]);
            var songInfo = yield Object(_fetch__WEBPACK_IMPORTED_MODULE_0__.fetchApiPage)(_queue__WEBPACK_IMPORTED_MODULE_2__.default.BEATSAVER, Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.substituteVars)("https://beatsaver.com/api/maps/detail/${key}", {
                key: key
            }));
            return songInfo ? cacheSongInfo(songInfo) : (_utils_logger__WEBPACK_IMPORTED_MODULE_4__.default.warn("Song with ".concat(key, " key is no longer available at Beat Saver.")), 
            Promise.resolve(null));
        }));
        return function(_x2) {
            return _ref2.apply(this, arguments);
        };
    }();
    function cacheSongInfo(_x3) {
        return _cacheSongInfo.apply(this, arguments);
    }
    function _cacheSongInfo() {
        return (_cacheSongInfo = _asyncToGenerator((function*(songInfo) {
            var data = yield Object(_store__WEBPACK_IMPORTED_MODULE_3__.getCacheAndConvertIfNeeded)();
            return delete songInfo.description, data.beatSaver || (data.beatSaver = {
                hashes: {},
                keys: {}
            }), songInfo.hash && (data.beatSaver.hashes[songInfo.hash.toLowerCase()] = songInfo, 
            songInfo.key && (data.beatSaver.keys[songInfo.key.toLowerCase()] = songInfo.hash)), 
            yield Object(_store__WEBPACK_IMPORTED_MODULE_3__.setCache)(data), songInfo;
        }))).apply(this, arguments);
    }
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "isActiveCountryUser", (function() {
        return isActiveCountryUser;
    })), __webpack_require__.d(__webpack_exports__, "filterByCountry", (function() {
        return filterByCountry;
    })), __webpack_require__.d(__webpack_exports__, "mapUsersToObj", (function() {
        return mapUsersToObj;
    })), __webpack_require__.d(__webpack_exports__, "getCountryRanking", (function() {
        return getCountryRanking;
    })), __webpack_require__.d(__webpack_exports__, "getPlayerInfo", (function() {
        return getPlayerInfo;
    })), __webpack_require__.d(__webpack_exports__, "getPlayerScores", (function() {
        return getPlayerScores;
    })), __webpack_require__.d(__webpack_exports__, "getPlayerRankedScores", (function() {
        return getPlayerRankedScores;
    })), __webpack_require__.d(__webpack_exports__, "getPlayerSongScore", (function() {
        return getPlayerSongScore;
    }));
    var _network_scoresaber_players__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(28), _temp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5), _store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9), _rankeds__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(29);
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
    var isActiveCountryUser = function(u) {
        var country = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : _temp__WEBPACK_IMPORTED_MODULE_1__.default.COUNTRY;
        return !u.inactive && (Object(_network_scoresaber_players__WEBPACK_IMPORTED_MODULE_0__.getAdditionalPlayers)().includes(u.id) || u.country.toLowerCase() === country.toLowerCase());
    }, filterByCountry = function(players) {
        var country = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : _temp__WEBPACK_IMPORTED_MODULE_1__.default.COUNTRY;
        return Object.keys(players).filter(userId => isActiveCountryUser(players[userId]), country);
    }, mapUsersToObj = (playerIds, players) => playerIds.reduce((cum, playerId) => (cum[playerId] = players[playerId], 
    cum), {}), getCountryRanking = function() {
        var _ref = _asyncToGenerator((function*() {
            var _yield$getCacheAndCon, country = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : _temp__WEBPACK_IMPORTED_MODULE_1__.default.COUNTRY, players = null === (_yield$getCacheAndCon = yield Object(_store__WEBPACK_IMPORTED_MODULE_2__.getCacheAndConvertIfNeeded)()) || void 0 === _yield$getCacheAndCon ? void 0 : _yield$getCacheAndCon.users;
            return players ? Object.values(players).filter(p => isActiveCountryUser(p, country)).sort((a, b) => b.pp - a.pp).map((p, idx) => (p.countryRank = idx + 1, 
            p)).slice(0, 50) : null;
        }));
        return function() {
            return _ref.apply(this, arguments);
        };
    }(), getPlayerInfo = function() {
        var _ref2 = _asyncToGenerator((function*(playerId) {
            var _data$users, data = yield Object(_store__WEBPACK_IMPORTED_MODULE_2__.getCacheAndConvertIfNeeded)();
            return (null == data || null === (_data$users = data.users) || void 0 === _data$users ? void 0 : _data$users[playerId]) ? data.users[playerId] : null;
        }));
        return function(_x) {
            return _ref2.apply(this, arguments);
        };
    }(), getPlayerScores = function() {
        var _ref3 = _asyncToGenerator((function*(playerId) {
            var playerInfo = yield getPlayerInfo(playerId);
            return playerInfo && playerInfo.scores ? playerInfo.scores : null;
        }));
        return function(_x2) {
            return _ref3.apply(this, arguments);
        };
    }(), getPlayerRankedScores = function() {
        var _ref4 = _asyncToGenerator((function*(playerId) {
            var scores = yield getPlayerScores(playerId), rankedMaps = yield Object(_rankeds__WEBPACK_IMPORTED_MODULE_3__.getRankedSongs)();
            return scores ? Object.values(scores).filter(s => s.pp > 0).filter(s => null == rankedMaps ? void 0 : rankedMaps[s.leaderboardId]) : [];
        }));
        return function(_x3) {
            return _ref4.apply(this, arguments);
        };
    }(), getPlayerSongScore = function() {
        var _ref5 = _asyncToGenerator((function*(playerId, leaderboardId) {
            var _yield$getPlayerScore, score = null === (_yield$getPlayerScore = yield getPlayerScores(playerId)) || void 0 === _yield$getPlayerScore ? void 0 : _yield$getPlayerScore[leaderboardId];
            return score || null;
        }));
        return function(_x4, _x5) {
            return _ref5.apply(this, arguments);
        };
    }();
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "USER_PROFILE_URL", (function() {
        return USER_PROFILE_URL;
    })), __webpack_require__.d(__webpack_exports__, "ADDITIONAL_COUNTRY_PLAYERS_IDS", (function() {
        return ADDITIONAL_COUNTRY_PLAYERS_IDS;
    })), __webpack_require__.d(__webpack_exports__, "getAdditionalPlayers", (function() {
        return getAdditionalPlayers;
    })), __webpack_require__.d(__webpack_exports__, "convertPlayerInfo", (function() {
        return convertPlayerInfo;
    })), __webpack_require__.d(__webpack_exports__, "fetchPlayerInfo", (function() {
        return fetchPlayerInfo;
    })), __webpack_require__.d(__webpack_exports__, "fetchUsers", (function() {
        return fetchUsers;
    }));
    var _utils_format__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4), _fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(14), _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(15), _consts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(16), _queue__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(17), _temp__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(5), _utils_date__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(6), _store__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(9);
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
    var USER_PROFILE_URL = _consts__WEBPACK_IMPORTED_MODULE_3__.SCORESABER_URL + "/u/${userId}", ADDITIONAL_COUNTRY_PLAYERS_IDS = {
        pl: [ "76561198967371424", "76561198093469724" ]
    }, getAdditionalPlayers = function() {
        var _ADDITIONAL_COUNTRY_P, country = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : _temp__WEBPACK_IMPORTED_MODULE_5__.default.COUNTRY;
        return null !== (_ADDITIONAL_COUNTRY_P = ADDITIONAL_COUNTRY_PLAYERS_IDS[country]) && void 0 !== _ADDITIONAL_COUNTRY_P ? _ADDITIONAL_COUNTRY_P : [];
    }, convertPlayerInfo = info => {
        var _info$playerInfo = info.playerInfo, {playerName: playerName, playerId: playerId, role: role, badges: badges, permissions: permissions, banned: banned, history: history} = _info$playerInfo, playerInfo = _objectWithoutProperties(_info$playerInfo, [ "playerName", "playerId", "role", "badges", "permissions", "banned", "history" ]);
        return playerInfo.inactive = !!playerInfo.inactive, Object.assign({
            id: playerId,
            name: playerName,
            url: Object(_utils_format__WEBPACK_IMPORTED_MODULE_0__.substituteVars)(USER_PROFILE_URL, {
                userId: playerId
            }),
            lastUpdated: null,
            lastPlay: null,
            userHistory: {},
            scores: {}
        }, playerInfo, {
            stats: info.scoreStats
        });
    }, fetchPlayerInfo = function() {
        var _ref = _asyncToGenerator((function*(userId) {
            return Object(_fetch__WEBPACK_IMPORTED_MODULE_1__.fetchApiPage)(_queue__WEBPACK_IMPORTED_MODULE_4__.default.SCORESABER_API, Object(_utils_format__WEBPACK_IMPORTED_MODULE_0__.substituteVars)(_consts__WEBPACK_IMPORTED_MODULE_3__.PLAYER_INFO_URL, {
                userId: userId
            })).then(info => {
                var _info$playerInfo2, history = null == info || null === (_info$playerInfo2 = info.playerInfo) || void 0 === _info$playerInfo2 ? void 0 : _info$playerInfo2.history.split(",").reverse();
                return info.playerInfo.weeklyDiff = history ? history.length >= 7 ? history[6] - history[0] : 0 : null, 
                info;
            });
        }));
        return function(_x) {
            return _ref.apply(this, arguments);
        };
    }(), fetchUsers = function() {
        var _ref2 = _asyncToGenerator((function*() {
            var page = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1, data = yield Object(_store__WEBPACK_IMPORTED_MODULE_7__.getCacheAndConvertIfNeeded)();
            return yield Promise.all([ ...(yield Object(_fetch__WEBPACK_IMPORTED_MODULE_1__.fetchHtmlPage)(_queue__WEBPACK_IMPORTED_MODULE_4__.default.SCORESABER, _consts__WEBPACK_IMPORTED_MODULE_3__.USERS_URL, page)).querySelectorAll(".ranking.global .player a") ].map(a => {
                var tr = a.closest("tr");
                return {
                    playerInfo: {
                        playerId: Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__.getFirstRegexpMatch)(/\/(\d+)$/, a.href),
                        playerName: a.querySelector(".songTop.pp").innerText,
                        avatar: tr.querySelector("td.picture img").src,
                        countryRank: parseInt(Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__.getFirstRegexpMatch)(/^\s*#(\d+)\s*$/, tr.querySelector("td.rank").innerText), 10),
                        pp: parseFloat(Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__.getFirstRegexpMatch)(/^\s*([0-9,.]+)\s*$/, tr.querySelector("td.pp .scoreTop.ppValue").innerText).replace(/[^0-9.]/, "")),
                        country: Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__.getFirstRegexpMatch)(/^.*?\/flags\/([^.]+)\..*$/, tr.querySelector("td.player img").src).toUpperCase(),
                        inactive: !1,
                        weeklyDiff: parseInt(tr.querySelector("td.diff").innerText, 10)
                    },
                    scoreStats: {}
                };
            }).concat(getAdditionalPlayers().map(playerId => ({
                playerInfo: {
                    playerId: playerId,
                    inactive: !1
                }
            }))).map(function() {
                var _ref3 = _asyncToGenerator((function*(info) {
                    var _data$users, _data$users$info$play, _data$users2, lastUpdated = null === (_data$users = data.users) || void 0 === _data$users || null === (_data$users$info$play = _data$users[info.playerInfo.playerId]) || void 0 === _data$users$info$play ? void 0 : _data$users$info$play.lastUpdated;
                    return info.scoreStats && (null === (_data$users2 = data.users) || void 0 === _data$users2 ? void 0 : _data$users2[info.playerInfo.playerId]) && lastUpdated && Object(_utils_date__WEBPACK_IMPORTED_MODULE_6__.dayTrunc)(lastUpdated).getTime() === Object(_utils_date__WEBPACK_IMPORTED_MODULE_6__.dayTrunc)(new Date).getTime() ? Object.assign({}, data.users[info.playerInfo.playerId], info) : convertPlayerInfo(yield fetchPlayerInfo(info.playerInfo.playerId));
                }));
                return function(_x2) {
                    return _ref3.apply(this, arguments);
                };
            }()));
        }));
        return function() {
            return _ref2.apply(this, arguments);
        };
    }();
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "getRankedSongs", (function() {
        return getRankedSongs;
    }));
    var _store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
        try {
            var info = gen[key](arg), value = info.value;
        } catch (error) {
            return void reject(error);
        }
        info.done ? resolve(value) : Promise.resolve(value).then(_next, _throw);
    }
    var getRankedSongs = function() {
        var fn, _ref = (fn = function*(_) {
            return (yield Object(_store__WEBPACK_IMPORTED_MODULE_0__.getCacheAndConvertIfNeeded)()).rankedSongs;
        }, function() {
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
        });
        return function(_x) {
            return _ref.apply(this, arguments);
        };
    }();
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _utils_format__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
    function create_if_block(ctx) {
        let small, t, small_class_value;
        return {
            c() {
                small = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("small"), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[3]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(small, "class", small_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)(ctx[4]) + " svelte-1sp9ob1"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(small, "title", ctx[2]);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, small, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(small, t);
            },
            p(ctx, dirty) {
                8 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, ctx[3]), 
                16 & dirty && small_class_value !== (small_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)(ctx[4]) + " svelte-1sp9ob1") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(small, "class", small_class_value), 
                4 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(small, "title", ctx[2]);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(small);
            }
        };
    }
    function create_fragment(ctx) {
        let span, t, if_block_anchor, if_block = ctx[1] && create_if_block(ctx);
        return {
            c() {
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[0]), 
                if_block && if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "class", ctx[5]);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t), if_block && if_block.m(target, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
            },
            p(ctx, [dirty]) {
                1 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, ctx[0]), 
                32 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "class", ctx[5]), 
                ctx[1] ? if_block ? if_block.p(ctx, dirty) : (if_block = create_if_block(ctx), if_block.c(), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (if_block.d(1), 
                if_block = null);
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span), 
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let minValue, formatted, showPrevValue, prevFormatted, prevDiffFormatted, prevClass, mainClass, {value: value = 0} = $$props, {prevValue: prevValue = null} = $$props, {zero: zero = "0,00"} = $$props, {digits: digits = 2} = $$props, {withSign: withSign = !1} = $$props, {suffix: suffix = ""} = $$props, {withZeroSuffix: withZeroSuffix = !1} = $$props, {inline: inline = !1} = $$props, {useColorsForValue: useColorsForValue = !1} = $$props, {prevLabel: prevLabel = ""} = $$props;
        return $$self.$set = $$props => {
            "value" in $$props && $$invalidate(6, value = $$props.value), "prevValue" in $$props && $$invalidate(7, prevValue = $$props.prevValue), 
            "zero" in $$props && $$invalidate(8, zero = $$props.zero), "digits" in $$props && $$invalidate(9, digits = $$props.digits), 
            "withSign" in $$props && $$invalidate(10, withSign = $$props.withSign), "suffix" in $$props && $$invalidate(11, suffix = $$props.suffix), 
            "withZeroSuffix" in $$props && $$invalidate(12, withZeroSuffix = $$props.withZeroSuffix), 
            "inline" in $$props && $$invalidate(13, inline = $$props.inline), "useColorsForValue" in $$props && $$invalidate(14, useColorsForValue = $$props.useColorsForValue), 
            "prevLabel" in $$props && $$invalidate(15, prevLabel = $$props.prevLabel);
        }, $$self.$$.update = () => {
            512 & $$self.$$.dirty && $$invalidate(16, minValue = Math.pow(10, -digits - 1)), 
            73536 & $$self.$$.dirty && $$invalidate(0, formatted = Math.abs(value) > minValue ? Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.formatNumber)(value, digits, withSign) + suffix : zero + (withZeroSuffix ? suffix : "")), 
            192 & $$self.$$.dirty && $$invalidate(1, showPrevValue = prevValue !== value && prevValue && null !== value), 
            36480 & $$self.$$.dirty && $$invalidate(2, prevFormatted = prevValue ? (prevLabel ? prevLabel + ": " : "") + Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.formatNumber)(prevValue, digits, withSign) + suffix : ""), 
            2752 & $$self.$$.dirty && $$invalidate(3, prevDiffFormatted = prevValue ? Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.formatNumber)(value - prevValue, digits, !0) + suffix : ""), 
            73920 & $$self.$$.dirty && $$invalidate(4, prevClass = (prevValue ? value - prevValue > minValue ? "inc" : value - prevValue < -minValue ? "dec" : "zero" : "") + (inline ? " inline" : " block") + " prev"), 
            81984 & $$self.$$.dirty && $$invalidate(5, mainClass = useColorsForValue && value ? value > minValue ? "inc" : value < -minValue ? "dec" : "zero" : "");
        }, [ formatted, showPrevValue, prevFormatted, prevDiffFormatted, prevClass, mainClass, value, prevValue, zero, digits, withSign, suffix, withZeroSuffix, inline, useColorsForValue, prevLabel ];
    }
    class Value extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-1sp9ob1-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-1sp9ob1-style", 
            style.textContent = "small.block.svelte-1sp9ob1{display:block}small.inline.svelte-1sp9ob1{margin-left:.5rem}", 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                value: 6,
                prevValue: 7,
                zero: 8,
                digits: 9,
                withSign: 10,
                suffix: 11,
                withZeroSuffix: 12,
                inline: 13,
                useColorsForValue: 14,
                prevLabel: 15
            });
        }
    }
    __webpack_exports__.default = Value;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _Common_Rank_svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(32), _Common_Player_svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(33), _Common_Pp_svelte__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(34), _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(30), _temp__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(5), _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(16), _utils_date__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(6), _scoresaber_players__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(27), _Common_Avatar_svelte__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(35);
    function get_each_context(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[6] = list[i], child_ctx[8] = i, child_ctx;
    }
    function create_each_block(key_1, ctx) {
        let tr, td0, t0, td1, t1, td2, t2, td3, t3, td4, td4_class_value, t4, tr_style_value, current;
        const avatar = new _Common_Avatar_svelte__WEBPACK_IMPORTED_MODULE_9__.default({
            props: {
                url: ctx[6].avatar
            }
        }), rank = new _Common_Rank_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: {
                rank: ctx[8] + 1,
                url: "/global/" + encodeURIComponent(Math.ceil(ctx[6].rank / _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_6__.PLAYERS_PER_PAGE))
            }
        }), player = new _Common_Player_svelte__WEBPACK_IMPORTED_MODULE_2__.default({
            props: {
                user: ctx[6]
            }
        }), pp = new _Common_Pp_svelte__WEBPACK_IMPORTED_MODULE_3__.default({
            props: {
                pp: ctx[6].pp,
                zero: "0,00",
                prevPp: ctx[6].prevPp,
                inline: !0
            }
        }), value = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_4__.default({
            props: {
                value: ctx[6].change ? ctx[6].change : 0,
                zero: "0",
                digits: 0,
                withSign: !0
            }
        });
        return {
            key: key_1,
            first: null,
            c() {
                tr = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tr"), td0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(avatar.$$.fragment), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(rank.$$.fragment), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(player.$$.fragment), 
                t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(pp.$$.fragment), 
                t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                t4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td0, "class", "picture svelte-1fjn7x5"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td1, "class", "rank"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td2, "class", "player"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td3, "class", "pp"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td4, "class", td4_class_value = "diff " + (ctx[6].change ? ctx[6].change > 0 ? "inc" : "dec" : "")), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(tr, "style", tr_style_value = ctx[1] === ctx[6].id ? "background-color: var(--color-highlight);" : ""), 
                this.first = tr;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, tr, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(avatar, td0, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(rank, td1, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td2), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(player, td2, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t2), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td3), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(pp, td3, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t3), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td4), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, td4, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t4), current = !0;
            },
            p(ctx, dirty) {
                const avatar_changes = {};
                1 & dirty && (avatar_changes.url = ctx[6].avatar), avatar.$set(avatar_changes);
                const rank_changes = {};
                1 & dirty && (rank_changes.rank = ctx[8] + 1), 1 & dirty && (rank_changes.url = "/global/" + encodeURIComponent(Math.ceil(ctx[6].rank / _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_6__.PLAYERS_PER_PAGE))), 
                rank.$set(rank_changes);
                const player_changes = {};
                1 & dirty && (player_changes.user = ctx[6]), player.$set(player_changes);
                const pp_changes = {};
                1 & dirty && (pp_changes.pp = ctx[6].pp), 1 & dirty && (pp_changes.prevPp = ctx[6].prevPp), 
                pp.$set(pp_changes);
                const value_changes = {};
                1 & dirty && (value_changes.value = ctx[6].change ? ctx[6].change : 0), value.$set(value_changes), 
                (!current || 1 & dirty && td4_class_value !== (td4_class_value = "diff " + (ctx[6].change ? ctx[6].change > 0 ? "inc" : "dec" : ""))) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td4, "class", td4_class_value), 
                (!current || 1 & dirty && tr_style_value !== (tr_style_value = ctx[1] === ctx[6].id ? "background-color: var(--color-highlight);" : "")) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(tr, "style", tr_style_value);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(avatar.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(rank.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(player.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(pp.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(avatar.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(rank.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(player.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(pp.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(tr), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(avatar), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(rank), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(player), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(pp), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value);
            }
        };
    }
    function create_fragment(ctx) {
        let table, thead, t8, tbody, current, each_blocks = [], each_1_lookup = new Map, each_value = ctx[0];
        const get_key = ctx => ctx[6].id;
        for (let i = 0; i < each_value.length; i += 1) {
            let child_ctx = get_each_context(ctx, each_value, i), key = get_key(child_ctx);
            each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
        }
        return {
            c() {
                table = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("table"), thead = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("thead"), 
                thead.innerHTML = '<tr><th class="picture svelte-1fjn7x5"></th> \n        <th class="rank">Pozycja</th> \n        <th class="player">Gracz</th> \n        <th class="pp">PPs</th> \n        <th class="diff">Tydzień</th></tr>', 
                t8 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), tbody = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tbody");
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(table, "class", "ranking global sspl svelte-1fjn7x5");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, table, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table, thead), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table, t8), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table, tbody);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(tbody, null);
                current = !0;
            },
            p(ctx, [dirty]) {
                if (3 & dirty) {
                    const each_value = ctx[0];
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), each_blocks = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.outro_and_destroy_block, create_each_block, null, get_each_context), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
                }
            },
            i(local) {
                if (!current) {
                    for (let i = 0; i < each_value.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i]);
                    current = !0;
                }
            },
            o(local) {
                for (let i = 0; i < each_blocks.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i]);
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(table);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {diff: diff = 6} = $$props, {users: users = {}} = $$props;
        const mainUserId = Object(_temp__WEBPACK_IMPORTED_MODULE_5__.getMainUserId)();
        let selectedDiff = [ {
            value: 0,
            text: "Dzień"
        }, {
            value: 6,
            text: "Tydzień"
        }, {
            value: 29,
            text: "Miesiąc"
        } ].find(i => i.value === diff), ranking = [];
        return $$self.$set = $$props => {
            "diff" in $$props && $$invalidate(2, diff = $$props.diff), "users" in $$props && $$invalidate(3, users = $$props.users);
        }, $$self.$$.update = () => {
            8 & $$self.$$.dirty && selectedDiff && $$invalidate(0, ranking = Object(_scoresaber_players__WEBPACK_IMPORTED_MODULE_8__.filterByCountry)(users).reduce((cum, userId) => {
                const {id: id, name: name, avatar: avatar, country: country, pp: pp, rank: rank, userHistory: userHistory, weeklyDiff: weeklyDiff} = users[userId], historicalTimestamp = userHistory ? Object(_utils_date__WEBPACK_IMPORTED_MODULE_7__.getFirstNotNewerThan)(Object(_utils_date__WEBPACK_IMPORTED_MODULE_7__.toUTCDate)(Object(_utils_date__WEBPACK_IMPORTED_MODULE_7__.daysAgo)(selectedDiff.value + 1)), Object.keys(userHistory)) : null;
                return cum.push({
                    id: id,
                    name: name,
                    avatar: avatar,
                    country: country,
                    pp: pp,
                    prevPp: userHistory && historicalTimestamp && pp !== userHistory[historicalTimestamp].pp ? userHistory[historicalTimestamp].pp : null,
                    rank: rank,
                    history: history,
                    change: rank && weeklyDiff && rank !== _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_6__.MAGIC_HISTORY_NUMBER && weeklyDiff !== _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_6__.MAGIC_HISTORY_NUMBER ? weeklyDiff : null
                }), cum;
            }, []).sort((a, b) => b.pp - a.pp).slice(0, 50));
        }, [ ranking, mainUserId, diff, users ];
    }
    class Ranking extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-1fjn7x5-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-1fjn7x5-style", 
            style.textContent = ".sspl.svelte-1fjn7x5 .picture.svelte-1fjn7x5{padding:.5rem 0;width:1.5rem}", 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                diff: 2,
                users: 3
            });
        }
    }
    __webpack_exports__.default = Ranking;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _Value_svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(30);
    function create_if_block(ctx) {
        let small, current_block_type_index, if_block, current;
        const if_block_creators = [ create_if_block_1, create_else_block ], if_blocks = [];
        function select_block_type(ctx, dirty) {
            return ctx[2] ? 0 : 1;
        }
        return current_block_type_index = select_block_type(ctx), if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
        {
            c() {
                small = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("small"), if_block.c();
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, small, anchor), 
                if_blocks[current_block_type_index].m(small, null), current = !0;
            },
            p(ctx, dirty) {
                let previous_block_index = current_block_type_index;
                current_block_type_index = select_block_type(ctx), current_block_type_index === previous_block_index ? if_blocks[current_block_type_index].p(ctx, dirty) : (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_blocks[previous_block_index], 1, 1, () => {
                    if_blocks[previous_block_index] = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)(), if_block = if_blocks[current_block_type_index], 
                if_block || (if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
                if_block.c()), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(small, null));
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(small), 
                if_blocks[current_block_type_index].d();
            }
        };
    }
    function create_else_block(ctx) {
        let t, current;
        const value = new _Value_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: {
                value: ctx[1],
                zero: "-",
                digits: 0
            }
        });
        return {
            c() {
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("#"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, target, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                const value_changes = {};
                2 & dirty && (value_changes.value = ctx[1]), value.$set(value_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value, detaching);
            }
        };
    }
    function create_if_block_1(ctx) {
        let a, t, current;
        const value = new _Value_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: {
                value: ctx[1],
                zero: "-",
                digits: 0
            }
        });
        return {
            c() {
                a = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("a"), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("#"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "href", ctx[2]);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, a, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(a, t), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, a, null), 
                current = !0;
            },
            p(ctx, dirty) {
                const value_changes = {};
                2 & dirty && (value_changes.value = ctx[1]), value.$set(value_changes), (!current || 4 & dirty) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "href", ctx[2]);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(a), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value);
            }
        };
    }
    function create_fragment(ctx) {
        let span, t0, t1, if_block_anchor, current;
        const value = new _Value_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: {
                value: ctx[0],
                zero: "-",
                digits: 0
            }
        });
        let if_block = ctx[1] && create_if_block(ctx);
        return {
            c() {
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("#"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), if_block && if_block.c(), 
                if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, span, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor), 
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0;
            },
            p(ctx, [dirty]) {
                const value_changes = {};
                1 & dirty && (value_changes.value = ctx[0]), value.$set(value_changes), ctx[1] ? if_block ? (if_block.p(ctx, dirty), 
                2 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1)) : (if_block = create_if_block(ctx), 
                if_block.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block, 1, 1, () => {
                    if_block = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)());
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1), 
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {rank: rank} = $$props, {subRank: subRank} = $$props, {url: url} = $$props;
        return $$self.$set = $$props => {
            "rank" in $$props && $$invalidate(0, rank = $$props.rank), "subRank" in $$props && $$invalidate(1, subRank = $$props.subRank), 
            "url" in $$props && $$invalidate(2, url = $$props.url);
        }, [ rank, subRank, url ];
    }
    class Rank extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            super(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                rank: 0,
                subRank: 1,
                url: 2
            });
        }
    }
    __webpack_exports__.default = Rank;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _utils_format__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4), _network_scoresaber_players__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(28);
    function create_if_block(ctx) {
        let a, img, img_src_value, t0, span, t1, a_href_value;
        return {
            c() {
                a = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("a"), img = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("img"), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[3]), img.src !== (img_src_value = "/imports/images/flags/" + ctx[2] + ".png") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(img, "src", img_src_value), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "class", "player-name"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "href", a_href_value = Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.substituteVars)(_network_scoresaber_players__WEBPACK_IMPORTED_MODULE_2__.USER_PROFILE_URL, {
                    userId: ctx[1]
                }));
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, a, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(a, img), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(a, t0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(a, span), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t1);
            },
            p(ctx, dirty) {
                4 & dirty && img.src !== (img_src_value = "/imports/images/flags/" + ctx[2] + ".png") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(img, "src", img_src_value), 
                8 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t1, ctx[3]), 
                2 & dirty && a_href_value !== (a_href_value = Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.substituteVars)(_network_scoresaber_players__WEBPACK_IMPORTED_MODULE_2__.USER_PROFILE_URL, {
                    userId: ctx[1]
                })) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "href", a_href_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(a);
            }
        };
    }
    function create_fragment(ctx) {
        let if_block_anchor, if_block = ctx[0] && create_if_block(ctx);
        return {
            c() {
                if_block && if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
            },
            p(ctx, [dirty]) {
                ctx[0] ? if_block ? if_block.p(ctx, dirty) : (if_block = create_if_block(ctx), if_block.c(), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (if_block.d(1), 
                if_block = null);
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let userId, userCountry, userName, {user: user} = $$props;
        return $$self.$set = $$props => {
            "user" in $$props && $$invalidate(0, user = $$props.user);
        }, $$self.$$.update = () => {
            1 & $$self.$$.dirty && $$invalidate(1, userId = user && user.id ? user.id : null), 
            1 & $$self.$$.dirty && $$invalidate(2, userCountry = user && user.country ? user.country.toLowerCase() : config.COUNTRY), 
            1 & $$self.$$.dirty && $$invalidate(3, userName = user && user.name ? user.name : "???");
        }, [ user, userId, userCountry, userName ];
    }
    class Player extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            super(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                user: 0
            });
        }
    }
    __webpack_exports__.default = Player;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _Value_svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(30);
    function create_if_block(ctx) {
        let span, t0, t1, current;
        const value_spread_levels = [ {
            value: ctx[4]
        }, {
            zero: ctx[2]
        }, {
            withZeroSuffix: ctx[3]
        }, {
            suffix: "pp"
        }, ctx[5] ];
        let value_props = {};
        for (let i = 0; i < value_spread_levels.length; i += 1) value_props = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)(value_props, value_spread_levels[i]);
        const value = new _Value_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: value_props
        });
        return {
            c() {
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("("), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(")"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "class", "scoreTop ppWeightedValue");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, span, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t1), current = !0;
            },
            p(ctx, dirty) {
                const value_changes = 60 & dirty ? Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_update)(value_spread_levels, [ 16 & dirty && {
                    value: ctx[4]
                }, 4 & dirty && {
                    zero: ctx[2]
                }, 8 & dirty && {
                    withZeroSuffix: ctx[3]
                }, value_spread_levels[3], 32 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_object)(ctx[5]) ]) : {};
                value.$set(value_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value);
            }
        };
    }
    function create_fragment(ctx) {
        let span, t, if_block_anchor, current;
        const value_spread_levels = [ {
            value: ctx[0]
        }, {
            zero: ctx[2]
        }, {
            withZeroSuffix: ctx[3]
        }, {
            prevValue: ctx[1]
        }, {
            suffix: "pp"
        }, ctx[5] ];
        let value_props = {};
        for (let i = 0; i < value_spread_levels.length; i += 1) value_props = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)(value_props, value_spread_levels[i]);
        const value = new _Value_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: value_props
        });
        let if_block = ctx[4] && create_if_block(ctx);
        return {
            c() {
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), if_block && if_block.c(), 
                if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "class", "scoreTop ppValue");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, span, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t, anchor), 
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0;
            },
            p(ctx, [dirty]) {
                const value_changes = 47 & dirty ? Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_update)(value_spread_levels, [ 1 & dirty && {
                    value: ctx[0]
                }, 4 & dirty && {
                    zero: ctx[2]
                }, 8 & dirty && {
                    withZeroSuffix: ctx[3]
                }, 2 & dirty && {
                    prevValue: ctx[1]
                }, value_spread_levels[4], 32 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_object)(ctx[5]) ]) : {};
                value.$set(value_changes), ctx[4] ? if_block ? (if_block.p(ctx, dirty), 16 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1)) : (if_block = create_if_block(ctx), 
                if_block.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block, 1, 1, () => {
                    if_block = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)());
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t), 
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        const omit_props_names = [ "pp", "prevPp", "zero", "withZeroSuffix", "weighted" ];
        let $$restProps = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.compute_rest_props)($$props, omit_props_names), {pp: pp = 0} = $$props, {prevPp: prevPp = null} = $$props, {zero: zero = "-"} = $$props, {withZeroSuffix: withZeroSuffix = !1} = $$props, {weighted: weighted = null} = $$props;
        return $$self.$set = $$new_props => {
            $$props = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)(Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)({}, $$props), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.exclude_internal_props)($$new_props)), 
            $$invalidate(5, $$restProps = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.compute_rest_props)($$props, omit_props_names)), 
            "pp" in $$new_props && $$invalidate(0, pp = $$new_props.pp), "prevPp" in $$new_props && $$invalidate(1, prevPp = $$new_props.prevPp), 
            "zero" in $$new_props && $$invalidate(2, zero = $$new_props.zero), "withZeroSuffix" in $$new_props && $$invalidate(3, withZeroSuffix = $$new_props.withZeroSuffix), 
            "weighted" in $$new_props && $$invalidate(4, weighted = $$new_props.weighted);
        }, [ pp, prevPp, zero, withZeroSuffix, weighted, $$restProps ];
    }
    class Pp extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            super(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                pp: 0,
                prevPp: 1,
                zero: 2,
                withZeroSuffix: 3,
                weighted: 4
            });
        }
    }
    __webpack_exports__.default = Pp;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(16);
    function create_if_block(ctx) {
        let figure, img, img_src_value;
        return {
            c() {
                figure = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("figure"), 
                img = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("img"), img.src !== (img_src_value = ctx[1]) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(img, "src", img_src_value), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(img, "border-radius", "50%"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(figure, "class", "image is-24x24 svelte-bw17ze");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, figure, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(figure, img);
            },
            p(ctx, dirty) {
                2 & dirty && img.src !== (img_src_value = ctx[1]) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(img, "src", img_src_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(figure);
            }
        };
    }
    function create_fragment(ctx) {
        let if_block_anchor, if_block = ctx[0] && create_if_block(ctx);
        return {
            c() {
                if_block && if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
            },
            p(ctx, [dirty]) {
                ctx[0] ? if_block ? if_block.p(ctx, dirty) : (if_block = create_if_block(ctx), if_block.c(), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (if_block.d(1), 
                if_block = null);
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let fullUrl, {url: url} = $$props;
        return $$self.$set = $$props => {
            "url" in $$props && $$invalidate(0, url = $$props.url);
        }, $$self.$$.update = () => {
            1 & $$self.$$.dirty && $$invalidate(1, fullUrl = _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_1__.NEW_SCORESABER_URL + url);
        }, [ url, fullUrl ];
    }
    class Avatar extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-bw17ze-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-bw17ze-style", 
            style.textContent = "figure.svelte-bw17ze{margin:0}", Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                url: 0
            });
        }
    }
    __webpack_exports__.default = Avatar;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _Actions_hoverable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(37), _Common_Avatar_svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(35), _Common_Rank_svelte__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(32), _Common_Player_svelte__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(33), _Common_Date_svelte__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(38), _Common_Pp_svelte__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(34), _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(30), _WhatIfPp_svelte__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(39), _Common_Refresh_svelte__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(40), _Song_NewRankeds_svelte__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(45), _temp__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(5), _store__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(9), _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(16);
    function get_each_context(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[14] = list[i], child_ctx;
    }
    function get_each_context_1(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[14] = list[i], child_ctx[18] = i, child_ctx;
    }
    function create_else_block(ctx) {
        let div;
        return {
            c() {
                div = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), div.innerHTML = "<h3>Strasznie tu pusto</h3> \n        <p>Wygląda na to, że nie ma jeszcze żadnych danych.</p> \n        <p>Usiądź sobie wygodnie, otwórz harnasia, kliknij Odśwież i poczekaj, bo trochę to potrwa...</p>", 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div, "class", "first-fetch svelte-1dr8553");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor);
            },
            p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div);
            }
        };
    }
    function create_if_block(ctx) {
        let table0, thead, t14, tbody0, hoverable_action, t15, div, table1, tbody1, current, dispose, each_blocks_1 = [], each0_lookup = new Map, each_blocks = [], each1_lookup = new Map, each_value_1 = ctx[1];
        const get_key = ctx => ctx[14].id;
        for (let i = 0; i < each_value_1.length; i += 1) {
            let child_ctx = get_each_context_1(ctx, each_value_1, i), key = get_key(child_ctx);
            each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
        }
        let each_value = ctx[3];
        const get_key_1 = ctx => ctx[14].timestamp;
        for (let i = 0; i < each_value.length; i += 1) {
            let child_ctx = get_each_context(ctx, each_value, i), key = get_key_1(child_ctx);
            each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
        }
        return {
            c() {
                table0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("table"), 
                thead = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("thead"), thead.innerHTML = '<tr><th class="picture svelte-1dr8553"></th> \n        <th class="rank svelte-1dr8553">#</th> \n        <th class="player svelte-1dr8553">Gracz</th> \n        <th class="score svelte-1dr8553">Wynik</th> \n        <th class="timeset svelte-1dr8553">Czas</th> \n        <th class="mods svelte-1dr8553">Mody</th> \n        <th class="percentage svelte-1dr8553">Procent</th> \n        <th class="pp svelte-1dr8553">PP</th></tr>', 
                t14 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), tbody0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tbody");
                for (let i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].c();
                t15 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), div = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), 
                table1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("table"), 
                tbody1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tbody");
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(tbody0, "class", "svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(table0, "class", "ranking sspl svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(table1, "class", "history"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div, "class", "tooltip svelte-1dr8553");
            },
            m(target, anchor, remount) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, table0, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table0, thead), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table0, t14), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table0, tbody0);
                for (let i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].m(tbody0, null);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t15, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, table1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table1, tbody1);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(tbody1, null);
                ctx[12](div), current = !0, remount && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.run_all)(dispose), 
                dispose = [ Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.action_destroyer)(hoverable_action = _Actions_hoverable__WEBPACK_IMPORTED_MODULE_1__.hoverable.call(null, tbody0)), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(tbody0, "hover", ctx[9]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(tbody0, "unhover", ctx[10]) ];
            },
            p(ctx, dirty) {
                if (131 & dirty) {
                    const each_value_1 = ctx[1];
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), each_blocks_1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, tbody0, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.outro_and_destroy_block, create_each_block_1, null, get_each_context_1), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
                }
                if (8 & dirty) {
                    const each_value = ctx[3];
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), each_blocks = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, tbody1, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.outro_and_destroy_block, create_each_block, null, get_each_context), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
                }
            },
            i(local) {
                if (!current) {
                    for (let i = 0; i < each_value_1.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks_1[i]);
                    for (let i = 0; i < each_value.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i]);
                    current = !0;
                }
            },
            o(local) {
                for (let i = 0; i < each_blocks_1.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks_1[i]);
                for (let i = 0; i < each_blocks.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i]);
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(table0);
                for (let i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].d();
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t15), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
                ctx[12](null), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.run_all)(dispose);
            }
        };
    }
    function create_each_block_1(key_1, ctx) {
        let tr, td0, t0, td1, t1, td2, t2, td3, t3, td4, t4, td5, t5, t6, td6, t7, td7, t8, t9, tr_class_value, tr_data_id_value, current, t5_value = (ctx[14].mods && ctx[14].mods.length ? ctx[14].mods : "-") + "";
        const avatar = new _Common_Avatar_svelte__WEBPACK_IMPORTED_MODULE_2__.default({
            props: {
                url: ctx[14].avatar
            }
        }), rank = new _Common_Rank_svelte__WEBPACK_IMPORTED_MODULE_3__.default({
            props: {
                rank: ctx[18] + 1,
                subRank: ctx[14].rank,
                url: "/leaderboard/" + encodeURIComponent(ctx[0]) + "?page=" + encodeURIComponent(Math.ceil(ctx[14].rank / _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_13__.SCORES_PER_PAGE))
            }
        }), player = new _Common_Player_svelte__WEBPACK_IMPORTED_MODULE_4__.default({
            props: {
                user: ctx[14]
            }
        }), value0 = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_7__.default({
            props: {
                value: ctx[14].score,
                digits: 0,
                zero: "-",
                prevValue: ctx[14].playHistory && ctx[14].playHistory.length ? ctx[14].playHistory[0].score : null
            }
        }), date = new _Common_Date_svelte__WEBPACK_IMPORTED_MODULE_5__.default({
            props: {
                date: ctx[14].timeset,
                prevDate: ctx[14].playHistory && ctx[14].playHistory.length ? ctx[14].playHistory[0].timeset : null
            }
        }), value1 = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_7__.default({
            props: {
                value: 100 * ctx[14].percent,
                zero: "-",
                suffix: "%",
                prevValue: ctx[14].playHistory && ctx[14].playHistory.length ? 100 * ctx[14].playHistory[0].percent : null
            }
        }), pp = new _Common_Pp_svelte__WEBPACK_IMPORTED_MODULE_6__.default({
            props: {
                pp: ctx[14].pp,
                prevPp: ctx[14].playHistory && ctx[14].playHistory.length ? ctx[14].playHistory[0].pp : null
            }
        }), whatifpp = new _WhatIfPp_svelte__WEBPACK_IMPORTED_MODULE_8__.default({
            props: {
                leaderboardId: ctx[0],
                pp: ctx[14].pp
            }
        });
        return {
            key: key_1,
            first: null,
            c() {
                tr = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tr"), td0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(avatar.$$.fragment), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(rank.$$.fragment), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(player.$$.fragment), 
                t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value0.$$.fragment), 
                t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(date.$$.fragment), 
                t4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td5 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                t5 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t5_value), t6 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                td6 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value1.$$.fragment), 
                t7 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td7 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(pp.$$.fragment), 
                t8 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(whatifpp.$$.fragment), 
                t9 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td0, "class", "picture svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td1, "class", "rank svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td2, "class", "player svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td3, "class", "score svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td4, "class", "timeset svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td5, "class", "mods svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td6, "class", "percentage svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td7, "class", "pp svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(tr, "class", tr_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)((ctx[14].hidden ? "hidden" : "") + (ctx[7] === ctx[14].id ? " main" : "")) + " svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(tr, "data-id", tr_data_id_value = ctx[14].id), 
                this.first = tr;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, tr, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(avatar, td0, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(rank, td1, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td2), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(player, td2, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t2), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td3), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value0, td3, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t3), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td4), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(date, td4, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t4), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td5), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(td5, t5), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t6), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td6), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value1, td6, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t7), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td7), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(pp, td7, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(td7, t8), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(whatifpp, td7, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t9), current = !0;
            },
            p(ctx, dirty) {
                const avatar_changes = {};
                2 & dirty && (avatar_changes.url = ctx[14].avatar), avatar.$set(avatar_changes);
                const rank_changes = {};
                2 & dirty && (rank_changes.rank = ctx[18] + 1), 2 & dirty && (rank_changes.subRank = ctx[14].rank), 
                3 & dirty && (rank_changes.url = "/leaderboard/" + encodeURIComponent(ctx[0]) + "?page=" + encodeURIComponent(Math.ceil(ctx[14].rank / _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_13__.SCORES_PER_PAGE))), 
                rank.$set(rank_changes);
                const player_changes = {};
                2 & dirty && (player_changes.user = ctx[14]), player.$set(player_changes);
                const value0_changes = {};
                2 & dirty && (value0_changes.value = ctx[14].score), 2 & dirty && (value0_changes.prevValue = ctx[14].playHistory && ctx[14].playHistory.length ? ctx[14].playHistory[0].score : null), 
                value0.$set(value0_changes);
                const date_changes = {};
                2 & dirty && (date_changes.date = ctx[14].timeset), 2 & dirty && (date_changes.prevDate = ctx[14].playHistory && ctx[14].playHistory.length ? ctx[14].playHistory[0].timeset : null), 
                date.$set(date_changes), (!current || 2 & dirty) && t5_value !== (t5_value = (ctx[14].mods && ctx[14].mods.length ? ctx[14].mods : "-") + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t5, t5_value);
                const value1_changes = {};
                2 & dirty && (value1_changes.value = 100 * ctx[14].percent), 2 & dirty && (value1_changes.prevValue = ctx[14].playHistory && ctx[14].playHistory.length ? 100 * ctx[14].playHistory[0].percent : null), 
                value1.$set(value1_changes);
                const pp_changes = {};
                2 & dirty && (pp_changes.pp = ctx[14].pp), 2 & dirty && (pp_changes.prevPp = ctx[14].playHistory && ctx[14].playHistory.length ? ctx[14].playHistory[0].pp : null), 
                pp.$set(pp_changes);
                const whatifpp_changes = {};
                1 & dirty && (whatifpp_changes.leaderboardId = ctx[0]), 2 & dirty && (whatifpp_changes.pp = ctx[14].pp), 
                whatifpp.$set(whatifpp_changes), (!current || 2 & dirty && tr_class_value !== (tr_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)((ctx[14].hidden ? "hidden" : "") + (ctx[7] === ctx[14].id ? " main" : "")) + " svelte-1dr8553")) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(tr, "class", tr_class_value), 
                (!current || 2 & dirty && tr_data_id_value !== (tr_data_id_value = ctx[14].id)) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(tr, "data-id", tr_data_id_value);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(avatar.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(rank.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(player.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value0.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(date.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value1.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(pp.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(whatifpp.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(avatar.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(rank.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(player.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value0.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(date.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value1.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(pp.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(whatifpp.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(tr), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(avatar), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(rank), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(player), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(date), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(pp), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(whatifpp);
            }
        };
    }
    function create_each_block(key_1, ctx) {
        let tr, td0, t0, td1, t1, td2, t2, td3, t3, current;
        const date = new _Common_Date_svelte__WEBPACK_IMPORTED_MODULE_5__.default({
            props: {
                date: ctx[14].timeset
            }
        }), value0 = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_7__.default({
            props: {
                value: ctx[14].score,
                digits: 0,
                zero: "-"
            }
        }), value1 = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_7__.default({
            props: {
                value: 100 * ctx[14].percent,
                zero: "-",
                suffix: "%"
            }
        }), pp = new _Common_Pp_svelte__WEBPACK_IMPORTED_MODULE_6__.default({
            props: {
                pp: ctx[14].pp
            }
        });
        return {
            key: key_1,
            first: null,
            c() {
                tr = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tr"), td0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(date.$$.fragment), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value0.$$.fragment), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value1.$$.fragment), 
                t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(pp.$$.fragment), 
                t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td0, "class", "svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td1, "class", "svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td2, "class", "svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td3, "class", "svelte-1dr8553"), 
                this.first = tr;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, tr, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(date, td0, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value0, td1, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td2), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value1, td2, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t2), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td3), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(pp, td3, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t3), current = !0;
            },
            p(ctx, dirty) {
                const date_changes = {};
                8 & dirty && (date_changes.date = ctx[14].timeset), date.$set(date_changes);
                const value0_changes = {};
                8 & dirty && (value0_changes.value = ctx[14].score), value0.$set(value0_changes);
                const value1_changes = {};
                8 & dirty && (value1_changes.value = 100 * ctx[14].percent), value1.$set(value1_changes);
                const pp_changes = {};
                8 & dirty && (pp_changes.pp = ctx[14].pp), pp.$set(pp_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(date.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value0.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value1.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(pp.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(date.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value0.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value1.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(pp.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(tr), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(date), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(pp);
            }
        };
    }
    function create_fragment(ctx) {
        let div1, div0, t0, t1, current_block_type_index, if_block, current;
        const refresh = new _Common_Refresh_svelte__WEBPACK_IMPORTED_MODULE_9__.default({});
        refresh.$on("new-rankeds", ctx[8]), refresh.$on("data-refreshed", ctx[11]);
        const newrankeds = new _Song_NewRankeds_svelte__WEBPACK_IMPORTED_MODULE_10__.default({
            props: {
                rankeds: ctx[5]
            }
        }), if_block_creators = [ create_if_block, create_else_block ], if_blocks = [];
        function select_block_type(ctx, dirty) {
            return ctx[6] ? 0 : 1;
        }
        return current_block_type_index = select_block_type(ctx), if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
        {
            c() {
                div1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), div0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(refresh.$$.fragment), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(newrankeds.$$.fragment), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), if_block.c(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div0, "class", "refresh svelte-1dr8553"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div1, "class", "leaderboard-container svelte-1dr8553");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, div0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(refresh, div0, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(newrankeds, div1, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, t1), if_blocks[current_block_type_index].m(div1, null), 
                ctx[13](div1), current = !0;
            },
            p(ctx, [dirty]) {
                const newrankeds_changes = {};
                32 & dirty && (newrankeds_changes.rankeds = ctx[5]), newrankeds.$set(newrankeds_changes);
                let previous_block_index = current_block_type_index;
                current_block_type_index = select_block_type(ctx), current_block_type_index === previous_block_index ? if_blocks[current_block_type_index].p(ctx, dirty) : (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_blocks[previous_block_index], 1, 1, () => {
                    if_blocks[previous_block_index] = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)(), if_block = if_blocks[current_block_type_index], 
                if_block || (if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
                if_block.c()), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(div1, null));
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(refresh.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(newrankeds.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(refresh.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(newrankeds.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(refresh), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(newrankeds), 
                if_blocks[current_block_type_index].d(), ctx[13](null);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {leaderboardId: leaderboardId} = $$props, {leaderboard: leaderboard = []} = $$props;
        const mainUserId = Object(_temp__WEBPACK_IMPORTED_MODULE_11__.getMainUserId)();
        let tooltip, leaderboardContainer, tooltipHistory = [], newRankeds = [], dataAvailable = !1;
        return Object(_store__WEBPACK_IMPORTED_MODULE_12__.isAnyData)().then(v => $$invalidate(6, dataAvailable = v)), 
        $$self.$set = $$props => {
            "leaderboardId" in $$props && $$invalidate(0, leaderboardId = $$props.leaderboardId), 
            "leaderboard" in $$props && $$invalidate(1, leaderboard = $$props.leaderboard);
        }, [ leaderboardId, leaderboard, tooltip, tooltipHistory, leaderboardContainer, newRankeds, dataAvailable, mainUserId, function(event) {
            $$invalidate(5, newRankeds = event.detail);
        }, function(event) {
            const tr = event.detail.target.closest("tr"), trBound = tr.getBoundingClientRect(), lbBound = leaderboardContainer.getBoundingClientRect(), tooltipTop = trBound.top - lbBound.top;
            $$invalidate(3, tooltipHistory = []);
            const userId = tr.dataset.id;
            if (!userId) return;
            const score = leaderboard.find(u => u.id === userId);
            score && score.playHistory && score.playHistory.length && ($$invalidate(3, tooltipHistory = score.playHistory.slice(0, 3)), 
            $$invalidate(2, tooltip.style.display = "inline-block", tooltip), $$invalidate(2, tooltip.style.top = tooltipTop + trBound.height + "px", tooltip));
        }, function(event) {
            $$invalidate(2, tooltip.style.display = "none", tooltip);
        }, function(event) {
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.bubble)($$self, event);
        }, function($$value) {
            svelte_internal__WEBPACK_IMPORTED_MODULE_0__.binding_callbacks[$$value ? "unshift" : "push"](() => {
                $$invalidate(2, tooltip = $$value);
            });
        }, function($$value) {
            svelte_internal__WEBPACK_IMPORTED_MODULE_0__.binding_callbacks[$$value ? "unshift" : "push"](() => {
                $$invalidate(4, leaderboardContainer = $$value);
            });
        } ];
    }
    class Leaderboard extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-1dr8553-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-1dr8553-style", 
            style.textContent = ".sspl.svelte-1dr8553 tbody.svelte-1dr8553{padding-bottom:2rem}.sspl.svelte-1dr8553 th.svelte-1dr8553,.sspl.svelte-1dr8553 td.svelte-1dr8553{padding:.5rem}.sspl.svelte-1dr8553 thead th.rank.svelte-1dr8553{width:5.4rem}.sspl.svelte-1dr8553 thead th.svelte-1dr8553,.sspl.svelte-1dr8553 tbody td.mods.svelte-1dr8553,.sspl.svelte-1dr8553 tbody td.percentage.svelte-1dr8553,.sspl.svelte-1dr8553 tbody td.pp.svelte-1dr8553{text-align:center}.sspl.svelte-1dr8553 tbody td.score.svelte-1dr8553{text-align:right}.sspl.svelte-1dr8553 .score.svelte-1dr8553,.sspl.svelte-1dr8553 .pp.svelte-1dr8553{width:6rem}.sspl.svelte-1dr8553 .picture.svelte-1dr8553{padding:.5rem 0}.refresh.svelte-1dr8553.svelte-1dr8553{text-align:right;margin-bottom:1rem}.first-fetch.svelte-1dr8553.svelte-1dr8553{text-align:center\n    }.tooltip.svelte-1dr8553.svelte-1dr8553{display:none;position:absolute;top:0;right:1rem;z-index:10;width:25rem;padding:.25rem;font-size:.875rem;font-weight:normal;text-align:center;color:var(--textColor);background-color:var(--background);border:1px solid var(--textColor)}.tooltip.svelte-1dr8553 table td.svelte-1dr8553{padding:3px}.leaderboard-container.svelte-1dr8553.svelte-1dr8553{position:relative}", 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                leaderboardId: 0,
                leaderboard: 1
            });
        }
    }
    __webpack_exports__.default = Leaderboard;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    function hoverable(node) {
        function handleMouseover(event) {
            node.dispatchEvent(new CustomEvent("hover", {
                detail: {
                    target: event.target,
                    clientX: event.clientX,
                    clientY: event.clientY,
                    pageX: event.pageX,
                    pageY: event.pageY
                }
            }));
        }
        function handleMouseout(event) {
            node.dispatchEvent(new CustomEvent("unhover", {
                detail: {
                    target: event.target,
                    clientX: event.clientX,
                    clientY: event.clientY,
                    pageX: event.pageX,
                    pageY: event.pageY
                }
            }));
        }
        return node.addEventListener("mouseover", handleMouseover), node.addEventListener("mouseout", handleMouseout), 
        {
            destroy() {
                node.removeEventListener("mouseover", handleMouseover), node.removeEventListener("mouseout", handleMouseout);
            }
        };
    }
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "hoverable", (function() {
        return hoverable;
    }));
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _utils_format__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4), _utils_date__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
    function create_if_block(ctx) {
        let small, t, small_title_value;
        return {
            c() {
                small = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("small"), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[3]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(small, "title", small_title_value = ctx[2].toLocaleString()), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(small, "class", "svelte-1j3lv2f");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, small, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(small, t);
            },
            p(ctx, dirty) {
                8 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, ctx[3]), 
                4 & dirty && small_title_value !== (small_title_value = ctx[2].toLocaleString()) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(small, "title", small_title_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(small);
            }
        };
    }
    function create_fragment(ctx) {
        let span, t, span_title_value, if_block_anchor, if_block = ctx[2] && create_if_block(ctx);
        return {
            c() {
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[1]), 
                if_block && if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "title", span_title_value = ctx[0] ? ctx[0].toLocaleString() : "");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t), if_block && if_block.m(target, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
            },
            p(ctx, [dirty]) {
                2 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, ctx[1]), 
                1 & dirty && span_title_value !== (span_title_value = ctx[0] ? ctx[0].toLocaleString() : "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "title", span_title_value), 
                ctx[2] ? if_block ? if_block.p(ctx, dirty) : (if_block = create_if_block(ctx), if_block.c(), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (if_block.d(1), 
                if_block = null);
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span), 
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let dateObj, formatted, prevDateObj, prevFormatted, {date: date = new Date} = $$props, {prevDate: prevDate = null} = $$props;
        return $$self.$set = $$props => {
            "date" in $$props && $$invalidate(4, date = $$props.date), "prevDate" in $$props && $$invalidate(5, prevDate = $$props.prevDate);
        }, $$self.$$.update = () => {
            16 & $$self.$$.dirty && $$invalidate(0, dateObj = date instanceof Date ? date : Object(_utils_date__WEBPACK_IMPORTED_MODULE_2__.dateFromString)(date)), 
            17 & $$self.$$.dirty && $$invalidate(1, formatted = date ? Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.formatDate)(dateObj.toISOString()) : ""), 
            48 & $$self.$$.dirty && $$invalidate(2, prevDateObj = prevDate ? prevDate instanceof Date ? prevDate : Object(_utils_date__WEBPACK_IMPORTED_MODULE_2__.dateFromString)(date) : null), 
            36 & $$self.$$.dirty && $$invalidate(3, prevFormatted = prevDate ? Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.formatDate)(prevDateObj.toISOString()) : "");
        }, [ dateObj, formatted, prevDateObj, prevFormatted, date, prevDate ];
    }
    class Date_1 extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-1j3lv2f-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-1j3lv2f-style", 
            style.textContent = "small.svelte-1j3lv2f{display:block}", Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                date: 4,
                prevDate: 5
            });
        }
    }
    __webpack_exports__.default = Date_1;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _Actions_hoverable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(37), _temp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5), _scoresaber_pp__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8), _utils_format__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4);
    function create_if_block_1(ctx) {
        let button, hoverable_action, t1, div, t2, t3, t4, strong0, t5, t6, strong1, t7, t8, dispose, t3_value = Object(_utils_format__WEBPACK_IMPORTED_MODULE_4__.formatNumber)(ctx[3].currentTotalPp) + "", t5_value = Object(_utils_format__WEBPACK_IMPORTED_MODULE_4__.formatNumber)(ctx[3].diff) + "", t7_value = Object(_utils_format__WEBPACK_IMPORTED_MODULE_4__.formatNumber)(ctx[3].newTotalPp) + "";
        return {
            c() {
                button = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("button"), 
                button.textContent = "?", t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                div = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("Jeśli tak zagrasz: "), 
                t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t3_value), t4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(" + "), 
                strong0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("strong"), 
                t5 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t5_value), t6 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(" =\n            "), 
                strong1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("strong"), 
                t7 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t7_value), t8 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("pp"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(button, "class", "what-if"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(strong0, "class", "svelte-ali73z"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(strong1, "class", "inc svelte-ali73z"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div, "class", "tooltip svelte-ali73z");
            },
            m(target, anchor, remount) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, button, anchor), 
                ctx[9](button), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, t2), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, t3), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, t4), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, strong0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(strong0, t5), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, t6), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, strong1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(strong1, t7), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(strong1, t8), ctx[10](div), 
                remount && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.run_all)(dispose), 
                dispose = [ Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.action_destroyer)(hoverable_action = _Actions_hoverable__WEBPACK_IMPORTED_MODULE_1__.hoverable.call(null, button)), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(button, "hover", ctx[6]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(button, "unhover", ctx[7]) ];
            },
            p(ctx, dirty) {
                8 & dirty && t3_value !== (t3_value = Object(_utils_format__WEBPACK_IMPORTED_MODULE_4__.formatNumber)(ctx[3].currentTotalPp) + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t3, t3_value), 
                8 & dirty && t5_value !== (t5_value = Object(_utils_format__WEBPACK_IMPORTED_MODULE_4__.formatNumber)(ctx[3].diff) + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t5, t5_value), 
                8 & dirty && t7_value !== (t7_value = Object(_utils_format__WEBPACK_IMPORTED_MODULE_4__.formatNumber)(ctx[3].newTotalPp) + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t7, t7_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(button), 
                ctx[9](null), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div), ctx[10](null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.run_all)(dispose);
            }
        };
    }
    function create_fragment(ctx) {
        let if_block_anchor, if_block = ctx[5] && function(ctx) {
            let if_block_anchor, show_if = Object(_utils_format__WEBPACK_IMPORTED_MODULE_4__.round)(ctx[0]) > Object(_utils_format__WEBPACK_IMPORTED_MODULE_4__.round)(ctx[4]), if_block = show_if && create_if_block_1(ctx);
            return {
                c() {
                    if_block && if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
                },
                m(target, anchor) {
                    if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
                },
                p(ctx, dirty) {
                    17 & dirty && (show_if = Object(_utils_format__WEBPACK_IMPORTED_MODULE_4__.round)(ctx[0]) > Object(_utils_format__WEBPACK_IMPORTED_MODULE_4__.round)(ctx[4])), 
                    show_if ? if_block ? if_block.p(ctx, dirty) : (if_block = create_if_block_1(ctx), 
                    if_block.c(), if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (if_block.d(1), 
                    if_block = null);
                },
                d(detaching) {
                    if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
                }
            };
        }(ctx);
        return {
            c() {
                if_block && if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
            },
            p(ctx, [dirty]) {
                ctx[5] && if_block.p(ctx, dirty);
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let buttonEl, tooltip, {leaderboardId: leaderboardId} = $$props, {pp: pp = 0} = $$props, mainUserId = Object(_temp__WEBPACK_IMPORTED_MODULE_2__.getMainUserId)(), score = {
            currentTotalPp: 0,
            newTotalPp: 0,
            diff: 0
        }, userPp = 0;
        return (async _ => {
            const score = await Object(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_3__.getUserSongScore)(mainUserId, leaderboardId);
            $$invalidate(4, userPp = void 0 !== score ? score.pp : 0);
        })(), $$self.$set = $$props => {
            "leaderboardId" in $$props && $$invalidate(8, leaderboardId = $$props.leaderboardId), 
            "pp" in $$props && $$invalidate(0, pp = $$props.pp);
        }, [ pp, buttonEl, tooltip, score, userPp, mainUserId, async function(event) {
            const wi = await Object(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_3__.getWhatIfScore)(mainUserId, leaderboardId, pp);
            $$invalidate(3, score = Object.assign({}, score, wi)), $$invalidate(2, tooltip.style.display = "inline-block", tooltip);
        }, function(event) {
            $$invalidate(2, tooltip.style.display = "none", tooltip);
        }, leaderboardId, function($$value) {
            svelte_internal__WEBPACK_IMPORTED_MODULE_0__.binding_callbacks[$$value ? "unshift" : "push"](() => {
                $$invalidate(1, buttonEl = $$value);
            });
        }, function($$value) {
            svelte_internal__WEBPACK_IMPORTED_MODULE_0__.binding_callbacks[$$value ? "unshift" : "push"](() => {
                $$invalidate(2, tooltip = $$value);
            });
        } ];
    }
    class WhatIfPp extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-ali73z-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-ali73z-style", 
            style.textContent = ".tooltip.svelte-ali73z{display:none;position:absolute;top:0;right:1rem;z-index:10;width:21rem;padding:.25rem;font-size:.875rem;font-weight:normal;text-align:center;color:var(--textColor);background-color:var(--background);border:1px solid var(--foreground)}strong.svelte-ali73z{color:inherit !important;background-color:inherit !important}.inc.svelte-ali73z{color:#42b129!important}", 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                leaderboardId: 8,
                pp: 0
            });
        }
    }
    __webpack_exports__.default = WhatIfPp;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _Progress_svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(41), _utils_format__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4), _store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9), _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(16), _temp__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(5), _utils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(15), _utils_logger__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(10), svelte__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(43), _network_scoresaber_rankeds__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(13), _network_scoresaber_scores__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(44), _network_scoresaber_players__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(28), _utils_date__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(6);
    function create_else_block(ctx) {
        let button, t0, t1, strong, t3, span, t4, dispose, t4_value = (ctx[4] ? Object(_utils_format__WEBPACK_IMPORTED_MODULE_2__.formatDate)(ctx[4]) : "-") + "";
        return {
            c() {
                button = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("button"), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("↻"), t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                strong = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("strong"), 
                strong.textContent = "Data pobrania:", t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), t4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t4_value), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(button, "title", "Odśwież"), 
                button.disabled = ctx[3];
            },
            m(target, anchor, remount) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, button, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(button, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, strong, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t3, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t4), remount && dispose(), 
                dispose = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(button, "click", ctx[5]);
            },
            p(ctx, dirty) {
                8 & dirty && (button.disabled = ctx[3]), 16 & dirty && t4_value !== (t4_value = (ctx[4] ? Object(_utils_format__WEBPACK_IMPORTED_MODULE_2__.formatDate)(ctx[4]) : "-") + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t4, t4_value);
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(button), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(strong), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t3), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span), 
                dispose();
            }
        };
    }
    function create_if_block(ctx) {
        let current;
        const progress_1 = new _Progress_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: {
                value: ctx[2],
                label: ctx[0],
                subLabel: ctx[1],
                maxWidth: "16rem"
            }
        });
        return {
            c() {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(progress_1.$$.fragment);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(progress_1, target, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                const progress_1_changes = {};
                4 & dirty && (progress_1_changes.value = ctx[2]), 1 & dirty && (progress_1_changes.label = ctx[0]), 
                2 & dirty && (progress_1_changes.subLabel = ctx[1]), progress_1.$set(progress_1_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(progress_1.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(progress_1.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(progress_1, detaching);
            }
        };
    }
    function create_fragment(ctx) {
        let div, current_block_type_index, if_block, current;
        const if_block_creators = [ create_if_block, create_else_block ], if_blocks = [];
        function select_block_type(ctx, dirty) {
            return ctx[3] ? 0 : 1;
        }
        return current_block_type_index = select_block_type(ctx), if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
        {
            c() {
                div = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), if_block.c();
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor), 
                if_blocks[current_block_type_index].m(div, null), current = !0;
            },
            p(ctx, [dirty]) {
                let previous_block_index = current_block_type_index;
                current_block_type_index = select_block_type(ctx), current_block_type_index === previous_block_index ? if_blocks[current_block_type_index].p(ctx, dirty) : (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_blocks[previous_block_index], 1, 1, () => {
                    if_blocks[previous_block_index] = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)(), if_block = if_blocks[current_block_type_index], 
                if_block || (if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
                if_block.c()), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(div, null));
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div), if_blocks[current_block_type_index].d();
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        const dispatch = Object(svelte__WEBPACK_IMPORTED_MODULE_8__.createEventDispatcher)();
        let label = "", subLabel = "", progress = 0, started = !1, date = null;
        function updateProgress(info) {
            $$invalidate(2, progress = info.percent), $$invalidate(0, label = Object(_utils_js__WEBPACK_IMPORTED_MODULE_6__.escapeHtml)(info.name)), 
            $$invalidate(1, subLabel = info.wait ? "[Czekam " + Math.floor(info.wait / 1e3) + "s]" : info.page.toString());
        }
        return Object(_store__WEBPACK_IMPORTED_MODULE_3__.lastUpdated)().then(d => $$invalidate(4, date = Object(_utils_date__WEBPACK_IMPORTED_MODULE_12__.dateFromString)(d))), 
        [ label, subLabel, progress, started, date, async function() {
            $$invalidate(3, started = !0), $$invalidate(2, progress = 0), async function() {
                $$invalidate(0, label = ""), $$invalidate(1, subLabel = "Pobieranie listy top 50 " + _temp__WEBPACK_IMPORTED_MODULE_5__.default.COUNTRY.toUpperCase() + "...");
                const users = await Object(_network_scoresaber_players__WEBPACK_IMPORTED_MODULE_11__.fetchUsers)();
                $$invalidate(0, label = ""), $$invalidate(1, subLabel = "");
                const data = await Object(_store__WEBPACK_IMPORTED_MODULE_3__.getCacheAndConvertIfNeeded)();
                data.users && Object.keys(data.users).map(userId => data.users[userId].inactive = !0);
                let idx = 0, cache = await users.reduce(async (promisedCum, u) => {
                    let cum = await promisedCum;
                    if (u.userHistory = cum.users && cum.users[u.id] && cum.users[u.id].userHistory ? cum.users[u.id].userHistory : {}, 
                    cum && cum.users && cum.users[u.id]) {
                        const {rank: rank, pp: pp, countryRank: countryRank} = cum.users[u.id];
                        u.userHistory = Object.assign({}, u.userHistory, {
                            [Object(_utils_date__WEBPACK_IMPORTED_MODULE_12__.toUTCDate)(new Date)]: {
                                rank: rank,
                                pp: pp,
                                countryRank: countryRank
                            }
                        });
                    }
                    let newScores = await Object(_network_scoresaber_scores__WEBPACK_IMPORTED_MODULE_10__.fetchAllNewScores)(u, Object(_utils_date__WEBPACK_IMPORTED_MODULE_12__.dateFromString)(cum.users[u.id] ? cum.users[u.id].lastUpdated : null), info => updateProgress(Object.assign({}, info, {
                        percent: Math.floor(idx / users.length * 100)
                    })));
                    if (newScores && newScores.scores) {
                        const prevScores = cum.users[u.id] ? cum.users[u.id].scores : {};
                        Object.keys(newScores.scores).map(leaderboardId => {
                            const prevScore = prevScores[leaderboardId] ? prevScores[leaderboardId] : null;
                            if (prevScore) {
                                newScores.scores[leaderboardId].history || (newScores.scores[leaderboardId].history = []);
                                const {pp: pp, rank: rank, score: score, uScore: uScore, timeset: timeset} = prevScore;
                                newScores.scores[leaderboardId].history.push({
                                    pp: pp,
                                    rank: rank,
                                    score: score,
                                    uScore: uScore,
                                    timestamp: Object(_utils_date__WEBPACK_IMPORTED_MODULE_12__.dateFromString)(timeset).getTime()
                                });
                            }
                        }), cum.users[u.id] = Object.assign({}, u, {
                            lastUpdated: (new Date).toISOString(),
                            recentPlay: newScores.lastUpdated,
                            scores: Object.assign({}, prevScores, newScores.scores)
                        });
                    }
                    return idx++, cum;
                }, data);
                cache.lastUpdated = (new Date).toISOString(), $$invalidate(4, date = cache.lastUpdated), 
                await Object(_store__WEBPACK_IMPORTED_MODULE_3__.setCache)(cache);
            }().then(_ => async function(progressCallback = null) {
                const data = await Object(_store__WEBPACK_IMPORTED_MODULE_3__.getCacheAndConvertIfNeeded)();
                if ($$invalidate(0, label = ""), $$invalidate(1, subLabel = ""), (new Date).getTime() - Object(_utils_date__WEBPACK_IMPORTED_MODULE_12__.dateFromString)(data.lastUpdated).getTime() > 6e4) return _utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.error("Please update song data first"), 
                null;
                $$invalidate(0, label = ""), $$invalidate(1, subLabel = "Pobieranie nowych rankedów");
                const newlyRanked = await Object(_network_scoresaber_rankeds__WEBPACK_IMPORTED_MODULE_9__.getNewlyRanked)();
                if (!newlyRanked) return null;
                if (newlyRanked.newRanked.length !== Object.keys(newlyRanked.allRanked).length) {
                    const leaderboardsToUpdate = newlyRanked.newRanked.map(s => s.leaderboardId).concat(newlyRanked.changed.map(s => s.leaderboardId)), users = data.users, usersToUpdate = Object.values(users).reduce((cum, u) => {
                        const userScoresToUpdate = Object.values(u.scores).map(s => ({
                            leaderboardId: s.leaderboardId,
                            timeset: Object(_utils_date__WEBPACK_IMPORTED_MODULE_12__.dateFromString)(s.timeset)
                        })).sort((a, b) => b.timeset.getTime() - a.timeset.getTime()).reduce((scum, s, idx) => {
                            if (leaderboardsToUpdate.includes(s.leaderboardId)) {
                                const page = Math.floor(idx / _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_4__.PLAYS_PER_PAGE) + 1;
                                scum[page] = (scum && scum[page] ? scum[page] : []).concat([ s.leaderboardId ]);
                            }
                            return scum;
                        }, {});
                        return Object(_utils_js__WEBPACK_IMPORTED_MODULE_6__.isEmpty)(userScoresToUpdate) || (cum[u.id] = userScoresToUpdate), 
                        cum;
                    }, {});
                    $$invalidate(0, label = ""), $$invalidate(1, subLabel = "Aktualizacja wyników nowych rankedów");
                    const totalPages = Object.values(usersToUpdate).reduce((sum, u) => sum + Object.keys(u).length, 0);
                    let idxGlobal = 0;
                    for (const userId in usersToUpdate) {
                        let idxLocal = 0;
                        for (const page in usersToUpdate[userId]) {
                            const progressInfo = {
                                id: userId,
                                name: users[userId].name,
                                page: idxLocal + 1,
                                percent: Math.floor(idxGlobal / totalPages * 100)
                            }, scores = Object(_utils_js__WEBPACK_IMPORTED_MODULE_6__.convertArrayToObjectByKey)(await Object(_network_scoresaber_scores__WEBPACK_IMPORTED_MODULE_10__.fetchScores)(userId, page, time => {
                                progressCallback && progressCallback(Object.assign({}, progressInfo, {
                                    wait: time
                                }));
                            }, ...usersToUpdate[userId][page]), "leaderboardId");
                            users[userId].scores = Object.assign({}, users[userId].scores, scores), progressCallback && progressCallback(progressInfo), 
                            idxLocal++, idxGlobal++;
                        }
                    }
                }
                return data.rankedSongs = newlyRanked.allRanked, data.rankedSongsLastUpdated = JSON.parse(JSON.stringify(new Date)), 
                await Object(_store__WEBPACK_IMPORTED_MODULE_3__.setCache)(data), newlyRanked;
            }(updateProgress)).then(newlyRanked => async function(newlyRanked) {
                dispatch("new-rankeds", []);
                const data = await Object(_store__WEBPACK_IMPORTED_MODULE_3__.getCacheAndConvertIfNeeded)();
                if (!newlyRanked) return;
                const sseUserId = Object(_temp__WEBPACK_IMPORTED_MODULE_5__.getMainUserId)();
                sseUserId && newlyRanked.newRanked.length !== Object.keys(newlyRanked.allRanked).length && dispatch("new-rankeds", newlyRanked.newRanked.concat(newlyRanked.changed).sort((a, b) => b.stars - a.stars).map(m => Object.assign({}, m, {
                    pp: data && data.users && data.users[sseUserId] && data.users[sseUserId].scores && data.users[sseUserId].scores[m.leaderboardId] ? data.users[sseUserId].scores[m.leaderboardId].pp : null
                })));
            }(newlyRanked)).then(_ => $$invalidate(3, started = !1)).then(_ => dispatch("data-refreshed", {})).catch(e => {
                $$invalidate(3, started = !1), _utils_logger__WEBPACK_IMPORTED_MODULE_7__.default.error("Can not refresh users", e);
            });
        } ];
    }
    class Refresh extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            super(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {});
        }
    }
    __webpack_exports__.default = Refresh;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _Label_svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(42);
    function create_else_block(ctx) {
        let div, current;
        const label_1 = new _Label_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: {
                label: ctx[2],
                subLabel: ctx[3],
                separator: ctx[4]
            }
        });
        return {
            c() {
                div = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(label_1.$$.fragment);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(label_1, div, null), 
                current = !0;
            },
            p(ctx, dirty) {
                const label_1_changes = {};
                4 & dirty && (label_1_changes.label = ctx[2]), 8 & dirty && (label_1_changes.subLabel = ctx[3]), 
                16 & dirty && (label_1_changes.separator = ctx[4]), label_1.$set(label_1_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(label_1.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(label_1.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(label_1);
            }
        };
    }
    function create_if_block(ctx) {
        let span, current;
        const label_1 = new _Label_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: {
                label: ctx[2],
                subLabel: ctx[3],
                separator: ctx[4]
            }
        });
        return {
            c() {
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(label_1.$$.fragment);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(label_1, span, null), 
                current = !0;
            },
            p(ctx, dirty) {
                const label_1_changes = {};
                4 & dirty && (label_1_changes.label = ctx[2]), 8 & dirty && (label_1_changes.subLabel = ctx[3]), 
                16 & dirty && (label_1_changes.separator = ctx[4]), label_1.$set(label_1_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(label_1.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(label_1.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(label_1);
            }
        };
    }
    function create_fragment(ctx) {
        let progress, t, current_block_type_index, if_block, if_block_anchor, current;
        const if_block_creators = [ create_if_block, create_else_block ], if_blocks = [];
        function select_block_type(ctx, dirty) {
            return ctx[5] ? 0 : 1;
        }
        return current_block_type_index = select_block_type(ctx), if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
        {
            c() {
                progress = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("progress"), 
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), if_block.c(), 
                if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), 
                progress.value = ctx[0], Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(progress, "max", ctx[1]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(progress, "max-width", ctx[6]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(progress, "class", "svelte-7agbo8");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, progress, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t, anchor), 
                if_blocks[current_block_type_index].m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0;
            },
            p(ctx, [dirty]) {
                (!current || 1 & dirty) && (progress.value = ctx[0]), (!current || 2 & dirty) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(progress, "max", ctx[1]), 
                (!current || 64 & dirty) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(progress, "max-width", ctx[6]);
                let previous_block_index = current_block_type_index;
                current_block_type_index = select_block_type(ctx), current_block_type_index === previous_block_index ? if_blocks[current_block_type_index].p(ctx, dirty) : (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_blocks[previous_block_index], 1, 1, () => {
                    if_blocks[previous_block_index] = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)(), if_block = if_blocks[current_block_type_index], 
                if_block || (if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
                if_block.c()), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor));
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(progress), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t), if_blocks[current_block_type_index].d(detaching), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {value: value = 0} = $$props, {max: max = 100} = $$props, {label: label = ""} = $$props, {subLabel: subLabel = ""} = $$props, {separator: separator = "/"} = $$props, {inline: inline = !1} = $$props, {maxWidth: maxWidth = "none"} = $$props;
        return $$self.$set = $$props => {
            "value" in $$props && $$invalidate(0, value = $$props.value), "max" in $$props && $$invalidate(1, max = $$props.max), 
            "label" in $$props && $$invalidate(2, label = $$props.label), "subLabel" in $$props && $$invalidate(3, subLabel = $$props.subLabel), 
            "separator" in $$props && $$invalidate(4, separator = $$props.separator), "inline" in $$props && $$invalidate(5, inline = $$props.inline), 
            "maxWidth" in $$props && $$invalidate(6, maxWidth = $$props.maxWidth);
        }, [ value, max, label, subLabel, separator, inline, maxWidth ];
    }
    class Progress extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-7agbo8-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-7agbo8-style", 
            style.textContent = "progress.svelte-7agbo8{width:20rem;max-width:97%}", Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                value: 0,
                max: 1,
                label: 2,
                subLabel: 3,
                separator: 4,
                inline: 5,
                maxWidth: 6
            });
        }
    }
    __webpack_exports__.default = Progress;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
    function create_if_block(ctx) {
        let t, if_block1_anchor, if_block0 = ctx[0].length && create_if_block_2(ctx), if_block1 = ctx[1].length && create_if_block_1(ctx);
        return {
            c() {
                if_block0 && if_block0.c(), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                if_block1 && if_block1.c(), if_block1_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_block0 && if_block0.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t, anchor), 
                if_block1 && if_block1.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block1_anchor, anchor);
            },
            p(ctx, dirty) {
                ctx[0].length ? if_block0 ? if_block0.p(ctx, dirty) : (if_block0 = create_if_block_2(ctx), 
                if_block0.c(), if_block0.m(t.parentNode, t)) : if_block0 && (if_block0.d(1), if_block0 = null), 
                ctx[1].length ? if_block1 ? if_block1.p(ctx, dirty) : (if_block1 = create_if_block_1(ctx), 
                if_block1.c(), if_block1.m(if_block1_anchor.parentNode, if_block1_anchor)) : if_block1 && (if_block1.d(1), 
                if_block1 = null);
            },
            d(detaching) {
                if_block0 && if_block0.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t), 
                if_block1 && if_block1.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block1_anchor);
            }
        };
    }
    function create_if_block_2(ctx) {
        let strong, t0, t1, if_block_anchor, if_block = ctx[2].length && ctx[1].length && create_if_block_3(ctx);
        return {
            c() {
                strong = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("strong"), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[0]), t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                if_block && if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, strong, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(strong, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor), 
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
            },
            p(ctx, dirty) {
                1 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t0, ctx[0]), 
                ctx[2].length && ctx[1].length ? if_block ? if_block.p(ctx, dirty) : (if_block = create_if_block_3(ctx), 
                if_block.c(), if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (if_block.d(1), 
                if_block = null);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(strong), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1), if_block && if_block.d(detaching), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function create_if_block_3(ctx) {
        let span, t0, t1, t2;
        return {
            c() {
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(" "), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[2]), t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(" ");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t2);
            },
            p(ctx, dirty) {
                4 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t1, ctx[2]);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span);
            }
        };
    }
    function create_if_block_1(ctx) {
        let span, t;
        return {
            c() {
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[1]);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t);
            },
            p(ctx, dirty) {
                2 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, ctx[1]);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span);
            }
        };
    }
    function create_fragment(ctx) {
        let label_1, if_block = (ctx[0].length || ctx[1].length) && create_if_block(ctx);
        return {
            c() {
                label_1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("label"), 
                if_block && if_block.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(label_1, "class", "svelte-guacfc");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, label_1, anchor), 
                if_block && if_block.m(label_1, null);
            },
            p(ctx, [dirty]) {
                ctx[0].length || ctx[1].length ? if_block ? if_block.p(ctx, dirty) : (if_block = create_if_block(ctx), 
                if_block.c(), if_block.m(label_1, null)) : if_block && (if_block.d(1), if_block = null);
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(label_1), 
                if_block && if_block.d();
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {label: label = ""} = $$props, {subLabel: subLabel = ""} = $$props, {separator: separator = "/"} = $$props;
        return $$self.$set = $$props => {
            "label" in $$props && $$invalidate(0, label = $$props.label), "subLabel" in $$props && $$invalidate(1, subLabel = $$props.subLabel), 
            "separator" in $$props && $$invalidate(2, separator = $$props.separator);
        }, [ label, subLabel, separator ];
    }
    class Label extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-guacfc-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-guacfc-style", 
            style.textContent = "label.svelte-guacfc{font-weight:normal}", Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                label: 0,
                subLabel: 1,
                separator: 2
            });
        }
    }
    __webpack_exports__.default = Label;
}, function(__webpack_module__, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var _internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
    __webpack_require__.d(__webpack_exports__, "SvelteComponent", (function() {
        return _internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponentDev;
    })), __webpack_require__.d(__webpack_exports__, "afterUpdate", (function() {
        return _internal__WEBPACK_IMPORTED_MODULE_0__.afterUpdate;
    })), __webpack_require__.d(__webpack_exports__, "beforeUpdate", (function() {
        return _internal__WEBPACK_IMPORTED_MODULE_0__.beforeUpdate;
    })), __webpack_require__.d(__webpack_exports__, "createEventDispatcher", (function() {
        return _internal__WEBPACK_IMPORTED_MODULE_0__.createEventDispatcher;
    })), __webpack_require__.d(__webpack_exports__, "getContext", (function() {
        return _internal__WEBPACK_IMPORTED_MODULE_0__.getContext;
    })), __webpack_require__.d(__webpack_exports__, "onDestroy", (function() {
        return _internal__WEBPACK_IMPORTED_MODULE_0__.onDestroy;
    })), __webpack_require__.d(__webpack_exports__, "onMount", (function() {
        return _internal__WEBPACK_IMPORTED_MODULE_0__.onMount;
    })), __webpack_require__.d(__webpack_exports__, "setContext", (function() {
        return _internal__WEBPACK_IMPORTED_MODULE_0__.setContext;
    })), __webpack_require__.d(__webpack_exports__, "tick", (function() {
        return _internal__WEBPACK_IMPORTED_MODULE_0__.tick;
    }));
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_require__.d(__webpack_exports__, "fetchScores", (function() {
        return fetchScores;
    })), __webpack_require__.d(__webpack_exports__, "fetchAllNewScores", (function() {
        return fetchAllNewScores;
    }));
    var _fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14), _utils_format__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4), _consts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(16), _utils_date__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6), _queue__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(17);
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
    var fetchScores = function() {
        var _ref = _asyncToGenerator((function*(userId) {
            for (var page = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1, rateLimitCallback = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null, _len = arguments.length, leaderboards = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) leaderboards[_key - 3] = arguments[_key];
            return Object(_fetch__WEBPACK_IMPORTED_MODULE_0__.fetchApiPage)(_queue__WEBPACK_IMPORTED_MODULE_4__.default.SCORESABER_API, Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.substituteVars)(_consts__WEBPACK_IMPORTED_MODULE_2__.SCORES_URL, {
                userId: userId
            }), page, rateLimitCallback).then(s => s && s.scores ? s.scores.filter(s => !leaderboards.length || leaderboards.includes(s.leaderboardId)).map(s => ({
                scoreId: s.scoreId,
                leaderboardId: s.leaderboardId,
                score: s.score,
                uScore: s.unmodififiedScore,
                mods: s.mods,
                playerId: userId,
                timeset: s.timeSet,
                pp: s.pp,
                weight: s.weight,
                id: s.songHash,
                name: s.songName,
                songSubName: s.songSubName,
                songAuthorName: s.songAuthorName,
                levelAuthorName: s.levelAuthorName,
                diff: s.difficultyRaw,
                difficulty: s.difficulty,
                maxScoreEx: s.maxScore,
                rank: s.rank
            })) : null);
        }));
        return function(_x) {
            return _ref.apply(this, arguments);
        };
    }();
    function fetchAllNewScores(_x2) {
        return _fetchAllNewScores.apply(this, arguments);
    }
    function _fetchAllNewScores() {
        return (_fetchAllNewScores = _asyncToGenerator((function*(user) {
            var lastUpdated = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null, progressCallback = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null, allScores = {
                lastUpdated: lastUpdated,
                scores: {}
            }, page = 0, recentPlay = null, _loop2 = function*() {
                var progressInfo = {
                    id: user.id,
                    name: user.name,
                    page: page,
                    total: null
                };
                progressCallback && progressCallback(progressInfo);
                var scorePage = yield fetchScores(user.id, page, time => {
                    progressCallback && progressCallback(Object.assign({}, progressInfo, {
                        wait: time
                    }));
                });
                if (!scorePage) return "break";
                for (var i in 1 === page && scorePage.length && (recentPlay = Object(_utils_date__WEBPACK_IMPORTED_MODULE_3__.dateFromString)(scorePage[0].timeset)), 
                scorePage) {
                    if (lastUpdated && Object(_utils_date__WEBPACK_IMPORTED_MODULE_3__.dateFromString)(scorePage[i].timeset) <= lastUpdated) return recentPlay && (allScores.lastUpdated = recentPlay), 
                    {
                        v: allScores
                    };
                    allScores.scores[scorePage[i].leaderboardId] = scorePage[i];
                }
                return recentPlay && (allScores.lastUpdated = recentPlay), scorePage.length < 8 ? "break" : void 0;
            };
            _loop: for (;++page; ) {
                var _ret = yield* _loop2();
                switch (_ret) {
                  case "break":
                    break _loop;

                  default:
                    if ("object" == typeof _ret) return _ret.v;
                }
            }
            return allScores.lastUpdated = recentPlay, allScores;
        }))).apply(this, arguments);
    }
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _Song_svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(46), _Mapper_svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(47), _Common_Pp_svelte__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(34), _Common_Difficulty_svelte__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(48), _Stars_svelte__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(49);
    function get_each_context(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[1] = list[i], child_ctx[3] = i, child_ctx;
    }
    function create_if_block(ctx) {
        let h3, t1, table, thead, t13, tbody, current, each_blocks = [], each_1_lookup = new Map, each_value = ctx[0];
        const get_key = ctx => ctx[1].leaderboardId;
        for (let i = 0; i < each_value.length; i += 1) {
            let child_ctx = get_each_context(ctx, each_value, i), key = get_key(child_ctx);
            each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
        }
        return {
            c() {
                h3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("h3"), h3.textContent = "Nowe/zmienione rankedy", 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), table = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("table"), 
                thead = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("thead"), thead.innerHTML = '<tr><th class="svelte-1ugmq97">Nuta</th> \n        <th class="svelte-1ugmq97">Mapper</th> \n        <th class="svelte-1ugmq97">Trudność</th> \n        <th class="svelte-1ugmq97">PP</th> \n        <th class="svelte-1ugmq97">*</th> \n        <th class="svelte-1ugmq97">Stare *</th></tr>', 
                t13 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), tbody = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tbody");
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(table, "class", "ranking sspl svelte-1ugmq97");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, h3, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, table, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table, thead), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table, t13), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table, tbody);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(tbody, null);
                current = !0;
            },
            p(ctx, dirty) {
                if (1 & dirty) {
                    const each_value = ctx[0];
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), each_blocks = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.outro_and_destroy_block, create_each_block, null, get_each_context), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
                }
            },
            i(local) {
                if (!current) {
                    for (let i = 0; i < each_value.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i]);
                    current = !0;
                }
            },
            o(local) {
                for (let i = 0; i < each_blocks.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i]);
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(h3), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(table);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
            }
        };
    }
    function create_each_block(key_1, ctx) {
        let tr, td0, t0, td1, t1, td2, t2, td3, t3, td4, t4, td5, t5, current;
        const song = new _Song_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: {
                song: ctx[1]
            }
        }), mapper = new _Mapper_svelte__WEBPACK_IMPORTED_MODULE_2__.default({
            props: {
                name: ctx[1].levelAuthor
            }
        }), difficulty = new _Common_Difficulty_svelte__WEBPACK_IMPORTED_MODULE_4__.default({
            props: {
                diff: ctx[1].diff
            }
        }), pp = new _Common_Pp_svelte__WEBPACK_IMPORTED_MODULE_3__.default({
            props: {
                pp: ctx[1].pp
            }
        }), stars0 = new _Stars_svelte__WEBPACK_IMPORTED_MODULE_5__.default({
            props: {
                stars: ctx[1].stars
            }
        }), stars1 = new _Stars_svelte__WEBPACK_IMPORTED_MODULE_5__.default({
            props: {
                stars: ctx[1].oldStars
            }
        });
        return {
            key: key_1,
            first: null,
            c() {
                tr = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tr"), td0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(song.$$.fragment), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(mapper.$$.fragment), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(difficulty.$$.fragment), 
                t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(pp.$$.fragment), 
                t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(stars0.$$.fragment), 
                t4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td5 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(stars1.$$.fragment), 
                t5 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td0, "class", "svelte-1ugmq97"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td1, "class", "svelte-1ugmq97"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td2, "class", "svelte-1ugmq97"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td3, "class", "svelte-1ugmq97"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td4, "class", "svelte-1ugmq97"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td5, "class", "svelte-1ugmq97"), 
                this.first = tr;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, tr, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(song, td0, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(mapper, td1, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td2), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(difficulty, td2, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t2), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td3), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(pp, td3, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t3), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td4), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(stars0, td4, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t4), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td5), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(stars1, td5, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t5), current = !0;
            },
            p(ctx, dirty) {
                const song_changes = {};
                1 & dirty && (song_changes.song = ctx[1]), song.$set(song_changes);
                const mapper_changes = {};
                1 & dirty && (mapper_changes.name = ctx[1].levelAuthor), mapper.$set(mapper_changes);
                const difficulty_changes = {};
                1 & dirty && (difficulty_changes.diff = ctx[1].diff), difficulty.$set(difficulty_changes);
                const pp_changes = {};
                1 & dirty && (pp_changes.pp = ctx[1].pp), pp.$set(pp_changes);
                const stars0_changes = {};
                1 & dirty && (stars0_changes.stars = ctx[1].stars), stars0.$set(stars0_changes);
                const stars1_changes = {};
                1 & dirty && (stars1_changes.stars = ctx[1].oldStars), stars1.$set(stars1_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(song.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(mapper.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(difficulty.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(pp.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(stars0.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(stars1.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(song.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(mapper.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(difficulty.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(pp.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(stars0.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(stars1.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(tr), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(song), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(mapper), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(difficulty), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(pp), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(stars0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(stars1);
            }
        };
    }
    function create_fragment(ctx) {
        let if_block_anchor, current, if_block = ctx[0] && ctx[0].length && create_if_block(ctx);
        return {
            c() {
                if_block && if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0;
            },
            p(ctx, [dirty]) {
                ctx[0] && ctx[0].length ? if_block ? (if_block.p(ctx, dirty), 1 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1)) : (if_block = create_if_block(ctx), 
                if_block.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block, 1, 1, () => {
                    if_block = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)());
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {rankeds: rankeds = []} = $$props;
        return $$self.$set = $$props => {
            "rankeds" in $$props && $$invalidate(0, rankeds = $$props.rankeds);
        }, [ rankeds ];
    }
    class NewRankeds extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-1ugmq97-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-1ugmq97-style", 
            style.textContent = "table.svelte-1ugmq97.svelte-1ugmq97{margin-bottom:2rem}table.svelte-1ugmq97 th.svelte-1ugmq97,table.svelte-1ugmq97 td.svelte-1ugmq97{text-align:center}table.svelte-1ugmq97 tbody tr td.svelte-1ugmq97:nth-child(1){text-align:left}", 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                rankeds: 0
            });
        }
    }
    __webpack_exports__.default = NewRankeds;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(16);
    const get_default_slot_changes = dirty => ({
        song: 1 & dirty
    }), get_default_slot_context = ctx => ({
        song: ctx[0]
    });
    function create_if_block(ctx) {
        let a, a_href_value, current;
        const default_slot_template = ctx[2].default, default_slot = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_slot)(default_slot_template, ctx, ctx[1], get_default_slot_context), default_slot_or_fallback = default_slot || function(ctx) {
            let t0, t1, t2, t0_value = ctx[0].songAuthor + "", t2_value = ctx[0].name + "";
            return {
                c() {
                    t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t0_value), t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(" - "), 
                    t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t2_value);
                },
                m(target, anchor) {
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t0, anchor), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t2, anchor);
                },
                p(ctx, dirty) {
                    1 & dirty && t0_value !== (t0_value = ctx[0].songAuthor + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t0, t0_value), 
                    1 & dirty && t2_value !== (t2_value = ctx[0].name + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t2, t2_value);
                },
                d(detaching) {
                    detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t0), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1), 
                    detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t2);
                }
            };
        }(ctx);
        return {
            c() {
                a = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("a"), default_slot_or_fallback && default_slot_or_fallback.c(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "href", a_href_value = _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_1__.SCORESABER_URL + "/leaderboard/" + encodeURIComponent(ctx[0].leaderboardId));
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, a, anchor), 
                default_slot_or_fallback && default_slot_or_fallback.m(a, null), current = !0;
            },
            p(ctx, dirty) {
                default_slot ? default_slot.p && 3 & dirty && default_slot.p(Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_slot_context)(default_slot_template, ctx, ctx[1], get_default_slot_context), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_slot_changes)(default_slot_template, ctx[1], dirty, get_default_slot_changes)) : default_slot_or_fallback && default_slot_or_fallback.p && 1 & dirty && default_slot_or_fallback.p(ctx, dirty), 
                (!current || 1 & dirty && a_href_value !== (a_href_value = _network_scoresaber_consts__WEBPACK_IMPORTED_MODULE_1__.SCORESABER_URL + "/leaderboard/" + encodeURIComponent(ctx[0].leaderboardId))) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "href", a_href_value);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(default_slot_or_fallback, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(default_slot_or_fallback, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(a), default_slot_or_fallback && default_slot_or_fallback.d(detaching);
            }
        };
    }
    function create_fragment(ctx) {
        let if_block_anchor, current, if_block = ctx[0] && create_if_block(ctx);
        return {
            c() {
                if_block && if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0;
            },
            p(ctx, [dirty]) {
                ctx[0] ? if_block ? (if_block.p(ctx, dirty), 1 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1)) : (if_block = create_if_block(ctx), 
                if_block.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block, 1, 1, () => {
                    if_block = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)());
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {song: song} = $$props, {$$slots: $$slots = {}, $$scope: $$scope} = $$props;
        return $$self.$set = $$props => {
            "song" in $$props && $$invalidate(0, song = $$props.song), "$$scope" in $$props && $$invalidate(1, $$scope = $$props.$$scope);
        }, [ song, $$scope, $$slots ];
    }
    class Song extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            super(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                song: 0
            });
        }
    }
    __webpack_exports__.default = Song;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
    function create_else_block(ctx) {
        let t;
        return {
            c() {
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("-");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t, anchor);
            },
            p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t);
            }
        };
    }
    function create_if_block(ctx) {
        let t;
        return {
            c() {
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[0]);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t, anchor);
            },
            p(ctx, dirty) {
                1 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, ctx[0]);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t);
            }
        };
    }
    function create_fragment(ctx) {
        let if_block_anchor;
        function select_block_type(ctx, dirty) {
            return ctx[0] ? create_if_block : create_else_block;
        }
        let current_block_type = select_block_type(ctx), if_block = current_block_type(ctx);
        return {
            c() {
                if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
            },
            p(ctx, [dirty]) {
                current_block_type === (current_block_type = select_block_type(ctx)) && if_block ? if_block.p(ctx, dirty) : (if_block.d(1), 
                if_block = current_block_type(ctx), if_block && (if_block.c(), if_block.m(if_block_anchor.parentNode, if_block_anchor)));
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {name: name} = $$props;
        return $$self.$set = $$props => {
            "name" in $$props && $$invalidate(0, name = $$props.name);
        }, [ name ];
    }
    class Mapper extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            super(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                name: 0
            });
        }
    }
    __webpack_exports__.default = Mapper;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _song__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(24);
    function create_if_block(ctx) {
        let span, t, span_class_value, span_title_value, t_value = (ctx[0] ? ctx[2].shortName : ctx[2].fullName) + "";
        return {
            c() {
                span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t_value), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "class", span_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("diff " + (ctx[1] ? "reversed" : "")) + " svelte-19swrtt"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(span, "color", ctx[1] ? "white" : ctx[2].color), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(span, "background-color", ctx[1] ? ctx[2].color : "transparent"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "title", span_title_value = ctx[0] && "Standard" !== ctx[2].type ? ctx[2].type : "");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, span, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t);
            },
            p(ctx, dirty) {
                5 & dirty && t_value !== (t_value = (ctx[0] ? ctx[2].shortName : ctx[2].fullName) + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, t_value), 
                2 & dirty && span_class_value !== (span_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("diff " + (ctx[1] ? "reversed" : "")) + " svelte-19swrtt") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "class", span_class_value), 
                6 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(span, "color", ctx[1] ? "white" : ctx[2].color), 
                6 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(span, "background-color", ctx[1] ? ctx[2].color : "transparent"), 
                5 & dirty && span_title_value !== (span_title_value = ctx[0] && "Standard" !== ctx[2].type ? ctx[2].type : "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "title", span_title_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(span);
            }
        };
    }
    function create_fragment(ctx) {
        let if_block_anchor, if_block = ctx[2] && create_if_block(ctx);
        return {
            c() {
                if_block && if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
            },
            p(ctx, [dirty]) {
                ctx[2] ? if_block ? if_block.p(ctx, dirty) : (if_block = create_if_block(ctx), if_block.c(), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (if_block.d(1), 
                if_block = null);
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let diffInfo, {diff: diff} = $$props, {useShortName: useShortName = !1} = $$props, {reverseColors: reverseColors = !1} = $$props;
        return $$self.$set = $$props => {
            "diff" in $$props && $$invalidate(3, diff = $$props.diff), "useShortName" in $$props && $$invalidate(0, useShortName = $$props.useShortName), 
            "reverseColors" in $$props && $$invalidate(1, reverseColors = $$props.reverseColors);
        }, $$self.$$.update = () => {
            8 & $$self.$$.dirty && $$invalidate(2, diffInfo = diff ? Object(_song__WEBPACK_IMPORTED_MODULE_1__.getHumanDiffInfo)(diff) : null);
        }, [ useShortName, reverseColors, diffInfo, diff ];
    }
    class Difficulty extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-19swrtt-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-19swrtt-style", 
            style.textContent = ".diff.svelte-19swrtt{display:inline-block}.reversed.svelte-19swrtt{font-weight:600;padding:0 2px;min-width:1.5rem}", 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                diff: 3,
                useShortName: 0,
                reverseColors: 1
            });
        }
    }
    __webpack_exports__.default = Difficulty;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _utils_format__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
    function create_fragment(ctx) {
        let t, t_value = Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.formatNumberWithSuffix)(ctx[0], "*") + "";
        return {
            c() {
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t_value);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t, anchor);
            },
            p(ctx, [dirty]) {
                1 & dirty && t_value !== (t_value = Object(_utils_format__WEBPACK_IMPORTED_MODULE_1__.formatNumberWithSuffix)(ctx[0], "*") + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, t_value);
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {stars: stars} = $$props;
        return $$self.$set = $$props => {
            "stars" in $$props && $$invalidate(0, stars = $$props.stars);
        }, [ stars ];
    }
    class Stars extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            super(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                stars: 0
            });
        }
    }
    __webpack_exports__.default = Stars;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _Song_WhatIfPp_svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(39), _Common_Pp_svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34), _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(30);
    function create_if_block(ctx) {
        let t0, t1, t2, current;
        const pp = new _Common_Pp_svelte__WEBPACK_IMPORTED_MODULE_2__.default({
            props: {
                pp: ctx[0].pp,
                prevPp: ctx[0].prevPp,
                zero: "0,00",
                withZeroSuffix: !0,
                weighted: ctx[0].ppWeighted,
                inline: !0
            }
        });
        let if_block0 = ctx[0].percent && create_if_block_2(ctx), if_block1 = ctx[0].score && create_if_block_1(ctx);
        const whatifpp = new _Song_WhatIfPp_svelte__WEBPACK_IMPORTED_MODULE_1__.default({
            props: {
                leaderboardId: ctx[0].leaderboardId,
                pp: ctx[0].pp
            }
        });
        return {
            c() {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(pp.$$.fragment), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), if_block0 && if_block0.c(), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), if_block1 && if_block1.c(), 
                t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(whatifpp.$$.fragment);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(pp, target, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t0, anchor), 
                if_block0 && if_block0.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor), 
                if_block1 && if_block1.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t2, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(whatifpp, target, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                const pp_changes = {};
                1 & dirty && (pp_changes.pp = ctx[0].pp), 1 & dirty && (pp_changes.prevPp = ctx[0].prevPp), 
                1 & dirty && (pp_changes.weighted = ctx[0].ppWeighted), pp.$set(pp_changes), ctx[0].percent ? if_block0 ? (if_block0.p(ctx, dirty), 
                1 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0, 1)) : (if_block0 = create_if_block_2(ctx), 
                if_block0.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0, 1), 
                if_block0.m(t1.parentNode, t1)) : if_block0 && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block0, 1, 1, () => {
                    if_block0 = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)()), ctx[0].score ? if_block1 ? (if_block1.p(ctx, dirty), 
                1 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1, 1)) : (if_block1 = create_if_block_1(ctx), 
                if_block1.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1, 1), 
                if_block1.m(t2.parentNode, t2)) : if_block1 && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block1, 1, 1, () => {
                    if_block1 = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)());
                const whatifpp_changes = {};
                1 & dirty && (whatifpp_changes.leaderboardId = ctx[0].leaderboardId), 1 & dirty && (whatifpp_changes.pp = ctx[0].pp), 
                whatifpp.$set(whatifpp_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(pp.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(whatifpp.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(pp.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(whatifpp.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(pp, detaching), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t0), if_block0 && if_block0.d(detaching), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1), if_block1 && if_block1.d(detaching), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t2), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(whatifpp, detaching);
            }
        };
    }
    function create_if_block_2(ctx) {
        let div, span, t, current;
        const value = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_3__.default({
            props: {
                value: 100 * ctx[0].percent,
                zero: "0,00",
                withZeroSuffix: !0,
                prevValue: 100 * ctx[0].prevPercent,
                inline: !0,
                suffix: "%" + (ctx[0].mods && ctx[0].mods.length ? " (" + ctx[0].mods + ")" : "")
            }
        });
        return {
            c() {
                div = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), 
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("Accuracy: "), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "class", "scoreBottom");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, span), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, span, null), 
                current = !0;
            },
            p(ctx, dirty) {
                const value_changes = {};
                1 & dirty && (value_changes.value = 100 * ctx[0].percent), 1 & dirty && (value_changes.prevValue = 100 * ctx[0].prevPercent), 
                1 & dirty && (value_changes.suffix = "%" + (ctx[0].mods && ctx[0].mods.length ? " (" + ctx[0].mods + ")" : "")), 
                value.$set(value_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value);
            }
        };
    }
    function create_if_block_1(ctx) {
        let div, span, t, current;
        const value = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_3__.default({
            props: {
                value: ctx[0].score,
                zero: "0,00",
                prevValue: ctx[0].prevScore,
                inline: !0,
                digits: 0
            }
        });
        return {
            c() {
                div = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), 
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("Score: "), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "class", "scoreBottom");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, span), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, span, null), 
                current = !0;
            },
            p(ctx, dirty) {
                const value_changes = {};
                1 & dirty && (value_changes.value = ctx[0].score), 1 & dirty && (value_changes.prevValue = ctx[0].prevScore), 
                value.$set(value_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value);
            }
        };
    }
    function create_fragment(ctx) {
        let if_block_anchor, current, if_block = ctx[0] && create_if_block(ctx);
        return {
            c() {
                if_block && if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0;
            },
            p(ctx, [dirty]) {
                ctx[0] ? if_block ? (if_block.p(ctx, dirty), 1 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1)) : (if_block = create_if_block(ctx), 
                if_block.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block, 1, 1, () => {
                    if_block = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)());
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {song: song = null} = $$props;
        return $$self.$set = $$props => {
            "song" in $$props && $$invalidate(0, song = $$props.song);
        }, [ song ];
    }
    class Score extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            super(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                song: 0
            });
        }
    }
    __webpack_exports__.default = Score;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), _utils_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10), _scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8), _scoresaber_rankeds__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(29), _network_fetch__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(14), _temp__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(5), _store__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(9), _utils_date__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(6), _utils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(15), _utils_debounce__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(52), _Common_Difficulty_svelte__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(48), _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(30), _scoresaber_players__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(27), _utils_memoize__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(53), _Song_svelte__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(46), _Common_Pager_svelte__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(54), _Common_Range_svelte__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(55), _song__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(24), _Common_Date_svelte__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(38), _Common_MultiRange_svelte__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(56), svelte__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(43), _utils_format__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(4), _WhatIfPp_svelte__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(39);
    const {document: document_1} = svelte_internal__WEBPACK_IMPORTED_MODULE_0__.globals;
    function get_each_context(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[70] = list[i], child_ctx[72] = i, child_ctx;
    }
    function get_each_context_4(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[78] = list[i], child_ctx[72] = i, child_ctx;
    }
    function get_each_context_3(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[78] = list[i], child_ctx[72] = i, child_ctx;
    }
    function get_each_context_2(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[70] = list[i], child_ctx;
    }
    function get_each_context_1(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[73] = list[i], child_ctx;
    }
    function get_each_context_6(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[78] = list[i], child_ctx[72] = i, child_ctx;
    }
    function get_each_context_5(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[70] = list[i], child_ctx;
    }
    function get_each_context_7(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[70] = list[i], child_ctx;
    }
    function get_each_context_8(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[86] = list[i], child_ctx;
    }
    function get_each_context_9(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[89] = list[i], child_ctx;
    }
    function get_each_context_10(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[78] = list[i], child_ctx[92] = list, child_ctx[93] = i, child_ctx;
    }
    function get_each_context_11(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[94] = list[i], child_ctx;
    }
    function get_each_context_12(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[89] = list[i], child_ctx;
    }
    function create_each_block_12(ctx) {
        let option, t, option_value_value, t_value = ctx[89].text + "";
        return {
            c() {
                option = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("option"), 
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t_value), option.__value = option_value_value = ctx[89], 
                option.value = option.__value;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, option, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(option, t);
            },
            p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(option);
            }
        };
    }
    function create_each_block_11(ctx) {
        let option, t, option_value_value, t_value = ctx[94].text + "";
        return {
            c() {
                option = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("option"), 
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t_value), option.__value = option_value_value = ctx[94], 
                option.value = option.__value;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, option, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(option, t);
            },
            p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(option);
            }
        };
    }
    function create_each_block_10(key_1, ctx) {
        let label, input, t0, t1, t2, label_title_value, dispose, t1_value = ctx[78].name + "";
        function input_change_handler() {
            ctx[64].call(input, ctx[78]);
        }
        return {
            key: key_1,
            first: null,
            c() {
                label = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("label"), input = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("input"), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t1_value), 
                t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "type", "checkbox"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "class", "svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(label, "title", label_title_value = ctx[78].label ? ctx[78].label : ""), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(label, "class", "svelte-1bvl7gs"), 
                this.first = label;
            },
            m(target, anchor, remount) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, label, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(label, input), input.checked = ctx[78].selected, 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(label, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(label, t1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(label, t2), remount && dispose(), 
                dispose = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(input, "change", input_change_handler);
            },
            p(new_ctx, dirty) {
                ctx = new_ctx, 8192 & dirty[0] && (input.checked = ctx[78].selected), 8192 & dirty[0] && t1_value !== (t1_value = ctx[78].name + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t1, t1_value), 
                8192 & dirty[0] && label_title_value !== (label_title_value = ctx[78].label ? ctx[78].label : "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(label, "title", label_title_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(label), 
                dispose();
            }
        };
    }
    function create_each_block_9(ctx) {
        let option, t, option_value_value, option_disabled_value, t_value = ctx[89].name + "";
        return {
            c() {
                option = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("option"), 
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t_value), option.__value = option_value_value = ctx[89], 
                option.value = option.__value, option.disabled = option_disabled_value = !ctx[89].enabled;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, option, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(option, t);
            },
            p(ctx, dirty) {
                16 & dirty[0] && t_value !== (t_value = ctx[89].name + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, t_value), 
                16 & dirty[0] && option_value_value !== (option_value_value = ctx[89]) && (option.__value = option_value_value), 
                option.value = option.__value, 16 & dirty[0] && option_disabled_value !== (option_disabled_value = !ctx[89].enabled) && (option.disabled = option_disabled_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(option);
            }
        };
    }
    function create_each_block_8(ctx) {
        let option, t, option_value_value, t_value = ctx[86] + "";
        return {
            c() {
                option = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("option"), 
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t_value), option.__value = option_value_value = ctx[86], 
                option.value = option.__value;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, option, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(option, t);
            },
            p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(option);
            }
        };
    }
    function create_catch_block(ctx) {
        return {
            c: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            m: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop
        };
    }
    function create_then_block(ctx) {
        let current_block_type_index, if_block, if_block_anchor, current;
        const if_block_creators = [ create_if_block, create_else_block_5 ], if_blocks = [];
        function select_block_type(ctx, dirty) {
            return ctx[12].songs.length ? 0 : 1;
        }
        return current_block_type_index = select_block_type(ctx), if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
        {
            c() {
                if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_blocks[current_block_type_index].m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                let previous_block_index = current_block_type_index;
                current_block_type_index = select_block_type(ctx), current_block_type_index === previous_block_index ? if_blocks[current_block_type_index].p(ctx, dirty) : (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_blocks[previous_block_index], 1, 1, () => {
                    if_blocks[previous_block_index] = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)(), if_block = if_blocks[current_block_type_index], 
                if_block || (if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
                if_block.c()), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor));
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                if_blocks[current_block_type_index].d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function create_else_block_5(ctx) {
        let div;
        return {
            c() {
                div = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), div.innerHTML = "<h3>Strasznie tu pusto</h3> \n            <p>Wygląda na to, że żadna nutka nie spełnia wszystkich wybranych wymagań. Zmień coś może?</p>", 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div, "class", "info svelte-1bvl7gs");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor);
            },
            p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div);
            }
        };
    }
    function create_if_block(ctx) {
        let table, t0, tbody, t1, current, each_blocks = [], each_1_lookup = new Map, if_block0 = ("compact" !== ctx[11].id || ctx[12].series.length > 1) && create_if_block_16(ctx), each_value_1 = ctx[12].songs;
        const get_key = ctx => ctx[73].leaderboardId;
        for (let i = 0; i < each_value_1.length; i += 1) {
            let child_ctx = get_each_context_1(ctx, each_value_1, i), key = get_key(child_ctx);
            each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
        }
        let if_block1 = ctx[15] && create_if_block_1(ctx);
        return {
            c() {
                table = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("table"), if_block0 && if_block0.c(), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), tbody = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tbody");
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), if_block1 && if_block1.c(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(tbody, "class", "svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(table, "class", "ranking sspl svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.toggle_class)(table, "light", ctx[1]);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, table, anchor), 
                if_block0 && if_block0.m(table, null), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table, t0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table, tbody);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(tbody, null);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(table, t1), if_block1 && if_block1.m(table, null), 
                current = !0;
            },
            p(ctx, dirty) {
                if ("compact" !== ctx[11].id || ctx[12].series.length > 1 ? if_block0 ? if_block0.p(ctx, dirty) : (if_block0 = create_if_block_16(ctx), 
                if_block0.c(), if_block0.m(table, t0)) : if_block0 && (if_block0.d(1), if_block0 = null), 
                3169313 & dirty[0]) {
                    const each_value_1 = ctx[12].songs;
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), each_blocks = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, tbody, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.outro_and_destroy_block, create_each_block_1, null, get_each_context_1), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
                }
                ctx[15] ? if_block1 ? (if_block1.p(ctx, dirty), 32768 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1, 1)) : (if_block1 = create_if_block_1(ctx), 
                if_block1.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1, 1), 
                if_block1.m(table, null)) : if_block1 && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block1, 1, 1, () => {
                    if_block1 = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)()), 2 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.toggle_class)(table, "light", ctx[1]);
            },
            i(local) {
                if (!current) {
                    for (let i = 0; i < each_value_1.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i]);
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1), current = !0;
                }
            },
            o(local) {
                for (let i = 0; i < each_blocks.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i]);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block1), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(table), 
                if_block0 && if_block0.d();
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
                if_block1 && if_block1.d();
            }
        };
    }
    function create_if_block_16(ctx) {
        let thead, tr, th, t0, th_rowspan_value, t1, t2, t3, t4, show_if_1 = "unrankeds" !== ctx[5].songType.id && ctx[20](ctx[10], "stars").selected, show_if = "unrankeds" !== ctx[5].songType.id && ctx[20](ctx[10], "maxPp").selected, each_blocks = [], each_1_lookup = new Map, if_block0 = show_if_1 && create_if_block_22(ctx), if_block1 = show_if && create_if_block_21(ctx), each_value_7 = ctx[12].series;
        const get_key = ctx => ctx[70].id + "_" + ctx[70].estimateId;
        for (let i = 0; i < each_value_7.length; i += 1) {
            let child_ctx = get_each_context_7(ctx, each_value_7, i), key = get_key(child_ctx);
            each_1_lookup.set(key, each_blocks[i] = create_each_block_7(key, child_ctx));
        }
        let if_block2 = "compact" !== ctx[11].id && create_if_block_17(ctx);
        return {
            c() {
                thead = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("thead"), tr = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tr"), 
                th = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("th"), t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("Nuta"), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), if_block0 && if_block0.c(), 
                t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), if_block1 && if_block1.c(), 
                t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
                t4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), if_block2 && if_block2.c(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "class", "song svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "rowspan", th_rowspan_value = "compact" === ctx[11].id ? 1 : 2), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "colspan", "2"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(thead, "class", "svelte-1bvl7gs");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, thead, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(thead, tr), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, th), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(th, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t1), 
                if_block0 && if_block0.m(tr, null), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t2), 
                if_block1 && if_block1.m(tr, null), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t3);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(tr, null);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(thead, t4), if_block2 && if_block2.m(thead, null);
            },
            p(ctx, dirty) {
                if (2048 & dirty[0] && th_rowspan_value !== (th_rowspan_value = "compact" === ctx[11].id ? 1 : 2) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "rowspan", th_rowspan_value), 
                1056 & dirty[0] && (show_if_1 = "unrankeds" !== ctx[5].songType.id && ctx[20](ctx[10], "stars").selected), 
                show_if_1 ? if_block0 ? if_block0.p(ctx, dirty) : (if_block0 = create_if_block_22(ctx), 
                if_block0.c(), if_block0.m(tr, t2)) : if_block0 && (if_block0.d(1), if_block0 = null), 
                1056 & dirty[0] && (show_if = "unrankeds" !== ctx[5].songType.id && ctx[20](ctx[10], "maxPp").selected), 
                show_if ? if_block1 ? if_block1.p(ctx, dirty) : (if_block1 = create_if_block_21(ctx), 
                if_block1.c(), if_block1.m(tr, t3)) : if_block1 && (if_block1.d(1), if_block1 = null), 
                1072129 & dirty[0]) {
                    const each_value_7 = ctx[12].series;
                    each_blocks = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks, dirty, get_key, 1, ctx, each_value_7, each_1_lookup, tr, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_block, create_each_block_7, null, get_each_context_7);
                }
                "compact" !== ctx[11].id ? if_block2 ? if_block2.p(ctx, dirty) : (if_block2 = create_if_block_17(ctx), 
                if_block2.c(), if_block2.m(thead, null)) : if_block2 && (if_block2.d(1), if_block2 = null);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(thead), 
                if_block0 && if_block0.d(), if_block1 && if_block1.d();
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
                if_block2 && if_block2.d();
            }
        };
    }
    function create_if_block_22(ctx) {
        let th, t, th_rowspan_value;
        return {
            c() {
                th = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("th"), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("*"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "class", "stars left middle svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "rowspan", th_rowspan_value = "compact" === ctx[11].id ? 1 : 2);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, th, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(th, t);
            },
            p(ctx, dirty) {
                2048 & dirty[0] && th_rowspan_value !== (th_rowspan_value = "compact" === ctx[11].id ? 1 : 2) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "rowspan", th_rowspan_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(th);
            }
        };
    }
    function create_if_block_21(ctx) {
        let th, t, th_rowspan_value;
        return {
            c() {
                th = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("th"), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("Max PP"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "class", "maxPp left middle svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "rowspan", th_rowspan_value = "compact" === ctx[11].id ? 1 : 2);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, th, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(th, t);
            },
            p(ctx, dirty) {
                2048 & dirty[0] && th_rowspan_value !== (th_rowspan_value = "compact" === ctx[11].id ? 1 : 2) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "rowspan", th_rowspan_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(th);
            }
        };
    }
    function create_if_block_20(ctx) {
        let th, t, th_colspan_value, t_value = ctx[70].name + "";
        return {
            c() {
                th = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("th"), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t_value), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "colspan", th_colspan_value = ctx[70].id !== ctx[0] ? ctx[14].length : ctx[14].length - (ctx[20](ctx[10], "diffPp").selected ? 1 : 0)), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "class", "series left svelte-1bvl7gs");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, th, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(th, t);
            },
            p(ctx, dirty) {
                4096 & dirty[0] && t_value !== (t_value = ctx[70].name + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, t_value), 
                21505 & dirty[0] && th_colspan_value !== (th_colspan_value = ctx[70].id !== ctx[0] ? ctx[14].length : ctx[14].length - (ctx[20](ctx[10], "diffPp").selected ? 1 : 0)) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "colspan", th_colspan_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(th);
            }
        };
    }
    function create_if_block_19(ctx) {
        let th, t, t_value = ctx[70].name + "";
        return {
            c() {
                th = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("th"), t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t_value), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "class", "left down svelte-1bvl7gs");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, th, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(th, t);
            },
            p(ctx, dirty) {
                4096 & dirty[0] && t_value !== (t_value = ctx[70].name + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, t_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(th);
            }
        };
    }
    function create_each_block_7(key_1, ctx) {
        let first, show_if, if_block_anchor;
        function select_block_type_1(ctx, dirty) {
            return "compact" === ctx[11].id ? create_if_block_19 : ((null == show_if || 21505 & dirty[0]) && (show_if = !(!(ctx[14].length > 0) || 1 === ctx[14].length && ctx[70].id === ctx[0] && ctx[20](ctx[10], "diffPp").selected)), 
            show_if ? create_if_block_20 : void 0);
        }
        let current_block_type = select_block_type_1(ctx, [ -1 ]), if_block = current_block_type && current_block_type(ctx);
        return {
            key: key_1,
            first: null,
            c() {
                first = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), if_block && if_block.c(), 
                if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), 
                this.first = first;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, first, anchor), 
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
            },
            p(ctx, dirty) {
                current_block_type === (current_block_type = select_block_type_1(ctx, dirty)) && if_block ? if_block.p(ctx, dirty) : (if_block && if_block.d(1), 
                if_block = current_block_type && current_block_type(ctx), if_block && (if_block.c(), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)));
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(first), 
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function create_if_block_17(ctx) {
        let tr, each_blocks = [], each_1_lookup = new Map, each_value_5 = ctx[12].series;
        const get_key = ctx => ctx[70].id + "_" + ctx[70].estimateId;
        for (let i = 0; i < each_value_5.length; i += 1) {
            let child_ctx = get_each_context_5(ctx, each_value_5, i), key = get_key(child_ctx);
            each_1_lookup.set(key, each_blocks[i] = create_each_block_5(key, child_ctx));
        }
        return {
            c() {
                tr = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tr");
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, tr, anchor);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(tr, null);
            },
            p(ctx, dirty) {
                if (20481 & dirty[0]) {
                    const each_value_5 = ctx[12].series;
                    each_blocks = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks, dirty, get_key, 1, ctx, each_value_5, each_1_lookup, tr, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_block, create_each_block_5, null, get_each_context_5);
                }
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(tr);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
            }
        };
    }
    function create_if_block_18(ctx) {
        let th, t0, th_class_value, t1, t0_value = ctx[78].name + "";
        return {
            c() {
                th = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("th"), t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t0_value), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "class", th_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("left " + ctx[78].key + (ctx[72] > 0 ? " middle" : "")) + " svelte-1bvl7gs");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, th, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(th, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor);
            },
            p(ctx, dirty) {
                16384 & dirty[0] && t0_value !== (t0_value = ctx[78].name + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t0, t0_value), 
                16384 & dirty[0] && th_class_value !== (th_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("left " + ctx[78].key + (ctx[72] > 0 ? " middle" : "")) + " svelte-1bvl7gs") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "class", th_class_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(th), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1);
            }
        };
    }
    function create_each_block_6(key_1, ctx) {
        let first, if_block_anchor, if_block = ("diffPp" !== ctx[78].key || ctx[70].id !== ctx[0]) && create_if_block_18(ctx);
        return {
            key: key_1,
            first: null,
            c() {
                first = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), if_block && if_block.c(), 
                if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), 
                this.first = first;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, first, anchor), 
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
            },
            p(ctx, dirty) {
                "diffPp" !== ctx[78].key || ctx[70].id !== ctx[0] ? if_block ? if_block.p(ctx, dirty) : (if_block = create_if_block_18(ctx), 
                if_block.c(), if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (if_block.d(1), 
                if_block = null);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(first), 
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function create_each_block_5(key_1, ctx) {
        let first, each_1_anchor, each_blocks = [], each_1_lookup = new Map, each_value_6 = ctx[14];
        const get_key = ctx => ctx[78].key;
        for (let i = 0; i < each_value_6.length; i += 1) {
            let child_ctx = get_each_context_6(ctx, each_value_6, i), key = get_key(child_ctx);
            each_1_lookup.set(key, each_blocks[i] = create_each_block_6(key, child_ctx));
        }
        return {
            key: key_1,
            first: null,
            c() {
                first = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
                each_1_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), this.first = first;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, first, anchor);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(target, anchor);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, each_1_anchor, anchor);
            },
            p(ctx, dirty) {
                if (20481 & dirty[0]) {
                    const each_value_6 = ctx[14];
                    each_blocks = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks, dirty, get_key, 1, ctx, each_value_6, each_1_lookup, each_1_anchor.parentNode, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_block, create_each_block_6, each_1_anchor, get_each_context_6);
                }
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(first);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d(detaching);
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(each_1_anchor);
            }
        };
    }
    function create_default_slot(ctx) {
        let figure, img, img_src_value, t0, div1, span, t1, t2, div0, t3, t4, small, t5, t1_value = ctx[73].name + "", t3_value = ctx[73].songAuthor + "", t5_value = ctx[73].levelAuthor + "";
        return {
            c() {
                figure = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("figure"), 
                img = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("img"), t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                div1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t1_value), t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                div0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t3_value), 
                t4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), small = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("small"), 
                t5 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t5_value), img.src !== (img_src_value = "/imports/images/songs/" + ctx[73].id + ".png") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(img, "src", img_src_value), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(img, "class", "svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(span, "class", "name"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(small, "class", "svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div0, "class", "author"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div1, "class", "songinfo svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(figure, "class", "svelte-1bvl7gs");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, figure, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(figure, img), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(figure, t0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(figure, div1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, span), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, t2), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, div0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div0, t3), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div0, t4), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div0, small), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(small, t5);
            },
            p(ctx, dirty) {
                4096 & dirty[0] && img.src !== (img_src_value = "/imports/images/songs/" + ctx[73].id + ".png") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(img, "src", img_src_value), 
                4096 & dirty[0] && t1_value !== (t1_value = ctx[73].name + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t1, t1_value), 
                4096 & dirty[0] && t3_value !== (t3_value = ctx[73].songAuthor + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t3, t3_value), 
                4096 & dirty[0] && t5_value !== (t5_value = ctx[73].levelAuthor + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t5, t5_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(figure);
            }
        };
    }
    function create_if_block_15(ctx) {
        let td, current;
        const value = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_11__.default({
            props: {
                value: ctx[73].stars,
                suffix: "*",
                zero: ""
            }
        });
        return {
            c() {
                td = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td, "class", "stars left middle svelte-1bvl7gs");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, td, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, td, null), 
                current = !0;
            },
            p(ctx, dirty) {
                const value_changes = {};
                4096 & dirty[0] && (value_changes.value = ctx[73].stars), value.$set(value_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(td), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value);
            }
        };
    }
    function create_if_block_14(ctx) {
        let td, current;
        const value = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_11__.default({
            props: {
                value: ctx[73].stars * _scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.PP_PER_STAR * Object(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.ppFromScore)(100),
                suffix: "pp",
                zero: "-"
            }
        });
        return {
            c() {
                td = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td, "class", "maxPp left middle svelte-1bvl7gs");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, td, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, td, null), 
                current = !0;
            },
            p(ctx, dirty) {
                const value_changes = {};
                4096 & dirty[0] && (value_changes.value = ctx[73].stars * _scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.PP_PER_STAR * Object(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.ppFromScore)(100)), 
                value.$set(value_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(td), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value);
            }
        };
    }
    function create_else_block_3(ctx) {
        let each_1_anchor, current, each_blocks = [], each_1_lookup = new Map, each_value_4 = ctx[14];
        const get_key = ctx => ctx[78].key;
        for (let i = 0; i < each_value_4.length; i += 1) {
            let child_ctx = get_each_context_4(ctx, each_value_4, i), key = get_key(child_ctx);
            each_1_lookup.set(key, each_blocks[i] = create_each_block_4(key, child_ctx));
        }
        return {
            c() {
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
                each_1_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(target, anchor);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, each_1_anchor, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                if (3167265 & dirty[0]) {
                    const each_value_4 = ctx[14];
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), each_blocks = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks, dirty, get_key, 1, ctx, each_value_4, each_1_lookup, each_1_anchor.parentNode, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.outro_and_destroy_block, create_each_block_4, each_1_anchor, get_each_context_4), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
                }
            },
            i(local) {
                if (!current) {
                    for (let i = 0; i < each_value_4.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i]);
                    current = !0;
                }
            },
            o(local) {
                for (let i = 0; i < each_blocks.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i]);
                current = !1;
            },
            d(detaching) {
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d(detaching);
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(each_1_anchor);
            }
        };
    }
    function create_if_block_5(ctx) {
        let td, show_if, current_block_type_index, if_block, td_class_value, current;
        const if_block_creators = [ create_if_block_6, create_else_block_2 ], if_blocks = [];
        function select_block_type_3(ctx, dirty) {
            return 4096 & dirty[0] && (show_if = !!ctx[21](ctx[70], ctx[73], "score")), show_if ? 0 : 1;
        }
        return current_block_type_index = select_block_type_3(ctx, [ -1 ]), if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
        {
            c() {
                td = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), if_block.c(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td, "class", td_class_value = "left compact series-" + ctx[12].series.length + " svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.toggle_class)(td, "with-cols", ctx[20](ctx[10], "stars").selected || ctx[20](ctx[10], "maxPp").selected), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.toggle_class)(td, "best", ctx[21](ctx[70], ctx[73], "best") && ctx[12].series.length > 1);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, td, anchor), 
                if_blocks[current_block_type_index].m(td, null), current = !0;
            },
            p(ctx, dirty) {
                let previous_block_index = current_block_type_index;
                current_block_type_index = select_block_type_3(ctx, dirty), current_block_type_index === previous_block_index ? if_blocks[current_block_type_index].p(ctx, dirty) : (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_blocks[previous_block_index], 1, 1, () => {
                    if_blocks[previous_block_index] = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)(), if_block = if_blocks[current_block_type_index], 
                if_block || (if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
                if_block.c()), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(td, null)), (!current || 4096 & dirty[0] && td_class_value !== (td_class_value = "left compact series-" + ctx[12].series.length + " svelte-1bvl7gs")) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td, "class", td_class_value), 
                1053696 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.toggle_class)(td, "with-cols", ctx[20](ctx[10], "stars").selected || ctx[20](ctx[10], "maxPp").selected), 
                2101248 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.toggle_class)(td, "best", ctx[21](ctx[70], ctx[73], "best") && ctx[12].series.length > 1);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(td), if_blocks[current_block_type_index].d();
            }
        };
    }
    function create_if_block_12(ctx) {
        let td, current_block_type_index, if_block, td_class_value, current;
        const if_block_creators = [ create_if_block_13, create_else_block_4 ], if_blocks = [];
        function select_block_type_5(ctx, dirty) {
            return "timeset" === ctx[78].key ? 0 : 1;
        }
        return current_block_type_index = select_block_type_5(ctx), if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
        {
            c() {
                td = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), if_block.c(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td, "class", td_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("left " + ctx[78].key) + " svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.toggle_class)(td, "middle", ctx[72] > 0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.toggle_class)(td, "best", ctx[21](ctx[70], ctx[73], "best") && ctx[12].series.length > 1);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, td, anchor), 
                if_blocks[current_block_type_index].m(td, null), current = !0;
            },
            p(ctx, dirty) {
                let previous_block_index = current_block_type_index;
                current_block_type_index = select_block_type_5(ctx), current_block_type_index === previous_block_index ? if_blocks[current_block_type_index].p(ctx, dirty) : (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_blocks[previous_block_index], 1, 1, () => {
                    if_blocks[previous_block_index] = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)(), if_block = if_blocks[current_block_type_index], 
                if_block || (if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
                if_block.c()), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(td, null)), (!current || 16384 & dirty[0] && td_class_value !== (td_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("left " + ctx[78].key) + " svelte-1bvl7gs")) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td, "class", td_class_value), 
                16384 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.toggle_class)(td, "middle", ctx[72] > 0), 
                2117632 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.toggle_class)(td, "best", ctx[21](ctx[70], ctx[73], "best") && ctx[12].series.length > 1);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(td), if_blocks[current_block_type_index].d();
            }
        };
    }
    function create_else_block_4(ctx) {
        let current;
        const value_spread_levels = [ {
            value: ctx[21](ctx[70], ctx[73], ctx[78].key)
        }, {
            prevValue: !ctx[20](ctx[10], "diff").selected || "rankeds_with_not_played" === ctx[5].songType.id && ctx[70].id === ctx[0] ? null : ctx[21](ctx[70], ctx[73], "prev" + Object(_utils_js__WEBPACK_IMPORTED_MODULE_8__.capitalize)(ctx[78].key))
        }, {
            prevLabel: ctx[70].prevLabel
        }, ctx[78].valueProps ];
        let value_props = {};
        for (let i = 0; i < value_spread_levels.length; i += 1) value_props = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)(value_props, value_spread_levels[i]);
        const value = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_11__.default({
            props: value_props
        });
        return {
            c() {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, target, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                const value_changes = 3167265 & dirty[0] ? Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_update)(value_spread_levels, [ 2117632 & dirty[0] && {
                    value: ctx[21](ctx[70], ctx[73], ctx[78].key)
                }, {
                    prevValue: !ctx[20](ctx[10], "diff").selected || "rankeds_with_not_played" === ctx[5].songType.id && ctx[70].id === ctx[0] ? null : ctx[21](ctx[70], ctx[73], "prev" + Object(_utils_js__WEBPACK_IMPORTED_MODULE_8__.capitalize)(ctx[78].key))
                }, 4096 & dirty[0] && {
                    prevLabel: ctx[70].prevLabel
                }, 16384 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_object)(ctx[78].valueProps) ]) : {};
                value.$set(value_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value, detaching);
            }
        };
    }
    function create_if_block_13(ctx) {
        let current;
        const date_spread_levels = [ {
            date: ctx[21](ctx[70], ctx[73], ctx[78].key)
        }, ctx[78].valueProps ];
        let date_props = {};
        for (let i = 0; i < date_spread_levels.length; i += 1) date_props = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)(date_props, date_spread_levels[i]);
        const date = new _Common_Date_svelte__WEBPACK_IMPORTED_MODULE_18__.default({
            props: date_props
        });
        return {
            c() {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(date.$$.fragment);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(date, target, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                const date_changes = 2117632 & dirty[0] ? Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_update)(date_spread_levels, [ {
                    date: ctx[21](ctx[70], ctx[73], ctx[78].key)
                }, 16384 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_object)(ctx[78].valueProps) ]) : {};
                date.$set(date_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(date.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(date.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(date, detaching);
            }
        };
    }
    function create_each_block_4(key_1, ctx) {
        let first, if_block_anchor, current, if_block = ("diffPp" !== ctx[78].key || ctx[70].id !== ctx[0]) && create_if_block_12(ctx);
        return {
            key: key_1,
            first: null,
            c() {
                first = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), if_block && if_block.c(), 
                if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), 
                this.first = first;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, first, anchor), 
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                "diffPp" !== ctx[78].key || ctx[70].id !== ctx[0] ? if_block ? (if_block.p(ctx, dirty), 
                20481 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1)) : (if_block = create_if_block_12(ctx), 
                if_block.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block, 1, 1, () => {
                    if_block = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)());
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(first), 
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function create_else_block_2(ctx) {
        let t;
        return {
            c() {
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("-");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t, anchor);
            },
            p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t);
            }
        };
    }
    function create_if_block_6(ctx) {
        let each_1_anchor, current, each_blocks = [], each_1_lookup = new Map, each_value_3 = ctx[14];
        const get_key = ctx => ctx[78].key;
        for (let i = 0; i < each_value_3.length; i += 1) {
            let child_ctx = get_each_context_3(ctx, each_value_3, i), key = get_key(child_ctx);
            each_1_lookup.set(key, each_blocks[i] = create_each_block_3(key, child_ctx));
        }
        return {
            c() {
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
                each_1_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(target, anchor);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, each_1_anchor, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                if (3167265 & dirty[0]) {
                    const each_value_3 = ctx[14];
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), each_blocks = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks, dirty, get_key, 1, ctx, each_value_3, each_1_lookup, each_1_anchor.parentNode, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.outro_and_destroy_block, create_each_block_3, each_1_anchor, get_each_context_3), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
                }
            },
            i(local) {
                if (!current) {
                    for (let i = 0; i < each_value_3.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i]);
                    current = !0;
                }
            },
            o(local) {
                for (let i = 0; i < each_blocks.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i]);
                current = !1;
            },
            d(detaching) {
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d(detaching);
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(each_1_anchor);
            }
        };
    }
    function create_if_block_7(ctx) {
        let current_block_type_index, if_block, if_block_anchor, current;
        const if_block_creators = [ create_if_block_8, create_else_block_1 ], if_blocks = [];
        function select_block_type_4(ctx, dirty) {
            return "timeset" === ctx[78].key ? 0 : 1;
        }
        return current_block_type_index = select_block_type_4(ctx), if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
        {
            c() {
                if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_blocks[current_block_type_index].m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                let previous_block_index = current_block_type_index;
                current_block_type_index = select_block_type_4(ctx), current_block_type_index === previous_block_index ? if_blocks[current_block_type_index].p(ctx, dirty) : (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_blocks[previous_block_index], 1, 1, () => {
                    if_blocks[previous_block_index] = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)(), if_block = if_blocks[current_block_type_index], 
                if_block || (if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
                if_block.c()), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor));
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                if_blocks[current_block_type_index].d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function create_else_block_1(ctx) {
        let t, if_block1_anchor, current, show_if = ctx[21](ctx[70], ctx[73], ctx[78].key), if_block0 = show_if && create_if_block_10(ctx), if_block1 = "pp" === ctx[78].key && "rankeds_with_not_played" !== ctx[5].songType.id && create_if_block_9(ctx);
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
            p(ctx, dirty) {
                20480 & dirty[0] && (show_if = ctx[21](ctx[70], ctx[73], ctx[78].key)), show_if ? if_block0 ? (if_block0.p(ctx, dirty), 
                20480 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0, 1)) : (if_block0 = create_if_block_10(ctx), 
                if_block0.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0, 1), 
                if_block0.m(t.parentNode, t)) : if_block0 && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block0, 1, 1, () => {
                    if_block0 = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)()), "pp" === ctx[78].key && "rankeds_with_not_played" !== ctx[5].songType.id ? if_block1 ? (if_block1.p(ctx, dirty), 
                16416 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1, 1)) : (if_block1 = create_if_block_9(ctx), 
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
    function create_if_block_8(ctx) {
        let strong, strong_class_value, current;
        const date_spread_levels = [ {
            date: ctx[21](ctx[70], ctx[73], ctx[78].key)
        }, ctx[78].valueProps ];
        let date_props = {};
        for (let i = 0; i < date_spread_levels.length; i += 1) date_props = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)(date_props, date_spread_levels[i]);
        const date = new _Common_Date_svelte__WEBPACK_IMPORTED_MODULE_18__.default({
            props: date_props
        });
        return {
            c() {
                strong = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("strong"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(date.$$.fragment), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(strong, "class", strong_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("compact-" + ctx[78].key + "-val") + " svelte-1bvl7gs");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, strong, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(date, strong, null), 
                current = !0;
            },
            p(ctx, dirty) {
                const date_changes = 2117632 & dirty[0] ? Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_update)(date_spread_levels, [ {
                    date: ctx[21](ctx[70], ctx[73], ctx[78].key)
                }, 16384 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_object)(ctx[78].valueProps) ]) : {};
                date.$set(date_changes), (!current || 16384 & dirty[0] && strong_class_value !== (strong_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("compact-" + ctx[78].key + "-val") + " svelte-1bvl7gs")) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(strong, "class", strong_class_value);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(date.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(date.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(strong), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(date);
            }
        };
    }
    function create_if_block_10(ctx) {
        let div, t, strong, strong_class_value, current, if_block = ctx[78].compactLabel && create_if_block_11(ctx);
        const value_spread_levels = [ {
            value: ctx[21](ctx[70], ctx[73], ctx[78].key)
        }, {
            prevValue: !ctx[20](ctx[10], "diff").selected || "rankeds_with_not_played" === ctx[5].songType.id && ctx[70].id === ctx[0] ? null : ctx[21](ctx[70], ctx[73], "prev" + Object(_utils_js__WEBPACK_IMPORTED_MODULE_8__.capitalize)(ctx[78].key))
        }, {
            prevLabel: ctx[70].prevLabel
        }, {
            inline: !0
        }, ctx[78].valueProps ];
        let value_props = {};
        for (let i = 0; i < value_spread_levels.length; i += 1) value_props = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.assign)(value_props, value_spread_levels[i]);
        const value = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_11__.default({
            props: value_props
        });
        return {
            c() {
                div = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), if_block && if_block.c(), 
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), strong = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("strong"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(strong, "class", strong_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("compact-" + ctx[78].key + "-val") + " svelte-1bvl7gs");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor), 
                if_block && if_block.m(div, null), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, t), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, strong), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, strong, null), 
                current = !0;
            },
            p(ctx, dirty) {
                ctx[78].compactLabel ? if_block ? if_block.p(ctx, dirty) : (if_block = create_if_block_11(ctx), 
                if_block.c(), if_block.m(div, t)) : if_block && (if_block.d(1), if_block = null);
                const value_changes = 3167265 & dirty[0] ? Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_update)(value_spread_levels, [ 2117632 & dirty[0] && {
                    value: ctx[21](ctx[70], ctx[73], ctx[78].key)
                }, {
                    prevValue: !ctx[20](ctx[10], "diff").selected || "rankeds_with_not_played" === ctx[5].songType.id && ctx[70].id === ctx[0] ? null : ctx[21](ctx[70], ctx[73], "prev" + Object(_utils_js__WEBPACK_IMPORTED_MODULE_8__.capitalize)(ctx[78].key))
                }, 4096 & dirty[0] && {
                    prevLabel: ctx[70].prevLabel
                }, value_spread_levels[3], 16384 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_spread_object)(ctx[78].valueProps) ]) : {};
                value.$set(value_changes), (!current || 16384 & dirty[0] && strong_class_value !== (strong_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("compact-" + ctx[78].key + "-val") + " svelte-1bvl7gs")) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(strong, "class", strong_class_value);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div), if_block && if_block.d(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value);
            }
        };
    }
    function create_if_block_11(ctx) {
        let t0, t1, t2, t0_value = ctx[78].compactLabel + "", t1_value = "acc" === ctx[78].key && ctx[21](ctx[70], ctx[73], "mods") ? " (" + ctx[21](ctx[70], ctx[73], "mods") + ")" : "";
        return {
            c() {
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t0_value), t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t1_value), 
                t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("\n                                                        :");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t0, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t2, anchor);
            },
            p(ctx, dirty) {
                16384 & dirty[0] && t0_value !== (t0_value = ctx[78].compactLabel + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t0, t0_value), 
                20480 & dirty[0] && t1_value !== (t1_value = "acc" === ctx[78].key && ctx[21](ctx[70], ctx[73], "mods") ? " (" + ctx[21](ctx[70], ctx[73], "mods") + ")" : "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t1, t1_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t0), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t2);
            }
        };
    }
    function create_if_block_9(ctx) {
        let current;
        const whatifpp = new _WhatIfPp_svelte__WEBPACK_IMPORTED_MODULE_22__.default({
            props: {
                leaderboardId: ctx[73].leaderboardId,
                pp: ctx[21](ctx[70], ctx[73], ctx[78].key)
            }
        });
        return {
            c() {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(whatifpp.$$.fragment);
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(whatifpp, target, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                const whatifpp_changes = {};
                4096 & dirty[0] && (whatifpp_changes.leaderboardId = ctx[73].leaderboardId), 20480 & dirty[0] && (whatifpp_changes.pp = ctx[21](ctx[70], ctx[73], ctx[78].key)), 
                whatifpp.$set(whatifpp_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(whatifpp.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(whatifpp.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(whatifpp, detaching);
            }
        };
    }
    function create_each_block_3(key_1, ctx) {
        let first, if_block_anchor, current, if_block = ("diffPp" !== ctx[78].key || ctx[70].id !== ctx[0]) && create_if_block_7(ctx);
        return {
            key: key_1,
            first: null,
            c() {
                first = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), if_block && if_block.c(), 
                if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), 
                this.first = first;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, first, anchor), 
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                "diffPp" !== ctx[78].key || ctx[70].id !== ctx[0] ? if_block ? (if_block.p(ctx, dirty), 
                20481 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1)) : (if_block = create_if_block_7(ctx), 
                if_block.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block, 1, 1, () => {
                    if_block = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)());
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(first), 
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function create_each_block_2(key_1, ctx) {
        let first, current_block_type_index, if_block, if_block_anchor, current;
        const if_block_creators = [ create_if_block_5, create_else_block_3 ], if_blocks = [];
        function select_block_type_2(ctx, dirty) {
            return "compact" === ctx[11].id ? 0 : 1;
        }
        return current_block_type_index = select_block_type_2(ctx), if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
        {
            key: key_1,
            first: null,
            c() {
                first = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), if_block.c(), 
                if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), 
                this.first = first;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, first, anchor), 
                if_blocks[current_block_type_index].m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                let previous_block_index = current_block_type_index;
                current_block_type_index = select_block_type_2(ctx), current_block_type_index === previous_block_index ? if_blocks[current_block_type_index].p(ctx, dirty) : (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_blocks[previous_block_index], 1, 1, () => {
                    if_blocks[previous_block_index] = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)(), if_block = if_blocks[current_block_type_index], 
                if_block || (if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
                if_block.c()), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor));
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(first), 
                if_blocks[current_block_type_index].d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function create_each_block_1(key_1, ctx) {
        let tr, td0, t0, td1, t1, t2, t3, t4, current, show_if_1 = "unrankeds" !== ctx[5].songType.id && ctx[20](ctx[10], "stars").selected, show_if = "unrankeds" !== ctx[5].songType.id && ctx[20](ctx[10], "maxPp").selected, each_blocks = [], each_1_lookup = new Map;
        const difficulty = new _Common_Difficulty_svelte__WEBPACK_IMPORTED_MODULE_10__.default({
            props: {
                diff: ctx[73].diff,
                useShortName: !0,
                reverseColors: !0
            }
        }), song = new _Song_svelte__WEBPACK_IMPORTED_MODULE_14__.default({
            props: {
                song: ctx[73],
                $$slots: {
                    default: [ create_default_slot ]
                },
                $$scope: {
                    ctx: ctx
                }
            }
        });
        let if_block0 = show_if_1 && create_if_block_15(ctx), if_block1 = show_if && create_if_block_14(ctx), each_value_2 = ctx[12].series;
        const get_key = ctx => ctx[70].id + "_" + ctx[70].estimateId;
        for (let i = 0; i < each_value_2.length; i += 1) {
            let child_ctx = get_each_context_2(ctx, each_value_2, i), key = get_key(child_ctx);
            each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
        }
        return {
            key: key_1,
            first: null,
            c() {
                tr = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tr"), td0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(difficulty.$$.fragment), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), td1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("td"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(song.$$.fragment), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), if_block0 && if_block0.c(), 
                t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), if_block1 && if_block1.c(), 
                t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
                t4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td0, "class", "diff svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(td1, "class", "song svelte-1bvl7gs"), 
                this.first = tr;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, tr, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(difficulty, td0, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, td1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(song, td1, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t1), if_block0 && if_block0.m(tr, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t2), if_block1 && if_block1.m(tr, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t3);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(tr, null);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr, t4), current = !0;
            },
            p(ctx, dirty) {
                const difficulty_changes = {};
                4096 & dirty[0] && (difficulty_changes.diff = ctx[73].diff), difficulty.$set(difficulty_changes);
                const song_changes = {};
                if (4096 & dirty[0] && (song_changes.song = ctx[73]), 4096 & dirty[0] | 64 & dirty[3] && (song_changes.$$scope = {
                    dirty: dirty,
                    ctx: ctx
                }), song.$set(song_changes), 1056 & dirty[0] && (show_if_1 = "unrankeds" !== ctx[5].songType.id && ctx[20](ctx[10], "stars").selected), 
                show_if_1 ? if_block0 ? (if_block0.p(ctx, dirty), 1056 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0, 1)) : (if_block0 = create_if_block_15(ctx), 
                if_block0.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0, 1), 
                if_block0.m(tr, t2)) : if_block0 && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block0, 1, 1, () => {
                    if_block0 = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)()), 1056 & dirty[0] && (show_if = "unrankeds" !== ctx[5].songType.id && ctx[20](ctx[10], "maxPp").selected), 
                show_if ? if_block1 ? (if_block1.p(ctx, dirty), 1056 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1, 1)) : (if_block1 = create_if_block_14(ctx), 
                if_block1.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1, 1), 
                if_block1.m(tr, t3)) : if_block1 && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block1, 1, 1, () => {
                    if_block1 = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)()), 3169313 & dirty[0]) {
                    const each_value_2 = ctx[12].series;
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), each_blocks = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, tr, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.outro_and_destroy_block, create_each_block_2, t4, get_each_context_2), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
                }
            },
            i(local) {
                if (!current) {
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(difficulty.$$.fragment, local), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(song.$$.fragment, local), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1);
                    for (let i = 0; i < each_value_2.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i]);
                    current = !0;
                }
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(difficulty.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(song.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block1);
                for (let i = 0; i < each_blocks.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i]);
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(tr), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(difficulty), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(song), if_block0 && if_block0.d(), 
                if_block1 && if_block1.d();
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
            }
        };
    }
    function create_if_block_1(ctx) {
        let tfoot, tr0, th, t0, t1, th_rowspan_value, th_colspan_value, t2, t3, tr1, current, t1_value = ctx[12].series[0].name + "", each_blocks = [], each_1_lookup = new Map, each_value = ctx[12].series;
        const get_key = ctx => ctx[70].id + "_" + ctx[70].estimateId;
        for (let i = 0; i < each_value.length; i += 1) {
            let child_ctx = get_each_context(ctx, each_value, i), key = get_key(child_ctx);
            each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
        }
        let if_block = ctx[14].length && ctx[12].series.length > 2 && create_if_block_2(ctx);
        return {
            c() {
                tfoot = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tfoot"), tr0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tr"), 
                th = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("th"), t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("Razem dla "), 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t1_value), t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
                t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), tr1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("tr"), 
                if_block && if_block.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "class", "song svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "rowspan", th_rowspan_value = ctx[12].series.length > 2 ? 2 : 1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "colspan", th_colspan_value = "unrankeds" !== ctx[5].songType.id ? 2 + (ctx[20](ctx[10], "stars").selected ? 1 : 0) + (ctx[20](ctx[10], "maxPp").selected ? 1 : 0) : 2), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(tfoot, "class", "svelte-1bvl7gs");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, tfoot, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tfoot, tr0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr0, th), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(th, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(th, t1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tr0, t2);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(tr0, null);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tfoot, t3), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(tfoot, tr1), 
                if_block && if_block.m(tr1, null), current = !0;
            },
            p(ctx, dirty) {
                if ((!current || 4096 & dirty[0]) && t1_value !== (t1_value = ctx[12].series[0].name + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t1, t1_value), 
                (!current || 4096 & dirty[0] && th_rowspan_value !== (th_rowspan_value = ctx[12].series.length > 2 ? 2 : 1)) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "rowspan", th_rowspan_value), 
                (!current || 1056 & dirty[0] && th_colspan_value !== (th_colspan_value = "unrankeds" !== ctx[5].songType.id ? 2 + (ctx[20](ctx[10], "stars").selected ? 1 : 0) + (ctx[20](ctx[10], "maxPp").selected ? 1 : 0) : 2)) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "colspan", th_colspan_value), 
                1072129 & dirty[0]) {
                    const each_value = ctx[12].series;
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), each_blocks = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tr0, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.outro_and_destroy_block, create_each_block, null, get_each_context), 
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
                }
                ctx[14].length && ctx[12].series.length > 2 ? if_block ? (if_block.p(ctx, dirty), 
                20480 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1)) : (if_block = create_if_block_2(ctx), 
                if_block.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(tr1, null)) : if_block && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block, 1, 1, () => {
                    if_block = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)());
            },
            i(local) {
                if (!current) {
                    for (let i = 0; i < each_value.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i]);
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), current = !0;
                }
            },
            o(local) {
                for (let i = 0; i < each_blocks.length; i += 1) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i]);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(tfoot);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
                if_block && if_block.d();
            }
        };
    }
    function create_else_block(ctx) {
        let th, t, current;
        const value = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_11__.default({
            props: {
                value: ctx[70].totalPp,
                prevValue: ctx[20](ctx[10], "diff").selected ? ctx[70].prevTotalPp : null,
                suffix: "pp"
            }
        });
        return {
            c() {
                th = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("th"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "class", "left svelte-1bvl7gs");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, th, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, th, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(th, t), current = !0;
            },
            p(ctx, dirty) {
                const value_changes = {};
                4096 & dirty[0] && (value_changes.value = ctx[70].totalPp), 5120 & dirty[0] && (value_changes.prevValue = ctx[20](ctx[10], "diff").selected ? ctx[70].prevTotalPp : null), 
                value.$set(value_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(th), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value);
            }
        };
    }
    function create_if_block_3(ctx) {
        let if_block_anchor, current, show_if = ctx[14].length > 0 && !(1 === ctx[14].length && ctx[70].id === ctx[0] && ctx[20](ctx[10], "diffPp").selected), if_block = show_if && create_if_block_4(ctx);
        return {
            c() {
                if_block && if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                21505 & dirty[0] && (show_if = ctx[14].length > 0 && !(1 === ctx[14].length && ctx[70].id === ctx[0] && ctx[20](ctx[10], "diffPp").selected)), 
                show_if ? if_block ? (if_block.p(ctx, dirty), 21505 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1)) : (if_block = create_if_block_4(ctx), 
                if_block.c(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block, 1, 1, () => {
                    if_block = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)());
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function create_if_block_4(ctx) {
        let th, t, th_rowspan_value, th_colspan_value, current;
        const value = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_11__.default({
            props: {
                value: ctx[70].totalPp,
                prevValue: ctx[20](ctx[10], "diff").selected ? ctx[70].prevTotalPp : null,
                suffix: "pp"
            }
        });
        return {
            c() {
                th = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("th"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "class", "left svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "rowspan", th_rowspan_value = ctx[70].id !== ctx[0] ? 1 : ctx[12].series.length > 2 ? 2 : 1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "colspan", th_colspan_value = ctx[70].id !== ctx[0] ? ctx[14].length : ctx[14].length - (ctx[20](ctx[10], "diffPp").selected ? 1 : 0));
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, th, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, th, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(th, t), current = !0;
            },
            p(ctx, dirty) {
                const value_changes = {};
                4096 & dirty[0] && (value_changes.value = ctx[70].totalPp), 5120 & dirty[0] && (value_changes.prevValue = ctx[20](ctx[10], "diff").selected ? ctx[70].prevTotalPp : null), 
                value.$set(value_changes), (!current || 4097 & dirty[0] && th_rowspan_value !== (th_rowspan_value = ctx[70].id !== ctx[0] ? 1 : ctx[12].series.length > 2 ? 2 : 1)) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "rowspan", th_rowspan_value), 
                (!current || 21505 & dirty[0] && th_colspan_value !== (th_colspan_value = ctx[70].id !== ctx[0] ? ctx[14].length : ctx[14].length - (ctx[20](ctx[10], "diffPp").selected ? 1 : 0))) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "colspan", th_colspan_value);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(th), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value);
            }
        };
    }
    function create_each_block(key_1, ctx) {
        let first, current_block_type_index, if_block, if_block_anchor, current;
        const if_block_creators = [ create_if_block_3, create_else_block ], if_blocks = [];
        function select_block_type_6(ctx, dirty) {
            return "tabular" === ctx[11].id ? 0 : 1;
        }
        return current_block_type_index = select_block_type_6(ctx), if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
        {
            key: key_1,
            first: null,
            c() {
                first = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), if_block.c(), 
                if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)(), 
                this.first = first;
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, first, anchor), 
                if_blocks[current_block_type_index].m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor), 
                current = !0;
            },
            p(ctx, dirty) {
                let previous_block_index = current_block_type_index;
                current_block_type_index = select_block_type_6(ctx), current_block_type_index === previous_block_index ? if_blocks[current_block_type_index].p(ctx, dirty) : (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_blocks[previous_block_index], 1, 1, () => {
                    if_blocks[previous_block_index] = null;
                }), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)(), if_block = if_blocks[current_block_type_index], 
                if_block || (if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx), 
                if_block.c()), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1), 
                if_block.m(if_block_anchor.parentNode, if_block_anchor));
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block), current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(first), 
                if_blocks[current_block_type_index].d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function create_if_block_2(ctx) {
        let th, th_colspan_value, current;
        const value = new _Common_Value_svelte__WEBPACK_IMPORTED_MODULE_11__.default({
            props: {
                value: ctx[12].bestTotalRealPp,
                prevValue: ctx[20](ctx[10], "diff").selected ? ctx[12].series[0].totalPp : null,
                suffix: "pp"
            }
        });
        return {
            c() {
                th = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("th"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value.$$.fragment), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "class", "left svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "colspan", th_colspan_value = ctx[14].length * (ctx[12].series.length - 1));
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, th, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value, th, null), 
                current = !0;
            },
            p(ctx, dirty) {
                const value_changes = {};
                4096 & dirty[0] && (value_changes.value = ctx[12].bestTotalRealPp), 5120 & dirty[0] && (value_changes.prevValue = ctx[20](ctx[10], "diff").selected ? ctx[12].series[0].totalPp : null), 
                value.$set(value_changes), (!current || 20480 & dirty[0] && th_colspan_value !== (th_colspan_value = ctx[14].length * (ctx[12].series.length - 1))) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(th, "colspan", th_colspan_value);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(th), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value);
            }
        };
    }
    function create_pending_block(ctx) {
        let div;
        return {
            c() {
                div = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), div.innerHTML = "<h3>Transformacja wszechświata w toku...</h3>", 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div, "class", "info svelte-1bvl7gs");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor);
            },
            p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div);
            }
        };
    }
    function create_fragment(ctx) {
        let div9, div0, header0, t1, select0, t2, div1, input, t3, div2, t4, div3, header1, t6, t7, div4, header2, t9, select1, t10, div6, div5, header3, t12, t13, div7, header4, t15, select2, t16, div8, header5, t18, select3, t19, promise, t20, updating_currentPage, updating_itemsPerPage, current, dispose, each_blocks_2 = [], each2_lookup = new Map, each_value_12 = ctx[17], each_blocks_4 = [];
        for (let i = 0; i < each_value_12.length; i += 1) each_blocks_4[i] = create_each_block_12(get_each_context_12(ctx, each_value_12, i));
        const range = new _Common_Range_svelte__WEBPACK_IMPORTED_MODULE_16__.default({
            props: {
                label: "+PP > ",
                value: ctx[5].minPpDiff,
                min: 1,
                max: 20,
                step: .1,
                suffix: "pp"
            }
        });
        range.$on("change", ctx[25]);
        const multirange = new _Common_MultiRange_svelte__WEBPACK_IMPORTED_MODULE_19__.default({
            props: {
                label: "Gwiazdki",
                value: ctx[5].starsFilter,
                min: "rankeds_with_not_played" === ctx[5].songType.id ? Object(_utils_format__WEBPACK_IMPORTED_MODULE_21__.round)(ctx[2], 1) : 0,
                max: ctx[3],
                step: .1,
                suffix: "*",
                digits: 1,
                disableDirectEditing: !0
            }
        });
        multirange.$on("change", ctx[24]);
        let each_value_11 = ctx[19], each_blocks_3 = [];
        for (let i = 0; i < each_value_11.length; i += 1) each_blocks_3[i] = create_each_block_11(get_each_context_11(ctx, each_value_11, i));
        let each_value_10 = ctx[13];
        const get_key = ctx => ctx[78].key;
        for (let i = 0; i < each_value_10.length; i += 1) {
            let child_ctx = get_each_context_10(ctx, each_value_10, i), key = get_key(child_ctx);
            each2_lookup.set(key, each_blocks_2[i] = create_each_block_10(key, child_ctx));
        }
        let each_value_9 = ctx[4], each_blocks_1 = [];
        for (let i = 0; i < each_value_9.length; i += 1) each_blocks_1[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
        let each_value_8 = ctx[18], each_blocks = [];
        for (let i = 0; i < each_value_8.length; i += 1) each_blocks[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
        let info = {
            ctx: ctx,
            current: null,
            token: null,
            pending: create_pending_block,
            then: create_then_block,
            catch: create_catch_block,
            value: 69,
            blocks: [ , , ,  ]
        };
        function pager_currentPage_binding(value) {
            ctx[67].call(null, value);
        }
        function pager_itemsPerPage_binding(value) {
            ctx[68].call(null, value);
        }
        Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.handle_promise)(promise = ctx[16], info);
        let pager_props = {
            totalItems: ctx[9],
            hide: ctx[6]
        };
        void 0 !== ctx[7] && (pager_props.currentPage = ctx[7]), void 0 !== ctx[8] && (pager_props.itemsPerPage = ctx[8]);
        const pager = new _Common_Pager_svelte__WEBPACK_IMPORTED_MODULE_15__.default({
            props: pager_props
        });
        return svelte_internal__WEBPACK_IMPORTED_MODULE_0__.binding_callbacks.push(() => Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.bind)(pager, "currentPage", pager_currentPage_binding)), 
        svelte_internal__WEBPACK_IMPORTED_MODULE_0__.binding_callbacks.push(() => Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.bind)(pager, "itemsPerPage", pager_itemsPerPage_binding)), 
        {
            c() {
                div9 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), div0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), 
                header0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("header"), 
                header0.textContent = "Rodzaj", t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                select0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("select");
                for (let i = 0; i < each_blocks_4.length; i += 1) each_blocks_4[i].c();
                t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), div1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), 
                input = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("input"), t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                div2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(range.$$.fragment), 
                t4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), div3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), 
                header1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("header"), 
                header1.textContent = "Gwiazdki", t6 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(multirange.$$.fragment), 
                t7 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), div4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), 
                header2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("header"), 
                header2.textContent = "Widok", t9 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                select1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("select");
                for (let i = 0; i < each_blocks_3.length; i += 1) each_blocks_3[i].c();
                t10 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), div6 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), 
                div5 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), header3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("header"), 
                header3.textContent = "Pokazuj", t12 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
                for (let i = 0; i < each_blocks_2.length; i += 1) each_blocks_2[i].c();
                t13 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), div7 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), 
                header4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("header"), 
                header4.textContent = "Sortowanie", t15 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                select2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("select");
                for (let i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].c();
                t16 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), div8 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), 
                header5 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("header"), 
                header5.textContent = "Wyniki / stronę", t18 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                select3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("select");
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
                t19 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), info.block.c(), 
                t20 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(pager.$$.fragment), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(header0, "class", "svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(select0, "class", "svelte-1bvl7gs"), 
                void 0 === ctx[5].songType && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_render_callback)(() => ctx[62].call(select0)), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "type", "text"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "placeholder", "Nazwa nutki..."), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "class", "svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div1, "class", "filter-name svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(div2, "display", "rankeds_with_not_played" === ctx[5].songType.id ? "block" : "none"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(header1, "class", "svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(div3, "display", "unrankeds" !== ctx[5].songType.id ? "block" : "none"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(header2, "class", "svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(select1, "class", "svelte-1bvl7gs"), 
                void 0 === ctx[11] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_render_callback)(() => ctx[63].call(select1)), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(header3, "class", "svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div6, "class", "columns svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(header4, "class", "svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(select2, "class", "svelte-1bvl7gs"), 
                void 0 === ctx[5].sortBy && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_render_callback)(() => ctx[65].call(select2)), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(header5, "class", "svelte-1bvl7gs"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(select3, "class", "svelte-1bvl7gs"), 
                void 0 === ctx[8] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_render_callback)(() => ctx[66].call(select3)), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div9, "class", "filters svelte-1bvl7gs");
            },
            m(target, anchor, remount) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div9, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, div0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div0, header0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div0, t1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div0, select0);
                for (let i = 0; i < each_blocks_4.length; i += 1) each_blocks_4[i].m(select0, null);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.select_option)(select0, ctx[5].songType), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, t2), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, div1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, input), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, t3), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, div2), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(range, div2, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, t4), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, div3), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div3, header1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div3, t6), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(multirange, div3, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, t7), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, div4), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div4, header2), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div4, t9), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div4, select1);
                for (let i = 0; i < each_blocks_3.length; i += 1) each_blocks_3[i].m(select1, null);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.select_option)(select1, ctx[11]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, t10), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, div6), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div6, div5), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div5, header3), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div5, t12);
                for (let i = 0; i < each_blocks_2.length; i += 1) each_blocks_2[i].m(div5, null);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, t13), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, div7), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div7, header4), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div7, t15), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div7, select2);
                for (let i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].m(select2, null);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.select_option)(select2, ctx[5].sortBy), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, t16), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div9, div8), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div8, header5), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div8, t18), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div8, select3);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(select3, null);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.select_option)(select3, ctx[8]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t19, anchor), 
                info.block.m(target, info.anchor = anchor), info.mount = () => t20.parentNode, info.anchor = t20, 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t20, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(pager, target, anchor), 
                current = !0, remount && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.run_all)(dispose), 
                dispose = [ Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(select0, "change", ctx[62]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(select0, "change", ctx[22]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(input, "input", ctx[23]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(select1, "change", ctx[63]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(select2, "change", ctx[65]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(select3, "change", ctx[66]) ];
            },
            p(new_ctx, dirty) {
                if (ctx = new_ctx, 131072 & dirty[0]) {
                    let i;
                    for (each_value_12 = ctx[17], i = 0; i < each_value_12.length; i += 1) {
                        const child_ctx = get_each_context_12(ctx, each_value_12, i);
                        each_blocks_4[i] ? each_blocks_4[i].p(child_ctx, dirty) : (each_blocks_4[i] = create_each_block_12(child_ctx), 
                        each_blocks_4[i].c(), each_blocks_4[i].m(select0, null));
                    }
                    for (;i < each_blocks_4.length; i += 1) each_blocks_4[i].d(1);
                    each_blocks_4.length = each_value_12.length;
                }
                32 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.select_option)(select0, ctx[5].songType);
                const range_changes = {};
                32 & dirty[0] && (range_changes.value = ctx[5].minPpDiff), range.$set(range_changes), 
                (!current || 32 & dirty[0]) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(div2, "display", "rankeds_with_not_played" === ctx[5].songType.id ? "block" : "none");
                const multirange_changes = {};
                if (32 & dirty[0] && (multirange_changes.value = ctx[5].starsFilter), 36 & dirty[0] && (multirange_changes.min = "rankeds_with_not_played" === ctx[5].songType.id ? Object(_utils_format__WEBPACK_IMPORTED_MODULE_21__.round)(ctx[2], 1) : 0), 
                8 & dirty[0] && (multirange_changes.max = ctx[3]), multirange.$set(multirange_changes), 
                (!current || 32 & dirty[0]) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(div3, "display", "unrankeds" !== ctx[5].songType.id ? "block" : "none"), 
                524288 & dirty[0]) {
                    let i;
                    for (each_value_11 = ctx[19], i = 0; i < each_value_11.length; i += 1) {
                        const child_ctx = get_each_context_11(ctx, each_value_11, i);
                        each_blocks_3[i] ? each_blocks_3[i].p(child_ctx, dirty) : (each_blocks_3[i] = create_each_block_11(child_ctx), 
                        each_blocks_3[i].c(), each_blocks_3[i].m(select1, null));
                    }
                    for (;i < each_blocks_3.length; i += 1) each_blocks_3[i].d(1);
                    each_blocks_3.length = each_value_11.length;
                }
                if (2048 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.select_option)(select1, ctx[11]), 
                8192 & dirty[0]) {
                    const each_value_10 = ctx[13];
                    each_blocks_2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_keyed_each)(each_blocks_2, dirty, get_key, 1, ctx, each_value_10, each2_lookup, div5, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_block, create_each_block_10, null, get_each_context_10);
                }
                if (16 & dirty[0]) {
                    let i;
                    for (each_value_9 = ctx[4], i = 0; i < each_value_9.length; i += 1) {
                        const child_ctx = get_each_context_9(ctx, each_value_9, i);
                        each_blocks_1[i] ? each_blocks_1[i].p(child_ctx, dirty) : (each_blocks_1[i] = create_each_block_9(child_ctx), 
                        each_blocks_1[i].c(), each_blocks_1[i].m(select2, null));
                    }
                    for (;i < each_blocks_1.length; i += 1) each_blocks_1[i].d(1);
                    each_blocks_1.length = each_value_9.length;
                }
                if (32 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.select_option)(select2, ctx[5].sortBy), 
                262144 & dirty[0]) {
                    let i;
                    for (each_value_8 = ctx[18], i = 0; i < each_value_8.length; i += 1) {
                        const child_ctx = get_each_context_8(ctx, each_value_8, i);
                        each_blocks[i] ? each_blocks[i].p(child_ctx, dirty) : (each_blocks[i] = create_each_block_8(child_ctx), 
                        each_blocks[i].c(), each_blocks[i].m(select3, null));
                    }
                    for (;i < each_blocks.length; i += 1) each_blocks[i].d(1);
                    each_blocks.length = each_value_8.length;
                }
                if (256 & dirty[0] && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.select_option)(select3, ctx[8]), 
                info.ctx = ctx, 65536 & dirty[0] && promise !== (promise = ctx[16]) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.handle_promise)(promise, info)) ; else {
                    const child_ctx = ctx.slice();
                    child_ctx[69] = info.resolved, info.block.p(child_ctx, dirty);
                }
                const pager_changes = {};
                512 & dirty[0] && (pager_changes.totalItems = ctx[9]), 64 & dirty[0] && (pager_changes.hide = ctx[6]), 
                !updating_currentPage && 128 & dirty[0] && (updating_currentPage = !0, pager_changes.currentPage = ctx[7], 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_flush_callback)(() => updating_currentPage = !1)), 
                !updating_itemsPerPage && 256 & dirty[0] && (updating_itemsPerPage = !0, pager_changes.itemsPerPage = ctx[8], 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_flush_callback)(() => updating_itemsPerPage = !1)), 
                pager.$set(pager_changes);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(range.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(multirange.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(info.block), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(pager.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(range.$$.fragment, local), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(multirange.$$.fragment, local);
                for (let i = 0; i < 3; i += 1) {
                    const block = info.blocks[i];
                    Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(block);
                }
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(pager.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div9), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_each)(each_blocks_4, detaching), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(range), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(multirange), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_each)(each_blocks_3, detaching);
                for (let i = 0; i < each_blocks_2.length; i += 1) each_blocks_2[i].d();
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_each)(each_blocks_1, detaching), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_each)(each_blocks, detaching), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t19), info.block.d(detaching), 
                info.token = null, info = null, detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t20), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(pager, detaching), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.run_all)(dispose);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        let {playerId: playerId = Object(_temp__WEBPACK_IMPORTED_MODULE_5__.getMainUserId)()} = $$props, {snipedIds: snipedIds = []} = $$props, {minPpPerMap: minPpPerMap = 1} = $$props, lightMode = !1;
        Object(svelte__WEBPACK_IMPORTED_MODULE_20__.onMount)(() => {
            $$invalidate(1, lightMode = "white" === getComputedStyle(document.documentElement).getPropertyValue("--background"));
        });
        let initialized = !1, countryRanking = [], sniperModeIds = [], minStarsForSniper = 0, maxStars = 100, songTypes = [ {
            id: "all",
            text: "Wszystkie"
        }, {
            id: "rankeds",
            text: "Tylko rankingowe"
        }, {
            id: "unrankeds",
            text: "Tylko nierankingowe"
        }, {
            id: "rankeds_with_not_played",
            text: "Tryb snajpera"
        } ], sortTypes = [ {
            name: "Data zagrania",
            type: "series",
            subtype: 0,
            field: "timeset",
            order: "desc",
            enabled: !0
        } ];
        const generateSortTypes = async _ => {
            const types = [], data = await Object(_store__WEBPACK_IMPORTED_MODULE_6__.getCacheAndConvertIfNeeded)();
            if ("rankeds_with_not_played" === allFilters.songType.id && types.push({
                name: "+PP",
                type: "song",
                subtype: null,
                field: "bestDiffPp",
                order: "desc",
                enabled: !0
            }), data && data.users) {
                const userIds = [ playerId ].concat(snipedIds.concat(snipedIds.length || "rankeds_with_not_played" !== allFilters.songType.id ? [] : sniperModeIds));
                userIds.forEach((pId, idx) => {
                    const name = data.users[pId] ? data.users[pId].name : null;
                    name && [ {
                        field: "timeset",
                        name: "Data zagrania"
                    }, {
                        field: "pp",
                        name: "PP"
                    }, {
                        field: "acc",
                        name: "ACC"
                    } ].forEach(field => {
                        ("acc" !== field.field || [ "rankeds", "rankeds_with_not_played" ].includes(allFilters.songType.id)) && types.push({
                            name: (userIds.length > 1 ? name + ": " : "") + field.name,
                            type: "series",
                            subtype: idx,
                            field: field.field,
                            order: "desc",
                            enabled: !0
                        });
                    });
                });
            }
            types.push({
                name: "Gwiazdki",
                type: "song",
                subtype: null,
                field: "stars",
                order: "desc",
                enabled: !0
            }), $$invalidate(4, sortTypes = types), $$invalidate(5, allFilters.sortBy = types[0], allFilters);
        };
        let allFilters = {
            songType: songTypes[0],
            name: "",
            starsFilter: {
                from: 0,
                to: maxStars
            },
            minPpDiff: 1,
            sortBy: sortTypes[0]
        };
        const forceFiltersChanged = () => $$invalidate(5, allFilters = Object.assign({}, allFilters));
        let allRankeds = {};
        const getAllScoresByType = async (playerId, rankedOnly = !0) => rankedOnly ? await Object(_scoresaber_players__WEBPACK_IMPORTED_MODULE_12__.getPlayerRankedScores)(playerId) : await Object(_scoresaber_players__WEBPACK_IMPORTED_MODULE_12__.getPlayerScores)(), getCachedAllScoresByType = Object(_utils_memoize__WEBPACK_IMPORTED_MODULE_13__.default)(getAllScoresByType), getMinStars = async (playerId, boundary = minPpPerMap, maxAcc = 95) => {
            const playerPpScores = (await getCachedAllScoresByType(playerId, !0)).sort((a, b) => b.pp - a.pp).map(s => s.pp);
            return Object(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.findRawPp)(playerPpScores, boundary) / _scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.PP_PER_STAR / Object(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.ppFromScore)(maxAcc);
        }, getCachedMinStars = Object(_utils_memoize__WEBPACK_IMPORTED_MODULE_13__.default)(getMinStars), getMaxScoreExFromPlayersScores = async leaderboardId => Object.values((await Object(_store__WEBPACK_IMPORTED_MODULE_6__.getCacheAndConvertIfNeeded)()).users).reduce((maxScore, player) => !maxScore && player.scores && player.scores[leaderboardId] && player.scores[leaderboardId].maxScoreEx ? player.scores[leaderboardId].maxScoreEx : maxScore, null), getCachedMaxScoreExFromPlayersScores = Object(_utils_memoize__WEBPACK_IMPORTED_MODULE_13__.default)(getMaxScoreExFromPlayersScores);
        (async () => {
            if (!snipedIds || !snipedIds.length) {
                countryRanking = await Object(_scoresaber_players__WEBPACK_IMPORTED_MODULE_12__.getCountryRanking)();
                const player = countryRanking.find(p => p.id === playerId);
                player && (player.countryRank > 1 && sniperModeIds.push(countryRanking[player.countryRank - 1 - 1].id), 
                player.countryRank < countryRanking.length && sniperModeIds.push(countryRanking[player.countryRank + 1 - 1].id));
            }
            allRankeds = await Object(_scoresaber_rankeds__WEBPACK_IMPORTED_MODULE_3__.getRankedSongs)(), 
            $$invalidate(3, maxStars = (await Promise.all(Object.values(allRankeds).map(async r => (allRankeds[r.leaderboardId].maxScoreEx = await getCachedMaxScoreExFromPlayersScores(r.leaderboardId), 
            r.stars)))).reduce((max, stars) => stars > max ? stars : max, 0)), $$invalidate(5, allFilters.starsFilter = Object.assign({}, allFilters.starsFilter, {
                to: maxStars
            }), allFilters), $$invalidate(2, minStarsForSniper = await getCachedMinStars(playerId, minPpPerMap)), 
            await generateSortTypes(), $$invalidate(28, initialized = !0);
        })();
        let calculating = !0, currentPage = 0, itemsPerPage = 10, pagerTotal = 0;
        const itemsPerPageList = [ 5, 10, 15, 20, 25, 50 ];
        let allColumns = [ {
            label: "Gwiazdki",
            name: "*",
            key: "stars",
            selected: !1,
            isColumn: !1,
            displayed: !0
        }, {
            label: "Max PP",
            name: "Max PP",
            key: "maxPp",
            selected: !1,
            isColumn: !1,
            displayed: !0
        }, {
            label: "Data zagrania",
            compactLabel: null,
            name: "Data",
            key: "timeset",
            selected: !0,
            isColumn: !0,
            displayed: !0,
            valueProps: {
                prevValue: null
            }
        }, {
            label: "PP do globala",
            compactLabel: "Ranking",
            name: "+PP",
            key: "diffPp",
            selected: !1,
            isColumn: !0,
            displayed: !1,
            valueProps: {
                zero: "-",
                suffix: "pp",
                withSign: !0,
                useColorsForValue: !0
            }
        }, {
            label: "PP",
            name: "PP",
            key: "pp",
            selected: !0,
            isColumn: !0,
            valueProps: {
                zero: "-",
                suffix: "pp"
            },
            displayed: !0
        }, {
            label: "Ważone PP",
            compactLabel: "Ważone",
            name: "wPP",
            key: "weightedPp",
            selected: !1,
            isColumn: !0,
            displayed: !0,
            valueProps: {
                zero: "-",
                suffix: "pp"
            }
        }, {
            label: "Dokładność",
            compactLabel: "Acc",
            name: "Acc",
            key: "acc",
            selected: !0,
            isColumn: !0,
            displayed: !0,
            valueProps: {
                zero: "-",
                suffix: "%"
            }
        }, {
            label: "Wynik punktowy",
            compactLabel: "Wynik",
            name: "Wynik",
            key: "score",
            selected: !0,
            isColumn: !0,
            displayed: !0,
            valueProps: {
                digits: 0,
                zero: "-"
            }
        }, {
            label: "Różnice względem gracza",
            name: "Różnice",
            key: "diff",
            selected: !0,
            isColumn: !1,
            displayed: !0
        }, {
            label: "Pokazuj potencjał gracza",
            name: "Potencjał",
            key: "estimate",
            selected: !0,
            isColumn: !1,
            displayed: !1
        } ];
        const viewTypes = [ {
            id: "compact",
            text: "Kompaktowy"
        }, {
            id: "tabular",
            text: "Tabelaryczny"
        } ];
        let viewType = viewTypes[0];
        const getObjectFromArrayByKey = (shownColumns, value, key = "key") => shownColumns.find(c => c[key] && c[key] === value), getCachedTotalPlayerPp = Object(_utils_memoize__WEBPACK_IMPORTED_MODULE_13__.default)(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.getTotalUserPp), getScoreWithNewPp = async (playerId, newSongPp) => await getCachedTotalPlayerPp(playerId, newSongPp) - await getCachedTotalPlayerPp(playerId), getCachedScoreWithNewPp = Object(_utils_memoize__WEBPACK_IMPORTED_MODULE_13__.default)(getScoreWithNewPp), getPlayerSongEstimate = async (playerId, leaderboardId, stars) => {
            const userScore = await getCachedSeriesSongScore(playerId, leaderboardId, null), userRankedScores = await Object(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.getAllRankedsWithUserScores)(playerId), userEstimatedAcc = 100 * Object(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.getEstimatedAcc)(stars, userRankedScores), useEstimated = !userScore.acc || userScore.acc < userEstimatedAcc, pp = useEstimated ? stars * _scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.PP_PER_STAR * Object(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.ppFromScore)(userEstimatedAcc) : userScore.pp, maxScore = userScore.maxScoreEx ? userScore.maxScoreEx : 0, score = useEstimated ? userEstimatedAcc * maxScore / 100 : userScore.score;
            return {
                leaderboardId: leaderboardId,
                acc: useEstimated ? userEstimatedAcc : userScore.acc,
                prevAcc: userScore.acc,
                score: score,
                prevScore: userScore.score,
                pp: pp,
                prevPp: userScore.pp,
                timeset: useEstimated ? null : userScore.timeset,
                diff: useEstimated ? await getCachedScoreWithNewPp(playerId, {
                    [leaderboardId]: {
                        pp: pp
                    }
                }) : 0,
                best: !1
            };
        }, getCachedPlayerSongEstimate = Object(_utils_memoize__WEBPACK_IMPORTED_MODULE_13__.default)(getPlayerSongEstimate), getSeriesSong = (leaderboardId, series) => series && series.scores && series.scores[leaderboardId] ? series.scores[leaderboardId] : null, findBestInSeries = (series, leaderboardId, withEstimated = !0, key = "score") => {
            let bestIdx = null, bestValue = null;
            return series.forEach((s, idx) => {
                if (!withEstimated && s.estimateId) return null;
                const value = s.scores[leaderboardId] && s.scores[leaderboardId][key] ? s.scores[leaderboardId][key] : null;
                value && (!bestValue || value > bestValue) && (bestValue = value, bestIdx = idx);
            }), bestIdx;
        };
        async function getPlayerTotalPpWithBestScores(songs, key = "bestRealPp") {
            const bestScores = Object(_utils_js__WEBPACK_IMPORTED_MODULE_8__.convertArrayToObjectByKey)(songs.filter(s => s[key]).map(s => ({
                leaderboardId: s.leaderboardId,
                pp: s[key]
            })), "leaderboardId");
            return await getCachedTotalPlayerPp(playerId, bestScores);
        }
        const mapHasStars = (song, minStars, maxStars = null) => song.stars && song.stars >= minStars && (!maxStars || song.stars <= maxStars), filterBySongName = (song, name) => {
            if (!name.length) return !0;
            return (song.name + " " + song.songAuthor + " " + song.levelAuthor).toLowerCase().includes(name.toLowerCase());
        }, songIsUnranked = song => !song.stars, bestSeriesGivesAtLeastMinPpDiff = (song, minPpDiff = 1) => song.bestDiffPp && song.bestDiffPp > minPpDiff, playerIsNotTheBest = (leaderboardId, series) => !getSeriesSong(leaderboardId, series) || !getSeriesSong(leaderboardId, series).best, nobodyPlayedItYet = song => null === song.bestIdx;
        function completeFetchingNewPage(data) {
            $$invalidate(12, songsPage = data);
        }
        let songsPage = {
            songs: [],
            series: []
        };
        async function promiseGetPage(promised, current, itemsPerPage) {
            completeFetchingNewPage({
                songs: [],
                series: []
            });
            const data = await promised;
            if (!data) return;
            $$invalidate(9, pagerTotal = data.songs.length);
            const songPage = Object.assign({}, data, {
                songs: data.songs.slice(current * itemsPerPage, (current + 1) * itemsPerPage),
                total: pagerTotal
            });
            for (const songsKey in songPage.songs) {
                const song = songPage.songs[songsKey];
                for (const seriesKey in songPage.series) {
                    const series = songPage.series[seriesKey];
                    if (series.scores[song.leaderboardId]) {
                        if (!song.maxScoreEx) try {
                            song.maxScoreEx = await Object(_song__WEBPACK_IMPORTED_MODULE_17__.getSongMaxScoreWithDiffAndType)(song.id, song.diff, !0);
                        } catch (e) {}
                        if (song.maxScoreEx) {
                            const scoreMult = series.scores[song.leaderboardId].scoreMult ? series.scores[song.leaderboardId].scoreMult : 1, prevScoreMult = series.scores[song.leaderboardId].prevScoreMult ? series.scores[song.leaderboardId].prevScoreMult : 1;
                            series.scores[song.leaderboardId].acc = series.scores[song.leaderboardId].score / song.maxScoreEx / scoreMult * 100, 
                            series.scores[song.leaderboardId].prevAcc = series.scores[song.leaderboardId].prevScore ? series.scores[song.leaderboardId].prevScore / song.maxScoreEx / prevScoreMult * 100 : null;
                        } else Object(_song__WEBPACK_IMPORTED_MODULE_17__.getSongMaxScoreWithDiffAndType)(song.id, song.diff, !1, !0).then(async maxScoreEx => {
                            if (maxScoreEx) {
                                song.maxScoreEx = maxScoreEx;
                                const scoreMult = series.scores[song.leaderboardId].scoreMult ? series.scores[song.leaderboardId].scoreMult : 1, prevScoreMult = series.scores[song.leaderboardId].prevScoreMult ? series.scores[song.leaderboardId].prevScoreMult : 1;
                                series.scores[song.leaderboardId].acc = series.scores[song.leaderboardId].score / song.maxScoreEx / scoreMult * 100, 
                                series.scores[song.leaderboardId].prevAcc = series.scores[song.leaderboardId].prevScore ? series.scores[song.leaderboardId].prevScore / song.maxScoreEx / prevScoreMult * 100 : null, 
                                current === currentPage && completeFetchingNewPage(songPage);
                            }
                        }).catch(e => {});
                    }
                }
            }
            return completeFetchingNewPage(songPage), songPage;
        }
        const onFilterNameChange = Object(_utils_debounce__WEBPACK_IMPORTED_MODULE_9__.default)(e => $$invalidate(5, allFilters.name = e.target.value, allFilters), 400), onFilterStarsChange = Object(_utils_debounce__WEBPACK_IMPORTED_MODULE_9__.default)(e => $$invalidate(5, allFilters.starsFilter = Object.assign({}, allFilters.starsFilter), allFilters), 400), onFilterMinPlusPpChanged = Object(_utils_debounce__WEBPACK_IMPORTED_MODULE_9__.default)(e => $$invalidate(5, allFilters.minPpDiff = e.detail, allFilters), 800);
        async function calculate(playerId, snipedIds, filters) {
            $$invalidate(6, calculating = !0), await Object(_network_fetch__WEBPACK_IMPORTED_MODULE_4__.delay)(0);
            try {
                const sortedRankeds = {};
                let playerIds = [ playerId ].concat(snipedIds);
                const playerInfos = await Promise.all(playerIds.map(async pId => Object(_scoresaber_players__WEBPACK_IMPORTED_MODULE_12__.getPlayerInfo)(pId))), playersSeries = await Promise.all(playerInfos.map(async pInfo => {
                    const {lastPlay: lastPlay, recentPlay: recentPlay, scores: scores, stats: stats, weeklyDiff: weeklyDiff, url: url, lastUpdated: lastUpdated, userHistory: userHistory, ...playerInfo} = pInfo, shouldCalculateTotalPp = "rankeds_with_not_played" === filters.songType.id;
                    return playerInfo.prevTotalPp = shouldCalculateTotalPp ? await getCachedTotalPlayerPp(playerId) : null, 
                    playerInfo.totalPp = playerInfo.prevTotalPp, sortedRankeds[pInfo.id] || (sortedRankeds[pInfo.id] = Object.values(scores).filter(s => s.pp > 0).sort((a, b) => b.pp - a.pp)), 
                    Object.assign({}, playerInfo, {
                        lastUpdated: lastUpdated ? Object(_utils_date__WEBPACK_IMPORTED_MODULE_7__.dateFromString)(lastUpdated) : null,
                        scores: Object(_utils_js__WEBPACK_IMPORTED_MODULE_8__.convertArrayToObjectByKey)(Object.values(scores).map(s => {
                            const {id: id, name: name, songSubName: songSubName, songAuthorName: songAuthorName, levelAuthorName: levelAuthorName, diff: diff, stars: stars, oldStars: oldStars, maxScoreEx: maxScoreEx, playerId: playerId, ...score} = s;
                            return score.timeset = Object(_utils_date__WEBPACK_IMPORTED_MODULE_7__.dateFromString)(s.timeset), 
                            score.pp > 0 && !score.weightedPp && (score.weightedPp = Object(_scoresaber_pp__WEBPACK_IMPORTED_MODULE_2__.getWeightedPp)(sortedRankeds[playerId], s.leaderboardId, !0), 
                            s.weightedPp = score.weightedPp), s.scoreMult = score.uScore ? score.score / score.uScore : 1, 
                            score;
                        }), "leaderboardId")
                    });
                })), allPlayedSongs = await Promise.all(Object.values(playerInfos.reduce((cum, player) => Object.assign({}, cum, player.scores), {})).map(async s => {
                    const maxScoreEx = s.maxScoreEx ? s.maxScoreEx : await getCachedMaxScoreExFromPlayersScores(s.leaderboardId);
                    return {
                        leaderboardId: s.leaderboardId,
                        id: s.id,
                        name: (s.name + " " + s.songSubName).trim(),
                        songAuthor: s.songAuthorName,
                        levelAuthor: s.levelAuthorName,
                        diff: Object(_song__WEBPACK_IMPORTED_MODULE_17__.extractDiffAndType)(s.diff),
                        stars: s.stars ? s.stars : null,
                        oldStars: null,
                        maxScoreEx: maxScoreEx
                    };
                })), allPlayedSongsObj = Object(_utils_js__WEBPACK_IMPORTED_MODULE_8__.convertArrayToObjectByKey)(allPlayedSongs, "leaderboardId"), filteredSongs = (await Promise.all(("rankeds_with_not_played" === filters.songType.id ? Object.values(Object.assign(Object(_utils_js__WEBPACK_IMPORTED_MODULE_8__.convertArrayToObjectByKey)(allPlayedSongs, "leaderboardId"), allRankeds)) : allPlayedSongs.map(s => allRankeds[s.leaderboardId] && !s.stars ? Object.assign({}, s, {
                    stars: allRankeds[s.leaderboardId].stars
                }) : s)).filter(s => (!filters.name.length || filterBySongName(s, filters.name)) && (songIsUnranked(s) && [ "unrankeds", "all" ].includes(filters.songType.id) || "unrankeds" !== filters.songType.id && mapHasStars(s, filters.starsFilter.from, filters.starsFilter.to))).map(async s => {
                    s.bestIdx = null, s.bestRealIdx = null, s.bestAcc = 0, s.bestRealAcc = 0, s.bestScore = 0, 
                    s.bestRealScore = 0, s.bestPp = 0, s.bestRealPp = 0, s.bestDiffPp = 0, s.bestRealDiffPp = 0, 
                    playersSeries.forEach((series, idx) => {
                        if (series.scores[s.leaderboardId]) {
                            const maxScoreExScore = allPlayedSongsObj[s.leaderboardId], maxScoreEx = maxScoreExScore && maxScoreExScore.maxScoreEx ? maxScoreExScore.maxScoreEx : null, scoreMult = series.scores[s.leaderboardId].scoreMult ? series.scores[s.leaderboardId].scoreMult : 1;
                            if (series.scores[s.leaderboardId].acc = maxScoreEx ? series.scores[s.leaderboardId].score / maxScoreEx / scoreMult * 100 : null, 
                            series.scores[s.leaderboardId].diffPp = null, 0 === idx && series.scores[s.leaderboardId].history && series.scores[s.leaderboardId].history.length && (series.prevLabel = "Poprzednio", 
                            [ "pp", "score", "uScore" ].forEach(key => {
                                series.scores[s.leaderboardId]["prev" + Object(_utils_js__WEBPACK_IMPORTED_MODULE_8__.capitalize)(key)] = series.scores[s.leaderboardId].history[0][key];
                            }), series.scores[s.leaderboardId].prevTimeset = new _Common_Date_svelte__WEBPACK_IMPORTED_MODULE_18__.default(series.scores[s.leaderboardId].history[0].timestamp), 
                            series.scores[s.leaderboardId].prevScoreMult = series.scores[s.leaderboardId].prevScore && series.scores[s.leaderboardId].prevUScore ? series.scores[s.leaderboardId].prevScore / series.scores[s.leaderboardId].prevUScore : 1, 
                            series.scores[s.leaderboardId].prevAcc = maxScoreEx ? series.scores[s.leaderboardId].prevScore / maxScoreEx / series.scores[s.leaderboardId].prevScoreMult * 100 : null), 
                            idx > 0) {
                                series.prevLabel = playersSeries[0].name;
                                const playerScoreToCompare = playersSeries[0].scores[s.leaderboardId];
                                [ "acc", "pp", "score", "timeset", "uScore" ].forEach(key => {
                                    series.scores[s.leaderboardId]["prev" + Object(_utils_js__WEBPACK_IMPORTED_MODULE_8__.capitalize)(key)] = playerScoreToCompare ? playerScoreToCompare[key] : null;
                                });
                            }
                        }
                    });
                    const bestIdx = findBestInSeries(playersSeries, s.leaderboardId, !0, "score");
                    if (null !== bestIdx) {
                        const bestSeries = playersSeries[bestIdx].scores[s.leaderboardId], isBestEstimated = playersSeries[bestIdx];
                        if (bestSeries && (bestSeries.best = !isBestEstimated, s.bestIdx = bestIdx, s.bestAcc = bestSeries.acc, 
                        s.bestScore = bestSeries.score, s.bestPp = bestSeries.pp, s.bestDiffPp = bestSeries.diffPp, 
                        s.bestRealIdx = bestIdx, s.bestRealAcc = bestSeries.acc, s.bestRealScore = bestSeries.score, 
                        s.bestRealPp = bestSeries.pp, s.bestRealDiffPp = bestSeries.diffPp), isBestEstimated) {
                            const bestIdx = findBestInSeries(playersSeries, s.leaderboardId, !1, "score");
                            if (null !== bestIdx) {
                                const bestSeries = playersSeries[bestIdx].scores[s.leaderboardId];
                                bestSeries && (bestSeries.best = !0, s.bestRealIdx = bestIdx, s.bestRealAcc = bestSeries.acc, 
                                s.bestRealScore = bestSeries.score, s.bestRealPp = bestSeries.pp, s.bestRealDiffPp = bestSeries.diffPp);
                            }
                        }
                    }
                    if ("rankeds_with_not_played" === filters.songType.id) {
                        for (const idx in playersSeries) {
                            if (playersSeries[0].scores[s.leaderboardId] && playersSeries[0].scores[s.leaderboardId].best) continue;
                            const series = playersSeries[idx];
                            series.scores[s.leaderboardId] && (series.scores[s.leaderboardId].diffPp = series.scores[s.leaderboardId].pp > 0 && 0 !== idx ? await getCachedScoreWithNewPp(playersSeries[0].id, {
                                [s.leaderboardId]: {
                                    pp: series.scores[s.leaderboardId].pp
                                }
                            }) : null);
                        }
                        s.bestIdx && (s.bestDiffPp = playersSeries[s.bestIdx].scores[s.leaderboardId].diffPp), 
                        s.bestRealIdx && (s.bestRealDiffPp = playersSeries[s.bestRealIdx].scores[s.leaderboardId].diffPp);
                    }
                    return s;
                }))).filter(s => "rankeds_with_not_played" !== filters.songType.id || playerIsNotTheBest(s.leaderboardId, playersSeries[0]) && bestSeriesGivesAtLeastMinPpDiff(s, filters.minPpDiff) || "rankeds_with_not_played" === filters.songType.id && nobodyPlayedItYet(s)).sort((songA, songB) => {
                    let a, b;
                    switch (filters.sortBy.type) {
                      case "song":
                        a = songA[filters.sortBy.field], b = songB[filters.sortBy.field];
                        break;

                      case "series":
                      default:
                        const sortIdx = filters.sortBy.subtype, field = filters.sortBy.field;
                        a = playersSeries[sortIdx] && playersSeries[sortIdx].scores && playersSeries[sortIdx].scores[songA.leaderboardId] ? playersSeries[sortIdx].scores[songA.leaderboardId][field] : null, 
                        b = playersSeries[sortIdx] && playersSeries[sortIdx].scores && playersSeries[sortIdx].scores[songB.leaderboardId] ? playersSeries[sortIdx].scores[songB.leaderboardId][field] : null;
                    }
                    return "asc" === filters.sortBy.order ? a - b : b - a;
                });
                let bestTotalRealPp = playersSeries[0].totalPp, bestTotalPp = playersSeries[0].totalPp;
                if ("rankeds_with_not_played" === filters.songType.id) {
                    const filteredSongsIds = filteredSongs.map(s => s.leaderboardId);
                    for (const p of playersSeries) {
                        const betterScores = Object(_utils_js__WEBPACK_IMPORTED_MODULE_8__.convertArrayToObjectByKey)(Object.values(p.scores).filter(s => filteredSongsIds.includes(s.leaderboardId) && (!playersSeries[0].scores[s.leaderboardId] || s.pp > playersSeries[0].scores[s.leaderboardId].pp)).map(s => ({
                            leaderboardId: s.leaderboardId,
                            pp: s.pp
                        })), "leaderboardId");
                        p.totalPp = await getCachedTotalPlayerPp(playerId, betterScores);
                    }
                    snipedIds.length >= 1 && (bestTotalRealPp = 1 === snipedIds.length ? playersSeries[1].totalPp : await getPlayerTotalPpWithBestScores(filteredSongs, "bestRealPp"), 
                    bestTotalPp = 1 === snipedIds.length ? playersSeries[1].totalPp : await getPlayerTotalPpWithBestScores(filteredSongs, "bestPp"));
                }
                return $$invalidate(6, calculating = !1), {
                    songs: filteredSongs,
                    series: playersSeries,
                    bestTotalRealPp: bestTotalRealPp,
                    bestTotalPp: bestTotalPp
                };
            } catch (err) {
                _utils_logger__WEBPACK_IMPORTED_MODULE_1__.default.error(err);
            }
        }
        let shownColumns, columnsQty, selectedCols, shouldCalculateTotalPp, calcPromised, pagedPromised;
        return $$self.$set = $$props => {
            "playerId" in $$props && $$invalidate(0, playerId = $$props.playerId), "snipedIds" in $$props && $$invalidate(26, snipedIds = $$props.snipedIds), 
            "minPpPerMap" in $$props && $$invalidate(27, minPpPerMap = $$props.minPpPerMap);
        }, $$self.$$.update = () => {
            1024 & $$self.$$.dirty[0] && $$invalidate(13, shownColumns = allColumns.filter(c => c.displayed)), 
            1024 & $$self.$$.dirty[0] && (columnsQty = allColumns.reduce((sum, c) => sum + (c.isColumn && c.selected ? 1 : 0), 0)), 
            1024 & $$self.$$.dirty[0] && $$invalidate(14, selectedCols = allColumns.filter(c => c.isColumn && c.selected)), 
            1056 & $$self.$$.dirty[0] && $$invalidate(15, shouldCalculateTotalPp = getObjectFromArrayByKey(allColumns, "diffPp").selected && "rankeds_with_not_played" === allFilters.songType.id), 
            335544353 & $$self.$$.dirty[0] && $$invalidate(32, calcPromised = initialized ? calculate(playerId, snipedIds.concat(snipedIds.length || "rankeds_with_not_played" !== allFilters.songType.id ? [] : sniperModeIds), allFilters) : null), 
            384 & $$self.$$.dirty[0] | 2 & $$self.$$.dirty[1] && $$invalidate(16, pagedPromised = promiseGetPage(calcPromised, currentPage, itemsPerPage));
        }, [ playerId, lightMode, minStarsForSniper, maxStars, sortTypes, allFilters, calculating, currentPage, itemsPerPage, pagerTotal, allColumns, viewType, songsPage, shownColumns, selectedCols, shouldCalculateTotalPp, pagedPromised, songTypes, itemsPerPageList, viewTypes, getObjectFromArrayByKey, function(series, song, key, prev = !1) {
            const valueKey = prev ? "prev" + Object(_utils_js__WEBPACK_IMPORTED_MODULE_8__.capitalize)(key) : key;
            return series.scores && series.scores[song.leaderboardId] && series.scores[song.leaderboardId][valueKey] ? series.scores[song.leaderboardId][valueKey] : null;
        }, async function() {
            switch (allFilters.songType.id) {
              case "unrankeds":
                getObjectFromArrayByKey(allColumns, "score").selected = !0, getObjectFromArrayByKey(allColumns, "acc").selected = !0, 
                getObjectFromArrayByKey(allColumns, "pp").selected = !1, getObjectFromArrayByKey(allColumns, "diffPp").selected = !1, 
                getObjectFromArrayByKey(allColumns, "diffPp").displayed = !1, generateSortTypes();
                break;

              case "all":
                getObjectFromArrayByKey(allColumns, "score").selected = !0, getObjectFromArrayByKey(allColumns, "acc").selected = !0, 
                getObjectFromArrayByKey(allColumns, "pp").selected = !0, getObjectFromArrayByKey(allColumns, "diffPp").selected = !1, 
                getObjectFromArrayByKey(allColumns, "diffPp").displayed = !1, $$invalidate(5, allFilters.starsFilter.from = 0, allFilters), 
                generateSortTypes();
                break;

              case "rankeds_with_not_played":
                getObjectFromArrayByKey(allColumns, "score").selected = !1, getObjectFromArrayByKey(allColumns, "acc").selected = !0, 
                getObjectFromArrayByKey(allColumns, "pp").selected = !0, getObjectFromArrayByKey(allColumns, "diffPp").selected = !0, 
                getObjectFromArrayByKey(allColumns, "diffPp").displayed = !0, $$invalidate(5, allFilters.starsFilter.from = allFilters.starsFilter.from > minStarsForSniper ? allFilters.starsFilter.from : Object(_utils_format__WEBPACK_IMPORTED_MODULE_21__.round)(minStarsForSniper, 1), allFilters), 
                generateSortTypes();
                break;

              case "rankeds":
              default:
                getObjectFromArrayByKey(allColumns, "score").selected = !1, getObjectFromArrayByKey(allColumns, "acc").selected = !0, 
                getObjectFromArrayByKey(allColumns, "pp").selected = !0, getObjectFromArrayByKey(allColumns, "diffPp").selected = !1, 
                getObjectFromArrayByKey(allColumns, "diffPp").displayed = !1, $$invalidate(5, allFilters.starsFilter.from = 0, allFilters), 
                generateSortTypes();
            }
            $$invalidate(7, currentPage = 0), $$invalidate(10, allColumns = allColumns.splice(0)), 
            forceFiltersChanged();
        }, onFilterNameChange, onFilterStarsChange, onFilterMinPlusPpChanged, snipedIds, minPpPerMap, initialized, countryRanking, allRankeds, columnsQty, calcPromised, sniperModeIds, generateSortTypes, (type, subtype, field) => sortTypes.find(st => st.type === type && st.subtype === subtype && st.field === field), forceFiltersChanged, getAllScoresByType, getCachedAllScoresByType, getMinStars, getCachedMinStars, getMaxScoreExFromPlayersScores, getCachedMaxScoreExFromPlayersScores, getCachedTotalPlayerPp, getScoreWithNewPp, getCachedScoreWithNewPp, getPlayerSongEstimate, getCachedPlayerSongEstimate, getSeriesSong, findBestInSeries, getPlayerTotalPpWithBestScores, mapHasStars, filterBySongName, songIsUnranked, bestSeriesGivesAtLeastMinPpDiff, (leaderboardId, series) => !getSeriesSong(leaderboardId, series), playerIsNotTheBest, nobodyPlayedItYet, (leaderboardId, playerSeries, estSeries, minDiff = 1) => {
            const playerScore = getSeriesSong(leaderboardId, playerSeries), estScore = getSeriesSong(leaderboardId, estSeries);
            return !playerScore || estScore && playerScore.acc < estScore.acc && estScore.diff > minDiff;
        }, completeFetchingNewPage, promiseGetPage, calculate, function() {
            allFilters.songType = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.select_value)(this), 
            $$invalidate(5, allFilters), $$invalidate(17, songTypes);
        }, function() {
            viewType = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.select_value)(this), 
            $$invalidate(11, viewType), $$invalidate(19, viewTypes);
        }, function(col) {
            col.selected = this.checked, $$invalidate(13, shownColumns), $$invalidate(10, allColumns);
        }, function() {
            allFilters.sortBy = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.select_value)(this), 
            $$invalidate(5, allFilters), $$invalidate(17, songTypes);
        }, function() {
            itemsPerPage = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.select_value)(this), 
            $$invalidate(8, itemsPerPage), $$invalidate(18, itemsPerPageList);
        }, function(value) {
            currentPage = value, $$invalidate(7, currentPage);
        }, function(value) {
            itemsPerPage = value, $$invalidate(8, itemsPerPage);
        } ];
    }
    class Browser extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document_1.getElementById("svelte-1bvl7gs-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-1bvl7gs-style", 
            style.textContent = ".columns.svelte-1bvl7gs label.svelte-1bvl7gs{margin-right:.25rem}table.ranking.sspl.svelte-1bvl7gs.svelte-1bvl7gs{font-size:0.875rem;border-width:1px}th.svelte-1bvl7gs.svelte-1bvl7gs,td.svelte-1bvl7gs.svelte-1bvl7gs{vertical-align:middle !important;padding:0.25em !important;border-color:#666 !important}thead.svelte-1bvl7gs th.svelte-1bvl7gs{text-align:center;vertical-align:bottom !important;border-bottom-width:2px}thead.svelte-1bvl7gs th.song.svelte-1bvl7gs,thead.svelte-1bvl7gs th.stars.svelte-1bvl7gs{vertical-align:middle !important}thead.svelte-1bvl7gs th.song.svelte-1bvl7gs,thead.svelte-1bvl7gs th.maxPp.svelte-1bvl7gs{vertical-align:middle !important}th.diff.svelte-1bvl7gs.svelte-1bvl7gs,td.diff.svelte-1bvl7gs.svelte-1bvl7gs{width:1.5rem;padding:0}thead.svelte-1bvl7gs th.series.svelte-1bvl7gs{width:6rem;overflow-x:hidden;border-bottom-style:dotted;border-bottom-width:1px}thead.svelte-1bvl7gs th.stars.svelte-1bvl7gs{width:2rem}thead.svelte-1bvl7gs th.maxPp.svelte-1bvl7gs{width:3rem}thead.svelte-1bvl7gs th.acc.svelte-1bvl7gs,thead.svelte-1bvl7gs th.pp.svelte-1bvl7gs,thead.svelte-1bvl7gs th.diffPp.svelte-1bvl7gs,thead.svelte-1bvl7gs th.score.svelte-1bvl7gs,thead.svelte-1bvl7gs th.weightedPp.svelte-1bvl7gs{width:3rem}thead.svelte-1bvl7gs th.timeset.svelte-1bvl7gs{width:5.5rem}tbody.svelte-1bvl7gs td.acc.svelte-1bvl7gs,tbody.svelte-1bvl7gs td.pp.svelte-1bvl7gs,tbody.svelte-1bvl7gs td.diffPp.svelte-1bvl7gs,tbody.svelte-1bvl7gs td.score.svelte-1bvl7gs,tbody.svelte-1bvl7gs td.weightedPp.svelte-1bvl7gs,tbody.svelte-1bvl7gs td.timeset.svelte-1bvl7gs{text-align:center}tbody.svelte-1bvl7gs td.stars.svelte-1bvl7gs{text-align:center}tbody.svelte-1bvl7gs td.maxPp.svelte-1bvl7gs{text-align:center}th.top.svelte-1bvl7gs.svelte-1bvl7gs,td.top.svelte-1bvl7gs.svelte-1bvl7gs{border-top-style:solid;border-top-width:1px}td.down.svelte-1bvl7gs.svelte-1bvl7gs{border-bottom-style:solid;border-bottom-width:1px}th.series.down.svelte-1bvl7gs.svelte-1bvl7gs{border-bottom-width:2px;border-bottom-style:solid}th.left.svelte-1bvl7gs.svelte-1bvl7gs,td.left.svelte-1bvl7gs.svelte-1bvl7gs{border-left-style:solid;border-left-width:1px}th.left.middle.svelte-1bvl7gs.svelte-1bvl7gs,td.left.middle.svelte-1bvl7gs.svelte-1bvl7gs{border-left-style:dotted;border-left-width:1px}tbody.svelte-1bvl7gs td.song figure.svelte-1bvl7gs{display:flex;justify-content:flex-start;align-items:center;margin:0}tbody.svelte-1bvl7gs td.song img.svelte-1bvl7gs{flex:0 1 40px;width:40px;height:40px;margin:0 1em 0 .5em}tbody.svelte-1bvl7gs td.song .songinfo.svelte-1bvl7gs{text-align:left}tbody.svelte-1bvl7gs td.song small.svelte-1bvl7gs{font-size:0.75em;color:#888}tfoot.svelte-1bvl7gs th.svelte-1bvl7gs{text-align:center !important;vertical-align:middle !important;border-top-width:2px}tfoot.svelte-1bvl7gs th.song.svelte-1bvl7gs{text-align:left !important}tbody.svelte-1bvl7gs td.svelte-1bvl7gs{position:relative}tbody.svelte-1bvl7gs td.best.svelte-1bvl7gs{background:linear-gradient(90deg, rgba(51, 51, 51, 1) 0%, rgba(85, 85, 85, 1) 50%, rgba(51, 51, 51, 1) 100%)}table.light.svelte-1bvl7gs tbody td.best.svelte-1bvl7gs{background:linear-gradient(90deg, rgba(201, 201, 201, 1) 0%, rgba(255, 255, 255, 1) 50%, rgba(201, 201, 201, 1) 100%)}tbody.svelte-1bvl7gs td.compact.svelte-1bvl7gs{width:12rem;text-align:center}tbody.svelte-1bvl7gs td.compact.left.series-1.svelte-1bvl7gs:not(.with-cols){border-left:none}.compact-timeset-val.svelte-1bvl7gs.svelte-1bvl7gs{border-bottom:1px dashed #666}.compact-diffPp-val.svelte-1bvl7gs.svelte-1bvl7gs{font-size:1.25em}.compact-pp-val.svelte-1bvl7gs.svelte-1bvl7gs{font-size:1.15em;color:var(--ppColour) !important}.compact-acc-val.svelte-1bvl7gs.svelte-1bvl7gs{font-size:1.1em}.filters.svelte-1bvl7gs.svelte-1bvl7gs{display:flex;flex-wrap:wrap;margin:-1.5rem 0 1rem -1.5rem;width:calc(100% + 1.5rem);align-items:flex-end}.filters.svelte-1bvl7gs.svelte-1bvl7gs>*{margin:1.5rem 0 0 1.5rem}.filters.svelte-1bvl7gs header.svelte-1bvl7gs{display:block;text-align:center;color:#888}.filters.svelte-1bvl7gs .filter-name.svelte-1bvl7gs{width:12rem}.filters.svelte-1bvl7gs .filter-name input.svelte-1bvl7gs{width:100%}div.info.svelte-1bvl7gs.svelte-1bvl7gs{padding-top:2rem;text-align:center}select.svelte-1bvl7gs.svelte-1bvl7gs,input.svelte-1bvl7gs.svelte-1bvl7gs{font-size:1rem;border:none;color:var(--textColor, #000);background-color:var(--foreground, #fff);outline:none}input.svelte-1bvl7gs.svelte-1bvl7gs{border-bottom:1px solid var(--textColor, #000)}input.svelte-1bvl7gs.svelte-1bvl7gs::placeholder{color:#666;opacity:1}", 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document_1.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                playerId: 0,
                snipedIds: 26,
                minPpPerMap: 27
            }, [ -1, -1, -1, -1 ]);
        }
    }
    __webpack_exports__.default = Browser;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    __webpack_exports__.default = (callback, wait) => {
        var timeout;
        return function() {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
            var context = void 0;
            clearTimeout(timeout), timeout = setTimeout(() => callback.apply(context, args), wait);
        };
    };
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
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
    __webpack_require__.r(__webpack_exports__), __webpack_exports__.default = function(promiseFunc) {
        var cache = {};
        return _asyncToGenerator((function*() {
            var key = JSON.stringify(arguments);
            return cache[key] = cache[key] || promiseFunc.apply(this, arguments), cache[key];
        }));
    };
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(43);
    function get_each_context(ctx, list, i) {
        const child_ctx = ctx.slice();
        return child_ctx[19] = list[i], child_ctx;
    }
    function create_if_block(ctx) {
        let nav, div, t0, t1, t2, t3, t4, t5, ul, t6, t7, if_block0 = ctx[3] && create_if_block_2(ctx), each_value = ctx[6], each_blocks = [];
        for (let i = 0; i < each_value.length; i += 1) each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
        let if_block1 = ctx[4] && create_if_block_1(ctx);
        return {
            c() {
                nav = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("nav"), div = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[7]), t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(" - "), 
                t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[8]), t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(" / "), 
                t4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[1]), t5 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                ul = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("ul"), if_block0 && if_block0.c(), 
                t6 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
                t7 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), if_block1 && if_block1.c(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(ul, "class", "pagination-list svelte-1xz6d9m"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(nav, "class", "pagination svelte-1xz6d9m");
            },
            m(target, anchor) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, nav, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(nav, div), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, t0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, t1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, t2), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, t3), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, t4), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(nav, t5), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(nav, ul), 
                if_block0 && if_block0.m(ul, null), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(ul, t6);
                for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(ul, null);
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(ul, t7), if_block1 && if_block1.m(ul, null);
            },
            p(ctx, dirty) {
                if (128 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t0, ctx[7]), 
                256 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t2, ctx[8]), 
                2 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t4, ctx[1]), 
                ctx[3] ? if_block0 ? if_block0.p(ctx, dirty) : (if_block0 = create_if_block_2(ctx), 
                if_block0.c(), if_block0.m(ul, t6)) : if_block0 && (if_block0.d(1), if_block0 = null), 
                577 & dirty) {
                    let i;
                    for (each_value = ctx[6], i = 0; i < each_value.length; i += 1) {
                        const child_ctx = get_each_context(ctx, each_value, i);
                        each_blocks[i] ? each_blocks[i].p(child_ctx, dirty) : (each_blocks[i] = create_each_block(child_ctx), 
                        each_blocks[i].c(), each_blocks[i].m(ul, t7));
                    }
                    for (;i < each_blocks.length; i += 1) each_blocks[i].d(1);
                    each_blocks.length = each_value.length;
                }
                ctx[4] ? if_block1 ? if_block1.p(ctx, dirty) : (if_block1 = create_if_block_1(ctx), 
                if_block1.c(), if_block1.m(ul, null)) : if_block1 && (if_block1.d(1), if_block1 = null);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(nav), if_block0 && if_block0.d(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_each)(each_blocks, detaching), 
                if_block1 && if_block1.d();
            }
        };
    }
    function create_if_block_2(ctx) {
        let li0, a, t0, a_class_value, li0_data_page_value, t1, li1, dispose;
        return {
            c() {
                li0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("li"), a = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("a"), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)("1"), t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                li1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("li"), li1.innerHTML = '<span class="pagination-ellipsis">…</span>', 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "href", "#"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "class", a_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("pagination-link" + (0 === ctx[0] ? " is-current" : "")) + " svelte-1xz6d9m"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(li0, "data-page", li0_data_page_value = 0);
            },
            m(target, anchor, remount) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, li0, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(li0, a), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(a, t0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, li1, anchor), 
                remount && dispose(), dispose = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(a, "click", Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.prevent_default)(ctx[16]));
            },
            p(ctx, dirty) {
                1 & dirty && a_class_value !== (a_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("pagination-link" + (0 === ctx[0] ? " is-current" : "")) + " svelte-1xz6d9m") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "class", a_class_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(li0), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(li1), dispose();
            }
        };
    }
    function create_each_block(ctx) {
        let li, a, t, a_class_value, li_data_page_value, dispose, t_value = ctx[19] + "";
        function click_handler_1(...args) {
            return ctx[17](ctx[19], ...args);
        }
        return {
            c() {
                li = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("li"), a = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("a"), 
                t = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t_value), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "href", "#"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "class", a_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("pagination-link" + (ctx[0] === ctx[19] - 1 ? " is-current" : "")) + " svelte-1xz6d9m"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(li, "data-page", li_data_page_value = ctx[19]);
            },
            m(target, anchor, remount) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, li, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(li, a), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(a, t), 
                remount && dispose(), dispose = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(a, "click", Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.prevent_default)(click_handler_1));
            },
            p(new_ctx, dirty) {
                ctx = new_ctx, 64 & dirty && t_value !== (t_value = ctx[19] + "") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t, t_value), 
                65 & dirty && a_class_value !== (a_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("pagination-link" + (ctx[0] === ctx[19] - 1 ? " is-current" : "")) + " svelte-1xz6d9m") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "class", a_class_value), 
                64 & dirty && li_data_page_value !== (li_data_page_value = ctx[19]) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(li, "data-page", li_data_page_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(li), dispose();
            }
        };
    }
    function create_if_block_1(ctx) {
        let li0, t1, li1, a, t2, a_class_value, li1_data_page_value, dispose;
        return {
            c() {
                li0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("li"), li0.innerHTML = '<span class="pagination-ellipsis">…</span>', 
                t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), li1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("li"), 
                a = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("a"), t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[5]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "href", "#"), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "class", a_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("pagination-link" + (ctx[0] === ctx[5] - 1 ? " is-current" : "")) + " svelte-1xz6d9m"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(li1, "data-page", li1_data_page_value = ctx[5] - 1);
            },
            m(target, anchor, remount) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, li0, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, t1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, li1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(li1, a), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(a, t2), 
                remount && dispose(), dispose = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(a, "click", Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.prevent_default)(ctx[18]));
            },
            p(ctx, dirty) {
                32 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t2, ctx[5]), 
                33 & dirty && a_class_value !== (a_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)("pagination-link" + (ctx[0] === ctx[5] - 1 ? " is-current" : "")) + " svelte-1xz6d9m") && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(a, "class", a_class_value), 
                32 & dirty && li1_data_page_value !== (li1_data_page_value = ctx[5] - 1) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(li1, "data-page", li1_data_page_value);
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(li0), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(t1), 
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(li1), dispose();
            }
        };
    }
    function create_fragment(ctx) {
        let if_block_anchor, if_block = ctx[5] > 1 && !ctx[2] && create_if_block(ctx);
        return {
            c() {
                if_block && if_block.c(), if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
            },
            m(target, anchor) {
                if_block && if_block.m(target, anchor), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, if_block_anchor, anchor);
            },
            p(ctx, [dirty]) {
                ctx[5] > 1 && !ctx[2] ? if_block ? if_block.p(ctx, dirty) : (if_block = create_if_block(ctx), 
                if_block.c(), if_block.m(if_block_anchor.parentNode, if_block_anchor)) : if_block && (if_block.d(1), 
                if_block = null);
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                if_block && if_block.d(detaching), detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(if_block_anchor);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        const dispatch = Object(svelte__WEBPACK_IMPORTED_MODULE_1__.createEventDispatcher)();
        let {totalItems: totalItems = 0} = $$props, {currentPage: currentPage = 0} = $$props, {itemsPerPage: itemsPerPage = 10} = $$props, {displayMax: displayMax = 11} = $$props, {hide: hide = !1} = $$props, displayStart = !1, displayEnd = !1;
        function dispatchEvent(initial = !1) {
            let to = (currentPage + 1) * itemsPerPage - 1;
            to > totalItems - 1 && (to = totalItems - 1), dispatch("page-changed", {
                currentPage: currentPage,
                itemsPerPage: itemsPerPage,
                from: currentPage * itemsPerPage,
                to: to,
                total: totalItems,
                initial: initial
            });
        }
        function onPageChanged(page) {
            $$invalidate(0, currentPage = page), dispatchEvent(!1);
        }
        function calcPages(total, current, max) {
            const needToDisplayFacetedPages = total > max, middle = Math.floor(max / 2), startPage = current > middle && needToDisplayFacetedPages ? current - middle + 1 : 0;
            return $$invalidate(3, displayStart = current > middle && needToDisplayFacetedPages), 
            $$invalidate(4, displayEnd = current + middle + 1 < total && needToDisplayFacetedPages), 
            currentPage > pagesTotal - 1 && $$invalidate(0, currentPage = pagesTotal - 1), currentPage < 0 && $$invalidate(0, currentPage = 0), 
            allPages.slice(startPage - (needToDisplayFacetedPages && !displayEnd ? middle - total + current + 1 : 0), startPage + max - (displayStart ? 1 : 0) - (displayEnd ? 1 : 0));
        }
        Object(svelte__WEBPACK_IMPORTED_MODULE_1__.onMount)(() => {
            dispatchEvent(!0);
        });
        let pagesTotal, allPages, displayedPages, startItem, endItem;
        return $$self.$set = $$props => {
            "totalItems" in $$props && $$invalidate(1, totalItems = $$props.totalItems), "currentPage" in $$props && $$invalidate(0, currentPage = $$props.currentPage), 
            "itemsPerPage" in $$props && $$invalidate(10, itemsPerPage = $$props.itemsPerPage), 
            "displayMax" in $$props && $$invalidate(11, displayMax = $$props.displayMax), "hide" in $$props && $$invalidate(2, hide = $$props.hide);
        }, $$self.$$.update = () => {
            1026 & $$self.$$.dirty && $$invalidate(5, pagesTotal = Math.ceil(totalItems / itemsPerPage)), 
            32 & $$self.$$.dirty && (allPages = Array(pagesTotal).fill(null).map((val, idx) => idx + 1)), 
            2081 & $$self.$$.dirty && $$invalidate(6, displayedPages = calcPages(pagesTotal, currentPage, displayMax)), 
            1025 & $$self.$$.dirty && $$invalidate(7, startItem = currentPage * itemsPerPage + 1), 
            1027 & $$self.$$.dirty && $$invalidate(8, endItem = function(currentPage, itemsPerPage, totalItems) {
                const end = (currentPage + 1) * itemsPerPage;
                return end > totalItems ? totalItems : end;
            }(currentPage, itemsPerPage, totalItems));
        }, [ currentPage, totalItems, hide, displayStart, displayEnd, pagesTotal, displayedPages, startItem, endItem, onPageChanged, itemsPerPage, displayMax, allPages, dispatch, dispatchEvent, calcPages, () => onPageChanged(0), page => onPageChanged(page - 1), () => onPageChanged(pagesTotal - 1) ];
    }
    class Pager extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-1xz6d9m-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-1xz6d9m-style", 
            style.textContent = ".pagination.svelte-1xz6d9m{margin-top:1rem}.pagination-list.svelte-1xz6d9m{max-width:none !important;justify-content:center;margin-top:0}.pagination-link.svelte-1xz6d9m:focus{border-color:#dbdbdb !important}", 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                totalItems: 1,
                currentPage: 0,
                itemsPerPage: 10,
                displayMax: 11,
                hide: 2
            });
        }
    }
    __webpack_exports__.default = Pager;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(43), _Value_svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(30);
    function create_fragment(ctx) {
        let div1, span, t0, t1, t2, div0, input, div1_class_value, current, dispose;
        const value_1 = new _Value_svelte__WEBPACK_IMPORTED_MODULE_2__.default({
            props: {
                value: ctx[0],
                suffix: ctx[5]
            }
        });
        return {
            c() {
                div1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(ctx[1]), t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(value_1.$$.fragment), 
                t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), div0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), 
                input = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("input"), input.disabled = ctx[6], 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "type", "range"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "min", ctx[2]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "max", ctx[3]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "step", ctx[4]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div1, "class", div1_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)(ctx[6] ? "disabled" : "") + " svelte-fg084q");
            },
            m(target, anchor, remount) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div1, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, span), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(span, t1), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(value_1, span, null), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, t2), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div1, div0), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div0, input), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_input_value)(input, ctx[0]), 
                current = !0, remount && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.run_all)(dispose), 
                dispose = [ Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(input, "change", ctx[9]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(input, "input", ctx[9]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(input, "input", ctx[7]) ];
            },
            p(ctx, [dirty]) {
                (!current || 2 & dirty) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data)(t0, ctx[1]);
                const value_1_changes = {};
                1 & dirty && (value_1_changes.value = ctx[0]), 32 & dirty && (value_1_changes.suffix = ctx[5]), 
                value_1.$set(value_1_changes), (!current || 64 & dirty) && (input.disabled = ctx[6]), 
                (!current || 4 & dirty) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "min", ctx[2]), 
                (!current || 8 & dirty) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "max", ctx[3]), 
                (!current || 16 & dirty) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input, "step", ctx[4]), 
                1 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_input_value)(input, ctx[0]), 
                (!current || 64 & dirty && div1_class_value !== (div1_class_value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.null_to_empty)(ctx[6] ? "disabled" : "") + " svelte-fg084q")) && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(div1, "class", div1_class_value);
            },
            i(local) {
                current || (Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(value_1.$$.fragment, local), 
                current = !0);
            },
            o(local) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(value_1.$$.fragment, local), 
                current = !1;
            },
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(value_1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.run_all)(dispose);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        const dispatch = Object(svelte__WEBPACK_IMPORTED_MODULE_1__.createEventDispatcher)();
        let {label: label = ""} = $$props, {value: value = 0} = $$props, {min: min = 0} = $$props, {max: max = 100} = $$props, {step: step = 1} = $$props, {suffix: suffix = ""} = $$props, {disabled: disabled = !1} = $$props;
        return $$self.$set = $$props => {
            "label" in $$props && $$invalidate(1, label = $$props.label), "value" in $$props && $$invalidate(0, value = $$props.value), 
            "min" in $$props && $$invalidate(2, min = $$props.min), "max" in $$props && $$invalidate(3, max = $$props.max), 
            "step" in $$props && $$invalidate(4, step = $$props.step), "suffix" in $$props && $$invalidate(5, suffix = $$props.suffix), 
            "disabled" in $$props && $$invalidate(6, disabled = $$props.disabled);
        }, [ value, label, min, max, step, suffix, disabled, function() {
            dispatch("change", value);
        }, dispatch, function() {
            value = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.to_number)(this.value), 
            $$invalidate(0, value);
        } ];
    }
    class Range extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-fg084q-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-fg084q-style", 
            style.textContent = ".disabled.svelte-fg084q{color:#888}", Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                label: 1,
                value: 0,
                min: 2,
                max: 3,
                step: 4,
                suffix: 5,
                disabled: 6
            });
        }
    }
    __webpack_exports__.default = Range;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2), svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(43);
    function create_fragment(ctx) {
        let div, input0, t0, span, t2, input1, dispose;
        return {
            c() {
                div = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("div"), input0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("input"), 
                t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), span = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("span"), 
                span.textContent = "do", t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)(), 
                input1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("input"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input0, "type", "number"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input0, "min", ctx[1]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input0, "max", ctx[2]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input0, "step", ctx[3]), 
                input0.disabled = ctx[4], Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input0, "class", "svelte-mxs8t2"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input1, "type", "number"), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input1, "min", ctx[1]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input1, "max", ctx[2]), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input1, "step", ctx[3]), 
                input1.disabled = ctx[4], Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input1, "class", "svelte-mxs8t2");
            },
            m(target, anchor, remount) {
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert)(target, div, anchor), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, input0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_input_value)(input0, ctx[0].from), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, t0), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, span), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, t2), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(div, input1), 
                Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_input_value)(input1, ctx[0].to), 
                remount && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.run_all)(dispose), 
                dispose = [ Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(input0, "input", ctx[9]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(input0, "input", ctx[10]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(input0, "keydown", ctx[6]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(input1, "input", ctx[11]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(input1, "input", ctx[12]), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.listen)(input1, "keydown", ctx[6]) ];
            },
            p(ctx, [dirty]) {
                2 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input0, "min", ctx[1]), 
                4 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input0, "max", ctx[2]), 
                8 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input0, "step", ctx[3]), 
                16 & dirty && (input0.disabled = ctx[4]), 1 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.to_number)(input0.value) !== ctx[0].from && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_input_value)(input0, ctx[0].from), 
                2 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input1, "min", ctx[1]), 
                4 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input1, "max", ctx[2]), 
                8 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr)(input1, "step", ctx[3]), 
                16 & dirty && (input1.disabled = ctx[4]), 1 & dirty && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.to_number)(input1.value) !== ctx[0].to && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_input_value)(input1, ctx[0].to);
            },
            i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
            d(detaching) {
                detaching && Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach)(div), Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.run_all)(dispose);
            }
        };
    }
    function instance($$self, $$props, $$invalidate) {
        const dispatch = Object(svelte__WEBPACK_IMPORTED_MODULE_1__.createEventDispatcher)();
        let {min: min = 0} = $$props, {max: max = 100} = $$props, {value: value = {
            from: min,
            to: max
        }} = $$props, {step: step = 1} = $$props, {disabled: disabled = !1} = $$props, {disableDirectEditing: disableDirectEditing = !0} = $$props;
        function onChange() {
            dispatch("change", value);
        }
        return $$self.$set = $$props => {
            "min" in $$props && $$invalidate(1, min = $$props.min), "max" in $$props && $$invalidate(2, max = $$props.max), 
            "value" in $$props && $$invalidate(0, value = $$props.value), "step" in $$props && $$invalidate(3, step = $$props.step), 
            "disabled" in $$props && $$invalidate(4, disabled = $$props.disabled), "disableDirectEditing" in $$props && $$invalidate(7, disableDirectEditing = $$props.disableDirectEditing);
        }, [ value, min, max, step, disabled, onChange, function(e) {
            disableDirectEditing && ![ "ArrowUp", "ArrowDown", "Tab", "F5" ].includes(e.key) && e.preventDefault();
        }, disableDirectEditing, dispatch, function() {
            value.from = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.to_number)(this.value), 
            $$invalidate(0, value);
        }, e => {
            $$invalidate(0, value.from = value.from ? value.from > value.to ? value.to : value.from : min, value), 
            onChange();
        }, function() {
            value.to = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.to_number)(this.value), 
            $$invalidate(0, value);
        }, e => {
            $$invalidate(0, value.to = value.to ? value.to < value.from ? value.from : value.to : max, value), 
            onChange();
        } ];
    }
    class MultiRange extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponent {
        constructor(options) {
            var style;
            super(), document.getElementById("svelte-mxs8t2-style") || ((style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("style")).id = "svelte-mxs8t2-style", 
            style.textContent = "input[type=number].svelte-mxs8t2{width:3rem;text-align:center}", 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append)(document.head, style)), 
            Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {
                min: 1,
                max: 2,
                value: 0,
                step: 3,
                disabled: 4,
                disableDirectEditing: 7
            });
        }
    }
    __webpack_exports__.default = MultiRange;
}, function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.r(__webpack_exports__), __webpack_exports__.default = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAYCAYAAAACqyaBAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5AUGEAksU7ZXQgAAAAFvck5UAc+id5oAAAmGSURBVEjHZdXpc5SHYcfx73Ps8zx7a3UskkAckpCELK0kHJAMSDEGQzCGOnISEjtXDzeexu2LdpLpZPqimabNJJ1hJtNm2pmYxI7DTA7bIBibwxTLBmIjTskWQhwSrM5d7Wp3tcez++xz9EVmMqX5/QOf+b36Chc++IAdAwP86/e/z5l33+XCyAgA/9j6Gb73QGCsdIU7b/yyPbkY65+ZiTpz0RkW5mdZisXIZ1dwLAdJkgWXpjrByiqhvmHNUuTxx+90b+tdem7fgaX+2ga770ufR89mefW11/i/ExzHIewP8J+vHQm9cfRo9bq167pk23kuNTfvTYzfdcRYUthYGd7gD4W6ynoRo6DjVCtInQqCpGPnLYzrJna8gKi4cCmujIgQTWOlc+HAgrdlwy+ae7ecTUZn7H8/fPhRvNal8fyff/1AdGLyFTOW7K20RWX97n53S1Mz9vg9vOk81R9PEiqYSKKIK6zg/tZTCPt24XYLCKZB7rcTlF49iZ3OYmFj4GBVB5neVM9v83P3Mlb5gEuSbv/3kSOsW7/+j7j8m3KRH3x89aXtD1b2bNu8hca9nyW8YwvZDau4dfsWNV4/80fexH3iCi7HRtuqoDRNYVpNWHTjrVmH9VQ19tAlSOcQfT60p7bi//I+Gjc2cP6H/7Lhk3Pnwslk4raqqo88FwfYS2lp2e6vWUuktY3a5/agRlopFnUkQWAhk8LZ+TiBwV0Ifi+O3IEx34UTS+LKnEUy57D9PlbcMvftArFdPSj/9BKuXX2IlRVUhELiwcHBrclcntq6OurDYYxSiffOnEHGlUGpqjCSq2pw79lGKZ3ho/u3mZy6TyhUQXNzM3XtHfh6enEyOcoTc9iTCYSgQ/mlvVg1GvfnoxzXcjxoUrh/8Tg7/8Pgb779CtU1NVRUhATNrR38yeHD5xPJ5I6qqqoPXYoyurGlxZFcfz2IUF3RuXHfUwPtz+4R3h+7zrGhY3ww/D6/PnoUnz/A9m39KOEqhKCX0olh7KlZRFPGs3cfwvp1vPb6z0kIZSy/hwuXLnJ3cpKOzi5aWlu5fu0q+XyuYmFhYX8yvvTC3VsT3e+dOTt05fLlgnjy7bepCoXimflFs5TK8P7wMLcnb5NMJBBFkasjV5i6P00hV0B8rBnXY82guNAGd+Hu7cA2LWKLcY69+TveOX4ct6qiaRrx+BKZ1Aq2DQ8fPgy2trY1/f03/hJv0epJrKT+7MALh4Ly5fgszwQC6ooqCYJbxe124/P62P/Ms3g8XgLBILlsjlLJQDZtkGWUlnWoe7ZhuzXI67RsaCIgq9g+Hz6/n1XhOmrDdZhlE5csMz01RV/fE/iDQdpC1erE9Rs/OvzKPxyQASzHzjiqyxYDXp58cicvvPgioVCI2EIcl6JQKBTJzcySf+8jjGIO+eVBynUhrIVFSqUyfY9FaN7+LP5IK0JvhKLtEIl0oSgKW3t7CQT9RLq6Kbplvvl3f8v0j39WefjciYPy4I4nmZmayje0R2yXYVG3up7Tp09jm2Xcbg/lkoHl2GSno0yfHqautZma6ATG5A1kVSWXSuOSZWTRwHVrHEMsYsoSwUCATe3tdPf00L25B6NkMDF6E3sujVeU8SMiF1vXKM6lTz4f6dqhOaaJqqq89ebv8GgqX/nqi+wY2I4/EOTE229zKjPLK33P88I3vkY2k0Fze0gnkuRLOotPLDExfot3hoZILafYuXMXoiSRzeYRRRFNU6jxBWD+Dr50gYgSQNYnH+zc09GzteWJreDRqKKGp5/ew8TEOOVymVBliIqKEM8cPEiouobOSIT61ath9WrAYV3jem59+ill0yAU8CMIAvv272djSwuqpqIBRb2EXtTRKoOEGtbwIH2acdVCGmjrOPnc4GDz6qZGiskMks/HY5FOvB4PmUwGQRCorq6mtq6ezkgntXW1SJKM4wAI4IBRKlIoFBAEh7q6NTz//JcIh8OUjTKaW6OUL6BPz4JeYhydK4tR/WE+MyT8qLnP+cLGLqSeNjx7tqF2tKB43WRXskQfPuTKyAgLC3OoLhd+QUK0wevzIiouFE0js5TATKRIFXWatveybfsOvF4/Hq+bXDaPKIkk4nGmr960b545N3fXLpy5PXXvLbOgj8g9WgVKYwNxr0J5KsqaSBumYSJLMo2NzTQ0rCWTyTA9Nc1yNIq0mCBbKDITncXl1mhau55w7RrqQ1VUPfEZPBUBVtJZCnkd0zS5NPwhly5dXMjrhZ+uaqh615uVP7138lY5sqkd+Wo6NlVz+kJjwacQ/Odvg1vFSq1g5Aq4QgFUTaNGUamsqkJoaUNxSRhelVQqDQ5UVlYRCgWwYssYLgldLyJKIpIkIYkiD6en7fPn3vtObW390ab6NaSTy1y7O8lHFy4i313l/XHLVOx7/sp1a0urazDSOfSL13E2NSKKEiKgZ3NgWgj3oihbOlH8Hnz+IDgOtmNjOVCWRYyPx8j7PGiNa1Arg4CDJIj2Uix+z7Zsfn91hJOnTvHTI6/+oWrZr+5+9UaV61v/4y2/np5dyOTeOEE5kaKUyiCVy9hFA/P+DPrlMURVoSgKlIsGRr6AgI1glHFsG0vTsGwbxu9hxZKIgD0bw86sWI4sCaZtcfLUqUeTqg6PWhtdvtMPZOu/9J8cTZvXxin7PAgXbyI4Dnp0nqXxSWLTD0n4FOJLS8TGJ0l+dIN0PEni4xvM3Z8im88itzchLa9gX7gGRhl9dJLi2d+XbMMw7UyO/z/56NAxFju6kWYtqSgLorC9D/v4eVyVQcy8TmHoPImbY9xcG+D0d9/KedzuMblo5DVBQgpXCtbMQu9fvPyyv/tzT+MEFRxVwTgxTGlLB8XpWZYnp+SyXhCLovGnOEBZc2HZsqrnikr5xDBSLInTv5mVX70DvzlDi8+D3N3KWWf0emdX55d/8G8/XBAEQQDUQ+2Pnw3fme+X+/KYooCgF3GiC+RfH8JeWKJomaotIFk4f4JLAF1d3Shet1oRTXxWTmZWFRxLysbipK6OEc+keGAX9VuVin43mzz2+hu/Or571y6y6TRLA51sxjvgi2c6nQ+vCYJHxVxfy/LIKIuXbzK3OL/yiWyM3rbyRzVJXl4xH30vAGxu2sj1e3fYv7att3G52LxKdHndjkDZcVhyykyg51JNdfkde3ePlg3jQX//ALZt88VDh/irLx7aUPzw2m6PIH4tH67YLG9q1PxzyeHqsemhWcWZz7atHctlc3dHRq+zhPUI/r/tqWm1gKHlswAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMC0wNS0wNlQxNjowOTo0NCswMDowMNB9vSQAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjAtMDUtMDZUMTY6MDk6NDQrMDA6MDChIAWYAAAAAElFTkSuQmCC";
}, function(module, exports, __webpack_require__) {
    (exports = __webpack_require__(59)(!1)).push([ module.i, '.navbar-brand .navbar-item b{background:#fff;background:-webkit-gradient(left top,left bottom,color-stop(0,#fff),color-stop(55%,#fff),color-stop(55%,red),color-stop(100%,#ff1500));background:linear-gradient(180deg,#fff 0,#fff 55%,red 0,#ff1500);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr="#ffffff",endColorstr="#ff1500",GradientType=0);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.sspl .player-name{font-size:1.1rem;font-weight:700}.sspl .diff.inc{color:#42b129!important}.sspl .diff.dec{color:#f94022!important}.what-if{position:absolute;top:1em;right:0;font-weight:700;padding:0}table.ranking.songs th.score,table.ranking td.pp{position:relative}table.ranking tbody tr.hidden{opacity:.05}.content table.ranking.global.sspl .diff,.content table.ranking.global.sspl .pp{text-align:center}.box .tabs a{border-bottom:none}.box .tabs li:hover{border-bottom:1px solid #000;margin-bottom:-1px}.tabs li.is-active{border-bottom:1px solid #3273dc;margin-bottom:-1px}img.bloodtrail{height:24px}.sspl .rank small{font-size:.75rem;margin-left:.5rem;color:#d3d3d3}.text-center{text-align:center}.offset_tab{margin-left:auto}.sspl .inc{color:#42b129!important}.sspl .dec{color:#f94022!important}table.ranking.songs.sspl th.score{min-width:11rem}.content .column h5 .refresh{position:absolute;top:.5rem;right:.5rem;font-size:1rem}.pagination select.type,.sspl select,.sspl thead .diff select{font-size:1rem;font-weight:700;border:none;color:var(--textColor,#000);background-color:var(--background,#fff);outline:none}.pp-boundary{color:var(--textColor,#000)}.sspl tbody tr.main{background-color:var(--color-highlight)}table.ranking tbody tr:hover{background-color:var(--hover)!important}section.rankChart{height:300px!important}table.ranking.songs{max-width:none!important}', "" ]), 
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
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
}([ function(module, exports) {
    throw new Error("Module parse failed: Unexpected token (91:55)\nYou may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders\n|         Object.assign(\n|             {},\n>             (await getCacheAndConvertIfNeeded()).users?.[userId]?.scores,\n|             modifiedScores\n|         )");
} ]);
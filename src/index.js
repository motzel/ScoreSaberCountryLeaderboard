import Profile from './Svelte/Components/Player/Profile.svelte';
import CountryRanking from './Svelte/Components/Country/Ranking.svelte';
import SongLeaderboard from './Svelte/Components/Song/Leaderboard.svelte';
import WhatIfpp from './Svelte/Components/Song/WhatIfPp.svelte';
import SongScore from './Svelte/Components/SsEnhance/Score.svelte';
import Refresh from './Svelte/Components/Common/Refresh.svelte';
import SongBrowser from './Svelte/Components/Song/Browser.svelte';
import Button from './Svelte/Components/Common/Button.svelte';
import Select from './Svelte/Components/Common/Select.svelte';
import File from './Svelte/Components/Common/File.svelte';

import log from './utils/logger';
import config from './temp';
import {getCacheAndConvertIfNeeded, setCache} from "./store";
import {getFirstRegexpMatch} from "./utils/js";
import {getLeaderboard, getSongMaxScore} from "./song";
import {shouldBeHidden} from "./eastereggs";
import {filterByCountry, mapUsersToObj} from "./scoresaber/players";
import exportData from "./utils/export";

import {dateFromString} from "./utils/date";
import twitch from './services/twitch';
import {getConfig, getMainUserId} from "./plugin-config";

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

    return leaderboard;
}

async function setupLeaderboard() {
    log.info("Setup leaderboard page");

    const leaderboardId = getLeaderboardId();
    if (!leaderboardId) return;

    const leaderboard = await setupPlTable();
    if(!leaderboard || !leaderboard.length) return;

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
    const sseUserId = await getMainUserId();
    if (sseUserId) {
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

    log.info("Setup leaderboard page / Done")
}

function setupChart() {
    log.info("Setup chart");

    const chart = document.getElementById('rankChart');
    if(!chart) return;

    const chartSection = chart.closest('section');
    chartSection.style.setProperty('margin', '0 auto', 'important');
    chartSection.closest('.box').appendChild(chartSection);

    const history = getFirstRegexpMatch(/data:\s*\[([0-9,]+)\]/, document.body.innerHTML);
    if(!history) return;

    chart.parentNode.innerHTML = '<canvas class="chartjs-render-monitor" id="rankChart"></canvas>';

    let myChart = new Chart(document.getElementById("rankChart"), {
        responsive: true,
        onResize: function(chart, size){
            chart.resize();
            chart.render(true);
        },
        type: 'line',
        data: {
            labels: Array(50).fill(0).map((v,i) => 0===i ? 'now' : 1===i ? 'yesterday' : i + ' days ago').reverse(),
            datasets: [{
                data: history.split(','),
                label: "Rank",
                borderColor: "#3e95cd",
                fill: false
            },]
        },
        options: {
            maintainAspectRatio: false,
            title: {
                display: false,
            },
            tooltips: {
                mode: 'index',
                intersect: false,

            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                yAxes: [{
                    ticks: {
                        reverse: true,
                        userCallback: function(label, index, labels) {
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        },
                    }
                }],
            }
        }
    });

    log.info("Setup chart / Done")
}

async function setupProfile() {
    log.info("Setup profile page");

    if (document.readyState == 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupChart()
        })
    } else {
        // DOM is ready
        setupChart();
    }

    const profileId = getProfileId();
    if (!profileId) return;

    const data = await getCacheAndConvertIfNeeded();

    const profileConfig = await getConfig('profile');
    if (profileConfig && profileConfig.enlargeAvatar) {
        const avatarCol = document.querySelector('.column.avatar');
        if (avatarCol) avatarCol.classList.add('enlarge')

        const usersConfig = await getConfig('users');
        if(usersConfig && usersConfig.main && usersConfig.main === profileId) avatarCol.classList.add('main')
    }

    const tbl = document.querySelector('table.ranking');
    if(tbl) tbl.classList.add('sspl');

    (await Promise.all([...document.querySelectorAll('table.ranking tbody tr')].map(async tr => {
        let ret = {tr};

        const rank = tr.querySelector('th.rank');
        if(rank) {
            const rankMatch = getFirstRegexpMatch(/#(\d+)/, rank.innerText);
            ret.rank = rankMatch ? parseInt(rankMatch, 10) : null;
        } else {
            ret.rank = null;
        }

        const song = tr.querySelector('th.song a');
        if(song) {
            const leaderboardMatch = getFirstRegexpMatch(/leaderboard\/(\d+)/, song.href);
            ret.leaderboardId = leaderboardMatch ? parseInt(leaderboardMatch, 10): null;
        } else {
            ret.leaderboardId = null;
        }

        const img = tr.querySelector('th.song img');
        ret.songImg = img ? img.src : null;

        const songPp = tr.querySelector('th.song a .songTop.pp');
        const songMatch = songPp ? songPp.innerHTML.match(/^(.*?)\s*<span[^>]+>(.*?)<\/span>/) : null;
        if(songMatch) {
            ret.songName = songMatch[1];
            ret.songDiff = songMatch[2];
        } else {
            ret = Object.assign(ret, {songName: null, songDiff: null});
        }

        const songMapper = tr.querySelector('th.song a .songTop.mapper');
        ret.songMapper = songMapper ? songMapper.innerText : null;

        const songDate = tr.querySelector('th.song span.songBottom.time');
        ret.timeset = songDate ? songDate.title : null;

        const pp = tr.querySelector('th.score .scoreTop.ppValue');
        if(pp) ret.pp = parseFloat(pp.innerText);

        const ppWeighted = tr.querySelector('th.score .scoreTop.ppWeightedValue');
        const ppWeightedMatch = ppWeighted ? getFirstRegexpMatch(/^\(([0-9.]+)pp\)$/, ppWeighted.innerText) : null;
        ret.ppWeighted = ppWeightedMatch ? parseFloat(ppWeightedMatch) : null;

        const scoreInfo = tr.querySelector('th.score .scoreBottom');
        const scoreInfoMatch = scoreInfo ? scoreInfo.innerText.match(/^([^:]+):\s*([0-9,.]+)(?:.*?\((.*?)\))?/) : null;
        if(scoreInfoMatch) {
            switch(scoreInfoMatch[1]) {
                case "score":
                    ret.percent = null;
                    ret.mods = scoreInfoMatch[3] ? scoreInfoMatch[3] : "";
                    ret.score = parseFloat(scoreInfoMatch[2].replace(/[^0-9.]/g, ''));
                    break;

                case "accuracy":
                    ret.score = null;
                    ret.mods = scoreInfoMatch[3] ? scoreInfoMatch[3] : "";
                    ret.percent = parseFloat(scoreInfoMatch[2].replace(/[^0-9.]/g, '')) / 100;
                    break;
            }
        }

        const leaderboard = data.users?.[profileId]?.scores?.[ret.leaderboardId];
        if (leaderboard) {
            try {
                const maxSongScore = await getSongMaxScore(leaderboard.id, leaderboard.diff);

                if (!ret.percent && ret.score) {
                    ret.percent = maxSongScore
                        ? ret.score / maxSongScore
                        : (leaderboard.maxScoreEx
                            ? ret.score / leaderboard.maxScoreEx
                            : null);
                }

                if(!ret.score && ret.percent) {
                    ret.score = maxSongScore || leaderboard.maxScoreEx ? Math.round(ret.percent * (maxSongScore ? maxSongScore : leaderboard.maxScoreEx)) : null;
                }

                ret.hidden = shouldBeHidden(Object.assign({}, leaderboard, {id: leaderboard.playerId, percent: leaderboard.percent}))

                const history = leaderboard.history && leaderboard.history.length ? leaderboard.history[0] : null;
                ret.prevRank = history ? history.rank : null;
                ret.prevPp = history ? history.pp : null;
                ret.prevScore = history ? history.score : null;
                ret.prevTimeset = history ? new Date(Date.parse(history.rank)) : null;
                ret.prevPercent = history && ret.prevScore ? (maxSongScore
                    ? ret.prevScore / maxSongScore
                    : (leaderboard.maxScoreEx
                        ? ret.prevScore / leaderboard.maxScoreEx
                        : null)) : null;
            } catch (e) {} // swallow error
        }

        return ret;
    })))
        .filter(s => null !== s.tr)
        .forEach(s => {
            const score = s.tr.querySelector('.score');
            if(!score) return;

            score.innerHTML = "";

            new SongScore({
                target: score,
                props: {song: s}
            })
        });

    const header = document.querySelector('.content .column h5').closest('.box');
    if (header) {
        const refreshDiv = document.createElement('div');
        refreshDiv.classList.add('refresh');
        header.appendChild(refreshDiv);
        const refresh = new Refresh({
            target: refreshDiv,
            props: {}
        })
        refresh.$on('data-refreshed', async _ => {
            window.location.reload(false);
        })
    }

    const mainColumn = document.querySelector('.content .column ul').closest('.column');
    if (mainColumn && data.users?.[profileId]?.stats) {
        const additionalProfile = document.createElement('div');
        additionalProfile.classList.add('column');
        const ul = document.createElement('ul');
        ul.style.marginTop = sseInstalled ? '3.375rem' : '2.875rem';
        additionalProfile.appendChild(ul);
        new Profile({
            target: ul,
            props: {
                profile: data.users?.[profileId] ?? null,
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
                label: "Transformuj",
                iconFa: "fas fa-expand-arrows-alt",
                type: 'primary'
            }
        })
        const transformSongs = () => {
            const content = mainColumn.closest('.content');
            const songBox = content.querySelector('.box:nth-child(2)');
            if(songBox) {
                const box = document.createElement('div');
                box.classList.add('box');
                box.classList.add('has-shadow');
                content.insertBefore(box, songBox);

                new SongBrowser({
                    target: box,
                    props: {playerId: profileId}
                })

                songBox.remove();
                transformBtn.$destroy();
            }
        }
        transformBtn.$on('click', transformSongs)

        const avatarColumn = document.querySelector('.column.avatar');
        if (avatarColumn) {
            const div = document.createElement('div')
            div.style.marginTop = "1rem";
            div.style.fontSize = "0.75rem";
            div.classList.add('flex-center')
            div.classList.add('flex-column');
            avatarColumn.appendChild(div);

            // export button
            new Button({
                target: div,
                props: {
                    label: "Eksport",
                    iconFa: "fas fa-download",
                    cls: "full-width"
                }
            }).$on('click', _ => exportData())

            // import button
            const importBtn = new File({
                target: div,
                props: {
                    label: "Import",
                    iconFa: "fas fa-upload",
                    cls: "full-width",
                    accept: "application/json"
                }
            })
            importBtn.$on('change', e => {
                const file = e.target.files[0];
                if (!file) {
                    return;
                }
                if (file.type !== 'application/json') {
                    alert('Wybierz plik JSON zawierający eksport danych');
                    return;
                }

                importBtn.$set({disabled: true});

                const reader = new FileReader();

                reader.onload = async function (e) {
                    try {
                        const json = JSON.parse(e.target.result);

                        if (!json || !json.version || !json.lastUpdated || !json.users) {
                            alert('Niepoprawny plik eksportu');
                            return;
                        }

                        if (json.version < 1.2) {
                            alert('Import pliku ze starszej wersji pluginu nie jest wspierany');
                            return;
                        }

                        await setCache(json);

                        window.location.reload(false);
                    } catch (_) {
                        alert("Nieprawidłowy plik JSON");
                    } finally {
                        importBtn.$set({disabled: false});
                    }
                };

                reader.readAsText(file);
            })

            // twitch button
            if (profileId && data?.twitch?.users?.[profileId]?.login && data?.users?.[profileId]) {
                const twitchToken = await twitch.getCurrentToken();
                const tokenExpireInDays = twitchToken ? Math.floor(twitchToken.expires_in / 1000 / 60 / 60 / 24) : null;
                const tokenExpireSoon = tokenExpireInDays <= 3;
                new Button({
                    target: div,
                    props: {
                        label: twitchToken && !tokenExpireSoon ? 'Połączono' : 'Połącz',
                        title: twitchToken && tokenExpireInDays > 0 ? `Pozostało dni: ${tokenExpireInDays}` : null,
                        disabled: !tokenExpireSoon,
                        iconFa: "fab fa-twitch",
                        cls: 'full-width',
                        type: 'twitch',
                    }
                }).$on('click', _ => {
                    window.location.href = twitch.getAuthUrl(profileId ? profileId : '');
                });


                let twitchProfile = data.twitch.users[profileId];
                if (!twitchProfile.id) {
                    const fetchedProfile = await twitch.getProfileByUsername(twitchProfile.login);
                    if (fetchedProfile) {
                        twitchProfile = Object.assign({}, twitchProfile, fetchedProfile);
                        data.twitch.users[profileId] = twitchProfile;
                    }
                }

                if (twitchProfile.id) {
                    const scoresRecentPlay = data.users[profileId].recentPlay ? data.users[profileId].recentPlay : data.users[profileId].lastUpdated;
                    const twitchLastUpdated = twitchProfile.lastUpdated;

                    if (!scoresRecentPlay || !twitchLastUpdated || dateFromString(scoresRecentPlay) > dateFromString(twitchLastUpdated)) {
                        console.warn("fetching twitter videos")
                        const videos = await twitch.getVideos(twitchProfile.id);
                        if (videos?.data) {
                            twitchProfile.videos = videos.data;
                            twitchProfile.lastUpdated = new Date();

                            await setCache(data);
                        }
                    }
                }
            }
        }
    }

    log.info("Setup profile page / Done")
}

async function setupCountryRanking(diffOffset = 6) {
    log.info("Setup country ranking");

    const users = (await getCacheAndConvertIfNeeded())?.users;
    if (!users || !Object.keys(users).length) return;

    const origTable = getBySelector('table.ranking.global');

    const pagination = getBySelector(
        '.pagination',
        origTable.parentNode.parentNode
    );
    const typeDiv = document.createElement('div');
    pagination.insertBefore(typeDiv, getBySelector('br', pagination));

    const typeItems = [
        {value: 'sspl', label: 'Cached'},
        {value: 'original', label: 'Original'}
    ];
    const selectedType = typeItems[0]
    const typeSel = new Select({
        target: typeDiv,
        props: {
            value: selectedType,
            items: typeItems
        }
    })
    typeSel.$on('change', e =>
        Array.prototype.slice
            .apply(
                typeDiv
                    .closest('.box')
                    .querySelectorAll('table.ranking.global')
            )
            .map(
                (tbl) => (tbl.style.display = tbl.classList.contains(e.detail.value)
                    ? ''
                    : 'none')
            )
    );

    origTable.style.display = 'none';
    origTable.classList.add('original');

    new CountryRanking({
        target: origTable.parentNode,
        props: {
            users: mapUsersToObj(filterByCountry(users), users)
        }
    });

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

async function setupTwitch() {
    await twitch.processTokenIfAvailable();
    await twitch.createTwitchUsersCache();
}

async function setupDelayed() {
    initialized = true;

    // wait for SSE or given timeout
    await waitForSSEInit(config.SSE_CHECK_DELAY);

    if (isLeaderboardPage()) {
        await setupLeaderboard();
    }

    if (isProfilePage()) {
        await setupProfile();
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
    log.info("init");

    if (initialized) {
        return;
    }

    // fetch cache
    const data = await getCacheAndConvertIfNeeded();

    setupStyles();

    await setupTwitch();

    if (isCountryRankingPage()) {
        setupCountryRanking();
    }

    await setupDelayed();

    log.info("Setup complete");
}

init();
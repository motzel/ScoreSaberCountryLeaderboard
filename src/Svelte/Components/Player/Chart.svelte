<script>
    import {getRankedSongs} from "../../../scoresaber/rankeds";
    import {getPlayerHistory, getScoresByPlayerId} from "../../../scoresaber/players";
    import {addToDate, dateFromString, DAY, toSSTimestamp} from "../../../utils/date";
    import {formatDateRelative, formatDateRelativeInUnits, formatNumber, round} from "../../../utils/format";
    import {onMount} from "svelte";
    import {_, trans} from '../../stores/i18n';
    import eventBus from '../../../utils/broadcast-channel-pubsub'
    import Button from "../Common/Button.svelte";
    import {getConfig} from '../../../plugin-config'
    import {getTheme} from '../../../theme'
    import {getAccFromScore, getSongMaxScore} from '../../../song'

    export let profileId = null;
    export let history = null;
    export let type = 'rank';
    export let accFilterFunc =  null;
    export let refreshTag = null;

    let allRankeds = {};
    let chartData = [];
    let activityChart = [];

    let canvas = null;
    let chart = null;

    let userHistory = null;
    let playerScores = null;

    let themeName = 'darkss';
    let theme = null;

    let strings = {
        accBtnOptions: [
            {_key: 'chart.accuracyButton', value: 'acc'},
            {_key: 'chart.percentageButton', value: 'percentage'},
        ],
    }

    let values = {
        accBtn: strings.accBtnOptions.find(p => p.value === 'acc'),
    }

    function translateAllStrings() {
        Object.keys(strings).forEach(key => {
            strings[key].forEach(item => {
                if (item._key) item.label = trans(item._key);
            })
        })

        strings = {...strings};
        values = {...values};
    }

    async function refreshConfig() {
        const othersConfig = await getConfig('others');
        themeName = othersConfig && othersConfig.theme ? othersConfig.theme : 'darkss';

        theme = getTheme(themeName).reduce((cum, item) => {cum[item[0]] = item[1]; return cum;}, {});
    }

    onMount(async () => {
        await refreshConfig();

        canvas = document.getElementById('rankChart');

        await refreshRankedSongs();

        const rankedSongsUnsubscriber = eventBus.on('rankeds-changed', async () => await refreshRankedSongs());
        const activePlayersUpdatedUnsubscriber = eventBus.on('active-players-updated', async ({allPlayers}) => {
            if (profileId && allPlayers && allPlayers[profileId]) await refreshUserHistory(profileId);
        });
        const playerScoresUpdatedUnsubscriber = eventBus.on('player-scores-updated', async({playerId}) => {
            if (profileId !== playerId) return;

            await refreshPlayerScores(profileId)
        });

        const dataRefreshedUnsubscriber = eventBus.on('data-refreshed', async () => await refreshPlayerScores(profileId));

        const configChangedUnsubscriber = eventBus.on('config-changed', async () => await refreshConfig());

        return () => {
            rankedSongsUnsubscriber();
            activePlayersUpdatedUnsubscriber();
            playerScoresUpdatedUnsubscriber();
            dataRefreshedUnsubscriber();
            configChangedUnsubscriber();
        }
    });

    async function refreshUserHistory(profileId) {
        userHistory = await getPlayerHistory(profileId);
    }

    async function refreshRankedSongs() {
        allRankeds = await getRankedSongs();
    }

    async function refreshPlayerScores(profileId) {
        if (!profileId) return;

        playerScores = await getScoresByPlayerId(profileId);
    }

    async function calcAccChartData(playerScores, rankeds, type) {
        if (!playerScores || !rankeds) return;

        chartData = await Promise.all(Object.values(playerScores)
                .filter(s => !!s.pp && !!s.maxScoreEx && !!rankeds[s.leaderboardId] && (!accFilterFunc || accFilterFunc(s)))
                .map(async s => {
                    const maxScore = await getSongMaxScore(s.hash, s.diffInfo, s.leaderboardId)
                    const acc = getAccFromScore(s, maxScore, type === 'percentage')

                    return {
                        x: rankeds[s.leaderboardId].stars,
                        y: acc,
                        leaderboardId: s.leaderboardId,
                        name: s.name,
                        songAuthor: s.songAuthorName,
                        levelAuthor: s.levelAuthorName,
                        timeset: dateFromString(s.timeset),
                        mods: s.mods
                    }
                }))
        ;

        const ssToday = new Date(toSSTimestamp(new Date()))
        const oldestDate = addToDate(ssToday, -49 * DAY);
        const lastScores = playerScores
          .map(score => ({...score, timeset: score.timeset ? dateFromString(score.timeset) : null}))
          .filter(score => score.timeset && score.timeset > oldestDate)
          .reduce((cum, score) => {
              const allSongScores = [dateFromString(score.timeset)]
                .concat(
                  score.history && score.history.length
                    ? score.history.filter(h => h.timestamp).map(h => new Date(h.timestamp))
                    : []
                );

              allSongScores.forEach(t => {
                  const ssDate = toSSTimestamp(t);
                  const ssTimestamp = (new Date(ssDate)).getTime();

                  if (!cum.hasOwnProperty(ssTimestamp)) cum[ssTimestamp] = 0;

                  cum[ssTimestamp]++;
              });

              return cum;
          }, {})
        ;
        if (playerScores && playerScores.length)
            activityChart = Array(50).fill(0)
              .map((_, idx) => {
                  const agoTimeset = (addToDate(ssToday, -(49 - idx) * DAY)).getTime();

                  return lastScores[agoTimeset] ? lastScores[agoTimeset] : 0;
              })
            ;
    }

    async function setupRankChart(canvas, chartData, userHistory) {
        if (!canvas || !chartData || !chartData.length) return;

        const daysAgo = Array(50).fill(0).map((v, i) => i).reverse();

        if (chartData.length < 50) chartData = Array(50 - chartData.length).fill(null).concat(chartData);

        let ppData = [];

        if (userHistory) {
            const historyData = userHistory.reduce((cum, historyItem) => {
                const historyDate = toSSTimestamp(dateFromString(historyItem.timestamp));
                let diffInDays = Math.floor((new Date(toSSTimestamp(new Date())) - historyDate) / (1000 * 60 * 60 * 24));
                if (diffInDays < 0) diffInDays = 0;

                cum[diffInDays] = historyItem;

                return cum;
            }, {})

            if (!historyData[0] && historyData[1]) historyData[0] = {...historyData[1]};

            if (Object.keys(historyData).length) {
                ppData = daysAgo.map(d => historyData[d] ? historyData[d].pp : null)
            }
        }

        const rankColor = theme && theme.alternate ? theme.alternate : "#3e95cd";
        const ppColor = theme && theme.increase ? theme.increase : "#007100";
        const activityColor = theme && theme.dimmed ? theme.dimmed : "#3e3e3e"

        const datasets = [
            {
                yAxisID: 'rank-axis',
                data: chartData,
                label: trans('chart.rankLabel'),
                borderColor: rankColor,
                fill: false,
                tooltipStr: 'rankTooltip',
                round: 0,
                type: 'line'
            },
        ];

        const yAxes = [
            {
                id: 'rank-axis',
                scaleLabel: {
                    display: true,
                    labelString: trans('chart.rankLabel'),
                },
                ticks: {
                    reverse: true,
                    userCallback: function (label, index, labels) {
                        if (Math.floor(label) === label) {
                            return label;
                        }
                    },
                }
            },
        ];

        if (ppData.length) {
            datasets.push({
                yAxisID: 'pp-axis',
                data: ppData,
                spanGaps: true,
                label: trans('chart.ppLabel'),
                borderColor: ppColor,
                fill: false,
                tooltipStr: 'ppTooltip',
                round: 2,
                type: 'line'
            });

            yAxes.push({
                id: 'pp-axis',
                position: 'right',
                scaleLabel: {
                    display: true,
                    labelString: trans('chart.ppLabel'),
                },
                ticks: {
                    reverse: false,
                    userCallback: function (label, index, labels) {
                        if (Math.floor(label) === label) {
                            return label;
                        }
                    },
                }
            });
        }

        if (activityChart.length) {
            datasets.push({
                yAxisID: 'activity-axis',
                data: activityChart,
                label: trans('chart.activityLabel'),
                backgroundColor: activityColor,
                tooltipStr: 'activityTooltip',
                round: 0,
            });

            yAxes.push({
                id: 'activity-axis',
                display: false,
                position: 'right',
            });
        }

        if (chart) chart.destroy();

        chart = new Chart(
                document.getElementById("rankChart"),
                {
                    responsive: true,
                    onResize: function (chart, size) {
                        chart.resize();
                        chart.render(true);
                    },
                    type: 'bar',
                    data: {
                        labels: daysAgo.map(d => formatDateRelativeInUnits(-d, 'day')),
                        datasets
                    },
                    options: {
                        legend: {
                            display: true,
                        },
                        maintainAspectRatio: false,
                        title: {
                            display: false,
                        },
                        tooltips: {
                            mode: 'index',
                            intersect: false,
                            displayColors: false,
                            callbacks: {
                                title: (tooltipItem, data) => {
                                    if (!tooltipItem.length) return '';

                                    const tooltip = [tooltipItem[0].xLabel];
                                    tooltipItem.forEach(t => {
                                        tooltip.push(trans('chart.' + data.datasets[t.datasetIndex].tooltipStr, {value: formatNumber(t.yLabel, data.datasets[t.datasetIndex].round)}));
                                    })

                                    return tooltip;
                                },
                                label: () => ''
                            }

                        },
                        hover: {
                            mode: 'nearest',
                            intersect: true
                        },
                        scales: {
                            xAxes: [{
                                scaleLabel: {
                                    display: false,
                                    labelString: trans('chart.timeLabel'),
                                },
                            }],

                            yAxes,
                        }
                    }
                }
        );
    }

    function setupAccChart(canvas, chartData, type) {
        if (!canvas || !chartData || !chartData.length) return;

        if (chart) chart.destroy();

        const accColor = theme && theme.alternate ? theme.alternate : "#3e95cd"

        chart = new Chart(
                document.getElementById("rankChart"),
                {
                    responsive: true,
                    onResize: function (chart, size) {
                        chart.resize();
                        chart.render(true);
                    },
                    type: 'scatter',
                    data: {
                        datasets: [{
                            label: '',
                            borderColor: accColor,
                            fill: true,
                            pointRadius: 3,
                            pointHoverRadius: 3,
                            data: chartData,
                        }]
                    },
                    options: {
                        legend: {
                            display: false,
                        },
                        maintainAspectRatio: false,
                        title: {
                            display: false,
                        },
                        onClick(e, item) {
                            if(!chartData || !chartData.length || !item || !item.length || !item[0]._index || !chartData[item[0]._index]) return;

                            window.open(`/leaderboard/${chartData[item[0]._index].leaderboardId}`, '_blank');
                        },
                        tooltips: {
                            displayColors: false,
                            title: {
                                display: true,
                            },
                            callbacks: {
                                title: function (tooltipItem, data) {
                                    const mods = tooltipItem && tooltipItem.length && tooltipItem[0].datasetIndex !== undefined &&
                                    tooltipItem[0].index !== undefined && data && data.datasets &&
                                    data.datasets[tooltipItem[0].datasetIndex] &&
                                    data.datasets[tooltipItem[0].datasetIndex].data &&
                                    data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index] &&
                                    data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index].mods
                                      ? data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index].mods
                                      : null;

                                    return tooltipItem.length
                                      ? trans(
                                        (type === 'percentage' ? 'chart.percentageTooltip' : 'chart.accTooltip') + (!mods || !mods.length ? 'NoMods' : ''),
                                        {
                                            acc: formatNumber(tooltipItem[0].yLabel),
                                            stars: formatNumber(tooltipItem[0].xLabel),
                                            mods,
                                        },
                                      )
                                      : '';
                                },
                                label: function (tooltipItem, data) {
                                    if (!tooltipItem || !data || !data.datasets || !data.datasets[tooltipItem.datasetIndex] || !data.datasets[tooltipItem.datasetIndex].data || !data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]) return '';

                                    const ret = [];

                                    const song = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                    if (song) {
                                        ret.push(formatDateRelative(song.timeset));
                                        ret.push(song.name);
                                        ret.push(`${song.songAuthor} / ${song.levelAuthor}`);
                                    }

                                    return ret;
                                },
                            }

                        },
                        pan: {
                            enabled: true,
                            mode: 'xy'
                        },
                        zoom: {
                            enabled: true,
                            mode: 'xy',
                        },
                        hover: {
                            mode: 'nearest',
                            intersect: true
                        },
                        scales: {
                            xAxes: [{
                                type: 'linear',
                                scaleLabel: {
                                    display: false,
                                    labelString: trans('chart.starsLabel'),
                                },
                                ticks: {
                                    min: 0,
                                    stepSize: 0.5,
                                    callback: function (value, index, values) {
                                        return round(value, 2) + '*';
                                    },
                                }
                            }],
                            yAxes: [{
                                type: 'linear',
                                scaleLabel: {
                                    display: true,
                                    labelString: trans('chart.accuracyLabel'),
                                },
                                ticks: {
                                    max: 100,
                                    callback: function (value, index, values) {
                                        return round(value, 2) + '%';
                                    },
                                }
                            }],
                        },
                    },
                }
        );
    }

    function setupChart(type, canvas) {
        if (chart) chart.destroy();

        switch (type) {
            case 'acc':
            case 'percentage':
                setupAccChart(canvas, chartData, type);
                break;

            case 'rank':
            default:
                setupRankChart(canvas, history && history.length ? history : null, userHistory, activityChart);
                break;
        }
    }

    function onAccBtnClick(e) {
        const btnType = e && e.detail && e.detail.value && ['acc', 'percentage'].includes(e.detail.value)
          ? e.detail.value
          : 'acc';

        type = btnType;
        values.accBtn = strings.accBtnOptions.find(o => o.value === btnType);
    }

    function setAccBtnOption(type) {
        if (!['acc', 'percentage'].includes(type)) return;

        values.accBtn = strings.accBtnOptions.find(o => o.value === type);
    }

    $: {
        refreshPlayerScores(profileId)
    }

    $: {
        refreshUserHistory(profileId)
    }

    $: {
        calcAccChartData(playerScores, allRankeds, values.accBtn.value, refreshTag);
    }

    $: {
        setupChart(type, canvas, chartData, history, userHistory, activityChart, theme)
    }

    $: {
        setAccBtnOption(type)
    }

    $: {
        translateAllStrings($_);
    }
</script>

<section>
    <main id="chart-section">
        <canvas class="chartjs-render-monitor" id="rankChart"></canvas>
    </main>

    {#if chartData && chartData.length}
        <aside>
            <Button iconFa="fa fa-chart-line" type={type === 'rank' ? 'primary' : 'default'} label={$_.chart.rankingButton}
                    on:click={() => type = 'rank'} notSelected={type !== 'rank'} />
            <Button iconFa="fa fa-crosshairs" type={['acc', 'percentage'].includes(type) ? 'primary' : 'default'}
                    label={values.accBtn.label}
                    on:click={onAccBtnClick} options={strings.accBtnOptions} bind:selectedOption={values.accBtn}
                    notSelected={!['acc', 'percentage'].includes(type)} />
        </aside>
    {/if}
</section>

<style>
    main {
        margin: 0 auto !important;
        height: 300px !important;
    }

    aside {
        display: flex;
        justify-content: center;
        font-size: .75rem;
        text-align: center;
        margin-top: .5rem;
    }

    :global(aside button) {
        font-weight: 500;
        margin-right: .125rem!important;
    }
</style>

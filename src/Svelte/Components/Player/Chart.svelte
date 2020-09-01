<script>
    import {getRankedSongs} from "../../../scoresaber/rankeds";
    import {getPlayerScores} from "../../../scoresaber/players";
    import {dateFromString} from "../../../utils/date";
    import {formatDateRelative, formatDateRelativeInUnits, formatNumber, round} from "../../../utils/format";
    import {onMount} from "svelte";
    import {_, trans} from '../../stores/i18n';
    import Button from "../Common/Button.svelte";

    export let profileId = null;
    export let history = null;

    let allRankeds = {};
    let chartData = [];

    let canvas = null;
    let chart = null;
    let type = 'rank';

    onMount(() => {
        canvas = document.getElementById('rankChart');
    });

    async function calcAccChartData(profileId, rankeds) {
        if (!profileId) return;

        rankeds = await rankeds;
        if (!rankeds) return;

        const playerScores = await getPlayerScores(profileId);
        chartData = Object.values(playerScores)
                .filter(s => !!s.pp && !!s.maxScoreEx && !!rankeds[s.leaderboardId] && !!rankeds[s.leaderboardId])
                .map(s => {
                    const scoreMult = s.uScore ? s.score / s.uScore : 1;
                    const acc = s.score / s.maxScoreEx / scoreMult * 100;

                    return {
                        x: rankeds[s.leaderboardId].stars,
                        y: acc,
                        leaderboardId: s.leaderboardId,
                        name: s.name + ' ' + s.songSubName,
                        songAuthor: s.songAuthorName,
                        levelAuthor: s.levelAuthorName,
                        timeset: dateFromString(s.timeset)
                    }
                })
        ;
    }

    function setupRankChart(canvas, chartData) {
        if (!canvas || !chartData || !chartData.length) return;

        chart = new Chart(
                document.getElementById("rankChart"),
                {
                    responsive: true,
                    onResize: function (chart, size) {
                        chart.resize();
                        chart.render(true);
                    },
                    type: 'line',
                    data: {
                        labels: Array(50).fill(0).map((v, i) => formatDateRelativeInUnits(-i, 'day')).reverse(),
                        datasets: [{
                            data: chartData,
                            label: '',
                            borderColor: "#3e95cd",
                            fill: false
                        },]
                    },
                    options: {
                        legend: {
                            display: false,
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
                                title: (tooltipItem, data) =>
                                        tooltipItem.length
                                                ? [
                                                    tooltipItem[0].xLabel,
                                                    trans('chart.rankTooltip', {rank: formatNumber(tooltipItem[0].yLabel, 0)})
                                                ]
                                                : ''
                                ,
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
                                    display: true,
                                    labelString: trans('chart.timeLabel'),
                                },
                            }],
                            yAxes: [{
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
                            }],
                        }
                    }
                }
        );
    }

    function setupAccChart(canvas, chartData) {
        if (!canvas || !chartData || !chartData.length) return;

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
                            borderColor: "#3e95cd",
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
                                    return tooltipItem.length
                                            ? trans('chart.accTooltip', {acc: formatNumber(tooltipItem[0].yLabel), stars: formatNumber(tooltipItem[0].xLabel)})
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
                                    display: true,
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
                setupAccChart(canvas, chartData);
                break;

            case 'rank':
            default:
                setupRankChart(canvas, history && history.length ? history.split(',') : null);
                break;
        }
    }

    $: allRankeds = getRankedSongs();
    $: {
        calcAccChartData(profileId, allRankeds);
    }

    $: {
        setupChart(type, canvas, chartData, history)
    }
</script>

<section>
    <main id="chart-section">
        <canvas class="chartjs-render-monitor" id="rankChart"></canvas>
    </main>

    {#if chartData && chartData.length}
        <aside>
            <Button iconFa="fa fa-chart-line" type={type === 'rank' ? 'primary' : 'default'} label={$_.chart.rankingButton}
                    on:click={() => type = 'rank'} disabled={type === 'rank'} />
            <Button iconFa="fa fa-crosshairs" type={type === 'acc' ? 'primary' : 'default'} label={$_.chart.accuracyButton}
                    on:click={() => type = 'acc'} disabled={type === 'acc'} />
        </aside>
    {/if}
</section>

<style>
    main {
        margin: 0 auto !important;
        height: 300px !important;
    }

    aside {
        margin-top: .5rem;
        font-size: .75rem;
        text-align: center;
    }
</style>
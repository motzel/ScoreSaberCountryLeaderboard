<script>
    import {_, trans} from '../../../stores/i18n';
    import {getConfig} from '../../../../plugin-config'
    import {getTheme} from '../../../../theme'
    import {onMount} from 'svelte'
    import eventBus from '../../../../utils/broadcast-channel-pubsub'
    import {formatNumber} from '../../../../utils/format'

    export let data = null;
    export let height = "120px";

    let canvas = null;
    let chart = null;

    let themeName = 'darkss';
    let theme = null;

    async function refreshConfig() {
        const othersConfig = await getConfig('others');
        themeName = othersConfig && othersConfig.theme ? othersConfig.theme : 'darkss';

        theme = getTheme(themeName).reduce((cum, item) => {cum[item[0]] = item[1]; return cum;}, {});
    }

    async function setupChart(canvas, chartData) {
        if (!canvas || !chartData || !Object.keys(chartData).length) return;

        if (chart) chart.destroy();

        const accColor = theme && theme.alternate ? theme.alternate : "#3e95cd";;

        const datasets = [
            {
                yAxisID: 'acc-axis',
                data: ['acc'].concat(Object.values(chartData).map(v => v * 100)),
                borderColor: accColor,
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                round: 2,
                type: 'line'
            },
        ];

        const yAxes = [
            {
                id: 'acc-axis',
                position: 'left',
                scaleLabel: {
                    display: false,
                },
            },
        ];

        chart = new Chart(
                canvas,
                {
                    responsive: true,
                    onResize: function (chart, size) {
                        chart.resize();
                        chart.render(true);
                    },
                    type: 'bar',
                    data: {
                        labels: Object.keys(chartData).map(v => Math.floor(v/60) + ':' + (v % 60).toString().padStart(2, '0')),
                        datasets
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
                                title: (tooltipItem, data) => {
                                    if (!tooltipItem.length) return '';

                                    const tooltip = [tooltipItem[0].xLabel ? tooltipItem[0].xLabel : ''];
                                    tooltipItem.forEach(t => t.yLabel ? tooltip.push(formatNumber(t.yLabel, 2) + '%') : '');

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
                                },
                                ticks: {
                                    autoSkip: true,
                                    autoSkipPadding: 4
                                }
                            }],

                            yAxes,
                        }
                    }
                }
        );
    }

    onMount(async () => {
        await refreshConfig();

        const configChangedUnsubscriber = eventBus.on('config-changed', async () => await refreshConfig());

        return () => {
            configChangedUnsubscriber();
        }
    });

    $: {
        setupChart(canvas, data && data.graph ? data.graph : null)
    }
</script>

<section style="--height: {height}">
    <main id="chart-section">
        <canvas class="chartjs-render-monitor" bind:this={canvas}></canvas>
    </main>
</section>

<style>
    section {
        margin: 0 auto !important;
        height: var(--height) !important;
    }
</style>

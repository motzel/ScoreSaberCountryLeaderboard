<script>
    import {onMount} from "svelte";
    import {_} from '../../stores/i18n';

    export let data = null;

    let chartEl = null;
    let chart = null;

    async function setupChart(chartEl, chartData) {
        if (!chartEl || !chartData || !chartData.length) return;

        if (chart) chart.destroy();

        chart = c3.generate({
            bindto: chartEl,
            data: {
                columns: [
                    ['difficulty', ...chartData]
                ],
                color: {
                    difficulty: 'var(--selected)',
                }
            },
            axis: {
                x: {show: false},
                y: {show: false},
            },
            legend: {
                show: false
            },
            responsive: true,
            onResize: function (chart, size) {
                chart.resize();
                chart.render(true);
            },
            tooltip: {
                show: false
            }
        });
    }

    onMount(async () => {
        chartEl = document.getElementById('diffChart');
    });

    $: {
        setupChart(chartEl, data)
    }
</script>

<h3 class="title is-5">{$_.songLeaderboard.difficultyGraph}</h3>
<main id="diffChart">
</main>

<style>
    main {
        margin: 0 auto !important;
        height: 300px !important;
    }
    h3 {
        margin-bottom: .5rem !important;
        color: var(--alternate) !important;
    }
</style>

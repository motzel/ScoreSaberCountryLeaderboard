<script>
  import Value from '../Common/Value.svelte'
  import {formatNumber} from '../../../utils/format'

  export let value = 0;
  export let percentage = 0;
  export let color = '#6fdb6f';
  export let digits = 2;

  $: percentageValue = (1 - percentage) * 440;
  $: percentageValueFormatted = formatNumber(percentage * 100, digits);
</script>

<div class="donut" style="--percentage:{percentageValue ? percentageValue : 0};" title={percentageValueFormatted + '%'}>
  <span><Value {value} /></span>
  <svg width="100%" height="100%" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <g>
      <circle id="circle" class="circle_animation" r="69.85699" cy="81" cx="81" stroke-width="12" stroke="{color}" fill="none"/>
    </g>
  </svg>
</div>

<style>
    .donut {
        position: relative;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 4.5em;
        height: 4.5em;
        font-size: .875em;
    }

    svg {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        transform: rotate(-90deg);
    }

    .circle_animation {
        stroke-dasharray: 440;
        stroke-dashoffset: var(--percentage, 0)!important;

        -webkit-animation: donut 1s ease-out forwards;
        animation: donut 1s ease-out forwards;
    }
</style>
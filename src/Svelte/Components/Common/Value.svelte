<script>
    import {formatNumber} from '../../../utils/format';

    export let value = 0;
    export let prevValue = null;
    export let zero = formatNumber(0);
    export let digits = 2;
    export let withSign = false;
    export let prefix = "";
    export let withZeroPrefix = false;
    export let suffix = "";
    export let withZeroSuffix = false;
    export let inline = false;
    export let useColorsForValue = false;
    export let prevLabel = "";

    $: minValue = Math.pow(10, -digits-1)
    $: formatted = (Math.abs(value) > minValue ? prefix + formatNumber(value, digits, withSign) + suffix : (withZeroPrefix ? prefix : "") + zero + (withZeroSuffix ? suffix : ""));
    $: showPrevValue = prevValue !== value && prevValue && value !== null;
    $: prevFormatted = prevValue ? (prevLabel ? prevLabel + ': ' : '') + formatNumber(prevValue, digits, withSign) + suffix : ""
    $: prevDiffFormatted = prevValue ? formatNumber(value - prevValue, digits, true) + suffix : ""
    $: prevClass = (prevValue ? (value - prevValue > minValue ? "inc" : (value - prevValue < -minValue ? "dec" : "zero")): "") + (!inline ? " block" : " inline") + ' prev';
    $: mainClass = (useColorsForValue && value ? (value > minValue ? "inc" : (value < -minValue ? "dec" : "zero")): "");
</script>

<span class={mainClass}>{formatted}</span>{#if showPrevValue} <small class={prevClass} title={prevFormatted}>{prevDiffFormatted}</small>{/if}

<style>
    small.block {display: block;}
    small.inline {margin-left: .5rem;}
</style>

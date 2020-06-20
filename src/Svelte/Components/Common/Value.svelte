<script>
    import {formatNumber} from '../../../utils/format';

    export let value = 0;
    export let prevValue = null;
    export let zero = "0,00";
    export let digits = 2;
    export let withSign = false;
    export let suffix = "";
    export let withZeroSuffix = false;
    export let inline = false;
    export let useColorsForValue = false;

    $: minValue = Math.pow(10, -digits-1)
    $: formatted = (Math.abs(value) > minValue ? formatNumber(value, digits, withSign) + suffix : zero + (withZeroSuffix ? suffix : ""));
    $: prevFormatted = prevValue ? formatNumber(prevValue, digits, withSign) + suffix : ""
    $: prevDiffFormatted = prevValue ? formatNumber(value - prevValue, digits, true) + suffix : ""
    $: prevClass = (prevValue ? (value - prevValue > minValue ? "inc" : (value - prevValue < -minValue ? "dec" : "zero")): "") + (!inline ? " block" : " inline");
    $: mainClass = (useColorsForValue && value ? (value > minValue ? "inc" : (value < -minValue ? "dec" : "zero")): "");
</script>

<style>
    small.block {display: block;}
    small.inline {margin-left: .5rem;}
</style>
<span class={mainClass}>{formatted}</span>{#if prevValue} <small class={prevClass} title={prevFormatted}>{prevDiffFormatted}</small>{/if}
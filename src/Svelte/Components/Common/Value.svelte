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

    $: formatted = (value ? formatNumber(value, digits, withSign) + suffix : zero + (withZeroSuffix ? suffix : ""));
    $: prevFormatted = prevValue ? formatNumber(prevValue, digits, withSign) + suffix : ""
    $: prevDiffFormatted = prevValue ? formatNumber(value - prevValue, digits, true) + suffix : ""
    $: prevClass = (prevValue ? (value - prevValue > 0 ? "inc" : (value - prevValue < 0 ? "dec" : "zero")): "") + (!inline ? " block" : " inline");
</script>

<style>
    small.block {display: block;}
    small.inline {margin-left: .5rem;}
</style>
{formatted}{#if prevValue} <small class={prevClass} title={prevFormatted}>{prevDiffFormatted}</small>{/if}
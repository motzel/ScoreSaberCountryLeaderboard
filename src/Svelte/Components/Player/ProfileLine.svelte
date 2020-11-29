<script>
    import {formatNumber} from '../../../utils/format';

    export let label;
    export let value;
    export let precision = 2;
    export let suffix = "";
    export let prefix = "";
    export let noValue = "-";
</script>

<li>
    <strong>{label}: </strong> {#if value}{prefix}{formatNumber(value, precision)}{suffix}{:else}{noValue}{/if}
    <slot></slot>
</li>

<style>
    li {
        position: relative;
    }
</style>
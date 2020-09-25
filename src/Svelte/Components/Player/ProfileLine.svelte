<script>
    import {formatNumber} from '../../../utils/format';

    export let label;
    export let value;
    export let precision = 2;
    export let suffix = "";
</script>

<li>
    <strong>{label}: </strong> {formatNumber(value, precision)}{suffix}
    <slot></slot>
</li>

<style>
    li {
        position: relative;
    }
</style>
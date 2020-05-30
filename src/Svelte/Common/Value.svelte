<script>
    import {formatNumber} from '../../utils/format';

    export let value = 0;
    export let zero = '0,00';
    export let digits = 2;
    export let withSign = false;

    $: formatted = value ? formatNumber(value, digits, withSign) : zero;
</script>

{formatted}
<script>
    import Value from './Value.svelte';

    export let pp = 0;
    export let prevPp = null;
    export let zero = '-';
</script>

<span class="scoreTop ppValue"><Value value="{pp}" {zero} prevValue={prevPp} suffix="pp" /></span>
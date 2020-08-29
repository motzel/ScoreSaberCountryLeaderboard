<script>
    import {createEventDispatcher} from 'svelte';
    import {_} from '../../stores/i18n';

    const dispatch = createEventDispatcher();

    export let min = 0;
    export let max = 100;
    export let value = {from: min, to: max};
    export let step = 1;
    export let disabled = false;
    export let disableDirectEditing = true;

    function onChange() {
        dispatch('change', value)
    }
    function onKeyDown(e) {
        if(disableDirectEditing && !['ArrowUp', 'ArrowDown', 'Tab', 'F5'].includes(e.key)) e.preventDefault();
    }
</script>

<div>
    <input type="number" bind:value={value.from} {min} {max} {step} {disabled}
           on:input={e => {value.from = value.from ? (value.from > value.to ? value.to : value.from) : min; onChange();}} on:keydown={onKeyDown}/>
    <span>{$_.common.to}</span>
    <input type="number" bind:value={value.to} {min} {max} {step} {disabled}
           on:input={e => {value.to = value.to ? (value.to < value.from ? value.from : value.to) : max; onChange();}} on:keydown={onKeyDown}/>
</div>

<style>
    input[type=number] {
        width: 3rem;
        text-align: center;
    }
</style>

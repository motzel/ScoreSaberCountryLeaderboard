<script>
    import {createEventDispatcher} from 'svelte';
    const dispatch = createEventDispatcher();

    export let checked = false;
    export let disabled = false;

    function toggle() {
        if (disabled) return;

        checked = !checked;

        dispatch('click', checked);
    }
</script>

<i class={'fas ' + (checked ? 'fa-check-square' : 'fa-square')} on:click={toggle}></i>

<style>
    i.disabled {
        opacity: 50%;
    }
</style>

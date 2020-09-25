<script>
	import {onMount} from 'svelte';
	import {dateFromString} from "../../../utils/date";

	import Value from './Value.svelte';

	export let rank;
	export let timeset;

	let faded = false;
	onMount(() => {
		if (timeset) {
			const diffInSecs = (Date.now() - dateFromString(timeset)) / (1000 * 60 * 60 * 24);
		}
	});
</script>

<i class="fas fa-globe-americas"></i>
<span class="value" class:faded={faded}><Value value={rank} prefix="#" zero="-" digits={0}/></span>

<style>
	.value {
		font-weight: 500;
	}
</style>
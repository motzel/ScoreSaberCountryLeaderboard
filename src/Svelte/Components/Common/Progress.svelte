<script>
	import Label from './Label.svelte';

	export let value = 0;
	export let max = 100;
	export let label = "";
	export let subLabel = "";
	export let separator = "/";
	export let inline = false;
	export let maxWidth = "none";
</script>

<style>
	progress {
		width: 20rem;
		max-width: 97%;
	}
</style>

<span>
	<progress value={value} max={max} style="max-width: {maxWidth}"></progress>
	{#if inline}
		<span><Label label={label} subLabel={subLabel} separator={separator}/></span>
	{:else}
		<div><Label label={label} subLabel={subLabel} separator={separator}/></div>
	{/if}
</span>
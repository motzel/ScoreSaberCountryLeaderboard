<script>
	import {onMount} from "svelte";
	import {substituteVars} from "../../../utils/format";
	import {PLAYERS_URL} from "../../../network/scoresaber/consts";
	import {getActiveCountry} from "../../../scoresaber/country";

	export let country;
	export let url;

	onMount(async () => {
		if (!country) country = await getActiveCountry();
		if (country && country.length && (!url || !url.length)) url = substituteVars(PLAYERS_URL, {page: 1, country});
	})
</script>

{#if country && country.length}
	<figure class="flag">
		{#if url && url.length}
			<a href={url}>
				<img src="/imports/images/flags/{country}.png"/>
			</a>
		{:else}
			<img src="/imports/images/flags/{country}.png"/>
		{/if}
	</figure>
{/if}
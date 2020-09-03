<script>
	import {onMount} from "svelte";
	import {getActiveCountry} from "../../../scoresaber/players";
	import {substituteVars} from "../../../utils/format";
	import {USERS_URL} from "../../../network/scoresaber/consts";

	export let country;
	export let url;

	onMount(async () => {
		if (!country) country = await getActiveCountry();
		if (country && country.length && (!url || !url.length)) url = substituteVars(USERS_URL, {page: 1, country});
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
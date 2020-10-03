<script>
	import {onMount} from "svelte";
	import eventBus from '../../../utils/broadcast-channel-pubsub';
	import {getCacheAndConvertIfNeeded, setCache} from "../../../store";
	import {_, trans} from "../../stores/i18n";
	import {getActiveCountry} from "../../../scoresaber/country";

	import Button from '../Common/Button.svelte';
	import Modal from "../Common/Modal.svelte";
	import Refresh from "../Player/Refresh.svelte";

	export let country;

	let showConfirmationModal = false;
	let onboarding = false;
	let dataDownloaded = false;

	let refreshWidget;

	let currentCountry;
	onMount(async () => {
		currentCountry = await getActiveCountry();

		eventBus.on('start-data-refreshing', () => {
			dataDownloaded = false;
		})

		eventBus.on('data-refreshed', () => {
			dataDownloaded = true;

			eventBus.publish('reload-browser-cmd');
		})
	});

	async function setCountry() {
		const data = await getCacheAndConvertIfNeeded();

		await setCache(data);

		showConfirmationModal = false;
	}

	function onOk() {
		onboarding = true;
		dataDownloaded = false;

		eventBus.publish('dl-manager-pause-cmd');

		eventBus.publish('country-set', {country, persist: true});
	}

	function onCancel() {
		if (refreshWidget) refreshWidget.stopRefreshing();

		showConfirmationModal = false;
		onboarding = false;
		dataDownloaded = false;

		eventBus.publish('country-set', {country: currentCountry, persist: true});

		eventBus.publish('dl-manager-unpause-cmd');
	}
</script>

{#if country}
	<Button iconFa="far fa-flag" label={$_.dashboard.setCurrentCountry} type="text"
	        on:click={() => showConfirmationModal = true}/>

	{#if showConfirmationModal}
		<Modal closeable={false} on:close={() => showConfirmationModal = false} width="auto" height="auto">
			<main>
				{#if !onboarding}
					{#if currentCountry}
						{trans('dashboard.areYouSureChangeCurrentCountry', {country: country ? country.toUpperCase() : null, currentCountry: currentCountry.toUpperCase()})}
					{:else}
						{trans('dashboard.areYouSureSetCurrentCountry', {country: country ? country.toUpperCase() : null})}
					{/if}
				{:else}
					<p>{$_.dashboard.onboardingLine1}</p>
					<p>{$_.dashboard.onboardingLine2}</p>
					<Refresh refreshLabel="Start" showLastDownloaded={false} forceShowProgress={true} persistEachDl={true} bind:this={refreshWidget} />
				{/if}
			</main>

			<footer>
				{#if !onboarding}
					<Button iconFa="far fa-flag" label={$_.dashboard.setCurrentCountry} type="primary" on:click={onOk}/>
				{/if}

				<Button label={$_.common.cancel} on:click={onCancel}/>
			</footer>
		</Modal>
	{/if}
{/if}

<style>
	:global('.ss-modal') {
		height: auto;
	}

	main {
		margin-top: .5rem;
		font-size: 1.25rem;
		color: var(--alternate);
	}

	main p {
		font-size: 1rem;
	}

	main :global(.refresh-widget .btn-cont) {
		font-size: .75em;
	}

	main :global(.refresh-widget progress + div) {
		font-size: 1rem;
	}

	footer {
		margin-top: 2rem;
		display: flex;
		justify-content: flex-end;
	}

	footer :global(.button) {
		margin-right: .25rem !important;
	}
</style>
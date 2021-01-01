<script>
	import {onMount} from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import {dateFromString} from "../../../utils/date";
	import eventBus from '../../../utils/broadcast-channel-pubsub';
	import {formatDate} from "../../../utils/format";
	import {_, trans} from "../../stores/i18n";

	import Value from './Value.svelte';
	import {refreshPlayerScoreRank} from "../../../network/scoresaber/players";

	export let rank;
	export let countryRank;
	export let country;
	export let lastUpdated;
	export let leaderboardId;
	export let playerId;
	export let timeset;
	export let recentPlay = null;
	export let showCountryTotal = false;
	export let disableUpdating = false;
	export let inline = true;
	export let cachedRecentPlay = null;

	const REFRESH_TIMEOUT = 10 * 1000;

	let refreshing = false;
	let faded = false;
	let refreshDate = dateFromString(lastUpdated ? lastUpdated : timeset);

	let userCountryRank;
	let userCountryRankTotal;

	let fadeSsplCountryRank = false;

	const currentRank = tweened(rank, {
		duration: 500,
		easing: cubicOut
	});

	onMount(() => {
		fadeSsplCountryRank = cachedRecentPlay && timeset && dateFromString(cachedRecentPlay) < dateFromString(timeset);

		if (!disableUpdating) {
			const scoreUpdatingSubscriber = eventBus.on('player-score-update-start', ({playerId: scorePlayerId, leaderboardId: scoreLeaderboardId}) => {
				if (scorePlayerId === playerId && scoreLeaderboardId === leaderboardId) {
					refreshing = true;
				}

				// stop refreshing mode if score can not be downloaded in 10 seconds
				setTimeout(() => refreshing = false, REFRESH_TIMEOUT);
			});

			const scoreUpdatedSubscriber = eventBus.on('player-score-updated', ({playerId: scorePlayerId, leaderboardId: scoreLeaderboardId, rank, lastUpdated, timeset}) => {
				if (rank && scorePlayerId === playerId && scoreLeaderboardId === leaderboardId) {
					refreshing = false;

					refreshDate = dateFromString(lastUpdated ? lastUpdated : timeset);
					currentRank.set(rank);
				}
			});

			const scoreUpdatingFailedSubscriber = eventBus.on('player-score-update-failed', ({playerId: scorePlayerId, leaderboardId: scoreLeaderboardId}) => {
				if (scorePlayerId === playerId && scoreLeaderboardId === leaderboardId) {
					refreshing = false;
				}
			});

			return () => {
				scoreUpdatingSubscriber();
				scoreUpdatedSubscriber();
				scoreUpdatingFailedSubscriber();
			}
		}
	});

	async function refreshRank() {
		if (!playerId || !leaderboardId || refreshing) return;

		refreshing = true;

		await refreshPlayerScoreRank(playerId, [leaderboardId], recentPlay);
	}

	$: {
		currentRank.set(rank);
	}

	$: if (country && countryRank && countryRank[country]) {
		userCountryRank = countryRank[country].rank;
		userCountryRankTotal = countryRank[country].total;
	}

	$: if(refreshDate) {
		const diffInDays = (new Date() - dateFromString(refreshDate)) / (1000 * 60 * 60 * 24);

		faded = isNaN(diffInDays) || diffInDays > 1;
	}
</script>

{#if !$currentRank && !(country && userCountryRank)}
	<span>-</span>
{/if}

{#if $currentRank}
	{#if disableUpdating}
		<i class="fas fa-globe-americas" class:fa-spin={refreshing}></i>
		<span class="value"><Value value={$currentRank} prefix="#" zero="-" digits={0}/></span>
	{:else}
	<a on:click={refreshRank} class:faded={faded}
	   title={trans('songBrowser.rankOfDate', {date: formatDate(refreshDate)})}>
		<i class="fas fa-globe-americas" class:fa-spin={refreshing}></i>
		<span class="value"><Value value={$currentRank} prefix="#" zero="-" digits={0}/></span>
	</a>
	{/if}
{/if}

{#if country && userCountryRank}
	<span class="country-rank" style="display:{inline ? 'inline' : 'block'};" class:faded={fadeSsplCountryRank}>
		<img src="/imports/images/flags/{country}.png"/>
		<span class="value" title={!showCountryTotal && country && userCountryRank && userCountryRankTotal ? '#' + userCountryRank + ' / ' + userCountryRankTotal : ''}><Value value={userCountryRank} prefix="#" zero="-" digits={0}/>{#if showCountryTotal}<Value value={userCountryRankTotal} prefix="/" zero="-" digits={0}/>{/if}</span>
	</span>
{/if}

<style>
	a {
		color: var(--textColor) !important;
	}
	.faded {
		color: var(--faded) !important;
	}
	.value {
		font-weight: 500;
	}

	.country-rank {
		margin-left: .25rem;
	}
</style>
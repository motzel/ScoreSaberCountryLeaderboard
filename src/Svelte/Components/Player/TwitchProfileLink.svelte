<script>
	import {onMount} from 'svelte';
	import twitch from '../../../services/twitch';
	import eventBus from '../../../utils/broadcast-channel-pubsub';
	import nodeSync from '../../../network/multinode-sync';
	import {_} from "../../stores/i18n";

	import Button from "../Common/Button.svelte";
	import Modal from '../Common/Modal.svelte';
	import {getPlayerInfo} from "../../../scoresaber/players";
	import {getCacheAndConvertIfNeeded, setCache} from "../../../store";

	export let profileId;
	export let twitchLogin;
	export let noLabel = false;

	let twitchToken;
	let playerInfo;

	let showModal = false;
	let twitchUserName = "";
	let twitchUser = null;
	let alreadySearched = false;

	onMount(async () => {
		if (!profileId) return;

		twitchToken = await twitch.getCurrentToken();
		playerInfo = await getPlayerInfo(profileId);

		twitchUserName = twitchLogin && twitchLogin.length ? twitchLogin : (playerInfo && playerInfo.name ? playerInfo.name : null);
	});

	function onShowModal() {
		showModal = true;

		onFindUser();
	}

	async function onFindUser() {
		if (!twitchToken || !twitchUserName || !twitchUserName.length) return;

		alreadySearched = false;
		twitchUser = null;

		twitchUser = await twitch.getProfileByUsername(twitchUserName);

		alreadySearched = true;
	}

	function onTwitchUserNameKeyUp(e) {
		if (e.code === 'Enter') {
			e.preventDefault()

			onFindUser();

			return false
		}
	}

	async function onTwitchUserLink() {
		await twitch.updateTwitchUser(profileId, twitchUser.login);

		eventBus.publish('player-twitch-linked', {
			nodeId     : nodeSync.getId(),
			playerId   : profileId,
			twitchLogin: twitchUser.login
		});

		showModal = false;
	}
</script>

{#if profileId && twitchToken}
	<Button iconFa="fab fa-twitch" label={noLabel ? '' : $_.profile.twitch.setupPlayerProfile}
	        title={noLabel ? $_.profile.twitch.setupPlayerProfile : ''} type="twitch" on:click={onShowModal}/>

	{#if showModal}
		<Modal width="30rem" closeable={false} on:close={() => showModal = false}>
			<header>
				<div class="menu-label">{$_.profile.twitch.setupPlayerProfile}</div>
			</header>

			<main>
				<div class="search flex-center">
					<input type="text" bind:value={twitchUserName} on:keyup={onTwitchUserNameKeyUp}/>
					<Button iconFa="fas fa-search" type="primary" label={$_.common.search} on:click={onFindUser}/>
				</div>

				{#if twitchUser}
					<div class="flex-start flex-align-start">
						<img src={twitchUser.profile_image_url}/>
						<div>
							<h1 class="title is-3">{twitchUser.display_name}</h1>
							<h2 class="subtitle is-6"><a href="https://twitch.tv/{encodeURIComponent(twitchUser.login)}"
							                             target="_blank">https://twitch.tv/{twitchUser.login}</a></h2>
							<p>{twitchUser.description}</p>
						</div>
					</div>
				{:else if alreadySearched}
					<p>{$_.profile.twitch.userNotFound}</p>
				{/if}
			</main>

			<footer>
				<Button iconFa="fab fa-twitch" label={$_.profile.twitch.link} type="twitch" on:click={onTwitchUserLink}
				        disabled={!twitchUser}/>
				<Button label={$_.common.cancel} on:click={() => showModal = false}/>
			</footer>
		</Modal>
	{/if}

{/if}

<style>
	header {
		font-size: 1.5em;
		text-align: center;
	}

	header .menu-label {
		margin-top: 0;
		margin-bottom: 0;
	}

	main {
		margin: 1rem 0;
	}

	main .search {
		margin: .75rem 0;
	}

	input {
		width: 100%;
		padding: calc(0.45em - 1px) 1em;
		margin: 0 0 0.45em 0;
		outline: none;
	}

	main img {
		width: 30%;
		height: auto;
		margin-right: 2rem;
		border-radius: 50%;
	}

	main a {
		color: #9146ff !important;
	}

	footer {
		margin-top: auto;
	}
</style>
<script>
    import {onMount} from "svelte";
    import { fade } from 'svelte/transition';

    import Button from '../Common/Button.svelte';
    import Select from '../Common/Select.svelte';
    import TypeFilterSelect from "../Common/TypeFilterSelect.svelte";
    import File from '../Common/File.svelte';
    import BeatSaviorImporter from '../BeatSavior/BeatSaviorImporter.svelte';
    import Modal from '../Common/Modal.svelte';

    import {getConfig, setConfig} from "../../../plugin-config";
    import twitch from '../../../services/twitch';
    import {
        addPlayerToGroup, getAllActivePlayersIds, getFriendsIds, getManuallyAddedPlayersIds,
        getPlayerInfo, isDataAvailable, removePlayerFromGroup, updatePlayer,
    } from "../../../scoresaber/players";
    import {setThemeInFastCache} from "../../../store";
    import {importDataHandler, exportJsonData} from "../../../utils/export-import";
    import {themes, setTheme} from "../../../theme";
    import eventBus from '../../../utils/broadcast-channel-pubsub';
    import nodeSync from '../../../utils/multinode-sync';
    import {
        _,
        trans,
        getSupportedLangs,
        setCurrentLang,
        getSupportedLocales,
        setCurrentLocale
    } from "../../stores/i18n";
    import {getActiveCountry} from "../../../scoresaber/country";
    import TwitchProfileLink from "./TwitchProfileLink.svelte";

    export let profileId;

    let mainPlayerId;
    let playerInfo;
    let isActivePlayer = false;
    let isManuallyAddedPlayer = false;
    let isFriend = false;
    let dataAvailable = false;

    let showTwitchLinkBtn = true;
    let showTwitchUserBtn = true;
    let twitchBtnLabel = '';
    let twitchBtnTitle = '';
    let twitchBtnDisabled = false;
    let twitchToken = null;
    let twitchProfile = null;

    let showSettingsModal = false;

    let importBtn;
    let noDataImportBtn;

    let config;

    let availableLangs = getSupportedLangs();
    let availableLocales = getSupportedLocales();

    let leaderboardType;
    let country;

    let strings = {
        songTypes: [
            {id: 'all', _key: 'songBrowser.types.all'},
            {id: 'rankeds', _key: 'songBrowser.types.ranked_only'},
            {id: 'unrankeds', _key: 'songBrowser.types.unranked_only'},
            {id: 'rankeds_unplayed', _key: 'songBrowser.types.not_played_only'},
            {id: 'sniper_mode', _key: 'songBrowser.types.sniper_mode'},
        ],

        viewTypes: [
            {id: 'compact', _key: 'songBrowser.viewTypes.compact'},
            {id: 'tabular', _key: 'songBrowser.viewTypes.tabular'},
            {id: 'cards', _key: 'songBrowser.viewTypes.cards'},
        ],

        sortTypes: [
            {
                _key     : 'songBrowser.fields.timeset',
                field    : 'timeset',
                onlyTypes: ['all', 'rankeds', 'unrankeds', 'sniper_mode']
            },
            {
                _key     : 'songBrowser.fields.stars',
                field    : 'stars',
                onlyTypes: ['all', 'rankeds', 'rankeds_unplayed', 'sniper_mode']
            },
            {_key: 'songBrowser.fields.pp', field: 'pp', onlyTypes: ['rankeds', 'sniper_mode']},
            {_key: 'songBrowser.fields.acc', field: 'acc', onlyTypes: ['rankeds', 'sniper_mode']}
        ],

        columns: [
            {
                _key      : 'songBrowser.fields.stars',
                name      : '*',
                key       : 'stars',
                selected  : false,
                type      : 'song',
                displayed : true,
                valueProps: {zero: "-", suffix: "*"}
            },
            {
                _key      : 'songBrowser.fields.maxPp',
                name      : 'Max PP',
                key       : 'maxPp',
                selected  : false,
                type      : 'song',
                displayed : true,
                valueProps: {zero: "-", suffix: "pp"}
            },
            {
                _key      : 'songBrowser.fields.bpm',
                name      : 'BPM',
                key       : 'bpm',
                selected  : false,
                type      : 'song',
                displayed : true,
                valueProps: {zero: "-", suffix: "", digits: 0}
            },
            {
                _key      : 'songBrowser.fields.njs',
                name      : 'NJS',
                key       : 'njs',
                selected  : false,
                type      : 'song',
                displayed : true,
                valueProps: {zero: "-", suffix: "", digits: 0}
            },
            {
                _key      : 'songBrowser.fields.nps',
                name      : 'NPS',
                key       : 'nps',
                selected  : false,
                type      : 'song',
                displayed : true,
                valueProps: {zero: "-", suffix: ""}
            },
            {
                _key      : 'songBrowser.fields.duration',
                name      : 'Czas',
                key       : 'length',
                selected  : false,
                type      : 'song',
                displayed : true,
                valueProps: {zero: "-"}
            },
            {
                _key        : 'songBrowser.fields.timeset',
                compactLabel: null,
                name        : 'Data',
                key         : 'timeset',
                selected    : true,
                type        : 'series',
                displayed   : true,
                valueProps  : {prevValue: null}
            },
            {
                _key        : 'songBrowser.fields.rank',
                compactLabel: null,
                name        : 'Rank',
                key         : 'rank',
                selected    : true,
                type        : 'series',
                displayed   : true
            },
            {
                _key        : 'songBrowser.fields.diffPp',
                compactLabel: null,
                name        : '+PP',
                key         : 'diffPp',
                selected    : false,
                type        : 'series',
                displayed   : false,
                valueProps  : {zero: "-", suffix: "pp global", withSign: true, useColorsForValue: true}
            },
            {
                _key      : 'songBrowser.fields.pp',
                name      : 'PP',
                key       : 'pp',
                selected  : true,
                type      : 'series',
                valueProps: {zero: "-", suffix: "pp"},
                displayed : true
            },
            {
                _key        : 'songBrowser.fields.weightedPp',
                compactLabel: 'Ważone',
                name        : 'wPP',
                key         : 'weightedPp',
                selected    : false,
                type        : 'series',
                displayed   : true,
                valueProps  : {zero: "-", suffix: "pp"}
            },
            {
                _key        : 'songBrowser.fields.acc',
                compactLabel: null,
                name        : 'Acc',
                key         : 'acc',
                selected    : true,
                type        : 'series',
                displayed   : true,
                valueProps  : {zero: "-", suffix: "%"}
            },
            {
                _key        : 'songBrowser.fields.score',
                compactLabel: null,
                name        : 'Wynik',
                key         : 'score',
                selected    : true,
                type        : 'series',
                displayed   : true,
                valueProps  : {digits: 0, zero: "-"}
            },
            {
                _key        : 'songBrowser.fields.beatSaviorAcc',
                compactLabel: null,
                name        : 'Beat Savior Acc',
                key         : 'beatSaviorAcc',
                selected    : true,
                type        : 'series',
                displayed   : true,
                valueProps  : {zero: "-"}
            },
            {
                _key        : 'songBrowser.fields.beatSaviorStats',
                compactLabel: null,
                name        : 'Beat Savior Stats',
                key         : 'beatSaviorStats',
                selected    : true,
                type        : 'series',
                displayed   : true,
                valueProps  : {zero: "-"}
            },
            {
                _key     : 'songBrowser.fields.diff',
                name     : 'Różnice',
                key      : 'diff',
                selected : true,
                type     : 'other',
                displayed: true
            },
            {
                _key     : 'songBrowser.fields.icons',
                name     : '',
                key      : 'icons',
                type     : 'additional',
                displayed: true,
                selected : true
            },
        ],

        chartTypes: [
            {_key: 'chart.none', id: "none"},
            {_key: 'chart.rankingButton', id: "rank"},
            {_key: 'chart.accuracyButton', id: "acc"},
        ],

        statsStyles: [
            {_key: 'profile.settings.profile.statsStyleBadge', id: "badges"},
            {_key: 'profile.settings.profile.statsStyleText', id: "text"},
        ],

        viewTypeUpdates: [
            {_key: 'profile.settings.others.alwaysRefresh', id: "always"},
            {_key: 'profile.settings.others.keepView', id: "keep-view"},
        ],

        icons: [
            {_key: 'songBrowser.icons.bsr', id: 'bsr'},
            {_key: 'songBrowser.icons.beatsaver', id: 'bs'},
            {_key: 'songBrowser.icons.oneclick', id: 'oneclick'},
            {_key: 'songBrowser.icons.preview', id: 'preview'},
            {_key: 'songBrowser.icons.twitch', id: 'twitch'},
            {_key: 'songBrowser.icons.beatsavior', id: 'beatsavior'},
        ],

        themes: Object.entries(themes).map(e => ({id: e[0], label: e[1].name, def: e[1].def, _key: e[1]._key})),
    }

    let values = {
        songTypes      : strings.songTypes[0],
        viewTypes      : strings.viewTypes[0],
        chartTypes     : strings.chartTypes[1],
        statsStyles    : strings.statsStyles[0],
        viewTypeUpdates: strings.viewTypeUpdates[1],
        shownIcons     : strings.icons.map(i => i),
        lang           : availableLangs[0],
        locale         : availableLocales[1],
        theme          : strings.themes[0],
    }

    let origTheme = values.theme;
    let origLang = values.lang;
    let origLocale = values.locale;

    const filterSortTypes = () => strings.sortTypes.filter(st => !st.onlyTypes || st.onlyTypes.includes(values.songTypes.id))
    let sortTypes = filterSortTypes();
    let configSortType = filterSortTypes()[0];

    let columns = strings.columns.filter(c => c.displayed);
    let configShowColumns = columns.filter(c => c.selected);

    const allItemsPerPage = [5, 8, 10, 12, 15, 20, 24, 25, 48, 50];
    let itemsPerPage = allItemsPerPage.map(i => ({label: i, val: i}));
    let configItemsPerPage = itemsPerPage[1];

    function translateAllStrings() {
        Object.keys(strings).forEach(key => {
            strings[key].forEach(item => {
                if (item._key) item.label = trans(item._key);
            })
        })

        strings = {...strings};
        values = {...values};

        // filtered data
        const prevSortType = configSortType.id;
        sortTypes = filterSortTypes();
        configSortType = sortTypes.find(st => st.id === prevSortType);

        const prevShowColumns = columns.filter(c => c.selected).map(c => c.key);
        columns = strings.columns.filter(c => c.displayed);
        configShowColumns = columns.filter(c => prevShowColumns.includes(c.key));

    }

    async function refreshPlayerStatus(profileId, country) {
        isActivePlayer = (await getAllActivePlayersIds(country)).includes(profileId);
        isManuallyAddedPlayer = (await getManuallyAddedPlayersIds(country)).includes(profileId);
        isFriend = (await getFriendsIds()).includes(profileId);
    }

    let initialized = false;

    async function refreshTwitchProfile(profileId) {
        twitchProfile = await twitch.getProfileByPlayerId(profileId, true);
        twitchToken = await twitch.getCurrentToken();
        const tokenExpireInDays = twitchToken ? Math.floor(twitchToken.expires_in / 1000 / 60 / 60 / 24) : null;
        const tokenExpireSoon = tokenExpireInDays <= 3;

        const showTwitchBtnEnabledInConfig = !!(config && config.profile && config.profile.showTwitchIcon);

        showTwitchLinkBtn = (showTwitchBtnEnabledInConfig && !twitchToken) || (twitchToken && tokenExpireSoon);
        showTwitchUserBtn = showTwitchBtnEnabledInConfig && twitchToken && playerInfo && !playerInfo.inactive;

        twitchBtnLabel = twitchToken ? (!tokenExpireSoon ? trans('profile.twitch.linked') : trans('profile.twitch.renew')) : trans('profile.twitch.link');
        twitchBtnTitle = twitchToken && tokenExpireInDays > 0 ? trans('profile.twitch.daysLeft', {days: tokenExpireInDays}) : null;
        twitchBtnDisabled = !tokenExpireSoon;

        if (twitchProfile) {
            if (!twitchProfile.id) {
                const fetchedProfile = await twitch.getProfileByUsername(twitchProfile.login);
                if (fetchedProfile) {
                    twitchProfile = {...twitchProfile, ...fetchedProfile, playerId: profileId};

                    await twitch.storeProfile(twitchProfile);
                }
            }

            await twitch.updateVideosForPlayerId(profileId);
        }
    }

    const refreshConfig = async () => {
        country = await getActiveCountry();

        config = await getConfig();
        mainPlayerId = config && config.users && config.users.main ? config.users.main : null;

        const defaultSongType = strings.songTypes.find(s => s.id === config.songBrowser.defaultType);
        if (defaultSongType) values.songTypes = defaultSongType;

        const defaultView = strings.viewTypes.find(i => i.id === config.songBrowser.defaultView);
        if (defaultView) values.viewTypes = defaultView;

        const defaultShowColumns = columns.filter(c => Array.isArray(config.songBrowser.showColumns) && config.songBrowser.showColumns.includes(c.key))
        if (defaultShowColumns) configShowColumns = defaultShowColumns;

        const defaultShowIcons = strings.icons.filter(i => config.songBrowser.showIcons.includes(i.id))
        if (defaultShowIcons) values.shownIcons = defaultShowIcons;

        const defaultSort = filterSortTypes().find(s => s.field === config.songBrowser.defaultSort)
        if (defaultSort) configSortType = defaultSort;

        const defaultItemsPerPage = itemsPerPage.find(i => i.val === config.songBrowser.itemsPerPage);
        if (defaultItemsPerPage) configItemsPerPage = defaultItemsPerPage;

        const defaultChart = strings.chartTypes.find(i => i.id === config.profile.showChart);
        if (defaultChart) values.chartTypes = defaultChart;

        let defaultStatsStyle = strings.statsStyles.find(i => i.id === config.profile.statsStyle);
        if (defaultStatsStyle) values.statsStyles = defaultStatsStyle;

        const defaultTheme = strings.themes.find(t => t.id === config.others.theme)
        if (defaultTheme) {
            values.theme = defaultTheme;
            origTheme = defaultTheme;
        }

        const defaultLang = availableLangs.find(l => l.id === config.others.language)
        if (defaultLang) {
            values.lang = defaultLang;
            origLang = defaultLang;
        }

        const defaultLocale = availableLocales.find(l => l.id === config.others.locale)
        if (defaultLocale) {
            values.locale = defaultLocale;
            origLocale = defaultLocale;
        }

        if (config.songLeaderboard && undefined === config.songLeaderboard.showBgCover) config.songLeaderboard.showBgCover = true;

        const defaultViewUpdate = strings.viewTypeUpdates.find(i => i.id === config.others.viewsUpdate);
        if (defaultViewUpdate) values.viewTypeUpdates = defaultViewUpdate;

        filterSortTypes();

        if (profileId) {
            await refreshPlayerStatus(profileId, country);

            await refreshTwitchProfile(profileId)
        }
    }

    onMount(async () => {
        dataAvailable = await isDataAvailable();

        playerInfo = await getPlayerInfo(profileId);

        await refreshConfig();

        initialized = true;

        const unsubscriberScoresUpdated = eventBus.on('player-scores-updated', async ({playerId}) => {
            if (!playerInfo && playerId === profileId) {
                await updatePlayerInfo(profileId);
            }
        })

        const unsubscriberDataRefreshed = eventBus.on('data-refreshed', async ({playerId}) => {
            await updatePlayerInfo(profileId);
        })

        const unsubscriberConfigChanged = eventBus.on('config-changed', refreshConfig);

        const unsubscriberTwitchLinked = eventBus.on('player-twitch-linked', async ({playerId}) => {
            if(playerId === profileId) await refreshTwitchProfile(profileId);
        });

        const unsubscriberMainPlayerChanged = eventBus.on('main-player-changed', ({playerId}) => {
            mainPlayerId = playerId;
        });

        return () => {
            unsubscriberScoresUpdated();
            unsubscriberConfigChanged();
            unsubscriberTwitchLinked();
            unsubscriberMainPlayerChanged();
            unsubscriberDataRefreshed();
        }
    })

    async function setAsMainProfile() {
        if (!profileId) return;

        if (!config.users) config.users = {};
        config.users.main = profileId;
        await setConfig(config);

        const playerInfo = await getPlayerInfo(profileId);
        if (!playerInfo) await updatePlayer({id: profileId});

        dataAvailable = true;

        eventBus.publish('main-player-changed', {playerId: profileId});
    }

    let importing = false;
    function importData(e) {
        try {
            importing = true;
            if (importBtn) importBtn.$set({disabled: true});
            if (noDataImportBtn) {
                noDataImportBtn.$set({disabled: true});
            }

            importDataHandler(
             e,
             msg => {
                 importing = false;

                 alert(msg)

                 importBtn.$set({disabled: false});
             },
             async json => {
                 importing = false;
                 if (importBtn) importBtn.$set({disabled: false});
                 if (noDataImportBtn) noDataImportBtn.$set({disabled: false});

                 eventBus.publish('data-imported', {});
             }
            );
        }
        catch {
            importing = false;
        }
    }

    let exporting = false;
    async function exportData() {
        try {
            exporting = true;
            await exportJsonData();
        }
        finally {
            exporting = false;
        }
    }

    function onSongTypeChange() {
        sortTypes = filterSortTypes();
        if (!sortTypes.find(st => st.field === configSortType.field)) {
            configSortType = sortTypes[0];
        }
    }

    async function onThemeChange() {
        setTheme(values.theme.id);
    }

    function onCancel() {
        values.theme = origTheme;
        values.lang = origLang
        values.locale = origLocale;

        setCurrentLang(values.lang.id);
        setCurrentLocale(values.locale.id);
        setTheme(values.theme.id);

        showSettingsModal = false
    }

    async function saveConfig() {
        config.songBrowser.defaultType = values.songTypes.id;
        config.songBrowser.defaultView = values.viewTypes.id;
        config.profile.showChart = values.chartTypes.id;
        config.profile.statsStyle = values.statsStyles.id;
        config.songBrowser.defaultSort = configSortType.field;
        config.songBrowser.showColumns = configShowColumns.map(c => c.key);
        config.songBrowser.showIcons = values.shownIcons.map(i => i.id);
        config.songBrowser.itemsPerPage = configItemsPerPage.val;
        config.songLeaderboard.defaultType = leaderboardType;
        config.others.theme = values.theme.id;
        config.others.viewsUpdate = values.viewTypeUpdates.id;
        config.others.language = values.lang.id;
        config.others.locale = values.locale.id;

        setThemeInFastCache(values.theme.id);

        await setConfig(config);

        eventBus.publish('config-changed', config)

        showSettingsModal = false;
    }

    async function addPlayerToFriends() {
        await addPlayerToGroup(profileId);

        const playerInfo = await getPlayerInfo(profileId);
        if (!playerInfo) await updatePlayer({id: profileId});

        await refreshPlayerStatus(profileId, country);

        eventBus.publish('player-added-to-friends', {playerId: profileId, nodeId: nodeSync().getId()});
    }

    async function removePlayerFromFriends() {
        await removePlayerFromGroup(profileId, isManuallyAddedPlayer);
        await refreshPlayerStatus(profileId, country);

        if (isManuallyAddedPlayer)
            eventBus.publish('player-removed', {playerId: profileId, nodeId: nodeSync().getId()});
        else
            eventBus.publish('player-removed-from-friends', {playerId: profileId, nodeId: nodeSync().getId()});

        // TODO: remove it eventually
        window.location.reload();
    }

    async function manuallyAddPlayer() {
        await addPlayerToFriends();

        eventBus.publish('player-added', {playerId: profileId, nodeId: nodeSync().getId()});
    }

    function onLangChange() {
        setCurrentLang(values.lang.id);
    }

    function onLocaleChange() {
        setCurrentLocale(values.locale.id);
    }

    async function updatePlayerInfo(profileId) {
        dataAvailable = await isDataAvailable();
        playerInfo = await getPlayerInfo(profileId);

        await refreshPlayerStatus(profileId, country);
        await refreshTwitchProfile(profileId);
    }

    $: if (initialized && profileId) {
        updatePlayerInfo(profileId);
    }

    $: {
        translateAllStrings($_);
    }
</script>

{#if initialized && profileId}
    <div class="buttons flex-center" transition:fade={{ duration: 1000 }}>
    {#if (!dataAvailable)}
        <File iconFa={importing ? "fas fa-spin fa-spinner" : "fas fa-upload"} label="Import" accept="application/json" bind:this={noDataImportBtn}
              on:change={importData}/>
    {:else if !isActivePlayer && (mainPlayerId && mainPlayerId !== profileId)}
        <Button iconFa="far fa-star" type="primary" title={$_.profile.addPlayer} on:click={manuallyAddPlayer}/>
    {:else if playerInfo}
        {#if profileId === mainPlayerId}
            <Button iconFa="fas fa-cog" title={$_.profile.settings.header} on:click={() => showSettingsModal = true}/>
            <BeatSaviorImporter {profileId} />
        {/if}

        {#if isManuallyAddedPlayer || isFriend}
            <Button iconFa="fas fa-star" type={isManuallyAddedPlayer ? "danger" : "default"} title={isManuallyAddedPlayer ? $_.profile.removePlayer : $_.profile.removeFromFriends} on:click={removePlayerFromFriends}/>
        {/if}
        {#if !isManuallyAddedPlayer && !isFriend && (!mainPlayerId || mainPlayerId !== profileId)}
            <Button iconFa="far fa-star" type="default" title={$_.profile.addToFriends} on:click={addPlayerToFriends}/>
        {/if}
    {/if}

    {#if (!mainPlayerId || mainPlayerId !== profileId) && !importing}
        <Button iconFa="fas fa-user-check" type="primary" label={!dataAvailable ? $_.profile.setAsDefault : ''} title={$_.profile.setAsDefault} on:click={setAsMainProfile}/>
        {#if (!dataAvailable)}
        <span class="pulse onboarding-hint"><i class="fas fa-arrow-left"></i> {$_.onboarding.importOrSetProfile}</span>
        {/if}
    {/if}

    {#if showTwitchUserBtn && twitchProfile}
        <TwitchProfileLink {profileId} twitchLogin={twitchProfile ? twitchProfile.login : null} noLabel={!!twitchProfile} />
    {/if}

    {#if playerInfo}
        {#if showTwitchLinkBtn}
            <Button iconFa="fab fa-twitch" label={twitchBtnLabel} title={twitchBtnTitle} disabled={twitchBtnDisabled}
                    type="twitch"
                    on:click={() => window.location.href = twitch.getAuthUrl(profileId ? profileId : '')}/>
        {/if}

        {#if showTwitchUserBtn && !twitchProfile}
            <TwitchProfileLink {profileId} twitchLogin={twitchProfile ? twitchProfile.login : null} noLabel={!!twitchProfile} />
        {/if}
    {/if}
    </div>

    {#if showSettingsModal}
        <Modal closeable={false} on:close={() => showSettingsModal = false}>
            <header>
                <div class="menu-label">{$_.profile.settings.header}</div>
            </header>

            <main>
                <section class="columns">
                    <div class="column is-one-third">
                        <div class="menu-label">{$_.profile.settings.language}</div>

                        <Select items={availableLangs} bind:value={values.lang} on:change={onLangChange} />
                    </div>

                    <div class="column is-one-third">
                        <div class="menu-label">{$_.profile.settings.locale}</div>

                        <Select items={availableLocales} bind:value={values.locale} on:change={onLocaleChange} />
                    </div>

                    <div class="column is-one-third">
                        <div class="menu-label">{$_.profile.settings.theme}</div>
                        <Select items={strings.themes} bind:value={values.theme} on:change={onThemeChange} />
                    </div>
                </section>

                <section>
                    <div class="menu-label">{$_.profile.settings.songBrowser.header}</div>
                    <label class="checkbox">
                        <input type="checkbox" bind:checked={config.songBrowser.autoTransform}>
                        {$_.profile.settings.songBrowser.autoTransform}
                    </label>

                    <div class="columns">
                        <div class="column is-one-third">
                            <label class="menu-label">{$_.profile.settings.songBrowser.defaultTypeHeader}</label>
                            <Select bind:value={values.songTypes} items={strings.songTypes} on:change={onSongTypeChange}/>
                        </div>

                        <div class="column is-one-third">
                            <label class="menu-label">{$_.profile.settings.songBrowser.defaultViewHeader}</label>
                            <Select bind:value={values.viewTypes} items={strings.viewTypes}/>
                        </div>

                        <div class="column fields is-one-third">
                            <label class="menu-label">{$_.profile.settings.songBrowser.defaultColumnsHeader}</label>
                            <Select multiple bind:value={configShowColumns} items={columns}/>
                        </div>
                    </div>

                    <div class="columns">
                        <div class="column is-one-third">
                            <label class="menu-label">{$_.profile.settings.songBrowser.defaultSortHeader}</label>
                            <Select bind:value={configSortType} items={sortTypes}/>
                        </div>

                        <div class="column is-one-third">
                            <label class="menu-label">{$_.profile.settings.songBrowser.defaultIconsHeader}</label>
                            <Select multiple bind:value={values.shownIcons} items={strings.icons} />
                        </div>

                        <div class="column is-one-third">
                            <label class="menu-label">{$_.profile.settings.songBrowser.defaultItemsPerPageHeader}</label>
                            <Select bind:value={configItemsPerPage} items={itemsPerPage} />
                        </div>
                    </div>
                </section>

                <section>
                    <div class="menu-label">{$_.profile.settings.profile.header}</div>
                    <div>
                        <div class="columns">
                            <div class="column is-one-third">
                                <label class="menu-label">{$_.profile.settings.profile.statsStyling}</label>
                                <Select bind:value={values.statsStyles} items={strings.statsStyles} />
                            </div>

                            <div class="column is-one-third">
                                <label class="menu-label">{$_.profile.settings.profile.defaultChart}</label>
                                <Select bind:value={values.chartTypes} items={strings.chartTypes} />
                            </div>

                            <div class="column is-one-third text-align-left">
                                <label class="checkbox">
                                    <input type="checkbox" bind:checked={config.profile.showOnePpCalc}>
                                    {$_.profile.settings.profile.showOnePpCalc}
                                </label>

                                <label class="checkbox">
                                    <input type="checkbox" bind:checked={config.profile.showTwitchIcon}>
                                    {$_.profile.settings.profile.showTwitchIcon}
                                </label>
                            </div>
                        </div>
                    </div>


                </section>

                <section>
                    <div class="menu-label">{$_.profile.settings.songLeaderboard.header}</div>
                    <div>
                        <label class="checkbox">
                            <input type="checkbox" bind:checked={config.songLeaderboard.showDiff}>
                            {$_.profile.settings.songLeaderboard.showDiff}
                        </label>

                        <label class="checkbox">
                            <input type="checkbox" bind:checked={config.songLeaderboard.showWhatIfPp}>
                            {$_.profile.settings.songLeaderboard.showWhatIfPp}
                        </label>

                        <label class="checkbox">
                            <input type="checkbox" bind:checked={config.songLeaderboard.showBgCover}>
                            {$_.profile.settings.songLeaderboard.showBgCover}
                        </label>
                    </div>

                    <div class="columns">
                        <div class="column is-one-third">
                            <label class="menu-label">{$_.profile.settings.songLeaderboard.defaultType}</label>
                            <TypeFilterSelect bind:value={leaderboardType} {country} />
                        </div>

                        <div class="column is-one-third">
                            <label class="menu-label">{$_.profile.settings.others.refreshHeader}</label>
                            <Select bind:value={values.viewTypeUpdates} items={strings.viewTypeUpdates} />
                        </div>
                    </div>
                </section>

                <section>
                    <div class="menu-label">{$_.profile.settings.others.header}</div>

                    <div class="columns">
                        <div class="column is-one-third">
                            <label class="checkbox">
                                <input type="checkbox" bind:checked={config.others.bgDownload}>
                                {$_.profile.settings.others.bgDownload}
                            </label>
                        </div>
                    </div>
                </section>
            </main>

            <footer class="columns">
                <div class="column">
                    <Button iconFa="fas fa-save" label={$_.common.save} type="primary" on:click={saveConfig}/>
                    <Button label={$_.common.cancel} on:click={onCancel}/>
                </div>

                <div class="column">
                    <Button iconFa={exporting ? "fas fa-spin fa-spinner" : "fas fa-download"} label={$_.profile.settings.export} on:click={exportData}/>
                    <File iconFa={importing ? "fas fa-spin fa-spinner" : "fas fa-upload"} label={$_.profile.settings.import} accept="application/json" bind:this={importBtn}
                          on:change={importData}/>
                </div>
            </footer>
        </Modal>
    {/if}
{/if}

<style>
    .text-align-left {
        text-align: left!important;
    }

    header {
        font-size: 1.5em;
        text-align: center;
    }

    header .menu-label {
        margin-top: 0;
        margin-bottom: 0;
    }

    label {
        margin-right: .75em;
        margin-bottom: .75em;
    }

    .menu-label {
        margin-top: .75em;
        margin-bottom: .25em;
        color: var(--alternate);
    }

    .columns:last-of-type {
        margin-bottom: 0;
    }

    .column:not(.is-two-thirds) {
        text-align: center;
        padding-bottom: 0;
        max-width: 20rem;
    }

    .flex-column {
        flex-direction: column;
    }

    .flex-bottom {
        display: flex;
        align-items: flex-end;
        padding-bottom: 0;
    }
    .flex-bottom label {
        margin-bottom: 0;
    }

    @media screen and (max-width: 768px) {
        .column {
            max-width: none;
        }
    }

    .column .menu-label {
        margin-right: 0;
        margin-bottom: .25em;
    }

    :global(.column .dropdown, .column .dropdown-trigger, .column .dropdown-trigger button) {
        width: 100%;
    }

    .column.fields :global(.dropdown-menu) {
        max-height: 20rem;
    }

    footer {
        margin-top: auto;
        min-height: 3.75rem;
        justify-content: space-between;
        align-items: flex-end;
    }

    footer .column {
        max-width: none;
    }

    footer .column:nth-child(1) {
        text-align: left;
    }

    footer .column:nth-child(2) {
        text-align: right;
    }
</style>
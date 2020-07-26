<script>
    import Button from '../Common/Button.svelte';
    import Select from '../Common/Select.svelte';
    import File from '../Common/File.svelte';
    import Modal from '../Common/Modal.svelte';

    import {getConfig} from "../../../plugin-config";
    import twitch from '../../../services/twitch';
    import {getPlayerInfo} from "../../../scoresaber/players";
    import {getCacheAndConvertIfNeeded, setCache} from "../../../store";
    import {dateFromString} from "../../../utils/date";
    import exportJsonData from "../../../utils/export";

    export let profileId;

    let mainUserId;
    let playerInfo;

    let showTwitchBtn = true;
    let twitchBtnLabel = '';
    let twitchBtnTitle = '';
    let twitchBtnDisabled = false;

    let showSettingsModal = false;

    let importBtn;

    let config;

    const songTypes = [
        {id: 'all', label: 'Wszystkie'},
        {id: 'rankeds', label: 'Tylko rankingowe'},
        {id: 'unrankeds', label: 'Tylko nierankingowe'},
        {id: 'rankeds_with_not_played', label: 'Tryb snajpera'},
    ]
    let configSongType = songTypes[0];

    const viewTypes = [
        {id: 'compact', label: 'Kompaktowy'},
        {id: 'tabular', label: 'Tabelaryczny'}
    ]
    let configViewType = viewTypes[0];

    const allSortTypes = [
        {label: 'Data zagrania', field: 'timeset'},
        {label: 'Gwiazdki', field: 'stars', onlyTypes: ['all', 'rankeds', 'rankeds_with_not_played']},
        {label: 'PP', field: 'pp', onlyTypes: ['rankeds', 'rankeds_with_not_played']},
        {label: 'Celność', field: 'acc', onlyTypes: ['rankeds', 'rankeds_with_not_played']}
    ]
    const filterSortTypes = () => allSortTypes.filter(st => !st.onlyTypes || st.onlyTypes.includes(configSongType.id))
    let sortTypes = filterSortTypes();
    let configSortType = filterSortTypes()[0];

    const allColumns = [
        {
            label: 'Gwiazdki',
            name: '*',
            key: 'stars',
            selected: false,
            type: 'song',
            displayed: true,
            valueProps: {zero: "-", suffix: "*"}
        },
        {
            label: 'Max PP',
            name: 'Max PP',
            key: 'maxPp',
            selected: false,
            type: 'song',
            displayed: true,
            valueProps: {zero: "-", suffix: "pp"}
        },
        {
            label: 'BPM',
            name: 'BPM',
            key: 'bpm',
            selected: false,
            type: 'song',
            displayed: true,
            valueProps: {zero: "-", suffix: "", digits: 0}
        },
        {
            label: 'NJS',
            name: 'NJS',
            key: 'njs',
            selected: false,
            type: 'song',
            displayed: true,
            valueProps: {zero: "-", suffix: "", digits: 0}
        },
        {
            label: 'NPS',
            name: 'NPS',
            key: 'nps',
            selected: false,
            type: 'song',
            displayed: true,
            valueProps: {zero: "-", suffix: ""}
        },
        {
            label: 'Czas',
            name: 'Czas',
            key: 'length',
            selected: false,
            type: 'song',
            displayed: true,
            valueProps: {zero: "-"}
        },
        {
            label: 'Data zagrania',
            compactLabel: null,
            name: 'Data',
            key: 'timeset',
            selected: true,
            type: 'series',
            displayed: true,
            valueProps: {prevValue: null}
        },
        {
            label: '+PP global',
            compactLabel: null,
            name: '+PP',
            key: 'diffPp',
            selected: false,
            type: 'series',
            displayed: false,
            valueProps: {zero: "-", suffix: "pp global", withSign: true, useColorsForValue: true}
        },
        {
            label: 'PP',
            name: 'PP',
            key: 'pp',
            selected: true,
            type: 'series',
            valueProps: {zero: "-", suffix: "pp"},
            displayed: true
        },
        {
            label: 'Ważone PP',
            compactLabel: 'Ważone',
            name: 'wPP',
            key: 'weightedPp',
            selected: false,
            type: 'series',
            displayed: true,
            valueProps: {zero: "-", suffix: "pp"}
        },
        {
            label: 'Celność',
            compactLabel: null,
            name: 'Acc',
            key: 'acc',
            selected: true,
            type: 'series',
            displayed: true,
            valueProps: {zero: "-", suffix: "%"}
        },
        {
            label: 'Wynik',
            compactLabel: null,
            name: 'Wynik',
            key: 'score',
            selected: true,
            type: 'series',
            displayed: true,
            valueProps: {digits: 0, zero: "-"}
        },
        {
            label: 'Różnice',
            name: 'Różnice',
            key: 'diff',
            selected: true,
            type: 'other',
            displayed: true
        },
        {
            label: 'Pokazuj potencjał',
            name: 'Potencjał',
            key: 'estimate',
            type: 'other',
            displayed: false,
            selected: false
        },
        {
            label: 'Ikony akcji',
            name: '',
            key: 'icons',
            type: 'additional',
            displayed: true,
            selected: true
        },
    ]
    const columns = allColumns.filter(c => c.displayed);
    let configShowColumns = columns.filter(c => c.selected);

    const shownIcons = [
        {label: "!bsr", id: "bsr"},
        {label: "Beat Saver", id: "bs"},
        {label: "Podgląd mapy", id: "preview"},
        {label: "Twitch", id: "twitch"}
    ];
    let configShowIcons = shownIcons.map(i => i);

    const allItemsPerPage = [5, 10, 15, 20, 25, 50];
    let itemsPerPage = allItemsPerPage.map(i => ({label: i, val: i}));
    let configItemsPerPage = itemsPerPage[1];

    (async () => {
        config = await getConfig();
        mainUserId = config && config.users && config.users.main ? config.users.main : null;
        playerInfo = await getPlayerInfo(profileId);

        const defaultSongType = songTypes.find(s => s.id === config.songBrowser.defaultType);
        if (defaultSongType) configSongType = defaultSongType;

        const defaultShowColumns = columns.filter(c => Array.isArray(config.songBrowser.showColumns) && config.songBrowser.showColumns.includes(c.key))
        if (defaultShowColumns) configShowColumns = defaultShowColumns;

        const defaultShowIcons = shownIcons.filter(i => config.songBrowser.showIcons.includes(i.id))
        if (defaultShowIcons) configShowIcons = defaultShowIcons;

        const defaultSort = filterSortTypes().find(s => s.field === config.songBrowser.defaultSort)
        if (defaultSort) configSortType = defaultSort;

        const defaultItemsPerPage = itemsPerPage.find(i => i.val === config.songBrowser.itemsPerPage);
        if (defaultItemsPerPage) configItemsPerPage = defaultItemsPerPage;

        filterSortTypes();

        let twitchProfile = await twitch.getProfileName(profileId);
        if (profileId && twitchProfile) {
            const data = await getCacheAndConvertIfNeeded();

            const twitchToken = await twitch.getCurrentToken();
            const tokenExpireInDays = twitchToken ? Math.floor(twitchToken.expires_in / 1000 / 60 / 60 / 24) : null;
            const tokenExpireSoon = tokenExpireInDays <= 3;

            showTwitchBtn = config && config.profile && config.profile.showTwitchIcon || tokenExpireSoon;

            twitchBtnLabel = twitchToken ? (!tokenExpireSoon ? 'Połączono' : 'Odnów') : 'Połącz';
            twitchBtnTitle = twitchToken && tokenExpireInDays > 0 ? `Pozostało dni: ${tokenExpireInDays}` : null;
            twitchBtnDisabled = !tokenExpireSoon;

            if (!twitchProfile.id) {
                const fetchedProfile = await twitch.getProfileByUsername(twitchProfile.login);
                if (fetchedProfile) {
                    twitchProfile = Object.assign({}, twitchProfile, fetchedProfile);
                    data.twitch.users[profileId] = twitchProfile;
                }
            }

            if (twitchProfile.id) {
                const scoresRecentPlay = data.users[profileId].recentPlay ? data.users[profileId].recentPlay : data.users[profileId].lastUpdated;
                const twitchLastUpdated = twitchProfile.lastUpdated;

                if (!scoresRecentPlay || !twitchLastUpdated || dateFromString(scoresRecentPlay) > dateFromString(twitchLastUpdated)) {
                    const videos = await twitch.getVideos(twitchProfile.id);
                    if (videos && videos.data) {
                        twitchProfile.videos = videos.data;
                        twitchProfile.lastUpdated = new Date();

                        await setCache(data);
                    }
                }
            }
        }
    })()

    async function setAsMainProfile() {
        if (!profileId) return;

        const data = await getCacheAndConvertIfNeeded();
        data.config.users.main = profileId;
        await setCache(data);

        location.reload();
    }

    function importData(e) {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        if (file.type !== 'application/json') {
            alert('Wybierz plik JSON zawierający eksport danych');
            return;
        }

        importBtn.$set({disabled: true});

        const reader = new FileReader();

        reader.onload = async function (e) {
            try {
                const json = JSON.parse(e.target.result);

                if (!json || !json.version || !json.lastUpdated || !json.users) {
                    alert('Niepoprawny plik eksportu');
                    return;
                }

                if (json.version < 1.2) {
                    alert('Import pliku ze starszej wersji pluginu nie jest wspierany');
                    return;
                }

                await setCache(json);

                window.location.reload(false);
            } catch (_) {
                alert("Nieprawidłowy plik JSON");
            } finally {
                importBtn.$set({disabled: false});
            }
        };

        reader.readAsText(file);
    }

    function exportData() {
        exportJsonData();
    }

    function onSongTypeChange() {
        sortTypes = filterSortTypes();
        if (!sortTypes.find(st => st.field === configSortType.field)) {
            configSortType = sortTypes[0];
        }
    }

    async function saveConfig() {
        config.songBrowser.defaultType = configSongType.id;
        config.songBrowser.defaultView = configViewType.id;
        config.songBrowser.defaultSort = configSortType.field;
        config.songBrowser.showColumns = configShowColumns.map(c => c.key);
        config.songBrowser.showIcons = configShowIcons.map(i => i.id);
        config.songBrowser.itemsPerPage = configItemsPerPage.val;

        const data = await getCacheAndConvertIfNeeded();
        await setCache(data);

        window.location.reload();
    }
</script>

{#if playerInfo}
    {#if showTwitchBtn}
        <Button iconFa="fab fa-twitch" label={twitchBtnLabel} title={twitchBtnTitle} disabled={twitchBtnDisabled}
                type="twitch" on:click={() => window.location.href = twitch.getAuthUrl(profileId ? profileId : '')}/>
    {/if}

    {#if profileId !== mainUserId}
        <Button iconFa="fas fa-user-check" type="primary" title="Ustaw jako główny profil" on:click={setAsMainProfile}/>
    {:else}
        <Button iconFa="fas fa-cog" title="Ustawienia" on:click={() => showSettingsModal = true}/>
    {/if}
{/if}

{#if showSettingsModal}
    <Modal closeable={false} on:close={() => showSettingsModal = false}>
        <header>
            <div class="menu-label">Ustawienia</div>
        </header>

        <main>
            <section>
                <div class="menu-label">Przeglądarka nut</div>
                <label class="checkbox">
                    <input type="checkbox" bind:checked={config.songBrowser.autoTransform}>
                    Automatycznie transformuj
                </label>

                <div class="columns">
                    <div class="column is-one-third">
                        <label class="menu-label">Domyślny rodzaj</label>
                        <Select bind:value={configSongType} items={songTypes} on:change={onSongTypeChange}/>
                    </div>

                    <div class="column is-one-third">
                        <label class="menu-label">Domyślny widok</label>
                        <Select bind:value={configViewType} items={viewTypes}/>
                    </div>

                    <div class="column is-one-third">
                        <label class="menu-label">Domyślne kolumny</label>
                        <Select multiple bind:value={configShowColumns} items={columns}/>
                    </div>
                </div>

                <div class="columns">
                    <div class="column is-one-third">
                        <label class="menu-label">Domyślne sortowanie</label>
                        <Select bind:value={configSortType} items={sortTypes}/>
                    </div>

                    <div class="column is-one-third">
                        <label class="menu-label">Domyślne ikony</label>
                        <Select multiple bind:value={configShowIcons} items={shownIcons} />
                    </div>

                    <div class="column is-one-third">
                        <label class="menu-label">Liczba pozycji na stronę</label>
                        <Select bind:value={configItemsPerPage} items={itemsPerPage} />
                    </div>
                </div>
            </section>

            <section>
                <div class="menu-label">Profil</div>
                <div>
                    <label class="checkbox">
                        <input type="checkbox" bind:checked={config.profile.enlargeAvatar}>
                        Powiększaj avatar
                    </label>

                    <label class="checkbox">
                        <input type="checkbox" bind:checked={config.profile.showChart}>
                        Pokazuj wykres
                    </label>

                    <label class="checkbox">
                        <input type="checkbox" bind:checked={config.profile.showOnePpCalc}>
                        Pokazuj kalkulator +1PP
                    </label>
                </div>
            </section>

            <section>
                <div class="menu-label">Ranking nutki</div>
                <div>
                    <label class="checkbox">
                        <input type="checkbox" bind:checked={config.songLeaderboard.showDiff}>
                        Pokazuj różnice
                    </label>

                    <label class="checkbox">
                        <input type="checkbox" bind:checked={config.songLeaderboard.showWhatIfPp}>
                        Pokazuj "jeśli tak zagrasz"
                    </label>
                </div>
            </section>

            <section>
                <div class="menu-label">Domyślna lista nut</div>
                <div>
                    <label class="checkbox">
                        <input type="checkbox" bind:checked={config.ss.song.enhance}>
                        Dodawaj wynik/dokładność
                    </label>

                    <label class="checkbox">
                        <input type="checkbox" bind:checked={config.ss.song.showDiff}>
                        Pokazuj różnice
                    </label>

                    <label class="checkbox">
                        <input type="checkbox" bind:checked={config.ss.song.showWhatIfPp}>
                        Pokazuj "jeśli tak zagrasz"
                    </label>
                </div>
            </section>
        </main>

        <footer class="columns">
            <div class="column">
                <Button iconFa="fas fa-save" label="Zapisz" type="primary" on:click={saveConfig}/>
                <Button label="Anuluj" on:click={() => showSettingsModal = false}/>
            </div>

            <div class="column">
                <Button iconFa="fas fa-download" label="Eksport" on:click={exportData}/>
                <File iconFa="fas fa-upload" label="Import" accept="application/json" bind:this={importBtn}
                      on:change={importData}/>
            </div>
        </footer>
    </Modal>
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

    label {
        margin-right: .75em;
        margin-bottom: .75em;
    }

    .menu-label {
        margin-top: .75em;
        margin-bottom: .25em;
    }

    .columns:last-of-type {
        margin-bottom: 0;
    }

    .column {
        text-align: center;
        padding-bottom: 0;
        max-width: 20rem;
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

    footer {
        margin-top: auto;
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
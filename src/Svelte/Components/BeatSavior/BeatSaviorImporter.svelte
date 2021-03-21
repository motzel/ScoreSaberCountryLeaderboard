<script>
    import {onMount} from "svelte";

    import Button from '../Common/Button.svelte';
    import Modal from '../Common/Modal.svelte';

    import {getPlayerInfo} from "../../../scoresaber/players";
    import {_} from "../../stores/i18n";
    import cacheRepository from "../../../db/repository/cache";
    import {getClientTimezoneOffset, truncateDate} from '../../../utils/date'
    import {getMainPlayerId} from '../../../plugin-config'
    import Progress from '../Common/Progress.svelte'
    import beatSaviorFilesRepository from '../../../db/repository/beat-savior-files';
    import {convertArrayToObjectByKey} from '../../../utils/js'
    import eventBus from '../../../utils/broadcast-channel-pubsub'
    import nodeSync from '../../../utils/multinode-sync'
    import BeatSaviorIcon from './BeatSaviorIcon.svelte'
    import {
        getPlayerScoresForBeatSaviorMatching, IMPORT_ONLY_SS_SCORES,
        parseBeatSaviorLine,
        storeBeatSaviorData,
    } from '../../../scoresaber/beatsavior'

    const BEAT_SAVIOR_DIRECTORY_HANDLE = 'beatSaviorDirHandle';

    export let profileId;

    let directoryHandle = null;
    let mainPlayerId = null;
    let playersScores = {};

    let error = null;

    let showModal = false;
    let importing = false;
    let importCompleted = false;
    let importProgress = 0;
    let importMax = 0;
    let importLabel = '';
    let importSubLabel = '';

    let playerInfo = null;

    let manualRefreshingInProgress = false;

    let initialized = false;

    onMount(async () => {
        if (!window.showDirectoryPicker) return;

        mainPlayerId = await getMainPlayerId();
        if (!mainPlayerId || !profileId || mainPlayerId !== profileId) return;

        await getPlayerScores(mainPlayerId);
        await updatePlayerInfo();

        directoryHandle = await cacheRepository().get(BEAT_SAVIOR_DIRECTORY_HANDLE);

        const startManualRefreshingUnsubscriber = eventBus.on('start-data-refreshing', () => {
            manualRefreshingInProgress = true
        });
        const stopManualRefreshingUnsubscriber = eventBus.on('data-refreshed', () => {
            manualRefreshingInProgress = false
        });
        const playerScoresUpdatedUnsubscriber = eventBus.on('player-scores-updated', async ({playerId}) => {
            if (playersScores[playerId]) {
                await getPlayerScores(playerId);
            }

            if (playerId === profileId) {
                await updatePlayerInfo();
            }
        });

        initialized = true;

        return () => {
            startManualRefreshingUnsubscriber();
            stopManualRefreshingUnsubscriber();
            playerScoresUpdatedUnsubscriber();
        }
    })

    async function verifyFileOrDirectoryPermission(fileHandle, readWrite = false) {
        const options = {mode: readWrite ? 'readwrite' : 'read'};

        // Check if permission was already granted. If so, return true.
        if ((await fileHandle.queryPermission(options)) === 'granted') {
            return true;
        }

        // Request permission. If the user grants permission, return true.
        if ((await fileHandle.requestPermission(options)) === 'granted') {
            return true;
        }

        throw $_.beatSaviorImporter.noPermissionException;
    }

    async function updatePlayerInfo() {
        playerInfo = await getPlayerInfo(profileId);
    }

    async function getPlayerScores(playerId) {
        if (!playersScores[playerId]) {
            importSubLabel = $_.beatSaviorImporter.fetchPlayerScores;

            playersScores[playerId] = await getPlayerScoresForBeatSaviorMatching(playerId);
        }
    }

    async function readBsd(fileHandle, alreadyImportedWithSize = null) {
        const userGrantedPermission = await verifyFileOrDirectoryPermission(fileHandle);
        if (!userGrantedPermission) throw $_.beatSaviorImporter.noPermissionException;

        const clientTimezoneOffset = getClientTimezoneOffset();

        importSubLabel = $_.beatSaviorImporter.loading;

        const file = await fileHandle.getFile();
        if (!file || (alreadyImportedWithSize && file.size === alreadyImportedWithSize)) return null;

        const contents = await file.text();
        const lines = contents.split('\n');

        const nameMatches = file.name.toLowerCase().match(/^(?:(\d{2})-(\d{2})-(\d{4})|(\d{4})-(\d{2})-(\d{2}))\.bsd$/);
        if (!nameMatches || !nameMatches.length === 7) {
            return null;
        }

        const date = truncateDate(new Date(`${nameMatches[4] ? `${nameMatches[4]}-${nameMatches[5]}-${nameMatches[6]}` : `${nameMatches[3]}-${nameMatches[2]}-${nameMatches[1]}`}T00:00:00${clientTimezoneOffset}`), 'day');
        const timestamp = date.getTime();

        let data = {name: file.name, date: date, size: file.size, lastModified: new Date(file.lastModified)};
        try {
            const header = JSON.parse(lines.shift());

            const {playerID: playerId, saberAColor, saberBColor} = header;

            data = {...data, fileId: playerId + '_' + timestamp, playerId, saberAColor, saberBColor, plays: []}
        } catch {
            return null;
        }

        if (!data.playerId) return null;

        await getPlayerScores(data.playerId);

        lines.forEach((line, idx) => {
            try {
                const jsonLine = JSON.parse(line);
                if (!jsonLine || !jsonLine.playerID) throw 'No player';

                const playData = parseBeatSaviorLine(
                  jsonLine,
                  playersScores ? playersScores[jsonLine.playerID] : null,
                  idx,
                  data.saberAColor, data.saberBColor,
                  data.fileId, data.name, timestamp
                );
                if (playData) data.plays.push(playData);
            } catch {
                // skip line
            }
        });

        return data;
    }

    async function importBeatSaviorData(directoryHandle) {
        if (!directoryHandle) throw $_.beatSaviorImporter.noDirectoryHandleException;

        await verifyFileOrDirectoryPermission(directoryHandle);

        const alreadyImportedFiles = convertArrayToObjectByKey((await beatSaviorFilesRepository().getAll()), 'name');

        const items = [];
        for await (const entry of directoryHandle.values()) {
            items.push(entry);
        }

        importProgress = 0;
        importMax = items.length;

        let allNewPlaysFromImport = [];
        for (const entry of items) {
            importLabel = entry.name;
            importSubLabel = '';

            // skip non-BSD files
            if ('file' !== entry.kind || !entry.name.endsWith('.bsd') || entry.name === '_PBScoreGraphs.bsd') {
                importSubLabel = $_.beatSaviorImporter.skipping;
                importProgress++;
                continue;
            }

            const prevFileSize = alreadyImportedFiles[entry.name] ? alreadyImportedFiles[entry.name].size : null;
            const fileData = await readBsd(entry, prevFileSize);
            if (!fileData) {
                importSubLabel = $_.beatSaviorImporter.skipping;
                importProgress++;
                continue;
            }

            importSubLabel = $_.beatSaviorImporter.savingToDb;

            const {plays, ...data} = fileData;
            await storeBeatSaviorData(plays, data);

            importProgress++;

            allNewPlaysFromImport = allNewPlaysFromImport.concat(plays.filter(play => !IMPORT_ONLY_SS_SCORES || play.ssScore));
        }

        if (allNewPlaysFromImport && allNewPlaysFromImport.length)
            eventBus.publish('player-beat-savior-updated', {
                nodeId: nodeSync().getId(),
                playerId: allNewPlaysFromImport[0].playerId,
                matchedBsData: allNewPlaysFromImport,
            });
    }

    function onClose() {
        showModal = false
        importCompleted = false;
    }

    async function onSelectFolder() {
        try {
            directoryHandle = await window.showDirectoryPicker();
            if (directoryHandle) await cacheRepository().set(directoryHandle, BEAT_SAVIOR_DIRECTORY_HANDLE);
        } catch (e) {
            throw $_.beatSaviorImporter.noFolderSelectedException;
        }
    }

    async function onImport() {
        const FIVE_MINUTES = 1000 * 60 * 5;

        try {
            if (!window.showDirectoryPicker) throw $_.beatSaviorImporter.fileSystemApiNotAvailableException;

            const arePlayerScoresFresh = playerInfo && playerInfo.lastUpdated && (new Date() - playerInfo.lastUpdated < FIVE_MINUTES);
            if (!arePlayerScoresFresh) throw $_.beatSaviorImporter.oldPlayerScoresException;

            if (!directoryHandle) await onSelectFolder();

            await verifyFileOrDirectoryPermission(directoryHandle);

            importing = true;
            error = null;

            eventBus.publish('dl-manager-pause-cmd');
            // TODO: wait for current background download to be completed

            await importBeatSaviorData(directoryHandle);

            eventBus.publish('beat-savior-data-updated', {nodeId: nodeSync().getId()});

            importCompleted = true;
        } catch (e) {
            error = e.toString();
        } finally {
            importing = false;

            eventBus.publish('dl-manager-unpause-cmd');
        }
    }
</script>

{#if initialized && profileId}
    {#if !showModal}
        <Button type="default"}
                title={$_.beatSaviorImporter.header}
                disabled={manualRefreshingInProgress}
                on:click={() => showModal = true}>
            <BeatSaviorIcon />
        </Button>
    {:else}
        <Modal closeable={false} width="35em" on:close={() => showModal = false}>
            <header>
                <div class="menu-label">{$_.beatSaviorImporter.header}</div>
            </header>

            <main>
                {#if importing}
                    <p>{$_.beatSaviorImporter.importInProgress}</p>

                    <div class="progress-container">
                        <Progress value={importProgress} max={importMax} label={importLabel} subLabel={importSubLabel} />
                    </div>
                {:else}
                    {#if importCompleted}
                        <p>{$_.beatSaviorImporter.importCompleted}</p>
                    {:else}
                        <p>{@html $_.beatSaviorImporter.introduction }</p>
                        {#if !directoryHandle}
                            <p>{@html $_.beatSaviorImporter.selectFolderFirst }</p>
                        {:else}
                            <p>{@html $_.beatSaviorImporter.selectFolderConsecutive }</p>
                        {/if}
                        <p>{@html $_.beatSaviorImporter.permissions }</p>
                    {/if}
                {/if}

                {#if error}<div class="error">{error}</div>{/if}
            </main>

            <footer class="columns">
                <div class="column">
                    {#if directoryHandle && !importing && !importCompleted}<Button label={$_.beatSaviorImporter.selectOtherFolderBtn} on:click={onSelectFolder}/>{/if}
                </div>

                <div class="column">
                    {#if !importing && !importCompleted}<Button label={$_.beatSaviorImporter.importBtn} type="primary" on:click={onImport}/>{/if}
                    <Button label={$_.common.close} on:click={onClose} disabled={importing} />
                </div>
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

    p {
        margin: 1em 0;
    }

    p:last-of-type {
        margin-bottom: .5em;
    }

    .menu-label {
        margin-top: .75em;
        margin-bottom: .25em;
        color: var(--alternate);
    }

    .columns:last-of-type {
        margin-bottom: 0;
    }

    .progress-container {
        margin: 1em 0;
    }

    .progress-container :global(progress) {
        width: 95%;
    }

    @media screen and (max-width: 768px) {
        .column {
            max-width: none;
        }
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
<script>
    import {onMount} from "svelte";

    import Button from '../Common/Button.svelte';
    import Modal from '../Common/Modal.svelte';

    import {getPlayerInfo, getScoresByPlayerId, isDataAvailable} from "../../../scoresaber/players";
    import {_, trans} from "../../stores/i18n";
    import cacheRepository from "../../../db/repository/cache";
    import {dateFromString, getClientTimezoneOffset, truncateDate} from '../../../utils/date'
    import {getMainPlayerId} from '../../../plugin-config'
    import Progress from '../Common/Progress.svelte'
    import {db} from '../../../db/db'
    import beatSaviorFilesRepository from '../../../db/repository/beat-savior-files';
    import scoresRepository from '../../../db/repository/scores'
    import {convertArrayToObjectByKey} from '../../../utils/js'
    import eventBus from '../../../utils/broadcast-channel-pubsub'
    import nodeSync from '../../../utils/multinode-sync'

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

        const startManualRefreshingUnsubscriber = eventBus.on('start-data-refreshing', () => {manualRefreshingInProgress = true});
        const stopManualRefreshingUnsubscriber = eventBus.on('data-refreshed', () => {manualRefreshingInProgress = false});
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

            playersScores[playerId] = (await getScoresByPlayerId(playerId))
              .reduce((cum, s) => {
                  if (!s.timeset || !s.hash || !s.diffInfo || !s.diffInfo.diff) return cum;

                  const currentTzTimestamp = truncateDate(dateFromString(s.timeset), 'day').getTime();
                  const diff = s.diffInfo.diff.toLowerCase();

                  if (!cum[s.hash]) cum[s.hash] = {};
                  if (!cum[s.hash][diff]) cum[s.hash][diff] = {};
                  if (!cum[s.hash][diff][currentTzTimestamp]) cum[s.hash][diff][currentTzTimestamp] = [];

                  cum[s.hash][diff][currentTzTimestamp].push({...s});

                  return cum;
              }, {});
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

        const nameMatches = file.name.toLowerCase().match(/^(\d{2})-(\d{2})-(\d{4})\.bsd$/);
        const date = nameMatches && nameMatches.length === 4
          ? truncateDate(new Date(`${nameMatches[3]}-${nameMatches[2]}-${nameMatches[1]}T00:00:00${clientTimezoneOffset}`), 'day')
          : truncateDate(new Date(file.lastModified), 'day');
        const timestamp = date.getTime();

        let data = {name: file.name, date: date, size: file.size, lastModified: new Date(file.lastModified)};
        try {
            const header = JSON.parse(lines.shift());

            const {playerID: playerId, saberAColor, saberBColor} = header;

            data = {...data, playerId, saberAColor, saberBColor, plays: []}
        } catch {
            return null;
        }

        if (!data.playerId) return null;

        await getPlayerScores(data.playerId);

        lines.forEach((line, idx) => {
            try {
                const {deepTrackers, ...lineData} = JSON.parse(line);

                const {
                    playerID: playerId,
                    songID: hash, songName, songArtist: songAuthorName, songMapper: levelAuthorName,
                    songDataType: dataType, songDifficulty: difficultyName, songDuration: duration, songSpeed: speed,
                    songStartTime: start,
                    trackers,
                } = lineData;

                const notesCount =
                  trackers && trackers.winTracker && trackers.winTracker.won && trackers.hitTracker &&
                  trackers.hitTracker.leftNoteHit !== undefined && trackers.hitTracker.rightNoteHit !== undefined &&
                  trackers.hitTracker.miss !== undefined
                    ? trackers.hitTracker.leftNoteHit + trackers.hitTracker.rightNoteHit + trackers.hitTracker.miss
                    : null;

                const playData = {
                    songId: playerId + '_' + hash + '_' + difficultyName,
                    fileName: file.name,
                    playerId,
                    start,
                    speed,
                    notesCount,
                    hash,
                    difficultyName,
                    songName,
                    songAuthorName,
                    levelAuthorName,
                    duration,
                    dataType,
                    saberAColor: data.saberAColor,
                    saberBColor: data.saberBColor,
                    trackers,
                };

                if (
                  start === 0 &&
                  trackers && trackers.scoreTracker && trackers.scoreTracker.score &&
                  playersScores[playerId] && playersScores[playerId][hash] &&
                  playersScores[playerId][hash][difficultyName] &&
                  playersScores[playerId][hash][difficultyName] &&
                  playersScores[playerId][hash][difficultyName][timestamp]) {
                    const score = playersScores[playerId][hash][difficultyName][timestamp].find(s => s.score === trackers.scoreTracker.score);
                    if (score) playData.ssScore = score;
                }

                data.plays.push(playData);
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

        let scoresToSave = [];

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

            // -- START OF TRANSACTION --

            const tx = db.transaction(['beat-savior', 'beat-savior-files', 'scores'], 'readwrite', {durability: 'strict'});

            const {plays, ...data} = fileData;

            // store current file
            const bsFilesStore = tx.objectStore('beat-savior-files');
            await bsFilesStore.put({...data, importedOn: new Date()});

            const bsStore = tx.objectStore('beat-savior');

            // remove previously imported data for current file
            let cursor = await bsStore.index('beat-savior-fileName').openCursor(IDBKeyRange.bound(data.name, data.name));
            while (cursor) {
                await cursor.delete();
                cursor = await cursor.continue();
            }

            // store new plays
            await Promise.all(plays.map(async play => {
                const {ssScore, ...playData} = play;

                bsStore.put(playData);
            }));

            // store scores
            const scoresStore = tx.objectStore('scores');
            await Promise.all(plays.filter(play => play.ssScore).map(async play => {
                const {ssScore, ...playData} = play;
                const scoreData = {...ssScore, beatSavior: playData};

                scoresStore.put(scoreData);
                scoresToSave.push(scoreData);
            }));

            await tx.done;

            // -- END OF TRANSACTION --

            scoresRepository().addToCache(scoresToSave);

            importProgress++;
        }
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
        <Button iconFa="fas fa-file-import" type="default"}
                label={$_.beatSaviorImporter.beatSaviorBtn} title={$_.beatSaviorImporter.header}
                disabled={manualRefreshingInProgress}
                on:click={() => showModal = true}/>
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
                        {#if !directoryHandle}<p>{@html $_.beatSaviorImporter.selectFolder }</p>{/if}
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
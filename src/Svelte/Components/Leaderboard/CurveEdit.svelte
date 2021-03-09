<script>
  import {onMount} from 'svelte'
  import {ppCurve} from '../../../scoresaber/pp'
  import cacheRepository from '../../../db/repository/cache'
  import eventBus from '../../../utils/broadcast-channel-pubsub';

  import Modal from '../Common/Modal.svelte'
  import Button from '../Common/Button.svelte'

  const PP_CURVE_KEY = 'ppCurve';
  const PP_CURVE2_KEY = 'ppCurve2';

  let showModal = false;
  let curve = [...ppCurve];
  let curve2 = [...ppCurve];

  const sortCurve = curve => curve.sort((a,b) => a.at - b.at);
  const addNew = curve => sortCurve(curve.concat([{at:0, value: 0}]));
  const removeIdx = (curve, idx) => sortCurve(curve.slice(0, idx).concat(curve.slice(idx+1)));

  curve = sortCurve(curve);
  curve2 = sortCurve(curve2);

  async function onSave() {
    curve = sortCurve(curve);
    curve2 = sortCurve(curve2);

    await cacheRepository().set(curve, PP_CURVE_KEY);
    await cacheRepository().set(curve2, PP_CURVE2_KEY);

    eventBus.publish('curve-changed', {curve, curve2});

    showModal = false;
  }

  onMount(async () => {
    let dbCurve = await cacheRepository().get(PP_CURVE_KEY);
    if (dbCurve) {
      curve = sortCurve([...dbCurve]);
    }

    dbCurve = await cacheRepository().get(PP_CURVE2_KEY);
    if (dbCurve) {
      curve2 = sortCurve([...dbCurve]);
    }
  })
</script>

<Button iconFa="fa fa-chart-line" title="Edit PP curve" on:click={() => showModal = true}/>
{#if showModal}
  <Modal closeable={false} on:close={() => showModal = false}>
    <header>
      <div class="menu-label">PP Curve edit</div>
    </header>

    <main>
      <div>
        <Button iconFa="fa fa-plus" label="Add new" on:click={() => curve = addNew(curve)} />
        <Button iconFa="fa fa-trash" label="Reset" on:click={() => curve = [...ppCurve]} />

        {#if curve && curve.length}
        {#each curve as item, idx}
          <div class="item">
            <input type="number" min="0" max="150" step="0.1" bind:value={item.at} on:blur={() => curve = sortCurve(curve)} />
            <input type="number" min="0" max="10" step="0.001" bind:value={item.value} />
            <Button iconFa="fa fa-times" on:click={() => curve = removeIdx(curve,idx)} />
          </div>
        {/each}
        {/if}
      </div>

      <div>
        <Button iconFa="fa fa-plus" label="Add new" on:click={() => curve2 = addNew(curve2)} />
        <Button iconFa="fa fa-trash" label="Reset" on:click={() => curve2 = [...ppCurve]} />

        {#if curve2 && curve2.length}
        {#each curve2 as item, idx}
          <div class="item">
            <input type="number" min="0" max="150" step="0.1" bind:value={item.at} on:blur={() => curve2 = sortCurve(curve2)} />
            <input type="number" min="0" max="10" step="0.001" bind:value={item.value} />
            <Button iconFa="fa fa-times" on:click={() => curve2 = removeIdx(curve2, idx)} />
          </div>
        {/each}
        {/if}
      </div>
    </main>

    <footer>
      <Button iconFa="fa fa-save" label="Save" on:click={onSave}/>
      <Button label="Cancel" on:click={() => showModal = false}/>
    </footer>
  </Modal>
{/if}

<style>
    main {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        padding-top: 1rem;
    }

    main > * {
        width: 48%;
        margin-right: 1%;
    }

    .item {
        display: flex;
        align-items: center;
        font-size: .75rem
    }
    .item > * {
        margin-right: .5rem;
        margin-bottom: .5rem;
    }

    footer {
        display: flex;
        justify-content: flex-end;
        padding-top: 1rem;
    }

    footer :global(> *) {
        margin-left: .5rem !important;
    }
</style>
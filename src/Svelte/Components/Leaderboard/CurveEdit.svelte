<script>
  import {onMount} from 'svelte'
  import {ppCurve} from '../../../scoresaber/pp'
  import cacheRepository from '../../../db/repository/cache'
  import eventBus from '../../../utils/broadcast-channel-pubsub';

  import Modal from '../Common/Modal.svelte'
  import Button from '../Common/Button.svelte'

  const PP_CURVE_KEY = 'ppCurve'

  let showModal = false;
  let curve = [...ppCurve];
  sortCurve();

  async function onSave() {
    sortCurve();

    await cacheRepository().set(curve, PP_CURVE_KEY);
    eventBus.publish('curve-changed', curve);

    showModal = false;
  }

  function onAdd() {
    curve = curve.concat([{at:0, value: 0}])
    sortCurve();
  }

  function sortCurve() {
    curve = curve.sort((a,b) => a.at - b.at);
  }

  onMount(async () => {
    const dbCurve = await cacheRepository().get(PP_CURVE_KEY);
    if (dbCurve) {
      curve = [...dbCurve];
      sortCurve();
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
      <Button iconFa="fa fa-plus" label="Add new" on:click={onAdd} />

      {#each curve as item, idx}
        <div class="item">
          <input type="number" min="0" max="150" step="0.1" bind:value={item.at} on:blur={sortCurve} />
          <input type="number" min="0" max="10" step="0.001" bind:value={item.value} />
          <Button iconFa="fa fa-times" on:click={() => curve = curve.slice(0, idx).concat(curve.slice(idx+1))} />
        </div>
      {/each}
    </main>

    <footer>
      <Button iconFa="fa fa-save" label="Save" on:click={onSave}/>
      <Button label="Cancel" on:click={() => showModal = false}/>
    </footer>
  </Modal>
{/if}

<style>
    main {
        padding-top: 1rem;
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
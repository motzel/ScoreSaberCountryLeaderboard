<script>
  import {_} from "../../stores/i18n";
  import eventBus from '../../../utils/broadcast-channel-pubsub';

  import Button from '../Common/Button.svelte';
  import Modal from "../Common/Modal.svelte";

  let showConfirmationModal = false;

  function onOk() {
    eventBus.publish('country-set', {country: null, persist: true, reload: true});

    showConfirmationModal = false;
  }

  function onCancel() {
    showConfirmationModal = false;
  }
</script>

<div class="remove-button">
  <Button iconFa="far fa-trash-alt" label={$_.dashboard.removeCurrentCountry} type="text"
          on:click={() => showConfirmationModal = true}/>
</div>

{#if showConfirmationModal}
  <Modal closeable={false} on:close={() => showConfirmationModal = false} width="auto" height="auto">
    <main>
      {$_.dashboard.removeCurrentCountryConfirmationTitle}

      <p>{$_.dashboard.removeCurrentCountryConfirmationContent}</p>
    </main>

    <footer>
      <Button iconFa="far fa-trash-alt" label={$_.dashboard.removeCurrentCountry} type="primary" on:click={onOk}/>

      <Button label={$_.common.cancel} on:click={onCancel}/>
    </footer>
  </Modal>
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
        margin-top: 1rem;
        font-size: 1rem;
        color: var(--textColor);
    }

    footer {
        margin-top: 2rem;
        display: flex;
        justify-content: flex-end;
    }

    footer :global(.button) {
        margin-right: .25rem !important;
    }

    .remove-button {
        font-size: .75em;
        text-align: right;
    }
</style>
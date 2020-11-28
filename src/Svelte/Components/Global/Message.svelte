<script>
  import {onMount} from "svelte";
  import eventBus from '../../../utils/broadcast-channel-pubsub';
  import {_, trans} from "../../stores/i18n";

  import Button from '../Common/Button.svelte';
  import Modal from "../Common/Modal.svelte";

  export let message;
  export let secondaryMessage;
  export let closeButtonLabel;

  onMount(async () => {
    eventBus.on('show-global-message', ({message: newMessage, secondaryMessage: newSecondaryMessage, closeButtonLabel: newCloseButtonLabel}) => {
      message = newMessage;
      secondaryMessage = newSecondaryMessage;
      closeButtonLabel = newCloseButtonLabel;
    })

    eventBus.on('hide-global-message', () => onDismiss());
  });

  function onDismiss() {
    message = null;
    secondaryMessage = null;
    closeButtonLabel = null;
  }
</script>

{#if message && message.length}
  <Modal closeable={false} on:close={onDismiss} width="auto" height="auto">
    <main>
      <header>{message}</header>
     {#if secondaryMessage && secondaryMessage.length}
       <p>{secondaryMessage}</p>
     {/if}
    </main>

    <footer>
     {#if closeButtonLabel}
       <Button label={closeButtonLabel} on:click={onDismiss}/>
     {/if}
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
    color: var(--textColor);
  }

  header {
    margin-bottom: 1rem;
    color: var(--alternate);
  }

  main p {
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
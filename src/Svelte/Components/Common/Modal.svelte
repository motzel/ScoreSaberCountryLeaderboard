<script>
    import {createEventDispatcher, onDestroy} from 'svelte';
    import Button from '../Common/Button.svelte';

    const dispatch = createEventDispatcher();
    const close = () => dispatch('close');

    export let showCloseButton = true;
    export let closeable = true;

    let modal;

    const handle_keydown = e => {
        if (closeable && e.key === 'Escape') {
            close();
            return;
        }

        if (e.key === 'Tab') {
            // trap focus
            const nodes = modal.querySelectorAll('*');
            const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);

            let index = tabbable.indexOf(document.activeElement);
            if (index === -1 && e.shiftKey) index = 0;

            index += tabbable.length + (e.shiftKey ? -1 : 1);
            index %= tabbable.length;

            tabbable[index].focus();
            e.preventDefault();
        }
    };

    const previously_focused = typeof document !== 'undefined' && document.activeElement;

    if (previously_focused) {
        onDestroy(() => {
            previously_focused.focus();
        });
    }
</script>

<svelte:window on:keydown={handle_keydown}/>

<div class="ss-modal-background" on:click={() => {closeable ? close() : null}}></div>

<div class="ss-modal" role="dialog" aria-modal="true" bind:this={modal}>
    <div class="inner">
        <slot></slot>
    </div>

    {#if closeable && showCloseButton}
        <Button iconFa="fas fa-times" on:click={close} cls="close"/>
    {/if}
</div>

<style>
    .ss-modal-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1000;
    }

    .ss-modal {
        position: fixed;
        left: 50%;
        top: 50%;
        width: calc(100vw - 4em);
        height: 34rem;
        max-width: 60em;
        max-height: calc(100vh - 4em);
        overflow: auto;
        transform: translate(-50%, -50%);
        padding: 1em;
        border-radius: 0.2em;
        font-size: .875rem;
        color: var(--textColor);
        background: var(--background);
        z-index: 2000;
    }

    .ss-modal .inner {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    :global(.ss-modal button.close) {
        position: absolute !important;
        top: .5em;
        right: .5em;
        height: auto;
        margin: 0 !important;
        padding: 0 !important;
    }
</style>
<script lang="ts">

    import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
    export let data;

    const signoutPopup: PopupSettings = {
        event: 'click',
        target: 'signoutPopup',
        placement: 'bottom-end'
    };

</script>

<svelte:head>
    <title>Node Server Manager</title>
</svelte:head>

<div class="w-full h-full grid grid-rows-[max-content_1fr] overflow-hidden">
    <div class="w-full h-max grid grid-cols-[1fr_max-content] p-6 gap-4 items-center">
        <a href="/" class="font-heading-token text-2xl w-max">
            node server <span class="text-secondary-700-200-token">manager</span>
        </a>
        <button class="font-heading-token btn hover:variant-ghost-surface" use:popup={signoutPopup}>signed in as&nbsp;<span class="text-secondary-700-200-token">{data.name}</span></button>
    </div>
    <div class="h-full overflow-hidden">
        <slot />
    </div>
</div>

<div data-popup="signoutPopup">
    <div class="btn-group-vertical variant-ghost-surface">
        <a href="/logout" class="variant-filled-error hover:variant-filled-error">Log out</a>
    </div>
</div>
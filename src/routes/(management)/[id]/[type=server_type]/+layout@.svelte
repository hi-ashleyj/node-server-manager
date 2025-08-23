<script lang="ts">

    import Info from "@ajwdmedia/svelterial-icons/Outlined/Info.svelte";
    import Environment from "@ajwdmedia/svelterial-icons/Outlined/Tune.svelte";
    import Terminal from "@ajwdmedia/svelterial-icons/Outlined/Terminal.svelte";
    import Home from "@ajwdmedia/svelterial-icons/Outlined/Home.svelte";

    import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
    export let data;

    const signoutPopup: PopupSettings = {
        event: 'click',
        target: 'signoutPopup',
        placement: 'bottom-end'
    };

    import { page } from "$app/stores";

</script>


<div class="w-full h-full grid grid-rows-[max-content_1fr] overflow-hidden">
    <div class="w-full h-max grid grid-cols-[max-content_1fr_max-content] p-6 gap-4 items-center">
        <a href="/" class="px-3 py-3 m-[-0.5em] bg-surface-200-700-token rounded-xl border-1 border-surface-400-500-token">
            <Home size="2em" />
        </a>
        <a href="/{$page.params.id}/{$page.params.type}" class="font-heading-token text-2xl w-max lowercase pl-2">
            {data?.server?.info.name ?? "server name"} <span class="text-secondary-700-200-token">{$page.params.type}</span>
        </a>
        <button class="font-heading-token btn hover:variant-ghost-surface" use:popup={signoutPopup}>signed in as&nbsp;<span class="text-secondary-700-200-token">{data.name}</span></button>
    </div>
    <div class="h-full overflow-hidden">
        <div class="h-full px-6 pb-6 gap-6 grid grid-cols-[max-content_1fr]">

            <div class="h-max grid grid-cols-1 gap-4 w-max">
                <a href={`/${$page.params.id}/${$page.params.type}`} class="border-1 border-surface-400-500-token w-10 h-10 grid place-items-center rounded-3xl" class:bg-surface-300-600-token={$page.route.id !== "/(management)/[id]/test"} class:bg-primary-300-600-token={$page.route.id === "/(management)/[id]/test"}>
                    <Info fill="white" size="1.5em" />
                </a>
                <a href={`/${$page.params.id}/${$page.params.type}/env`} class="border-1 border-surface-400-500-token w-10 h-10 grid place-items-center rounded-3xl" class:bg-surface-300-600-token={$page.route.id !== "/(management)/[id]/test/env"} class:bg-primary-300-600-token={$page.route.id === "/(management)/[id]/test/env"}>
                    <Environment fill="white" size="1.5em" />
                </a>
                <a href={`/${$page.params.id}/${$page.params.type}/logs`} class="border-1 border-surface-400-500-token w-10 h-10 grid place-items-center rounded-3xl" class:bg-surface-300-600-token={$page.route.id !== "/(management)/[id]/test/logs"} class:bg-primary-300-600-token={$page.route.id === "/(management)/[id]/test/logs"}>
                    <Terminal fill="white" size="1.5em" />
                </a>
            </div>
        
            <slot />
        
        </div>
    </div>
</div>

<div data-popup="signoutPopup">
    <div class="btn-group-vertical variant-ghost-surface">
        <a href="/logout" class="variant-filled-error hover:variant-filled-error" >Log out</a>
    </div>
</div>
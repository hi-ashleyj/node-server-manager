<script lang="ts">

    import Info from "@ajwdmedia/svelterial-icons/Outlined/Info.svelte";
    import Environment from "@ajwdmedia/svelterial-icons/Outlined/Tune.svelte";
    import Terminal from "@ajwdmedia/svelterial-icons/Outlined/Terminal.svelte";

    import { page } from "$app/stores";

    export let data;

</script>

<div class="h-full px-6 pb-6 gap-6 grid grid-cols-[max-content_1fr]">

    <div class="h-max grid grid-cols-1 gap-4 w-max">
        <a href={`/${$page.params.id}/test`} class="border-1 border-surface-400-500-token w-10 h-10 grid place-items-center rounded-3xl" class:bg-surface-300-600-token={$page.route.id !== "/(management)/[id]/test"} class:bg-primary-300-600-token={$page.route.id === "/(management)/[id]/test"}>
            <Info fill="white" size="1.5em" />
        </a>
        <a href={`/${$page.params.id}/test/env`} class="border-1 border-surface-400-500-token w-10 h-10 grid place-items-center rounded-3xl" class:bg-surface-300-600-token={$page.route.id !== "/(management)/[id]/test/env"} class:bg-primary-300-600-token={$page.route.id === "/(management)/[id]/test/env"}>
            <Environment fill="white" size="1.5em" />
        </a>
        <a href={`/${$page.params.id}/test/logs`} class="border-1 border-surface-400-500-token w-10 h-10 grid place-items-center rounded-3xl" class:bg-surface-300-600-token={$page.route.id !== "/(management)/[id]/test/logs"} class:bg-primary-300-600-token={$page.route.id === "/(management)/[id]/test/logs"}>
            <Terminal fill="white" size="1.5em" />
        </a>
    </div>

    <slot />

</div>
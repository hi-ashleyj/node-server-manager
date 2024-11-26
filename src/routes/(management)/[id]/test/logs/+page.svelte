<script lang="ts">

    import Terminal from "@ajwdmedia/svelterial-icons/Outlined/Terminal.svelte";
    import {page} from "$app/stores";
    import { decodeTime } from "ulidx";
    export let data;

    const timeFormat = new Intl.DateTimeFormat("en-NZ", { day: "numeric", hour: "numeric", hour12: true, year: "numeric", month: "short", minute: "2-digit", second: "2-digit" })

</script>

<div class="w-full h-full card p-6 grid grid-rows-[max-content_1fr] overflow-hidden">
    <div class="grid grid-cols-[max-content_1fr] items-center gap-4">
        <Terminal size="2em" fill="white" />
        <span class="text-xl">Logs</span>
    </div>
    <div class="h-full overflow-y-scroll pt-4">
        {@debug data}
        {#each data.files as file}
            <a class="grid grid-cols-[1fr_max-content] px-3 py-2 border-surface-300-600-token border rounded-lg my-2" href="/{$page.params.id}/test/logs/{file}">
                <span>Run {file}</span>
                <span class="text-surface-700-200-token">{timeFormat.format(new Date(decodeTime(file)))}</span>
            </a>
        {:else}
            <div class="grid w-full h-full place-items-center">
                <div class="text-surface-700-200-token">No Files Found</div>
            </div>
        {/each}
    </div>
</div>
<script lang="ts">

    import { decodeLogFile } from "$lib/log/decode";
    import Terminal from "@ajwdmedia/svelterial-icons/Outlined/Terminal.svelte";
    import LogViewer from "../../../LogViewer.svelte";
    import { page } from "$app/stores";
    import { decodeTime } from "ulidx";
    export let data;

    $: res = decodeLogFile(data.file ?? "");
    // TODO: All the error checking
    $: file = res && res[0] ? res[0][1] : { logs: [] };

    const timeFormat = new Intl.DateTimeFormat("en-NZ", { day: "numeric", hour: "numeric", hour12: true, year: "numeric", month: "short", minute: "2-digit", second: "2-digit" })
    $: diff = res && res[0] && file.start && file.end ? file.end - file.start : 0;
    $: seconds = (diff / 1000) % 60;
    $: minutes = Math.floor(diff / 60000) % 60;
    $: hours = Math.floor(diff / 60 / 60000) % 24
    $: days = Math.floor(diff / 24 / 60 / 60000);

    $: uncreditted = res[0] ? [
        { type: "log", message: "STARTED", at: file.start },
        ...(file.logs ?? []),
        { type: "log", message: file.circumstance, at: file.end },
        { type: "log", message: `RAN FOR ${days > 0 ? `${days} DAYS, ` : ""}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toFixed(6).padStart(2, "0")}`, at: file.end },
    ] : [ { type: "error", message: "Failed to parse log file", at: 0 }, { type: "error", message: res[1], at: 0 }];

</script>


<div class="w-full h-full card p-6 gap-4 grid grid-rows-[max-content_1fr] overflow-hidden">

    <div class="grid grid-cols-[max-content_1fr_max-content] items-center gap-4">
        <Terminal size="2em" fill="white" />
        <span class="text-xl">Run {$page.params.file}</span>
        <span>{timeFormat.format(new Date(decodeTime($page.params.file)))}</span>
    </div>

    <LogViewer logs={uncreditted} />
</div>
<script lang="ts">

    import Status from "@ajwdmedia/svelterial-icons/Outlined/QueryStats.svelte";
    import {browser} from "$app/environment";
    import {serverUrl} from "$lib";
    export let data;

    type StatusResponse = { status: "unknown" } | { status: "down" } | { status: "up", requests: 0 } | { status: "up", frequency: number, min: number, max: number, avg: number };

    const getServerStatus = async (port: number): Promise<StatusResponse> => {
        if (!browser) {
            return { status: "unknown" };
        }
        try {
            const res = await fetch(serverUrl(window.location, port) + "/__nsm__/stats");
            if (res.ok) {
                return await res.json();
            } else {
                // noinspection ExceptionCaughtLocallyJS
                throw "";
            }
        } catch (_) {
            return { status: "down" };
        }
    }

</script>

<div class="w-full h-full card p-6 grid grid-rows-[max-content_max-content_1fr] overflow-hidden">
    <div class="grid grid-cols-[max-content_max-content_1fr_max-content] items-center gap-4">
        <Status size="2em" fill="white" />
        <span class="text-xl">Status</span>
        <div>
            {#await getServerStatus(data.server.info.port + 30000)}
                <span class="w-2 h-2 bg-surface-500 rounded-full inline-block align-middle mr-2"></span>
                <span class="align-middle text-sm">{data.status?.running ? "running • " : ""}loading</span>
            {:then result}
                {#if result.status === "unknown"}
                    <span class="w-2 h-2 bg-surface-500 rounded-full inline-block align-middle mr-2"></span>
                    <span class="align-middle text-sm">unknown</span>
                {:else if result.status === "down" && data.status?.running}
                    <span class="w-2 h-2 bg-error-500 rounded-full inline-block align-middle mr-2"></span>
                    <span class="align-middle text-sm">running • nsm down</span>
                {:else if result.status === "down"}
                    <span class="w-2 h-2 bg-error-500 rounded-full inline-block align-middle mr-2"></span>
                    <span class="align-middle text-sm">down</span>
                {:else if result.status === "up" && "requests" in result}
                    <span class="w-2 h-2 bg-success-500 rounded-full inline-block align-middle mr-2"></span>
                    <span class="align-middle text-sm">no requests</span>
                {:else if result.status === "up"}
                    <span class="w-2 h-2 bg-success-500 rounded-full inline-block align-middle mr-2"></span>
                    <span class="align-middle text-sm">{result.frequency.toFixed(2)}/m - {result.avg.toFixed(2)}ms - {result.min.toFixed(2)}ms - {result.max.toFixed(2)}ms</span>
                {/if}
            {:catch e}
                <span>failure</span>
            {/await}
        </div>
        <div class="btn-group variant-filled-surface">
            <button disabled={data.status?.installed}>Setup</button>
            <button disabled={!data.status?.installed}>Update</button>
            <button disabled={data.status?.running || data.status?.operating || !data.status?.installed || (!data.status?.dependencies && data.server.info.install.length > 0) || !data.status?.built}>Start</button>
            <button disabled={!data.status?.running || data.status?.operating}>Stop</button>
        </div>
    </div>

    <div class="grid grid-cols-[max-content_1fr_max-content] gap-y-2 gap-x-6 py-4 items-center">
        <span>Source</span>
        <span>{data.status.installed ? "Downloaded" : "Missing"}</span>
        <div class="btn-group variant-filled-surface w-max place-self-end">
            <button disabled={data.status?.installed}>Clone</button>
            <button disabled={!data.status?.installed}>Pull</button>
        </div>

        <span>Packages</span>
        <span>{data.status.dependencies ? "Installed" : data.server.info.install !== "" ? "Not Installed" : "Not Configured"}</span>
        <div class="btn-group variant-filled-surface w-max place-self-end">
            <button disabled={data.status?.installed}>Install</button>
        </div>

        <span>Build</span>
        <span>{data.status.built ? "Ready" : data.server.info.build !== "" ? "Not Built" : "Not Configured"}</span>
        <div class="btn-group variant-filled-surface w-max place-self-end">
            <button disabled={data.status?.installed}>Build</button>
        </div>
    </div>
    <div class="bg-black rounded-container-token text-white border-surface-300-600-token py-2 px-4 overflow-y-scroll">
        <div class="grid grid-cols-[max-content_1fr] font-mono-token gap-x-4">
            {#each data.recent as log (log.at)}
                {#if log.type === "log"}
                    <span class="text-primary-500-400-token">LOG</span>
                {:else if log.type === "error"}
                    <span class="text-error-500-400-token">ERR</span>
                {/if}
<!--                LOOK OUT - THERE'S A NBSP ON THE NEXT LINE-->
                <span>{#each log.message.split("\n") as line}{line.split(" ").join("\u{A0}")}<br/>{/each}</span>
            {/each}
        </div>
    </div>
</div>
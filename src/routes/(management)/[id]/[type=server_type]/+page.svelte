<script lang="ts">

    import Status from "@ajwdmedia/svelterial-icons/Outlined/QueryStats.svelte";
    import {browser} from "$app/environment";
    import {serverUrl} from "$lib";
    import LogViewer from "../LogViewer.svelte";
    import { controlRequest, type Controls } from "./make-control-request";
    import { page } from "$app/stores";
    export let data;
    import { onMount } from "svelte";
    import { EventsSubscription } from "$lib/package/event-svelte";
    import type { Works, WorkZones } from "./workstype";
    import Works from "./Works.svelte";

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

    let works: Works = {
        zone: "none",
    }
    let worksTimeout: number | undefined;

    const workTypeMap: { [ X in Controls ]: WorkZones } = {
        "build": "build",
        "clone": "git",
        "install": "install",
        "pull": "git",
        "setup": "script",
        "start": "script",
        "stop": "script",
        "update": "script",
    }

    const work = async (control: Controls) => {
        if (worksTimeout) clearTimeout(worksTimeout)
        works = {
            zone: workTypeMap[control],
            spinner: true,
        }
        const [ ok, status, and ] = await controlRequest($page.params, control);
        if (ok) {
            works = {
                zone: works.zone,
                success: true,
            };
        } else {
            works = {
                zone: works.zone,
                error: "" + status,
            }
        }
        worksTimeout = setTimeout(() => { works = { zone: "none" }}, 3000);
    }


    let logList = [];
    onMount(() => {
        logList = data.recent ?? [];
    })

</script>

<div class="w-full h-full card p-6 grid grid-rows-[max-content_max-content_1fr] overflow-hidden">
    <div class="grid grid-cols-[max-content_max-content_1fr_max-content_max-content] items-center gap-4">
        <Status size="2em" fill="white" />
        <span class="text-xl">Status</span>
        <div>
            <span class="w-2 h-2 rounded-full inline-block align-middle mr-2" class:bg-success-500={data?.status?.running} class:bg-error-500={!data?.status?.running}></span>
            <span class="align-middle text-sm">{data?.status?.running ? "running" : "down"}</span>
            <span class="align-middle text-sm mx-1">•</span>
            {#await getServerStatus((data?.server?.info.port ?? 0) + 30000)}
                <span class="align-middle text-sm">loading</span>
            {:then result}
                {#if result.status === "unknown"}
                    <span class="align-middle text-sm">unknown</span>
                {:else if result.status === "down"}
                    <span class="align-middle text-sm">stats fail</span>
                {:else if result.status === "up" && "requests" in result}
                    <span class="align-middle text-sm">no requests</span>
                {:else if result.status === "up"}
                    <span class="align-middle text-sm">{result.frequency.toFixed(2)}/m - {result.avg.toFixed(2)}ms - {result.min.toFixed(2)}ms - {result.max.toFixed(2)}ms</span>
                {/if}
            {:catch e}
                <span>error loading stats</span>
            {/await}
        </div>
        <Works {works} zone="script" />
        <div class="btn-group variant-filled-surface">
            <button on:click={() => work("setup")}  disabled={data.status?.installed}>Setup</button>
            <button on:click={() => work("update")} disabled={!data.status?.installed}>Update</button>
            <button on:click={() => work("start")}  disabled={data.status?.running || data.status?.operating || !data.status?.installed || (!data.status?.dependencies && data.server.info.install.length > 0) || !data.status?.built}>Start</button>
            <button on:click={() => work("stop")}   disabled={!data.status?.running || data.status?.operating}>Stop</button>
        </div>
    </div>

    <div class="grid grid-cols-[max-content_1fr_max-content_max-content] gap-y-2 gap-x-6 py-4 items-center">
        <span>Source</span>
        <span>{data.status.installed ? `Downloaded Package Version ${data.status.version}` : "Missing"}</span>
        <Works {works} zone="git" />
        <div class="btn-group variant-filled-surface w-max place-self-end">
            <button on:click={() => work("clone")}>Clone</button>
            <button on:click={() => work("pull")}  disabled={!data.status?.installed}>Pull</button>
        </div>

        <span>Packages</span>
        <span>{data.status.dependencies ? "Installed" : data.server.info.install !== "" ? "Not Installed" : "Not Configured"}</span>
        <Works {works} zone="install" />
        <div class="btn-group variant-filled-surface w-max place-self-end">
            <button on:click={() => work("install")} disabled={!data.status?.installed || data.server.info.install === ""}>Install</button>
        </div>

        <span>Build</span>
        <span>{data.status.built ? "Ready" : data.server.info.build !== "" ? "Not Built" : "Not Configured"}</span>
        <Works {works} zone="build" />
        <div class="btn-group variant-filled-surface w-max place-self-end">
            <button on:click={() => work("build")} disabled={!data.status?.installed || data.server.info.build === ""}>Build</button>
        </div>
    </div>
    <LogViewer logs={logList} />
    <EventsSubscription channel="/__nsm__process__/{$page.params.id}/{$page.params.type.toUpperCase()}" on:message={({ detail }) => logList = [ ...logList, detail.message ]} exact={false} />
</div>
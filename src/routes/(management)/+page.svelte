<script lang="ts">

    import Edit from "@ajwdmedia/svelterial-icons/Outlined/Edit.svelte";
    import OpenInNew from "@ajwdmedia/svelterial-icons/Outlined/OpenInNew.svelte";
    import { browser } from "$app/environment";
    import { serverUrl } from "$lib";
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

<div class="grid overflow-hidden grid-rows-[1fr_max-content] h-full">

    <div class="h-full overflow-y-auto">
        <div class="h-max px-6">
            <a href="/new" class="mb-4 w-full p-4 btn variant-filled-surface">
                Setup New Server
            </a>
            {#if data.servers}
                {#each data.servers as server (server.id)}
                    <div class="w-full mb-4 p-4 grid grid-cols-[1fr_max-content] card">

                        <div class="grid grid-rows-[1fr_max-content] h-full gap-2 w-max">
                            <span class="text-3xl align-middle">{server.name} @ {server.port}</span>
                            <a href={server.repo} target="_blank" class="text-surface-600-300-token">{server.repo}</a>
                        </div>

                        <div class="grid grid-cols-[1fr_1fr_max-content] w-[40vw] gap-3">
                            <div class="grid grid-rows-[1fr_max-content] h-full gap-2">
                                <div class="grid grid-cols-[1fr_max-content] btn-group variant-filled-surface">
                                    <a href="/{server.id}/test"><div class="w-full text-left">Test</div></a>
                                    <a href={browser ? serverUrl(window.location, server.port + 30000) : "#"} target="_blank">
                                        <OpenInNew fill="white" />
                                    </a>
                                </div>
                                <div class="px-4">
                                    <span class="w-2 h-2 rounded-full inline-block align-middle mr-2" class:bg-success-500={server.test.active} class:bg-error-500={!server.test.active}></span>
                                    <span class="align-middle text-sm">{server.test.active ? "running" : "down"}</span>
                                    <span class="align-middle text-sm mx-1">•</span>
                                    
                                    {#await getServerStatus(server.port + 30000)}
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
                            </div>

                            <div class="grid grid-rows-[1fr_max-content] h-full gap-2">
                                <div class="grid grid-cols-[1fr_max-content] btn-group variant-filled-surface">
                                    <a href="/{server.id}/production"><div class="text-left w-full">Production</div></a>
                                    <a href={browser ? serverUrl(window.location, server.port) : "#"} target="_blank">
                                        <OpenInNew fill="white" />
                                    </a>
                                </div>
                                <div class="px-4">
                                    <span class="w-2 h-2 rounded-full inline-block align-middle mr-2" class:bg-success-500={server.prod.active} class:bg-error-500={!server.prod.active}></span>
                                    <span class="align-middle text-sm">{server.prod.active ? "running" : "down"}</span>
                                    <span class="align-middle text-sm mx-1">•</span>
                                    
                                    {#await getServerStatus(server.port)}
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
                            </div>

                            <div class="grid grid-rows-1 h-full gap-2">
                                <a href="/{server.id}/settings" class="btn variant-filled-surface aspect-square">
                                    <Edit size="2em" fill="white" />
                                </a>
                            </div>

                        </div>

                    </div>
                {/each}
            {:else}
                <div>System is not configured</div>
            {/if}
        </div>
    </div>

    <div class="p-6 text-center">
        <button class="btn variant-ghost-surface">Logs</button>
        <a href="/users" class="btn variant-ghost-surface">Users</a>
        <a href="/settings" class="btn variant-ghost-surface">Settings</a>
    </div>

</div>
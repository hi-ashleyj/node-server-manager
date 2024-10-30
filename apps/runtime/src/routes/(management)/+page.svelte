<script lang="ts">

    export let data;

</script>

<div class="grid overflow-hidden grid-rows-[1fr_max-content] h-full">

    <div class="h-full overflow-y-auto">
        <div class="h-max px-6">
            {#each data.servers as server (server.id)}
                <div class="w-full mb-4 p-4 card">

                    <div class="grid grid-rows-[max-content_max-content] gap-2">
                        <span class="text-2xl">{server.name} @ {server.port}</span>
                        <a href={server.repo} target="_blank" class="text-surface-600-300-token">{server.repo}</a>
                    </div>

                </div>
            {/each}
        </div>
    </div>

    <div class="p-6 text-center">
        <button class="btn variant-ghost-surface">Logs</button>
        <button class="btn variant-ghost-surface">Users</button>
        <button class="btn variant-ghost-surface">Settings</button>
    </div>

</div>
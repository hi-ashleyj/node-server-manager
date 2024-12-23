<script lang="ts">

    import type { Log } from "$lib/log/common";

    export let logs: Log[];

    export const fmt = (time: number) => {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDay();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
    }

</script>


<div class="bg-black rounded-container-token text-white border-surface-300-600-token py-2 px-4 overflow-y-scroll">
    <div class="grid grid-cols-[max-content_max-content_1fr] font-mono-token gap-x-4">
        {#each logs as log (log.at)}
            <span class="text-surface-300">{fmt(log.at)}</span>
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
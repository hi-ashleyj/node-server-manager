<script>

    import Environment from "@ajwdmedia/svelterial-icons/Outlined/Tune.svelte";
    import ExistingLine from "./ExistingLine.svelte";
    import InputWrapper from "$lib/InputWrapper.svelte";
    import { Circle } from "svelte-loading-spinners";
    import Delete from "@ajwdmedia/svelterial-icons/Outlined/Delete.svelte";
    import Save from "@ajwdmedia/svelterial-icons/Outlined/Save.svelte";
    export let data;

</script>


<div class="w-full h-full card p-6 gap-4 grid grid-rows-[max-content_1fr] overflow-hidden">

    <div class="grid grid-cols-[max-content_1fr] items-center gap-4">
        <Environment fill="white" size="2em" />
        <span class="text-xl">Environment Variables</span>
    </div>

    <div class="overflow-y-scroll">

        <div class="items-center grid grid-cols-[1fr_1fr_2fr_4em] gap-4 pb-2">
            <span class="">PORT</span>
            <span class="text-right text-surface-700-200-token italic"></span>
            <div class="input-group bg-surface-50-900-token grid grid-cols-[1fr_max-content_max-content]">
                <input type="text" value={data.port} disabled />
                <button class="variant-glass-surface" disabled>
                    <Save size="1.5em" fill="rgb(var(--color-surface-400))" />
                </button>
                <button class="variant-glass-surface" disabled>
                    <Delete size="1.5em" fill="rgb(var(--color-surface-400))" />
                </button>
            </div>
            <span></span>
        </div>

        {#each data.dual as line (line.key)}
            <ExistingLine {line} />
        {/each}
    </div>

</div>
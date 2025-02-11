<script lang="ts">

    import type { Works } from "./workstype.js";
    import { Circle } from "svelte-loading-spinners";
    import Check from "@ajwdmedia/svelterial-icons/Outlined/Check.svelte";

    export let works: Works;
    export let zone: WorkZones;

</script>

<div class="pr-4">
    {#if zone === works.zone}
        {#if works.spinner}
            <span class="inline-block align-middle">
                <Circle size="1.5" unit="em" color="#ffffff" />
            </span>
        {:else if works.success}
            <span class="align-middle">
                <Check fill="white" size="1.5em" />
            </span>
        {:else if zone.error}
            <span class="text-error-700-200-token align-middle">
                {zone.error}
            </span>
        {/if}
    {/if}
</div>
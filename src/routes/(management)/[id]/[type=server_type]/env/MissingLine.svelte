<script lang="ts">

    import Save from "@ajwdmedia/svelterial-icons/Outlined/Add.svelte";
    import type { EnvironmentItemMissing } from "$lib/environment";
    import CompleteFormValidator from "$lib/CompleteFormValidator.svelte";
    import InputWrapper from "$lib/InputWrapperWithValidator.svelte";
    import { Circle } from "svelte-loading-spinners";
    import { page } from "$app/stores";
    import { invalidateAll } from "$app/navigation";

    export let line: EnvironmentItemMissing;

    let value;

    let saving = false;
    let saveStatus = "";

    const save = async () => {
        saving = true;

        const res = await fetch(`/${$page.params.id}/${$page.params.type}/env`, {
            method: "PATCH",
            body: JSON.stringify({
                key: line.key,
                value,
            }),
        });

        if (!res.ok) {
            saveStatus = "" + res.status;
        } else {
            saveStatus = "OK";
        }

        setTimeout(() => saveStatus = "", 3000);
        saving = false;
        await invalidateAll();
    }

</script>

<CompleteFormValidator let:count let:valid let:changed let:identical let:ok >
    <div class="items-center grid grid-cols-[1fr_1fr_2fr_4em] gap-4 pb-2">
        <span class="">{line.key}</span>
        <span class="text-right text-surface-700-200-token italic">{line.alt}</span>
        <div class="input-group bg-surface-50-900-token grid grid-cols-[1fr_max-content_max-content]">
            <InputWrapper bind:value={value} initial={""} on:count={count} on:valid={valid} on:changed={changed} let:check validator={(v) => (typeof v === "string" && v.length > 0) ? null : "Required"}>
                <input type="text" bind:value={value} on:input={check} />
            </InputWrapper>
            <button class="variant-filled-surface hover:variant-filled-primary disabled:!variant-glass-surface" disabled={identical || saving || !ok} on:click={save}>
                <Save size="1.5em" />
            </button>
        </div>
        <span>
            {#if saveStatus.length > 0}
                <span class="">{saveStatus}</span>
            {:else if saving}
                <Circle size="1.5" unit="em" color="white" />
            {/if}
        </span>
    </div>
</CompleteFormValidator>

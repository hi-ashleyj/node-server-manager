<script lang="ts">

    import Delete from "@ajwdmedia/svelterial-icons/Outlined/Delete.svelte";
    import Save from "@ajwdmedia/svelterial-icons/Outlined/Save.svelte";
    import type { EnvironmentItemPresent } from "$lib/environment";
    import CompleteFormValidator from "$lib/CompleteFormValidator.svelte";
    import InputWrapper from "$lib/InputWrapper.svelte";
    import { Circle } from "svelte-loading-spinners";
    import { page } from "$app/stores";
    import { invalidateAll } from "$app/navigation";

    export let line: EnvironmentItemPresent;

    let value;

    let saving = false;
    let saveStatus = "";
    let deleting = false;
    let deleteStatus = "";

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

    const deleteMe = async () => {
        deleting = true;

        const res = await fetch(`/${$page.params.id}/${$page.params.type}/env`, {
            method: "DELETE",
            body: JSON.stringify({
                key: line.key,
                value,
            }),
        });

        if (!res.ok) {
            deleteStatus = "" + res.status;
        } else {
            deleteStatus = "OK";
        }

        setTimeout(() => deleteStatus = "", 3000);
        deleting = false;
        await invalidateAll();
    }

</script>

<CompleteFormValidator let:count let:valid let:changed let:identical let:ok >
    <div class="items-center grid grid-cols-[1fr_1fr_2fr_4em] gap-4 pb-2">
        <span class="">{line.key}</span>
        <span class="text-right text-surface-700-200-token italic"></span>
        <div class="input-group bg-surface-50-900-token grid grid-cols-[1fr_max-content_max-content]">
            <InputWrapper bind:value={value} initial={line.current} on:count={count} on:valid={valid} on:changed={changed} let:check>
                <input type="text" bind:value={value} on:input={check} />
            </InputWrapper>
            <button class="variant-filled-surface hover:variant-filled-primary disabled:!variant-glass-surface" disabled={identical || saving || deleting} on:click={save}>
                    <Save size="1.5em" />
            </button>
            <button class="hover:variant-filled-error variant-glass-surface disabled:!variant-glass-surface" disabled={saving || deleting} on:dblclick={deleteMe}>
                <Delete size="1.5em" />
            </button>
        </div>
        <span>
            {#if saveStatus.length > 0}
                <span class="">{saveStatus}</span>
            {:else if deleteStatus.length > 0}
                <span class="">{deleteStatus}</span>
            {:else if saving}
                <Circle size="1.5" unit="em" color="white" />
            {:else if deleting}
                <Circle size="1.5" unit="em" color="rgb(var(--color-error-400))" />
            {/if}
        </span>
    </div>
</CompleteFormValidator>

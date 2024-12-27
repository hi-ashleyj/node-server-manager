<script lang="ts">

    import Save from "@ajwdmedia/svelterial-icons/Outlined/Add.svelte";
    import CompleteFormValidator from "$lib/CompleteFormValidator.svelte";
    import InputWrapper from "$lib/InputWrapperWithValidator.svelte";
    import { Circle } from "svelte-loading-spinners";
    import { page } from "$app/stores";
    import { invalidateAll } from "$app/navigation";

    let key;
    let value;

    let saving = false;
    let saveStatus = "";

    const SYSTEMS = [ "PORT", "NSM_RUNTIME" ];

    const validateName = (val: string): string | null => {
        // noinspection SuspiciousTypeOfGuard
        if (typeof val !== "string") return "Required";
        if (val.length <= 0) return "Required";
        if ($page.data.dual.some(it => it.key === val)) return "Already Present";
        if (SYSTEMS.includes(val)) return "Used By System";
        return null;
    }

    const validateValue = (val: string): string | null => {
        if (typeof key !== "string" || key.length <= 0) return "HIDE"
        // noinspection SuspiciousTypeOfGuard
        if (typeof val !== "string") return "Required";
        if (val.length <= 0) return "Required";
        return null;
    }

    const save = async () => {
        saving = true;

        const res = await fetch(`/${$page.params.id}/${$page.params.type}/env`, {
            method: "PATCH",
            body: JSON.stringify({
                key,
                value,
            }),
        });

        if (!res.ok) {
            saveStatus = "" + res.status;
        } else {
            saveStatus = "OK";
        }

        key = ""
        value = ""

        setTimeout(() => saveStatus = "", 3000);
        saving = false;
        await invalidateAll();
    }

</script>

<CompleteFormValidator let:count let:valid let:changed let:identical let:ok >
    <div class="items-center grid grid-cols-[1fr_1fr_2fr_4em] gap-4 pb-2">
        <InputWrapper bind:value={key} initial={""} on:count={count} on:valid={valid} on:changed={changed} let:check validator={validateName} let:error let:message >
            <div class="grid grid-cols-[1fr_max-content] col-span-2 input-group bg-surface-50-900-token" >
                <input type="text" class="!bg-opacity-20" bind:value={key} on:input={() => { key = key.toUpperCase(); check() }} class:!bg-error-500={error && message !== "Required"} />
                <span class="px-4 h-full bg-opacity-20 grid place-items-center text-error-800-100-token italic" class:bg-error-500={error && message !== "Required"}>{error && message !== "Required" ? message : ""}</span>
            </div>
        </InputWrapper>
        <div class="input-group bg-surface-50-900-token grid grid-cols-[1fr_max-content_max-content_max-content]">
            <InputWrapper bind:value={value} initial={""} on:count={count} on:valid={valid} on:changed={changed} let:check let:error let:message validator={validateValue}>
                <input type="text" bind:value={value} on:input={check} class:variant-ghost-error={error && message !== "HIDE"} />
                <span class="px-4 h-full bg-opacity-20 grid place-items-center text-error-800-100-token italic" class:bg-error-500={error && message !== "HIDE"}>{error && message !== "HIDE" ? message : ""}</span>
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

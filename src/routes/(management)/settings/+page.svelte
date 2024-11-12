<script lang="ts">
    import InputItem from "$lib/InputItem.svelte";
    import CompleteFormValidator from "$lib/CompleteFormValidator.svelte";
    import { invalidateAll } from "$app/navigation";

    export let data;
    let saving = false;

    let node: string;
    let npm: string;
    let git: string;

    const save = async () => {
        saving = true;
        const res = await fetch("/settings", {
            method: "PATCH",
            body: JSON.stringify({ node, npm, git }),
        });

        await invalidateAll();
        saving = false;
    }
</script>

<CompleteFormValidator let:count let:valid let:changed let:ok let:identical>
    <div class="grid overflow-hidden h-full">
        <div class="h-full overflow-y-auto px-6 pb-6">
            <div class="card w-full h-max p-4 mb-4 grid grid-cols-[1fr_2fr] items-center gap-y-4 gap-x-6">
                <div class="text-3xl col-span-2">Settings</div>

                <InputItem caption="Path to Node" initial={data.paths.node} bind:value={node} name="test" type="text" validator={v => v.length > 0 ? null : "Required"} on:valid={valid} on:changed={changed} on:count={count} />
                <InputItem caption="Path to NPM" initial={data.paths.npm} bind:value={npm} name="npm" type="text" validator={v => v.length > 0 ? null : "Required"} on:valid={valid} on:changed={changed} on:count={count} />
                <InputItem caption="Path to Git" initial={data.paths.git} bind:value={git} name="git" type="text" validator={v => v.length > 0 ? null : "Required"} on:valid={valid} on:changed={changed} on:count={count} />

            </div>
            <div class="text-right">
                {#if !data.has_permission}
                    <span class="pr-4 text-error-600-300-token align-middle">Currently missing permission</span>
                {/if}
                {@debug identical, saving, ok}
                <button class="btn align-middle" on:click={save} class:variant-filled-surface={!ok} class:variant-filled-primary={ok} disabled={!ok || saving || identical}>Save</button>
            </div>
        </div>
    </div>
</CompleteFormValidator>
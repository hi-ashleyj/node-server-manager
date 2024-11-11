<script lang="ts">

    import { onMount, createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ invalid: 0 | -1, valid: 1, count: 1 }>();

    export let type: "text" | "number" = "text";
    export let name: string;
    export let caption: string;

    export let value: typeof type extends "text" ? string : number = type === "text" ? "" : 0;
    export let validator: (value: typeof type extends "text" ? string : number) => string | null;
    export let error: boolean;

    let last: string | null = null;

    const check = (f = false) => {
        const res = validator(value);
        if (res === null) {
            last = null;
            if (error === true) dispatch("valid", 1);
            error = false;
        } else {
            last = res;
            if (error === false) dispatch("invalid", f ? 0 : -1);
            error = true;
        }
    }

    onMount(() => {
        dispatch("count");
        check(true);
    });

</script>

<label for={name}>
    {caption}
    {#if error}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-error-600-300-token">{last}</span>
    {/if}
</label>

{#if type === "text"}
    <input type="text" name={name} class="input" class:variant-ghost-surface={!error} class:variant-ghost-error={error} bind:value={value} on:input on:input={check} />
{:else if type === "number"}
    <input type="number" name={name} class="input" class:variant-ghost-surface={!error} class:variant-ghost-error={error} bind:value={value} on:input on:input={check} />
{/if}
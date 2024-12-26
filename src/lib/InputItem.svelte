<script lang="ts" generics='T extends "text" | "number"'>

    import { onMount, createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ valid: 1 | 0 | -1, count: 1, changed: 1 | -1 }>();

    export let type: T = "text";
    export let name: string;
    export let caption: string;

    export let initial: T extends "number" ? number : string = type === "number" ? 0 : "";
    export let value: T extends "number" ? number : string = type === "number" ? 0 : "";
    export let validator: (value: T extends "number" ? number : string) => string | null;
    export let error: boolean = false;

    let last: string | null = null;
    let changed = false;

    const check = (f = false) => {
        const res = validator(value);
        if (res === null) {
            last = null;
            if (error === true || f) dispatch("valid", 1);
            error = false;
        } else {
            last = res;
            if (error === false && !f) dispatch("valid", -1);
            error = true;
        }
        if (value === initial && changed) {
            dispatch("changed", -1);
            changed = false;
        } else if (value !== initial && !changed) {
            dispatch("changed", 1);
            changed = true;
        }
    }

    const initialChanged = (val) => {
        check();
    }
    $: initialChanged(initial);

    onMount(() => {
        value = initial;
        dispatch("count", 1);
        check(true);
    });

</script>

<label for={name}>
    {caption}
    {#if error}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-error-600-300-token">{last}</span>
    {/if}
</label>

{#if $$slots.input}
    <slot name="input" input_for={name} error={error} check={check} value={value}></slot>
{:else}
    {#if type === "text"}
        <input type="text" name={name} class="input" class:variant-ghost-surface={!error} class:variant-ghost-error={error} bind:value={value} on:input={() => check()} />
    {:else if type === "number"}
        <input type="number" name={name} class="input" class:variant-ghost-surface={!error} class:variant-ghost-error={error} bind:value={value} on:input={() => check()} />
    {/if}
{/if}
<script lang="ts" generics='T extends any'>

    import { onMount, createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ valid: 1 | 0 | -1, count: 1, changed: 1 | -1 }>();

    export let initial: T;
    export let value: T;
    export let name: string;

    export let validator: (value: T) => string | null;
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

    const initialChanged = (_) => {
        check();
    }

    $: initialChanged(initial);

    onMount(() => {
        value = initial;
        dispatch("count", 1);
        check(true);
    });

</script>

<slot input_for={name} check={() => check()} value={value} error={error} message={last} />
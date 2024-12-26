<script lang="ts" generics='T extends any'>

    import { onMount, createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ valid: 1 | 0 | -1, count: 1, changed: 1 | -1 }>();

    export let initial: T;
    export let value: T;
    export let name: string;

    let changed = false;

    const check = () => {
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
        dispatch("valid", 1);
        check();
    });

</script>

<slot input_for={name} check={check} value={value} />
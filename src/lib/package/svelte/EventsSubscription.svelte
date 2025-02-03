<script lang="ts">

    import { browser } from "$app/environment";
    import { onMount, createEventDispatcher, tick, onDestroy } from "svelte";
    import { getEventsContext } from "../event-svelte";

    export let channel: string;
    export let exact: boolean;

    const dispatch = createEventDispatcher<{ message: { message: any, channel: string } }>();
    const { events } = getEventsContext();

    let unsub: () => any;

    onMount(async () => {
        if (!browser) return;
        if ($events === null) await tick();0

        const [ yeet, error ] = $events.subscribe((channel, message) => {
            dispatch("message", { channel, message });
        }, channel, exact);
        if (error) console.error(error);
        else unsub = yeet;
    });

    onDestroy(() => {
        if (unsub) unsub();
    })

</script>
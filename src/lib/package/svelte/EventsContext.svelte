<script lang="ts">

    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { connect } from "../event-browser";
    import { prepare } from "../event-svelte";
    import type { ClientAPI } from "../types";

    export let hub: string;

    const work = writable<null | ClientAPI>(null);
    prepare({
        events: {
            subscribe: work.subscribe,
        }
    });

    onMount(() => {
        if (!browser) return;

        const [ api, problem ] = connect({ hub });
        work.set(api);

        return () => {
            work.set(null);
            api.disconnect();
        }
    })

</script>

<slot />
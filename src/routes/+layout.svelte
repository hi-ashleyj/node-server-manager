<script>
    import "../app.css";
    import "../fonts.css";
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from "@floating-ui/dom";
    import { storePopup } from "@skeletonlabs/skeleton";
    import { EventsContext } from "$lib/package/event-svelte";
    import { browser } from "$app/environment";

    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
</script>

<EventsContext hub={browser ? `ws://${window.location.hostname}:14554` : ""}>
    <slot />
</EventsContext>
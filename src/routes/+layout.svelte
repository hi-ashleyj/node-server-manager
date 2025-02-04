<script>
    import "../app.css";
    import "../fonts.css";
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from "@floating-ui/dom";
    import { storePopup, initializeStores, Modal } from "@skeletonlabs/skeleton";
    import { EventsContext } from "$lib/package/event-svelte";
    import { browser } from "$app/environment";
    import { scale } from "svelte/transition";
    import PermissionViewerModal from "$lib/PermissionViewerModal.svelte";

    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
    initializeStores();
</script>

<Modal buttonPositive="variant-filled-primary" 
    transitionIn={scale} 
    transitionOut={scale} 
    transitionInParams={{ duration: 200, start: 0.92 }} 
    transitionOutParams={{ duration: 200, start: 0.92 }}
    components={{ permission: { ref: PermissionViewerModal } }} />

<EventsContext hub={browser ? `ws://${window.location.hostname}:14554` : ""}>
    <slot />
</EventsContext>
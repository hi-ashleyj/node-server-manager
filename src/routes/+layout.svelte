<script>
    import "../app.css";
    import "../fonts.css";
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from "@floating-ui/dom";
    import { storePopup, initializeStores, Modal } from "@skeletonlabs/skeleton";
    import { EventsContext } from "$lib/package/event-svelte";
    import { browser } from "$app/environment";
    import { scale } from "svelte/transition";
    import PermissionViewerModal from "$lib/PermissionViewerModal.svelte";
    import PermissionEditModal from "$lib/PermissionEditModal.svelte";
    import CreateUserModal from "$lib/CreateUserModal.svelte";

    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
    initializeStores();
</script>

<Modal buttonPositive="variant-filled-primary" 
    transitionIn={scale} 
    transitionOut={scale} 
    transitionInParams={{ duration: 200, start: 0.92 }} 
    transitionOutParams={{ duration: 200, start: 0.92 }}
    components={{ 
        permission: { ref: PermissionViewerModal },
        permissionEdit: { ref: PermissionEditModal }, 
        createUser: { ref: CreateUserModal },
        }} />

<EventsContext hub={browser ? `ws://${window.location.hostname}:14554` : ""}>
    <slot />
</EventsContext>
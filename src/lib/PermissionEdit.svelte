<script lang="ts">

    import { Roles } from "$lib/roles";
    import { SlideToggle } from '@skeletonlabs/skeleton';
    import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher<{ status: number }>();

    export let globalAllowed = false;
    export let perms: number;
    export let upstream: number;

    const rolesList = Object.keys(Roles) as (keyof typeof Roles)[];
    $: lsUpstream = rolesList.map(it => (upstream & Roles[it]) > 0);
    $: lsCurrent = rolesList.map(it => (perms & Roles[it]) > 0);

    const rolesTitles: { [X in keyof typeof Roles]: string } = {
        "VIEW_SERVER": "View Server Information",
        "CONFIGURE_TEST": "Edit Test Environment",
        "CONFIGURE_PRODUCTION": "Edit Production Environment",
        "CONTROL_TEST": "Control Test Servers",
        "CONTROL_PRODUCTION": "Control Production Servers",
        "CREATE_SERVER": "Create Servers",
        "MODIFY_SERVER": "Reconfigure Server Settings",
        "DELETE_SERVER": "Delete Servers",
        "ADMINISTRATE_PERMS": "Modify Permissions",
        "ADMINISTRATE_GLOBAL": "Administrate Executable Paths",
        "ADMINISTRATE_USERS": "Create and Modify Users",
    }

    const restrictedRoles: (keyof typeof Roles)[] = [ "ADMINISTRATE_GLOBAL", "ADMINISTRATE_USERS", "ADMINISTRATE_PERMS", "CREATE_SERVER", "DELETE_SERVER" ];

    let editing = 0;
    onMount(() => {
        editing = perms;
    });

    let updateRole = (role: keyof typeof Roles, event: InputEvent) => {
        if (!(event.target && event.target instanceof HTMLInputElement)) return;
        if (event.target.checked) {
            const next = editing | Roles[role];
            dispatch("status", next);
            editing = next;
        } else {
            const next = editing & (4095 - Roles[role]);
            dispatch("status", next);
            editing = next;
        }
    }

</script>

<div class="grid grid-cols-1">
    {#each rolesList as role, idx (role)}
        <div class="p-2 px-4 grid grid-cols-[1fr_max-content_max-content] items-center gap-4">
            <div>{rolesTitles[role]}</div>
            {#if !globalAllowed && restrictedRoles.includes(role)}
                <div class="italic text-error-700-200-token">Global Permission</div>
                <SlideToggle name="CHECKBOX_{role}" disabled={true} active={"bg-surface-500-400-token"} checked={lsUpstream[idx]} />
            {:else if lsUpstream[idx]}
                <div class="italic text-error-700-200-token">Enabled at User Level</div>
                <SlideToggle name="CHECKBOX_{role}" disabled={true} active={"bg-surface-500-400-token"} checked={lsUpstream[idx]} />
            {:else}
                <div></div>
                <SlideToggle name="CHECKBOX_{role}" 
                    active={"bg-primary-500"}
                    on:change={(e) => updateRole(role, e)}
                    bind:checked={lsCurrent[idx]} />
            {/if}
        </div>
    {/each}
</div>
<script lang="ts">

    import { Roles } from "$lib/roles";
    import Check from "@ajwdmedia/svelterial-icons/Outlined/Check.svelte";
    import Uncheck from "@ajwdmedia/svelterial-icons/Outlined/Remove.svelte";

    export let globalAllowed = false;
    export let perms: number;
    export let upstream: number;

    const rolesList = Object.keys(Roles) as (keyof typeof Roles)[];

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

    const restrictedRoles: (keyof typeof Roles)[] = [ "ADMINISTRATE_GLOBAL", "ADMINISTRATE_USERS", "ADMINISTRATE_PERMS" ];

</script>

<div class="grid grid-cols-1">
    {#each rolesList as role}
    {@const hasPerm = (perms & Roles[role]) > 0}
    {@const hasUpstream = (upstream & Roles[role]) > 0}
        <div class="p-2 px-4 grid grid-cols-[1fr_max-content_max-content] items-center gap-4">
            <div>{rolesTitles[role]}</div>
            <div class="italic text-error-700-200-token">{(!globalAllowed && restrictedRoles.includes(role)) ? "Global Permission" : (upstream & Roles[role]) > 0 ? "Enabled at User Level" : ""}</div>
            <div class="h-8 aspect-square rounded-lg grid place-items-center" 
                class:dark:bg-surface-700={!hasUpstream && !hasPerm}
                class:bg-surface-400={!hasUpstream && !hasPerm} 
                class:bg-surface-500={hasUpstream || !hasPerm}
                class:bg-primary-500={!hasUpstream || hasPerm}>
                {#if hasUpstream || hasPerm}
                    <Check size="1.5em" fill="white"/>
                {:else}
                    <Uncheck size="1.5em" fill="white" />
                {/if}
            </div>
            <!-- <SlideToggle name="CHECKBOX_{role}" disabled={(upstream & Roles[role]) > 0 || (!globalAllowed && restrictedRoles.includes(role))} active={(upstream & Roles[role]) > 0 ? "bg-surface-500" : "bg-primary-500"} checked={(upstream & Roles[role]) > 0 || (perms & Roles[role]) > 0} /> -->
        </div>
    {/each}
</div>
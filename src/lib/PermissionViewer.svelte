<script lang="ts">

    import { Roles } from "$lib/roles";
    import { SlideToggle } from '@skeletonlabs/skeleton';

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

</script>

<div class="grid grid-cols-1">
    {#each rolesList as role}
        <div class="p-2 px-4 grid grid-cols-[1fr_max-content_max-content] items-center gap-4">
            <div>{rolesTitles[role]}</div>
            <div class="italic text-error-700-200-token">{(upstream & Roles[role]) > 0 ? "Enabled at User Level" : ""}</div>
            <SlideToggle name="CHECKBOX_{role}" disabled={(upstream & Roles[role]) > 0} active={(upstream & Roles[role]) > 0 ? "bg-surface-500" : "bg-primary-500"} checked={(upstream & Roles[role]) > 0 || (perms & Roles[role]) > 0} />
        </div>
    {/each}
</div>
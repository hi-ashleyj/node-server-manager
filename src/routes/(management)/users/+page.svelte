<script lang="ts">

    import { getModalStore } from "@skeletonlabs/skeleton";
    import encodeHash64 from "crypto-js/enc-base64";
    import sha512 from "crypto-js/sha512";
    import { invalidateAll } from "$app/navigation";
    import Delete from "@ajwdmedia/svelterial-icons/Outlined/Delete.svelte";

    const modals = getModalStore();

    export let data;

    const resetPassword = async (id: string, password: string) => {
        const hash = encodeHash64.stringify(sha512(password));
        const taste = await fetch(`/users/${id}`, {
            method: "POST",
            body: JSON.stringify({ hash }),
        });

        if (taste.ok) {
            console.log("Changed");
        }
    };

    const createUser = async (name: string, password: string) => {
        const hash = encodeHash64.stringify(sha512(password));
        const result = await fetch(`/users`, {
            method: "PUT",
            body: JSON.stringify({ name, hash }),
        });
        await invalidateAll();
    } 

    const deleteUser = async (id: string) => {
        const result = await fetch(`/users/${id}`, {
            method: "DELETE",
        });
        await invalidateAll();
    }

    const updatePermissions = async (id: string, info: { global: number, servers: Record<string, number> }) => {
        const taste = await fetch(`/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify(info),
        });
        if (taste.ok) {
            console.log("Permissions updated");
        }
        await invalidateAll();
    }

</script>

<div class="grid overflow-hidden h-full">
    <div class="h-full overflow-y-auto px-6 pb-6">
        {#if data.mine}
            <div class="card w-full h-max p-4 mb-4 grid grid-cols-1 items-center gap-y-4 gap-x-6">
                <div class="grid grid-cols-[1fr_max-content] items-center">
                    <div>
                        <div class="text-3xl">
                            {data.mine.username}
                        </div>
                        <div class="text-surface-600-300-token italic">
                            Debug ID: {data.mine.id}
                        </div>
                    </div>
                    <div class="btn-group variant-filled-surface w-max">
                        <button on:click={() => modals.trigger({
                            type: "prompt",
                            title: "Change Password",
                            body: "Enter new password",
                            valueAttr: { type: "password", minLength: 8, required: true },
                            response: (r) => r ? resetPassword(data.mine.id, r) : null,
                        })}>Change Password</button>
                        <button on:click={() => modals.trigger({
                            type: "component",
                            component: "permission",
                            title: `Permissions for ${data.mine.username}`,
                            meta: { global: data.mine.roles, server_roles: data.mine.server_roles, username: data.mine.username, servers: data.servers },
                            response: (r) => r ? resetPassword(data.mine.id, r) : null,
                        })}>View Permissions</button>
                    </div>
                </div>
            </div>
        {:else}
            <div class="card w-full h-max p-4 mb-4 grid grid-cols-1 items-center gap-y-4 gap-x-6">
                <div class="grid grid-cols-1 place-items-center">
                    <div class="text-xl py-12 italic text-surface-800-100-token">
                        Unable to load User Information
                    </div>
                </div>
            </div>
        {/if}

        {#if data.all}
            <div class="card w-full h-max p-4 mb-4 grid grid-cols-1 items-center gap-y-4 gap-x-6">
                <div class="grid grid-cols-[1fr_max-content] items-center">
                    <div class="text-3xl">
                        User Management
                    </div>
                    <div class="btn-group variant-filled-surface w-max">
                        <button on:click={() => modals.trigger({
                            type: "component",
                            component: "createUser",
                            title: "Create New User",
                            response: (r) => r ? createUser(r.name, r.password) : null
                        })} >Create New</button>
                    </div>
                </div>
                <hr />
                {#each data.all as user}
                    <div class="grid grid-cols-[1fr_max-content] items-center">
                        <div class="text-xl align-middle">
                            {user.username}<span class="text-sm align-middle italic pl-8 text-surface-600-300-token">{user.id}</span>
                        </div>
                        <div class="btn-group variant-filled-surface w-max">
                            <button on:click={() => modals.trigger({
                                type: "prompt",
                                title: "Reset Password",
                                body: "Enter user's new password",
                                valueAttr: { type: "password", minLength: 8, required: true },
                                response: (r) => r ? resetPassword(user.id, r) : null,
                            })}>Reset Password</button>
                            <button on:click={() => modals.trigger({
                                type: "component",
                                component: "permissionEdit",
                                title: `Permissions for ${user.username}`,
                                meta: { global: user.roles, server_roles: user.server_roles, username: user.username, servers: data.servers },
                                response: (r) => r ? updatePermissions(user.id, r) : null,
                            })}>Edit Permissions</button>
                            <button class="hover:variant-filled-error" on:click={() => modals.trigger({
                                type: "confirm",
                                title: `Confirm: Deleting ${user.username}`,
                                body: "This action is irreversable!",
                                response: (r) => r ? deleteUser(user.id) : null,
                            })}>
                                <Delete fill="white" size="1.5em" />    
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
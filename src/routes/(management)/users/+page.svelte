<script lang="ts">

    import { getModalStore } from "@skeletonlabs/skeleton";
    const modals = getModalStore();

    export let data;

    const resetPassword = (username: string, password: string) => {
        console.log({ username, password });
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
                        <button>Change Password</button>
                        <button>View Permissions</button>
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
                        <button>Create New</button>
                    </div>
                </div>
                <hr />
                {#each data.all as user}
                    <div class="grid grid-cols-[1fr_max-content] items-center">
                        <div class="text-xl align-middle">
                            {user.username}<span class="text-sm align-middle italic pl-10 text-surface-600-300-token">{user.id}</span>
                        </div>
                        <div class="btn-group variant-filled-surface w-max">
                            <button on:click={modals.trigger({
                                type: "prompt",
                                title: "Reset Password",
                                body: "Enter user's new password",
                                valueAttr: { type: "password", minLength: 8, required: true },
                                response: (r) => r ? resetPassword(user.username, r) : null,
                            })}>Reset Password</button>
                            <button on:click={modals.trigger({
                                type: "component",
                                component: "permission",
                                title: "Reset Password",
                                meta: { global: user.roles },
                                response: (r) => r ? resetPassword(user.username, r) : null,
                            })}>Edit Permissions</button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
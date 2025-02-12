<script lang="ts">
	import { type SvelteComponent, onMount } from 'svelte';

	import { getModalStore } from '@skeletonlabs/skeleton';
	import PermissionEdit from "$lib/PermissionEdit.svelte";

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	const modalStore = getModalStore();

	let selected = "";
	let global = 0;
	let servers: Record<string, number> = {};

	$: {
		if ($modalStore[0]) {
			global = $modalStore[0].meta.global;
			servers = Object.assign({}, $modalStore[0].meta.server_roles);
		}
	}

	const permissionChanged = (e: CustomEvent<number>) => {
		if (selected.length) {
			servers[selected] = e.detail;
		} else {
			global = e.detail;
		}
	}

	// Handle Form Submission
	const submit = () => {
		if ($modalStore[0].response) $modalStore[0].response({
			global,
			servers
		});
		modalStore.close();
	}

</script>

{#if $modalStore[0]}
	<div class="card p-4 w-full max-w-7xl shadow-xl space-y-4">
		<div class="grid grid-cols-[1fr_3fr] gap-4 overflow-hidden">
			<div class="overflow-y-auto">
				<div class="p-2 px-4 text-surface-700-200-token">User Permissions</div>
				<div class="p-2 px-4 rounded-lg cursor-pointer" role="tab" aria-selected={selected === ""} tabindex={0} on:click={() => selected = ""} on:keydown={() => selected = ""} class:bg-primary-400-500-token={selected === ""}>{$modalStore[0].meta.username}</div>
				<div class="p-2 px-4 mt-2 text-surface-700-200-token">Server Overrides</div>
				{#each $modalStore[0].meta.servers as id, i}
					<div class="p-2 px-4 rounded-lg cursor-pointer" role="tab" aria-selected={selected === id} tabindex={i} on:click={() => selected = id} on:keydown={() => selected = id} class:bg-primary-400-500-token={selected === id}>{id}</div>
				{/each}
			</div>
			{#key selected}
				<PermissionEdit on:status={permissionChanged} perms={selected.length ? (servers[selected] ?? 0) : global} upstream={selected.length ? global : 0} globalAllowed={selected === ""} />
			{/key}
		</div>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
            <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
            <button class="btn {parent.buttonPositive}" on:click={submit}>Update</button>
        </footer>
	</div>
{/if}
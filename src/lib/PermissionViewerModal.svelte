<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	import { getModalStore } from '@skeletonlabs/skeleton';
	import PermissionViewer from "$lib/PermissionViewer.svelte";

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	const modalStore = getModalStore();

	let changedGlobals;
	let changedOverrides;

	// Handle Form Submission
	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response("");
		modalStore.close();
	}

	let selected = "";

</script>

{#if $modalStore[0]}
	<div class="card p-4 w-full max-w-7xl shadow-xl space-y-4">
		<div class="grid grid-cols-[1fr_3fr] gap-4 overflow-hidden">
			<div class="overflow-y-auto">
				<div class="p-2 px-4 text-surface-700-200-token">User Permissions</div>
				<div class="p-2 px-4 rounded-lg cursor-pointer" role="tab" aria-selected={selected === ""} tabindex={0} on:click={() => selected = ""} class:bg-primary-400-500-token={selected === ""}>{$modalStore[0].meta.username}</div>
				<div class="p-2 px-4 mt-2 text-surface-700-200-token">Server Overrides</div>
				{#each $modalStore[0].meta.servers as id, i}
					<div class="p-2 px-4 rounded-lg cursor-pointer" role="tab" aria-selected={selected === id} tabindex={i} on:click={() => selected = id} class:bg-primary-400-500-token={selected === id}>{id}</div>
				{/each}
			</div>
			<PermissionViewer perms={$modalStore[0].meta.global} upstream={selected.length ? $modalStore[0].meta.global : 0} globalAllowed={selected === ""} />
		</div> 
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
            <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
            <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Update</button>
        </footer>
	</div>
{/if}
<script lang="ts">

    import { SlideToggle, RadioGroup, RadioItem } from "@skeletonlabs/skeleton";
    import CompleteFormValidator from "$lib/CompleteFormValidator.svelte";
    import InputItem from "$lib/InputItem.svelte";
    import InputWrapper from "$lib/InputWrapper.svelte";
    import {goto} from "$app/navigation";
    import { Circle } from "svelte-loading-spinners";

    let saving = false;
    let status = "";
    export let data;

    let id = "";
    let name = "";
    let port = 7000;
    let repo = "";

    let auto = false;
    let deps = "install";
    let deps_force = false;
    let build = "build";
    let entry = "build/index.js";

    const create = async () => {
        saving = true;
        const res = await fetch("/new", {
            method: "PUT",
            body: JSON.stringify({ id, name, port, repo, auto, deps, deps_force, build, entry }),
        });
        if (res.ok) {
            await goto("/");
        } else {
            status = `${res.status} ${res.statusText}`;
            setTimeout(() => status = "", 3000);
        }
        saving = false;
    }

</script>

<CompleteFormValidator let:count let:valid let:changed let:ok let:identical>
    <div class="grid overflow-hidden h-full">
        <div class="h-full overflow-y-auto px-6 pb-6">
            <div class="card w-full h-max p-4 mb-4 grid grid-cols-[1fr_2fr] items-center gap-y-4 gap-x-6">
                <div class="text-3xl col-span-2">Create New Server</div>

                <InputItem caption="ID" initial="" name="id" type="text" bind:value={id} validator={v => v.length > 0 ? null : "Required"} on:valid={valid} on:changed={changed} on:count={count} />
                <InputItem caption="Name" initial="" name="name" type="text" bind:value={name} validator={v => v.length > 0 ? null : "Required"} on:valid={valid} on:changed={changed} on:count={count} />
                <InputItem caption="Port" initial={null} name="port" type="number" bind:value={port} validator={v => v >= 7000 && v <= 7999 ? null : "Must be in 7xxx space"} on:valid={valid} on:changed={changed} on:count={count} />
                <InputItem caption="Repository" initial="" name="repo" type="text" bind:value={repo} validator={v => v.length > 0 ? null : "Required"} on:valid={valid} on:changed={changed} on:count={count} />

            </div>
            <div class="card w-full h-max p-4 mb-4 grid grid-cols-[1fr_2fr] items-center gap-y-4 gap-x-6">
                <label for="auto">Production Server Auto-Start</label>
                <div class="text-left h-8">
                    <InputWrapper initial={false} bind:value={auto} let:check >
                        <SlideToggle name="auto" active="bg-primary-500" bind:value={auto} on:input={check} />
                    </InputWrapper>
                </div>

                <label for="deps">Install Dependencies</label>
                <div class="grid grid-cols-[max-content_max-content_max-content] items-center gap-4">
                    <InputWrapper initial={"install"} bind:value={deps} let:check >
                        <RadioGroup active="variant-filled-primary">
                            <RadioItem bind:group={deps} on:change={check} name="deps" value="">disabled</RadioItem>
                            <RadioItem bind:group={deps} on:change={check} name="deps" value="install">npm install</RadioItem>
                            <RadioItem bind:group={deps} on:change={check} name="deps" value="ci">npm ci</RadioItem>
                        </RadioGroup>
                    </InputWrapper>
                    <label for="install-force" class="pl-8">force</label>
                    <InputWrapper initial={false} bind:value={deps_force} let:check >
                        <SlideToggle name="install-force" active="bg-primary-500" bind:value={deps_force} on:input={check} />
                    </InputWrapper>
                </div>

                <InputItem caption="Build Script" initial="build" name="build" type="text" bind:value={build} validator={() => null} on:valid={valid} on:changed={changed} on:count={count}>
                    <svelte:fragment slot="input" let:input_for let:error let:check>
                        <div class="input-group grid grid-cols-[max-content_1fr] items-center" class:variant-ghost-surface={!error} class:variant-ghost-error={error} >
                            <span class="pl-3 text-surface-600-300-token">npm run</span>
                            <input type="text" class="pl-1" name={input_for} bind:value={build} on:input={() => check()} />
                        </div>
                    </svelte:fragment>
                </InputItem>

                <InputItem caption="Entry Point" initial="build/index.js" name="entry" type="text" bind:value={entry} validator={v => v.length > 0 ? null : "Required"} on:valid={valid} on:changed={changed} on:count={count}>
                    <svelte:fragment slot="input" let:input_for let:error let:check>
                        <div class="input-group grid grid-cols-[max-content_1fr] items-center" class:variant-ghost-surface={!error} class:variant-ghost-error={error} >
                            <span class="pl-3 text-surface-600-300-token">node</span>
                            <input type="text" class="pl-1" name={input_for} bind:value={entry} on:input={() => check()} />
                        </div>
                    </svelte:fragment>
                </InputItem>

            </div>
            <div class="text-right">
                {#if saving}
                    <span class="pr-4 inline-block align-middle">
                        <Circle size="1.5" unit="em" color="#ffffff" />
                    </span>
                {:else if status.length > 0}
                    <span class="pr-4 align-middle">
                        {status}
                    </span>
                {/if}
                {#if !data.has_permission}
                    <span class="pr-4 text-error-600-300-token align-middle">Currently missing permission</span>
                {/if}
                <button class="btn variant-filled-surface" class:variant-filled-surface={!ok} class:variant-filled-primary={ok} disabled={!ok || identical || saving} on:click={create}>Create</button>
            </div>
        </div>
    </div>
</CompleteFormValidator>
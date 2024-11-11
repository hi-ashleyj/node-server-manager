<script lang="ts">

    import { SlideToggle, RadioGroup, RadioItem } from "@skeletonlabs/skeleton";

    let deps = "install";

</script>

<div class="grid overflow-hidden h-full">
    <div class="h-full overflow-y-auto px-6 pb-6">
        <div class="card w-full h-max p-4 mb-4 grid grid-cols-[1fr_2fr] items-center gap-y-4 gap-x-6">
            <div class="text-3xl col-span-2">Create New Server</div>

            <label for="id">ID</label>
            <input type="text" name="id" class="input variant-ghost-surface" />

            <label for="name">Name</label>
            <input type="text" name="name" class="input variant-ghost-surface" />

            <label for="port">Port</label>
            <input type="number" name="port" class="input variant-ghost-surface" />

            <label for="repo">Repository</label>
            <input type="text" name="repo" class="input variant-ghost-surface" />
        </div>
        <div class="card w-full h-max p-4 mb-4 grid grid-cols-[1fr_2fr] items-center gap-y-4 gap-x-6">
            <label for="auto">Production Server Auto-Start</label>
            <div class="text-left h-8">
                <SlideToggle name="auto" active="bg-primary-500" />
            </div>

            <label for="deps">Install Dependencies</label>
            <div class="grid grid-cols-[max-content_max-content_max-content] items-center gap-4">
                <RadioGroup active="variant-filled-primary">
                    <RadioItem bind:group={deps} name="deps" value="">disabled</RadioItem>
                    <RadioItem bind:group={deps} name="deps" value="install">npm install</RadioItem>
                    <RadioItem bind:group={deps} name="deps" value="ci">npm ci</RadioItem>
                </RadioGroup>
                <label for="install-force" class="pl-8">force</label>
                <SlideToggle name="install-force" active="bg-primary-500" />
            </div>

            <label for="build">Build Script</label>
            <div class="input-group variant-ghost-surface grid grid-cols-[max-content_1fr] items-center">
                <span class="pl-3 text-surface-600-300-token">npm run</span>
                <input type="text" class="pl-1" name="build" value="build" />
            </div>

            <label for="entry ">Entry Point</label>
            <div class="input-group variant-ghost-surface grid grid-cols-[max-content_1fr] items-center">
                <span class="pl-3 text-surface-600-300-token">node</span>
                <input type="text" class="pl-1" name="entry" value="build/index.js" />
            </div>
        </div>
        <div class="text-right">
            <button class="btn variant-filled-surface">Create</button>
        </div>
    </div>
</div>
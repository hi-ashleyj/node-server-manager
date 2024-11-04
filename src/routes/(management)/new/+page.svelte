<script lang="ts">

    import { SlideToggle, RadioGroup, RadioItem } from "@skeletonlabs/skeleton";

    let deps = "";

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
            <div class="text-right h-8">
                <SlideToggle name="auto" active="bg-primary-500" />
            </div>

            <label>Install Dependencies</label>
            <div class="">
                <RadioGroup active="variant-filled-primary">
                    <RadioItem bind:group={deps} name="deps" value="">No</RadioItem>
                    <RadioItem bind:group={deps} name="deps" value="install">npm install</RadioItem>
                    <RadioItem bind:group={deps} name="deps" value="ci">npm ci</RadioItem>
                </RadioGroup>
            </div>

            <label>Build Script</label>
            <div class="input-group variant-ghost-surface grid grid-cols-[max-content_1fr] items-center">
                <span class="pl-3 text-surface-600-300-token">npm run</span>
                <input type="text" class="pl-1" value="build" />
            </div>

            <label>Entry Point</label>
            <div class="input-group variant-ghost-surface grid grid-cols-[max-content_1fr] items-center">
                <span class="pl-3 text-surface-600-300-token">node</span>
                <input type="text" class="pl-1" value="build/index.js" />
            </div>
        </div>
    </div>
</div>
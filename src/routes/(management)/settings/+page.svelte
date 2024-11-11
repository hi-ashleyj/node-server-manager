<script>
    import InputItem from "$lib/InputItem.svelte";
    import CompleteFormValidator from "$lib/CompleteFormValidator.svelte";
</script>

<CompleteFormValidator let:count let:valid let:invalid let:ok>
    <div class="grid overflow-hidden h-full">
        <div class="h-full overflow-y-auto px-6 pb-6">
            <div class="card w-full h-max p-4 mb-4 grid grid-cols-[1fr_2fr] items-center gap-y-4 gap-x-6">
                <div class="text-3xl col-span-2">Settings</div>

                <InputItem caption="Path to Node" name="test" type="text" validator={v => v.length > 0 ? null : "Required"} on:valid={valid} on:invalid={invalid} on:count={count} />
                <InputItem caption="Path to NPM" name="npm" type="text" validator={v => v.length > 0 ? null : "Required"} on:valid={valid} on:invalid={invalid} on:count={count} />
                <InputItem caption="Path to Git" name="git" type="text" validator={v => v.length > 0 ? null : "Required"} on:valid={valid} on:invalid={invalid} on:count={count} />

            </div>
            <div class="text-right">
                <button class="btn" class:variant-filled-surface={!ok} class:variant-filled-primary={ok} disabled={!ok}>Save</button>
            </div>
        </div>
    </div>
</CompleteFormValidator>
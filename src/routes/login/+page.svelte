<script>
    import { signIn } from "@auth/sveltekit/client"
    import encodeHash64 from "crypto-js/enc-base64";
    import sha512 from "crypto-js/sha512";

    let username = "";
    let password = "";
</script>

<div class="w-full h-full grid place-items-center">
    <div class="card p-6 w-3/4 lg:w-96 grid gap-4">
        <div class="font-heading-token text-3xl">login</div>
        <div class="input-group input-group-divider grid grid-cols-[6rem_1fr]">
            <label class="input-group-shim grid place-items-center" for="username">Username</label>
            <input name="username" type="text" bind:value={username} />
        </div>
        <div class="input-group input-group-divider grid-cols-[6rem_1fr]">
            <label class="input-group-shim grid place-items-center" for="password">Password</label>
            <input name="password" type="password" bind:value={password} />
        </div>
        <button class="btn variant-filled-primary" on:click={() => signIn('credentials', { username, password: encodeHash64.stringify(sha512(password)) })}>
            Log in
        </button>
    </div>
</div>
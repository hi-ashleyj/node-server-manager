<script lang="ts">

    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import encodeHash64 from "crypto-js/enc-base64";
    import sha512 from "crypto-js/sha512";

    let loading = false;
    let error = "";
    const login = async () => {
        loading = true;
        const res = await fetch("/login", {
            method: "POST",
            body: JSON.stringify({ username, password: encodeHash64.stringify(sha512(password)) })
        });
        if (res.ok) {
            const redirect = $page.url.searchParams.get("redirectTo");
            await goto(redirect ? decodeURIComponent(redirect) : "/");
        } else {
            console.log(res.status);
        }
    }

    const autosubmit = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === "enter") {
            login();
        }
    }

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
            <input name="password" type="password" bind:value={password} on:keydown={autosubmit} />
        </div>
        <button class="btn variant-filled-primary" on:click={login}>
            Log in
        </button>
    </div>
</div>
import { SvelteKitAuth } from "@auth/sveltekit";
import Credentials from "@auth/sveltekit/providers/credentials";
import {authorise} from "./permissions";
import { homedir } from "node:os";
import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";

/** This is what NPX AUTH SECRET does */
function randomString(size = 32) {
    const bytes = crypto.getRandomValues(new Uint8Array(size))
    // @ts-expect-error
    return Buffer.from(bytes, "base64").toString("base64")
}

let secret = randomString();

try {
    const maybe = await readFile(join(homedir(), "nsm", ".auth.secret"), {encoding: "utf-8"});
    if (maybe.length) secret = maybe;
    else throw ""; // let catch handle that
} catch (e) {
    try {
        await writeFile(join(homedir(), "nsm", ".auth.secret"), secret, { encoding: "utf-8"});
    } catch (e) {
        process.exit(4565465434);
    }
}

export const { handle, signIn, signOut } = SvelteKitAuth({
    providers: [
        Credentials({
            credentials: {
                username: {},
                password: {},
            },
            authorize: async (credentials) => {
                if (typeof credentials.username !== "string" || typeof credentials.password !== "string") return null;
                const answer = authorise(credentials.username, credentials.password);
                if (!answer) return null;

                return {
                    id: answer.id,
                    name: answer.id,
                    email: answer.name,
                }   

            },
        }),
    ],
    pages: {
        signIn: "/login"
    },
    useSecureCookies: false,
    trustHost: true,
    secret: secret
})



declare module "@auth/sveltekit" {
    interface User {
    }
}
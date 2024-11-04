import { SvelteKitAuth } from "@auth/sveltekit";
import Credentials from "@auth/sveltekit/providers/credentials";
import { JSONFilePreset } from "lowdb/node";

const TEMP_USERS = {
    "admin": "admin",
} as Record<string, string>;

export const { handle, signIn, signOut } = SvelteKitAuth({
    providers: [
        Credentials({
            credentials: {
                username: {},
                password: {},
            },
            authorize: async (credentials) => {
                if (typeof credentials.username === "string" && credentials.username in TEMP_USERS
                    && typeof credentials.password === "string" && TEMP_USERS[credentials.username] === credentials.password) {
                    console.log(`logged in ${credentials.username}`);
                    return {
                        id: credentials.username,
                        name: credentials.username,
                        email: credentials.username,
                        image: "https://cat.com",
                    }
                }

                console.log("failed");
                return null;
            },
        }),
    ],
    pages: {
        signIn: "/login"
    },
    useSecureCookies: false,
})



declare module "@auth/sveltekit" {
    interface User {
    }
}
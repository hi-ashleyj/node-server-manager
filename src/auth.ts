import { SvelteKitAuth } from "@auth/sveltekit";
import Credentials from "@auth/sveltekit/providers/credentials";
import {authorise} from "./permissions";

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
})



declare module "@auth/sveltekit" {
    interface User {
    }
}
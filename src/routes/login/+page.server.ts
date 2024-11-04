import { signIn } from "../../auth.js";
import type { Actions } from "./$types.js";

export const actions = { default: signIn } satisfies Actions;

export const load = async ({ locals }) => {
    const session = await locals.auth();
    console.log(session);
}
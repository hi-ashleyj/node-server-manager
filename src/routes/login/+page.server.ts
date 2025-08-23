import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
    if (locals.user || locals.session) {
        redirect(303, "/");
    }

    return {};
}) satisfies PageServerLoad
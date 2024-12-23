import type { PageServerLoad } from "./$types.js";
import { error } from "@sveltejs/kit";

export const load = (async ({ locals, params }) => {
    if (!locals.manager) {
        return { configured: false };
    }

    const file = (await locals.manager.getLogFile(params.id, params.type, params.file));
    if (!file) {
        throw error(404);
    }
    return { file };

}) satisfies PageServerLoad;
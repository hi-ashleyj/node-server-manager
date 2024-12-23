import type { PageServerLoad } from "./$types.js";

export const load = (async ({ locals, params }) => {
    if (!locals.manager) {
        return { configured: false };
    }

    const files = (await locals.manager.listLogFiles(params.id, params.type)).sort().reverse();
    return { files };

}) satisfies PageServerLoad;
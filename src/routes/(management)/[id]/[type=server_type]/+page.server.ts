import type { PageServerLoad } from "./$types.js";

export const load = (async ({ locals, params }) => {
    if (!locals.manager) {
        return { configured: false };
    }

    // console.log(locals.manager.hit());

    const status = locals.manager.status(params.id, params.type);
    const recent = locals.manager.recent(params.id, params.type).sort((a, b) => a.at - b.at );
    return { status, recent };

}) satisfies PageServerLoad;
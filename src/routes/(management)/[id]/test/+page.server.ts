import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params }) => {
    if (!locals.manager) {
        return { configured: false };
    }

    // console.log(locals.manager.hit());

    const status = locals.manager.status(params.id, "test");
    const recent = locals.manager.recent(params.id, "test").sort((a, b) => a.at - b.at );
    return { status, recent };

}) satisfies PageServerLoad;
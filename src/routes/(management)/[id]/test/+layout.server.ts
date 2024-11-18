import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals, params }) => {
    if (!locals.manager) {
        return { configured: false };
    }

    const server = locals.manager.information(params.id);
    const status = locals.manager.status(params.id, "test");
    return { server, status };

}) satisfies LayoutServerLoad;
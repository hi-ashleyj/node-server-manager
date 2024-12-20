import type { LayoutServerLoad } from "./$types";
import {error} from "@sveltejs/kit";

export const load = (async ({ locals, params }) => {
    if (!locals.manager) {
        return { configured: false };
    }

    // console.log(locals.manager.hit());

    const server = locals.manager.information(params.id);
    if (!server) throw error(404);
    return { server };

}) satisfies LayoutServerLoad;
import type { PageServerLoad } from "./$types.js";
import { error } from "@sveltejs/kit";

export const load = (async ({ locals, params }) => {
    if (!locals.perms.hasPermission(params.id, "VIEW_SERVER")) throw error(403);
    if (!locals.manager) {
        return { configured: false };
    }

    // console.log(locals.manager.hit());

    const status = locals.manager.status(params.id, params.type);
    const recent = locals.manager.recent(params.id, params.type).sort((a, b) => a.at - b.at );
    return { status, recent };

}) satisfies PageServerLoad;
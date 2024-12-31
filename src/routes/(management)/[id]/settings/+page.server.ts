import type { PageServerLoad } from "./$types.js";
import { error } from "@sveltejs/kit";

export const load = (async ({locals, params}) => {
    if (!locals.perms.hasPermission(params.id, "MODIFY_SERVER")) throw error(403);
    if (!locals.manager) throw error(522);
    const { info } = locals.manager.information(params.id);

    return { info };

}) satisfies PageServerLoad;
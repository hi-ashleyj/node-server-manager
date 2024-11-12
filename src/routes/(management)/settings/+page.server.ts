import type { PageServerLoad } from "./$types.js";

export const load = (async ({locals}) => {
    return {
        has_permission: locals.perms.hasPermission("", "ADMINISTRATE_GLOBAL"),
        paths: locals.db.data.paths
    }
}) satisfies PageServerLoad;
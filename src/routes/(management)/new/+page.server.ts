import type { PageServerLoad } from "./$types.js";

export const load = (async ({locals}) => {
    return {
        has_permission: locals.perms.hasPermission("", "CREATE_SERVER"),
    }
}) satisfies PageServerLoad;
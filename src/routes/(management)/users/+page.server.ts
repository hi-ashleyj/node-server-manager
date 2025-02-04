import type { PageServerLoad } from "./$types";

const collator = new Intl.Collator("en-US", { sensitivity: "base", caseFirst: false, numeric: true });

export const load = (async ({ locals }) => {
    if (locals.perms.hasPermission("", "ADMINISTRATE_USERS") || locals.perms.hasPermission("", "ADMINISTRATE_PERMS")) {
        return {
            mine: locals.perms.userInfo(),
            all: locals.perms.listAllPerms()?.sort((a, b) => collator.compare(a.username, b.username)),
        }
    }
    return {
        mine: locals.perms.userInfo(),
    }
}) satisfies PageServerLoad;
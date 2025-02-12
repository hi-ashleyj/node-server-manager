import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

const collator = new Intl.Collator("en-US", { sensitivity: "base", caseFirst: "false", numeric: true });

export const load = (async ({ locals }) => {
    const mine = locals.perms.userInfo();
    if (!mine) error(401);
    const mineMap = {
        id: mine.id,
        username: mine.username,
        roles: mine.roles,
        server_roles: mine.server_roles,
    }
    const servers = (locals.manager?.list() ?? []).map(it => it.info.id);
    if (locals.perms.hasPermission("", "ADMINISTRATE_USERS") || locals.perms.hasPermission("", "ADMINISTRATE_PERMS")) {
        const all = locals.perms.listAllPerms()?.sort((a, b) => collator.compare(a.username, b.username))?.map(it => {
            return {
                id: it.id,
                username: it.username,
                roles: it.roles,
                server_roles: it.server_roles,
            }
        });

        return {
            mine: mineMap,
            all,
            servers,
        }
    }
    return {
        mine: mineMap,
        servers,
    }
}) satisfies PageServerLoad;
import type { PageServerLoad } from "./$types";
import type {NodeServer} from "$lib/types";

export const load = (async ({ locals }) => {

    const servers = locals.db.data.servers.map(it => {
        return {
            id: it.id,
            port: it.port,
            name: it.name,
            repo: it.repo,

            test: {
                active: it.test.active
            },
            prod: {
                active: it.prod.active
            }

        } as NodeServer;
    })
    return { servers };

}) satisfies PageServerLoad;
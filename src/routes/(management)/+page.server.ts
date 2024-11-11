import type { PageServerLoad } from "./$types";
import type {NodeServer} from "$lib/types";

export const load = (async ({ locals }) => {
    if (!locals.manager) {
        return { configured: false };
    }

    const servers = locals.manager.list().map(it => {
        return {
            id: it.info.id,
            port: it.info.port,
            name: it.info.name,
            repo: it.info.repo,

            test: {
                active: it.test && it.test.running
            },
            prod: {
                active: it.prod && it.prod.running
            }

        } as NodeServer;
    })
    return { servers };

}) satisfies PageServerLoad;
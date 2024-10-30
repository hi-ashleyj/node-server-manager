import type { PageServerLoad } from "./$types";
import type {NodeServer} from "$lib/types";

export const load = (async ({ locals }) => {

    return {
        servers: [
            {
                id: "test",
                port: 7294,
                name: "test",
                auto: false,
                build: "",
                path: "",
                repo: "https://github.com/hi-ashleyj/test",
                test: {
                    active: true,
                },
                prod: {
                    active: false,
                },
            }
        ] as NodeServer[],
    }

}) satisfies PageServerLoad;
import type { PageServerLoad } from "./$types.js";
import { error } from "@sveltejs/kit";
import type { EnvironmentItemMissing, EnvironmentItemPresent } from "$lib/environment";

export const load = (async ({ locals, params }) => {
    if (!locals.manager) {
        return { configured: false };
    }

    const status = locals.manager.information(params.id);
    if (!status) {
        throw error(404);
    }

    const { test, prod } = status.info;
    const current = params.type === "test" ? test.env : prod.env;
    const alternate = params.type === "test" ? prod.env : test.env;

    const dual: EnvironmentItemPresent[] = [
        { key: "HOST", current: "0.0.0.0", present: true, alt: "0.0.0.0" },
    ];
    const only: EnvironmentItemMissing[] = [
        { key: "DATABASE", present: false, alt: "192.168.50.69" },
    ];

    for (let item in current) {
        dual.push({
            key: item,
            present: true,
            current: current[item],
            alt: item in alternate ? alternate[item] : "Not Present",
        })
    }

    for (let item in alternate) {
        if (!(item in current)) {
            only.push({
                key: item,
                present: false,
                alt: alternate[item]
            })
        }
    }

    return { dual, only, port: status.info.port + (params.type === "test" ? 30000 : 0) };

}) satisfies PageServerLoad;
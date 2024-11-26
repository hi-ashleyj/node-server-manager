import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params }) => {
    if (!locals.manager) {
        return { configured: false };
    }

    const files = (await locals.manager.listLogFiles(params.id, "test")).sort().reverse();

    // FOR DEBUG
    return { files: [ "01JDJTM1SNF5YYHAQM886Z46WB", '01JDJTPY4XHKPJVTP17JPVYWHT' ].sort().reverse() };

    return { files };

}) satisfies PageServerLoad;
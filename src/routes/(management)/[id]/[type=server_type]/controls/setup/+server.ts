import type { RequestHandler } from "./$types.js";
import { error } from "@sveltejs/kit";

export const POST = (async ({ locals, params }) => {
    if (!locals.manager) throw error(522);
    if (!locals.perms.hasPermission(params.id, params.type === "test" ? "CONTROL_TEST" : "CONTROL_PRODUCTION")) throw error(403);
    const results = await locals.manager.script(params.id, params.type, "install");
    const success = results.filter(it => it[1] !== null).length <= 0;

    if (success) return new Response(null, { status: 204 });
    const errors = results.map(it => it[1]).filter(it => it !== null);

    return new Response(JSON.stringify(errors), { status: 500 });

}) satisfies RequestHandler;
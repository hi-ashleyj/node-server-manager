import type { RequestHandler } from "./$types.js";
import { error } from "@sveltejs/kit";

export const POST = (async ({ locals, params }) => {
    if (!locals.manager) throw error(522);
    if (!locals.perms.hasPermission(params.id, params.type === "test" ? "CONTROL_TEST" : "CONTROL_PRODUCTION")) throw error(403);
    const [ success, e ] = await locals.manager.operate(params.id, params.type, { exe: "npm", command: "install" });

    if (success) return new Response(null, { status: 204 });

    return new Response(JSON.stringify({ success, error: e }), { status: 500 });

}) satisfies RequestHandler;
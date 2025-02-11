import type { RequestHandler } from "./$types.js";
import { error } from "@sveltejs/kit";

export const POST = (async ({ locals, params }) => {
    if (!locals.manager) throw error(522);
    if (!locals.perms.hasPermission(params.id, params.type === "test" ? "CONTROL_TEST" : "CONTROL_PRODUCTION")) throw error(403);
    await locals.manager.stop(params.id, params.type);

    return new Response(null, { status: 204 });

}) satisfies RequestHandler;
import {error, type RequestHandler} from "@sveltejs/kit";

export const POST = (async ({ request, locals, params }) => {
    if (!locals.perms.hasPermission("", "ADMINISTRATE_USERS")) error(403);
    const data = await request.json();
    const { hash } = data;
    return new Response(null, { status: 204 });
}) satisfies RequestHandler

export const PATCH = (async ({ request, locals, params }) => {
    if (!locals.perms.hasPermission("", "ADMINISTRATE_PERMS")) error(403);
    const data = await request.json();
    const { node, npm, git } = data;
    await locals.paths(node, npm, git);
    return new Response(null, { status: 204 });
}) satisfies RequestHandler
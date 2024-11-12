import {error, type RequestHandler} from "@sveltejs/kit";

export const PATCH = (async ({ request, locals }) => {
    if (!locals.perms.hasPermission("", "ADMINISTRATE_GLOBAL")) throw error(403);
    const data = await request.json();
    const { node, npm, git } = data;
    await locals.paths(node, npm, git);
    return new Response(null, { status: 204 });
}) satisfies RequestHandler
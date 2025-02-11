import {error, type RequestHandler} from "@sveltejs/kit";

export const PUT = (async ({ request, locals }) => {
    if (!locals.perms.hasPermission("", "ADMINISTRATE_USERS")) throw error(403);
    const data = await request.json();
    const { name, hash } = data;
    const id = locals.perms.createUser(name, hash);
    return new Response(null, { status: 204 });
}) satisfies RequestHandler
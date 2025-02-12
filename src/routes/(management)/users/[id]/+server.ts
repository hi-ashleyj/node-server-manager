import {error, type RequestHandler} from "@sveltejs/kit";

export const POST = (async ({ request, locals, params }) => {
    const id = locals.perms.id();
    if (!id) error(401)
    if (!locals.perms.hasPermission("", "ADMINISTRATE_USERS") && !(id === params.id)) error(403);
    const data = await request.json();
    const { hash } = data;
    const worked = locals.perms.updatePassword(id, hash);
    return new Response(null, { status: 204 });
}) satisfies RequestHandler

export const DELETE = (async ({ locals, params }) => {
    if (!locals.perms.hasPermission("", "ADMINISTRATE_USERS")) error(403);
    if (!params.id || params.id === locals.perms.id()) error(400);
    locals.perms.deleteUser(params.id);
    return new Response(null, { status: 204 });
}) satisfies RequestHandler

export const PATCH = (async ({ request, locals, params }) => {
    if (!(locals.perms.hasPermission("", "ADMINISTRATE_PERMS") || locals.perms.hasPermission("", "ADMINISTRATE_USERS"))) error(403);
    if (!params.id || params.id === locals.perms.id()) error(400);
    const data = await request.json();
    const { global, servers } = data;
    if (!global || typeof global !== "number") error(400);
    if (!servers || typeof servers !== "object") error(400);
    locals.perms.editPermissions(params.id, global, servers);
    return new Response(null, { status: 204 });
}) satisfies RequestHandler

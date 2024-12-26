import {error, type RequestHandler} from "@sveltejs/kit";

export const PATCH = (async ({ locals, params, request }) => {

    if (!locals.perms.hasPermission(params.id, params.type === "test" ? "CONFIGURE_TEST" : "CONFIGURE_PRODUCTION")) throw error(403);
    if (!locals.manager) throw error(422);

    let key, value;
    try {
        const json = (await request.json());
        key = json.key;
        value = json.value;
    } catch (_) {
        error(400);
    }
    if (!key) throw error(400);
    const info = locals.manager.information(params.id);
    if (!info) throw error(404);

    const current = info.info;
    const target = params.type === "test" ? current.test.env : current.prod.env;
    target[key] = value;
    if (params.type === "test") {
        current.test.env = target;
    } else {
        current.prod.env = target;
    }
    locals.manager.update(params.id, current);

    return new Response(null, { status: 204 });

}) satisfies RequestHandler;

export const DELETE = (async ({ locals, params, request }) => {

    if (!locals.perms.hasPermission(params.id, params.type === "test" ? "CONFIGURE_TEST" : "CONFIGURE_PRODUCTION")) throw error(403);
    if (!locals.manager) throw error(422);

    let key;
    try {
        key = (await request.json()).key;
    } catch (_) {
        error(400);
    }
    if (!key) throw error(400);
    const info = locals.manager.information(params.id);
    if (!info) throw error(404);

    const current = info.info;
    const target = params.type === "test" ? current.test.env : current.prod.env;
    target[key] = undefined;
    delete target[key];
    if (params.type === "test") {
        current.test.env = target;
    } else {
        current.prod.env = target;
    }
    locals.manager.update(params.id, current);

    return new Response(null, { status: 204 });

}) satisfies RequestHandler;
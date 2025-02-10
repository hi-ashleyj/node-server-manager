import {error, type RequestHandler} from "@sveltejs/kit";

export const PATCH = (async ({ request, locals, params }) => {
    if (!locals.perms.hasPermission("", "MODIFY_SERVER")) error(403);
    if (!locals.manager) error(522);
    if (!params.id) error(400);
    const data = await request.json();
    const { info } = locals.manager.information(params.id);
    const success = await locals.manager.update(params.id, {
        id: params.id,
        name: data.name,
        repo: data.repo,
        port: data.port,

        auto: data.auto,
        install: data.deps,
        force_install: data.deps_force,
        build: data.build,
        path: data.entry,

        prod: info.prod,
        test: info.test
    });

    return new Response(null, { status: 204 });
}) satisfies RequestHandler
import {error, type RequestHandler} from "@sveltejs/kit";

export const PUT = (async ({ request, locals }) => {
    if (!locals.perms.hasPermission("", "CREATE_SERVER")) throw error(403);
    if (!locals.manager) throw error(422);
    const data = await request.json();
    const success = await locals.manager.create({
        id: data.id,
        name: data.name,
        repo: data.repo,
        port: data.port,

        auto: data.auto,
        install: data.deps,
        force_install: data.deps_force,
        build: data.build,
        path: data.entry,
        prod: {
            env: {},
            active: false,
        },
        test: {
            env: {},
            active: false,
        }
    });

    return new Response(null, { status: 204 });
}) satisfies RequestHandler
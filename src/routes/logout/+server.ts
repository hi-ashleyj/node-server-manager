import { error, type RequestHandler } from "@sveltejs/kit";

export const GET = (async ({ cookies, locals }) => {
    if (!locals.session) error(403);

    const res = new Response(null, {
        status: 307,
        headers: {
            Location: `/login?redirectTo=${encodeURIComponent("/")}`
        }
    });
    await locals.auth.invalidateSession(locals.session.id);
    locals.auth.deleteSessionTokenCookie(cookies);

    return res;
}) satisfies RequestHandler
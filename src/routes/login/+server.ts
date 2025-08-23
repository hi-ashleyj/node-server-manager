import { type RequestHandler, error } from "@sveltejs/kit";
import { authorise } from "../../permissions";

export const POST = (async ({ locals, cookies, request }) => {

    const { username, password } = await request.json();

    const result = authorise(username, password);
    if (result === null) return error(403);

    const res = new Response(null, { status: 204 });
    const token = locals.auth.generateSessionToken();
    const session = await locals.auth.createSession(token, result!);
    locals.auth.setSessionTokenCookie(cookies, token, session.expiresAt);

    return res;

}) satisfies RequestHandler;
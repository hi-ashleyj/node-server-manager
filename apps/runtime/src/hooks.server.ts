import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { handle as authHandle } from "./auth";

const localHandle: Handle = async ({ event, resolve }) => {
    const auth = await event.locals.auth();
    if (!auth && event.route.id && !event.route.id.startsWith("/login")) {
        return new Response(null, {
            status: 307,
            headers: {
                Location: `/login?redirectTo=${encodeURIComponent(event.url.pathname + event.url.search)}`
            }
        })
    }
    return resolve(event);
};

export const handle = sequence(authHandle, localHandle);
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    const session = await locals.auth();
    return {
        name: session?.user?.email ?? "",
    }
}) satisfies LayoutServerLoad;
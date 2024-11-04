import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    const session = await locals.auth();
    return {
        username: session?.user?.id ?? "",
        name: session?.user?.name ?? "",
    }
}) satisfies LayoutServerLoad;
import type { Handle } from "@sveltejs/kit";

export type EventServerOptions = {
    hub: string;
}

export const eventNode: (options: EventServerOptions) => Handle = () => {
    const recent = new Map<string, number>();

    return async ({ resolve, event }) => {
        const before = performance.now();
        if (event.url.pathname === "/__nsm__/stats") {
            const list = [ ...recent.values() ];
            const min = Math.min(...list);
            const max = Math.max(...list);
            const avg = list.reduce((prev, it) => prev + it, 0) / list.length;
            return new Response(JSON.stringify({ min, max, avg }));
        }
        const res = await resolve(event)
        setTimeout(() => recent.delete(li), 1000 * 60 * 5);
        const after = performance.now();
        recent.set(li, after - before);
        return res;
    }
};
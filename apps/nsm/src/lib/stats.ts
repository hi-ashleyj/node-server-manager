import type { Handle } from "@sveltejs/kit";
import { ulid } from "ulidx";

export const stats: () => Handle = () => {
    const recent = new Map<string, number>();

    return async ({ resolve, event }) => {
        const before = performance.now();
        if (event.url.pathname === "/__nsm__/stats") {
            if (recent.size <= 0) {
                return new Response(JSON.stringify({ status: "up", requests: 0 }));
            }
            const list = [ ...recent.values() ];
            const min = Math.min(...list);
            const max = Math.max(...list);
            const avg = list.reduce((prev, it) => prev + it, 0) / list.length;
            return new Response(JSON.stringify({ min, max, avg, status: "up", frequency: list.length / 5 }));
        }
        const res = await resolve(event)
        const li = ulid();
        setTimeout(() => recent.delete(li), 1000 * 60 * 5);
        const after = performance.now();
        recent.set(li, after - before);
        return res;
    }
};
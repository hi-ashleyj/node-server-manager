import type { ParamMatcher } from "@sveltejs/kit";

export const match = ((val: string): val is "test" | "production" => {
    return val === "test" || val === "production";
}) satisfies ParamMatcher
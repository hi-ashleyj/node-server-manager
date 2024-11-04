import type { Handle } from "@sveltejs/kit";
import type { Message } from "./types.js";
export type { Message };

export type EventNodeOptions = {
    hub: string;
}

export type EventNode = {
    handle: Handle;
    send: () => {};
    listen: () => {};
}

export const eventNode: (options: EventNodeOptions) => {} = () => {
    const recent = new Map<string, number>();
};
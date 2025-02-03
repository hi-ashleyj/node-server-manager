import { getContext, setContext } from "svelte";
import type { Readable } from "svelte/store";
import type { ClientAPI } from "./types.js";

const NSM_EVENTS_CONTEXT = Symbol();

export type EventSvelteContext = {
    events: Readable<ClientAPI | null>
}

export const prepare = (ctx: EventSvelteContext) => {
    setContext(NSM_EVENTS_CONTEXT, ctx);
}

export const getEventsContext = (): EventSvelteContext => {
    const ctx = getContext(NSM_EVENTS_CONTEXT);
    if (!ctx) throw new Error("DO NOT USE CONTEXT BEFORE INITIALISATION");
    return ctx as EventSvelteContext;
}

import EventsContext from "./svelte/EventsContext.svelte";
import EventsSubscription from "./svelte/EventsSubscription.svelte";

export { EventsContext, EventsSubscription };
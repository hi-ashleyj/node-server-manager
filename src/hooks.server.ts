import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { JSONFilePreset } from "lowdb/node";
import type { ServerDatabase } from "$lib/types";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { start, type ServerManager } from "$lib/process/manager";
import { auth } from "./auth";
import {perms, type Perms} from "./permissions";
import { connect } from "$lib/package/event-node.js";
import { start as startEvents } from "./event-hub-server.js";

await mkdir(join(homedir(), "nsm"), { recursive: true });

const eventHubDeath = startEvents('0.0.0.0');
const [ events, eventsSetupError ] = connect({ hub: "ws://localhost:14554" });
if (eventsSetupError) {
    console.error("[events] FAILED TO SETUP EVENTS. ERROR:\n");
    console.error(eventsSetupError);
    console.error("\n");
}

export type ClientEvents = {
    "connect": [],
    "disconnect": [ boolean ],
    "subscribed": [ string, boolean ],
    "unsubscribed": [ string ],
    "close": [],
    "error": [ "NSM_NOT_DETECTED" | "NSM_NEGOTIATE_ERROR" | "SERVER_CLOSED" | "SUBSCRIBE_FAILED" | "UNSUBSCRIBE_FAILED" | "WEBSOCKET_ERROR" ],
}

if (events) {
    events.on("connect", () => console.log("[events] connected to hub"));
    events.on("disconnect", (p) => console.log(`[events] disconnected from hub (${p ? "true" : "false"})`));
    events.on("close", () => console.log("[events] close"));
    events.on("error", (p) => console.log(`[events] error fired (${p})`));

    process.on("beforeExit", () => {
        events?.disconnect();
        eventHubDeath();
    })
    // sveltekit fires a custom shutdown event
    process.on("sveltekit:shutdown", () => {
        events?.disconnect();
        eventHubDeath();
    })
}

let manager: ServerManager;
const defaultData = { servers: [], paths: {} };
const db = await JSONFilePreset<ServerDatabase>(join(homedir(), "nsm", "servers.json"), defaultData);
await db.read();

{
    const { node, npm, git } = db.data.paths;
    if (node && npm && git) {
        manager = await start({ git, npm, node, nsm: join(homedir(), "nsm") }, db, events?.send ?? ((channel, message) => { console.log(channel, message); return [ null, "CLOSED" ] }));
    }
}

const setPaths = async ( node: string, npm: string, git: string ) => {
    await db.update((data) => data.paths = { node, npm, git });
    if (manager) await manager.shutdown();
    manager = await start({ git, npm, node, nsm: join(homedir(), "nsm") }, db, events?.send ?? ((channel, message) => { console.log(channel, message); return [ null, "CLOSED" ] }));
}

const authHandle = await auth();

declare global {
    namespace App {
        interface Locals {
            db: typeof db;
            manager?: ServerManager;
            paths: typeof setPaths;
            perms: Perms;
            events: typeof events;
        }
    }
}

const localHandle: Handle = async ({ event, resolve }) => {
    if (!event.locals.user && event.route.id && !event.route.id.startsWith("/login")) {
        return new Response(null, {
            status: 307,
            headers: {
                Location: `/login?redirectTo=${encodeURIComponent(event.url.pathname + event.url.search)}`
            }
        })
    }
    if (event.locals.user && event.route.id && event.route.id.startsWith("/login")) {
        // accessing login as logged in - probably want to end up at home
        return new Response(null, {
            status: 307,
            headers: {
                Location: `/`,
            }
        })
    }
    event.locals.db = db;
    event.locals.manager = manager;
    event.locals.paths = setPaths;
    event.locals.perms = perms(event.locals.user!.id);
    event.locals.events = events;
    return resolve(event);
};

export const handle = sequence(authHandle, localHandle);
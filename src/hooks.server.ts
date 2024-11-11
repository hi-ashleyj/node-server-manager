import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { JSONFilePreset } from "lowdb/node";
import type { ServerDatabase } from "$lib/types";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { start, type ServerManager } from "$lib/process/manager";

await mkdir(join(homedir(), "nsm"), { recursive: true });

let manager: ServerManager;
const defaultData = { servers: [], paths: {} };
const db = await JSONFilePreset<ServerDatabase>(join(homedir(), "nsm", "servers.json"), defaultData);
await db.read();

{
    const { node, npm, git } = db.data.paths;
    if (node && npm && git) {
        manager = await start({ git, npm, node, nsm: join(homedir(), "nsm") }, db);
    }
}

const setPaths = async ( node: string, npm: string, git: string ) => {
    db.update(({ paths }) => paths = { node, npm, git });
    if (manager) manager.shutdown();
    manager = await start({ git, npm, node, nsm: join(homedir(), "nsm") }, db);
}

declare global {
    namespace App {
        interface Locals {
            db: typeof db;
            manager?: ServerManager;
            paths: typeof setPaths;
        }
    }
}

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
    event.locals.db = db;
    event.locals.manager = manager;
    event.locals.paths = setPaths;
    return resolve(event);
};

export const handle = sequence(authHandle, localHandle);
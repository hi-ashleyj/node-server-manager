import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { JSONFilePreset } from "lowdb/node";
import type { NodeServerEditable } from "$lib/types";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

await mkdir(join(homedir(), "nsm"), { recursive: true });

type ServerDatabase = { servers: NodeServerEditable[] };
const defaultData = { servers: [] };
const db = await JSONFilePreset<ServerDatabase>(join(homedir(), "nsm", "servers.json"), defaultData);
await db.read();

declare global {
    namespace App {
        interface Locals {
            db: typeof db;
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
    return resolve(event);
};

export const handle = sequence(authHandle, localHandle);
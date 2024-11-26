import type { Low } from "lowdb";
import type {NodeServerEditable, ServerDatabase} from "$lib/types";
import type {Log} from "$lib/log/common";
import {type Operation, ServerInstance, type ServerInstancePaths} from "$lib/process/instance";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";

type ServerStatus = ReturnType<ServerInstance["getStatus"]> | null;

export type ServerManager = {
    create: (data: NodeServerEditable) => Promise<boolean>;
    update: (id: string, data: NodeServerEditable) => any;
    remove: (id: string) => any;
    status: (id: string, env: "test" | "production") => ReturnType<ServerInstance["getStatus"]> | null;
    recent: (id: string, env: "test" | "production") => Log[];
    list: () => { info: NodeServerEditable, test: ServerStatus, prod: ServerStatus }[];
    information: (id: string) => { info: NodeServerEditable, test: ServerStatus, prod: ServerStatus } | null;
    start: (id: string, env: "test" | "production") => ReturnType<ServerInstance["start"]>;
    stop: (id: string, env: "test" | "production") => ReturnType<ServerInstance["stop"]>;
    operate: (id: string, env: "test" | "production", operation: Operation) => ReturnType<ServerInstance["operate"]>;
    script: (id: string, env: "test" | "production", mode: "install" | "update") => Promise<Awaited<ReturnType<ServerInstance["operate"]>>[]>;
    shutdown: () => Promise<any>;
    hit: () => [ any, any ][];

    listLogFiles: (id: string, env: "test" | "production") => Promise<string[]>;
    getLogFile: (id: string, env: "test" | "production", run: string) => Promise<string | null>;
};

export type RunTimeInformation = {
    nsm: string;
    git: string;
    node: string;
    npm: string;
}

export const start = async (paths: RunTimeInformation, db: Low<ServerDatabase>): Promise<ServerManager> => {
    const servers = new Map<`${string}/test` | `${string}/production`, ServerInstance>();

    await mkdir(join(paths.nsm, "test"), { recursive: true });
    await mkdir(join(paths.nsm, "production"), { recursive: true });
    await mkdir(join(paths.nsm, "logs", "test"), { recursive: true });
    await mkdir(join(paths.nsm, "logs", "production"), { recursive: true });

    const makePaths = (id: string, env: "test" | "production") => {
        return {
            node: paths.node,
            npm: paths.npm,
            git: paths.git,
            root: join(paths.nsm, env, id),
            logs: join(paths.nsm, "logs", env, id),
        } as ServerInstancePaths;
    }

    const updateData = (id: string, env: "test" | "production", start: boolean) => {
        const info = db.data.servers.find(it => it.id === id);
        servers.delete(`${id}/${env}`);
        if (!info) return;
        const next = new ServerInstance(makePaths(id, env), info, Object.assign({}, env === "test" ? info.test : info.prod, { auto: start, restarts: env === "production" }));
        servers.set(`${id}/${env}`, next);
    };

    db.data.servers.forEach((it) => {
        servers.set(`${it.id}/test`, new ServerInstance(makePaths(it.id, "test"), it, { ...it.test, auto: false, restarts: false }));
        servers.set(`${it.id}/production`, new ServerInstance(makePaths(it.id, "production"), it, { ...it.prod, auto: it.auto, restarts: true }));
    })

    return {
        create: async (data) => {
            const more = db.data.servers.some(it => it.id === data.id);
            if (more) return false;
            db.update(({ servers }) => servers.push(data));
            await mkdir(join(paths.nsm, "logs", "test", data.id), { recursive: true });
            await mkdir(join(paths.nsm, "logs", "production", data.id), { recursive: true });
            servers.set(`${data.id}/test`, new ServerInstance(makePaths(data.id, "test"), data, { ...data.test, auto: false, restarts: false }));
            servers.set(`${data.id}/production`, new ServerInstance(makePaths(data.id, "production"), data, { ...data.prod, auto: data.auto, restarts: true }));
            return true;
        },
        update: (id, data) => {
            db.update(({servers}) => {
                const it = servers.findIndex((it) => it.id === id);
                if (it >= 0) servers[it] = data;
            });
            const test = servers.get(`${data.id}/test`);
            const production = servers.get(`${data.id}/production`);

            if (test) {
                const stat = test.getStatus();
                if (stat.running || stat.operating) {
                    test.onStop((restart) => updateData(id, "test", restart));
                } else {
                    updateData(id, "test", false);
                }
            }
            if (production) {
                const stat = production.getStatus();
                if (stat.running || stat.operating) {
                    production.onStop((restart) => updateData(id, "production", restart));
                } else {
                    updateData(id, "production", false);
                }
            }
        },
        remove: (id) => {
            const test = servers.get(`${id}/test`);
            const production = servers.get(`${id}/production`);

            if (test) {
                const stat = test.getStatus();
                if (stat.running) test.stop();
                if (stat.operating) test.stopOperation();
                servers.delete(`${id}/test`);
            }

            if (production) {
                const stat = production.getStatus();
                if (stat.running) production.stop();
                if (stat.operating) production.stopOperation();
                servers.delete(`${id}/production`);
            }

            db.update(({ servers }) => {
                const it = servers.findIndex((it) => it.id === id);
                if (it >= 0) servers.splice(it, 1);
            });
        },
        status: (id, env) => {
            const server = servers.get(`${id}/${env}`);
            if (!server) return null;
            return server.getStatus();
        },
        list: () => {
            return db.data.servers.map(info => {
                const test = servers.get(`${info.id}/test`)?.getStatus() ?? null;
                const prod = servers.get(`${info.id}/production`)?.getStatus() ?? null;
                return { info, test, prod };
            });
        },
        information: (id) => {
            const info = db.data.servers.find(it => it.id === id);
            if (!info) return null;
            const test = servers.get(`${id}/test`)?.getStatus() ?? null;
            const prod = servers.get(`${id}/production`)?.getStatus() ?? null;
            return { info, test, prod };
        },
        start: (id, env) => {
            const server = servers.get(`${id}/${env}`);
            if (!server) {
                const info = db.data.servers.find(it => it.id === id);
                if (!info) {
                    return Promise.resolve([ null, "SERVER_NOT_FOUND" ]);
                }
                const next = new ServerInstance(makePaths(id, env), info, Object.assign({}, env === "test" ? info.test : info.prod, { auto: false, restarts: env === "production" }));
                servers.set(`${id}/${env}`, next);
                return next.start();
            }
            return server.start()
        },
        stop: (id, env) => {
            const server = servers.get(`${id}/${env}`);
            if (!server) {
                const info = db.data.servers.find(it => it.id === id);
                if (!info) {
                    return Promise.resolve();
                }
                const next = new ServerInstance(makePaths(id, env), info, Object.assign({}, env === "test" ? info.test : info.prod, { auto: false, restarts: env === "production" }));
                servers.set(`${id}/${env}`, next);
                return Promise.resolve();
            }
            return server.stop();
        },
        operate: (id, env, operation) => {
            let server = servers.get(`${id}/${env}`);
            if (!server) {
                const info = db.data.servers.find(it => it.id === id);
                if (!info) {
                    return Promise.resolve([ null, "SERVER_NOT_FOUND" ]);
                }
                server = new ServerInstance(makePaths(id, env), info, Object.assign({}, env === "test" ? info.test : info.prod, { auto: false, restarts: env === "production" }));
                servers.set(`${id}/${env}`, server);
            }
            return server.operate(operation);
        },
        script: async (id, env, mode) => {
            let server = servers.get(`${id}/${env}`);
            const info = db.data.servers.find(it => it.id === id);
            if (!info) {
                return [];
            }
            if (!server) {
                server = new ServerInstance(makePaths(id, env), info, Object.assign({}, env === "test" ? info.test : info.prod, { auto: false, restarts: env === "production" }));
                servers.set(`${id}/${env}`, server);
            }
            const stat = server.getStatus();
            if (stat.operating) return [];
            if (stat.running) server.stop();
            if (mode === "install") {
                const clone = await server.operate({ exe: "git", command: "clone" });
                const packages = await server.operate({ exe: "npm", command: "install" });
                const build = await server.operate({ exe: "npm", command: "build" });
                return [ clone, packages, build ];
            } else if (mode === "update") {
                const pull = await server.operate({ exe: "git", command: "pull" });
                const packages = await server.operate({ exe: "npm", command: "install" });
                const build = await server.operate({ exe: "npm", command: "build" });
                return [ pull, packages, build ];
            } else {
                return [] as never;
            }
        },
        shutdown: () => {
            return Promise.allSettled([...servers.values()].map(it => it.forceQuit()));
        },
        hit: () => {
            return [ ...servers.entries() ];
        },
        recent: (id, env) => {
            let server = servers.get(`${id}/${env}`);
            if (!server) return [];
            const logger = server.getLogger();
            if (!logger) return [];
            return logger.getRecent();
        },
        listLogFiles: async (id, env) => {
            let server = servers.get(`${id}/${env}`);
            if (!server) return [];
            return await server.logfiles();
        },
        getLogFile: async (id, env, run) => {
            let server = servers.get(`${id}/${env}`);
            if (!server) return null;
            return await server.getLogFile(run);
        }
    }
}
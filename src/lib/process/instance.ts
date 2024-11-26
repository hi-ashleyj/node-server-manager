import { SpawnedServer } from "$lib/process/spawn";
import type {NodeServerEditable, RuntimeEditable} from "$lib/types";
import {join} from "node:path";
import { stat, readdir, readFile } from "node:fs/promises";
import {ulid} from "ulidx";
import {LogFileHelper} from "$lib/process/logfile";
import { decodeLogFile } from "$lib/log/decode";
import {GitCommand} from "$lib/process/git";
import {NPMCommand} from "$lib/process/npm";
import type {LogFile} from "$lib/log/common";

const unwrappedStat = async (...params: Parameters<typeof stat>): Promise<[ Awaited<ReturnType<typeof stat>>, null ] | [ null, any ]> => {
    try {
        const info = await stat(...params);
        return [ info, null ];
    } catch (e) {
        return [ null, e ];
    }
}

export const ServerInstanceErrors = {
    SERVER_NOT_FOUND: "Could not find server runtime information",
    SERVER_RUNNING: "Server is currently running",
    SERVER_OFFLINE: "Server is currently offline",
    OPERATION_RUNNING: "Server is currently being modified",
    OPERATION_OFFLINE: "Server is not being modified",
    PROJECT_MISSING: "Project is not downloaded",
    PROJECT_RUNNER_MISSING: "Main Executable is not present",
    PACKAGES_MISSING: "Package Install is configured but node_modules not present",
    START_FAILED: "Server Process Refused to Start",
    NOT_IMPLEMENTED: "Not Implemented",
    REPO_NOT_PRESENT: "Project cannot be updated - not present",
    NO_BUILD_SCRIPT: "Build script not specified for project",
    INSTALL_NOT_PERMITTED: "Npm Install mode not permitted",
} as const;

type ErrorCode = keyof typeof ServerInstanceErrors;
type Unwrap<V, E> = [V, null] | [null, E];

export type Operation = { exe: "npm", command: "install" | "build" } | { exe: "git", command: "pull" | "clone" };

export type ServerInstancePaths = {
    node: string, npm: string, git: string, root: string, logs: string
}

export class ServerInstance {

    private server?: SpawnedServer;
    private run?: string;
    private operation?: GitCommand | NPMCommand;
    private root: string;
    private info: NodeServerEditable;
    private params: RuntimeEditable & { auto: boolean, restarts: boolean };

    private log: string;
    private node: string;
    private npm: string;
    private git: string;

    private timing?: { start: number };
    private active_log?: LogFileHelper;

    private is_present = false;
    private is_installed = false;
    private is_built = false;

    private updates?: (restart: boolean) => any;

    constructor(environment: ServerInstancePaths, server: NodeServerEditable, params: RuntimeEditable & { auto: boolean, restarts: boolean }) {
        this.root = environment.root;
        this.node = environment.node;
        this.npm = environment.npm;
        this.git = environment.git;
        this.log = environment.logs;
        this.info = server;
        this.params = params;

        this.check().then(() => {
            if (this.params.auto) this.start();
        });
    }

    async check() {
        const [ dir, _d ] = await unwrappedStat(this.root);
        if (!dir || !dir.isDirectory()) {
            this.is_present = false;
            this.is_installed = false;
            this.is_built = false;
            return;
        }

        const [ packageJSON, _p ] = await unwrappedStat(join(this.root, "package.json"));
        const [ modules, _m ] = await unwrappedStat(join(this.root, "node_modules"));
        const [ runner, _r ] = await unwrappedStat(join(this.root, this.info.path));

        this.is_present = packageJSON !== null && packageJSON.isFile();
        this.is_installed = modules !== null && modules.isDirectory();
        this.is_built = runner !== null && runner.isFile();
    }

    getStatus() {
        return {
            installed: this.is_present,
            dependencies: this.is_installed,
            built: this.is_built,
            running: !!this.server,
            operating: !!this.operation,
            waiting_for_update: !!this.updates,
        }
    }

    getLogger() {
        return this.active_log;
    }

    private events(server: SpawnedServer) {
        this.run = ulid();
        this.active_log = new LogFileHelper(this.run, this.log);

        server.on("stop", async (signal, graceful) => {
            if (!this.active_log) return;
            await this.active_log.end(Date.now(), `KILLED ${signal}`);
            this.active_log = undefined;
            this.server = undefined;
            this.timing = undefined;
            if (this.updates) return this.updates(!graceful);
            if (this.params.restarts && !graceful) {
                setTimeout(this.start.bind(this), 500);
            }
        });

        server.on("exit", async (code, graceful) => {
            if (!this.active_log) return;
            await this.active_log.end(Date.now(), `STOPPED ${"EXIT CODE: " + code}`);
            this.active_log = undefined;
            this.server = undefined;
            this.timing = undefined;
            if (this.updates) return this.updates(!graceful);
            if (this.params.restarts && !graceful) {
                setTimeout(this.start.bind(this), 500);
            }
        });

        server.on("error", () => {

        })

        server.on("start", () => {
            this.timing = { start: Date.now() };
            if (!this.active_log) return;
            this.active_log.start(this.timing.start);
        });

        server.on("log", (type, message) => {
            if (!this.active_log) return;
            this.active_log.handleLog({ type, message, at: Date.now() });
        })
    }

    async start(): Promise<Unwrap<true, ErrorCode>> {
        if (this.server) return [ true, null ];
        if (this.operation) return [ null, "OPERATION_RUNNING" ];
        await this.check();
        if (!this.is_present) return [ null, "PROJECT_MISSING" ];
        if (!this.is_installed && this.info.install !== "") return [ null, "PACKAGES_MISSING" ];
        if (!this.is_built) return [ null, "PROJECT_RUNNER_MISSING" ];

        const server = new SpawnedServer(this.node);
        const result = await server.start(join(this.root, this.info.path), this.root, this.params);

        if (!result) return [ null, "START_FAILED" ];

        return [ true, null ];
    }

    stop() {
        if (this.server) this.server.stop();
    }

    operate(operation: Operation): Promise<Unwrap<boolean, ErrorCode>> {
        const promise = new Promise<Unwrap<boolean, ErrorCode>>((resolve) => {
            if (this.server) return resolve([ null, "SERVER_RUNNING" ]);
            if (this.operation) return resolve([ null, "OPERATION_RUNNING" ]);

            if (operation.exe === "git") {
                if (!this.is_present && operation.command === "pull") return resolve([ null, "REPO_NOT_PRESENT" ]);
                const cmd = new GitCommand(this.git);
                cmd.run(operation.command, this.info.repo, this.root);
                this.operation = cmd;
            } else if (operation.exe === "npm") {
                if (!this.is_present) return resolve([ null, "REPO_NOT_PRESENT" ]);
                const cmd = new NPMCommand(this.npm);
                if (operation.command === "build") {
                    if (!this.info.build || this.info.build.length < 1) return resolve([ null, "NO_BUILD_SCRIPT" ]);
                    cmd.build(this.info.build, this.root);
                } else {
                    if (this.info.install === "") return resolve([ null, "INSTALL_NOT_PERMITTED" ]);
                    cmd.install(this.info.install, this.info.force_install, this.root);
                }
                this.operation = cmd;
            } else {
                resolve([ null, "NOT_IMPLEMENTED" ])
                return null as never;
            }

            this.operation.on("log", (log) => {

            });
            this.operation.on("exit", (code, graceful) => {
                this.operation = undefined;
                if (this.updates) this.updates(!graceful);
                resolve([ true, null ]);
            });
            this.operation.on("stop", (sign) => {
                this.operation = undefined;
                if (this.updates) this.updates(false);
                resolve([ false, null ]);
            });
        });

        promise.then(this.check);
        return promise;
    }

    stopOperation() {
        if (this.operation) {
            this.operation.stop();
        }
    }

    onStop(call: (restart: boolean) => any) {
        this.updates = call;
    }

    forceQuit() {
        return new Promise<void>((resolve) => {
            let count = 0;
            this.updates = undefined;
            const isClosed = () => {
                count --;
                if (count <= 0) resolve();
            }
            if (this.server) {
                count ++;
                this.server.stop();
                this.server.on("stop", () => isClosed());
                this.server.on("exit", () => isClosed());
            }
            if (this.operation) {
                count ++;
                this.operation.stop();
                this.operation.on("stop", () => isClosed());
                this.operation.on("exit", () => isClosed());
            }
            if (count === 0) resolve();
        })
    }

    async logfiles(): Promise<string[]> {
        const list = await readdir(this.log, { withFileTypes: true, encoding: "utf8" });
        const checked = list.filter(it => it.isFile() && (!this.run || it.name !== this.run)).map(it => it.name);
        return checked.sort().reverse();
    }

    async getLogFile(run: string): Promise<string | null> {
        try {
            // noinspection UnnecessaryLocalVariableJS
            const file = await readFile(join(this.log, run), { encoding: "utf8" });
            return file;
        } catch (_) {
            return null;
        }
    }

}
import { SpawnedServer } from "$lib/process/spawn";
import type {ProcessWrapper} from "$lib/process/process-wrapper";
import type {NodeServerEditable, RuntimeEditable} from "$lib/types";
import {join} from "node:path";
import { stat } from "node:fs/promises";
import {ulid} from "ulidx";
import {LogFileHelper} from "$lib/process/logfile";

const unwrappedStat = async (...params: Parameters<typeof stat>): Promise<[ Awaited<ReturnType<typeof stat>>, null ] | [ null, any ]> => {
    try {
        const info = await stat(...params);
        return [ info, null ];
    } catch (e) {
        return [ null, e ];
    }
}

export const ServerInstanceErrors = {
    SERVER_RUNNING: "Server is currently running",
    SERVER_OFFLINE: "Server is currently offline",
    OPERATION_RUNNING: "Server is currently being modified",
    OPERATION_OFFLINE: "Server is not being modified",
    PROJECT_MISSING: "Project is not downloaded",
    PROJECT_RUNNER_MISSING: "Main Executable is not present",
    START_FAILED: "Server Process Refused to Start",
    NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
} as const;

type ErrorCode = keyof typeof ServerInstanceErrors;
type Unwrap<V, E> = [V, null] | [null, E];

export class ServerInstance {

    private server?: SpawnedServer;
    private run?: string;
    private operation?: ProcessWrapper;
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

    constructor(environment: { node: string, npm: string, git: string, root: string, logs: string }, server: NodeServerEditable, params: RuntimeEditable & { auto: boolean, restarts: boolean }) {
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
        }
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
        if (!this.is_built) return [ null, "PROJECT_RUNNER_MISSING" ];

        const server = new SpawnedServer(this.node);
        const result = await server.start(join(this.root, this.info.path), this.root, this.params);

        if (!result) return [ null, "START_FAILED" ];

        return [ true, null ];
    }

    async stop() {
        if (this.server) this.server.stop();
    }

    async operate() {

    }

    async script() {

    }

}
import type { RuntimeEditable } from "$lib/types";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

type Events = {
    "stop": [ string, boolean ];
    "exit": [ number, boolean ];
    "log": [ "log" | "error", string ];
    "start": [];
    "error": any[];
}

class SpawnedServer {
    private listeners = new Set<{ event: keyof Events, listener: function }>();
    private nodePath: string;
    private nsmFolder: string;
    private process?: ChildProcessWithoutNullStreams;
    private gracefulExit = false;

    constructor(node: string, nsmFolder: string) {
        this.nodePath = node;
        this.nsmFolder = nsmFolder;
    }

    on<T extends keyof Events>(event: T, listener: (...args: Events[T]) => any): () => void {
        const l = { event, listener };
        this.listeners.add(l);
        return (function() { this.listeners.delete(l); }).bind(this);
    }

    private emit<T>(target: T, ...args: Events[T]) {
        this.listeners.forEach(({event, listener}) => {
            if (event === target) listener(...args);
        })
    }

    start(file: string, cwd: string, options: RuntimeEditable) {
        if (this.process) return false;
        this.process = spawn(this.nodePath, file, {
            cwd: cwd,
            env: Object.assign(process.env, options.env),
        });

        this.process.stdout.on("data", (function (chunk) {
            this.emit("log", "log", chunk.toString());
        }).bind(this));

        this.process.stderr.on("data", (function (chunk) {
            this.emit("log", "error", chunk.toString());
        }).bind(this));

        this.process.on("exit", (function (code, signal) {
            if (typeof code === "number") {
                this.emit("exit", code, this.gracefulExit);
            } else if (typeof signal === "string") {
                this.emit("stop", signal, this.gracefulExit);
            }
        }).bind(this));

        this.process.on("error", ( function (...args) {
            this.emit("error", ...args);
        }).bind(this));

        this.emit("start");
        return true;
    }

    stop() {
        if (!this.process) return false;
        this.gracefulExit = true;
        this.process.kill();
        this.process = undefined;
        return true;
    };

}
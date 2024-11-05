import type { ChildProcessWithoutNullStreams } from "node:child_process";

type Events = {
    "stop": [string, boolean];
    "exit": [number, boolean];
    "log": ["log" | "error", string];
    "start": [];
    "error": any[];
}

export class ProcessWrapper {
    private listeners = new Set<{ event: keyof Events, listener: (...args: any[]) => any }>();
    protected graceful: boolean = false;

    protected wrap(process: ChildProcessWithoutNullStreams) {
        process.stdout.on("data", (chunk) => {
            this.emit("log", "log", chunk.toString());
        });

        process.stderr.on("data", (chunk) => {
            this.emit("log", "error", chunk.toString());
        });

        process.on("exit", (code, signal) => {
            if (typeof code === "number") {
                this.emit("exit", code, this.graceful);
            } else if (typeof signal === "string") {
                this.emit("stop", signal, this.graceful);
            }
        });

        process.on("error", (...args) => {
            this.emit("error", ...args);
        });
    }

    on<T extends keyof Events>(event: T, listener: (...args: Events[T]) => any): () => void {
        const l = { event, listener };
        this.listeners.add(l);
        return (() => { this.listeners.delete(l); });
    }

    protected emit<T extends keyof Events>(target: T, ...args: Events[T]) {
        this.listeners.forEach(({event, listener}) => {
            if (event === target) listener(...args);
        })
    }
}
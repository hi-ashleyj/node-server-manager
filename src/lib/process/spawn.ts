import type { RuntimeEditable } from "$lib/types";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import {ProcessWrapper} from "$lib/process/process-wrapper";

type Events = {
    "stop": [ string, boolean ];
    "exit": [ number, boolean ];
    "log": [ "log" | "error", string ];
    "start": [];
    "error": any[];
}

export class SpawnedServer extends ProcessWrapper {
    private nodePath: string;
    private process?: ChildProcessWithoutNullStreams;

    constructor(node: string) {
        super();
        this.nodePath = node;
    }

    async start(file: string, cwd: string, options: RuntimeEditable) {
        if (this.process) return false;
        this.process = spawn(this.nodePath, [ file ], {
            cwd: cwd,
            env: Object.assign({}, process.env, options.env),
        });

        this.wrap(this.process);

        this.emit("start");
        return true;
    }

    stop() {
        if (!this.process) return false;
        this.shutdown();
        this.process.kill();
        this.process = undefined;
        return true;
    };

}
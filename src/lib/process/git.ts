import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import {ProcessWrapper} from "$lib/process/process-wrapper";

type Events = {
    "stop": [ string, boolean ];
    "exit": [ number, boolean ];
    "log": [ "log" | "error", string ];
    "start": [];
    "error": any[];
}

export class GitCommand extends ProcessWrapper {
    private gitPath: string;
    private process?: ChildProcessWithoutNullStreams;

    constructor(git: string) {
        super();
        this.gitPath = git;
    }

    async run(task: "clone" | "pull", remote: string, cwd: string) {
        if (this.process) return false;
        await rm(cwd, { recursive: true, force: true });
        await mkdir(cwd, { recursive: true, mode: "" });

        this.process = spawn(this.gitPath, task === "pull" ? [ "pull" ] : [ "clone", remote, "." ], {
            cwd: cwd,
        });

        this.wrap(this.process)

        this.emit("start");
        return true;
    }

    stop() {
        if (!this.process) return false;
        this.graceful = true;
        this.process.kill();
        this.process = undefined;
        return true;
    };

}
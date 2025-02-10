import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { ProcessWrapper } from "./process-wrapper";

export class NPMCommand extends ProcessWrapper {
    private npmPath: string;
    private process?: ChildProcessWithoutNullStreams;

    constructor(npm: string) {
        super();
        this.npmPath = npm;
    }

    async install(task: "install" | "ci", force: boolean, cwd: string) {
        if (this.process) return false;
        
        this.process = spawn(this.npmPath, force ? [ task, "--force" ] : [ task ], {
            cwd: cwd,
        });

        this.wrap(this.process);

        this.emit("start");
        return true;
    }

    async build(script: string, cwd: string, env: Record<string,string>) {
        if (this.process) return false;

        this.process = spawn(this.npmPath, [ "run" , script ], {
            cwd: cwd,
            env: Object.assign({}, process.env, env),
        });

        this.wrap(this.process);

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
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

class NPMCommand extends ProcessWrapper {
    private npmPath: string;
    private process?: ChildProcessWithoutNullStreams;

    constructor(npm: string) {
        this.npmPath = npm;
        super();
    }

    async install(task: "install" | "ci", force: boolean, cwd: string) {
        if (this.process) return false;
        
        this.process = spawn(this.npmPath, force ? [ task, "--force" ] : [ task ], {
            cwd: cwd,
        });

        this.wrap(process);

        this.emit("start");
        return true;
    }

    async build(script: string, cwd: string) {
        if (this.process) return false;

        this.process = spawn(this.npmPath, [ "run" , script ], {
            cwd: cwd,
        });

        this.wrap(process);

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
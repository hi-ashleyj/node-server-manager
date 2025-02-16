import { spawn } from "node:child_process";


export const summonFromEther = (opts: { command: string, args: string[], cwd: string}): Promise<{ code: number | null, stdout: string, stderr: string, signal: NodeJS.Signals | null }> => {
    return new Promise((resolve, rejects) => {
        const summoned = spawn(opts.command, opts.args, {
            cwd: opts.cwd,
        });

        let stdout = "";
        let stderr = "";

        summoned.on("error", (err) => {
            rejects(err);
        })

        summoned.on("exit", (code, signal) => {
            resolve({
                code,
                signal,
                stdout,
                stderr
            })
        })

        summoned.stdout.on("data", (chunk) => stdout += chunk.toString());
        summoned.stderr.on("data", (chunk) => stderr += chunk.toString());

    });
}
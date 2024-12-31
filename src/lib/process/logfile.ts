import type {LogFile, Log} from "$lib/log/common";
import { createWriteStream, WriteStream } from "node:fs";
import { join } from "node:path";
import {encodeFooter, encodeHeader, encodeLog} from "$lib/log/encode";

const promiseWriteToStream = (stream: WriteStream, data: string) => new Promise<void>((resolve) => {
    stream.write(data, () => {
        resolve();
    })
});

export class LogFileHelper {
    private run: string;
    private path: string;
    private writeQueue: Log[] = [];
    private writtenStart = false;
    private lock = false;

    private recent: Log[] = [];

    private timeout: NodeJS.Timeout | null = null;

    constructor (run: string, directory: string) {
        this.run = run;
        this.path = join(directory, run);
    }

    private async writeLogs() {
        const encoded = this.writeQueue.map(it => encodeLog(it)).join("");
        this.writeQueue = [];
        const file = createWriteStream(this.path, { flags: "a", encoding: "utf8" });
        await promiseWriteToStream(file, encoded);
        file.end();
        this.timeout = null;
        if (this.writeQueue.length > 0) {
            this.timeout = setTimeout(this.writeLogs.bind(this), 1500);
        }
    }

    async start(time: number): Promise<boolean> {
        if (this.writtenStart || this.lock) return false;
        this.writtenStart = true;
        const file = createWriteStream(this.path, { flags: "a", encoding: "utf8" });
        await promiseWriteToStream(file, encodeHeader(this.run, time));
        file.end();
        return true;
    }

    async end(time: number, reason: LogFile["circumstance"]): Promise<boolean> {
        if (this.lock) return false;
        this.lock = true;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        await this.writeLogs();
        const file = createWriteStream(this.path, { flags: "a", encoding: "utf8" });
        await promiseWriteToStream(file, encodeFooter(time, reason));
        file.end();
        return true;
    }

    handleLog(log: Log) {
        if (this.lock) return false;
        if (!this.timeout) {
            this.timeout = setTimeout(this.writeLogs.bind(this), 1500);
        }
        this.writeQueue.push(log);
        this.recent.push(log);
        while (this.recent.length > 100) {
            this.recent.shift();
        }
        return true;
    }

    getRecent() {
        return this.recent;
    }
}
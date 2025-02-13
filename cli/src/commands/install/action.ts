import { InstallCommandOptions } from "./options.js";
import { readdir, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { Open } from "unzipper";

const RELEASE_URL = "https://github.com/hi-ashleyj/node-server-manager/releases/latest/download/manager.zip";

const systemd = (options: InstallCommandOptions) => ``;

const action = async (options: InstallCommandOptions, progress: (str) => any|void): Promise<[ true, null ] | [ null, string ]> => {
    progress("Clearing Install Directory");
    try {
        const insides = await readdir(options.location, { withFileTypes: true });
        for (let friend of insides) {
            await rm(friend.name, { force: true, recursive: true });
        }
    } catch (e) {
        return [ null, "Failed to clean install directory." ];
    }

    progress("Downloading Latest Release");
    const dir = join(tmpdir(), randomUUID());
    const file = join(dir, "manager.zip");
    try {
        await mkdir(dir);
    } catch (e) {
        return [ null, "Failed to prepare download." ];
    }
    try {
        const res = await fetch(RELEASE_URL);
        if (!res.ok) return [ null, "Failed to download file." ];
        const buf = await res.arrayBuffer();
        await writeFile(file, Buffer.from(buf));
    } catch (e) {
        return [ null, "Failed to download file."]
    }
    
    progress("Unzipping");
    const unzip = await Open.file(file);
    await unzip.extract({ path: options.location });

    progress("Installing Service");
    if (options.install === "windows") {

    }
    if (options.install === "linux") {
        
    }
    if (options.install === "linux-print") {

    }

    
}
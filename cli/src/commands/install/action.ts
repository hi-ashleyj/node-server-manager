import { InstallCommandOptions, InstallCommandOptionLinux } from "./options.js";
import { readdir, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import extract from "extract-zip";
import { setupWindows, installService } from "../../lib/windows-service.js";

const RELEASE_URL = "https://github.com/hi-ashleyj/node-server-manager/releases/latest/download/manager.zip";

const systemd = (options: InstallCommandOptionLinux & { location: string }) => `[Unit]
Description=Node Server Manager
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=1
User=${options.serviceUser}
ExecStart=${options.node} ${options.location}
Environment="PORT=14664"

[Install]
WantedBy=multi-user.target`;

export const action = async (options: InstallCommandOptions, progress: (str) => any|void): Promise<[ { success: string, steps: string[], post?: string }, null ] | [ null, string ]> => {
    progress("Checking Install Directory");
    try {
        const thing = await mkdir(options.location, { recursive: true });
    } catch (e) {
        return [ null, "Failed to make install directory" ];
    }
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
    try {
        await extract(file, { dir: options.location })
    } catch (e) {
        return [ null, "Failed to Unzip file" ];
    }

    progress("Installing Service (expect UAC prompting)");
    switch (options.install) {
        case ("windows"): {
            const windows = await setupWindows({ location: options.location, node: options.node });
            const success = await installService(windows);
            if (!success) return [ null, "Service install failed."];
            return [ { success: "Installed!", steps: [
                "Navigate to localhost:14664 for management portal",
                "Use user/password admin/admin to log in",
                "Set up enviroment an begin adding your servers!"
            ] } , null ];
        }
        case "linux": {
            const serviceFile = systemd(options);
            try {
                await writeFile("/etc/systemd/system/nsm2", serviceFile, { encoding: "utf8" });
                return [ { success: "Installed!", steps: [
                    "Run systemctl start nsm2.service",
                    "Navigate to localhost:14664 for management portal",
                    "Use user/password admin/admin to log in",
                    "Set up enviroment an begin adding your servers!"
                ] }, null ];
            } catch (e) {
                return [ { success: "Partially Installed", steps: [
                    "Write the below file contents to /etc/systemd/system/nsm2.service",
                    "Run systemctl start nsm2",
                    "Navigate to localhost:14664 for management portal",
                    "Use user/password admin/admin to log in",
                    "Set up enviroment an begin adding your servers!"
                ], post: serviceFile }, null ];
            }
        }
        case "linux-print": {
            const serviceFile = systemd(options);

            return [ { success: "Installed!", steps: [
                "Write the below file contents to /etc/systemd/system/nsm2.service",
                "Run systemctl start nsm2",
                "Navigate to localhost:14664 for management portal",
                "Use user/password admin/admin to log in",
                "Set up enviroment an begin adding your servers!"
            ], post: serviceFile }, null ];
        }
        case "manual": {
            return [ { success: "Installed!", steps: [
                "All set! Feel free to complete the installation at your own pace",
            ] }, null ];
        }
        default: {
            return null as never;
        }
    }
}
import { UninstallCommandOptions } from "./options.js";
import { readdir, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setupWindows, uninstallService } from "@/windows-service.js";

const RELEASE_URL = "https://github.com/hi-ashleyj/node-server-manager/releases/latest/download/manager.zip";

export const action = async (options: UninstallCommandOptions, progress: (str) => any|void): Promise<[ { success: string, steps: string[], post?: string }, null ] | [ null, string ]> => {
    progress("Uninstalling Service (expect UAC prompting)");
    switch (options.install) {
        case ("windows"): {
            const windows = await setupWindows({ location: options.location, node: options.node });
            const success = await uninstallService(windows);
            if (!success) return [ null, "Service uninstall failed."];
            break;
        }
        case "linux": {
            try {
                await rm("/etc/systemd/system/nsm2");
            } catch (e) {
                return [ null, "Failed to remove service file" ];
            }
            break;
        }
        default: {
            return null as never;
        }
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

    return [ { success: "Removed!", steps: [] }, null ];
}
import { text, intro, cancel, log, isCancel, select, spinner, confirm, outro } from "@clack/prompts";
import type { InstallCommandOptions } from "./options.js";
import color from 'picocolors';
import { setTimeout } from "node:timers/promises";

export const interact = async (partial: Partial<InstallCommandOptions>): Promise<void> => {
    // Opening Line
    intro(color.inverse("nsm cli : installer"));
    
    // Install Location
    let location = process.cwd();
    if (partial.location) {
        log.message(`Using supplied directory: ${partial.location}`, { symbol: color.cyan('~') });
        location = partial.location;
    } else {
        const next = await text({
            message: "Install Directory",
            placeholder: "Leave empty to choose current directory",
            defaultValue: process.cwd(),
        });
        if (isCancel(next)) { cancel("Cancelled. Haere rā!"); process.exit(0); }
        if (next) location = next;
    }
    // TODO: STAT AND READDIR IT

    // Install Type
    let install = "manual";
    if (partial.install) {
        install = partial.install;
    } else {
        const next = await select({
            message: "Install System Service?",
            options: [
                { value: "manual", label: "Manual Install" },
                { value: "windows", label: "Windows Service Install" },
                { value: "linux", label: "Systemd Service Install" },
                { value: "linux-print", label: "Systemd Service - Print Configuration"}
            ]
        });
        if (isCancel(next)) { cancel("Cancelled. Haere rā!"); process.exit(0); }
        if (next) install = next;
    }

    // Executable Required if not manual
    let node = process.execPath;
    if (install !== "manual") {
        const next = await text({
            message: "Path to node executable:",
            defaultValue: process.execPath,
            placeholder: "Enter to use current executable",
        });
        if (isCancel(next)) { cancel("Cancelled. Haere rā!"); process.exit(0); }
        if (next) node = next;
    }
    // TODO: STAT THAT

    // User required for linux
    let user = "";
    if (install === "linux" || install === "linux-print") {
        const next = await text({
            message: "User for running service",
        });
        if (isCancel(next)) { cancel("Cancelled. Haere rā!"); process.exit(0); }
        if (next) user = next;
    }

    const res = await confirm({
        message: "Last Chance! This will wipe the install directory. Proceed?",
    })
    if (isCancel(res)) { cancel("Cancelled. Haere rā!"); process.exit(0); }
    if (!res) { cancel("Aborted. Haere rā!"); process.exit(0); }

    const spin = spinner();
    spin.start("Clearing Install Directory");
    await setTimeout(200);
    spin.message("Downloading Latest Release");
    await setTimeout(2000);
    spin.message("Unzipping");
    await setTimeout(200);
    spin.message("Installing Service");
    await setTimeout(200);
    spin.stop("Installed");
    outro("Ready to go!");
}
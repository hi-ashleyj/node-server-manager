import { text, intro, cancel, log, isCancel, select, spinner } from "@clack/prompts";
import type { InstallCommandOptions } from "./options.js";
import color from 'picocolors';

export const interact = async (partial: Partial<InstallCommandOptions>): InstallCommandOptions => {
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
        if (isCancel(next)) { cancel("adios!"); process.exit(0); }
        if (next) location = next;
    }

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
        if (isCancel(next)) { cancel("adios!"); process.exit(0); }
        if (next) install = next;
    }

    // Executable Required
    let node = process.execPath;
    if (install !== "manual") {
        const next = await text({
            message: "Path to node executable:",
            defaultValue: process.execPath,
            placeholder: "Enter to use current executable",
        });
        if (isCancel(next)) { cancel("adios!"); process.exit(0); }
        if (next) node = next;
    }
    
    console.log({ location, install, node })


}
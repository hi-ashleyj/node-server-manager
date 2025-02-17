import { text, intro, cancel, log, isCancel, select, spinner, confirm, outro } from "@clack/prompts";
import type { UninstallCommandOptions } from "./options.js";
import color from 'picocolors';
import { action as doInstall } from "./action.js";

export const interact = async (partial: Partial<UninstallCommandOptions>): Promise<void> => {
    // Opening Line
    intro(color.inverse("nsm cli : uninstaller"));
    
    // Install Location
    let location = process.cwd();
    if (partial.location) {
        log.message(`Using supplied directory: ${partial.location}`, { symbol: color.cyan('~') });
        location = partial.location;
    } else {
        const next = await text({
            message: "Current Directory",
            placeholder: "Leave empty to choose current directory",
            defaultValue: process.cwd(),
        });
        if (isCancel(next)) { cancel("Cancelled. Haere rā!"); process.exit(0); }
        if (next) location = next;
    }
    // TODO: STAT AND READDIR IT

    // Install Type
    let install: UninstallCommandOptions["install"] = "windows";
    if (partial.install) {
        install = partial.install;
    } else {
        const next = await select({
            message: "Which service was installed",
            options: [
                { value: "windows", label: "Windows Service Uninstall" },
                { value: "linux", label: "Systemd Service Uninstall" },
            ]
        });
        if (isCancel(next)) { cancel("Cancelled. Haere rā!"); process.exit(0); }
        if (next) install = next;
    }

    // Executable Required if not manual
    let node = process.execPath;
    if (install === "windows") {
        const next = await text({
            message: "Path to node executable:",
            defaultValue: process.execPath,
            placeholder: "Enter to use current executable",
        });
        if (isCancel(next)) { cancel("Cancelled. Haere rā!"); process.exit(0); }
        if (next) node = next;
    }

    const res = await confirm({
        message: "Last Chance! This will remove the service and wipe the install directory. Data directory will be saved",
    })
    if (isCancel(res)) { cancel("Cancelled. Haere rā!"); process.exit(0); }
    if (!res) { cancel("Aborted. Haere rā!"); process.exit(0); }

    const spin = spinner();
    spin.start("Starting...");
    const [ installed, error ] = await doInstall({
        location,
        install,
        node,
    }, (str) => spin.message(str));

    if (error) {
        cancel(color.bgRed(`Error occured:\n${error}\nApologies.`));
        process.exit(0);
    }

    spin.stop(color.bgGreen(installed.success));
    outro("Haere Rā!");
}
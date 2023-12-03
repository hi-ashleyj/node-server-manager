import { resolve as resolvePath } from "node:path";

/**
 * 
 * @returns {"packages" | "install" | "uninstall"}
 */
const args = () => {
    for (let val of process.argv) {
        if (val === "install-packages") return "packages";
        if (val === "install-service") return "install";
        if (val === "uninstall-service") return "uninstall";
    }

    throw new Error("Mode Not Specified.\nUse cli.js <install-packages | install-service | uninstall-service>");
}

const mode = args();

/**
 * 
 * @param {import("node:child_process").ChildProcessWithoutNullStreams} process 
 * @returns {Promise<{ code: number | null, signal: NodeJS.Signals | null }>}
 */
const waitForChildProcess = (process) => {
    return new Promise((resolve, rejects) => {
        process.on("exit", (code, signal) => {
            resolve({ code, signal });
        })
    });
};

const installPackages = async () => {

    const child_process = await import("node:child_process");

    console.log("Installing Packages...");
    console.log("");
    const process = child_process.spawn(resolvePath("../node/npm.cmd"), ["ci", "--production"], {
        cwd: resolvePath(".")
    });

    process.stdout.on("data", (chunk) => {
        console.log(chunk);
    });

    process.stderr.on("data", (chunk) => {
        console.error(chunk);
    });

    const { code, signal } = await waitForChildProcess();

    if (typeof signal === "string") {
        console.log("Terminated by Signal: " + signal);
    }
    if (typeof code === "number") {
        console.log("Exited Normally with Code: " + code);
    }

    return true;
};

/**
 *  @returns {import("node-windows").Service}
 */
const setupWindows = async () => {
    const { Service } = await import("node-windows");

    const svc = new Service({
        name: "Node Server Manager Service",
        description: "Parent service which runs and manages other node.js servers. Configure at localhost:7436",
        maxRestarts: 3,
        execPath: path.resolve(__dirname, "..", "node", "node.exe"),
        script: path.resolve(__dirname, "serve.js"),
    })

    return svc;
};

/**
 * @param {import("node-windows").Service} service 
 */
const installService = async (service) => {
    return new Promise((resolve) => {

        service.on("install", () => {
            console.log("Service Installed. Attempting to Start...");
            service.start();
        });

        service.on("alreadyinstalled", () => {
            console.log("Service Already Installed. Attempting Start...");
            service.start();
        });

        service.on("start", () => {
            console.log("Service Started. Install Complete.");
            resolve();
        });

        service.on("error", (e) => {
            console.log("Unknown Error Occurred. More Detailed Below:");
            console.log(e);
            resolve();
        });

        service.on("invalidinstallation", (e) => {
            console.log("Installation Detected, however some files are missing. More details below:");
            console.log(e);
            resolve();
        });

        console.log("Service Installation...");
        service.install();
    });
};

/**
 * @param {import("node-windows").Service} service 
 */
const uninstallService = async (service) => {
    return new Promise((resolve) => {

        service.on("stop", () => {
            console.log("Service Stopped.");
        });

        service.on("uninstall", () => {
            console.log("Service Uninstalled. ");
            resolve();
        });

        service.on("alreadyuninstalled", () => {
            console.log("Service Already Uninstalled.");
            resolve();
        });

        service.on("error", (e) => {
            console.log("Unknown Error Occurred. More Detailed Below:");
            console.log(e);
            resolve();
        });

        console.log("Removing Service...");
        service.uninstall();
    });
};

if (mode === "packages") {
    await installPackages();
} else if (mode === "install") {
    const service = await setupWindows();
    await installService(service);
} else if (mode === "uninstall") {
    const service = await setupWindows();
    await uninstallService(service);
}
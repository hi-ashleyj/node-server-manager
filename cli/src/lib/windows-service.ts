import type { Service } from "node-windows";
import { join } from "node:path";

export const setupWindows = async (options: { location: string, node: string }) => {
    const { Service } = await import("node-windows");

    const svc = new Service({
        name: "Node Server Manager Service",
        description: "Parent service which runs and manages other node.js servers. Configure at localhost:14664",
        maxRestarts: 3,
        execPath: options.node,
        script: join(options.location, "index.js"),
    })

    return svc;
};

export const installService = async (service: Service) => {
    return new Promise<boolean>((resolve) => {

        service.on("install", () => {
            service.start();
        });

        service.on("alreadyinstalled", () => {
            service.start();
        });

        service.on("start", () => {
            resolve(true);
        });

        service.on("error", (e) => {
            console.log(e);
            resolve(false);
        });

        service.on("invalidinstallation", (e) => {
            resolve(false);
        });

        service.install();
    });
};

/**
 * @param {import("node-windows").Service} service 
 */
export const uninstallService = async (service) => {
    return new Promise((resolve) => {

        service.on("stop", () => {
            console.log("Service Stopped.");
        });

        service.on("uninstall", () => {
            resolve(true);
        });

        service.on("alreadyuninstalled", () => {
            resolve(true);
        });

        service.on("error", (e) => {
            resolve(false);
        });

        console.log("Removing Service...");
        service.uninstall();
    });
};
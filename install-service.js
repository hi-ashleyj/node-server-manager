let { Service } = require("node-windows");
let path = require("path");
let readline = require("readline");

let rl = readline.createInterface({ input: process.stdin, output: process.stdout });

let questionPromise = (prompt) => {
    return new Promise((resolve, reject) => {
        rl.question(prompt, (...results) => { resolve(results); });
    });
};

console.log("Loaded packages")
console.log("Configuring service")
let svc = new Service({
    name: "Node Server Manager Service",
    description: "Parent service which runs and manages other node.js servers. Configure at localhost:7436",
    maxRestarts: 3,
    execPath: path.resolve(__dirname, "..", "node", "node.exe"),
    script: path.resolve(__dirname, "app.js")
});

svc.on("install", () => {
    console.log("Service installed, attempting start");
    svc.start();
});

svc.on("alreadyinstalled", async () => {
    console.log("Service already installed.");

    await questionPromise("Press Enter to attempt to start, or Ctrl + C to exit");
    svc.start();
});

svc.on("start", async () => {
    console.log("Service started. Installation complete");

    await questionPromise("Press Enter or Ctrl + C to exit...");
    rl.close();
    process.exit(0);
});

svc.on("error", async (e) => {
    console.log("Unknown Error occurred, more details below:");
    console.log(e);
    console.log("");
    
    await questionPromise("Press Enter or Ctrl + C to exit...");
    rl.close();
    process.exit(0);
});

svc.on("invalidinstallation", async (e) => {
    console.log("Installation Detected, however some files are missing. More details below:");
    console.log(e);
    console.log("");
    
    await questionPromise("Press Enter or Ctrl + C to exit...");
    rl.close();
    process.exit(0);
});

console.log("Attempting service install");
svc.install();
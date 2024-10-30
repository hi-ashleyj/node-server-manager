import { spawn } from "node:child_process";

export type ProcessConfig = {
    variant: "test" | "production";
    type: "start" | "git-clone" | "git-pull" | "npm-install" | "npm-build";
    paramStyle: "param" | "env";
    params: Record<string, string>;
    rootLocation: string;
    id: string;
    runPath: string;
};

export const createProcess = ({}: ProcessConfig) => {
    return "asdasd";
}




if (Manager.servers[id].runfile.length == 0) {
    return;
}
let options = {};
let args = [];

args.push(Manager.servers[id].runfile);
args.push("port:" + (((type == "test") ? 30000 : 0) + Manager.servers[id].port));
args.push("using:" + type);
let telpath = path.resolve(storeFolder, "telemetry", id + "-" + type);
args.push("telemetry:" + telpath);
if (!fsSync.existsSync(telpath)) fsSync.mkdirSync(telpath);

options.cwd = path.resolve(rootFolder, type, "" + id);

let nodeLoc = path.resolve(rootFolder, "node", "node.exe");

let process = child_process.spawn(nodeLoc, args, options);

Manager.runningServers[type][id] = new SpawnedServer(type, id, process);
Manager.broadcast("start", id, type);
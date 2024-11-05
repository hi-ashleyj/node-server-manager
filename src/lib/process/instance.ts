import { SpawnedServer } from "$lib/process/spawn";
import type {ProcessWrapper} from "$lib/process/process-wrapper";
import type { NodeServerEditable, RuntimeEditable } from "$lib/types";
import {join} from "node:path";
import { stat } from "node:fs/promises";

const unwrappedStat = async (...params: Parameters<typeof stat>): Promise<[ Awaited<ReturnType<typeof stat>>, null ] | [ null, any ]> => {
    try {
        const info = await stat(...params);
        return [ info, null ];
    } catch (e) {
        return [ null, e ];
    }
}

export class ServerInstance {

    private server?: SpawnedServer;
    private operation?: ProcessWrapper;
    private root: string;
    private info: NodeServerEditable;
    private params: RuntimeEditable;

    private is_present = false;
    private is_installed = false;
    private is_built = false;

    constructor(root: string, server: NodeServerEditable, params: RuntimeEditable) {
        this.root = root;
        this.info = server;
        this.params = params;
    }

    async check() {
        const dir = await unwrappedStat(this.root);
        const packageJSON = await unwrappedStat(join(this.root, "package.json"));
        const modules = await unwrappedStat(join(this.root, "node_modules"));
        const runner = await unwrappedStat(join(this.root, this.info.path));
    }

}
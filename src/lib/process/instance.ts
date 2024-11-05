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
    private params: RuntimeEditable & { auto: boolean };

    private is_present = false;
    private is_installed = false;
    private is_built = false;

    constructor(root: string, server: NodeServerEditable, params: RuntimeEditable & { auto: boolean }) {
        this.root = root;
        this.info = server;
        this.params = params;

        this.check().then(() => {
            if (this.params.auto) this.params.start();
        });
    }

    async check() {
        const [ dir, _d ] = await unwrappedStat(this.root);
        if (!dir || !dir.isDirectory()) {
            this.is_present = false;
            this.is_installed = false;
            this.is_built = false;
            return;
        }

        const [ packageJSON, _p ] = await unwrappedStat(join(this.root, "package.json"));
        const [ modules, _m ] = await unwrappedStat(join(this.root, "node_modules"));
        const [ runner, _r ] = await unwrappedStat(join(this.root, this.info.path));

        this.is_present = packageJSON !== null && packageJSON.isFile();
        this.is_installed = modules !== null && modules.isDirectory();
        this.is_built = runner !== null && runner.isFile();
    }

    getStatus() {

    }

    async start() {

    }

    async stop() {

    }

    async operate() {

    }

    async script() {

    }

}
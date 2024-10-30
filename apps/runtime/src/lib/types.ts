export type NodeServer = {
    id: string;
    name: string;
    port: number;
    repo: string;

    auto: boolean;
    path: string;
    build: string;

    test: RuntimeInfo;
    prod: RuntimeInfo;
}

export type NodeServerEditable = NodeServer & {

    auto: boolean;
    path: string;
    build: string;

}

export type RuntimeInfo = {
    active: boolean;
}
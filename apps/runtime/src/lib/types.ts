export type NodeServer = {
    id: string;
    name: string;
    port: number;
    repo: string;

    test: RuntimeInfo;
    prod: RuntimeInfo;
}

export type NodeServerEditable = NodeServer & {

    auto: boolean;
    path: string;
    install: "" | "install" | "ci";
    build: string;

    test: RuntimeEditable;
    prod: RuntimeEditable;

}

export type RuntimeInfo = {
    active: boolean;
}

export type RuntimeEditable = RuntimeInfo & {
    env: Record<string, string>;
}
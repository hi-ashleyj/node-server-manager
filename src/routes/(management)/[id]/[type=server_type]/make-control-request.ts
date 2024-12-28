export type Controls = "build" | "clone" | "install" | "pull" | "setup" | "start" | "stop" | "update";

export const controlRequest = async (params: { id: string, type: "test" | "production" }, control: Controls): [ boolean, number, any ] => {
    const response = await fetch(`/${params.id}/${params.type}/controls/${control}`, {
        method: "POST",
    });

    const json = await response.json();
    return [ response.ok, response.status, json ];
}
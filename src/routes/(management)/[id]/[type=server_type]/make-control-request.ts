export type Controls = "build" | "clone" | "install" | "pull" | "setup" | "start" | "stop" | "update";
import { invalidateAll } from "$app/navigation";

export const controlRequest = async (params: { id: string, type: "test" | "production" }, control: Controls): [ boolean, number, any ] => {
    const response = await fetch(`/${params.id}/${params.type}/controls/${control}`, {
        method: "POST",
    });

    const json = (!response.ok) ? (await response.json()) : null;
    if (!response.ok) {
        console.log([ response.ok, response.status, json ]);
    }
    invalidateAll().then();
    return [ response.ok, response.status, json ];
}
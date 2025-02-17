import z from "zod";

export const validate = z.object({
    location: z.string().nonempty(),
    install: z.enum([ "linux", "windows" ]),
    quiet: z.boolean(),
}).required();

export type CommandOptions = z.infer<typeof validate>;

export type UninstallCommandOptions = {
    location: string;
    install: "linux" | "windows";
    node?: string;
}

import z from "zod";

export const validate = z.object({
    location: z.string().nonempty(),
    install: z.enum([ "manual", "linux", "windows", "linux-print" ]),
    node: z.string().nonempty().optional(),
    serviceUser: z.string().nonempty().optional(),
    quiet: z.boolean(),
}).required().refine(schema => schema.install === 'manual' || (schema.node && schema.install === "windows") || (schema.node && schema.serviceUser));

export type CommandOptions = z.infer<typeof validate>;

export type InstallCommandOptions = {
    location: string
} & (InstallCommandOptionLinux | InstallCommandOptionManual | InstallCommandOptionWindows)

type InstallCommandOptionWindows = {
    install: "windows"
    node: string
}

type InstallCommandOptionManual = {
    install: "manual"
}

export type InstallCommandOptionLinux = {
    install: "linux" | "linux-print"
    serviceUser: string,
    node: string,
}
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

type InstallCommandOptionLinux = {
    install: "linux" | "linux-print"
    serviceUser: string,
    node: string,
}
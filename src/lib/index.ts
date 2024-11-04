export const serverUrl = (l: Location, port: number): string | null => {
    return l.protocol + "//" + l.hostname + ":" + port;
}

type Logger = ((message: string) => void) & {
    error: (message: string) => void;
    recent: { type: "log" | "error", message: string }[];
    onMessage: (handler: ( type: "log" | "error", message: string ) => void) => (() => void);
};

export const createLogger = (): Logger => {

    const handlers = new Set<( type: "log" | "error", message: string ) => void>();

    //@ts-ignore
    let log: Logger = (message: string) => {
        log.recent = [ ...log.recent.slice(-99), { type: "log", message } ];
        handlers.forEach(it => it("log", message));
        console.log(message);
    };

    log.recent = [];

    log.error = (message: string) => {
        log.recent = [ ...log.recent.slice(-99), { type: "error", message } ];
        handlers.forEach(it => it("error", message));
        console.error(message);
    };

    log.onMessage = (handler) => {
        handlers.add(handler);
        return () => {
            handlers.delete(handler);
        }
    }

    return log;
}

export const log = createLogger();

export const raise = (str: string) => {
    throw new Error(str);
}
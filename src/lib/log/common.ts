export type Log = {
    type: "log" | "error";
    message: string;
    at: number;
}

export type LogFile = {
    start: number;
    end: number;
    circumstance: `STOPPED ${string}` | `KILLED ${string}`;
    logs: Log[];
}
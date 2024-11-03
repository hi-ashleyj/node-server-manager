export type SystemMessages = "TERMINATED" | "UNSUPPORTED" | "TEAPOT";

export type MessageTypes = {
    "subscribe": { channel: string, exact: boolean };
    "subscribed": { channel: string, exact: boolean };
    "unsubscribe": { channel: string };
    "unsubscribed": { channel: string };
    "broadcast": any;
    "message": any
}

export type MessageTypesWithChannel = "broadcast" | "message";


export type Message<T extends keyof MessageTypes = keyof MessageTypes> =
    { type: "system", code: SystemMessages, message: string } |
    { type: T, message: MessageTypes[T], channel: T extends keyof MessageTypesWithChannel ? string : never };
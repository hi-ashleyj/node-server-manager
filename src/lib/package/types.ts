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
    { type: "system", at: number, code: SystemMessages, message: string } |
    { type: T, at: number, message: MessageTypes[T], channel: T extends keyof MessageTypesWithChannel ? string : never };

export type Unwrap<T, E> = [ T, null ] | [ null, E ];

export type ClientEvents = {
    "connect": [],
    "disconnect": [ boolean ],
    "subscribed": [ string, boolean ],
    "unsubscribed": [ string ],
    "close": [],
    "error": [ "NSM_NOT_DETECTED" | "NSM_NEGOTIATE_ERROR" ]
}

export type ClientAPI = {
    on: <T extends keyof ClientEvents>(type: T, callback: ( ...params: ClientEvents[T] ) => any | void ) => Unwrap<() => void, "CLOSED">;
    subscribe: <T = any>(listener: (channel: string, message: T) => {}, channel: string, exact: boolean) => Unwrap<() => void, "CLOSED" | "NIMPE">;
    disconnect: () => Unwrap<true, "CLOSED" | "NIMPE">;
    send: (channel: string, message: any) => Unwrap<true, "CLOSED" | "NIMPE">;
}

export type ExposedAPI = {
    connect: (server: string) => Unwrap<ClientAPI, null>;
}
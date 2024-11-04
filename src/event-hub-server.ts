import ws from "ws";
import { ulid } from "ulidx";
import type { Message as NSMMessage } from "$lib/package/types.js";

type ActiveSocket = {
    socket: InstanceType<typeof ws>;
    listeners: Set<string>;
    is_nsm: boolean;
    version: string;
};

const messageHandler = (active: ActiveSocket, sockets: Map<string, ActiveSocket>, message: NSMMessage) => {
    switch (message.type) {
        case "message":
        case "subscribed":
        case "unsubscribed": {
            active.socket.send(JSON.stringify({ type: "system", code: "TEAPOT", message: `Operation ${message.type} should always be sent by server` } as NSMMessage));
            break;
        }
        case "subscribe": {
            break;
        }
        case "unsubscribe": {
            break;
        }
        case "broadcast": {
            break;
        }
        case "system": {
            break;
        }
        default: {
            // @ts-ignore
            active.socket.send(JSON.stringify({ type: "system", code: "UNSUPPORTED", message: `Operation ${message.type} is not supported by this version of NSM` } as NSMMessage));
            break;
        }
    }
}

export const start = (host = "0.0.0.0") => {

    const server = new ws.Server({
        port: 7667,
        host,
    });

    const sockets = new Map<string, ActiveSocket>();

    server.on("connection", (socket) => {
        const id = ulid();
        socket.on("message", (msg) => {
            const active = sockets.get(id);
            if (!active) return socket.close();

            const buffer = (msg instanceof ArrayBuffer) ? Buffer.from(msg) : (msg instanceof Array) ? Buffer.concat(msg) : msg;
            const message = buffer.toString("utf8");

            if (active.is_nsm && active.version.length > 0) {
                messageHandler(active, sockets, JSON.parse(message));
            } else if (active.is_nsm) {
                const [ mark, version ] = message.split("=");
                if (mark !== "NSM_EVENTS_VERSION") return socket.close();
                active.version = version;
                const clientMajor = version.split(".")[0];
                const serverMajor = __NSM__VERSION__.split(".")[0];
                if (clientMajor !== serverMajor) {
                    socket.send("NSM_EVENTS_VERSION_REQUIRED=" + serverMajor);
                    return socket.close();
                }
                socket.send("NSM_EVENTS_READY");
            } else {
                if (message !== "NSM_EVENTS_PROTOCOL_ACCEPTED") return close();
                active.is_nsm = true;
                socket.send("NSM_EVENTS_VERSION");
            }
        });

        socket.on("close", () => {
            sockets.delete(id);
        });

        sockets.set(id, {
            socket: socket,
            listeners: new Set(),
            is_nsm: false,
            version: "",
        });

        socket.on("open", () => {
            socket.send("NSM_EVENTS_PROTOCOL");
        })
    });

    return () => {
        for (let active of sockets.values()) {
            active.socket.send(JSON.stringify({
                type: "system",
                code: "TERMINATED",
                message: "Server closed"
            }));
            active.socket.close();
        }
        server.close();
    }

}
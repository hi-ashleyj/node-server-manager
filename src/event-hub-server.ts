import ws, { WebSocketServer } from "ws";
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
            const repairedChannel = (message.message.channel[0] !== "/" ? "/" : "") + message.message.channel;
            const spec = message.message.exact ? "!" : ".";
            const channel = spec + repairedChannel;
            active.listeners.add(channel);
            active.socket.send(JSON.stringify({ type: "subscribed", message: { channel: repairedChannel, exact: message.message.exact} } as NSMMessage<"subscribed">));
            break;
        }
        case "unsubscribe": {
            const repairedChannel = (message.message.channel[0] !== "/" ? "/" : "") + message.message.channel;
            active.listeners.delete("!" + repairedChannel);
            active.listeners.delete("." + repairedChannel);
            active.socket.send(JSON.stringify({ type: "unsubscribed", message: { channel: repairedChannel } } as NSMMessage<"unsubscribed">));
            break;
        }
        case "broadcast": {
            const repairedChannel = (message.channel[0] !== "/" ? "/" : "") + message.channel;
            for (let sock of sockets.values()) {
                if (sock.listeners.has("!" + repairedChannel)) {
                    sock.socket.send(JSON.stringify({ type: "message", message: message.message, channel: repairedChannel } as NSMMessage<"message">));
                    continue;
                }
                for (let line of sock.listeners.values()) {
                    if (`.${repairedChannel}`.startsWith(line)) { // TODO: Using startsWith like this will cause problems in future
                        sock.socket.send(JSON.stringify({ type: "message", message: message.message, channel: repairedChannel } as NSMMessage<"message">));
                        break;
                    }
                }
            }
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

export const start = (host = "0.0.0.0", maybe: (() => void) | null = null) => {
    if (maybe) maybe();

    const server = new WebSocketServer({
        port: 14554,
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
                const [ clientMajor, clientMinor ] = version.split(".");
                const [ serverMajor, serverMinor ] = __NSM__VERSION__.split(".");

                if (clientMajor !== serverMajor) {
                    socket.send(`NSM_EVENTS_VERSION_REQUIRED=${serverMajor}.${serverMinor}`);
                    return socket.close();
                }
                const pc = parseInt(clientMinor);
                const ps = parseInt(serverMinor);
                if (pc < ps) {
                    socket.send(`NSM_EVENTS_VERSION_REQUIRED=${serverMajor}.${serverMinor}`);
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
        });
        socket.send("NSM_EVENTS_PROTOCOL");
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
import type { ExposedAPI, Message, ClientEvents, Unwrap, Handler, Message as NSMMessage } from "./types.js";
export type { Message };

export type EventBrowserOptions = {
    hub: string
}

export const connect: ExposedAPI<EventBrowserOptions>["connect"] = ({ hub }) => {
    let active = true;
    let backoff = 1;
    const events = new Set<{ type: keyof ClientEvents, listen: Function }>();
    const fire = <T extends keyof ClientEvents>(type: T, ...params: ClientEvents[T]) => {
        events.forEach(h => {
            if (h.type === type) h.listen(...params);
        });
    }

    const handlers = new Set<Handler>();

    let connecting = false;
    let ws: WebSocket | undefined;

    let is_nsm = false;
    let is_ready = false;

    const register = (handler: Handler): Unwrap<true, "INVALID_SESSION" | "REGISTERED"> => {
        if (!ws || !is_nsm || !is_ready) return [ null, "INVALID_SESSION" ];
        if ([...handlers.values()].some(it => it.channel === handler.channel && it.exact === handler.exact)) return [ null, "REGISTERED" ];
        ws.send(JSON.stringify({ type: "subscribe", message: { channel: handler.channel, exact: handler.exact }, at: Date.now() } as Message));
        return [ true, null ];
    };

    const deregister = (handler: Handler): Unwrap<true, "INVALID_SESSION" | "REGISTERED"> => {
        if (!ws || !is_nsm || !is_ready) return [ null, "INVALID_SESSION" ];
        if ([...handlers.values()].some(it => it.channel === handler.channel && it.exact === handler.exact)) return [ null, "REGISTERED" ];
        ws.send(JSON.stringify({ type: "unsubscribe", message: { channel: handler.channel, exact: handler.exact }, at: Date.now() } as Message));
        return [ true, null ];
    }

    const unsubscribe = (handler: Handler) => {
        console.log(handlers);
        handlers.delete(handler);
        console.log(handlers);
        if (is_ready && is_nsm) {
            const [ success, error ] = deregister(handler);
            if (!success && error !== "REGISTERED") {
                fire("error", "UNSUBSCRIBE_FAILED");
                return false;
            }
        }
        return true;
    }

    const doSubscribe = (handler: Handler) => {
        if (is_ready && is_nsm) {
            const [ success, error ] = register(handler);
            if (!success && error !== "REGISTERED") {
                fire("error", "SUBSCRIBE_FAILED");
                return false;
            }
        }
        handlers.add(handler);
        return true;
    }

    let waiting: string[] = [];

    const startup = () => {
        console.log(!ws, !is_ready, !is_nsm, [ ...handlers.values() ], waiting);
        if (!ws || !is_ready || !is_nsm) return;
        for (let subs of handlers.values()) {
            const [ res, err ] = register(subs);
            console.log(!ws, !is_ready, !is_nsm, subs, res, err );
        }
        for (let girlfail of waiting) {
            ws.send(girlfail);
        }
        waiting = [];
    }

    const handle = (message: MessageEvent) => {
        if (!ws) return;
        const data = message.data as string;
        if (!is_nsm) {
            if (data === "NSM_EVENTS_PROTOCOL") {
                is_nsm = true;
                ws.send(`NSM_EVENTS_PROTOCOL_ACCEPTED`);
                return;
            }
            active = false;
            ws.close();
            fire("error", "NSM_NOT_DETECTED");
            return;
        }
        if (!is_ready) {
            if (data === "NSM_EVENTS_VERSION") {
                ws.send(`NSM_EVENTS_VERSION=${__NSM__VERSION__}`);
                return;
            }
            if (data === "NSM_EVENTS_READY") {
                is_ready = true;
                startup();
                return;
            }
            active = false;
            ws.close();
            fire("error", "NSM_NEGOTIATE_ERROR");
            return;
        }
        // NSM Message
        const friend = JSON.parse(message.data) as Message;

        switch (friend.type) {
            case "subscribe":
            case "unsubscribe":
            case "broadcast": {
                ws.send(JSON.stringify({ type: "system", code: "TEAPOT", message: `Operation ${message.type} should always be sent by client` } as NSMMessage));
                break;
            }
            case "subscribed": {
                // do something in future probably
                break;
            }
            case "unsubscribed": {
                // do something in future probably
                break;
            }
            case "message": {
                const ch = friend.channel;
                const mes = friend.message;
                for (let handler of handlers.values()) {
                    if (handler.exact && ch === handler.channel) {
                        handler.listener(ch, mes);
                    } else if (!handler.exact && ch.startsWith(handler.channel)) { // TODO: Using startsWith like this will cause problems in future
                        handler.listener(ch, mes);
                    }
                }
                console.log(friend.channel, friend.message);
            }
            case "system": {
                break;
            }
            default: {
                ws.send(JSON.stringify({ type: "system", code: "UNSUPPORTED", message: `Operation ${message.type} is not supported by this version of NSM` } as NSMMessage));
                break;
            }
        }
    }

    const setup = () => {
        if (ws) return;
        connecting = true;
        try {
            ws = new WebSocket(hub);
            ws.addEventListener("error", () => {
                fire("error", "WEBSOCKET_ERROR");
                if (active) {
                    // reconnect ASAP!
                    ws = undefined;
                    is_nsm = false;
                    is_ready = false;
                    setTimeout(setup, backoff * 1000);
                    fire("disconnect", true);
                } else {
                    fire("disconnect", false);
                }
            });
            ws.addEventListener("close", () => {
                if (active) {
                    // reconnect ASAP!
                    ws = undefined;
                    is_nsm = false;
                    is_ready = false;
                    setTimeout(setup, backoff * 1000);
                    fire("disconnect", true);
                } else {
                    fire("disconnect", false);
                }
            });
            ws.addEventListener("open", () => {
                fire("connect");
                connecting = false;
            });
            ws.addEventListener("message", handle);
            backoff = 1;
        } catch (e) {
            ws = undefined;
            backoff *= 2;
            if (backoff > 30) backoff = 30;
            setTimeout(setup, backoff * 1000);
        }
    }

    setup();

    return [ {
        on: (type, callback) => {
            if (!active) return [ null, "CLOSED" ];
            const event = { type, listen: callback };
            events.add(event);
            return [ () => events.delete(event), null ];
        },
        disconnect: () => {
            if (!active) return [ null, "CLOSED" ];
            if (!ws) return [ null, "CLOSED" ];
            active = false;
            ws.close();
            fire("close");
            return [ true, null ];
        },
        subscribe: (listener, channel, exact) => {
            if (!active) return [ null, "CLOSED" ];
            const repaired = (channel[0] !== "/" ? "/" : "") + channel;
            const handler = { channel: repaired, exact, listener };
            const success = doSubscribe(handler);
            if (!success) return [ null, "SUBSCRIBE_FAILED" ];
            return [ () => unsubscribe(handler), null ];
        },
        send: (channel, message) => {
            if (!active) return [ null, "CLOSED" ];
            const str = JSON.stringify({ type: "broadcast", channel, message, at: Date.now() } as Message);
            if (!ws || !is_nsm || !is_ready) {
                waiting.push(str);
            } else {
                ws.send(str)
            }
            return [ true, null ];
        }
    }, null ];
};
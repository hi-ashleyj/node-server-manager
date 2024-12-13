import type {ExposedAPI, Message, ClientEvents, ClientAPI} from "./types.js";
export type { Message };



export const connect: ExposedAPI["connect"] = (server) => {
    let active = true;
    let backoff = 1;
    const events = new Set<{ type: keyof ClientEvents, listen: Function }>();
    const fire = <T extends keyof ClientEvents>(type: T, ...params: ClientEvents[T]) => {
        events.forEach(h => {
            if (h.type === type) h.listen(...params);
        });
    }

    let connecting = false;
    let ws: WebSocket | undefined

    let is_nsm = false;
    let is_ready = false;
    const handle = (message: MessageEvent) => {
        if (!ws) return;
        const data = message.data as string;
        if (!is_nsm) {
            if (data === "NSM_EVENTS_READY") {
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
                return;
            }
            active = false;
            ws.close();
            fire("error", "NSM_NEGOTIATE_ERROR");
            return;
        }
    }


    const setup = () => {
        if (ws) return;
        connecting = true;
        try {
            ws = new WebSocket(server);
            ws.addEventListener("error", () => {});
            ws.addEventListener("close", () => {});
            ws.addEventListener("open", () => {});
            ws.addEventListener("message", () => {});
        } catch (e) {
            ws = undefined;
            backoff *= 2;
            if (backoff > 30) backoff = 30;
        }
    }

    return [ {
        on: (type, callback) => {
            if (!active) return [ null, "CLOSED" ];
            const event = { type, listen: callback };
            events.add(event);
            return [ () => events.delete(event), null ];
        },
        disconnect: () => {
            if (!active) return [ null, "CLOSED" ];
            return [ null, "NIMPE" ];
        },
        subscribe: (listener, channel, exact) => {
            if (!active) return [ null, "CLOSED" ];
            return [ null, "NIMPE" ];
        },
        send: (channel, message) => {
            if (!active) return [ null, "CLOSED" ];
            return [ null, "NIMPE" ];
        }
    }, null ];
};
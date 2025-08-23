import type { Cookies, Handle } from "@sveltejs/kit";
import { createHash } from "node:crypto";
import type { AuthorizeReturn as User } from "./permissions";

type Session = {
    id: string;
    userId: string;
    expiresAt: number;
}

const ONE_HOUR_IN_MS = 1000 * 60 * 60;

export const sessionCookieName = 'auth-session';
const sessions = new Map<string, Session>();
const cachedUsers = new Map<string, User>();

export const auth = async (): Promise<Handle> => {
    const generateSessionToken = () => {
        const bytes = crypto.getRandomValues(new Uint8Array(18));
        return Buffer.from(bytes).toString("base64url");
    }

    const createSession = async (token: string, user: User) => {
        const sessionId = createHash("sha256").update(token).digest("hex").toLowerCase();
        const session: Session = {
            id: sessionId,
            userId: user.id,
            expiresAt: Date.now() + ONE_HOUR_IN_MS * 3
        };
        sessions.set(sessionId, session);
        cachedUsers.set(user.id, user);
        return session;
    }

    const validateSessionToken = async (token: string) => {
        const sessionId = createHash("sha256").update(token).digest("hex").toLowerCase();
        const session = sessions.get(sessionId);
        if (!session) return { session: null, user: null };

        const user = cachedUsers.get(session.userId);
        if (!user) return { session: null, user: null };

        const sessionExpired = Date.now() >= session.expiresAt;
        if (sessionExpired) {
            sessions.delete(sessionId);
            return { session: null, user: null };
        }

        if (Date.now() >= session.expiresAt - ONE_HOUR_IN_MS) {
            session.expiresAt = Date.now() + ONE_HOUR_IN_MS * 3;
            sessions.set(sessionId, session);
        }

        return { session, user };
    }

    const invalidateSession = async (sessionId: string) => {
        sessions.delete(sessionId);
    }

    const setSessionTokenCookie = (event: Cookies, token: string, expiresAt: number) => {
        event.set(sessionCookieName, token, {
            expires: new Date(expiresAt),
            path: '/',
            httpOnly: true,
            secure: false,
        });
    }

    const deleteSessionTokenCookie = (event: Cookies) => {
        event.delete(sessionCookieName, {
            path: '/',
            httpOnly: true,
            secure: false,
        });
    }

    return async ({ event, resolve }) => {
        event.locals.auth = {
            createSession,
            deleteSessionTokenCookie,
            generateSessionToken,
            invalidateSession,
            setSessionTokenCookie,
            validateSessionToken,
        };
        const sessionToken = event.cookies.get(sessionCookieName);
        if (!sessionToken) {2
            event.locals.user = null;
            event.locals.session = null;
            return resolve(event);
        }

        const { session, user } = await validateSessionToken(sessionToken);
        if (session) {
            setSessionTokenCookie(event.cookies, sessionToken, session.expiresAt);
        } else {
            deleteSessionTokenCookie(event.cookies);
        }

        event.locals.user = user;
        event.locals.session = session;

        return resolve(event);
    };
}

declare global {
    namespace App {
        interface Locals {
            user: User | null,
            session: Session | null,
            auth: {
                generateSessionToken: () => string;
                createSession: (token: string, user: User) => Promise<Session>;
                validateSessionToken: (token: string) => Promise<{ session: Session, user: User } | { session: null, user: null }>;
                invalidateSession: (sessionId: string) => Promise<void>;
                setSessionTokenCookie: (event: Cookies, token: string, expiresAt: number) => void;
                deleteSessionTokenCookie: (event: Cookies) => void;
            }
        }
    }
}
import { throttle } from "throttle-debounce";
import { randomBytes, createHash } from "node:crypto";

export type AccessLevels = "admin" | "configure" | "manage";

const users = new Map<string, { access: AccessLevels, salt: string, hash: string }>();
const tokens = new Map<string, { expiry: number, user: string }>();

const _save = () => {
    // TODO: Save Users
}

export const save = throttle(1000, _save);

export const verify = (token: string): null | { user: string, access: AccessLevels } => {
    const info = tokens.get(token);
    if (!info) return null;

    const now = Date.now();
    const user = users.get(info.user);

    if (!user || info.expiry < now) {
        tokens.delete(token);
        return null;
    }

    tokens.set(token, {
        user: info.user,
        expiry: now + (60 * 60 * 1000)
    })

    return { user: info.user, access: user.access };
}

export const revokeToken = (token: string) => {
    tokens.delete(token);
}

export const revokeForUser = (user: string) => {
    for (let [token, info] of tokens) {
        if (info.user === user) tokens.delete(token);
    }
}

export const revokeExpired = () => {
    const now = Date.now();
    for (let [token, info] of tokens) {
        if (info.expiry < now) tokens.delete(token);
    }
}

export const purge = () => {
    tokens.clear();
}

export const issueToken = (user: string): string | null => {
    if (!users.has(user)) return null;

    const token = randomBytes(48).toString("hex");

    tokens.set(token, { expiry: Date.now() + (60 * 60 * 1000), user });

    return token;
}

export type LoginResult = { type: "error", error: string } | { type: "token", token: string }

export const login = (user: string, password: string): LoginResult => {
    const info = users.get(user);
    if (!info) return { type: "error", error: "Couldn't Find That User" };
    const hash = createHash("sha512").update(password).digest().toString("hex");
    const salted = createHash("sha512").update(hash + info.salt).digest().toString("hex");
    if (info.hash !== salted) return { type: "error", error: "Incorrect Password" };
    revokeExpired();
    const token = issueToken(user);
    if (token === null) return { type: "error", error: "Failed to Issue Tokens" };

    return { type: "token", token };
}

export const logout = (token: string) => {
    revokeExpired();
    revokeToken(token);
    return true as const;
}

export const create = (user: string, password: string, access: AccessLevels): string | null => {
    if (users.has(user)) return "Username Already Exists.";
    if ((new RegExp("([^a-z0-9-])+")).test(user)) return "Invalid Username: must only contain lowercase letters, numbers, or -";
    if (!("abcdefghijklmnopqrstuvwxyz".split("").includes(user[0]))) return "Invalid Username: must start with a lowercase letter";
    const salt = createHash("sha512").update(randomBytes(48).toString("hex")).digest().toString("hex");
    const hash = createHash("sha512").update(password).digest().toString("hex");
    const salted = createHash("sha512").update(hash + salt).digest().toString("hex");

    users.set(user, {
        access,
        salt,
        hash: salted,
    })

    save();
    return null;
}

export const changePassword = (user: string, old: string, replace: string, repeat: string): string | null => {
    const info = users.get(user);
    if (!info) return "User Does Not Exist.";
    if (replace !== repeat) return "Passwords Do Not Match.";
    const oldHash = createHash("sha512").update(old).digest().toString("hex");
    const oldSalted = createHash("sha512").update(oldHash + info.salt).digest().toString("hex");
    if (info.hash !== oldSalted) return "Old Password is Incorrect";


    const salt = createHash("sha512").update(randomBytes(48).toString("hex")).digest().toString("hex");
    const hash = createHash("sha512").update(replace).digest().toString("hex");
    const salted = createHash("sha512").update(hash + salt).digest().toString("hex");

    users.set(user, {
        access: info.access,
        salt,
        hash: salted,
    })

    revokeForUser(user);

    save();
    return null;
}

export const resetPassword = (user: string, password: string): string | null => {
    const info = users.get(user);
    if (!info) return "User Does Not Exist.";

    const salt = createHash("sha512").update(randomBytes(48).toString("hex")).digest().toString("hex");
    const hash = createHash("sha512").update(password).digest().toString("hex");
    const salted = createHash("sha512").update(hash + salt).digest().toString("hex");

    users.set(user, {
        access: info.access,
        salt,
        hash: salted,
    })

    revokeForUser(user);

    save();
    return null;
};

export const setAccess = (user: string, access: AccessLevels): string | null => {
    const info = users.get(user);
    if (!info) return "User Does Not Exist.";

    if (info.access === "admin" && access !== "admin") {
        let count = 0;
        for (let [name, info] of users) {
            if (info.access === "admin") count++;
        }
        if (count <= 1) return "Cannot Set Access: At Least One Admin User must be Active";
    }

    users.set(user, {
        access: access,
        salt: info.salt,
        hash: info.hash,
    })

    save();
    return null;
}

export const remove = (user: string): string | null => {
    const info = users.get(user);
    if (!info) return "User Does Not Exist.";

    if (info.access === "admin") {
        let count = 0;
        for (let [name, info] of users) {
            if (info.access === "admin") count++;
        }
        if (count <= 1) return "Cannot Remove User: At Least One Admin User must be Active";
    }

    users.delete(user)

    save();
    return null;
}

export const get = (user: string) => {
    if (users.has(user)) return { user, access: users.get(user)!.access };
    return null;
}

export const list = () => {
    let answer: {user: string, access: AccessLevels}[] = [];

    for (let [ user, info ] of users) {
        answer.push({ user, access: info.access });
    }

    return answer;
}

export const load = async () => {
    // TODO: Load Users
}
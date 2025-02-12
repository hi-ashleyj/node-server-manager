import {createHash, randomBytes} from "node:crypto";
import {ulid} from "ulidx";
import encodeHash64 from "crypto-js/enc-base64";
import sha512 from "crypto-js/sha512";
import {JSONFilePreset} from "lowdb/node";
import {join} from "node:path";
import {homedir} from "node:os";
import {mkdir} from "node:fs/promises";
import { Roles } from "$lib/roles.js";

await mkdir(join(homedir(), "nsm"), { recursive: true });

export type User = {
    id: string,
    username: string,
    hash: string,
    salt: string,
    roles: number,
    server_roles: Record<string, number>,
};

export type UserDatabase = {
    users: User[]
};

const createSalt = () => {
    return randomBytes(512 / 8).toString("hex");
}

const hash = (pw: string, salt: string) => {
    return createHash("sha512").update(salt + pw).digest().toString("base64");
}

const defaultSalt = createSalt();
const defaultData: UserDatabase = { users: [ { id: ulid(), username: "admin", salt: defaultSalt, hash: hash(encodeHash64.stringify(sha512("admin")), defaultSalt), roles: 4095, server_roles: {} } ] };
const db = await JSONFilePreset<UserDatabase>(join(homedir(), "nsm", "users.json"), defaultData);
await db.read();
await db.write();


export const createUser = (name: string, pass_hash: string): string => {
    const id = ulid();
    const salt = createSalt();

    db.update(({ users }) => {
        users.push({
            id,
            username: name,
            hash: hash(pass_hash, salt),
            salt,
            roles: 0,
            server_roles: {},
        })
    });

    return id;
}

export const authorise = (name: string, pass_hash: string): { id: string, name: string } | null => {
    const user = db.data.users.find(it => it.username === name);
    if (!user) return null;
    const compare = hash(pass_hash, user.salt);
    if (compare !== user.hash) return null;
    return { id: user.id, name: user.username };
}

export type Perms = {
    hasPermission: (server: string, permission: keyof typeof Roles) => boolean;
    grantPermission: (server: string | null, permission: keyof typeof Roles) => boolean;
    userInfo: () => User | null;
    listAllPerms: () => User[] | null;
    createUser: (name: string, hash: string) => string;
    id: () => string | null;
    updatePassword: (id: string, hash: string) => boolean;
}

const badPerms: Perms = {
    hasPermission: () => false,
    grantPermission: () => false,
    userInfo: () => null,
    listAllPerms: () => null,
    createUser: () => "",
    id: () => null,
    updatePassword: () => false,
}

export const perms = (id: string | undefined | null): Perms => {
    if (typeof id !== "string") return badPerms;
    const user = db.data.users.find(it => it.id === id);
    if (!user) return badPerms;
    return {
        hasPermission: (server, permission) => {
            if ((user.roles & Roles[permission]) > 0) return true;
            if (!user.server_roles[server]) return false;
            if ((user.server_roles[server] & Roles[permission]) > 0) return true;
            return false;
        },
        grantPermission: (server, permission) => {
            return false;
        },
        userInfo: () => {
            return user;
        },
        listAllPerms: () => {
            return db.data.users;
        },
        createUser: (name, hash) => {
            return createUser(name, hash);
        },
        id: () => {
            return id;
        },
        updatePassword: (id, pass_hash) => {
            db.update(({ users }) => {
                const idx = users.findIndex((user) => user.id === id);
                const item = users[idx];
                item.hash = hash(pass_hash, item.salt);
                users[idx] = item;
            });
            return true;
        }
    }
}
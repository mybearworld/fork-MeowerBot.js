import mAPI, { APIResp, ErrorApiResp } from ".";
import Client from "..";

export interface User {
    _id: string,
    avatar: string,
    avatar_color: string,
    banned: false,
    created: number,
    error: false,
    experiments: number,
    flags: number,
    last_seen: number,
    lower_username: string,
    lvl: number,
    permissions: number,
    pfp_data: number,
    quote: string,
    uuid: string
}

function _checkIfUser(obj: any): obj is User {
    if (obj === null || typeof obj !== "object") return false;
    if (typeof obj._id !== "string") return false;
    if (typeof obj.avatar !== "string") return false;
    if (typeof obj.avatar_color !== "string") return false;
    if (typeof obj.banned !== "boolean") return false;
    if (typeof obj.created !== "number") return false;
    if (typeof obj.experiments !== "number") return false;
    if (typeof obj.flags !== "number") return false;
    if (typeof obj.last_seen !== "number") return false;
    if (typeof obj.lower_username !== "string") return false;
    if (typeof obj.lvl !== "number") return false;
    if (typeof obj.permissions !== "number") return false;
    if (typeof obj.pfp_data !== "number") return false;
    if (typeof obj.quote !== "string") return false;
    if (typeof obj.uuid !== "string") return false;

    return true;
}


type UserResp = {
    body: User & APIResp | ErrorApiResp;
    status: number;
};

export default class MUsers {
    cache: Map<string, {user: User, time: number}> = new Map()
    root: mAPI
    client: Client

    constructor(root: mAPI) {
        this.root = root;
        this.client = root.client;
    }

    async get(username: string): Promise<UserResp> {
        if (this.cache.has(username)) {
            const user = this.cache.get(username)!;
            if (Date.now() - user.time > 1000 * 60 * 5) this.cache.delete(username);
            else return { body: user.user, status: 200 }
        }

        const resp = await fetch(`${this.root.apiUrl}/users/${username}`)
        const body = await resp.json();

        if (!body.error && !_checkIfUser(body)) {
            return {
                body: { error: true },
                status: 500
            }
        }

        if (!body.error)
            this.cache.set(username, { user: body, time: Date.now() });

        return {
            body: body,
            status: resp.status
        }
    }
}

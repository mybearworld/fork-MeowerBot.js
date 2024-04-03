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


export default class MUsers {
    cache: Map<string, {user: User, time: number}> = new Map()
    root: mAPI
    client: Client

    constructor(root: mAPI) {
        this.root = root;
        this.client = root.client;
    }

    async get(username: string): Promise<{
        body: User & APIResp | ErrorApiResp,
        status: number
    }> {
        if (this.cache.has(username)) {
            const user = this.cache.get(username)!;
            if (Date.now() - user.time > 1000 * 60 * 5) this.cache.delete(username);
            else return { body: user.user, status: 200 }
        }

        const resp = await fetch(`${this.root.apiUrl}/users/${username}`)
        const body = await resp.json();

        if (!body.error)
            this.cache.set(username, { user: body, time: Date.now() });

        return {
            body: body,
            status: resp.status
        }
    }
}

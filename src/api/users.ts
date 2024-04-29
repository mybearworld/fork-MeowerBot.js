import mAPI, { APIResp, ErrorApiResp, PagedAPIResp } from ".";
import Client from "..";
import { Post, PostResp } from "./posts";

export interface User {
    _id: string,
    avatar: string | null,
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
    cache: Map<string, { user: User, time: number }> = new Map()
    postscache: Map<string, { posts: Array<Post>, time: number }> = new Map() // wtf is a map? Its basically a dictionary in python
    root: mAPI
    client: Client
    searchCache: Array<{ time: number, posts: Array<Post> }> = [];

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

    async get_posts(username: string): Promise<PostResp> {
        if (this.postscache.has(username)) {
            const user = this.postscache.get(username)!;
            if (Date.now() - user.time > 1000 * 30 * 5) this.postscache.delete(username);
            else return {
                body: {
                    error: false,
                    "page#": 1,
                    page: 1,
                    autoget: Array.from(user.posts.values())
                }, status: 200
            }
        }

        const resp = await fetch(`${this.root.apiUrl}/users/${username}/posts`)
        const body: PagedAPIResp<Post> = await resp.json();

        if (!body.error && !_checkIfUser(body)) {
            return {
                body: { error: true },
                status: 500
            }
        }

        if (!body.error)
            this.postscache.set(username, { posts: body.autoget, time: Date.now() });

        return {
            body: body,
            status: resp.status
        }
    }

    async report(username: string, reason: string, comment: string) {
        await this.client.send({ // ugh
            cmd: "report",
            val: {
                id: username,
                type: 1,
                reason: reason,
                comment: comment
            }
        })
    }

    async change_relationship(username: string, type: "none" | "blocked" | 0 | 2) {
        const resp = await fetch(`${this.root.apiUrl}/users/${username}/relationship`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'token': this.client.user.token
            },
            body: JSON.stringify({ type })
        })

        return {
            body: await resp.json(),
            status: resp.status
        }
    }

    async search(query: string, page: number = 1) {
        if (this.searchCache.length >= page && this.searchCache[page - 1]!.time > Date.now() - 1000 * 60 * 30) {
            return {
                body: {
                    error: false,
                    "page#": page,
                    page: page,
                    autoget: this.searchCache[page - 1]!.posts
                },
                status: 200
            }
        }

        const response = await fetch(`${this.root.apiUrl}/search/users/?autoget&q=${query}&page=${page}`, {
            method: 'GET',
            headers: {
                token: this.client.user.token
            },
        });

        const data = await response.json()
        if (!data.error) {
            this.searchCache[page - 1] = {time: Date.now(), posts: data.autoget}
        }
        
        return {
            status: response.status,
            body: data
        }
    }    
}

import mAPI, { APIResp, ErrorApiResp, PagedAPIResp } from ".";
import { Client } from "../"
import * as log from 'loglevel';

export interface Post {
    bridged?: Post;
    _id: string
    isDeleted: boolean,
    p: string
    post_id: string,
    post_origin: string,
    t: {
        d: string
        e: number, // epoch time (*seconds* (not milliseconds!) since January 1 1970)
        h: string,
        mi: string,
        mo: string,
        s: string, // second
        y: string // year
    },
    type: 1 | 2, // 2 for inbox messages, 1 for everything else
    u: string
}

function _isPost(obj: any): obj is Post {
    if (obj === null || typeof obj !== "object") return false;
    if (typeof obj._id !== "string")             return false;
    if (typeof obj.isDeleted !== "boolean")      return false;
    if (typeof obj.p !== "string")               return false;
    if (typeof obj.post_id !== "string")         return false;
    if (typeof obj.post_origin !== "string")     return false;
    if (typeof obj.t !== "object")               return false;
    if (obj.type !== 1 && obj.type !== 2)        return false;
    if (typeof obj.u !== "string")               return false;

    return true;
}

type GenericResp = {
    body: ErrorApiResp | APIResp;
    status: number;
};

type PostResp = {
    body: ErrorApiResp | (APIResp & Post);
    status: number;
};

export default class MPosts {
    root: mAPI;
    client: Client;

    constructor(root: mAPI) {
        this.root = root;
        this.client = this.root.client;
    }


    async get(chatId: string, page: number = 1): Promise<{
        status: number,
        body: ErrorApiResp | PagedAPIResp<Post>
    }> {

        let url;

        if (chatId !== "home") {
            url = `posts/${chatId}`
        } else {
            url = "home"
        }

        url += `?autoget=1&page=${page || 1}`
        log.debug(`[Meower] Fetching posts from ${url}`)
        const request = await fetch(`${this.root.apiUrl}${url}`, {
            method: "GET",
            headers: {
                token: this.client.user?.token
            }
        })

        return {
            status: request.status,
            body: await request.json()
        }
    }

    async send(chatId: string, content: string): Promise<PostResp> {
        let url;
        if (chatId === "home" || !chatId) {
            url = "/home/";
        } else {
            url = "/posts/" + chatId;
        }

        const headers = {
            'Content-Type': 'application/json',
            'token': this.client.user.token
        };

        const response = await fetch(`${this.root.apiUrl}${url}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                'content': content
            })
        });

        if (!response.ok) {
            log.error(`[Meower] Failed to send post: ${response.status}`)
        }
        const data: APIResp | ErrorApiResp  = await response.json()
        if (!_isPost(data)) {
            return {
                body: {error: true},
                status: 500
            }
        }
        data.error = false;
        return {
            body: data,
            status: response.status,
        }

    }

    async delete(postId: string): Promise<GenericResp> {
        const resp = await fetch(`${this.root.apiUrl}/posts/?id=${postId}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'token': this.client.user.token
            }
        })

        return {
            body: await resp.json(),
            status: resp.status
        }
    }

    async pin(postId: string): Promise<PostResp> {
        const resp = (await fetch(`${this.root.apiUrl}/posts/${postId}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'token': this.client.user.token
            }

        }))
        const data: ErrorApiResp | APIResp = await resp.json()
        if (!_isPost(data)) {
            return {
                body: {error: true},
                status: 500
            }
        }

        return {
            body: data,
            status: resp.status
        }
    }

    async unpin(postId: string): Promise<PostResp> {
        const resq = (await fetch(`${this.root.apiUrl}/posts/${postId}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'token': this.client.user.token
            }
        }))
        const data: ErrorApiResp | APIResp = await resq.json()

        if (!_isPost(data)) {
            return {
                body: {error: true},
                status: 500
            }
        }

        return {
            body: data,
            status: resq.status
        }
    }
}
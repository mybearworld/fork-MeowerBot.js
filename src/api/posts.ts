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

    async send(chatId: string, content: string): Promise<{
        body: Post | ErrorApiResp,
        status: number
    }> {
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

        return {
            body: await response.json(),
            status: response.status,
        }

    }

    async delete(postId: string): Promise<{
        body: ErrorApiResp | APIResp,
        status: number
    }> {
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

    async pin(postId: string): Promise<{
        body: ErrorApiResp | (APIResp & Post)
        status: number
    }> {
        const resp = (await fetch(`${this.root.apiUrl}/posts/${postId}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'token': this.client.user.token
            }

        }))

        return {
            body: await resp.json(),
            status: resp.status
        }
    }

    async unpin(postId: string): Promise<{
        body: ErrorApiResp | (APIResp & Post)
        status: number
    }> {
        const resq = (await fetch(`${this.root.apiUrl}/posts/${postId}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'token': this.client.user.token
            }
        }))

        return {
            body: await resq.json(),
            status: resq.status
        }
    }
}

import mAPI, { ErrorApiResp, PagedAPIResp } from ".";
import { Client } from "../"

export interface Chat {
    _id: string,
    allow_pinning: boolean,
    created: number,
    deleted: boolean,
    icon: string,
    icon_color: string,
    last_active: number,
    members: Array<string>,
    nickname: string,
    owner: string,
    type: number
}



export default class MChats {
    root: mAPI;
    client: Client;

    constructor(root: mAPI) {
        this.root = root;
        this.client = this.root.client;
    }

    async get(): Promise<{
        body: PagedAPIResp<Chat> | ErrorApiResp,
        status: number
    }> {
        const resp = await fetch(`${this.root.apiUrl}/chats?autoget=1`, {
            headers: { token: this.client.user.token }
        })

        return {
            body: await resp.json(),
            status: resp.status
        }
    }
}
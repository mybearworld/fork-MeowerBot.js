
import mAPI, { ErrorApiResp, PagedAPIResp } from ".";
import { Client } from "../"

export interface Chat {

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
        const resp = await fetch(`${this.root.apiUrl}/chats/`, {
            headers: {token: this.client.user.token}
        })

        return {
            body: await resp.json(),
            status: resp.status
        }
    }
}
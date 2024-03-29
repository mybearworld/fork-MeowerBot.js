import Client from "../";
import MPosts from "./posts";

export interface Config {
    apiUrl: string,
    client: Client
}


export interface APIResp {
    error: false
}

export interface PagedAPIResp<T> extends APIResp {
    "page#": number,
    page: number,
    pages: Array<T>
}

export interface ErrorApiResp {
    error: true
}


export default class mAPI {
    apiUrl!: string;
    client: Client;
    posts: MPosts;

    constructor(config: Config) {
        this.setUrl(config.apiUrl);
        this.client = config.client;
        this.posts = new MPosts(this);
    }

    setUrl(url: string) {
        this.apiUrl = url.endsWith('/') ? url : url + "/";
    }

    async getStatus(): Promise<{
        scratchDeprecated: boolean; 
        registrationEnabled: boolean;
        isRepairMode: boolean;
        ipBlocked: boolean;
        ipRegistrationBlocked: boolean;
   }> {

        return await (await fetch(`${this.apiUrl}/status`)).json()
    }

    async getStatistics(): Promise<APIResp & {
        users: number,
        posts: number,
        chats: number
    } | ErrorApiResp> {
        return await (await fetch(`${this.apiUrl}/statistics`)).json()
    }
}

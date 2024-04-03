import Client from "../";
import MChats from "./chats";
import MPosts from "./posts";
import MUsers from "./users";

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
    autoget: Array<T>
}

export interface ErrorApiResp {
    error: true
}


export default class mAPI {
    apiUrl!: string;
    client: Client;
    posts: MPosts;
    chats: MChats;
    users: MUsers;

    constructor(config: Config) {
        this.setUrl(config.apiUrl);
        this.client = config.client;
        this.posts = new MPosts(this);
        this.chats = new MChats(this);
        this.users = new MUsers(this);
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

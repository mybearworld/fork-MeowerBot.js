import Client from "../";

export interface Config {
    apiUrl: String,
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

export interface Post { 
    
}

export default class mAPI {
    apiUrl!: String;
    client: Client;

    constructor(config: Config) {
        this.setUrl(config.apiUrl);
        this.client = config.client;
    }

    setUrl(url: String) {
        this.apiUrl = url.endsWith('/') ? url : url + "/";
    }

    async getPosts(chatId: String, page: number = 1): Promise<{
        status: number,
        body: ErrorApiResp | PagedAPIResp<Post>
    }> {

        let url;

        if (chatId !== "home") {
            url = `posts/${chatId}`
        } else {
            url = "home"
        }

        url += `?page=${page}`

        const request = await fetch(`${this.apiUrl}`, {
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

    async sendPost(chatId: string, content: string): Promise<{
        body: Post | ErrorApiResp,
        status: number
    }> {
        let url;
        if (chatId === "home" || !chatId) {
            url = "/home/";
        } else {
            url = "/posts/" + chatId;
        }

        let headers = {
            'Content-Type': 'application/json',
            'token': this.client.user.token
        };

        let response = await fetch(`${this.apiUrl}${url}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                'content': content
            })
        });

        if (!response.ok) {
            console.error(`[Meower] Failed to send post: ${response.status}`)
        }

        return {
            body: await response.json(),
            status: response.status,

        }
        
        
    }
}
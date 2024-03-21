import WebSocket from "ws";
import EventEmitter from "node:events";

process.on('unhandledrejection', (event) => {
    throw new Error(event.reason)
})
  // …Log the error to the server…
export interface Packet extends Object {
    cmd: string;
    val: any | Object;
    listener?: string;
}

export interface Context extends Object {
    _bot: Bot
    user: string;
    args: string[];
    origin: string;
    reply: (content: string) => Promise<void>;
    post: (content: string) => Promise<void>;
}

interface User extends Object {
    "account": {
        "_id": string,
        "active_dms": Array<any>
        "avatar": string,
        "avatar_color": string,
        "ban": {
            "expires": Number,
            "reason": string,
            "restrictions": Number,
            "state": "temp_restriction"
        },
        "banned": false,
        "bgm": false,
        "bgm_song": Number,
        "created": Number,
        "debug": false,
        "experiments": Number,
        "favorited_chats": Array<any>,
        "flags": Number,
        "hide_blocked_users": false,
        "last_seen": Number,
        "layout": string,
        "lower_username": string,
        "lvl": Number,
        "mode": false,
        "permissions": Number,
        "pfp_data": Number,
        "quote": string,
        "sfx": false,
        "theme": string,
        "unread_inbox": false,
        "uuid": string,
    },
    "relationships": Array<Object>
    "token": string,
    "username": string,
}

export let bridges = ["Discord"]

export default class Bot extends EventEmitter {
    middleware!: ((ctx: Context) => boolean | Promise<boolean>);
    prefix!: string;
    api!: string;
    ws!: WebSocket;
    user!: User;

    constructor() {
        super();
    };

    /**
    * Connects to the (specified) server, then logs in
    */
    login(username: string, password: string, server = "wss://server.meower.org/", api = "https://api.meower.org", prefix = `@${username}`) {
        this.prefix = prefix;
        this.api = api;

        this.middleware = (ctx) => { return true; };
        this.ws = new WebSocket(server);

        this.ws.on("open", async () => {
            this.send({
                "cmd": "direct",
                "val": {
                    "cmd": "type",
                    "val": "js"
                }
            });

            this.send({
                "cmd": "direct",
                "val": "meower"
            });

            this.send({
                "cmd": "direct",
                "val": {
                    "cmd": "authpswd",
                    "val": {
                        "username": username,
                        "pswd": password
                    }
                },
                "listener": "mb.js-login"
            });

            setInterval(() => {
                if (this.ws.readyState == 1) {
                    this.send({
                        "cmd": "ping",
                        "val": ""
                    });
                }
            }, 10000);

            this.on('listener-mb.js-login', (packet: Packet) => {
                if (packet.val.mode === undefined && packet.val !== "I:100 | OK") {
                    console.error(`[MeowerBot] Failed to login: ${packet.val}`)
                    throw new Error(`Failed to login: ${packet.val}`)
                } else if (packet.val.mode === undefined) return;

                this.user = packet.val.payload;

                this.emit("login");
            });

            this.ws.on("close", () => {
                this.emit("close");
            });

            this.ws.on("packet", (data: string) => {
                this.emit("packet", data);
            });

            this.on('command-direct', (command: Packet) => {
                command = JSON.parse(JSON.stringify(command))
                if (!command.val.hasOwnProperty("type")) {
                    return;
                }

                command.val.bridged = false;
                if (bridges.includes(command.val.u)) {
                    const data: Array<string> = (command.val.p as string).split(":");
                    
                    if (command.val.u === 'Webhooks') {
                        data.splice(0, 1);
                    }

                    command.val.u = data[0];
                    command.val.p = data[1]?.trimStart().concat(data.slice(2, data.length).join(":"));
                    command.val.bridged = true;
                }


                this.emit("post",
                    command.val.u,
                    command.val.p,
                    command.val.post_origin
                );
            })

            this.ws.on("message", (data: string) => {
                let packetData: Packet = JSON.parse(data);
                if (packetData.listener !== "mb.js-login") {
                    console.debug(`> ${data}`)
                }
                try {
                    if (packetData.listener !== undefined) {
                        this.emit(`listener-${packetData.listener}`, packetData)
                    }

                    this.emit(`command-${packetData.cmd}`, packetData)
                } catch (e) {
                    console.error(e);
                    this.emit('.error', e);
                    
                }
            });
        });
    }

    /**
    * Post to home, or a group chat, if specified
    */
    async post(content: string, id: string | null = null)  {
        let url;

        if (id === "home" || !id) {
            url = "/home/";
        } else {
            url = "/posts/" + id;
        }

        let headers = {
            'Content-Type': 'application/json',
            'token': this.user.token
        };

        let response = await fetch(`${this.api}${url}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                'content': content
            })
        });

        if (!response.ok) {
            console.error(`[MeowerBot] Failed to send post: ${await response.text()} @ ${response.status}`)
            return null;
        }

        return await response.json();
    }

    /**
    * Executes the callback when a new post is sent

    */
    onPost(callback: (username: string, content: string, origin: string) => void | Promise<void>) {
        this.on("post", async (username: string, content: string, origin: string) => {
            await callback(username, content, origin);
        });
    }

    /**
    * Executes the callback when the connection is closed
    */
    onClose(callback: () => void | Promise<void>) {
        this.on("close", async () => {
            await callback();
        });
    }


    /**
    * Executes the callback when a new packet from the server is sent
    */
    onPacket(callback: (data: Packet) => void | Promise<void>) {
        this.on("packet", async (data: Packet) => {
            await callback(data);
        });
    }


    /**
    * Executes the callback when successfully logged in
    */
    onLogin(callback: () => void | Promise<void>) {
        this.on("login", async () => {
            await callback();
        });
    }

    /**
    * Executes the callback when a bot command is sent
    */
    onCommand(command: string, callback: (ctx: Context) => void | Promise<void>) {
        this.onPost( async (username: string, content: string, origin: string) => {
            if (username === this.user.username) {
                return;
            }
            const ctx: Context = {
                _bot: this,
                user: username,
                args: content.split(" ", 5000),
                origin: origin,
                reply: async function (content: string): Promise<void> {
                    return await this._bot.post(`@${this.user} ${content}`, this.origin)
                },
                post: async function (content: string): Promise<void> {
                    return await this._bot.post(content, this.origin)
                }
            }

            ctx.args.splice(0, 2)
          
                    
            if (!content.startsWith(`${this.prefix} ${command}`) && !content.startsWith(`${this.prefix} ${command}`)) 
                return;

            try {
                if (!await this.middleware(ctx)) return;
            
                await callback(ctx);
            } catch (e: any) {
                e.ctx = ctx;
                this.emit('.error', e);
                console.error(e);
            }
        });
    };
    
    /**
    * Sends a packet to the server
    */
    async send(packet: Packet) {
        if (packet.listener !== "mb.js-login") {
            console.debug(`< ${JSON.stringify(packet)}`)
        }
        this.ws.send(JSON.stringify(packet));
    }

    /**
    * Closes the connection to the currently connected server
    */
    close() {
        this.off("close", () => {
            this.ws.close();
        });
    }
    /**
    * The middleware to use for `onCommand`
    */
    onCommandMiddleware(callback: (ctx: Context) => boolean | Promise<boolean>) {
        this.middleware = callback;
    }
};

import WebSocket from "ws";
import fetch from "node-fetch";
import EventEmitter from "node:events";

export interface Packet extends Object {
    cmd: string;
    val: any;
    listener?: string;
}

export interface Context extends Object {
    _bot: Bot
    user: string;
    args: string[];
    origin: string;
    reply: (content: string) => void;
    post: (content: string) => void;
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

let bridges = ["Discord"]

export default class Bot extends EventEmitter {
    middleware!: ((ctx: Context) => boolean);
    prefix!: string;
    api!: string;
    ws!: WebSocket;
    user!: User;

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
                if (packet.val.mode === undefined && packet.val !== "I: 100 | OK") {
                    throw new Error(`Failed to login: ${packet.val}`)
                } else if (packet.val.mode === undefined) return;

                this.user = packet.val.payload;

                this.emit("login");
            });

            this.ws.on("close", () => {
                this.emit("close");
            });

            this.ws.on("packet", (data: Packet) => {
                this.emit("packet", data);
            });

            this.on('command-direct', (command: Packet) => {
                if (!command.val.hasOwnProperty("type")) {
                    return;
                }

                command.val.bridged = false;
                if (bridges.includes(command.val.u)) {
                    const data: Array<string> = command.val.p.split(": ", 1);
                    command.val.u = data[0];
                    command.val.p = data[1];
                    command.val.bridged = true;
                }


                this.emit("post",
                    command.val.u,
                    command.val.p,
                    command.val.post_origin
                );
            })

            this.ws.on("packet", (data: string) => {
                let packetData: Packet = JSON.parse(data);
                if (packetData.listener !== undefined) {
                    this.emit(`listener-${packetData.listener}`)
                }
                this.emit(`command-${packetData.cmd}`, packetData)
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

        return await response.json();
    }

    /**
    * Executes the callback when a new post is sent

    */
    onPost(callback: (username: string, content: string, origin: string) => void) {
        this.on("post", (username: string, content: string, origin: string) => {
            callback(username, content, origin);
        });
    }

    /**
    * Executes the callback when the connection is closed
    */
    onClose(callback: () => void) {
        this.on("close", () => {
            callback();
        });
    }


    /**
    * Executes the callback when a new packet from the server is sent
    */
    onPacket(callback: (data: Packet) => void) {
        this.on("packet", (data: Packet) => {
            callback(data);
        });
    }


    /**
    * Executes the callback when successfully logged in
    */
    onLogin(callback: () => void) {
        this.on("login", () => {
            callback();
        });
    }

    /**
    * Executes the callback when a bot command is sent
    */
    onCommand(command: string, callback: (ctx: Context) => void) {
        this.onPost((username: string, content: string, origin: string) => {
            if (username === this.user.username) {
                return;
            }
            const ctx: Context = {
                _bot: this,
                user: username,
                args: content.split(" ").splice(0, 1),
                origin: origin,
                reply: function (content: string): void {
                    this._bot.post(`@${this.user} ${content}`, this.origin)
                },
                post: function (content: string): void {
                    this._bot.post(content, this.origin)
                }
            }
          
                    
            if (!content.startsWith(`${this.prefix} ${command}`) && !content.startsWith(`${this.prefix} ${command}`)) 
                return;


            if (!this.middleware(ctx)) return;
            
            callback(ctx);
        });
    };
    
    /**
    * Sends a packet to the server
    */
    send(packet: Packet) {
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
    onCommandMiddleware(callback: (ctx: Context) => boolean) {
        this.middleware = callback;
    }
};

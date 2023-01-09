import WebSocket from "ws";
import fetch from "node-fetch";
import EventEmitter from "events";

export default class Bot extends EventEmitter {
    constructor(username, password, server="wss://server.meower.org/") {
        super(username, password);
        this.username = username;
        this.password = password;
        this.ws = new WebSocket(server);

        this.ws.on("open", async () => {
            this.ws.send(`{"cmd": "direct", "val": {"cmd": "type", "val": "js"}}`);
            this.ws.send(`{"cmd": "direct", "val": {"cmd": "ip", "val": "${await fetch("https://api.meower.org/ip").then(res => res.text())}"}}`);
            this.ws.send(`{"cmd": "direct", "val": "meower"}`);
            this.ws.send(`{"cmd": "direct", "val": {"cmd": "version_chk", "val": "scratch-beta-5-r7"}}`);
            this.ws.send(`{"cmd": "direct", "val": {"cmd": "authpswd", "val": {"username": "${username}", "pswd": "${password}"}}}`);
            
            setInterval(() => {
                if (this.ws.readyState == 1) {
                    this.ws.send(`{"cmd": "ping", "val": ""}`);
                }
            }, 10000);
            
            setTimeout(() => {
                this.emit("login");
            }, 1000);

            this.ws.on("close", () => {
                this.emit("close");
            });

            this.ws.on("message", (data) => {
                this.emit("message", data);
            });

            this.ws.on("message", (data) => {
                var messageData = JSON.parse(data);
                if (messageData.val.type === 1) {
                    try {
                        if (messageData.val.u === this.username) {
                            return;
                        } else if (messageData.val.u == "Discord") {
                            this.emit("post", messageData.val.p.split(": ")[0], messageData.val.p.split(": ")[1]);
                        } else {
                            this.emit("post", messageData.val.u, messageData.val.p);
                        }
                    } catch(e) {
                        return;
                    }
                }
            });
        });
    }

    post(content) {
        this.ws.send(JSON.stringify({"cmd": "direct", "val": {"cmd": "post_home", "val": content}}));
    }

    onPost(callback) {
        this.on("post", (username, content) => {
            callback(username, content);
        });
    }

    onClose(callback) {
        this.on("close", () => {
            callback();
        });
    }

    onMessage(callback) {
        this.on("message", (data) => {
            callback(data);
        });
    }

    onLogin(callback) {
        this.on("login", () => {
            callback();
        });
    }
}

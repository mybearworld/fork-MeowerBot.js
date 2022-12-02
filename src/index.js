import WebSocket from "ws";
import fetch from "node-fetch";
import EventEmitter from "events";

export default class Bot {
    constructor(username, password) {
        this.user = username;
        this.pass = password;
        this.eventEmitter = new EventEmitter();
        this.ws = new WebSocket("wss://server.meower.org/");

        this.ws.on("open", async () => {
            console.log("Connected");
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
                this.eventEmitter.emit("login");
            }, 1000);

            this.ws.on("close", () => {
                this.eventEmitter.emit("close");
            });

            this.ws.on("message", (data) => {
                this.eventEmitter.emit("message", data);
            });

            this.ws.on("message", (data) => {
                var messageData = JSON.parse(data);
                if (messageData.val.type === 1) {
                    try {
                        if (messageData.val.u === this.user) {
                            return;
                        } else if (messageData.val.u == "Discord") {
                            this.eventEmitter.emit("post", messageData.val.p.split(": ")[0], messageData.val.p.split(": ")[1]);
                        } else {
                            this.eventEmitter.emit("post", messageData.val.u, messageData.val.p);
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
        this.eventEmitter.on("post", (username, content) => {
            callback(username, content);
        });
    }

    onClose(callback) {
        this.eventEmitter.on("close", () => {
            callback();
        });
    }

    onMessage(callback) {
        this.eventEmitter.on("message", (data) => {
            callback(JSON.parse(data));
        });
    }

    onLogin(callback) {
        this.eventEmitter.on("login", () => {
            callback();
        });
    }
}

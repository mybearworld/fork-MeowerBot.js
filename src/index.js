import WebSocket from "ws";
import fetch from "node-fetch";
import EventEmitter from "events";

const eventEmitter = new EventEmitter();
var user;
var pass;

const ws = new WebSocket("wss://server.meower.org/");

setInterval(() => {
    if (ws.readyState == 1) {
        ws.send('{"cmd": "ping", "val": ""}');
    }
}, 10000);

export default class Bot {
    constructor(username, password) {
        var user = username;
        var pass = password;

        ws.on("open", async () => {
            console.log("Connected");
            ws.send(`{"cmd": "direct", "val": {"cmd": "type", "val": "js"}}`);
            ws.send(`{"cmd": "direct", "val": {"cmd": "ip", "val": "${await fetch("https://api.meower.org/ip").then(res => res.text())}"}}`);
            ws.send(`{"cmd": "direct", "val": "meower"}`);
            ws.send(`{"cmd": "direct", "val": {"cmd": "version_chk", "val": "scratch-beta-5-r7"}}`);
            ws.send(`{"cmd": "direct", "val": {"cmd": "authpswd", "val": {"username": "${username}", "pswd": "${password}"}}}`);
            setTimeout(() => {
                eventEmitter.emit("login");
            }, 1000);
        });
    }

    post(content) {
        ws.send(JSON.stringify({"cmd": "direct", "val": {"cmd": "post_home", "val": content}}));
    }

    onPost(callback) {
        ws.on("message", (data) => {
            var messageData = JSON.parse(data);
            
            if (messageData.val.type === 1) {
                try {
                    eventEmitter.on("post", () => {
                        if (messageData.val.u === user) {
                            return;
                        } else if (messageData.val.u == "Discord") {
                            callback(messageData.val.p.split(": ")[0], messageData.val.p.split(": ")[1]);
                        } else {
                            callback(messageData.val.u, messageData.val.p);
                        }
                    });
                } catch(e) {
                    return;
                }
            }
        });
    }

    onClose(callback) {
        ws.on("close", () => {
            callback();
        });
    }

    onMessage(callback) {
        ws.on("message", (data) => {
            callback(JSON.parse(data));
        });
    }

    onLogin(callback) {
        eventEmitter.on("login", () => {
            callback();
        });
    }
}

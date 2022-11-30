import WebSocket from "ws";
import fetch from "node-fetch";

console.log("Connecting...");
const ws = new WebSocket("wss://server.meower.org/");

export default class Bot {
    constructor(username, password, callback) {
        ws.on("open", async function() {
            console.log("Connected");
            ws.send(`{"cmd": "direct", "val": {"cmd": "type", "val": "js"}}`);
            ws.send(`{"cmd": "direct", "val": {"cmd": "ip", "val": "${await fetch("https://api.meower.org/ip").then(res => res.text())}"}}`);
            ws.send(`{"cmd": "direct", "val": "meower"}`);
            ws.send(`{"cmd": "direct", "val": {"cmd": "version_chk", "val": "scratch-beta-5-r7"}}`);
            ws.send(`{"cmd": "direct", "val": {"cmd": "authpswd", "val": {"username": "${username}", "pswd": "${password}"}}}`);
            setTimeout(function() {
                callback();
            }, 1000);
        });
    }

    post(content) {
        ws.send(JSON.stringify({"cmd": "direct", "val": {"cmd": "post_home", "val": content}}));
    }

    on_new_post(callback) {
        ws.on("message", async function(data) {
            var messageData = JSON.parse(data);
            
            if (messageData.val.type === 1) {
                try {
                    console.log(`New post: ${messageData.val.u}: ${messageData.val.p}`);
                    if (messageData.val.u == "Discord") {
                        callback(messageData.val.p.split(": ")[0], messageData.val.p.split(": ")[1]);
                    } else {
                        callback(messageData.val.u, messageData.val.p);
                    }
                } catch(e) {
                    return;
                }
            }
        });
    }
}
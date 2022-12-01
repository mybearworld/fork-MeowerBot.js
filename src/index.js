import WebSocket from "ws";
import fetch from "node-fetch";

var user;
var pass;

console.log("Connecting...");
const ws = new WebSocket("wss://server.meower.org/");

ws.on("message", (data) => {
    var messageData = JSON.parse(data);
    if (messageData.val.type === 1) {
        console.log(`${messageData.val.u}: ${messageData.val.p}`);
    } else if (messageData.cmd === "ping") {
        if (messageData.val === "I:100 | OK") {
            console.log("Ping is OK");
        } else {
            console.error("Ping is not OK");
        }
    } else if (messageData.val.state === 101 || messageData.val.state === 100) {
        console.log(`${messageData.val.u} is typing...`);
    } else if (messageData.cmd === "ulist") {
        console.log(`Users online: ${messageData.val.split(";").join(", ")}`);
    } else if (messageData.cmd === "statuscode") {
        if (messageData.val.startsWith("E")) {
            console.error(`Status: ${messageData.val}`);
        } else if (messageData.val.startsWith("I:100")) {
            console.log(`Status: ${messageData.val}`);
        } else {
            console.log(`Status: ${messageData.val}`);
        }
    } else if (messageData.val.cmd === "motd") {
        console.log(`MOTD: ${messageData.val.val}`);
    } else if (messageData.val.cmd === "vers") {
        console.log(`Meower Server Version: ${messageData.val.val}`);
    } else if (messageData.val.state === 1) {
        console.log(`${messageData.val.u} joined ${messageData.val.chatid}`);
    } else if (messageData.val.state === 0) {
        console.log(`${messageData.val.u} left ${messageData.val.chatid}`);
    } else if (messageData.val.mode === "auth") {
        console.log(`Logged in as "${messageData.val.payload.username}" (${messageData.val.payload.token})`);
    } else {
        console.log(`New message: ${data}`);
    }
});

setInterval(() => {
    if (ws.readyState == 1) {
        ws.send('{"cmd": "ping", "val": ""}');
    }
}, 10000);

export default class Bot {
    constructor(username, password, callback) {
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
                callback();
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
                    if (messageData.val.u === user) {
                        return;
                    } else if (messageData.val.u == "Discord") {
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

    onClose(callback) {
        ws.on("close", () => {
            console.error("Disconnected");
            callback();
        });
    }
}

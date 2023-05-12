# MeowerBot.js
Port of meower.py to Node.js and TypeScript
## Installation
```bash
npm install meowerbot
```
## Example Bot
```js
import Bot from "meowerbot";

const bot = new Bot(); 

bot.onLogin(() => { // Runs when logged in
    bot.post("Hello from MeowerBot.js!");
});

bot.onCommand("help", (ctx) => { // Runs when a new post with a bot command is sent
    ctx.reply("Commands: @username help");
});

bot.onMessage((data) => { // Runs when the server sends a new message
    console.log(`New message: ${data}`);
});

bot.onClose(() => { // Runs when the bot gets disconnected
    console.log("Disconnected");
    bot.login("username", "password");
});

bot.login("username", "password"); // Init, then login to Meower
```

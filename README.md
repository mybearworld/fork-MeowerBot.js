# MeowerBot.js
Port of MeowerBot.py to Node.js and TypeScript
## Installing
```bash
npm install --save-dev meowerbot
```
## Example Bot
```js
import Bot from "meowerbot";

const bot = new Bot("username", "password"); // Init, then login to Meower

bot.onLogin(() => { // Runs when logged in
    bot.post("Hello from MeowerBot.js!");
});

bot.onCommand("help", (username, argv, origin) => { // Runs when a new post with a bot command is sent
    bot.post("Commands: @username help", origin);
});

bot.onMessage((data) => { // Runs when the server sends a new message
    console.log(`New message: ${data}`);
});

bot.onClose(() => { // Runs when the bot gets disconnected
    console.log("Disconnected");
});
```

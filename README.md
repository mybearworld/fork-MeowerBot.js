# MeowerBot.js
Port of MeowerBot.py to Node.js
## Installing
```bash
npm install meowerbot
```
## Example Bot
```js
import Bot from "meowerbot";

const bot = new Bot("username", "password");

bot.onLogin(() => {
    bot.post("Hello from MeowerBot.js!");
});

bot.onPost((username, content) => {
    if (content.startsWith("*help")) {
        bot.post("Commands: *help");
    }
});
```

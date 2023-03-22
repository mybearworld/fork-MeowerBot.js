import Bot from "../../src/MeowerBot.js";

const bot = new Bot();

bot.onCommand("help", (ctx) => {
    ctx.reply("I don't have any commands!");
});

bot.login("m", "camilla124");
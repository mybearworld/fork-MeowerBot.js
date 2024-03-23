import { bridges } from "../..";
import Bot, { Context } from ".";

export default function <T extends Bot>(bot: T, admins: Array<string>): T {

    bot.onCommand("eval", async (ctx: Context) => {
        if (!admins.includes(ctx.user) || (ctx.bridged && bridges.includes("Webhooks"))) {
            await ctx.reply("You are not allowed to run this command. Ask one of the bot admins to add you!")
            return;
            }       
            eval(`(async () => {${ctx.args.join(" ")}})().catch(() => ctx.post("ERROR"))`)
    })

    return bot;
}
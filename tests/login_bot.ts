import Bot, { Context } from '../dist/ext/bot/index.js'
import help from "../dist/ext/bot/help.js"
import { bridges } from '../dist/meower.js';
import Eval from "../dist/ext/bot/eval_.js"

import * as util from 'util';

const bot = Eval(help(new Bot()), ["ShowierData9978"]);

bridges.push("Webhooks")

bot.onLogin(async () => {
    await bot.post("Mb.js Test", 'livechat')
})

bot.onCommand('ping', async (ctx: Context) => {
    await ctx.reply("Pong!")
}, '', [])

bot.onCommand('whoami', async (ctx: Context) => {


    let message = `====== ${ctx.user} =====\n`
    let req = (await fetch(`https://api.meower.org/users/${ctx.user}`))

    if (!req.ok) {
        await ctx.reply("Uh oh, You arnt a real user????")
        return;
    }

    let data = await req.json()

    message = message.concat(`${data.quote}
=====${"=".repeat(ctx.user.length + 4)}====
avatar: ${data.avatar ? data.avatar : data.pfp_data} ${data.avatar !== '' ? "(custom)" : ""}
created: ${new Date(data.created * 1000).toISOString()}
permissions: ${data.permissions}
bot: ${(await fetch(`https://meower-utils.showierdata.xyz/bot/${data.user}`)).ok}
    `)

    await ctx.post(message)
}, '', [])

bot.onCommand('throw', async (ctx: Context) => {
    throw new Error(ctx.args.join(" "))
}, 'Throws an error,\n then returns it.', ["message: String"])

// @ts-ignore
bot.on('.error', async (error: Error | any) => {
    if (error["ctx"] as any === undefined) return;

    await (error["ctx"] as Context).post(util.inspect(error))
}) 


bot.onCommandMiddleware(async (ctx: Context) => {
    await ctx.reply("Test middleware")
    return true;
})



bot.onPost(async (username, content, origin) => {
    console.log(`${username}@${origin}: ${content}`)
})

if (!process.env.USERNAME || !process.env.PASSWORD) {
    throw TypeError("USERNAME or PASSWORD are not defined!")
}



bot.login(process.env.USERNAME, process.env.PASSWORD);

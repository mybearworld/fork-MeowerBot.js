import Bot, { Context } from "./index.js";

interface HelpBotMixin extends Bot {
    genHelp(): void 
}

export default function<T extends Bot> (bot: T): HelpBotMixin {
    const maxPageChars = 1000;
    const helpBot: HelpBotMixin = bot as any;

    let pages: Array<string> = ["Uh oh! Help did not get generated."];
    let currentPage: string = '';

    helpBot.genHelp = () => {
        pages = [];

        currentPage = "# Commands\n"

        bot.commands.forEach((group, groupName) => {
            currentPage += `## ${groupName}\n`
            group.forEach((command, commandName) => {
                currentPage += `${bot.prefix} ${commandName} ${command.args ? `<${command.args.join("> <")}>` : '<?>'}\n`
                if (command.help !== '') {
                    // currentPage = currentPage.slice(0, -1);
                    currentPage += ` - ${command.help.trimStart().split("\n").join("\n  ")}\n`;
                }

                if (currentPage.length >= maxPageChars) {
                    pages.push(currentPage);
                    currentPage = `## ${groupName} (Continued)\n`
                }
            }) 
        })

        if (!currentPage.endsWith("(Continued)\n")) 
            pages.push(currentPage);

        //@ts-ignore
        bot.commands.get('Help').get('help').help = `Pages: ${pages.length}`
    }

    bot.onLogin(() => {
        helpBot.genHelp();
    })

    bot.onCommand("help", async (ctx: Context) => {
        let page: number;
        if (!ctx.args[0]) {
            page = 1;
        } else page =  Math.round(Number.parseFloat(ctx.args[0]));

        if (page > pages.length) {
            page = pages.length;
        }

        await ctx.post(pages[page - 1] as string)

    }, "Pages: 0", ["page: Number"], "Help")

    return helpBot;
}
import Client from "../..";

// eslint-disable-next-line @typescript-eslint/ban-types
export interface Context extends Object {
    _bot: Client,

    bridged: boolean,
    user: string;
    args: string[];
    origin: string;
    reply: (content: string) => Promise<void>;
    post: (content: string) => Promise<void>;
}

export default class Bot extends Client {
    middleware!: ((ctx: Context) => boolean | Promise<boolean>);
    prefix!: string;
    
    // groups
    commands: Map<string, Map<string, {
        func: (ctx: Context) => void;
        help: string;
        args: null | Array<string>;
    }>>;

    constructor(server = "wss://server.meower.org/", api = "https://api.meower.org") {
        super(server, api);
        this.commands = new Map();
    }

    override login(username: string, password: string, prefix = `@${username}`) {
        this.prefix = prefix;
        this.middleware = (_ctx) => { return true; };
        super.login(username, password)
    }

    /**
    * Executes the callback when a bot command is sent
    */
    onCommand(command: string, callback: (ctx: Context) => void | Promise<void>, help: string = "", args: null | string[] = null, group: string = "unorginized") {
        if ((this.commands.get(group)) === undefined)  this.commands.set(group, new Map());

        this.commands.get(group)?.set(command, {
            func: callback,
            help: help,
            args: args
        })

        this.onPost(async (username: string, content: string, origin: string, {bridged}) => {
            if (username === this.user.username) {
                return;
            }
            const ctx: Context = {
                _bot: this,
                user: username,
                bridged: bridged !== null,
                args: content.split(" ", 5000),
                origin: origin,
                reply: async function (content: string): Promise<void> {
                    return await this._bot.post(`@${this.user} ${content}`, this.origin)
                },
                post: async function (content: string): Promise<void> {
                    return await this._bot.post(content, this.origin)
                }
            }

            ctx.args.splice(0, 2)


            if (!content.startsWith(`${this.prefix} ${command}`) && !content.startsWith(`${this.prefix} ${command}`))
                return;

            try {
                if (!await this.middleware(ctx)) return;

                await callback(ctx);
            } catch (e) {
                (e as any).ctx = ctx;
                this.emit('.error', e);
                console.error(e);
            }
        });
    }
    /**
    * The middleware to use for `onCommand`
    */
    onCommandMiddleware(callback: (ctx: Context) => boolean | Promise<boolean>) {
        this.middleware = callback;
    }
}
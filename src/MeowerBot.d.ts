export interface Message {
    cmd: string;
    val: any;
}
/* Nice going! You broke it.
export interface Context {
    The evolution of the word "Hi" on Meower: 2020: Hi, 2022: h, 2023: @wlbot work
}
*/

declare class Bot {
    login(username: string, password: string, server?: string, prefix?: string);
    post(content: string, origin?: string | null): void;
    onPost(callback: () => void): void;
    onClose(callback: () => void): void;
    onMessage(callback: () => void): void;
    onLogin(callback: () => void): void;
    onCommand(command: string, callback: (ctx: Context) => void): void;
    send(message: Message): void;
    close(): void;
}

export = Bot;

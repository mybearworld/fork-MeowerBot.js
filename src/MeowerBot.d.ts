declare class Bot {
    constructor(username: string, password: string, server?: string);
    post(content: string, origin?: string): void;
    onPost(callback: Function): void;
    onClose(callback: Function): void;
    onMessage(callback: Function): void;
    onLogin(callback: Function): void;
    onCommand(command: string, callback: Function): void;
    send(message: Object): void;
}

export = Bot;

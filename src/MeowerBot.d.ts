declare class Bot {
    login(username: string, password: string, server?: string, prefix?: string);
    post(content: string, origin: string | null): void;
    onPost(callback: Function): void;
    onClose(callback: Function): void;
    onMessage(callback: Function): void;
    onLogin(callback: Function): void;
    onCommand(command: string, callback: Function): void;
    send(message: object): void;
}

declare class API {
    getHome(page?: number): Promise<object[]>;
}

export = { Bot, API };

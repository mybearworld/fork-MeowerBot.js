declare class Bot {
    constructor(username: string, password: string, server?: string, prefix?: string);
    post(content: string, origin?: string): void;
    onPost(callback: (username: string, content: string, origin: string | null) => void): void;
    onClose(callback: () => void): void;
    onMessage(callback: (data: string) => void): void;
    onLogin(callback: () => void): void;
    onCommand(command: string, callback: Function): void;
    send(message: object): void;
}

export = Bot;

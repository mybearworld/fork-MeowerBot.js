type callback = any;

declare class Bot {
    constructor(username: string, password: string);
    post(content: string): void;
    onPost(callback: callback): void;
    onClose(callback: callback): void;
    onMessage(callback: callback): void;
    onLogin(callback: callback): void;
}

export = Bot;
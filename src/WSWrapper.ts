import EventEmitter from "events";
import WebSocket from "isomorphic-ws";
// @ts-expect-error: BufferLike is not exported, but i need it anyways
import type { BufferLike } from 'ws';

const isBrowser = typeof window !== "undefined";


export default class WS extends EventEmitter {
    ws: WebSocket;
    readyState!: number;

    constructor(server: string) {
        super();
        this.readyState = 0;
        this.ws = new WebSocket(server);

        if (isBrowser) {
            // Bind event handlers
            this.ws.onopen = () => {
                this.readyState = this.ws.readyState
                this.emit('connect');
                
            };

            this.ws.onclose = () => {
                this.readyState = this.ws.readyState
                this.emit('close');
            };

            this.ws.onerror = (error) => {
                this.readyState = this.ws.readyState
                this.emit('error', error);
            };

            this.ws.onmessage = (event) => {
                this.readyState = this.ws.readyState
                this.emit('message', event.data);
            };
        } else {
            this.ws.on("open", () => {
                this.readyState = this.ws.readyState
                this.emit("connect")
            })
            this.ws.on("close", () => {
                this.readyState = this.ws.readyState
                this.emit("close")
            })
            this.ws.on("error", (e) => {
                this.readyState = this.ws.readyState
                this.emit("error", e)
            })
            this.ws.on("message", (data) => {
                this.readyState = this.ws.readyState
                this.emit("message", data)
            })
        }
    }

    send(data: BufferLike) {
        this.ws.send(data);
    }

    close() {
        this.ws.close();
    }
}

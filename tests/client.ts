import { Client } from '@meower-media/meower';
import log from 'loglevel';
import readline, { createInterface } from 'node:readline';

log.setDefaultLevel(log.levels.INFO)

const client = new Client();
const ui = createInterface(process.stdin, process.stdout)

function uiLog(message: string) {
  readline.cursorTo(process.stdout, 0);
  console.log(message);
  ui.prompt(true);
}

client.onPost((username, content, origin, {bridged}) => {
    uiLog(`${username}@${origin}: ${content} ${bridged ? '(Bridged)' : ''}`)
})

ui.prompt(true)

if (!process.env.USERNAME || !process.env.PASSWORD) {
    throw TypeError("USERNAME or PASSWORD are not defined!")
}

ui.on('line', (message) => {
    process.stdout.write('\x1b[1A\x1b[2K');
    client.post(message, 'livechat')
})

client.login(process.env.USERNAME, process.env.PASSWORD)

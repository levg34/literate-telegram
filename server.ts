import WebSocket, { WebSocketServer } from 'ws'
import { Message } from './message'
import { randomUUID } from 'crypto'
import colors from './colors.json'

require('dotenv').config()

const wss = new WebSocketServer({ port: Number(process.env.WS_PORT) ?? 8080 })

const stringifyMessage = (message: Message): string => {
    return JSON.stringify(message.toJSON())
}

interface WSId extends WebSocket.WebSocket  {
    id?: string
    color?: string
}

type User = {
    id: string
    color: string
}

let users = 0

wss.on('connection', function connection(ws: WSId) {
    const user: User = {
        id: randomUUID(),
        color: colors[users%(colors.length)], //getColor(users.length),
    }

    ++users

    ws.id = user.id
    ws.color = user.color

    ws.on('message', function message(data) {
        console.log('received: %s', data)
        try {
            const received = new Message(JSON.parse(data.toString()))
            received.sender = ws.id || 'Unknown'
            received.color = ws.color || '#D3D3D3'
    
            wss.clients.forEach((client: WSId) => {
                const clientId = client.id
                if (!clientId || (clientId && clientId !== ws.id)) {
                    client.send(stringifyMessage(received))
                }
            })
        } catch (e) {
            console.error(e)
            ws.send(stringifyMessage(new Message({
                message: 'Error: wrong format.'
            })))
            ws.close()
        }
    })

    const welcomeMessage = this.clients.size > 1 ? `There are ${this.clients.size-1} other user(s) connected.` : 'You are alone here.'

    const welcome = new Message({
        message: `Hello! ${welcomeMessage}`,
        sender: 'Server',
        color: ws.color
    })
    ws.send(stringifyMessage(welcome))

    wss.clients.forEach((client: WSId) => {
        const clientId = client.id
        if (!clientId || (clientId && clientId !== ws.id)) {
            client.send(stringifyMessage(new Message({
                message: 'Connected',
                color: ws.color,
                sender: ws.id
            })))
        }
    })

    ws.on('close', () => {
        wss.clients.forEach((client: WSId) => {
            client.send(stringifyMessage(new Message({
                message: 'Disconnected',
                color: ws.color,
                sender: ws.id
            })))
        })
    })
})

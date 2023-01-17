import WebSocket, { WebSocketServer } from 'ws'
import { Message } from './message'
import { randomUUID } from 'crypto'
import colors from './colors.json'

const wss = new WebSocketServer({ port: 8080 })

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
    ws: WebSocket.WebSocket
}

const users: User[] = []

wss.on('connection', function connection(ws: WSId) {
    const user: User = {
        id: randomUUID(),
        color: colors[users.length%(colors.length)], //getColor(users.length),
        ws
    }

    users.push(user)

    ws.id = user.id
    ws.color = user.color

    ws.on('message', function message(data) {
        console.log('received: %s', data)
        const received = new Message(JSON.parse(data.toString()))
        received.sender = ws.id || 'Unknown'
        received.color = users.find(u => u.id === ws.id)?.color || '#D3D3D3'

        wss.clients.forEach((client: WSId) => {
            const clientId = client.id
            if (!clientId || (clientId && clientId !== ws.id)) {
                client.send(stringifyMessage(received))
            }
        })
    })

    const welcome = new Message({
        message: 'Hello there from server!',
        sender: 'Server'
    })
    ws.send(stringifyMessage(welcome))
})

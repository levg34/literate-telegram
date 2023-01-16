import WebSocket, { WebSocketServer } from 'ws'
import { Message } from './message'
import { randomUUID } from 'crypto'

const wss = new WebSocketServer({ port: 8080 })

const stringifyMessage = (message: Message): string => {
    return JSON.stringify(message.toJSON())
}

interface WSId extends WebSocket.WebSocket  {
    id?: string
}

wss.on('connection', function connection(ws: WSId) {
    ws.id = randomUUID()
    ws.on('message', function message(data) {
        console.log('received: %s', data)
        const received = new Message(JSON.parse(data.toString()))
        received.sender = ws.id || 'Unknown'

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

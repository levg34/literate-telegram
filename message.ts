export interface IMessage {
    message: string
    sender?: string
    time?: string
}

export interface IMessageJSON {
    message: string
    sender: string
    time: string
}

export class Message implements Required<IMessage> {
    message: string
    sender: string
    time: string
    static ME = 'Server'

    constructor(message: IMessage) {
        this.message = message.message
        this.sender = message.sender ?? Message.ME
        this.time = message.time ?? new Date().toISOString()
    }

    toJSON(): Required<IMessageJSON> {
        const message: IMessageJSON = {
            ...this,
            time: this.time
        }
        return message
    }
}

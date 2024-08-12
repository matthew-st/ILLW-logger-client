import { EventEmitter } from 'stream'
import { WebSocket } from 'ws'

export default class WebsocketClient extends EventEmitter {
    ws: WebSocket
    token: string
    constructor(token: string) {
        super()
        this.token = token
    }


}


export function handleSockets(retry = true, token, ipc: Electron.WebContents) {
    let ws = new WebSocket('wss://localhost:3903')
    ws.on('open', () => {
        ipc.send('snackbar', {
            message: 'Websocket connection successful',
            severity: 'success'
        })
        retry = false
        ws.send(JSON.stringify({
            op: 0,
            token: token
        }))
    })

    ws.on('message', (msg) => {
        const data = JSON.parse(msg.toString())
        switch (data.op) {
            case 0:
                if (data.unauthenticated) {
                    return ipc.send('snackbar', {
                        message: 'Incorrect token provided. Check settings.',
                        severity: 'error',
                        icon: 'keyoff'
                    })
                }
                if (data.chunk_status[0] == 1) {
                    ipc.send('snackbar', {
                        message: `Syncronising ${data.total_amount} QSOs from server.`,
                        severity: 'info',
                        icon: 'sync'
                    })
                }
                ipc.send('initialise', data)
                break;
        }
    })

    ws.on('close', () => {
        if (!retry) {
            ipc.send('snackbar', {
                message: 'Websocket connection lost. Retrying connection in 5s',
                severity: 'error'
            })
        }
        ws = null
        setTimeout(() => {
            handleSockets(true, token, ipc)
        }, 5000)
    })
}

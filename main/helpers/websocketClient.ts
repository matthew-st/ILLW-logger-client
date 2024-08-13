import { EventEmitter } from 'stream'
import { WebSocket } from 'ws'
import { ConfigHandler, QSO } from './fileHandler'

export default class WebsocketClient extends EventEmitter {
    ws: WebSocket
    config: ConfigHandler
    ipc: Electron.WebContents
    retry: boolean
    lastFailedAuth: string
    lastAuth: string
    constructor(config: ConfigHandler, ipc: Electron.WebContents) {
        super()
        this.config = config
        this.ipc = ipc
        this.retry = false
        this.createWsClient()
    }

    private createWsClient() {
        if (this.config.get('authToken') == this.lastFailedAuth) {
            return setTimeout(() => {
                this.createWsClient()
            }, 5000)
        }
        this.ws = new WebSocket('ws://localhost:3903')
        this.ws.onerror = () => {
            this.ipc?.send('snackbar', {
                message: 'Websocket connection failed. Retrying connection.',
                severity: 'error',
                icon: 'wifiOff'
            })
            setTimeout(() => {
                delete this.ws
                this.createWsClient() 
            }, 60 * 1000)
        }
        this.ws.on('open', () => {
            this.ipc.send('snackbar', {
                message: 'Websocket connection successful',
                severity: 'success',
                icon: 'tick'
            })
            this.retry = false
            this.lastAuth = this.config.get('authToken')
            this.sendJson({
                op: 0,
                token: this.lastAuth
            })
        })

        this.ws.on('message', (msg) => {
            const data = JSON.parse(msg.toString())
            switch (data.op) {
                // Authentication packet
                case 0:
                    if (data.unauthenticated) {
                        return this.ipc.send('snackbar', {
                            message: 'Incorrect token provided. Check settings.',
                            severity: 'error',
                            icon: 'keyoff'
                        })
                    }
                    if (data.chunk_status[0] == 1) {
                        this.ipc.send('snackbar', {
                            message: `Syncronising ${data.total_amount} QSOs from server.`,
                            severity: 'info',
                            icon: 'sync'
                        })
                    }
                    this.ipc.send('initialise', data)
                    break;
                // add QSO
                case 1:
                    this.ipc.send('qso_made', data.qso)
                    this.ipc.send('snackbar', {
                        message: 'QSO added',
                        severity: 'success',
                        icon: 'add'
                    })
                    break;
                // edit QSO
                case 2:
                    this.ipc.send('qso_edit', data.qso)
                    this.ipc.send('snackbar', {
                        message: 'QSO edited',
                        severity: 'info',
                        icon: 'edit'
                    })
                    break;
                // delete QSO
                case 3:
                    this.ipc.send('qso_delete', data.id)
                    this.ipc.send('snackbar', {
                        message: 'QSO deleted',
                        severity: 'error',
                        icon: 'delete'
                    })
                    break;
            }
        })

        this.ws.on('close', (closeCode) => {
            if (!this.retry && closeCode !== 3000) {
                this.ipc.send('snackbar', {
                    message: 'Websocket connection failed. Retrying connection.',
                    severity: 'error',
                    icon:'wifiOff'
                })
            } 
            if (closeCode == 3000) {
                this.lastFailedAuth = this.lastAuth
            }
            this.ws = null
            setTimeout(() => {
                this.retry = true
                this.createWsClient()
            }, 5000)
        })

    }

    sendJson(data: object) {
        this.ws.send(JSON.stringify(data))
    }

    addQSO(data: QSO) {
        this.sendJson({
            op: 1,
            qso: data
        })
    }

    editQSO(data: QSO) {
        this.sendJson({
            op: 2,
            qso: data
        })
    }

    deleteQSO(data: QSO) {
        this.sendJson({
            op: 3,
            id: data.id
        })
    }
}

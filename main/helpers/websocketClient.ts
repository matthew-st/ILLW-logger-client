import { EventEmitter } from 'stream'
import { WebSocket } from 'ws'
import FileHandler, { Action, ConfigHandler } from './fileHandler'

export default class WebsocketClient extends EventEmitter {
    ws: WebSocket
    files: FileHandler
    ipc: Electron.WebContents
    retry: boolean
    lastFailedAuth: string
    lastAuth: string
    hb: NodeJS.Timeout
    constructor(files: FileHandler, ipc: Electron.WebContents) {
        super()
        this.files = files
        this.ipc = ipc
        this.retry = false
        this.createWsClient()
    }

    private createWsClient() {
        delete this.ws
        if (this.files.config.get('authToken') == this.lastFailedAuth) {
            setTimeout(() => {
                this.createWsClient()
            }, 5000)
            return
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
            }, 60000)
        }
        this.ws.on('open', () => {
            this.ipc.send('snackbar', {
                message: 'Websocket connection successful',
                severity: 'success',
                icon: 'tick'
            })
            this.retry = false
            this.lastAuth = this.files.config.get('authToken')
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
                    this.hb = setInterval(() => {
                        this.sendJson({op: 1000})
                    }, 10000)
                    this.ipc.send('initialise', data)
                    break;
                // add QSO
                case 1:
                    this.ipc.send('qso_made', data.qso)
                    this.files.actions.actionFulfilled(data.opId)
                    this.ipc.send('snackbar', {
                        message: 'QSO added',
                        severity: 'success',
                        icon: 'add'
                    })
                    break;
                // edit QSO
                case 2:
                    this.ipc.send('qso_edit', data.qso)
                    this.files.actions.actionFulfilled(data.opId)
                    this.ipc.send('snackbar', {
                        message: 'QSO edited',
                        severity: 'info',
                        icon: 'edit'
                    })
                    break;
                // delete QSO
                case 3:
                    this.ipc.send('qso_delete', data.id)
                    this.files.actions.actionFulfilled(data.opId)
                    this.ipc.send('snackbar', {
                        message: 'QSO deleted',
                        severity: 'error',
                        icon: 'delete'
                    })
                    break;
            }
        })

        this.ws.on('close', (closeCode, reason) => {
            console.log(reason.toString())
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
            delete this.ws
            clearInterval(this.hb)
            setTimeout(() => {
                this.retry = true
                this.createWsClient()
            }, 5000)
        })

    }

    sendJson(data: object) {
        if (this.ws?.OPEN) {
            this.ws.send(JSON.stringify(data))
        }
    }

    doAction(data: Action) {
        this.sendJson({
            op: 1,
            action: data
        })
    }
}

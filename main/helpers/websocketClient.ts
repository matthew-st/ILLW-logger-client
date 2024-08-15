import { EventEmitter } from 'stream'
import { WebSocket } from 'ws'
import FileHandler, { Action } from './fileHandler'

export default class WebsocketClient extends EventEmitter {
    ws: WebSocket
    files: FileHandler
    ipc: Electron.WebContents
    retry: boolean
    retryTimeout: NodeJS.Timeout
    lastFailedAuth: string
    lastAuth: string
    constructor(files: FileHandler, ipc: Electron.WebContents) {
        super()
        this.files = files
        this.ipc = ipc
        this.retry = false
        this.createWsClient()
    }

    private createWsClient() {
        this.ws?.close()
        clearTimeout(this.retryTimeout)
        delete this.ws
        if (this.files.config.get('authToken') == this.lastFailedAuth) {
            this.retryTimeout = setTimeout(() => {
                this.createWsClient()
            }, 5000)
            return
        }
        this.ws = new WebSocket(this.files.config.get('wsUrl') || 'ws://localhost:3903')
        this.ws.onerror = (err) => {
            this.ipc?.send('snackbar', {
                message: 'Websocket connection failed. Retrying connection.',
                severity: 'error',
                icon: 'wifiOff'
            })
            this.retry = true
            this.retryTimeout = setTimeout(() => {
                delete this.ws
                if (this.retry) this.createWsClient() 
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
                        this.lastFailedAuth = this.lastAuth
                        return this.ipc.send('snackbar', {
                            message: 'Incorrect token provided. Check settings.',
                            severity: 'error',
                            icon: 'keyoff'
                        })
                    }
                    clearTimeout(this.retryTimeout)
                    if (data.chunk_status[0] == 1) {
                        this.ipc.send('snackbar', {
                            message: `Syncronising ${data.total_amount} QSOs from server.`,
                            severity: 'info',
                            icon: 'sync'
                        })
                    }
                    this.ipc.send('init', data)
                    break;
                // add QSO
                case 1:
                    this.ipc.send('qso_made', data.qso)
                    this.files.actions.actionFulfilled(data.opId)
                    if(!data.replay) this.ipc.send('snackbar', {
                        message: 'QSO added',
                        severity: 'success',
                        icon: 'add'
                    })
                    break;
                // edit QSO
                case 2:
                    this.ipc.send('qso_edit', data.qso)
                    this.files.actions.actionFulfilled(data.opId)
                    if(!data.replay) this.ipc.send('snackbar', {
                        message: 'QSO edited',
                        severity: 'info',
                        icon: 'edit'
                    })
                    break;
                // delete QSO
                case 3:
                    this.ipc.send('qso_delete', data.id)
                    this.files.actions.actionFulfilled(data.opId)
                    if(!data.replay) this.ipc.send('snackbar', {
                        message: 'QSO deleted',
                        severity: 'error',
                        icon: 'delete'
                    })
                    break;
                // Finished fulfilling actions
                case 4:
                    this.ipc.send('snackbar', {
                        message: `A batch of ${data.number} unfulfilled action${data.number == 1 ? '' : 's'} were handled.`,
                        severity: 'success',
                        icon: 'tick'
                    })
                    break;
                case 5:
                    this.ipc.send('snackbar', {
                        message: 'One of your actions have been marked as unfulfillable. Please tell someone.',
                        severity: 'error',
                        icon: 'error'
                    })
            }
        })

        this.ws.on('close', (closeCode, reason) => {
            console.log('Closing for:', reason.toString())
            if (!this.retry && closeCode !== 3000) {
                this.ipc.send('snackbar', {
                    message: 'Websocket connection failed. Retrying connection.',
                    severity: 'error',
                    icon:'wifiOff'
                })
            } 
            delete this.ws
            this.retryTimeout = setTimeout(() => {
                this.retry = true
                this.createWsClient()
            }, 10000)
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

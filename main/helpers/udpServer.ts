import dgram from 'node:dgram'
import EventEmitter from 'node:events';

export default class UDPHandler extends EventEmitter {
    udpServer: dgram.Socket
    private ipc: Electron.WebContents
    constructor(ipc: Electron.WebContents) {
        super()
        this.ipc = ipc
        this.createUdpServer()
    }

    createUdpServer() {
        this.udpServer = dgram.createSocket('udp4')

        this.udpServer.on('error', (err) => {
            this.ipc.send('snackbar', {
                message: `UDP Server error: ${err.stack}`,
                severity: 'error'
            })
            this.udpServer.close()
            this.createUdpServer()
        })

        this.udpServer.on('message', (msg, rinfo) => {
            this.emit('n1mm_qso', msg.toString())
        })

        this.udpServer.on('listening', () => {
            this.ipc.send('snackbar', {
                message: 'UDP server listening for N1MM',
                severity: 'info',
                icon: 'dns'
            })
        })

        this.udpServer.bind(41234, '127.0.0.1')
    }
}

/*
let QSOs = []
// UDP Server
UDPServer.on('error', (err) => {
    console.error(`UDPServer error:\n${err.stack}`);
    UDPServer.close();
});
UDPServer.on('message', (msg, rinfo) => {
    QSOs.push(msg.toString())
    if (QSOs.length > 5) {
        console.log(`Added a QSO to the list - URGENT: The amount of QSOs being stored is currently ${QSOs.length}. This is abnormal. Check if it is turned on in the browser.`)
    } else {
        console.log(`Added a QSO to the list. ${QSOs.length} waiting for pickup.`)
    }
});
UDPServer.on('listening', () => {
    const address = UDPServer.address();
    console.log(`UDP Server listening ${address.address}:${address.port}`);
});
UDPServer.bind(41234, "127.0.0.1");*/
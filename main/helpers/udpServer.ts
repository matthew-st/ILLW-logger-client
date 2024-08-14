import dgram from 'node:dgram'
import EventEmitter from 'node:events';
import { parseStringPromise } from 'xml2js'
export function getBandFromMhz(num) {
    if (!parseFloat(num)) return ""
    num = parseFloat(num)
    switch (num) {
        case num >= 1.8 && num <= 2:
            return "160m"
        case num >= 3.5 && num <= 3.8:
            return "80m"
        case num >= 7 && num <= 7.2:
            return "40m"
        case num >= 10 && num <= 10.15:
            return "30m"
        case num >= 14 && num <= 14.35:
            return "20m"
        case num >= 18.06 && num <= 18.17:
            return "17m"
        case num >= 21 && num <= 21.45:
            return "15m"
        case num >= 24.89 && num <= 24.99:
            return "12m"
        case num >= 28 && num <= 29.7:
            return "10m"
        case num >= 50 && num <= 52:
            return "6m"
        case num >= 70 && num <= 70.5:
            return "4m"
        case num >= 144 && num <= 147:
            return "2m"
        case num >= 420 && num <= 440:
            return "70cm"
    }
}


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

        this.udpServer.on('message', async (msg, rinfo) => {
            const parsed = await parseStringPromise(msg.toString())
            let qso = {
                call: parsed.contactinfo.call[0],
                freq: parseInt(parsed.contactinfo.rxfreq[0]) / 100000,
                band: getBandFromMhz(parsed.contactinfo.band[0]),
                mode: parsed.contactinfo.mode[0],
                time: new Date(parsed.contactinfo.timestamp[0]).valueOf(),
                notes: `${parsed.contactinfo.name[0]}; ${parsed.contactinfo.comment[0]}`,
                rstSent: parseInt(parsed.contactinfo.snt[0]),
                rstRcvd: parseInt(parsed.contactinfo.rcv[0])
            }
            this.emit('n1mm_qso', qso)
        })

        this.udpServer.on('listening', () => {
            this.ipc.send('snackbar', {
                message: 'UDP server listening for N1MM',
                severity: 'info',
                icon: 'dns'
            })
        })

        this.udpServer.bind(41234, '0.0.0.0')
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
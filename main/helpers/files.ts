import { App } from "electron";
import { existsSync, readFile, readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface QSO {
    id?: number
    call: String,
    freq: number,
    band: String,
    mode: String
    time: number
    notes?: String
    operatorCall: String
    rstSent: number
    rstRcvd: number
    emailed?: boolean
}

export default class FileHandler {
    private _path: string
    config: ConfigHandler
    qsos: QSOHandler
    constructor(app: App) {
        this._path = app.getPath('userData')
        if(!existsSync(join(this._path, '/config.json'))) {
            writeFileSync(join(this._path, '/config.json'), JSON.stringify({}))
        }
        if(!existsSync(join(this._path, '/qsos.json'))) {
            writeFileSync(join(this._path, '/qsos.json'), JSON.stringify({}))
        }
        this.config = new ConfigHandler(this._path)
        this.qsos = new QSOHandler(this._path)
    }
}

export class ConfigHandler {
    private _path: string
    constructor(path) {
        this._path = path
    }
    get(key: string) {
        const config = this._rawConfig()
        return config[key]
    }

    set(key, value) {
        const config = this._rawConfig()
        config[key] = value
        writeFileSync(join(this._path, '/config.json'), JSON.stringify(config))
    }
    private _rawConfig(): object {
        return JSON.parse(readFileSync(join(this._path, '/config.json')).toString())
    }
}

export class QSOHandler {
    private _path: string
    constructor(path) {
        this._path = path
    }

    get() {
        return this._allQsos()
    }

    add(qso: QSO) {
        let qsos = this._allQsos()
        qsos.push(qso)
        this.set(qsos)
    }

    set(qsos: Array<QSO>) {
        writeFileSync(join(this._path, '/qsos.json'), JSON.stringify(qsos))
    }

    private _allQsos(): Array<QSO> {
        return JSON.parse(readFileSync(join(this._path, '/qsos.json')).toString())
    }
}
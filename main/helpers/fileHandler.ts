import { App } from "electron";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export interface QSO {
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

export interface Action {
    type: string,
    qso: QSO,
    opCall: string,
    opId: string,
    fulfilled?: boolean
}

export default class FileHandler {
    private _path: string
    config: ConfigHandler
    actions: ActionHandler
    constructor(app: App) {
        this._path = app.getPath('userData')
        if(!existsSync(join(this._path, '/config.json'))) {
            writeFileSync(join(this._path, '/config.json'), JSON.stringify({}))
        }
        if(!existsSync(join(this._path, '/actions.json'))) {
            writeFileSync(join(this._path, '/actions.json'), JSON.stringify([]))
        }
        this.config = new ConfigHandler(this._path)
        this.actions = new ActionHandler(this._path)
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

export class ActionHandler {
    private _path: string
    constructor(path) {
        this._path = path
    }

    get() {
        return this._allActions()
    }

    add(action: Action) {
        let actions = this._allActions()
        action.fulfilled = false
        actions.push(action)
        this.set(actions)
    }

    actionFulfilled(actionId: string) {
        let actions = this._allActions()
        let idx = actions.findIndex((val) => {val.opId == actionId})
        if (idx == -1) { return }
        actions[idx].fulfilled = true
        this.set(actions)
    }

    set(qsos: Array<Action>) {
        writeFileSync(join(this._path, '/actions.json'), JSON.stringify(qsos))
    }

    private _allActions(): Array<Action> {
        return JSON.parse(readFileSync(join(this._path, '/actions.json')).toString())
    }
}
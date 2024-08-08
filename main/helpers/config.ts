import { App } from "electron";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export default class ConfigHandler {
    private _path: string
    constructor(app: App) {
        this._path = app.getPath('userData')
        if(!existsSync(join(this._path, '/config.json'))) {
            writeFileSync(join(this._path, '/config.json'), JSON.stringify({}))
        }
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

    _rawConfig(): object {
        return JSON.parse(readFileSync(join(this._path, '/config.json')).toString())
    }
}
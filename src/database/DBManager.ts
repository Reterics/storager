import {DBManagerOptions, DBType} from "../interfaces/db.ts";


export default class DBManager {
    private _type: DBType;
    constructor(options?: DBManagerOptions) {
        this._type = options?.db || this.detectConfig();
    }

    detectConfig():DBType {
        if (!import.meta.env.VITE_FIREBASE_APIKEY) {
            console.warn('There is no Firebase APIKey found, fallback to SQL');
            return 'sql'
        }
        return 'firebase'
    }
}

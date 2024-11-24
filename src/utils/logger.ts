

export default class STLogger {
    private _logs: string[];
    protected _timeout: NodeJS.Timeout | undefined;
    _styles: { INFO: { labelStyle: string; messageStyle: string; }; WARN: { labelStyle: string; messageStyle: string; }; ERROR: { labelStyle: string; messageStyle: string; }; };
    private readonly _consoleLog: (...data: string[]) => void;
    private readonly _consoleError: (...data: string[]) => void;
    private readonly _consoleWarn: (...data: string[]) => void;

    constructor() {
        this._logs = [];
        this._styles = {
            INFO: {
                labelStyle: 'color: white; background-color: gray; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
                messageStyle: 'color: lightgray;',
            },
            WARN: {
                labelStyle: 'color: black; background-color: #FFECB3; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
                messageStyle: 'color: #FFB300;',
            },
            ERROR: {
                labelStyle: 'color: #9c2323; background-color: #FFCDD2; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
                messageStyle: 'color: #D32F2F;',
            },
        };

        // Rerouting console logs
        this._consoleLog = console.log;
        this._consoleError = console.error;
        this._consoleWarn = console.warn;

        console.log(
            `%c StorageR v${import.meta.env.PACKAGE_VERSION} `,
            `
            color: white;
            background-color: gray;
            font-size: 20px;
            font-weight: bold;
            padding: 10px 20px;
            border-radius: 5px;
            text-align: center;
        `
        );

        console.log = this.log.bind(this);
        console.error = this.error.bind(this);
        console.warn = this.warn.bind(this);

        this.load();
    }

    private load() {
        try {
            const lStorageData = localStorage.getItem('logs') || '[]';
            const logs = JSON.parse(lStorageData);
            if (Array.isArray(logs)) {
                this._logs = logs.filter(log => typeof log === 'string');
            }
        } catch (e) {
            console.error(e);
        }
    }

    private save() {
        localStorage.setItem('logs', JSON.stringify(this._logs));
    }

    sync(ms = 2000) {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        this._timeout = setTimeout(()=> this.save(), ms);
    }

    protected printLog(timestamp: string, type: 'INFO'|'ERROR'|'WARN', message: string) {
        const style = this._styles[type];

        switch (type) {
            case 'ERROR':
                this._consoleError(
                    `%c${timestamp} %c${type}%c ${message}`,
                    'color: gray; font-weight: bold;',
                    style.labelStyle,
                    style.messageStyle
                );
                break;
            case 'WARN':
                this._consoleWarn(
                    `%c${timestamp} %c${type}%c ${message}`,
                    'color: gray; font-weight: bold;',
                    style.labelStyle,
                    style.messageStyle
                );
                break;
            default:
                this._consoleLog(
                    `%c${timestamp} %c${type}%c ${message}`,
                    'color: gray; font-weight: bold;',
                    style.labelStyle,
                    style.messageStyle
                );
        }

    }

    protected appendLog(log: string) {
        this._logs.push(log);

        if (this._logs.length > 100) {
            this._logs.shift();
        }
    }

    protected getTimestamp() {
        return new Date().toISOString().substring(5)
    }

    log(...args: string[]) {
        const message = args.join(', ');
        const timestamp = this.getTimestamp();
        const type = 'INFO'

        this.appendLog(`${timestamp} ${type}: ${message}`);

        this.printLog(timestamp, type, message);
    }

    error(...args: string[]) {
        const message = args.join(', ');
        const timestamp = this.getTimestamp();
        const type = 'ERROR'

        this.appendLog(`${timestamp} ${type}: ${message}`);

        this.printLog(timestamp, type, message);
    }

    warn(...args: string[]) {
        const message = args.join(', ');
        const timestamp = this.getTimestamp();
        const type = 'WARN'

        this.appendLog(`${timestamp} ${type}: ${message}`);

        this.printLog(timestamp, type, message);
    }
}

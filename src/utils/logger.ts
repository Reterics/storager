export default class STLogger {
  private _logs: string[];
  protected _syncTimeout: NodeJS.Timeout | undefined;
  protected _repeatTimeout: NodeJS.Timeout | undefined;
  _styles: {
    INFO: { labelStyle: string; messageStyle: string };
    WARN: { labelStyle: string; messageStyle: string };
    ERROR: { labelStyle: string; messageStyle: string };
  };
  private readonly _consoleLog: (...data: string[] | object[]) => void;
  private readonly _consoleError: (...data: string[] | object[]) => void;
  private readonly _consoleWarn: (...data: string[] | object[]) => void;

  constructor() {
    this._syncTimeout = undefined;
    this._logs = [];
    this._styles = {
      INFO: {
        labelStyle:
          'color: white; background-color: #353535; padding: 2px 4px; border-radius: 1px; font-weight: 400;',
        messageStyle: 'color: lightgray;',
      },
      WARN: {
        labelStyle:
          'color: black; background-color: #FFECB3; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
        messageStyle: 'color: #FFB300;',
      },
      ERROR: {
        labelStyle:
          'color: #9c2323; background-color: #FFCDD2; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
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
        `,
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
        this._logs = logs.filter((log) => typeof log === 'string');
      }
    } catch (e) {
      console.error(e);
    }
  }

  private save() {
    localStorage.setItem('logs', JSON.stringify(this._logs));
  }

  sync(ms = 2000) {
    if (this._syncTimeout) {
      clearTimeout(this._syncTimeout);
    }
    this._syncTimeout = setTimeout(() => this.save(), ms);
  }

  protected printLog(
    timestamp: string,
    type: 'INFO' | 'ERROR' | 'WARN',
    message: string,
    callerInfo?: string,
  ) {
    const style = this._styles[type];

    switch (type) {
      case 'ERROR':
        this._consoleError(
          `%c${timestamp} %c${type}%c ${message}\n${
            new Error().stack?.split('\n')[3]
          }`,
          'color: gray; font-weight: bold;',
          style.labelStyle,
          style.messageStyle,
        );
        break;
      case 'WARN':
        this._consoleWarn(
          `%c${timestamp} %c${type}%c ${message}`,
          'color: gray; font-weight: bold;',
          style.labelStyle,
          style.messageStyle,
        );
        break;
      default:
        this._consoleLog(
          `%c${timestamp} %c${callerInfo || ''}%c ${message} ${!callerInfo ? new Error().stack?.split('\n')[3] : ''}`,
          'color: gray; font-weight: bold;',
          style.labelStyle,
          style.messageStyle,
        );
    }
  }

  protected isSameWithLastN(log: string) {
    let i = 1;
    while (this._logs[this._logs.length - i] === log) {
      i++;
    }
    return i - 1;
  }

  protected appendLog(log: string) {
    this._logs.push(log);

    if (this._logs.length > 100) {
      this._logs.shift();
    }
  }

  protected getTimestamp() {
    const iso = new Date().toISOString();
    return `[${iso.substring(5, 10)} ${iso.substring(11, 19)}]`;
  }

  protected getCallerInfo(): string {
    const err = new Error();
    const stack = err.stack?.split('\n');

    if (stack && stack.length >= 4) {
      const msg = stack[3].trim();
      return msg.substring(msg.lastIndexOf('/') + 1, msg.length - 1);
    }
    return 'unknown';
  }

  log(...args: string[]) {
    const objs: object[] = [];
    const message = args
      .filter((a) => {
        if (typeof a === 'object') {
          objs.push(a);
          return false;
        }
        return true;
      })
      .join(', ');
    const timestamp = this.getTimestamp();
    const type = 'INFO';
    const sameWithLast = this.isSameWithLastN(
      `${timestamp} ${type}: ${message}`,
    );

    this.appendLog(`${timestamp} ${type}: ${message}`);

    if (sameWithLast) {
      const stack =
        sameWithLast < 3
          ? new Error().stack?.split('\n')[2 + sameWithLast]
          : '';
      if (!stack) {
        if (this._repeatTimeout) {
          clearTimeout(this._repeatTimeout);
        }
        this._repeatTimeout = setTimeout(() => {
          this._consoleLog('+' + sameWithLast + ' for ' + message);
        }, 20);
      } else {
        this._consoleLog('+' + sameWithLast + (stack || ''));
      }
    } else {
      this.printLog(timestamp, type, message, this.getCallerInfo());
    }

    if (objs.length) {
      this._consoleLog(...objs);
    }
  }

  error(...args: string[]) {
    const objs: object[] = [];
    const message = args
      .filter((a) => {
        if (typeof a === 'object') {
          objs.push(a);
          return false;
        }
        return true;
      })
      .join(', ');
    const timestamp = this.getTimestamp();
    const type = 'ERROR';
    const callerInfo = this.getCallerInfo();

    this.appendLog(`${timestamp} ${type}: ${message}`);

    this.printLog(timestamp, type, message, callerInfo);
    if (objs.length) {
      this._consoleError(...objs);
    }
  }

  warn(...args: string[]) {
    const objs: object[] = [];
    const message = args
      .filter((a) => {
        if (typeof a === 'object') {
          objs.push(a);
          return false;
        }
        return true;
      })
      .join(', ');
    const timestamp = this.getTimestamp();
    const type = 'WARN';
    const callerInfo = this.getCallerInfo();

    this.appendLog(`${timestamp} ${type}: ${message}`);

    this.printLog(timestamp, type, message, callerInfo);
    if (objs.length) {
      this._consoleWarn(...objs);
    }
  }
}

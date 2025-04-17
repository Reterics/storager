import {loadFromIndexedDB, saveToIndexedDB} from '../../utils/indexedDB.ts';
import {CommonCollectionData} from '../../interfaces/firebase.ts';

export interface BackupData {
  id: string;
  updated: number;
  [p: string]: string | number | boolean | undefined | CommonCollectionData[];
}

export default class BackupDBModel {
  protected _backup: BackupData[];

  constructor() {
    this._backup = [];
  }

  async loadPersisted() {
    let backup;
    try {
      backup = (
        (await loadFromIndexedDB('backup')) as CommonCollectionData[]
      ).map((item) => {
        return {
          ...item,
          /*shops: JSON.parse(atob(item.shops as string)),
                        items: JSON.parse(atob(item.items as string)),
                        parts: JSON.parse(atob(item.parts as string)),
                        services: JSON.parse(atob(item.services as string)),
                        completions: JSON.parse(atob(item.completions as string)),*/
        };
      }) as unknown as BackupData[];
    } catch (e) {
      console.error(e);
    }

    if (backup) {
      this._backup = backup;
    }
  }

  async savePersisted() {
    try {
      await saveToIndexedDB(
        'backup',
        this._backup.map((item) => {
          return {
            ...item,
            /*shops: btoa(JSON.stringify(item.shops)),
                        items: btoa(JSON.stringify(item.items)),
                        parts: btoa(JSON.stringify(item.parts)),
                        services: btoa(JSON.stringify(item.services)),
                        completions: btoa(JSON.stringify(item.completions)),*/
          };
        }) as CommonCollectionData[]
      );
    } catch (e) {
      console.error(e);
    }
  }

  async add() {
    // Access to the latest state:

    let backup;
    try {
      backup = {
        id: (this._backup.length + 1).toString(),
        key: this._backup.length + 1,
        updated: new Date().getTime(),
        shops: (await loadFromIndexedDB('shops')) as CommonCollectionData[],
        items: (await loadFromIndexedDB('items')) as CommonCollectionData[],
        parts: (await loadFromIndexedDB('parts')) as CommonCollectionData[],
        services: (await loadFromIndexedDB(
          'services'
        )) as CommonCollectionData[],
        completions: (await loadFromIndexedDB(
          'completions'
        )) as CommonCollectionData[],
      };
    } catch (e) {
      console.error(e);
    }

    if (backup) {
      this._backup.push(backup);
      await this.savePersisted();
    }
    return this._backup;
  }

  getAll() {
    return this._backup;
  }

  async remove(id: string) {
    const index = this._backup.findIndex((item) => item.id === id);
    if (index !== -1) {
      this._backup.splice(index, 1);
      await this.savePersisted();
    }
    return this._backup;
  }
}

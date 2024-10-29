import React from "react";
import {CommonCollectionData, KVCollectionStore, TTLData} from "../interfaces/firebase.ts";


export default abstract class DBModel {
    protected _cache: KVCollectionStore;
    protected _ttl: TTLData;
    protected _mtime: TTLData;
    private _timeout: NodeJS.Timeout | undefined;

    protected constructor(options?: {ttl?: TTLData, mtime?: TTLData}) {
        this._cache = {};
        this._ttl = (options && options.ttl) ? options.ttl : {};
        this._mtime = (options && options.mtime) ? options.mtime : {};
    }

    loadPersisted() {
        let cache,
            ttl,
            mtime;
        try {
            cache = JSON.parse(localStorage.getItem("storager_persisted") || '{}');
            ttl = JSON.parse(localStorage.getItem("storager_ttl") || 'null');
            mtime = JSON.parse(localStorage.getItem("storager_mtime") || 'null');
        } catch (e) {
            console.error(e);
        }
        if (cache) {
            this._cache = cache;
        }
        if (ttl) {
            this._ttl = ttl;
        }
        if (mtime) {
            this._mtime = mtime;
        }
    }

    savePersisted() {
        localStorage.setItem("storager_persisted", JSON.stringify(this._cache));
        localStorage.setItem("storager_ttl", JSON.stringify(this._ttl));
        localStorage.setItem("storager_mtime", JSON.stringify(this._mtime));
    }

    sync(ms = 5000) {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        this._timeout = setTimeout(()=> {
            this.savePersisted();
        }, ms);
    }

    setTTL(table: string, ttl: number) {
        this._ttl[table] = ttl;
    }

    updateMTime(table:string) {
        this._mtime[table] = new Date().getTime();
    }

    isExpired(table:string) {
        if (!this._ttl[table]) {
            return false;
        }
        if (!this._mtime[table]) {
            this.updateMTime(table);
            return false;
        }
        const now = new Date().getTime();
        return now - this._ttl[table] > this._mtime[table];
    }

    authProvider?: ({children}: { children: React.ReactNode }) => Element

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAll(table: string): Promise<unknown[]> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get(id: string, table: string): Promise<unknown> {
        return Promise.resolve(null);
    }

    updateCache(table: string, collection: CommonCollectionData[]) {
        this._cache[table] = collection;
        this.updateMTime(table);
    }

    updateCachedEntry(id: string, table: string, data: CommonCollectionData) {
        const cachedEntryIndex = this.getCachedEntryIndex(id, table);

        if (cachedEntryIndex !== -1) {
            this._cache[table][cachedEntryIndex] = Object.assign(this._cache[table][cachedEntryIndex], data);
            this.updateMTime(table);
        }
    }

    removeCachedEntry(id: string, table: string) {
        const cachedEntryIndex = this.getCachedEntryIndex(id, table);

        if (cachedEntryIndex !== -1) {
            this._cache[table] = this._cache[table].splice(cachedEntryIndex, 1);
        }
        this.updateMTime(table);
    }

    appendCachedEntry(table: string, data: CommonCollectionData) {
        const collection = this.getCached(table);
        if (collection) {
            collection.push(data);
        }
        this.updateMTime(table);
    }

    invalidateCache(table: string) {
        delete this._cache[table];
    }

    getCached(table: string) {
        if (this.isExpired(table)) {
            console.log(table + ' is expired');
            this.invalidateCache(table);
        }
        console.log(this._cache[table] ? table + '  has cache' : ' has no cache');
        return this._cache[table];
    }

    getCachedEntry(id: string, table: string) {
        const cached = this.getCached(table);
        if (!cached) {
            return;
        }
        return cached.find(entry => entry.id === id);
    }

    getCachedEntryIndex(id: string, table: string) {
        const cached = this.getCached(table);
        if (!cached) {
            return -1;
        }
        return cached.findIndex(entry => entry.id === id);
    }
}

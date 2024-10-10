import React from "react";
import {CommonCollectionData, KVCollectionStore} from "../interfaces/firebase.ts";


export default abstract class DBModel {
    protected _cache: KVCollectionStore;

    protected constructor() {
        this._cache = {};
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
    }

    updateCachedEntry(id: string, table: string, data: CommonCollectionData) {
        const cachedEntryIndex = this.getCachedEntryIndex(id, table);

        if (cachedEntryIndex !== -1) {
            this._cache[table][cachedEntryIndex] = Object.assign(this._cache[table][cachedEntryIndex], data);
        }
    }

    removeCachedEntry(id: string, table: string) {
        const cachedEntryIndex = this.getCachedEntryIndex(id, table);

        if (cachedEntryIndex !== -1) {
            this._cache[table] = this._cache[table].splice(cachedEntryIndex, 1);
        }
    }

    appendCachedEntry(table: string, data: CommonCollectionData) {
        const collection = this.getCached(table);
        if (collection) {
            collection.push(data);
        }
    }

    invalidateCache(table: string) {
        delete this._cache[table];
    }

    getCached(table: string) {
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

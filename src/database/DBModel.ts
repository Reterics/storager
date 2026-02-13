import type {
  CommonCollectionData,
  KVCollectionStore,
  TTLData,
} from '../interfaces/firebase.ts';
import { loadFromIndexedDB, saveToIndexedDB } from '../utils/indexedDB.ts';

export default abstract class DBModel {
  protected _cache: KVCollectionStore;
  protected _ttl: TTLData;
  protected _mtime: TTLData;
  protected _timeout: NodeJS.Timeout | undefined;
  private _initialLoadDone = false;
  private _beforeUnloadBound = false;

  protected constructor(options?: { ttl?: TTLData; mtime?: TTLData }) {
    this._cache = {};
    this._ttl = options && options.ttl ? options.ttl : {};
    this._mtime = options && options.mtime ? options.mtime : {};
    this._bindBeforeUnload();
  }

  private _bindBeforeUnload() {
    if (
      this._beforeUnloadBound ||
      typeof window === 'undefined' ||
      typeof navigator === 'undefined'
    ) {
      return;
    }
    this._beforeUnloadBound = true;
    window.addEventListener('beforeunload', () => {
      // Best-effort only: browsers may kill the page before async IndexedDB writes finish.
      // The primary persistence mechanism is sync() which debounces savePersisted() after
      // every cache mutation. This handler is a last-resort attempt for unsaved changes
      // (e.g. data fetched just before the user closes the tab).
      void this.savePersisted();
    });
  }

  async loadPersisted() {
    let cache, ttl, mtime;
    try {
      cache = {
        shops: (await loadFromIndexedDB('shops')) as CommonCollectionData[],
        items: (await loadFromIndexedDB('items')) as CommonCollectionData[],
        parts: (await loadFromIndexedDB('parts')) as CommonCollectionData[],
        services: (await loadFromIndexedDB(
          'services',
        )) as CommonCollectionData[],
        completions: (await loadFromIndexedDB(
          'completions',
        )) as CommonCollectionData[],
        settings: (await loadFromIndexedDB(
          'settings',
        )) as CommonCollectionData[],
        users: (await loadFromIndexedDB('users')) as CommonCollectionData[],
        archive: (await loadFromIndexedDB('archive')) as CommonCollectionData[],
        types: (await loadFromIndexedDB('types')) as CommonCollectionData[],
        deleted: (await loadFromIndexedDB('deleted')) as CommonCollectionData[],
        leases: (await loadFromIndexedDB('leases')) as CommonCollectionData[],
        leaseCompletions: (await loadFromIndexedDB(
          'leaseCompletions',
        )) as CommonCollectionData[],
        logs: (await loadFromIndexedDB('logs')) as CommonCollectionData[],
        invoices: (await loadFromIndexedDB(
          'invoices',
        )) as CommonCollectionData[],
        transactions: (await loadFromIndexedDB(
          'transactions',
        )) as CommonCollectionData[],
      };
      ttl = (await loadFromIndexedDB('ttl')) as TTLData;
      mtime = (await loadFromIndexedDB('mtime')) as TTLData;
    } catch (e) {
      console.error(e);
    }

    if (cache && cache.users && cache.settings && cache.users.length) {
      this._cache = cache;
    }
    if (ttl) {
      this._ttl = Object.assign(ttl, this._ttl);
    }
    if (mtime) {
      this._mtime = mtime;
    }
  }

  async savePersisted() {
    try {
      await saveToIndexedDB('shops', this._cache['shops']);
      await saveToIndexedDB('items', this._cache['items']);
      await saveToIndexedDB('parts', this._cache['parts']);
      await saveToIndexedDB('services', this._cache['services']);
      await saveToIndexedDB('completions', this._cache['completions']);
      await saveToIndexedDB('settings', this._cache['settings']);
      await saveToIndexedDB('users', this._cache['users']);
      await saveToIndexedDB('archive', this._cache['archive']);
      await saveToIndexedDB('types', this._cache['types']);
      await saveToIndexedDB('deleted', this._cache['deleted']);
      await saveToIndexedDB('leases', this._cache['leases']);
      await saveToIndexedDB(
        'leaseCompletions',
        this._cache['leaseCompletions'],
      );
      await saveToIndexedDB('logs', this._cache['logs']);
      await saveToIndexedDB('invoices', this._cache['invoices']);
      await saveToIndexedDB('transactions', this._cache['transactions']);
      await saveToIndexedDB('ttl', this._ttl);
      await saveToIndexedDB('mtime', this._mtime);
    } catch (e) {
      console.error(e);
    }
  }

  sync(ms = 5000) {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }

    // On first load, persist immediately so a quick refresh doesn't lose the cache
    if (!this._initialLoadDone) {
      this._initialLoadDone = true;
      void this.savePersisted();
      return;
    }

    this._timeout = setTimeout(() => {
      void this.savePersisted();
    }, ms);
  }

  setTTL(table: string, ttl: number) {
    this._ttl[table] = ttl;
  }

  updateMTime(table: string) {
    this._mtime[table] = new Date().getTime();
  }

  getMTime(table: string) {
    return this._mtime[table] || 0;
  }

  isExpired(table: string) {
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
      this._cache[table][cachedEntryIndex] = Object.assign(
        this._cache[table][cachedEntryIndex],
        data,
      );
    } else {
      if (!this._cache[table]) {
        this._cache[table] = [];
      }
      this._cache[table].push(data);
    }
    this.updateMTime(table);
  }

  removeCachedEntry(id: string, table: string) {
    const cachedEntryIndex = this.getCachedEntryIndex(id, table);
    if (cachedEntryIndex !== -1) {
      this._cache[table].splice(cachedEntryIndex, 1);
    }
    this.updateMTime(table);
  }

  appendCachedEntry(table: string, data: CommonCollectionData) {
    const collection = this.getCached(table);
    if (collection) {
      collection.push(data);
    } else if (Array.isArray(this._cache[table])) {
      this._cache[table].push(data);
    } else {
      this._cache[table] = [data];
    }
    this.updateMTime(table);
  }

  invalidateCache(table: string) {
    delete this._cache[table];
    delete this._mtime[table];
  }

  getCached(table: string) {
    if (this.isExpired(table)) {
      console.log(table + ' is expired');
      this.invalidateCache(table);
    }
    if (
      this._cache[table] &&
      (!Array.isArray(this._cache[table]) || this._cache[table].length)
    ) {
      console.log(table + ' has cache');
      return this._cache[table];
    }
    console.log(table + ' has no cache');
    return null;
  }

  getCachedEntry(id: string, table: string) {
    const cached = this.getCached(table);
    if (!cached) {
      return;
    }
    return cached.find((entry) => entry.id === id);
  }

  getCachedEntryIndex(id: string, table: string) {
    const cached = this.getCached(table);
    if (!cached) {
      return -1;
    }
    return cached.findIndex((entry) => entry.id === id);
  }
}

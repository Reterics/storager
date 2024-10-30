// Open or create the database
import {CommonCollectionData, TTLData} from "../interfaces/firebase.ts";

export function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('storagerDB', 1);

        request.onupgradeneeded = function(event: IDBVersionChangeEvent) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const db = event.target?.result;
            db.createObjectStore('shops', { keyPath: 'key', autoIncrement: true });
            db.createObjectStore('items', { keyPath: 'key', autoIncrement: true });
            db.createObjectStore('parts', { keyPath: 'key', autoIncrement: true });
            db.createObjectStore('services', { keyPath: 'key', autoIncrement: true });
            db.createObjectStore('completions', { keyPath: 'key', autoIncrement: true });
            db.createObjectStore('settings', { keyPath: 'key', autoIncrement: true });
            db.createObjectStore('users', { keyPath: 'key', autoIncrement: true });
            db.createObjectStore('archive', { keyPath: 'key', autoIncrement: true });
            db.createObjectStore('types', { keyPath: 'key', autoIncrement: true });
            db.createObjectStore('mtime', { keyPath: 'key', autoIncrement: true });
            db.createObjectStore('ttl', { keyPath: 'key', autoIncrement: true });
        };

        request.onsuccess = function(event) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            resolve(event.target?.result as IDBDatabase);
        };

        request.onerror = function(event) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            reject(event.target?.error);
        };
    });
}

// Save data to IndexedDB
export async function saveToIndexedDB(key: string, data: CommonCollectionData[]|TTLData) {
    const db = await openDatabase();
    return await new Promise<void>((resolve, reject) => {
        if (!data || !key) {
            return resolve();
        }
        const transaction = db.transaction([key], 'readwrite');
        const store = transaction.objectStore(key);

        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
            if (Array.isArray(data)) {
                data.forEach(item => {
                    const request = store.put(item);

                    request.onerror = function (event) {
                        console.error('Error storing item:', (event.target as IDBRequest).error, item);
                        // Optionally handle individual item errors
                    };
                });
            } else if (data) {
                const request = store.put({...data, key: key});

                request.onerror = function (event) {
                    console.error('Error storing item:', (event.target as IDBRequest).error);
                    // Optionally handle individual item errors
                };
            } else {
                console.error(key, data);
            }
        };


        clearRequest.onerror = (event: Event) => {
            const error = (event.target as IDBRequest).error;
            console.error('Error clearing the store:', error);
            reject(error);
        };

        transaction.oncomplete = function () {
            resolve();
        };

        transaction.onerror = function (event) {
            const error = (event.target as IDBTransaction).error;
            reject(error);
        };
    });
}

// Load data from IndexedDB
export async function loadFromIndexedDB(key: string) {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
        const transaction = db.transaction([key], 'readonly');
        const store = transaction.objectStore(key);
        const request = (key !== 'mtime' && key !== 'ttl') ? store.getAll() : store.get(key);

        request.onsuccess = function (event) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const result_1 = event.target?.result;
            resolve(result_1 ? result_1 : null);
        };

        request.onerror = function (event_1) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            reject(event_1.target?.error);
        };
    });
}

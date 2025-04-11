import DBModel from "../DBModel.ts";
import {FirebaseApp, initializeApp} from "firebase/app";
import {
    collection,
    getFirestore,
    query,
    Firestore,
    doc,
    getDoc,
    setDoc,
    addDoc,
    getDocs,
    where,
    deleteDoc,
    writeBatch
} from "firebase/firestore";
import {CommonCollectionData, ContextDataValueType, TTLData} from "../../interfaces/firebase.ts";
import {User} from "firebase/auth";
import {DeviceDebugInfo, getChangedFields, getDeviceDebugInfo} from "../../utils/data.ts";
import {getClientInfo} from "../../utils/general.ts";
import {GeneralCollectionEntry} from "../../interfaces/interfaces.ts";

type operationType = 'remove'|'restore'|'removePermanent'|'update'|'updateAll'|'add'


export interface LogEntry extends GeneralCollectionEntry {
    id: string;
    entity?: string;
    action?: operationType;
    uid?: string;
    email?: string;
    at?: number;
    item_id?: string;
    changes?: Record<string, unknown>;
    device_type?: string;
    user_agent?: string;
    shop_id?: string[];
    error?: string;
    device_info?: DeviceDebugInfo;
}

export default class FirebaseDBModel extends DBModel {
    protected _app: FirebaseApp;
    protected _db: Firestore;
    protected _storageLogs: boolean;
    protected _collectionsToLog: string[];
    protected _user: User | null | undefined;
    protected _logFailCount: number;
    protected _shopId: string | undefined;

    constructor(options?: {ttl?: TTLData, mtime?: TTLData, storageLogs?: boolean, collectionsToLog?: string[]}) {
        super(options);
        this._app = initializeApp({
            apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
            measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
        });
        this._db = getFirestore(this._app);
        this._storageLogs = !!options?.storageLogs;
        this._collectionsToLog = options?.collectionsToLog || [];
        this._logFailCount = 0;
    }


    setUser(user: User | null | undefined) {
        this._user = user;
    }

    setShopId(id?: string) {
        this._shopId = id;
    }

    logCatch(e: Error) {
        console.error('Failed to log error: ', e);
        this._logFailCount++;

        if (this._logFailCount > 5) {
            console.warn('Failed to log 5 times **in** a row. Logs are disabled');
            this._storageLogs = false;
        }
    }

    async log(opType: operationType, table: string, id?: string, item?: CommonCollectionData, error?: string) {
        if (!this._storageLogs || !this._collectionsToLog.includes(table)) {
            // Logging is disabled for this type
            return;
        }

        const oldItem = item ? this.getCachedEntry(id || item.id, table) : undefined;

        let changes: Record<string, unknown> = {};
        if (opType !== 'add' && oldItem && item) {
            changes = getChangedFields(oldItem, item);
            delete changes.docUpdated;
        } else if (opType === 'add' && error && item) {
            changes = item;
        }

        const clientInfo = getClientInfo();

        const logEntry: Partial<LogEntry> = {
            entity: `${table}/${id}`,
            action: opType,
            uid: this._user?.uid || 'unknown uid',
            email: this._user?.email || 'unknown email',
            device_type: clientInfo.deviceType,
            user_agent: clientInfo.userAgent,
            at: Date.now(),
            item_id: id,
            changes: changes
        }

        if (this._shopId) {
            logEntry.shop_id = [this._shopId];
        }
        if (error) {
            logEntry.error = error
            logEntry.device_info = getDeviceDebugInfo();
        }

        const modelRef = await addDoc(collection(this._db, 'logs'), logEntry)
            .catch((e) => this.logCatch(e));

        if (modelRef) {
            this._logFailCount = 0;
        }
    }

    getApp() {
        return this._app;
    }

    getDB() {
        return this._db;
    }

    async getAll(table: string, force?: boolean): Promise<CommonCollectionData[]> {
        let after = force ? 0 : this.getMTime(table);
        const now = new Date().getTime();
        const five = 5000;
        const cached = this.getCached(table);

        // Inside 5 seconds timeframe we have purely the cache
        if (cached && now - five <= after) {
            return cached;
        }
        if (!cached) {
            // If there is no cache, then we need all data
            after = 0;
        }
        // There is no deleted table in DB
        if (table === 'deleted') {
            return cached || [];
        }
        const receivedData: CommonCollectionData[] = cached || [];

        try {
            // Apply a condition to only get documents where docUpdated > after the last cache modification
            console.log('Get update for ' + table + ' after ' + new Date(after).toISOString().split('T')[0]);
            const q = after
                ? query(collection(this._db, table), where("docUpdated", ">", after))
                : query(collection(this._db, table));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
                const indexOf = receivedData.findIndex(data => data.id === doc.id);
                const data = doc.data()
                if (data && !data.deleted) {
                    if (indexOf !== -1) {
                        receivedData[indexOf] = {...data, id: doc.id}
                    } else {
                        receivedData.push({...data, id: doc.id});
                    }
                } else if (data?.deleted && indexOf !== -1) {
                    this.updateCachedEntry(doc.id, 'deleted', {...data, id: doc.id});
                    receivedData.splice(indexOf, 1);
                } else if (data?.deleted) {
                    this.appendCachedEntry('deleted', {...data, id: doc.id});
                }
            });
            this.updateCache(table, receivedData);
            this.sync();
            return receivedData;
        } catch (error) {
            console.error('Error happened during Firebase connection: ', error);
            return [];
        }
    }

    async get(id: string, table: string): Promise<unknown> {
        const docRef = doc(this._db, table, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            this.updateCachedEntry(id, table, data as CommonCollectionData);
            return data;
        }
        return null;
    }

    async remove(id: string, table: string): Promise<void> {
        const cached = this.getCachedEntry(id, table);
        // There must be a cached entry, otherwise we would not show it in UI
        if (cached) {
            const modelRef = doc(this._db, table, id);
            cached.deleted = true;
            cached.docUpdated = new Date().getTime();
            cached.docType = table;
            Object.keys(cached).forEach(key => {
                if (cached[key] === undefined) {
                    delete cached[key];
                }
            });
            await setDoc(modelRef, cached, { merge: true }).catch(e => {
                console.error(e);
            });
            this.updateCachedEntry(id, 'deleted', {...cached, id});
            this.removeCachedEntry(id, table);
            this.sync();
        } else {
            // Data is not available anymore (ui error or multiple function calls)
        }
    }

    async restore(id: string): Promise<boolean> {
        /*if (this._storageLogs) {
            return !!(await this.removePermanent(id));
        }*/
        const cached = this.getCachedEntry(id, 'deleted');
        // There must be a cached entry, otherwise we would not show it in UI
        if (cached) {
            const target = cached.docType as string;
            if (!target) {
                return false;
            }
            const modelRef = doc(this._db, target, id);
            cached.deleted = false;
            cached.docUpdated = new Date().getTime();
            await setDoc(modelRef, cached, { merge: true }).catch(e => {
                console.error(e);
            });
            this.updateCachedEntry(id, target, {...cached, id});
            this.removeCachedEntry(id, 'deleted');
            this.sync();
            return true;
        } else {
            return false;
            // Data is not available anymore (ui error or multiple function calls)
        }
    }

    async removePermanent(id: string): Promise<ContextDataValueType[] | null> {
        const cached = this.getCachedEntry(id, 'deleted');
        if (cached && cached.docType) {
            await deleteDoc(doc(this._db, cached.docType as string, id));
            this.removeCachedEntry(id, 'deleted');
        }
        if (cached && !cached.docType) {
            console.error('Failed to determine document type');
        }
        // Keep sync here to make sure the data is persisted
        this.sync();
        return this.getAll('deleted');
    }

    async update(item: ContextDataValueType, table: string): Promise<void> {
        if (!item) {
            void this.log('update', table, undefined, undefined, 'Empty item')
            return;
        }

        let modelRef;
        let imageCache;
        let error;

        if (item && item.id) {
            // If item has an ID, update the existing document
            modelRef = doc(this._db, table, item.id as string);

            if ("image" in item && item.image && (item.image as string).startsWith('https://firebase')) {
                imageCache = item.image;
                delete item.image;
            }
        } else {
            // Generate a new document reference with an auto-generated ID
            modelRef = doc(collection(this._db, table));
            item.id = modelRef.id; // Assign the generated ID to your item
        }

        if (item) {
            item.docUpdated = new Date().getTime();
        }

        // Use setDoc with { merge: true } to update or create the document
        await setDoc(modelRef, item, { merge: true }).catch(e => {
            console.error(e);
            error = e;
        });

        if (item && imageCache) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            item.image = imageCache;
        }
        // We must wait to not interfere with updateCachedEntry
        await this.log('update', table, item.id as string | undefined, item as CommonCollectionData, error);
        this.updateCachedEntry(item.id as string, table, item as CommonCollectionData);
        this.sync();
    }

    async updateAll(items: ContextDataValueType[], table: string): Promise<void> {
        const batch = writeBatch(this._db);

        let modelRef;


        for (const item of items) {
            if (!item) {
                continue;
            }
            let imageCache;

            if (item && item.id) {
                // If item has an ID, update the existing document
                modelRef = doc(this._db, table, item.id as string);

                if ("image" in item && item.image && (item.image as string).startsWith('https://firebase')) {
                    imageCache = item.image;
                    delete item.image;
                }
            } else {
                // Generate a new document reference with an auto-generated ID
                modelRef = doc(collection(this._db, table));
                item.id = modelRef.id; // Assign the generated ID to your item
            }

            if (item) {
                item.docUpdated = new Date().getTime();
            }

            batch.set(modelRef, item, { merge: true });

            if (item && imageCache) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                item.image = imageCache;
            }
            this.updateCachedEntry(item.id as string, table, item as CommonCollectionData);
        }

        await batch.commit();

        this.sync();
    }

    async add(item: { [key: string]: unknown }, table: string): Promise<void | string> {
        if (!item) {
            void this.log('add', table, undefined, undefined, 'Empty item')
            return;
        }
        let error;
        const modelRef = await addDoc(collection(this._db, table), item).catch(e => {
            console.error(e);
            error = e.message;
        });
        if (modelRef) {
            item.id = modelRef.id;
        }
        this.appendCachedEntry(table, item as CommonCollectionData);
        this.sync();

        void this.log('add', table, item.id as string | undefined, item as CommonCollectionData, error);
        return item.id as string | undefined;
    }
}

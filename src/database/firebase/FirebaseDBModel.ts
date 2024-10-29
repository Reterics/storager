import DBModel from "../DBModel.ts";
import {FirebaseApp, initializeApp} from "firebase/app";
import {
    collection,
    getFirestore,
    onSnapshot,
    query,
    Firestore,
    doc,
    getDoc,
    deleteDoc,
    setDoc,
    addDoc
} from "firebase/firestore";
import {CommonCollectionData, ContextDataValueType, TTLData} from "../../interfaces/firebase.ts";


export default class FirebaseDBModel extends DBModel {
    private _app: FirebaseApp;
    private _db: Firestore;

    constructor(options?: {ttl?: TTLData, mtime?: TTLData}) {
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
    }

    getApp() {
        return this._app;
    }

    getDB() {
        return this._db;
    }

    getAll(table: string): Promise<CommonCollectionData[]> {
        return new Promise((resolve) => {
            const cached = this.getCached(table);
            if (cached) {
                return resolve(cached);
            }
            const q = query(collection(this._db, table));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const receivedData: CommonCollectionData[] = [];
                querySnapshot.forEach((doc) => {
                    receivedData.push({...doc.data(), id: doc.id});
                });
                this.updateCache(table, receivedData);
                this.sync();
                resolve(receivedData);
                return () => unsubscribe()
            }, (error) => {
                console.error('Error happened during Firebase connection: ', error);
                resolve([]);
                return () => unsubscribe()
            })
        });
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
        await deleteDoc(doc(this._db, table, id));
        this.removeCachedEntry(id, table);
    }

    async update(item: ContextDataValueType, table: string): Promise<void> {
        if (!item) {
            return;
        }

        let modelRef;
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

        // Use setDoc with { merge: true } to update or create the document
        await setDoc(modelRef, item, { merge: true }).catch(e => {
            console.error(e);
        });

        if (item && imageCache) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            item.image = imageCache;
        }
        this.updateCachedEntry(item.id as string, table, item as CommonCollectionData);
    }

    async add(item: { [key: string]: unknown }, table: string): Promise<void | string> {
        if (!item) {
            return;
        }

        const modelRef = await addDoc(collection(this._db, table), item).catch(e => {
            console.error(e);
        });
        if (modelRef) {
            item.id = modelRef.id;
        }
        this.appendCachedEntry(table, item as CommonCollectionData);
        return item.id as string | undefined;
    }
}

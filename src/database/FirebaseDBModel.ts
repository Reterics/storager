import DBModel from "./DBModel.ts";
import {FirebaseApp, initializeApp} from "firebase/app";
import {collection, getFirestore, onSnapshot, query, Firestore, doc, getDoc} from "firebase/firestore";



export default class FirebaseDBModel extends DBModel {
    private _app: FirebaseApp;
    private _db: Firestore;
    constructor() {
        super();
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

    getAll (table: string): Promise<unknown[]> {
        return new Promise((resolve) => {
            const q = query(collection(this._db, table));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const receivedData: object[] = [];
                querySnapshot.forEach((doc) => {
                    receivedData.push({ ...doc.data(), id: doc.id });
                });
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
            return docSnap.data();
        }
        return null;
    }
}

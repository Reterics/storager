import {ReactNode, useContext, useEffect, useRef, useState} from "react";
import {
    ContextDataType,
    ContextData,
    ContextDataValueType
} from "../../interfaces/firebase.ts";
import {db, firebaseCollections, getCollection} from "../../firebase/BaseConfig.ts";
import {
    ServiceCompleteData,
    ServiceData,
    SettingsItems,
    Shop,
    StoreItem,
    StorePart, UserData
} from "../../interfaces/interfaces.ts";
import PageLoading from "../../components/PageLoading.tsx";
import {getFileURL} from "../../firebase/storage.ts";
import {DBContext} from "../DBContext.ts";
import {AuthContext} from "../../store/AuthContext.tsx";
import {collection, deleteDoc, doc, setDoc} from "firebase/firestore";
import {ShopContext} from "../../store/ShopContext.tsx";


export const FirebaseProvider = ({children}: {
    children: ReactNode
}) => {

    const authContext = useContext(AuthContext);
    const shopContext = useContext(ShopContext);
    const [ctxData, setCtxData] = useState<ContextData|null>(null);
    const [error, setError] = useState<Error | null>(null);
    const renderAfterCalled = useRef(false);

    const refreshImagePointers = async (array: StoreItem[]|StorePart[]) => {
        if (Array.isArray(array)) {
            for (let i = 0; i < array.length; i++) {
                if (array[i].name && array[i].image && array[i].image?.startsWith('screenshots/')) {
                    array[i].image = await getFileURL(array[i].image || '');
                }
            }
        }
    };

    const getContextData = async () => {
        let users = await getCollection(firebaseCollections.users).catch(setError) as UserData[];
        let services: ServiceData[] = [];
        let completions: ServiceCompleteData[] = [];
        let settings: SettingsItems[] = [];
        let user;
        let shops: Shop[] = [];
        let items: StoreItem[] = [];
        let parts: StorePart[] = [];

        if (authContext.user && authContext.user.email) {
            user = users.find(user => user.email === authContext.user?.email);
            if (!user) {
                console.error('User is not found in the Firestore settings');
            } else if (user.role !== 'admin') {
                console.log('User is not an admin, hence we do not load settings');
                users = [user];
                settings = await getCollection(firebaseCollections.settings).catch(setError) as SettingsItems[];
                if (settings && settings[0]) {
                    for(let i = 0; i < settings.length; i++) {
                        settings[i] = {
                            id: settings[i].id,
                            serviceAgreement: settings[i].serviceAgreement,
                            companyName: settings[i].companyName,
                            address: settings[i].address,
                            email: settings[i].email,
                        }
                    }
                }
            } else {
                settings = await getCollection(firebaseCollections.settings).catch(setError) as SettingsItems[];
            }
        }





        if (user) {
            services = await getCollection(firebaseCollections.services).catch(setError) as ServiceData[];
            completions = await getCollection(firebaseCollections.completions).catch(setError) as ServiceCompleteData[];
            shops = await getCollection(firebaseCollections.shops).catch(setError) as Shop[];
            items = await getCollection(firebaseCollections.items).catch(setError) as StoreItem[];
            parts = await getCollection(firebaseCollections.parts).catch(setError) as StorePart[];
        }

        // TODO: move the filter server side
        if (user && user.shop_id) {
            shops = shops.filter(shop => shop.id === user.shop_id);
            items = items.filter(item => item.shop_id === user.shop_id);
            parts = parts.filter(part => part.shop_id === user.shop_id);
            if (shopContext.shop?.id !== user.shop_id) {
                shopContext.setShop(shops[0])
            }
        }

        await refreshImagePointers(items);
        await refreshImagePointers(parts);

        setCtxData({
            shops,
            items,
            parts,
            services,
            completions,
            settings: settings[0],
            users: users,
            currentUser: user
        })
    }

    const removeContextData = async (key: ContextDataType, id: string)=> {
        if (ctxData && Array.isArray(ctxData[key]) && key !== 'settings') {
            const filteredData = ctxData[key].filter(item => item.id !== id);
            if (filteredData.length !== ctxData[key].length) {
                await deleteDoc(doc(db, firebaseCollections[key], id));
                ctxData[key] = filteredData;
                setCtxData({
                    ...ctxData,
                });
            }
        }

        return ctxData ? ctxData[key] : null;
    }

    const updateContextData = async (key: ContextDataType, item: ContextDataValueType)=> {
        if (!item) {
            console.error('There is no data provided for saving');
            return ctxData ? ctxData[key] : null;
        }

        let modelRef;
        let isNew = false;

        if (item && item.id) {
            // If item has an ID, update the existing document
            modelRef = doc(db, firebaseCollections[key], item.id);
        } else {
            // Generate a new document reference with an auto-generated ID
            modelRef = doc(collection(db, firebaseCollections[key]));
            item.id = modelRef.id; // Assign the generated ID to your item
            isNew = true;
        }

        // Use setDoc with { merge: true } to update or create the document
        await setDoc(modelRef, item, { merge: true }).catch(e => {
            console.error(e);
        });

        console.log('Created document with ID:', modelRef.id, ' in ', key);


        if (item && ctxData && Array.isArray(ctxData[key]) && key !== 'settings') {
            if (isNew) {
                ctxData[key].push(item);
            } else {
                ctxData[key] = ctxData[key].map((ctx: ContextDataValueType) => {
                    if (item.id && ctx && ctx.id === item.id) {
                        return item;
                    }
                    return ctx;
                }) as ContextDataValueType[];
            }


        } else if (ctxData && key === 'settings') {
            ctxData[key] = item;
        }

        setCtxData(ctxData ? {
            ...ctxData,
        } : null);

        if (ctxData && Array.isArray(ctxData[key])) {
            return [...ctxData[key]];
        } else if (ctxData && ctxData[key]) {
            return {...ctxData[key]};
        }
        return null;
    }

    useEffect(() => {
        if (!renderAfterCalled.current) {
            console.error('Load context data');
            void getContextData();
        }

        renderAfterCalled.current = true;
    }, []);

    return <DBContext.Provider value={{
        data: ctxData as ContextData,
        setData: updateContextData,
        removeData: removeContextData,
        refreshImagePointers:refreshImagePointers
    }}>
        {!error && ctxData && children}
        {!error && !ctxData && <PageLoading/>}
        {error && <div>Error: {error.message}</div>}
    </DBContext.Provider>;
};

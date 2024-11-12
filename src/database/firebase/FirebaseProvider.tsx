import {ReactNode, useContext, useEffect, useRef, useState} from "react";
import {
    ContextDataType,
    ContextData,
    ContextDataValueType
} from "../../interfaces/firebase.ts";
import {db, firebaseCollections, firebaseModel, getCollection} from "./config.ts";
import {
    ServiceCompleteData,
    ServiceData,
    SettingsItems,
    Shop, ShopType,
    StoreItem,
    StorePart, StyledSelectOption, UserData
} from "../../interfaces/interfaces.ts";
import PageLoading from "../../components/PageLoading.tsx";
import {getFileURL} from "./storage.ts";
import {DBContext} from "../DBContext.ts";
import {AuthContext} from "../../store/AuthContext.tsx";
import {addDoc, collection} from "firebase/firestore";
import {ShopContext} from "../../store/ShopContext.tsx";


export const FirebaseProvider = ({children}: {
    children: ReactNode
}) => {

    const authContext = useContext(AuthContext);
    const shopContext = useContext(ShopContext);
    const [ctxData, setCtxData] = useState<ContextData|null>(null);
    const renderAfterCalled = useRef(false);


    const postProcessStoreData = async (array: StoreItem[]|StorePart[]) => {
        if (Array.isArray(array)) {
            for (let i = 0; i < array.length; i++) {
                if (array[i].name && array[i].image && array[i].image?.startsWith('screenshots/')) {
                    array[i].image = await getFileURL(array[i].image || '');
                }
                if (array[i].name === 'belső 12.5x1.75') {
                    console.log(array[i]);
                }
                if (typeof array[i].storage === 'number' || typeof array[i].storage === 'string') {
                    array[i].storage = [Number(array[i].storage)]
                }
                if (typeof array[i].shop_id === 'string') {
                    array[i].shop_id = [array[i].shop_id] as unknown as string[]
                }
                if (typeof array[i].storage_limit === 'number' || typeof array[i].storage_limit === 'string') {
                    array[i].storage_limit = [Number(array[i].storage_limit)]
                }
            }
        }
    };


    const getContextData = async (cache: boolean = false) => {
        let users = await getCollection(firebaseCollections.users, true) as UserData[];
        let services: ServiceData[] = [];
        let completions: ServiceCompleteData[] = [];
        let settings: SettingsItems[] = [];
        let user;
        let shops: Shop[] = [];
        let items: StoreItem[] = [];
        let parts: StorePart[] = [];
        let types: ShopType[] = [];
        let archive: ContextDataValueType[] = [];

        users = (users || []).map(user => {
            user.password = undefined;
            user.password_confirmation = undefined;
            return user;
        })

        if (authContext.user && authContext.user.email) {
            user = users.find(user => user.email === authContext.user?.email);
            if (!user) {
                console.error('User is not found in the Firestore settings');
            } else if (user.role !== 'admin') {
                console.log('User is not an admin, hence we do not load settings');
                users = [user];
                settings = await getCollection(firebaseCollections.settings) as SettingsItems[];
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
                settings = await getCollection(firebaseCollections.settings) as SettingsItems[];
            }
        }

        if (user) {
            services = await getCollection(firebaseCollections.services) as ServiceData[];
            completions = await getCollection(firebaseCollections.completions) as ServiceCompleteData[];
            shops = await getCollection(firebaseCollections.shops) as Shop[];
            items = await getCollection(firebaseCollections.items) as StoreItem[];
            parts = await getCollection(firebaseCollections.parts) as StorePart[];
            archive = await getCollection(firebaseCollections.archive) as ContextDataValueType[];
            types = await getCollection(firebaseCollections.types) as ContextDataValueType[];
        }

        // TODO: move the filter server side
        if (user && user.shop_id && user.shop_id.length) {
            shops = shops.filter(shop => user.shop_id.includes(shop.id));
            items = items.filter(item => user.shop_id.includes(item.shop_id));
            parts = parts.filter(part => user.shop_id.includes(part.shop_id));
            if (!shopContext.shop?.id || !user.shop_id.includes(shopContext.shop?.id)) {
                shopContext.setShop(shops[0])
            }
        }

        await postProcessStoreData(items);
        await postProcessStoreData(parts);

        if (cache) {
            firebaseModel.sync(0);
        }

        setCtxData({
            shops,
            items,
            parts,
            services,
            completions,
            settings: settings[0],
            users: users,
            currentUser: user,
            archive: archive,
            types: types,
            deleted: await firebaseModel.getAll('deleted')
        })
    }

    const removeContextData = async (key: ContextDataType, id: string)=> {
        if (ctxData && Array.isArray(ctxData[key]) && key !== 'settings') {
            const filteredData = ctxData[key].filter(item => item.id !== id);
            if (filteredData.length !== ctxData[key].length) {
                await firebaseModel.remove(id, firebaseCollections[key])
                ctxData[key] = [...filteredData];
                const cachedRecycleBin = firebaseModel.getCached('deleted');
                if (cachedRecycleBin) {
                    ctxData.deleted = cachedRecycleBin;
                }

                setCtxData({
                    ...ctxData,
                });
                return ctxData[key];
            }
        }

        return ctxData ? ctxData[key] : null;
    }

    const restoreContextData = async (id: string) => {
        if (ctxData && ctxData.deleted) {
            await firebaseModel.restore(id);
            const filteredData = ctxData.deleted.filter(item => item.id !== id);
            ctxData.deleted = [...filteredData];
            setCtxData({
                ...ctxData,
            });
            return ctxData.deleted
        }
        return ctxData ? ctxData.deleted: null;

    }

    const removePermanentCtxData = async (id: string)=> {
        const cached = firebaseModel.getCachedEntry(id, 'deleted');
        if (cached) {
            return await firebaseModel.removePermanent(id);
        }
        return await firebaseModel.getAll('deleted');
    }

    const updateContextData = async (key: ContextDataType, item: ContextDataValueType, archive?: boolean)=> {
        if (!item) {
            console.error('There is no data provided for saving');
            return ctxData ? ctxData[key] : null;
        }

        await firebaseModel.update(item, key);
        if (archive) {
            item.docType = key;
            item.docParent = item.id;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            delete item.id;

            const document = await addDoc(collection(db, firebaseCollections.archive), item).catch(e => {
                console.error(e);
            });
            if (document && ctxData && ctxData.archive) {
                ctxData.archive.unshift({...item, id: document.id});
            }
            item.id = item.docParent;
        }

        console.log('Created document with ID:', item.id, ' in ', key);

        if (ctxData) {
            // FirebaseModel above build up the cache, so we need just to refresh data from it here
            const cachedData = firebaseModel.getCached(key);
            if (cachedData) {
                if (key === 'settings') {
                    ctxData[key] = cachedData[0];
                } else {
                    ctxData[key] = cachedData;
                }
            } else {
                console.warn('Failed to fetch data from local cache');
            }
        }

        setCtxData(ctxData ? {
            ...ctxData,
        } : null);

        return ctxData ? ctxData[key] : null;
    }

    const updateContextBatched = async (key: ContextDataType, items: ContextDataValueType[]) => {
        await firebaseModel.updateAll(items, key);

        if (ctxData) {
            // FirebaseModel above build up the cache, so we need just to refresh data from it here
            const cachedData = firebaseModel.getCached(key);
            if (cachedData) {
                if (key === 'settings') {
                    ctxData[key] = cachedData[0];
                } else {
                    ctxData[key] = cachedData;
                }
            } else {
                console.warn('Failed to fetch data from local cache');
            }
        }

        setCtxData(ctxData ? {
            ...ctxData,
        } : null);

        return ctxData ? ctxData[key] : null;
    }

    const getType = (type: 'part'|'item'|'service', lang: 'hu'|'en' = 'hu'): StyledSelectOption[] => {
        if (ctxData && ctxData.types) {
            return ctxData.types
                .filter(t => t.category === type)
                .map(type => {
                    return {
                        "value": type.name || '',
                        "name": (type.translations? type.translations[lang] : type.name) || ''
                    };
                })
        }
        return [];
    }

    const refreshData = async (key?: ContextDataType)=>{
        let updateLocalCache = false;
        if (key) {
            firebaseModel.invalidateCache(key);
            updateLocalCache = true;
        }
        void getContextData(updateLocalCache);
    }

    useEffect(() => {
        if (!renderAfterCalled.current) {
            console.log('Load context data');
            firebaseModel.loadPersisted()
                .finally(() => {
                    void getContextData(true);
                })

        }

        renderAfterCalled.current = true;
    }, []);

    return <DBContext.Provider value={{
        data: ctxData as ContextData,
        refreshData: refreshData,
        setData: updateContextData,
        removeData: removeContextData,
        restoreData: restoreContextData,
        removePermanentData: removePermanentCtxData,
        refreshImagePointers:postProcessStoreData,
        uploadDataBatch: updateContextBatched,
        getType: getType
    }}>
        {ctxData && children}
        {!ctxData && <PageLoading/>}
    </DBContext.Provider>;
};

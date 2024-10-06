import {ReactNode, useContext, useEffect, useRef, useState} from "react";
import {ContextDataType, ContextData, ContextDataValueType} from "../../interfaces/firebase.ts";
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
import {doc, setDoc} from "firebase/firestore";
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
        let shops = await getCollection(firebaseCollections.shops).catch(setError) as Shop[];
        let items = await getCollection(firebaseCollections.items).catch(setError) as StoreItem[];
        let parts = await getCollection(firebaseCollections.parts).catch(setError) as StorePart[];
        let users = await getCollection(firebaseCollections.users).catch(setError) as UserData[];
        let services: ServiceData[] = [];
        let completions: ServiceCompleteData[] = [];
        let settings: SettingsItems[] = [];
        let user;

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


    const updateContextData = async (key: 'shops'|'items'|'parts'|'services'|'completions'|'settings'|'users', item: ContextDataValueType)=> {
        if (item && item.id) {
            const modelRef = doc(db, firebaseCollections[key], item.id);
            await setDoc(modelRef, item, { merge: true }).catch(e => {
                console.error(e);
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const use = (id: number, type: ContextDataType) => {
        // TODO: To be implemented
    };

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
        use: use,
        refreshImagePointers:refreshImagePointers
    }}>
        {!error && ctxData && children}
        {!error && !ctxData && <PageLoading/>}
        {error && <div>Error: {error.message}</div>}
    </DBContext.Provider>;
};

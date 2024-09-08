import {useContext, useEffect, useState} from 'react'
import {AuthContext} from "../store/AuthContext.tsx";
import PageLoading from "../components/PageLoading.tsx";
import Header from "../components/Header.tsx";
import SignInComponent from "../components/SignIn.tsx";
import {db, firebaseCollections, getCollection} from "../firebase/BaseConfig.ts";
import {doc, deleteDoc, collection, setDoc} from "firebase/firestore";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";

import {StoreItem} from "../interfaces/interfaces.ts";
import {BsFillPlusCircleFill} from "react-icons/bs";
import ItemModal from "../components/modals/ItemModal.tsx";
import {getFileURL} from "../firebase/storage.ts";

function App() {
    const {user, loading} = useContext(AuthContext);

    const [items, setItems] = useState<StoreItem[]>([]);

    const [modalTemplate, setModalTemplate] = useState<StoreItem|null>(null)

    const refreshItems = async () => {
        const items = (await getCollection(firebaseCollections.items)) as StoreItem[];
        for (let i = 0; i < items.length; i++) {
            if (items[i].name && items[i].image && items[i].image?.startsWith('screenshots/')) {
                items[i].image = await getFileURL(items[i].image || '');
            }
        }
        setItems(items as StoreItem[]);
    };

    useEffect(() => {
        void refreshItems();

    }, []);

    if (!user) return <SignInComponent/>;

    const deleteItem = async (item: StoreItem) => {
        if (item.id && window.confirm('Are you sure you wish to delete this Item?')) {
            await deleteDoc(doc(db, firebaseCollections.items, item.id));

            await refreshItems();
        }
    };

    const closeItem = async (item?: StoreItem)=> {
        let modelRef;
        if (item && item.id) {
            modelRef = doc(db, firebaseCollections.items, item.id);
        } else if (item) {
            modelRef = doc(collection(db, firebaseCollections.items));
        }

        if (item && modelRef) {
            await setDoc(modelRef, item, { merge: true }).catch(e=>{
                console.error(e);
            });
            await refreshItems();
        }

        setModalTemplate(null);
    }


    const tableLines = items.map(shop => {
        return [
            shop.image ? <img src={shop.image} width="100" alt="image for item" /> : '',
            shop.inventory_id,
            shop.name || '',
            shop.storage || '0',
            (shop.price || '0') + ' Ft',
            TableViewActions({
                onRemove: () => deleteItem(shop),
            })
        ];
    });

    return (
        <>
            <Header/>
            {loading && <PageLoading/>}
            <div className="main-container p-2 flex flex-col h-full">
                <div className="flex justify-center overflow-x-auto shadow-md sm:rounded-lg w-full m-auto">
                    <div className="flex justify-between max-w-screen-xl m-2 p-2 w-full">
                        <h1 className="text-2xl font-bold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-4xl dark:text-white">
                            Shops
                        </h1>
                        <button type="button"
                                className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none
                            focus:ring-4 focus:ring-gray-300 font-medium rounded-lg px-5 py-2.5 mr-2
                            dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                                onClick={() => setModalTemplate(modalTemplate ? null : {
                                    id: ''
                                })}
                        >
                            <BsFillPlusCircleFill/>
                        </button>
                    </div>
                </div>
                <div className="flex justify-center overflow-x-auto shadow-md sm:rounded-lg w-full m-auto mt-2 mb-2">
                    <TableViewComponent lines={tableLines} header={['Image', 'ID', 'Name', 'Storage', 'Price', 'Action']}/>
                </div>
                <div className="flex justify-center h-80 overflow-x-auto shadow-md sm:rounded-lg w-full m-auto mt-2 flex-1">
                    <ItemModal
                        onClose={()=>setModalTemplate(null)}
                        onSave={(item: StoreItem) => closeItem(item)}
                        setItem={(item: StoreItem) => setModalTemplate(item)}
                        item={modalTemplate}
                        inPlace={false}
                    />
                </div>
            </div>

        </>
    )
}

export default App

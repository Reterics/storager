import {ChangeEvent, useContext, useEffect, useState} from 'react'
import {AuthContext} from "../store/AuthContext.tsx";
import PageLoading from "../components/PageLoading.tsx";
import Header from "../components/Header.tsx";
import SignInComponent from "../components/SignIn.tsx";
import {db, firebaseCollections, getCollection} from "../firebase/BaseConfig.ts";
import {doc, deleteDoc, collection, setDoc} from "firebase/firestore";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";

import {Shop, StoreItem, StyledSelectOption} from "../interfaces/interfaces.ts";
import {BsArrowLeftSquare, BsArrowRightSquare, BsFillPlusCircleFill} from "react-icons/bs";
import ItemModal from "../components/modals/ItemModal.tsx";
import {getFileURL} from "../firebase/storage.ts";
import StyledInput from "../components/elements/StyledInput.tsx";
import StyledSelect from "../components/elements/StyledSelect.tsx";

function App() {
    const {user, loading} = useContext(AuthContext);

    const [items, setItems] = useState<StoreItem[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);

    const typeOptions: StyledSelectOption[] = shops.map((key)=>{
        return {
            "name": key.name,
            "value": key.id
        } as StyledSelectOption
    });

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

    const refreshShops = async () => {
        const shops = await getCollection(firebaseCollections.shops);
        setShops(shops as Shop[]);
    };

    useEffect(() => {
        void refreshItems()
            .then(()=>refreshShops())
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

    const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string, item: StoreItem) => {
        const value = e.target.value;

        const obj = {...item};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        obj[key] = value;

        setItems((items) => {
            return items.map(i => {
                if (i === item) {
                    return obj as StoreItem;
                }
                return {...i} as StoreItem;
            })
        });
    };
    const tableLines = items.map(item => {
        return [
            item.image ? <img src={item.image} width="40" alt="image for item" /> : '',
            item.inventory_id,
            item.name || '',
            <div className="flex flex-row text-xl items-center cursor-pointer">
                <BsArrowLeftSquare onClick={() => changeType({target: {value: Number(item.storage) - 1}} as unknown  as ChangeEvent<HTMLInputElement>, 'storage', item)}/>
                <span className="m-1">
                    <StyledInput type="number" value={item.storage || 0} className="mt-0 w-[24px] me-1 hide-arrows"
                                 onChange={(e) => changeType(e, 'storage', item)}/>
                </span>
                <BsArrowRightSquare onClick={() => changeType({target: {value: Number(item.storage) + 1}} as unknown  as ChangeEvent<HTMLInputElement>, 'storage', item)}/>
            </div>,
            <div className="flex flex-row text-xl items-center cursor-pointer"><StyledInput type="number" value={item.price || 0} className="mt-0 w-auto me-1"/> Ft</div>,
            <StyledSelect
                type="text" name="Shop"
                options={typeOptions}
                value={item.store || ''}
                onSelect={(e) => changeType(e as unknown as ChangeEvent<HTMLInputElement>, 'store', item)}
                label={false}
            />,
            TableViewActions({
                onRemove: () => deleteItem(item),
            })
        ];
    });

    return (
        <>
            <Header/>
            {loading && <PageLoading/>}
            <div className="main-container p-2 flex flex-col h-full">
                <div className="flex justify-center overflow-x-auto shadow-md sm:rounded-lg w-full m-auto">
                    <div className="flex justify-between max-w-screen-xl m-1 p-2 w-full">
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
                    <TableViewComponent lines={tableLines} header={['Image', 'ID', 'Name', 'Storage', 'Price', 'Shop', 'Action']}/>
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

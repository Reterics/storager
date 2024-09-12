import {ChangeEvent, useContext, useState} from 'react'
import {db, firebaseCollections} from "../firebase/BaseConfig.ts";
import {doc, deleteDoc, collection, setDoc, addDoc} from "firebase/firestore";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";

import {Shop, StoreItem, StyledSelectOption} from "../interfaces/interfaces.ts";
import {BsArrowLeftSquare, BsArrowRightSquare, BsFillPlusCircleFill} from "react-icons/bs";
import ItemModal from "../components/modals/ItemModal.tsx";
import StyledInput from "../components/elements/StyledInput.tsx";
import StyledSelect from "../components/elements/StyledSelect.tsx";
import {FirebaseContext} from "../firebase/FirebaseContext.ts";
import {PageHead} from "../components/elements/PageHead.tsx";
import { useTranslation } from 'react-i18next';

function Items() {
    const firebaseContext = useContext(FirebaseContext);
    const { t } = useTranslation();

    const [items, setItems] = useState<StoreItem[]>(firebaseContext?.data.items || []);
    const [shops] = useState<Shop[]>(firebaseContext?.data.shops || []);

    const [modalTemplate, setModalTemplate] = useState<StoreItem|null>(null)

    const typeOptions: StyledSelectOption[] = shops.map((key)=>{
        return {
            "name": key.name,
            "value": key.id
        } as StyledSelectOption
    });

    const deleteItem = async (item: StoreItem) => {
        if (item.id && window.confirm(t('Are you sure you wish to delete this Item?'))) {
            await deleteDoc(doc(db, firebaseCollections.items, item.id));

            setItems(items.filter(i => i !== item))
        }
    };

    const closeItem = async (item?: StoreItem)=> {
        let modelRef;
        if (item && item.id) {
            modelRef = doc(db, firebaseCollections.items, item.id);
            await setDoc(modelRef, item, { merge: true }).catch(e => {
                console.error(e);
            });
            console.log('Updated document ID:', modelRef.id);
        } else if (item) {
            // For creating a new document with an auto-generated ID
            modelRef = await addDoc(collection(db, firebaseCollections.items), item).catch(e => {
                console.error(e);
            });

            if (modelRef) {
                console.log('Created new document with ID:', modelRef.id);

                item.id = modelRef.id;
                const updatedItems = [...items];
                updatedItems.push(item);
                setItems(updatedItems);
            }
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
            <div className="flex flex-row text-xl items-center cursor-pointer">
                <StyledInput type="number" value={item.price || 0} className="mt-0 w-auto me-1"/> Ft</div>,
            <StyledSelect
                type="text" name={t('Shop')}
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
            <PageHead title={t('Items')} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick:() => setModalTemplate(modalTemplate ? null : {
                        id: ''
                    })
                }
            ]}/>

            <TableViewComponent lines={tableLines}
                                header={[
                                    t('Image'),
                                    t('ID'),
                                    t('Name'),
                                    t('Storage'),
                                    t('Price'),
                                    t('Shop'),
                                    t('Actions')]}/>

            <div className="flex justify-center h-80 overflow-x-auto shadow-md sm:rounded-lg w-full m-auto mt-2 flex-1">
                <ItemModal
                    onClose={()=>setModalTemplate(null)}
                    onSave={(item: StoreItem) => closeItem(item)}
                    setItem={(item: StoreItem) => setModalTemplate(item)}
                    item={modalTemplate}
                    inPlace={false}
                />
            </div>
        </>
    )
}

export default Items

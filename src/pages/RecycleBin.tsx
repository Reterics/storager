import {useContext, useState} from "react";
import {DBContext} from "../database/DBContext.ts";
import {useTranslation} from "react-i18next";
import {ContextDataValueType} from "../interfaces/firebase.ts";
import UnauthorizedComponent from "../components/Unauthorized.tsx";
import {PageHead} from "../components/elements/PageHead.tsx";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";
import {StoreItem} from "../interfaces/interfaces.ts";
import {ShopContext} from "../store/ShopContext.tsx";
import {BsFillTrash3Fill} from "react-icons/bs";


function RecycleBin() {
    const dbContext = useContext(DBContext);
    const shopContext = useContext(ShopContext);
    const { t } = useTranslation();

    let initialItems = dbContext?.data.deleted || [];
    if (shopContext.shop) {
        initialItems = initialItems
            .filter((item) => {
                const shopId = (item as unknown as StoreItem).shop_id;

                if (shopId !== undefined) {
                    return shopContext.shop?.id === shopId;

                }
                return true;
            });
    }
    const [items, setItems] = useState<ContextDataValueType[]>(initialItems);


    if (!dbContext?.data.currentUser) {
        return <UnauthorizedComponent />;
    }

    const deletePermanent = async (id: string) => {
        if (window.confirm("Are you sure you want to delete permanently?")) {
            let updatedList = await dbContext.removePermanentData(id);
            if (updatedList && shopContext.shop) {
                updatedList = updatedList
                    .filter((item) => {
                        const shopId = (item as unknown as StoreItem).shop_id;

                        if (shopId !== undefined) {
                            return shopContext.shop?.id === shopId;

                        }
                        return true;
                    });
            }

            if (updatedList) {
                setItems(updatedList);
            }
        }
    };

    const tableLines = items.map(item => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const name = item.name || item.client_name || '';

        return [
            item.id,
            name,
            t(item.docType || ''),
            new Date(item.docUpdated || new Date()).toISOString().split('.')[0],
            TableViewActions({
                onRemove: () => deletePermanent(item.id),
            })
        ];
    });

    return (
        <>
            <PageHead title={<div className='flex justify-between'><BsFillTrash3Fill />{t('Recycle Bin')}</div>}/>

            <TableViewComponent lines={tableLines}
                                header={[
                                    t('ID'),
                                    t('Name'),
                                    t('Type'),
                                    t('Date'),
                                    t('Actions')
                                ]}
            ></TableViewComponent>
            <div className="flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1">

            </div>
        </>
    )
}

export default RecycleBin;

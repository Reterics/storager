import {useContext, useState} from 'react';
import {BsFillPlusCircleFill} from "react-icons/bs";
import {PageHead} from "../components/elements/PageHead.tsx";
import {useTranslation} from "react-i18next";
import {DBContext} from "../database/DBContext.ts";
import {ShopContext} from "../store/ShopContext.tsx";
import {Shop, StyledSelectOption, UserData} from "../interfaces/interfaces.ts";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";
import UserModal from "../components/modals/UserModal.tsx";
import UnauthorizedComponent from "../components/Unauthorized.tsx";

function UsersPage() {
    const dbContext = useContext(DBContext);
    const shopContext = useContext(ShopContext);
    const { t } = useTranslation();

    const [shops] = useState<Shop[]>(dbContext?.data.shops || []);
    const [users, setUsers] = useState<UserData[]>(dbContext?.data.users || []);
    const [modalTemplate, setModalTemplate] = useState<UserData|null>(null)

    const typeOptions: StyledSelectOption[] = shops.map((key)=>{
        return {
            "name": key.name,
            "value": key.id
        } as StyledSelectOption
    });

    const deleteUser = async (item: UserData) => {
        if (item.id && window.confirm(t('Are you sure you wish to revoke all of the rights from the User?'))) {
            setUsers(await dbContext?.removeData('users', item.id) as UserData[])
        }
    };


    const saveUser = async (item: UserData) => {
        const updatedUsers = await dbContext?.setData('users', item as UserData);

        setUsers(updatedUsers as UserData[]);
        setModalTemplate(null);
    }

    const tableLines = users.map(item => {
        const assignedShop = item.shop_id ? shops.find(i => i.id === item.shop_id) : null;

        return [
            item.id,
            item.username,
            item.email || '',
            item.role || 0,
            assignedShop ? assignedShop.name : t('Minden bolt'),
            TableViewActions({
                onRemove: () => deleteUser(item)
            })
        ];
    });

    if (!dbContext?.data.currentUser) {
        return <UnauthorizedComponent />;
    }

    return (
        <>
            <PageHead title={t('Users')} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick: () => setModalTemplate(modalTemplate ? null : {
                        id: '',
                        shop_id: shopContext.shop?.id,
                    })
                }
            ]}/>

            <TableViewComponent lines={tableLines}
                                header={[
                                    t('ID'),
                                    t('Username'),
                                    {
                                        value: t('Email'),
                                        type: 'text',
                                        sortable: true,
                                        editable: false
                                    },
                                    {
                                        value: t('Role'),
                                        type: 'steps',
                                        sortable: true,
                                        editable: false
                                    },
                                    {
                                        value: t('Shop'),
                                        type: 'select',
                                        editable: false,
                                        options: typeOptions
                                    },
                                    t('Actions')]}
            />

            <div className="flex justify-center h-80 overflow-x-auto shadow-md sm:rounded-lg w-full m-auto mt-2 flex-1">
                <UserModal
                    onClose={() => setModalTemplate(null)}
                    onSave={(item: UserData) => saveUser(item)}
                    setUser={(item: UserData) => setModalTemplate(item)}
                    user={modalTemplate}
                    inPlace={false}
                    shops={shops}
                />
            </div>
        </>
    );
}

export default UsersPage;

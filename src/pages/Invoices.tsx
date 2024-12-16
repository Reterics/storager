import {useContext, useState} from "react";
import {DBContext} from "../database/DBContext.ts";
import {useTranslation} from "react-i18next";
import {InvoiceType, Shop} from "../interfaces/interfaces.ts";
import UnauthorizedComponent from "../components/Unauthorized.tsx";
import {BsFillPlusCircleFill} from "react-icons/bs";
import {PageHead} from "../components/elements/PageHead.tsx";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";
import InvoiceModal from "../components/modals/InvoiceModal.tsx";


function Invoices() {
    const dbContext = useContext(DBContext);
    const { t } = useTranslation();

    const [invoices, setInvoices] = useState<InvoiceType[]>(dbContext?.data.invoices || []);
    const [shops] = useState<Shop[]>(dbContext?.data.shops || []);

    const [modalTemplate, setModalTemplate] = useState<InvoiceType|null>(null)

    const saveInvoice = async (type: InvoiceType) => {
        const updatedInvoices = await dbContext?.setData('invoices', type);
        setInvoices(updatedInvoices as InvoiceType[]);
        setModalTemplate(null);
    }

    const deleteInvoice = async (item: InvoiceType) => {
        if (item.id && window.confirm(t('Are you sure you wish to delete this Invoice?'))) {
            const updatedInvoices = await dbContext?.removeData('invoices', item.id) as InvoiceType[];
            setInvoices(updatedInvoices);
        }
    };

    if (!dbContext?.data.currentUser) {
        return <UnauthorizedComponent />;
    }

    const tableLines = invoices.map(invoice => {
        let assignedShops: Shop[] | null;
        if (Array.isArray(invoice.shop_id)) {
            assignedShops = invoice.shop_id
                .map(id => shops.find(shop=>shop.id === id))
                .filter(a => a) as Shop[];
        } else {
            assignedShops = invoice.shop_id ?
                [shops.find(shop => shop.id === (invoice.shop_id as unknown as string)) as Shop] : null;
        }


        return [
            invoice.name,
            invoice.address ?? '',
            invoice.tax ?? '',
            assignedShops?.length ? assignedShops.map(a=>a.name).join(', ') : t('Minden bolt'),
            invoice.status ? t(invoice.status.charAt(0).toUpperCase() + invoice.status.substring(1)): '',
            TableViewActions({
                onRemove: () => deleteInvoice(invoice),
                onEdit: () => setModalTemplate(invoice)
            })
        ];
    });

    return <>
        <PageHead title={t('Invoices')} buttons={[
            {
                value: <BsFillPlusCircleFill/>,
                onClick: () => setModalTemplate(modalTemplate ? null : {
                    id: '',
                    name: '',
                    address: '',
                    tax: '',
                    notes: '',
                    status: 'created',
                    shop_id: [shops[0]?.id]
                })
            }
        ]} />

        <TableViewComponent lines={tableLines}
                            header={[
                                t('Name'),
                                t('Address'),
                                t('Tax ID'),
                                t('Shop'),
                                t('Status'),
                                t('Actions')]}
        />

        <div className="flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1">
            <InvoiceModal
                onClose={() => setModalTemplate(null)}
                onSave={(item: InvoiceType) => saveInvoice(item)}
                setInvoice={(item: InvoiceType) => setModalTemplate(item)}
                invoice={modalTemplate}
                inPlace={false}
                shops={shops}
            ></InvoiceModal>
        </div>
    </>
}

export default Invoices;
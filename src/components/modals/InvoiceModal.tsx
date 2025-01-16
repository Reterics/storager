import {useTranslation} from "react-i18next";
import {
    GeneralModalButtons,
    InvoiceModalInput,
    InvoiceType,
    StyledSelectOption,
} from "../../interfaces/interfaces.ts";
import GeneralModal from "./GeneralModal.tsx";
import FormRow from "../elements/FormRow.tsx";
import StyledInput from "../elements/StyledInput.tsx";
import StyledSelect from "../elements/StyledSelect.tsx";
import {ChangeEvent, useMemo} from "react";
import {invoiceStatusCodes} from "../../interfaces/constants.ts";


export default function InvoiceModal({onClose, invoice, setInvoice, onSave, inPlace, shops}: Readonly<InvoiceModalInput>) {
    const { t } = useTranslation();

    const invoiceStatuses = useMemo<StyledSelectOption[]>(()=>
        invoiceStatusCodes.map(status => ({
            name: t(status.charAt(0).toUpperCase() + status.substring(1)),
            value: status
        })), [t]);

    const shopOptions: StyledSelectOption[] = (shops || []).map((key)=>{
        return {
            "name": key.name,
            "value": key.id
        } as StyledSelectOption
    });

    const selectMultiShopId = (e: React.ChangeEvent<HTMLInputElement>)=>{
        const value = e.target.value;

        setInvoice({
            ...invoice as InvoiceType,
            shop_id: [value]
        });
    };


    const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.target.value;

        const obj = {...invoice};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        obj[key] = value;

        setInvoice(obj as InvoiceType);
    };

    if (!invoice) {
        return null;
    }

    const buttons: GeneralModalButtons[] = [
        {
            primary: true,
            onClick: ()=> {
                if (invoice.status) {
                    invoice[invoice.status] = new Date().getTime()
                }
                onSave(invoice)
            },
            value: t('Save')
        },
        {
            onClick: onClose,
            value: t('Cancel')
        }
    ];

    return (<GeneralModal buttons={buttons} inPlace={inPlace}
                          title={t('Edit Invoice')} id={'InvoiceModal'}>
        <FormRow>
            <StyledInput
                type="text" name="name"
                value={invoice.name}
                onChange={(e) => changeType(e, 'name')}
                label={t("Name")}
            />

            <StyledInput
                type="text" name="tax"
                value={invoice.tax}
                onChange={(e) => changeType(e, 'tax')}
                label={t("Tax ID")}
            />

        </FormRow>

        <FormRow>
            <StyledInput
                type="text" name="address"
                value={invoice.address}
                onChange={(e) => changeType(e, 'address')}
                label={t("Address")}
            />

        </FormRow>
        <FormRow>
            <StyledInput
                type="text" name="email"
                value={invoice.email}
                onChange={(e) => changeType(e, 'email')}
                label={t("Email")}
            />

            <StyledInput
                type="text" name="phone"
                value={invoice.phone}
                onChange={(e) => changeType(e, 'phone')}
                label={t("Phone")}
            />
        </FormRow>
        <FormRow>
            <StyledSelect
                type="text" name="payment_method"
                value={invoice.payment_method ?? "credit_card"}
                options={[
                    {
                        name: t('Credit Card'),
                        value: 'credit_card',

                    },
                    {
                        name: t('Cash'),
                        value: 'cash',

                    }
                ]}
                onSelect={(e) => changeType(e as unknown as ChangeEvent<HTMLInputElement>, 'payment_method')}
                label={t("Payment method")}
            />

            <StyledInput
                type="text" name="total"
                value={invoice.total}
                onChange={(e) => changeType(e, 'total')}
                label={t("Total")}
            />
        </FormRow>
        <FormRow>
            <StyledSelect
                options={shopOptions}
                name="shop_id"
                value={invoice.shop_id?.[0] ?? shops[0]?.id}
                onSelect={(e) => selectMultiShopId(e as unknown as ChangeEvent<HTMLInputElement>)}
                label={t("Assigned Shop")}
            />
            <StyledSelect
                options={invoiceStatuses}
                name="status"
                value={invoice.status}
                onSelect={(e) => changeType(e as unknown as ChangeEvent<HTMLInputElement>, 'status')}
                label={t("Status")}
            />
        </FormRow>
        <FormRow>
            <StyledInput
                type="textarea" name="notes"
                value={invoice.notes}
                onChange={(e) => changeType(e, 'notes')}
                label={t("Note")}
            />
        </FormRow>
    </GeneralModal>);
}

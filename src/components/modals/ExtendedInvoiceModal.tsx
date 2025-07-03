import {useTranslation} from 'react-i18next';
import {
  GeneralModalButtons,
  InvoiceModalInput,
  InvoiceType, ShopType,
  StyledSelectOption, TableRowType,
} from '../../interfaces/interfaces.ts';
import GeneralModal from './GeneralModal.tsx';
import FormRow from '../elements/FormRow.tsx';
import StyledInput from '../elements/StyledInput.tsx';
import StyledSelect from '../elements/StyledSelect.tsx';
import {ChangeEvent, useMemo, useState} from 'react';
import {invoiceStatusCodes} from '../../interfaces/constants.ts';
import {TableRowData} from 'jspdf';

export interface InvoiceItem {
  id?: number;
  lineNatureIndicator: 'SERVICE' | 'PRODUCT' | 'OTHER';
  product_code_category:
    | 'OWN'
    | 'VTSZ'
    | 'SZJ'
    | 'KN'
    | 'AHK'
    | 'CSK'
    | 'KT'
    | 'EJ'
    | 'TESZOR'
    | 'OTHER';
  product_code_value: string;
  line_description: string;
  quantity: number;
  unit_of_measure:
    | 'PIECE'
    | 'KILOGRAM'
    | 'TON'
    | 'KWH'
    | 'DAY'
    | 'HOUR'
    | 'MINUTE'
    | 'MONTH'
    | 'LITER'
    | 'KILOMETER'
    | 'CUBIC_METER'
    | 'METER'
    | 'LINEAR_METER'
    | 'CARTON'
    | 'PACK'
    | 'OWN';
  unit_price: number;
  line_net_amount: number;
  line_vat_rate: number;
  line_vat_amount: number;
  line_gross_amount: number;
}

export interface ExtendedInvoice {
  id?: number;
  invoice_user_id?: number;
  client_id?: number;
  number: string;
  invoice_issue_date: string;
  invoice_delivery_date: string;
  invoice_payment_date: string;
  invoice_category: 'SIMPLIFIED' | 'NORMAL' | 'AGGREGATE';
  invoice_currency: 'HUF';
  invoice_payment_method: 'CASH' | 'TRANSFER' | 'CARD' | 'VOUCHER' | 'OTHER';
  invoice_appearance: 'ELECTRONIC' | 'PAPER' | 'EDI' | 'UNKNOWN';
  invoice_exchange_rate: number;
  items: InvoiceItem[];
}

export default function ExtendedInvoiceModal({
                                       onClose,
                                               initialInvoice,
                                       onSave,
                                       inPlace,
                                       shops,
                                     }: Readonly<{
  onClose: () => void;
  initialInvoice: ExtendedInvoice;
  onSave: (invoice: ExtendedInvoice) => void;
  invoiceUsers: StyledSelectOption[];
  clients: StyledSelectOption[];
  inPlace?: boolean,
  shops: ShopType[]
}>) {
  const [invoice, setInvoice] = useState<ExtendedInvoice>(initialInvoice);
  const {t} = useTranslation();

  const translationPrefix = 'invoice.';
  const currencyName = 'Ft';

  const [items, setItems] = useState<InvoiceItem[]>(invoice.items || []);
  const defaultItemsToAdd = {
    lineNatureIndicator: 'SERVICE',
    product_code_category: 'OWN',
    product_code_value: 'Occurence',
    line_description: '',
    quantity: 1,
    unit_of_measure: 'OWN',
    unit_price: 1,
    line_net_amount: 1,
    line_vat_rate: '0',
    line_vat_amount: 0,
    line_gross_amount: 1,
  };
  const [itemToAdd, setItemToAdd] = useState<TableRow>(defaultItemsToAdd);

  const [invoiceCategory, setInvoiceCategory] = useState<
    'SIMPLIFIED' | 'NORMAL'
  >('SIMPLIFIED');
  const [lineVatRate, setLineVatRate] = useState<SelectOption[]>(
    lineVatRateSimplified
  );
  const [summary, setSummary] = useState({
    subTotal: 0,
    tax: 0,
    taxType: lineVatRate[0].label,
    total: 0,
  });

  useEffect(() => {
    setSummary(
      items.reduce(
        (sum, currentValue) => {
          sum.subTotal += Number(currentValue.line_net_amount);
          sum.tax += Number(currentValue.line_vat_amount);
          sum.total += Number(currentValue.line_gross_amount);
          const vatRate = lineVatRate.find(
            (v) => String(v.value) === String(currentValue.line_vat_rate)
          );
          if (vatRate) {
            sum.taxType = vatRate.label;
          }

          return sum;
        },
        {
          subTotal: 0,
          tax: 0,
          taxType: lineVatRate[0].label,
          total: 0,
        }
      )
    );
  }, [items, lineVatRate]);

  const deleteItem = (index: number) => {
    const updatedItems = [...invoice.items];
    updatedItems.splice(index, 1);
    setInvoice({...invoice, items: updatedItems});
  };

  const calculateFromUnitPrice = function (form: Record<string,string>) {
    if (form.quantity && form.quantity.includes(',')) {
      form.quantity = form.quantity.replace(',', '.');
    }
    if (typeof form.unit_price === 'string' && form.unit_price.includes(',')) {
      form.unit_price = form.unit_price.replace(',', '.');
    }

    const lineNetAmountData = parseInt(form.line_net_amount);
    const lineVatRate = parseFloat(form.line_vat_rate);
    // const ratePercentage  = parseFloat((lineVatRate*100).toFixed(2));

    const quantity = parseFloat(form.quantity);
    const unitPrice = parseInt(form.unit_price);

    if (invoiceCategory === 'SIMPLIFIED') {
      if (!Number.isNaN(quantity) && !Number.isNaN(unitPrice)) {
        form.line_gross_amount = quantity * unitPrice;
      }
      if (!Number.isNaN(form.line_gross_amount) && !Number.isNaN(lineVatRate)) {
        const vatValue = (form.line_gross_amount * lineVatRate).toFixed(2);
        form.line_vat_amount = vatValue;
        form.line_net_amount = form.line_gross_amount - Number(vatValue);
      }
    } else {
      if (!Number.isNaN(quantity) && !Number.isNaN(unitPrice)) {
        form.line_net_amount = quantity * unitPrice;
      }

      if (!Number.isNaN(lineNetAmountData) && !Number.isNaN(lineVatRate)) {
        form.line_vat_amount = (lineNetAmountData * lineVatRate).toFixed(2);
      }
      form.line_gross_amount = form.line_net_amount + form.line_vat_amount;
    }

    return form;
  };

  const invoiceStatuses = useMemo<StyledSelectOption[]>(
    () =>
      invoiceStatusCodes.map((status) => ({
        name: t(status.charAt(0).toUpperCase() + status.substring(1)),
        value: status,
      })),
    [t]
  );

  const shopOptions: StyledSelectOption[] = (shops || []).map((key) => {
    return {
      name: key.name,
      value: key.id,
    } as StyledSelectOption;
  });

  const selectMultiShopId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setInvoice({
      ...(invoice as InvoiceType),
      shop_id: [value],
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
      onClick: () => {
        if (invoice.status) {
          invoice[invoice.status] = new Date().getTime();
        }
        onSave(invoice);
      },
      value: t('Save'),
    },
    {
      onClick: onClose,
      value: t('Cancel'),
    },
  ];

  return (
    <GeneralModal
      buttons={buttons}
      inPlace={inPlace}
      title={t('Edit Invoice')}
      id={'InvoiceModal'}
    >
      <FormRow>
        <StyledInput
          type='text'
          name='name'
          value={invoice.name}
          onChange={(e) => changeType(e, 'name')}
          label={t('Name')}
        />

        <StyledInput
          type='text'
          name='tax'
          value={invoice.tax}
          onChange={(e) => changeType(e, 'tax')}
          label={t('Tax ID')}
        />
      </FormRow>

      <FormRow>
        <StyledInput
          type='text'
          name='address'
          value={invoice.address}
          onChange={(e) => changeType(e, 'address')}
          label={t('Address')}
        />
      </FormRow>
      <FormRow>
        <StyledInput
          type='text'
          name='email'
          value={invoice.email}
          onChange={(e) => changeType(e, 'email')}
          label={t('Email')}
        />

        <StyledInput
          type='text'
          name='phone'
          value={invoice.phone}
          onChange={(e) => changeType(e, 'phone')}
          label={t('Phone')}
        />
      </FormRow>
      <FormRow>
        <StyledSelect
          type='text'
          name='payment_method'
          value={invoice.payment_method ?? 'credit_card'}
          options={[
            {
              name: t('Credit Card'),
              value: 'credit_card',
            },
            {
              name: t('Cash'),
              value: 'cash',
            },
          ]}
          onSelect={(e) =>
            changeType(
              e as unknown as ChangeEvent<HTMLInputElement>,
              'payment_method'
            )
          }
          label={t('Payment method')}
        />

        <StyledInput
          type='text'
          name='total'
          value={invoice.total}
          onChange={(e) => changeType(e, 'total')}
          label={t('Total')}
        />
      </FormRow>
      <FormRow>
        <StyledSelect
          options={shopOptions}
          name='shop_id'
          value={invoice.shop_id?.[0] ?? shops[0]?.id}
          onSelect={(e) =>
            selectMultiShopId(e as unknown as ChangeEvent<HTMLInputElement>)
          }
          label={t('Assigned Shop')}
        />
        <StyledSelect
          options={invoiceStatuses}
          name='status'
          value={invoice.status}
          onSelect={(e) =>
            changeType(e as unknown as ChangeEvent<HTMLInputElement>, 'status')
          }
          label={t('Status')}
        />
      </FormRow>
      <FormRow>
        <StyledInput
          type='text'
          name='total'
          value={invoice.invoice_subject}
          onChange={(e) => changeType(e, 'invoice_subject')}
          label={t('Invoice subject')}
        />
        <StyledInput
          type='text'
          name='total'
          value={invoice.purchase_cost}
          onChange={(e) => changeType(e, 'purchase_cost')}
          label={t('Purchase cost')}
        />
      </FormRow>
      <FormRow>
        <StyledInput
          type='textarea'
          name='notes'
          value={invoice.notes}
          onChange={(e) => changeType(e, 'notes')}
          label={t('Note')}
        />
      </FormRow>
    </GeneralModal>
  );
}

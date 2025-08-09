import {useTranslation} from 'react-i18next';
import {
  GeneralModalButtons,
  InvoiceType,
  ShopType,
  StyledSelectOption,
} from '../../interfaces/interfaces.ts';
import GeneralModal from './GeneralModal.tsx';
import FormRow from '../elements/FormRow.tsx';
import StyledInput from '../elements/StyledInput.tsx';
import StyledSelect from '../elements/StyledSelect.tsx';
import {ChangeEvent, useEffect, useMemo, useState} from 'react';
import {invoiceStatusCodes} from '../../interfaces/constants.ts';
import {
  lineVatRateSimplified,
  lineVatRateNormal,
} from '../../utils/invoiceUtils.ts';

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

export interface ExtendedInvoice extends InvoiceType {
  id: string;
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
  inPlace?: boolean;
  shops: ShopType[];
}>) {
  const [invoice, setInvoice] = useState<ExtendedInvoice>(initialInvoice);
  const {t} = useTranslation();

  const currencyName = 'Ft';

  const normalizeItem = (it: Partial<InvoiceItem>): InvoiceItem => {
    const category =
      (it.product_code_category as InvoiceItem['product_code_category']) ??
      'OWN';
    const val =
      category === 'OWN' ? (it.product_code_value ?? 'Occurence') : '';
    return {
      id: it.id ?? Date.now(),
      lineNatureIndicator:
        (it.lineNatureIndicator as InvoiceItem['lineNatureIndicator']) ??
        'SERVICE',
      product_code_category: category,
      product_code_value: val,
      line_description: it.line_description ?? '',
      quantity:
        typeof it.quantity === 'number'
          ? it.quantity
          : it.quantity
            ? Number(it.quantity)
            : 1,
      unit_of_measure:
        (it.unit_of_measure as InvoiceItem['unit_of_measure']) ?? 'OWN',
      unit_price:
        typeof it.unit_price === 'number'
          ? it.unit_price
          : it.unit_price
            ? Number(it.unit_price)
            : 1,
      line_net_amount:
        typeof it.line_net_amount === 'number'
          ? it.line_net_amount
          : it.line_net_amount
            ? Number(it.line_net_amount)
            : 1,
      line_vat_rate:
        typeof it.line_vat_rate === 'number'
          ? it.line_vat_rate
          : it.line_vat_rate
            ? Number(it.line_vat_rate)
            : 0,
      line_vat_amount:
        typeof it.line_vat_amount === 'number'
          ? it.line_vat_amount
          : it.line_vat_amount
            ? Number(it.line_vat_amount)
            : 0,
      line_gross_amount:
        typeof it.line_gross_amount === 'number'
          ? it.line_gross_amount
          : it.line_gross_amount
            ? Number(it.line_gross_amount)
            : 1,
    };
  };

  const [items, setItems] = useState<InvoiceItem[]>(
    (invoice.items || []).map((it) => normalizeItem(it))
  );

  const [invoiceCategory, setInvoiceCategory] = useState<
    'SIMPLIFIED' | 'NORMAL'
  >(initialInvoice.invoice_category === 'NORMAL' ? 'NORMAL' : 'SIMPLIFIED');
  const [lineVatRate, setLineVatRate] = useState<StyledSelectOption[]>(
    initialInvoice.invoice_category === 'NORMAL'
      ? lineVatRateNormal
      : lineVatRateSimplified
  );
  const [summary, setSummary] = useState({
    subTotal: 0,
    tax: 0,
    taxType: lineVatRate[0].name,
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
            sum.taxType = vatRate.name;
          }

          return sum;
        },
        {
          subTotal: 0,
          tax: 0,
          taxType: lineVatRate[0].name,
          total: 0,
        }
      )
    );
  }, [items, lineVatRate]);

  const calculateFromUnitPrice = function (
    form: Record<string, string | number>
  ) {
    if (typeof form.quantity === 'string' && form.quantity.includes(',')) {
      form.quantity = form.quantity.replace(',', '.');
    }
    if (typeof form.unit_price === 'string' && form.unit_price.includes(',')) {
      form.unit_price = form.unit_price.replace(',', '.');
    }

    const lineNetAmountData = parseFloat(form.line_net_amount as string);
    const lineVatRate = parseFloat(form.line_vat_rate as string);

    const quantity = parseFloat(form.quantity as string);
    const unitPrice = parseFloat(form.unit_price as string);

    if (invoiceCategory === 'SIMPLIFIED') {
      if (!Number.isNaN(quantity) && !Number.isNaN(unitPrice)) {
        form.line_gross_amount = quantity * unitPrice;
      } else {
        form.line_gross_amount = Number(form.line_gross_amount);
      }
      if (!Number.isNaN(form.line_gross_amount) && !Number.isNaN(lineVatRate)) {
        const vatValue = Number(
          (Number(form.line_gross_amount) * lineVatRate).toFixed(2)
        );
        form.line_vat_amount = vatValue;
        form.line_net_amount =
          Number(form.line_gross_amount) - Number(vatValue);
      }
    } else {
      if (!Number.isNaN(quantity) && !Number.isNaN(unitPrice)) {
        form.line_net_amount = Number((quantity * unitPrice).toFixed(2));
      }

      if (!Number.isNaN(lineNetAmountData) && !Number.isNaN(lineVatRate)) {
        form.line_vat_amount = Number(
          (lineNetAmountData * lineVatRate).toFixed(2)
        );
      }
      form.line_gross_amount =
        Number(form.line_net_amount) + Number(form.line_vat_amount);
    }

    // ensure numeric types
    form.quantity = Number(quantity);
    form.unit_price = Number(unitPrice);

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
      ...(invoice as ExtendedInvoice),
      shop_id: [value],
    });
  };

  const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const value = e.target.value;

    const obj = {...invoice};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    obj[key] = value;

    setInvoice(obj as ExtendedInvoice);
  };

  if (!invoice) {
    return null;
  }

  const buttons: GeneralModalButtons[] = [
    {
      primary: true,
      onClick: () => {
        const toSave: ExtendedInvoice = {
          ...invoice,
          items: items,
          invoice_category: invoiceCategory,
          // keep total as string, but if empty, set from summary
          total:
            (invoice.total ?? '').toString() ||
            String(Number(summary.total).toFixed(2)),
        };
        if (toSave.status === 'done') {
          toSave.done = new Date().getTime();
        } else if (toSave.status === 'created') {
          toSave.created = new Date().getTime();
        }
        onSave(toSave);
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

      {/* Invoice category and VAT rate mode */}
      <FormRow>
        <StyledSelect
          name='invoice_category'
          value={invoiceCategory}
          options={[
            {name: t('Simplified'), value: 'SIMPLIFIED'},
            {name: t('Normal'), value: 'NORMAL'},
          ]}
          onSelect={(e) => {
            const value = (e.target as HTMLSelectElement).value as
              | 'SIMPLIFIED'
              | 'NORMAL';
            setInvoiceCategory(value);
            setLineVatRate(
              value === 'SIMPLIFIED' ? lineVatRateSimplified : lineVatRateNormal
            );
          }}
          label={t('Invoice category')}
        />
        <div />
      </FormRow>

      {/* Items editor table */}
      <div className='mt-4'>
        <div className='flex justify-between items-center mb-2'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-100'>
            {t('Items')}
          </h3>
          <button
            type='button'
            className='px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600'
            onClick={() => {
              const newItem: InvoiceItem = {
                id: Date.now(),
                lineNatureIndicator: 'SERVICE',
                product_code_category: 'OWN',
                product_code_value: 'Occurence',
                line_description: '',
                quantity: 1,
                unit_of_measure: 'OWN',
                unit_price: 1,
                line_net_amount: 1,
                line_vat_rate: 0,
                line_vat_amount: 0,
                line_gross_amount: 1,
              };
              const calculated = calculateFromUnitPrice({...newItem});
              setItems((prev) => [
                ...prev,
                calculated as unknown as InvoiceItem,
              ]);
            }}
            data-testid='add-item'
          >
            {t('Add item')}
          </button>
        </div>

        {/* Header */}
        <div className='grid grid-cols-12 gap-2 text-sm font-medium px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'>
          <div>{t('Nature')}</div>
          <div>{t('Code Cat')}</div>
          <div>{t('Code')}</div>
          <div className='col-span-3'>{t('Description')}</div>
          <div>{t('Qty')}</div>
          <div>{t('Unit')}</div>
          <div>{t('Unit price')}</div>
          <div>{t('VAT rate')}</div>
          <div>{t('Net')}</div>
          <div>{t('VAT')}</div>
          <div>{t('Gross')}</div>
          <div></div>
        </div>

        {/* Rows */}
        {items.map((it, idx) => (
          <div
            key={it.id ?? idx}
            className='grid grid-cols-12 gap-2 items-center px-2 py-2 border-b border-gray-200 dark:border-gray-700'
          >
            <div>
              <StyledSelect
                value={it.lineNatureIndicator}
                onSelect={(e) => {
                  const next = [...items];
                  next[idx] = {
                    ...next[idx],
                    lineNatureIndicator: (e.target as HTMLSelectElement)
                      .value as InvoiceItem['lineNatureIndicator'],
                  };
                  setItems(next);
                }}
                name={`nature_${idx}`}
                label={false}
                options={['SERVICE', 'PRODUCT', 'OTHER'].map((u) => ({
                  name: u,
                  value: u,
                }))}
                compact
              />
            </div>
            <div>
              <StyledSelect
                value={it.product_code_category}
                onSelect={(e) => {
                  const newCat = (e.target as HTMLSelectElement)
                    .value as InvoiceItem['product_code_category'];
                  const next = [...items];
                  next[idx] = {
                    ...next[idx],
                    product_code_category: newCat,
                    product_code_value:
                      newCat === 'OWN'
                        ? next[idx].product_code_value || 'Occurence'
                        : '',
                  };
                  setItems(next);
                }}
                name={`pcc_${idx}`}
                label={false}
                options={[
                  'OWN',
                  'VTSZ',
                  'SZJ',
                  'KN',
                  'AHK',
                  'CSK',
                  'KT',
                  'EJ',
                  'TESZOR',
                  'OTHER',
                ].map((u) => ({name: u, value: u}))}
                compact
              />
            </div>
            <div>
              <StyledInput
                value={it.product_code_value}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = {
                    ...next[idx],
                    product_code_value: e.target.value,
                  };
                  setItems(next);
                }}
                disabled={it.product_code_category !== 'OWN'}
                placeholder={
                  it.product_code_category !== 'OWN'
                    ? (t('Only for OWN') as string)
                    : undefined
                }
              />
            </div>
            <div className='col-span-3'>
              <StyledInput
                value={it.line_description}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = {...next[idx], line_description: e.target.value};
                  setItems(next);
                }}
                placeholder={t('Item description') as string}
              />
            </div>
            <div>
              <StyledInput
                type='number'
                value={it.quantity}
                onChange={(e) => {
                  const next = [...items];
                  const form = calculateFromUnitPrice({
                    ...next[idx],
                    quantity: e.target.value,
                  });
                  next[idx] = form as unknown as InvoiceItem;
                  setItems(next);
                }}
              />
            </div>
            <div>
              <StyledSelect
                value={it.unit_of_measure}
                onSelect={(e) => {
                  const next = [...items];
                  next[idx] = {
                    ...next[idx],
                    unit_of_measure: (e.target as HTMLSelectElement)
                      .value as InvoiceItem['unit_of_measure'],
                  };
                  setItems(next);
                }}
                name={`unit_${idx}`}
                label={false}
                options={[
                  'PIECE',
                  'KILOGRAM',
                  'TON',
                  'KWH',
                  'DAY',
                  'HOUR',
                  'MINUTE',
                  'MONTH',
                  'LITER',
                  'KILOMETER',
                  'CUBIC_METER',
                  'METER',
                  'LINEAR_METER',
                  'CARTON',
                  'PACK',
                  'OWN',
                ].map((u) => ({name: u, value: u}))}
                compact
              />
            </div>
            <div>
              <StyledInput
                type='number'
                value={it.unit_price}
                onChange={(e) => {
                  const next = [...items];
                  const form = calculateFromUnitPrice({
                    ...next[idx],
                    unit_price: e.target.value,
                  });
                  next[idx] = form as unknown as InvoiceItem;
                  setItems(next);
                }}
              />
            </div>
            <div>
              <StyledSelect
                value={String(it.line_vat_rate)}
                onSelect={(e) => {
                  const next = [...items];
                  const form = calculateFromUnitPrice({
                    ...next[idx],
                    line_vat_rate: (e.target as HTMLSelectElement).value,
                  });
                  next[idx] = form as unknown as InvoiceItem;
                  setItems(next);
                }}
                name={`vat_${idx}`}
                label={false}
                options={lineVatRate.map((opt) => ({
                  name: opt.name,
                  value: String(opt.value),
                }))}
                compact
              />
            </div>
            <div>
              <StyledInput value={Number(it.line_net_amount).toFixed(2)} />
            </div>
            <div>
              <StyledInput value={Number(it.line_vat_amount).toFixed(2)} />
            </div>
            <div>
              <StyledInput value={Number(it.line_gross_amount).toFixed(2)} />
            </div>
            <div>
              <button
                type='button'
                className='px-2 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600'
                onClick={() => {
                  const next = [...items];
                  next.splice(idx, 1);
                  setItems(next);
                }}
                data-testid={`delete-item-${idx}`}
              >
                {t('Delete')}
              </button>
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className='flex justify-end gap-6 mt-3 text-sm'>
          <div>
            {t('Subtotal')}: {Number(summary.subTotal).toFixed(2)}{' '}
            {currencyName}
          </div>
          <div>
            {t('Tax')} ({summary.taxType}): {Number(summary.tax).toFixed(2)}{' '}
            {currencyName}
          </div>
          <div className='font-semibold'>
            {t('Total')}: {Number(summary.total).toFixed(2)} {currencyName}
          </div>
        </div>
      </div>

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

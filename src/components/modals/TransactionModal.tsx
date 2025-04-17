import {
  GeneralModalButtons,
  ShopType,
  Transaction,
  StyledSelectOption,
} from '../../interfaces/interfaces.ts';
import {useTranslation} from 'react-i18next';
import GeneralModal from './GeneralModal.tsx';
import FormRow from '../elements/FormRow.tsx';
import StyledInput from '../elements/StyledInput.tsx';
import StyledSelect from '../elements/StyledSelect.tsx';
import {ChangeEvent} from 'react';
import {
  documentTypes,
  paymentMethods,
  transactionItemTypes,
  transactionTypes,
} from '../../interfaces/constants.ts';

export interface TransactionModalProps {
  onClose: () => void;
  onSave: (item: Transaction) => Promise<void>;
  setTransaction: (item: Transaction) => void;
  transaction: Transaction | null;
  inPlace: boolean;
  shops: ShopType[];
}

export default function TransactionModal({
  onClose,
  onSave,
  setTransaction,
  transaction,
  inPlace,
  shops,
}: TransactionModalProps) {
  const {t} = useTranslation();

  const shopOptions: StyledSelectOption[] = (shops || []).map((key) => {
    return {
      name: key.name,
      value: key.id,
    } as StyledSelectOption;
  });

  const selectMultiShopId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setTransaction({
      ...(transaction as Transaction),
      shop_id: [value],
    });
  };

  const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const value = e.target.value;

    const obj = {...transaction};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    obj[key] = value;

    setTransaction(obj as Transaction);
  };

  if (!transaction) {
    return null;
  }

  const buttons: GeneralModalButtons[] = [
    {
      primary: true,
      onClick: () => {
        onSave(transaction);
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
      title={t('Edit Transaction')}
      id={'TransactionModal'}
    >
      <FormRow>
        <StyledInput
          type='text'
          name='name'
          value={transaction.name}
          onChange={(e) => changeType(e, 'name')}
          label={t('Name/Tag')}
        />

        <StyledSelect
          type='text'
          name='item_type'
          value={transaction.item_type}
          options={transactionItemTypes}
          onSelect={(e) =>
            changeType(
              e as unknown as ChangeEvent<HTMLInputElement>,
              'item_type'
            )
          }
          label={t('Item type')}
        />

        <StyledSelect
          options={shopOptions}
          name='shop_id'
          value={transaction.shop_id?.[0] ?? shops[0]?.id}
          onSelect={(e) =>
            selectMultiShopId(e as unknown as ChangeEvent<HTMLInputElement>)
          }
          label={t('Assigned Shop')}
        />
      </FormRow>

      <FormRow>
        <StyledSelect
          type='text'
          name='payment_method'
          value={transaction.payment_method}
          options={paymentMethods}
          onSelect={(e) =>
            changeType(
              e as unknown as ChangeEvent<HTMLInputElement>,
              'payment_method'
            )
          }
          label={t('Payment Method')}
        />
        <StyledSelect
          type='text'
          name='document_type'
          value={transaction.document_type}
          options={documentTypes}
          onSelect={(e) =>
            changeType(
              e as unknown as ChangeEvent<HTMLInputElement>,
              'document_type'
            )
          }
          label={t('Document Type')}
        />
        <StyledSelect
          type='text'
          name='type'
          value={transaction.transaction_type}
          options={transactionTypes}
          onSelect={(e) =>
            changeType(
              e as unknown as ChangeEvent<HTMLInputElement>,
              'transaction_type'
            )
          }
          label={t('Type')}
        />
      </FormRow>
      <FormRow>
        <StyledInput
          type='text'
          name='cost'
          value={transaction.cost}
          onChange={(e) => changeType(e, 'cost')}
          label={t('Cost')}
        />
        <StyledInput
          type='text'
          name='net_amount'
          value={transaction.net_amount}
          onChange={(e) => changeType(e, 'net_amount')}
          label={t('Net amount')}
        />
        <StyledInput
          type='text'
          name='gross_amount'
          value={transaction.gross_amount}
          onChange={(e) => changeType(e, 'gross_amount')}
          label={t('Gross amount')}
        />
      </FormRow>
    </GeneralModal>
  );
}

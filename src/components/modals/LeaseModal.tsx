import type {
  GeneralModalButtons,
  Lease,
  LeaseModalProps,
} from '../../interfaces/interfaces.ts';
import { leaseStatusList } from '../../interfaces/interfaces.ts';
import { useTranslation } from 'react-i18next';
import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import SignaturePad from 'react-signature-pad-wrapper';
import FormRow from '../elements/FormRow.tsx';
import StyledInput from '../elements/StyledInput.tsx';
import GeneralModal from './GeneralModal.tsx';
import StyledSelect from '../elements/StyledSelect.tsx';
import { getTranslatedSelectOptions } from '../../utils/translation.ts';

export default function LeaseModal({
  id,
  onClose,
  lease,
  setLease,
  onSave,
  inPlace,
  settings,
}: LeaseModalProps) {
  const { t } = useTranslation();
  const signaturePadRef = useRef<SignaturePad>(null);

  const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const value = e.target.value;

    const obj = { ...lease };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    obj[key] = value;

    setLease(obj as Lease);
  };

  const buttons: GeneralModalButtons[] = [
    {
      primary: true,
      onClick: () => {
        const signaturePad = signaturePadRef.current;
        if (signaturePad && signaturePad.isEmpty()) {
          alert(t('You must sign before you save.'));
          return false;
        } else if (signaturePad) {
          lease.signature = signaturePad.toDataURL('image/jpeg');
        }
        return onSave(lease);
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
      title={lease.onUpdate ? t('Rental Return Form') : t('Rental Form')}
      id={id || 'ServiceModal'}
    >
      <h3 className="font-semibold text-center text-lg sm:text-xl text-gray-700 mt-2 mb-1">
        {t('Client')}
      </h3>
      <FormRow>
        <StyledInput
          type="text"
          name="client_name"
          value={lease.client_name}
          onChange={(e) => changeType(e, 'client_name')}
          label={t('Name')}
        />
        <StyledInput
          type="text"
          name="client_address"
          value={lease.client_address}
          onChange={(e) => changeType(e, 'client_address')}
          label={t('Address')}
        />
      </FormRow>

      <FormRow>
        <StyledInput
          type="text"
          name="client_phone"
          value={lease.client_phone}
          onChange={(e) => changeType(e, 'client_phone')}
          label={t('Phone')}
        />
        <StyledInput
          type="text"
          name="client_email"
          value={lease.client_email}
          onChange={(e) => changeType(e, 'client_email')}
          label={t('Email')}
        />
      </FormRow>

      <FormRow>
        <StyledInput
          type="text"
          name="client_identity_card"
          value={lease.client_identity_card}
          onChange={(e) => changeType(e, 'client_identity_card')}
          label={t('Identity Card')}
        />
        <StyledInput
          type="text"
          name="client_resident_card"
          value={lease.client_resident_card}
          onChange={(e) => changeType(e, 'client_resident_card')}
          label={t('Resident Card')}
        />
      </FormRow>

      {!lease.onUpdate && (
        <h3 className="font-semibold text-center text-lg sm:text-xl text-gray-700 mt-2">
          {t('Renter')}
        </h3>
      )}

      {!lease.onUpdate && (
        <FormRow>
          <StyledInput
            type="text"
            name="service_name"
            value={lease.service_name}
            onChange={() => false}
            label={t('Name')}
          />
        </FormRow>
      )}

      {!lease.onUpdate && (
        <FormRow>
          <StyledInput
            type="text"
            name="service_address"
            value={lease.service_address}
            onChange={() => false}
            label={t('Address')}
          />
          <StyledInput
            type="text"
            name="service_email"
            value={lease.service_email}
            onChange={() => false}
            label={t('Email')}
          />
        </FormRow>
      )}

      <h3 className="font-semibold text-center text-lg sm:text-xl text-gray-700 mt-2">
        {t('Item and rental details')}
      </h3>

      <FormRow>
        <StyledInput
          type="textarea"
          name="description"
          value={lease.description}
          onChange={(e) => changeType(e, 'description')}
          label={t('Description')}
        />
      </FormRow>

      <FormRow>
        <StyledSelect
          options={getTranslatedSelectOptions(leaseStatusList, t)}
          name="lease_status"
          value={lease.lease_status}
          onSelect={(e) =>
            changeType(
              e as unknown as ChangeEvent<HTMLInputElement>,
              'lease_status',
            )
          }
          label={t('status')}
        />
      </FormRow>

      <FormRow>
        <StyledInput
          type="text"
          name="accessories"
          value={lease.accessories}
          onChange={(e) => changeType(e, 'accessories')}
          label={t('Accessories')}
        />
        {!lease.onUpdate && (
          <StyledInput
            type="text"
            name="expected_cost"
            value={lease.expected_cost}
            onChange={(e) => changeType(e, 'expected_cost')}
            label={t('Expected cost')}
          />
        )}
      </FormRow>

      {!lease.onUpdate && (
        <pre
          className={
            settings?.rentalConditions
              ? 'mt-2 mb-2 max-w-full overflow-x-auto text-sm sm:text-base'
              : ''
          }
        >
          {settings?.rentalConditions}
        </pre>
      )}

      {!lease.onUpdate && (
        <h3 className="font-semibold text-center text-lg sm:text-xl text-gray-700 mb-4">
          {t('Signature')}
        </h3>
      )}

      {!lease.onUpdate && (
        <FormRow>
          <div className="relative w-full max-w-[40rem] h-60 sm:h-80 border border-gray-600 self-center justify-self-center">
            <SignaturePad
              ref={signaturePadRef}
              debounceInterval={500}
              options={{
                minWidth: 0.5,
                maxWidth: 2.5,
                //dotSize: 1,
                backgroundColor: 'white',
                penColor: 'rgb(76,76,76)',
              }}
            />
          </div>
        </FormRow>
      )}
    </GeneralModal>
  );
}

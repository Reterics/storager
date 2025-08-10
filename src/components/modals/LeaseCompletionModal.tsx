import type {
  GeneralModalButtons,
  LeaseCompletionModalProps,
  ServiceCompleteData,
} from '../../interfaces/interfaces.ts';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import SignaturePad from 'react-signature-pad-wrapper';
import GeneralModal from './GeneralModal.tsx';
import FormRow from '../elements/FormRow.tsx';
import StyledInput from '../elements/StyledInput.tsx';

export default function LeaseCompletionModal({
  id,
  onClose,
  formData,
  setFromData,
  onSave,
  inPlace,
}: LeaseCompletionModalProps) {
  const { t } = useTranslation();
  const signaturePadRef = useRef<SignaturePad>(null);

  const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const value = e.target.value;

    const obj = { ...formData };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    obj[key] = value;

    setFromData(obj as ServiceCompleteData);
  };

  const buttons: GeneralModalButtons[] = [
    {
      primary: true,
      onClick: () => {
        const signaturePad = signaturePadRef.current;
        if (signaturePad?.isEmpty()) {
          alert(t('You must sign before you save.'));
          return false;
        } else if (signaturePad) {
          formData.signature = signaturePad.toDataURL('image/jpeg');
        }

        return onSave(formData);
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
      title={t('Rental Return Form')}
      id={id || 'LeaseCompletionModal'}
    >
      <h3 className="font-semibold text-center text-lg sm:text-xl text-gray-700 mt-2 mb-1">
        {t('Client')}
      </h3>
      <FormRow>
        <StyledInput
          type="text"
          name="client_name"
          value={formData.client_name}
          onChange={(e) => changeType(e, 'client_name')}
          label={t('Name')}
        />
      </FormRow>

      <FormRow>
        <StyledInput
          type="text"
          name="client_phone"
          value={formData.client_phone}
          onChange={(e) => changeType(e, 'client_phone')}
          label={t('Phone')}
        />
        <StyledInput
          type="text"
          name="client_email"
          value={formData.client_email}
          onChange={(e) => changeType(e, 'client_email')}
          label={t('Email')}
        />
      </FormRow>

      <h3 className="font-semibold text-center text-lg sm:text-xl text-gray-700 mt-2">
        {t('Recipient')}
      </h3>

      <FormRow>
        <StyledInput
          type="text"
          name="service_name"
          value={formData.service_name}
          onChange={() => false}
          label={t('Name')}
        />
      </FormRow>

      <FormRow>
        <StyledInput
          type="text"
          name="service_address"
          value={formData.service_address}
          onChange={() => false}
          label={t('Address')}
        />
        <StyledInput
          type="text"
          name="service_email"
          value={formData.service_email}
          onChange={() => false}
          label={t('Email')}
        />
      </FormRow>

      <h3 className="font-semibold text-center text-lg sm:text-xl text-gray-700 mt-2">
        {t('Item and rental details')}
      </h3>

      <FormRow>
        <StyledInput
          type="textarea"
          name="description"
          value={formData.description}
          onChange={(e) => changeType(e, 'description')}
          label={t('Description')}
        />
      </FormRow>

      <FormRow>
        <StyledInput
          type="text"
          name="accessories"
          value={formData.accessories}
          onChange={(e) => changeType(e, 'accessories')}
          label={t('Accessories')}
        />
      </FormRow>

      <FormRow>
        <StyledInput
          type="text"
          name="lease_date"
          value={formData.lease_date}
          onChange={() => false}
          label={t('Lease Date')}
        />
        <StyledInput
          type="text"
          name="rental_cost"
          value={formData.rental_cost}
          onChange={(e) => changeType(e, 'rental_cost')}
          label={t('Rental cost')}
        />
      </FormRow>

      <FormRow>
        <StyledInput
          type="textarea"
          name="rental_description"
          value={formData.rental_description}
          onChange={(e) => changeType(e, 'rental_description')}
          label={t('Rental Description')}
        />
      </FormRow>

      <FormRow>
        <StyledInput
          type="text"
          name="date"
          value={formData.date}
          onChange={(e) => changeType(e, 'date')}
          label={t('Date')}
        />
        <div></div>
      </FormRow>

      <h3 className="font-semibold text-center text-lg sm:text-xl text-gray-700 mb-4">
        {t('Signature')}
      </h3>
      <FormRow>
        <div className="relative w-full max-w-[28rem] h-48 sm:h-56 border border-gray-600 self-center mb-2 justify-self-center">
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
    </GeneralModal>
  );
}

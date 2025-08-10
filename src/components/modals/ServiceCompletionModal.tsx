import type {
  GeneralModalButtons,
  ServiceCompleteData,
  ServiceCompletionModalInput,
} from '../../interfaces/interfaces.ts';
import StyledInput from '../elements/StyledInput.tsx';
import { useTranslation } from 'react-i18next';
import SignaturePad from 'react-signature-pad-wrapper';
import type { ChangeEvent } from 'react';
import { useContext, useRef } from 'react';
import GeneralModal from './GeneralModal.tsx';
import FormRow from '../elements/FormRow.tsx';
import StyledSelect from '../elements/StyledSelect.tsx';
import StyledMultiSelect from '../elements/StyledMultiSelect.tsx';
import { DBContext } from '../../database/DBContext.ts';

export default function ServiceCompletionModal({
  id,
  onClose,
  formData,
  setFromData,
  onSave,
  inPlace,
}: ServiceCompletionModalInput) {
  const { t, i18n } = useTranslation();
  const dbContext = useContext(DBContext);
  const signaturePadRef = useRef<SignaturePad>(null);

  const serviceTypeOptions =
    dbContext?.getType('service', i18n.language === 'hu' ? 'hu' : 'en') || [];

  const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const value = e.target.value;

    const obj = { ...formData };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    obj[key] = value;

    setFromData(obj as ServiceCompleteData);
  };

  if (!formData) return null;

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

  const selectMultiType = (type: string[]) => {
    setFromData({ ...formData, type: type.join(',') });
  };

  return (
    <GeneralModal
      buttons={buttons}
      inPlace={inPlace}
      title={t('Service Completion Form')}
      id={id || 'ServiceCompletionModal'}
    >
      <h3 className="font-semibold text-center text-xl text-gray-700 mt-2 mb-1">
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

      <h3 className="font-semibold text-center text-xl text-gray-700 mt-2">
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

      <h3 className="font-semibold text-center text-xl text-gray-700 mt-2">
        {t('Item and service details')}
      </h3>

      <FormRow>
        <StyledMultiSelect
          name="type"
          options={serviceTypeOptions}
          value={(formData.type || '').split(',')}
          onSelect={selectMultiType}
          label={t('Type')}
        />

        <StyledInput
          type="textarea"
          name="description"
          value={formData.description}
          onChange={(e) => changeType(e, 'description')}
          label={t('Error Description')}
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
        <StyledSelect
          options={[
            { name: 'Yes', value: 'yes' },
            { name: 'No', value: 'no' },
          ]}
          name="guaranteed"
          value={formData.guaranteed}
          onSelect={(e) =>
            changeType(
              e as unknown as ChangeEvent<HTMLInputElement>,
              'guaranteed',
            )
          }
          label={t('Guaranteed')}
        />
      </FormRow>

      <FormRow>
        <StyledInput
          type="text"
          name="service_date"
          value={formData.service_date}
          onChange={() => false}
          label={t('Service Date')}
        />
        <StyledInput
          type="text"
          name="repair_cost"
          value={formData.repair_cost}
          onChange={(e) => changeType(e, 'repair_cost')}
          label={t('Repair cost')}
        />
      </FormRow>

      <FormRow>
        <StyledInput
          type="textarea"
          name="repair_description"
          value={formData.repair_description}
          onChange={(e) => changeType(e, 'repair_description')}
          label={t('Repair Description')}
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

      <h3 className="font-semibold text-center text-xl text-gray-700 mb-4">
        {t('Signature')}
      </h3>
      <FormRow>
        <div className="relative w-[28rem] h-56 border border-gray-600 self-center mb-2 justify-self-center">
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

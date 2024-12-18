import {GeneralModalButtons, ServiceData, ServiceModalInput} from "../../interfaces/interfaces.ts";
import StyledInput from "../elements/StyledInput.tsx";
import {useTranslation} from "react-i18next";
import SignaturePad from "react-signature-pad-wrapper";
import {ChangeEvent, useContext, useRef} from "react";
import GeneralModal from "./GeneralModal.tsx";
import FormRow from "../elements/FormRow.tsx";
import StyledSelect from "../elements/StyledSelect.tsx";
import StyledMultiSelect from "../elements/StyledMultiSelect.tsx";
import './ServiceModal.css';
import {DBContext} from "../../database/DBContext.ts";

export default function ServiceModal({ id, onClose, service, setService, onSave, inPlace, settings }: ServiceModalInput) {
    const { t, i18n } = useTranslation();
    const dbContext = useContext(DBContext);
    const signaturePadRef = useRef<SignaturePad>(null);

    const serviceTypeOptions = dbContext?.getType('service', i18n.language === 'hu' ? 'hu' : 'en') || [];

    const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.target.value;

        const obj = {...service};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        obj[key] = value;

        setService(obj as ServiceData);
    };

    if (!service) return null;

    const buttons: GeneralModalButtons[] = [
        {
            primary: true,
            onClick: () => {
                const signaturePad = signaturePadRef.current;
                if (signaturePad && signaturePad.isEmpty()) {
                    alert(t('You must sign before you save.'))
                    return false;
                } else if (signaturePad) {
                    service.signature = signaturePad.toDataURL("image/jpeg");
                }
                return onSave(service)
            },
            value: t('Save')
        },
        {
            onClick: onClose,
            value: t('Cancel')
        }
    ];



    const selectMultiType = (type: string[])=>{
        setService({...service, type: type.join(',')} as ServiceData);
    }


    return (
        <GeneralModal buttons={buttons} inPlace={inPlace}
                      title={
                          service.onUpdate ? t('Service Form') :
                              t('Service Acceptance Form')
                      } id={id || "ServiceModal"}
        >
            <h3 className="font-semibold text-center text-xl text-gray-700 mt-2 mb-1">
                {t('Client')}
            </h3>
            <FormRow>
                <StyledInput
                    type="text" name="client_name"
                    value={service.client_name}
                    onChange={(e) => changeType(e, 'client_name')}
                    label={t('Name')}
                />
            </FormRow>

            <FormRow>
                <StyledInput
                    type="text" name="client_phone"
                    value={service.client_phone}
                    onChange={(e) => changeType(e, 'client_phone')}
                    label={t("Phone")}
                />
                <StyledInput
                    type="text" name="client_email"
                    value={service.client_email}
                    onChange={(e) => changeType(e, 'client_email')}
                    label={t('Email')}
                />
            </FormRow>

            {!service.onUpdate && <h3 className="font-semibold text-center text-xl text-gray-700 mt-2">
                {t('Recipient')}
            </h3>}

            {!service.onUpdate && <FormRow>
                <StyledInput
                    type="text" name="service_name"
                    value={service.service_name}
                    onChange={() => false}
                    label={t('Name')}
                />
            </FormRow>}

            {!service.onUpdate && <FormRow>
                <StyledInput
                    type="text" name="service_address"
                    value={service.service_address}
                    onChange={() => false}
                    label={t('Address')}
                />
                <StyledInput
                    type="text" name="service_email"
                    value={service.service_email}
                    onChange={() => false}
                    label={t('Email')}
                />
            </FormRow>}

            <h3 className="font-semibold text-center text-xl text-gray-700 mt-2">
                {t('Item and service details')}
            </h3>

            <FormRow>
                <StyledMultiSelect
                    name="type"
                    options={serviceTypeOptions}
                    value={(service.type || '').split(',')}
                    onSelect={selectMultiType}
                    label={t("Type")}
                />

                <StyledInput
                    type="textarea" name="description"
                    value={service.description}
                    onChange={(e) => changeType(e, 'description')}
                    label={t("Description")}
                />
            </FormRow>

            <FormRow>
                <StyledSelect
                    options={
                        [
                            'status_accepted',
                            'status_in_progress',
                            'status_waiting_parts',
                            'status_waiting_feedback',
                            'status_ready',
                            'status_delivered',
                        ]
                            .map(text => {
                                return {name: t(text), value: text}
                            })
                    }
                    name="serviceStatus"
                    value={service.serviceStatus}
                    onSelect={(e) => changeType(e as unknown as ChangeEvent<HTMLInputElement>, 'serviceStatus')}
                    label={t("status")}
                />
                <StyledSelect
                    options={[{name: t('Yes'), value: 'yes'}, {name: t('No'), value: 'no'}]}
                    name="guaranteed"
                    value={service.guaranteed}
                    onSelect={(e) => changeType(e as unknown as ChangeEvent<HTMLInputElement>, 'guaranteed')}
                    label={t("Guaranteed")}
                />
            </FormRow>

            <FormRow>
                <StyledInput
                    type="text" name="accessories"
                    value={service.accessories}
                    onChange={(e) => changeType(e, 'accessories')}
                    label={t("Accessories")}
                />
                {!service.onUpdate &&
                    <StyledInput
                        type="text" name="expected_cost"
                        value={service.expected_cost}
                        onChange={(e) => changeType(e, 'expected_cost')}
                        label={t("Expected cost")}
                    />
                }
            </FormRow>

            {!service.onUpdate && <pre
                className={settings?.serviceAgreement ? 'mt-2 mb-2 max-w-[80vw]' : ''}>{settings?.serviceAgreement}</pre>
            }

            {!service.onUpdate && <h3 className="font-semibold text-center text-xl text-gray-700 mb-4">
                {t('Signature')}
            </h3>}
            {!service.onUpdate && <FormRow>
                <div
                    className="relative w-[40rem] h-80 border border-gray-600 self-center justify-self-center">
                    <SignaturePad ref={signaturePadRef}
                                  debounceInterval={500}
                                  options={{
                                      minWidth: 0.5,
                                      maxWidth: 2.5,
                                      //dotSize: 1,
                                      backgroundColor: 'white',
                                      penColor: 'rgb(76,76,76)'
                                  }}/>
                </div>
            </FormRow>}
        </GeneralModal>
    )
}

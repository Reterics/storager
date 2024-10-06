import {GeneralModalButtons, ServiceData, ServiceModalInput} from "../../interfaces/interfaces.ts";
import StyledInput from "../elements/StyledInput.tsx";
import {useTranslation} from "react-i18next";
import SignaturePad from "react-signature-pad-wrapper";
import {ChangeEvent, useRef} from "react";
import GeneralModal from "./GeneralModal.tsx";
import FormRow from "../elements/FormRow.tsx";
import StyledSelect from "../elements/StyledSelect.tsx";


export default function ServiceModal({ id, onClose, service, setService, onSave, inPlace }: ServiceModalInput) {
    const { t } = useTranslation();
    const signaturePadRef = useRef<SignaturePad>(null);

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
            onClick: ()=>onSave(service),
            value: t('Save')
        },
        {
            onClick: onClose,
            value: t('Cancel')
        }
    ];


    return (
        <GeneralModal buttons={buttons} inPlace={inPlace}
                      title={t('Service Acceptance Form')} id={id || "ServiceModal"}
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

            <h3 className="font-semibold text-center text-xl text-gray-700 mt-2">
                {t('Recipient')}
            </h3>

            <FormRow>
                <StyledInput
                    type="text" name="service_name"
                    value={service.service_name}
                    onChange={() => false}
                    label={t('Name')}
                />
            </FormRow>

            <FormRow>
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
            </FormRow>

            <h3 className="font-semibold text-center text-xl text-gray-700 mt-2">
                {t('Item and service details')}
            </h3>

            <FormRow>
                <StyledInput
                    type="text" name="type"
                    value={service.type}
                    onChange={(e) => changeType(e, 'type')}
                    label={t("Type")}
                />
            </FormRow>
            <FormRow>
                <StyledInput
                    type="textarea" name="description"
                    value={service.description}
                    onChange={(e) => changeType(e, 'description')}
                    label={t("Description")}
                />
            </FormRow>

            <FormRow>
                <StyledInput
                    type="text" name="accessories"
                    value={service.accessories}
                    onChange={(e) => changeType(e, 'accessories')}
                    label={t("Accessories")}
                />
                <StyledSelect
                    options={[{name: 'Yes', value: 'yes'}, {name: 'No', value: 'no'}]}
                    name="guaranteed"
                    value={service.guaranteed}
                    onSelect={(e) => changeType(e as unknown as ChangeEvent<HTMLInputElement>, 'guaranteed')}
                    label={t("Guaranteed")}
                />
            </FormRow>

            <FormRow>
                <StyledInput
                    type="textarea" name="repair_description"
                    value={service.repair_description}
                    onChange={(e) => changeType(e, 'repair_description')}
                    label={t("Repair Description")}
                />
            </FormRow>
            <FormRow>
                <StyledInput
                    type="text" name="expected_cost"
                    value={service.expected_cost}
                    onChange={(e) => changeType(e, 'expected_cost')}
                    label={t("Expected cost")}
                />
                <StyledInput
                    type="text" name="note"
                    value={service.note}
                    onChange={(e) => changeType(e, 'note')}
                    label={t("Note")}
                />
            </FormRow>


            <h3 className="font-semibold text-center text-xl text-gray-700 mb-4">
                {t('Signature')}
            </h3>
            <FormRow>
                <div
                    className="relative w-96 h-48 border border-gray-200 rounded-lg self-center mb-2 justify-self-center">
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
            </FormRow>
        </GeneralModal>
    )
}

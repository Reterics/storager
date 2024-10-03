import {ServiceModalInput, Shop} from "../../interfaces/interfaces.ts";
import StyledInput from "../elements/StyledInput.tsx";
import {useTranslation} from "react-i18next";
import SignaturePad from "react-signature-pad-wrapper";
import {useRef} from "react";


export default function ServiceModal({ onClose, service, setService, onSave, inPlace }: ServiceModalInput) {
    const { t } = useTranslation();
    const signaturePadRef = useRef<SignaturePad>(null);

    const handleOnClose = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.id === 'ServiceModal') {
            onClose();
        }
    };

    const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.target.value;

        const obj = {...service};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        obj[key] = value;

        setService(obj as Shop);
    };

    if (!service) return null;

    return (
        <div
            id="ShopModal"
            onClick={handleOnClose}
            className={
                inPlace ?
                    "flex justify-center items-center" :
                    "fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center"
            }
            style={{zIndex: 999}}
        >
            <div className="bg-white p-4 rounded w-full dark:bg-gray-900">
                <h1 className="font-semibold text-center text-xl text-gray-700 mb-4">
                    Edit Shop
                </h1>

                <form>
                    <h3 className="font-semibold text-center text-xl text-gray-700 mb-4">
                        {t('Client')}
                    </h3>
                    <StyledInput
                        type="text" name="client_name"
                        value={service.client_name}
                        onChange={(e) => changeType(e, 'client_name')}
                        label={t('Name')}
                    />


                    <div className="grid md:grid-cols-2 md:gap-6">
                        <StyledInput
                            type="text" name="client_email"
                            value={service.client_email}
                            onChange={(e) => changeType(e, 'client_email')}
                            label={t('Email')}
                        />
                        <StyledInput
                            type="text" name="client_phone"
                            value={service.client_phone}
                            onChange={(e) => changeType(e, 'client_phone')}
                            label="Phone"
                        />
                    </div>

                    <h3 className="font-semibold text-center text-xl text-gray-700 mb-4">
                        {t('Signature')}
                    </h3>
                    <SignaturePad ref={signaturePadRef}
                                  redrawOnResize
                                  options={{
                                      minWidth: 0.5,
                                      maxWidth: 2.5,
                                      //dotSize: 1,
                                      backgroundColor: 'white',
                                      penColor: 'rgb(76,76,76)'}} />
                </form>

                <div className="flex justify-between">
                    <button type="button"
                            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none
                            focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2
                            dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                            onClick={() => onSave(service)}
                    >Save
                    </button>
                    <button type="button"
                            className="text-gray-900 bg-white border border-gray-300 focus:outline-none
                            hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg
                            text-sm px-5 py-2.5 mr-2 dark:bg-gray-800 dark:text-white dark:border-gray-600
                            dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                            onClick={() => onClose()}
                    >Cancel
                    </button>

                </div>
            </div>
        </div>
    )
}

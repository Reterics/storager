import StyledInput from "../elements/StyledInput.tsx";
import {Shop, ShopModalInput} from "../../interfaces/interfaces.ts";


export default function ShopModal({ visible, onClose, currentShop, setCurrentShop, onSave }: ShopModalInput) {

    const handleOnClose = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.id === 'ShopModal') {
            onClose();
        }
    };

    const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.target.value;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        setCurrentShop((currentShop: Shop) => {
            const obj = {...currentShop};
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            obj[key] = value;
            return obj;
        });
    };


    if (!visible) return null;

    return (
        <div
            id="ShopModal"
            onClick={handleOnClose}
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm
            flex justify-center items-center"
        >
            <div className="bg-white p-4 rounded w-[36rem] dark:bg-gray-900">
                <h1 className="font-semibold text-center text-xl text-gray-700 mb-4">
                    Edit Shop
                </h1>

                <form>
                    <StyledInput
                        type="text" name="name"
                        value={currentShop.name}
                        onChange={(e) => changeType(e, 'customerName')}
                        label="Name"
                    />

                    <div className="grid md:grid-cols-2 md:gap-6">
                        <StyledInput
                            type="text" name="coordinates"
                            value={currentShop.coordinates ?
                                currentShop.coordinates?.latitude + ' ' + currentShop.coordinates?.longitude : ''}
                            onChange={(e) => changeType(e, 'coordinates')}
                            label="Coordinates"
                            pattern="[0-9\.]{5}[-]{1}[0-9\.]{5}"
                            maxLength={11}
                        />
                        <StyledInput
                            type="text" name="phone"
                            value={currentShop.phone}
                            onChange={(e) => changeType(e, 'phone')}
                            label="Phone"
                        />
                    </div>
                    <div className="grid md:grid-cols-3 md:gap-3">
                        <StyledInput
                            type="text" name="address"
                            value={currentShop.address}
                            onChange={(e) => changeType(e, 'address')}
                            label="Address"
                        />
                    </div>
                </form>

                <div className="flex justify-between">
                    <button type="button"
                            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none
                            focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2
                            dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                            onClick={() => onSave()}
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

import {ShopContext} from "../../src/store/ShopContext";
import {defaultShop} from "./shopData";
import {vi} from "vitest";


const ShopContextProviderMock = ({children}:{children: React.ReactNode}) => {
    return (
        <ShopContext.Provider value={{
            shop: defaultShop,
            setShop: vi.fn()
        }}>{children}</ShopContext.Provider>
    )
}

export default ShopContextProviderMock;

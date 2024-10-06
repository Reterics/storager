import {createContext, ReactNode, useState} from "react";
import {Shop} from "../interfaces/interfaces.ts";


export const ShopContext = createContext<{
    shop: Shop|null,
    setShop: (shop: Shop|null) => void,
}>({shop: null, setShop: () => {console.warn('Context is not loaded')}});

export const ShopProvider = ({ children }: {
    children: ReactNode
}) => {
    const savedShop = JSON.parse(localStorage.getItem('shop') || 'null');

    const [shop, setShop] = useState<Shop|null>(savedShop);

    const savePersistedShop = (s: Shop|null) => {
        localStorage.setItem('shop', JSON.stringify(s));
        setShop(s);
    };

    return <ShopContext.Provider value={{
        shop: shop,
        setShop: savePersistedShop
    }}>{children}</ShopContext.Provider>;
};

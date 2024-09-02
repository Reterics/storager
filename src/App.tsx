import {useContext, useEffect, useState} from 'react'
import './App.css'
import {AuthContext} from "./store/AuthContext.tsx";
import PageLoading from "./components/PageLoading.tsx";
import Header from "./components/Header.tsx";
import SignInComponent from "./components/SignIn.tsx";
import {firebaseCollections, getCollection} from "./firebase/BaseConfig.ts";
import TableViewComponent, {TableViewActions} from "./components/elements/TableViewComponent.tsx";

function App() {
    const {user, loading} = useContext(AuthContext);

    if (!user) return <SignInComponent />;

    const [shops, setShops] = useState<unknown[]>([])

    const refreshCollections = async () => {
        const shops = await getCollection(firebaseCollections.shops);
        setShops(shops as unknown[]);
    };
    useEffect(() => {
        void refreshCollections();
    }, []);

    const tableLines = shops.map(shop => {
        return [
            // @ts-ignore
            shop.id,
            // @ts-ignore
            shop.name || '',
            TableViewActions({
                onPaste: () => console.log('Not implemented'),
                onRemove: () => console.log('Not implemented'),
            })
        ];
    });

  return (
    <>
        <Header />
        {loading && <PageLoading/>}
        <div className="flex justify-center overflow-x-auto shadow-md sm:rounded-lg w-full m-auto mt-2">
            <div className="flex justify-between max-w-screen-xl m-2 p-2 w-full">
                <h1 className="text-2xl font-bold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-4xl dark:text-white">
                    Shops
                </h1>
                <div />
            </div>
        </div>
        <div className="flex justify-center overflow-x-auto shadow-md sm:rounded-lg w-full m-auto mt-2">
            <TableViewComponent lines={tableLines} header={['ID', 'Name', 'Action']}/>
        </div>
    </>
  )
}

export default App

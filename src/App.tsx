import {useContext, useEffect, useState} from 'react'
import './App.css'
import {AuthContext} from "./store/AuthContext.tsx";
import PageLoading from "./components/PageLoading.tsx";
import Header from "./components/Header.tsx";
import SignInComponent from "./components/SignIn.tsx";
import {firebaseCollections, getCollection} from "./firebase/BaseConfig.ts";
import TableViewComponent, {TableViewActions} from "./components/elements/TableViewComponent.tsx";
import {MapContainer, TileLayer} from 'react-leaflet'
import "leaflet/dist/leaflet.css";

import {Shop} from "./interfaces/interfaces.ts";
import {Marker, Popup} from "react-leaflet";
import {LatLngTuple} from "leaflet";

function App() {
    const {user, loading} = useContext(AuthContext);

    const [shops, setShops] = useState<Shop[]>([]);
    const center = [46.840399, 16.8279712, 0] as LatLngTuple;

    const refreshCollections = async () => {
        const shops = await getCollection(firebaseCollections.shops);
        setShops(shops as Shop[]);
    };
    useEffect(() => {
        void refreshCollections();
    }, []);

    if (!user) return <SignInComponent/>;

    const tableLines = shops.map(shop => {
        return [
            shop.id,
            shop.name || '',
            shop.address || '',
            TableViewActions({
                onPaste: () => console.log('Not implemented'),
                onRemove: () => console.log('Not implemented'),
            })
        ];
    });

    return (
        <>
            <Header/>
            {loading && <PageLoading/>}
            <div className="main-container p-2">
                <div className="flex justify-center overflow-x-auto shadow-md sm:rounded-lg w-full m-auto">
                    <div className="flex justify-between max-w-screen-xl m-2 p-2 w-full">
                        <h1 className="text-2xl font-bold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-4xl dark:text-white">
                            Shops
                        </h1>
                        <div/>
                    </div>
                </div>
                <div className="flex justify-center overflow-x-auto shadow-md sm:rounded-lg w-full m-auto mt-2">
                    <TableViewComponent lines={tableLines} header={['ID', 'Name', 'Address', 'Action']}/>
                </div>
                <div className="flex justify-center h-80 overflow-x-auto shadow-md sm:rounded-lg w-full m-auto mt-2">
                    <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{height: '100%', width: '100%'}}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {
                            shops.filter(s => s.coordinates).map(shop =>
                                <Marker
                                    position={[shop.coordinates?.latitude, shop.coordinates?.longitude] as LatLngTuple}>
                                    <Popup>
                                        {shop.name}
                                        <br/>
                                        {shop.address || ''}
                                        <br/>
                                        {shop.description || ''}
                                    </Popup>
                                </Marker>
                            )
                        }
                    </MapContainer>
                </div>
            </div>
        </>
    )
}

export default App

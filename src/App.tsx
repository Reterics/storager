import {useContext, useState} from 'react'
import './App.css'
import {db, firebaseCollections} from "./firebase/BaseConfig.ts";
import {doc, deleteDoc, collection, setDoc, addDoc, GeoPoint} from "firebase/firestore";
import TableViewComponent, {TableViewActions} from "./components/elements/TableViewComponent.tsx";
import {MapContainer, TileLayer} from 'react-leaflet'
import "leaflet/dist/leaflet.css";

import {Shop} from "./interfaces/interfaces.ts";
import {Marker, Popup} from "react-leaflet";
import {LatLngTuple, Map} from "leaflet";
import ShopModal from "./components/modals/ShopModal.tsx";
import {BsFillPlusCircleFill} from "react-icons/bs";
import {FirebaseContext} from "./firebase/FirebaseContext.ts";

function App() {
    const firebaseContext = useContext(FirebaseContext);

    console.error(firebaseContext);

    const [shops, setShops] = useState<Shop[]>(firebaseContext?.data.shops || []);

    const [modalTemplate, setModalTemplate] = useState<Shop|null>(null)

    const center = [46.840399, 16.8279712, 0] as LatLngTuple;



    const ref = (map: Map|null) => {
        if (map !== null) {
            const container = map.getContainer();
            container.onclick = (ev: MouseEvent) => {
                if (modalTemplate) {
                    const coordinate = map.mouseEventToLatLng(ev);
                    console.error(coordinate);
                    if (coordinate) {
                        setModalTemplate({...modalTemplate,
                            coordinates: new GeoPoint(coordinate.lat, coordinate.lng),});
                    }
                }

            }
        }
    }

    const deleteShop = async (shop: Shop) => {
        if (shop.id && window.confirm('Are you sure you wish to delete this Shop?')) {
            await deleteDoc(doc(db, firebaseCollections.shops, shop.id));

            setShops(shops.filter(s => s !== shop))
        }
    };

    const closeShop = async (shop?: Shop)=> {
        let modelRef;

        if (shop && shop.id) {
            // For updating an existing document
            modelRef = doc(db, firebaseCollections.shops, shop.id);
            await setDoc(modelRef, shop, { merge: true }).catch(e => {
                console.error(e);
            });
            console.log('Updated document ID:', modelRef.id);
        } else if (shop) {
            // For creating a new document with an auto-generated ID
            modelRef = await addDoc(collection(db, firebaseCollections.shops), shop).catch(e => {
                console.error(e);
            });
            if (modelRef) {
                console.log('Created new document with ID:', modelRef.id);

                shop.id = modelRef.id;
                const updatedShops = [...shops];
                updatedShops.push(shop);
                setShops(updatedShops);
            }
        }

        setModalTemplate(null);
    }

    const tableLines = shops.map(shop => {
        return [
            shop.id,
            shop.name || '',
            shop.address || '',
            TableViewActions({
                onRemove: () => deleteShop(shop),
            })
        ];
    });

    return (
        <>
                <div className="flex justify-center overflow-x-auto shadow-md sm:rounded-lg w-full m-auto">
                    <div className="flex justify-between max-w-screen-xl m-2 p-2 w-full">
                        <h1 className="text-2xl font-bold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-4xl dark:text-white">
                            Shops
                        </h1>
                        <button type="button"
                                className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none
                            focus:ring-4 focus:ring-gray-300 font-medium rounded-lg px-5 py-2.5 mr-2
                            dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                                onClick={() => setModalTemplate(modalTemplate ? null : {
                                    id: ''
                                })}
                        >
                            <BsFillPlusCircleFill/>
                        </button>
                    </div>
                </div>
                <div className="flex justify-center overflow-x-auto shadow-md sm:rounded-lg w-full m-auto mt-2 mb-2">
                    <TableViewComponent lines={tableLines} header={['ID', 'Name', 'Address', 'Action']}/>
                </div>
                <div className="flex justify-center h-80 overflow-x-auto shadow-md sm:rounded-lg w-full m-auto mt-2 flex-1 flex-row">
                    <ShopModal
                        onClose={()=>setModalTemplate(null)}
                        onSave={(shop: Shop) => closeShop(shop)}
                        setShop={(shop: Shop) => setModalTemplate(shop)}
                        shop={modalTemplate}
                        inPlace={true}
                    />
                    <MapContainer ref={ref}
                        center={center}
                        zoom={13}
                        scrollWheelZoom={false}
                        style={{height: '100%', width: '100%'}}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {
                            shops.filter(s => s.coordinates instanceof GeoPoint).map(shop =>
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
        </>
    )
}

export default App

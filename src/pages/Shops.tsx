import {useContext, useState} from 'react'
import './Shops.css'
import {db, firebaseCollections} from "../firebase/BaseConfig.ts";
import {doc, deleteDoc, collection, setDoc, addDoc, GeoPoint} from "firebase/firestore";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";
import {MapContainer, TileLayer} from 'react-leaflet'
import "leaflet/dist/leaflet.css";

import {Shop} from "../interfaces/interfaces.ts";
import {Marker, Popup} from "react-leaflet";
import {LatLngTuple, Map} from "leaflet";
import ShopModal from "../components/modals/ShopModal.tsx";
import {BsFillPlusCircleFill} from "react-icons/bs";
import {DBContext} from "../database/DBContext.ts";
import {PageHead} from "../components/elements/PageHead.tsx";
import { useTranslation } from 'react-i18next';

function Shops() {
    const firebaseContext = useContext(DBContext);
    const { t } = useTranslation();

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
        if (shop.id && window.confirm(t('Are you sure you wish to delete this Shop?'))) {
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
            <PageHead title={t('Shops')} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick:() => setModalTemplate(modalTemplate ? null : {
                        id: ''
                    })
                }
            ]}/>

            <TableViewComponent lines={tableLines} header={[t('ID'), {
                value: t('Name'),
                sortable: true
            }, t('Address'), t('Actions')]}/>
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

export default Shops

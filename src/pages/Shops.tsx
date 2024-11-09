import {useContext, useState} from 'react'
import './Shops.css'
import {GeoPoint} from "firebase/firestore";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";
import {MapContainer, TileLayer} from 'react-leaflet'
import "leaflet/dist/leaflet.css";

import {Shop, TableViewActionArguments} from "../interfaces/interfaces.ts";
import {Marker, Popup} from "react-leaflet";
import {LatLngTuple, Map} from "leaflet";
import ShopModal from "../components/modals/ShopModal.tsx";
import {BsFillPlusCircleFill} from "react-icons/bs";
import {DBContext} from "../database/DBContext.ts";
import {PageHead} from "../components/elements/PageHead.tsx";
import { useTranslation } from 'react-i18next';
import {ShopContext} from "../store/ShopContext.tsx";
import UnauthorizedComponent from "../components/Unauthorized.tsx";
import ImportShopData from "../components/modals/ImportShopData.tsx";

function Shops() {
    const dbContext = useContext(DBContext);
    const shopContext = useContext(ShopContext);
    const { t } = useTranslation();
    const isAdmin = dbContext && dbContext.data && dbContext.data.currentUser &&
        dbContext.data.currentUser.role === 'admin';
    const [shops, setShops] = useState<Shop[]>(dbContext?.data.shops || []);

    let initialSelectedIndex = -1;
    if (shopContext.shop && shopContext.shop.id) {
        initialSelectedIndex = shops.findIndex(shop => shop.id === shopContext.shop?.id);
    }

    const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectedIndex);

    const [modalTemplate, setModalTemplate] = useState<Shop|null>(null)
    const [importShop, setImportShop] = useState<Shop|null>(null)

    const center = [47.25852, 16.77818, 0] as LatLngTuple;

    const ref = (map: Map|null) => {
        if (map !== null) {
            const container = map.getContainer();
            container.onclick = (ev: MouseEvent) => {
                if (modalTemplate) {
                    const coordinate = map.mouseEventToLatLng(ev);
                    if (coordinate) {
                        setModalTemplate({...modalTemplate,
                            coordinates: new GeoPoint(
                                parseFloat(coordinate.lat.toFixed(5)),
                                parseFloat(coordinate.lng.toFixed(5)))});
                    }
                }

            }
        }
    }

    const deleteShop = async (shop: Shop) => {
        if (shop.id && window.confirm(t('Are you sure you wish to delete this Shop?'))) {
            setShops(await dbContext?.removeData('shops', shop.id) as Shop[])
        }
    };

    const closeShop = async (shop?: Shop)=> {
        const updatedShops = await dbContext?.setData('shops', shop as Shop);
        setShops(updatedShops as Shop[]);

        setModalTemplate(null);
    }

    const tableLines = shops.map(shop => {
        const actions: TableViewActionArguments = {
            onRemove: () => deleteShop(shop),
        };
        if (dbContext?.data.currentUser?.role === 'admin') {
            actions.onEdit = () => setModalTemplate(shop)
        }
        if (dbContext?.data.currentUser?.role === 'admin' /*&& there is no data for this shop*/) {
            actions.onPaste = () => {
                setImportShop(shop);
            }
        }
        return [
            shop.name || '',
            shop.address || '',
            TableViewActions(actions)
        ];
    });

    if (!dbContext?.data.currentUser) {
        return <UnauthorizedComponent />;
    }

    return (
        <>
            <PageHead title={shopContext.shop ? shopContext.shop.name + t(' selected') : t('Select a Shop')} buttons={isAdmin ? [
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick:() => setModalTemplate(modalTemplate ? null : {
                        id: ''
                    })
                }
            ] : undefined}/>

            <TableViewComponent lines={tableLines} header={[{
                value: t('Name'),
                sortable: true
            }, t('Address'), t('Actions')]}
            selectedIndexes={{[selectedIndex]: true}}
            onClick={(index) => {
                if (shops[index]) {
                    if (shopContext.shop && shops[index].id === shopContext.shop?.id) {
                        shopContext.setShop(null);
                        setSelectedIndex(-1);
                    } else {
                        shopContext.setShop(shops[index]);
                        setSelectedIndex(index);
                    }
                }
            }}/>
            <div className="mt-4 h-80 flex flex-row text-sm text-left text-gray-500 dark:text-gray-400 max-w-screen-xl w-full shadow-md self-center">
                { modalTemplate && <ShopModal
                    onClose={()=>setModalTemplate(null)}
                    onSave={(shop: Shop) => closeShop(shop)}
                    setShop={(shop: Shop) => setModalTemplate(shop)}
                    shop={modalTemplate}
                    inPlace={true}
                /> }
                { importShop && <ImportShopData
                    onClose={()=>setImportShop(null)}
                    shop={importShop}
                    inPlace={false}
                /> }
                <MapContainer ref={ref}
                    center={center}
                    zoom={8}
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
            <div className="flex-1 flex"></div>
        </>
    )
}

export default Shops

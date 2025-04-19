import {ReactNode, useContext, useEffect, useRef, useState} from 'react';
import {
  ContextDataType,
  ContextData,
  ContextDataValueType,
} from '../../interfaces/firebase.ts';
import {
  db,
  firebaseCollections,
  firebaseModel,
  getCollection,
  modules,
} from './config.ts';
import {
  InvoiceType,
  Lease,
  LeaseCompletion,
  ServiceCompleteData,
  ServiceData,
  SettingsItems,
  Shop,
  ShopType,
  StoreItem,
  StorePart,
  StyledSelectOption,
  Transaction,
  UserData,
} from '../../interfaces/interfaces.ts';
import PageLoading from '../../components/PageLoading.tsx';
import {DBContext} from '../DBContext.ts';
import {AuthContext} from '../../store/AuthContext.tsx';
import {addDoc, collection} from 'firebase/firestore';
import {ShopContext} from '../../store/ShopContext.tsx';
import {imageModel} from './storage.ts';
import {LogEntry} from './FirebaseDBModel.ts';
import UnauthorizedComponent from '../../components/Unauthorized.tsx';

export const FirebaseProvider = ({children}: {children: ReactNode}) => {
  const authContext = useContext(AuthContext);
  const shopContext = useContext(ShopContext);
  const [ctxData, setCtxData] = useState<ContextData | null>(null);
  const renderAfterCalled = useRef(false);

  const postProcessStoreData = async (array: StoreItem[] | StorePart[]) => {
    if (Array.isArray(array)) {
      for (const element of array) {
        if (element.name && element.image?.startsWith('screenshots/')) {
          element.image = await imageModel.getFileURL(element.image || '');
        } else if (
          element.name &&
          element.image?.startsWith('https://firebasestorage.googleapis.com')
        ) {
          element.image = imageModel.decodeStorageImageURL(element.image);
        }

        if (
          typeof element.storage === 'number' ||
          typeof element.storage === 'string'
        ) {
          element.storage = [Number(element.storage)];
        }
        if (typeof element.shop_id === 'string') {
          element.shop_id = [element.shop_id] as unknown as string[];
        }
        if (
          typeof element.storage_limit === 'number' ||
          typeof element.storage_limit === 'string'
        ) {
          element.storage_limit = [Number(element.storage_limit)];
        }
      }
    }
  };

  const getContextData = async (cache: boolean = false) => {
    let users = (await getCollection(
      firebaseCollections.users,
      true
    )) as UserData[];
    let services: ServiceData[] = [];
    let completions: ServiceCompleteData[] = [];
    let settings: SettingsItems[] = [];
    let user;
    let shops: Shop[] = [];
    let items: StoreItem[] = [];
    let parts: StorePart[] = [];
    let types: ShopType[] = [];
    let archive: ContextDataValueType[] = [];
    let invoices: InvoiceType[] = [];
    let transactions: Transaction[] = [];
    let leases: Lease[] = [];
    let leaseCompletions: LeaseCompletion[] = [];
    let logs: LogEntry[] = [];

    users = users.map((user) => {
      user.password = undefined;
      user.password_confirmation = undefined;
      return user;
    });

    if (authContext.user?.email) {
      user = users.find((user) => user.email === authContext.user?.email);

      if (!user) {
        console.error('User is not found in the Firestore settings');
      } else if (user.role !== 'admin') {
        console.log('User is not an admin, hence we do not load settings');
        users = [user];
        settings = (await getCollection(
          firebaseCollections.settings
        )) as SettingsItems[];
        for (let i = 0; i < settings.length; i++) {
          settings[i] = {
            id: settings[i].id,
            serviceAgreement: settings[i].serviceAgreement,
            companyName: settings[i].companyName,
            address: settings[i].address,
            email: settings[i].email,
          };
        }
      } else {
        settings = (await getCollection(
          firebaseCollections.settings
        )) as SettingsItems[];
        logs = modules.storageLogs
          ? ((await getCollection(
              firebaseCollections.logs
            )) as unknown as LogEntry[])
          : [];
      }
    }

    if (user) {
      services = (await getCollection(
        firebaseCollections.services
      )) as ServiceData[];
      completions = (await getCollection(
        firebaseCollections.completions
      )) as ServiceCompleteData[];
      shops = (await getCollection(firebaseCollections.shops)) as Shop[];
      items = (await getCollection(firebaseCollections.items)) as StoreItem[];
      parts = (await getCollection(firebaseCollections.parts)) as StorePart[];
      archive = (await getCollection(
        firebaseCollections.archive
      )) as ContextDataValueType[];
      types = (await getCollection(
        firebaseCollections.types
      )) as ContextDataValueType[];
      invoices = (await getCollection(
        firebaseCollections.invoices
      )) as InvoiceType[];
      transactions = modules.transactions
        ? ((await getCollection(
            firebaseCollections.transactions
          )) as Transaction[])
        : [];
      leases = modules.leasing
        ? ((await getCollection(firebaseCollections.leases)) as Transaction[])
        : [];
      leaseCompletions = modules.leasing
        ? ((await getCollection(
            firebaseCollections.leaseCompletions
          )) as Transaction[])
        : [];
    }

    if (user?.shop_id?.length) {
      if (typeof user.shop_id === 'string') {
        user.shop_id = [user.shop_id as string];
      }
      shops = shops.filter((shop) =>
        user.shop_id.find((shop_id: string) => shop.id.includes(shop_id))
      );
      items = items.filter((item) =>
        user.shop_id.find((shop_id: string) => item.shop_id?.includes(shop_id))
      );
      parts = parts.filter((part) =>
        user.shop_id.find((shop_id: string) => part.shop_id?.includes(shop_id))
      );
      if (
        !shopContext.shop?.id ||
        !user.shop_id.includes(shopContext.shop?.id)
      ) {
        shopContext.setShop(shops[0]);
      }
    }

    await postProcessStoreData(items);
    await postProcessStoreData(parts);

    if (cache) {
      firebaseModel.sync(0);
    }

    setCtxData({
      shops,
      items,
      parts,
      services,
      completions,
      settings: settings[0],
      users: users,
      currentUser: user,
      archive: archive,
      types: types,
      deleted: await firebaseModel.getAll('deleted'),
      invoices,
      logs: logs || [],
      transactions,
      leases,
      leaseCompletions,
    });
  };

  const removeContextData = async (key: ContextDataType, id: string) => {
    if (ctxData && Array.isArray(ctxData[key]) && key !== 'settings') {
      const filteredData = ctxData[key].filter((item) => item.id !== id);
      if (filteredData.length !== ctxData[key].length) {
        await firebaseModel.remove(id, firebaseCollections[key]);
        ctxData[key] = [...filteredData];
        const cachedRecycleBin = firebaseModel.getCached('deleted');
        if (cachedRecycleBin) {
          ctxData.deleted = cachedRecycleBin;
        }

        setCtxData({
          ...ctxData,
        });
        return ctxData[key];
      }
    }

    return ctxData ? ctxData[key] : null;
  };

  const restoreContextData = async (id: string) => {
    if (ctxData && ctxData.deleted) {
      await firebaseModel.restore(id);
      const filteredData = ctxData.deleted.filter((item) => item.id !== id);
      ctxData.deleted = [...filteredData];
      setCtxData({
        ...ctxData,
      });
      return ctxData.deleted;
    }
    return ctxData ? ctxData.deleted : null;
  };

  const removePermanentCtxData = async (id: string) => {
    return await firebaseModel.removePermanent(id);
  };

  const updateContextData = async (
    key: ContextDataType,
    item: ContextDataValueType,
    archive?: boolean
  ) => {
    if (!item) {
      console.error('There is no data provided for saving');
      return ctxData ? ctxData[key] : null;
    }

    await firebaseModel.update(item, key);
    if (archive) {
      item.docType = key;
      item.docParent = item.id;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      delete item.id;

      const document = await addDoc(
        collection(db, firebaseCollections.archive),
        item
      ).catch((e) => {
        console.error(e);
      });
      if (document && ctxData && ctxData.archive) {
        ctxData.archive.unshift({...item, id: document.id});
      }
      item.id = item.docParent;
    }

    console.log('Created document with ID:', item.id, ' in ', key);

    if (ctxData) {
      // FirebaseModel above build up the cache, so we need just to refresh data from it here
      const cachedData = firebaseModel.getCached(key);
      if (cachedData) {
        if (key === 'settings') {
          ctxData[key] = cachedData[0];
        } else {
          ctxData[key] = cachedData;
        }
      } else {
        console.warn('Failed to fetch data from local cache');
      }
    }

    setCtxData(
      ctxData
        ? {
            ...ctxData,
          }
        : null
    );

    return ctxData ? ctxData[key] : null;
  };

  const updateContextBatched = async (
    key: ContextDataType,
    items: ContextDataValueType[]
  ) => {
    await firebaseModel.updateAll(items, key);

    if (ctxData) {
      // FirebaseModel above build up the cache, so we need just to refresh data from it here
      const cachedData = firebaseModel.getCached(key);
      if (cachedData) {
        if (key === 'settings') {
          ctxData[key] = cachedData[0];
        } else {
          ctxData[key] = cachedData;
        }
      } else {
        console.warn('Failed to fetch data from local cache');
      }
    }

    setCtxData(
      ctxData
        ? {
            ...ctxData,
          }
        : null
    );

    return ctxData ? ctxData[key] : null;
  };

  const getType = (
    type: 'part' | 'item' | 'service',
    lang: 'hu' | 'en' = 'hu'
  ): StyledSelectOption[] => {
    if (ctxData && ctxData.types) {
      return ctxData.types
        .filter((t) => t.category === type)
        .map((type) => {
          return {
            value: type.name || '',
            name:
              (type.translations ? type.translations[lang] : type.name) || '',
          };
        });
    }
    return [];
  };

  const refreshData = async (key?: ContextDataType) => {
    let updateLocalCache = false;
    if (key) {
      firebaseModel.invalidateCache(key);
      updateLocalCache = true;
    }
    await getContextData(updateLocalCache);
  };

  const updateLatestContext = async (key: ContextDataType) => {
    // Validation step
    if (ctxData && key !== 'settings') {
      ctxData[key] = await getCollection(firebaseCollections[key]);
    } else if (ctxData && key === 'settings') {
      const settings = (await getCollection(
        firebaseCollections.settings
      )) as SettingsItems[];
      if (settings) {
        ctxData.settings = settings[0];
      }
    }
    setCtxData(
      ctxData
        ? {
            ...ctxData,
          }
        : null
    );

    return ctxData ? ctxData[key] : null;
  };

  useEffect(() => {
    if (!renderAfterCalled.current) {
      console.log('Load context data');
      imageModel
        .loadPersisted()
        .finally(() => firebaseModel.loadPersisted())
        .finally(() =>
          imageModel.integrityCheck(firebaseModel.getCached('parts'))
        )
        .finally(() =>
          imageModel.integrityCheck(firebaseModel.getCached('items'))
        )
        .finally(() => getContextData(true))
        .finally(() => firebaseModel.setUser(authContext.user))
        .finally(() => firebaseModel.setShopId(shopContext.shop?.id));
    }

    renderAfterCalled.current = true;
    // eslint-disable-next-line
  }, []);

  return (
    <DBContext.Provider
      value={{
        data: ctxData as ContextData,
        refreshData: refreshData,
        setData: updateContextData,
        removeData: removeContextData,
        restoreData: restoreContextData,
        removePermanentData: removePermanentCtxData,
        refreshImagePointers: postProcessStoreData,
        uploadDataBatch: updateContextBatched,
        getType: getType,
        updateLatest: updateLatestContext,
      }}
    >
      {ctxData && ctxData.currentUser && children}
      {ctxData && !ctxData.currentUser && <UnauthorizedComponent />}
      {!ctxData && <PageLoading />}
    </DBContext.Provider>
  );
};

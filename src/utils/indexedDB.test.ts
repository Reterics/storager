import {openDatabase, saveToIndexedDB, loadFromIndexedDB} from './indexedDB';
import {IDBFactory} from 'fake-indexeddb';
import {beforeAll, afterAll, describe, it, expect} from 'vitest';
import {CommonCollectionData, TTLData} from '../interfaces/firebase';
import {defaultSettings} from '../../tests/mocks/shopData.ts';

describe('IndexedDB Utilities with fake-indexeddb', () => {
  const mockData = [
    {key: '1', data: 'item1'},
    {key: '2', data: 'item2'},
  ];

  beforeAll(() => {
    globalThis.indexedDB = new IDBFactory();
  });

  afterAll(() => {
    if (globalThis.indexedDB) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      globalThis.indexedDB = undefined;
    }
  });

  it('should open the database and create stores if needed', async () => {
    const db = await openDatabase();
    expect(db.objectStoreNames).toContain('shops');
    expect(db.objectStoreNames).toContain('items');
  });

  it('should save data to the specified store in IndexedDB', async () => {
    await saveToIndexedDB(
      'shops',
      mockData as unknown as CommonCollectionData[]
    );

    const db = await openDatabase();
    const transaction = db.transaction('shops', 'readonly');
    const store = transaction.objectStore('shops');
    const items = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    expect(items).toEqual(mockData);
  });

  it('should load data from the specified store in IndexedDB', async () => {
    // First, save data to ensure there's data to load
    await saveToIndexedDB(
      'shops',
      mockData as unknown as CommonCollectionData[]
    );

    const loadedData = await loadFromIndexedDB('shops');
    expect(loadedData).toEqual(mockData);
  });

  it('should load data from settings in IndexedDB', async () => {
    await saveToIndexedDB('settings', defaultSettings as unknown as TTLData);

    const loadedData = (await loadFromIndexedDB('settings')) as TTLData[];
    expect(loadedData?.length).toEqual(1);
    expect(loadedData[0]).toEqual({...defaultSettings, key: 'settings'});
  });

  it('should load ttl and mtime data from settings in IndexedDB', async () => {
    await saveToIndexedDB('ttl', {test: 11} as unknown as TTLData);

    let loadedData = (await loadFromIndexedDB('ttl')) as TTLData;
    expect(loadedData).toEqual({test: 11, key: 'ttl'});

    await saveToIndexedDB('mtime', {test: 22} as unknown as TTLData);

    loadedData = (await loadFromIndexedDB('mtime')) as TTLData;
    expect(loadedData).toEqual({test: 22, key: 'mtime'});
  });

  it('should not load invalid data from IndexedDB', async () => {
    await saveToIndexedDB('settings', null as unknown as TTLData);

    const loadedData = (await loadFromIndexedDB('archive')) as TTLData[];
    expect(loadedData?.length).toEqual(0);
    expect(loadedData[0]).toEqual(undefined);
  });
});

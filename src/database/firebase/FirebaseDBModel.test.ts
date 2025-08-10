import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FirebaseDBModel from './FirebaseDBModel';
import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import type {
  DocumentSnapshot,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  writeBatch,
} from 'firebase/firestore';

import type { User } from 'firebase/auth';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn().mockResolvedValue({}),
  getDocs: vi.fn().mockResolvedValue([
    { id: '1', data: () => ({ id: '1', name: 'item1' }) },
    { id: '2', data: () => ({ id: '2', name: 'item2' }) },
  ]),
  query: vi.fn(),
  doc: vi.fn().mockResolvedValue({}),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  writeBatch: vi.fn(),
}));

describe('FirebaseDBModel', () => {
  let model: FirebaseDBModel;
  let mockApp: FirebaseApp;
  let mockDb: ReturnType<typeof getFirestore>;

  beforeEach(() => {
    mockApp = {} as FirebaseApp;
    mockDb = {} as ReturnType<typeof getFirestore>;
    vi.mocked(initializeApp).mockReturnValue(mockApp);
    vi.mocked(getFirestore).mockReturnValue(mockDb);
    model = new FirebaseDBModel();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize Firebase app and Firestore', () => {
      expect(initializeApp).toHaveBeenCalled();
      expect(getFirestore).toHaveBeenCalledWith(mockApp);
      expect(model.getApp()).toBe(mockApp);
      expect(model.getDB()).toBe(mockDb);
    });
  });

  describe('get', () => {
    it('should fetch and cache data if the document exists', async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ id: '123', name: 'Test Item' }),
      };
      vi.mocked(getDoc).mockResolvedValue(
        mockDocSnap as unknown as DocumentSnapshot,
      );

      const result = await model.get('123', 'items');
      expect(doc).toHaveBeenCalledWith(model.getDB(), 'items', '123');
      expect(getDoc).toHaveBeenCalled();
      expect(result).toEqual({ id: '123', name: 'Test Item' });
      expect(model.getCachedEntry('123', 'items')).toEqual({
        id: '123',
        name: 'Test Item',
      });
    });

    it('should return null if the document does not exist', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false });

      const result = await model.get('123', 'items');
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should mark the document as deleted and move it to the deleted cache', async () => {
      const id = '123';
      const table = 'items';
      model.updateCache(table, [{ id, name: 'Item to Delete' }]);
      model.getCachedEntry(id, table);

      vi.mocked(setDoc).mockResolvedValue(undefined);

      await model.remove(id, table);
      expect(doc).toHaveBeenCalledWith(model.getDB(), table, id);
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          deleted: true,
        }),
        { merge: true },
      );
      expect(model.getCachedEntry(id, 'deleted')).toEqual(
        expect.objectContaining({ deleted: true }),
      );
      expect(model.getCachedEntry(id, table)).toBeUndefined();
    });
  });

  describe('restore', () => {
    it('should restore a deleted document to its original table', async () => {
      const id = '123';
      model.updateCache('deleted', [
        { id, name: 'Deleted Item', docType: 'items', deleted: true },
      ]);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const result = await model.restore(id);
      expect(doc).toHaveBeenCalledWith(model.getDB(), 'items', id);
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ deleted: false }),
        { merge: true },
      );
      expect(result).toBe(true);
      expect(model.getCachedEntry(id, 'deleted')).toBeUndefined();
      expect(model.getCachedEntry(id, 'items')).toEqual(
        expect.objectContaining({ deleted: false }),
      );
    });
  });

  describe('removePermanent', () => {
    it('should permanently delete a document from Firestore and remove it from cache', async () => {
      const id = '123';
      model.updateCache('deleted', [{ id, docType: 'items' }]);

      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      const result = await model.removePermanent(id);
      expect(deleteDoc).toHaveBeenCalledWith(doc(model.getDB(), 'items', id));
      expect(model.getCachedEntry(id, 'deleted')).toBeUndefined();
      expect(result).toEqual([]);
    });
  });

  describe('removeAllPermanent', () => {
    it('should delete multiple documents and update cache', async () => {
      const ids = ['id1', 'id2'];
      model.updateCache('deleted', [
        { id: 'id1', docType: 'items' },
        { id: 'id2', docType: 'services' },
      ]);

      const deleteMock = vi.fn();
      const commitMock = vi.fn().mockResolvedValue(undefined);

      vi.mocked(writeBatch).mockReturnValue({
        delete: deleteMock,
        commit: commitMock,
      } as never);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      vi.mocked(doc).mockImplementation((db, collection, id) => ({
        db,
        collection,
        id,
      }));

      const result = await model.removeAllPermanent(ids);

      expect(writeBatch).toHaveBeenCalledWith(model.getDB());
      expect(deleteMock).toHaveBeenCalledTimes(2);
      expect(deleteMock).toHaveBeenCalledWith({
        db: model.getDB(),
        collection: 'items',
        id: 'id1',
      });
      expect(deleteMock).toHaveBeenCalledWith({
        db: model.getDB(),
        collection: 'services',
        id: 'id2',
      });
      expect(commitMock).toHaveBeenCalled();

      expect(model.getCachedEntry('id1', 'deleted')).toBeUndefined();
      expect(model.getCachedEntry('id2', 'deleted')).toBeUndefined();
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a document in Firestore and cache', async () => {
      const item = {
        id: '123',
        name: 'Updated Item',
        docUpdated: 0,
        image: 'https://firebase',
      };
      const table = 'items';

      vi.mocked(setDoc).mockResolvedValue(undefined);

      await model.update(item, table);
      expect(doc).toHaveBeenCalledWith(model.getDB(), table, '123');
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ name: 'Updated Item' }),
        { merge: true },
      );
      expect(model.getCachedEntry('123', table)).toEqual(
        expect.objectContaining({ name: 'Updated Item' }),
      );
    });
  });

  describe('add', () => {
    it('should add a new document to Firestore and cache', async () => {
      const item = { name: 'New Item' };
      const table = 'items';
      const mockDocRef = { id: 'new123' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as DocumentReference);

      const id = await model.add(item, table);
      expect(collection).toHaveBeenCalledWith(model.getDB(), table);
      expect(addDoc).toHaveBeenCalledWith(expect.any(Object), item);
      expect(model.getCachedEntry('new123', table)).toEqual(
        expect.objectContaining({ id: 'new123', name: 'New Item' }),
      );
      expect(id).toBe('new123');
    });
  });

  describe('getAll', () => {
    it('should return cached data if within the 5 seconds window', async () => {
      const cachedData = [{ id: '1', name: 'cachedItem' }];
      model.updateCache('items', cachedData);
      vi.setSystemTime(Date.now() + 3000); // Within 5 seconds

      const result = await model.getAll('items');
      expect(result).toEqual(cachedData);
    });

    it('should fetch data from Firestore if cache is expired or forced', async () => {
      const collectionMock = vi.mocked(collection);
      const getDocsMock = vi.mocked(getDocs);

      const result = await model.getAll('items', true);
      expect(collectionMock).toHaveBeenCalledWith(mockDb, 'items');
      expect(getDocsMock).toHaveBeenCalled();
      expect(result).toEqual([
        { id: '1', name: 'item1' },
        { id: '2', name: 'item2' },
      ]);
    });
  });

  describe('logging features', () => {
    it('should set user and shopId correctly', () => {
      model.setUser({ uid: 'u1', email: 'user@example.com' } as User);
      model.setShopId('shop123');
      expect(model['_user']?.email).toBe('user@example.com');
      expect(model['_shopId']).toBe('shop123');
    });

    it('should handle logCatch increment and disable logs after multiple failures', () => {
      const error = new Error('test error');
      for (let i = 0; i < 6; i++) {
        model.logCatch(error);
      }
      expect(model['_logFailCount']).toBeGreaterThan(5);
      expect(model['_enableLogs']).toBe(false);
    });

    it('should report logging active status correctly', () => {
      expect(model.isLoggingActive()).toBe(false);
      model['_enableLogs'] = true;
      model['_collectionsToLog'] = ['items'];
      expect(model.isLoggingActive()).toBe(true);
    });

    it('should call addTransaction and cache transaction entry', async () => {
      const mockRef = { id: 'trx123' };
      vi.mocked(addDoc).mockResolvedValueOnce(
        mockRef as DocumentReference<unknown, DocumentData>,
      );
      model['_enableTransactions'] = true;
      model['_user'] = { uid: 'uid', email: 'me@example.com' } as User;
      model['_shopId'] = 'shop1';

      const item = {
        id: 'item1',
        name: 'Item',
        shop_id: ['shop1'],
        price: [100],
        cost: 50,
      };
      await model.addTransaction('item1', 'item', item, {
        from: 10,
        to: 5,
        index: 0,
      });

      const trx = model.getCachedEntry('trx123', 'transactions');
      expect(trx).toBeDefined();
      expect(trx?.transaction_type).toBe('sell');
    });
  });

  describe('log()', () => {
    beforeEach(() => {
      model.setUser({ uid: 'uid', email: 'test@example.com' } as User);
      model.setShopId('shop123');
      model['_collectionsToLog'] = ['items'];
      model['_enableLogs'] = true;
    });

    it('should skip logging if disabled', async () => {
      model['_enableLogs'] = false;
      const result = await model.log('update', 'items', 'id123', {
        id: 'id123',
      });
      expect(result).toBeUndefined();
    });

    it('should add log entry with changes for update', async () => {
      model.updateCache('items', [{ id: 'id123', name: 'Old' }]);
      vi.mocked(addDoc).mockResolvedValueOnce({
        id: 'log1',
      } as DocumentReference);

      await model.log('update', 'items', 'id123', { id: 'id123', name: 'New' });

      const log = model.getCachedEntry('log1', 'logs');
      expect(log).toBeDefined();
      expect(log?.changes).toHaveProperty('name');
    });

    it('should log errors during log entry creation', async () => {
      const error = new Error('log failure');
      vi.mocked(addDoc).mockRejectedValueOnce(error);

      await model.log(
        'add',
        'items',
        'id123',
        { id: 'id123', name: 'New' },
        'insert failed',
      );

      expect(model['_logFailCount']).toBeGreaterThan(0);
    });

    it('should not call transaction logging for non-update', async () => {
      const spy = vi.spyOn(model, 'addTransaction');
      vi.mocked(addDoc).mockResolvedValueOnce({
        id: 'log-add',
      } as DocumentReference);

      await model.log('add', 'items', 'id123', { id: 'id123', name: 'Fresh' });

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('updateAll', () => {
    it('should update multiple items including with image caching and generated ID', async () => {
      const mockWriteBatch = {
        set: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined),
      };
      const mockDocSpy = vi.mocked(doc);
      const mockCollectionSpy = vi.mocked(collection);

      vi.mocked(writeBatch).mockReturnValue(mockWriteBatch as never);
      mockDocSpy.mockImplementation(() => ({ id: 'auto123' }) as never);
      mockCollectionSpy.mockReturnValue({} as never);

      const items = [
        {
          id: '1',
          name: 'With ID',
          image: 'https://firebase/image.jpg',
        },
        null,
        {
          name: 'No ID',
          image: 'https://firebase/image.jpg',
        },
      ];

      await model.updateAll(items as never, 'items');

      expect(writeBatch).toHaveBeenCalled();
      expect(mockWriteBatch.set).toHaveBeenCalledTimes(2);
      expect(mockWriteBatch.commit).toHaveBeenCalled();
      expect(model.getCachedEntry('1', 'items')).toBeDefined();
      expect(model.getCachedEntry('auto123', 'items')).toBeDefined();
    });
  });
});

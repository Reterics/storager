import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import FirebaseDBModel from './FirebaseDBModel';
import {initializeApp, FirebaseApp} from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  DocumentSnapshot,
  DocumentReference,
} from 'firebase/firestore';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn().mockResolvedValue({}),
  getDocs: vi.fn().mockResolvedValue([
    {id: '1', data: () => ({id: '1', name: 'item1'})},
    {id: '2', data: () => ({id: '2', name: 'item2'})},
  ]),
  query: vi.fn(),
  doc: vi.fn().mockResolvedValue({}),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
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
        data: () => ({id: '123', name: 'Test Item'}),
      };
      vi.mocked(getDoc).mockResolvedValue(
        mockDocSnap as unknown as DocumentSnapshot
      );

      const result = await model.get('123', 'items');
      expect(doc).toHaveBeenCalledWith(model.getDB(), 'items', '123');
      expect(getDoc).toHaveBeenCalled();
      expect(result).toEqual({id: '123', name: 'Test Item'});
      expect(model.getCachedEntry('123', 'items')).toEqual({
        id: '123',
        name: 'Test Item',
      });
    });

    it('should return null if the document does not exist', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      vi.mocked(getDoc).mockResolvedValue({exists: () => false});

      const result = await model.get('123', 'items');
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should mark the document as deleted and move it to the deleted cache', async () => {
      const id = '123';
      const table = 'items';
      model.updateCache(table, [{id, name: 'Item to Delete'}]);
      model.getCachedEntry(id, table);

      vi.mocked(setDoc).mockResolvedValue(undefined);

      await model.remove(id, table);
      expect(doc).toHaveBeenCalledWith(model.getDB(), table, id);
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          deleted: true,
        }),
        {merge: true}
      );
      expect(model.getCachedEntry(id, 'deleted')).toEqual(
        expect.objectContaining({deleted: true})
      );
      expect(model.getCachedEntry(id, table)).toBeUndefined();
    });
  });

  describe('restore', () => {
    it('should restore a deleted document to its original table', async () => {
      const id = '123';
      model.updateCache('deleted', [
        {id, name: 'Deleted Item', docType: 'items', deleted: true},
      ]);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const result = await model.restore(id);
      expect(doc).toHaveBeenCalledWith(model.getDB(), 'items', id);
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({deleted: false}),
        {merge: true}
      );
      expect(result).toBe(true);
      expect(model.getCachedEntry(id, 'deleted')).toBeUndefined();
      expect(model.getCachedEntry(id, 'items')).toEqual(
        expect.objectContaining({deleted: false})
      );
    });
  });

  describe('removePermanent', () => {
    it('should permanently delete a document from Firestore and remove it from cache', async () => {
      const id = '123';
      model.updateCache('deleted', [{id, docType: 'items'}]);

      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      const result = await model.removePermanent(id);
      expect(deleteDoc).toHaveBeenCalledWith(doc(model.getDB(), 'items', id));
      expect(model.getCachedEntry(id, 'deleted')).toBeUndefined();
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
        expect.objectContaining({name: 'Updated Item'}),
        {merge: true}
      );
      expect(model.getCachedEntry('123', table)).toEqual(
        expect.objectContaining({name: 'Updated Item'})
      );
    });
  });

  describe('add', () => {
    it('should add a new document to Firestore and cache', async () => {
      const item = {name: 'New Item'};
      const table = 'items';
      const mockDocRef = {id: 'new123'};
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as DocumentReference);

      const id = await model.add(item, table);
      expect(collection).toHaveBeenCalledWith(model.getDB(), table);
      expect(addDoc).toHaveBeenCalledWith(expect.any(Object), item);
      expect(model.getCachedEntry('new123', table)).toEqual(
        expect.objectContaining({id: 'new123', name: 'New Item'})
      );
      expect(id).toBe('new123');
    });
  });

  describe('getAll', () => {
    it('should return cached data if within the 5 seconds window', async () => {
      const cachedData = [{id: '1', name: 'cachedItem'}];
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
        {id: '1', name: 'item1'},
        {id: '2', name: 'item2'},
      ]);
    });
  });
});

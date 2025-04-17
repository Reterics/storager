import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import DBModel from './DBModel';
import {TTLData} from '../interfaces/firebase.ts';
import {loadFromIndexedDB} from '../utils/indexedDB.ts';

vi.mock('../utils/indexedDB.ts', () => ({
  loadFromIndexedDB: vi.fn(),
  saveToIndexedDB: vi.fn(),
}));

class TestDBModel extends DBModel {
  constructor(options?: {ttl?: TTLData; mtime?: TTLData}) {
    super(options);
  }
}

describe('DBModel', () => {
  let model: TestDBModel;

  beforeEach(() => {
    model = new TestDBModel();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadPersisted', () => {
    it('should load data from IndexedDB and set cache, ttl, and mtime', async () => {
      vi.mocked(loadFromIndexedDB).mockImplementation(async (key) => {
        return [{id: '1', name: key + '1', key: key}];
      }); // Mock shops
      await model.loadPersisted();
      expect(loadFromIndexedDB).toHaveBeenCalledWith('shops');
      expect(model.getCached('shops')).toEqual([
        {id: '1', name: 'shops1', key: 'shops'},
      ]);
    });
  });

  describe('setTTL', () => {
    it('should set TTL for a given table', () => {
      model.setTTL('users', 1000);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(model._ttl['users']).toBe(1000);
    });
  });

  describe('updateMTime', () => {
    it('should update mtime for a given table', () => {
      model.updateMTime('users');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(model._mtime['users']).toBeGreaterThan(0);
    });
  });

  describe('getMTime', () => {
    it('should return mtime if set, otherwise 0', () => {
      model.updateMTime('users');
      expect(model.getMTime('users')).toBeGreaterThan(0);
      expect(model.getMTime('nonexistent')).toBe(0);
    });
  });

  describe('isExpired', () => {
    it('should return true if cache is expired', () => {
      model.setTTL('users', 1000);
      model.updateMTime('users');
      vi.setSystemTime(new Date(Date.now() + 2000)); // Fast-forward time
      expect(model.isExpired('users')).toBe(true);
    });

    it('should return false if cache is not expired', () => {
      model.setTTL('users', 10000);
      model.updateMTime('users');
      expect(model.isExpired('users')).toBe(false);
    });
  });

  describe('invalidateCache', () => {
    it('should clear cache and mtime for a table', () => {
      model.updateCache('users', [{id: '1', name: 'user1'}]);
      model.updateMTime('users');
      model.invalidateCache('users');
      expect(model.getCached('users')).toBeNull();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(model._mtime['users']).toBeUndefined();
    });
  });

  describe('getCached', () => {
    it('should return cache if it exists and is not expired', () => {
      model.updateCache('users', [{id: '1', name: 'user1'}]);
      expect(model.getCached('users')).toEqual([{id: '1', name: 'user1'}]);
    });

    it('should return null if cache is expired', () => {
      model.updateCache('users', [{id: '1', name: 'user1'}]);
      model.setTTL('users', 1000);
      model.updateMTime('users');
      vi.setSystemTime(new Date(Date.now() + 2000));
      expect(model.getCached('users')).toBeNull();
    });
  });

  describe('removeCachedEntry', () => {
    it('should remove entry from cache', () => {
      model.updateCache('users', [
        {id: '1', name: 'user1'},
        {id: '2', name: 'user2'},
      ]);
      model.removeCachedEntry('1', 'users');
      expect(model.getCached('users')).toEqual([{id: '2', name: 'user2'}]);
    });
  });

  describe('appendCachedEntry', () => {
    it('should add a new entry to cache', () => {
      model.appendCachedEntry('users', {id: '3', name: 'user3'});
      expect(model.getCached('users')).toEqual([{id: '3', name: 'user3'}]);
    });
  });
});

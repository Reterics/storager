import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DBModel from './DBModel';
import type { TTLData, CommonCollectionData } from '../interfaces/firebase.ts';
import { loadFromIndexedDB, saveToIndexedDB } from '../utils/indexedDB.ts';

vi.mock('../utils/indexedDB.ts', () => ({
  loadFromIndexedDB: vi.fn(),
  saveToIndexedDB: vi.fn(),
}));

class TestDBModel extends DBModel {
  constructor(options?: { ttl?: TTLData; mtime?: TTLData }) {
    super(options);
  }
}

describe('DBModel', () => {
  let model: TestDBModel;

  beforeEach(() => {
    vi.useFakeTimers();
    model = new TestDBModel();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('loadPersisted', () => {
    it('should load data from IndexedDB and set cache, ttl, and mtime', async () => {
      vi.mocked(loadFromIndexedDB).mockImplementation(async (key) => {
        return [{ id: '1', name: key + '1', key: key }];
      }); // Mock shops
      await model.loadPersisted();
      expect(loadFromIndexedDB).toHaveBeenCalledWith('shops');
      expect(model.getCached('shops')).toEqual([
        { id: '1', name: 'shops1', key: 'shops' },
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
      model.updateCache('users', [{ id: '1', name: 'user1' }]);
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
      model.updateCache('users', [{ id: '1', name: 'user1' }]);
      expect(model.getCached('users')).toEqual([{ id: '1', name: 'user1' }]);
    });

    it('should return null if cache is expired', () => {
      model.updateCache('users', [{ id: '1', name: 'user1' }]);
      model.setTTL('users', 1000);
      model.updateMTime('users');
      vi.setSystemTime(new Date(Date.now() + 2000));
      expect(model.getCached('users')).toBeNull();
    });
  });

  describe('removeCachedEntry', () => {
    it('should remove entry from cache', () => {
      model.updateCache('users', [
        { id: '1', name: 'user1' },
        { id: '2', name: 'user2' },
      ]);
      model.removeCachedEntry('1', 'users');
      expect(model.getCached('users')).toEqual([{ id: '2', name: 'user2' }]);
    });
  });

  describe('appendCachedEntry', () => {
    it('should add a new entry to cache', () => {
      model.appendCachedEntry('users', { id: '3', name: 'user3' });
      expect(model.getCached('users')).toEqual([{ id: '3', name: 'user3' }]);
    });
  });

  it('updateCache sets collection and updates mtime', () => {
    const before = model.getMTime('users');
    model.updateCache('users', [
      { id: '1', name: 'user1' } as unknown as CommonCollectionData,
    ]);
    const after = model.getMTime('users');
    expect(after).toBeGreaterThanOrEqual(before);
    expect(model.getCached('users')).toEqual([{ id: '1', name: 'user1' }]);
  });

  it('updateCachedEntry merges into existing entry by id', () => {
    model.updateCache('users', [
      { id: '1', name: 'old' } as unknown as CommonCollectionData,
    ]);
    model.updateCachedEntry('1', 'users', {
      id: '1',
      name: 'new',
      extra: true,
    } as unknown as CommonCollectionData);
    expect(model.getCached('users')).toEqual([
      { id: '1', name: 'new', extra: true },
    ]);
  });

  it('updateCachedEntry pushes when entry not found and creates array if needed', () => {
    model.updateCachedEntry('2', 'users', {
      id: '2',
      name: 'two',
    } as unknown as CommonCollectionData);
    expect(model.getCached('users')).toEqual([{ id: '2', name: 'two' }]);
  });

  it('removeCachedEntry is noop when not found, still updates mtime', () => {
    const before = model.getMTime('users');
    model.updateCache('users', [
      { id: '1', name: 'user1' } as unknown as CommonCollectionData,
    ]);
    const m1 = model.getMTime('users');
    model.removeCachedEntry('nope', 'users');
    const m2 = model.getMTime('users');
    expect(model.getCached('users')).toEqual([{ id: '1', name: 'user1' }]);
    expect(m2).toBeGreaterThanOrEqual(m1);
    expect(m1).toBeGreaterThanOrEqual(before);
  });

  it('getCached logs and invalidates when expired', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    model.updateCache('users', [
      { id: '1', name: 'user1' } as unknown as CommonCollectionData,
    ]);
    model.setTTL('users', 10);
    model.updateMTime('users');
    vi.setSystemTime(new Date(Date.now() + 20));
    expect(model.getCached('users')).toBeNull();
    expect(logSpy).toHaveBeenCalledWith('users is expired');
    expect(logSpy).toHaveBeenCalledWith('users has no cache');
    logSpy.mockRestore();
  });

  it('getCached logs has cache and returns non-empty or non-array values', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    model.updateCache('users', [
      { id: '1' } as unknown as CommonCollectionData,
    ]);
    expect(model.getCached('users')).not.toBeNull();
    expect(logSpy).toHaveBeenCalledWith('users has cache');
    logSpy.mockRestore();
  });

  it('getCachedEntry returns undefined when no cache', () => {
    const result = model.getCachedEntry('1', 'users');
    expect(result).toBeUndefined();
  });

  it('getCachedEntry works with existing cache', () => {
    model.updateCache('users', [
      { id: '1', a: 1 } as unknown as CommonCollectionData,
      { id: '2', a: 2 } as unknown as CommonCollectionData,
    ]);
    expect(model.getCachedEntry('2', 'users')).toEqual({ id: '2', a: 2 });
    expect(model.getCachedEntry('3', 'users')).toBeUndefined();
  });

  it('getCachedEntryIndex returns -1 when no cache or not found', () => {
    expect(model.getCachedEntryIndex('1', 'users')).toBe(-1);
    model.updateCache('users', [
      { id: '2' } as unknown as CommonCollectionData,
    ]);
    expect(model.getCachedEntryIndex('1', 'users')).toBe(-1);
  });

  it('getCachedEntryIndex returns index when found', () => {
    model.updateCache('users', [
      { id: '2' } as unknown as CommonCollectionData,
      { id: '1' } as unknown as CommonCollectionData,
    ]);
    expect(model.getCachedEntryIndex('1', 'users')).toBe(1);
  });

  it('loadPersisted preserves provided ttl overrides and merges correctly', async () => {
    const override = new TestDBModel({
      ttl: { users: 999 },
      mtime: { users: 1 },
    });
    vi.mocked(loadFromIndexedDB).mockImplementation(async (key) => {
      if (key === 'ttl') return { users: 100, items: 50 } as unknown as TTLData;
      if (key === 'mtime') return { users: 2 } as unknown as TTLData;
      return [] as unknown as CommonCollectionData[];
    });
    await override.loadPersisted();
    // @ts-expect-error test internal
    expect(override._ttl).toEqual({ users: 999, items: 50 });
    // @ts-expect-error test internal
    expect(override._mtime).toEqual({ users: 2 });
  });

  it('savePersisted calls saveToIndexedDB for all stores and catches errors', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    model.updateCache('shops', [
      { id: 's1' } as unknown as CommonCollectionData,
    ]);
    model.updateCache('items', [
      { id: 'i1' } as unknown as CommonCollectionData,
    ]);
    model.updateCache('parts', [
      { id: 'p1' } as unknown as CommonCollectionData,
    ]);
    model.updateCache('services', [
      { id: 'sv1' } as unknown as CommonCollectionData,
    ]);
    model.updateCache('completions', [
      { id: 'c1' } as unknown as CommonCollectionData,
    ]);
    model.updateCache('settings', [
      { id: 'st1' } as unknown as CommonCollectionData,
    ]);
    model.updateCache('users', [
      { id: 'u1' } as unknown as CommonCollectionData,
    ]);
    model.updateCache('archive', [
      { id: 'a1' } as unknown as CommonCollectionData,
    ]);
    model.updateCache('types', [
      { id: 't1' } as unknown as CommonCollectionData,
    ]);
    model.updateCache('deleted', [
      { id: 'd1' } as unknown as CommonCollectionData,
    ]);
    model.updateCache('leases', [
      { id: 'l1' } as unknown as CommonCollectionData,
    ]);
    model.updateCache('leaseCompletions', [
      { id: 'lc1' } as unknown as CommonCollectionData,
    ]);

    await model.savePersisted();
    expect(saveToIndexedDB).toHaveBeenCalledWith('shops', expect.anything());
    expect(saveToIndexedDB).toHaveBeenCalledWith('items', expect.anything());
    expect(saveToIndexedDB).toHaveBeenCalledWith('parts', expect.anything());
    expect(saveToIndexedDB).toHaveBeenCalledWith('services', expect.anything());
    expect(saveToIndexedDB).toHaveBeenCalledWith(
      'completions',
      expect.anything(),
    );
    expect(saveToIndexedDB).toHaveBeenCalledWith('settings', expect.anything());
    expect(saveToIndexedDB).toHaveBeenCalledWith('users', expect.anything());
    expect(saveToIndexedDB).toHaveBeenCalledWith('archive', expect.anything());
    expect(saveToIndexedDB).toHaveBeenCalledWith('types', expect.anything());
    expect(saveToIndexedDB).toHaveBeenCalledWith('deleted', expect.anything());
    expect(saveToIndexedDB).toHaveBeenCalledWith('leases', expect.anything());
    expect(saveToIndexedDB).toHaveBeenCalledWith(
      'leaseCompletions',
      expect.anything(),
    );
    expect(saveToIndexedDB).toHaveBeenCalledWith('ttl', expect.anything());
    expect(saveToIndexedDB).toHaveBeenCalledWith('mtime', expect.anything());

    // Simulate error path
    vi.mocked(saveToIndexedDB).mockRejectedValueOnce(new Error('boom'));
    await model.savePersisted();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('sync schedules savePersisted and clears previous timeout', async () => {
    const saveSpy = vi
      .spyOn(model, 'savePersisted')
      .mockResolvedValue(undefined as unknown as void);
    // schedule first
    model.sync(100);
    // schedule second before firing
    model.sync(100);
    // Fast-forward timers
    vi.advanceTimersByTime(120);
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });

  it('loadPersisted handles error and does not set cache (covers catch at lines 48-49)', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(loadFromIndexedDB).mockRejectedValue(new Error('fail'));
    await model.loadPersisted();
    expect(errSpy).toHaveBeenCalled();
    expect(model.getCached('users')).toBeNull();
    errSpy.mockRestore();
  });

  it('loadPersisted does not set cache if settings missing (covers condition at 51)', async () => {
    vi.mocked(loadFromIndexedDB).mockImplementation(async (key) => {
      if (key === 'users') return [{ id: 'u1', name: 'User' }];
      if (key === 'settings')
        return undefined as unknown as CommonCollectionData[];
      if (key === 'ttl') return {} as unknown as TTLData;
      if (key === 'mtime') return {} as unknown as TTLData;
      return [] as unknown as CommonCollectionData[];
    });
    await model.loadPersisted();
    expect(model.getCached('users')).toBeNull();
  });

  it('isExpired without mtime updates mtime and returns false (covers 112-115)', () => {
    model.setTTL('users', 1000);
    // no mtime set yet
    const before = model.getMTime('users');
    expect(before).toBe(0);
    const result = model.isExpired('users');
    expect(result).toBe(false);
    const after = model.getMTime('users');
    expect(after).toBeGreaterThan(0);
  });

  it('getAll default returns empty array (covers 123-124)', async () => {
    const all = await model.getAll('any');
    expect(all).toEqual([]);
  });

  it('get default returns null (covers 130-131)', async () => {
    const one = await model.get('id', 'any');
    expect(one).toBeNull();
  });

  it('appendCachedEntry initializes array when missing (covers 166-168)', () => {
    // ensure no prior cache for "alpha"
    expect(model.getCached('alpha')).toBeNull();
    model.appendCachedEntry('alpha', {
      id: 'a1',
      x: 1,
    } as unknown as CommonCollectionData);

    // @ts-expect-error inspect internal cache for array creation
    expect(Array.isArray(model._cache['alpha'])).toBe(true);
    expect(model.getCached('alpha')).toEqual([{ id: 'a1', x: 1 }]);
  });
});

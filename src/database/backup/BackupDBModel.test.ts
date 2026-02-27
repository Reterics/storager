import { describe, it, expect, vi, beforeEach } from 'vitest';
import BackupDBModel from './BackupDBModel';

vi.mock('../../utils/indexedDB.ts', () => ({
  loadFromIndexedDB: vi.fn(async (key) => {
    if (key === 'backup') {
      return [{ id: '1', updated: 12345 }];
    }
    return [{ id: 'test' }];
  }),
  saveToIndexedDB: vi.fn(async () => {}),
}));

const { loadFromIndexedDB, saveToIndexedDB } =
  await import('../../utils/indexedDB.ts');

describe('BackupDBModel', () => {
  let model: BackupDBModel;

  beforeEach(() => {
    vi.clearAllMocks();
    model = new BackupDBModel();
  });

  it('loads persisted backups into internal state', async () => {
    await model.loadPersisted();
    expect(loadFromIndexedDB).toHaveBeenCalledWith('backup');
    expect(model.getAll()).toHaveLength(1);
    expect(model.getAll()[0].id).toBe('1');
  });

  it('adds a backup from IndexedDB and saves it', async () => {
    await model.add();
    const all = model.getAll();
    expect(loadFromIndexedDB).toHaveBeenCalledWith('shops');
    expect(saveToIndexedDB).toHaveBeenCalled();
    expect(all.length).toBe(1);
    expect(all[0]).toHaveProperty('id');
    expect(all[0]).toHaveProperty('shops');
  });

  it('removes a backup by id', async () => {
    await model.loadPersisted();
    await model.remove('1');
    expect(saveToIndexedDB).toHaveBeenCalled();
    expect(model.getAll()).toHaveLength(0);
  });
});

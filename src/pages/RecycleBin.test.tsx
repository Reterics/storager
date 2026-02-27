import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RecycleBin from './RecycleBin';
import { DBContext } from '../database/DBContext';
import type {
  ContextDataValueType,
  DBContextType,
} from '../interfaces/firebase.ts';
import type { TableRowType } from '../interfaces/interfaces.ts';

// ---------- Mocks ----------
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('../components/elements/PageHead.tsx', () => ({
  PageHead: ({
    title,
    buttons,
  }: {
    title: React.ReactNode;
    buttons?: { value: React.ReactNode; onClick: () => void }[];
  }) => (
    <div data-testid="pagehead">
      {title}
      {(buttons || []).map((btn, i) => (
        <button key={i} onClick={btn.onClick}>
          {btn.value}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../components/elements/TableViewComponent.tsx', () => {
  const TableViewComponent = ({
    lines,
    onClick,
    selectedIndexes,
  }: {
    lines: TableRowType[][];
    onClick: (index: number) => void;
    selectedIndexes: Record<number, boolean>;
  }) => (
    <div>
      {lines.map((cells, idx) => (
        <div key={idx}>
          <button
            data-testid={`row-${idx}`}
            aria-pressed={!!selectedIndexes[idx]}
            onClick={() => onClick(idx)}
          >
            row {idx} - {String(cells[1])}
          </button>
          <span data-testid={`actions-${idx}`}>{cells[cells.length - 1]}</span>
        </div>
      ))}
    </div>
  );

  const TableViewActions = ({ onRemove }: { onRemove: () => void }) => (
    <button data-testid="remove-action" onClick={onRemove}>
      remove
    </button>
  );

  return { default: TableViewComponent, TableViewActions };
});

const confirmMock = vi.fn();
vi.mock('../components/modalExporter.ts', () => ({
  confirm: () => confirmMock(),
}));

vi.mock('../utils/general.ts', async () => {
  const actual = await vi.importActual('../utils/general.ts');
  return { ...actual, sleep: () => Promise.resolve() };
});

// ---------- Helpers ----------
const makeItem = (
  id: string,
  over: Partial<ContextDataValueType> = {},
): ContextDataValueType =>
  ({
    id,
    docType: 'items',
    docUpdated: new Date().toISOString(),
    name: `Item ${id}`,
    ...over,
  }) as unknown as ContextDataValueType;

describe('RecycleBin', () => {
  const removePermanentData = vi.fn().mockResolvedValue(undefined);
  const removePermanentDataList = vi.fn().mockResolvedValue(undefined);
  const setData = vi.fn().mockResolvedValue(undefined);

  const renderWithCtx = (deletedItems: ContextDataValueType[]) => {
    const ctx = {
      data: { deleted: deletedItems },
      removePermanentData,
      removePermanentDataList,
      setData,
    } as unknown as DBContextType;

    return render(
      <DBContext.Provider value={ctx}>
        <RecycleBin />
      </DBContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('no items -> no "Select" button (items.length branch)', () => {
    renderWithCtx([]);
    expect(
      screen.queryByRole('button', { name: 'Select' }),
    ).not.toBeInTheDocument();
  });

  it('syncs items on context change (useEffect dependency)', () => {
    const itemsA = [makeItem('1')];
    const { rerender } = render(
      <DBContext.Provider
        value={
          {
            data: { deleted: itemsA },
            removePermanentData,
            removePermanentDataList,
            setData,
          } as unknown as DBContextType
        }
      >
        <RecycleBin />
      </DBContext.Provider>,
    );

    expect(screen.getByTestId('row-0')).toBeInTheDocument();

    const itemsB = [makeItem('1'), makeItem('2')];
    rerender(
      <DBContext.Provider
        value={
          {
            data: { deleted: itemsB },
            removePermanentData,
            removePermanentDataList,
            setData,
          } as unknown as DBContextType
        }
      >
        <RecycleBin />
      </DBContext.Provider>,
    );

    expect(screen.getByTestId('row-1')).toBeInTheDocument();
  });

  it('row select, select-all then deselect-all (both branches), single delete confirm=true creates backup', async () => {
    renderWithCtx([makeItem('1'), makeItem('2')]);

    // enter selecting
    fireEvent.click(screen.getByTestId('row-0'));
    // select all
    fireEvent.click(screen.getByRole('button', { name: 'Select All' }));
    expect(
      screen.getByRole('button', { name: 'Deselect All' }),
    ).toBeInTheDocument();
    // deselect all
    fireEvent.click(screen.getByRole('button', { name: 'Deselect All' }));

    // single delete on row 0
    confirmMock.mockResolvedValueOnce(true);
    const removeBtn = screen
      .getByTestId('actions-0')
      .querySelector('[data-testid="remove-action"]') as HTMLButtonElement;
    fireEvent.click(removeBtn);

    await waitFor(() => expect(removePermanentData).toHaveBeenCalledWith('1'));
    expect(localStorage.getItem('recycleBinBackup')).toBeTruthy();
    expect(localStorage.getItem('recycleBinBackupTime')).toBeTruthy();
  });

  it('single delete confirm=false -> no call, no backup', async () => {
    renderWithCtx([makeItem('1')]);
    confirmMock.mockResolvedValueOnce(false);
    const removeBtn = screen
      .getByTestId('actions-0')
      .querySelector('[data-testid="remove-action"]') as HTMLButtonElement;
    fireEvent.click(removeBtn);

    await waitFor(() => expect(removePermanentData).not.toHaveBeenCalled());
    expect(localStorage.getItem('recycleBinBackup')).toBeNull();
  });

  it('bulk delete confirm=false -> early return (no backup, no calls)', async () => {
    renderWithCtx([makeItem('1'), makeItem('2')]);
    // enter selecting
    fireEvent.click(screen.getByTestId('row-0'));
    // select all (so button appears)
    fireEvent.click(screen.getByRole('button', { name: 'Select All' }));

    confirmMock.mockResolvedValueOnce(false);
    fireEvent.click(screen.getByRole('button', { name: /Delete/ }));

    await waitFor(() => {
      expect(removePermanentDataList).not.toHaveBeenCalled();
      expect(localStorage.getItem('recycleBinBackup')).toBeNull();
    });
  });

  it('bulk delete confirm=true -> chunking only, selection cleared, backup set', async () => {
    const items = Array.from({ length: 102 }, (_, i) =>
      makeItem(String(i + 1)),
    );
    renderWithCtx(items);

    // enter selecting & select all
    fireEvent.click(screen.getByTestId('row-0'));
    fireEvent.click(screen.getByRole('button', { name: 'Select All' }));

    confirmMock.mockResolvedValueOnce(true);
    fireEvent.click(screen.getByRole('button', { name: /Delete/ }));

    await waitFor(() => {
      expect(removePermanentDataList).toHaveBeenCalledTimes(2);
      expect(removePermanentDataList.mock.calls[0][0]).toHaveLength(100);
      expect(removePermanentDataList.mock.calls[1][0]).toHaveLength(2);
    });

    // selection cleared
    await waitFor(() =>
      expect(screen.getByTestId('row-0')).toHaveAttribute(
        'aria-pressed',
        'false',
      ),
    );

    const backup = JSON.parse(localStorage.getItem('recycleBinBackup') || '[]');
    expect(backup).toHaveLength(102);
  });

  it('restore from backup success -> restores missing only, clears backup, toggles disabled label', async () => {
    const existing = makeItem('1');
    renderWithCtx([existing]);

    const backupItems = [existing, makeItem('2')];
    localStorage.setItem('recycleBinBackup', JSON.stringify(backupItems));
    localStorage.setItem('recycleBinBackupTime', new Date().toISOString());

    // re-mount to trigger backup loader effect
    const { unmount } = renderWithCtx([existing]);
    unmount();
    renderWithCtx([existing]);

    expect(screen.getByText('Backup Available')).toBeInTheDocument();

    confirmMock.mockResolvedValueOnce(true);
    fireEvent.click(
      screen.getByRole('button', { name: 'Restore from Backup' }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Restoring...' }),
      ).toBeDisabled(),
    );

    await waitFor(() => {
      expect(setData).toHaveBeenCalledTimes(1);
      expect(setData).toHaveBeenCalledWith(
        'items',
        expect.objectContaining({ id: '2' }),
      );
    });

    await waitFor(() => {
      expect(localStorage.getItem('recycleBinBackup')).toBeNull();
      expect(localStorage.getItem('recycleBinBackupTime')).toBeNull();
      expect(screen.queryByText('Backup Available')).not.toBeInTheDocument();
    });
  });

  it('restore from backup cancel -> leaves backup intact, no setData', async () => {
    renderWithCtx([makeItem('1')]);
    localStorage.setItem('recycleBinBackup', JSON.stringify([makeItem('9')]));
    localStorage.setItem('recycleBinBackupTime', new Date().toISOString());

    const { unmount } = renderWithCtx([makeItem('1')]);
    unmount();
    renderWithCtx([makeItem('1')]);

    expect(screen.getByText('Backup Available')).toBeInTheDocument();

    confirmMock.mockResolvedValueOnce(false);
    fireEvent.click(
      screen.getByRole('button', { name: 'Restore from Backup' }),
    );

    await waitFor(() => {
      expect(setData).not.toHaveBeenCalled();
      expect(localStorage.getItem('recycleBinBackup')).toBeTruthy();
    });
  });

  it('restore from backup with setData throwing -> hits catch branch, finally re-enables', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setData.mockRejectedValueOnce(new Error('boom'));

    renderWithCtx([]);
    localStorage.setItem('recycleBinBackup', JSON.stringify([makeItem('5')]));
    localStorage.setItem('recycleBinBackupTime', new Date().toISOString());

    const { unmount } = renderWithCtx([]);
    unmount();
    renderWithCtx([]);

    confirmMock.mockResolvedValueOnce(true);
    fireEvent.click(
      screen.getByRole('button', { name: 'Restore from Backup' }),
    );

    await waitFor(() => expect(errSpy).toHaveBeenCalled()); // catch branch
    // button returns to enabled state with normal label after finally{}
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Restore from Backup' }),
      ).toBeEnabled(),
    );
    errSpy.mockRestore();
  });

  it('restore from backup when item has no docType -> warns and skips setData (else-branch)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithCtx([]);

    const bad = makeItem('x', { docType: undefined });
    localStorage.setItem('recycleBinBackup', JSON.stringify([bad]));
    localStorage.setItem('recycleBinBackupTime', new Date().toISOString());

    const { unmount } = renderWithCtx([]);
    unmount();
    renderWithCtx([]);

    confirmMock.mockResolvedValueOnce(true);
    fireEvent.click(
      screen.getByRole('button', { name: 'Restore from Backup' }),
    );

    await waitFor(() => expect(warnSpy).toHaveBeenCalled());
    expect(setData).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('invalid backup JSON -> loader effect clears both keys (catch branch)', () => {
    localStorage.setItem('recycleBinBackup', '{bad json');
    localStorage.setItem('recycleBinBackupTime', new Date().toISOString());
    renderWithCtx([makeItem('1')]);

    expect(localStorage.getItem('recycleBinBackup')).toBeNull();
    expect(localStorage.getItem('recycleBinBackupTime')).toBeNull();
  });

  it('selection mode with zero selected -> no Delete button', () => {
    renderWithCtx([makeItem('1')]);
    // toggle same row twice: enters selecting, ends with 0 selected
    fireEvent.click(screen.getByTestId('row-0'));
    fireEvent.click(screen.getByTestId('row-0'));
    expect(
      screen.queryByRole('button', { name: /Delete/ }),
    ).not.toBeInTheDocument();
  });

  it('cancel selection -> exits selecting mode and clears selection', () => {
    renderWithCtx([makeItem('1'), makeItem('2')]);
    // enter selecting by clicking a row
    fireEvent.click(screen.getByTestId('row-0'));
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    // cancel
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    // back to browse mode: "Select" button visible, no "Cancel"
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancel' }),
    ).not.toBeInTheDocument();
  });

  it('row name fallback uses client_name when name is missing', () => {
    renderWithCtx([
      makeItem('1', { name: undefined, client_name: 'Client X' }),
    ]);
    expect(screen.getByText(/Client X/)).toBeInTheDocument();
  });
});

import { useContext, useEffect, useState } from 'react';
import { DBContext } from '../database/DBContext.ts';
import { useTranslation } from 'react-i18next';
import type { ContextDataValueType } from '../interfaces/firebase.ts';
import { PageHead } from '../components/elements/PageHead.tsx';
import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import { BsTrash, BsArrowCounterclockwise } from 'react-icons/bs';
import { confirm } from '../components/modalExporter.ts';
import { sleep } from '../utils/general.ts';
import type { GeneralButtons } from '../interfaces/interfaces.ts';

function RecycleBin() {
  const dbContext = useContext(DBContext);
  const { t } = useTranslation();

  const [items, setItems] = useState<ContextDataValueType[]>(
    dbContext?.data.deleted || [],
  );
  const [selectedIndexes, setSelectedIndexes] = useState<
    Record<number, boolean>
  >({});
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [backupInfo, setBackupInfo] = useState<{
    time: string | null;
    count: number;
    items: ContextDataValueType[] | null;
  }>({
    time: null,
    count: 0,
    items: null,
  });
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  useEffect(() => {
    if (dbContext?.data.deleted) {
      setItems(dbContext?.data.deleted);
    }
  }, [dbContext?.data.deleted]);

  // Load backup information from localStorage
  useEffect(() => {
    const backupTime = localStorage.getItem('recycleBinBackupTime');
    const backupData = localStorage.getItem('recycleBinBackup');

    if (backupTime && backupData) {
      try {
        const parsedBackup = JSON.parse(backupData) as ContextDataValueType[];
        setBackupInfo({
          time: backupTime,
          count: parsedBackup.length,
          items: parsedBackup,
        });
      } catch (error) {
        console.error('Failed to parse backup data:', error);
        // Clear invalid backup data
        localStorage.removeItem('recycleBinBackup');
        localStorage.removeItem('recycleBinBackupTime');
      }
    }
  }, []);

  const toggleRowSelection = (index: number) => {
    if (!isSelecting) {
      setIsSelecting(true);
    }
    setSelectedIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleSelectAll = () => {
    if (!isSelecting) {
      setIsSelecting(true);
    }

    // Check if all items are currently selected
    const allSelected =
      items.length > 0 && items.every((_, index) => selectedIndexes[index]);

    if (allSelected) {
      // If all are selected, deselect all
      setSelectedIndexes({});
    } else {
      // Otherwise, select all
      const newSelectedIndexes: Record<number, boolean> = {};
      items.forEach((_, index) => {
        newSelectedIndexes[index] = true;
      });
      setSelectedIndexes(newSelectedIndexes);
    }
  };

  const getSelectedItems = () => {
    return Object.entries(selectedIndexes)

      .filter(([_, isSelected]) => isSelected)
      .map(([index]) => items[parseInt(index)]);
  };

  const createBackup = (itemsToBackup: ContextDataValueType[]) => {
    // Create a backup of the items before deletion
    const backup = JSON.stringify(itemsToBackup);
    localStorage.setItem('recycleBinBackup', backup);
    localStorage.setItem('recycleBinBackupTime', new Date().toISOString());
    console.log('Backup created for', itemsToBackup.length, 'items');
  };

  const deleteInChunks = async (ids: string[]) => {
    const chunkSize = 100;

    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      await dbContext?.removePermanentDataList(chunk);

      if (i + chunkSize < ids.length) {
        await sleep(1000);
      }
    }

    setSelectedIndexes({});
    setIsSelecting(false);
  };

  const deletePermanent = async (id: string) => {
    if (await confirm(t('Are you sure you want to delete permanently?'))) {
      // Create backup of the single item
      const itemToDelete = items.find((item) => item.id === id);
      if (itemToDelete) {
        createBackup([itemToDelete]);
      }
      await dbContext?.removePermanentData(id);
    }
  };

  const bulkDeletePermanent = async () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) return;

    if (
      await confirm(
        t('Are you sure you want to delete all selected items permanently?'),
      )
    ) {
      // Create backup before deletion
      createBackup(selectedItems);

      await deleteInChunks(selectedItems.map((item) => item.id));
    }
  };

  const getOldItems = () => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return items.filter((item) => (item.docUpdated as number) < thirtyDaysAgo);
  };

  const wipeOldItems = async () => {
    const oldItems = getOldItems();
    if (oldItems.length === 0) return;

    if (
      await confirm(
        t(
          'Are you sure you want to permanently delete items older than 30 days?',
        ),
      )
    ) {
      createBackup(oldItems);

      await deleteInChunks(oldItems.map((item) => item.id));
    }
  };

  const restoreFromBackup = async () => {
    if (!backupInfo.items || backupInfo.items.length === 0) return;

    setIsRestoring(true);

    try {
      if (
        await confirm(
          t('Are you sure you want to restore items from the backup?'),
        )
      ) {
        // Restore items one by one
        for (const item of backupInfo.items) {
          // Check if the item is not already in the recycle bin
          if (!items.some((existingItem) => existingItem.id === item.id)) {
            // Determine the item type based on its properties
            const itemType = item.docType;
            if (itemType && dbContext) {
              // Add the item back to its original collection
              await dbContext.setData(itemType, item);
              console.log(`Restored item ${item.id} to ${itemType}`);
            } else {
              console.warn(`Could not determine type for item ${item.id}`);
            }
          }
        }
        // Clear backup after successful restore
        localStorage.removeItem('recycleBinBackup');
        localStorage.removeItem('recycleBinBackupTime');

        setBackupInfo({
          time: null,
          count: 0,
          items: null,
        });
      }
    } catch (error) {
      console.error('Failed to restore from backup:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const tableLines = items.map((item) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const name = item.name || item.client_name || '';

    return [
      item.id,
      name,
      t(item.docType || ''),
      new Date(item.docUpdated || new Date()).toISOString().split('.')[0],
      TableViewActions({
        onRemove: () => deletePermanent(item.id),
      }),
    ];
  });

  const selectedCount = Object.values(selectedIndexes).filter(Boolean).length;

  const cancelSelection = () => {
    setSelectedIndexes({});
    setIsSelecting(false);
  };

  const allSelected =
    items.length > 0 && items.every((_, index) => selectedIndexes[index]);

  const headButtons: GeneralButtons[] = (() => {
    if (isSelecting && items.length) {
      const buttons: GeneralButtons[] = [
        {
          value: allSelected ? t('Deselect All') : t('Select All'),
          onClick: toggleSelectAll,
        },
      ];
      if (selectedCount > 0) {
        buttons.push({
          value: (
            <span className="flex items-center -my-1">
              <BsTrash className="mr-1.5" />
              {t('Delete') + ` (${selectedCount})`}
            </span>
          ),
          onClick: bulkDeletePermanent,
        });
      }
      buttons.push({
        value: t('Cancel'),
        onClick: cancelSelection,
      });
      return buttons;
    }
    if (items.length > 0) {
      const buttons = [];
      if (getOldItems().length > 0) {
        buttons.push({
          value: (
            <span className="flex items-center -my-1">
              <BsTrash className="mr-1.5" />
              {t('Wipe 30+ days')}
            </span>
          ),
          onClick: wipeOldItems,
        });
      }
      buttons.push({
        value: t('Select'),
        onClick: () => setIsSelecting(true),
      });
      return buttons;
    }
    return [];
  })();

  return (
    <>
      <PageHead title={t('Recycle Bin')} buttons={headButtons} />
      <div className="mb-2 mt-1" />

      <TableViewComponent
        lines={tableLines}
        header={[t('ID'), t('Name'), t('Type'), t('Date'), t('Actions')]}
        onClick={toggleRowSelection}
        selectedIndexes={selectedIndexes}
      ></TableViewComponent>

      {backupInfo.items && backupInfo.items.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
                {t('Backup Available')}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                {t('Last backup')}:{' '}
                {new Date(backupInfo.time || '').toLocaleString()} -{' '}
                {backupInfo.count} {t('items')}
              </p>
            </div>
            <button
              onClick={restoreFromBackup}
              disabled={isRestoring}
              className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${
                isRestoring
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <BsArrowCounterclockwise className="mr-1.5" />
              {isRestoring ? t('Restoring...') : t('Restore from Backup')}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1"></div>
    </>
  );
}

export default RecycleBin;

import {useContext, useEffect, useState} from 'react';
import {DBContext} from '../database/DBContext.ts';
import {useTranslation} from 'react-i18next';
import {ContextDataValueType} from '../interfaces/firebase.ts';
import {PageHead} from '../components/elements/PageHead.tsx';
import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import {BsFillTrash3Fill} from 'react-icons/bs';
import {confirm} from '../components/modalExporter.ts';

function RecycleBin() {
  const dbContext = useContext(DBContext);
  const {t} = useTranslation();

  const [items, setItems] = useState<ContextDataValueType[]>(
    dbContext?.data.deleted || []
  );

  useEffect(() => {
    if (dbContext?.data.deleted) {
      setItems(dbContext?.data.deleted);
    }
  }, [dbContext?.data.deleted]);

  const deletePermanent = async (id: string) => {
    if (await confirm(t('Are you sure you want to delete permanently?'))) {
      await dbContext?.removePermanentData(id);
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

  return (
    <>
      <PageHead
        title={
          <div className='flex justify-between'>
            <BsFillTrash3Fill />
            {t('Recycle Bin')}
          </div>
        }
      />

      <TableViewComponent
        lines={tableLines}
        header={[t('ID'), t('Name'), t('Type'), t('Date'), t('Actions')]}
      ></TableViewComponent>
      <div className='flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1'></div>
    </>
  );
}

export default RecycleBin;

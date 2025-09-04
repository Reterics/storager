import { useContext, useMemo, useState } from 'react';
import { DBContext } from '../database/DBContext.ts';
import { useTranslation } from 'react-i18next';
import type { ShopType } from '../interfaces/interfaces.ts';
import UnauthorizedComponent from '../components/Unauthorized.tsx';
import {
  BsFillCloudArrowDownFill,
  BsFillFolderFill,
  BsFillPlusCircleFill,
} from 'react-icons/bs';
import { PageHead } from '../components/elements/PageHead.tsx';
import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import TypeModal from '../components/modals/TypeModal.tsx';
import { downloadAsFile, readJSONFile } from '../utils/general.ts';
import { typeModalOptions } from '../interfaces/constants.ts';

function Types() {
  const dbContext = useContext(DBContext);
  const { t } = useTranslation();

  const [types, setTypes] = useState<ShopType[]>(dbContext?.data.types || []);

  const translatedTypes = useMemo(() => {
    return typeModalOptions.map((type) => {
      type.name = t(type.name);
      return type;
    });
  }, [t]);

  const [modalTemplate, setModalTemplate] = useState<ShopType | null>(null);

  const saveType = async (type: ShopType) => {
    const updatedTypes = await dbContext?.setData('types', type as ShopType);
    setTypes(updatedTypes as ShopType[]);
    setModalTemplate(null);
  };

  const deletePart = async (item: ShopType) => {
    if (
      item.id &&
      window.confirm(t('Are you sure you wish to delete this Type?'))
    ) {
      const updatedItems = (await dbContext?.removeData(
        'types',
        item.id,
      )) as ShopType[];
      setTypes(updatedItems);
    }
  };

  if (!dbContext?.data.currentUser) {
    return <UnauthorizedComponent />;
  }

  const tableLines = types.map((type) => {
    return [
      type.name,
      translatedTypes.find((t) => t.value === type.category)?.name ||
        type.category,
      type.translations?.hu || '',
      type.translations?.en || '',
      TableViewActions({
        onRemove: () => deletePart(type),
        onEdit: () => setModalTemplate(type),
      }),
    ];
  });

  return (
    <>
      <PageHead
        title={t('Types')}
        buttons={[
          {
            value: <BsFillCloudArrowDownFill />,
            onClick: () => {
              downloadAsFile('storager_types.json', JSON.stringify(types));
            },
          },
          {
            value: <BsFillFolderFill />,
            onClick: async () => {
              const array = await readJSONFile();
              if (Array.isArray(array) && array.length) {
                if (
                  confirm(
                    array.length +
                      ' new entry detected. Do you want to add them?',
                  )
                ) {
                  const updatedTypes = await dbContext?.uploadDataBatch(
                    'types',
                    array,
                  );
                  if (updatedTypes) {
                    setTypes(updatedTypes as ShopType[]);
                  }
                }
              }
            },
          },
          {
            value: <BsFillPlusCircleFill />,
            onClick: () =>
              setModalTemplate(
                modalTemplate
                  ? null
                  : {
                      id: '',
                      name: '',
                      category: 'item',
                    },
              ),
          },
        ]}
      />

      <TableViewComponent
        lines={tableLines}
        header={[
          t('Name'),
          {
            value: t('Category'),
            type: 'text',
            sortable: true,
            editable: false,
          },
          t('HU'),
          t('EN'),
          t('Actions'),
        ]}
      />

      <div className="flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1">
        <TypeModal
          onClose={() => setModalTemplate(null)}
          onSave={(item: ShopType) => saveType(item)}
          setType={(item: ShopType) => setModalTemplate(item)}
          type={modalTemplate}
          inPlace={false}
        ></TypeModal>
      </div>
    </>
  );
}

export default Types;

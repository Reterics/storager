import {useContext, useEffect, useState} from 'react';
import {DBContext} from '../database/DBContext.ts';
import {ShopContext} from '../store/ShopContext.tsx';
import {useTranslation} from 'react-i18next';
import {
  Lease,
  LeaseCompletion,
  ServiceLineData,
} from '../interfaces/interfaces.ts';
import {generateServiceId, reduceToRecordById} from '../utils/data.ts';
import {PrintViewData} from '../interfaces/pdf.ts';
import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import PrintableVersionFrame from '../components/modals/PrintableVersionFrame.tsx';
import {PageHead} from '../components/elements/PageHead.tsx';
import {BsFillPlusCircleFill} from 'react-icons/bs';
import {filterLeases, getLeaseLineData} from '../utils/lease.ts';

function Leases() {
  const dbContext = useContext(DBContext);
  const {shop} = useContext(ShopContext);
  const {t} = useTranslation();

  const [tableLimits, setTableLimits] = useState<number>(100);
  const [shopFilter, setShopFilter] = useState<string>();
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<boolean>(false);

  const [completionForms] = useState<LeaseCompletion[]>(
    dbContext?.data.leaseCompletions || []
  );
  const completionFormsById = reduceToRecordById(completionForms);

  const [leases, setLeases] = useState<Lease[]>(
    filterLeases(dbContext?.data.leases ?? [], completionFormsById)
  );

  const [modalTemplate, setModalTemplate] = useState<Lease | null>(null);
  const [completedModalTemplate] = useState<LeaseCompletion | null>(null);
  const [printViewData, setPrintViewData] = useState<PrintViewData | null>(
    null
  );

  const [selectedLeaseLines, setSelectedLeaseLines] =
    useState<ServiceLineData | null>(null);

  useEffect(() => {
    setLeases(
      filterLeases(
        dbContext?.data.leases || [],
        completionFormsById,
        shopFilter,
        searchFilter,
        activeFilter
      )
    );
  }, [
    shopFilter,
    searchFilter,
    activeFilter,
    dbContext?.data.leases,
    completionFormsById,
  ]);

  const tableLines = leases.map((item) => {
    const serviceCompletion = completionFormsById[item.id + '_cd'];

    return [
      <span
        key={'status_' + item.id}
        className={serviceCompletion ? 'status_delivered' : item.serviceStatus}
      >
        {item.id}
      </span>,
      item.client_name,
      item.expected_cost || 0,
      item.service_name ?? '?',
      item.date || '',
      TableViewActions({
        onOpen: () => {
          if (selectedLeaseLines && selectedLeaseLines.id === item.id) {
            setSelectedLeaseLines(null);
            return;
          }

          const newLine = getLeaseLineData(
            item,
            completionForms,
            dbContext?.data.archive || [],
            t,
            dbContext?.data.settings,
            setPrintViewData,
            setPrintViewData
          );

          setSelectedLeaseLines(newLine);

          window.scrollTo({top: 0, behavior: 'smooth'});
        },
        onEdit: () => {
          setModalTemplate({...item, onUpdate: true});
          if (selectedLeaseLines) {
            setSelectedLeaseLines(null);
          }
        },
      }),
    ];
  });

  const noModalActive =
    !modalTemplate && !completedModalTemplate && !printViewData;

  return (
    <>
      {noModalActive && (
        <PageHead
          title={t('Leased Items')}
          buttons={[
            {
              value: <BsFillPlusCircleFill />,
              onClick: () => {
                const id = generateServiceId(
                  leases,
                  shop?.id,
                  dbContext?.data.shops,
                  dbContext?.data.deleted
                );

                setModalTemplate(
                  modalTemplate
                    ? null
                    : {
                        id: id,
                        serviceStatus: 'status_accepted',
                        date: new Date().toISOString().split('T')[0],
                        service_address: shop?.address || '',
                        service_name: shop?.name || '',
                        service_email: shop?.email || '',
                        docType: 'services',
                      }
                );
              },
            },
          ]}
          onSearch={setSearchFilter}
          tableLimits={tableLimits}
          setTableLimits={setTableLimits}
          shopFilter={shopFilter}
          setShopFilter={setShopFilter}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
      )}
      <div className={'relative flex justify-center w-full m-auto'}>
        <div className={'mb-2 mt-1'}>
          {printViewData && (
            <PrintableVersionFrame
              formData={printViewData}
              onClose={() => setPrintViewData(null)}
            />
          )}
        </div>
      </div>

      {noModalActive && (
        <div className='service-table self-center'>
          <TableViewComponent
            lines={tableLines}
            tableLimits={tableLimits}
            header={[
              t('ID'),
              t('Name'),
              {
                value: <span className='text-xxs'>{t('Expected cost')}</span>,
                type: 'number',
                postFix: ' Ft',
                sortable: true,
                editable: false,
              },
              {
                value: t('Shop'),
                type: 'text',
                sortable: true,
                editable: false,
              },
              {
                value: t('Date'),
                type: 'text',
                sortable: true,
                editable: false,
              },
              t('Actions'),
            ]}
          />
        </div>
      )}

      <div className='relative flex justify-center w-full m-auto flex-1 no-print'></div>
    </>
  );
}

export default Leases;

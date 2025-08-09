import {useContext, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {DBContext} from '../../database/DBContext.ts';
import {ShopContext} from '../../store/ShopContext.tsx';
import {PageHead} from '../../components/elements/PageHead.tsx';
import TableViewComponent, {TableViewActions} from '../../components/elements/TableViewComponent.tsx';
import UnauthorizedComponent from '../../components/Unauthorized.tsx';
import ListModal from '../../components/modals/ListModal.tsx';
import PrintableVersionFrame from '../../components/modals/PrintableVersionFrame.tsx';
import {BsFillPlusCircleFill} from 'react-icons/bs';
import LeaseModal from '../../components/modals/LeaseModal.tsx';
import LeaseCompletionModal from '../../components/modals/LeaseCompletionModal.tsx';
import {Lease, LeaseCompletion, leaseStatusList, ServiceLineData} from '../../interfaces/interfaces.ts';
import {PrintViewData} from '../../interfaces/pdf.ts';
import {filterLeases, getLeaseLineData} from '../../utils/lease.ts';
import {generateServiceId} from '../../utils/data.ts';

export default function LeasesPage() {
  const {t} = useTranslation();
  const dbContext = useContext(DBContext);
  const {shop} = useContext(ShopContext);

  const [tableLimits, setTableLimits] = useState<number>(100);
  const [shopFilter, setShopFilter] = useState<string | undefined>();
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<boolean>(false);

  const [leases, setLeases] = useState<Lease[]>(
    filterLeases(dbContext?.data.leases || [], {})
  );

  const completionFormsById = useMemo(() => {
    return (dbContext?.data.leaseCompletions || []).reduce(
      (acc, form) => {
        acc[form.id] = form;
        return acc;
      },
      {} as Record<string, LeaseCompletion>
    );
  }, [dbContext?.data.leaseCompletions]);

  const [modalTemplate, setModalTemplate] = useState<Lease | null>(null);
  const [completedModalTemplate, setCompletedModalTemplate] =
    useState<LeaseCompletion | null>(null);
  const [printViewData, setPrintViewData] = useState<PrintViewData | null>(null);
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
  }, [shopFilter, searchFilter, activeFilter, dbContext?.data.leases, dbContext?.data.archive, dbContext?.data.leaseCompletions, completionFormsById]);

  if (!dbContext?.data.currentUser) {
    return <UnauthorizedComponent />;
  }

  const tableLines = leases.map((item) => {
    const serviceCompletion = completionFormsById[item.id + '_lcd'];

    return [
      <span key={'status_' + item.id} className={serviceCompletion ? leaseStatusList[leaseStatusList.length - 1] : item.lease_status}>
        {item.id}
      </span>,
      item.client_name,
      item.expected_cost || 0,
      item.service_name ?? '?',
      item.date || '',
      TableViewActions({
        onOpen: () => {
          const newLine = getLeaseLineData(
            item,
            dbContext?.data.leaseCompletions || [],
            dbContext?.data.archive || [],
            t,
            dbContext?.data.settings,
            (data) => setPrintViewData(data),
            (data) => setPrintViewData(data)
          );
          setSelectedLeaseLines((prev) => (prev && prev.id === item.id ? null : newLine));
          window.scrollTo({top: 0, behavior: 'smooth'});
        },
        onEdit: () => setModalTemplate({...item, onUpdate: true}),
      }),
    ];
  });

  const noModalActive = !modalTemplate && !completedModalTemplate && !printViewData;

  return (
    <>
      {noModalActive && (
        <PageHead
          title={t('Leased Items')}
          buttons={[
            {
              value: <BsFillPlusCircleFill />,
              onClick: () =>
                setModalTemplate(
                  modalTemplate
                    ? null
                    : {
                        id: generateServiceId(
                          dbContext?.data.leases || [],
                          shop?.id,
                          dbContext?.data.shops,
                          dbContext?.data.deleted
                        ),
                        lease_status: leaseStatusList[0],
                        date: new Date().toISOString().split('T')[0],
                        service_address: shop?.address || '',
                        service_name: shop?.name || '',
                        service_email: shop?.email || '',
                        docType: 'leases',
                      }
                ),
            },
          ]}
          onSearch={setSearchFilter}
          tableLimits={tableLimits}
          setTableLimits={setTableLimits}
          shopFilter={shopFilter}
          setShopFilter={(v: string) => setShopFilter(v || undefined)}
          activeFilter={activeFilter}
          setActiveFilter={(v: boolean) => setActiveFilter(v)}
        />
      )}

      <div className='relative flex justify-center items-center flex-col w-full m-auto mb-2 mt-1'>
        <LeaseModal
          onClose={() => setModalTemplate(null)}
          onSave={async (item: Lease) => {
            await dbContext?.setData('leases', item);
            await dbContext?.refreshData('leases');
            setModalTemplate(null);
          }}
          setLease={(item: Lease) => setModalTemplate(item)}
          lease={modalTemplate as Lease}
          inPlace={true}
          settings={dbContext?.data.settings}
        />

        <LeaseCompletionModal
          onClose={() => setCompletedModalTemplate(null)}
          onSave={async (item: LeaseCompletion) => {
            await dbContext?.setData('leaseCompletions', item);
            await dbContext?.refreshData('leaseCompletions');
            setCompletedModalTemplate(null);
          }}
          setFromData={(item: LeaseCompletion) => setCompletedModalTemplate(item)}
          formData={completedModalTemplate as LeaseCompletion}
          inPlace={true}
        />

        {printViewData && (
          <PrintableVersionFrame
            formData={printViewData}
            onClose={() => setPrintViewData(null)}
          />
        )}

        {selectedLeaseLines && printViewData && <div className={'mb-8'}></div>}
        {selectedLeaseLines && (
          <ListModal
            title={
              t('List Documents: ') + (selectedLeaseLines.name || selectedLeaseLines.id)
            }
            inPlace={true}
            lines={selectedLeaseLines.table}
            buttons={[
              {
                id: selectedLeaseLines.completed ? 'completedListButton' : '',
                onClick: () => {
                  const item = leases.find((s) => s.id === selectedLeaseLines.id);
                  if (!item) return;
                  const completionFormId = item.id + '_lcd';
                  const completionForm = (dbContext?.data.leaseCompletions || []).find(
                    (completionForm) => completionForm.id === completionFormId
                  );
                  const sourceItem = (completionForm as unknown as Lease) || (item as unknown as Lease);

                  if (!completionForm) {
                    setCompletedModalTemplate({
                      id: item.id + '_lcd',
                      lease_id: item.id,
                      lease_date: item.date,
                      date: new Date().toISOString().split('T')[0],
                      service_address: (sourceItem as Lease).service_address || shop?.address || '',
                      service_name: (sourceItem as Lease).service_name || shop?.name || '',
                      service_email: (sourceItem as Lease).service_email || shop?.email || '',
                      client_name: (sourceItem as Lease).client_name || '',
                      client_email: (sourceItem as Lease).client_email || '',
                      client_phone: (sourceItem as Lease).client_phone || '',
                      accessories: (sourceItem as Lease).accessories || '',
                      rental_cost: item.expected_cost || '',
                      description: (sourceItem as Lease).description || '',
                      rental_description: '',
                      docType: 'leaseCompletions',
                    });
                    setSelectedLeaseLines(null);
                  } else {
                    alert(t('You already completed the form'));
                  }
                },
                value: t('Rental Return Form'),
              },
              {
                onClick: () => setSelectedLeaseLines(null),
                value: t('Cancel'),
              },
            ]}
            header={['#', t('Name'), t('Version'), t('Date'), t('Actions')]}
          />
        )}
      </div>

      {noModalActive && (
        <div className='service-table lease-table'>
          <TableViewComponent
            lines={tableLines}
            tableLimits={tableLimits}
            header={[
              t('ID'),
              t('Name'),
              {value: <span className='text-xxs'>{t('Expected cost')}</span>, type: 'number', postFix: ' Ft', sortable: true, editable: false},
              {value: t('Shop'), type: 'text', sortable: true, editable: false},
              {value: t('Date'), type: 'text', sortable: true, editable: false},
              t('Actions'),
            ]}
          />
        </div>
      )}

      <div className='relative flex justify-center w-full m-auto flex-1 no-print'></div>
    </>
  );
}

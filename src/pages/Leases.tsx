import { useContext, useEffect, useState } from 'react';
import { DBContext } from '../database/DBContext.ts';
import { ShopContext } from '../store/ShopContext.tsx';
import { useTranslation } from 'react-i18next';
import type {
  Lease,
  LeaseCompletion,
  ServiceCompleteData,
  ServiceData,
  ServiceLineData,
} from '../interfaces/interfaces.ts';
import { leaseStatusList } from '../interfaces/interfaces.ts';
import {
  compareNormalizedStrings,
  generateServiceId,
  reduceToRecordById,
} from '../utils/data.ts';
import type { PrintViewData } from '../interfaces/pdf.ts';
import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import PrintableVersionFrame from '../components/modals/PrintableVersionFrame.tsx';
import { PageHead } from '../components/elements/PageHead.tsx';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import { filterLeases, getLeaseLineData } from '../utils/lease.ts';
import ListModal from '../components/modals/ListModal.tsx';
import LeaseModal from '../components/modals/LeaseModal.tsx';
import LeaseCompletionModal from '../components/modals/LeaseCompletionModal.tsx';
import { confirm } from '../components/modalExporter.ts';

function Leases() {
  const dbContext = useContext(DBContext);
  const { shop } = useContext(ShopContext);
  const { t } = useTranslation();

  const [tableLimits, setTableLimits] = useState<number>(100);
  const [shopFilter, setShopFilter] = useState<string>();
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<boolean>(false);

  const [completionForms, setCompletionForms] = useState<LeaseCompletion[]>(
    dbContext?.data.leaseCompletions || [],
  );

  const completionFormsById = reduceToRecordById(completionForms);

  const [leases, setLeases] = useState<Lease[]>(
    filterLeases(dbContext?.data.leases ?? [], completionFormsById),
  );

  const [modalTemplate, setModalTemplate] = useState<Lease | null>(null);
  const [completedModalTemplate, setCompletedModalTemplate] =
    useState<LeaseCompletion | null>(null);
  const [printViewData, setPrintViewData] = useState<PrintViewData | null>(
    null,
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
        activeFilter,
      ),
    );
  }, [
    shopFilter,
    searchFilter,
    activeFilter,
    dbContext?.data.leases,
    completionFormsById,
  ]);

  const saveLease = async (leaseData: Lease, archive = true) => {
    let updatedItems = (await dbContext?.updateLatest('leases')) as Lease[];

    const currentItem = updatedItems.find((item) => item.id === leaseData.id);
    if (
      currentItem?.client_name &&
      leaseData.client_name &&
      !compareNormalizedStrings(currentItem.client_name, leaseData.client_name)
    ) {
      if (
        await confirm(t('Do you want to save this item as a new service form?'))
      ) {
        // if there is an item with different client names, we regenerate the id
        leaseData.id = generateServiceId(
          updatedItems,
          shop?.id,
          dbContext?.data.shops,
          dbContext?.data.deleted,
        );
      }
    }

    updatedItems = (await dbContext?.setData(
      'leases',
      leaseData,
      archive,
    )) as ServiceData[];
    setLeases(updatedItems);
    setModalTemplate(null);
  };

  const saveCompletionForm = async (leaseCompletion: LeaseCompletion) => {
    if (!leaseCompletion?.lease_id) {
      return false;
    }

    const updatedItems = await dbContext
      ?.setData('leaseCompletions', leaseCompletion)
      .catch((e: Error) => {
        console.error(e.message);
        alert('Server Error');
      });

    if (updatedItems) {
      setCompletionForms(updatedItems as LeaseCompletion[]);
      setCompletedModalTemplate(null);
    }
  };

  const tableLines = leases.map((item) => {
    const serviceCompletion = completionFormsById[item.id + '_lcd'];

    return [
      <span
        key={'status_' + item.id}
        className={
          serviceCompletion
            ? leaseStatusList[leaseStatusList.length - 1]
            : item.lease_status
        }
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
            setPrintViewData,
          );

          setSelectedLeaseLines(newLine);

          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onEdit: () => {
          setModalTemplate({ ...item, onUpdate: true });
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
                  dbContext?.data.deleted,
                );

                setModalTemplate(
                  modalTemplate
                    ? null
                    : {
                        id: id,
                        lease_status: leaseStatusList[0],
                        date: new Date().toISOString().split('T')[0],
                        service_address: shop?.address || '',
                        service_name: shop?.name || '',
                        service_email: shop?.email || '',
                        docType: 'leases',
                      },
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
      <div className="relative flex justify-center items-center flex-col w-full m-auto mb-2 mt-1">
        {modalTemplate && (
          <LeaseModal
            onClose={() => setModalTemplate(null)}
            onSave={(item: Lease) => saveLease(item)}
            setLease={(item: Lease) => setModalTemplate(item)}
            lease={modalTemplate}
            inPlace={true}
            settings={dbContext?.data.settings}
          />
        )}

        {completedModalTemplate && (
          <LeaseCompletionModal
            onClose={() => setCompletedModalTemplate(null)}
            onSave={(item: ServiceCompleteData) => saveCompletionForm(item)}
            setFromData={(item: ServiceCompleteData) =>
              setCompletedModalTemplate(item)
            }
            formData={completedModalTemplate}
            inPlace={true}
          />
        )}

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
              t('List Documents: ') +
              (selectedLeaseLines.name || selectedLeaseLines.id)
            }
            inPlace={true}
            lines={selectedLeaseLines.table}
            buttons={[
              {
                id: selectedLeaseLines.completed ? 'completedListButton' : '',
                onClick: () => {
                  const item = leases.find(
                    (item) => item.id === selectedLeaseLines.id,
                  );
                  if (!item) {
                    return;
                  }
                  const completionFormId = item.id + '_lcd';
                  const completionForm = completionForms.find(
                    (completionForm) => completionForm.id === completionFormId,
                  );
                  const sourceItem = completionForm || item;

                  if (!completionForm) {
                    setCompletedModalTemplate({
                      id: item.id + '_lcd',
                      lease_id: item.id,
                      lease_date: item.date,
                      date: new Date().toISOString().split('T')[0],
                      service_address:
                        sourceItem.service_address || shop?.address || '',
                      service_name: sourceItem.service_name || shop?.name || '',
                      service_email:
                        sourceItem.service_email || shop?.email || '',
                      client_name: sourceItem.client_name || '',
                      client_email: sourceItem.client_email || '',
                      client_phone: sourceItem.client_phone || '',
                      accessories: sourceItem.accessories || '',
                      rental_cost: item.expected_cost || '',
                      description: sourceItem.description || '',
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
          ></ListModal>
        )}
      </div>

      {noModalActive && (
        <div className="service-table lease-table">
          <TableViewComponent
            lines={tableLines}
            tableLimits={tableLimits}
            header={[
              t('ID'),
              t('Name'),
              {
                value: <span className="text-xxs">{t('Expected cost')}</span>,
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

      <div className="relative flex justify-center w-full m-auto flex-1 no-print"></div>
    </>
  );
}

export default Leases;

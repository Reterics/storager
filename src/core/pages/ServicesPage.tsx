import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DBContext } from '../../database/DBContext.ts';
import { ShopContext } from '../../store/ShopContext.tsx';
import { PageHead } from '../../components/elements/PageHead.tsx';
import TableViewComponent, {
  TableViewActions,
} from '../../components/elements/TableViewComponent.tsx';
import StyledSelect from '../../components/elements/StyledSelect.tsx';
import UnauthorizedComponent from '../../components/Unauthorized.tsx';
import ServiceModal from '../../components/modals/ServiceModal.tsx';
import ServiceCompletionModal from '../../components/modals/ServiceCompletionModal.tsx';
import ListModal from '../../components/modals/ListModal.tsx';
import PrintableVersionFrame from '../../components/modals/PrintableVersionFrame.tsx';
import type {
  ServiceCompleteData,
  ServiceData,
  ServiceLineData,
} from '../../interfaces/interfaces.ts';
import { serviceStatusList } from '../../interfaces/interfaces.ts';
import type { PrintViewData } from '../../interfaces/pdf.ts';
import { ServiceManager } from '../../services/ServiceManager.ts';
import { BsFillPlusCircleFill } from 'react-icons/bs';

export default function ServicesPage() {
  const { t } = useTranslation();
  const dbContext = useContext(DBContext);
  const { shop } = useContext(ShopContext);

  const manager = useMemo(
    () => new ServiceManager(dbContext!, shop || null, t),
    [dbContext, shop, t],
  );

  const [tableLimits, setTableLimits] = useState<number>(100);
  const [shopFilter, setShopFilter] = useState<string | undefined>();
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<boolean>(false);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();

  const [servicedItems, setServicedItems] = useState<ServiceData[]>(
    manager.getServices(),
  );

  const completionFormsById = useMemo(
    () => manager.getCompletionFormsById(),
    [manager],
  );

  const availableTypes: { name: string; value: string }[] = useMemo(() => {
    return manager.getAvailableTypes().map((x) => ({ name: x, value: x }));
  }, [manager]);

  const [modalTemplate, setModalTemplate] = useState<ServiceData | null>(null);
  const [completedModalTemplate, setCompletedModalTemplate] =
    useState<ServiceCompleteData | null>(null);
  const [printViewData, setPrintViewData] = useState<PrintViewData | null>(
    null,
  );
  const [selectedServiceLines, setSelectedServiceLines] =
    useState<ServiceLineData | null>(null);

  useEffect(() => {
    setServicedItems(
      manager.getServices(shopFilter, searchFilter, activeFilter, typeFilter),
    );
  }, [
    shopFilter,
    searchFilter,
    activeFilter,
    typeFilter,
    dbContext?.data.services,
    dbContext?.data.archive,
    dbContext?.data.completions,
    manager,
  ]);

  if (!dbContext?.data.currentUser) {
    return <UnauthorizedComponent />;
  }

  const tableLines = servicedItems.map((item) => {
    const type = item.type?.startsWith(',')
      ? item.type.substring(1)
      : item.type || '';
    const serviceCompletion = completionFormsById[item.id + '_cd'];

    return [
      <span
        key={'status_' + item.id}
        className={
          serviceCompletion
            ? serviceStatusList[serviceStatusList.length - 1]
            : item.serviceStatus
        }
      >
        {item.id}
      </span>,
      item.client_name,
      (type || '').replace(/,/g, ', '),
      item.expected_cost || 0,
      item.service_name ?? '?',
      item.date || '',
      TableViewActions({
        onOpen: () => {
          const newLine = manager.getServiceLineData(
            item,
            (data) => setPrintViewData(data),
            (data) => setPrintViewData(data),
          );
          setSelectedServiceLines((prev) =>
            prev && prev.id === item.id ? null : newLine,
          );
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onEdit: () => setModalTemplate({ ...item, onUpdate: true }),
        onRemove: () => {
          void (async () => {
            await manager.deleteServiceHistoryFor(item);
            await dbContext?.refreshData('services');
          })();
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
          title={t('Serviced Items')}
          buttons={[
            {
              value: <BsFillPlusCircleFill />,
              onClick: () =>
                setModalTemplate(manager.generateNewServiceTemplate()),
            },
          ]}
          onSearch={setSearchFilter}
          tableLimits={tableLimits}
          setTableLimits={setTableLimits}
          shopFilter={shopFilter}
          setShopFilter={(v: string) => setShopFilter(v || undefined)}
          activeFilter={activeFilter}
          setActiveFilter={(v: boolean) => setActiveFilter(v)}
        >
          <div className="flex flex-1" />
          <div className="w-30 select-no-first">
            <StyledSelect
              options={[{ name: t('All type'), value: '' }, ...availableTypes]}
              name="type"
              value={typeFilter || ''}
              defaultLabel={t('All type')}
              onSelect={(e) =>
                setTypeFilter(
                  (e.target as HTMLSelectElement).value || undefined,
                )
              }
              label={false}
              compact={true}
            />
          </div>
        </PageHead>
      )}

      <div className="relative flex justify-center items-center flex-col w-full m-auto mb-2 mt-1">
        <ServiceModal
          onClose={() => setModalTemplate(null)}
          onSave={async (item: ServiceData) => {
            await manager.saveServiceItem(item);
            await dbContext?.refreshData('services');
            setModalTemplate(null);
          }}
          setService={(item: ServiceData) => setModalTemplate(item)}
          service={modalTemplate}
          inPlace={true}
          settings={dbContext?.data.settings}
        />
        <ServiceCompletionModal
          onClose={() => setCompletedModalTemplate(null)}
          onSave={async (item: ServiceCompleteData) => {
            await manager.saveCompletionForm(item);
            await dbContext?.refreshData('completions');
            setCompletedModalTemplate(null);
          }}
          setFromData={(item: ServiceCompleteData) =>
            setCompletedModalTemplate(item)
          }
          formData={completedModalTemplate}
          inPlace={true}
        />

        {printViewData && (
          <PrintableVersionFrame
            formData={printViewData}
            onClose={() => setPrintViewData(null)}
          />
        )}

        {selectedServiceLines && printViewData && (
          <div className={'mb-8'}></div>
        )}
        {selectedServiceLines && (
          <ListModal
            title={
              t('List Documents: ') +
              (selectedServiceLines.name || selectedServiceLines.id)
            }
            inPlace={true}
            lines={selectedServiceLines.table}
            buttons={[
              {
                id: selectedServiceLines.completed ? 'completedListButton' : '',
                onClick: () => {
                  const item = servicedItems.find(
                    (s) => s.id === selectedServiceLines.id,
                  );
                  if (!item) return;
                  const template = manager.generateCompletionFormTemplate(item);
                  if (!template) {
                    alert(t('You already completed the form'));
                    return;
                  }
                  setCompletedModalTemplate(template);
                  setSelectedServiceLines(null);
                },
                value: t('Fill Completion Form'),
              },
              {
                onClick: () => setSelectedServiceLines(null),
                value: t('Cancel'),
              },
            ]}
            header={['#', t('Name'), t('Version'), t('Date'), t('Actions')]}
          />
        )}
      </div>

      {noModalActive && (
        <div className="service-table">
          <TableViewComponent
            lines={tableLines}
            tableLimits={tableLimits}
            header={[
              t('ID'),
              t('Name'),
              {
                value: t('Type'),
                type: 'text',
                sortable: true,
                editable: false,
              },
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

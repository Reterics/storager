import {TableViewActions} from '../components/elements/TableViewComponent.tsx';
import {toUserDateTime} from './data.ts';
import {PrintableDataProps} from './print.tsx';
import {
  Lease,
  LeaseCompletion,
  leaseStatusList,
  SettingsItems,
} from '../interfaces/interfaces.ts';
import {PrintViewData} from '../interfaces/pdf.ts';
import {TFunction} from 'i18next';

export function leaseDataToPrintable(
  item: Lease,
  settings: SettingsItems,
  t: TFunction,
  printNow = true
): PrintableDataProps {
  return {
    printNow: printNow,
    data: [
      {'': t('Client')},
      [{[t('Name')]: item.client_name || ''}],
      [{[t('Phone')]: item.client_phone || ''}],
      [{[t('Email')]: item.client_email || ''}],

      {'': t('Recipient')},
      [{[t('Name')]: item.service_name || ''}],
      [{[t('Phone')]: item.service_address || ''}],
      [{[t('Email')]: item.service_email || ''}],

      {'': t('Item and rental details')},
      [{[t('Type')]: (item.type || '')?.split(',').join(', ')}],
      [{[t('Description')]: item.description || ''}],
      [{[t('Expected cost')]: item.expected_cost + ' HUF'}],
      [{[t('Note')]: item.note || ''}],
      [],
      settings?.rentalConditions || '',
      [],
      [{[t('Date')]: item.date || ''}],
    ],
    signature: item.signature,
  };
}

export function leaseCompletionToPrintable(
  item: LeaseCompletion,
  t: TFunction,
  printNow = true
): PrintableDataProps {
  return {
    printNow: printNow,
    data: [
      {'': t('Client')},
      [{[t('Name')]: item.client_name || ''}],
      [{[t('Phone')]: item.client_phone || ''}],
      [{[t('Email')]: item.client_email || ''}],

      {'': t('Recipient')},
      [{[t('Name')]: item.service_name || ''}],
      [{[t('Phone')]: item.service_address || ''}],
      [{[t('Email')]: item.service_email || ''}],

      {'': t('Item and rental details')},
      [{[t('Description')]: item.description || ''}],
      [{[t('Accessories')]: item.accessories || ''}],
      [{[t('Rental Description')]: item.rental_cost || ''}],
      [{[t('Renal Cost')]: item.rental_description + ' HUF'}],
      [],
      [{[t('Date')]: item.date || ''}],
    ],
    signature: item.signature ? item.signature : undefined,
  };
}

export function getLeaseLineData(
  item: Lease,
  completionForms: LeaseCompletion[],
  archive: (Lease | LeaseCompletion)[],
  t: TFunction,
  settings: SettingsItems | undefined,
  onPrint: (data: PrintViewData) => void,
  onOpen: (data: PrintViewData) => void
) {
  const completionFormId = item.id + '_lcd';
  const completionForm = completionForms.find((c) => c.id === completionFormId);

  const list = archive.filter((a) => a.docParent === item.id);
  list.sort((b, a) => (b.docUpdated ?? 0) - (a.docUpdated ?? 0));

  if (!list.find((d) => d.docUpdated === item.docUpdated)) {
    list.push(item);
  }
  if (completionForm) {
    list.push(completionForm);
  }

  return {
    id: item.id,
    name: item.client_name || item.id,
    completed: !!completionForm,
    table: list.map((data, index) => {
      const isCompletionForm = completionForm && index === list.length - 1;
      const version = isCompletionForm ? 1 : index + 1;
      const name = isCompletionForm
        ? t('Lease Completion Form')
        : t('Leasing Form');

      return [
        index + 1,
        name,
        version,
        data.docUpdated ? toUserDateTime(new Date(data.docUpdated)) : data.date,
        TableViewActions({
          onPrint: () => {
            onPrint(
              isCompletionForm
                ? leaseCompletionToPrintable(data, t, true)
                : leaseDataToPrintable(data, settings || {id: ''}, t, true)
            );
          },
          onOpen: () => {
            onOpen(
              isCompletionForm
                ? leaseCompletionToPrintable(data, t, true)
                : leaseDataToPrintable(data, settings || {id: ''}, t, false)
            );
          },
        }),
      ];
    }),
  };
}

export function filterLeases(
  items: Lease[],
  completionFormsById: Record<string, LeaseCompletion>,
  shopFilter?: string,
  searchFilter?: string,
  activeFilter?: boolean
) {
  if (shopFilter) {
    items = items.filter((item) => item.service_name === shopFilter);
  }

  if (searchFilter) {
    const lowerCaseFilter = searchFilter.toLowerCase();

    items = items.filter(
      (item) =>
        item.client_name?.toLowerCase().includes(lowerCaseFilter) ||
        item.client_phone?.toLowerCase().includes(lowerCaseFilter)
    );
  }

  if (activeFilter) {
    items = items.filter(
      (item) =>
        !completionFormsById[item.id + '_lcd'] &&
        item.lease_status !== leaseStatusList[leaseStatusList.length - 1]
    );
  }

  items.sort((a, b) => (b.docUpdated ?? 0) - (a.docUpdated ?? 0));

  return items;
}

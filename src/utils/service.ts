import { TableViewActions } from '../components/elements/TableViewComponent.tsx';
import { toUserDateTime } from './data.ts';
import { completionFormToPrintable, serviceDataToPrintable } from './print.tsx';
import type {
  ServiceCompleteData,
  ServiceData,
  SettingsItems,
} from '../interfaces/interfaces.ts';
import { serviceStatusList } from '../interfaces/interfaces.ts';
import type { PrintViewData } from '../interfaces/pdf.ts';
import type { TFunction } from 'i18next';

export function getServiceLineData(
  item: ServiceData,
  completionForms: ServiceCompleteData[],
  archive: (ServiceData | ServiceCompleteData)[],
  t: TFunction,
  settings: SettingsItems | undefined,
  onPrint: (data: PrintViewData) => void,
  onOpen: (data: PrintViewData) => void,
) {
  const completionFormId = item.id + '_cd';
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
        ? t('Service Completion Form')
        : t('Service Form');

      return [
        index + 1,
        name,
        version,
        data.docUpdated ? toUserDateTime(new Date(data.docUpdated)) : data.date,
        TableViewActions({
          onPrint: () => {
            onPrint(
              isCompletionForm
                ? completionFormToPrintable(data, t, true)
                : serviceDataToPrintable(data, settings || { id: '' }, t, true),
            );
          },
          onOpen: () => {
            onOpen(
              isCompletionForm
                ? completionFormToPrintable(data, t, true)
                : serviceDataToPrintable(
                    data,
                    settings || { id: '' },
                    t,
                    false,
                  ),
            );
          },
        }),
      ];
    }),
  };
}

export function filterServices(
  items: ServiceData[],
  completionFormsById: Record<string, ServiceCompleteData>,
  shopFilter?: string,
  searchFilter?: string,
  activeFilter?: boolean,
  typeFilter?: string,
) {
  if (shopFilter) {
    items = items.filter((item) => item.service_name === shopFilter);
  }

  if (searchFilter) {
    const lowerCaseFilter = searchFilter.toLowerCase();

    items = items.filter(
      (item) =>
        item.client_name?.toLowerCase().includes(lowerCaseFilter) ||
        item.client_phone?.toLowerCase().includes(lowerCaseFilter),
    );
  }

  if (activeFilter) {
    items = items.filter(
      (item) =>
        !completionFormsById[item.id + '_cd'] &&
        item.serviceStatus !== serviceStatusList[serviceStatusList.length - 1],
    );
  }

  if (typeFilter) {
    items = items.filter((item) => item.type && item.type.includes(typeFilter));
  }

  items.sort((a, b) => (b.docUpdated ?? 0) - (a.docUpdated ?? 0));

  return items;
}

import type {DBContextType} from '../interfaces/firebase.ts';
import type {
  ServiceData,
  ServiceCompleteData,
  ServiceLineData} from '../interfaces/interfaces.ts';
import {
  serviceStatusList,
} from '../interfaces/interfaces.ts';
import {filterServices, getServiceLineData} from '../utils/service.ts';
import {generateServiceId} from '../utils/data.ts';
import type {TFunction} from 'i18next';
import type {PrintViewData} from '../interfaces/pdf.ts';

/**
 * ServiceManager class to encapsulate all service-related operations
 */
export class ServiceManager {
  private dbContext: DBContextType;
  private shop: {
    id?: string;
    address?: string;
    name?: string;
    email?: string;
  } | null;
  private t: TFunction;

  /**
   * Constructor for ServiceManager
   * @param dbContext - The database context
   * @param shop - The current shop
   * @param t - The translation function
   */
  constructor(
    dbContext: DBContextType,
    shop: {id?: string; address?: string; name?: string; email?: string} | null,
    t: TFunction
  ) {
    this.dbContext = dbContext;
    this.shop = shop;
    this.t = t;
  }

  /**
   * Get all services filtered by various criteria
   * @param shopFilter - Filter by shop
   * @param searchFilter - Filter by search text
   * @param activeFilter - Filter by active status
   * @param typeFilter - Filter by type
   * @returns Filtered services
   */
  getServices(
    shopFilter?: string,
    searchFilter?: string,
    activeFilter?: boolean,
    typeFilter?: string
  ): ServiceData[] {
    const completionFormsById = this.getCompletionFormsById();
    return filterServices(
      this.dbContext.data.services || [],
      completionFormsById,
      shopFilter,
      searchFilter,
      activeFilter,
      typeFilter
    );
  }

  /**
   * Get completion forms by ID
   * @returns Record of completion forms by ID
   */
  getCompletionFormsById(): Record<string, ServiceCompleteData> {
    return (this.dbContext.data.completions || []).reduce(
      (acc, form) => {
        acc[form.id] = form;
        return acc;
      },
      {} as Record<string, ServiceCompleteData>
    );
  }

  /**
   * Get service line data for displaying in a table
   * @param item - The service item
   * @param onPrint - Callback for printing
   * @param onOpen - Callback for opening
   * @returns Service line data
   */
  getServiceLineData(
    item: ServiceData,
    onPrint: (data: PrintViewData) => void,
    onOpen: (data: PrintViewData) => void
  ): ServiceLineData {
    return getServiceLineData(
      item,
      this.dbContext.data.completions || [],
      this.dbContext.data.archive || [],
      this.t,
      this.dbContext.data.settings,
      onPrint,
      onOpen
    );
  }

  /**
   * Save a service item
   * @param serviceData - The service data to save
   * @param archive - Whether to archive the previous version
   * @returns Updated services
   */
  async saveServiceItem(
    serviceData: ServiceData,
    archive = true
  ): Promise<ServiceData[]> {
    let updatedItems = (await this.dbContext.updateLatest(
      'services'
    )) as ServiceData[];

    // validate id
    const currentItem = updatedItems.find((item) => item.id === serviceData.id);
    if (
      currentItem?.client_name &&
      serviceData.client_name &&
      currentItem.client_name.toLowerCase() !==
        serviceData.client_name.toLowerCase()
    ) {
      // if there is an item with different client names, we regenerate the id
      serviceData.id = generateServiceId(
        updatedItems,
        this.shop?.id,
        this.dbContext.data.shops,
        this.dbContext.data.deleted
      );
    }

    updatedItems = (await this.dbContext.setData(
      'services',
      serviceData,
      archive
    )) as ServiceData[];

    return updatedItems;
  }

  /**
   * Save a completion form
   * @param serviceCompleteData - The completion form data to save
   * @returns Updated completion forms or false if failed
   */
  async saveCompletionForm(
    serviceCompleteData: ServiceCompleteData
  ): Promise<ServiceCompleteData[] | false> {
    if (!serviceCompleteData?.service_id) {
      return false;
    }

    try {
      const updatedItems = (await this.dbContext.setData(
        'completions',
        serviceCompleteData
      )) as ServiceCompleteData[];

      return updatedItems;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * Delete a service and all its history
   * @param item - The service item to delete
   * @returns Updated services or null if cancelled
   */
  async deleteServiceHistoryFor(
    item: ServiceData
  ): Promise<ServiceData[] | null> {
    if (!item.id) {
      return null;
    }

    const completions = (this.dbContext.data.completions || []).filter(
      (c) => c.service_id === item.id
    );

    if (completions.length) {
      for (const element of completions) {
        await this.dbContext.removeData('completions', element.id);
      }
    }

    const history = (this.dbContext.data.archive || []).filter(
      (a) => a.docParent === item.id
    );

    if (history.length) {
      for (let i = 0; i < history.length; i++) {
        await this.dbContext.removeData('archive', history[i].id).catch((e) => {
          console.error(e);
        });
      }
    }

    const servicedItems = (await this.dbContext.removeData(
      'services',
      item.id
    )) as ServiceData[];

    return servicedItems;
  }

  /**
   * Generate a new service template
   * @returns New service template
   */
  generateNewServiceTemplate(): ServiceData {
    const id = generateServiceId(
      this.dbContext.data.services || [],
      this.shop?.id,
      this.dbContext.data.shops,
      this.dbContext.data.deleted
    );

    return {
      id: id,
      serviceStatus: serviceStatusList[0],
      date: new Date().toISOString().split('T')[0],
      service_address: this.shop?.address || '',
      service_name: this.shop?.name || '',
      service_email: this.shop?.email || '',
      docType: 'services',
    };
  }

  /**
   * Generate a completion form template for a service
   * @param item - The service item
   * @returns Completion form template or null if already completed
   */
  generateCompletionFormTemplate(
    item: ServiceData
  ): ServiceCompleteData | null {
    const completionFormId = item.id + '_cd';
    const completionForm = (this.dbContext.data.completions || []).find(
      (completionForm) => completionForm.id === completionFormId
    );

    if (completionForm) {
      return null; // Already completed
    }

    return {
      id: item.id + '_cd',
      service_id: item.id,
      service_date: item.date,
      date: new Date().toISOString().split('T')[0],
      service_address: item.service_address || this.shop?.address || '',
      service_name: item.service_name || this.shop?.name || '',
      service_email: item.service_email || this.shop?.email || '',
      client_name: item.client_name || '',
      client_email: item.client_email || '',
      client_phone: item.client_phone || '',
      type: item.type || '',
      accessories: item.accessories || '',
      repair_cost: item.expected_cost || '',
      guaranteed: item.guaranteed || 'no',
      description: item.description || '',
      repair_description: item.repair_description || '',
      docType: 'completions',
    };
  }

  /**
   * Get available service types
   * @returns Array of available service types
   */
  getAvailableTypes(): string[] {
    return (this.dbContext.data.services || []).reduce((types, item) => {
      (item.type || '').split(',').forEach((item) => {
        if (item.trim() && !types.includes(item)) {
          types.push(item);
        }
      });
      return types;
    }, [] as string[]);
  }
}

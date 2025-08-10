import type { DBContextType } from '../interfaces/firebase.ts';
import type {
  Lease,
  LeaseCompletion,
  ServiceLineData,
} from '../interfaces/interfaces.ts';
import { leaseStatusList } from '../interfaces/interfaces.ts';
import { filterLeases, getLeaseLineData } from '../utils/lease.ts';
import { generateServiceId } from '../utils/data.ts';
import type { TFunction } from 'i18next';
import type { PrintViewData } from '../interfaces/pdf.ts';

/**
 * LeaseManager class to encapsulate all lease-related operations
 */
export class LeaseManager {
  private dbContext: DBContextType;
  private shop: {
    id?: string;
    address?: string;
    name?: string;
    email?: string;
  } | null;
  private t: TFunction;

  /**
   * Constructor for LeaseManager
   * @param dbContext - The database context
   * @param shop - The current shop
   * @param t - The translation function
   */
  constructor(
    dbContext: DBContextType,
    shop: {
      id?: string;
      address?: string;
      name?: string;
      email?: string;
    } | null,
    t: TFunction,
  ) {
    this.dbContext = dbContext;
    this.shop = shop;
    this.t = t;
  }

  /**
   * Get all leases filtered by various criteria
   * @param shopFilter - Filter by shop
   * @param searchFilter - Filter by search text
   * @param activeFilter - Filter by active status
   * @returns Filtered leases
   */
  getLeases(
    shopFilter?: string,
    searchFilter?: string,
    activeFilter?: boolean,
  ): Lease[] {
    const completionFormsById = this.getCompletionFormsById();
    return filterLeases(
      this.dbContext.data.leases || [],
      completionFormsById,
      shopFilter,
      searchFilter,
      activeFilter,
    );
  }

  /**
   * Get lease completion forms by ID
   * @returns Record of lease completion forms by ID
   */
  getCompletionFormsById(): Record<string, LeaseCompletion> {
    return (this.dbContext.data.leaseCompletions || []).reduce(
      (acc, form) => {
        acc[form.id] = form;
        return acc;
      },
      {} as Record<string, LeaseCompletion>,
    );
  }

  /**
   * Get lease line data for displaying in a table
   * @param item - The lease item
   * @param onPrint - Callback for printing
   * @param onOpen - Callback for opening
   * @returns Lease line data
   */
  getLeaseLineData(
    item: Lease,
    onPrint: (data: PrintViewData) => void,
    onOpen: (data: PrintViewData) => void,
  ): ServiceLineData {
    return getLeaseLineData(
      item,
      this.dbContext.data.leaseCompletions || [],
      this.dbContext.data.archive || [],
      this.t,
      this.dbContext.data.settings,
      onPrint,
      onOpen,
    );
  }

  /**
   * Save a lease item
   * Mirrors ServiceManager.saveServiceItem logic for ID regeneration and archiving
   * @param leaseData - The lease data to save
   * @param archive - Whether to archive the previous version
   * @returns Updated leases
   */
  async saveLeaseItem(leaseData: Lease, archive = true): Promise<Lease[]> {
    let updatedItems = (await this.dbContext.updateLatest('leases')) as Lease[];

    // validate/regenerate id if client name changed
    const currentItem = updatedItems.find((item) => item.id === leaseData.id);
    if (
      currentItem?.client_name &&
      leaseData.client_name &&
      currentItem.client_name.toLowerCase() !==
        leaseData.client_name.toLowerCase()
    ) {
      leaseData.id = generateServiceId(
        updatedItems,
        this.shop?.id,
        this.dbContext.data.shops,
        this.dbContext.data.deleted,
      );
    }

    updatedItems = (await this.dbContext.setData(
      'leases',
      leaseData,
      archive,
    )) as Lease[];

    return updatedItems;
  }

  /**
   * Save a lease completion form
   * @param leaseCompleteData - The completion form data to save
   * @returns Updated completion forms or false if failed
   */
  async saveCompletionForm(
    leaseCompleteData: LeaseCompletion,
  ): Promise<LeaseCompletion[] | false> {
    if (!leaseCompleteData?.lease_id) {
      return false;
    }

    try {
      const updatedItems = (await this.dbContext.setData(
        'leaseCompletions',
        leaseCompleteData,
      )) as LeaseCompletion[];

      return updatedItems;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * Delete a lease and all its history
   * Currently unused on LeasesPage, but kept for parity with ServiceManager
   * @param item - The lease item to delete
   * @returns Updated leases or null if cancelled
   */
  async deleteLeaseHistoryFor(item: Lease): Promise<Lease[] | null> {
    if (!item.id) {
      return null;
    }

    const completions = (this.dbContext.data.leaseCompletions || []).filter(
      (c) => c.lease_id === item.id,
    );

    if (completions.length) {
      for (const element of completions) {
        await this.dbContext.removeData('leaseCompletions', element.id);
      }
    }

    const history = (this.dbContext.data.archive || []).filter(
      (a) => a.docParent === item.id,
    );

    if (history.length) {
      for (let i = 0; i < history.length; i++) {
        await this.dbContext.removeData('archive', history[i].id).catch((e) => {
          console.error(e);
        });
      }
    }

    const leases = (await this.dbContext.removeData(
      'leases',
      item.id,
    )) as Lease[];

    return leases;
  }

  /**
   * Generate a new lease template
   * @returns New lease template
   */
  generateNewLeaseTemplate(): Lease {
    const id = generateServiceId(
      this.dbContext.data.leases || [],
      this.shop?.id,
      this.dbContext.data.shops,
      this.dbContext.data.deleted,
    );

    return {
      id: id,
      lease_status: leaseStatusList[0],
      date: new Date().toISOString().split('T')[0],
      service_address: this.shop?.address || '',
      service_name: this.shop?.name || '',
      service_email: this.shop?.email || '',
      docType: 'leases',
    } as Lease;
  }

  /**
   * Generate a lease completion form template
   * @param item - The lease item
   * @returns Completion form template or null if already completed
   */
  generateCompletionFormTemplate(item: Lease): LeaseCompletion | null {
    const completionFormId = item.id + '_lcd';
    const completionForm = (this.dbContext.data.leaseCompletions || []).find(
      (c) => c.id === completionFormId,
    );

    if (completionForm) {
      return null; // Already completed
    }

    const sourceItem = (completionForm as unknown as Lease) || item;

    return {
      id: item.id + '_lcd',
      lease_id: item.id,
      lease_date: item.date,
      date: new Date().toISOString().split('T')[0],
      service_address: sourceItem.service_address || this.shop?.address || '',
      service_name: sourceItem.service_name || this.shop?.name || '',
      service_email: sourceItem.service_email || this.shop?.email || '',
      client_name: sourceItem.client_name || '',
      client_email: sourceItem.client_email || '',
      client_phone: sourceItem.client_phone || '',
      accessories: sourceItem.accessories || '',
      rental_cost: item.expected_cost || '',
      description: sourceItem.description || '',
      rental_description: '',
      docType: 'leaseCompletions',
    } as LeaseCompletion;
  }
}

import { describe, it, expect, vi } from 'vitest';
import { filterServices, getServiceLineData } from './service.ts';
import type {
  ServiceData,
  ServiceCompleteData,
} from '../interfaces/interfaces';
import { serviceStatusList } from '../interfaces/interfaces';
import type { JSX } from 'react';
import type { TFunction } from 'i18next';

const mockService = (
  id: string,
  overrides?: Partial<ServiceData>,
): ServiceData => ({
  id,
  client_name: 'John Doe',
  client_phone: '123456789',
  service_name: 'Main Shop',
  serviceStatus: serviceStatusList[0],
  type: 'console',
  docUpdated: 1000,
  ...overrides,
});

const mockCompletions: Record<string, ServiceCompleteData> = {
  '1_cd': {
    id: '1_cd',
    service_id: '1',
    date: '2023-01-01',
    docType: 'completions',
  },
};

describe('filterServices', () => {
  it('filters by shop name', () => {
    const result = filterServices(
      [
        mockService('1', { service_name: 'ShopA' }),
        mockService('2', { service_name: 'ShopB' }),
      ],
      {},
      'ShopA',
    );
    expect(result).toHaveLength(1);
    expect(result[0].service_name).toBe('ShopA');
  });

  it('filters by search keyword', () => {
    const result = filterServices(
      [
        mockService('1', { client_name: 'Alice' }),
        mockService('2', { client_name: 'Bob' }),
      ],
      {},
      undefined,
      'ali',
    );
    expect(result).toHaveLength(1);
    expect(result[0].client_name).toBe('Alice');
  });

  it('filters active only', () => {
    const result = filterServices(
      [mockService('1'), mockService('2')],
      mockCompletions,
      undefined,
      undefined,
      true,
    );
    expect(result).toHaveLength(1); // Only '2' is active
    expect(result[0].id).toBe('2');
  });

  it('filters by type', () => {
    const result = filterServices(
      [
        mockService('1', { type: 'laptop' }),
        mockService('2', { type: 'console' }),
      ],
      {},
      undefined,
      undefined,
      false,
      'console',
    );
    expect(result).toHaveLength(1);
    expect(result[0].type).toContain('console');
  });
});

describe('getServiceLineData', () => {
  const mockT = (key: string) => key;
  const mockOnPrint = vi.fn();
  const mockOnOpen = vi.fn();

  const item: ServiceData = {
    id: 'srv1',
    client_name: 'Jane Doe',
    docUpdated: 1000,
    serviceStatus: 'status_in_progress',
  };

  const archive: ServiceData[] = [
    {
      id: 'arch1',
      docParent: 'srv1',
      docUpdated: 500,
      serviceStatus: 'status_accepted',
    },
    {
      id: 'arch2',
      docParent: 'srv1',
      docUpdated: 800,
      serviceStatus: 'status_in_progress',
    },
  ];

  const completionForms: ServiceCompleteData[] = [
    { id: 'srv1_cd', docParent: 'srv1', docUpdated: 1500 },
  ];

  it('should return correct table rows with completion form', () => {
    const result = getServiceLineData(
      item,
      completionForms,
      archive,
      mockT as TFunction<'translation', undefined>,
      { id: 's1' },
      mockOnPrint,
      mockOnOpen,
    );

    expect(result.id).toBe('srv1');
    expect(result.name).toBe('Jane Doe');
    expect(result.completed).toBe(true);
    expect(result.table.length).toBe(4); // 2 archives + item + completion

    const [firstRow] = result.table;
    expect(firstRow[1]).toBe('Service Form');
    expect(firstRow[2]).toBe(1);
  });

  it('should call proper onPrint and onOpen for completion form', () => {
    const result = getServiceLineData(
      item,
      completionForms,
      archive,
      mockT as TFunction<'translation', undefined>,
      { id: 's1' },
      mockOnPrint,
      mockOnOpen,
    );

    const lastRow = result.table[result.table.length - 1];
    const actions = lastRow[4];

    (actions as JSX.Element).props.children[1].props.onClick(); // onPrint
    (actions as JSX.Element).props.children[7].props.onClick(); // onOpen

    expect(mockOnPrint).toHaveBeenCalled();
    expect(mockOnOpen).toHaveBeenCalled();
  });

  it('should not duplicate item if already in archive list', () => {
    const itemDup: ServiceData = {
      id: 'srv2',
      client_name: 'Jim Beam',
      docUpdated: 2000,
      serviceStatus: 'status_ready',
    };
    const archiveDup = [{ id: 'arch2', docParent: 'srv2', docUpdated: 2000 }];
    const result = getServiceLineData(
      itemDup,
      [],
      archiveDup,
      mockT as TFunction<'translation', undefined>,
      undefined,
      vi.fn(),
      vi.fn(),
    );
    expect(result.table.length).toBe(1);
  });
});

import {describe, it, expect} from 'vitest';
import {filterServices} from './service.ts';
import type {ServiceData, ServiceCompleteData} from '../interfaces/interfaces';

const mockService = (
  id: string,
  overrides?: Partial<ServiceData>
): ServiceData => ({
  id,
  client_name: 'John Doe',
  client_phone: '123456789',
  service_name: 'Main Shop',
  serviceStatus: 'status_accepted',
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
        mockService('1', {service_name: 'ShopA'}),
        mockService('2', {service_name: 'ShopB'}),
      ],
      {},
      'ShopA'
    );
    expect(result).toHaveLength(1);
    expect(result[0].service_name).toBe('ShopA');
  });

  it('filters by search keyword', () => {
    const result = filterServices(
      [
        mockService('1', {client_name: 'Alice'}),
        mockService('2', {client_name: 'Bob'}),
      ],
      {},
      undefined,
      'ali'
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
      true
    );
    expect(result).toHaveLength(1); // Only '2' is active
    expect(result[0].id).toBe('2');
  });

  it('filters by type', () => {
    const result = filterServices(
      [mockService('1', {type: 'laptop'}), mockService('2', {type: 'console'})],
      {},
      undefined,
      undefined,
      false,
      'console'
    );
    expect(result).toHaveLength(1);
    expect(result[0].type).toContain('console');
  });
});

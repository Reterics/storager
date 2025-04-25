import {describe, it, expect} from 'vitest';
import {
  serviceDataToPrintable,
  completionFormToPrintable,
  formatChanges,
  capitalize,
} from './print';
import {ServiceData} from '../interfaces/interfaces.ts';
import {TFunction} from 'i18next';

describe('print.tsx', () => {
  const t = ((key) => key) as TFunction<'translation', undefined>;

  it('should format serviceData to printable data', () => {
    const service = {
      id: 'srv1',
      client_name: 'John Doe',
      client_phone: '12345',
      client_email: 'john@example.com',
      service_name: 'Repair',
      service_address: '123 Street',
      service_email: 'service@example.com',
      type: 'laptop,charger',
      description: 'Broken screen',
      serviceStatus: 'status_accepted',
      guaranteed: 'yes',
      accessories: 'Charger',
      repair_description: 'Replaced screen',
      expected_cost: '5000',
      note: 'Urgent',
      date: '2024-04-01',
      signature: 'sigdata',
    } as ServiceData;

    const result = serviceDataToPrintable(
      service,
      {serviceAgreement: 'terms', id: 'x'},
      t,
      true
    );
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.printNow).toBe(true);
    expect(result.signature).toBe('sigdata');
  });

  it('should format completionForm to printable data', () => {
    const form = {
      id: 'comp1',
      client_name: 'Jane Doe',
      client_phone: '54321',
      client_email: 'jane@example.com',
      service_name: 'Replace',
      service_address: '321 Street',
      service_email: 'replace@example.com',
      type: 'printer',
      description: 'Out of ink',
      guaranteed: 'no',
      accessories: 'None',
      repair_description: 'Refilled ink',
      repair_cost: '2000',
      date: '2024-04-02',
      signature: '',
    } as ServiceData;

    const result = completionFormToPrintable(form, t, false);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.printNow).toBe(false);
  });

  it('should format changes to JSX', () => {
    const changes = {
      status: {from: 'pending', to: 'done'},
      cost: {from: '100', to: '200'},
    };

    const jsx = formatChanges(changes);
    expect(jsx.length).toBe(2);
    expect(jsx[0].props.children.includes('pending')).toBe(true);
  });

  it('should capitalize a string', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
});

import {describe, it, expect} from 'vitest';
import {
  toUserDateTime,
  generateServiceId,
  normalizeString,
  compareNormalizedStrings,
  getChangedFields,
  getBrowserInfo,
  getDeviceDebugInfo,
  formatCurrency,
  reduceToRecordById,
} from './data';
import {CommonCollectionData} from '../interfaces/firebase.ts';

describe('utils/data', () => {
  it('should convert Date to user datetime string', () => {
    const date = new Date('2024-01-01T12:34:56');
    const result = toUserDateTime(date);
    expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
  });

  it('should normalize string correctly', () => {
    expect(normalizeString('Árvíztűrő tükörfúrógép!')).toBe(
      'arvizturotukorfurogep'
    );
  });

  it('should compare normalized strings', () => {
    expect(compareNormalizedStrings('Árvíz', 'arviz')).toBe(true);
  });

  it('should detect changes in object fields', () => {
    const oldObj = {a: 1, b: [2, 3]} as unknown as CommonCollectionData;
    const newObj = {a: 2, b: [2, 4]} as unknown as CommonCollectionData;
    const result = getChangedFields(oldObj, newObj);
    expect(result).toHaveProperty('a');
    expect(result).toHaveProperty('b');
  });

  it('should detect browser info from user agent', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    const result = getBrowserInfo(ua);
    expect(result.name).toBe('Chrome');
    expect(result.version).toMatch(/\d+/);
  });

  it('should get device debug info', () => {
    const info = getDeviceDebugInfo();
    expect(info).toHaveProperty('language');
    expect(info.screen).toHaveProperty('width');
  });

  it('should format HUF correctly', () => {
    const result = formatCurrency(12345);
    expect(result).toBe('12 345 Ft');
  });

  it('should reduce array to record by id', () => {
    const items = [
      {id: 'a', value: 1},
      {id: 'b', value: 2},
    ];
    const record = reduceToRecordById(items);
    expect(record).toHaveProperty('a');
    expect(record.a.value).toBe(1);
  });

  it('should generate a new service id based on existing items', () => {
    const result = generateServiceId([{id: '00001'}], 'shop1', [
      {id: 'shop1'},
      {id: 'shop2'},
    ]);
    expect(result).toMatch(/\d{5}/);
  });
});

import { describe, it, expect } from 'vitest';
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
  toSelectOptions,
  formatDateTimeLocal,
} from './data';
import type {
  CommonCollectionData,
  ContextDataValueType,
} from '../interfaces/firebase.ts';
import type { ServiceData, Shop } from '../interfaces/interfaces.ts';

describe('utils/data', () => {
  it('should convert Date to user datetime string', () => {
    const date = new Date('2024-01-01T12:34:56');
    const result = toUserDateTime(date);
    expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
  });

  it('should normalize string correctly', () => {
    expect(normalizeString('Árvíztűrő tükörfúrógép!')).toBe(
      'arvizturotukorfurogep',
    );
  });

  it('should compare normalized strings', () => {
    expect(compareNormalizedStrings('Árvíz', 'arviz')).toBe(true);
  });

  it('should detect changes in object fields', () => {
    const oldObj = { a: 1, b: [2, 3] } as unknown as CommonCollectionData;
    const newObj = { a: 2, b: [2, 4] } as unknown as CommonCollectionData;
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
      { id: 'a', value: 1 },
      { id: 'b', value: 2 },
    ];
    const record = reduceToRecordById(items);
    expect(record).toHaveProperty('a');
    expect(record.a.value).toBe(1);
  });

  it('should generate a new service id based on existing items', () => {
    const result = generateServiceId([{ id: '00001' }], 'shop1', [
      { id: 'shop1' },
      { id: 'shop2' },
    ]);
    expect(result).toMatch(/\d{5}/);
  });

  it('toSelectOptions maps id and selected key to name', () => {
    const arr: ContextDataValueType[] = [
      {
        id: '1',
        name: 'One',
        displayName: 'Uno',
      } as unknown as ContextDataValueType,
      {
        id: '2',
        name: 'Two',
        displayName: 'Dos',
      } as unknown as ContextDataValueType,
    ];
    const optsDefault = toSelectOptions(arr);
    expect(optsDefault).toEqual([
      { name: 'One', value: '1' },
      { name: 'Two', value: '2' },
    ]);

    const optsDisplay = toSelectOptions(arr, 'displayName');
    expect(optsDisplay).toEqual([
      { name: 'Uno', value: '1' },
      { name: 'Dos', value: '2' },
    ]);

    const optsMissing = toSelectOptions([
      { id: 'x' } as unknown as ContextDataValueType,
    ]);
    expect(optsMissing).toEqual([{ name: '', value: 'x' }]);
  });

  it('formatDateTimeLocal formats dates and handles NaN', () => {
    const date = new Date('2024-06-03T07:08:00Z');
    const text = formatDateTimeLocal(date);
    expect(text).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);

    const ms = Date.parse('2024-06-03T07:08:00Z');
    const text2 = formatDateTimeLocal(ms);
    expect(text2).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);

    // NaN should return '?'
    expect(formatDateTimeLocal(Number.NaN)).toBe('?');
  });
});

describe('utils/data additional coverage', () => {
  it('generateServiceId uses deleted numeric ids and skips archive (lines 38-40)', () => {
    const servicedItems = [] as unknown as { id: string }[];
    const shops = [{ id: 'shop1' }, { id: 'shop2' }];
    const currentShopId = 'shop2';
    const deleted = [
      { id: '00003', docType: 'deleted' },
      { id: 'abc', docType: 'deleted' },
      { id: '00005', docType: 'archive' },
    ] as unknown as ContextDataValueType[];

    const id = generateServiceId(
      servicedItems as ServiceData[],
      currentShopId,
      shops as Shop[],
      deleted,
    );
    expect(id).toMatch(/^\d{5}$/);
    // With lastNumber based on 3 and shopIndex=1, next id should be 00004
    expect(id).toBe('00004');
  });

  it('getChangedFields handles arrays with different lengths (lines 93-94, 104)', () => {
    const oldObj = { arr: [1] } as unknown as CommonCollectionData;
    const newObj = { arr: [1, 2] } as unknown as CommonCollectionData;
    const changes = getChangedFields(oldObj, newObj);
    expect(changes).toHaveProperty('arr');
    expect(changes.arr.index).toBe(1);
    expect(changes.arr.from).toBe('undefined');
    expect(changes.arr.to).toBe(2);
  });

  it('getBrowserInfo detects Edge, Firefox, Safari, Opera, Unknown and mobile flag (133-147)', () => {
    const edgeUA =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.2478.80';
    const firefoxUA =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0';
    const safariUA =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15';
    const operaUA = 'OPR/107.0.0.0';
    const unknownUA = 'SomeBot/1.0';
    const mobileUA =
      'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36';

    const edge = getBrowserInfo(edgeUA);
    expect(edge.name).toBe('Edge');
    expect(edge.version).toMatch(/\d+/);

    const ff = getBrowserInfo(firefoxUA);
    expect(ff.name).toBe('Firefox');
    expect(ff.version).toMatch(/\d+/);

    const safari = getBrowserInfo(safariUA);
    expect(safari.name).toBe('Safari');
    expect(safari.version).toMatch(/\d+/);

    const opera = getBrowserInfo(operaUA);
    expect(opera.name).toBe('Opera');
    expect(opera.version).toMatch(/\d+/);

    const unk = getBrowserInfo(unknownUA);
    expect(unk.name).toBe('Unknown');
    expect(unk.version).toBe('');
    expect(unk.isMobile).toBe(false);

    const mob = getBrowserInfo(mobileUA);
    expect(mob.isMobile).toBe(true);
  });

  it('getDeviceDebugInfo orientation fallback and hardwareConcurrency fallback (178-184, 187)', () => {
    const originalScreen = globalThis.screen;
    const originalOrientation = window.orientation;
    const originalHW = Object.getOwnPropertyDescriptor(
      // @ts-expect-error legacy support
      window.navigator.__proto__ ?? window.navigator,
      'hardwareConcurrency',
    );

    // Mock screen without orientation, window.orientation = 90 => landscape
    globalThis.screen = {
      width: 1920,
      height: 1080,
      availWidth: 1900,
      availHeight: 1040,
      orientation: undefined as unknown as ScreenOrientation,
    } as Screen;
    (window as typeof globalThis).innerWidth = 1200;
    (window as typeof globalThis).innerHeight = 800;
    (window as typeof globalThis).devicePixelRatio = 2;
    Object.defineProperty(window.navigator, 'hardwareConcurrency', {
      configurable: true,
      value: undefined, // trigger fallback to 'unknown'
    });

    (window as typeof globalThis).orientation = 90;
    let info = getDeviceDebugInfo();
    expect(info.screen.orientation).toBe('landscape');
    expect(info.viewport.innerWidth).toBe(1200);
    expect(info.devicePixelRatio).toBe(2);
    expect(info.hardwareConcurrency).toBe('unknown');

    // Now window.orientation = 0 => portrait
    (window as typeof globalThis).orientation = 0;
    info = getDeviceDebugInfo();
    expect(info.screen.orientation).toBe('portrait');

    // Now no window.orientation => unknown
    (window as typeof globalThis).orientation = undefined as unknown as number;
    info = getDeviceDebugInfo();
    expect(info.screen.orientation).toBe('unknown');

    // Restore mocks
    if (originalHW) {
      Object.defineProperty(
        window.navigator,
        'hardwareConcurrency',
        originalHW,
      );
    }
    globalThis.screen = originalScreen;
    (window as typeof globalThis).orientation = originalOrientation;
  });

  it('formatCurrency handles non-HUF with decimals (207-209)', () => {
    const eur = formatCurrency(1234.5, 'EUR');
    // hu-HU locale uses comma as decimal separator; expect EUR code and two decimals
    expect(eur).toMatch(/^1\s?234,50\s?EUR$/);
  });
});

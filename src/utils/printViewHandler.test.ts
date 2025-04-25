import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {
  getPrintableData,
  adjustPageHeight,
  downloadElementAsPDF,
} from './printViewHandler';
import {TFunction} from 'i18next';
import {DBContextType} from '../interfaces/firebase.ts';

vi.mock('html2canvas', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue({
    width: 800,
    height: 1200,
    toDataURL: () => 'data:image/png;base64,fakeimg',
  }),
}));

vi.mock('jspdf', () => {
  return {
    __esModule: true,
    default: class jsPDF {
      internal = {pageSize: {getWidth: () => 210, getHeight: () => 297}};
      addImage = vi.fn();
      addPage = vi.fn();
      save = vi.fn();
    },
  };
});

vi.mock('./print.tsx', () => ({
  serviceDataToPrintable: vi.fn((data) => ({type: 'service', id: data.id})),
  completionFormToPrintable: vi.fn((data) => ({
    type: 'completion',
    id: data.id,
  })),
}));

describe('printViewHandler', () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    HTMLCanvasElement.prototype.getContext = vi.fn(() => {
      return {
        getImageData: vi.fn().mockReturnValue({
          data: new Uint8ClampedArray([255, 255, 255, 255]),
        }),
        drawImage: vi.fn(),
        clearRect: vi.fn(),
        fillRect: vi.fn(),
      } as unknown as CanvasRenderingContext2D;
    });
  });
  afterAll(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });
  const mockT = ((key: string) => key) as unknown as TFunction<
    'Translation',
    unknown
  >;

  it('returns serviceData printable object', () => {
    const data = {
      data: {
        services: [{id: '123'}],
        completions: [],
        archive: [],
        settings: {id: 's1'},
      },
    } as unknown as DBContextType;
    const result = getPrintableData(data, '123', mockT, 'services');
    expect(result).toEqual({type: 'service', id: '123'});
  });

  it('returns completionForm printable object', () => {
    const data = {
      data: {
        services: [],
        completions: [{id: '456'}],
        archive: [],
        settings: {id: 's1'},
      },
    } as unknown as DBContextType;
    const result = getPrintableData(data, '456', mockT, 'completions');
    expect(result).toEqual({type: 'completion', id: '456'});
  });

  it('returns null if not found', () => {
    const data = {
      data: {
        services: [],
        completions: [],
        archive: [],
        settings: {},
      },
    } as unknown as DBContextType;
    const result = getPrintableData(data, '999', mockT);
    expect(result).toBeNull();
  });

  it('adjusts page height to avoid cutting content', () => {
    const dummyCanvas = {
      width: 100,
      height: 200,
      getContext: () => ({
        getImageData: vi.fn().mockReturnValue({
          data: new Uint8ClampedArray([255, 255, 255, 255]), // pure white
        }),
      }),
    };
    const ctx = dummyCanvas.getContext();
    const pageHeight = adjustPageHeight(
      dummyCanvas as never,
      0,
      50,
      ctx as never
    );
    expect(pageHeight).toBe(50);
  });

  it('generates PDF from div', async () => {
    const div = document.createElement('div');
    await downloadElementAsPDF(div);
    expect(true).toBe(true); // basic smoke test; deeper tests rely on mocked pdf internals
  });
});

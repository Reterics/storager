import {render, fireEvent, waitFor} from '@testing-library/react';
import PrintableVersionFrame from './PrintableVersionFrame.tsx';
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  Mock,
  beforeAll,
  afterAll,
} from 'vitest';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    addImage: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
  })),
}));

vi.mock('html2canvas', () => ({
  default: vi.fn(),
}));

describe('PrintableVersionModal', () => {
  const onCloseMock = vi.fn();
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const formData = {
      data: [],
      signature: 'signature-url',
    };

    const {getByAltText, getAllByText, unmount} = render(
      <PrintableVersionFrame onClose={onCloseMock} formData={formData} />
    );

    expect(getAllByText('Print')[0]).toBeVisible();
    expect(getAllByText('Cancel')[0]).toBeVisible();
    expect(getByAltText('Signature')).toBeVisible();
    unmount();
  });

  it('calls onClose when Cancel button is clicked', () => {
    const formData = {
      data: [],
      signature: 'signature-url',
    };

    const {getAllByText, unmount} = render(
      <PrintableVersionFrame onClose={onCloseMock} formData={formData} />
    );

    const cancelButton = getAllByText('Cancel')[0];
    fireEvent.click(cancelButton);

    expect(onCloseMock).toHaveBeenCalled();
    unmount();
  });

  it('calls handleDownloadPdf when Print button is clicked', async () => {
    const formData = {
      data: [],
      signature: 'signature-url',
    };

    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 1000;
    mockCanvas.height = 2000;
    (html2canvas as Mock).mockResolvedValue(Promise.resolve(mockCanvas));

    const {getAllByText, unmount} = render(
      <PrintableVersionFrame onClose={onCloseMock} formData={formData} />
    );

    const printButton = getAllByText('Print')[0];
    fireEvent.click(printButton);

    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalled();
      expect(jsPDF).toHaveBeenCalled();
    });
    unmount();
  });

  it('calls handleDownloadPdf and onClose when formData.printNow is true', async () => {
    const formData = {
      data: [],
      signature: 'signature-url',
      printNow: true,
    };

    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 1000;
    mockCanvas.height = 2000;
    (html2canvas as Mock).mockResolvedValue(Promise.resolve(mockCanvas));

    render(<PrintableVersionFrame onClose={onCloseMock} formData={formData} />);

    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalled();
      expect(jsPDF).toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
    });
  });
});

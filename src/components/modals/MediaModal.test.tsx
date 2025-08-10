import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MediaModal, { MediaBrowse } from './MediaModal';
import type { TFunction } from 'i18next';

vi.mock('../elements/ImageUploader.tsx', () => ({
  ImageUploader: ({ setLocalFile }: { setLocalFile: (file: File) => void }) => (
    <input
      type="file"
      data-testid="mock-uploader"
      onChange={() =>
        setLocalFile(new File(['test'], 'test.png', { type: 'image/png' }))
      }
    />
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: ((key) => key) as TFunction<'Translation', undefined>,
  }),
}));

describe('MediaModal', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<input type="hidden" id="csrf_token" value="test_csrf" />';
  });

  it('renders modal and uploader', () => {
    render(<MediaModal onClose={vi.fn()} setFile={vi.fn()} />);
    expect(screen.getByTestId('mock-uploader')).toBeInTheDocument();
  });

  it('calls setFile on successful upload', async () => {
    const mockSetFile = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ fileName: 'image.png', token: 'new_csrf' }),
      }),
    );

    render(<MediaModal onClose={vi.fn()} setFile={mockSetFile} />);
    fireEvent.change(screen.getByTestId('mock-uploader'), {
      target: {
        files: [new File(['dummy'], 'image.png', { type: 'image/png' })],
      },
    });

    fireEvent.click(screen.getByText('Upload'));
    await new Promise((r) => setTimeout(r, 10));

    expect(mockSetFile).toHaveBeenCalledWith('./uploads/image.png');
    expect(
      (document.getElementById('csrf_token') as HTMLInputElement)?.value,
    ).toBe('new_csrf');
  });

  it('handles upload error gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed')));

    render(<MediaModal onClose={vi.fn()} setFile={vi.fn()} />);
    const uploadBtn = screen.getByText('Upload');
    fireEvent.click(uploadBtn);

    await new Promise((r) => setTimeout(r, 10));

    expect(screen.getByText('Upload')).toBeInTheDocument();
  });
});

describe('MediaBrowse', () => {
  it('renders image preview when image is passed', () => {
    render(<MediaBrowse onClick={vi.fn()} image="./preview.png" />);
    expect(screen.getByAltText('Preview')).toHaveAttribute(
      'src',
      './preview.png',
    );
  });

  it('calls onClick when Browse button is clicked', () => {
    const clickMock = vi.fn();
    render(<MediaBrowse onClick={clickMock} />);
    fireEvent.click(screen.getByDisplayValue('Browse'));
    expect(clickMock).toHaveBeenCalled();
  });
});

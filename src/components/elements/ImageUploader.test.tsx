import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import {ImageUploader} from './ImageUploader';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({t: (key: string) => key}),
}));

vi.mock('./StyledFile.tsx', () => ({
  default: ({onChange}: {onChange: (file: File) => void}) => (
    <input
      type='file'
      data-testid='mock-file-input'
      onChange={(e) => {
        if (e.target.files) onChange(e.target.files[0]);
      }}
    />
  ),
}));

describe('ImageUploader Component', () => {
  const mockSetFile = vi.fn();
  const mockSetLocalFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders StyledFile and image grid', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ['image1.png', 'image2.jpg'],
    }) as unknown as typeof fetch;

    render(
      <ImageUploader setFile={mockSetFile} setLocalFile={mockSetLocalFile} />
    );

    expect(screen.getByTestId('mock-file-input')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByRole('img')).toHaveLength(2);
    });
  });

  it('clicking on image calls setFile with correct URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ['test-image.png'],
    }) as unknown as typeof fetch;

    render(
      <ImageUploader setFile={mockSetFile} setLocalFile={mockSetLocalFile} />
    );

    await waitFor(() => {
      const image = screen.getByAltText('Image_0');
      fireEvent.click(image);
      expect(mockSetFile).toHaveBeenCalledWith('./uploads/test-image.png');
    });
  });

  it('handles fetch failure gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fetch error'));

    render(
      <ImageUploader setFile={mockSetFile} setLocalFile={mockSetLocalFile} />
    );

    await waitFor(() => {
      expect(screen.queryAllByRole('img')).toHaveLength(0);
    });
  });
});

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import StyledFile from './StyledFile';

// Mock the fileToDataURL utility
vi.mock('../../utils/general.ts', () => ({
  fileToDataURL: vi
    .fn()
    .mockResolvedValue('data:image/png;base64,testbase64data'),
}));

const mockOnChange = vi.fn();

describe('StyledFile Component', () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with label', () => {
    render(
      <StyledFile
        name='file-upload'
        label='Upload File'
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Upload File')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<StyledFile name='file-upload' onChange={mockOnChange} />);
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
  });

  it('calls onChange and updates preview when a file is selected', async () => {
    render(<StyledFile name='file-upload' onChange={mockOnChange} preview />);

    const file = new File(['dummy content'], 'example.png', {
      type: 'image/png',
    });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, {target: {files: [file]}});

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(file);
      expect(screen.getByAltText('Preview')).toHaveAttribute(
        'src',
        'data:image/png;base64,testbase64data'
      );
    });
  });

  it('uses default preview when provided', () => {
    render(
      <StyledFile
        name='file-upload'
        onChange={mockOnChange}
        preview
        defaultPreview='default-image-url'
      />
    );

    expect(screen.getByAltText('Preview')).toHaveAttribute(
      'src',
      'default-image-url'
    );
  });
});

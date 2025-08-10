import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LaborFeeInput from './LaborFeeInput';
import type { Mock } from 'vitest';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { popup, confirm } from '../modalExporter';
import TestingPageProvider from '../../../tests/mocks/TestingPageProvider.tsx';
import type { ContextData } from '../../interfaces/firebase.ts';
import { defaultShop } from '../../../tests/mocks/shopData.ts';

vi.mock('../modalExporter', () => ({
  popup: vi.fn(),
  confirm: vi.fn(),
}));

describe('LaborFeeInput', () => {
  const mockSetData = vi.fn();

  const renderWithContext = () => {
    render(
      <TestingPageProvider
        setData={mockSetData}
        ctxDataOverride={
          { currentUser: { email: 'test@example.com' } } as ContextData
        }
      >
        <LaborFeeInput />
      </TestingPageProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input and button', () => {
    renderWithContext();
    expect(screen.getByTestId('laborFee')).toBeInTheDocument();
    expect(screen.getByTestId('laborFeeButton')).toBeInTheDocument();
  });

  it('calls popup for invalid input', async () => {
    renderWithContext();

    const input = screen.getByTestId('laborFee');
    const button = screen.getByTestId('laborFeeButton');

    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(popup).toHaveBeenCalledWith(
        expect.stringContaining('valid number'),
      );
    });
  });

  it('calls setData with valid transaction data after confirmation', async () => {
    (confirm as unknown as Mock).mockResolvedValue(true);

    renderWithContext();

    const input = screen.getByTestId('laborFee');
    const button = screen.getByTestId('laborFeeButton');

    fireEvent.change(input, { target: { value: '12700' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith(
        'transactions',
        expect.objectContaining({
          cost: 10000,
          document_type: 'receipt',
          net_amount: 10000,
          gross_amount: 12700,
          item_type: 'other',
          transaction_type: 'labor',
          payment_method: 'cash',
          user: 'test@example.com',
          shop_id: [defaultShop.id],
        }),
      );
    });
  });

  it('does nothing if user cancels confirmation', async () => {
    (confirm as unknown as Mock).mockResolvedValue(false);

    renderWithContext();

    fireEvent.change(screen.getByTestId('laborFee'), {
      target: { value: '12700' },
    });
    fireEvent.click(screen.getByTestId('laborFeeButton'));

    await waitFor(() => {
      expect(mockSetData).not.toHaveBeenCalled();
    });
  });
});

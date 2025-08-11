import type { ChangeEventHandler } from 'react';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from './Settings';
import { DBContext } from '../database/DBContext';
import { vi, expect, it, beforeEach, describe } from 'vitest';
import type { StyledInputArgs } from '../interfaces/interfaces.ts';
import type { DBContextType } from '../interfaces/firebase.ts';

vi.mock('../components/elements/StyledInput', () => ({
  __esModule: true,
  default: ({ label, name, value, onChange, type }: StyledInputArgs) => (
    <div>
      <label id={name + '_label'} htmlFor={name}>
        {label}
      </label>
      {type === 'checkbox' ? (
        <input
          id={name}
          aria-labelledby={label ? name + '_label' : undefined}
          type="checkbox"
          name={name}
          checked={!!value}
          onChange={onChange}
        />
      ) : type === 'textarea' ? (
        <textarea
          aria-labelledby={label ? name + '_label' : undefined}
          id={name}
          name={name}
          value={value}
          onChange={
            onChange as unknown as ChangeEventHandler<HTMLTextAreaElement>
          }
        />
      ) : (
        <input
          id={name}
          aria-labelledby={label ? name + '_label' : undefined}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  ),
}));

vi.mock('../components/elements/FormRow', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('Settings Component', () => {
  const mockDBContext = {
    data: {
      currentUser: {
        id: 'user1',
        role: 'admin',
      },
      settings: {
        id: 'settings1',
        companyName: 'Test Company',
        address: '123 Test St',
        taxId: 'TAX123',
        bankAccount: '123456789',
        phone: '555-1234',
        email: 'test@example.com',
        smtpServer: 'smtp.test.com',
        port: '587',
        username: 'user',
        password: 'pass',
        useSSL: true,
        serviceAgreement: 'Test Agreement',
      },
    },
    setData: vi.fn(),
  };

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <DBContext.Provider value={mockDBContext as unknown as DBContextType}>
        {ui}
      </DBContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders UnauthorizedComponent when user is not authorized', () => {
    const dbContextWithoutUser = {
      ...mockDBContext,
      data: {
        ...mockDBContext.data,
        currentUser: null,
      },
    };

    render(
      <DBContext.Provider
        value={dbContextWithoutUser as unknown as DBContextType}
      >
        <Settings />
      </DBContext.Provider>,
    );

    expect(
      screen.getByText('401 Unauthorized - Your privileges has been revoked'),
    ).toBeInTheDocument();
  });

  it('renders form with initial settings when user is authorized', () => {
    renderWithProviders(<Settings />);

    expect(screen.getByText('Company Details')).toBeInTheDocument();
    expect(screen.getByLabelText('Company Name')).toHaveValue('Test Company');
    expect(screen.getByLabelText('Address')).toHaveValue('123 Test St');
    expect(screen.getByLabelText('Tax ID')).toHaveValue('TAX123');
    expect(screen.getByLabelText('Bank Account Number')).toHaveValue(
      '123456789',
    );
    expect(screen.getByLabelText('Phone')).toHaveValue('555-1234');
    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('Service Agreement')).toHaveValue(
      'Test Agreement',
    );

    // "Save Settings" button should not be visible initially
    expect(screen.queryByText('Save Settings')).not.toBeInTheDocument();
  });

  it('updates state and shows "Save Settings" button when input changes', () => {
    renderWithProviders(<Settings />);

    const companyNameInput = screen.getByLabelText('Company Name');
    fireEvent.change(companyNameInput, {
      target: { value: 'New Company Name' },
    });

    expect(companyNameInput).toHaveValue('New Company Name');
    expect(screen.getByText('Save Settings')).toBeInTheDocument();
  });

  it('does not show "Save Settings" button when inputs have not changed', () => {
    renderWithProviders(<Settings />);

    // No changes made, button should not be visible
    expect(screen.queryByText('Save Settings')).not.toBeInTheDocument();
  });

  it('calls saveFirebaseSettings on form submission', async () => {
    renderWithProviders(<Settings />);

    const companyNameInput = screen.getByLabelText('Company Name');
    fireEvent.change(companyNameInput, {
      target: { value: 'New Company Name' },
    });

    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockDBContext.setData).toHaveBeenCalledWith('settings', {
        ...mockDBContext.data.settings,
        companyName: 'New Company Name',
      });
    });

    // "Save Settings" button should disappear after saving
    expect(screen.queryByText('Save Settings')).not.toBeInTheDocument();
  });

  it('handles textarea input correctly', () => {
    renderWithProviders(<Settings />);

    const serviceAgreementTextarea = screen.getByLabelText('Service Agreement');
    fireEvent.change(serviceAgreementTextarea, {
      target: { value: 'Updated Agreement' },
    });

    expect(serviceAgreementTextarea).toHaveValue('Updated Agreement');
    expect(screen.getByText('Save Settings')).toBeInTheDocument();
  });

  it('uses default settings when dbContext.data.settings is undefined', () => {
    const dbContextWithoutSettings = {
      ...mockDBContext,
      data: {
        ...mockDBContext.data,
        settings: undefined,
      },
    };

    render(
      <DBContext.Provider
        value={dbContextWithoutSettings as unknown as DBContextType}
      >
        <Settings />
      </DBContext.Provider>,
    );

    expect(screen.getByLabelText('Company Name')).toHaveValue('');
    expect(screen.getByLabelText('Address')).toHaveValue('');
    // Other fields should also be empty
  });

  it('calls changeType when input changes', () => {
    renderWithProviders(<Settings />);

    const addressInput = screen.getByLabelText('Address');
    fireEvent.change(addressInput, { target: { value: '456 New Address' } });

    expect(addressInput).toHaveValue('456 New Address');
    expect(screen.getByText('Save Settings')).toBeInTheDocument();
  });

  it('shows a Terms of Use link in Settings that navigates to terms page', () => {
    renderWithProviders(<Settings />);
    const link = screen.getByTestId('settings-terms-link') as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
    expect(link.textContent).toContain('Terms and Conditions');
    expect(link.getAttribute('href')).toBe('?page=terms');
  });
});

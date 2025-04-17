import {render, screen, fireEvent} from '@testing-library/react';
import Unauthorized from './Unauthorized';
import {AuthContext} from '../store/AuthContext';
import {vi, expect, it, describe} from 'vitest';
import {IAuth} from '../interfaces/interfaces.ts';

describe('Unauthorized', () => {
  const mockSignOut = vi.fn();

  const renderWithProviders = () => {
    render(
      <AuthContext.Provider value={{SignOut: mockSignOut} as unknown as IAuth}>
        <Unauthorized />
      </AuthContext.Provider>
    );
  };

  it('renders the unauthorized message', () => {
    renderWithProviders();
    expect(
      screen.getByText('401 Unauthorized - Your privileges has been revoked')
    ).toBeInTheDocument();
  });

  it('renders the logout button with translated text', () => {
    renderWithProviders();
    expect(screen.getByRole('button', {name: /Logout/i})).toBeInTheDocument();
  });

  it('calls SignOut when the logout button is clicked', () => {
    renderWithProviders();
    fireEvent.click(screen.getByRole('button', {name: /Logout/i}));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});

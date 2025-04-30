import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import SignIn from './SignIn';
import {AuthContext} from '../store/AuthContext';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {IAuth} from '../interfaces/interfaces.ts';

describe('SignIn', () => {
  const mockSignIn = vi.fn();
  const mockContextValue = {
    SignIn: mockSignIn,
    loading: false,
    error: null,
  } as unknown as IAuth;

  const renderWithProviders = (contextValue = mockContextValue) => {
    render(
      <AuthContext.Provider value={contextValue}>
        <SignIn />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    mockSignIn.mockClear();
  });

  it('renders the sign-in form correctly', () => {
    renderWithProviders();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Your email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Sign in/i})).toBeInTheDocument();
  });

  it('displays the loading spinner when loading is true', () => {
    renderWithProviders({...mockContextValue, loading: true});
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /Sign in/i})
    ).not.toBeInTheDocument();
  });

  it('displays an error message when error is present', () => {
    renderWithProviders({...mockContextValue, error: 'Invalid credentials'});
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
  });

  it('calls SignIn with email and password when sign-in button is clicked', async () => {
    renderWithProviders();
    const emailInput = screen.getByLabelText('Your email');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', {name: /Sign in/i});

    fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
    fireEvent.change(passwordInput, {target: {value: 'password123'}});
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('hide inputs and button when loading is true', () => {
    renderWithProviders({...mockContextValue, loading: true});
    expect(screen.queryByLabelText('Your email')).toBe(null);
    expect(screen.queryByLabelText('Password')).toBe(null);
    expect(
      screen.queryByRole('button', {name: /Sign in/i})
    ).not.toBeInTheDocument();
  });
});

import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import Header from './Header';
import {AuthContext} from '../store/AuthContext';
import {ShopContext} from '../store/ShopContext';
import {DBContext} from '../database/DBContext';
import {vi, expect, it, describe, Mock, beforeEach} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {useTheme} from '../store/ThemeContext';
import {IAuth, Shop} from '../interfaces/interfaces.ts';
import {DBContextType} from '../interfaces/firebase.ts';
import {defaultSettings} from '../../tests/mocks/shopData.ts';

vi.mock('../database/firebase/config', async () => {
  const actual = await vi.importActual('../database/firebase/config');
  return {
    ...actual,
    firebaseModel: {
      invalidateCache: vi.fn(),
      isLoggingActive: vi.fn().mockReturnValue(false), // default false unless overridden
    },
    modules: {
      leasing: false,
      transactions: false,
    },
  };
});

import * as configModule from '../database/firebase/config';

vi.mock('../store/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

describe('Header Component', () => {
  const mockAuthContext = {
    SignOut: vi.fn(),
    user: {
      displayName: 'Test User',
      email: 'test@example.com',
    },
  };

  const mockShopContext = {
    shop: null,
    setShop: () => {},
  } as {
    shop: Shop | null;
    setShop: () => void;
  };

  const mockDBContext = {
    data: {
      currentUser: {
        role: 'user',
      },
      settings: defaultSettings,
    },
    refreshData: vi.fn(),
  };

  // Helper function to render with providers
  const renderWithProviders = (
    ui: React.ReactElement,
    {route = '/', searchParams = ''} = {}
  ) => {
    window.history.pushState({}, 'Test page', route + searchParams);

    return render(
      <MemoryRouter initialEntries={[route + searchParams]}>
        <AuthContext.Provider value={mockAuthContext as unknown as IAuth}>
          <ShopContext.Provider value={mockShopContext}>
            <DBContext.Provider
              value={mockDBContext as unknown as DBContextType}
            >
              {ui}
            </DBContext.Provider>
          </ShopContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockDBContext.refreshData.mockClear();
    mockAuthContext.SignOut.mockClear();
    mockShopContext.shop = null;
    mockDBContext.data.currentUser.role = 'user';
  });

  it('renders correctly with default props', () => {
    (useTheme as Mock).mockReturnValue({theme: 'light'});

    renderWithProviders(<Header />, {route: '/', searchParams: '?page=shops'});

    // Check if essential elements are rendered
    expect(screen.getByText('Storage')).toBeInTheDocument();
    expect(screen.getByTestId('userMenuButton')).toBeInTheDocument();
    expect(screen.getByText('Shops')).toBeInTheDocument();

    // Ensure shop-specific links are not rendered when shop is null
    expect(screen.queryByText('Items')).not.toBeInTheDocument();
    expect(screen.queryByText('Parts')).not.toBeInTheDocument();
    expect(screen.queryByText('Service')).not.toBeInTheDocument();
  });

  it('renders shop-specific links when shop is defined', () => {
    (useTheme as Mock).mockReturnValue({theme: 'light'});
    mockShopContext.shop = {
      id: 'shop1',
      name: 'Shop 1',
    };

    renderWithProviders(<Header />, {route: '/', searchParams: '?page=items'});

    // Check if shop-specific links are rendered
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Parts')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('toggles dropdown menu when username is clicked', () => {
    (useTheme as Mock).mockReturnValue({theme: 'light'});

    renderWithProviders(<Header />);

    // Dropdown menu should not be visible initially
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();

    // Click on username to open dropdown
    fireEvent.click(screen.getByTestId('userMenuButton'));

    // Dropdown menu should now be visible
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls SignOut when Logout is clicked', () => {
    (useTheme as Mock).mockReturnValue({theme: 'light'});

    renderWithProviders(<Header />);

    // Open dropdown menu
    fireEvent.click(screen.getByTestId('userMenuButton'));

    fireEvent.click(screen.getByText('Logout'));

    expect(mockAuthContext.SignOut).toHaveBeenCalled();
  });

  it('calls refreshData when Update is clicked', () => {
    (useTheme as Mock).mockReturnValue({theme: 'light'});
    mockDBContext.data.currentUser.role = 'admin';

    const testArray = [
      'items',
      'parts',
      'service',
      'settings',
      'users',
      'types',
    ];
    const callArray = [
      'items',
      'parts',
      'services',
      'settings',
      'users',
      'types',
    ];

    for (let i = 0; i < testArray.length; i++) {
      const page = testArray[i];
      const {unmount} = renderWithProviders(<Header />, {
        route: '/',
        searchParams: '?page=' + page,
      });

      // Open dropdown menu
      fireEvent.click(screen.getByTestId('userMenuButton'));

      // Click on Update
      fireEvent.click(screen.getByText('Update'));

      waitFor(() =>
        expect(mockDBContext.refreshData).toHaveBeenCalledWith(callArray[i])
      );
      unmount();
    }
  });

  it('displays correct logo based on theme', () => {
    // Test for dark theme
    (useTheme as Mock).mockReturnValue({theme: 'dark'});
    const {unmount} = renderWithProviders(<Header />);
    expect(screen.getByAltText('StorageR Logo')).toHaveAttribute(
      'src',
      '/src/assets/logo_white.svg'
    );

    unmount();
    // Test for light theme
    (useTheme as Mock).mockReturnValue({theme: 'light'});
    renderWithProviders(<Header />);
    expect(screen.getByAltText('StorageR Logo')).toHaveAttribute(
      'src',
      '/src/assets/logo.svg'
    );
  });

  it('shows admin menu items when user is admin', () => {
    (useTheme as Mock).mockReturnValue({theme: 'light'});
    mockDBContext.data.currentUser.role = 'admin';

    renderWithProviders(<Header />);

    // Open dropdown menu
    fireEvent.click(screen.getByTestId('userMenuButton'));

    // Check for admin-specific menu items
    expect(screen.getByText('Types')).toBeInTheDocument();
    expect(screen.getByText('Recycle Bin')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('does not show admin menu items when user is not admin', () => {
    (useTheme as Mock).mockReturnValue({theme: 'light'});
    mockDBContext.data.currentUser.role = 'user';

    renderWithProviders(<Header />);

    // Open dropdown menu
    fireEvent.click(screen.getByTestId('userMenuButton'));

    // Admin-specific menu items should not be present
    expect(screen.queryByText('Types')).not.toBeInTheDocument();
    expect(screen.queryByText('Recycle Bin')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  it('shows Logs menu item when logging is active and user is admin', () => {
    (useTheme as Mock).mockReturnValue({theme: 'light'});
    mockDBContext.data.currentUser.role = 'admin';

    (configModule.firebaseModel.isLoggingActive as Mock).mockReturnValue(true);

    renderWithProviders(<Header />);
    fireEvent.click(screen.getByTestId('userMenuButton'));

    expect(screen.getByText('Logs')).toBeInTheDocument();
  });

  it('renders Invoices, Transactions, and Leases when shop exists and modules are enabled', () => {
    (useTheme as Mock).mockReturnValue({theme: 'light'});

    mockShopContext.shop = {
      id: 'shop1',
      name: 'Shop 1',
    };

    configModule.modules.leasing = true;
    configModule.modules.transactions = true;

    renderWithProviders(<Header />, {
      route: '/',
      searchParams: '?page=invoices',
    });

    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Leases')).toBeInTheDocument();
  });

  it('shows loading icon when update is triggered', async () => {
    (useTheme as Mock).mockReturnValue({theme: 'light'});
    mockDBContext.data.currentUser.role = 'admin';

    const {container} = renderWithProviders(<Header />, {
      route: '/',
      searchParams: '?page=settings',
    });

    fireEvent.click(screen.getByTestId('userMenuButton'));
    fireEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      const spinner = container.querySelector('svg');
      expect(spinner).toBeInTheDocument();
    });
  });
});

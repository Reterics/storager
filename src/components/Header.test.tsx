import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import Header from './Header';
import { AuthContext } from '../store/AuthContext';
import { ShopContext } from '../store/ShopContext';
import { DBContext } from '../database/DBContext';
import { vi, expect, it, describe, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useTheme } from '../store/ThemeContext';
import type {
  IAuth,
  Shop,
  ShopType,
  UserData,
} from '../interfaces/interfaces.ts';
import type { ContextData, DBContextType } from '../interfaces/firebase.ts';
import { defaultSettings } from '../../tests/mocks/shopData.ts';

// firebaseModel bits used by Header
vi.mock('../database/firebase/config', async () => {
  const actual = await vi.importActual('../database/firebase/config');
  return {
    ...actual,
    firebaseModel: {
      invalidateCache: vi.fn(),
      isLoggingActive: vi.fn().mockReturnValue(false),
    },
  };
});
import * as configModule from '../database/firebase/config';

// Theme
vi.mock('../store/ThemeContext', () => ({ useTheme: vi.fn() }));

// Spinner and PWA button
vi.mock('./elements/LoadingIcon.tsx', () => ({
  default: () => <div data-testid="loading-spinner" />,
}));
vi.mock('./elements/PWAInstallButton.tsx', () => ({
  default: (p: {
    label: string;
    className?: string;
    onInstalled?: () => void;
  }) => (
    <button
      data-testid="pwa-install"
      className={p.className}
      onClick={() => p.onInstalled?.()}
    >
      {p.label}
    </button>
  ),
}));

describe('Header', () => {
  const auth: IAuth = {
    SignOut: vi.fn(),
    user: { displayName: 'Test User', email: 't@example.com' },
  } as unknown as IAuth;

  const shopCtx: { shop: Shop | null; setShop: (s: Shop | null) => void } = {
    shop: null,
    setShop: () => {},
  };

  const dbCtx: DBContextType = {
    data: {
      currentUser: { role: 'user' } as UserData,
      settings: { ...defaultSettings },
    } as unknown as ContextData,
    refreshData: vi.fn().mockResolvedValue(undefined),
  } as unknown as DBContextType;

  const renderUI = (route = '/', search = '') =>
    render(
      <MemoryRouter initialEntries={[route + search]}>
        <AuthContext.Provider value={auth}>
          <ShopContext.Provider
            value={
              shopCtx as {
                shop: Shop | null;
                setShop: (shop: Shop | null) => void;
              }
            }
          >
            <DBContext.Provider value={dbCtx as unknown as DBContextType}>
              <Header />
            </DBContext.Provider>
          </ShopContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );

  beforeEach(() => {
    vi.clearAllMocks();
    (useTheme as unknown as Mock).mockReturnValue({ theme: 'light' });
    auth.SignOut = vi.fn();
    shopCtx.shop = null;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    dbCtx.data.currentUser.role = 'user';
    dbCtx.data.settings = {
      ...defaultSettings,
      enableLeasing: false,
      enableTransactions: false,
      enableLogs: true,
    };
  });

  it('renders base header and switches logo by theme', () => {
    renderUI('/', '?page=shops');
    expect(screen.getByAltText('StorageR Logo')).toHaveAttribute(
      'src',
      '/src/assets/logo.svg',
    );

    (useTheme as unknown as Mock).mockReturnValue({ theme: 'dark' });
    renderUI('/', '?page=shops'); // re-render separate tree
    expect(screen.getAllByAltText('StorageR Logo').at(-1)).toHaveAttribute(
      'src',
      '/src/assets/logo_white.svg',
    );
  });

  it('dropdown toggles and logout triggers SignOut', () => {
    renderUI();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('userMenuButton'));
    expect(screen.getByText('Logout')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Logout'));
    expect(auth.SignOut).toHaveBeenCalledTimes(1);
  });

  it('PWA install button fires onInstalled and closes dropdown', () => {
    renderUI();
    fireEvent.click(screen.getByTestId('userMenuButton'));
    fireEvent.click(screen.getByTestId('pwa-install'));
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('mobile navbar opens, closes via overlay click & document click-outside', async () => {
    renderUI();

    const toggle = screen.getByRole('button', { name: /open main menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // open
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // overlay click (overlay is sibling fixed div with semi bg)
    const overlay = document.querySelector('.bg-opacity-50') as Element | null;
    expect(overlay).toBeTruthy();
    fireEvent.click(overlay!);

    await waitFor(() =>
      expect(toggle).toHaveAttribute('aria-expanded', 'false'),
    );

    // open again and close via document mousedown (click-outside)
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.mouseDown(document);
    await waitFor(() =>
      expect(toggle).toHaveAttribute('aria-expanded', 'false'),
    );
  });

  it('desktop shows Shops; clicking mobile Shops uses handleLinkClick to close menus', () => {
    renderUI();
    // open both
    fireEvent.click(screen.getByTestId('userMenuButton'));
    const toggle = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(toggle);
    // choose the mobile copy of Shops (last occurrence)
    const shopsLinks = screen.getAllByText('Shops');
    fireEvent.click(shopsLinks.at(-1)!);
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it.each([
    ['items', 'Items'],
    ['parts', 'Parts'],
    ['service', 'Service'],
    ['invoices', 'Invoices'],
    ['leases', 'Leases', { enableLeasing: true }],
    ['transactions', 'Transactions', { enableTransactions: true }],
  ] as const)(
    'mobile link renders and is marked active for page "%s"',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    (page, label, flags) => {
      // enable flags if required
      if (flags) dbCtx.data.settings = { ...dbCtx.data.settings, ...flags };
      // need a selected shop for these to appear
      shopCtx.shop = { id: 's1', name: 'Shop 1' } as ShopType;

      renderUI('/', `?page=${page}`);

      // open mobile
      const toggle = screen.getByRole('button', { name: /open main menu/i });
      fireEvent.click(toggle);

      // the mobile grid contains the label
      const link = screen.getAllByText(label).at(-1)!;
      expect(link).toBeInTheDocument();

      // active class for the selected page (checks a distinctive token to avoid brittle full-class asserts)
      const parent = link.closest('a')!;
      if (
        page === 'items' ||
        page === 'parts' ||
        page === 'service' ||
        page === 'invoices' ||
        page === 'leases' ||
        page === 'transactions'
      ) {
        expect(parent.className).toMatch(/rounded-lg/);
        if (page) {
          // active path uses bg-gray-200 OR dark:bg-gray-700
          expect(parent.className).toMatch(/bg-gray-200|dark:bg-gray-700/);
        }
      }

      // clicking a mobile link closes the navbar (handleLinkClick)
      fireEvent.click(parent);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    },
  );

  it('admin section visibility toggles with role and logs flag', () => {
    // not admin
    const { unmount } = renderUI('/', '?page=shops');
    fireEvent.click(screen.getByTestId('userMenuButton'));
    expect(screen.queryByText('Types')).not.toBeInTheDocument();
    unmount();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    dbCtx.data.currentUser.role = 'admin';
    (configModule.firebaseModel.isLoggingActive as Mock).mockReturnValue(true);
    dbCtx.data.settings.enableLogs = true;

    const r2 = renderUI('/', '?page=shops');
    fireEvent.click(r2.getByTestId('userMenuButton'));
    expect(r2.getByText('Types')).toBeInTheDocument();
    expect(r2.getByText('Recycle Bin')).toBeInTheDocument();
    expect(r2.getByText('Settings')).toBeInTheDocument();
    expect(r2.getByText('Users')).toBeInTheDocument();
    expect(r2.getByText('Logs')).toBeInTheDocument();
    r2.unmount();

    // logs off
    dbCtx.data.settings.enableLogs = false;
    const r3 = renderUI('/', '?page=shops');
    fireEvent.click(r3.getByTestId('userMenuButton'));
    expect(r3.queryByText('Logs')).not.toBeInTheDocument();
    r3.unmount();
  });

  it('Update triggers correct refresh per page and shows loading', async () => {
    const cases: Array<{ page: string; calls: string[] }> = [
      { page: 'items', calls: ['items', 'users'] },
      { page: 'parts', calls: ['parts', 'users'] },
      { page: 'settings', calls: ['settings'] },
      { page: 'users', calls: ['users'] },
      { page: 'types', calls: ['types'] },
    ];

    for (const c of cases) {
      const { unmount } = renderUI('/', `?page=${c.page}`);
      fireEvent.click(screen.getByTestId('userMenuButton'));
      fireEvent.click(screen.getByText('Update'));

      await waitFor(() =>
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument(),
      );
      await waitFor(() =>
        c.calls.forEach((arg) =>
          expect(dbCtx.refreshData).toHaveBeenCalledWith(arg),
        ),
      );

      unmount();
      (dbCtx.refreshData as Mock).mockClear();
    }
  });

  it('service & recycle: invalidates caches and refreshes users', async () => {
    const keys = [
      'deleted',
      'archive',
      'services',
      'leaseCompletions',
      'completions',
    ];

    for (const page of ['service', 'recycle']) {
      const { unmount } = renderUI('/', `?page=${page}`);
      fireEvent.click(screen.getByTestId('userMenuButton'));
      fireEvent.click(screen.getByText('Update'));

      await waitFor(() => {
        keys.forEach((k) =>
          expect(
            configModule.firebaseModel.invalidateCache,
          ).toHaveBeenCalledWith(k),
        );
        expect(dbCtx.refreshData).toHaveBeenCalledWith();
      });

      unmount();
      (dbCtx.refreshData as Mock).mockClear();
      (configModule.firebaseModel.invalidateCache as Mock).mockClear();
    }
  });

  it('renders Admin block (mobile) and each link closes the drawer (Types, Recycle Bin, Settings, Logs, Users)', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    dbCtx.data.currentUser.role = 'admin';
    (configModule.firebaseModel.isLoggingActive as Mock).mockReturnValue(true);
    dbCtx.data.settings.enableLogs = true;

    const { unmount } = renderUI('/', '?page=shops');

    const toggle = screen.getByRole('button', { name: /open main menu/i });
    const openDrawer = () => {
      if (toggle.getAttribute('aria-expanded') === 'false')
        fireEvent.click(toggle);
    };

    // open once and assert Admin section is present
    openDrawer();
    expect(screen.getByText('Admin')).toBeInTheDocument();

    // The admin panel lives in the right-side drawer
    const getDrawer = () =>
      document.querySelector('.fixed.inset-y-0.right-0') as Element;

    // Cover each admin link; after each click, the drawer should close
    const adminLabels = [
      'Types',
      'Recycle Bin',
      'Settings',
      'Logs',
      'Users',
    ] as const;

    for (const label of adminLabels) {
      openDrawer(); // reopen if previous click closed it
      const drawer = getDrawer();
      expect(drawer).toBeTruthy();

      const link = within(drawer as HTMLElement).getByRole('link', {
        name: label,
      });
      fireEvent.click(link);

      await waitFor(() =>
        expect(toggle).toHaveAttribute('aria-expanded', 'false'),
      );
    }

    unmount();
  });

  // Additional tests appended for coverage of specific branches
  it('loading header shows proper logo per theme', async () => {
    const { unmount } = renderUI('/', '?page=items');
    // dark theme -> white logo in loading state
    (useTheme as unknown as Mock).mockReturnValue({ theme: 'dark' });
    fireEvent.click(screen.getByTestId('userMenuButton'));
    fireEvent.click(screen.getByText('Update'));
    await waitFor(() =>
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument(),
    );
    const img1 = screen.getByAltText('StorageR Logo');
    expect(img1).toHaveAttribute('src', '/src/assets/logo_white.svg');
    unmount();

    // light theme -> normal logo in loading state
    (useTheme as unknown as Mock).mockReturnValue({ theme: 'light' });
    renderUI('/', '?page=items');
    fireEvent.click(screen.getByTestId('userMenuButton'));
    fireEvent.click(screen.getByText('Update'));
    await waitFor(() =>
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument(),
    );
    const img2 = screen.getByAltText('StorageR Logo');
    expect(img2).toHaveAttribute('src', '/src/assets/logo.svg');
  });

  it('Leases/Transactions links have inactive styles when not active', () => {
    // enable features and have a shop so links render
    shopCtx.shop = { id: 's1', name: 'Shop 1' } as ShopType;
    dbCtx.data.settings = {
      ...dbCtx.data.settings,
      enableLeasing: true,
      enableTransactions: true,
    };

    renderUI('/', '?page=service');

    // open mobile drawer
    const toggle = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(toggle);

    // find links and assert they use the inactive style branch (hover:bg... or text-gray-700)
    const leases = screen.getAllByText('Leases').at(-1)!;
    const leasesA = leases.closest('a')!;
    expect(leasesA.className).toMatch(/hover:bg-gray-100|text-gray-700/);

    const tx = screen.getAllByText('Transactions').at(-1)!;
    const txA = tx.closest('a')!;
    expect(txA.className).toMatch(/hover:bg-gray-100|text-gray-700/);
  });
});

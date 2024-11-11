import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import Header from './Header';
import { AuthContext } from '../store/AuthContext';
import { ShopContext } from '../store/ShopContext';
import { DBContext } from '../database/DBContext';
import {vi, expect, it, describe, Mock, beforeEach} from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useTheme } from '../store/ThemeContext';
import {IAuth, Shop} from "../interfaces/interfaces.ts";
import {DBContextType} from "../interfaces/firebase.ts";


// Mock useTheme
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
        setShop: ()=> {},
    } as {
        shop: Shop|null,
        setShop: () => void
    };

    const mockDBContext = {
        data: {
            currentUser: {
                role: 'user',
            },
        },
        refreshData: vi.fn(),
    };

    // Helper function to render with providers
    const renderWithProviders = (
        ui: React.ReactElement,
        { route = '/', searchParams = '' } = {}) => {
        window.history.pushState({}, 'Test page', route + searchParams);

        return render(
            <MemoryRouter initialEntries={[route + searchParams]}>
                <AuthContext.Provider value={mockAuthContext as unknown as IAuth}>
                    <ShopContext.Provider value={mockShopContext}>
                        <DBContext.Provider value={mockDBContext as unknown as DBContextType}>
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
        (useTheme as Mock).mockReturnValue({ theme: 'light' });

        renderWithProviders(<Header />, { route: '/', searchParams: '?page=shops' });

        // Check if essential elements are rendered
        expect(screen.getByText('Storage')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Shops')).toBeInTheDocument();

        // Ensure shop-specific links are not rendered when shop is null
        expect(screen.queryByText('Items')).not.toBeInTheDocument();
        expect(screen.queryByText('Parts')).not.toBeInTheDocument();
        expect(screen.queryByText('Service')).not.toBeInTheDocument();
    });

    it('renders shop-specific links when shop is defined', () => {
        (useTheme as Mock).mockReturnValue({ theme: 'light' });
        mockShopContext.shop = {
            id: 'shop1',
            name: 'Shop 1',
        };

        renderWithProviders(<Header />, { route: '/', searchParams: '?page=items' });

        // Check if shop-specific links are rendered
        expect(screen.getByText('Items')).toBeInTheDocument();
        expect(screen.getByText('Parts')).toBeInTheDocument();
        expect(screen.getByText('Service')).toBeInTheDocument();
    });

    it('toggles dropdown menu when username is clicked', () => {
        (useTheme as Mock).mockReturnValue({ theme: 'light' });

        renderWithProviders(<Header />);

        // Dropdown menu should not be visible initially
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();

        // Click on username to open dropdown
        fireEvent.click(screen.getByText('Test User'));

        // Dropdown menu should now be visible
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('calls SignOut when Logout is clicked', () => {
        (useTheme as Mock).mockReturnValue({ theme: 'light' });

        renderWithProviders(<Header />);

        // Open dropdown menu
        fireEvent.click(screen.getByText('Test User'));

        fireEvent.click(screen.getByText('Logout'));

        expect(mockAuthContext.SignOut).toHaveBeenCalled();
    });

    it('calls refreshData when Update is clicked', () => {
        (useTheme as Mock).mockReturnValue({ theme: 'light' });
        mockDBContext.data.currentUser.role = 'admin';

        const testArray = ['items', 'parts', 'service', 'settings', 'users', 'types'];
        const callArray = ['items', 'parts', 'services', 'settings', 'users', 'types'];

        for(let i = 0; i < testArray.length; i++) {
            const page = testArray[i];
            const {unmount} = renderWithProviders(<Header />, { route: '/', searchParams: '?page=' + page });

            // Open dropdown menu
            fireEvent.click(screen.getByText('Test User'));

            // Click on Update
            fireEvent.click(screen.getByText('Update'));

            expect(mockDBContext.refreshData).toHaveBeenCalledWith(callArray[i]);
            unmount();
        }

    });

    it('toggles navbar when menu button is clicked', () => {
        (useTheme as Mock).mockReturnValue({ theme: 'light' });

        renderWithProviders(<Header />);

        // Menu should be hidden initially
        expect(screen.getAllByRole('navigation')[1]).toHaveClass('hidden', { exact: false });

        // Click on menu button
        const menuButton = screen.getByText('Open main menu');
        fireEvent.click(menuButton);

        // Menu should now be visible
        expect(screen.getAllByRole('navigation')[1]).not.toHaveClass('hidden', { exact: false });
    });

    it('displays correct logo based on theme', () => {
        // Test for dark theme
        (useTheme as Mock).mockReturnValue({ theme: 'dark' });
        const {unmount} = renderWithProviders(<Header />);
        expect(screen.getByAltText('StorageR Logo')).toHaveAttribute('src', '/src/assets/logo_white.svg');

        unmount();
        // Test for light theme
        (useTheme as Mock).mockReturnValue({ theme: 'light' });
        renderWithProviders(<Header />);
        expect(screen.getByAltText('StorageR Logo')).toHaveAttribute('src', '/src/assets/logo.svg');
    });

    it('shows admin menu items when user is admin', () => {
        (useTheme as Mock).mockReturnValue({ theme: 'light' });
        mockDBContext.data.currentUser.role = 'admin';

        renderWithProviders(<Header />);

        // Open dropdown menu
        fireEvent.click(screen.getByText('Test User'));

        // Check for admin-specific menu items
        expect(screen.getByText('Types')).toBeInTheDocument();
        expect(screen.getByText('Recycle Bin')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('does not show admin menu items when user is not admin', () => {
        (useTheme as Mock).mockReturnValue({ theme: 'light' });
        mockDBContext.data.currentUser.role = 'user';

        renderWithProviders(<Header />);

        // Open dropdown menu
        fireEvent.click(screen.getByText('Test User'));

        // Admin-specific menu items should not be present
        expect(screen.queryByText('Types')).not.toBeInTheDocument();
        expect(screen.queryByText('Recycle Bin')).not.toBeInTheDocument();
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();
        expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });
});

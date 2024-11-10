import {render, screen, fireEvent} from '@testing-library/react';
import ShopModal from './ShopModal';
import { GeoPoint } from 'firebase/firestore';
import { describe, it, expect, vi } from 'vitest';

describe('ShopModal', () => {
    const mockShop = {
        id: '1',
        name: 'Test Shop',
        coordinates: new GeoPoint(40.7128, -74.006),
        phone: '123-456-7890',
        address: '123 Test St',
        email: 'test@example.com',
    };
    const onClose = vi.fn();
    const onSave = vi.fn();
    const setShop = vi.fn();
    const inPlace = false;

    it('renders without crashing when shop is null', () => {
        const { container } = render(<ShopModal shop={null} onClose={onClose} onSave={onSave} setShop={setShop} inPlace={inPlace} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders correctly with shop data', () => {
        render(<ShopModal shop={mockShop} onClose={onClose} onSave={onSave} setShop={setShop} inPlace={inPlace} />);
        expect(screen.getByLabelText('Name')).toHaveValue(mockShop.name);
        expect(screen.getByLabelText('Coordinates')).toHaveValue('40.7128 -74.006');
        expect(screen.getByLabelText('Phone')).toHaveValue(mockShop.phone);
        expect(screen.getByLabelText('Address')).toHaveValue(mockShop.address);
        expect(screen.getByLabelText('Email')).toHaveValue(mockShop.email);
    });

    it('calls onClose when Cancel button is clicked', () => {
        onClose.mockReset();
        render(<ShopModal shop={mockShop} onClose={onClose} onSave={onSave} setShop={setShop} inPlace={inPlace} />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSave with updated shop data when Save button is clicked', () => {
        onSave.mockReset();
        render(<ShopModal shop={mockShop} onClose={onClose} onSave={onSave} setShop={setShop} inPlace={inPlace} />);
        fireEvent.click(screen.getByText('Save'));
        expect(onSave).toHaveBeenCalledWith(mockShop);
    });

    it('updates shop name on input change', () => {
        setShop.mockReset();
        render(<ShopModal shop={mockShop} onClose={onClose} onSave={onSave} setShop={setShop} inPlace={inPlace} />);

        const nameInput = screen.getByLabelText('Name');
        fireEvent.change(nameInput, { target: { value: 'New Shop Name' } });
        expect(setShop).toHaveBeenCalledWith({ ...mockShop, name: 'New Shop Name' });

        const phoneInput = screen.getByLabelText('Phone');
        fireEvent.change(phoneInput, { target: { value: '0630666666' } });
        expect(setShop).toHaveBeenCalledWith({ ...mockShop, phone: '0630666666' });

        const addressInput = screen.getByLabelText('Address');
        fireEvent.change(addressInput, { target: { value: 'Address' } });
        expect(setShop).toHaveBeenCalledWith({ ...mockShop, address: 'Address' });

        const emailInput = screen.getByLabelText('Email');
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        expect(setShop).toHaveBeenCalledWith({ ...mockShop, email: 'test@test.com' });
    });

    it('updates shop coordinates on valid coordinate input', () => {
        setShop.mockReset();
        render(<ShopModal shop={mockShop} onClose={onClose} onSave={onSave} setShop={setShop} inPlace={inPlace} />);

        const coordinatesInput = screen.getByLabelText('Coordinates');
        fireEvent.change(coordinatesInput, { target: { value: '34.0522 -118.2437' } });
        expect(setShop).toHaveBeenCalledWith({
            ...mockShop,
            coordinates: new GeoPoint(34.0522, -118.2437),
        });
        fireEvent.change(coordinatesInput, { target: { value: '-34.0522 11.2437' } });
        expect(setShop).toHaveBeenCalledWith({
            ...mockShop,
            coordinates: new GeoPoint(-34.0522, 11.2437),
        });
        fireEvent.change(coordinatesInput, { target: { value: '34.0522 11.2437' } });
        expect(setShop).toHaveBeenCalledWith({
            ...mockShop,
            coordinates: new GeoPoint(34.0522, 11.2437),
        });
        fireEvent.change(coordinatesInput, { target: { value: '' } });
        expect(setShop).toHaveBeenCalledWith({
            ...mockShop,
            coordinates: undefined,
        });
        setShop.mockReset();
        fireEvent.change(coordinatesInput, { target: { value: 'd34.0522 11.2437' } });
        expect(setShop).toHaveBeenCalledTimes(0);
    });

});

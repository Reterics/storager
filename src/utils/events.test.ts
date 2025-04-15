import { describe, it, expect, vi } from 'vitest';
import { changeStoreType } from './events';
import { StoreItem, StorePart } from '../interfaces/interfaces';
import { getShopIndex } from './storage';

vi.mock('./storage', () => ({
    getShopIndex: vi.fn(),
}));

describe('changeStoreType', () => {
    it('should return null if item is null', () => {
        const result = changeStoreType(
            { currentTarget: { value: 'newValue' } } as React.ChangeEvent<HTMLInputElement>,
            'key',
            null
        );
        expect(result).toBeNull();
    });

    it('should update a non-special key in the item', () => {
        const item: StoreItem = { id: '1', name: 'itemName' };
        const result = changeStoreType(
            { currentTarget: { value: 'newValue' } } as React.ChangeEvent<HTMLInputElement>,
            'name',
            item
        );
        expect(result).toEqual({ id: '1', name: 'newValue' });
    });

    it('should set storage_limit as an array with the new value at the correct index', () => {
        const item: StorePart = { id: '2', storage_limit: [] };
        const key = 'storage_limit';
        vi.mocked(getShopIndex).mockReturnValue(0);

        const result = changeStoreType(
            { currentTarget: { value: 'limitValue' } } as React.ChangeEvent<HTMLInputElement>,
            key,
            item,
            'shop123'
        );

        expect(getShopIndex).toHaveBeenCalledWith(item, 'shop123');
        expect(result).toEqual({ id: '2', storage_limit: ['limitValue'] });
    });

    it('should set shop_id as an array with the new value at the correct index', () => {
        const item: StorePart = { id: '3', shop_id: ['existingShopId'] };
        const key = 'shop_id';
        vi.mocked(getShopIndex).mockReturnValue(0);

        const result = changeStoreType(
            { currentTarget: { value: 'newShopId' } } as React.ChangeEvent<HTMLInputElement>,
            key,
            item,
            'shop123'
        );

        expect(getShopIndex).toHaveBeenCalledWith(item, 'shop123');
        expect(result).toEqual({ id: '3', shop_id: ['newShopId'] });
    });

    it('should add the value to an existing array if shopIndex is valid', () => {
        const item: StorePart = { id: '4', storage: ['oldValue' as unknown as number] };
        const key = 'storage';
        vi.mocked(getShopIndex).mockReturnValue(0);

        const result = changeStoreType(
            { currentTarget: { value: 'newValue' } } as React.ChangeEvent<HTMLInputElement>,
            key,
            item,
            'shop456'
        );

        expect(getShopIndex).toHaveBeenCalledWith(item, 'shop456');
        expect(result).toEqual({ id: '4', storage: ['newValue'] });
    });

    it('should initialize storage array and set value if storage is not an array', () => {
        const item: StorePart = { id: '5', storage: 'singleValue' } as unknown as StorePart;
        const key = 'storage';
        vi.mocked(getShopIndex).mockReturnValue(0);

        const result = changeStoreType(
            { currentTarget: { value: 'newArrayValue' } } as React.ChangeEvent<HTMLInputElement>,
            key,
            item,
            'shop789'
        );

        expect(getShopIndex).toHaveBeenCalledWith(item, 'shop789');
        expect(result).toEqual({ id: '5', storage: ['newArrayValue'] });
    });
});

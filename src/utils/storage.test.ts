import {describe, expect, it} from "vitest";
import {extractStorageInfo, sortItemsByWarn} from "./storage.ts";
import {defaultItems} from "../../tests/mocks/shopData.ts";


describe('Storage Utils', () => {

    it('Should extract Storage info properly', () => {
        let extractedData = extractStorageInfo({
            id: '1',
            shop_id: ['0', '1'],
            storage: [1, 2],
            storage_limit: [1, 2],
        }, '1');

        expect(extractedData).toStrictEqual({
            shopIndex: 1,
            storage: 2,
            storageLimit: 2,
            lowStorageAlert: false
        });

        extractedData = extractStorageInfo({
            id: '1',
            shop_id: ['0', '1'],
            storage: [5, 1],
            storage_limit: [1, 13],
        }, '1');

        expect(extractedData).toStrictEqual({
            shopIndex: 1,
            storage: 1,
            storageLimit: 13,
            lowStorageAlert: true
        })

        extractedData = extractStorageInfo({
            id: '1',
            shop_id: ['0', '22', '1'],
            storage: [5],
            storage_limit: [1],
        }, '1');

        expect(extractedData).toStrictEqual({
            shopIndex: 2,
            storage: 0,
            storageLimit: 5,
            lowStorageAlert: true
        })
    });

    it('Should sort items by warnings properly', () => {
        const itemList = [
            ...defaultItems,
            {
                id: 'test_1',
                shop_id: ['1'],
                storage: [5],
                storage_limit: [2],
            },
            {
                id: 'test_2',
                shop_id: ['1'],
                storage: [11],
                storage_limit: [12],
            },
            {
                id: 'test_3',
                shop_id: ['1'],
                storage: [5],
                storage_limit: [6],
            },
            {
                id: 'test_4',
                shop_id: ['1'],
                storage: [0],
                storage_limit: [0],
            },
            {
                id: 'test_5',
                shop_id: ['1'],
                storage: [],
                storage_limit: [],
            }
        ]

        const warnings = sortItemsByWarn(itemList, '1');

        expect(warnings).toEqual([ 'test_2', 'test_3', 'test_5' ]);
        expect(itemList[0].id).toEqual('test_2');
        expect(itemList[1].id).toEqual('test_3');
        expect(itemList[2].id).toEqual('test_5');
        expect(itemList[3].id).toEqual(defaultItems[0].id);
        expect(itemList[4].id).toEqual(defaultItems[1].id);
        expect(itemList[5].id).toEqual('test_1');
        expect(itemList[6].id).toEqual('test_4');
    });
});

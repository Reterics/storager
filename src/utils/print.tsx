import {ServiceData, SettingsItems} from "../interfaces/interfaces.ts";
import {PDFData} from "../interfaces/pdf.ts";


export const serviceDataToPrintable = (item: ServiceData, settings: SettingsItems, t: (n: string)=>string, printNow = true): {
        data: PDFData,
        signature?: string,
        printNow?: boolean
} | null => {
    return {
            printNow: printNow,
            data: [
                    {'': t('Client')},
                    [{[t('Name')]: item.client_name || ''}],
                    [{[t('Phone')]: item.client_phone || ''}],
                    [{[t('Email')]: item.client_email || ''}],

                    {'': t('Recipient')},
                    [{[t('Name')]: item.service_name || ''}],
                    [{[t('Phone')]: item.service_address || ''}],
                    [{[t('Email')]: item.service_email || ''}],

                    {'': t('Item and service details')},
                    [{[t('Type')]: ((item.type || '')?.split(',').join(', '))}],
                    [{[t('Description')]: item.description || ''}],
                    [{[t('status')]: t(item.serviceStatus || 'status_accepted')}],
                    [{[t('Guaranteed')]: item.guaranteed || ''}],
                    [{[t('Accessories')]: item.accessories || ''}],
                    [{[t('Repair Description')]: item.repair_description || ''}],
                    [{[t('Expected cost')]: item.expected_cost + ' HUF'}],
                    [{[t('Note')]: item.note || ''}],
                    [],
                    settings?.serviceAgreement || '',
                    [],
                    [{[t('Date')]: item.date || ''}],

                    /*[{ Name: item.client_name }, { Phone: '0630555555' }],
                    [{ Address: '7474 New York' }],
                    {'': 'Recipient'},
                    ['Content'],*/
            ], signature: item.signature
    }
}

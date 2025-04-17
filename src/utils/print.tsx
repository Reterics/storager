import {
  ServiceCompleteData,
  ServiceData,
  SettingsItems,
} from '../interfaces/interfaces.ts';
import {PDFData} from '../interfaces/pdf.ts';

export interface PrintableDataProps {
  data: PDFData;
  signature?: string;
  printNow?: boolean;
}

export const serviceDataToPrintable = (
  item: ServiceData,
  settings: SettingsItems,
  t: (n: string) => string,
  printNow = true
): PrintableDataProps | null => {
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
      [{[t('Type')]: (item.type || '')?.split(',').join(', ')}],
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
    ],
    signature: item.signature,
  };
};

export const completionFormToPrintable = (
  item: ServiceCompleteData,
  t: (n: string) => string,
  printNow = true
): PrintableDataProps | null => {
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
      [{[t('Type')]: (item.type || '')?.split(',').join(', ')}],
      [{[t('Description')]: item.description || ''}],
      [{[t('Guaranteed')]: item.guaranteed || ''}],
      [{[t('Accessories')]: item.accessories || ''}],
      [{[t('Repair Description')]: item.repair_description || ''}],
      [{[t('Repair Cost')]: item.repair_cost + ' HUF'}],
      [],
      [{[t('Date')]: item.date || ''}],
    ],
    signature: item.signature ? item.signature : undefined,
  };
};

export const formatChanges = (changes: {
  [key: string]: {from: string; to: string};
}) => {
  const entries = Object.entries(changes);

  return entries.map(([field, {from, to}]) => (
    <div key={field}>
      <strong>{capitalize(field)}</strong>: {from} → {to}
    </div>
  ));
};

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

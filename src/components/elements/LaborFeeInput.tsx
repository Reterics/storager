import { confirm, popup } from '../modalExporter.ts';
import type { Transaction } from '../../interfaces/interfaces.ts';
import { BsFloppy } from 'react-icons/bs';
import { useContext, useState } from 'react';
import { DBContext } from '../../database/DBContext.ts';
import { useTranslation } from 'react-i18next';
import { ShopContext } from '../../store/ShopContext.tsx';

export default function LaborFeeInput() {
  const dbContext = useContext(DBContext);
  const shopContext = useContext(ShopContext);
  const [laborFee, setLaborFee] = useState<string>('');
  const { t } = useTranslation();
  const selectedShopId = shopContext.shop?.id as string;

  return (
    <div className="flex max-w-32">
      <input
        value={laborFee}
        onChange={(e) => setLaborFee(e.target.value)}
        type="text"
        data-testid="laborFee"
        className="block w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-l-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        placeholder={t('Labor Fee')}
      />
      <button
        onClick={async () => {
          const laborFeeNumeric = Number.parseInt(laborFee);
          if (Number.isNaN(laborFeeNumeric) || laborFee.trim() === '') {
            return void popup(t('Please provide a valid number for labor fee'));
          }
          const response = await confirm(
            <div>
              {t('Are you sure to save the following labor fee?')}
              <br />
              {laborFeeNumeric} Ft
            </div>,
          );

          if (response) {
            const netPrice = Math.round(laborFeeNumeric / 1.27);

            dbContext?.setData('transactions', {
              net_amount: netPrice,
              cost: netPrice,
              gross_amount: laborFeeNumeric,
              item_type: 'other',
              payment_method: 'cash',
              document_type: 'receipt',
              transaction_type: 'labor',
              user: dbContext?.data.currentUser?.email,
              shop_id: [selectedShopId],
            } as Transaction);
          }
        }}
        type="button"
        data-testid="laborFeeButton"
        className="px-2.5 py-2 text-gray-800 bg-white hover:bg-gray-100 border-y border-r border-gray-300 rounded-r-md focus:ring-2 focus:ring-gray-800 focus:outline-none"
      >
        <BsFloppy size={18} />
      </button>
    </div>
  );
}

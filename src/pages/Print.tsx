import {useSearchParams} from 'react-router-dom';
import {useContext, useEffect, useState} from 'react';
import {DBContext} from '../database/DBContext.ts';
import {useTranslation} from 'react-i18next';
import {PrintableDataProps} from '../utils/print.tsx';
import {getPrintableData} from '../utils/printViewHandler.ts';
import PrintableVersionFrame from '../components/modals/PrintableVersionFrame.tsx';

function Print() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const docType = searchParams.get('type') ?? undefined;
  const print = searchParams.get('print') === 'true';

  const dbContext = useContext(DBContext);
  const {t} = useTranslation();

  const [printViewData, setPrintViewData] = useState<PrintableDataProps | null>(
    null
  );

  useEffect(() => {
    if (id && docType && dbContext?.data) {
      setPrintViewData(getPrintableData(dbContext, id, t, docType, print));
    } else {
      setPrintViewData(null);
    }
  }, [id, docType, dbContext?.data, t, dbContext, print]);

  if (printViewData) {
    return (
      <PrintableVersionFrame formData={printViewData}></PrintableVersionFrame>
    );
  }

  return null;
}

export default Print;

import { PageHead } from '../components/elements/PageHead.tsx';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import { useContext, useEffect, useRef, useState } from 'react';
import { DBContext } from '../database/DBContext.ts';
import { useTranslation } from 'react-i18next';
import SignaturePad from 'react-signature-pad-wrapper';

function ServiceReceipt() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const firebaseContext = useContext(DBContext);
  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [servicedItems] = useState<unknown[]>([]);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editMode, setEditMode] = useState(false);

  const index = 1;
  const date = new Date();

  const signaturePadRef = useRef<SignaturePad>(null);

  useEffect(() => {
    if (signaturePadRef.current) {
      const signaturePad = signaturePadRef.current;
      signaturePad.clear();
      signaturePad.isEmpty();

      signaturePad.minWidth = 5;
      signaturePad.maxWidth = 10;
      signaturePad.penColor = 'rgb(66, 133, 244)';
      signaturePad.dotSize = 1;
    }
  }, []);

  return (
    <>
      <PageHead
        title={t('ServiceReceipt')}
        buttons={[
          {
            value: <BsFillPlusCircleFill />,
            onClick: () => console.log('To be implemented'),
          },
        ]}
      />

      <div>
        Number: {String(index).padStart(6, '0')}
        Date: {date.toLocaleString()}
        <h3>Client</h3>
        Name: Phone: Email:
        <h3>Service</h3>
        Name: Address: Email:
        <h3>Item and service details</h3>
        Type: Description: Received Accessories: Guaranteed: Repair description:
        Expected cost: Note:
        <p>Appendix</p>
        Signature box
        <SignaturePad
          ref={signaturePadRef}
          redrawOnResize
          options={{ minWidth: 5, maxWidth: 10, penColor: 'rgb(66, 133, 244)' }}
        />
        Download PDF button
      </div>
    </>
  );
}

export default ServiceReceipt;

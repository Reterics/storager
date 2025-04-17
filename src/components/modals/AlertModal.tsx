import React from 'react';
import GeneralModal from './GeneralModal';
import {GeneralModalButtons} from '../../interfaces/interfaces';
import {useTranslation} from 'react-i18next';

export interface AlertModalProps {
  title?: string;
  children?: string | React.ReactNode;
  closeLabel?: string;
  onClose?: () => void;
  inPlace?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
  title,
  children,
  closeLabel,
  onClose,
  inPlace = false,
}) => {
  const {t} = useTranslation();

  const buttons: GeneralModalButtons[] = [
    {
      value: closeLabel || t('OK'),
      onClick: () => onClose?.(),
      primary: true,
    },
  ];

  return (
    <GeneralModal
      title={title || t('Alert')}
      buttons={buttons}
      inPlace={inPlace}
      id='AlertModal'
    >
      <div className='text-md p-2 dark:text-white text-gray-800'>
        {children || t('Something happened.')}
      </div>
    </GeneralModal>
  );
};

export default AlertModal;

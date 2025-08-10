import React from 'react';
import GeneralModal from './GeneralModal';
import type { GeneralModalButtons } from '../../interfaces/interfaces';
import { useTranslation } from 'react-i18next';

export interface ConfirmModalProps<R = boolean> {
  title?: string;
  children?: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onClose?: () => void;
  onSave?: (result: R) => void | Promise<void>;
  inPlace?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  children,
  confirmLabel,
  cancelLabel,
  onClose,
  onSave,
  inPlace = false,
}) => {
  const { t } = useTranslation();

  const buttons: GeneralModalButtons[] = [
    {
      value: confirmLabel || t('Yes'),
      primary: true,
      onClick: () => onSave?.(true),
    },
    {
      value: cancelLabel || t('Cancel'),
      onClick: () => onClose?.(),
    },
  ];

  return (
    <GeneralModal
      title={title || t('Confirmation')}
      buttons={buttons}
      inPlace={inPlace}
      id="ConfirmModal"
    >
      <div className="text-md p-2 dark:text-white text-gray-800">
        {children || t('Are you sure?')}
      </div>
    </GeneralModal>
  );
};

export default ConfirmModal;

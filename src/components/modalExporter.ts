import type React from 'react';
import mountComponent from './mounter.tsx';
import AlertModal from './modals/AlertModal.tsx';
import ConfirmModal from './modals/ConfirmModal.tsx';

export const popup = (
  children: React.ReactNode,
  options?: { title?: string; closeLabel?: string },
) => {
  return mountComponent(AlertModal, {
    ...options,
    children: children,
  });
};

export const confirm = (
  children: React.ReactNode,
  options?: { confirmMessage?: string; cancelMessage?: string },
) => {
  return mountComponent(ConfirmModal, {
    ...options,
    children: children,
  });
};

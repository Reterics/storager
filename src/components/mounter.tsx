import React from 'react';
import { createRoot } from 'react-dom/client';

const mountComponent = <P, R = boolean>(
  Component: React.ComponentType<
    P & { onClose?: () => void; onSave?: (result: R) => void | Promise<void> }
  >,
  props?: Partial<
    P & {
      onClose?: () => void;
      onSave?: (result: unknown) => void | Promise<void>;
    }
  >,
): Promise<R> =>
  new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = () => {
      root.unmount();
      container.remove();
    };

    const handleClose = () => {
      if (typeof props?.onClose === 'function') {
        props?.onClose();
      }
      resolve(false as R);
      cleanup();
    };

    const onSave = (result: R) => {
      const response = props?.onSave?.(result);
      if (response && typeof response.finally === 'function') {
        return response.finally(() => {
          resolve(result);
          cleanup();
        });
      }
      resolve(result);
      cleanup();
    };

    root.render(
      <div className="fixed top-0 left-0">
        <Component {...(props as P)} onClose={handleClose} onSave={onSave} />
      </div>,
    );
  });

export default mountComponent;

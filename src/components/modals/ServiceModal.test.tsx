import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {fireEvent, render} from '@testing-library/react';
import {defaultSettings} from '../../../tests/mocks/shopData.ts';
import DBContextProviderMock from '../../../tests/mocks/DBContextProviderMock.tsx';
import ServiceModal from './ServiceModal.tsx';
import {serviceDataList} from '../../../tests/mocks/serviceData.ts';

describe('ServiceModal', () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    HTMLCanvasElement.prototype.getContext = vi.fn(() => {
      return {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
      };
    });
  });

  afterAll(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });
  const onClose = vi.fn();
  const setService = vi.fn();
  const onSave = vi.fn();

  it.concurrent('Should not render the modal', () => {
    const container = render(
      <ServiceModal
        onClose={onClose}
        onSave={onSave}
        setService={setService}
        service={null}
        inPlace={false}
        settings={defaultSettings}
      />
    );
    expect(container.container.innerHTML).toEqual('');

    container.unmount();
  });

  it.concurrent('Should render the modal as popup and fill the fields', () => {
    const container = render(
      <DBContextProviderMock>
        <ServiceModal
          onClose={onClose}
          onSave={onSave}
          setService={setService}
          service={{...serviceDataList[0], onUpdate: false}}
          inPlace={false}
          settings={defaultSettings}
        />
      </DBContextProviderMock>
    );

    const inputs = container.getAllByRole('textbox');
    setService.mockReset();

    inputs.forEach((input) => {
      fireEvent.change(input, {target: {value: 'TestService'}});
    });

    const statusBox = container.getByRole('combobox', {name: 'status'});
    const guaranteedBox = container.getByRole('combobox', {name: 'Guaranteed'});

    expect(statusBox).toBeDefined();
    expect(guaranteedBox).toBeDefined();
    fireEvent.change(statusBox, {target: {value: 'status_in_progress'}});
    fireEvent.change(guaranteedBox, {target: {value: 'no'}});

    const multiSelectCheckBox = container.getByRole('checkbox', {name: 'Back'});
    fireEvent.click(multiSelectCheckBox);

    expect(setService.mock.calls.length).equal(9);
    container.unmount();
  });

  it.concurrent('Should render in place and close', () => {
    const container = render(
      <DBContextProviderMock>
        <ServiceModal
          onClose={onClose}
          onSave={onSave}
          setService={setService}
          service={serviceDataList[0]}
          inPlace={false}
        />
      </DBContextProviderMock>
    );

    const buttons = container.queryAllByRole('button');

    const closeButton = buttons.find((b) => b.innerHTML === 'Cancel');
    expect(closeButton).toBeDefined();

    onClose.mockReset();
    if (closeButton) fireEvent.click(closeButton);
    expect(onClose.mock.calls.length).toEqual(1);
    container.unmount();
  });
});

import {render, screen} from '@testing-library/react';
import ListModal from './ListModal';
import {describe, it, expect} from 'vitest';

describe('ListModal Component', () => {
  it('renders correctly with given props', () => {
    const props = {
      lines: [
        ['Row1Cell1', 'Row1Cell2'],
        ['Row2Cell1', 'Row2Cell2'],
      ],
      header: ['Header1', 'Header2'],
      inPlace: true,
      title: 'Test Title',
      buttons: [
        {
          value: 'Button1',
          onClick: () => {},
        },
      ],
    };

    render(<ListModal {...props} />);

    expect(screen.getByText('Test Title')).toBeVisible();
    expect(screen.getByText('Header1')).toBeVisible();
    expect(screen.getByText('Header2')).toBeVisible();
    expect(screen.getByText('Row1Cell1')).toBeVisible();
    expect(screen.getByText('Row1Cell2')).toBeVisible();
    expect(screen.getByText('Row2Cell1')).toBeVisible();
    expect(screen.getByText('Row2Cell2')).toBeVisible();
  });

  it('uses default title when title prop is not provided', () => {
    const props = {
      lines: [],
      header: [],
      inPlace: false,
      buttons: [],
    };

    render(<ListModal {...props} />);

    expect(screen.getByText('List Modal')).toBeVisible();
  });

  it('passes correct props to GeneralModal', () => {
    const props = {
      lines: [],
      header: [],
      inPlace: true,
      title: 'Custom Title',
      buttons: [
        {
          value: 'Button1',
          onClick: () => {},
        },
        {
          value: 'Button2',
          onClick: () => {},
        },
      ],
    };

    render(<ListModal {...props} />);

    expect(screen.getByText('Custom Title')).toBeVisible();
    expect(screen.getByText('Button1')).toBeVisible();
    expect(screen.getByText('Button2')).toBeVisible();
  });
});

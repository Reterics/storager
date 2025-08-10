import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import AlertBox from './AlertBox.tsx';

describe('AlertBox', () => {
  it('should render AlertBox in all color combination', () => {
    const { container, getByText, rerender } = render(
      <AlertBox message={'Test'} />,
    );

    expect(getByText('Test')).toBeDefined();
    expect(container.querySelector('.text-blue-800')).toBeDefined();

    rerender(<AlertBox message={'Test'} title={'Test Title'} />);
    expect(getByText('Test Title')).toBeDefined();

    const types: (
      | 'alert'
      | 'success'
      | 'warning'
      | 'dark'
      | 'default'
      | 'info'
    )[] = ['alert', 'success', 'warning', 'dark'];
    const classes = [
      'text-red-800',
      'text-green-800',
      'text-yellow-800',
      'text-gray-800',
    ];

    for (let i = 0; i < types.length; i++) {
      const role = types[i];
      rerender(<AlertBox message={'Test'} role={role} />);
      expect(container.querySelector(classes[i])).toBeDefined();
    }
  });
});

import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import About from './About';

describe('About', () => {
  it('renders the About component', () => {
    render(<About />);

    expect(screen.getByTestId('version')).toBeVisible();
    expect(screen.getByTestId('description')).toBeVisible();
  });
});

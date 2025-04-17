import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import LoadingIcon from './LoadingIcon';

describe('LoadingIcon', () => {
  it('renders LoadingIcon correctly', () => {
    const {container} = render(<LoadingIcon />);

    expect(container).toBeDefined();
    expect(container.querySelector('svg')).toBeDefined();
  });
});

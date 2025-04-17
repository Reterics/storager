import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import FormRow from './FormRow';

describe('FormRow', () => {
  it.concurrent('renders the FormRow component with 1 Node', () => {
    const {container} = render(<FormRow>FormRow Test</FormRow>);
    const node = container.querySelector('div.grid');

    expect(node).toBeDefined();
    expect(node?.classList.contains('md:grid-cols-1')).toBe(true);

    expect(screen.getByText('FormRow Test')).toBeDefined();
  });
  it.concurrent('renders the FormRow component with 2 Node', () => {
    const {container} = render(
      <FormRow>
        <div>1.Node</div>
        <div>2.Node</div>
      </FormRow>
    );
    const node = container.querySelector('div.grid');

    expect(node).toBeDefined();
    expect(node?.classList.contains('md:grid-cols-2')).toBe(true);

    expect(screen.getByText('2.Node')).toBeDefined();
  });
  it.concurrent('renders the FormRow component with 3 Node', () => {
    const {container} = render(
      <FormRow>
        <div>1.Node</div>
        <div>2.Node</div>
        <div>3.Node</div>
      </FormRow>
    );
    const node = container.querySelector('div.grid');

    expect(node).toBeDefined();
    expect(node?.classList.contains('md:grid-cols-3')).toBe(true);

    expect(screen.getByText('3.Node')).toBeDefined();
  });
  it.concurrent('renders the FormRow component with 4 Node', () => {
    const {container} = render(
      <FormRow>
        <div>1.Node</div>
        <div>2.Node</div>
        <div>3.Node</div>
        <div>4.Node</div>
      </FormRow>
    );
    const node = container.querySelector('div.grid');

    expect(node).toBeDefined();
    expect(node?.classList.contains('md:grid-cols-4')).toBe(true);

    expect(screen.getByText('4.Node')).toBeDefined();
  });
  it.concurrent('renders the FormRow component with 10 Node', () => {
    const {container} = render(
      <FormRow>
        <div>1.Node</div>
        <div>2.Node</div>
        <div>3.Node</div>
        <div>4.Node</div>
        <div>5.Node</div>
        <div>6.Node</div>
        <div>7.Node</div>
        <div>8.Node</div>
        <div>9.Node</div>
        <div>10.Node</div>
      </FormRow>
    );
    const node = container.querySelector('div.grid');

    expect(node).toBeDefined();
    expect(node?.className).toEqual('grid md:gap-6 mb-1');

    expect(screen.getByText('10.Node')).toBeDefined();
  });
});

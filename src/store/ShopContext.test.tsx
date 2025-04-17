import React from 'react';
import {render, screen} from '@testing-library/react';
import {ShopProvider, ShopContext} from './ShopContext';
import {beforeEach, describe, expect, it} from 'vitest';
import userEvent from '@testing-library/user-event';

const TestComponent = () => {
  const {shop, setShop} = React.useContext(ShopContext);
  return (
    <div>
      <p data-testid='shop'>{shop ? shop.name : 'No shop selected'}</p>
      <button
        data-testid='update-shop'
        onClick={() => setShop({id: '123', name: 'Test Shop'})}
      >
        Update Shop
      </button>
      <button data-testid='clear-shop' onClick={() => setShop(null)}>
        Clear Shop
      </button>
    </div>
  );
};

describe('ShopProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with null if no shop is saved in localStorage', () => {
    render(
      <ShopProvider>
        <TestComponent />
      </ShopProvider>
    );

    expect(screen.getByTestId('shop').textContent).toBe('No shop selected');
  });

  it('initializes with saved shop from localStorage if available', () => {
    localStorage.setItem(
      'shop',
      JSON.stringify({id: '123', name: 'Saved Shop'})
    );

    render(
      <ShopProvider>
        <TestComponent />
      </ShopProvider>
    );

    expect(screen.getByTestId('shop').textContent).toBe('Saved Shop');
  });

  it('updates shop and saves to localStorage when setShop is called', async () => {
    render(
      <ShopProvider>
        <TestComponent />
      </ShopProvider>
    );

    await userEvent.click(screen.getByTestId('update-shop'));

    expect(screen.getByTestId('shop').textContent).toBe('Test Shop');
    expect(localStorage.getItem('shop')).toBe(
      JSON.stringify({id: '123', name: 'Test Shop'})
    );
  });

  it('clears shop and removes from localStorage when setShop is called with null', async () => {
    localStorage.setItem(
      'shop',
      JSON.stringify({id: '123', name: 'Saved Shop'})
    );

    render(
      <ShopProvider>
        <TestComponent />
      </ShopProvider>
    );

    await userEvent.click(screen.getByTestId('clear-shop'));

    expect(screen.getByTestId('shop').textContent).toBe('No shop selected');
    expect(localStorage.getItem('shop')).toBe('null');
  });
});

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import About from './About'

describe('About', () => {
    it('renders the About component', () => {
        render(<About />)

        expect(screen.getByRole('heading', { name: 'About' })).toBeDefined();
        expect(screen.getByRole('link', { name: 'Reterics logo StorageR' })).toBeDefined();

        expect(screen.getByText('About')).toBeDefined();

    })
})

import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn with design tokens', () => {
    it('keeps density font size and text color side by side', () => {
        expect(cn('text-control', 'text-fg')).toBe('text-control text-fg')
        expect(cn('text-accent-fg', 'text-control')).toBe('text-accent-fg text-control')
    })

    it('still lets a later font size override text-control', () => {
        expect(cn('text-control', 'text-xs')).toBe('text-xs')
    })

    it('treats token radii as radii', () => {
        expect(cn('rounded-control', 'rounded-panel')).toBe('rounded-panel')
    })
})

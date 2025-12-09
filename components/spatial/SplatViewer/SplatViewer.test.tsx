import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SplatViewer } from './SplatViewer';

// Mock heavy 3D deps with lightweight stubs so tests can run in jsdom
vi.mock('@react-three/fiber', () => ({
    Canvas: ({ children }: { children?: React.ReactNode }) => (
        <div data-testid="canvas">{children}</div>
    ),
}));

vi.mock('@react-three/drei', () => ({
    OrbitControls: () => <div data-testid="orbit-controls" />,
    Loader: () => <div data-testid="r3f-loader" />,
}));

// Mock Splat to verify the URL is passed through correctly
vi.mock('@/components/spatial/Splat/Splat', () => ({
    Splat: ({ url }: { url: string }) => (
        <div data-testid="splat" data-url={url} />
    ),
}));

describe('SplatViewer', () => {
    it('renders overlay labels', () => {
        render(<SplatViewer url="/models/example.splat" />);
        expect(screen.getByText('Orbit')).toBeInTheDocument();
        expect(screen.getByText('Zoom')).toBeInTheDocument();
        // Canvas stub should be present
        expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });

    it('passes the url prop to Splat', () => {
        const testUrl = '/foo/bar.splat';
        render(<SplatViewer url={testUrl} />);
        const splat = screen.getByTestId('splat');
        expect(splat).toHaveAttribute('data-url', testUrl);
    });
});

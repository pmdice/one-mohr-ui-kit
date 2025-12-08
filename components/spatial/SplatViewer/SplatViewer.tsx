"use client";

import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Loader } from '@react-three/drei';
import { Splat } from '@/components/spatial/Splat/Splat';
import { Button } from '@/components/atoms/Button/Button';
import { Move, ZoomIn, RefreshCw } from 'lucide-react';

interface SplatViewerProps {
    url: string;
}

export function SplatViewer({ url }: SplatViewerProps) {
    return (
        <div className="relative w-full h-full min-h-[500px] bg-black rounded-xl overflow-hidden">
            {/* 1. The Declarative Scene */}
            <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
                <Suspense fallback={null}>
                    <Splat url={url} />
                </Suspense>
                <OrbitControls makeDefault />
            </Canvas>

            {/* 2. The 2D Overlay (Using your Atomic Design Buttons!) */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-background/50 backdrop-blur-sm p-2 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Move size={14} /> <span>Orbit</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ZoomIn size={14} /> <span>Zoom</span>
                </div>
                {/* We can't easily reset camera from outside Canvas without state,
            but for a UI kit showcase, this structure is cleaner. */}
            </div>

            {/* R3F built-in Loader */}
            <Loader />
        </div>
    );
}
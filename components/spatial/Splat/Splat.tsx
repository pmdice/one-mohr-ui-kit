"use client";

import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { SplatMesh, SparkRenderer } from '@sparkjsdev/spark';

interface SplatProps {
    url: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    onProgress?: (progress: number) => void;
    onLoad?: () => void;
}

export function Splat({ url, position, rotation, scale, onProgress, onLoad }: SplatProps) {
    const { gl, scene, camera } = useThree();
    const splatRef = useRef<SplatMesh | null>(null);
    const sparkRef = useRef<SparkRenderer | null>(null);

    useEffect(() => {
        // Initialize Spark Renderer attached to the existing R3F gl context
        const spark = new SparkRenderer({
            renderer: gl,
            focalAdjustment: 2.0,
            blurAmount: 0.3,
        });
        scene.add(spark);
        sparkRef.current = spark;

        // Load Splat data with progress reporting, then create SplatMesh
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress((e.loaded / e.total) * 100);
            }
        };
        xhr.onload = () => {
            try {
                const bytes = new Uint8Array(xhr.response);
                const splat = new SplatMesh({
                    fileBytes: bytes,
                    fileName: url.split('/').pop(),
                    onLoad: () => {
                        if (onLoad) onLoad();
                    },
                });
                scene.add(splat);
                splatRef.current = splat;
                // Ensure progress hits 100 on completion
                if (onProgress) onProgress(100);
            } catch (err) {
                console.error('Failed to initialize SplatMesh', err);
            }
        };
        xhr.onerror = (err) => {
            console.error('Failed to load splat URL', err);
        };
        xhr.send();

        return () => {
            // Automatic Cleanup when component unmounts
            if (splatRef.current) {
                scene.remove(splatRef.current);
                splatRef.current.dispose();
                splatRef.current = null;
            }
            // Abort any in-flight request
            try { xhr.abort(); } catch {}
            scene.remove(spark);
            spark.defaultView.dispose();
        };
    }, [url, gl, scene, onProgress, onLoad]);

    // Update transforms if props change
    useFrame(() => {
        if (splatRef.current) {
            if (position) splatRef.current.position.set(...position);
            if (rotation) splatRef.current.rotation.set(...rotation);
            if (scale) splatRef.current.scale.set(...scale);
        }
    });

    return null; // The SplatMesh is added to the scene directly
}
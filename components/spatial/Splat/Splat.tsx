"use client";

import * as THREE from 'three';
import { useEffect, useLayoutEffect, useRef } from 'react';
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
    const { gl, scene, camera, size, viewport } = useThree();
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

        // Bind Spark's default viewpoint to the R3F camera and enable auto updates
        try {
            spark.defaultView.setAutoUpdate(true);
            spark.defaultView.camera = camera;
        } catch {}

        // Ensure Spark knows the current render size (in pixels)
        const setRenderSize = () => {
            const canvas = gl.domElement as HTMLCanvasElement;
            // Use the actual drawing buffer size to avoid CSS vs pixel ratio mismatch
            const width = canvas.width;
            const height = canvas.height;
            if (spark.uniforms?.renderSize?.value) {
                spark.uniforms.renderSize.value.set(width, height);
            }
        };
        setRenderSize();

        // Load Splat data with progress reporting, then create SplatMesh
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = (e: ProgressEvent<EventTarget>) => {
            // Some servers may not provide total; guard accordingly
            const pe = e as ProgressEvent;
            if (pe.lengthComputable && onProgress) {
                const percent = pe.total ? (pe.loaded / pe.total) * 100 : 0;
                onProgress(percent);
            }
        };
        xhr.onload = () => {
            try {
                const bytes = new Uint8Array(xhr.response as ArrayBuffer);
                const fileName = url.split('/').pop();
                const mesh = new SplatMesh({
                    fileBytes: bytes,
                    fileName,
                    onLoad: () => {
                        if (onLoad) onLoad();
                    },
                });
                if (mesh && mesh instanceof THREE.Object3D) {
                    scene.add(mesh);
                    splatRef.current = mesh;
                } else {
                    console.error('SplatMesh did not produce a THREE.Object3D', mesh);
                }
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
    }, [url, gl, scene, camera, onProgress, onLoad]);

    useLayoutEffect(() => {
        if (splatRef.current) {
            // Apply transforms whenever position/rotation/scale props change
            if (position) splatRef.current.position.set(...position);
            if (rotation) splatRef.current.rotation.set(...rotation);
            if (scale) splatRef.current.scale.set(...scale);
            splatRef.current.updateMatrixWorld(); // Ensure matrix updates immediately
        }
    }, [position, rotation, scale]);

    // Keep Spark's render size in sync if the drawing buffer changed
    useFrame(() => {
        const spark = sparkRef.current;
        if (spark) {
            const canvas = (spark.renderer?.domElement ?? (gl?.domElement as HTMLCanvasElement)) as HTMLCanvasElement | undefined;
            if (canvas && spark.uniforms?.renderSize?.value) {
                const rs = spark.uniforms.renderSize.value;
                if (rs.x !== canvas.width || rs.y !== canvas.height) {
                    rs.set(canvas.width, canvas.height);
                }
            }
        }
    });

    return null; // The SplatMesh is added to the scene directly
}
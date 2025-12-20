"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec3 uMetalColor;
  uniform vec3 uAccentColor;
  uniform float uMetallicness;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  const int AMOUNT = 12;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

  // Metallic reflection function
  float fresnel(vec3 normal, vec3 viewDir, float power) {
      return pow(1.0 - max(dot(normal, viewDir), 0.0), power);
  }

  // Smooth transition function
  float smoothTransition(float x, float edge0, float edge1) {
      float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
      return t * t * (3.0 - 2.0 * t);
  }

  void main() {
      vec2 newUv = 6.0 * (vUv - 0.5);
      
      // Slower, smoother animation
      float timeScale = uTime * 0.32;
      
      // Create smooth wave pattern
      float len = 0.0;
      for(int i = 0; i < AMOUNT; i++) {
          len = length(newUv);
          newUv.x = newUv.x + cos(newUv.y + sin(len) + timeScale * 0.7) * 0.3;
          newUv.y = newUv.y + sin(newUv.x + cos(len) + timeScale * 0.5) * 0.3;
      }
      
      // Depth and relief
      float depth = sin(len * 2.0 + timeScale) * 0.3 + 0.7;
      
      // Fresnel effect for metallic shine
      vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
      float fresnelEffect = fresnel(vNormal, viewDir, 3.0);
      
      // Base metal colors - more vivid and distinct
      vec3 silverBase = vec3(0.78, 0.8, 0.85); // Cool silver
      vec3 silverAccent = vec3(0.92, 0.94, 0.98); // Bright silver highlight
      vec3 goldBase = vec3(1.0, 0.78, 0.28); // Rich warm gold
      vec3 goldAccent = vec3(1.0, 0.88, 0.5); // Bright gold highlight
      
      // === CLEAR SILVER TO GOLD TRANSITION ===
      // Main time-based transition (full cycle silver -> gold -> silver)
      float cycleTime = timeScale * 0.4; // Slower cycle for clear visibility
      float mainTransition = sin(cycleTime) * 0.5 + 0.5; // 0 to 1 oscillation
      
      // Add spatial wave for flowing effect across the sphere
      float spatialWave = sin(vUv.x * 3.14159 * 2.0 + cycleTime * 1.5) * 0.3;
      spatialWave += sin(vUv.y * 3.14159 * 2.0 - cycleTime) * 0.2;
      
      // Combine time and spatial for sweeping transition
      float blendFactor = mainTransition + spatialWave;
      blendFactor = clamp(blendFactor, 0.0, 1.0);
      
      // Apply smooth step for clearer separation between metals
      blendFactor = smoothTransition(blendFactor, 0.2, 0.8);
      
      // Gradient based on pattern for additional detail
      float patternGradient = sin(len * 1.5 + timeScale * 0.5) * 0.4 + 0.6;
      
      // Create distinct silver and gold colors
      vec3 silverColor = mix(silverBase, silverAccent, patternGradient);
      vec3 goldColor = mix(goldBase, goldAccent, patternGradient);
      
      // Main color blend - clear transition from silver to gold
      vec3 baseColor = mix(silverColor, goldColor, blendFactor);
      
      // Add bright highlights based on current dominant metal
      vec3 silverHighlight = vec3(0.98, 0.98, 1.0);
      vec3 goldHighlight = vec3(1.0, 0.95, 0.8);
      vec3 highlight = mix(silverHighlight, goldHighlight, blendFactor);
      baseColor = mix(baseColor, highlight, fresnelEffect * 0.5);
      
      // Shimmer effect
      float sparkle = sin(len * 8.0 + timeScale * 3.0) * 0.15 + 0.85;
      sparkle += cos(len * 12.0 + timeScale * 4.0) * 0.08;
      baseColor *= sparkle;
      
      // Depth and contrast
      baseColor *= depth * 0.85 + 0.5;
      baseColor = pow(baseColor, vec3(1.05));
      
      // Subtle texture
      float textureNoise = sin(vUv.x * 50.0 + timeScale * 2.0) * 0.015;
      textureNoise += cos(vUv.y * 50.0 + timeScale * 1.5) * 0.015;
      baseColor += textureNoise;
      
      // Final color adjustment
      baseColor = clamp(baseColor, 0.0, 1.0);
      
      // Boost saturation slightly for gold areas
      float saturationBoost = blendFactor * 0.1;
      baseColor = mix(baseColor, baseColor * vec3(1.05, 1.0, 0.95), saturationBoost);
      
      gl_FragColor = vec4(baseColor, 1.0);
  }
`;

function lerp(a: number, e: number, t: number) {
    return a * (1 - t) + e * t;
}

type MetalType = 'silver' | 'gold' | 'mixed';

interface WebGLLogoProps {
    size?: number;
    metal?: MetalType;
}

const METAL_COLORS = {
    silver: {
        base: new THREE.Color(0.85, 0.85, 0.88),      // Яркое серебро
        accent: new THREE.Color(0.95, 0.95, 0.98),    // Очень светлое серебро
        metallicness: 0.7
    },
    gold: {
        base: new THREE.Color(0.95, 0.75, 0.35),      // Яркое золото
        accent: new THREE.Color(1.0, 0.85, 0.45),     // Светлое золото
        metallicness: 0.8
    },
    mixed: {
        base: new THREE.Color(0.9, 0.8, 0.6),         // Смешанный теплый
        accent: new THREE.Color(0.97, 0.92, 0.8),     // Смешанный светлый
        metallicness: 0.75
    }
};

export function WebGLLogo({ size = 120, metal = 'mixed' }: WebGLLogoProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const meshRef = useRef<THREE.Mesh | null>(null);
    const clockRef = useRef<THREE.Clock>(new THREE.Clock());
    const mouseRef = useRef({ x: 0, y: 0 });
    const frameIdRef = useRef<number>();

    useEffect(() => {
        if (!containerRef.current) return;

        // Setup
        const container = containerRef.current;
        const viewport = { width: size, height: size };

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(viewport.width, viewport.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            viewport.width / viewport.height,
            0.1,
            10
        );
        camera.position.set(0, 0, 2.5);
        scene.add(camera);
        cameraRef.current = camera;

        // Get metal colors
        const metalConfig = METAL_COLORS[metal];

        // Mesh
        const geometry = new THREE.SphereGeometry(1.1, 64, 64);
        const material = new THREE.ShaderMaterial({
            fragmentShader,
            vertexShader,
            uniforms: {
                uResolution: {
                    value: new THREE.Vector2(viewport.width, viewport.height)
                },
                uTime: {
                    value: 0
                },
                uMouse: {
                    value: new THREE.Vector2(mouseRef.current.x, mouseRef.current.y)
                },
                uMetalColor: {
                    value: metalConfig.base
                },
                uAccentColor: {
                    value: metalConfig.accent
                },
                uMetallicness: {
                    value: metalConfig.metallicness
                }
            }
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        meshRef.current = mesh;

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / viewport.width - 0.5;
            const y = (e.clientY - rect.top) / viewport.height - 0.5;

            mouseRef.current.x = lerp(mouseRef.current.x, x, 0.1);
            mouseRef.current.y = lerp(mouseRef.current.y, y, 0.1);
        };

        container.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        const animate = () => {
            if (!meshRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;

            // Smooth rotation based on mouse
            meshRef.current.rotation.y = lerp(
                meshRef.current.rotation.y,
                mouseRef.current.x * 0.3,
                0.05
            );
            meshRef.current.rotation.x = lerp(
                meshRef.current.rotation.x,
                mouseRef.current.y * 0.3,
                0.05
            );

            // Gentle continuous rotation
            meshRef.current.rotation.y += 0.002;

            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = clockRef.current.getElapsedTime();

            rendererRef.current.render(sceneRef.current, cameraRef.current);
            frameIdRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
                container.removeChild(rendererRef.current.domElement);
            }
            geometry.dispose();
            material.dispose();
        };
    }, [size, metal]);

    return (
        <div
            ref={containerRef}
            className="webgl-logo relative"
            style={{ width: size, height: size, margin: '0 auto' }}
        >
            {/* Soft glowing background */}
            <div
                className="absolute inset-0 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none"
                style={{
                    background: metal === 'gold'
                        ? 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)'
                        : metal === 'silver'
                            ? 'radial-gradient(circle, rgba(148,163,184,0.3) 0%, transparent 70%)'
                            : 'radial-gradient(circle, rgba(200,180,120,0.3) 0%, transparent 70%)',
                    transform: 'scale(1.5)',
                }}
            />
        </div>
    );
}

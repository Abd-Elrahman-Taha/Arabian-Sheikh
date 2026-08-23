import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useTheme } from '../../context/ThemeContext';
import performanceManager from '../../utils/performanceManager';

const globalTextureCache = new Map();
const textureLoader = typeof window !== 'undefined' ? new THREE.TextureLoader() : null;

export default function Hero3DFlaconScene({
  activeProductIndex = 0,
  onSlideChange,
  products = []
}) {
  const { isDark } = useTheme();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const bottleMeshRef = useRef(null);
  const shadowMeshRef = useRef(null);
  const lightSweepRef = useRef(null);
  const texturesRef = useRef([]);
  const mobileImgRef = useRef(null);

  // Immediate detection for mobile or weak devices (0ms blocking time)
  const isMobileOrWeak = typeof window !== 'undefined' && (
    window.innerWidth < 768 ||
    performanceManager.isMobile ||
    performanceManager.isLowEnd ||
    performanceManager.tier === 'low'
  );

  const [useFallback, setUseFallback] = useState(isMobileOrWeak);

  const flaconImages = (products && products.length > 0)
    ? products.map(p => p.image || p.cutoutImage || '/products/stallion_royal_flacon.webp')
    : ['/products/stallion_royal_flacon.webp'];

  const currentImage = flaconImages[activeProductIndex] || flaconImages[0];

  // Smooth mobile image animation on slide change
  useEffect(() => {
    if (useFallback && mobileImgRef.current) {
      gsap.fromTo(
        mobileImgRef.current,
        { scale: 0.94, opacity: 0.85 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [activeProductIndex, useFallback]);

  // Desktop Three.js WebGL Scene
  useEffect(() => {
    if (useFallback) return;

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 650;

    let renderer, gl, animationFrameId;

    try {
      // 1. Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // 2. Camera
      const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
      camera.position.set(0, 0.05, 5.8);
      cameraRef.current = camera;

      // 3. Renderer with Optimal DPR
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      rendererRef.current = renderer;

      gl = renderer.getContext();

      // WebGL context loss listener
      const handleContextLost = (e) => {
        e.preventDefault();
        setUseFallback(true);
      };
      if (canvasRef.current) {
        canvasRef.current.addEventListener('webglcontextlost', handleContextLost, false);
      }

      // 4. Lighting Rig
      const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2);
      scene.add(ambientLight);

      const cameraSpotLight = new THREE.SpotLight(0xfffaee, 5.5, 22, Math.PI / 4.2, 0.35, 1.0);
      cameraSpotLight.position.set(0, 0.8, 5.6);
      cameraSpotLight.target.position.set(0, 0.05, 0);
      scene.add(cameraSpotLight);
      scene.add(cameraSpotLight.target);

      const topSpotLight = new THREE.SpotLight(0xfff7d6, 4.8, 18, Math.PI / 3.2, 0.4, 1.1);
      topSpotLight.position.set(0, 5, 2.5);
      scene.add(topSpotLight);

      const warmKeyLight = new THREE.DirectionalLight(0xffe8b8, 2.5);
      warmKeyLight.position.set(3, 4, 3.5);
      scene.add(warmKeyLight);

      const coolRimLight = new THREE.DirectionalLight(0xdbe8ff, 1.8);
      coolRimLight.position.set(-3.5, 2.5, -2);
      scene.add(coolRimLight);

      const goldPointLight = new THREE.PointLight(0xf2d675, 2.4, 10);
      goldPointLight.position.set(0, -0.5, 3);
      scene.add(goldPointLight);
      lightSweepRef.current = goldPointLight;

      // 5. Instant Textures from Memory Cache
      const textures = flaconImages.map(src => {
        let tex = globalTextureCache.get(src);
        if (!tex && textureLoader) {
          tex = textureLoader.load(src);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          globalTextureCache.set(src, tex);
        }
        return tex;
      });
      texturesRef.current = textures;

      // 6. Bottle Plane Mesh & Dynamic Studio Contact Shadow
      const bottleGeometry = new THREE.PlaneGeometry(1.62, 2.5);
      const bottleMaterial = new THREE.MeshBasicMaterial({
        map: textures[activeProductIndex] || textures[0],
        transparent: true,
        alphaTest: 0.02,
        side: THREE.DoubleSide
      });
      const bottleMesh = new THREE.Mesh(bottleGeometry, bottleMaterial);
      bottleMesh.position.set(0, 0.02, 0);
      scene.add(bottleMesh);
      bottleMeshRef.current = bottleMesh;

      // Realistic Studio Contact Shadow under bottle base
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 256;
      shadowCanvas.height = 256;
      const shadowCtx = shadowCanvas.getContext('2d');
      const grad = shadowCtx.createRadialGradient(128, 128, 0, 128, 128, 120);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.55)');
      grad.addColorStop(0.7, 'rgba(10, 6, 2, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      shadowCtx.fillStyle = grad;
      shadowCtx.fillRect(0, 0, 256, 256);
      const shadowTexture = new THREE.CanvasTexture(shadowCanvas);

      const shadowGeometry = new THREE.PlaneGeometry(1.5, 0.55);
      const shadowMaterial = new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      });
      const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.set(0, -1.52, 0);
      shadowMesh.visible = isDark || window.innerWidth >= 640;
      scene.add(shadowMesh);
      shadowMeshRef.current = shadowMesh;

      // 7. Intersection Observer
      let isVisible = true;
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      }, { threshold: 0.05 });
      observer.observe(container);

      // 8. Render Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (!isVisible || !performanceManager.isTabVisible) return;
        renderer.render(scene, camera);
      };
      animate();

      // 9. Resize handler
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth || 500;
        const h = container.clientHeight || 650;
        if (w < 768) {
          setUseFallback(true);
          return;
        }
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize, { passive: true });

      return () => {
        cancelAnimationFrame(animationFrameId);
        observer.disconnect();
        window.removeEventListener('resize', handleResize);
        if (canvasRef.current) {
          canvasRef.current.removeEventListener('webglcontextlost', handleContextLost);
        }
        bottleGeometry.dispose();
        bottleMaterial.dispose();
        shadowGeometry.dispose();
        shadowMaterial.dispose();
        shadowTexture.dispose();
        renderer.dispose();
        if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext();
      };
    } catch (e) {
      setUseFallback(true);
    }
  }, [useFallback]);

  // Update shadow visibility on theme switch
  useEffect(() => {
    if (shadowMeshRef.current) {
      shadowMeshRef.current.visible = isDark || window.innerWidth >= 640;
    }
  }, [isDark]);

  // Smooth Flacon Transition when activeProductIndex changes on desktop
  useEffect(() => {
    if (useFallback || !bottleMeshRef.current || !texturesRef.current.length) return;

    const currentTexture = texturesRef.current[activeProductIndex];
    if (!currentTexture) return;

    gsap.to(bottleMeshRef.current.scale, {
      x: 0.88,
      y: 0.88,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => {
        if (bottleMeshRef.current) {
          bottleMeshRef.current.material.map = currentTexture;
          bottleMeshRef.current.material.needsUpdate = true;
        }

        gsap.fromTo(
          bottleMeshRef.current.scale,
          { x: 0.88, y: 0.88 },
          { x: 1, y: 1, duration: 0.4, ease: 'back.out(1.4)' }
        );
      }
    });

    if (lightSweepRef.current) {
      gsap.fromTo(
        lightSweepRef.current,
        { intensity: 3.5 },
        { intensity: 2.0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [activeProductIndex, useFallback]);

  // Mobile / Weak Device / WebGL fallback presentation: 0ms load, GPU-accelerated, never disappears
  if (useFallback) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-6 select-none pointer-events-none">
        {/* Crisp Flacon with Smooth Transition */}
        <div className="relative flex items-center justify-center max-h-[500px] w-full h-full">
          <img
            ref={mobileImgRef}
            src={currentImage}
            alt="Arabian Sheikh Perfume Flacon"
            className="h-[46vh] sm:h-[56vh] max-h-[480px] w-auto max-w-[88%] object-contain filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)] transition-all duration-300 transform-gpu"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />

          {/* Contact Shadow beneath bottle base on mobile in dark mode */}
          <div
            className={`absolute -bottom-2 inset-x-0 mx-auto w-36 sm:w-48 h-6 rounded-full blur-md pointer-events-none transition-opacity duration-300 ${
              isDark ? 'bg-black/75 opacity-90' : 'bg-[#5A3517]/25 opacity-60'
            }`}
          />
        </div>
      </div>
    );
  }

  // Desktop WebGL Scene
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
}

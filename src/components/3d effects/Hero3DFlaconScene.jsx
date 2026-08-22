import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import performanceManager from '../../utils/performanceManager';

const globalTextureCache = new Map();
const textureLoader = new THREE.TextureLoader();

export default function Hero3DFlaconScene({
  activeProductIndex = 0,
  onSlideChange,
  products = []
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const bottleMeshRef = useRef(null);
  const shadowMeshRef = useRef(null);
  const lightSweepRef = useRef(null);
  const texturesRef = useRef([]);
  const [webglSupported, setWebglSupported] = useState(true);
  const [loaded, setLoaded] = useState(true);

  const flaconImages = (products && products.length > 0)
    ? products.map(p => p.image || p.cutoutImage)
    : ['/products/stallion_royal_flacon.png'];

  // Pre-cache textures at module level
  flaconImages.forEach(src => {
    if (src && !globalTextureCache.has(src)) {
      const tex = textureLoader.load(src);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      globalTextureCache.set(src, tex);
    }
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 650;

    // Check WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch (e) {
      setWebglSupported(false);
      return;
    }

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const isMobile = width < 640;
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.05, isMobile ? 5.2 : 6.0);
    cameraRef.current = camera;

    // 3. Renderer with Optimal DPR
    const dpr = performanceManager.getOptimalDpr(1.5);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: performanceManager.tier !== 'low',
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    // 4. Lighting Rig & Focused Top Spotlight
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.9);
    scene.add(ambientLight);

    // Focused Overhead Spotlight shining directly down onto the flacon
    const topSpotLight = new THREE.SpotLight(0xfff7d6, 5.5, 16, Math.PI / 3.5, 0.35, 1.2);
    topSpotLight.position.set(0, 4.5, 2.5);
    scene.add(topSpotLight);

    const warmKeyLight = new THREE.DirectionalLight(0xffdfa8, 2.5);
    warmKeyLight.position.set(3, 4, 3);
    scene.add(warmKeyLight);

    const coolRimLight = new THREE.DirectionalLight(0xd4e2ff, 1.6);
    coolRimLight.position.set(-3, 2, -2);
    scene.add(coolRimLight);

    const goldPointLight = new THREE.PointLight(0xd4af37, 2.2, 10);
    goldPointLight.position.set(0, -1.5, 2.5);
    scene.add(goldPointLight);
    lightSweepRef.current = goldPointLight;

    // 5. Instant Textures from Memory Cache
    const textures = flaconImages.map(src => {
      let tex = globalTextureCache.get(src);
      if (!tex) {
        tex = textureLoader.load(src);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        globalTextureCache.set(src, tex);
      }
      return tex;
    });
    texturesRef.current = textures;

    // 6. Bottle Plane Mesh (Aspect 2.4 x 3.1 for high-res 3D model render)
    const BASE_ROT_Z = -2 * (Math.PI / 180);
    const BASE_ROT_X = 0;
    const BASE_ROT_Y = 0;

    const bottleGeometry = new THREE.PlaneGeometry(2.4, 3.1);
    const bottleMaterial = new THREE.MeshBasicMaterial({
      map: textures[0],
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide
    });
    const bottleMesh = new THREE.Mesh(bottleGeometry, bottleMaterial);
    bottleMesh.position.set(0, 0.05, 0);
    bottleMesh.rotation.set(BASE_ROT_X, BASE_ROT_Y, BASE_ROT_Z);
    scene.add(bottleMesh);
    bottleMeshRef.current = bottleMesh;

    // 7. Intersection Observer to Pause Loop when Offscreen
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    // 8. Render & Floating Animation Loop (Steady, no mouse hover wobble, no reflection)
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible || !performanceManager.isTabVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Gentle floating levitation
      const floatY = Math.sin(elapsedTime * 1.5) * 0.05;
      if (bottleMeshRef.current) {
        bottleMeshRef.current.position.y = 0.05 + floatY;
        bottleMeshRef.current.rotation.set(BASE_ROT_X, BASE_ROT_Y, BASE_ROT_Z);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 650;
      const isMob = w < 640;
      camera.aspect = w / h;
      camera.position.z = isMob ? 5.2 : 6.0;
      camera.position.y = 0.05;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      
      // Full resource disposal
      bottleGeometry.dispose();
      bottleMaterial.dispose();
      textures.forEach(t => t.dispose());
      renderer.dispose();
    };
  }, []);

  // Smooth Flacon Transition when activeProductIndex changes
  useEffect(() => {
    if (!bottleMeshRef.current || !texturesRef.current.length) return;

    const currentTexture = texturesRef.current[activeProductIndex];
    if (!currentTexture) return;

    gsap.to(bottleMeshRef.current.scale, {
      x: 0.88,
      y: 0.88,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        if (bottleMeshRef.current) {
          bottleMeshRef.current.material.map = currentTexture;
          bottleMeshRef.current.material.needsUpdate = true;
        }

        gsap.fromTo(
          bottleMeshRef.current.scale,
          { x: 0.88, y: 0.88 },
          { x: 1, y: 1, duration: 0.45, ease: 'back.out(1.4)' }
        );
      }
    });

    if (lightSweepRef.current) {
      gsap.fromTo(
        lightSweepRef.current,
        { intensity: 3.5 },
        { intensity: 2.0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [activeProductIndex]);

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-6">
        <img
          src={flaconImages[activeProductIndex] || flaconImages[0]}
          alt="Arabian Sheikh Perfume Flacon"
          className="h-[48vh] sm:h-[58vh] max-h-[500px] w-auto max-w-[90%] object-contain drop-shadow-[0_20px_50px_rgba(212,175,55,0.4)] filter"
          loading="eager"
        />
      </div>
    );
  }

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

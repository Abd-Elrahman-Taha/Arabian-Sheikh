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
    : [
        '/products/black_diamond_gold.png?v=6',
        '/products/billionaire_gold.png?v=6',
        '/products/queens_secret_gold.png?v=6',
        '/products/millionaire_black.png?v=6',
        '/products/ana_sukkar_white.png?v=6'
      ];

  // Pre-cache textures at module level
  flaconImages.forEach(src => {
    if (!globalTextureCache.has(src)) {
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

    // 2. Camera: Framed with refined proportions for minimized, 30-degree angled flacon
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

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.9);
    scene.add(ambientLight);

    const warmKeyLight = new THREE.DirectionalLight(0xffdfa8, 2.5);
    warmKeyLight.position.set(3, 4, 3);
    scene.add(warmKeyLight);

    const coolRimLight = new THREE.DirectionalLight(0xd4e2ff, 1.3);
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

    // 6. Bottle Plane Mesh (Standardized 1:1.4 Aspect: 2.3 x 3.22 with 15-degree lay angle)
    const BASE_ROT_Z = -15 * (Math.PI / 180); // 15-degree subtle luxury tilt
    const BASE_ROT_X = -4 * (Math.PI / 180);  // Subtle lay-back angle
    const BASE_ROT_Y = 8 * (Math.PI / 180);   // Luxury 3D perspective turn

    const bottleGeometry = new THREE.PlaneGeometry(2.3, 3.22);
    const bottleMaterial = new THREE.MeshStandardMaterial({
      map: textures[0],
      transparent: true,
      alphaTest: 0.05,
      roughness: 0.25,
      metalness: 0.15,
      side: THREE.DoubleSide
    });
    const bottleMesh = new THREE.Mesh(bottleGeometry, bottleMaterial);
    bottleMesh.position.set(0, 0.05, 0);
    bottleMesh.rotation.set(BASE_ROT_X, BASE_ROT_Y, BASE_ROT_Z);
    scene.add(bottleMesh);
    bottleMeshRef.current = bottleMesh;

    // 7. Ground Contact Shadow angled to match 15-degree flacon orientation
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(33, 19, 13, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeometry = new THREE.PlaneGeometry(2.8, 1.1);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadowMesh.rotation.x = -Math.PI / 2.2;
    shadowMesh.rotation.z = -12 * (Math.PI / 180);
    shadowMesh.position.set(0.05, -1.5, 0.2);
    scene.add(shadowMesh);
    shadowMeshRef.current = shadowMesh;

    // 8. Interactive Mouse Movement Tracking (Subtle 3D rotation only, no color sweep)
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.10;
      targetRotX = -y * 0.05;
    };

    const handleMouseLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // 9. Intersection Observer to Pause Loop when Offscreen
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    // 10. Render & Floating Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible || !performanceManager.isTabVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Subtle levitation hover
      const floatY = Math.sin(elapsedTime * 1.5) * 0.06;
      if (bottleMeshRef.current) {
        bottleMeshRef.current.position.y = 0.05 + floatY;
        bottleMeshRef.current.rotation.z = BASE_ROT_Z;
        bottleMeshRef.current.rotation.y += (BASE_ROT_Y + targetRotY - bottleMeshRef.current.rotation.y) * 0.08;
        bottleMeshRef.current.rotation.x += (BASE_ROT_X + targetRotX - bottleMeshRef.current.rotation.x) * 0.08;
      }

      // Ground shadow breath syncing with hover
      if (shadowMeshRef.current) {
        shadowMeshRef.current.scale.set(
          1 - floatY * 0.8,
          1 - floatY * 0.8,
          1
        );
        shadowMeshRef.current.material.opacity = 0.65 - floatY * 1.2;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Resize handler
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
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      
      // Full resource disposal
      bottleGeometry.dispose();
      bottleMaterial.dispose();
      shadowGeometry.dispose();
      shadowMaterial.dispose();
      shadowTexture.dispose();
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
      className="relative w-full h-full flex items-center justify-center select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />
    </div>
  );
}

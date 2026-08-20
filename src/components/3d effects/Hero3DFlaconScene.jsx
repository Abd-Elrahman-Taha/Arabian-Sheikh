import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export default function Hero3DFlaconScene({
  activeProductIndex = 0, // 0: Luxury (Black Diamond), 1: Royal (Millionaire), 2: Classic (Ana Sukkar)
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
  const [loaded, setLoaded] = useState(false);

  const flaconImages = [
    '/products/black_diamond_gold.png', // Luxury (Default)
    '/products/millionaire_black.png',  // Royal
    '/products/ana_sukkar_white.png'   // Classic
  ];

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
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    // 4. Lighting Rig (Dark Luxury Haute Parfumerie)
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.9);
    scene.add(ambientLight);

    const warmKeyLight = new THREE.DirectionalLight(0xffdfa8, 2.4);
    warmKeyLight.position.set(3, 4, 3);
    scene.add(warmKeyLight);

    const coolRimLight = new THREE.DirectionalLight(0xd4e2ff, 1.2);
    coolRimLight.position.set(-3, 2, -2);
    scene.add(coolRimLight);

    const goldPointLight = new THREE.PointLight(0xd4af37, 2.0, 10);
    goldPointLight.position.set(0, -1.5, 2.5);
    scene.add(goldPointLight);
    lightSweepRef.current = goldPointLight;

    // 5. Texture Loader for the 3 real flacons
    const textureLoader = new THREE.TextureLoader();
    const textures = flaconImages.map(src => {
      const tex = textureLoader.load(src, () => {
        setLoaded(true);
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    });
    texturesRef.current = textures;

    // 6. Bottle Plane Mesh (Floating Flacon with realistic aspect ratio)
    // The flacons are approximately 1:1.75 aspect ratio
    const bottleGeometry = new THREE.PlaneGeometry(2.4, 4.2);
    const bottleMaterial = new THREE.MeshStandardMaterial({
      map: textures[activeProductIndex] || textures[0],
      transparent: true,
      roughness: 0.25,
      metalness: 0.15,
      side: THREE.DoubleSide
    });
    const bottleMesh = new THREE.Mesh(bottleGeometry, bottleMaterial);
    bottleMesh.position.set(0, 0.1, 0);
    scene.add(bottleMesh);
    bottleMeshRef.current = bottleMesh;

    // 7. Ambient Ground Shadow (Radial Gaussian gradient shadow beneath the bottle)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const radGrad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    radGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    radGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.45)');
    radGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = radGrad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(3.0, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -2.15, 0);
    scene.add(shadowMesh);
    shadowMeshRef.current = shadowMesh;

    // 8. Mouse Tilt & Parallax
    let targetRotX = 0;
    let targetRotY = 0;
    let targetLightX = 0;
    let isHovering = false;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.18;
      targetRotX = -y * 0.12;
      targetLightX = x * 2.5;
    };

    const handleMouseEnter = () => { isHovering = true; };
    const handleMouseLeave = () => {
      isHovering = false;
      targetRotX = 0;
      targetRotY = 0;
      targetLightX = 0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // 9. Render & Floating Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle levitation hover
      const floatY = Math.sin(elapsedTime * 1.5) * 0.08;
      if (bottleMeshRef.current) {
        bottleMeshRef.current.position.y = 0.1 + floatY;
        // Smooth rotation damping
        bottleMeshRef.current.rotation.y += (targetRotY - bottleMeshRef.current.rotation.y) * 0.08;
        bottleMeshRef.current.rotation.x += (targetRotX - bottleMeshRef.current.rotation.x) * 0.08;
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

      // Dynamic warm light sweep
      if (lightSweepRef.current) {
        lightSweepRef.current.position.x += (targetLightX - lightSweepRef.current.position.x) * 0.05;
        lightSweepRef.current.position.y = -1.5 + Math.cos(elapsedTime * 1.2) * 0.3;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 650;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      renderer.dispose();
    };
  }, []);

  // Handle active slide / tier change with smooth GSAP transition
  useEffect(() => {
    if (!bottleMeshRef.current || !texturesRef.current[activeProductIndex]) return;

    const mesh = bottleMeshRef.current;
    const newTex = texturesRef.current[activeProductIndex];

    gsap.to(mesh.material, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        mesh.material.map = newTex;
        mesh.material.needsUpdate = true;
        gsap.to(mesh.material, {
          opacity: 1,
          duration: 0.45,
          ease: 'power2.out'
        });
      }
    });

    // Slight punch scale on change
    gsap.fromTo(
      mesh.scale,
      { x: 0.94, y: 0.94, z: 0.94 },
      { x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(1.4)' }
    );
  }, [activeProductIndex]);

  // Fallback for non-WebGL devices
  if (!webglSupported) {
    return (
      <div className="relative w-full h-[520px] sm:h-[620px] flex items-center justify-center">
        <img
          src={flaconImages[activeProductIndex] || flaconImages[0]}
          alt="Arabian Sheikh Flacon"
          className="max-h-[85%] w-auto object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] animate-fade-in transition-all duration-500"
        />
        {/* Ambient shadow fallback */}
        <div className="absolute bottom-6 w-56 h-6 bg-black/60 rounded-full blur-xl pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] sm:h-[620px] lg:h-[680px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      title="Hover & drag to interact with the 3D flacon"
    >
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />

      {/* Subtle Specular Ambient Gold Glow Behind the Flacon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.18)_0%,_rgba(140,109,55,0.06)_45%,_transparent_70%)] blur-3xl pointer-events-none -z-10" />
    </div>
  );
}

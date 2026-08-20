import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import performanceManager from '../../utils/performanceManager';

/**
 * PalaceDoorCanvas Component
 * 
 * - Adaptive performance for high/balanced/low mobile & desktop devices
 * - Large screens (Desktop/Laptop): Immersive full-screen zoom taking the entire width & height
 * - Mobile Phones: Balanced proportional view fitting the vertical viewport
 * - 3D Palace Door (Door.glb) directly facing the camera with 90° Y rotation
 * - Warm Andalusian gold and amber studio lighting
 * - Plays embedded door opening animations via THREE.AnimationMixer on click
 * - Camera goes inside (dollies forward through opening portal)
 * - Complete VRAM & resource disposal when unmounted
 */
export default function PalaceDoorCanvas({
  isOpening = false,
  onDoorOpened,
  className = ''
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const doorGroupRef = useRef(null);
  const mixerRef = useRef(null);
  const glowLightRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isDesktop = width >= 768;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup
    const initialFov = isDesktop ? 46 : 42;
    const initialCameraZ = isDesktop ? 4.2 : 7.6;
    const initialCameraY = isDesktop ? 0.05 : 0;

    const camera = new THREE.PerspectiveCamera(initialFov, width / height, 0.1, 100);
    camera.position.set(0, initialCameraY, initialCameraZ);
    cameraRef.current = camera;

    // 3. WebGL Renderer with Optimal DPR
    const dpr = performanceManager.getOptimalDpr(1.25);
    const renderer = new THREE.WebGLRenderer({
      antialias: performanceManager.tier !== 'low',
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Enable shadows only on non-low tiers
    if (performanceManager.tier !== 'low') {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting System
    const ambientLight = new THREE.AmbientLight(0xF3E6D0, 1.6);
    scene.add(ambientLight);

    // Front direct golden key light
    const frontLight = new THREE.DirectionalLight(0xF2D675, 3.6);
    frontLight.position.set(0, 3.0, 6.0);
    scene.add(frontLight);

    // Left fill light
    const leftFill = new THREE.DirectionalLight(0xD8BE99, 1.8);
    leftFill.position.set(-4.0, 1.5, 4.0);
    scene.add(leftFill);

    // Right fill light
    const rightFill = new THREE.DirectionalLight(0xD8BE99, 1.8);
    rightFill.position.set(4.0, 1.5, 4.0);
    scene.add(rightFill);

    // Center focal point light on golden door carvings
    const centerPointLight = new THREE.PointLight(0xD4AF37, 3.8, 14);
    centerPointLight.position.set(0, 0, 2.0);
    scene.add(centerPointLight);

    // Radiant interior beam light piercing through as door opens
    const interiorGlow = new THREE.PointLight(0xD4AF37, 0.5, 25);
    interiorGlow.position.set(0, 0, -2.5);
    scene.add(interiorGlow);
    glowLightRef.current = interiorGlow;

    // 5. Door Model Group
    const doorRoot = new THREE.Group();
    scene.add(doorRoot);
    doorGroupRef.current = doorRoot;

    // 6. Load Door.glb with Embedded Animations & Rotate to Face Camera
    let loadedModel = null;
    const loader = new GLTFLoader();
    loader.load(
      '/models/Door.glb',
      (gltf) => {
        const model = gltf.scene;
        loadedModel = model;

        // Rotate 90° (Math.PI / 2) so wide front face (5.04m) faces camera directly!
        model.rotation.y = Math.PI / 2;
        model.updateMatrixWorld(true);

        // Auto-scale and center
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y);
        
        const baseScale = isDesktop ? 5.6 : 5.1;
        const scale = baseScale / maxDim;

        model.scale.set(scale, scale, scale);
        model.position.x = -center.x * scale;
        model.position.y = -center.y * scale - 0.05;
        model.position.z = -center.z * scale;

        // Optimize materials for smooth rendering
        model.traverse((child) => {
          if (child.isMesh) {
            if (performanceManager.tier !== 'low') {
              child.castShadow = true;
              child.receiveShadow = true;
            }
            if (child.material) {
              child.material.roughness = Math.min(child.material.roughness, 0.38);
              child.material.metalness = Math.max(child.material.metalness, 0.72);
            }
          }
        });

        // Initialize AnimationMixer with embedded clips
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;

          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopOnce);
            action.clampWhenFinished = true;
          });
        }

        doorRoot.add(model);
        setIsLoaded(true);
      },
      undefined,
      (err) => {
        console.warn('Door.glb load error:', err);
        setIsLoaded(true);
      }
    );

    // 7. Subtle floating gold dust particle field (reduced on low tier)
    const particleCount = performanceManager.tier === 'low' ? 20 : 45;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 10;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 5;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xD4AF37,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 8. Subtle Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.07;
      mouseY = y * 0.04;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 9. Animation Loop with Tab Sleep
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!performanceManager.isTabVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      targetRotX += (mouseY - targetRotX) * 0.05;
      targetRotY += (mouseX - targetRotY) * 0.05;

      if (doorRoot) {
        doorRoot.rotation.x = targetRotX;
        doorRoot.rotation.y = targetRotY + Math.sin(time * 0.3) * 0.005;
      }

      particleSystem.rotation.y = time * 0.015;

      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const isDesk = w >= 768;

      camera.aspect = w / h;
      camera.fov = isDesk ? 46 : 42;
      camera.position.z = isDesk ? 4.2 : 7.6;
      camera.position.y = isDesk ? 0.05 : 0;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Deep resource cleanup
      if (loadedModel) {
        loadedModel.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      }

      particleGeometry.dispose();
      particleMaterial.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (renderer.forceContextLoss) {
        renderer.forceContextLoss();
      }
    };
  }, []);

  // Handle Door Opening & Camera Zoom Inside
  useEffect(() => {
    if (!isOpening) return;

    if (mixerRef.current) {
      const mixer = mixerRef.current;
      mixer.timeScale = 1.0;
      const actions = mixer._actions || [];
      actions.forEach((act) => {
        act.reset();
        act.play();
      });
    }

    const camera = cameraRef.current;
    const glow = glowLightRef.current;
    const doorGroup = doorGroupRef.current;
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

    const tl = gsap.timeline({
      onComplete: () => {
        onDoorOpened?.();
      }
    });

    if (glow) {
      tl.to(glow, {
        intensity: 9.5,
        distance: 40,
        duration: 1.1,
        ease: 'power2.in'
      }, 0);
    }

    if (camera) {
      const targetZ = isDesktop ? -1.0 : 0.2;
      tl.to(camera.position, {
        z: targetZ,
        y: 0.1,
        duration: 1.6,
        ease: 'power2.inOut'
      }, 0.2);
    }

    if (doorGroup) {
      tl.to(doorGroup.position, {
        z: 1.4,
        duration: 1.6,
        ease: 'power2.inOut'
      }, 0.2);
    }
  }, [isOpening, onDoorOpened]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative ${className}`}
      style={{ touchAction: 'none' }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
          <div className="w-10 h-10 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin shadow-lg" />
          <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#F2D675]">
            Opening Imperial Sanctuary...
          </span>
        </div>
      )}
    </div>
  );
}

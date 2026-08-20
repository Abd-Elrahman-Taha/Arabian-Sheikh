import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export default function PerfumeBottleCanvas({
  activeProductIndex = 0,
  liquidColor = '#D4AF37',
  className = '',
  enableInteractiveRotation = true
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const bottleGroupRef = useRef(null);
  const liquidMeshRef = useRef(null);
  const mouseLightRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fragrance color palettes for liquid & internal highlights
  const LIQUID_COLORS = [
    { liquid: '#D4AF37', glow: '#F2D675', cap: '#D4AF37' }, // 01 Dehn Al Oud Royal
    { liquid: '#D4AF37', glow: '#F2D675', cap: '#F2D675' }, // 02 Amber Al Malaki
    { liquid: '#3A2116', glow: '#D8BE99', cap: '#D4AF37' }, // 03 Rose de Taif
    { liquid: '#21130D', glow: '#D8BE99', cap: '#D8BE99' }, // 04 Misk Al Layl
    { liquid: '#3A2116', glow: '#F2D675', cap: '#D4AF37' }, // 05 Sarab Bakhoor
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.2);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting Rig (Cinematic Swiss / Haute Parfumerie Dark Studio)
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.SpotLight(0xfffaed, 3.8);
    keyLight.position.set(3.5, 4.5, 4.0);
    keyLight.angle = 0.55;
    keyLight.penumbra = 0.8;
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd4e2ff, 1.4);
    fillLight.position.set(-3.5, 1.5, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.SpotLight(0xffd599, 4.2);
    rimLight.position.set(0, 4.5, -3.5);
    rimLight.angle = 0.6;
    rimLight.penumbra = 0.7;
    scene.add(rimLight);

    const mouseLight = new THREE.PointLight(0xffdfa8, 2.2, 12);
    mouseLight.position.set(0, 0, 4.0);
    scene.add(mouseLight);
    mouseLightRef.current = mouseLight;

    const upLight = new THREE.PointLight(0xff9922, 1.8, 8);
    upLight.position.set(0, -2.8, 1.0);
    scene.add(upLight);

    // 5. Master Perfume Bottle Construction
    const bottleGroup = new THREE.Group();
    bottleGroupRef.current = bottleGroup;
    scene.add(bottleGroup);
    bottleGroup.position.set(0, -0.15, 0);

    // ── Glass Outer Body (Faceted Luxury Crystal Flacon) ──
    const glassGeometry = new THREE.BoxGeometry(2.3, 3.2, 1.35, 16, 16, 16);
    const pos = glassGeometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const edgeFactor = Math.pow(Math.abs(vx) / 1.15, 6) + Math.pow(Math.abs(vz) / 0.67, 6);
      if (edgeFactor > 1.0) {
        pos.setX(i, vx * 0.96);
        pos.setZ(i, vz * 0.96);
      }
    }
    glassGeometry.computeVertexNormals();

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x161514),
      transmission: 0.88,
      opacity: 1,
      transparent: true,
      roughness: 0.04,
      metalness: 0.08,
      ior: 1.54,
      thickness: 1.9,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.9
    });

    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    glassMesh.castShadow = true;
    glassMesh.receiveShadow = true;
    bottleGroup.add(glassMesh);

    // ── Internal Perfume Liquid ──
    const liquidGeometry = new THREE.BoxGeometry(2.05, 2.7, 1.1, 8, 8, 8);
    const initialColor = LIQUID_COLORS[activeProductIndex % LIQUID_COLORS.length];
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(initialColor.liquid),
      transmission: 0.68,
      transparent: true,
      opacity: 0.92,
      roughness: 0.12,
      metalness: 0.15,
      ior: 1.42,
      thickness: 1.4,
      attenuationColor: new THREE.Color(initialColor.glow),
      attenuationDistance: 0.9
    });
    const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquidMesh.position.set(0, -0.18, 0);
    liquidMeshRef.current = liquidMesh;
    bottleGroup.add(liquidMesh);

    // ── Internal Dip Tube ──
    const tubeGeo = new THREE.CylinderGeometry(0.022, 0.022, 2.8, 12);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      transmission: 0.95,
      transparent: true,
      roughness: 0.05,
      ior: 1.48
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    tubeMesh.position.set(0, -0.15, 0);
    bottleGroup.add(tubeMesh);

    // ── Gold Collar / Neck Ring ──
    const neckGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.55, 32);
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd4af37),
      metalness: 0.94,
      roughness: 0.24,
      envMapIntensity: 2.0
    });
    const neckMesh = new THREE.Mesh(neckGeo, goldMaterial);
    neckMesh.position.set(0, 1.78, 0);
    bottleGroup.add(neckMesh);

    const ringGeo = new THREE.TorusGeometry(0.53, 0.024, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeo, goldMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, 1.68, 0);
    bottleGroup.add(ringMesh);

    const ringMesh2 = new THREE.Mesh(ringGeo, goldMaterial);
    ringMesh2.rotation.x = Math.PI / 2;
    ringMesh2.position.set(0, 1.88, 0);
    bottleGroup.add(ringMesh2);

    // ── 24K Gold Crown / Cap ──
    const capBaseGeo = new THREE.CylinderGeometry(0.72, 0.68, 0.95, 8);
    const capBaseMesh = new THREE.Mesh(capBaseGeo, goldMaterial);
    capBaseMesh.position.set(0, 2.45, 0);
    capBaseMesh.castShadow = true;
    bottleGroup.add(capBaseMesh);

    const crownGeo = new THREE.SphereGeometry(0.48, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const crownMesh = new THREE.Mesh(crownGeo, goldMaterial);
    crownMesh.position.set(0, 2.92, 0);
    crownMesh.scale.set(1.4, 0.6, 1.4);
    bottleGroup.add(crownMesh);

    // ── Front Metallic Logo Plaque ──
    const plaqueGeo = new THREE.PlaneGeometry(1.45, 1.15);
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512;
    labelCanvas.height = 384;
    const ctx = labelCanvas.getContext('2d');
    ctx.fillStyle = '#21130D';
    ctx.fillRect(0, 0, 512, 384);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 480, 352);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(26, 26, 460, 332);
    
    ctx.fillStyle = '#F2D675';
    ctx.font = 'bold 44px "IBM Plex Sans Arabic", "Amiri", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('سَـراب', 256, 130);
    
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 20px "Cinzel", "Inter", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('SARAB', 256, 195);
    
    ctx.fillStyle = '#D8BE99';
    ctx.font = '13px "Inter", sans-serif';
    ctx.fillText('EXTRAIT DE PARFUM', 256, 245);
    ctx.fillText('60 ML • 2.0 FL. OZ', 256, 280);

    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    labelTexture.anisotropy = 8;

    const plaqueMat = new THREE.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.35,
      metalness: 0.65
    });
    const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaqueMesh.position.set(0, -0.15, 0.685);
    bottleGroup.add(plaqueMesh);

    // ── Soft Ground Shadow Plane ──
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const radGrad = sCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    radGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
    radGrad.addColorStop(0.35, 'rgba(0,0,0,0.45)');
    radGrad.addColorStop(0.7, 'rgba(0,0,0,0.1)');
    radGrad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = radGrad;
    sCtx.fillRect(0, 0, 256, 256);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);

    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, -1.78, 0);
    scene.add(shadowPlane);

    // Initial Entrance Animation
    gsap.fromTo(
      bottleGroup.scale,
      { x: 0.85, y: 0.85, z: 0.85 },
      { x: 1.0, y: 1.0, z: 1.0, duration: 1.8, ease: 'power3.out' }
    );
    gsap.fromTo(
      bottleGroup.rotation,
      { y: -0.35, x: 0.08 },
      { y: 0.05, x: 0.0, duration: 2.2, ease: 'power2.out' }
    );

    setIsLoaded(true);

    // Animation & Render Loop with Smooth Damping
    let animationFrameId;
    let targetRotationY = 0.05;
    let targetRotationX = 0.0;
    let currentRotationY = 0.05;
    let currentRotationX = 0.0;

    let targetLightX = 0;
    let targetLightY = 0;

    const animate = (time) => {
      animationFrameId = requestAnimationFrame(animate);

      const t = time * 0.0012;
      bottleGroup.position.y = -0.15 + Math.sin(t) * 0.04;

      currentRotationY += (targetRotationY - currentRotationY) * 0.06;
      currentRotationX += (targetRotationX - currentRotationX) * 0.06;

      bottleGroup.rotation.y = currentRotationY;
      bottleGroup.rotation.x = currentRotationX;

      if (mouseLightRef.current) {
        mouseLightRef.current.position.x += (targetLightX - mouseLightRef.current.position.x) * 0.08;
        mouseLightRef.current.position.y += (targetLightY - mouseLightRef.current.position.y) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate(0);

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const normX = (clientX / rect.width - 0.5) * 2;
      const normY = (clientY / rect.height - 0.5) * 2;

      targetRotationY = 0.05 + normX * 0.12;
      targetRotationX = -normY * 0.08;

      targetLightX = normX * 3.5;
      targetLightY = -normY * 2.5;
    };

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  useEffect(() => {
    if (!liquidMeshRef.current) return;
    const colorObj = LIQUID_COLORS[activeProductIndex % LIQUID_COLORS.length];
    
    gsap.to(liquidMeshRef.current.material.color, {
      r: new THREE.Color(colorObj.liquid).r,
      g: new THREE.Color(colorObj.liquid).g,
      b: new THREE.Color(colorObj.liquid).b,
      duration: 1.0,
      ease: 'power2.inOut'
    });

    if (bottleGroupRef.current) {
      gsap.to(bottleGroupRef.current.rotation, {
        y: bottleGroupRef.current.rotation.y + 0.35,
        duration: 0.4,
        ease: 'power1.out',
        yoyo: true,
        repeat: 1
      });
    }
  }, [activeProductIndex]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}
      data-cursor="explore"
    >
      {/* Warm Cinematic Studio Spotlight Behind Bottle */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[320px] sm:w-[420px] lg:w-[480px] h-[320px] sm:h-[420px] lg:h-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,161,92,0.22)_0%,rgba(184,137,90,0.10)_35%,rgba(10,10,9,0)_70%)] blur-2xl transition-all duration-700 -z-10" />
      </div>

      {/* Subtle 3D Tag Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-[9px] font-mono tracking-widest text-[#D8BE99] uppercase pointer-events-none opacity-60 hover:opacity-100 transition-opacity">
        3D INTERACTIVE FLACON • 360°
      </div>
    </div>
  );
}

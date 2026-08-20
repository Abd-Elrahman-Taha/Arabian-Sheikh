import React, { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Smoke, getMultiColorParticleMaterialGenerator } from "react-smoke";

/**
 * BakhoorSmoke Component
 * 
 * Renders a soft, organic, multi-tonal Arabian incense (Bakhoor) smoke plume.
 * Uses warm champagne (#F3E6D0), soft ivory (#F3E6D0), and subtle golden amber (#D8BE99)
 * color harmonies to reflect luxury Arabian perfumery heritage.
 */
export default function BakhoorSmoke({
  visible = true,
  opacity = 0.35,
}) {
  const groupRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport for particle density optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Multi-color palette reflecting sacred Bakhoor incense & warm amber
  const materialGenerator = useMemo(() => {
    return getMultiColorParticleMaterialGenerator([
      new THREE.Color("#F3E6D0"), // Signature warm off-white / Bakhoor
      new THREE.Color("#F3E6D0"), // Ethereal incense veil highlight
      new THREE.Color("#F3E6D0"), // Soft warm champagne body
      new THREE.Color("#D8BE99"), // Subtle golden majlis amber accent
    ]);
  }, []);

  // Subtle organic thermal expansion and slow upward drift
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.y += delta * 5.0;
      // Gentle outward thermal plume expansion
      if (groupRef.current.scale.x < 1.25) {
        groupRef.current.scale.x += delta * 0.03;
        groupRef.current.scale.y += delta * 0.04;
        groupRef.current.scale.z += delta * 0.03;
      }
    }
  });

  if (!visible) {
    return null;
  }

  // Mobile: 24 particles (60fps on phones), Desktop: 36 particles
  const particleDensity = isMobile ? 24 : 36;

  return (
    <group ref={groupRef} position={[0, -50, 0]}>
      <Smoke
        particleMaterial={materialGenerator}
        density={particleDensity}
        opacity={opacity}
        enableRotation={true}
        rotation={[0.012, 0.018, 0.038]}
        enableTurbulence={true}
        turbulenceStrength={[0.012, 0.016, 0.006]}
        enableWind={true}
        windStrength={[0.010, 0.024, 0.006]}
        windDirection={[0.04, 1, 0.02]}
        size={[720, 720, 720]}
        minBounds={[-420, -380, -320]}
        maxBounds={[420, 420, 320]}
        maxVelocity={[15, 24, 10]}
        enableFrustumCulling={true}
      />
    </group>
  );
}
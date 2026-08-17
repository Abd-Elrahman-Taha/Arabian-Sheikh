import { useMemo } from "react";
import * as THREE from "three";
import { Smoke } from "react-smoke";

export default function BakhoorSmoke({
  visible = true,
  opacity = 0.35,
}) {
  const smokeColor = useMemo(
    () => new THREE.Color("#EADED2"),
    []
  );

  if (!visible) {
    return null;
  }

  return (
    <group position={[0, 0, -1]}>
      <Smoke
        color={smokeColor}
        density={35}
        opacity={opacity}
        enableRotation={true}
        enableTurbulence={true}
        turbulenceStrength={[0.015, 0.025, 0.01]}
        enableWind={true}
        windStrength={[0.01, 0.02, 0]}
        windDirection={[0.15, 1, 0]}
        rotation={[0, 0, 0.15]}
        size={[700, 700, 700]}
      />
    </group>
  );
}
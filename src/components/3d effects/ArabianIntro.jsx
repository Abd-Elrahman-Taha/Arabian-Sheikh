import {
  Canvas,
  useFrame,
} from "@react-three/fiber";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

import * as THREE from "three";

import { gsap } from "gsap";

import BakhoorSmoke from "./BakhoorSmoke";


/*
|--------------------------------------------------------------------------
| Door Scene
|--------------------------------------------------------------------------
*/

function DoorScene({
  isOpening,
  onFinished,
}) {
  const leftDoor = useRef<THREE.Group>(null);
  const rightDoor = useRef<THREE.Group>(null);

  const smokeGroup = useRef<THREE.Group>(null);

  const [smokeVisible, setSmokeVisible] = useState(false);

  useEffect(() => {
    if (!isOpening) return;

    const timeline = gsap.timeline({
      onComplete: onFinished,
    });

    /*
    |--------------------------------------------------------------------------
    | Door Animation
    |--------------------------------------------------------------------------
    */

    if (leftDoor.current && rightDoor.current) {
      timeline.to(
        leftDoor.current.rotation,
        {
          y: -Math.PI / 2,
          duration: 1.5,
          ease: "power3.inOut",
        },
        0
      );

      timeline.to(
        rightDoor.current.rotation,
        {
          y: Math.PI / 2,
          duration: 1.5,
          ease: "power3.inOut",
        },
        0
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Bakhoor starts after doors begin opening
    |--------------------------------------------------------------------------
    */

    timeline.call(
      () => {
        setSmokeVisible(true);
      },
      [],
      0.55
    );

    /*
    |--------------------------------------------------------------------------
    | Smoke movement
    |--------------------------------------------------------------------------
    */

    if (smokeGroup.current) {
      timeline.fromTo(
        smokeGroup.current.scale,
        {
          x: 0.5,
          y: 0.5,
          z: 0.5,
        },
        {
          x: 1.5,
          y: 1.6,
          z: 1.5,
          duration: 1.7,
          ease: "power2.out",
        },
        0.6
      );
    }

    return () => {
      timeline.kill();
    };
  }, [isOpening, onFinished]);

  return (
    <>

      {/* Background */}

      <mesh position={[0, 2, -4]}>
        <planeGeometry args={[30, 20]} />

        <meshStandardMaterial
          color="#130C05"
        />
      </mesh>


      {/* Warm palace light */}

      <pointLight
        position={[0, 3, -2]}
        intensity={25}
        distance={15}
        color="#D2A55F"
      />


      {/* Left Door */}

      <group
        ref={leftDoor}
        position={[-1.7, 1.8, 0]}
      >

        <mesh position={[0.85, 0, 0]}>
          <boxGeometry
            args={[1.7, 3.6, 0.25]}
          />

          <meshStandardMaterial
            color="#5A2D18"
            metalness={0.65}
            roughness={0.3}
          />
        </mesh>


        {/* Gold decoration */}

        <mesh position={[0.85, 0, 0.15]}>
          <boxGeometry
            args={[1.3, 2.9, 0.04]}
          />

          <meshStandardMaterial
            color="#D2A55F"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

      </group>


      {/* Right Door */}

      <group
        ref={rightDoor}
        position={[1.7, 1.8, 0]}
      >

        <mesh position={[-0.85, 0, 0]}>
          <boxGeometry
            args={[1.7, 3.6, 0.25]}
          />

          <meshStandardMaterial
            color="#5A2D18"
            metalness={0.65}
            roughness={0.3}
          />
        </mesh>


        {/* Gold decoration */}

        <mesh position={[-0.85, 0, 0.15]}>
          <boxGeometry
            args={[1.3, 2.9, 0.04]}
          />

          <meshStandardMaterial
            color="#D2A55F"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

      </group>


      {/* Bakhoor */}

      <group
        ref={smokeGroup}
        position={[0, 1.2, -0.7]}
      >

        <BakhoorSmoke
          visible={smokeVisible}
          opacity={0.4}
        />

      </group>


      {/* Ground */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >

        <planeGeometry args={[30, 30]} />

        <meshStandardMaterial
          color="#130C05"
          roughness={0.8}
        />

      </mesh>

    </>
  );
}


/*
|--------------------------------------------------------------------------
| Arabian Intro
|--------------------------------------------------------------------------
*/

export default function ArabianIntro({
  onComplete,
}) {

  const [isOpening, setIsOpening] =
    useState(false);

  const [isFinished, setIsFinished] =
    useState(false);

  const [reducedMotion, setReducedMotion] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | Check reduced motion
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const mediaQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    setReducedMotion(mediaQuery.matches);

    if (mediaQuery.matches) {
      finishIntro();
    }

  }, []);


  /*
  |--------------------------------------------------------------------------
  | Finish Intro
  |--------------------------------------------------------------------------
  */

  const finishIntro = () => {

    setIsFinished(true);

    localStorage.setItem(
      "arabian_intro_seen",
      "true"
    );

    onComplete?.();

  };


  /*
  |--------------------------------------------------------------------------
  | Check if intro was already seen
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const hasSeenIntro =
      localStorage.getItem(
        "arabian_intro_seen"
      );

    if (hasSeenIntro === "true") {

      setIsFinished(true);

      onComplete?.();

    }

  }, [onComplete]);


  /*
  |--------------------------------------------------------------------------
  | Open door
  |--------------------------------------------------------------------------
  */

  const handleOpen = () => {

    if (isOpening || isFinished) {
      return;
    }

    setIsOpening(true);

  };


  /*
  |--------------------------------------------------------------------------
  | Skip
  |--------------------------------------------------------------------------
  */

  const handleSkip = () => {

    finishIntro();

  };


  /*
  |--------------------------------------------------------------------------
  | Don't render after intro
  |--------------------------------------------------------------------------
  */

  if (isFinished || reducedMotion) {
    return null;
  }


  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#130C05]"
      onClick={handleOpen}
    >

      {/* Three.js Canvas */}

      <Canvas
        camera={{
          position: [0, 2, 8],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}

        dpr={[1, 1.5]}

        gl={{
          antialias: true,
          alpha: false,
        }}
      >

        <ambientLight
          intensity={1.2}
        />

        <directionalLight
          position={[5, 8, 5]}
          intensity={3}
          color="#FFF1D0"
        />


        <Suspense fallback={null}>

          <DoorScene
            isOpening={isOpening}
            onFinished={finishIntro}
          />

        </Suspense>

      </Canvas>


      {/* Skip button */}

      <button
        onClick={(event) => {
          event.stopPropagation();
          handleSkip();
        }}

        className="
          absolute
          right-6
          top-6
          z-[10000]

          rounded-full

          border
          border-[#D2A55F]

          bg-[#130C05]/70

          px-5
          py-2

          text-sm
          tracking-[0.2em]
          uppercase

          text-[#EADED2]

          backdrop-blur-md

          transition-all
          duration-300

          hover:bg-[#D2A55F]
          hover:text-[#130C05]
        "
      >
        Skip
      </button>


      {/* Click instruction */}

      {!isOpening && (

        <div
          className="
            pointer-events-none

            absolute
            bottom-10
            left-1/2

            -translate-x-1/2

            text-center

            text-[#EADED2]
          "
        >

          <p
            className="
              text-xs
              tracking-[0.35em]
              uppercase
              opacity-70
            "
          >
            Enter the Palace
          </p>

          <p
            className="
              mt-2
              text-xs
              opacity-50
            "
          >
            Tap anywhere to open
          </p>

        </div>

      )}

    </div>
  );
}
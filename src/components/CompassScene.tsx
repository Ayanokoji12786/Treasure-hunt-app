import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePointerParallax } from "../hooks/usePointerParallax";

export type NeedleTarget = "left" | "right" | "idle";

const GOLD = "#C99A45";
const SOFT_GOLD = "#E7C879";
const RAISED = "#131922";
const BLUE = "#6BB8FF";

function CompassModel({ needleTarget }: { needleTarget: NeedleTarget }) {
  const groupRef = useRef<THREE.Group>(null);
  const needleRef = useRef<THREE.Group>(null);
  const pointer = usePointerParallax();
  const idlePhase = useRef(0);

  const targetAngle = useMemo(() => {
    if (needleTarget === "left") return Math.PI * 0.32;
    if (needleTarget === "right") return -Math.PI * 0.32;
    return null;
  }, [needleTarget]);

  const ticks = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return { a, long: i % 6 === 0 };
      }),
    [],
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      const targetRotY = pointer.current.x * THREE.MathUtils.degToRad(5);
      const targetRotX = -pointer.current.y * THREE.MathUtils.degToRad(3);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 4, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 4, delta);
    }
    if (needleRef.current) {
      let angle: number;
      if (targetAngle === null) {
        idlePhase.current += delta * 0.5;
        angle = Math.sin(idlePhase.current) * THREE.MathUtils.degToRad(9);
      } else {
        angle = targetAngle;
      }
      needleRef.current.rotation.y = THREE.MathUtils.damp(needleRef.current.rotation.y, angle, 3.2, delta);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.32, 0.11, 32, 64]} />
        <meshStandardMaterial color={GOLD} metalness={0.92} roughness={0.2} />
      </mesh>

      <mesh>
        <cylinderGeometry args={[1.22, 1.24, 0.36, 64]} />
        <meshStandardMaterial color={RAISED} metalness={0.7} roughness={0.4} />
      </mesh>

      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[1.15, 1.15, 0.02, 64]} />
        {/* No `transmission`: it forces three to re-render the entire scene into an
            offscreen buffer every frame to fake refraction — far too costly for a
            ~176px canvas. A translucent clearcoated pane reads as glass here. */}
        <meshPhysicalMaterial
          color={RAISED}
          transparent
          opacity={0.5}
          roughness={0.05}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {ticks.map(({ a, long }, i) => (
        <mesh
          key={i}
          position={[Math.cos(a) * 1.0, 0.2, Math.sin(a) * 1.0]}
          rotation={[0, -a, 0]}
        >
          <boxGeometry args={[0.018, 0.01, long ? 0.13 : 0.06]} />
          <meshStandardMaterial color={SOFT_GOLD} metalness={0.8} roughness={0.3} emissive={GOLD} emissiveIntensity={0.2} />
        </mesh>
      ))}

      <group ref={needleRef} position={[0, 0.21, 0]}>
        <mesh position={[0, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.075, 0.5, 4]} />
          <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.18} emissive={GOLD} emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0, 0, -0.32]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.075, 0.5, 4]} />
          <meshStandardMaterial color="#F5F5F3" metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.085, 16, 16]} />
          <meshStandardMaterial color={SOFT_GOLD} metalness={0.9} roughness={0.15} />
        </mesh>
      </group>
    </group>
  );
}

export function CompassScene({ needleTarget = "idle" }: { needleTarget?: NeedleTarget }) {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 3.1], fov: 38 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 4, 3]} intensity={45} color={SOFT_GOLD} />
      <pointLight position={[-3, 1.5, -2]} intensity={18} color={BLUE} />
      <CompassModel needleTarget={needleTarget} />
    </Canvas>
  );
}

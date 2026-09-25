import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Line } from "@react-three/drei";
import * as THREE from "three";
import { mapRange } from "../lib/mapRange";
import { usePointerParallax } from "../hooks/usePointerParallax";

const GOLD = "#C99A45";
const BORDER = "#242932";
const SURFACE = "#0D1117";
// Buildings are cool neutral slate — clearly lighter than the ground but no gold,
// which stays reserved for the route and waypoints.
const BUILDING = "#3d4859";
const BUILDING_GLOW = "#1c2534";
const BUILDING_EDGE = "#8b96a8";

// Ground-plane waypoints for the route the camera follows — a fresh, 3D-native
// layout rather than reusing the old SVG scene's 2D coordinates.
const WAYPOINTS = [
  { x: -4.4, z: 2.4 },
  { x: -1.9, z: 1.1 },
  { x: 0.6, z: 1.8 },
  { x: 2.6, z: -0.5 },
  { x: 4.5, z: -2.1 },
];
const FINAL = WAYPOINTS[WAYPOINTS.length - 1];

const BUILDINGS = [
  { x: -3.2, z: -1.4, w: 0.5, d: 0.5, h: 1.1 },
  { x: -2.2, z: 2.8, w: 0.7, d: 0.6, h: 0.7 },
  { x: -0.6, z: -1.9, w: 0.55, d: 0.9, h: 1.5 },
  { x: 0.2, z: 3.2, w: 0.6, d: 0.6, h: 0.9 },
  { x: 1.8, z: 1.6, w: 0.5, d: 0.5, h: 1.8 },
  { x: 3.2, z: 2.4, w: 0.65, d: 0.55, h: 0.6 },
  { x: 3.6, z: -3.1, w: 0.55, d: 0.7, h: 1.3 },
  { x: -4.8, z: -0.6, w: 0.5, d: 0.5, h: 0.8 },
];

// Camera choreography: overview -> descending toward the final waypoint, matching
// the same 0.44-0.68 scroll band the old SVG sceneScale used.
const CAM_PROGRESS = [0, 0.44, 0.68];
const CAM_X = [0, FINAL.x * 0.35, FINAL.x * 0.8];
const CAM_Y = [7.2, 3.4, 1.5];
const CAM_Z = [9.5, FINAL.z * 0.4 + 5, FINAL.z * 0.7 + 1.6];
const LOOK_X = [0, FINAL.x * 0.6, FINAL.x];
const LOOK_Y = [0, 0.3, 0.5];
const LOOK_Z = [0, FINAL.z * 0.6, FINAL.z];

const WP_THRESHOLDS = [0.14, 0.2, 0.26, 0.32, 0.38];
const ROUTE_DRAW_RANGE = [0.1, 0.4];

/** Terrain elevation at local plane coords. Single source of truth: the mesh is built
 * from it AND everything that sits on the ground (route, waypoints, buildings) is
 * placed with it. Placing them at a fixed height buried ~46% of the route under the
 * hills — the gold line visibly died at waypoint 3 where the ground rises to 0.16. */
function elevation(x: number, yLocal: number): number {
  return Math.sin(x * 0.4) * Math.cos(yLocal * 0.35) * 0.16 + Math.sin(x * 0.9 + yLocal * 0.6) * 0.05;
}

/** Ground height at a world (x, z). The plane is rotated -90deg about X, which maps
 * its local y to world -z. */
function terrainHeight(x: number, z: number): number {
  return elevation(x, -z);
}

const ROUTE_LIFT = 0.07;
const SAMPLES_PER_SEGMENT = 18;

// The whole route resampled densely, each point riding the terrain surface.
const ROUTE_POINTS: [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  for (let s = 0; s < WAYPOINTS.length - 1; s++) {
    const a = WAYPOINTS[s];
    const b = WAYPOINTS[s + 1];
    for (let i = 0; i < SAMPLES_PER_SEGMENT; i++) {
      const t = i / SAMPLES_PER_SEGMENT;
      const x = a.x + (b.x - a.x) * t;
      const z = a.z + (b.z - a.z) * t;
      out.push([x, terrainHeight(x, z) + ROUTE_LIFT, z]);
    }
  }
  const end = WAYPOINTS[WAYPOINTS.length - 1];
  out.push([end.x, terrainHeight(end.x, end.z) + ROUTE_LIFT, end.z]);
  return out;
})();

function partialRoute(fraction: number): [number, number, number][] {
  const last = ROUTE_POINTS.length - 1;
  const exact = Math.max(0, Math.min(1, fraction)) * last;
  const full = Math.floor(exact);
  const rem = exact - full;
  const out = ROUTE_POINTS.slice(0, full + 1);
  // Skip a near-zero remainder: a duplicate point makes a zero-length segment, which
  // fat-line shaders render as a glitchy spike.
  if (full < last && rem > 0.01) {
    const a = ROUTE_POINTS[full];
    const b = ROUTE_POINTS[full + 1];
    out.push([a[0] + (b[0] - a[0]) * rem, a[1] + (b[1] - a[1]) * rem, a[2] + (b[2] - a[2]) * rem]);
  }
  return out;
}

function CameraRig({ progressRef }: { progressRef: React.RefObject<number> }) {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(CAM_X[0], CAM_Y[0], CAM_Z[0]));
  const look = useRef(new THREE.Vector3(LOOK_X[0], LOOK_Y[0], LOOK_Z[0]));
  // Reused every frame — allocating fresh vectors inside useFrame is 120 short-lived
  // objects a second of pure GC pressure for a value that's just overwritten.
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const p = progressRef.current;
    targetPos.current.set(
      mapRange(p, CAM_PROGRESS, CAM_X),
      mapRange(p, CAM_PROGRESS, CAM_Y),
      mapRange(p, CAM_PROGRESS, CAM_Z),
    );
    targetLook.current.set(
      mapRange(p, CAM_PROGRESS, LOOK_X),
      mapRange(p, CAM_PROGRESS, LOOK_Y),
      mapRange(p, CAM_PROGRESS, LOOK_Z),
    );
    const t = Math.min(1, delta * 3);
    pos.current.lerp(targetPos.current, t);
    look.current.lerp(targetLook.current, t);
    camera.position.copy(pos.current);
    camera.lookAt(look.current);
  });

  return null;
}

function Terrain() {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(16, 11, 56, 40);
    const position = g.attributes.position;
    for (let i = 0; i < position.count; i++) {
      position.setZ(i, elevation(position.getX(i), position.getY(i)));
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color={SURFACE} metalness={0.3} roughness={0.85} />
      </mesh>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <meshBasicMaterial color={BORDER} wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function Buildings() {
  return (
    <group>
      {BUILDINGS.map((b, i) => (
        // Base sits on the ground at this spot (slightly embedded), not at world y=0.
        <mesh key={i} position={[b.x, terrainHeight(b.x, b.z) + b.h / 2 - 0.03, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          {/* Deliberately lighter than the ground: on SURFACE-on-SURFACE the towers were
              pure black silhouettes. A faint emissive lifts the unlit faces so every
              side reads, and the brighter edge line traces the form. */}
          <meshStandardMaterial
            color={BUILDING}
            emissive={BUILDING_GLOW}
            emissiveIntensity={0.7}
            metalness={0.25}
            roughness={0.55}
          />
          <Edges color={BUILDING_EDGE} />
        </mesh>
      ))}
    </group>
  );
}

function RouteAndWaypoints({ progress, progressRef }: { progress: number; progressRef: React.RefObject<number> }) {
  const waypointRefs = useRef<(THREE.Mesh | null)[]>([]);

  // The route line is driven declaratively by the `progress` prop (drei's <Line>
  // updates its own geometry via `points`, not via a ref you mutate imperatively —
  // that was tried first and silently did nothing, no thrown error, because the
  // ref this component receives isn't the raw BufferGeometry the naive
  // `.setFromPoints()` call assumed).
  const fraction = mapRange(progress, ROUTE_DRAW_RANGE, [0, 1]);
  // Memoized on the fraction: outside the draw range it's clamped to 0 or 1, so the
  // array keeps its identity and drei's <Line> doesn't rebuild geometry on every
  // scroll tick that changes nothing about the route.
  const points = useMemo(() => partialRoute(fraction), [fraction]);

  useFrame(() => {
    const p = progressRef.current;
    WAYPOINTS.forEach((_, i) => {
      const mesh = waypointRefs.current[i];
      if (!mesh) return;
      const revealed = p >= WP_THRESHOLDS[i] - 0.04;
      const targetScale = revealed ? (i === WAYPOINTS.length - 1 ? 1.3 : 1) : 0.001;
      mesh.scale.setScalar(THREE.MathUtils.damp(mesh.scale.x, targetScale, 6, 0.016));
    });
  });

  return (
    <group>
      {points.length > 1 && <Line points={points} color={GOLD} lineWidth={3} />}
      {WAYPOINTS.map((wp, i) => (
        <mesh
          key={i}
          ref={(el) => { waypointRefs.current[i] = el; }}
          position={[wp.x, terrainHeight(wp.x, wp.z) + ROUTE_LIFT + 0.1, wp.z]}
          scale={0.001}
        >
          <octahedronGeometry args={[0.14, 0]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.6} metalness={0.7} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ progress, progressRef }: { progress: number; progressRef: React.RefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const pointer = usePointerParallax();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Parallax fades out as the camera commits to its scroll-driven descent —
    // mixing free mouse-tilt with a directed camera move reads as jitter, not depth.
    const fade = 1 - Math.min(1, progressRef.current / 0.3);
    const targetRotY = pointer.current.x * THREE.MathUtils.degToRad(5) * fade;
    const targetRotX = -pointer.current.y * THREE.MathUtils.degToRad(3) * fade;
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 4, delta);
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 4, delta);
  });

  return (
    <group ref={groupRef}>
      <Terrain />
      <Buildings />
      <RouteAndWaypoints progress={progress} progressRef={progressRef} />
    </group>
  );
}

export function TerrainScene({
  progress,
  progressRef,
  active = true,
}: {
  progress: number;
  progressRef: React.RefObject<number>;
  /** False once the scene has faded out — the render loop stops but the WebGL
   * context stays alive, so scrolling back up resumes instantly with no remount. */
  active?: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      shadows={false}
      frameloop={active ? "always" : "never"}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 8, 4]} intensity={1.1} color="#F5F5F3" />
      <pointLight position={[FINAL.x, 2.5, FINAL.z]} intensity={12} color={GOLD} />
      <fog attach="fog" args={[SURFACE, 8, 18]} />
      <Scene progress={progress} progressRef={progressRef} />
      <CameraRig progressRef={progressRef} />
    </Canvas>
  );
}

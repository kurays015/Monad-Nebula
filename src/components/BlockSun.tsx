import { useRef } from "react";
import { Html, Torus } from "@react-three/drei";
import * as THREE from "three";
import useGetLatestBlock from "@/hooks/useGetLatestBlock";
import { useSpring, animated } from "@react-spring/web";

export default function BlockSun() {
  const { data: latestBlock, isLoading, isError, error } = useGetLatestBlock();
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Animated TPS value
  const tpsSpring = useSpring({
    tps: latestBlock?.TPS,
    config: { tension: 120, friction: 14 },
  });

  // Pulse animation for the label
  const pulse = useSpring({
    boxShadow: `0 0 60px 10px #836EF9${Math.floor(
      80 + 40 * Math.abs(Math.sin(Date.now() / 500))
    ).toString(16)}`,
    from: { boxShadow: "0 0 16px #836EF980" },
    loop: true,
    config: { duration: 1000 },
  });

  if (isLoading || !latestBlock)
    return <div className="text-slate-400">Loading...</div>;
  if (isError)
    return <div className="text-slate-400">Error: {error.message}</div>;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main Monad shape */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshStandardMaterial
          color="#836EF9"
          metalness={0.8}
          roughness={0.2}
          emissive="#836EF9"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Monad intersecting rings */}
      <Torus
        args={[2.5, 0.1, 16, 100]}
        rotation={[Math.PI / 2, Math.PI / 4, 0]}
      >
        <meshStandardMaterial
          color="#836EF9"
          metalness={0.9}
          roughness={0.1}
          emissive="#836EF9"
          emissiveIntensity={0.3}
        />
      </Torus>
      <Torus
        args={[2.5, 0.1, 16, 100]}
        rotation={[Math.PI / 2, -Math.PI / 4, 0]}
      >
        <meshStandardMaterial
          color="#836EF9"
          metalness={0.9}
          roughness={0.1}
          emissive="#836EF9"
          emissiveIntensity={0.3}
        />
      </Torus>

      {/* Single orbit ring around the sun */}
      <Torus args={[4.5, 0.08, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#836EF9"
          metalness={0.7}
          roughness={0.2}
          emissive="#836EF9"
          emissiveIntensity={0.2}
          opacity={0.3}
          transparent
        />
      </Torus>

      {/* Block number text with improved visibility */}
      <Html
        position={[0, 4.5, 0]}
        transform
        occlude
        style={{
          background: "rgba(0, 0, 0, 0.85)",
          padding: "14px 28px",
          borderRadius: "10px",
          border: "2px solid #836EF9",
          color: "#fff",
          fontSize: "32px",
          fontWeight: "bold",
          textAlign: "center",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          boxShadow: "0 0 24px #836EF980",
          textShadow: "0 2px 8px #000",
        }}
      >
        <div>Block #{Number(latestBlock?.number).toLocaleString()}</div>
      </Html>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[3.7, 32, 32]} />
        <meshBasicMaterial
          color="#836EF9"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* TPS label in the center of the sun */}
      <Html position={[0, 0, 0]} center distanceFactor={8}>
        <animated.div
          style={{
            background: "rgba(0,0,0,0.85)",
            padding: "18px 36px",
            borderRadius: "16px",
            border: "3px solid #836EF9",
            color: "#fff",
            fontSize: "64px",
            fontWeight: "bold",
            textAlign: "center",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            textShadow: "0 2px 16px #836EF9, 0 2px 8px #000",
            ...pulse,
          }}
          className="transition-all duration-300"
        >
          TPS:{" "}
          <animated.span>
            {tpsSpring.tps ? tpsSpring.tps.to(n => Math.round(n)) : 0}
          </animated.span>
        </animated.div>
      </Html>
    </group>
  );
}

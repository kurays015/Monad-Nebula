import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { formatTransactionType } from "@/lib/formatTxType";
import { typeColors } from "@/lib/typeColors";

interface TransactionPlanetProps {
  position: [number, number, number];
  type: string;
  count: number;
  scale: number;
}

export default function TransactionPlanet({
  position,
  type,
  count,
  scale,
}: TransactionPlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;

    if (meshRef.current && meshRef.current.rotation) {
      // Slow self-rotation
      meshRef.current.rotation.y += delta * 0.2;
    }
    if (groupRef.current) {
      // Very slow orbit rotation
      const rotationSpeed = 0.05;
      groupRef.current.rotation.z += delta * rotationSpeed;
    }
  });

  const color = typeColors[type] || typeColors.default;
  const formattedType = formatTransactionType(type);

  // Always face the camera for label
  const labelPosition: [number, number, number] = [0, scale * 0.7, 0];

  return (
    <group ref={groupRef}>
      <group position={position}>
        {/* Connection line to the sun with pulsing effect */}
        <Line
          points={[
            [0, 0, 0],
            [-position[0], -position[1], -position[2]],
          ]}
          color={color}
          lineWidth={3}
          opacity={0.3 + Math.sin(time.current * 2) * 0.2}
          transparent
        />

        {/* Planet sphere */}
        <mesh ref={meshRef} scale={scale}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial
            color={color}
            metalness={0.6}
            roughness={0.4}
            emissive={color}
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Glow effect */}
        <mesh scale={scale * 1.2}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Count label on planet */}
        <Html position={[0, 0, 0]} center distanceFactor={8}>
          <div className="flex flex-col items-center gap-1">
            <div className={`font-bold text-8xl`}>{count}</div>
            <div className={`italic opacity-85 font-semibold text-6xl`}>
              {count > 1 ? "txns" : "tx"}
            </div>
          </div>
        </Html>

        {/* Transaction type label */}
        <Html
          position={labelPosition}
          center
          distanceFactor={8}
          style={{
            background: "rgba(0, 0, 0, 0.95)",
            padding: "10px 18px",
            borderRadius: "8px",
            border: `2px solid ${color}`,
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            textAlign: "center",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            minWidth: "90px",
            boxShadow: `0 0 12px ${color}40`,
            textShadow: "0 2px 8px #000",
          }}
        >
          <div>
            <div style={{ color }} className="text-6xl">
              {formattedType}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

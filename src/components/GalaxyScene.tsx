"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense } from "react";
import TransactionPlanet from "./TransactionPlanet";
import BlockSun from "./BlockSun";
import { useMonadContext } from "@/context/MonadContext";
import { usePlanetPositioning } from "@/hooks/usePlanetPositioning";

export default function GalaxyScene() {
  const { stats } = useMonadContext();
  const planets = usePlanetPositioning(stats.categoryStats);

  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 15, 25], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={0.5}
          />

          {/* Block Sun */}
          <BlockSun />

          {/* Transaction Planets */}
          {planets.map(planet => (
            <TransactionPlanet
              key={`${planet.category}-${planet.type}`}
              position={planet.position}
              type={planet.type}
              count={planet.count}
              scale={planet.scale}
            />
          ))}

          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={15}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

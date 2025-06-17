"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import TransactionPlanet from "./TransactionPlanet";
import BlockSun from "./BlockSun";
import useGetLatestBlock from "@/hooks/useGetLatestBlock";
import getPlanetScale from "@/lib/getPlanetScale";

export default function GalaxyScene() {
  const { data: latestBlock, isLoading, isError, error } = useGetLatestBlock();

  // Convert transaction types to planet data with fixed positions and dynamic scale
  const planets = useMemo(() => {
    if (!latestBlock) return [];
    const allTransactions = Object.entries(
      latestBlock.transactionTypes
    ).flatMap(([category, types]) =>
      Object.entries(types).map(([type, count]) => ({
        category,
        type,
        count,
      }))
    );

    // Sort by count descending for better collision avoidance
    allTransactions.sort((a, b) => b.count - a.count);

    // Place planets in a circle, but adjust radii to prevent collisions
    const baseRadius = 10;
    const placed: {
      position: [number, number, number];
      scale: number;
      angle: number;
    }[] = [];
    const result = allTransactions.map((tx, index) => {
      const scale = getPlanetScale(tx.count);
      const angle = (index * (2 * Math.PI)) / allTransactions.length;
      // Start with a radius that increases with scale
      let radius = baseRadius + scale * 2.2;
      // Try to prevent collisions by increasing radius if too close to previous
      let tries = 0;
      while (tries < 30) {
        let collision = false;
        for (const other of placed) {
          const dx = Math.cos(angle) * radius - other.position[0];
          const dy = Math.sin(angle) * radius - other.position[1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          // Minimum separation is based on both planets' scales
          const minSep = (scale + other.scale) * 1.2 + 1.2;
          if (dist < minSep) {
            radius += 2.0;
            collision = true;
            break;
          }
        }
        if (!collision) break;
        tries++;
      }
      const position: [number, number, number] = [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0,
      ];
      placed.push({ position, scale, angle });
      return {
        ...tx,
        position,
        scale,
      };
    });
    return result;
  }, [latestBlock]);

  if (isLoading || !latestBlock)
    return <div className="text-slate-400">Loading...</div>;
  if (isError)
    return <div className="text-slate-400">Error: {error.message}</div>;

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

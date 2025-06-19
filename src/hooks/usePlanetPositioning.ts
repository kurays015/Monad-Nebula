import { useMemo } from "react";
import getPlanetScale from "@/lib/getPlanetScale";
import { CategoryStats, PlanetData } from "@/types/blockchain";

export const usePlanetPositioning = (categoryStats: CategoryStats) => {
  const planets = useMemo((): PlanetData[] => {
    if (!categoryStats) return [];

    // Convert category stats to the expected format
    const allTransactions = Object.entries(categoryStats)
      .filter(([, count]) => count > 0) // Only show categories with transactions
      .map(([category, count]) => ({
        category: category.toUpperCase(),
        type: category,
        count,
      }));

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
  }, [categoryStats]);

  return planets;
};

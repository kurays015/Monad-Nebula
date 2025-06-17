// Helper to compute planet scale based on count
export default function getPlanetScale(
  count: number,
  min = 1.5,
  max = 4,
  maxCount = 50
) {
  // Clamp count to [1, maxCount]
  const clamped = Math.max(1, Math.min(count, maxCount));
  return min + ((max - min) * (clamped - 1)) / (maxCount - 1);
}

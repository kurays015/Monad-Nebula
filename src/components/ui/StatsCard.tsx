import { animated } from "@react-spring/web";
import type { StatsCardProps } from "@/types/ui";

export default function StatsCard({
  title,
  value,
  gradientFrom,
  gradientTo,
  borderColor,
  textColor,
}: StatsCardProps) {
  return (
    <div
      className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-xl p-4 border ${borderColor}`}
    >
      <div className={`${textColor} text-sm font-medium mb-1`}>{title}</div>
      <animated.div className="text-3xl font-bold text-white">
        {value}
      </animated.div>
    </div>
  );
}

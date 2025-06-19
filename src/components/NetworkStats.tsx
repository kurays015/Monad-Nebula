"use client";

import { useMonadContext } from "@/context/MonadContext";
import { useSpring, animated } from "@react-spring/web";
import { useTpsCalculator } from "@/hooks/useTpsCalculator";
import { useState } from "react";
import ToggleButton from "@/components/ui/ToggleButton";
import {
  formatNumber,
  formatGasPrice,
  openExplorer,
  getExplorerUrl,
} from "@/lib/formatters";
import { getConnectionColor } from "@/lib/typeColors";
import { getConnectionText } from "@/lib/connectionUtils";
import StatsCard from "@/components/ui/StatsCard";

export default function NetworkStats() {
  const { stats, isConnected, connectionStatus, latestBlock } =
    useMonadContext();
  const [isVisible, setIsVisible] = useState(false);

  // Use the TPS calculator hook
  const tpsStats = useTpsCalculator(stats.currentTps, stats.totalTransactions);

  // Animated values for smooth transitions
  const animatedStats = useSpring({
    currentTps: tpsStats.currentTps,
    totalTransactions: tpsStats.totalTransactions,
    blockTransactions: stats.blockTransactions,
    gasPrice: stats.gasPrice,
    config: { tension: 120, friction: 14 },
  });

  const connectionSpring = useSpring({
    opacity: isConnected ? 1 : 0.5,
    scale: isConnected ? 1 : 0.95,
    config: { tension: 200, friction: 20 },
  });

  const visibilitySpring = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateX(0px)" : "translateX(100%)",
    config: { tension: 200, friction: 20 },
  });

  const statsCards = [
    {
      title: "CURRENT TPS",
      value: animatedStats.currentTps.to(n => Math.round(n)),
      gradientFrom: "from-purple-900/50",
      gradientTo: "to-blue-900/50",
      borderColor: "border-purple-500/20",
      textColor: "text-purple-300",
    },
    {
      title: "TOTAL TXN(S)",
      value: animatedStats.totalTransactions.to(n =>
        formatNumber(Math.round(n))
      ),
      gradientFrom: "from-cyan-900/50",
      gradientTo: "to-green-900/50",
      borderColor: "border-cyan-500/20",
      textColor: "text-cyan-300",
    },
    {
      title: "BLOCK TX",
      value: animatedStats.blockTransactions.to(n => Math.round(n)),
      gradientFrom: "from-green-900/50",
      gradientTo: "to-emerald-900/50",
      borderColor: "border-green-500/20",
      textColor: "text-green-300",
    },
    {
      title: "GAS PRICE",
      value: animatedStats.gasPrice.to(n => formatGasPrice(n)),
      gradientFrom: "from-emerald-900/50",
      gradientTo: "to-teal-900/50",
      borderColor: "border-emerald-500/20",
      textColor: "text-emerald-300",
    },
  ];

  return (
    <>
      <ToggleButton
        isVisible={isVisible}
        onToggle={() => setIsVisible(!isVisible)}
        position="top-right"
        title={isVisible ? "Hide Network Stats" : "Show Network Stats"}
      />

      {/* Network Stats Panel */}
      <animated.div
        style={visibilitySpring}
        className="fixed top-4 right-20 w-80 sm:w-96 lg:w-[420px] z-40"
      >
        <animated.div
          style={connectionSpring}
          className="bg-black/90 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 z-40">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
              <h2 className="text-white text-xl font-bold">MONAD NETWORK</h2>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: getConnectionColor(connectionStatus),
                }}
              ></div>
              <span
                className="text-sm font-mono bg-purple-900/30 px-2 py-1 rounded-lg"
                style={{ color: getConnectionColor(connectionStatus) }}
              >
                {getConnectionText(connectionStatus)}
              </span>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {statsCards.map((card, index) => (
              <StatsCard key={index} {...card} />
            ))}
          </div>

          {/* Category Stats */}
          <div className="space-y-3 mb-6">
            <h3 className="text-white/80 text-sm font-semibold mb-3">
              TRANSACTION TYPES
            </h3>

            {Object.entries(stats.categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      category === "defi"
                        ? "bg-yellow-400"
                        : category === "nft"
                        ? "bg-pink-400"
                        : category === "transfer"
                        ? "bg-green-400"
                        : category === "contractCall"
                        ? "bg-blue-400"
                        : category === "contractDeploy"
                        ? "bg-purple-400"
                        : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-white/70 text-sm font-medium capitalize">
                    {category.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
                <span className="text-white font-bold text-lg">
                  {formatNumber(count)}
                </span>
              </div>
            ))}
          </div>

          {/* Latest Block Info */}
          {latestBlock && (
            <div className="pt-4 border-t border-purple-500/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">
                  BLOCK #{formatNumber(latestBlock.number)}
                </span>
                <button
                  onClick={() =>
                    openExplorer(getExplorerUrl.block(latestBlock.hash))
                  }
                  className="text-purple-300 font-mono hover:text-purple-200 transition-colors duration-200 cursor-pointer"
                  title="View block on explorer"
                >
                  {latestBlock.hash.substring(0, 8)}...
                </button>
              </div>
            </div>
          )}
        </animated.div>
      </animated.div>
    </>
  );
}

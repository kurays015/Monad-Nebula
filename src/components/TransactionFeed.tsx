"use client";

import { useMonadContext } from "@/context/MonadContext";
import { useSpring, animated, useTransition } from "@react-spring/web";
import { formatTransactionType } from "@/lib/formatTxType";
import { getTransactionColor } from "@/lib/typeColors";
import {
  formatHash,
  formatValue,
  openExplorer,
  getExplorerUrl,
} from "@/lib/formatters";
import ToggleButton from "@/components/ui/ToggleButton";
import { useState } from "react";

export default function TransactionFeed() {
  const { transactions, isConnected } = useMonadContext();
  const [isVisible, setIsVisible] = useState(false);

  const containerSpring = useSpring({
    opacity: isConnected ? 1 : 0.3,
    transform: isConnected ? "translateY(0px)" : "translateY(10px)",
    config: { tension: 200, friction: 20 },
  });

  const visibilitySpring = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateX(0px)" : "translateX(-100%)",
    config: { tension: 200, friction: 20 },
  });

  const validTransactions = transactions
    .slice(0, 10)
    .filter(tx => tx && tx.hash);

  const transitions = useTransition(validTransactions, {
    from: { opacity: 0, transform: "translateX(-10px)" },
    enter: { opacity: 1, transform: "translateX(0px)" },
    config: { tension: 200, friction: 20 },
    keys: item => item.hash,
  });

  return (
    <>
      <ToggleButton
        isVisible={isVisible}
        onToggle={() => setIsVisible(!isVisible)}
        position="top-left"
        title={isVisible ? "Hide Transaction Feed" : "Show Transaction Feed"}
      />

      {/* Transaction Feed Panel */}
      <animated.div
        style={visibilitySpring}
        className="fixed top-4 left-20 z-40 w-80 sm:w-96 lg:w-[420px] max-h-[80vh]"
      >
        <animated.div
          style={containerSpring}
          className="bg-black/90 backdrop-blur-xl border border-purple-500/40 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <h3 className="text-white font-bold text-lg">
                LIVE TRANSACTIONS
              </h3>
            </div>
          </div>

          {/* Transaction List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {transactions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-white/40 text-sm mb-2">
                  Waiting for transactions...
                </div>
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {transitions((style, tx) => (
                  <animated.div
                    key={tx.hash}
                    style={style}
                    className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-xl p-4 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    {/* Transaction Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getTransactionColor(
                              tx.type || "other"
                            ),
                          }}
                        ></div>
                        <button
                          onClick={() =>
                            openExplorer(getExplorerUrl.transaction(tx.hash))
                          }
                          className="text-white/90 text-sm font-mono hover:text-purple-300 transition-colors duration-200 cursor-pointer"
                          title="View transaction on explorer"
                        >
                          {formatHash(tx.hash)}
                        </button>
                      </div>
                      <span className="text-purple-300 text-xs font-medium bg-purple-900/40 px-2 py-1 rounded-lg">
                        {formatTransactionType(tx.type || "other")}
                      </span>
                    </div>

                    {/* Transaction Details */}
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs font-medium">
                          From:
                        </span>
                        <button
                          onClick={() =>
                            openExplorer(getExplorerUrl.address(tx.from))
                          }
                          className="text-white/80 font-mono text-xs hover:text-blue-300 transition-colors duration-200 cursor-pointer truncate max-w-32"
                          title="View address on explorer"
                        >
                          {formatHash(tx.from)}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs font-medium">
                          To:
                        </span>
                        <button
                          onClick={() =>
                            openExplorer(getExplorerUrl.address(tx.to))
                          }
                          className="text-white/80 font-mono text-xs hover:text-blue-300 transition-colors duration-200 cursor-pointer truncate max-w-32"
                          title="View address on explorer"
                        >
                          {formatHash(tx.to)}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs font-medium">
                          Value:
                        </span>
                        <div className="text-green-300 font-bold text-sm">
                          {formatValue(tx.value)} MON
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs font-medium">
                          Gas:
                        </span>
                        <div className="text-blue-300 text-sm">
                          {tx.gasPrice} Gwei
                        </div>
                      </div>
                    </div>
                  </animated.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-purple-500/30 bg-purple-900/20 rounded-b-2xl">
            <div className="text-center text-purple-300 text-xs font-medium">
              Real-time Monad blockchain data
            </div>
          </div>
        </animated.div>

        {/* Custom scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(139, 92, 246, 0.1);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.5);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.7);
          }
        `}</style>
      </animated.div>
    </>
  );
}

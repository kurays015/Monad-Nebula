import { useEffect, useState } from "react";

interface TpsStats {
  currentTps: number;
  totalTransactions: number;
}

export const useTpsCalculator = (
  currentTps: number,
  totalTransactions: number
) => {
  const [lastTransactionCount, setLastTransactionCount] = useState(0);

  // Only update lastTransactionCount when transactions increase
  useEffect(() => {
    if (totalTransactions > lastTransactionCount) {
      setLastTransactionCount(totalTransactions);
    }
  }, [totalTransactions, lastTransactionCount]);

  const stats: TpsStats = {
    currentTps,
    totalTransactions,
  };

  return stats;
};

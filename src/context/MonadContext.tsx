"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import MonadWebSocketManager from "@/lib/monadWebSocket";
import { logger } from "@/lib/logger";
import {
  ProcessedBlock,
  ProcessedTransaction,
  TransactionData,
  BlockData,
  Stats,
  MonadContextType,
} from "@/types/blockchain";
import {
  convertProcessedTransaction,
  convertProcessedBlock,
  createTransactionTypes,
  createInitialCategoryStats,
} from "@/lib/dataConverters";
import { MONAD_TESTNET_CONFIG } from "@/config/monad";
import { useTransactionAnalysis } from "@/hooks/useTransactionAnalysis";

const MonadContext = createContext<MonadContextType | null>(null);

export default function MonadProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wsManager, setWsManager] = useState<MonadWebSocketManager | null>(
    null
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestBlock, setLatestBlock] = useState<BlockData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [transactionTimestamps, setTransactionTimestamps] = useState<number[]>(
    []
  );
  const [stats, setStats] = useState<Stats>({
    currentTps: 0,
    totalTransactions: 0,
    blockTransactions: 0,
    gasPrice: 0,
    networkHash: "0x...",
    categoryStats: createInitialCategoryStats(),
  });
  const [connectionStatus, setConnectionStatus] =
    useState<string>("connecting");

  const { analyzeTransactions } = useTransactionAnalysis();

  // Calculate current TPS based on transactions in the last 10 seconds
  const calculateCurrentTps = useCallback(() => {
    const now = Date.now();
    const tenSecondsAgo = now - 10000; // 10 seconds ago

    // Count transactions in the last 10 seconds
    const recentTransactions = transactionTimestamps.filter(
      timestamp => timestamp > tenSecondsAgo
    );

    return recentTransactions.length / 10; // TPS over 10 seconds
  }, [transactionTimestamps]);

  // Update TPS calculation periodically
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const currentTps = calculateCurrentTps();
      setStats(prev => ({
        ...prev,
        currentTps,
      }));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isConnected, calculateCurrentTps]);

  // Handle new block from WebSocket
  const handleNewBlock = useCallback(
    (data: ProcessedBlock | ProcessedTransaction | null) => {
      if (data && typeof data === "object" && "number" in data) {
        const processedBlock = data as ProcessedBlock;
        const blockData = convertProcessedBlock(processedBlock);

        // Analyze transaction types
        const categoryStats = analyzeTransactions(blockData.transactions);

        setLatestBlock({
          ...blockData,
          TPS: processedBlock.transactionCount || 0,
          transactionTypes: createTransactionTypes(categoryStats),
        });

        setIsConnected(true);
        setConnectionStatus("connected");

        setStats(prev => ({
          ...prev,
          blockTransactions: blockData.transactionCount || 0,
          networkHash: blockData.hash
            ? blockData.hash.substring(0, 16) + "..."
            : prev.networkHash,
          gasPrice: blockData.baseFeePerGas
            ? Math.round(blockData.baseFeePerGas / 1e9)
            : prev.gasPrice,
          categoryStats,
        }));

        logger.log("Received new block, set status to connected");
      }
    },
    [analyzeTransactions]
  );

  // Handle new transaction from WebSocket
  const handleNewTransaction = useCallback(
    (data: ProcessedBlock | ProcessedTransaction | null) => {
      // Type guard to check if it's transaction data
      if (data && "hash" in data && !("number" in data)) {
        const processedTx = data as ProcessedTransaction;
        const txData = convertProcessedTransaction(processedTx);

        setTransactions(prev => {
          const updated = [txData, ...prev].slice(0, 1000); // Keep last 1000 tx
          return updated;
        });

        // Add transaction timestamp for TPS calculation
        setTransactionTimestamps(prev => {
          const updated = [Date.now(), ...prev].slice(0, 1000); // Keep last 1000 timestamps
          return updated;
        });

        // Update transaction stats
        setStats(prev => ({
          ...prev,
          totalTransactions: prev.totalTransactions + 1,
          gasPrice: txData.gasPrice || prev.gasPrice,
          networkHash: txData.hash
            ? txData.hash.substring(0, 16) + "..."
            : prev.networkHash,
        }));
      }
    },
    []
  );

  const handleConnectionFailure = useCallback(() => {
    logger.log("❌ Real blockchain connection failed. No fallback data.");
    setConnectionStatus("failed");
    setIsConnected(false);
  }, []);

  useEffect(() => {
    setConnectionStatus("connecting");
    setIsConnected(false);
    initConnection();

    return () => {
      if (wsManager) {
        wsManager.disconnect();
      }
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize connection to Monad testnet
  const initConnection = useCallback(async () => {
    try {
      setConnectionStatus("connecting");
      logger.log("🚀 Initializing Monad connection...");

      // Try WebSocket connection first
      const ws = new MonadWebSocketManager(MONAD_TESTNET_CONFIG);

      // Set up event listeners
      ws.on("newBlock", handleNewBlock);
      ws.on("newTransaction", handleNewTransaction);
      ws.on("connectionFailed", () => {
        logger.log("❌ WebSocket connection failed - no fallback");
        handleConnectionFailure();
      });

      await ws.connect();
      setWsManager(ws);
      setIsConnected(true);
      setConnectionStatus("connected");
      logger.log("✅ Connected to Monad Testnet WebSocket");
    } catch (error) {
      logger.error("❌ Failed to connect to Monad WebSocket:", error);
      handleConnectionFailure();
    }
  }, [handleNewBlock, handleNewTransaction, handleConnectionFailure]);

  const testRealConnection = useCallback(() => {
    if (wsManager) {
      wsManager.forceRealDataMode();
    }
  }, [wsManager]);

  const value: MonadContextType = {
    connection: null,
    wsManager,
    isConnected,
    connectionStatus,
    latestBlock,
    transactions,
    stats,
    config: MONAD_TESTNET_CONFIG,
    testRealConnection,
  };

  return (
    <MonadContext.Provider value={value}>{children}</MonadContext.Provider>
  );
}

export const useMonadContext = (): MonadContextType => {
  const context = useContext(MonadContext);
  if (!context) {
    throw new Error("useMonad must be used within a MonadProvider");
  }
  return context;
};

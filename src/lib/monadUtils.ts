import Web3 from "web3";

interface MonadConfig {
  rpcUrl: string;
  wsUrl: string;
  chainId: number;
}

interface MonadConnection {
  web3: Web3;
  chainId: number;
  latestBlock: number;
  config: MonadConfig;
}

interface FormattedTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: number;
  timestamp: number;
  blockNumber: number;
  size: number;
  color: string;
}

interface FormattedBlock {
  number: number;
  hash: string;
  timestamp: number;
  transactionCount: number;
  gasUsed: string;
  gasLimit: string;
}

interface NetworkStats {
  currentTps: number;
  totalTransactions: number;
  avgBlockTime: number;
  networkHash: string;
  activeNodes: number;
}

/**
 * Creates a connection to Monad blockchain
 * @param config - Monad configuration
 * @returns Web3 instance and utilities
 */

/**
 * Gets live transactions from Monad mempool
 * @param connection - Monad connection
 * @param callback - Callback for new transactions
 */
export function subscribeToTransactions(
  connection: MonadConnection,
  callback: (transaction: FormattedTransaction) => void
): unknown {
  const { web3 } = connection;

  try {
    // Subscribe to pending transactions
    const subscription = web3.eth.subscribe(
      "pendingTransactions",
      (error: Error | null, txHash: string) => {
        if (error) {
          console.error("Transaction subscription error:", error);
          return;
        }

        // Get transaction details
        web3.eth
          .getTransaction(txHash)
          .then((tx: unknown) => {
            if (tx && typeof tx === "object" && tx !== null && "to" in tx) {
              const formattedTx = formatTransaction(
                tx as Record<string, unknown>
              );
              callback(formattedTx);
            }
          })
          .catch((err: Error) =>
            console.error("Error fetching transaction:", err)
          );
      }
    );

    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to transactions:", error);
    return null;
  }
}

/**
 * Subscribe to new blocks
 * @param connection - Monad connection
 * @param callback - Callback for new blocks
 */
export function subscribeToBlocks(
  connection: MonadConnection,
  callback: (block: FormattedBlock) => void
): unknown {
  const { web3 } = connection;

  try {
    const subscription = web3.eth.subscribe(
      "newBlockHeaders",
      (error: Error | null, blockHeader: unknown) => {
        if (error) {
          console.error("Block subscription error:", error);
          return;
        }

        const formattedBlock = formatBlock(
          blockHeader as Record<string, unknown>
        );
        callback(formattedBlock);
      }
    );

    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to blocks:", error);
    return null;
  }
}

/**
 * Formats transaction data for visualization
 * @param tx - Raw transaction object
 * @returns Formatted transaction
 */
function formatTransaction(tx: Record<string, unknown>): FormattedTransaction {
  const value = parseFloat(String(tx.value || "0")) / Math.pow(10, 18); // Convert wei to ETH

  return {
    hash: String(tx.hash || ""),
    from: String(tx.from || ""),
    to: String(tx.to || ""),
    value: value.toFixed(6),
    gasPrice: parseInt(String(tx.gasPrice || "0")) / Math.pow(10, 9), // Convert to Gwei
    timestamp: Date.now(),
    blockNumber: tx.blockNumber ? parseInt(String(tx.blockNumber), 16) : 0,
    size: Math.max(1, Math.min(5, Math.floor(value) + 1)), // Size based on value
    color: getTransactionColor(value),
  };
}

/**
 * Formats block data
 * @param block - Raw block object
 * @returns Formatted block
 */
function formatBlock(block: Record<string, unknown>): FormattedBlock {
  return {
    number: parseInt(String(block.number || "0"), 16),
    hash: String(block.hash || ""),
    timestamp: Date.now(),
    transactionCount: Array.isArray(block.transactions)
      ? block.transactions.length
      : 0,
    gasUsed: String(block.gasUsed || ""),
    gasLimit: String(block.gasLimit || ""),
  };
}

/**
 * Gets transaction color based on value
 * @param value - Transaction value in ETH
 * @returns Hex color code
 */
function getTransactionColor(value: number): string {
  if (value > 10) return "#6D28D9"; // Dark purple for large transactions
  if (value > 1) return "#8B5CF6"; // Primary purple for medium
  if (value > 0.1) return "#A78BFA"; // Light purple for small
  return "#C4B5FD"; // Lightest purple for micro transactions
}

/**
 * Calculate network statistics
 * @param transactions - Recent transactions
 * @param latestBlock - Latest block info
 * @returns Network stats
 */
export function calculateNetworkStats(
  transactions: FormattedTransaction[],
  latestBlock?: FormattedBlock
): NetworkStats {
  const now = Date.now();
  const lastMinute = transactions.filter(tx => now - tx.timestamp < 60000);

  return {
    currentTps: Math.round(lastMinute.length / 60),
    totalTransactions: transactions.length,
    avgBlockTime: 1000, // Monad's 1-second block time
    networkHash: latestBlock?.hash || "0x...",
    activeNodes: 200, // Estimated active nodes
  };
}

/**
 * Generate mock Monad transaction for development
 * @returns Mock transaction
 */
export function generateMockMonadTransaction(): FormattedTransaction {
  const value = Math.random() * 100;

  return {
    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    from: `0x${Math.random().toString(16).substr(2, 40)}`,
    to: `0x${Math.random().toString(16).substr(2, 40)}`,
    value: value.toFixed(6),
    gasPrice: Math.floor(Math.random() * 50) + 10,
    timestamp: Date.now(),
    blockNumber: Math.floor(Math.random() * 1000000),
    size: Math.max(1, Math.min(5, Math.floor(value / 10) + 1)),
    color: getTransactionColor(value),
  };
}

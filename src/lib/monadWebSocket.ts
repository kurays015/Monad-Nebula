/**
 * Monad WebSocket Connection Manager
 * Real-time data streaming from Monad testnet
 */
import { logger } from "./logger";

interface MonadConfig {
  rpcUrl: string;
  wsUrl: string;
}

interface BlockStats {
  blocksReceived: number;
  transactionsReceived: number;
  lastBlockTime: number;
  avgBlockTime: number;
  currentTps: number;
}

interface BlockData {
  number: string;
  hash: string;
  timestamp: string;
  transactions?: string[];
  gasUsed?: string;
  gasLimit?: string;
  miner: string;
  difficulty: string;
  size?: string;
  baseFeePerGas?: string;
  totalDifficulty: string;
}

interface ProcessedBlock {
  number: number;
  hash: string;
  timestamp: number;
  transactionCount: number;
  gasUsed: number;
  gasLimit: number;
  miner: string;
  difficulty: string;
  size: number;
  networkUtilization: number;
  blockTime: number;
  baseFeePerGas: number;
  totalDifficulty: string;
  transactions: Transaction[];
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gas: string;
  timestamp: number;
  blockNumber: string;
  size: number;
  color: string;
  token: string;
  nonce: string;
  input: string;
  isSpecial?: boolean;
  type?: string;
}

interface ProcessedTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: number;
  timestamp: number;
  blockNumber: number;
  size: number;
  color: string;
  token: string;
  nonce: number;
  input: string;
  isSpecial: boolean;
  type: string;
}

interface WebSocketMessage {
  jsonrpc: string;
  id: number;
  method: string;
  params: string[];
}

interface SubscriptionConfirmation {
  jsonrpc: string;
  id: number;
  result: string;
}

interface SubscriptionNotification {
  jsonrpc: string;
  method: string;
  params: {
    subscription: string;
    result: BlockData | string;
  };
}

type WebSocketData = SubscriptionConfirmation | SubscriptionNotification;

type EventCallback = (
  data: ProcessedBlock | ProcessedTransaction | null
) => void;

class MonadWebSocketManager {
  private config: MonadConfig;
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private isConnected: boolean = false;
  private subscriptions: Map<string, string> = new Map();
  private messageQueue: Array<{ method: string; params: string[] }> = [];
  private stats: BlockStats = {
    blocksReceived: 0,
    transactionsReceived: 0,
    lastBlockTime: Date.now(),
    avgBlockTime: 500,
    currentTps: 0,
  };
  private listeners: { [key: string]: EventCallback[] } = {};
  private transactionTimestamps: number[] = [];
  private blockRateLimitDelay?: number;
  private rateLimitDelay?: number;

  constructor(config: MonadConfig) {
    this.config = config;
  }

  async connect(): Promise<MonadWebSocketManager> {
    // First test RPC connection
    if (process.env.NODE_ENV === "development") {
      console.log("🧪 Testing RPC connection first...");
    }
    const rpcTest = await this.testRealConnection();
    if (!rpcTest) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ RPC connection failed, cannot proceed");
      }
      this.emit("connectionFailed", null);
      return Promise.reject(new Error("RPC connection failed"));
    }

    return new Promise((resolve, reject) => {
      try {
        if (process.env.NODE_ENV === "development") {
          console.log("🔗 Connecting to Monad WebSocket:", this.config.wsUrl);
        }
        this.ws = new WebSocket(this.config.wsUrl);

        this.ws.onopen = () => {
          if (process.env.NODE_ENV === "development") {
            console.log("✅ Connected to Monad testnet WebSocket");
          }
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Subscribe to new block headers
          this.subscribe("newHeads");
          // Note: newPendingTransactions doesn't work reliably on Monad testnet
          // We'll get transactions from block data instead

          if (process.env.NODE_ENV === "development") {
            console.log("📡 Listening for REAL blockchain data only...");
          }
          resolve(this);
        };

        this.ws.onmessage = (event: MessageEvent) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onclose = (event: CloseEvent) => {
          logger.log(
            "🔌 WebSocket connection closed:",
            event.code,
            event.reason
          );
          this.isConnected = false;

          // Only reconnect if we haven't exceeded max attempts
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.handleReconnect();
          } else {
            logger.error("❌ Max reconnection attempts reached");
            this.emit("connectionFailed", null);
          }
        };

        this.ws.onerror = (error: Event) => {
          logger.error("❌ WebSocket error:", error);
          this.isConnected = false;
          reject(error);
        };
      } catch (error) {
        logger.error("❌ Failed to create WebSocket connection:", error);
        reject(error);
      }
    });
  }

  subscribe(method: string): void {
    if (!this.isConnected) {
      this.messageQueue.push({ method: "eth_subscribe", params: [method] });
      return;
    }

    const id = Date.now() + Math.random();
    const message: WebSocketMessage = {
      jsonrpc: "2.0",
      id: id,
      method: "eth_subscribe",
      params: [method],
    };

    this.ws?.send(JSON.stringify(message));
    logger.log(`📡 Subscribed to ${method}`);
  }

  handleMessage(data: WebSocketData): void {
    try {
      // Handle subscription confirmations
      if (
        "result" in data &&
        typeof data.result === "string" &&
        data.result.startsWith("0x")
      ) {
        logger.log("✅ Subscription confirmed:", data.result);
        return;
      }

      // Handle subscription notifications
      if ("method" in data && data.method === "eth_subscription") {
        const { result } = data.params;

        if (typeof result === "object" && result.number) {
          // New block received
          logger.log(`🧱 New block received: #${parseInt(result.number, 16)}`);
          this.handleNewBlock(result);
        } else if (typeof result === "string" && result.startsWith("0x")) {
          // New transaction hash received
          logger.log(`💸 New transaction: ${result.substring(0, 10)}...`);
          this.handleNewTransaction(result);
        }
      }
    } catch (error) {
      logger.error("❌ Error handling WebSocket message:", error);
    }
  }

  handleNewBlock(blockData: BlockData): void {
    const now = Date.now();
    const blockTime = now - this.stats.lastBlockTime;

    // Update block statistics
    this.stats.blocksReceived++;
    this.stats.lastBlockTime = now;
    this.stats.avgBlockTime = this.calculateMovingAverage(
      this.stats.avgBlockTime,
      blockTime,
      10
    );

    // Fetch full block data for accurate information
    this.fetchBlockData(blockData.hash || blockData.number)
      .then(fullBlock => {
        if (fullBlock) {
          this.emit("newBlock", fullBlock);
        } else {
          // Fallback to header data
          this.emitBlockFromHeader(blockData, blockTime);
        }
      })
      .catch(error => {
        console.error("Error fetching block data:", error);
        this.emitBlockFromHeader(blockData, blockTime);
      });
  }

  async fetchBlockData(
    blockIdentifier: string
  ): Promise<ProcessedBlock | null> {
    // Rate limiting için delay
    if (this.blockRateLimitDelay) {
      await new Promise(resolve =>
        setTimeout(resolve, this.blockRateLimitDelay)
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for blocks

      const response = await fetch(this.config.rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBlockByHash",
          params: [blockIdentifier, true], // true - full transaction data al
          id: Math.floor(Math.random() * 10000),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting for blocks
      if (response.status === 429) {
        console.log("⚠️ Block fetch rate limited");
        this.blockRateLimitDelay = Math.min(
          (this.blockRateLimitDelay || 200) * 2,
          3000
        );
        return null;
      }

      if (response.ok) {
        this.blockRateLimitDelay = Math.max(
          (this.blockRateLimitDelay || 200) * 0.9,
          100
        );
      }

      const data = await response.json();

      if (data.result && data.result !== null) {
        const block = data.result;
        const gasUsed = parseInt(block.gasUsed || "0x0", 16);
        const gasLimit = parseInt(block.gasLimit || "0x0", 16);
        const utilization = gasLimit > 0 ? (gasUsed / gasLimit) * 100 : 0;

        // Process transactions in this block
        if (block.transactions && block.transactions.length > 0) {
          console.log(`🔥 Block has ${block.transactions.length} transactions`);

          // Emit each transaction
          block.transactions.forEach((tx: Transaction) => {
            if (tx && tx.hash) {
              const processedTx = this.processTransactionFromBlock(tx);
              if (processedTx) {
                this.emit("newTransaction", processedTx);
                this.stats.transactionsReceived++;
              }
            }
          });

          // Update TPS calculation
          this.updateTpsCalculation(Date.now());
        }

        return {
          number: parseInt(block.number, 16),
          hash: block.hash,
          timestamp: parseInt(block.timestamp, 16) * 1000,
          transactionCount: block.transactions ? block.transactions.length : 0,
          gasUsed: gasUsed,
          gasLimit: gasLimit,
          miner: block.miner,
          difficulty: block.difficulty,
          size: parseInt(block.size || "0x0", 16),
          networkUtilization: utilization,
          blockTime: Date.now() - this.stats.lastBlockTime,
          baseFeePerGas: parseInt(block.baseFeePerGas || "0x0", 16),
          totalDifficulty: block.totalDifficulty,
          transactions: block.transactions || [],
        };
      }

      return null;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("⚠️ Block fetch timeout");
      } else {
        console.error("Failed to fetch block data:", error);
      }
      return null;
    }
  }

  emitBlockFromHeader(blockData: BlockData, blockTime: number): void {
    const block = {
      number: parseInt(blockData.number, 16),
      hash: blockData.hash,
      timestamp: parseInt(blockData.timestamp, 16) * 1000,
      transactionCount: blockData.transactions
        ? blockData.transactions.length
        : 0,
      gasUsed: parseInt(blockData.gasUsed || "0x0", 16),
      gasLimit: parseInt(blockData.gasLimit || "0x0", 16),
      miner: blockData.miner,
      difficulty: blockData.difficulty,
      size: parseInt(blockData.size || "0x0", 16),
      baseFeePerGas: parseInt(blockData.baseFeePerGas || "0x0", 16),
      totalDifficulty: blockData.totalDifficulty,
      transactions: [],
    };

    // Calculate network utilization
    const utilization =
      block.gasLimit > 0 ? (block.gasUsed / block.gasLimit) * 100 : 0;

    // Emit block event
    this.emit("newBlock", {
      ...block,
      networkUtilization: utilization,
      blockTime: blockTime,
    });

    console.log(
      `🧱 New block #${block.number} - ${block.transactionCount} txs - ${blockTime}ms`
    );
  }

  handleNewTransaction(txHash: string): void {
    this.stats.transactionsReceived++;

    // Calculate current TPS (transactions in last second)
    const now = Date.now();
    this.updateTpsCalculation(now);

    // Sadece gerçek blockchain verilerini çek
    this.fetchTransactionData(txHash)
      .then(transaction => {
        if (transaction) {
          this.emit("newTransaction", transaction);
          console.log(
            `✅ Real transaction: ${transaction.hash.substring(0, 10)}... (${
              transaction.value
            } MON)`
          );
        } else {
          console.log(`⚠️ Could not fetch transaction data for: ${txHash}`);
        }
      })
      .catch(error => {
        console.error("❌ Error fetching real transaction:", error);
      });
  }

  async fetchTransactionData(
    txHash: string
  ): Promise<ProcessedTransaction | null> {
    // Rate limiting için cache ve delay ekle
    if (this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
    }

    try {
      // Fetch transaction details via RPC with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(this.config.rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionByHash",
          params: [txHash],
          id: Math.floor(Math.random() * 10000), // Random ID to avoid conflicts
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        console.log("⚠️ Rate limited, increasing delay");
        this.rateLimitDelay = Math.min((this.rateLimitDelay || 100) * 2, 2000);
        return null;
      }

      // Reset rate limit delay on success
      if (response.ok) {
        this.rateLimitDelay = Math.max((this.rateLimitDelay || 100) * 0.9, 50);
      }

      const data = await response.json();

      if (data.result && data.result !== null) {
        const tx = data.result;
        const value = parseInt(tx.value || "0x0", 16) / Math.pow(10, 18); // Convert wei to MON

        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: value.toFixed(6),
          gasPrice: (
            parseInt(tx.gasPrice || "0x0", 16) / Math.pow(10, 9)
          ).toString(), // Convert to Gwei
          gasLimit: parseInt(tx.gas || "0x0", 16),
          timestamp: Date.now(),
          blockNumber: parseInt(tx.blockNumber || "0x0", 16),
          size: Math.max(1, Math.min(5, Math.floor(value * 2) + 1)),
          color: this.getTransactionColor(value),
          token: "MON",
          nonce: parseInt(tx.nonce || "0x0", 16),
          input: tx.input,
          isSpecial: value > 1,
          type: tx.input && tx.input !== "0x" ? "contract" : "transfer",
        };
      }

      return null;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("⚠️ Transaction fetch timeout");
      } else {
        console.error("Failed to fetch transaction data:", error);
      }
      return null;
    }
  }

  updateTpsCalculation(currentTime: number): void {
    // Keep track of transaction timestamps for accurate TPS calculation
    if (!this.transactionTimestamps) {
      this.transactionTimestamps = [];
    }

    this.transactionTimestamps.push(currentTime);

    // Remove timestamps older than 1 second
    const oneSecondAgo = currentTime - 1000;
    this.transactionTimestamps = this.transactionTimestamps.filter(
      timestamp => timestamp > oneSecondAgo
    );

    // Update current TPS with smoothing
    const rawTps = this.transactionTimestamps.length;
    this.stats.currentTps = Math.max(rawTps, this.stats.currentTps * 0.9); // Smooth decrease

    console.log(`📊 Current TPS: ${this.stats.currentTps} (${rawTps} raw)`);
  }

  processTransactionFromBlock(tx: Transaction): ProcessedTransaction | null {
    try {
      const value = parseInt(tx.value || "0x0", 16) / Math.pow(10, 18); // Convert wei to MON
      const gasPrice = parseInt(tx.gasPrice || "0x0", 16) / Math.pow(10, 9); // Convert to Gwei

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: value.toFixed(6),
        gasPrice: gasPrice.toFixed(2),
        gasLimit: parseInt(tx.gas || "0x0", 16),
        timestamp: Date.now(),
        blockNumber: parseInt(tx.blockNumber || "0x0", 16),
        size: Math.max(
          2,
          Math.min(8, Math.floor(Math.log10(value + 1) * 2) + 3)
        ),
        color: this.getTransactionColor(value),
        token: "MON",
        nonce: parseInt(tx.nonce || "0x0", 16),
        input: tx.input || "0x",
        isSpecial: value > 1 || gasPrice > 50,
        type: tx.input && tx.input !== "0x" ? "contract" : "transfer",
      };
    } catch (error) {
      console.error("Error processing transaction:", error);
      return null;
    }
  }

  generateTransactionFromHash(hash: string): ProcessedTransaction {
    // Generate realistic transaction data based on hash
    // const hashNum = parseInt(hash.slice(-8), 16); // Removed unused variable

    // More realistic value distribution (most transactions are small)
    const rand = Math.random();
    let value: number;
    if (rand < 0.6) {
      // 60% small transactions (0.001-0.1 MON)
      value = Math.random() * 0.099 + 0.001;
    } else if (rand < 0.85) {
      // 25% medium transactions (0.1-1 MON)
      value = Math.random() * 0.9 + 0.1;
    } else if (rand < 0.95) {
      // 10% large transactions (1-10 MON)
      value = Math.random() * 9 + 1;
    } else {
      // 5% very large transactions (10-100 MON)
      value = Math.random() * 90 + 10;
    }

    // Realistic gas prices (higher for faster confirmation)
    const gasPrice = Math.floor(Math.random() * 100) + 5; // 5-105 Gwei

    // Transaction types based on value and gas
    const isContract = value < 0.01 && gasPrice > 50; // Contract interactions
    const isSpecial = value > 5 || gasPrice > 80 || isContract;

    return {
      hash: hash,
      from: `0x${Math.random().toString(16).substr(2, 40)}`,
      to: `0x${Math.random().toString(16).substr(2, 40)}`,
      value: value.toFixed(6),
      gasPrice: gasPrice.toString(),
      gasLimit: isContract
        ? Math.floor(Math.random() * 200000) + 50000
        : Math.floor(Math.random() * 21000) + 21000,
      timestamp: Date.now(),
      blockNumber: this.stats.blocksReceived,
      size: Math.max(2, Math.min(8, Math.floor(Math.log10(value + 1) * 2) + 3)),
      color: this.getTransactionColor(value),
      token: "MON",
      nonce: Math.floor(Math.random() * 1000),
      input: isContract
        ? "0x" + Math.random().toString(16).substr(2, 64)
        : "0x",
      isSpecial: isSpecial,
      type: isContract ? "contract" : "transfer",
    };
  }

  getTransactionColor(value: number): string {
    // Enhanced color scheme for better visualization
    if (value > 10) return "#4C1D95"; // Deep purple for very large transactions (10+ MON)
    if (value > 5) return "#6D28D9"; // Dark purple for large transactions (5-10 MON)
    if (value > 1) return "#8B5CF6"; // Primary purple for medium transactions (1-5 MON)
    if (value > 0.5) return "#A78BFA"; // Light purple for small transactions (0.5-1 MON)
    if (value > 0.1) return "#C4B5FD"; // Lighter purple for micro transactions (0.1-0.5 MON)
    if (value > 0.01) return "#DDD6FE"; // Very light purple for tiny transactions (0.01-0.1 MON)
    return "#EDE9FE"; // Palest purple for dust transactions (<0.01 MON)
  }

  calculateMovingAverage(
    current: number,
    newValue: number,
    windowSize: number
  ): number {
    return (current * (windowSize - 1) + newValue) / windowSize;
  }

  handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(
        `🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect().catch(console.error);
      }, delay);
    } else {
      console.error(
        "❌ Max reconnection attempts reached. Switching to fallback mode."
      );
      this.emit("connectionFailed", null);
    }
  }

  // Simple event emitter
  emit(
    event: string,
    data: ProcessedBlock | ProcessedTransaction | null
  ): void {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  on(event: string, callback: EventCallback): void {
    if (!this.listeners) this.listeners = {};
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback): void {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        cb => cb !== callback
      );
    }
  }

  getStats(): BlockStats & { isConnected: boolean; reconnectAttempts: number } {
    return {
      ...this.stats,
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    console.log("🔌 Disconnected from Monad WebSocket");
  }

  // Debug function to test real blockchain connection
  async testRealConnection(): Promise<boolean> {
    console.log("🧪 Testing real Monad blockchain connection...");

    try {
      // Test RPC connection
      const response = await fetch(this.config.rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
      });

      const data = await response.json();

      if (data.result) {
        const blockNumber = parseInt(data.result, 16);
        console.log(
          `✅ RPC Connection successful! Latest block: ${blockNumber}`
        );

        // Test WebSocket connection
        if (this.config.wsUrl) {
          const testWs = new WebSocket(this.config.wsUrl);

          testWs.onopen = () => {
            console.log("✅ WebSocket connection test successful!");
            testWs.close();
          };

          testWs.onerror = (error: Event) => {
            console.log("❌ WebSocket connection test failed:", error);
          };
        }

        return true;
      } else {
        console.log("❌ RPC test failed:", data.error);
        return false;
      }
    } catch (error) {
      console.log("❌ Connection test failed:", error);
      return false;
    }
  }

  // Force real data mode (for testing)
  forceRealDataMode(): void {
    console.log("🔄 Forcing real data mode...");
    this.testRealConnection().then(success => {
      if (success) {
        this.connect();
      } else {
        console.log("⚠️ Real connection failed, continuing with mock data");
      }
    });
  }
}

export default MonadWebSocketManager;

// WebSocket Manager Types
export interface ProcessedBlock {
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
  transactions: {
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
  }[];
}

export interface ProcessedTransaction {
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

// Context Types
export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: number;
  timestamp: number;
  blockNumber: number;
  size: number;
  color: string;
  token: string;
  nonce: number;
  input: string;
  isSpecial?: boolean;
  type?: string;
}

export interface BlockData {
  number: number;
  hash: string;
  timestamp: number;
  transactionCount: number;
  gasUsed: number;
  gasLimit: number;
  networkUtilization: number;
  baseFeePerGas?: number;
  totalDifficulty?: string;
  transactions: TransactionData[];
  blockTime?: number;
  transactionTypes?: {
    [category: string]: {
      [type: string]: number;
    };
  };
  TPS?: number;
}

export interface CategoryStats {
  defi: number;
  nft: number;
  transfer: number;
  contractCall: number;
  contractDeploy: number;
  other: number;
}

export interface Stats {
  currentTps: number;
  totalTransactions: number;
  blockTransactions: number;
  gasPrice: number;
  networkHash: string;
  categoryStats: CategoryStats;
}

export interface MonadConfig {
  rpcUrl: string;
  wsUrl: string;
  chainId: number;
  blockTime: number;
  maxTps: number;
  nativeToken: string;
  explorerUrl: string;
}

export interface MonadContextType {
  connection: null;
  wsManager: unknown; // MonadWebSocketManager | null
  isConnected: boolean;
  connectionStatus: string;
  latestBlock: BlockData | null;
  transactions: TransactionData[];
  stats: Stats;
  config: MonadConfig;
  testRealConnection: () => void;
}

// Component Types
export interface TransactionPlanetProps {
  position: [number, number, number];
  type: string;
  count: number;
  scale: number;
}

export interface PlanetData {
  category: string;
  type: string;
  count: number;
  position: [number, number, number];
  scale: number;
}

import {
  ProcessedBlock,
  ProcessedTransaction,
  TransactionData,
  BlockData,
  CategoryStats,
} from "@/types/blockchain";

export const convertProcessedTransaction = (
  tx: ProcessedTransaction
): TransactionData => ({
  hash: tx.hash,
  from: tx.from,
  to: tx.to,
  value: tx.value,
  gasPrice: parseFloat(tx.gasPrice),
  timestamp: tx.timestamp,
  blockNumber: tx.blockNumber,
  size: tx.size,
  color: tx.color,
  token: tx.token,
  nonce: tx.nonce,
  input: tx.input,
  isSpecial: tx.isSpecial,
  type: tx.type,
});

export const convertProcessedBlock = (block: ProcessedBlock): BlockData => ({
  number: block.number,
  hash: block.hash,
  timestamp: block.timestamp,
  transactionCount: block.transactionCount,
  gasUsed: block.gasUsed,
  gasLimit: block.gasLimit,
  networkUtilization: block.networkUtilization,
  baseFeePerGas: block.baseFeePerGas,
  totalDifficulty: block.totalDifficulty,
  transactions: block.transactions.map(tx => ({
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    gasPrice: parseFloat(tx.gasPrice),
    timestamp: tx.timestamp,
    blockNumber: parseInt(tx.blockNumber),
    size: tx.size,
    color: tx.color,
    token: tx.token,
    nonce: parseInt(tx.nonce),
    input: tx.input,
    isSpecial: tx.isSpecial,
    type: tx.type,
  })),
  blockTime: block.blockTime,
});

export const createTransactionTypes = (categoryStats: CategoryStats) => ({
  defi: { defi: categoryStats.defi },
  nft: { nft: categoryStats.nft },
  transfer: { transfer: categoryStats.transfer },
  contractCall: { contractCall: categoryStats.contractCall },
  contractDeploy: { contractDeploy: categoryStats.contractDeploy },
  other: { other: categoryStats.other },
});

export const createInitialCategoryStats = (): CategoryStats => ({
  defi: 0,
  nft: 0,
  transfer: 0,
  contractCall: 0,
  contractDeploy: 0,
  other: 0,
});

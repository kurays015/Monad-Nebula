export const typeColors: Record<string, string> = {
  // DeFi types
  // swap: "#FF6B6B", // Coral Red
  // stake: "#4ECDC4", // Turquoise
  // AddLiquidity: "#FFD93D", // Bright Yellow
  // Lend: "#95E1D3", // Mint Green
  // Borrow: "#FF9F43", // Warm Orange
  // // Deposit: "#4B7BE5", // Royal Blue

  // // NFT types
  // MintNFT: "#FF9F1C", // Orange
  // TransferNFT: "#2EC4B6", // Teal
  // SellNFT: "#E71D36", // Crimson
  // // approve: "#6A0572", // Purple

  // // Contract types
  // deploy: "#7209B7", // Deep Purple
  // // call: "#3A86FF", // Blue

  // // Default for any other types
  // default: "#757575", // Gray
  contractDeploy: "#8b5cf6",
  contractCall: "#3b82f6",
  defi: "#fbbf24",
  nft: "#ec4899",
  transfer: "#10b981",
  other: "#6b7280",
};

export const transactionColors: Record<string, string> = {
  defi: "#fbbf24",
  nft: "#ec4899",
  transfer: "#10b981",
  contractCall: "#3b82f6",
  contractDeploy: "#8b5cf6",
  other: "#6b7280",
};

export const connectionColors: Record<string, string> = {
  connected: "#00ff88",
  connecting: "#ffaa00",
  failed: "#ff4444",
  default: "#888888",
};

export const getTransactionColor = (type: string): string => {
  return transactionColors[type] || transactionColors.other;
};

export const getConnectionColor = (status: string): string => {
  return connectionColors[status] || connectionColors.default;
};

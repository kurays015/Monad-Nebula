export const formatHash = (
  hash: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string => {
  if (!hash) return "0x0000...0000";
  return `${hash.substring(0, prefixLength)}...${hash.substring(
    hash.length - suffixLength
  )}`;
};

export const formatValue = (value: string): string => {
  if (!value) return "0";
  const numValue = parseFloat(value);
  if (numValue === 0) return "0";
  if (numValue < 0.001) return "< 0.001";
  return numValue.toFixed(3);
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const formatGasPrice = (gasPrice: number): string => {
  return `${Math.round(gasPrice)} Gwei`;
};

export const openExplorer = (url: string): void => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export const getExplorerUrl = {
  transaction: (hash: string) => `https://testnet.monadexplorer.com/tx/${hash}`,
  address: (address: string) =>
    `https://testnet.monadexplorer.com/address/${address}`,
  block: (hash: string) => `https://testnet.monadexplorer.com/block/${hash}`,
};

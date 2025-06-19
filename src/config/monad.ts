import { MonadConfig } from "@/types/blockchain";

export const MONAD_TESTNET_CONFIG: MonadConfig = {
  rpcUrl: "https://testnet-rpc.monad.xyz",
  wsUrl: "wss://testnet-rpc.monad.xyz",
  chainId: 41454, // Monad testnet chain ID
  blockTime: 500, // 0.5 second block time
  maxTps: 10000,
  nativeToken: "MON",
  explorerUrl: "https://explorer-testnet.monadinfra.com",
};

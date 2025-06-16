import { createConfig, http } from "@wagmi/core";
import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: {
    name: "MON",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [`https://monad-testnet.rpc.hypersync.xyz`],
    },
  },
  blockExplorers: {
    default: {
      name: "MonVision",
      url: "https://testnet.monadexplorer.com/",
    },
  },
});

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
  ssr: true, // Enable SSR for Next.js
});

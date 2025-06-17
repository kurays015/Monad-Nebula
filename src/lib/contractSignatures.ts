// Known contract signatures for different transaction types
export const CONTRACT_SIGNATURES = {
  // DeFi Operations
  DEFI: {
    swap: [
      "0xa9059cbb",
      "0x23b872dd",
      "0x095ea7b3",
      "0x7ff36ab5",
      "0x38ed1739",
      "0x2232ea43",
      "0x18cbafe5",
      "0x3593564c",
      "0x2213bc0b",
      "0xd555f90d",
      "0x7e865aa4",
      "0x344933be",
      "0x620dcbd1",
    ],
    stake: [
      "0xa694fc3a",
      "0x2e1a7d4d",
      "0x3ccfd60b",
      "0xb6b55f25",
      "0x3a4b66f1",
    ],
    AddLiquidity: [
      "0xe8e33700",
      "0xbaa2abde",
      "0x4515cef3",
      "0x02751cec",
      "0xf305d719",
    ],
    Lend: [
      "0x1249c58b",
      "0xa415bcad",
      "0x69328dec",
      "0x573ade81",
      "0xe8bbf5d7",
    ],
    Borrow: ["0xe8bbf5d7", "0x4b8a3529"],
    Deposit: ["0xe8bbf5d7", "0x47e7ef24"],
  },

  // NFT Operations
  NFT: {
    MintNFT: [
      "0x40c10f19",
      "0xa0712d68",
      "0x6a627842",
      "0x42842e0e",
      "0x1ff7712f",
      "0x1249c58b",
    ],
    TransferNFT: ["0x23b872dd", "0x42842e0e", "0xb88d4fde", "0xa22cb465"],
    SellNFT: ["0x96b5a755", "0xfb0f3ee1", "0xab834bab", "0xe7acab24"],
    // approve: ["0x095ea7b3", "0xa22cb465", "0x40c10f19"],
  },

  // Contract Operations
  CONTRACT: {
    deploy: ["0xcc6212f2", "0x60a06040"], // Contract creation transactions
    call: ["0x"], // Generic contract calls
  },
} as const;

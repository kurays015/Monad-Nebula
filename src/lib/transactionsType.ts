import { CONTRACT_SIGNATURES } from "@/lib/contractSignatures";

interface TransactionType {
  category: string;
  type: string;
}
type SignatureMap = {
  [key: string]: readonly string[];
};
// Function to determine transaction type based on input data
export function analyzeTransactionType(input: string): TransactionType {
  // if (!input || input === "0x") {
  //   return { category: "CONTRACT", type: "call" };
  // }

  const signature = input.slice(0, 10).toLowerCase();

  // Check DeFi operations
  for (const [type, signatures] of Object.entries(
    CONTRACT_SIGNATURES.DEFI as SignatureMap
  )) {
    if (signatures.includes(signature)) {
      return { category: "DEFI", type };
    }
  }

  // Check NFT operations
  for (const [type, signatures] of Object.entries(
    CONTRACT_SIGNATURES.NFT as SignatureMap
  )) {
    if (signatures.includes(signature)) {
      return { category: "NFT", type };
    }
  }

  // Check Contract operations
  for (const [type, signatures] of Object.entries(
    CONTRACT_SIGNATURES.CONTRACT as SignatureMap
  )) {
    if (signatures.includes(signature)) {
      return { category: "CONTRACT", type };
    }
  }

  return { category: "Others", type: "Others" };
}

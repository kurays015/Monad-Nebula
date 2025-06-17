import { createPublicClient, http } from "viem";
import { monadTestnet } from "@/lib/wagmi.config";
import { CONTRACT_SIGNATURES } from "@/lib/contractSignatures";

export const client = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

interface TransactionType {
  category: string;
  type: string;
}

interface Transaction {
  input: string;
  transactionType: TransactionType;
  [key: string]: unknown;
}

interface TransactionTypeCount {
  [category: string]: {
    [type: string]: number;
  };
}

type BlockTransaction = {
  input: `0x${string}`;
  [key: string]: unknown;
};

type SignatureMap = {
  [key: string]: readonly string[];
};

// Function to determine transaction type based on input data
function analyzeTransactionType(input: string): TransactionType {
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

export async function getLatestBlock() {
  try {
    const latestBlock = await client.getBlock({
      blockTag: "latest",
      includeTransactions: true,
    });

    // Analyze transactions if they exist
    const analyzedTransactions = latestBlock.transactions.map(
      (tx: BlockTransaction) => {
        const type = analyzeTransactionType(tx.input);
        return {
          ...tx,
          transactionType: type,
        } as Transaction;
      }
    );

    // Group transactions by type
    const transactionTypes = analyzedTransactions.reduce(
      (acc: TransactionTypeCount, tx: Transaction) => {
        const { category, type } = tx.transactionType;
        if (!acc[category]) {
          acc[category] = {};
        }
        if (!acc[category][type]) {
          acc[category][type] = 0;
        }
        acc[category][type]++;
        return acc;
      },
      {}
    );

    console.log("Latest Block:", {
      number: latestBlock.number.toString(),
      hash: latestBlock.hash,
      transactionTypes,
    });

    return {
      ...latestBlock,
      transactions: analyzedTransactions,
      transactionTypes,
      TPS: latestBlock.transactions.length,
    };
  } catch (error) {
    console.error("Error fetching latest block:", error);
    throw error;
  }
}

export async function estimateTotalTransactions() {
  try {
    const latestBlock = await getLatestBlock();
    if (!latestBlock || !latestBlock.number) {
      throw new Error("Invalid latest block or block number");
    }

    const latestBlockNumber = Number(latestBlock.number);
    console.log("Latest Block Number:", latestBlockNumber); // Debug

    if (latestBlockNumber <= 0) {
      throw new Error("Block number is 0 or negative");
    }

    let totalTxCount = BigInt(0);
    const sampleSize = Math.min(latestBlockNumber, 100); // Reduced for faster debugging
    console.log("Sample Size:", sampleSize); // Debug

    for (let i = latestBlockNumber; i > latestBlockNumber - sampleSize; i--) {
      try {
        const block = await client.getBlock({
          blockNumber: BigInt(i),
          includeTransactions: false,
        });
        if (!Array.isArray(block.transactions)) {
          console.error(
            `Block ${i} has invalid transactions:`,
            block.transactions
          );
          continue;
        }
        console.log(`Block ${i} Transactions:`, block.transactions.length); // Debug
        totalTxCount += BigInt(block.transactions.length);
      } catch (error) {
        console.error(`Error fetching block ${i}:`, error);
        continue; // Skip failed block
      }
    }

    console.log("Total Tx Count:", totalTxCount.toString()); // Debug
    const avgTxPerBlock = Number(totalTxCount) / sampleSize;
    const estimatedTotal = Math.round(avgTxPerBlock * latestBlockNumber);
    console.log("Average Tx Per Block:", avgTxPerBlock); // Debug
    console.log("Estimated Total:", estimatedTotal); // Debug

    return estimatedTotal;
  } catch (error) {
    console.error("Error estimating total transactions:", error);
    throw error; // Throw to let TanStack Query handle the error
  }
}

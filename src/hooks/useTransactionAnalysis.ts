import { useCallback } from "react";
import { analyzeTransactionType } from "@/lib/transactionsType";
import { TransactionData, CategoryStats } from "@/types/blockchain";

export const useTransactionAnalysis = () => {
  const analyzeTransactions = useCallback(
    (transactions: TransactionData[]): CategoryStats => {
      const categoryStats = {
        defi: 0,
        nft: 0,
        transfer: 0,
        contractCall: 0,
        contractDeploy: 0,
        other: 0,
      };

      for (const tx of transactions) {
        if (
          tx &&
          typeof tx === "object" &&
          "input" in tx &&
          typeof tx.input === "string"
        ) {
          const { category, type } = analyzeTransactionType(tx.input);
          if (category === "DEFI") categoryStats.defi++;
          else if (category === "NFT") categoryStats.nft++;
          else if (category === "CONTRACT") {
            if (type === "deploy") categoryStats.contractDeploy++;
            else categoryStats.contractCall++;
          } else if (category === "TRANSFER") categoryStats.transfer++;
          else categoryStats.other++;
        }
      }

      return categoryStats;
    },
    []
  );

  return { analyzeTransactions };
};

import { getLatestBlock } from "@/lib/getBlockChainData";
import { useQuery } from "@tanstack/react-query";

export default function useGetLatestBlock() {
  return useQuery({
    queryKey: ["latest-block"],
    queryFn: () => getLatestBlock(),
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  });
}

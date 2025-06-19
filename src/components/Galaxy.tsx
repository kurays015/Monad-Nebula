import GalaxyScene from "@/components/GalaxyScene";
import NetworkStats from "@/components/NetworkStats";
import TransactionFeed from "@/components/TransactionFeed";

export default function Galaxy() {
  return (
    <>
      <GalaxyScene />
      <NetworkStats />
      <TransactionFeed />
    </>
  );
}

import { Cluster } from "../types/cluster";

export const mainnetBeta: Cluster = {
  name: "mainnetBeta",
  endpoint: "https://api.mainnet-beta.solana.com",
};

export const testnet: Cluster = {
  name: "testnet",
  endpoint: "https://api.testnet.solana.com",
};

export const devnet: Cluster = {
  name: "devnet",
  endpoint: "https://api.devnet.solana.com",
};

export const solanaClusters = {
  mainnetBeta,
  testnet,
  devnet,
};

export type ClusterName = keyof typeof solanaClusters;

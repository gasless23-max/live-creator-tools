import { autoDiscover, createClient } from "@solana/client";

export const client = createClient({
  cluster: import.meta.env.VITE_SOLANA_CLUSTER || "devnet",
  walletConnectors: autoDiscover(),
});

export const TREASURY = import.meta.env.VITE_TREASURY_ADDRESS || "";

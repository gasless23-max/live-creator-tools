import { autoDiscover, createClient } from "@solana/client";

export const client = createClient({
  cluster: "devnet", // change to "mainnet" later
  walletConnectors: autoDiscover(),
});

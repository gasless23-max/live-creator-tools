"use client";

import { SolanaProvider } from "@solana/react-hooks";
import { client } from "./lib/solana";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SolanaProvider client={client} query={{ suspense: false }}>
      {children}
    </SolanaProvider>
  );
}

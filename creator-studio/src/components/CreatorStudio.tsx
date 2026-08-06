"use client";

import { useState, useRef } from "react";
import {
  useWalletConnection,
  useBalance,
  useSolTransfer,
  useWalletSession,
} from "@solana/react-hooks";

const TREASURY = "YourTreasuryPublicKeyHere1111111111111111111111";

type CampaignForm = {
  title: string;
  description: string;
  budgetSol: string;
  targetNetwork: "Solana" | "Robinhood";
  mediaUrl: string;
};

export function CreatorStudio() {
  const { connectors, connect, disconnect, wallet, status, currentConnector } =
    useWalletConnection();
  const address = wallet?.account?.address;
  const balance = useBalance(address);
  const session = useWalletSession();
  const { send, isSending, signature, error } =
    useSolTransfer();

  const [form, setForm] = useState<CampaignForm>({
    title: "",
    description: "",
    budgetSol: "0.5",
    targetNetwork: "Solana",
    mediaUrl: "",
  });
  const [uploading, setUploading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleMediaUpload(file: File) {
    setUploading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const fakeUrl = URL.createObjectURL(file);
      setForm((f) => ({ ...f, mediaUrl: fakeUrl }));
    } finally {
      setUploading(false);
    }
  }

  async function createCampaign() {
    if (!session || !form.title || !form.budgetSol) return;

    const lamports = BigInt(Math.floor(parseFloat(form.budgetSol) * 1e9));

    await send({
      destination: TREASURY,
      amount: lamports,
    });

    const newCampaign = {
      id: crypto.randomUUID(),
      ...form,
      creator: address?.toString(),
      txSignature: signature,
      status: "live",
      createdAt: new Date().toISOString(),
    };

    setCampaigns((prev) => [newCampaign, ...prev]);

    setForm({
      title: "",
      description: "",
      budgetSol: "0.5",
      targetNetwork: "Solana",
      mediaUrl: "",
    });
  }

  if (status !== "connected") {
    return (
      <div className="min-h-screen bg-[#0a0e17] text-white p-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-2">Creator Studio</h1>
        <p className="text-slate-400 mb-8">Connect wallet to launch live campaigns</p>
        <div className="flex flex-wrap gap-3">
          {connectors.map((c) => (
            <button
              key={c.id}
              onClick={() => connect(c.id)}
              className="px-6 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/30 transition"
            >
              Connect {c.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Creator Studio</h1>
          <p className="text-sm text-slate-400">
            {currentConnector?.name} · {address?.toString().slice(0, 4)}…{address?.toString().slice(-4)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400">Balance</p>
            <p className="font-mono">
              {balance.lamports
                ? (Number(balance.lamports) / 1e9).toFixed(4)
                : "…"}{" "}
              SOL
            </p>
          </div>
          <button
            onClick={disconnect}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
          >
            Disconnect
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <h2 className="text-lg font-medium">Launch New Campaign</h2>

          <div className="space-y-4">
            <input
              placeholder="Campaign title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-400"
            />

            <textarea
              placeholder="Short description / call to action"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-400"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Budget (SOL)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={form.budgetSol}
                  onChange={(e) => setForm({ ...form, budgetSol: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Network</label>
                <select
                  value={form.targetNetwork}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      targetNetwork: e.target.value as "Solana" | "Robinhood",
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 outline-none"
                >
                  <option value="Solana">Solana</option>
                  <option value="Robinhood">Robinhood</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Campaign Creative</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="mt-1 border-2 border-dashed border-white/15 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-400/50 transition"
              >
                {form.mediaUrl ? (
                  <img
                    src={form.mediaUrl}
                    alt="preview"
                    className="max-h-40 mx-auto rounded-lg"
                  />
                ) : (
                  <p className="text-slate-400">
                    {uploading ? "Uploading…" : "Click to upload image / video"}
                  </p>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMediaUpload(file);
                }}
              />
            </div>

            <button
              onClick={createCampaign}
              disabled={isSending || !form.title || !form.budgetSol}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSending
                ? "Confirming payment…"
                : `Launch Campaign · ${form.budgetSol} SOL`}
            </button>

            {error != null && (
              <p className="text-red-400 text-sm">{String(error)}</p>
            )}
            {signature && (
              <p className="text-green-400 text-sm break-all">
                Paid ✓ {signature}
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-4">Your Live Campaigns</h2>
          {campaigns.length === 0 ? (
            <div className="border border-white/10 rounded-xl p-8 text-center text-slate-500">
              No campaigns yet. Launch your first one.
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  className="border border-white/10 rounded-xl p-4 bg-white/5"
                >
                  {c.mediaUrl && (
                    <img
                      src={c.mediaUrl}
                      alt=""
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{c.title}</h3>
                      <p className="text-sm text-slate-400">{c.description}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                      LIVE
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between text-sm text-slate-400">
                    <span>{c.budgetSol} SOL · {c.targetNetwork}</span>
                    <a
                      href={`https://explorer.solana.com/tx/${c.txSignature}?cluster=devnet`}
                      target="_blank"
                      className="text-cyan-400 hover:underline"
                    >
                      View tx
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

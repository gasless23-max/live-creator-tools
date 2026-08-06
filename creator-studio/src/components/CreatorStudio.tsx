"use client";

import { useState, useRef, useEffect } from "react";
import {
  useWalletConnection,
  useBalance,
  useSolTransfer,
  useWalletSession,
} from "@solana/react-hooks";

import { TREASURY } from "../lib/solana";

type CampaignForm = {
  title: string;
  description: string;
  budgetSol: string;
  targetNetwork: "Solana" | "Robinhood";
  mediaUrl: string;
};

type Tab = "create" | "live";

export function CreatorStudio() {
  const { connectors, connect, wallet, status, currentConnector } =
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
  const [activeTab, setActiveTab] = useState<Tab>("create");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchCampaigns() {
    try {
      const res = await fetch("/api/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch {
      // silent fail for demo
    }
  }

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function handleMediaUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm((f) => ({ ...f, mediaUrl: data.url }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function createCampaign() {
    if (!session || !form.title || !form.budgetSol) return;

    setSaving(true);
    try {
      const lamports = BigInt(Math.floor(parseFloat(form.budgetSol) * 1e9));

      await send({
        destination: TREASURY,
        amount: lamports,
      });

      const payload = {
        title: form.title,
        description: form.description,
        budgetSol: form.budgetSol,
        targetNetwork: form.targetNetwork,
        mediaUrl: form.mediaUrl,
        creator: address?.toString(),
        txSignature: signature,
        status: "live",
      };

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save campaign");

      const saved = await res.json();
      setCampaigns((prev) => [saved, ...prev]);

      setForm({
        title: "",
        description: "",
        budgetSol: "0.5",
        targetNetwork: "Solana",
        mediaUrl: "",
      });
      setActiveTab("live");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (status !== "connected") {
    return (
      <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-2 text-center">Creator Studio</h1>
          <p className="text-slate-400 mb-8 text-center">
            Connect wallet to launch live campaigns
          </p>
          <div className="space-y-3">
            {connectors.map((c) => (
              <button
                key={c.id}
                onClick={() => connect(c.id)}
                className="w-full py-4 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/30 transition text-base font-medium"
              >
                Connect {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white pb-24">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-[#0a0e17]/90 backdrop-blur-md border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Creator Studio</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentConnector?.name} · {address?.toString().slice(0, 4)}…{address?.toString().slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Balance</p>
            <p className="font-mono text-sm">
              {balance.lamports
                ? (Number(balance.lamports) / 1e9).toFixed(4)
                : "…"}{" "}
              SOL
            </p>
          </div>
        </div>
      </header>

      {/* Tab Content */}
      <main className="px-5 pt-5 max-w-lg mx-auto">
        {activeTab === "create" ? (
          <section className="space-y-5">
            <div>
              <h2 className="text-base font-medium mb-4">Launch New Campaign</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Campaign Title</label>
                  <input
                    placeholder="e.g. Summer Drop 2026"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-base outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Description</label>
                  <textarea
                    placeholder="Short description / call to action"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-base outline-none focus:border-cyan-400 transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Budget (SOL)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={form.budgetSol}
                      onChange={(e) => setForm({ ...form, budgetSol: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-base outline-none focus:border-cyan-400 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Network</label>
                    <select
                      value={form.targetNetwork}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          targetNetwork: e.target.value as "Solana" | "Robinhood",
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-base outline-none appearance-none"
                    >
                      <option value="Solana">Solana</option>
                      <option value="Robinhood">Robinhood</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Campaign Creative</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-white/15 rounded-2xl p-6 text-center cursor-pointer hover:border-cyan-400/50 transition active:scale-[0.98]"
                  >
                    {form.mediaUrl ? (
                      <img
                        src={form.mediaUrl}
                        alt="preview"
                        className="max-h-48 mx-auto rounded-xl object-cover"
                      />
                    ) : (
                      <div className="py-4">
                        <div className="text-2xl mb-2">+</div>
                        <p className="text-slate-400 text-sm">
                          {uploading ? "Uploading…" : "Tap to upload image or video"}
                        </p>
                      </div>
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
                  disabled={isSending || saving || !form.title || !form.budgetSol}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-medium text-base disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition shadow-lg shadow-cyan-500/20"
                >
                  {isSending || saving
                    ? "Confirming payment…"
                    : `Launch · ${form.budgetSol} SOL`}
                </button>

                {error != null && (
                  <p className="text-red-400 text-sm text-center">{String(error)}</p>
                )}
                {signature && (
                  <p className="text-green-400 text-sm text-center break-all">
                    Paid ✓ {signature.slice(0, 20)}…
                  </p>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section>
            <h2 className="text-base font-medium mb-4">Your Live Campaigns</h2>
            {campaigns.length === 0 ? (
              <div className="border border-white/10 rounded-2xl p-8 text-center text-slate-500">
                <div className="text-3xl mb-2 opacity-50">📢</div>
                <p className="text-sm">No campaigns yet. Launch your first one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c) => (
                  <div
                    key={c.id}
                    className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 active:scale-[0.99] transition"
                  >
                    {c.mediaUrl && (
                      <img
                        src={c.mediaUrl}
                        alt=""
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-3">
                          <h3 className="font-medium text-sm">{c.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-medium shrink-0">
                          LIVE
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <span className="text-xs text-slate-400">
                          {c.budgetSol} SOL · {c.targetNetwork}
                        </span>
                        <a
                          href={`https://explorer.solana.com/tx/${c.txSignature}?cluster=devnet`}
                          target="_blank"
                          className="text-xs text-cyan-400 hover:underline"
                        >
                          View tx
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e17]/95 backdrop-blur-lg border-t border-white/10 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex flex-col items-center gap-1 py-2 px-6 rounded-2xl transition ${
              activeTab === "create"
                ? "text-cyan-400 bg-cyan-500/10"
                : "text-slate-400"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] font-medium">Create</span>
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`flex flex-col items-center gap-1 py-2 px-6 rounded-2xl transition ${
              activeTab === "live"
                ? "text-cyan-400 bg-cyan-500/10"
                : "text-slate-400"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-[10px] font-medium">Campaigns</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

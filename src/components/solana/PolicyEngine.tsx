import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PREMIUM_SOL, ekzt, sendPremium } from "./devnetTx";
import { insurerAction } from "@/lib/insurer.functions";
import { DEMO_COLLATERAL_LAMPORTS, explorerAddress, lockCollateralOnChain, triggerAndSettleOnChain } from "./escrowProgram";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Check, FileSignature, Lock, Radar, ShieldCheck, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DemoTag, explorerTx, mockTxHash, shortHash } from "./DemoTag";
import { OnChainProof } from "./OnChainProof";

export type PolicyStage = "none" | "issued" | "locked" | "paid";
export type Policy = { stage: PolicyStage; coverage: number; premium: number; tx?: string; payoutMs?: number; vault?: string; onChain?: boolean; policyId?: string; insurer?: boolean };

const COLLATERAL_SOL = DEMO_COLLATERAL_LAMPORTS / LAMPORTS_PER_SOL;

export const premiumFor = (risk: number, coverage: number) => Math.round(coverage * (0.004 + (risk / 100) * 0.03));

type Props = {
  cargoId: string;
  risk: number;
  policy: Policy;
  onUpdate: (p: Policy, event: string) => void;
};

export function PolicyEngine({ cargoId, risk, policy, onUpdate }: Props) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { connected, signMessage } = wallet;
  const [busy, setBusy] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [lowBalance, setLowBalance] = useState(false);
  useEffect(() => {
    if (!wallet.publicKey) {
      setLowBalance(false);
      return;
    }
    let active = true;
    const check = () =>
      connection
        .getBalance(wallet.publicKey!, "confirmed")
        .then((l) => active && setLowBalance(l < 0.002 * LAMPORTS_PER_SOL))
        .catch(() => undefined);
    check();
    const id = window.setInterval(check, 10_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [wallet.publicKey, connection]);

  const issue = async () => {
    const coverage = 2500;
    const base = { stage: "issued" as const, coverage, premium: premiumFor(risk, coverage) };
    if (!connected) {
      onUpdate(base, "Policy issued");
      return;
    }
    setBusy(true);
    try {
      const sig = await sendPremium(wallet, connection, cargoId, coverage);
      onUpdate({ ...base, tx: sig }, "Policy issued (Devnet tx)");
      toast.success(`Policy issued · premium ${PREMIUM_SOL} Devnet SOL paid to SilkSol AI`, {
        description: `Memo "SilkSol AI | Premium paid | Cargo #${cargoId}" · tx ${shortHash(sig)}`,
        action: { label: "Explorer", onClick: () => window.open(explorerTx(sig), "_blank") },
      });
    } catch (e) {
      toast.error("Devnet transaction failed or rejected", { description: e instanceof Error ? e.message : "Airdrop Devnet SOL and retry." });
    } finally {
      setBusy(false);
    }
  };

  const lock = async () => {
    setBusy(true);
    if (connected && wallet.publicKey) {
      try {
        // Preferred path: the SilkSol insurer treasury locks the collateral for this wallet.
        const res = await insurerAction({
          data: { action: "lock", beneficiary: wallet.publicKey.toBase58(), cargoId, riskScore: risk },
        });
        if (res.ok) {
          onUpdate(
            { ...policy, stage: "locked", tx: res.signature, vault: res.vault, policyId: res.policyId, onChain: true, insurer: true },
            "Collateral locked by insurer (on-chain vault)",
          );
          toast.success(`Insurer locked ${COLLATERAL_SOL} Devnet SOL for your claim`, {
            description: `Vault ${shortHash(res.vault)} · beneficiary = your wallet · tx ${shortHash(res.signature)}`,
            action: { label: "Explorer", onClick: () => window.open(explorerTx(res.signature), "_blank") },
          });
          return;
        }
        if (res.reason !== "not_configured") throw new Error(res.message);
        // Fallback when the server treasury isn't configured: self-funded vault signed by the wallet.
        const { signature, vault } = await lockCollateralOnChain(wallet, connection, cargoId);
        onUpdate({ ...policy, stage: "locked", tx: signature, vault, onChain: true }, "Collateral locked (on-chain vault)");
        toast.success(`Collateral locked on-chain · ${COLLATERAL_SOL} Devnet SOL`, {
          description: `initialize_vault · tx ${shortHash(signature)}`,
          action: { label: "Explorer", onClick: () => window.open(explorerTx(signature), "_blank") },
        });
      } catch (e) {
        toast.error("Escrow program transaction failed or rejected", { description: e instanceof Error ? e.message : "Airdrop Devnet SOL and retry." });
      } finally {
        setBusy(false);
      }
      return;
    }
    try {
      if (signMessage) {
        await signMessage(new TextEncoder().encode(`SilkSol DEVNET demo: lock collateral for #${cargoId}. No funds move.`));
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
      const tx = mockTxHash();
      onUpdate({ ...policy, stage: "locked", tx }, "Collateral locked");
      toast.success("Collateral locked (Devnet)", { description: `${connected ? "Wallet-signed" : "Simulated signature"} · tx ${shortHash(tx)}` });
    } catch {
      toast.error("Signature rejected — nothing was locked.");
    } finally {
      setBusy(false);
    }
  };

  const trigger = async () => {
    if (policy.insurer && policy.policyId && wallet.publicKey) {
      setBusy(true);
      const start = performance.now();
      const id = window.setInterval(() => setTimer(performance.now() - start), 50);
      try {
        const res = await insurerAction({
          data: {
            action: "settle",
            beneficiary: wallet.publicKey.toBase58(),
            cargoId,
            riskScore: risk,
            policyId: policy.policyId,
          },
        });
        if (!res.ok) throw new Error(res.message);
        const ms = Math.round(performance.now() - start);
        onUpdate({ ...policy, stage: "paid", tx: res.signature, payoutMs: ms }, "Claim paid out to wallet (on-chain)");
        toast.success(`+${COLLATERAL_SOL} Devnet SOL received from SilkSol AI`, {
          description: `Oracle → trigger → payout to your wallet · tx ${shortHash(res.signature)} · ${ms} ms`,
          action: { label: "Explorer", onClick: () => window.open(explorerTx(res.signature), "_blank") },
          duration: 15000,
        });
      } catch (e) {
        toast.error("Settlement failed", { description: e instanceof Error ? e.message : "Retry the trigger." });
      } finally {
        window.clearInterval(id);
        setTimer(null);
        setBusy(false);
      }
      return;
    }
    if (policy.onChain && policy.vault && connected) {
      setBusy(true);
      const start = performance.now();
      const id = window.setInterval(() => setTimer(performance.now() - start), 50);
      try {
        const sig = await triggerAndSettleOnChain(wallet, connection, policy.vault, risk);
        const ms = Math.round(performance.now() - start);
        onUpdate({ ...policy, stage: "paid", tx: sig, payoutMs: ms }, "Claim paid out (on-chain)");
        toast.success(`Claim Paid Out on-chain · ${COLLATERAL_SOL} Devnet SOL`, {
          description: `submit_telemetry → evaluate_trigger → settle_payout · tx ${shortHash(sig)} · ${ms} ms`,
          action: { label: "Explorer", onClick: () => window.open(explorerTx(sig), "_blank") },
        });
      } catch (e) {
        toast.error("Settlement transaction failed or rejected", { description: e instanceof Error ? e.message : "Retry the trigger." });
      } finally {
        window.clearInterval(id);
        setTimer(null);
        setBusy(false);
      }
      return;
    }
    setBusy(true);
    const start = performance.now();
    const target = 380 + Math.random() * 80;
    const tick = () => {
      const t = performance.now() - start;
      setTimer(Math.min(t, target));
      if (t < target) {
        requestAnimationFrame(tick);
        return;
      }
      const tx = mockTxHash();
      onUpdate({ ...policy, stage: "paid", tx, payoutMs: Math.round(target), onChain: false }, "Claim paid out");
      toast.success(`Claim Paid Out · ${policy.coverage.toLocaleString()} Demo USDC`, {
        description: `(or ${ekzt(policy.coverage)} via AIFC Gateway) · Mock tx ${shortHash(tx)} · ${Math.round(target)} ms`,
        action: { label: "Explorer", onClick: () => window.open(explorerTx(tx), "_blank") },
      });
      setBusy(false);
      setTimer(null);
    };
    requestAnimationFrame(tick);
  };

  const steps: { key: PolicyStage; label: string }[] = [
    { key: "issued", label: "Issued" },
    { key: "locked", label: "Locked" },
    { key: "paid", label: "Paid" },
  ];
  const order: PolicyStage[] = ["none", "issued", "locked", "paid"];
  const idx = order.indexOf(policy.stage);

  return (
    <div className="panel">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex size-8 items-center justify-center rounded-md bg-accent text-primary"><ShieldCheck className="size-4" /></div>
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Parametric policy & claim engine</p>
          <h2 className="mt-0.5 text-sm font-semibold">Cover · #{cargoId}</h2>
        </div>
        <DemoTag kind="DEVNET" className="ml-auto" />
      </div>
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Cell label="AI risk score" value={`${risk}%`} tone={risk > 60 ? "text-warning" : "text-success"} />
          <Cell label="Coverage" value={`${(policy.coverage || 2500).toLocaleString()}`} />
          <Cell label="Premium" value={`${premiumFor(risk, policy.coverage || 2500)}`} />
        </div>
        <p className="-mt-2 text-[10px] text-muted-foreground">Amounts in Demo USDC · trigger: delay &gt; 72h</p>
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center gap-2">
              <span className={`flex size-5 items-center justify-center rounded-full text-[10px] ${idx > i ? "bg-success/20 text-success" : "bg-accent text-muted-foreground"}`}>{idx > i ? <Check className="size-3" /> : i + 1}</span>
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
              {i < 2 && <span className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>
        {policy.stage === "none" && lowBalance && (
          <p className="rounded-md border border-warning/40 bg-warning/10 p-2 text-[11px] text-warning">
            Your Devnet wallet is empty. Click <b>Review settlement</b> at the bottom first — SilkSol pays you 0.01 SOL, enough for the premium — or use faucet.solana.com.
          </p>
        )}
        {policy.stage === "none" && <Button className="w-full" onClick={issue} disabled={busy}><FileSignature className="size-4" /> {busy ? "Awaiting wallet…" : "Issue Parametric Policy"}</Button>}
        {policy.stage === "issued" && (
          <>
            <Button className="w-full" onClick={lock} disabled={busy}><Lock className="size-4" /> {busy ? "Awaiting signature…" : "Lock Collateral & Sign (Devnet)"}</Button>
            {connected ? (
              <p className="text-[10px] text-muted-foreground">The SilkSol insurer locks {COLLATERAL_SOL} Devnet SOL in an escrow vault PDA with your wallet as beneficiary (real program call).</p>
            ) : (
              <p className="text-[10px] text-muted-foreground">Wallet disconnected — a simulated signature will be used.</p>
            )}
          </>
        )}
        {policy.stage === "locked" && (
          <Button className="w-full" variant="secondary" onClick={trigger} disabled={busy}>
            {timer !== null ? <><Timer className="size-4 animate-spin" /> Settling… {(timer / 1000).toFixed(3)}s</> : <><Radar className="size-4" /> Trigger Oracle Event (Simulate Delay &gt;72h)</>}
          </Button>
        )}
        {policy.stage === "paid" && (
          <div className="rounded-md border border-success/40 bg-success/10 p-3 text-xs">
            <p className="flex items-center gap-2 font-semibold text-success"><Check className="size-4" /> Claim Paid Out · {policy.coverage.toLocaleString()} Demo USDC <DemoTag kind={policy.onChain ? "DEVNET" : "SIMULATED"} /></p>
            {policy.onChain && policy.vault && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                On-chain: {COLLATERAL_SOL} Devnet SOL {policy.insurer ? "paid to your wallet" : "released"} by the escrow program ·{" "}
                <a className="font-mono text-primary" href={explorerAddress(policy.vault)} target="_blank" rel="noreferrer">vault {shortHash(policy.vault)}</a>
              </p>
            )}
            <p className="mt-0.5 text-[11px] text-muted-foreground">(or {ekzt(policy.coverage)} via AIFC Gateway)</p>
            <p className="mt-1 text-muted-foreground">Settled in {policy.payoutMs} ms · <a className="font-mono text-primary" href={policy.tx ? explorerTx(policy.tx) : "#"} target="_blank" rel="noreferrer">tx {policy.tx ? shortHash(policy.tx) : ""}</a></p>
          </div>
        )}
        <OnChainProof refreshKey={policy.onChain ? policy.tx : undefined} />
      </div>
    </div>
  );
}

function Cell({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return <div className="rounded-md border border-border p-2"><p className="text-[9px] text-muted-foreground">{label}</p><p className={`mt-0.5 font-semibold ${tone}`}>{value}</p></div>;
}

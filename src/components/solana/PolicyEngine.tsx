import { useWallet } from "@solana/wallet-adapter-react";
import { Check, FileSignature, Lock, Radar, ShieldCheck, Timer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DemoTag, explorerTx, mockTxHash, shortHash } from "./DemoTag";

export type PolicyStage = "none" | "issued" | "locked" | "paid";
export type Policy = { stage: PolicyStage; coverage: number; premium: number; tx?: string; payoutMs?: number };

export const premiumFor = (risk: number, coverage: number) => Math.round(coverage * (0.004 + (risk / 100) * 0.03));

type Props = {
  cargoId: string;
  risk: number;
  policy: Policy;
  onUpdate: (p: Policy, event: string) => void;
};

export function PolicyEngine({ cargoId, risk, policy, onUpdate }: Props) {
  const { connected, signMessage } = useWallet();
  const [busy, setBusy] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  const issue = () => {
    const coverage = 2500;
    onUpdate({ stage: "issued", coverage, premium: premiumFor(risk, coverage) }, "Policy issued");
  };

  const lock = async () => {
    setBusy(true);
    try {
      if (connected && signMessage) {
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

  const trigger = () => {
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
      onUpdate({ ...policy, stage: "paid", tx, payoutMs: Math.round(target) }, "Claim paid out");
      toast.success(`Claim Paid Out · ${policy.coverage.toLocaleString()} Demo USDC`, {
        description: `Mock Solana Explorer tx ${shortHash(tx)} · ${Math.round(target)} ms`,
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
        {policy.stage === "none" && <Button className="w-full" onClick={issue}><FileSignature className="size-4" /> Issue Parametric Policy</Button>}
        {policy.stage === "issued" && (
          <>
            <Button className="w-full" onClick={lock} disabled={busy}><Lock className="size-4" /> {busy ? "Awaiting signature…" : "Lock Collateral & Sign (Devnet)"}</Button>
            {!connected && <p className="text-[10px] text-muted-foreground">Wallet disconnected — a simulated signature will be used.</p>}
          </>
        )}
        {policy.stage === "locked" && (
          <Button className="w-full" variant="secondary" onClick={trigger} disabled={busy}>
            {timer !== null ? <><Timer className="size-4 animate-spin" /> Settling… {(timer / 1000).toFixed(3)}s</> : <><Radar className="size-4" /> Trigger Oracle Event (Simulate Delay &gt;72h)</>}
          </Button>
        )}
        {policy.stage === "paid" && (
          <div className="rounded-md border border-success/40 bg-success/10 p-3 text-xs">
            <p className="flex items-center gap-2 font-semibold text-success"><Check className="size-4" /> Claim Paid Out (Demo USDC) <DemoTag kind="SIMULATED" /></p>
            <p className="mt-1 text-muted-foreground">Settled in {policy.payoutMs} ms · <a className="font-mono text-primary" href={policy.tx ? explorerTx(policy.tx) : "#"} target="_blank" rel="noreferrer">tx {policy.tx ? shortHash(policy.tx) : ""}</a></p>
          </div>
        )}
      </div>
    </div>
  );
}

function Cell({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return <div className="rounded-md border border-border p-2"><p className="text-[9px] text-muted-foreground">{label}</p><p className={`mt-0.5 font-semibold ${tone}`}>{value}</p></div>;
}

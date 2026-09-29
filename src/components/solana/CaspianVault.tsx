import { Landmark, Percent, Vault } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DemoTag, explorerTx, mockTxHash, shortHash } from "./DemoTag";

type Props = {
  walletUsdc: number;
  staked: number;
  tvl: number;
  onChange: (delta: number) => void;
};

export function CaspianVault({ walletUsdc, staked, tvl, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("1000");
  const value = Number(amount);
  const max = mode === "deposit" ? walletUsdc : staked;
  const invalid = !Number.isFinite(value) || value <= 0 || value > max;

  const submit = () => {
    if (invalid) return;
    onChange(mode === "deposit" ? value : -value);
    const tx = mockTxHash();
    toast.success(`${mode === "deposit" ? "Deposited" : "Withdrew"} ${value.toLocaleString()} Demo USDC`, {
      description: `Simulated devnet tx ${shortHash(tx)}`,
      action: { label: "Explorer", onClick: () => window.open(explorerTx(tx), "_blank") },
    });
    setOpen(false);
  };

  return (
    <div className="panel">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex size-8 items-center justify-center rounded-md bg-accent text-primary"><Vault className="size-4" /></div>
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">RWA tokenized liquidity</p>
          <h2 className="mt-0.5 text-sm font-semibold">Caspian Risk Vault</h2>
        </div>
        <DemoTag kind="DEMO DATA" className="ml-auto" />
      </div>
      <div className="grid grid-cols-3 divide-x divide-border py-4">
        <Stat icon={Landmark} label="TVL" value={`$${(tvl / 1_000_000).toFixed(2)}M`} />
        <Stat icon={Percent} label="Net APY" value="11.8%" />
        <Stat icon={Vault} label="Your stake" value={staked.toLocaleString()} />
      </div>
      <div className="flex items-center gap-2 border-t border-border px-5 py-3">
        <p className="text-[10px] leading-4 text-muted-foreground">Underwrites parametric cargo cover. Yield from premiums — simulated.</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="ml-auto shrink-0">Stake</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">Caspian Risk Vault <DemoTag kind="DEVNET" /></DialogTitle>
              <DialogDescription>Deposit / Withdraw (Devnet USDC / Demo). No real funds move.</DialogDescription>
            </DialogHeader>
            <Tabs value={mode} onValueChange={(v) => setMode(v as "deposit" | "withdraw")}>
              <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="deposit">Deposit</TabsTrigger><TabsTrigger value="withdraw">Withdraw</TabsTrigger></TabsList>
            </Tabs>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground"><span>Amount (Demo USDC)</span><button className="text-primary" onClick={() => setAmount(String(max))}>Max {max.toLocaleString()}</button></div>
              <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
              {invalid && <p className="text-xs text-warning">Enter an amount between 0 and {max.toLocaleString()}.</p>}
              <p className="text-xs text-muted-foreground">You receive ≈ {Number.isFinite(value) ? (value * 0.97).toFixed(2) : "0"} csRV share tokens <DemoTag kind="SIMULATED" /></p>
            </div>
            <Button onClick={submit} disabled={invalid}>{mode === "deposit" ? "Deposit" : "Withdraw"} (Demo)</Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Vault; label: string; value: string }) {
  return <div className="min-w-0 px-4"><Icon className="mb-2 size-4 text-primary" /><p className="text-[10px] text-muted-foreground">{label}</p><p className="mt-0.5 truncate text-base font-semibold">{value}</p></div>;
}

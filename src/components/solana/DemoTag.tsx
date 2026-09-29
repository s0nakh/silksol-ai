import { cn } from "@/lib/utils";

type Kind = "DEMO" | "SIMULATED" | "DEVNET" | "DEMO DATA";

export function DemoTag({ kind = "DEMO", className }: { kind?: Kind; className?: string }) {
  const tone =
    kind === "DEVNET"
      ? "border-success/40 bg-success/10 text-success"
      : kind === "SIMULATED"
        ? "border-warning/40 bg-warning/10 text-warning"
        : "border-primary/40 bg-primary/10 text-primary";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase leading-none tracking-wider",
        tone,
        className,
      )}
    >
      {kind}
    </span>
  );
}

export function mockTxHash() {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < 88; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export const shortHash = (h: string) => `${h.slice(0, 4)}...${h.slice(-4)}`;
export const explorerTx = (h: string) => `https://explorer.solana.com/tx/${h}?cluster=devnet`;

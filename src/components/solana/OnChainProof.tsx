import { useConnection } from "@solana/wallet-adapter-react";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { explorerTx, shortHash } from "./DemoTag";
import { ESCROW_PROGRAM_ID, explorerAddress } from "./escrowProgram";

type Status = "checking" | "live" | "unreachable";
type Activity = { signature: string; blockTime: number | null; ok: boolean };

const PROGRAM = ESCROW_PROGRAM_ID.toBase58();

function ago(unix: number | null) {
  if (!unix) return "";
  const s = Math.max(0, Math.round(Date.now() / 1000 - unix));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

/** Live proof, visible without a wallet, that the escrow program is deployed and used on Devnet. */
export function OnChainProof({ refreshKey }: { refreshKey?: string | undefined }) {
  const { connection } = useConnection();
  const [status, setStatus] = useState<Status>("checking");
  const [activity, setActivity] = useState<Activity[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const info = await connection.getAccountInfo(ESCROW_PROGRAM_ID);
        if (!active) return;
        setStatus(info?.executable ? "live" : "unreachable");
        const sigs = await connection.getSignaturesForAddress(ESCROW_PROGRAM_ID, { limit: 3 });
        if (active)
          setActivity(
            sigs.map((s) => ({
              signature: s.signature,
              blockTime: s.blockTime ?? null,
              ok: !s.err,
            })),
          );
      } catch {
        if (active) setStatus((prev) => (prev === "live" ? prev : "unreachable"));
      }
    })();
    return () => {
      active = false;
    };
  }, [connection, refreshKey]);

  return (
    <div
      data-testid="onchain-proof"
      className="rounded-md border border-border bg-card/60 p-3 text-[11px]"
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold">On-chain escrow program</span>
        <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
          <span
            className={`size-2 rounded-full ${status === "live" ? "bg-success" : status === "checking" ? "animate-pulse bg-muted-foreground" : "bg-warning"}`}
          />
          {status === "live"
            ? "Live on Devnet"
            : status === "checking"
              ? "Checking Devnet…"
              : "Devnet RPC unreachable"}
        </span>
      </div>
      <a
        className="mt-1 inline-flex items-center gap-1 font-mono text-primary"
        href={explorerAddress(PROGRAM)}
        target="_blank"
        rel="noreferrer"
      >
        {shortHash(PROGRAM)} <ExternalLink className="size-3" />
      </a>
      <span className="text-muted-foreground">
        {" "}
        · initialize_vault → evaluate_trigger → settle_payout
      </span>
      {activity.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            Recent program transactions
          </p>
          {activity.map((a) => (
            <a
              key={a.signature}
              className="flex items-center gap-2 font-mono text-[10px] text-primary"
              href={explorerTx(a.signature)}
              target="_blank"
              rel="noreferrer"
            >
              <span className={`size-1.5 rounded-full ${a.ok ? "bg-success" : "bg-warning"}`} />
              {shortHash(a.signature)}
              <span className="ml-auto font-sans text-muted-foreground">{ago(a.blockTime)}</span>
            </a>
          ))}
        </div>
      )}
      <p className="mt-2 text-[10px] text-muted-foreground">
        Connect a Devnet wallet to run Lock &amp; Trigger through this program.
      </p>
    </div>
  );
}

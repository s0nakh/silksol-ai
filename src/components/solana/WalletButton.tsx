import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { LogOut, WalletCards } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DemoTag } from "./DemoTag";

export function WalletButton({ demoUsdc }: { demoUsdc: number }) {
  const { wallets, select, disconnect, publicKey, connected, connecting, wallet } = useWallet();
  const { connection } = useConnection();
  const [sol, setSol] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setSol(null);
      return;
    }
    let active = true;
    const load = () =>
      connection
        .getBalance(publicKey, "confirmed")
        .then((l) => active && setSol(l / LAMPORTS_PER_SOL))
        .catch(() => undefined);
    load();
    // Payouts arrive from the insurer without a wallet prompt, so keep the balance live.
    const sub = connection.onAccountChange(
      publicKey,
      (acc) => active && setSol(acc.lamports / LAMPORTS_PER_SOL),
      "confirmed",
    );
    const id = window.setInterval(load, 10_000);
    return () => {
      active = false;
      window.clearInterval(id);
      connection.removeAccountChangeListener(sub).catch(() => undefined);
    };
  }, [publicKey, connection]);

  // If the wallet popup never shows up or is dismissed, the adapter can stay "connecting" forever.
  // Give up after 30 s so the user can retry instead of being stuck.
  useEffect(() => {
    if (!connecting) return;
    const id = window.setTimeout(() => {
      forceDisconnect();
      toast.error(`${wallet?.adapter.name ?? "Wallet"} did not respond`, {
        description:
          "Click the wallet icon in your browser toolbar, unlock it, make sure it is on Devnet, then press Connect wallet again.",
        duration: 12000,
      });
    }, 30_000);
    return () => window.clearTimeout(id);
  }, [connecting, disconnect, wallet]);

  // wallet-adapter drops "disconnect" events once the page has seen a `beforeunload` (some
  // browsers, e.g. Arc, fire it when opening links), leaving the UI stuck as connected.
  // Clear the stored wallet and, if the UI still hasn't caught up, reload as a last resort.
  const connectedRef = useRef(connected);
  connectedRef.current = connected;
  const forceDisconnect = async () => {
    await disconnect().catch(() => undefined);
    select(null);
    window.setTimeout(() => {
      if (connectedRef.current) window.location.reload();
    }, 600);
  };

  const addr = publicKey?.toBase58();

  if (!connected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">
            <WalletCards className="size-4 text-primary" />
            {connecting ? "Connecting…" : "Connect wallet"}
            <DemoTag kind="DEVNET" className="hidden sm:inline-flex" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="text-xs">Solana Devnet wallets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {connecting && (
            <>
              <p className="px-2 py-1.5 text-[11px] leading-4 text-warning">
                Waiting for {wallet?.adapter.name ?? "your wallet"} — approve the request in its
                popup (click the extension icon if no window appeared).
              </p>
              <DropdownMenuItem onClick={forceDisconnect}>
                <LogOut className="size-4" /> Cancel and retry
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {wallets.map((w) => {
            const installed =
              w.readyState === WalletReadyState.Installed ||
              w.readyState === WalletReadyState.Loadable;
            return (
              <DropdownMenuItem
                key={w.adapter.name}
                onClick={() =>
                  installed ? select(w.adapter.name) : window.open(w.adapter.url, "_blank")
                }
              >
                <img src={w.adapter.icon} alt="" className="size-4" />
                {w.adapter.name}
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {installed ? "Detected" : "Install"}
                </span>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <p className="px-2 py-1.5 text-[10px] leading-4 text-muted-foreground">
            No wallet? The dashboard keeps working in demo mode with simulated signatures.
          </p>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          <span className="size-2 rounded-full bg-success" />
          <span className="font-mono text-xs">
            {addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : ""}
          </span>
          <DemoTag kind="DEVNET" className="hidden sm:inline-flex" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs">
          Devnet / Demo balance <DemoTag kind="DEVNET" />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-1.5 px-2 py-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Devnet SOL</span>
            <span className="font-semibold">{sol === null ? "—" : sol.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Demo USDC</span>
            <span className="font-semibold">{demoUsdc.toLocaleString()}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={forceDisconnect}>
          <LogOut className="size-4" /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

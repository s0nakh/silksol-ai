import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { LogOut, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
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
  const { wallets, select, disconnect, publicKey, connected, connecting } = useWallet();
  const { connection } = useConnection();
  const [sol, setSol] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setSol(null);
      return;
    }
    let active = true;
    connection
      .getBalance(publicKey)
      .then((l) => active && setSol(l / LAMPORTS_PER_SOL))
      .catch(() => active && setSol(null));
    return () => {
      active = false;
    };
  }, [publicKey, connection]);

  const addr = publicKey?.toBase58();

  if (!connected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" disabled={connecting}>
            <WalletCards className="size-4 text-primary" />
            {connecting ? "Connecting…" : "Connect wallet"}
            <DemoTag kind="DEVNET" className="hidden sm:inline-flex" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="text-xs">Solana Devnet wallets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {wallets.map((w) => {
            const installed = w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable;
            return (
              <DropdownMenuItem
                key={w.adapter.name}
                onClick={() => (installed ? select(w.adapter.name) : window.open(w.adapter.url, "_blank"))}
              >
                <img src={w.adapter.icon} alt="" className="size-4" />
                {w.adapter.name}
                <span className="ml-auto text-[10px] text-muted-foreground">{installed ? "Detected" : "Install"}</span>
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
          <span className="font-mono text-xs">{addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : ""}</span>
          <DemoTag kind="DEVNET" className="hidden sm:inline-flex" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs">Devnet / Demo balance <DemoTag kind="DEVNET" /></DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-1.5 px-2 py-1.5 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Devnet SOL</span><span className="font-semibold">{sol === null ? "—" : sol.toFixed(4)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Demo USDC</span><span className="font-semibold">{demoUsdc.toLocaleString()}</span></div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => disconnect()}><LogOut className="size-4" /> Disconnect</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

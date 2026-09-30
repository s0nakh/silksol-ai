import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, type Connection } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";

// Demo treasury address (devnet). Sends 0.001 Devnet SOL — no real funds.
const DEMO_TREASURY = new PublicKey("11111111111111111111111111111112");

export const EKZT_PER_USDC = 500;
export const ekzt = (usdc: number) => `~${(usdc * EKZT_PER_USDC).toLocaleString()} eKZT`;

export async function sendDevnetSol(wallet: WalletContextState, connection: Connection): Promise<string> {
  if (!wallet.publicKey || !wallet.sendTransaction) throw new Error("Wallet not connected");
  const tx = new Transaction().add(
    SystemProgram.transfer({ fromPubkey: wallet.publicKey, toPubkey: DEMO_TREASURY, lamports: Math.round(0.001 * LAMPORTS_PER_SOL) }),
  );
  const sig = await wallet.sendTransaction(tx, connection);
  const latest = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed").catch(() => undefined);
  return sig;
}

import { LAMPORTS_PER_SOL, SystemProgram, Transaction, type Connection } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { TREASURY_PUBKEY, memoIx, premiumMemo } from "./memo";

export const PREMIUM_SOL = 0.001;

export const EKZT_PER_USDC = 500;
export const ekzt = (usdc: number) => `~${(usdc * EKZT_PER_USDC).toLocaleString()} eKZT`;

/** Shipper pays the policy premium (0.001 Devnet SOL) to the SilkSol insurer treasury, with a memo. */
export async function sendPremium(
  wallet: WalletContextState,
  connection: Connection,
  cargoId: string,
  coverage: number,
): Promise<string> {
  if (!wallet.publicKey || !wallet.sendTransaction) throw new Error("Wallet not connected");
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: TREASURY_PUBKEY,
      lamports: Math.round(PREMIUM_SOL * LAMPORTS_PER_SOL),
    }),
    memoIx(premiumMemo(cargoId, coverage), [wallet.publicKey]),
  );
  const sig = await wallet.sendTransaction(tx, connection);
  const latest = await connection.getLatestBlockhash();
  await connection
    .confirmTransaction({ signature: sig, ...latest }, "confirmed")
    .catch(() => undefined);
  return sig;
}

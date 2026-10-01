import { Buffer } from "buffer";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";

// SPL Memo program v2: attaches human-readable UTF-8 text to a transaction.
// Explorer shows it as "Memo Program: Memo" → Data (UTF-8).
export const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

/** Public address of the SilkSol AI insurer treasury on Devnet (pays claims, receives premiums). */
export const TREASURY_PUBKEY = new PublicKey("LxtEpBFNvEEBmESNA6ExiYHdrdZCfNGkCbndLVimv7C");

export const MEMO_PREFIX = "SilkSol AI";

export function memoIx(text: string, signers: PublicKey[] = []) {
  return new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: signers.map((pubkey) => ({ pubkey, isSigner: true, isWritable: false })),
    data: Buffer.from(text, "utf8"),
  });
}

/** SHA-256 (hex) of the oracle report that triggered a payout — lets anyone audit the off-chain data. */
export async function reportHash(report: Record<string, string | number>) {
  const bytes = new TextEncoder().encode(JSON.stringify(report));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const premiumMemo = (cargoId: string, coverage: number) =>
  `${MEMO_PREFIX} | Premium paid | Cargo #${cargoId} | Cover ${coverage.toLocaleString("en-US")} Demo USDC`;

export const lockMemo = (cargoId: string, policyId: string, threshold: number) =>
  `${MEMO_PREFIX} | Collateral locked | Cargo #${cargoId} | Policy ${policyId} | Trigger: delay > ${threshold}h`;

export const payoutMemo = (
  cargoId: string,
  policyId: string,
  dwell: number,
  threshold: number,
  hash: string,
) =>
  `${MEMO_PREFIX} | Parametric payout | Cargo #${cargoId} | Delay ${dwell}h > ${threshold}h | Policy ${policyId} | Report sha256:${hash}`;

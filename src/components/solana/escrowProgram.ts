import { Buffer } from "buffer";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  type Connection,
} from "@solana/web3.js";

// Hand-encoded client for the `silksol_escrow` Anchor program (anchor/programs/silksol_escrow).
// Kept dependency-free (no @coral-xyz/anchor) so the browser/Worker bundle stays small.
// Discriminators are checked against the generated IDL in anchor/tests.

export const ESCROW_PROGRAM_ID = new PublicKey("Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z");

export const DEMO_COLLATERAL_LAMPORTS = Math.round(0.01 * LAMPORTS_PER_SOL);
export const TRIGGER_THRESHOLD_HOURS = 72;
export const SIMULATED_DWELL_HOURS = 96;

export const DISCRIMINATORS = {
  initialize_vault: [48, 191, 163, 44, 71, 129, 63, 164],
  submit_telemetry: [76, 88, 138, 54, 75, 143, 216, 121],
  evaluate_trigger: [47, 123, 26, 45, 241, 223, 162, 222],
  settle_payout: [245, 141, 29, 81, 209, 73, 180, 155],
  close_vault: [141, 103, 17, 126, 72, 75, 29, 29],
} as const;

const u32 = (n: number) => {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n);
  return b;
};
const u64 = (n: bigint) => {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(n);
  return b;
};
const str = (s: string) => {
  const bytes = Buffer.from(s, "utf8");
  return Buffer.concat([u32(bytes.length), bytes]);
};
const data = (name: keyof typeof DISCRIMINATORS, ...args: Buffer[]) =>
  Buffer.concat([Buffer.from(DISCRIMINATORS[name]), ...args]);

export function vaultPda(authority: PublicKey, policyId: bigint, programId = ESCROW_PROGRAM_ID) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), authority.toBuffer(), u64(policyId)],
    programId,
  )[0];
}

type InitArgs = {
  authority: PublicKey;
  policyId: bigint;
  shipmentId: string;
  collateralLamports: number;
  thresholdHours: number;
  oracle: PublicKey;
  beneficiary: PublicKey;
};

export function initializeVaultIx(a: InitArgs, programId = ESCROW_PROGRAM_ID) {
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: a.authority, isSigner: true, isWritable: true },
      { pubkey: vaultPda(a.authority, a.policyId, programId), isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: data(
      "initialize_vault",
      u64(a.policyId),
      str(a.shipmentId),
      u64(BigInt(a.collateralLamports)),
      u32(a.thresholdHours),
      a.oracle.toBuffer(),
      a.beneficiary.toBuffer(),
    ),
  });
}

export function submitTelemetryIx(
  oracle: PublicKey,
  vault: PublicKey,
  dwellHours: number,
  riskScore: number,
  programId = ESCROW_PROGRAM_ID,
) {
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: oracle, isSigner: true, isWritable: false },
      { pubkey: vault, isSigner: false, isWritable: true },
    ],
    data: data("submit_telemetry", u32(dwellHours), Buffer.from([riskScore])),
  });
}

export function evaluateTriggerIx(vault: PublicKey, programId = ESCROW_PROGRAM_ID) {
  return new TransactionInstruction({
    programId,
    keys: [{ pubkey: vault, isSigner: false, isWritable: true }],
    data: data("evaluate_trigger"),
  });
}

export function settlePayoutIx(
  vault: PublicKey,
  beneficiary: PublicKey,
  programId = ESCROW_PROGRAM_ID,
) {
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: beneficiary, isSigner: false, isWritable: true },
    ],
    data: data("settle_payout"),
  });
}

export function closeVaultIx(
  authority: PublicKey,
  vault: PublicKey,
  programId = ESCROW_PROGRAM_ID,
) {
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
    ],
    data: data("close_vault"),
  });
}

// --- Wallet flows used by the dashboard (wallet = insurer, oracle and beneficiary on Devnet) ---

type WalletLike = {
  publicKey: PublicKey | null;
  sendTransaction: (tx: Transaction, connection: Connection) => Promise<string>;
};

async function sendAndConfirm(
  wallet: WalletLike,
  connection: Connection,
  ...ixs: TransactionInstruction[]
) {
  if (!wallet.publicKey) throw new Error("Wallet not connected");
  const latest = await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction({ feePayer: wallet.publicKey, ...latest }).add(...ixs);
  const signature = await wallet.sendTransaction(tx, connection);
  const res = await connection.confirmTransaction({ signature, ...latest }, "confirmed");
  if (res.value.err) throw new Error(`Transaction failed: ${JSON.stringify(res.value.err)}`);
  return signature;
}

/** Locks demo collateral in a fresh on-chain vault. Returns the tx signature and vault address. */
export async function lockCollateralOnChain(
  wallet: WalletLike,
  connection: Connection,
  shipmentId: string,
) {
  if (!wallet.publicKey) throw new Error("Wallet not connected");
  const me = wallet.publicKey;
  const policyId = BigInt(Date.now());
  const ix = initializeVaultIx({
    authority: me,
    policyId,
    shipmentId: shipmentId.slice(0, 32),
    collateralLamports: DEMO_COLLATERAL_LAMPORTS,
    thresholdHours: TRIGGER_THRESHOLD_HOURS,
    oracle: me,
    beneficiary: me,
  });
  const signature = await sendAndConfirm(wallet, connection, ix);
  return { signature, vault: vaultPda(me, policyId).toBase58() };
}

/** Oracle reports a delay, the deterministic trigger fires and the vault pays out — one transaction. */
export async function triggerAndSettleOnChain(
  wallet: WalletLike,
  connection: Connection,
  vault: string,
  riskScore: number,
) {
  if (!wallet.publicKey) throw new Error("Wallet not connected");
  const me = wallet.publicKey;
  const v = new PublicKey(vault);
  return sendAndConfirm(
    wallet,
    connection,
    submitTelemetryIx(
      me,
      v,
      SIMULATED_DWELL_HOURS,
      Math.max(0, Math.min(100, Math.round(riskScore))),
    ),
    evaluateTriggerIx(v),
    settlePayoutIx(v, me),
  );
}

export const explorerAddress = (a: string) =>
  `https://explorer.solana.com/address/${a}?cluster=devnet`;

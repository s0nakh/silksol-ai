import { Buffer } from "buffer";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";

// Hand-encoded client for the `silksol_escrow` Anchor program (anchor/programs/silksol_escrow).
// Kept dependency-free (no @coral-xyz/anchor) so the browser/Worker bundle stays small.
// Discriminators are checked against the generated IDL in anchor/tests.

export const ESCROW_PROGRAM_ID = new PublicKey("Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z");

export const DEMO_COLLATERAL_LAMPORTS = Math.round(0.01 * LAMPORTS_PER_SOL);
export const TRIGGER_THRESHOLD_HOURS = 72;
/** Demo cover period: telemetry is accepted, and collateral stays locked, for 7 days. */
export const DEMO_COVERAGE_SECONDS = 7 * 24 * 3600;

// Simulated oracle telemetry: port dwell time per demo cargo. The insurer/oracle reads it on the
// server (the browser never chooses the number), so the on-chain trigger depends on the cargo.
export const SIMULATED_DWELL_HOURS: Record<string, number> = {
  "JOL-8921": 96, // stuck at Aktau Port
  "KZL-4107": 110, // held on the Caspian crossing
  "MCC-2048": 6, // moving through Khorgos
  "TRK-7782": 18, // routine handling at Baku Terminal
};
export const dwellHoursFor = (cargoId: string): number | undefined =>
  SIMULATED_DWELL_HOURS[cargoId];
/** Mirrors the program's rule in `evaluate_trigger`: pay only when dwell_hours > threshold_hours. */
export const triggerMet = (dwellHours: number) => dwellHours > TRIGGER_THRESHOLD_HOURS;

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
const i64 = (n: bigint) => {
  const b = Buffer.alloc(8);
  b.writeBigInt64LE(n);
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
  /** Unix seconds; the program refuses telemetry after it and refuses to close an untriggered vault before it. */
  coverageEnd: bigint;
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
      i64(a.coverageEnd),
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

export const explorerAddress = (a: string) =>
  `https://explorer.solana.com/address/${a}?cluster=devnet`;

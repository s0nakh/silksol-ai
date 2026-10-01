import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import {
  DEMO_COLLATERAL_LAMPORTS,
  ESCROW_PROGRAM_ID,
  SIMULATED_DWELL_HOURS,
  TRIGGER_THRESHOLD_HOURS,
  closeVaultIx,
  evaluateTriggerIx,
  initializeVaultIx,
  settlePayoutIx,
  submitTelemetryIx,
  vaultPda,
} from "../components/solana/escrowProgram";
import { lockMemo, memoIx, payoutMemo, reportHash } from "../components/solana/memo";

// Server-side "insurer + oracle" for the Devnet demo. The treasury keypair funds each
// policy vault and signs oracle telemetry, so the payout lands in the *user's* wallet
// from a third party — exactly what a shipper would see in production.

export type InsurerAction = "lock" | "settle" | "instant";
export type InsurerRequest = {
  action: InsurerAction;
  beneficiary: string;
  cargoId: string;
  riskScore: number;
  policyId?: string;
};
export type InsurerResult =
  | {
      ok: true;
      signature: string;
      vault: string;
      policyId: string;
      lamports: number;
      memo: string;
    }
  | {
      ok: false;
      reason: "not_configured" | "invalid_input" | "rate_limited" | "treasury_low" | "failed";
      message: string;
    };

const MIN_TREASURY_LAMPORTS = 50_000_000; // 0.05 SOL safety floor
const COOLDOWN_MS = 10_000;
const recent = new Map<string, number>();

export function parseTreasurySecret(secret: string | undefined) {
  if (!secret) return null;
  try {
    const bytes = JSON.parse(secret.trim()) as number[];
    if (!Array.isArray(bytes) || bytes.length !== 64) return null;
    return Keypair.fromSecretKey(Uint8Array.from(bytes));
  } catch {
    return null;
  }
}

const fail = (
  reason: Exclude<InsurerResult, { ok: true }>["reason"],
  message: string,
): InsurerResult => ({
  ok: false,
  reason,
  message,
});

async function sendAndPoll(connection: Connection, payer: Keypair, ixs: TransactionInstruction[]) {
  const latest = await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction({ feePayer: payer.publicKey, ...latest }).add(...ixs);
  tx.sign(payer);
  const signature = await connection.sendRawTransaction(tx.serialize(), { maxRetries: 3 });
  // Poll instead of confirmTransaction(): that one opens a WebSocket, which serverless runtimes may not allow.
  for (let i = 0; i < 40; i++) {
    const { value } = await connection.getSignatureStatuses([signature]);
    const status = value[0];
    if (status?.err) throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
    if (status?.confirmationStatus === "confirmed" || status?.confirmationStatus === "finalized") {
      return signature;
    }
    await new Promise((r) => setTimeout(r, 750));
  }
  throw new Error(`Transaction not confirmed in time: ${signature}`);
}

export async function runInsurer(
  req: InsurerRequest,
  secret: string | undefined,
  rpcUrl: string,
): Promise<InsurerResult> {
  const treasury = parseTreasurySecret(secret);
  if (!treasury) return fail("not_configured", "SILKSOL_TREASURY_SECRET is not set on the server.");

  let beneficiary: PublicKey;
  try {
    beneficiary = new PublicKey(req.beneficiary);
  } catch {
    return fail("invalid_input", "Beneficiary is not a valid Solana address.");
  }
  const cargoId = String(req.cargoId)
    .replace(/[^A-Za-z0-9-]/g, "")
    .slice(0, 32);
  if (!cargoId) return fail("invalid_input", "Missing cargo id.");
  const risk = Math.max(0, Math.min(100, Math.round(Number(req.riskScore) || 0)));

  // Opening a vault spends treasury funds; throttle per wallet to keep the demo pool alive.
  if (req.action !== "settle") {
    const last = recent.get(beneficiary.toBase58()) ?? 0;
    if (Date.now() - last < COOLDOWN_MS)
      return fail("rate_limited", "Please wait a few seconds and retry.");
  }

  const connection = new Connection(rpcUrl, "confirmed");
  const balance = await connection.getBalance(treasury.publicKey);
  if (req.action !== "settle" && balance < MIN_TREASURY_LAMPORTS) {
    return fail(
      "treasury_low",
      `Insurer treasury ${treasury.publicKey.toBase58()} needs a Devnet SOL top-up.`,
    );
  }

  const me = treasury.publicKey;
  const policyId = req.action === "settle" && req.policyId ? req.policyId : String(Date.now());
  if (!/^\d{1,19}$/.test(policyId)) return fail("invalid_input", "Invalid policy id.");
  const vault = vaultPda(me, BigInt(policyId));

  const lockIxs = [
    initializeVaultIx({
      authority: me,
      policyId: BigInt(policyId),
      shipmentId: cargoId,
      collateralLamports: DEMO_COLLATERAL_LAMPORTS,
      thresholdHours: TRIGGER_THRESHOLD_HOURS,
      oracle: me,
      beneficiary,
    }),
  ];
  const hash = await reportHash({
    cargoId,
    policyId,
    beneficiary: beneficiary.toBase58(),
    dwellHours: SIMULATED_DWELL_HOURS,
    thresholdHours: TRIGGER_THRESHOLD_HOURS,
    riskScore: risk,
  });
  const settleIxs = [
    submitTelemetryIx(me, vault, SIMULATED_DWELL_HOURS, risk),
    evaluateTriggerIx(vault),
    settlePayoutIx(vault, beneficiary),
    // Return the vault's rent to the treasury; the payout itself stays with the beneficiary.
    closeVaultIx(me, vault),
  ];

  let memo: string;
  let ixs: TransactionInstruction[];
  if (req.action === "lock") {
    memo = lockMemo(cargoId, policyId, TRIGGER_THRESHOLD_HOURS);
    ixs = [...lockIxs, memoIx(memo, [me])];
  } else {
    memo = payoutMemo(cargoId, policyId, SIMULATED_DWELL_HOURS, TRIGGER_THRESHOLD_HOURS, hash);
    ixs = req.action === "instant" ? [...lockIxs, ...settleIxs] : settleIxs;
    ixs.push(memoIx(memo, [me]));
    if (req.action === "settle") {
      const info = await connection.getAccountInfo(vault);
      if (!info || !info.owner.equals(ESCROW_PROGRAM_ID)) {
        return fail("invalid_input", "Policy vault not found on Devnet.");
      }
    }
  }

  try {
    if (req.action !== "settle") recent.set(beneficiary.toBase58(), Date.now());
    const signature = await sendAndPoll(connection, treasury, ixs);
    return {
      ok: true,
      signature,
      vault: vault.toBase58(),
      policyId,
      lamports: DEMO_COLLATERAL_LAMPORTS,
      memo,
    };
  } catch (e) {
    return fail("failed", e instanceof Error ? e.message : String(e));
  }
}

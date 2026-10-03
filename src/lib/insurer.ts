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
  TRIGGER_THRESHOLD_HOURS,
  closeVaultIx,
  dwellHoursFor,
  evaluateTriggerIx,
  initializeVaultIx,
  settlePayoutIx,
  submitTelemetryIx,
  triggerMet,
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
      reason:
        | "not_configured"
        | "invalid_input"
        | "rate_limited"
        | "treasury_low"
        | "trigger_not_met"
        | "failed";
      message: string;
    };

const MIN_TREASURY_LAMPORTS = 50_000_000; // 0.05 SOL safety floor
const COOLDOWN_MS = 10_000;
const recent = new Map<string, number>();
// Global caps on treasury-funded transactions, counted from the treasury's own on-chain history,
// so they hold across serverless instances and new wallet addresses.
const HOURLY_CAP = 10;
const DAILY_CAP = 40;

async function overGlobalCap(connection: Connection, treasury: PublicKey) {
  const sigs = await connection.getSignaturesForAddress(treasury, { limit: DAILY_CAP });
  const now = Date.now() / 1000;
  const since = (secs: number) => sigs.filter((s) => (s.blockTime ?? now) > now - secs).length;
  if (since(3600) >= HOURLY_CAP) return "hourly";
  if (since(86_400) >= DAILY_CAP) return "daily";
  return null;
}

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
  // The oracle reports its own telemetry for the cargo; the client cannot pick the delay.
  const dwellHours = dwellHoursFor(cargoId);
  if (dwellHours === undefined) return fail("invalid_input", `No oracle telemetry for cargo #${cargoId}.`);
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
  const payingOut = req.action !== "lock" && triggerMet(dwellHours);
  if (req.action === "lock" || payingOut) {
    const cap = await overGlobalCap(connection, treasury.publicKey);
    if (cap)
      return fail("rate_limited", `The demo insurer reached its ${cap} payout limit. Please try again later.`);
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
    dwellHours,
    thresholdHours: TRIGGER_THRESHOLD_HOURS,
    riskScore: risk,
  });
  const settleIxs = [
    submitTelemetryIx(me, vault, dwellHours, risk),
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
    memo = payoutMemo(cargoId, policyId, dwellHours, TRIGGER_THRESHOLD_HOURS, hash);
    ixs = req.action === "instant" ? [...lockIxs, ...settleIxs] : settleIxs;
    ixs.push(memoIx(memo, [me]));
    if (req.action === "settle") {
      const info = await connection.getAccountInfo(vault);
      if (!info || !info.owner.equals(ESCROW_PROGRAM_ID)) {
        return fail("invalid_input", "Policy vault not found on Devnet.");
      }
    }
  }

  if (req.action !== "lock" && !payingOut) {
    // Trigger not met: ask the escrow program itself (a simulation — nothing lands on-chain,
    // no fee, no funds move). It must refuse with NotEligible.
    return refusal(connection, treasury, ixs, cargoId, dwellHours);
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

async function refusal(
  connection: Connection,
  payer: Keypair,
  ixs: TransactionInstruction[],
  cargoId: string,
  dwellHours: number,
): Promise<InsurerResult> {
  const why = `Dwell ${dwellHours}h ≤ ${TRIGGER_THRESHOLD_HOURS}h threshold for cargo #${cargoId}`;
  try {
    const latest = await connection.getLatestBlockhash("confirmed");
    const tx = new Transaction({ feePayer: payer.publicKey, ...latest }).add(...ixs);
    tx.sign(payer);
    const sim = await connection.simulateTransaction(tx);
    if (sim.value.logs?.some((l) => l.includes("NotEligible"))) {
      return fail(
        "trigger_not_met",
        `${why}: the escrow program refused the payout (NotEligible). Nothing was sent on-chain.`,
      );
    }
    if (!sim.value.err) return fail("failed", "Unexpected: the program accepted an ineligible claim.");
    return fail("failed", `Simulation failed: ${JSON.stringify(sim.value.err)}`);
  } catch (e) {
    return fail("failed", e instanceof Error ? e.message : String(e));
  }
}

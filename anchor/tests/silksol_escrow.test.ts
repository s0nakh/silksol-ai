// Integration tests for the silksol_escrow program, run by `anchor test` against a local validator.
// They drive the program through the same hand-encoded client the dashboard uses, so a passing
// suite also proves the frontend encoding matches the on-chain program.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { before, describe, it } from "node:test";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import {
  closeVaultIx,
  DEMO_COLLATERAL_LAMPORTS,
  DEMO_COVERAGE_SECONDS,
  DISCRIMINATORS,
  ESCROW_PROGRAM_ID,
  evaluateTriggerIx,
  initializeVaultIx,
  settlePayoutIx,
  submitTelemetryIx,
  dwellHoursFor,
  vaultPda,
} from "../../src/components/solana/escrowProgram.ts";

const connection = new Connection(
  process.env["ANCHOR_PROVIDER_URL"] ?? "http://127.0.0.1:8899",
  "confirmed",
);
const payer = Keypair.fromSecretKey(
  Uint8Array.from(
    JSON.parse(
      readFileSync(
        process.env["ANCHOR_WALLET"] ?? `${process.env["HOME"]}/.config/solana/id.json`,
        "utf8",
      ),
    ),
  ),
);
const idl = JSON.parse(
  readFileSync(new URL("../target/idl/silksol_escrow.json", import.meta.url), "utf8"),
);

let nextPolicyId = BigInt(Date.now());
const COLLATERAL = DEMO_COLLATERAL_LAMPORTS;
// The payer acts as the insurer (vault authority); the oracle is a separate key, as on Devnet.
const oracle = Keypair.generate();

async function send(signers: Keypair[], ...ixs: TransactionInstruction[]) {
  return sendAndConfirmTransaction(connection, new Transaction().add(...ixs), signers, {
    commitment: "confirmed",
  });
}

async function fund(kp: Keypair, sol = 2) {
  const sig = await connection.requestAirdrop(kp.publicKey, sol * LAMPORTS_PER_SOL);
  const latest = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");
}

/** The validator's own clock (what the program sees), in unix seconds. */
async function chainNow() {
  const slot = await connection.getSlot("confirmed");
  return (await connection.getBlockTime(slot)) ?? Math.floor(Date.now() / 1000);
}

async function waitUntilChainTime(unix: number) {
  for (let i = 0; i < 60 && (await chainNow()) <= unix; i++)
    await new Promise((r) => setTimeout(r, 500));
}

/** Expects the transaction to fail with the given Anchor error name in the program logs. */
async function expectError(promise: Promise<unknown>, errorName: string) {
  await assert.rejects(promise, (e: unknown) => {
    const logs =
      (e as { logs?: string[]; transactionLogs?: string[] }).logs ??
      (e as { transactionLogs?: string[] }).transactionLogs ??
      [];
    const text = `${String(e)}\n${logs.join("\n")}`;
    assert.match(text, new RegExp(errorName), `expected ${errorName}, got:\n${text}`);
    return true;
  });
}

type VaultState = {
  authority: PublicKey;
  oracle: PublicKey;
  beneficiary: PublicKey;
  policyId: bigint;
  shipmentId: string;
  collateral: bigint;
  thresholdHours: number;
  dwellHours: number;
  riskScore: number;
  eligible: boolean;
  settled: boolean;
  coverageEnd: bigint;
};

async function fetchVault(vault: PublicKey): Promise<VaultState> {
  const info = await connection.getAccountInfo(vault, "confirmed");
  assert.ok(info, "vault account missing");
  assert.ok(info.owner.equals(ESCROW_PROGRAM_ID), "vault not owned by program");
  const d = info.data;
  const accountDisc = idl.accounts.find(
    (a: { name: string }) => a.name === "EscrowVault",
  ).discriminator;
  assert.deepEqual([...d.subarray(0, 8)], accountDisc);
  let o = 8;
  const key = () => new PublicKey(d.subarray(o, (o += 32)));
  const authority = key();
  const vaultOracle = key();
  const beneficiary = key();
  const policyId = d.readBigUInt64LE(o);
  o += 8;
  const len = d.readUInt32LE(o);
  o += 4;
  const shipmentId = d.subarray(o, o + len).toString("utf8");
  o += len;
  const collateral = d.readBigUInt64LE(o);
  o += 8;
  const thresholdHours = d.readUInt32LE(o);
  const dwellHours = d.readUInt32LE(o + 4);
  const riskScore = d[o + 8]!;
  const eligible = d[o + 9] === 1;
  const settled = d[o + 10] === 1;
  // created_at, updated_at (i64 each), then coverage_end.
  const coverageEnd = d.readBigInt64LE(o + 11 + 16);
  return {
    authority,
    oracle: vaultOracle,
    beneficiary,
    policyId,
    shipmentId,
    collateral,
    thresholdHours,
    dwellHours,
    riskScore,
    eligible,
    settled,
    coverageEnd,
  };
}

async function createVault(
  opts: {
    oracle?: PublicKey;
    beneficiary?: PublicKey;
    threshold?: number;
    coverageEnd?: bigint;
  } = {},
) {
  const policyId = nextPolicyId++;
  const beneficiary = opts.beneficiary ?? Keypair.generate().publicKey;
  const coverageEnd = opts.coverageEnd ?? BigInt((await chainNow()) + DEMO_COVERAGE_SECONDS);
  await send(
    [payer],
    initializeVaultIx({
      authority: payer.publicKey,
      policyId,
      shipmentId: "JOL-8921",
      collateralLamports: COLLATERAL,
      thresholdHours: opts.threshold ?? 72,
      oracle: opts.oracle ?? oracle.publicKey,
      beneficiary,
      coverageEnd,
    }),
  );
  return { vault: vaultPda(payer.publicKey, policyId), beneficiary, policyId, coverageEnd };
}

/** Oracle reports telemetry and the permissionless trigger is cranked in the same transaction. */
const report = (vault: PublicKey, dwell: number, risk: number) =>
  send(
    [payer, oracle],
    submitTelemetryIx(oracle.publicKey, vault, dwell, risk),
    evaluateTriggerIx(vault),
  );

describe("silksol_escrow", () => {
  before(async () => {
    // A freshly started validator answers RPC before it produces blocks; wait until it is live.
    for (let i = 0; i < 120 && (await connection.getBlockHeight()) < 20; i++)
      await new Promise((r) => setTimeout(r, 500));
    if ((await connection.getBalance(payer.publicKey)) < 5 * LAMPORTS_PER_SOL)
      await fund(payer, 10);
  });

  it("frontend discriminators match the generated IDL", () => {
    for (const ix of idl.instructions as { name: string; discriminator: number[] }[]) {
      assert.deepEqual(
        DISCRIMINATORS[ix.name as keyof typeof DISCRIMINATORS],
        ix.discriminator,
        ix.name,
      );
    }
    assert.equal(idl.address, ESCROW_PROGRAM_ID.toBase58());
  });

  it("initialize_vault locks collateral in the PDA and stores policy terms", async () => {
    const { vault, beneficiary, policyId, coverageEnd } = await createVault();
    const s = await fetchVault(vault);
    assert.ok(s.authority.equals(payer.publicKey));
    assert.ok(s.oracle.equals(oracle.publicKey));
    assert.ok(s.beneficiary.equals(beneficiary));
    assert.equal(s.policyId, policyId);
    assert.equal(s.shipmentId, "JOL-8921");
    assert.equal(s.collateral, BigInt(COLLATERAL));
    assert.equal(s.thresholdHours, 72);
    assert.equal(s.eligible, false);
    assert.equal(s.settled, false);
    assert.equal(s.coverageEnd, coverageEnd);
    const info = await connection.getAccountInfo(vault);
    const rent = await connection.getMinimumBalanceForRentExemption(info!.data.length);
    assert.equal(info!.lamports, rent + COLLATERAL);
  });

  it("rejects invalid terms", async () => {
    const base = {
      authority: payer.publicKey,
      shipmentId: "X",
      collateralLamports: COLLATERAL,
      thresholdHours: 72,
      oracle: oracle.publicKey,
      beneficiary: Keypair.generate().publicKey,
      coverageEnd: BigInt((await chainNow()) + DEMO_COVERAGE_SECONDS),
    };
    const init = (o: Partial<typeof base>) =>
      send([payer], initializeVaultIx({ ...base, policyId: nextPolicyId++, ...o }));
    await expectError(init({ shipmentId: "" }), "InvalidShipmentId");
    await expectError(init({ shipmentId: "x".repeat(33) }), "InvalidShipmentId");
    await expectError(init({ collateralLamports: 0 }), "ZeroCollateral");
    await expectError(init({ thresholdHours: 0 }), "ZeroThreshold");
    await expectError(init({ coverageEnd: BigInt((await chainNow()) - 60) }), "InvalidCoverage");
  });

  it("separates roles: the insurer cannot be the oracle or the beneficiary", async () => {
    const base = {
      authority: payer.publicKey,
      shipmentId: "JOL-8921",
      collateralLamports: COLLATERAL,
      thresholdHours: 72,
      oracle: oracle.publicKey,
      beneficiary: Keypair.generate().publicKey,
      coverageEnd: BigInt((await chainNow()) + DEMO_COVERAGE_SECONDS),
    };
    const init = (o: Partial<typeof base>) =>
      send([payer], initializeVaultIx({ ...base, policyId: nextPolicyId++, ...o }));
    await expectError(init({ oracle: payer.publicKey }), "OracleIsInsurer");
    await expectError(init({ beneficiary: payer.publicKey }), "InvalidBeneficiary");
    await expectError(init({ beneficiary: oracle.publicKey }), "InvalidBeneficiary");
  });

  it("dwell_time <= threshold does not trigger and payout is refused", async () => {
    const { vault, beneficiary } = await createVault();
    await report(vault, 72, 40);
    const s = await fetchVault(vault);
    assert.equal(s.dwellHours, 72);
    assert.equal(s.riskScore, 40);
    assert.equal(s.eligible, false);
    await expectError(send([payer], settlePayoutIx(vault, beneficiary)), "NotEligible");
  });

  it("dwell_time > threshold triggers and settle_payout pays the beneficiary exactly the collateral", async () => {
    const { vault, beneficiary } = await createVault();
    await report(vault, 96, 68);
    assert.equal((await fetchVault(vault)).eligible, true);

    const before = await connection.getBalance(beneficiary);
    const sig = await send([payer], settlePayoutIx(vault, beneficiary));
    assert.equal((await connection.getBalance(beneficiary)) - before, COLLATERAL);
    assert.equal((await fetchVault(vault)).settled, true);

    const tx = await connection.getTransaction(sig, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    assert.ok(
      tx?.meta?.logMessages?.some((l) => l.startsWith("Program data:")),
      "SettlementLogged event not emitted",
    );

    await expectError(
      send([payer], settlePayoutIx(vault, beneficiary)),
      "NotEligible|AlreadySettled",
    );
    await expectError(
      send([payer, oracle], submitTelemetryIx(oracle.publicKey, vault, 10, 1)),
      "AlreadySettled",
    );
  });

  it("only the configured oracle can submit telemetry — not an intruder, not the insurer", async () => {
    const intruder = Keypair.generate();
    await fund(intruder, 1);
    const { vault } = await createVault();
    await expectError(
      send([intruder], submitTelemetryIx(intruder.publicKey, vault, 999, 99)),
      "UnauthorizedOracle",
    );
    await expectError(
      send([payer], submitTelemetryIx(payer.publicKey, vault, 999, 99)),
      "UnauthorizedOracle",
    );
  });

  it("payout can only go to the stored beneficiary", async () => {
    const { vault } = await createVault();
    await report(vault, 100, 70);
    await expectError(
      send([payer], settlePayoutIx(vault, Keypair.generate().publicKey)),
      "WrongBeneficiary",
    );
  });

  it("a fired trigger is sticky: later telemetry cannot revoke it", async () => {
    const { vault } = await createVault();
    await report(vault, 96, 70);
    await report(vault, 1, 5);
    assert.equal((await fetchVault(vault)).eligible, true);
  });

  it("close_vault is blocked while a payout is owed, allowed after settlement", async () => {
    const { vault, beneficiary } = await createVault();
    await report(vault, 96, 70);
    await expectError(send([payer], closeVaultIx(payer.publicKey, vault)), "PayoutPending");
    await send([payer], settlePayoutIx(vault, beneficiary));
    await send([payer], closeVaultIx(payer.publicKey, vault));
    assert.equal(await connection.getAccountInfo(vault), null);
  });

  it("close_vault is blocked by reported delay telemetry even before anyone cranks the trigger", async () => {
    const { vault } = await createVault();
    await send([payer, oracle], submitTelemetryIx(oracle.publicKey, vault, 96, 70));
    assert.equal((await fetchVault(vault)).eligible, false);
    await expectError(send([payer], closeVaultIx(payer.publicKey, vault)), "PayoutPending");
  });

  it("coverage_end: no early close, no late telemetry, refund to the insurer after expiry", async () => {
    const coverageEnd = BigInt((await chainNow()) + 4);
    const { vault } = await createVault({ coverageEnd });
    await expectError(send([payer], closeVaultIx(payer.publicKey, vault)), "CoverageActive");

    await waitUntilChainTime(Number(coverageEnd));
    await expectError(
      send([payer, oracle], submitTelemetryIx(oracle.publicKey, vault, 96, 70)),
      "CoverageEnded",
    );
    const locked = await connection.getBalance(vault);
    const before = await connection.getBalance(payer.publicKey);
    await send([payer], closeVaultIx(payer.publicKey, vault));
    const after = await connection.getBalance(payer.publicKey);
    assert.ok(
      after > before + locked - 10_000,
      "authority should get rent + collateral back (minus fee)",
    );
    assert.equal(await connection.getAccountInfo(vault), null);
  });

  it("insurer flow: one transaction signed by insurer + oracle pays the user and closes the vault", async () => {
    // Mirrors the "instant" action of the Devnet insurer service (src/lib/insurer.ts).
    const user = Keypair.generate().publicKey;
    const policyId = nextPolicyId++;
    const vault = vaultPda(payer.publicKey, policyId);
    const dwell = dwellHoursFor("JOL-8921")!;
    await send(
      [payer, oracle],
      initializeVaultIx({
        authority: payer.publicKey,
        policyId,
        shipmentId: "JOL-8921",
        collateralLamports: COLLATERAL,
        thresholdHours: 72,
        oracle: oracle.publicKey,
        beneficiary: user,
        coverageEnd: BigInt((await chainNow()) + DEMO_COVERAGE_SECONDS),
      }),
      submitTelemetryIx(oracle.publicKey, vault, dwell, 68),
      evaluateTriggerIx(vault),
      settlePayoutIx(vault, user),
      closeVaultIx(payer.publicKey, vault),
    );
    assert.equal(await connection.getBalance(user), COLLATERAL);
    assert.equal(await connection.getAccountInfo(vault), null);
  });
});

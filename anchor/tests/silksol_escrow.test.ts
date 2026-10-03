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
  DISCRIMINATORS,
  ESCROW_PROGRAM_ID,
  evaluateTriggerIx,
  initializeVaultIx,
  lockCollateralOnChain,
  settlePayoutIx,
  submitTelemetryIx,
  dwellHoursFor,
  triggerAndSettleOnChain,
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
  const oracle = key();
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
  return {
    authority,
    oracle,
    beneficiary,
    policyId,
    shipmentId,
    collateral,
    thresholdHours,
    dwellHours,
    riskScore,
    eligible,
    settled,
  };
}

async function createVault(
  opts: { oracle?: PublicKey; beneficiary?: PublicKey; threshold?: number } = {},
) {
  const policyId = nextPolicyId++;
  const beneficiary = opts.beneficiary ?? Keypair.generate().publicKey;
  await send(
    [payer],
    initializeVaultIx({
      authority: payer.publicKey,
      policyId,
      shipmentId: "JOL-8921",
      collateralLamports: COLLATERAL,
      thresholdHours: opts.threshold ?? 72,
      oracle: opts.oracle ?? payer.publicKey,
      beneficiary,
    }),
  );
  return { vault: vaultPda(payer.publicKey, policyId), beneficiary, policyId };
}

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
    const { vault, beneficiary, policyId } = await createVault();
    const s = await fetchVault(vault);
    assert.ok(s.authority.equals(payer.publicKey));
    assert.ok(s.oracle.equals(payer.publicKey));
    assert.ok(s.beneficiary.equals(beneficiary));
    assert.equal(s.policyId, policyId);
    assert.equal(s.shipmentId, "JOL-8921");
    assert.equal(s.collateral, BigInt(COLLATERAL));
    assert.equal(s.thresholdHours, 72);
    assert.equal(s.eligible, false);
    assert.equal(s.settled, false);
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
      oracle: payer.publicKey,
      beneficiary: payer.publicKey,
    };
    await expectError(
      send([payer], initializeVaultIx({ ...base, policyId: nextPolicyId++, shipmentId: "" })),
      "InvalidShipmentId",
    );
    await expectError(
      send(
        [payer],
        initializeVaultIx({ ...base, policyId: nextPolicyId++, shipmentId: "x".repeat(33) }),
      ),
      "InvalidShipmentId",
    );
    await expectError(
      send(
        [payer],
        initializeVaultIx({ ...base, policyId: nextPolicyId++, collateralLamports: 0 }),
      ),
      "ZeroCollateral",
    );
    await expectError(
      send([payer], initializeVaultIx({ ...base, policyId: nextPolicyId++, thresholdHours: 0 })),
      "ZeroThreshold",
    );
  });

  it("dwell_time <= threshold does not trigger and payout is refused", async () => {
    const { vault, beneficiary } = await createVault();
    await send(
      [payer],
      submitTelemetryIx(payer.publicKey, vault, 72, 40),
      evaluateTriggerIx(vault),
    );
    const s = await fetchVault(vault);
    assert.equal(s.dwellHours, 72);
    assert.equal(s.riskScore, 40);
    assert.equal(s.eligible, false);
    await expectError(send([payer], settlePayoutIx(vault, beneficiary)), "NotEligible");
  });

  it("dwell_time > threshold triggers and settle_payout pays the beneficiary exactly the collateral", async () => {
    const { vault, beneficiary } = await createVault();
    await send(
      [payer],
      submitTelemetryIx(payer.publicKey, vault, 96, 68),
      evaluateTriggerIx(vault),
    );
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
      send([payer], submitTelemetryIx(payer.publicKey, vault, 10, 1)),
      "AlreadySettled",
    );
  });

  it("only the configured oracle can submit telemetry", async () => {
    const oracle = Keypair.generate();
    const intruder = Keypair.generate();
    await fund(intruder, 1);
    const { vault } = await createVault({ oracle: oracle.publicKey });
    await expectError(
      send([intruder], submitTelemetryIx(intruder.publicKey, vault, 999, 99)),
      "UnauthorizedOracle",
    );
  });

  it("payout can only go to the stored beneficiary", async () => {
    const { vault } = await createVault();
    await send(
      [payer],
      submitTelemetryIx(payer.publicKey, vault, 100, 70),
      evaluateTriggerIx(vault),
    );
    await expectError(
      send([payer], settlePayoutIx(vault, Keypair.generate().publicKey)),
      "WrongBeneficiary",
    );
  });

  it("a fired trigger is sticky: later telemetry cannot revoke it", async () => {
    const { vault } = await createVault();
    await send(
      [payer],
      submitTelemetryIx(payer.publicKey, vault, 96, 70),
      evaluateTriggerIx(vault),
    );
    await send([payer], submitTelemetryIx(payer.publicKey, vault, 1, 5), evaluateTriggerIx(vault));
    assert.equal((await fetchVault(vault)).eligible, true);
  });

  it("close_vault is blocked while a payout is owed, allowed after settlement", async () => {
    const { vault, beneficiary } = await createVault();
    await send(
      [payer],
      submitTelemetryIx(payer.publicKey, vault, 96, 70),
      evaluateTriggerIx(vault),
    );
    await expectError(send([payer], closeVaultIx(payer.publicKey, vault)), "PayoutPending");
    await send([payer], settlePayoutIx(vault, beneficiary));
    await send([payer], closeVaultIx(payer.publicKey, vault));
    assert.equal(await connection.getAccountInfo(vault), null);
  });

  it("close_vault refunds collateral to the authority when never triggered", async () => {
    const { vault } = await createVault();
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

  it("dashboard flow: lockCollateralOnChain → triggerAndSettleOnChain", async () => {
    const user = Keypair.generate();
    await fund(user, 1);
    const wallet = {
      publicKey: user.publicKey,
      sendTransaction: async (tx: Transaction, conn: Connection) => {
        tx.sign(user);
        return conn.sendRawTransaction(tx.serialize());
      },
    };
    const { signature, vault } = await lockCollateralOnChain(wallet, connection, "JOL-8921");
    assert.ok(signature.length > 60);
    const locked = await fetchVault(new PublicKey(vault));
    assert.equal(locked.shipmentId, "JOL-8921");
    assert.equal(locked.collateral, BigInt(COLLATERAL));

    const before = await connection.getBalance(user.publicKey);
    await triggerAndSettleOnChain(wallet, connection, vault, dwellHoursFor("JOL-8921")!, 68);
    const s = await fetchVault(new PublicKey(vault));
    assert.equal(s.dwellHours, 96);
    assert.equal(s.riskScore, 68);
    assert.equal(s.eligible, true);
    assert.equal(s.settled, true);
    const fee = 5_000;
    assert.equal((await connection.getBalance(user.publicKey)) - before, COLLATERAL - fee);
  });
});

// Returns collateral from the insurer treasury's expired, unpaid policy vaults on Devnet.
// Only vaults whose cover has ended and that owe no payout are closed; the program enforces
// the same rule (CoverageActive / PayoutPending), so nothing owed to a shipper can be taken back.
//
//   node --experimental-strip-types oracle/reclaim-expired.ts            # list only
//   node --experimental-strip-types oracle/reclaim-expired.ts --close    # close expired vaults
//
// Treasury keypair: SILKSOL_TREASURY_KEYPAIR (path), default ~/.config/solana/silksol-treasury.json.
import { readFileSync } from "node:fs";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { ESCROW_PROGRAM_ID, closeVaultIx } from "../src/components/solana/escrowProgram.ts";

const rpc = process.env["SOLANA_RPC_URL"] ?? "https://api.devnet.solana.com";
const keyPath =
  process.env["SILKSOL_TREASURY_KEYPAIR"] ??
  `${process.env["HOME"]}/.config/solana/silksol-treasury.json`;
const treasury = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(keyPath, "utf8"))));
const close = process.argv.includes("--close");
const connection = new Connection(rpc, "confirmed");

// EscrowVault layout: disc(8) authority(32) oracle(32) beneficiary(32) policy_id(8)
// shipment_id(4+len) collateral(8) threshold(4) dwell(4) risk(1) eligible(1) settled(1)
// created_at(8) updated_at(8) coverage_end(8) bump(1)
const vaults = await connection.getProgramAccounts(ESCROW_PROGRAM_ID, {
  filters: [{ memcmp: { offset: 8, bytes: treasury.publicKey.toBase58() } }],
});
const now = Math.floor(Date.now() / 1000);
let reclaimable = 0;
for (const { pubkey, account } of vaults) {
  const d = account.data;
  let o = 8 + 96 + 8;
  const len = d.readUInt32LE(o);
  const shipment = d.subarray(o + 4, o + 4 + len).toString("utf8");
  o += 4 + len + 8;
  const threshold = d.readUInt32LE(o);
  const dwell = d.readUInt32LE(o + 4);
  const eligible = d[o + 9] === 1;
  const settled = d[o + 10] === 1;
  const coverageEnd = Number(d.readBigInt64LE(o + 27));
  const owed = !settled && (eligible || dwell > threshold);
  const expired = now > coverageEnd;
  const canClose = settled || (!owed && expired);
  const sol = account.lamports / LAMPORTS_PER_SOL;
  const status = owed
    ? "payout owed"
    : canClose
      ? "reclaimable"
      : `cover ends ${new Date(coverageEnd * 1000).toISOString()}`;
  console.log(`${pubkey.toBase58()}  #${shipment.padEnd(9)} ${sol.toFixed(4)} SOL  ${status}`);
  if (!canClose) continue;
  reclaimable += account.lamports;
  if (close) {
    const sig = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(closeVaultIx(treasury.publicKey, pubkey)),
      [treasury],
    );
    console.log(`  closed → ${sig}`);
  }
}
console.log(
  `${vaults.length} vault(s); ${(reclaimable / LAMPORTS_PER_SOL).toFixed(4)} SOL ${close ? "reclaimed" : "reclaimable (run with --close)"}`,
);

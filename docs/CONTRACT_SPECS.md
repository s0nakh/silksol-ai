# 📜 Smart Contract Specs — Escrow Vault Program

> Devnet prototype. Trigger logic is strictly deterministic and rule-based; no discretionary or AI-driven decisions occur on-chain.

| | |
|---|---|
| Program | `silksol_escrow` (Anchor 1.2) — source in [`anchor/programs/silksol_escrow`](../anchor/programs/silksol_escrow/src/lib.rs) |
| Program ID (Devnet) | [`Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z`](https://explorer.solana.com/address/Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z?cluster=devnet) |
| Tests | [`anchor/tests/silksol_escrow.test.ts`](../anchor/tests/silksol_escrow.test.ts), run in CI by [`anchor.yml`](../.github/workflows/anchor.yml) |
| Frontend client | [`src/components/solana/escrowProgram.ts`](../src/components/solana/escrowProgram.ts) |

## Implementation status

| Component | Status |
|---|---|
| `EscrowVault` PDA, collateral lock, oracle telemetry, deterministic trigger, payout, close | ✅ **On-chain (Devnet)** |
| Collateral asset | Devnet **SOL (lamports)** as a stand-in for USDC. SPL-USDC vaults are on the roadmap. |
| `SettlementLog` | Emitted as an on-chain Anchor **event** (`SettlementLogged`) in the transaction logs. Compressed-NFT (cNFT) minting is **simulated** in the UI. |
| eKZT off-ramp | Simulated settlement abstraction (see below). |

## Core Accounts

| Account | Purpose |
|---|---|
| `EscrowVault` | PDA (`["vault", authority, policy_id_le]`) holding the policy collateral plus shipment state: `oracle`, `beneficiary`, `shipment_id`, `threshold_hours`, `dwell_hours`, `risk_score`, `eligible`, `settled`, `coverage_end`. |

## Instructions

| Instruction | Signer | Description |
|---|---|---|
| `initialize_vault(policy_id, shipment_id, collateral_lamports, threshold_hours, oracle, beneficiary, coverage_end)` | authority (insurer) | Creates the `EscrowVault` PDA and transfers the collateral into it. Rejects an oracle equal to the insurer (`OracleIsInsurer`), a beneficiary equal to the insurer or the oracle (`InvalidBeneficiary`) and a `coverage_end` in the past (`InvalidCoverage`). |
| `submit_telemetry(dwell_hours, risk_score)` | vault oracle | Records the observed dwell time and the off-chain Predictive Risk Engine score. Only until `coverage_end` (`CoverageEnded`). |
| `evaluate_trigger()` | anyone | Deterministically checks `dwell_hours > threshold_hours`. Once fired, eligibility is sticky and cannot be revoked by later telemetry. |
| `settle_payout()` | anyone | Moves exactly the collateral to the stored beneficiary and emits `SettlementLogged`. Fails unless eligible and not yet settled. |
| `close_vault()` | authority | Closes the vault and returns rent (and collateral if the trigger never fired). Blocked while a payout is owed, including reported dwell above the threshold that nobody has cranked yet (`PayoutPending`), and blocked until `coverage_end` (`CoverageActive`). Always allowed after settlement. |

## Roles

| Role | Devnet key | Can | Cannot |
|---|---|---|---|
| Insurer (authority) | treasury [`LxtEpBFN…mv7C`](https://explorer.solana.com/address/LxtEpBFNvEEBmESNA6ExiYHdrdZCfNGkCbndLVimv7C?cluster=devnet) | Fund vaults, pay fees, reclaim collateral after cover ends | Sign telemetry, be the beneficiary, close a vault with a payout owed or cover still running |
| Oracle | [`GKu4Dmw4…6RDe`](https://explorer.solana.com/address/GKu4Dmw4TkKu2WJNX7weQrMw7AjjmrHtovxFrX7E6RDe?cluster=devnet) | Report dwell time and risk score while cover runs | Move funds, be the beneficiary |
| Beneficiary | the shipper's wallet | Receive the payout | — |
| Anyone | — | Crank `evaluate_trigger` and `settle_payout` | Redirect funds: payouts only go to the stored beneficiary |

## Trigger Logic

```text
IF dwell_time > threshold THEN eligible_for_payout = true
```

No machine-learning inference runs on-chain. The Predictive Risk Engine's scoring output only informs `threshold` calibration off-chain — the on-chain check itself is a plain comparison, keeping settlement auditable and disputable on deterministic terms.

## Dashboard integration

With a Phantom/Solflare wallet connected on Devnet, the dashboard runs real transactions. Roles are split the way they would be in production: the **SilkSol AI insurer treasury** ([`LxtEpBFN…mv7C`](https://explorer.solana.com/address/LxtEpBFNvEEBmESNA6ExiYHdrdZCfNGkCbndLVimv7C?cluster=devnet)) funds vaults; a **separate oracle key** signs the dwell-time telemetry (the program refuses a vault whose oracle is the insurer); the **connected wallet is the shipper / beneficiary** and receives the payout.

1. **Issue Parametric Policy** → the wallet pays a 0.001 Devnet SOL premium to the treasury (wallet signs).
2. **Lock Collateral & Sign** → the treasury calls `initialize_vault` (0.01 Devnet SOL, `beneficiary` = the connected wallet, cover for 7 days).
3. **Trigger Oracle Event** → one transaction signed by the treasury (fee payer) and the oracle: `submit_telemetry(<cargo dwell>)` → `evaluate_trigger` → `settle_payout` → `close_vault` (rent back to the treasury). If the cargo's dwell is ≤ the threshold (e.g. #TRK-7782, 18h), the program refuses the claim with `NotEligible`; the insurer only simulates that transaction, so nothing lands on-chain.
4. **Review settlement** (bottom panel) → all of the above for cargo #JOL-8921 in a single transaction — one click, no signature, **+0.01 Devnet SOL appears in the wallet**.

Every transaction carries an [SPL Memo](https://spl.solana.com/memo) so it is self-describing in Explorer and in the wallet history:

```text
SilkSol AI | Premium paid | Cargo #JOL-8921 | Cover 2,500 Demo USDC
SilkSol AI | Collateral locked | Cargo #JOL-8921 | Policy 1790868026788 | Trigger: delay > 72h
SilkSol AI | Parametric payout | Cargo #JOL-8921 | Delay 96h > 72h | Policy 1790868026788 | Report sha256:<64 hex>
```

`Report sha256` is the hash of the oracle report (cargo, policy, beneficiary, dwell, threshold, risk score) that caused the payout, so the off-chain evidence can be audited against the on-chain record.

The insurer and oracle run as a separate Netlify Function ([`oracle/`](../oracle/netlify/functions/insurer.mts)); their secrets live only in its environment (`SILKSOL_TREASURY_SECRET`, `SILKSOL_ORACLE_SECRET`), never in git or the browser. The function refuses to start payouts if the two keys are the same. It accepts calls only from the dApp's origins, throttles requests per wallet and globally (10 per hour, 40 per day) and refuses to pay below a 0.05 SOL treasury floor. If the service is unreachable, or without a wallet, the dashboard uses clearly labelled simulated transactions.

## Known limitations

- Both keys are held by one operator (SilkSol AI) in the MVP. The program already enforces separate roles; the next step is an independent oracle (port/rail data provider) and then a multi-signer oracle network.
- Vaults that were locked but never triggered stay open until `coverage_end` (7 days in the demo); after that the insurer reclaims them with `close_vault` ([`oracle/reclaim-expired.ts`](../oracle/reclaim-expired.ts)).
- The program is upgradeable on Devnet (upgrade authority `7u1HyAzKEeMtNLwfNKsRM9VRizneu9AV7vziNRNVbAJG`). Before Mainnet: a multisig upgrade authority with a time delay, then a frozen program after an audit.

## eKZT Off-Ramp Abstraction

`settle_payout` is designed for an optional dual-currency path that models converting a USDC payout into an eKZT (Digital Tenge) equivalent for future AIFC regulatory sandbox compliance. On Devnet this is a settlement-abstraction simulation, not a live fiat rail. See [AIFC Sandbox Regulatory Notes](./AIFC_SANDBOX.md).

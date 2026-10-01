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
| `EscrowVault` | PDA (`["vault", authority, policy_id_le]`) holding the policy collateral plus shipment state: `oracle`, `beneficiary`, `shipment_id`, `threshold_hours`, `dwell_hours`, `risk_score`, `eligible`, `settled`. |

## Instructions

| Instruction | Signer | Description |
|---|---|---|
| `initialize_vault(policy_id, shipment_id, collateral_lamports, threshold_hours, oracle, beneficiary)` | authority (insurer) | Creates the `EscrowVault` PDA and transfers the collateral into it. |
| `submit_telemetry(dwell_hours, risk_score)` | vault oracle | Records the observed dwell time and the off-chain Predictive Risk Engine score. |
| `evaluate_trigger()` | anyone | Deterministically checks `dwell_hours > threshold_hours`. Once fired, eligibility is sticky and cannot be revoked by later telemetry. |
| `settle_payout()` | anyone | Moves exactly the collateral to the stored beneficiary and emits `SettlementLogged`. Fails unless eligible and not yet settled. |
| `close_vault()` | authority | Closes the vault and returns rent (and collateral if the trigger never fired). Blocked while a payout is owed. |

## Trigger Logic

```text
IF dwell_time > threshold THEN eligible_for_payout = true
```

No machine-learning inference runs on-chain. The Predictive Risk Engine's scoring output only informs `threshold` calibration off-chain — the on-chain check itself is a plain comparison, keeping settlement auditable and disputable on deterministic terms.

## Dashboard integration

With a Phantom/Solflare wallet connected on Devnet, the dashboard runs real transactions. Roles are split the way they would be in production: the **SilkSol AI insurer treasury** ([`LxtEpBFN…mv7C`](https://explorer.solana.com/address/LxtEpBFNvEEBmESNA6ExiYHdrdZCfNGkCbndLVimv7C?cluster=devnet)) funds vaults and signs oracle telemetry on the server; the **connected wallet is the shipper / beneficiary** and receives the payout.

1. **Issue Parametric Policy** → the wallet pays a 0.001 Devnet SOL premium to the treasury (wallet signs).
2. **Lock Collateral & Sign** → the treasury calls `initialize_vault` (0.01 Devnet SOL, `beneficiary` = the connected wallet).
3. **Trigger Oracle Event** → one treasury-signed transaction: `submit_telemetry(96h)` → `evaluate_trigger` → `settle_payout` → `close_vault` (rent back to the treasury).
4. **Review settlement** (bottom panel) → all of the above for cargo #JOL-8921 in a single transaction — one click, no signature, **+0.01 Devnet SOL appears in the wallet**.

Every transaction carries an [SPL Memo](https://spl.solana.com/memo) so it is self-describing in Explorer and in the wallet history:

```text
SilkSol AI | Premium paid | Cargo #JOL-8921 | Cover 2,500 Demo USDC
SilkSol AI | Collateral locked | Cargo #JOL-8921 | Policy 1790868026788 | Trigger: delay > 72h
SilkSol AI | Parametric payout | Cargo #JOL-8921 | Delay 96h > 72h | Policy 1790868026788 | Report sha256:<64 hex>
```

`Report sha256` is the hash of the oracle report (cargo, policy, beneficiary, dwell, threshold, risk score) that caused the payout, so the off-chain evidence can be audited against the on-chain record.

The treasury secret lives only in the server environment (`SILKSOL_TREASURY_SECRET`); the server function throttles requests per wallet and refuses to pay below a 0.05 SOL treasury floor. If the secret is not configured, Lock/Trigger fall back to a self-funded vault signed by the wallet. Without a wallet the dashboard uses clearly labelled simulated transactions.

## eKZT Off-Ramp Abstraction

`settle_payout` is designed for an optional dual-currency path that models converting a USDC payout into an eKZT (Digital Tenge) equivalent for future AIFC regulatory sandbox compliance. On Devnet this is a settlement-abstraction simulation, not a live fiat rail. See [AIFC Sandbox Regulatory Notes](./AIFC_SANDBOX.md).

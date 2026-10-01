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

With a Phantom/Solflare wallet connected on Devnet, the Policy Engine panel calls the real program:

1. **Lock Collateral & Sign** → `initialize_vault` (0.01 Devnet SOL; the wallet acts as insurer, oracle and beneficiary for the demo).
2. **Trigger Oracle Event** → one transaction with `submit_telemetry(96h)` → `evaluate_trigger` → `settle_payout`.

Both signatures link to Solana Explorer. Without a wallet the dashboard falls back to clearly labelled simulated transactions.

## eKZT Off-Ramp Abstraction

`settle_payout` is designed for an optional dual-currency path that models converting a USDC payout into an eKZT (Digital Tenge) equivalent for future AIFC regulatory sandbox compliance. On Devnet this is a settlement-abstraction simulation, not a live fiat rail. See [AIFC Sandbox Regulatory Notes](./AIFC_SANDBOX.md).

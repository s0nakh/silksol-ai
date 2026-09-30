# 📜 Smart Contract Specs — Escrow Vault Program

> Devnet prototype. Trigger logic is strictly deterministic and rule-based; no discretionary or AI-driven decisions occur on-chain.

## Overview

The Escrow Vault program holds collateralized USDC per freight shipment and releases funds automatically when a verified delay condition is met. Every settlement decision is mirrored into an immutable compressed NFT (cNFT) audit log.

## Core Accounts

| Account | Purpose |
|---|---|
| `EscrowVault` | PDA holding collateralized USDC for a single shipment/contract. |
| `ShipmentState` | Tracks checkpoint status, `dwell_time`, and current risk index for a shipment. |
| `SettlementLog` (cNFT) | Compressed NFT recording the immutable audit trail of risk updates and payout events. |

## Instructions

| Instruction | Description |
|---|---|
| `initialize_vault` | Creates an `EscrowVault` PDA and deposits collateralized USDC for a shipment. |
| `submit_telemetry` | Accepts a signed risk-score payload from the off-chain Predictive Risk Engine and updates `ShipmentState`. |
| `evaluate_trigger` | Deterministically checks `dwell_time > threshold`; if true, marks the shipment eligible for settlement. |
| `settle_payout` | Transfers USDC from the vault to the counterparty and mints a `SettlementLog` cNFT entry. |
| `close_vault` | Closes a fully settled or expired vault and reclaims rent. |

## Trigger Logic

Settlement is governed by a single deterministic rule:

```text
IF dwell_time > threshold THEN eligible_for_payout = true
```

No machine-learning inference runs on-chain. The Predictive Risk Engine's scoring output only informs `threshold` calibration off-chain — the on-chain check itself is a plain comparison, keeping settlement auditable and disputable on deterministic terms.

## eKZT Off-Ramp Abstraction

`settle_payout` supports an optional dual-currency path that models converting a USDC payout into an eKZT (Digital Tenge) equivalent for future AIFC regulatory sandbox compliance. On Devnet this is a settlement-abstraction simulation, not a live fiat rail. See [AIFC Sandbox Regulatory Notes](./AIFC_SANDBOX.md).

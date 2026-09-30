# 🏛 AIFC Sandbox Regulatory Notes

> Concept-stage disclosure. Nothing in this document constitutes a live regulatory filing, license, or fiat off-ramp. All eKZT flows in the current MVP are simulated on Solana Devnet.

## Context

The Astana International Financial Centre (AIFC) operates a regulatory sandbox for fintech and digital-asset pilots in Kazakhstan. SilkSol AI's dual-currency settlement layer is designed as a structural proposal for future sandbox testing, not a production integration.

## What Exists Today (MVP)

- A **USDC-denominated Escrow Vault** on Solana Devnet, settled by deterministic on-chain logic (see [Smart Contract Specs](./CONTRACT_SPECS.md)).
- An **eKZT (Digital Tenge) abstraction layer** that models what a dual-currency settlement conversion would look like, purely in simulation.
- Every simulated conversion event is logged as a compressed NFT (cNFT) to demonstrate an auditable, tamper-evident settlement trail suitable for regulatory review.

## What This Is Not

- Not a live connection to the National Bank of Kazakhstan's digital tenge pilot.
- Not a licensed money-transmission or fiat on/off-ramp service.
- Not a submitted or approved AIFC sandbox application.

## Roadmap Intent

Future work would involve engaging AIFC sandbox counsel to scope a compliant pilot for the eKZT off-ramp path, including KYC/AML integration, reserve attestation, and audit access for regulators — none of which is implemented in this hackathon MVP.

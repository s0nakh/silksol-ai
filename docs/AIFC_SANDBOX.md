# 🏛 AIFC Sandbox Regulatory Notes

> Concept-stage disclosure. Nothing in this document constitutes a live regulatory filing, license, or fiat off-ramp. Tenge amounts shown in the current MVP are illustrative; nothing is converted.

## Context

The Astana International Financial Centre (AIFC) operates a regulatory sandbox for fintech and digital-asset pilots in Kazakhstan. Selling parametric cover requires a licensed insurer; SilkSol AI's target is to run a pilot with a licensed partner inside the sandbox. SilkSol AI itself is the technology layer: risk pricing, oracle and on-chain settlement.

## What Exists Today (MVP)

- A **USDC-denominated Escrow Vault** on Solana Devnet, settled by deterministic on-chain logic (see [Smart Contract Specs](./CONTRACT_SPECS.md)).
- Tenge equivalents in the UI (e.g. ~1,250,000 KZTE for 2,500 Demo USDC) are illustrative only. Planned direction: payouts in [KZTE](https://cointelegraph.com/news/kazakhstan-solana-mastercard-stablecoin-kzte), a tenge stablecoin on Solana piloted in the National Bank of Kazakhstan's sandbox (third-party use not yet checked).
- Every policy event is logged as a simulated compressed NFT (cNFT) to demonstrate an auditable settlement trail suitable for regulatory review.

## What This Is Not

- Not a connection to the digital tenge (eKZT), which runs on the National Bank's own platform, not on Solana, or to KZTE.
- Not a licensed money-transmission or fiat on/off-ramp service.
- Not a submitted or approved AIFC sandbox application.

## Roadmap Intent

Future work would involve engaging AIFC sandbox counsel to scope a compliant pilot with a licensed insurer partner and tenge (KZTE) payouts, including KYC/AML integration, reserve attestation, and audit access for regulators — none of which is implemented in this hackathon MVP.

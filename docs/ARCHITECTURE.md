# 🏗 Architecture Flow

SilkSol AI is composed of three cooperating layers: a predictive risk engine, a Solana settlement layer, and an enterprise frontend dashboard.

```text
 [IoT Sensors / GPS Trackers / Railway Telemetry]
                        │  (Simulated Telemetry API / Webhooks)
                        ▼
 ╔═════════════════════════════════════════════════════════╗
 ║ 1. Predictive Risk Engine (Analytics & Scoring)         ║
 ║  • Dynamic Risk Indexing & Delay Forecasting Logic      ║
 ╚═════════════════════════════════════════════════════════╝
                        │  (Risk Score Payload / Signed Feeds)
                        ▼
 ╔═════════════════════════════════════════════════════════╗
 ║ 2. Solana Blockchain Layer (Devnet Smart Contracts)     ║
 ║  • Compressed NFTs (cNFT): Immutable Freight Logs       ║
 ║  • Program Escrow Vault: Automated Collateralized USDC  ║
 ║  • Deterministic Settlement: Parametric Trigger Logic   ║
 ║  • KZTE Payouts: Tenge Stablecoin (to be explored)      ║
 ╚═════════════════════════════════════════════════════════╝
                        │  (Web3 Wallet RPC / Program Logs)
                        ▼
 ╔═════════════════════════════════════════════════════════╗
 ║ 3. Enterprise Frontend Dashboard (React / Tailwind)     ║
 ║  • Real-Time Container Tracking & Interactive Maps      ║
 ║  • Dual-Currency Escrow & Settlement Audit Logs         ║
 ╚═════════════════════════════════════════════════════════╝
```

## 1. Predictive Risk Engine

- Ingests simulated telemetry (GPS, dwell time, checkpoint status) from IoT sensors and railway feeds along the TMTM / Middle Corridor.
- Recalculates a dynamic risk index whenever `dwell_time` crosses a configured threshold.
- Emits a signed risk-score payload consumed by the Solana settlement layer.

## 2. Solana Blockchain Layer (Devnet)

- **Escrow Vault Program:** holds collateralized USDC and releases it automatically once a deterministic, rule-based delay condition is met (`dwell_time > threshold`).
- **Compressed NFTs (cNFTs):** record an immutable, low-cost audit trail of freight events and settlement decisions.
- **Tenge payouts (planned):** payouts in [KZTE](https://cointelegraph.com/news/kazakhstan-solana-mastercard-stablecoin-kzte), a tenge stablecoin on Solana, are a direction to explore; tenge amounts in the UI are illustrative. The digital tenge (eKZT) runs on the National Bank's own platform, not on Solana.

## 3. Enterprise Frontend Dashboard

- React + TypeScript + Tailwind dashboard for real-time container tracking, risk visualization, and escrow/settlement audit logs.
- Connects to Solana Devnet via `@solana/wallet-adapter-react` and `@solana/web3.js`.

See also: [Smart Contract Specs](./CONTRACT_SPECS.md) · [AIFC Sandbox Regulatory Notes](./AIFC_SANDBOX.md)

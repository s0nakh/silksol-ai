<p align="center"><img src="./Solana%20Colloseum/SilkSol%20AI%20Logo.jpg" alt="SilkSol AI Logo" width="180"/></p>

<h1 align="center">🚢 SilkSol AI ⚓️</h1>

<p align="center">
  <em>Predictive Risk Analytics & Parametric Settlement Protocol for Middle Corridor (TMTM) Logistics on Solana</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana Devnet" />
  <a href="./e2e/dashboard.spec.ts"><img src="https://img.shields.io/badge/E2E_Tests-13%20Passed-brightgreen?style=for-the-badge&logo=playwright" alt="E2E Testing Status" /></a>
  <img src="https://img.shields.io/badge/AIFC-Sandbox_Concept-D4AF37?style=for-the-badge" alt="Regulatory Framework" />
</p>

<p align="center">
  <a href="https://silksol.datariglab.kz/">🌐 Live dApp MVP</a> |
  <a href="https://www.loom.com/share/4f232e4e56e34883a77f673716d6e193">🎥 dApp Demo Video</a> |
  <a href="./docs/ARCHITECTURE.md">📚 Documentation</a>
</p>

---

## 💡 Executive Summary

SilkSol AI is a B2B dApp MVP combining telemetry risk analytics with automated Solana smart contracts to demonstrate instant delay mitigation and dispute resolution along the Trans-Caspian International Transport Route (TMTM / Middle Corridor).

Traditional supply chain insurance claims take 60–90+ days due to manual paperwork and dispute resolution. SilkSol AI demonstrates how verified telemetry feeds trigger automated, rule-based USDC payouts via non-custodial Solana Escrow Vaults, designed with a dual-currency eKZT (Digital Tenge) settlement abstraction layer for future AIFC regulatory sandbox compliance.

---

## 🏗 System Architecture

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
 ║  • eKZT Abstraction: AIFC Regulatory Off-Ramp Concept   ║
 ╚═════════════════════════════════════════════════════════╝
                        │  (Web3 Wallet RPC / Program Logs)
                        ▼
 ╔═════════════════════════════════════════════════════════╗
 ║ 3. Enterprise Frontend Dashboard (React / Tailwind)     ║
 ║  • Real-Time Container Tracking & Interactive Maps      ║
 ║  • Dual-Currency Escrow & Settlement Audit Logs         ║
 ╚═════════════════════════════════════════════════════════╝
```

---

## ✨ Key Features

- **Status & Risk Indexing:** High-level tracking of transit checkpoints across Caspian ports (Aktau/Kuryk) and regional hubs.
- **State Compression (cNFTs):** Cost-efficient storage of supply chain audit trails on Solana.
- **Parametric Escrow Prototype:** Automated USDC payout triggers upon verified delay thresholds (`dwell_time > threshold`).
- **Regulatory Sandbox Off-Ramp:** eKZT (Digital Tenge) settlement abstraction concept tailored for AIFC sandbox integration.
- **Zero Paperwork:** Instant, transparent, and verifiable event-driven settlement.

---

## 🛠 Tech Stack

- **Blockchain:** Solana Devnet, Compressed NFTs (cNFT / State Compression)
- **Tokens & Escrow:** SPL-Token / Demo USDC, eKZT Settlement Abstraction
- **Risk Engine:** Predictive Risk Scoring Logic & Parametric Oracle Simulator
- **Frontend & UI:** React, TypeScript, Tailwind CSS, Recharts
- **Web3 Integration:** `@solana/web3.js`, `@solana/wallet-adapter-react`

---

## 🧪 Testing & E2E Validation

A [Playwright](https://playwright.dev) suite (13 tests, [`e2e/dashboard.spec.ts`](./e2e/dashboard.spec.ts)) drives the dApp in a real Chromium browser exactly as a judge would — no browser wallet, so every signature takes the dApp's simulated Devnet path and no funds move. A ready-to-run [GitHub Actions workflow](./.github/workflows/e2e.yml) is included.

| Suite | Coverage |
|---|---|
| **Dashboard & Telemetry** | Demo disclaimer, KPI metrics, Middle Corridor route stops, Aktau congestion alert, IoT dwell time breaching the 18h threshold. |
| **Web3 Wallet (demo mode)** | Phantom / Solflare Devnet wallet menu and graceful fallback to simulated signatures. |
| **Cargo Filters** | In Transit / High Risk Delay / Escrow Triggered filters isolate the right shipments. |
| **Parametric Policy Lifecycle** | Issue → Lock Collateral & Sign → Trigger Oracle Event → Claim Paid Out (2,500 Demo USDC ≈ 1,250,000 eKZT); premium priced from the AI risk score. |
| **Autonomous Settlement** | Review settlement acknowledges the 2,500 Demo USDC payout. |
| **Caspian Risk Vault** | Demo USDC deposit updates stake; amounts above the wallet balance are rejected. |
| **cNFT Audit Trail** | Each policy event is logged as a compressed Merkle checkpoint (leaf + root). |

Run the suite:

```bash
npx playwright install chromium   # one-time browser download
npm run test:e2e                  # against a local dev server (started automatically)
npm run test:e2e:live             # against the live dApp at silksol.datariglab.kz
```

---

## 📚 Documentation & Architecture Specs

- **[Architecture Flow](./docs/ARCHITECTURE.md)** — end-to-end system design, data flow, and on-chain/off-chain boundaries.
- **[Smart Contract Specs](./docs/CONTRACT_SPECS.md)** — Escrow Vault program accounts, instructions, and settlement trigger logic.
- **[AIFC Sandbox Regulatory Notes](./docs/AIFC_SANDBOX.md)** — eKZT off-ramp compliance concept for the AIFC regulatory sandbox.

---

## ⚠️ MVP Status & Intellectual Property Notice

- **MVP Data & Telemetry:** This public repository is an interactive hackathon MVP. All telemetry streams, risk metrics, and oracle events utilize synthetic/simulated data to demonstrate the automated workflow without requiring live hardware sensors.
- **Deterministic Triggers:** AI/ML components represent predictive risk scoring logic; payout triggers are strictly deterministic rule-based smart contracts (`dwell_time > threshold`).
- **IP Protection:** Proprietary risk-scoring algorithms, dataset parameters, and model weights remain confidential assets of DataRigLab / SilkSol AI and operate behind private infrastructure.
- **Regulatory Roadmap:** The eKZT / Digital Tenge integration represents a structural proposal for future testing within the AIFC regulatory sandbox environment.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm

### Setup Instructions

1. **Clone repository:**
   ```bash
   git clone https://github.com/s0nakh/silksol-ai.git
   cd silksol-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Launch local server:**
   ```bash
   npm run dev
   ```

---

### 📜 License & Copyright

Copyright © 2026 **SilkSol AI / s0nakh**. All rights reserved.
*Published for Solana Colosseum Frontier Hackathon demonstration and evaluation.*

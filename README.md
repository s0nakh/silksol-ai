# 🚢 SilkSol AI ⚓️

> Predictive Risk Analytics & Parametric Settlement Protocol for Middle Corridor (TMTM) Logistics on Solana

![Solana Network](https://img.shields.io/badge/Solana-Mainnet%2FDevnet-purple?style=for-the-badge&logo=solana)
![Anchor Framework](https://img.shields.io/badge/Anchor-v0.29.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20Tailwind-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)

---

## 💡 Executive Summary

SilkSol AI is a B2B dApp MVP combining telemetry risk analytics with automated Solana smart contracts to demonstrate instant delay mitigation and dispute resolution along the Trans-Caspian International Transport Route (TMTM / Middle Corridor).

Traditional supply chain insurance claims take 60–90+ days due to manual paperwork and dispute resolution. SilkSol AI demonstrates how verified telemetry feeds trigger automated, rule-based USDC payouts via non-custodial Solana Escrow Vaults, designed with a dual-currency eKZT (Digital Kazakhstan Tenge) settlement abstraction layer for future AIFC regulatory sandbox compliance.

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

● Status & Risk Indexing: High-level tracking of transit checkpoints across Caspian ports (Aktau/Kuryk) and regional hubs.
● State Compression (cNFTs): Cost-efficient storage of supply chain audit trails on Solana.
● Parametric Escrow Prototype: Automated USDC payout triggers upon verified delay thresholds (dwell_time > threshold).
● Regulatory Sandbox Off-Ramp: eKZT (Digital Tenge) settlement abstraction concept tailored for AIFC sandbox integration.
● Zero Paperwork: Instant, transparent, and verifiable event-driven settlement.

---


## 🛠 Tech Stack

● Blockchain: Solana Devnet, Compressed NFTs (cNFT / State Compression)
● Tokens & Escrow: SPL-Token / Demo USDC, eKZT Settlement Abstraction
● Risk Engine: Predictive Risk Scoring Logic & Parametric Oracle Simulator
● Frontend & UI: React, TypeScript, Tailwind CSS, Recharts
● Web3 Integration: @solana/web3.js, @solana/wallet-adapter-react

---

## ⚠️ MVP Status & Intellectual Property Notice

● MVP Data & Telemetry: This public repository is an interactive hackathon MVP. All telemetry streams, risk metrics, and oracle events utilize synthetic/simulated data to demonstrate the automated workflow without requiring live hardware sensors.
● Deterministic Triggers: AI/ML components represent predictive risk scoring logic; payout triggers are strictly deterministic rule-based smart contracts (dwell_time > threshold).
● IP Protection: Proprietary risk-scoring algorithms, dataset parameters, and model weights remain confidential assets of DataRigLab / SilkSol AI and operate behind private infrastructure.
● Regulatory Roadmap: The eKZT / Digital Tenge integration represents a structural proposal for future testing within the AIFC regulatory sandbox environment.

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js (v18+)
- npm / yarn / pnpm

### Dashboard Setup

1. Clone repository:
git clone https://github.com/s0nakh/silksol-ai.git
cd silksol-ai

2. Install dependencies:
npm install

3. Configure Environment Variables (.env.local):
VITE_SOLANA_CLUSTER=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

4. Launch local server:
npm run dev

---

## 📜 License & Copyright

Copyright © 2026 SilkSol AI / s0nakh. All rights reserved.  
Published for Solana Colosseum Frontier Hackathon demonstration and further evaluation.

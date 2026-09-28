# SilkSol AI 🚚⚓️

> Predictive Risk Analytics & Parametric Settlement Protocol for Middle Corridor (TMTM) Logistics on Solana

![Solana Network](https://img.shields.io/badge/Solana-Mainnet%2FDevnet-purple?style=for-the-badge&logo=solana)
![Anchor Framework](https://img.shields.io/badge/Anchor-v0.29.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20Tailwind-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)

---

## Executive Summary

SilkSol AI is a B2B middleware concept combining telemetry risk analytics with automated Solana smart contracts to demonstrate instant delay mitigation and dispute resolution along the Trans-Caspian International Transport Route (TMTM / Middle Corridor).

Traditional supply chain insurance claims take months due to manual verification. SilkSol AI demonstrates how offchain status feeds can trigger automated, rule-based USDC payouts via non-custodial Solana Escrow Vaults.

---

## System Architecture
```text
 [IoT Sensors / GPS Trackers / Railway Telemetry]
                        │  (JSON Telemetry API / Secure Webhook)
                        ▼
 ╔═════════════════════════════════════════════════════════╗
 ║ 1. Predictive ML Engine (Python / FastAPI)              ║
 ║  • Dynamic Risk Indexing & Delay Forecasting            ║
 ╚═════════════════════════════════════════════════════════╝
                        │  (Risk Score Payload / Signed Feeds)
                        ▼
 ╔═════════════════════════════════════════════════════════╗
 ║ 2. Solana Blockchain Layer (Anchor Framework)           ║
 ║  • Compressed NFTs (cNFT): Immutable Freight Passports  ║
 ║  • Program Escrow Vault: Automated Collateralized USDC  ║
 ║  • Automated Settlement: Parametric Payouts             ║
 ╚═════════════════════════════════════════════════════════╝
                        │  (Web3 Wallet RPC / Program Logs)
                        ▼
 ╔═════════════════════════════════════════════════════════╗
 ║ 3. Enterprise Frontend Dashboard (React / Tailwind)     ║
 ║  • Real-Time Container Tracking & Interactive Maps      ║
 ║  • Onchain Escrow Management & USDC Settlement Audit    ║
 ╚═════════════════════════════════════════════════════════╝
```
---

## Key Features

- Status & Risk Indexing: High-level tracking of transit checkpoints across Caspian ports and regional hubs.
- State Compression (cNFTs): Concept for storing status logs cost-efficiently on Solana.
- Parametric Escrow Prototype: Demonstration of automated USDC payout triggers upon verified delay thresholds.
- Zero Paperwork: Automated event validation layout.

---

## Intellectual Property & Confidentiality Notice

Notice: The actual machine learning model weights, predictive algorithms, dataset parameters, and proprietary risk-scoring logic are confidential assets of DataRigLab / SilkSol AI and are strictly excluded from this repository.

- Demonstration Data: This public repository contains only open-source interface components and simulated data feeds for hackathon evaluation purposes.
- Core IP Protection: All proprietary analytics engines run within private infrastructure behind secured endpoints.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Blockchain | Solana (Anchor Framework, Rust, cNFT / Bubblegum) |
| Tokens & Collateral | SPL-Token / Native USDC |
| Predictive Engine | Python, FastAPI |
| Frontend & UI | React, TypeScript, Tailwind CSS, Recharts |
| Web3 Integration | @solana/web3.js, @solana/wallet-adapter-react |

---

## Getting Started (Local Development)

### Prerequisites

- Node.js (v18+)
- npm / yarn / pnpm

### Dashboard Setup

1. Clone repository:
git clone https://github.com/s0nakh/silksol-ai.git
cd silksol-ai

2. Install dependencies:
npm install

3. Configure Environment Variables in .env.local:
VITE_SOLANA_CLUSTER=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

4. Launch local server:
npm run dev

---

## License & Copyright

Copyright © 2026 SilkSol AI / s0nakh. All rights reserved.  
This repository is published solely for hackathon demonstration and evaluation.

<p align="center"><img src="./Solana%20Colloseum/SilkSol%20AI%20Logo.jpg" alt="SilkSol AI Logo" width="180"/></p>

<h1 align="center">🚢 SilkSol AI ⚓️</h1>

<p align="center">
  <em>Predictive Risk Analytics & Parametric Settlement Protocol for Middle Corridor (TMTM) Logistics on Solana</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana Devnet" />
  <a href="./e2e/dashboard.spec.ts"><img src="https://img.shields.io/badge/E2E_Tests-14%20Passed-brightgreen?style=for-the-badge&logo=playwright" alt="E2E Testing Status" /></a>
  <a href="./anchor/tests/silksol_escrow.test.ts"><img src="https://img.shields.io/badge/Program_Tests-11%20Passed-brightgreen?style=for-the-badge&logo=solana&logoColor=white" alt="Solana program tests" /></a>
  <a href="https://explorer.solana.com/address/Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z?cluster=devnet"><img src="https://img.shields.io/badge/Program-Devnet-14F195?style=for-the-badge&logo=solana&logoColor=white" alt="Escrow program on Devnet" /></a>
  <img src="https://img.shields.io/badge/AIFC-Sandbox_Concept-D4AF37?style=for-the-badge" alt="Regulatory Framework" />
</p>

<p align="center">
  <a href="https://silksol.datariglab.kz/">🌐 Live dApp MVP</a> |
  <a href="https://www.loom.com/share/4f232e4e56e34883a77f673716d6e193">🎥 dApp Demo Video</a> |
  <a href="https://www.loom.com/share/8e35c164203441d292f12f8d9302ac09">🎤 Pitch Video</a> |
  <a href="./docs/SilkSol-AI-Presentation.pdf">📊 Presentation (PDF)</a> |
  <a href="./docs/ARCHITECTURE.md">📚 Documentation</a>
</p>

<p align="center">
  <b>English</b> · <a href="#-русский">Русский</a> · <a href="#-қазақша">Қазақша</a>
</p>

---

## 💡 Executive Summary

SilkSol AI is a B2B dApp MVP combining telemetry risk analytics with automated Solana smart contracts to demonstrate instant delay mitigation and dispute resolution along the Trans-Caspian International Transport Route (TMTM / Middle Corridor).

Traditional supply chain insurance claims take 60–90+ days due to manual paperwork and dispute resolution. SilkSol AI demonstrates how verified telemetry feeds trigger automated, rule-based USDC payouts via non-custodial Solana Escrow Vaults, designed with a dual-currency eKZT (Digital Tenge) settlement abstraction layer for future AIFC regulatory sandbox compliance.

---

## 🧑‍⚖️ Try it in 2 minutes (judges)

1. Install [Phantom](https://phantom.com) → **Settings → Developer Settings → Testnet Mode → Solana Devnet**.
2. Get free Devnet SOL at [faucet.solana.com](https://faucet.solana.com) (only needed for step 5; the payout in step 4 costs you nothing).
3. Open the [live dApp](https://silksol.datariglab.kz/) → **Connect wallet → Phantom**.
4. Scroll to **Autonomous settlement → Review settlement**. No signature is needed: the SilkSol AI insurer runs the claim on-chain and **+0.01 Devnet SOL arrives in your wallet** within seconds. Click the `tx:` link to see it in Solana Explorer, including the memo `SilkSol AI | Parametric payout | Cargo #JOL-8921 | Delay 96h > 72h | …`.
5. Full lifecycle in the **Parametric policy & claim engine** panel: **Issue Parametric Policy** (you sign a 0.001 SOL premium) → **Lock Collateral & Sign** (insurer locks 0.01 SOL in an escrow vault for you) → **Trigger Oracle Event** (oracle reports a 96 h delay, the program pays you).

> Without a wallet everything still works in demo mode with clearly labelled simulated transactions.

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

## ⛓ On-chain Escrow Program (Devnet)

The parametric core runs on Solana as the Anchor program [`silksol_escrow`](./anchor/programs/silksol_escrow/src/lib.rs) — program ID [`Gu7gKXNn…AJr9Z`](https://explorer.solana.com/address/Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z?cluster=devnet).

`initialize_vault` → `submit_telemetry` → `evaluate_trigger` (`dwell_time > threshold`) → `settle_payout` → `close_vault`

With Phantom/Solflare connected on Devnet, roles are split as in production: the **SilkSol AI insurer treasury** ([`LxtEpBFN…mv7C`](https://explorer.solana.com/address/LxtEpBFNvEEBmESNA6ExiYHdrdZCfNGkCbndLVimv7C?cluster=devnet)) locks collateral and signs oracle telemetry server-side, and the **connected wallet is the beneficiary** that receives the payout (0.01 Devnet SOL as a USDC stand-in). Every transaction carries an SPL **Memo** (`SilkSol AI | Parametric payout | Cargo #… | Delay 96h > 72h | Policy … | Report sha256:…`), so it is self-describing in Explorer. cNFT audit logs and eKZT conversion remain simulated. Specs: [CONTRACT_SPECS.md](./docs/CONTRACT_SPECS.md).

```bash
cd anchor && anchor build
solana-test-validator --reset --bpf-program Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z target/deploy/silksol_escrow.so &
node --test --experimental-strip-types tests/*.test.ts   # 11 program tests
```

---

## 🛠 Tech Stack

- **Blockchain:** Solana Devnet, Anchor 1.2 escrow program (Rust), Compressed NFTs (cNFT / State Compression, simulated)
- **Tokens & Escrow:** SPL-Token / Demo USDC, eKZT Settlement Abstraction
- **Risk Engine:** Predictive Risk Scoring Logic & Parametric Oracle Simulator
- **Frontend & UI:** React, TypeScript, Tailwind CSS, Recharts
- **Web3 Integration:** `@solana/web3.js`, `@solana/wallet-adapter-react`

---

## 🧪 Testing & E2E Validation

### ✅ Verification status — all green (Oct 1, 2026)

| Check | Result |
|---|---|
| Solana program tests (local validator, [`anchor/tests`](./anchor/tests/silksol_escrow.test.ts)) | **11 / 11 passed** |
| E2E suite against a local build | **14 / 14 passed** |
| E2E suite against the live dApp ([silksol.datariglab.kz](https://silksol.datariglab.kz/)) | **14 / 14 passed** |
| Production build & TypeScript type-check | **Passed** |
| Program deployed to Devnet | ✅ [`Gu7gKXNn…Ar9Z`](https://explorer.solana.com/address/Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z?cluster=devnet) |
| Insurer payout to a user wallet with memo (Review settlement) | ✅ [payout tx](https://explorer.solana.com/tx/2vUaDDr7ehwxDoUSt7ohVgRvgcwFrDLN5ReDnq9n9y9mdh8SSmT9yd3eeYfCP2HRWdR1zYzPoopfM6ua28UhB945?cluster=devnet) (+0.01 SOL to the beneficiary) |
| End-to-end on Devnet: lock collateral → trigger → payout (self-funded) | ✅ [lock tx](https://explorer.solana.com/tx/381KwL25F1QTCsYsdCm6zRYyVpHrhVwesRzQdcD2VWBraaD8XUJTnS7ngy7BSkdswxbd4vsGEVCf6nEdLf2Qtt4Y?cluster=devnet) · [payout tx](https://explorer.solana.com/tx/4uk5unBu9H7PyMf53hstkpMsMZgE15xxxMmPL8TZ6VpNLrJnzWwjrAcFHePfrD4wEV3iH1TYJJtHRHFJGEuT69Yw?cluster=devnet) (settled in ~1.4 s) |

### E2E suite

A [Playwright](https://playwright.dev) suite (14 tests, [`e2e/dashboard.spec.ts`](./e2e/dashboard.spec.ts)) drives the dApp in a real Chromium browser exactly as a judge would — no browser wallet, so every signature takes the dApp's simulated Devnet path and no funds move. A ready-to-run [GitHub Actions workflow](./.github/workflows/e2e.yml) is included.

| Suite | Coverage |
|---|---|
| **Dashboard & Telemetry** | Demo disclaimer, KPI metrics, Middle Corridor route stops, Aktau congestion alert, IoT dwell time breaching the 18h threshold. |
| **Web3 Wallet (demo mode)** | Phantom / Solflare Devnet wallet menu and graceful fallback to simulated signatures. |
| **Cargo Filters** | In Transit / High Risk Delay / Escrow Triggered filters isolate the right shipments. |
| **Parametric Policy Lifecycle** | Issue → Lock Collateral & Sign → Trigger Oracle Event → Claim Paid Out (2,500 Demo USDC ≈ 1,250,000 eKZT); premium priced from the AI risk score. |
| **Autonomous Settlement** | Review settlement acknowledges the 2,500 Demo USDC payout. |
| **Caspian Risk Vault** | Demo USDC deposit updates stake; amounts above the wallet balance are rejected. |
| **cNFT Audit Trail** | Each policy event is logged as a compressed Merkle checkpoint (leaf + root). |
| **On-chain Escrow Program** | Policy panel links to the deployed Devnet program and shows its live status. |

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
   # optional: server-side insurer treasury (Devnet keypair JSON array) for real payouts
   echo "SILKSOL_TREASURY_SECRET=$(cat ~/.config/solana/<treasury>.json)" >> .env
   ```

4. **Launch local server:**
   ```bash
   npm run dev
   ```

---

### 📜 License & Copyright

Copyright © 2026 **SilkSol AI / s0nakh**. All rights reserved.
*Published for Solana Colosseum Frontier Hackathon demonstration and evaluation.*

---

## 🇷🇺 Русский

**SilkSol AI** — B2B-приложение (dApp) для грузоперевозок по Среднему коридору (ТМТМ: Китай → Казахстан → Каспий → Азербайджан → Турция). Оно прогнозирует задержки грузов и автоматически выплачивает страховку через смарт-контракт Solana, если задержка превысила порог. Вместо 60–90 дней бумажной волокиты — выплата за секунды, прозрачно и проверяемо в блокчейне.

**Ссылки:** [🌐 Приложение](https://silksol.datariglab.kz/) · [🎥 Демо-видео](https://www.loom.com/share/4f232e4e56e34883a77f673716d6e193) · [🎤 Питч](https://www.loom.com/share/8e35c164203441d292f12f8d9302ac09) · [📊 Презентация (PDF)](./docs/SilkSol-AI-Presentation.pdf) · [📚 Документация](./docs/ARCHITECTURE.md)

### Как протестировать за 2 минуты

1. Установите [Phantom](https://phantom.com) → **Settings → Developer Settings → Testnet Mode → Solana Devnet**.
2. Получите бесплатные тестовые SOL на [faucet.solana.com](https://faucet.solana.com) (нужны только для шага 5).
3. Откройте [приложение](https://silksol.datariglab.kz/) → **Connect wallet → Phantom**.
4. Внизу страницы, в блоке **Autonomous settlement**, нажмите **Review settlement**. Подписывать ничего не нужно: страховщик SilkSol AI проводит страховой случай в блокчейне, и через несколько секунд **на ваш кошелёк приходит +0.01 Devnet SOL**. По ссылке `tx:` видно транзакцию в Solana Explorer с пометкой (Memo) `SilkSol AI | Parametric payout | Cargo #JOL-8921 | …`.
5. Полный цикл — в панели **Parametric policy & claim engine**: **Issue Parametric Policy** (вы платите премию 0.001 SOL) → **Lock Collateral & Sign** (страховщик блокирует 0.01 SOL в эскроу для вас) → **Trigger Oracle Event** (оракул сообщает о задержке 96 ч, программа платит вам).

### Что работает в блокчейне

Anchor-программа [`silksol_escrow`](./anchor/programs/silksol_escrow/src/lib.rs) развёрнута в Devnet: `initialize_vault` → `submit_telemetry` → `evaluate_trigger` (`задержка > порога`) → `settle_payout` → `close_vault`. Решение о выплате — строгое правило в смарт-контракте, без ИИ на блокчейне. Каждая транзакция подписана текстовым Memo с номером груза, полиса и хешем отчёта оракула. Журнал cNFT и конвертация в eKZT (цифровой тенге) пока симулируются.

**Статус проверки:** 11/11 тестов программы, 14/14 E2E-тестов (локально и на живом сайте), реальные выплаты в Devnet — см. таблицу выше.

---

## 🇰🇿 Қазақша

**SilkSol AI** — Орта дәліз (ТХКБ: Қытай → Қазақстан → Каспий → Әзірбайжан → Түркия) бойынша жүк тасымалына арналған B2B қосымшасы (dApp). Ол жүктің кешігуін болжайды және кешігу белгіленген шектен асса, Solana смарт-келісімшарты арқылы сақтандыру өтемін автоматты түрде төлейді. 60–90 күндік қағазбастылықтың орнына — блокчейнде ашық әрі тексерілетін, бірнеше секундтық төлем.

**Сілтемелер:** [🌐 Қосымша](https://silksol.datariglab.kz/) · [🎥 Демо-бейне](https://www.loom.com/share/4f232e4e56e34883a77f673716d6e193) · [🎤 Питч](https://www.loom.com/share/8e35c164203441d292f12f8d9302ac09) · [📊 Презентация (PDF)](./docs/SilkSol-AI-Presentation.pdf) · [📚 Құжаттама](./docs/ARCHITECTURE.md)

### 2 минутта қалай тексеруге болады

1. [Phantom](https://phantom.com) әмиянын орнатыңыз → **Settings → Developer Settings → Testnet Mode → Solana Devnet**.
2. [faucet.solana.com](https://faucet.solana.com) сайтынан тегін тест SOL алыңыз (тек 5-қадамға қажет).
3. [Қосымшаны](https://silksol.datariglab.kz/) ашыңыз → **Connect wallet → Phantom**.
4. Беттің төменгі жағындағы **Autonomous settlement** блогында **Review settlement** батырмасын басыңыз. Ештеңеге қол қоюдың қажеті жоқ: SilkSol AI сақтандырушысы сақтандыру жағдайын блокчейнде жүргізеді, бірнеше секундтан кейін **әмияныңызға +0.01 Devnet SOL түседі**. `tx:` сілтемесі арқылы транзакцияны Solana Explorer-де Memo белгісімен көресіз: `SilkSol AI | Parametric payout | Cargo #JOL-8921 | …`.
5. Толық цикл — **Parametric policy & claim engine** панелінде: **Issue Parametric Policy** (0.001 SOL сыйлықақы төлейсіз) → **Lock Collateral & Sign** (сақтандырушы сіз үшін эскроуда 0.01 SOL бұғаттайды) → **Trigger Oracle Event** (оракул 96 сағаттық кешігу туралы хабарлайды, бағдарлама сізге төлейді).

### Блокчейнде не жұмыс істейді

[`silksol_escrow`](./anchor/programs/silksol_escrow/src/lib.rs) Anchor бағдарламасы Devnet-те орналастырылған: `initialize_vault` → `submit_telemetry` → `evaluate_trigger` (`кешігу > шек`) → `settle_payout` → `close_vault`. Төлем туралы шешім — смарт-келісімшарттағы қатаң ереже, блокчейнде жасанды интеллект жоқ. Әр транзакцияда жүк нөмірі, полис нөмірі және оракул есебінің хеш-коды бар Memo мәтіні бар. cNFT журналы мен eKZT (цифрлық теңге) айырбасы әзірге симуляция.

**Тексеру мәртебесі:** бағдарламаның 11/11 тесі, 14/14 E2E тесі (жергілікті және тірі сайтта), Devnet-тегі нақты төлемдер — жоғарыдағы кестені қараңыз.

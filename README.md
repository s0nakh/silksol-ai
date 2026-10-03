<p align="center"><img src="./Solana%20Colloseum/SilkSol%20AI%20Logo.jpg" alt="SilkSol AI Logo" width="180"/></p>

<h1 align="center">🚢 SilkSol AI ⚓️</h1>

<p align="center">
  <em>Predictive Risk Analytics & Parametric Settlement Protocol for Middle Corridor (TMTM) Logistics on Solana</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana Devnet" />
  <a href="./e2e/dashboard.spec.ts"><img src="https://img.shields.io/badge/E2E_Tests-17%20Passed-brightgreen?style=for-the-badge&logo=playwright" alt="E2E Testing Status" /></a>
  <a href="./anchor/tests/silksol_escrow.test.ts"><img src="https://img.shields.io/badge/Program_Tests-11%20Passed-brightgreen?style=for-the-badge&logo=solana&logoColor=white" alt="Solana program tests" /></a>
  <a href="https://explorer.solana.com/address/Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z?cluster=devnet"><img src="https://img.shields.io/badge/Program-Devnet-14F195?style=for-the-badge&logo=solana&logoColor=white" alt="Escrow program on Devnet" /></a>
  <img src="https://img.shields.io/badge/AIFC-Sandbox_Concept-D4AF37?style=for-the-badge" alt="Regulatory Framework" />
</p>

<p align="center">
  <a href="https://silksol.datariglab.kz/">🌐 Live dApp MVP</a> |
  <a href="https://www.loom.com/share/16e3dec8fe1f4a1488efa34fc906ea41">🎥 dApp Demo Video</a> |
  <a href="https://www.loom.com/share/7a5fc765245d46a6aed6e34b6acee973">🎤 Pitch Video</a> |
  <a href="https://drive.google.com/file/d/1-UWk83wW0HsOWty91211pTQNe-KJoIfA/view?usp=sharing">📊 Presentation (PDF)</a> |
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
4. Scroll to **Autonomous settlement → Review settlement**. No signature is needed: the SilkSol AI insurer runs the claim on-chain and **+0.01 Devnet SOL arrives in your wallet** within seconds. Click the `tx:` link to see it in Solana Explorer, including the memo `SilkSol AI | Parametric payout | Cargo #JOL-8921 | Delay 96h > 72h | …`. Now select **#TRK-7782** (dwell 18 h) and click **Review settlement** again: the escrow program **refuses** the claim (`NotEligible`), and nothing is paid.
5. Full lifecycle in the **Parametric policy & claim engine** panel: **Issue Parametric Policy** (you sign a 0.001 SOL premium) → **Lock Collateral & Sign** (insurer locks 0.01 SOL in an escrow vault for you) → **Trigger Oracle Event** (the oracle reports that cargo's dwell time; the program pays only if it is over 72 h).

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

The parametric core runs on Solana as the Anchor program [`silksol_escrow`](./anchor/programs/silksol_escrow/src/lib.rs) — program ID [`Gu7gKXNn…Ar9Z`](https://explorer.solana.com/address/Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z?cluster=devnet).

`initialize_vault` → `submit_telemetry` → `evaluate_trigger` (`dwell_time > threshold`) → `settle_payout` → `close_vault`

With Phantom/Solflare connected on Devnet, roles are split as in production: the **SilkSol AI insurer treasury** ([`LxtEpBFN…mv7C`](https://explorer.solana.com/address/LxtEpBFNvEEBmESNA6ExiYHdrdZCfNGkCbndLVimv7C?cluster=devnet)) locks collateral and signs oracle telemetry in a [serverless function](./oracle/netlify/functions/insurer.mts), and the **connected wallet is the beneficiary** that receives the payout (0.01 Devnet SOL as a USDC stand-in). Every transaction carries an SPL **Memo** (`SilkSol AI | Parametric payout | Cargo #… | Delay 96h > 72h | Policy … | Report sha256:…`), so it is self-describing in Explorer. cNFT audit logs and eKZT conversion remain simulated. Specs: [CONTRACT_SPECS.md](./docs/CONTRACT_SPECS.md).

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

### ✅ Verification status — all green (Oct 3, 2026)

| Check | Result |
|---|---|
| Solana program tests (local validator, [`anchor/tests`](./anchor/tests/silksol_escrow.test.ts)) | **11 / 11 passed** |
| E2E suite against a local build | **17 / 17 passed** |
| E2E suite against the live dApp ([silksol.datariglab.kz](https://silksol.datariglab.kz/)) | **15 / 15 passed** |
| Production build & TypeScript type-check | **Passed** |
| Program deployed to Devnet | ✅ [`Gu7gKXNn…Ar9Z`](https://explorer.solana.com/address/Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z?cluster=devnet) |
| Insurer payout to a user wallet with memo (Review settlement) | ✅ [payout tx](https://explorer.solana.com/tx/2vUaDDr7ehwxDoUSt7ohVgRvgcwFrDLN5ReDnq9n9y9mdh8SSmT9yd3eeYfCP2HRWdR1zYzPoopfM6ua28UhB945?cluster=devnet) (+0.01 SOL to the beneficiary) |
| Live insurer/oracle ([silksol-oracle.netlify.app](https://silksol-oracle.netlify.app)) → payout | ✅ [payout tx](https://explorer.solana.com/tx/qJoAoc2tsSGD4PtPXNW9h6xAQ4cnUWVo2miE3a6TXnnhG5SYLHBFJtcrwjYBE82kaawtYs7XGRBVMCKLD5smFvA?cluster=devnet) |
| End-to-end on Devnet: lock collateral → trigger → payout (self-funded) | ✅ [lock tx](https://explorer.solana.com/tx/381KwL25F1QTCsYsdCm6zRYyVpHrhVwesRzQdcD2VWBraaD8XUJTnS7ngy7BSkdswxbd4vsGEVCf6nEdLf2Qtt4Y?cluster=devnet) · [payout tx](https://explorer.solana.com/tx/4uk5unBu9H7PyMf53hstkpMsMZgE15xxxMmPL8TZ6VpNLrJnzWwjrAcFHePfrD4wEV3iH1TYJJtHRHFJGEuT69Yw?cluster=devnet) (settled in ~1.4 s) |

### E2E suite

A [Playwright](https://playwright.dev) suite (17 tests, [`e2e/dashboard.spec.ts`](./e2e/dashboard.spec.ts)) drives the dApp in a real Chromium browser exactly as a judge would — no browser wallet, so every signature takes the dApp's simulated Devnet path and no funds move. A ready-to-run [GitHub Actions workflow](./.github/workflows/e2e.yml) is included.

| Suite | Coverage |
|---|---|
| **Dashboard & Telemetry** | Demo disclaimer, KPI metrics, Middle Corridor route stops, Aktau congestion alert, the selected cargo's oracle dwell time against the 72 h trigger. |
| **Web3 Wallet (demo mode)** | Phantom / Solflare Devnet wallet menu and graceful fallback to simulated signatures. |
| **Cargo Filters** | In Transit / High Risk Delay / Escrow Triggered filters isolate the right shipments. |
| **Parametric Policy Lifecycle** | Issue → Lock Collateral & Sign → Trigger Oracle Event → Claim Paid Out (2,500 Demo USDC ≈ 1,250,000 eKZT); the trigger is refused for a cargo under 72 h; premium priced from the AI risk score. |
| **Autonomous Settlement** | Review settlement acknowledges the 2,500 Demo USDC payout and settles the cargo selected in the table, not a fixed one; a cargo under the threshold gets no payout. |
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
- **[Presentation (PDF)](https://drive.google.com/file/d/1-UWk83wW0HsOWty91211pTQNe-KJoIfA/view?usp=sharing)** — pitch deck on Google Drive.

---

## 📊 Market, sources & positioning

**Market data sources.** The corridor figures in the pitch deck (and the TAM / SAM / SOM sizing built on them) come from public sources:

- **World Bank**, *Integration: World-Class Trade Logistics Along the Trans-Caspian Transport Corridor* (Sept 28, 2026): investments could more than triple corridor volumes and halve travel times by 2040; port and border delays are the main bottleneck. [Press release](https://www.worldbank.org/en/news/press-release/2026/09/28/trans-caspian-transport-corridor-investments-spur-growth-and-create-millions-jobs)
- **Argus** freight assessment (Sept 2026): Xi'an → Tbilisi/Poti **$6,900–7,200 per 40HC**, Xi'an → Alat/Baku $6,750–7,200 per 40HC. [Trend.az summary](https://www.trend.az/casia/kazakhstan/4229949.html)
- **TITR / Ministry of Transport of Kazakhstan**: Middle Corridor volumes grew from 0.8 to **~4.5 million tonnes a year**. [The Times of Central Asia](https://timesca.com/middle-corridor-must-get-faster-titr-chief-tells-tca/)

**Global Web3 benchmarks.** Parametric cover on-chain is proven in other verticals: **Etherisc** (flight-delay and crop insurance), **Arbol** (parametric weather cover), **Nayms** (regulated on-chain insurance marketplace). SilkSol AI applies the same model to a corridor nobody covers: Caspian port dwell times (Aktau, Kuryk, Baku), with AIFC / eKZT settlement built in.

**Business model & risk capital.**
- **Who pays:** freight forwarders and shippers pay a premium per cargo, priced by the risk score.
- **Who carries the risk:** in production, a licensed insurer partner funds the escrow vaults (target: AIFC regulatory sandbox). SilkSol AI is the technology layer: risk pricing, oracle and on-chain settlement.
- **Caspian Risk Vault:** the liquidity vault in the dApp (TVL, APY) is a simulated later-phase concept, intended only for qualified investors under AIFC rules.

**Known limitations of the MVP.**
- The insurer and the oracle are one signer (a serverless function). A multi-signer oracle is on the roadmap.
- The vault has no `coverage_end` yet, so the insurer could close an untriggered vault before the cover period ends. Planned: block `close_vault` until coverage ends.
- Dwell times are simulated per demo cargo (#JOL-8921 96 h, #KZL-4107 110 h, #MCC-2048 6 h, #TRK-7782 18 h). The oracle reads them on the server; the browser cannot choose them.
- Payouts use Devnet SOL as a USDC stand-in; cNFT audit logs and eKZT conversion are simulated.
- The demo insurer is rate-limited (per wallet, plus 10 payouts per hour and 40 per day in total) to keep the Devnet treasury alive.

---

## 🗺 Roadmap: from Devnet MVP to production

| | Today (Devnet MVP) | Next | Production |
|---|---|---|---|
| **Escrow** | ✅ Anchor program live on Devnet, 11 program tests | Security review and audit | Mainnet deployment |
| **Payout currency** | ✅ Devnet SOL as a USDC stand-in | SPL USDC escrow vaults | USDC + eKZT dual settlement (AIFC Sandbox) |
| **Oracle** | ✅ Single insurer signer (serverless function) | Port and rail telemetry feeds (Aktau, Baku) | Multi-signer / decentralized oracle network |
| **Audit trail** | 🟡 cNFT logs simulated | Real State Compression (Bubblegum) | Every cargo event logged as a cNFT |
| **Risk engine** | 🟡 Rule-based scoring on simulated telemetry | Historical dwell-time data from operator partners | Trained model prices premiums live |
| **Regulatory** | 📄 AIFC Sandbox concept | AIFC Sandbox application | Licensed insurer partner |

✅ live · 🟡 simulated · 📄 planned

**Risk model plan.** There is no trained model yet: no public dataset of Trans-Caspian dwell times exists. Training starts once operator partners share 12–24 months of historical port and rail events (arrival/departure times, queue length, weather, season, cargo type). For this kind of tabular data the baseline is gradient-boosted trees (e.g. LightGBM or XGBoost), validated on time-based splits so the model is always tested on future shipments. The final choice depends on the data. The model only prices premiums; payouts stay a deterministic on-chain rule (`dwell_time > threshold`).

---

## ⚠️ MVP Status & Intellectual Property Notice

- **MVP Data & Telemetry:** This public repository is an interactive hackathon MVP. All telemetry streams, risk metrics, and oracle events utilize synthetic/simulated data to demonstrate the automated workflow without requiring live hardware sensors.
- **Deterministic Triggers:** AI/ML components represent predictive risk scoring logic; payout triggers are strictly deterministic rule-based smart contracts (`dwell_time > threshold`).
- **IP Protection:** The production risk-scoring logic and future model parameters will remain confidential assets of DataRigLab / SilkSol AI. This public MVP uses a simplified rule-based scorer on simulated data (see [Roadmap](#-roadmap-from-devnet-mvp-to-production)).
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
   # VITE_INSURER_URL points at the insurer/oracle Netlify Function (oracle/).
   # Its treasury secret is set only in Netlify, never in git.
   ```

4. **Launch local server:**
   ```bash
   npm run dev
   ```

5. **(Optional) Deploy your own insurer/oracle** — a free Netlify Function in [`oracle/`](./oracle):
   ```bash
   cd oracle && netlify sites:create --name <your-oracle>
   netlify env:set SILKSOL_TREASURY_SECRET "$(cat <devnet-treasury-keypair>.json)"
   ./build.sh && netlify deploy --prod --no-build --dir public --functions dist-functions
   ```

---

## 📜 License & Copyright

Copyright © 2026 **SilkSol AI / s0nakh**. All rights reserved.
*Published for Solana Colosseum Frontier Hackathon demonstration and evaluation.*

---

## 🇷🇺 Русский

<p align="center"><em>Предиктивная аналитика рисков и протокол параметрических выплат для логистики Среднего коридора (ТМТМ) на Solana</em></p>

[🌐 Приложение](https://silksol.datariglab.kz/) · [🎥 Демо-видео](https://www.loom.com/share/16e3dec8fe1f4a1488efa34fc906ea41) · [🎤 Питч-видео](https://www.loom.com/share/7a5fc765245d46a6aed6e34b6acee973) · [📊 Презентация (PDF)](https://drive.google.com/file/d/1-UWk83wW0HsOWty91211pTQNe-KJoIfA/view?usp=sharing) · [📚 Документация](./docs/ARCHITECTURE.md)

### 💡 Краткое описание

SilkSol AI — MVP B2B-приложения (dApp), которое объединяет аналитику рисков на основе телеметрии с автоматическими смарт-контрактами Solana. Оно показывает, как можно мгновенно компенсировать задержки грузов и разрешать споры на Транскаспийском международном транспортном маршруте (ТМТМ / Средний коридор).

Классические страховые выплаты в цепочках поставок занимают 60–90+ дней из-за ручного документооборота и споров. SilkSol AI показывает, как проверенные данные телеметрии запускают автоматические выплаты в USDC по строгим правилам через некастодиальные эскроу-хранилища Solana. Решение изначально рассчитано на двухвалютный слой расчётов с eKZT (цифровым тенге) для будущей работы в регуляторной песочнице AIFC (МФЦА).

### 🧑‍⚖️ Попробовать за 2 минуты (для судей)

1. Установите [Phantom](https://phantom.com) → **Settings → Developer Settings → Testnet Mode → Solana Devnet**.
2. Получите бесплатные Devnet SOL на [faucet.solana.com](https://faucet.solana.com) (нужны только для шага 5; выплата на шаге 4 вам ничего не стоит).
3. Откройте [приложение](https://silksol.datariglab.kz/) → **Connect wallet → Phantom**.
4. Прокрутите до блока **Autonomous settlement** и нажмите **Review settlement**. Подписывать ничего не нужно: страховщик SilkSol AI проводит страховой случай в блокчейне, и через несколько секунд **на ваш кошелёк приходит +0.01 Devnet SOL**. По ссылке `tx:` откроется транзакция в Solana Explorer вместе с пометкой (Memo) `SilkSol AI | Parametric payout | Cargo #JOL-8921 | Delay 96h > 72h | …`. Теперь выберите груз **#TRK-7782** (простой 18 ч) и снова нажмите **Review settlement**: эскроу-программа **отказывает** в выплате (`NotEligible`), деньги не уходят.
5. Полный цикл — в панели **Parametric policy & claim engine**: **Issue Parametric Policy** (вы подписываете премию 0.001 SOL) → **Lock Collateral & Sign** (страховщик блокирует для вас 0.01 SOL в эскроу-хранилище) → **Trigger Oracle Event** (оракул сообщает простой этого груза; программа платит, только если он больше 72 ч).

> Без кошелька всё тоже работает — в демо-режиме, с явно помеченными симулированными транзакциями.

### 🏗 Архитектура системы

```text
 [IoT-датчики / GPS-трекеры / ж/д телеметрия]
                        │  (Симулированный API телеметрии / вебхуки)
                        ▼
 ╔═════════════════════════════════════════════════════════╗
 ║ 1. Предиктивный движок рисков (аналитика и скоринг)     ║
 ║  • Динамический индекс риска и прогноз задержек         ║
 ╚═════════════════════════════════════════════════════════╝
                        │  (Оценка риска / подписанные данные)
                        ▼
 ╔═════════════════════════════════════════════════════════╗
 ║ 2. Блокчейн-слой Solana (смарт-контракты в Devnet)      ║
 ║  • Сжатые NFT (cNFT): неизменяемые журналы перевозок    ║
 ║  • Эскроу-хранилище: автоматический залог в USDC        ║
 ║  • Детерминированная выплата: параметрический триггер   ║
 ║  • Абстракция eKZT: концепция вывода в песочнице AIFC   ║
 ╚═════════════════════════════════════════════════════════╝
                        │  (RPC кошелька Web3 / логи программы)
                        ▼
 ╔═════════════════════════════════════════════════════════╗
 ║ 3. Корпоративный дашборд (React / Tailwind)             ║
 ║  • Отслеживание контейнеров и интерактивная карта       ║
 ║  • Двухвалютный эскроу и журналы выплат                 ║
 ╚═════════════════════════════════════════════════════════╝
```

### ✨ Ключевые возможности

- **Статусы и индексация рисков:** отслеживание транзитных точек в каспийских портах (Актау/Курык) и региональных хабах.
- **Сжатие состояния (cNFT):** недорогое хранение журналов аудита цепочки поставок в Solana.
- **Прототип параметрического эскроу:** автоматическая выплата в USDC при подтверждённом превышении порога задержки (`dwell_time > threshold`).
- **Выход через регуляторную песочницу:** концепция расчётов в eKZT (цифровом тенге) для интеграции с песочницей AIFC.
- **Ноль бумаг:** мгновенные, прозрачные и проверяемые выплаты по событию.

### ⛓ Эскроу-программа в блокчейне (Devnet)

Параметрическое ядро работает в Solana как Anchor-программа [`silksol_escrow`](./anchor/programs/silksol_escrow/src/lib.rs) — ID программы [`Gu7gKXNn…Ar9Z`](https://explorer.solana.com/address/Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z?cluster=devnet).

`initialize_vault` → `submit_telemetry` → `evaluate_trigger` (`dwell_time > threshold`) → `settle_payout` → `close_vault`

При подключённом Phantom/Solflare в Devnet роли разделены, как в реальной работе: **казна страховщика SilkSol AI** ([`LxtEpBFN…mv7C`](https://explorer.solana.com/address/LxtEpBFNvEEBmESNA6ExiYHdrdZCfNGkCbndLVimv7C?cluster=devnet)) блокирует залог и подписывает данные оракула в [серверной функции](./oracle/netlify/functions/insurer.mts), а **подключённый кошелёк — получатель (beneficiary)**, которому приходит выплата (0.01 Devnet SOL вместо USDC). В каждой транзакции есть SPL **Memo** (`SilkSol AI | Parametric payout | Cargo #… | Delay 96h > 72h | Policy … | Report sha256:…`), поэтому в Explorer сразу видно, что это за операция. Журнал cNFT и конвертация в eKZT пока симулируются. Спецификация: [CONTRACT_SPECS.md](./docs/CONTRACT_SPECS.md).

```bash
cd anchor && anchor build
solana-test-validator --reset --bpf-program Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z target/deploy/silksol_escrow.so &
node --test --experimental-strip-types tests/*.test.ts   # 11 program tests
```

### 🛠 Технологии

- **Блокчейн:** Solana Devnet, эскроу-программа на Anchor 1.2 (Rust), сжатые NFT (cNFT / State Compression, симуляция)
- **Токены и эскроу:** SPL-Token / Demo USDC, абстракция расчётов в eKZT
- **Движок рисков:** логика предиктивного скоринга и симулятор параметрического оракула
- **Фронтенд и UI:** React, TypeScript, Tailwind CSS, Recharts
- **Web3-интеграция:** `@solana/web3.js`, `@solana/wallet-adapter-react`
- **Страховщик/оракул:** бессерверная функция Netlify ([`oracle/`](./oracle))

### 🧪 Тестирование и E2E-проверка

#### ✅ Статус проверки — всё зелёное (3 октября 2026)

| Проверка | Результат |
|---|---|
| Тесты программы Solana (локальный валидатор, [`anchor/tests`](./anchor/tests/silksol_escrow.test.ts)) | **11 / 11 пройдено** |
| E2E-набор на локальной сборке | **17 / 17 пройдено** |
| E2E-набор на живом приложении ([silksol.datariglab.kz](https://silksol.datariglab.kz/)) | **15 / 15 пройдено** |
| Продакшн-сборка и проверка типов TypeScript | **Пройдено** |
| Программа развёрнута в Devnet | ✅ [`Gu7gKXNn…Ar9Z`](https://explorer.solana.com/address/Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z?cluster=devnet) |
| Выплата страховщика на кошелёк пользователя с Memo (Review settlement) | ✅ [транзакция выплаты](https://explorer.solana.com/tx/2vUaDDr7ehwxDoUSt7ohVgRvgcwFrDLN5ReDnq9n9y9mdh8SSmT9yd3eeYfCP2HRWdR1zYzPoopfM6ua28UhB945?cluster=devnet) (+0.01 SOL получателю) |
| Живой страховщик/оракул ([silksol-oracle.netlify.app](https://silksol-oracle.netlify.app)) → выплата | ✅ [транзакция выплаты](https://explorer.solana.com/tx/qJoAoc2tsSGD4PtPXNW9h6xAQ4cnUWVo2miE3a6TXnnhG5SYLHBFJtcrwjYBE82kaawtYs7XGRBVMCKLD5smFvA?cluster=devnet) |
| Полный цикл в Devnet: залог → триггер → выплата (за свой счёт) | ✅ [залог](https://explorer.solana.com/tx/381KwL25F1QTCsYsdCm6zRYyVpHrhVwesRzQdcD2VWBraaD8XUJTnS7ngy7BSkdswxbd4vsGEVCf6nEdLf2Qtt4Y?cluster=devnet) · [выплата](https://explorer.solana.com/tx/4uk5unBu9H7PyMf53hstkpMsMZgE15xxxMmPL8TZ6VpNLrJnzWwjrAcFHePfrD4wEV3iH1TYJJtHRHFJGEuT69Yw?cluster=devnet) (~1.4 с) |

#### E2E-набор

Набор [Playwright](https://playwright.dev) (17 тестов, [`e2e/dashboard.spec.ts`](./e2e/dashboard.spec.ts)) проходит по приложению в настоящем браузере Chromium так же, как это сделал бы судья. Кошелька в браузере нет, поэтому все подписи идут по симулированному пути и деньги не двигаются. В репозитории есть готовый [workflow GitHub Actions](./.github/workflows/e2e.yml).

| Набор | Что проверяется |
|---|---|
| **Дашборд и телеметрия** | Демо-предупреждение, KPI, точки маршрута Среднего коридора, оповещение о заторе в Актау, простой выбранного груза по данным оракула против триггера 72 ч. |
| **Web3-кошелёк (демо-режим)** | Меню кошельков Phantom / Solflare для Devnet и корректный переход к симулированным подписям. |
| **Фильтры грузов** | Фильтры In Transit / High Risk Delay / Escrow Triggered показывают нужные грузы. |
| **Жизненный цикл полиса** | Выпуск → блокировка залога → событие оракула → выплата (2 500 Demo USDC ≈ 1 250 000 eKZT); отказ триггера для груза с простоем меньше 72 ч; премия рассчитывается по ИИ-оценке риска. |
| **Автономная выплата** | Review settlement подтверждает выплату 2 500 Demo USDC и проводит её именно по грузу, выбранному в таблице; груз ниже порога выплату не получает. |
| **Caspian Risk Vault** | Депозит Demo USDC обновляет долю; суммы больше баланса отклоняются. |
| **Журнал cNFT** | Каждое событие полиса записывается как сжатая контрольная точка Merkle (лист + корень). |
| **Эскроу-программа** | Панель полиса ссылается на развёрнутую в Devnet программу и показывает её живой статус. |

Запуск:

```bash
npx playwright install chromium   # один раз скачать браузер
npm run test:e2e                  # на локальном dev-сервере (запускается автоматически)
npm run test:e2e:live             # на живом приложении silksol.datariglab.kz
```

### 📚 Документация и спецификации

- **[Архитектура](./docs/ARCHITECTURE.md)** — устройство системы, потоки данных, граница между блокчейном и офчейном.
- **[Спецификация смарт-контракта](./docs/CONTRACT_SPECS.md)** — аккаунты, инструкции и логика триггера эскроу-программы.
- **[Заметки о песочнице AIFC](./docs/AIFC_SANDBOX.md)** — концепция вывода в eKZT в регуляторной песочнице AIFC.
- **[Презентация (PDF)](https://drive.google.com/file/d/1-UWk83wW0HsOWty91211pTQNe-KJoIfA/view?usp=sharing)** — питч-дек на Google Drive.

### 📊 Рынок, источники и позиционирование

**Источники рыночных данных.** Цифры по коридору в презентации (и оценка TAM / SAM / SOM на их основе) взяты из открытых источников:

- **Всемирный банк**, *Integration: World-Class Trade Logistics Along the Trans-Caspian Transport Corridor* (28 сентября 2026): инвестиции могут более чем утроить объёмы коридора и вдвое сократить время в пути к 2040 году; главное узкое место — задержки в портах и на границах. [Пресс-релиз](https://www.worldbank.org/en/news/press-release/2026/09/28/trans-caspian-transport-corridor-investments-spur-growth-and-create-millions-jobs)
- Ценовое агентство **Argus** (сентябрь 2026): Сиань → Тбилиси/Поти **$6 900–7 200 за 40HC**, Сиань → Алят/Баку $6 750–7 200 за 40HC. [Обзор Trend.az](https://www.trend.az/casia/kazakhstan/4229949.html)
- **ТМТМ / Министерство транспорта РК**: объём перевозок по Среднему коридору вырос с 0,8 до **~4,5 млн тонн в год**. [The Times of Central Asia](https://timesca.com/middle-corridor-must-get-faster-titr-chief-tells-tca/)

**Глобальные Web3-бенчмарки.** Параметрическое страхование в блокчейне уже работает в других отраслях: **Etherisc** (задержки авиарейсов и агрориски), **Arbol** (погодные параметрические покрытия), **Nayms** (регулируемый on-chain рынок страхования). SilkSol AI применяет ту же модель к коридору, который никто не покрывает: простои в каспийских портах (Актау, Курык, Баку), с расчётами через МФЦА / eKZT.

**Бизнес-модель и страховой капитал.**
- **Кто платит:** экспедиторы и грузоотправители платят премию за каждый груз, её размер зависит от оценки риска.
- **Кто несёт риск:** в продакшене эскроу-хранилища финансирует лицензированный страховщик-партнёр (цель — регуляторная песочница МФЦА). SilkSol AI — технологический слой: оценка риска, оракул и выплаты в блокчейне.
- **Caspian Risk Vault:** хранилище ликвидности в dApp (TVL, APY) — симуляция концепции следующей фазы, только для квалифицированных инвесторов по правилам МФЦА.

**Известные ограничения MVP.**
- Страховщик и оракул — один подписант (серверная функция). Оракул с несколькими подписантами есть в дорожной карте.
- В хранилище пока нет `coverage_end`, поэтому страховщик может закрыть несработавшее хранилище до конца срока покрытия. План: запретить `close_vault` до окончания покрытия.
- Простой симулирован для каждого демо-груза (#JOL-8921 96 ч, #KZL-4107 110 ч, #MCC-2048 6 ч, #TRK-7782 18 ч). Оракул берёт эти данные на сервере; браузер не может их подменить.
- Выплаты идут в Devnet SOL вместо USDC; журнал cNFT и конвертация в eKZT симулируются.
- У демо-страховщика есть лимиты (на кошелёк, плюс всего 10 выплат в час и 40 в день), чтобы казна в Devnet не опустела.

### 🗺 Дорожная карта: от MVP в Devnet к продакшену

| | Сейчас (MVP в Devnet) | Дальше | Продакшен |
|---|---|---|---|
| **Эскроу** | ✅ Anchor-программа работает в Devnet, 11 тестов программы | Ревью безопасности и аудит | Развёртывание в Mainnet |
| **Валюта выплат** | ✅ Devnet SOL вместо USDC | Эскроу-хранилища в SPL USDC | Двойные расчёты USDC + eKZT (песочница AIFC) |
| **Оракул** | ✅ Один подписант-страховщик (серверная функция) | Телеметрия портов и железной дороги (Актау, Баку) | Несколько подписантов / децентрализованная сеть оракулов |
| **Журнал аудита** | 🟡 Журнал cNFT симулируется | Настоящий State Compression (Bubblegum) | Каждое событие груза записывается как cNFT |
| **Оценка риска** | 🟡 Скоринг по правилам на симулированной телеметрии | Исторические данные о простоях от операторов-партнёров | Обученная модель рассчитывает премии в реальном времени |
| **Регулирование** | 📄 Концепция песочницы AIFC | Заявка в песочницу AIFC | Партнёр — лицензированный страховщик |

✅ работает · 🟡 симуляция · 📄 в планах

**План модели риска.** Обученной модели пока нет: открытого набора данных о простоях на Транскаспийском маршруте не существует. Обучение начнётся, когда операторы-партнёры предоставят 12–24 месяца истории событий в портах и на железной дороге (время прибытия и отправления, длина очереди, погода, сезон, тип груза). Для таких табличных данных базовый подход — градиентный бустинг деревьев (например, LightGBM или XGBoost) с проверкой на временных срезах, чтобы модель всегда тестировалась на будущих отправках. Окончательный выбор зависит от данных. Модель только рассчитывает премии; выплаты остаются детерминированным правилом в блокчейне (`dwell_time > threshold`).

### ⚠️ Статус MVP и интеллектуальная собственность

- **Данные и телеметрия MVP:** этот публичный репозиторий — интерактивный MVP для хакатона. Вся телеметрия, метрики рисков и события оракула основаны на синтетических/симулированных данных, чтобы показать автоматический процесс без реальных датчиков.
- **Детерминированные триггеры:** ИИ/ML отвечает за предиктивную оценку риска; решение о выплате принимает смарт-контракт по строгому правилу (`dwell_time > threshold`).
- **Защита ИС:** логика скоринга риска для продакшена и параметры будущих моделей останутся конфиденциальными активами DataRigLab / SilkSol AI. В этом публичном MVP используется упрощённый скоринг по правилам на симулированных данных (см. дорожную карту выше).
- **Регуляторная дорожная карта:** интеграция eKZT / цифрового тенге — структурное предложение для будущего тестирования в регуляторной песочнице AIFC.

### 🚀 Локальный запуск

**Требования:** Node.js (v18+), npm / yarn / pnpm.

1. **Клонировать репозиторий:**
   ```bash
   git clone https://github.com/s0nakh/silksol-ai.git
   cd silksol-ai
   ```
2. **Установить зависимости:**
   ```bash
   npm install
   ```
3. **Настроить переменные окружения:**
   ```bash
   cp .env.example .env
   # VITE_INSURER_URL указывает на функцию страховщика/оракула в Netlify (oracle/).
   # Секрет казны хранится только в Netlify и никогда не попадает в git.
   ```
4. **Запустить локальный сервер:**
   ```bash
   npm run dev
   ```
5. **(Необязательно) Развернуть своего страховщика/оракула** — бесплатная функция Netlify в [`oracle/`](./oracle):
   ```bash
   cd oracle && netlify sites:create --name <your-oracle>
   netlify env:set SILKSOL_TREASURY_SECRET "$(cat <devnet-treasury-keypair>.json)"
   ./build.sh && netlify deploy --prod --no-build --dir public --functions dist-functions
   ```

---

### 📜 Лицензия и авторские права

Copyright © 2026 **SilkSol AI / s0nakh**. Все права защищены.
*Опубликовано для демонстрации и оценки на хакатоне Solana Colosseum Frontier.*

---

## 🇰🇿 Қазақша

<p align="center"><em>Solana-дағы Орта дәліз (ТХКБ) логистикасына арналған болжамды тәуекел талдауы және параметрлік төлем хаттамасы</em></p>

[🌐 Қосымша](https://silksol.datariglab.kz/) · [🎥 Демо-бейне](https://www.loom.com/share/16e3dec8fe1f4a1488efa34fc906ea41) · [🎤 Питч-бейне](https://www.loom.com/share/7a5fc765245d46a6aed6e34b6acee973) · [📊 Презентация (PDF)](https://drive.google.com/file/d/1-UWk83wW0HsOWty91211pTQNe-KJoIfA/view?usp=sharing) · [📚 Құжаттама](./docs/ARCHITECTURE.md)

### 💡 Қысқаша сипаттама

SilkSol AI — телеметрияға негізделген тәуекел талдауын Solana-ның автоматты смарт-келісімшарттарымен біріктіретін B2B қосымшасының (dApp) MVP нұсқасы. Ол Транскаспий халықаралық көлік бағытында (ТХКБ / Орта дәліз) жүк кешігуінің өтемін лезде төлеуге және дауларды шешуге болатынын көрсетеді.

Жеткізу тізбегіндегі дәстүрлі сақтандыру төлемдері қолмен жүргізілетін құжаттар мен даулардың салдарынан 60–90+ күнге созылады. SilkSol AI тексерілген телеметрия деректері Solana-ның кастодиалды емес эскроу қоймалары арқылы қатаң ережеге негізделген USDC төлемдерін қалай автоматты түрде іске қосатынын көрсетеді. Шешім болашақта AIFC (АХҚО) реттеушілік құмсалғышында жұмыс істеу үшін eKZT (цифрлық теңге) арқылы екі валюталы есеп айырысу қабатына бастан есептелген.

### 🧑‍⚖️ 2 минутта байқап көріңіз (төрешілерге)

1. [Phantom](https://phantom.com) әмиянын орнатыңыз → **Settings → Developer Settings → Testnet Mode → Solana Devnet**.
2. [faucet.solana.com](https://faucet.solana.com) сайтынан тегін Devnet SOL алыңыз (тек 5-қадамға керек; 4-қадамдағы төлем сізге ештеңе тұрмайды).
3. [Қосымшаны](https://silksol.datariglab.kz/) ашыңыз → **Connect wallet → Phantom**.
4. **Autonomous settlement** блогына дейін төмен түсіп, **Review settlement** батырмасын басыңыз. Ешнәрсеге қол қоюдың қажеті жоқ: SilkSol AI сақтандырушысы сақтандыру жағдайын блокчейнде жүргізеді, бірнеше секундтан кейін **әмияныңызға +0.01 Devnet SOL түседі**. `tx:` сілтемесі транзакцияны Solana Explorer-де Memo белгісімен бірге ашады: `SilkSol AI | Parametric payout | Cargo #JOL-8921 | Delay 96h > 72h | …`. Енді **#TRK-7782** жүгін (тұрып қалу 18 сағат) таңдап, **Review settlement** батырмасын қайта басыңыз: эскроу бағдарламасы төлемнен **бас тартады** (`NotEligible`), ақша жіберілмейді.
5. Толық цикл — **Parametric policy & claim engine** панелінде: **Issue Parametric Policy** (0.001 SOL сыйлықақыға қол қоясыз) → **Lock Collateral & Sign** (сақтандырушы сіз үшін эскроу қоймасында 0.01 SOL бұғаттайды) → **Trigger Oracle Event** (оракул осы жүктің тұрып қалу уақытын хабарлайды; бағдарлама ол 72 сағаттан асса ғана төлейді).

> Әмиянсыз да бәрі жұмыс істейді — демо-режимде, симуляция екені анық белгіленген транзакциялармен.

### 🏗 Жүйе архитектурасы

```text
 [IoT датчиктері / GPS трекерлер / т/ж телеметриясы]
                        │  (Симуляцияланған телеметрия API / вебхуктар)
                        ▼
 ╔═════════════════════════════════════════════════════════╗
 ║ 1. Болжамды тәуекел қозғалтқышы (талдау және скоринг)   ║
 ║  • Динамикалық тәуекел индексі және кешігу болжамы      ║
 ╚═════════════════════════════════════════════════════════╝
                        │  (Тәуекел бағасы / қол қойылған деректер)
                        ▼
 ╔═════════════════════════════════════════════════════════╗
 ║ 2. Solana блокчейн қабаты (Devnet келісімшарттары)      ║
 ║  • Сығылған NFT (cNFT): өзгермейтін тасымал журналдары  ║
 ║  • Эскроу қоймасы: USDC-дегі автоматты кепіл            ║
 ║  • Детерминирленген төлем: параметрлік триггер          ║
 ║  • eKZT абстракциясы: AIFC құмсалғышы тұжырымы          ║
 ╚═════════════════════════════════════════════════════════╝
                        │  (Web3 әмиян RPC / бағдарлама логтары)
                        ▼
 ╔═════════════════════════════════════════════════════════╗
 ║ 3. Корпоративтік дашборд (React / Tailwind)             ║
 ║  • Контейнерлерді бақылау және интерактивті карта       ║
 ║  • Екі валюталы эскроу және төлем журналдары            ║
 ╚═════════════════════════════════════════════════════════╝
```

### ✨ Негізгі мүмкіндіктер

- **Мәртебе және тәуекел индексі:** Каспий порттарындағы (Ақтау/Құрық) және аймақтық хабтардағы транзит нүктелерін бақылау.
- **Күйді сығу (cNFT):** жеткізу тізбегінің аудит журналдарын Solana-да арзан сақтау.
- **Параметрлік эскроу прототипі:** кешігу шегінен асқаны расталғанда USDC-мен автоматты төлем (`dwell_time > threshold`).
- **Реттеушілік құмсалғыш арқылы шығу:** AIFC құмсалғышымен интеграцияға арналған eKZT (цифрлық теңге) есеп айырысу тұжырымдамасы.
- **Қағазсыз:** оқиғаға негізделген лезде, ашық және тексерілетін төлем.

### ⛓ Блокчейндегі эскроу бағдарламасы (Devnet)

Параметрлік өзек Solana-да [`silksol_escrow`](./anchor/programs/silksol_escrow/src/lib.rs) Anchor бағдарламасы ретінде жұмыс істейді — бағдарлама ID [`Gu7gKXNn…Ar9Z`](https://explorer.solana.com/address/Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z?cluster=devnet).

`initialize_vault` → `submit_telemetry` → `evaluate_trigger` (`dwell_time > threshold`) → `settle_payout` → `close_vault`

Devnet-те Phantom/Solflare қосылғанда рөлдер нақты жұмыстағыдай бөлінеді: **SilkSol AI сақтандырушысының қазынасы** ([`LxtEpBFN…mv7C`](https://explorer.solana.com/address/LxtEpBFNvEEBmESNA6ExiYHdrdZCfNGkCbndLVimv7C?cluster=devnet)) кепілді бұғаттайды және оракул деректеріне [серверлік функцияда](./oracle/netlify/functions/insurer.mts) қол қояды, ал **қосылған әмиян — төлемді алушы (beneficiary)** (USDC орнына 0.01 Devnet SOL). Әр транзакцияда SPL **Memo** бар (`SilkSol AI | Parametric payout | Cargo #… | Delay 96h > 72h | Policy … | Report sha256:…`), сондықтан Explorer-де операцияның мәні бірден көрінеді. cNFT журналы мен eKZT айырбасы әзірге симуляция. Сипаттама: [CONTRACT_SPECS.md](./docs/CONTRACT_SPECS.md).

```bash
cd anchor && anchor build
solana-test-validator --reset --bpf-program Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z target/deploy/silksol_escrow.so &
node --test --experimental-strip-types tests/*.test.ts   # 11 program tests
```

### 🛠 Технологиялар

- **Блокчейн:** Solana Devnet, Anchor 1.2 эскроу бағдарламасы (Rust), сығылған NFT (cNFT / State Compression, симуляция)
- **Токендер және эскроу:** SPL-Token / Demo USDC, eKZT есеп айырысу абстракциясы
- **Тәуекел қозғалтқышы:** болжамды скоринг логикасы және параметрлік оракул симуляторы
- **Фронтенд және UI:** React, TypeScript, Tailwind CSS, Recharts
- **Web3 интеграциясы:** `@solana/web3.js`, `@solana/wallet-adapter-react`
- **Сақтандырушы/оракул:** Netlify серверсіз функциясы ([`oracle/`](./oracle))

### 🧪 Тестілеу және E2E тексеру

#### ✅ Тексеру мәртебесі — бәрі жасыл (2026 жылғы 3 қазан)

| Тексеру | Нәтиже |
|---|---|
| Solana бағдарламасының тесттері (жергілікті валидатор, [`anchor/tests`](./anchor/tests/silksol_escrow.test.ts)) | **11 / 11 өтті** |
| Жергілікті құрастырмадағы E2E жиынтығы | **17 / 17 өтті** |
| Тірі қосымшадағы E2E жиынтығы ([silksol.datariglab.kz](https://silksol.datariglab.kz/)) | **15 / 15 өтті** |
| Продакшн құрастырма және TypeScript типтерін тексеру | **Өтті** |
| Бағдарлама Devnet-ке орналастырылған | ✅ [`Gu7gKXNn…Ar9Z`](https://explorer.solana.com/address/Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z?cluster=devnet) |
| Сақтандырушының пайдаланушы әмиянына Memo-мен төлемі (Review settlement) | ✅ [төлем транзакциясы](https://explorer.solana.com/tx/2vUaDDr7ehwxDoUSt7ohVgRvgcwFrDLN5ReDnq9n9y9mdh8SSmT9yd3eeYfCP2HRWdR1zYzPoopfM6ua28UhB945?cluster=devnet) (алушыға +0.01 SOL) |
| Тірі сақтандырушы/оракул ([silksol-oracle.netlify.app](https://silksol-oracle.netlify.app)) → төлем | ✅ [төлем транзакциясы](https://explorer.solana.com/tx/qJoAoc2tsSGD4PtPXNW9h6xAQ4cnUWVo2miE3a6TXnnhG5SYLHBFJtcrwjYBE82kaawtYs7XGRBVMCKLD5smFvA?cluster=devnet) |
| Devnet-тегі толық цикл: кепіл → триггер → төлем (өз есебінен) | ✅ [кепіл](https://explorer.solana.com/tx/381KwL25F1QTCsYsdCm6zRYyVpHrhVwesRzQdcD2VWBraaD8XUJTnS7ngy7BSkdswxbd4vsGEVCf6nEdLf2Qtt4Y?cluster=devnet) · [төлем](https://explorer.solana.com/tx/4uk5unBu9H7PyMf53hstkpMsMZgE15xxxMmPL8TZ6VpNLrJnzWwjrAcFHePfrD4wEV3iH1TYJJtHRHFJGEuT69Yw?cluster=devnet) (~1.4 с) |

#### E2E жиынтығы

[Playwright](https://playwright.dev) жиынтығы (17 тест, [`e2e/dashboard.spec.ts`](./e2e/dashboard.spec.ts)) қосымшаны нақты Chromium браузерінде төреші сияқты тексереді. Браузерде әмиян жоқ, сондықтан барлық қолтаңбалар симуляция жолымен жүреді және ақша қозғалмайды. Репозиторийде дайын [GitHub Actions workflow](./.github/workflows/e2e.yml) бар.

| Жиынтық | Не тексеріледі |
|---|---|
| **Дашборд және телеметрия** | Демо-ескерту, KPI, Орта дәліз бағытының нүктелері, Ақтаудағы кептеліс туралы хабарлама, таңдалған жүктің оракул деректері бойынша тұрып қалу уақыты мен 72 сағаттық триггер. |
| **Web3 әмиян (демо-режим)** | Devnet-ке арналған Phantom / Solflare әмиян мәзірі және симуляцияланған қолтаңбаға дұрыс ауысу. |
| **Жүк сүзгілері** | In Transit / High Risk Delay / Escrow Triggered сүзгілері қажетті жүктерді көрсетеді. |
| **Полистің өмірлік циклі** | Шығару → кепілді бұғаттау → оракул оқиғасы → төлем (2 500 Demo USDC ≈ 1 250 000 eKZT); тұрып қалуы 72 сағаттан аз жүк үшін триггер бас тартады; сыйлықақы ЖИ тәуекел бағасы бойынша есептеледі. |
| **Автономды төлем** | Review settlement 2 500 Demo USDC төлемін растайды және оны кестеде таңдалған жүк бойынша жүргізеді; шектен төмен жүк төлем алмайды. |
| **Caspian Risk Vault** | Demo USDC депозиті үлесті жаңартады; балансынан асатын сомалар қабылданбайды. |
| **cNFT журналы** | Полистің әр оқиғасы сығылған Merkle бақылау нүктесі (жапырақ + түбір) ретінде жазылады. |
| **Эскроу бағдарламасы** | Полис панелі Devnet-тегі бағдарламаға сілтеме береді және оның тірі мәртебесін көрсетеді. |

Іске қосу:

```bash
npx playwright install chromium   # браузерді бір рет жүктеу
npm run test:e2e                  # жергілікті dev-серверде (автоматты түрде іске қосылады)
npm run test:e2e:live             # тірі қосымшада silksol.datariglab.kz
```

### 📚 Құжаттама және сипаттамалар

- **[Архитектура](./docs/ARCHITECTURE.md)** — жүйе құрылымы, деректер ағыны, блокчейн мен офчейн арасындағы шекара.
- **[Смарт-келісімшарт сипаттамасы](./docs/CONTRACT_SPECS.md)** — эскроу бағдарламасының аккаунттары, нұсқаулықтары және триггер логикасы.
- **[AIFC құмсалғышы туралы жазбалар](./docs/AIFC_SANDBOX.md)** — AIFC реттеушілік құмсалғышында eKZT арқылы шығу тұжырымдамасы.
- **[Презентация (PDF)](https://drive.google.com/file/d/1-UWk83wW0HsOWty91211pTQNe-KJoIfA/view?usp=sharing)** — Google Drive-тағы питч-дек.

### 📊 Нарық, дереккөздер және позициялау

**Нарық деректерінің дереккөздері.** Презентациядағы дәліз көрсеткіштері (және солардың негізіндегі TAM / SAM / SOM бағасы) ашық дереккөздерден алынған:

- **Дүниежүзілік банк**, *Integration: World-Class Trade Logistics Along the Trans-Caspian Transport Corridor* (2026 жылғы 28 қыркүйек): инвестициялар 2040 жылға қарай дәліз көлемін үш еседен астам арттырып, жол уақытын екі есе қысқартуы мүмкін; басты кедергі — порттар мен шекаралардағы кідірістер. [Баспасөз релизі](https://www.worldbank.org/en/news/press-release/2026/09/28/trans-caspian-transport-corridor-investments-spur-growth-and-create-millions-jobs)
- **Argus** баға агенттігі (2026 жылғы қыркүйек): Сиань → Тбилиси/Поти **40HC үшін $6 900–7 200**, Сиань → Әлят/Баку 40HC үшін $6 750–7 200. [Trend.az шолуы](https://www.trend.az/casia/kazakhstan/4229949.html)
- **ТХКБ / ҚР Көлік министрлігі**: Орта дәліз бойынша тасымал көлемі жылына 0,8-ден **~4,5 млн тоннаға** дейін өсті. [The Times of Central Asia](https://timesca.com/middle-corridor-must-get-faster-titr-chief-tells-tca/)

**Жаһандық Web3 бенчмарктері.** Блокчейндегі параметрлік сақтандыру басқа салаларда жұмыс істеп тұр: **Etherisc** (рейс кешігуі және агротәуекелдер), **Arbol** (ауа райына байланысты параметрлік өтелім), **Nayms** (реттелетін on-chain сақтандыру нарығы). SilkSol AI осы модельді ешкім қамтымаған дәлізге қолданады: Каспий порттарындағы тұрып қалу (Ақтау, Құрық, Баку), есеп айырысу AIFC / eKZT арқылы.

**Бизнес-модель және сақтандыру капиталы.**
- **Кім төлейді:** экспедиторлар мен жүк жөнелтушілер әр жүк үшін сыйлықақы төлейді, оның мөлшері тәуекел бағасына байланысты.
- **Тәуекелді кім көтереді:** өндірісте эскроу қоймаларын лицензиясы бар серіктес сақтандырушы қаржыландырады (мақсат — AIFC реттеушілік құмсалғышы). SilkSol AI — технологиялық қабат: тәуекелді бағалау, оракул және блокчейндегі төлемдер.
- **Caspian Risk Vault:** dApp-тағы өтімділік қоймасы (TVL, APY) — келесі кезең тұжырымдамасының симуляциясы, тек AIFC ережелері бойынша білікті инвесторларға арналған.

**MVP-дің белгілі шектеулері.**
- Сақтандырушы мен оракул — бір қол қоюшы (серверлік функция). Бірнеше қол қоюшысы бар оракул жол картасында бар.
- Қоймада әзірге `coverage_end` жоқ, сондықтан сақтандырушы іске қосылмаған қойманы өтелім мерзімі біткенге дейін жаба алады. Жоспар: өтелім аяқталғанға дейін `close_vault` тыйым салу.
- Тұрып қалу уақыты әр демо-жүк үшін симуляцияланған (#JOL-8921 96 сағ, #KZL-4107 110 сағ, #MCC-2048 6 сағ, #TRK-7782 18 сағ). Оракул бұл деректерді серверде алады; браузер оларды өзгерте алмайды.
- Төлемдер USDC орнына Devnet SOL-мен жүреді; cNFT журналы және eKZT айырбасы симуляцияланған.
- Демо-сақтандырушыда шектеулер бар (әр әмиянға, сондай-ақ жалпы сағатына 10 және тәулігіне 40 төлем), Devnet қазынасы таусылмауы үшін.

### 🗺 Жол картасы: Devnet MVP-ден өндіріске дейін

| | Қазір (Devnet MVP) | Келесі қадам | Өндіріс |
|---|---|---|---|
| **Эскроу** | ✅ Anchor бағдарламасы Devnet-те жұмыс істейді, бағдарламаның 11 тесті | Қауіпсіздік шолуы және аудит | Mainnet-ке орналастыру |
| **Төлем валютасы** | ✅ USDC орнына Devnet SOL | SPL USDC эскроу қоймалары | USDC + eKZT қос есеп айырысу (AIFC құмсалғышы) |
| **Оракул** | ✅ Бір сақтандырушы-қол қоюшы (серверлік функция) | Порт пен теміржол телеметриясы (Ақтау, Баку) | Бірнеше қол қоюшы / орталықсыздандырылған оракул желісі |
| **Аудит журналы** | 🟡 cNFT журналы симуляция | Нақты State Compression (Bubblegum) | Жүктің әр оқиғасы cNFT ретінде жазылады |
| **Тәуекелді бағалау** | 🟡 Симуляцияланған телеметрия бойынша ережеге негізделген скоринг | Серіктес операторлардан тұрып қалу уақытының тарихи деректері | Оқытылған модель сыйлықақыны нақты уақытта есептейді |
| **Реттеу** | 📄 AIFC құмсалғышы тұжырымдамасы | AIFC құмсалғышына өтінім | Серіктес — лицензиясы бар сақтандырушы |

✅ жұмыс істейді · 🟡 симуляция · 📄 жоспарда

**Тәуекел моделінің жоспары.** Оқытылған модель әзірге жоқ: Транскаспий бағыты бойынша тұрып қалу уақытының ашық деректер жиыны жоқ. Оқыту серіктес операторлар порттар мен теміржолдағы оқиғалардың 12–24 айлық тарихын (келу және кету уақыты, кезек ұзындығы, ауа райы, маусым, жүк түрі) бергенде басталады. Мұндай кестелік деректер үшін базалық тәсіл — шешім ағаштарының градиенттік бустингі (мысалы, LightGBM немесе XGBoost), модель әрқашан болашақ жөнелтімдерде тексерілуі үшін уақыт бойынша бөліп тексеріледі. Соңғы таңдау деректерге байланысты. Модель тек сыйлықақыны есептейді; төлемдер блокчейндегі детерминирленген ереже болып қалады (`dwell_time > threshold`).

### ⚠️ MVP мәртебесі және зияткерлік меншік

- **MVP деректері мен телеметриясы:** бұл ашық репозиторий — хакатонға арналған интерактивті MVP. Барлық телеметрия, тәуекел көрсеткіштері мен оракул оқиғалары нақты датчиктерсіз автоматты процесті көрсету үшін синтетикалық/симуляцияланған деректерге негізделген.
- **Детерминирленген триггерлер:** ЖИ/ML болжамды тәуекел бағасына жауап береді; төлем туралы шешімді смарт-келісімшарт қатаң ереже бойынша қабылдайды (`dwell_time > threshold`).
- **ЗМ қорғау:** өндірістік тәуекел скорингінің логикасы мен болашақ модельдердің параметрлері DataRigLab / SilkSol AI-дың құпия активтері болып қалады. Бұл ашық MVP симуляцияланған деректер бойынша ережеге негізделген жеңілдетілген скорингті қолданады (жоғарыдағы жол картасын қараңыз).
- **Реттеушілік жол картасы:** eKZT / цифрлық теңге интеграциясы — AIFC реттеушілік құмсалғышында болашақта сынауға арналған құрылымдық ұсыныс.

### 🚀 Жергілікті іске қосу

**Талаптар:** Node.js (v18+), npm / yarn / pnpm.

1. **Репозиторийді клондау:**
   ```bash
   git clone https://github.com/s0nakh/silksol-ai.git
   cd silksol-ai
   ```
2. **Тәуелділіктерді орнату:**
   ```bash
   npm install
   ```
3. **Орта айнымалыларын баптау:**
   ```bash
   cp .env.example .env
   # VITE_INSURER_URL Netlify-дағы сақтандырушы/оракул функциясына сілтейді (oracle/).
   # Қазына құпиясы тек Netlify-да сақталады және ешқашан git-ке түспейді.
   ```
4. **Жергілікті серверді іске қосу:**
   ```bash
   npm run dev
   ```
5. **(Міндетті емес) Өз сақтандырушыңызды/оракулыңызды орналастыру** — [`oracle/`](./oracle) ішіндегі тегін Netlify функциясы:
   ```bash
   cd oracle && netlify sites:create --name <your-oracle>
   netlify env:set SILKSOL_TREASURY_SECRET "$(cat <devnet-treasury-keypair>.json)"
   ./build.sh && netlify deploy --prod --no-build --dir public --functions dist-functions
   ```

---

### 📜 Лицензия және авторлық құқық

Copyright © 2026 **SilkSol AI / s0nakh**. Барлық құқықтар қорғалған.
*Solana Colosseum Frontier хакатонында көрсету және бағалау үшін жарияланды.*

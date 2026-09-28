# SilkSol AI Dashboard

Create a high-end, premium B2B Web3 analytics dashboard for "SilkSolAI" - a predictive supply chain risk platform built on Solana for the Middle Corridor (Kazakhstan logistics).

Design System & Aesthetic:

- Dark Mode Luxury Theme: Deep obsidian background (#0D0F17), frosted glassmorphism containers (backdrop-blur), glowing neon gradients combining Solana Purple (#9945FF) and Emerald Green (#14F195).

- Typography & UI: Clean sans-serif (Inter/Plus Jakarta Sans), crisp icons (Lucide-react), status pills, and high-tech metric cards.

Key Pages & Dashboard Components:

1. Header / Navigation:

   - Logo: "SilkSol AI" with glowing Solana badge.

   - Live Network Status Indicator: "Solana Mainnet | 2,400 TPS | Avg Fee $0.00025".

   - Wallet Connect button ("Phantom / Solflare Connected: 0x...4F8A").

2. Key Metrics Row (KPIs):

   - "Active Cargoes Monitored": 1,248 containers.

   - "Predictive Risk Index": 14.2% (Low Risk).

   - "On-Chain Escrow Locked": $4,250,000 USDC.

   - "Automated Instant Payouts": 142 ($380K USDC).

3. Main Interactive Panel (Middle Corridor Route Map & Tracker):

   - Interactive route pipeline: Lianyungang (China) -> Khorgos (Kazakhstan) -> Aktau Port -> Baku (Azerbaijan) -> Istanbul (Turkey).

   - Cargo List Table with status tags ("In Transit", "High Risk Delay", "Escrow Triggered").

4. Predictive ML Risk Module (Visual Panel):

   - Risk prediction graph (recharts) showing delay probability curve for Container #JOL-8921.

   - Real-time IoT sensor logs (Temperature, Speed, Terminal Dwell Time).

5. On-Chain Settlement Card:

   - Visual Smart Contract Trigger: When delay exceeds threshold (e.g. >18 hrs at Aktau Port), show an animated "Automated On-Chain Compensation Triggered -> 2,500 USDC sent via Solana".

   - Solana Explorer Transaction Hash link simulation (tx: 5K9x...7P2q).

Make the UI fully responsive, interactive, smooth, highly impressive, and ready for a hackathon judge demo.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://silksol-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/45adc526-9c8e-47a3-abdc-08d3856f0431).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

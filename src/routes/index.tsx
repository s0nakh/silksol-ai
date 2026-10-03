import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Box,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Container,
  ExternalLink,
  Gauge,
  Link2,
  MapPin,
  MoreHorizontal,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Thermometer,
  TrainFront,
  TrendingDown,
  TriangleAlert,
  WalletCards,
  Waves,
  Zap,
  Info,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tooltip as HintTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SolanaProviders } from "@/components/solana/SolanaProviders";
import { WalletButton } from "@/components/solana/WalletButton";
import { CaspianVault } from "@/components/solana/CaspianVault";
import { AuditDrawer, type AuditLog } from "@/components/solana/AuditDrawer";
import { PolicyEngine, premiumFor, type Policy } from "@/components/solana/PolicyEngine";
import { DemoTag, explorerTx, mockTxHash, shortHash } from "@/components/solana/DemoTag";
import { ekzt } from "@/components/solana/devnetTx";
import { insurerAction } from "@/lib/insurer.functions";
import { TRIGGER_THRESHOLD_HOURS, dwellHoursFor, triggerMet } from "@/components/solana/escrowProgram";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

const SITE_URL = "https://silksol.datariglab.kz";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SilkSol AI — Predictive Supply Chain Intelligence" },
      {
        name: "description",
        content:
          "Predictive risk monitoring, parametric cover and devnet settlements for Middle Corridor logistics (demo).",
      },
      { property: "og:title", content: "SilkSol AI — Corridor Intelligence" },
      {
        property: "og:description",
        content:
          "Parametric cargo delay cover for the Middle Corridor: an escrow contract on Solana Devnet pays when Caspian port dwell time exceeds 72 h.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "SilkSol AI" },
      { property: "og:url", content: SITE_URL },
      // Social preview card (Telegram, X, Discord, LinkedIn); must be an absolute URL.
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "SilkSol AI — parametric cargo delay cover for the Middle Corridor" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SilkSol AI — Corridor Intelligence" },
      {
        name: "twitter:description",
        content: "Parametric cargo delay cover for the Middle Corridor, settled on Solana Devnet.",
      },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
    ],
  }),
  component: () => (
    <SolanaProviders>
      <Dashboard />
    </SolanaProviders>
  ),
});

const emptyPolicy: Policy = { stage: "none", coverage: 2500, premium: 0 };

const riskData = [
  { time: "06:00", risk: 8 },
  { time: "08:00", risk: 10 },
  { time: "10:00", risk: 13 },
  { time: "12:00", risk: 18 },
  { time: "14:00", risk: 31 },
  { time: "16:00", risk: 47 },
  { time: "18:00", risk: 61 },
  { time: "20:00", risk: 68 },
  { time: "22:00", risk: 54 },
  { time: "00:00", risk: 39 },
];

const routeStops = [
  { city: "Lianyungang", country: "China", state: "complete" },
  { city: "Khorgos", country: "Kazakhstan", state: "complete" },
  { city: "Aktau Port", country: "Kazakhstan", state: "active" },
  { city: "Baku", country: "Azerbaijan", state: "pending" },
  { city: "Istanbul", country: "Turkey", state: "pending" },
];

type Cargo = {
  id: string;
  origin: string;
  destination: string;
  location: string;
  eta: string;
  status: "In Transit" | "High Risk Delay" | "Escrow Triggered";
  risk: number;
};

const cargoes: Cargo[] = [
  { id: "JOL-8921", origin: "Lianyungang", destination: "Istanbul", location: "Aktau Port", eta: "Sep 30, 18:40", status: "High Risk Delay", risk: 68 },
  { id: "MCC-2048", origin: "Xi’an", destination: "Baku", location: "Khorgos", eta: "Oct 01, 09:15", status: "In Transit", risk: 12 },
  { id: "KZL-4107", origin: "Lianyungang", destination: "Tbilisi", location: "Caspian Sea", eta: "Sep 29, 22:10", status: "Escrow Triggered", risk: 91 },
  { id: "TRK-7782", origin: "Almaty", destination: "Istanbul", location: "Baku Terminal", eta: "Oct 02, 14:30", status: "In Transit", risk: 7 },
];

const statusClass: Record<string, string> = {
  "In Transit": "status-transit",
  "High Risk Delay": "status-risk",
  "Escrow Triggered": "status-triggered",
};

const kpis = [
  { label: "Active cargoes", value: "1,248", detail: "containers monitored", change: "+8.4%", icon: Container, tone: "primary" },
  { label: "Predictive risk index", value: "14.2%", detail: "Low risk", change: "−2.1%", icon: ShieldCheck, tone: "success" },
  { label: "On-chain escrow", value: "$4.25M", detail: "USDC locked", change: "+$320K", icon: Link2, tone: "primary" },
  { label: "Instant payouts", value: "142", detail: "$380K USDC", change: "99.7%", icon: Zap, tone: "success" },
];

function Dashboard() {
  const [selectedCargo, setSelectedCargo] = useState<Cargo>(cargoes[0] ?? {
    id: "JOL-8921",
    origin: "Lianyungang",
    destination: "Istanbul",
    location: "Aktau Port",
    eta: "Sep 30, 18:40",
    status: "High Risk Delay",
    risk: 68,
  });
  const [filter, setFilter] = useState("All cargoes");
  const [settling, setSettling] = useState(false);
  const wallet = useWallet();
  const [policies, setPolicies] = useState<Record<string, Policy>>({});
  // Cargo whose claim the escrow contract refused (trigger not met) → reason shown in the table.
  const [refused, setRefused] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [walletUsdc, setWalletUsdc] = useState(10000);
  const [staked, setStaked] = useState(0);

  const policyOf = (id: string) => policies[id] ?? emptyPolicy;
  const logEvent = (id: string, event: string) =>
    setLogs((prev) => [
      ...prev,
      { id: prev.length + 1, time: new Date().toLocaleTimeString(), event, cargo: id, leaf: mockTxHash().slice(0, 44), root: mockTxHash().slice(0, 44) },
    ]);
  const updatePolicy = (id: string, p: Policy, event: string) => {
    // A simulated claim can be re-settled on-chain later; credit the demo USDC only once.
    if (p.stage === "paid" && policies[id]?.stage !== "paid") setWalletUsdc((w) => w + p.coverage);
    setPolicies((prev) => ({ ...prev, [id]: p }));
    logEvent(id, event);
  };

  // Policies and payouts belong to the connected wallet: on disconnect or account switch,
  // clear them and their notifications so the next wallet starts from a clean demo.
  const walletKey = wallet.publicKey?.toBase58() ?? null;
  const prevWalletKey = useRef(walletKey);
  useEffect(() => {
    const prev = prevWalletKey.current;
    prevWalletKey.current = walletKey;
    if (prev === null || prev === walletKey) return;
    toast.dismiss();
    setPolicies({});
    setRefused({});
    setWalletUsdc(10000);
  }, [walletKey]);

  // The settlement panel always acts on the cargo selected in the table.
  const selectedPolicy = policyOf(selectedCargo.id);
  const settled = selectedPolicy.stage === "paid";
  const settleOnChain = settled && !!selectedPolicy.onChain;
  const settleSig = settleOnChain ? selectedPolicy.tx : undefined;
  const dwell = dwellHoursFor(selectedCargo.id) ?? 0;
  const met = triggerMet(dwell);
  const markRefused = (cargoId: string, detail: string) => setRefused((prev) => ({ ...prev, [cargoId]: detail }));
  const refuse = (cargoId: string, detail: string) => {
    logEvent(cargoId, "Payout refused — trigger not met");
    markRefused(cargoId, detail);
    toast.error(`Trigger not met · cargo #${cargoId} — no payout`, { description: detail, duration: 10000 });
  };

  const reviewSettlement = async () => {
    const cargo = selectedCargo;
    const coverage = 2500;
    const paid = { stage: "paid" as const, coverage, premium: premiumFor(cargo.risk, coverage) };
    if (!met && !wallet.connected) {
      refuse(cargo.id, `Oracle reports dwell ${dwell}h ≤ ${TRIGGER_THRESHOLD_HOURS}h threshold — the escrow contract refuses this payout (Simulated).`);
      return;
    }
    if (!wallet.connected) {
      updatePolicy(cargo.id, { ...paid, tx: mockTxHash(), onChain: false, payoutMs: 0 }, "Settlement acknowledged (simulated)");
      toast.success(`Settlement acknowledged for cargo #${cargo.id} (Simulated)`, { description: `${coverage.toLocaleString()} Demo USDC · (or ${ekzt(coverage)} via AIFC Gateway)` });
      return;
    }
    if (!wallet.publicKey) return;
    setSettling(true);
    const start = performance.now();
    try {
      // The SilkSol insurer runs the whole claim on-chain and pays this wallet — no signature needed.
      const res = await insurerAction({
        data: { action: "instant", beneficiary: wallet.publicKey.toBase58(), cargoId: cargo.id, riskScore: cargo.risk },
      });
      if (!res.ok && res.reason === "trigger_not_met") {
        refuse(cargo.id, res.message);
        return;
      }
      if (!res.ok && res.reason === "not_configured") {
        updatePolicy(cargo.id, { ...paid, tx: mockTxHash(), onChain: false, payoutMs: 0 }, "Settlement acknowledged (simulated)");
        toast.success(`Settlement acknowledged for cargo #${cargo.id} (Simulated)`, { description: "Insurer treasury is offline — no on-chain payout was made." });
        return;
      }
      if (!res.ok) throw new Error(res.message);
      const ms = Math.round(performance.now() - start);
      updatePolicy(
        cargo.id,
        { ...paid, tx: res.signature, vault: res.vault, policyId: res.policyId, onChain: true, insurer: true, payoutMs: ms },
        "Parametric payout to wallet (on-chain)",
      );
      toast.success("+0.01 Devnet SOL received from SilkSol AI", {
        description: `Parametric payout for cargo #${cargo.id} · memo "${res.memo.split(" | Report")[0]}" · tx ${shortHash(res.signature)}`,
        action: { label: "Explorer", onClick: () => window.open(explorerTx(res.signature), "_blank") },
        duration: 15000,
      });
    } catch (e) {
      toast.error("Devnet payout failed", { description: e instanceof Error ? e.message : "Please retry in a few seconds." });
    } finally {
      setSettling(false);
    }
  };

  const visibleCargoes = useMemo(
    () => filter === "All cargoes" ? cargoes : cargoes.filter((cargo) => cargo.status === filter),
    [filter],
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b border-warning/30 bg-warning/10 px-4 py-1.5 text-center text-[11px] text-warning">Demo environment — balances, metrics, feeds and transactions are simulated or on Solana Devnet. No real funds.</div>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="solana-mark" aria-hidden="true"><span /><span /><span /></div>
            <div className="whitespace-nowrap text-[17px] font-bold tracking-normal">SilkSol <span className="text-gradient">AI</span></div>
          </div>
          <div className="hidden h-6 w-px bg-border lg:block" />
          <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-50" /><span className="relative inline-flex size-2 rounded-full bg-success" /></span>
            <span className="font-semibold text-foreground">Solana Devnet</span>
            <span>•</span><span>2,400 TPS</span><span>•</span><span>Avg Fee $0.00025</span><DemoTag kind="SIMULATED" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <AuditDrawer logs={logs} />
            <WalletButton demoUsdc={walletUsdc} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7">
        <section className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"><Radio className="size-3.5 text-success" /> Live operations / Middle Corridor</div>
            <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Corridor intelligence</h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">Predictive oversight across rail, port, and maritime handoffs — secured by Solana.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="size-3.5" /> Last sync 12 seconds ago</div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <article className="metric-card" key={kpi.label}>
                <div className="flex items-start justify-between">
                  <div className={`metric-icon ${kpi.tone === "success" ? "metric-icon-success" : ""}`}><Icon className="size-4" /></div>
                  <span className={kpi.change.startsWith("−") ? "text-xs font-semibold text-success" : "text-xs font-semibold text-primary"}>{kpi.change}</span>
                </div>
                <p className="mt-5 flex items-center gap-2 text-xs font-medium text-muted-foreground">{kpi.label}<DemoTag kind="DEMO DATA" /></p>
                <div className="mt-1 flex items-baseline gap-2"><strong className="text-2xl font-semibold tracking-normal">{kpi.value}</strong><span className="text-[11px] text-muted-foreground">{kpi.detail}</span></div>
              </article>
            );
          })}
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
          <div className="grid min-w-0 content-start gap-4">
          <div className="panel min-w-0 overflow-hidden">
            <PanelHeader icon={MapPin} eyebrow="Live route telemetry" title="Middle Corridor tracker" aside={<span className="flex items-center gap-2"><DemoTag kind="DEMO DATA" /><span className="status-pill status-transit"><Activity className="size-3" /> 18 signals</span></span>} />
            <div className="corridor-map">
              <div className="map-grid" />
              <div className="route-rail">
                {routeStops.map((stop, index) => (
                  <button key={stop.city} onClick={() => index === 2 && setSelectedCargo(cargoes[0] ?? selectedCargo)} className={`route-stop route-${stop.state}`} aria-label={`${stop.city}, ${stop.state}`}>
                    <span className="route-dot">{stop.state === "complete" ? <Check className="size-3" /> : index + 1}</span>
                    <span className="route-city">{stop.city}</span>
                    <span className="route-country">{stop.country}</span>
                  </button>
                ))}
              </div>
              <div className="map-event">
                <TriangleAlert className="size-4" />
                <div><strong>Congestion detected</strong><span>Aktau berth 4 · +21.6 hr dwell</span></div>
              </div>
              <div className="absolute bottom-4 left-5 flex items-center gap-2 text-[10px] text-muted-foreground"><Waves className="size-3.5 text-primary" /> TRANS-CASPIAN INTERNATIONAL ROUTE</div>
            </div>

            <div className="border-t border-border">
              <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
                <h3 className="text-sm font-semibold">Active cargoes</h3>
                <div className="flex gap-1 overflow-x-auto sm:ml-auto">
                  {["All cargoes", "In Transit", "High Risk Delay", "Escrow Triggered"].map((item) => (
                    <Button key={item} variant="ghost" onClick={() => setFilter(item)} className={`whitespace-nowrap px-2.5 py-1.5 text-[11px] ${filter === item ? "bg-accent text-foreground" : ""}`}>{item}</Button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead><tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground"><th>Cargo ID</th><th>Route</th><th>Location</th><th>ETA</th><th>Status</th><th>AI risk</th><th>Premium</th><th>Policy</th></tr></thead>
                  <tbody>
                    <TooltipProvider delayDuration={100}>
                    {visibleCargoes.map((cargo) => {
                      const p = policyOf(cargo.id);
                      return (
                      <tr key={cargo.id} onClick={() => setSelectedCargo(cargo)} className={selectedCargo.id === cargo.id ? "table-row-active" : ""}>
                        <td className="font-semibold text-foreground">#{cargo.id}</td>
                        <td><span className="text-foreground">{cargo.origin}</span><ChevronRight className="mx-1 inline size-3" />{cargo.destination}</td>
                        <td>{cargo.location}</td><td>{cargo.eta}</td>
                        <td>{p.stage === "paid" ? <span className="status-pill status-transit">Claim Paid Out (Demo USDC)</span> : <span className={`status-pill ${statusClass[cargo.status]}`}>{cargo.status}</span>}</td>
                        <td><span className={cargo.risk > 60 ? "font-semibold text-warning" : "font-semibold text-success"}>{cargo.risk}%</span></td>
                        <td className="whitespace-nowrap">{premiumFor(cargo.risk, 2500)} <span className="text-[10px]">USDC</span></td>
                        <td>
                          {refused[cargo.id] && p.stage !== "paid" ? (
                            <HintTooltip>
                              <TooltipTrigger asChild>
                                <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedCargo(cargo); }} className="status-pill status-ineligible gap-1 whitespace-nowrap">Not Eligible <Info className="size-3" /></button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs text-xs">{refused[cargo.id]}</TooltipContent>
                            </HintTooltip>
                          ) : p.stage === "none" ? (
                            <Button size="sm" variant="secondary" className="h-7 whitespace-nowrap px-2 text-[11px]" onClick={(e) => { e.stopPropagation(); setSelectedCargo(cargo); updatePolicy(cargo.id, { stage: "issued", coverage: 2500, premium: premiumFor(cargo.risk, 2500) }, "Policy issued"); }}>Issue Parametric Policy</Button>
                          ) : (
                            <span className="text-[11px] capitalize text-primary">{p.stage}</span>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                    </TooltipProvider>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <CaspianVault walletUsdc={walletUsdc} staked={staked} tvl={4_250_000 + staked} onChange={(d) => { setStaked((s) => s + d); setWalletUsdc((w) => w - d); }} />
              <div className="panel">
                <PanelHeader icon={Radio} eyebrow="Sensor network" title="Live IoT telemetry" aside={<DemoTag kind="SIMULATED" />} />
                <div className="grid grid-cols-3 divide-x divide-border px-2 py-5">
                  <Sensor icon={Thermometer} label="Temperature" value="4.2°C" note="Stable" />
                  <Sensor icon={Gauge} label="Speed" value="0 km/h" note="At terminal" />
                  <Sensor icon={Clock3} label={`Dwell · #${selectedCargo.id}`} value={`${dwell}h`} note={met ? `+${dwell - TRIGGER_THRESHOLD_HOURS}h over ${TRIGGER_THRESHOLD_HOURS}h` : `${TRIGGER_THRESHOLD_HOURS - dwell}h under ${TRIGGER_THRESHOLD_HOURS}h`} alert={met} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-4">
            <PolicyEngine cargoId={selectedCargo.id} risk={selectedCargo.risk} dwellHours={dwell} onRefused={(detail) => markRefused(selectedCargo.id, detail)} policy={policyOf(selectedCargo.id)} onUpdate={(p, e) => updatePolicy(selectedCargo.id, p, e)} />
            <div className="panel overflow-hidden">
              <PanelHeader icon={Sparkles} eyebrow="SilkSol prediction engine" title={`Delay risk · #${selectedCargo.id}`} aside={<span className="flex items-center gap-2"><DemoTag kind="SIMULATED" /><span className="text-xl font-semibold text-warning">{selectedCargo.risk}%</span></span>} />
              <div className="px-2 pb-2 pt-4 sm:px-4">
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={riskData} margin={{ top: 8, right: 14, left: -24, bottom: 0 }}>
                      <defs><linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-risk)" stopOpacity={0.42} /><stop offset="100%" stopColor="var(--chart-risk)" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "var(--chart-label)", fontSize: 10 }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--chart-label)", fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }} formatter={(value) => [`${value}%`, "Delay probability"]} />
                      <ReferenceLine y={50} stroke="var(--chart-warning)" strokeDasharray="4 4" label={{ value: "trigger", fill: "var(--chart-label)", fontSize: 9 }} />
                      <Area type="monotone" dataKey="risk" stroke="var(--chart-risk)" strokeWidth={2.5} fill="url(#riskFill)" isAnimationActive={false} activeDot={{ r: 5, fill: "var(--chart-risk)", stroke: "var(--background)", strokeWidth: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mx-2 mb-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground"><span>Predicted peak: <strong className="text-foreground">68% at 20:00</strong></span><span className="flex items-center gap-1 text-warning"><TrendingDown className="size-3" /> Recovery expected</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 panel settlement-panel overflow-hidden">
          <div className="relative grid gap-6 p-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:p-7">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary"><CircleDollarSign className="size-4" /> Autonomous settlement <DemoTag kind={settleOnChain ? "DEVNET" : "SIMULATED"} /></div>
              <h2 className="text-lg font-semibold">Smart contract trigger · #{selectedCargo.id}</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{met ? <>Oracle event for cargo #{selectedCargo.id} ({selectedCargo.location}): delay of {dwell} h exceeded the insured {TRIGGER_THRESHOLD_HOURS}-hour threshold.</> : <>Oracle reading for cargo #{selectedCargo.id} ({selectedCargo.location}): dwell of {dwell} h is within the insured {TRIGGER_THRESHOLD_HOURS}-hour threshold — the contract refuses a payout.</>} Select another cargo in the table to settle its policy.</p>
              <div className="mt-4 flex flex-wrap gap-2"><span className="condition-chip"><Clock3 className="size-3" /> Delay {dwell} h (simulated)</span><span className="condition-chip"><ShieldCheck className="size-3" /> Trigger &gt; {TRIGGER_THRESHOLD_HOURS} h · {met ? "met" : "not met"}</span></div>
            </div>
            <div className="hidden items-center gap-2 lg:flex"><div className="h-px w-12 bg-border" /><div className="flex size-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-glow"><Zap className="size-4" /></div><div className="h-px w-12 bg-border" /></div>
            <div className="settlement-result">
              <div className="flex items-start gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-md ${settled ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}>{settled ? <Check className="size-5" /> : <Zap className="size-5" />}</div>
                {!met && !settled ? <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Trigger not met</p><p className="mt-1 text-xl font-semibold">No payout owed</p><p className="mt-1 text-[11px] text-muted-foreground">Dwell {dwell} h ≤ {TRIGGER_THRESHOLD_HOURS} h. Review settlement to see the escrow contract refuse the claim{wallet.connected ? " (checked against the Devnet program, nothing is sent)" : ""}.</p></div> :
                <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-success">{settled ? "Settlement acknowledged" : "Compensation triggered"}</p><p className="mt-1 text-xl font-semibold">2,500 Demo USDC <span className="text-sm font-normal text-muted-foreground">sent via Solana Devnet</span></p><p className="mt-0.5 text-xs text-muted-foreground">(or {ekzt(2500)} via AIFC Gateway)</p>{settleOnChain ? <p className="mt-1 text-xs font-semibold text-success">On-chain: +0.01 Devnet SOL paid to your wallet by the escrow program</p> : settled ? <p className="mt-1 text-[11px] text-warning">Simulated only — no wallet was connected, nothing was sent on-chain. Connect Phantom (Devnet) to receive a real 0.01 SOL payout.</p> : <p className="mt-1 text-[11px] text-muted-foreground">{wallet.connected ? "Your connected wallet receives a real 0.01 Devnet SOL payout." : wallet.connecting ? "Waiting for your wallet to approve the connection…" : "Connect a Devnet wallet to receive a real 0.01 SOL payout."}</p>}</div>}
              </div>
              <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
                {settleSig ? <a href={explorerTx(settleSig)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-mono text-xs text-primary hover:text-primary/80">tx: {shortHash(settleSig)} <ExternalLink className="size-3" /></a> : <span className="text-[11px] text-muted-foreground">{settled ? "Simulated — no on-chain transaction" : "Transaction link appears after the payout"}</span>}
                {settleSig && <DemoTag kind="DEVNET" />}
                <Button className="sm:ml-auto" onClick={reviewSettlement} disabled={settleOnChain || settling || wallet.connecting || (settled && !wallet.connected)}>{settleOnChain || (settled && !wallet.connected) ? <><Check className="size-4" /> Acknowledged</> : settling ? "Paying out on Devnet…" : wallet.connecting ? "Waiting for wallet…" : settled ? <>Get real Devnet payout <ArrowUpRight className="size-4" /></> : <>Review settlement <ArrowUpRight className="size-4" /></>}</Button>
              </div>
            </div>
          </div>
        </section>
        <footer className="flex flex-col gap-2 px-1 pb-3 pt-7 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>© 2026 SilkSol AI · Infrastructure intelligence for the Middle Corridor</span><LiveBlock /></footer>
      </div>
    </main>
  );
}

// Latest finalized Devnet slot, polled so judges can see the page is talking to the real network.
function LiveBlock() {
  const { connection } = useConnection();
  const [slot, setSlot] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    const load = () =>
      connection
        .getSlot("finalized")
        .then((s) => active && setSlot(s))
        .catch(() => undefined);
    load();
    const id = window.setInterval(load, 5_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [connection]);
  return (
    <a
      href={slot === null ? "https://explorer.solana.com/?cluster=devnet" : `https://explorer.solana.com/block/${slot}?cluster=devnet`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1.5 hover:text-foreground"
    >
      <Box className="size-3" /> Devnet block {slot === null ? "…" : slot.toLocaleString("en-US")} · Finalized
      {slot !== null && <DemoTag kind="DEVNET" />}
    </a>
  );
}

function PanelHeader({ icon: Icon, eyebrow, title, aside }: { icon: typeof Search; eyebrow: string; title: string; aside?: React.ReactNode }) {
  return <div className="flex items-center gap-3 border-b border-border px-5 py-4"><div className="flex size-8 items-center justify-center rounded-md bg-accent text-primary"><Icon className="size-4" /></div><div><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p><h2 className="mt-0.5 text-sm font-semibold">{title}</h2></div>{aside && <div className="ml-auto">{aside}</div>}</div>;
}

function Sensor({ icon: Icon, label, value, note, alert = false }: { icon: typeof Gauge; label: string; value: string; note: string; alert?: boolean }) {
  return <div className="min-w-0 px-3 sm:px-4"><Icon className={`mb-3 size-4 ${alert ? "text-warning" : "text-primary"}`} /><p className="truncate text-[10px] text-muted-foreground">{label}</p><p className="mt-1 truncate text-base font-semibold">{value}</p><p className={`mt-1 truncate text-[9px] ${alert ? "text-warning" : "text-success"}`}>{note}</p></div>;
}
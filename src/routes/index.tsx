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
} from "lucide-react";
import { useMemo, useState } from "react";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SilkSol AI — Predictive Supply Chain Intelligence" },
      {
        name: "description",
        content:
          "Predictive risk monitoring and automated on-chain settlements for Middle Corridor logistics.",
      },
      { property: "og:title", content: "SilkSol AI — Corridor Intelligence" },
      {
        property: "og:description",
        content: "Real-time cargo risk intelligence secured by Solana.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

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

const cargoes = [
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
  const [selectedCargo, setSelectedCargo] = useState(cargoes[0]);
  const [filter, setFilter] = useState("All cargoes");
  const [settled, setSettled] = useState(false);

  const visibleCargoes = useMemo(
    () => filter === "All cargoes" ? cargoes : cargoes.filter((cargo) => cargo.status === filter),
    [filter],
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="solana-mark" aria-hidden="true"><span /><span /><span /></div>
            <div className="text-[17px] font-bold tracking-normal">SilkSol <span className="text-gradient">AI</span></div>
          </div>
          <div className="hidden h-6 w-px bg-border lg:block" />
          <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-50" /><span className="relative inline-flex size-2 rounded-full bg-success" /></span>
            <span className="font-semibold text-foreground">Solana Mainnet</span>
            <span>•</span><span>2,400 TPS</span><span>•</span><span>Avg Fee $0.00025</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="icon" aria-label="Notifications"><Bell className="size-4" /></Button>
            <Button variant="secondary" className="hidden sm:inline-flex"><WalletCards className="size-4 text-success" /><span className="hidden md:inline">Phantom / Solflare</span><span>0x...4F8A</span></Button>
            <div className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary ring-1 ring-primary/30">SK</div>
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
                <p className="mt-5 text-xs font-medium text-muted-foreground">{kpi.label}</p>
                <div className="mt-1 flex items-baseline gap-2"><strong className="text-2xl font-semibold tracking-normal">{kpi.value}</strong><span className="text-[11px] text-muted-foreground">{kpi.detail}</span></div>
              </article>
            );
          })}
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
          <div className="panel min-w-0 overflow-hidden">
            <PanelHeader icon={MapPin} eyebrow="Live route telemetry" title="Middle Corridor tracker" aside={<span className="status-pill status-transit"><Activity className="size-3" /> 18 active signals</span>} />
            <div className="corridor-map">
              <div className="map-grid" />
              <div className="route-rail">
                {routeStops.map((stop, index) => (
                  <button key={stop.city} onClick={() => index === 2 && setSelectedCargo(cargoes[0])} className={`route-stop route-${stop.state}`} aria-label={`${stop.city}, ${stop.state}`}>
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
                  <thead><tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground"><th>Cargo ID</th><th>Route</th><th>Current location</th><th>ETA</th><th>Status</th><th>Risk</th><th /></tr></thead>
                  <tbody>
                    {visibleCargoes.map((cargo) => (
                      <tr key={cargo.id} onClick={() => setSelectedCargo(cargo)} className={selectedCargo.id === cargo.id ? "table-row-active" : ""}>
                        <td className="font-semibold text-foreground">#{cargo.id}</td>
                        <td><span className="text-foreground">{cargo.origin}</span><ChevronRight className="mx-1 inline size-3" />{cargo.destination}</td>
                        <td>{cargo.location}</td><td>{cargo.eta}</td>
                        <td><span className={`status-pill ${statusClass[cargo.status]}`}>{cargo.status}</span></td>
                        <td><span className={cargo.risk > 60 ? "font-semibold text-warning" : "font-semibold text-success"}>{cargo.risk}%</span></td>
                        <td><Button variant="ghost" className="size-7 p-0" aria-label={`Open ${cargo.id}`}><MoreHorizontal className="size-4" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-4">
            <div className="panel overflow-hidden">
              <PanelHeader icon={Sparkles} eyebrow="SilkSol prediction engine" title={`Delay risk · #${selectedCargo.id}`} aside={<span className="text-xl font-semibold text-warning">{selectedCargo.risk}%</span>} />
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
                      <Area type="monotone" dataKey="risk" stroke="var(--chart-risk)" strokeWidth={2.5} fill="url(#riskFill)" activeDot={{ r: 5, fill: "var(--chart-risk)", stroke: "var(--background)", strokeWidth: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mx-2 mb-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground"><span>Predicted peak: <strong className="text-foreground">68% at 20:00</strong></span><span className="flex items-center gap-1 text-warning"><TrendingDown className="size-3" /> Recovery expected</span></div>
              </div>
            </div>

            <div className="panel">
              <PanelHeader icon={Radio} eyebrow="Sensor network" title="Live IoT telemetry" aside={<span className="text-[10px] font-semibold text-success">STREAMING</span>} />
              <div className="grid grid-cols-3 divide-x divide-border px-2 py-5">
                <Sensor icon={Thermometer} label="Temperature" value="4.2°C" note="Stable" />
                <Sensor icon={Gauge} label="Speed" value="0 km/h" note="At terminal" />
                <Sensor icon={Clock3} label="Dwell time" value="21.6h" note="+3.6h over" alert />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 panel settlement-panel overflow-hidden">
          <div className="relative grid gap-6 p-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:p-7">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary"><CircleDollarSign className="size-4" /> Autonomous settlement</div>
              <h2 className="text-lg font-semibold">Smart contract trigger</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Delay at Aktau Port exceeded the insured 18-hour threshold. Oracle consensus confirmed across 8 sources.</p>
              <div className="mt-4 flex flex-wrap gap-2"><span className="condition-chip"><Clock3 className="size-3" /> Actual 21.6 hrs</span><span className="condition-chip"><ShieldCheck className="size-3" /> Policy verified</span></div>
            </div>
            <div className="hidden items-center gap-2 lg:flex"><div className="h-px w-12 bg-border" /><div className="flex size-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-glow"><Zap className="size-4" /></div><div className="h-px w-12 bg-border" /></div>
            <div className="settlement-result">
              <div className="flex items-start gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-md ${settled ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}>{settled ? <Check className="size-5" /> : <Zap className="size-5" />}</div>
                <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-success">{settled ? "Settlement acknowledged" : "Compensation triggered"}</p><p className="mt-1 text-xl font-semibold">2,500 USDC <span className="text-sm font-normal text-muted-foreground">sent via Solana</span></p></div>
              </div>
              <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
                <a href="https://explorer.solana.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-mono text-xs text-primary hover:text-primary/80">tx: 5K9x...7P2q <ExternalLink className="size-3" /></a>
                <Button className="sm:ml-auto" onClick={() => setSettled(true)} disabled={settled}>{settled ? <><Check className="size-4" /> Acknowledged</> : <>Review settlement <ArrowUpRight className="size-4" /></>}</Button>
              </div>
            </div>
          </div>
        </section>
        <footer className="flex flex-col gap-2 px-1 pb-3 pt-7 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>© 2026 SilkSol AI · Infrastructure intelligence for the Middle Corridor</span><span className="flex items-center gap-1.5"><Box className="size-3" /> Block 371,924,881 · Finalized</span></footer>
      </div>
    </main>
  );
}

function PanelHeader({ icon: Icon, eyebrow, title, aside }: { icon: typeof Search; eyebrow: string; title: string; aside?: React.ReactNode }) {
  return <div className="flex items-center gap-3 border-b border-border px-5 py-4"><div className="flex size-8 items-center justify-center rounded-md bg-accent text-primary"><Icon className="size-4" /></div><div><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p><h2 className="mt-0.5 text-sm font-semibold">{title}</h2></div>{aside && <div className="ml-auto">{aside}</div>}</div>;
}

function Sensor({ icon: Icon, label, value, note, alert = false }: { icon: typeof Gauge; label: string; value: string; note: string; alert?: boolean }) {
  return <div className="min-w-0 px-3 sm:px-4"><Icon className={`mb-3 size-4 ${alert ? "text-warning" : "text-primary"}`} /><p className="truncate text-[10px] text-muted-foreground">{label}</p><p className="mt-1 truncate text-base font-semibold">{value}</p><p className={`mt-1 truncate text-[9px] ${alert ? "text-warning" : "text-success"}`}>{note}</p></div>;
}
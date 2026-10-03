import { GitBranch, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DemoTag } from "./DemoTag";

export type AuditLog = { id: number; time: string; event: string; cargo: string; leaf: string; root: string };

const COST_CNFT = 0.000005;
const COST_ACCOUNT = 0.0021;

export function AuditDrawer({ logs }: { logs: AuditLog[] }) {
  const saved = logs.length * (COST_ACCOUNT - COST_CNFT);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary"><ScrollText className="size-4" /><span className="hidden md:inline">cNFT Audit Trail</span><DemoTag kind="SIMULATED" className="hidden sm:inline-flex" /></Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">cNFT Audit Trail <DemoTag kind="SIMULATED" /></SheetTitle>
          <SheetDescription>Every policy event is hashed into a compressed Merkle tree checkpoint (state compression).</SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Metric label="Logs" value={String(logs.length)} />
          <Metric label="Cost / log" value={`$${COST_CNFT}`} />
          <Metric label="Saved vs accounts" value={`$${saved.toFixed(4)}`} />
        </div>
        <p className="text-[10px] text-muted-foreground">Costs are illustrative demo figures, not live pricing.</p>
        <div className="space-y-2">
          {logs.length === 0 && <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No checkpoints yet. Issue a policy to create one.</p>}
          {[...logs].reverse().map((l) => (
            <div key={l.id} className="rounded-md border border-border bg-card/60 p-3 text-xs">
              <div className="flex items-center gap-2"><GitBranch className="size-3.5 text-primary" /><span className="font-semibold">{l.event}</span><span className="ml-auto text-muted-foreground">{l.time}</span></div>
              <p className="mt-1 text-muted-foreground">Cargo #{l.cargo} · leaf #{l.id}</p>
              <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">leaf {l.leaf}</p>
              <p className="truncate font-mono text-[10px] text-primary">root {l.root}</p>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-border p-2"><p className="text-[9px] text-muted-foreground">{label}</p><p className="mt-0.5 text-sm font-semibold">{value}</p></div>;
}

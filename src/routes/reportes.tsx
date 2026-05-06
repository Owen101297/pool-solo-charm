import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { getDashboardStats, listLoans, listPayments } from "@/lib/api";

export const Route = createFileRoute("/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes — Pool Solo Pool" },
      { name: "description", content: "Reportes de cartera, recaudo y morosidad." },
    ],
  }),
  component: Reportes,
});

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

function Reportes() {
  const stats = useQuery({ queryKey: ["stats"], queryFn: getDashboardStats });
  const loans = useQuery({ queryKey: ["loans"], queryFn: listLoans });
  const payments = useQuery({ queryKey: ["payments"], queryFn: listPayments });

  // group payments by month last 6 months
  const monthsLabels = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const now = new Date();
  const buckets = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: monthsLabels[d.getMonth()], value: 0 };
  });
  (payments.data ?? []).forEach((p) => {
    const d = new Date(p.payment_date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const b = buckets.find((x) => x.key === key);
    if (b) b.value += Number(p.amount);
  });
  const max = Math.max(1, ...buckets.map((b) => b.value));

  const totalLoans = loans.data?.length ?? 0;
  const overdue = (loans.data ?? []).filter((l) => l.status === "vencido").length;
  const overduePct = totalLoans ? Math.round((overdue / totalLoans) * 100) : 0;
  const avgTicket = totalLoans
    ? (loans.data ?? []).reduce((s, l) => s + Number(l.amount), 0) / totalLoans
    : 0;

  return (
    <AppShell title="Reportes">
      <section className="bg-card rounded-2xl shadow-[var(--shadow-soft)] border border-border p-5">
        <p className="text-xs text-muted-foreground">Recaudado (últimos 6 meses)</p>
        <p className="font-mono text-3xl font-bold text-primary mt-1">
          {fmt(buckets.reduce((s, b) => s + b.value, 0))}
        </p>
        <div className="mt-5 flex items-end gap-2 h-32">
          {buckets.map((b) => (
            <div key={b.key} className="flex-1 flex flex-col items-center gap-1 justify-end h-full">
              <div className="w-full rounded-t-lg bg-accent transition-all" style={{ height: `${(b.value / max) * 100}%`, minHeight: 4 }} />
              <span className="text-[10px] text-muted-foreground font-mono">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 mt-4">
        <Card label="Préstamos otorgados" value={String(totalLoans)} />
        <Card label="Tasa de recaudo" value={`${stats.data?.paidPct ?? 0}%`} tone="success" />
        <Card label="Morosidad" value={`${overduePct}%`} tone="destructive" />
        <Card label="Ticket promedio" value={fmt(avgTicket)} />
      </section>
    </AppShell>
  );
}

function Card({ label, value, tone }: { label: string; value: string; tone?: "success" | "destructive" }) {
  const cls = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="bg-card p-4 rounded-2xl shadow-[var(--shadow-soft)] border border-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-mono text-2xl font-bold mt-1 ${cls}`}>{value}</p>
    </div>
  );
}

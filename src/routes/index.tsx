import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { getDashboardStats, listLoans, listPayments } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio — Pool Solo Pool" },
      { name: "description", content: "Resumen de cartera, pagos próximos y actividad reciente." },
    ],
  }),
  component: Dashboard,
});

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

function Dashboard() {
  const stats = useQuery({ queryKey: ["stats"], queryFn: getDashboardStats });
  const loans = useQuery({ queryKey: ["loans"], queryFn: listLoans });
  const payments = useQuery({ queryKey: ["payments"], queryFn: listPayments });

  const recentLoans = (loans.data ?? []).slice(0, 4);
  const recentPayments = (payments.data ?? []).slice(0, 3);

  return (
    <AppShell title="Dashboard">
      <section className="grid grid-cols-2 gap-3">
        <div className="col-span-2 bg-card p-5 rounded-2xl shadow-[var(--shadow-soft)] border border-border">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total prestado</p>
          <p className="font-mono text-3xl font-bold text-primary mt-1">{fmt(stats.data?.totalLoaned ?? 0)}</p>
        </div>
        <Stat label="Recuperado" value={fmt(stats.data?.recovered ?? 0)} tone="success" />
        <Stat label="Pendiente" value={fmt(stats.data?.pending ?? 0)} tone="destructive" />
        <div className="col-span-2 p-4 rounded-2xl shadow-[var(--shadow-soft)] flex justify-between items-center" style={{ background: "var(--gradient-primary)" }}>
          <div className="text-primary-foreground">
            <p className="text-xs opacity-80">Clientes</p>
            <p className="font-mono text-2xl font-bold">{stats.data?.clientsCount ?? 0}</p>
          </div>
          <Link to="/clientes" className="bg-accent text-accent-foreground px-3 py-2 rounded-xl flex items-center gap-1 font-semibold text-sm">
            <span className="material-symbols-outlined text-[18px]">person_add</span>Gestionar
          </Link>
        </div>
      </section>

      <section className="mt-5 bg-card p-5 rounded-2xl shadow-[var(--shadow-soft)] border border-border">
        <h3 className="text-base font-bold mb-4">Salud de cartera</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="var(--muted)" strokeWidth="8" />
              <circle
                cx="48" cy="48" r="40" fill="none" stroke="var(--primary)" strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * (stats.data?.paidPct ?? 0)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-mono font-bold">{stats.data?.paidPct ?? 0}%</span>
          </div>
          <div className="flex-1 space-y-2">
            <Legend color="bg-primary" label="Pagado" value={`${stats.data?.paidPct ?? 0}%`} />
            <Legend color="bg-muted" label="Pendiente" value={`${100 - (stats.data?.paidPct ?? 0)}%`} />
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold">Pagos recientes</h3>
          <Link to="/pagos" className="text-sm text-primary font-semibold">Ver todos</Link>
        </div>
        <div className="space-y-2">
          {recentPayments.length === 0 && <Empty text="Sin pagos todavía" />}
          {recentPayments.map((p) => {
            const name = (p.loans as { clients: { name: string } | null } | null)?.clients?.name ?? "Cliente";
            return (
              <div key={p.id} className="bg-card p-3 rounded-xl shadow-[var(--shadow-soft)] border-l-4 border-success flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold">{name[0]}</div>
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{p.payment_date} · {p.method}</p>
                  </div>
                </div>
                <p className="font-mono font-semibold">{fmt(Number(p.amount))}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold">Préstamos recientes</h3>
          <Link to="/prestamos" className="text-sm text-primary font-semibold">Ver todos</Link>
        </div>
        <div className="bg-card rounded-2xl shadow-[var(--shadow-soft)] border border-border overflow-hidden">
          {recentLoans.length === 0 && <div className="p-4"><Empty text="Sin préstamos todavía" /></div>}
          {recentLoans.map((l, i) => {
            const name = (l.clients as { name: string } | null)?.name ?? "—";
            return (
              <div key={l.id} className={`p-3 flex items-center justify-between ${i === recentLoans.length - 1 ? "" : "border-b border-border"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent-foreground flex items-center justify-center">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{l.interest_rate}% · {l.loan_date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-primary">{fmt(Number(l.amount))}</p>
                  <p className="text-xs text-success font-semibold capitalize">{l.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "destructive" }) {
  const cls = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="bg-card p-4 rounded-2xl shadow-[var(--shadow-soft)] border border-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-mono text-lg font-bold mt-1 ${cls}`}>{value}</p>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-center text-sm text-muted-foreground py-3">{text}</p>;
}

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes — Pool Solo Pool" },
      { name: "description", content: "Reportes mensuales de cartera, recaudo y morosidad." },
    ],
  }),
  component: Reportes,
});

const months = [
  { m: "Ene", v: 60 }, { m: "Feb", v: 75 }, { m: "Mar", v: 50 },
  { m: "Abr", v: 90 }, { m: "May", v: 70 }, { m: "Jun", v: 100 },
];

function Reportes() {
  return (
    <AppShell title="Reportes">
      <section className="bg-card rounded-2xl shadow-[var(--shadow-soft)] border border-border p-5">
        <p className="text-xs text-muted-foreground">Recaudo últimos 6 meses</p>
        <p className="font-mono text-3xl font-bold text-primary mt-1">$214,800</p>
        <div className="mt-5 flex items-end gap-2 h-32">
          {months.map((b) => (
            <div key={b.m} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg bg-accent" style={{ height: `${b.v}%` }} />
              <span className="text-[10px] text-muted-foreground font-mono">{b.m}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 mt-4">
        <Card label="Préstamos otorgados" value="48" />
        <Card label="Tasa de recaudo" value="86%" tone="success" />
        <Card label="Morosidad" value="9%" tone="destructive" />
        <Card label="Ticket promedio" value="$1,420" />
      </section>

      <section className="mt-5 bg-card rounded-2xl shadow-[var(--shadow-soft)] border border-border p-5">
        <h3 className="text-base font-bold mb-3">Exportar reportes</h3>
        <div className="space-y-2">
          {["Cartera completa", "Pagos del mes", "Clientes morosos"].map((r) => (
            <button key={r} className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary transition-colors">
              <span className="flex items-center gap-3 font-semibold">
                <span className="material-symbols-outlined text-primary">description</span>
                {r}
              </span>
              <span className="material-symbols-outlined text-muted-foreground">download</span>
            </button>
          ))}
        </div>
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

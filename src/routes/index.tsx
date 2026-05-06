import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio — Pool Solo Pool" },
      { name: "description", content: "Resumen de cartera, pagos próximos y actividad reciente." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell title="Dashboard">
      <section className="grid grid-cols-2 gap-3">
        <div className="col-span-2 bg-card p-5 rounded-2xl shadow-[var(--shadow-soft)] border border-border">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total prestado</p>
          <div className="flex justify-between items-end mt-1">
            <span className="font-mono text-3xl font-bold text-primary">$52,500</span>
            <span className="font-mono text-xs text-success bg-success/10 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>+12%
            </span>
          </div>
        </div>
        <Stat label="Recuperado" value="$38,200" trend="+8%" trendClass="text-success" />
        <Stat label="Pendiente" value="$14,300" trend="-5%" trendClass="text-destructive" />
        <div className="col-span-2 p-4 rounded-2xl shadow-[var(--shadow-soft)] flex justify-between items-center" style={{ background: "var(--gradient-primary)" }}>
          <div className="text-primary-foreground">
            <p className="text-xs opacity-80">Clientes activos</p>
            <p className="font-mono text-2xl font-bold">15</p>
          </div>
          <div className="bg-accent text-accent-foreground px-3 py-2 rounded-xl flex items-center gap-1 font-semibold text-sm">
            <span className="material-symbols-outlined text-[18px]">person_add</span>+2 nuevos
          </div>
        </div>
      </section>

      <section className="mt-5 bg-card p-5 rounded-2xl shadow-[var(--shadow-soft)] border border-border">
        <h3 className="text-base font-bold mb-4">Salud de cartera</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="var(--muted)" strokeWidth="8" />
              <circle cx="48" cy="48" r="40" fill="none" stroke="var(--primary)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="67.8" strokeLinecap="round" />
            </svg>
            <span className="absolute font-mono font-bold">73%</span>
          </div>
          <div className="flex-1 space-y-2">
            <Legend color="bg-primary" label="Pagado" value="73%" />
            <Legend color="bg-muted" label="Pendiente" value="27%" />
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold">Pagos próximos</h3>
          <Link to="/pagos" className="text-sm text-primary font-semibold">Ver todos</Link>
        </div>
        <div className="space-y-2">
          <PaymentRow name="Juan" date="Vence hoy" amount="$100.00" warn />
          <PaymentRow name="Ana" date="Mañana" amount="$200.00" />
          <PaymentRow name="Luis" date="En 3 días" amount="$75.00" />
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold">Préstamos recientes</h3>
          <Link to="/prestamos" className="text-sm text-primary font-semibold">Ver todos</Link>
        </div>
        <div className="bg-card rounded-2xl shadow-[var(--shadow-soft)] border border-border overflow-hidden">
          <LoanRow name="María" meta="12 meses · 5%" amount="$1,000" />
          <LoanRow name="Carlos" meta="24 meses · 4.5%" amount="$2,500" />
          <LoanRow name="Pedro" meta="6 meses · 8%" amount="$800" last />
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ label, value, trend, trendClass }: { label: string; value: string; trend: string; trendClass: string }) {
  return (
    <div className="bg-card p-4 rounded-2xl shadow-[var(--shadow-soft)] border border-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-mono text-lg font-bold mt-1">{value}</p>
      <p className={`font-mono text-xs mt-1 ${trendClass}`}>{trend}</p>
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

function PaymentRow({ name, date, amount, warn }: { name: string; date: string; amount: string; warn?: boolean }) {
  return (
    <div className={`bg-card p-3 rounded-xl shadow-[var(--shadow-soft)] border-l-4 ${warn ? "border-warning" : "border-border"} flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold">{name[0]}</div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className={`text-xs ${warn ? "text-warning-foreground bg-warning/40 px-2 py-0.5 rounded inline-block" : "text-muted-foreground"}`}>{date}</p>
        </div>
      </div>
      <p className="font-mono font-semibold">{amount}</p>
    </div>
  );
}

function LoanRow({ name, meta, amount, last }: { name: string; meta: string; amount: string; last?: boolean }) {
  return (
    <div className={`p-3 flex items-center justify-between ${last ? "" : "border-b border-border"}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent-foreground flex items-center justify-center">
          <span className="material-symbols-outlined">person</span>
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{meta}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono font-bold text-primary">{amount}</p>
        <p className="text-xs text-success font-semibold">Activo</p>
      </div>
    </div>
  );
}

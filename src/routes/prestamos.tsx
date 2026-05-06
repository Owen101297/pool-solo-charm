import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";

export const Route = createFileRoute("/prestamos")({
  head: () => ({
    meta: [
      { title: "Préstamos — Pool Solo Pool" },
      { name: "description", content: "Lista de préstamos activos, pendientes y vencidos." },
    ],
  }),
  component: Prestamos,
});

const filters = ["Todos", "Activos", "Pendientes", "Vencidos"] as const;

const loans = [
  { name: "María", amount: "$1,000", rate: "10%", status: "Pagado", tone: "success", date: "12 Oct 2025", note: undefined },
  { name: "Carlos", amount: "$2,500", rate: "15%", status: "Pendiente", tone: "warning", date: "Vence mañana", note: undefined },
  { name: "Ana", amount: "$500", rate: "10%", status: "Vencido", tone: "destructive", date: "15 días de retraso", note: "warning" },
  { name: "Pedro", amount: "$1,800", rate: "12%", status: "Pagado", tone: "success", date: "01 Oct 2025", note: undefined },
];

const toneClasses: Record<string, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/30 text-warning-foreground",
  destructive: "bg-destructive/15 text-destructive",
};

function Prestamos() {
  const [active, setActive] = useState<(typeof filters)[number]>("Todos");
  return (
    <AppShell title="Préstamos">
      <section className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 mb-4">
        {filters.map((f) => {
          const on = f === active;
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                on ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {f}
            </button>
          );
        })}
      </section>

      <div className="space-y-3">
        {loans.map((l, i) => (
          <div key={i} className="bg-card p-5 rounded-2xl shadow-[var(--shadow-soft)] border border-border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cliente</p>
                <h3 className="text-lg font-bold">{l.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${toneClasses[l.tone]}`}>{l.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Monto</p>
                <p className={`font-mono text-lg font-bold ${l.tone === "destructive" ? "text-destructive" : "text-primary"}`}>{l.amount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tasa</p>
                <p className="font-mono text-lg font-bold">{l.rate}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <div className={`flex items-center gap-1 text-xs ${l.note ? "text-destructive" : "text-muted-foreground"}`}>
                <span className="material-symbols-outlined text-[16px]">{l.note ? "warning" : "calendar_today"}</span>
                <span className="font-mono">{l.date}</span>
              </div>
              <button className="text-primary text-sm font-bold hover:underline">{l.note ? "Gestionar" : "Ver detalle"}</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 p-5 rounded-2xl shadow-lg text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm opacity-80">Cartera total activa</span>
          <span className="material-symbols-outlined">trending_up</span>
        </div>
        <p className="font-mono text-3xl font-bold mb-3">$154,200.00</p>
        <div className="w-full bg-primary-foreground/20 h-2 rounded-full overflow-hidden">
          <div className="bg-accent h-full w-[72%]" />
        </div>
        <p className="text-xs mt-1 opacity-80 text-right">72% recaudado este mes</p>
      </div>

      <button className="fixed bottom-24 right-6 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform z-30">
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </AppShell>
  );
}

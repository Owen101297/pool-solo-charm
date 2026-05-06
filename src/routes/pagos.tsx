import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";

export const Route = createFileRoute("/pagos")({
  head: () => ({
    meta: [
      { title: "Pagos — Pool Solo Pool" },
      { name: "description", content: "Registra pagos de clientes y revisa los recientes." },
    ],
  }),
  component: Pagos,
});

function Pagos() {
  const [method, setMethod] = useState<"efectivo" | "transferencia">("efectivo");
  return (
    <AppShell title="Registro de Pagos">
      <section className="bg-card rounded-2xl shadow-[var(--shadow-soft)] border border-border p-5">
        <h2 className="text-base font-bold mb-3">Seleccionar Cliente</h2>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">person_search</span>
          <input className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary" placeholder="Buscar por nombre o ID..." />
        </div>
        <div className="mt-4 flex items-center gap-3 p-3 bg-primary-soft border border-primary/20 rounded-lg">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <p className="font-semibold">Carlos Eduardo Méndez</p>
            <p className="text-xs text-muted-foreground">ID: 001-239485-2 · Saldo: $1,250.00</p>
          </div>
        </div>
      </section>

      <section className="mt-4 bg-card rounded-2xl shadow-[var(--shadow-soft)] border border-border p-5">
        <h2 className="text-base font-bold mb-3">Detalles del Pago</h2>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-primary font-bold">$</span>
                <input type="number" step="0.01" placeholder="0.00" className="w-full pl-8 pr-3 py-3 bg-background border border-border rounded-lg font-mono outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Fecha</label>
              <input type="date" className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">Método de Pago</label>
            <div className="grid grid-cols-2 gap-2">
              {(["efectivo", "transferencia"] as const).map((m) => {
                const on = method === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`flex items-center justify-center gap-2 py-3 border-2 rounded-lg font-semibold transition-all ${
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="material-symbols-outlined">{m === "efectivo" ? "payments" : "account_balance"}</span>
                    {m === "efectivo" ? "Efectivo" : "Transferencia"}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">Notas / Referencia</label>
            <textarea rows={3} className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary" placeholder="Añade detalles adicionales..." />
          </div>

          <button type="submit" className="w-full py-4 bg-accent text-accent-foreground rounded-xl font-bold shadow-md active:scale-[0.98] transition-transform">
            Confirmar Registro de Pago
          </button>
        </form>
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Pagos Recientes</h2>
          <button className="text-primary text-sm font-bold">Ver todos</button>
        </div>
        <div className="space-y-2">
          <Recent name="Ana Victoria López" when="Hace 2 horas · Efectivo" amount="$150.00" status="Completado" tone="success" icon="check_circle" />
          <Recent name="Roberto Gómez" when="Ayer · Transferencia" amount="$300.00" status="Procesando" tone="warning" icon="sync" />
          <Recent name="Marta Sánchez" when="22 May · Efectivo" amount="$85.00" status="Completado" tone="success" icon="check_circle" />
        </div>
      </section>
    </AppShell>
  );
}

function Recent({ name, when, amount, status, tone, icon }: { name: string; when: string; amount: string; status: string; tone: "success" | "warning"; icon: string }) {
  const toneCls = tone === "success" ? "bg-success/15 text-success" : "bg-warning/30 text-warning-foreground";
  const iconBg = tone === "success" ? "bg-success/15 text-success" : "bg-accent-soft text-accent-foreground";
  return (
    <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{when}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono font-bold">{amount}</p>
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${toneCls}`}>{status}</span>
      </div>
    </div>
  );
}

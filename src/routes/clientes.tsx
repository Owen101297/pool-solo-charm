import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Pool Solo Pool" },
      { name: "description", content: "Directorio de clientes con préstamos y deuda total." },
    ],
  }),
  component: Clientes,
});

const clients = [
  { name: "María López", phone: "555-1234", initials: "ML", loans: 3, debt: "$3,500.00", color: "bg-primary-soft text-primary" },
  { name: "Carlos Ruiz", phone: "555-5678", initials: "CR", loans: 1, debt: "$1,200.00", color: "bg-accent-soft text-accent-foreground" },
  { name: "Ana Beltrán", phone: "555-9012", initials: "AB", loans: 0, debt: "$0.00", color: "bg-secondary text-secondary-foreground" },
  { name: "Pedro Soto", phone: "555-3344", initials: "PS", loans: 2, debt: "$1,800.00", color: "bg-primary-soft text-primary" },
];

function Clientes() {
  return (
    <AppShell title="Clientes">
      <section className="flex gap-2 items-center mb-4">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
          <input className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all" placeholder="Buscar por nombre o ID..." />
        </div>
        <button className="bg-primary text-primary-foreground p-3 rounded-xl shadow-[var(--shadow-soft)] active:scale-95 transition-transform">
          <span className="material-symbols-outlined">person_add</span>
        </button>
      </section>

      <div className="space-y-3">
        {clients.map((c) => (
          <div key={c.name} className="bg-card rounded-2xl shadow-[var(--shadow-soft)] border border-border overflow-hidden">
            <div className="p-4 flex items-start justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${c.color}`}>{c.initials}</div>
                <div>
                  <h2 className="font-semibold text-base">{c.name}</h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">call</span>{c.phone}
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 bg-primary-soft text-primary rounded-lg font-mono text-xs">{c.loans} {c.loans === 1 ? "Préstamo" : "Préstamos"}</span>
            </div>
            <div className="p-4 bg-muted/40 flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Deuda Total</p>
                <p className="font-mono text-lg font-bold text-primary">{c.debt}</p>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full border border-border text-muted-foreground flex items-center justify-center hover:bg-secondary"><span className="material-symbols-outlined">call</span></button>
                <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm active:scale-90"><span className="material-symbols-outlined">add_card</span></button>
                <button className="w-10 h-10 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary-soft"><span className="material-symbols-outlined">visibility</span></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-xl flex items-center justify-center z-30 active:scale-90 transition-all">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
      </button>
    </AppShell>
  );
}

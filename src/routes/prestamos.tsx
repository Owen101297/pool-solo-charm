import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { createLoan, listClients, listLoans, updateLoanStatus, type LoanStatus } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/prestamos")({
  head: () => ({
    meta: [
      { title: "Préstamos — Pool Solo Pool" },
      { name: "description", content: "Lista de préstamos activos, pagados y vencidos." },
    ],
  }),
  component: Prestamos,
});

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const filters = ["Todos", "activo", "pagado", "vencido"] as const;

const schema = z.object({
  client_id: z.string().uuid("Selecciona un cliente"),
  amount: z.number().positive("Monto inválido").max(10_000_000),
  interest_rate: z.number().min(0).max(100),
  loan_date: z.string().min(1),
  due_date: z.string().optional(),
});

const toneClasses: Record<string, string> = {
  pagado: "bg-success/15 text-success",
  activo: "bg-warning/30 text-warning-foreground",
  vencido: "bg-destructive/15 text-destructive",
};

function Prestamos() {
  const qc = useQueryClient();
  const loans = useQuery({ queryKey: ["loans"], queryFn: listLoans });
  const clients = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const [active, setActive] = useState<(typeof filters)[number]>("Todos");
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ client_id: "", amount: "", interest_rate: "", loan_date: today, due_date: "" });

  const create = useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      toast.success("Préstamo creado");
      setOpen(false);
      setForm({ client_id: "", amount: "", interest_rate: "", loan_date: today, due_date: "" });
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LoanStatus }) => updateLoanStatus(id, status),
    onSuccess: () => {
      toast.success("Estado actualizado");
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      client_id: form.client_id,
      amount: Number(form.amount),
      interest_rate: Number(form.interest_rate || 0),
      loan_date: form.loan_date,
      due_date: form.due_date || undefined,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    create.mutate({
      client_id: parsed.data.client_id,
      amount: parsed.data.amount,
      interest_rate: parsed.data.interest_rate,
      loan_date: parsed.data.loan_date,
      due_date: parsed.data.due_date ?? null,
    });
  };

  const filtered = (loans.data ?? []).filter((l) => active === "Todos" || l.status === active);
  const totalActive = (loans.data ?? []).filter((l) => l.status !== "pagado").reduce((s, l) => s + Number(l.amount), 0);

  return (
    <AppShell title="Préstamos">
      <section className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 mb-4">
        {filters.map((f) => {
          const on = f === active;
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold capitalize transition-all ${
                on ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {f}
            </button>
          );
        })}
      </section>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Sin préstamos en esta vista</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((l) => {
          const name = (l.clients as { name: string } | null)?.name ?? "—";
          return (
            <div key={l.id} className="bg-card p-5 rounded-2xl shadow-[var(--shadow-soft)] border border-border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cliente</p>
                  <h3 className="text-lg font-bold">{name}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${toneClasses[l.status]}`}>{l.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Monto</p>
                  <p className="font-mono text-lg font-bold text-primary">{fmt(Number(l.amount))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tasa</p>
                  <p className="font-mono text-lg font-bold">{l.interest_rate}%</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span className="font-mono">{l.loan_date}</span>
                </div>
                <select
                  value={l.status}
                  onChange={(e) => setStatus.mutate({ id: l.id, status: e.target.value as LoanStatus })}
                  className="text-xs font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded-lg border border-border"
                >
                  <option value="activo">activo</option>
                  <option value="pagado">pagado</option>
                  <option value="vencido">vencido</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {(loans.data?.length ?? 0) > 0 && (
        <div className="mt-5 p-5 rounded-2xl shadow-lg text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm opacity-80">Cartera total activa</span>
            <span className="material-symbols-outlined">trending_up</span>
          </div>
          <p className="font-mono text-3xl font-bold">{fmt(totalActive)}</p>
        </div>
      )}

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-xl flex items-center justify-center active:scale-90 z-30"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-card rounded-3xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Nuevo préstamo</h2>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Cliente *</label>
                <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary">
                  <option value="">Selecciona…</option>
                  {(clients.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Monto *</label>
                  <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Tasa %</label>
                  <input type="number" step="0.1" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Fecha</label>
                  <input type="date" value={form.loan_date} onChange={(e) => setForm({ ...form, loan_date: e.target.value })} className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Vence</label>
                  <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 py-3 border border-border rounded-xl font-semibold">Cancelar</button>
                <button type="submit" disabled={create.isPending} className="flex-1 py-3 bg-accent text-accent-foreground rounded-xl font-bold disabled:opacity-60">
                  {create.isPending ? "Guardando..." : "Crear préstamo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

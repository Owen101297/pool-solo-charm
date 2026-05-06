import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { createPayment, listLoans, listPayments, type PaymentMethod } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/pagos")({
  head: () => ({
    meta: [
      { title: "Pagos — Pool Solo Pool" },
      { name: "description", content: "Registra pagos de clientes y revisa los recientes." },
    ],
  }),
  component: Pagos,
});

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const schema = z.object({
  loan_id: z.string().uuid("Selecciona un préstamo"),
  amount: z.number().positive("Monto inválido").max(10_000_000),
  payment_date: z.string().min(1),
  method: z.enum(["efectivo", "transferencia"]),
  notes: z.string().max(500).optional(),
});

function Pagos() {
  const qc = useQueryClient();
  const loans = useQuery({ queryKey: ["loans"], queryFn: listLoans });
  const payments = useQuery({ queryKey: ["payments"], queryFn: listPayments });

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ loan_id: "", amount: "", payment_date: today, method: "efectivo" as PaymentMethod, notes: "" });

  const activeLoans = useMemo(
    () => (loans.data ?? []).filter((l) => l.status !== "pagado"),
    [loans.data],
  );

  const selectedLoan = activeLoans.find((l) => l.id === form.loan_id);
  const selectedName = (selectedLoan?.clients as { name: string } | null)?.name;

  const create = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success("Pago registrado");
      setForm({ loan_id: "", amount: "", payment_date: today, method: "efectivo", notes: "" });
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, amount: Number(form.amount), notes: form.notes || undefined });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    create.mutate(parsed.data);
  };

  return (
    <AppShell title="Registro de Pagos">
      <section className="bg-card rounded-2xl shadow-[var(--shadow-soft)] border border-border p-5">
        <h2 className="text-base font-bold mb-3">Seleccionar Préstamo</h2>
        <select
          value={form.loan_id}
          onChange={(e) => setForm({ ...form, loan_id: e.target.value })}
          className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary"
        >
          <option value="">Selecciona un préstamo activo…</option>
          {activeLoans.map((l) => {
            const n = (l.clients as { name: string } | null)?.name ?? "—";
            return (
              <option key={l.id} value={l.id}>
                {n} — {fmt(Number(l.amount))} ({l.status})
              </option>
            );
          })}
        </select>
        {selectedLoan && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-primary-soft border border-primary/20 rounded-lg">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <p className="font-semibold">{selectedName}</p>
              <p className="text-xs text-muted-foreground">Saldo: {fmt(Number(selectedLoan.amount))}</p>
            </div>
          </div>
        )}
      </section>

      <section className="mt-4 bg-card rounded-2xl shadow-[var(--shadow-soft)] border border-border p-5">
        <h2 className="text-base font-bold mb-3">Detalles del Pago</h2>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-primary font-bold">$</span>
                <input
                  type="number" step="0.01" placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full pl-8 pr-3 py-3 bg-background border border-border rounded-lg font-mono outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Fecha</label>
              <input
                type="date"
                value={form.payment_date}
                onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">Método de Pago</label>
            <div className="grid grid-cols-2 gap-2">
              {(["efectivo", "transferencia"] as const).map((m) => {
                const on = form.method === m;
                return (
                  <button
                    key={m} type="button"
                    onClick={() => setForm({ ...form, method: m })}
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
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary"
              placeholder="Añade detalles adicionales..."
            />
          </div>

          <button
            type="submit" disabled={create.isPending || !form.loan_id}
            className="w-full py-4 bg-accent text-accent-foreground rounded-xl font-bold shadow-md active:scale-[0.98] disabled:opacity-60"
          >
            {create.isPending ? "Guardando..." : "Confirmar Registro de Pago"}
          </button>
        </form>
      </section>

      <section className="mt-5">
        <h2 className="text-base font-bold mb-3">Pagos Recientes</h2>
        <div className="space-y-2">
          {(payments.data ?? []).length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">Sin pagos todavía</p>
          )}
          {(payments.data ?? []).slice(0, 20).map((p) => {
            const name = (p.loans as { clients: { name: string } | null } | null)?.clients?.name ?? "—";
            return (
              <div key={p.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/15 text-success flex items-center justify-center">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{p.payment_date} · {p.method}</p>
                  </div>
                </div>
                <p className="font-mono font-bold">{fmt(Number(p.amount))}</p>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}

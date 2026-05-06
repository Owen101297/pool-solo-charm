import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { createClient, listClients } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Pool Solo Pool" },
      { name: "description", content: "Directorio de clientes con préstamos y deuda total." },
    ],
  }),
  component: Clientes,
});

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const initials = (s: string) => s.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const schema = z.object({
  name: z.string().trim().min(1, "Nombre requerido").max(100),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
});

function Clientes() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  const create = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("Cliente creado");
      setOpen(false);
      setForm({ name: "", phone: "" });
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    create.mutate({ name: parsed.data.name, phone: parsed.data.phone || undefined });
  };

  const filtered = (data ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="Clientes">
      <section className="flex gap-2 items-center mb-4">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
            placeholder="Buscar por nombre o teléfono..."
          />
        </div>
        <button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground p-3 rounded-xl shadow-[var(--shadow-soft)] active:scale-95">
          <span className="material-symbols-outlined">person_add</span>
        </button>
      </section>

      {isLoading && <p className="text-center text-muted-foreground py-6">Cargando…</p>}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aún no hay clientes</p>
          <button onClick={() => setOpen(true)} className="mt-4 px-5 py-2 bg-accent text-accent-foreground rounded-xl font-semibold">
            Agregar el primero
          </button>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((c) => {
          const cl = c as typeof c & { loans: { amount: number; status: string }[] };
          const debt = (cl.loans ?? []).filter((l) => l.status !== "pagado").reduce((s, l) => s + Number(l.amount), 0);
          const count = (cl.loans ?? []).length;
          return (
            <div key={c.id} className="bg-card rounded-2xl shadow-[var(--shadow-soft)] border border-border overflow-hidden">
              <div className="p-4 flex items-start justify-between border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold">{initials(c.name)}</div>
                  <div>
                    <h2 className="font-semibold text-base">{c.name}</h2>
                    {c.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">call</span>{c.phone}
                      </p>
                    )}
                  </div>
                </div>
                <span className="px-2 py-1 bg-primary-soft text-primary rounded-lg font-mono text-xs">{count} {count === 1 ? "Préstamo" : "Préstamos"}</span>
              </div>
              <div className="p-4 bg-muted/40 flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Deuda activa</p>
                  <p className="font-mono text-lg font-bold text-primary">{fmt(debt)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-xl flex items-center justify-center z-30 active:scale-90"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-card rounded-3xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Nuevo cliente</h2>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Nombre *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Teléfono</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 py-3 border border-border rounded-xl font-semibold">Cancelar</button>
                <button type="submit" disabled={create.isPending} className="flex-1 py-3 bg-accent text-accent-foreground rounded-xl font-bold disabled:opacity-60">
                  {create.isPending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

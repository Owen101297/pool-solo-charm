import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Loan = Database["public"]["Tables"]["loans"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type LoanStatus = Database["public"]["Enums"]["loan_status"];
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];

export async function listClients() {
  const { data, error } = await supabase
    .from("clients")
    .select("*, loans(amount, status)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createClient(input: { name: string; phone?: string; notes?: string }) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("No autenticado");
  const { data, error } = await supabase
    .from("clients")
    .insert({ ...input, user_id: u.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listLoans() {
  const { data, error } = await supabase
    .from("loans")
    .select("*, clients(name), payments(amount)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createLoan(input: {
  client_id: string;
  amount: number;
  interest_rate: number;
  loan_date: string;
  due_date?: string | null;
}) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("No autenticado");
  const { data, error } = await supabase
    .from("loans")
    .insert({ ...input, user_id: u.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLoanStatus(id: string, status: LoanStatus) {
  const { error } = await supabase.from("loans").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function listPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select("*, loans(client_id, clients(name))")
    .order("payment_date", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function createPayment(input: {
  loan_id: string;
  amount: number;
  payment_date: string;
  method: PaymentMethod;
  notes?: string;
}) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("No autenticado");
  const { data, error } = await supabase
    .from("payments")
    .insert({ ...input, user_id: u.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getDashboardStats() {
  const [{ data: loans }, { data: payments }, { count: clientsCount }] = await Promise.all([
    supabase.from("loans").select("amount, status"),
    supabase.from("payments").select("amount"),
    supabase.from("clients").select("*", { count: "exact", head: true }),
  ]);
  const totalLoaned = (loans ?? []).reduce((s, l) => s + Number(l.amount), 0);
  const recovered = (payments ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const pending = Math.max(0, totalLoaned - recovered);
  const activeLoans = (loans ?? []).filter((l) => l.status === "activo").length;
  return {
    totalLoaned,
    recovered,
    pending,
    activeLoans,
    clientsCount: clientsCount ?? 0,
    paidPct: totalLoaned > 0 ? Math.round((recovered / totalLoaned) * 100) : 0,
  };
}

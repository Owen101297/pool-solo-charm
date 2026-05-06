
-- Helper: timestamps trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Clients
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index clients_user_idx on public.clients(user_id);
alter table public.clients enable row level security;

create policy "clients_select_own" on public.clients for select using (auth.uid() = user_id);
create policy "clients_insert_own" on public.clients for insert with check (auth.uid() = user_id);
create policy "clients_update_own" on public.clients for update using (auth.uid() = user_id);
create policy "clients_delete_own" on public.clients for delete using (auth.uid() = user_id);

create trigger clients_updated_at before update on public.clients
for each row execute function public.set_updated_at();

-- Loans
create type public.loan_status as enum ('activo', 'pagado', 'vencido');

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  interest_rate numeric(5,2) not null default 0 check (interest_rate >= 0),
  loan_date date not null default current_date,
  due_date date,
  status public.loan_status not null default 'activo',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index loans_user_idx on public.loans(user_id);
create index loans_client_idx on public.loans(client_id);
alter table public.loans enable row level security;

create policy "loans_select_own" on public.loans for select using (auth.uid() = user_id);
create policy "loans_insert_own" on public.loans for insert with check (auth.uid() = user_id);
create policy "loans_update_own" on public.loans for update using (auth.uid() = user_id);
create policy "loans_delete_own" on public.loans for delete using (auth.uid() = user_id);

create trigger loans_updated_at before update on public.loans
for each row execute function public.set_updated_at();

-- Payments
create type public.payment_method as enum ('efectivo', 'transferencia');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  loan_id uuid not null references public.loans(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  payment_date date not null default current_date,
  method public.payment_method not null default 'efectivo',
  notes text,
  created_at timestamptz not null default now()
);
create index payments_user_idx on public.payments(user_id);
create index payments_loan_idx on public.payments(loan_id);
alter table public.payments enable row level security;

create policy "payments_select_own" on public.payments for select using (auth.uid() = user_id);
create policy "payments_insert_own" on public.payments for insert with check (auth.uid() = user_id);
create policy "payments_update_own" on public.payments for update using (auth.uid() = user_id);
create policy "payments_delete_own" on public.payments for delete using (auth.uid() = user_id);

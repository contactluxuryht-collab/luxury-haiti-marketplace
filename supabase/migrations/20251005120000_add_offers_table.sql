-- Create offers table for per-product promotions
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  seller_id uuid not null references public.users(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  threshold numeric(10,2) not null check (threshold >= 0),
  active boolean not null default true,
  start_at timestamptz null,
  end_at timestamptz null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.offers enable row level security;

-- Policy: anyone can read active offers
create policy if not exists "offers_select_all"
on public.offers
for select
using (true);

-- Policy: only the seller can insert an offer for their product
create policy if not exists "offers_insert_owner"
on public.offers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.users u
    where u.id = offers.seller_id
      and u.auth_id = auth.uid()
  )
);

-- Policy: only the owner can update/delete their offers
create policy if not exists "offers_modify_owner"
on public.offers
for update using (
  exists (
    select 1 from public.users u where u.id = offers.seller_id and u.auth_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.users u where u.id = offers.seller_id and u.auth_id = auth.uid()
  )
);

create policy if not exists "offers_delete_owner"
on public.offers
for delete using (
  exists (
    select 1 from public.users u where u.id = offers.seller_id and u.auth_id = auth.uid()
  )
);

-- Helpful index
create index if not exists idx_offers_product_active on public.offers(product_id) where active = true;



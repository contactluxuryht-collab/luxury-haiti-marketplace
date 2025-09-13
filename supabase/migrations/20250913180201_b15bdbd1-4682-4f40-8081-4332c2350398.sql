-- Create users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid references auth.users(id) on delete cascade unique not null,
  role text check (role in ('buyer','seller')) not null default 'seller',
  name text,
  email text unique not null,
  created_at timestamp default now()
);

-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric not null check (price > 0),
  image_url text,
  created_at timestamp default now()
);

-- Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.users(id) on delete set null,
  product_id uuid references public.products(id) on delete cascade not null,
  status text check (status in ('pending','paid','shipped','completed','cancelled')) default 'pending',
  created_at timestamp default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- RLS Policies for users table
create policy "Users can view their own profile" 
on public.users for select 
using (auth.uid() = auth_id);

create policy "Users can insert their own profile" 
on public.users for insert 
with check (auth.uid() = auth_id);

create policy "Users can update their own profile" 
on public.users for update 
using (auth.uid() = auth_id);

-- RLS Policies for products table
create policy "Everyone can view products" 
on public.products for select 
using (true);

create policy "Sellers can insert their own products" 
on public.products for insert 
with check (
  exists (
    select 1 from public.users 
    where id = seller_id 
    and auth_id = auth.uid() 
    and role = 'seller'
  )
);

create policy "Sellers can update their own products" 
on public.products for update 
using (
  exists (
    select 1 from public.users 
    where id = seller_id 
    and auth_id = auth.uid() 
    and role = 'seller'
  )
);

create policy "Sellers can delete their own products" 
on public.products for delete 
using (
  exists (
    select 1 from public.users 
    where id = seller_id 
    and auth_id = auth.uid() 
    and role = 'seller'
  )
);

-- RLS Policies for orders table
create policy "Buyers can view their own orders" 
on public.orders for select 
using (
  exists (
    select 1 from public.users 
    where id = buyer_id 
    and auth_id = auth.uid()
  )
);

create policy "Sellers can view orders for their products" 
on public.orders for select 
using (
  exists (
    select 1 from public.products p
    join public.users u on p.seller_id = u.id
    where p.id = product_id 
    and u.auth_id = auth.uid()
  )
);

create policy "Anyone can create orders" 
on public.orders for insert 
with check (true);

create policy "Sellers can update order status for their products" 
on public.orders for update 
using (
  exists (
    select 1 from public.products p
    join public.users u on p.seller_id = u.id
    where p.id = product_id 
    and u.auth_id = auth.uid()
  )
);

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (auth_id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'seller'
  );
  return new;
end;
$$;

-- Trigger to create user profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- NOT APPLIED YET: run this in the Paystack phase.
create type public.order_status as enum ('pending','paid','failed','cancelled','fulfilled','refunded');

create table public.orders (
  id                 uuid primary key default gen_random_uuid(),
  reference          text not null unique,          -- our ref, also sent to Paystack
  email              citext not null,
  customer_name      text not null,
  phone              text not null,
  shipping_address   jsonb not null,                -- {line1, city, state, notes}
  subtotal           integer not null check (subtotal >= 0),
  discount_total     integer not null default 0 check (discount_total >= 0),
  delivery_fee       integer not null default 0 check (delivery_fee >= 0),
  total              integer not null check (total >= 0),
  currency           text not null default 'NGN',
  status             public.order_status not null default 'pending',
  paystack_reference text unique,
  paystack_payload   jsonb,                         -- raw verified webhook payload
  paid_at            timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index orders_status_idx on public.orders (status, created_at desc);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  variant_id   uuid references public.product_variants(id) on delete set null,
  product_name text not null,                       -- snapshot at purchase time
  brand        text not null,
  colorway     text not null,
  size_eu      text not null,
  unit_price   integer not null check (unit_price >= 0),
  quantity     integer not null check (quantity > 0),
  promotion_id uuid references public.promotions(id) on delete set null
);
create index order_items_order_idx on public.order_items (order_id);

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
-- Orders are created/updated only by server routes (service role). Admins can read/update.
create policy "orders admin all" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "order_items admin all" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

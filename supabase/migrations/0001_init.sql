-- ============================================================
-- Clutch Kicks — core schema
-- ============================================================
create extension if not exists citext;

-- ---------- Enums ----------
create type public.silhouette as enum ('Low-Top','High-Top','Runner','Slide','Platform','Slip-On');
create type public.product_badge as enum ('NEW','BACK IN STOCK','TRENDING','FINAL PAIR','SALE');
create type public.discount_type as enum ('percent','fixed');
create type public.promo_scope as enum ('all','brand','products');
create type public.subscriber_status as enum ('subscribed','unsubscribed');
create type public.broadcast_status as enum ('draft','sending','sent','failed');

-- ---------- updated_at helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Admins ----------
create table public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ---------- Products ----------
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  brand        text not null check (char_length(brand) between 1 and 80),
  name         text not null check (char_length(name) between 1 and 120),
  description  text not null default '',
  silhouette   public.silhouette not null,
  badge        public.product_badge,
  is_published boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index products_published_idx on public.products (is_published, sort_order);
create index products_brand_idx on public.products (lower(brand));
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------- Variants (colourways) ----------
create table public.product_variants (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references public.products(id) on delete cascade,
  slug             text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  colorway         text not null check (char_length(colorway) between 1 and 120),
  swatch_hex       text check (swatch_hex ~ '^#[0-9a-fA-F]{6}$'),
  price            integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price > price),
  in_stock         boolean not null default true,
  is_default       boolean not null default false,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (product_id, slug)
);
create index product_variants_product_idx on public.product_variants (product_id, sort_order);
-- at most one default variant per product
create unique index product_variants_one_default
  on public.product_variants (product_id) where is_default;
create trigger product_variants_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();

-- ---------- Variant images ----------
create table public.variant_images (
  id           uuid primary key default gen_random_uuid(),
  variant_id   uuid not null references public.product_variants(id) on delete cascade,
  storage_path text not null,               -- path inside the product-images bucket
  alt          text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);
create index variant_images_variant_idx on public.variant_images (variant_id, sort_order);

-- ---------- Variant sizes ----------
create table public.variant_sizes (
  id         uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  eu         text not null check (eu ~ '^[0-9]{2}(\.5)?$'),
  in_stock   boolean not null default true,
  low_stock  boolean not null default false,
  sort_order integer not null default 0,
  unique (variant_id, eu)
);
create index variant_sizes_variant_idx on public.variant_sizes (variant_id, sort_order);

-- ---------- Promotions ----------
create table public.promotions (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(name) between 1 and 120),
  discount_type  public.discount_type not null,
  discount_value integer not null check (discount_value > 0),
  scope          public.promo_scope not null default 'products',
  target_brand   text,
  starts_at      timestamptz,
  ends_at        timestamptz,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (discount_type <> 'percent' or discount_value <= 90),
  check (ends_at is null or starts_at is null or ends_at > starts_at),
  check ((scope = 'brand') = (target_brand is not null))
);
create trigger promotions_updated_at before update on public.promotions
  for each row execute function public.set_updated_at();

create table public.promotion_products (
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  product_id   uuid not null references public.products(id) on delete cascade,
  primary key (promotion_id, product_id)
);
create index promotion_products_product_idx on public.promotion_products (product_id);

-- ---------- Effective price per variant (best active promo wins) ----------
create or replace view public.variant_prices
with (security_invoker = true) as
select
  v.id         as variant_id,
  v.product_id,
  v.price      as base_price,
  coalesce(best.discounted, v.price) as final_price,
  case when best.discounted is not null then v.price else v.compare_at_price end
               as compare_at_price,
  best.promotion_id,
  best.promotion_name,
  best.discount_type,
  best.discount_value
from public.product_variants v
join public.products p on p.id = v.product_id
left join lateral (
  select
    pr.id   as promotion_id,
    pr.name as promotion_name,
    pr.discount_type,
    pr.discount_value,
    greatest(0,
      case pr.discount_type
        when 'percent' then round(v.price * (100 - pr.discount_value) / 100.0)::int
        else v.price - pr.discount_value
      end) as discounted
  from public.promotions pr
  where pr.is_active
    and (pr.starts_at is null or pr.starts_at <= now())
    and (pr.ends_at   is null or pr.ends_at   >  now())
    and (
      pr.scope = 'all'
      or (pr.scope = 'brand' and lower(pr.target_brand) = lower(p.brand))
      or (pr.scope = 'products' and exists (
            select 1 from public.promotion_products pp
            where pp.promotion_id = pr.id and pp.product_id = p.id))
    )
  order by discounted asc
  limit 1
) best on true;

-- ---------- Newsletter ----------
create table public.newsletter_subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             citext not null unique check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  status            public.subscriber_status not null default 'subscribed',
  unsubscribe_token uuid not null unique default gen_random_uuid(),
  source            text,                       -- 'footer', 'homepage-band', ...
  subscribed_at     timestamptz not null default now(),
  unsubscribed_at   timestamptz
);
create index newsletter_subscribers_status_idx on public.newsletter_subscribers (status);

create table public.broadcasts (
  id              uuid primary key default gen_random_uuid(),
  subject         text not null check (char_length(subject) between 1 and 200),
  body            text not null,                -- plain text / light markdown written by the client
  status          public.broadcast_status not null default 'draft',
  recipient_count integer not null default 0,
  sent_count      integer not null default 0,
  failed_count    integer not null default 0,
  error           text,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  sent_at         timestamptz
);
create trigger broadcasts_updated_at before update on public.broadcasts
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.admin_users            enable row level security;
alter table public.products               enable row level security;
alter table public.product_variants       enable row level security;
alter table public.variant_images         enable row level security;
alter table public.variant_sizes          enable row level security;
alter table public.promotions             enable row level security;
alter table public.promotion_products     enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.broadcasts             enable row level security;

-- admin_users: a user may see only their own row (used by middleware check)
create policy "admin_users self read" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- products: public sees published; admins do everything
create policy "products public read" on public.products
  for select to anon, authenticated using (is_published or public.is_admin());
create policy "products admin write" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- children of products: visible when parent is published
create policy "variants public read" on public.product_variants
  for select to anon, authenticated using (
    public.is_admin() or exists (
      select 1 from public.products p where p.id = product_id and p.is_published));
create policy "variants admin write" on public.product_variants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "images public read" on public.variant_images
  for select to anon, authenticated using (
    public.is_admin() or exists (
      select 1 from public.product_variants v
      join public.products p on p.id = v.product_id
      where v.id = variant_id and p.is_published));
create policy "images admin write" on public.variant_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "sizes public read" on public.variant_sizes
  for select to anon, authenticated using (
    public.is_admin() or exists (
      select 1 from public.product_variants v
      join public.products p on p.id = v.product_id
      where v.id = variant_id and p.is_published));
create policy "sizes admin write" on public.variant_sizes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- promotions: readable by all (needed by variant_prices view), admin write
create policy "promotions public read" on public.promotions
  for select to anon, authenticated using (true);
create policy "promotions admin write" on public.promotions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "promotion_products public read" on public.promotion_products
  for select to anon, authenticated using (true);
create policy "promotion_products admin write" on public.promotion_products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- newsletter + broadcasts: admin only. Public subscribe/unsubscribe goes through
-- server routes using the service-role key (bypasses RLS), never the anon client.
create policy "subscribers admin all" on public.newsletter_subscribers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "broadcasts admin all" on public.broadcasts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.variant_prices to anon, authenticated;

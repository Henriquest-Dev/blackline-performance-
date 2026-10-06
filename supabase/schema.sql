-- =============================================================================
-- Blackline Performance — base de dados Supabase
-- Executar UMA vez no Supabase: SQL Editor → New query → colar tudo → Run.
-- Pode voltar a executar sem perder dados (é idempotente).
--
-- Tabelas:
--   admins    quem pode entrar no painel (ligado a Authentication → Users)
--   settings  serviços, preços, promoções, contactos e dados das cotações (1 linha, JSON)
--   bookings  marcações feitas no site
--   quotes    cotações (uma por marcação) + PDF guardado no Storage (bucket "quotes")
--
-- Segurança (Row Level Security):
--   visitantes  → leem settings, CRIAM marcações; não leem marcações de ninguém
--   admins      → tudo
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Administradores
-- -----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admins enable row level security;
drop policy if exists "admins: ver o próprio registo" on public.admins;
create policy "admins: ver o próprio registo" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- updated_at automático
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Definições do site (serviços, preços, promoções, contactos, empresa)
-- -----------------------------------------------------------------------------
create table if not exists public.settings (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
insert into public.settings (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

alter table public.settings enable row level security;
drop policy if exists "settings: leitura pública" on public.settings;
create policy "settings: leitura pública" on public.settings
  for select to anon, authenticated using (true);
drop policy if exists "settings: admins editam" on public.settings;
create policy "settings: admins editam" on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "settings: admins inserem" on public.settings;
create policy "settings: admins inserem" on public.settings
  for insert to authenticated with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Marcações
-- -----------------------------------------------------------------------------
create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  ref            text not null unique check (char_length(ref) between 6 and 40),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  status         text not null default 'novo'
                 check (status in ('novo', 'contactado', 'confirmado', 'concluido', 'cancelado')),
  -- cliente
  first_name     text not null check (char_length(first_name) between 1 and 80),
  last_name      text not null default '' check (char_length(last_name) <= 80),
  phone          text not null check (phone ~ '^8[2-7][0-9]{7}$'),
  email          text check (email is null or (char_length(email) <= 160 and email like '%@%')),
  contact_pref   text not null default 'whatsapp' check (contact_pref in ('whatsapp', 'chamada', 'email')),
  lang           text not null default 'pt' check (lang in ('pt', 'en')),
  -- pedido
  services       text[] not null default '{}' check (cardinality(services) between 1 and 40),
  services_label text check (char_length(services_label) <= 1500),
  total          text check (char_length(total) <= 120),
  promo          text check (char_length(promo) <= 600),
  -- viatura
  brand          text check (char_length(brand) <= 60),
  model          text not null check (char_length(model) between 1 and 80),
  year           text check (char_length(year) <= 4),
  km             text check (char_length(km) <= 12),
  fuel           text check (fuel is null or fuel in ('', 'gasolina', 'diesel', 'hibrido', 'eletrico')),
  plate          text check (char_length(plate) <= 12),
  chassis        text not null check (chassis ~ '^[A-Z0-9-]{6,20}$'),
  -- agenda
  appt_date      date not null,
  appt_time      text not null check (appt_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  dropoff        text not null default 'oficina' check (dropoff in ('oficina', 'recolha')),
  notes          text check (char_length(notes) <= 2000),
  -- interno
  internal_note  text check (char_length(internal_note) <= 4000)
);

create index if not exists bookings_created_idx on public.bookings (created_at desc);
create index if not exists bookings_appt_idx on public.bookings (appt_date, appt_time);
create index if not exists bookings_phone_idx on public.bookings (phone, created_at desc);

-- Pedidos do site: força estado inicial, limpa campos internos e trava repetições
create or replace function public.bookings_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.status        := 'novo';
    new.internal_note := null;
    new.created_at    := now();
    if new.appt_date < current_date then
      raise exception 'invalid_date' using errcode = '22023';
    end if;
    if exists (
      select 1 from public.bookings
      where phone = new.phone and created_at > now() - interval '60 seconds'
    ) then
      raise exception 'too_many_requests' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_guard on public.bookings;
create trigger bookings_guard before insert on public.bookings
  for each row execute function public.bookings_before_insert();

drop trigger if exists bookings_touch on public.bookings;
create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();

alter table public.bookings enable row level security;
drop policy if exists "bookings: qualquer pessoa cria" on public.bookings;
create policy "bookings: qualquer pessoa cria" on public.bookings
  for insert to anon, authenticated with check (true);
drop policy if exists "bookings: admins leem" on public.bookings;
create policy "bookings: admins leem" on public.bookings
  for select to authenticated using (public.is_admin());
drop policy if exists "bookings: admins editam" on public.bookings;
create policy "bookings: admins editam" on public.bookings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "bookings: admins apagam" on public.bookings;
create policy "bookings: admins apagam" on public.bookings
  for delete to authenticated using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Cotações
-- -----------------------------------------------------------------------------
create table if not exists public.quotes (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null unique references public.bookings (id) on delete cascade,
  number      text not null check (char_length(number) between 1 and 60),
  lang        text not null default 'pt' check (lang in ('pt', 'en')),
  data        jsonb not null,
  total       numeric(14, 2) not null default 0,
  pdf_path    text,
  sent_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid default auth.uid() references auth.users (id) on delete set null
);

drop trigger if exists quotes_touch on public.quotes;
create trigger quotes_touch before update on public.quotes
  for each row execute function public.touch_updated_at();

alter table public.quotes enable row level security;
drop policy if exists "quotes: só admins" on public.quotes;
create policy "quotes: só admins" on public.quotes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Permissões das tabelas (o RLS acima decide linha a linha)
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.settings to anon, authenticated;
grant insert, update on public.settings to authenticated;
grant insert on public.bookings to anon, authenticated;
grant select, update, delete on public.bookings to authenticated;
grant select, insert, update, delete on public.quotes to authenticated;
grant select on public.admins to authenticated;

-- -----------------------------------------------------------------------------
-- Storage: PDFs das cotações (privado; o cliente recebe um link temporário)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('quotes', 'quotes', false)
on conflict (id) do nothing;

drop policy if exists "quotes pdf: admins leem" on storage.objects;
create policy "quotes pdf: admins leem" on storage.objects
  for select to authenticated using (bucket_id = 'quotes' and public.is_admin());
drop policy if exists "quotes pdf: admins enviam" on storage.objects;
create policy "quotes pdf: admins enviam" on storage.objects
  for insert to authenticated with check (bucket_id = 'quotes' and public.is_admin());
drop policy if exists "quotes pdf: admins substituem" on storage.objects;
create policy "quotes pdf: admins substituem" on storage.objects
  for update to authenticated using (bucket_id = 'quotes' and public.is_admin());
drop policy if exists "quotes pdf: admins apagam" on storage.objects;
create policy "quotes pdf: admins apagam" on storage.objects
  for delete to authenticated using (bucket_id = 'quotes' and public.is_admin());

-- -----------------------------------------------------------------------------
-- Tempo real: o painel recebe novas marcações sem recarregar
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bookings'
     ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end;
$$;

-- =============================================================================
-- ÚLTIMO PASSO — dar acesso ao painel
-- 1. Authentication → Users → Add user → Create new user
--    (email + palavra-passe, marque "Auto Confirm User").
-- 2. Troque o email abaixo pelo desse utilizador e execute só estas linhas:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'admin@blacklineperformance.co.mz'
-- on conflict do nothing;
--
-- 3. Recomendado: Authentication → Sign In / Providers → Email →
--    desligar "Allow new users to sign up".
-- =============================================================================

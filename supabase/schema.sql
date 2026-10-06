-- =====================================================================
-- BLACKLINE PERFORMANCE — base de dados (Supabase)
-- Supabase → SQL Editor → New query → colar TUDO → Run.
-- No fim deve aparecer uma linha com estado = OK, tabelas_criadas = 3 e funcoes_criadas = 10.
-- Pode voltar a executar: não apaga dados nem muda a palavra-passe.
-- As credenciais do painel NÃO estão neste ficheiro (o repositório é público):
-- defina-as com o bloco "credenciais" enviado em privado (ver fim do ficheiro).
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public;

-- ---------------------------------------------------------------------
-- TABELAS
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  ref            text not null unique check (char_length(ref) between 6 and 40),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  status         text not null default 'novo' check (status in ('novo','contactado','confirmado','concluido','cancelado')),
  first_name     text not null check (char_length(first_name) between 1 and 80),
  last_name      text not null default '' check (char_length(last_name) <= 80),
  phone          text not null check (phone ~ '^8[2-7][0-9]{7}$'),
  email          text check (email is null or (char_length(email) <= 160 and email like '%@%')),
  contact_pref   text not null default 'whatsapp' check (contact_pref in ('whatsapp','chamada','email')),
  lang           text not null default 'pt' check (lang in ('pt','en')),
  services       text[] not null check (cardinality(services) between 1 and 40),
  services_label text check (char_length(services_label) <= 1500),
  total          text check (char_length(total) <= 120),
  promo          text check (char_length(promo) <= 600),
  brand          text check (char_length(brand) <= 60),
  model          text not null check (char_length(model) between 1 and 80),
  year           text check (char_length(year) <= 4),
  km             text check (char_length(km) <= 12),
  fuel           text check (fuel is null or fuel in ('','gasolina','diesel','hibrido','eletrico')),
  plate          text check (char_length(plate) <= 12),
  chassis        text not null check (chassis ~ '^[A-Z0-9-]{6,20}$'),
  appt_date      date not null,
  appt_time      text not null check (appt_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  dropoff        text not null default 'oficina' check (dropoff in ('oficina','recolha')),
  notes          text check (char_length(notes) <= 2000),
  internal_note  text check (char_length(internal_note) <= 4000)
);
create index if not exists bookings_created_idx on public.bookings (created_at desc);
create index if not exists bookings_phone_idx   on public.bookings (phone, created_at desc);

create table if not exists public.quotes (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null unique references public.bookings (id) on delete cascade,
  public_key  uuid not null unique default gen_random_uuid(),
  number      text not null check (char_length(number) between 1 and 60),
  lang        text not null default 'pt' check (lang in ('pt','en')),
  data        jsonb not null,
  total       numeric(14,2) not null default 0,
  pdf_base64  text check (pdf_base64 is null or length(pdf_base64) < 4000000),
  sent_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- acesso ao painel (esquema privado: invisível para a API)
create table if not exists private.admin_account (
  id         int primary key default 1 check (id = 1),
  username   text not null,
  pass_hash  text not null,
  updated_at timestamptz not null default now()
);

create table if not exists private.admin_sessions (
  token      uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '12 hours'
);
create table if not exists private.login_attempts (
  id bigserial primary key,
  at timestamptz not null default now(),
  ok boolean not null
);

-- ---------------------------------------------------------------------
-- REGRAS AUTOMÁTICAS
-- ---------------------------------------------------------------------
create or replace function private.touch() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

create or replace trigger bookings_touch before update on public.bookings for each row execute function private.touch();
create or replace trigger quotes_touch before update on public.quotes for each row execute function private.touch();

-- pedidos do site: estado inicial forçado, sem datas passadas, 1 pedido por número a cada 60 s
create or replace function private.booking_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.status := 'novo';
  new.internal_note := null;
  new.created_at := now();
  if new.appt_date < current_date then raise exception 'invalid_date'; end if;
  if exists (select 1 from public.bookings where phone = new.phone and created_at > now() - interval '60 seconds') then
    raise exception 'too_many_requests';
  end if;
  return new;
end; $$;
create or replace trigger bookings_guard before insert on public.bookings for each row execute function private.booking_guard();

-- ---------------------------------------------------------------------
-- SEGURANÇA: visitantes só leem definições e criam marcações
-- ---------------------------------------------------------------------
alter table public.settings enable row level security;
alter table public.bookings enable row level security;
alter table public.quotes   enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'settings' and policyname = 'settings_read') then
    create policy settings_read on public.settings for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'bookings_create') then
    create policy bookings_create on public.bookings for insert to anon, authenticated with check (true);
  end if;
end $$;

revoke all on public.settings, public.bookings, public.quotes from anon, authenticated;
grant select on public.settings to anon, authenticated;
grant insert on public.bookings to anon, authenticated;

-- ---------------------------------------------------------------------
-- FUNÇÕES DO PAINEL (todas exigem sessão válida)
-- ---------------------------------------------------------------------
create or replace function private.require_session(p_token uuid) returns void
language plpgsql security definer set search_path = private, public as $$
begin
  delete from private.admin_sessions where expires_at < now();
  delete from private.login_attempts where at < now() - interval '30 days';
  update private.admin_sessions set expires_at = now() + interval '12 hours' where token = p_token;
  if not found then raise exception 'session_expired'; end if;
end; $$;

create or replace function public.admin_login(p_username text, p_password text) returns uuid
language plpgsql security definer set search_path = private, public, extensions as $$
declare v_token uuid;
begin
  if (select count(*) from private.login_attempts where not ok and at > now() - interval '15 minutes') >= 8 then
    raise exception 'locked';
  end if;
  if exists (select 1 from private.admin_account
             where lower(username) = lower(trim(p_username)) and pass_hash = extensions.crypt(p_password, pass_hash)) then
    insert into private.login_attempts (ok) values (true);
    insert into private.admin_sessions default values returning token into v_token;
    return v_token;
  end if;
  insert into private.login_attempts (ok) values (false);
  return null;   -- credenciais erradas (sem erro, para a tentativa ficar registada)
end; $$;

create or replace function public.admin_ping(p_token uuid) returns boolean
language plpgsql security definer set search_path = private, public as $$
begin perform private.require_session(p_token); return true; end; $$;

create or replace function public.admin_logout(p_token uuid) returns void
language sql security definer set search_path = private as $$
  delete from private.admin_sessions where token = p_token;
$$;

create or replace function public.admin_change_password(p_token uuid, p_old text, p_new text) returns void
language plpgsql security definer set search_path = private, public, extensions as $$
begin
  perform private.require_session(p_token);
  if not exists (select 1 from private.admin_account where pass_hash = extensions.crypt(p_old, pass_hash)) then
    raise exception 'auth';
  end if;
  if char_length(coalesce(p_new, '')) < 8 then raise exception 'weak_password'; end if;
  update private.admin_account set pass_hash = extensions.crypt(p_new, extensions.gen_salt('bf', 10)), updated_at = now();
  delete from private.admin_sessions where token <> p_token;   -- termina as outras sessões
end; $$;

create or replace function public.admin_list_bookings(p_token uuid) returns jsonb
language plpgsql security definer set search_path = private, public as $$
begin
  perform private.require_session(p_token);
  return coalesce((
    select jsonb_agg(to_jsonb(b) || jsonb_build_object('quote',
             (select (to_jsonb(q) - 'pdf_base64') || jsonb_build_object('has_pdf', q.pdf_base64 is not null)
              from public.quotes q where q.booking_id = b.id))
           order by b.created_at desc)
    from public.bookings b), '[]'::jsonb);
end; $$;

create or replace function public.admin_update_booking(p_token uuid, p_id uuid, p_patch jsonb) returns void
language plpgsql security definer set search_path = private, public as $$
begin
  perform private.require_session(p_token);
  update public.bookings set
    status        = case when p_patch ? 'status' then p_patch->>'status' else status end,
    internal_note = case when p_patch ? 'internal_note' then nullif(p_patch->>'internal_note', '') else internal_note end
  where id = p_id;
  if not found then raise exception 'not_found'; end if;
end; $$;

create or replace function public.admin_delete_booking(p_token uuid, p_id uuid) returns void
language plpgsql security definer set search_path = private, public as $$
begin
  perform private.require_session(p_token);
  delete from public.bookings where id = p_id;
end; $$;

create or replace function public.admin_save_settings(p_token uuid, p_data jsonb) returns void
language plpgsql security definer set search_path = private, public as $$
begin
  perform private.require_session(p_token);
  if jsonb_typeof(p_data) <> 'object' then raise exception 'bad_settings'; end if;
  insert into public.settings (id, data, updated_at) values (1, p_data, now())
  on conflict (id) do update set data = excluded.data, updated_at = now();
end; $$;

create or replace function public.admin_save_quote(p_token uuid, p_booking_id uuid, p_quote jsonb,
                                                   p_pdf_base64 text default null, p_sent boolean default false)
returns uuid
language plpgsql security definer set search_path = private, public as $$
declare v_key uuid;
begin
  perform private.require_session(p_token);
  insert into public.quotes (booking_id, number, lang, data, total, pdf_base64, sent_at)
  values (p_booking_id, coalesce(p_quote->>'number', 'COT'), coalesce(p_quote->>'lang', 'pt'), p_quote,
          coalesce((p_quote->>'total')::numeric, 0), p_pdf_base64, case when p_sent then now() end)
  on conflict (booking_id) do update set
    number     = excluded.number,
    lang       = excluded.lang,
    data       = excluded.data,
    total      = excluded.total,
    pdf_base64 = coalesce(excluded.pdf_base64, public.quotes.pdf_base64),
    sent_at    = case when p_sent then now() else public.quotes.sent_at end
  returning public_key into v_key;
  if p_sent then
    update public.bookings set status = 'contactado' where id = p_booking_id and status = 'novo';
  end if;
  return v_key;
end; $$;

-- link que o cliente recebe no WhatsApp (só funciona com a chave secreta do link)
create or replace function public.get_quote_pdf(p_key uuid) returns jsonb
language sql security definer set search_path = public as $$
  select jsonb_build_object('number', number, 'lang', lang, 'pdf', pdf_base64)
  from public.quotes
  where public_key = p_key and pdf_base64 is not null
    and (sent_at is null or sent_at > now() - interval '180 days');
$$;

-- permissões das funções
do $$
declare f text;
begin
  foreach f in array array[
    'public.admin_login(text,text)', 'public.admin_ping(uuid)', 'public.admin_logout(uuid)',
    'public.admin_change_password(uuid,text,text)', 'public.admin_list_bookings(uuid)',
    'public.admin_update_booking(uuid,uuid,jsonb)', 'public.admin_delete_booking(uuid,uuid)',
    'public.admin_save_settings(uuid,jsonb)', 'public.admin_save_quote(uuid,uuid,jsonb,text,boolean)',
    'public.get_quote_pdf(uuid)']
  loop
    execute format('revoke all on function %s from public', f);
    execute format('grant execute on function %s to anon, authenticated', f);
  end loop;
end $$;
revoke all on all functions in schema private from public, anon, authenticated;

-- atualizar a API do Supabase e mostrar o resultado
notify pgrst, 'reload schema';

select 'OK' as estado,
  (select count(*) from information_schema.tables
    where table_schema = 'public' and table_name in ('settings','bookings','quotes')) as tabelas_criadas,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and (p.proname like 'admin\_%' or p.proname = 'get_quote_pdf')) as funcoes_criadas,
  (select username from private.admin_account where id = 1) as utilizador_do_painel;

-- =====================================================================
-- CREDENCIAIS DO PAINEL (executar à parte, com os seus dados; não guardar no repositório)
--
-- insert into private.admin_account (id, username, pass_hash)
-- values (1, 'UTILIZADOR', extensions.crypt('PALAVRA-PASSE', extensions.gen_salt('bf', 10)))
-- on conflict (id) do update set username = excluded.username, pass_hash = excluded.pass_hash, updated_at = now();
-- delete from private.admin_sessions;
-- =====================================================================

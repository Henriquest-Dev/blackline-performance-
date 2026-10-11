-- Blackline Performance — email para a oficina sempre que entra uma marcação (via Google Apps Script).
-- Correr no Supabase → SQL Editor. Não apaga nada e pode ser corrido mais de uma vez.
-- Não leva chaves nem endereços: esses valores põem-se depois, no "Passo 3" (ver docs/avisos-por-email.md).

do $$
begin
  create extension if not exists pg_net with schema extensions;
exception when others then
  raise notice 'pg_net não ficou ativo (%). Ative-o em Database > Extensions e volte a executar.', sqlerrm;
end
$$;

-- configuração privada (a API pública não vê o schema "private")
create table if not exists private.email_config (
  id         int primary key default 1 check (id = 1),
  enabled    boolean not null default false,
  url        text,                                   -- endereço /exec do script do Google
  key        text,                                   -- a mesma chave que está no script
  to_addrs   text,                                   -- emails que recebem (separados por vírgula, máx. 5)
  admin_url  text not null default 'https://blacklineperformance.space/admin.html'
);
insert into private.email_config (id) values (1) on conflict (id) do nothing;

create or replace function private.notify_booking_email() returns trigger
language plpgsql security definer set search_path = private, public, extensions as $$
declare
  c private.email_config;
  wa text;
  quando text;
  carro text;
  corpo text;
begin
  select * into c from private.email_config where id = 1;
  if c.enabled is not true or coalesce(c.url, '') = '' or coalesce(c.to_addrs, '') = '' then
    return new;
  end if;
  begin
    wa := regexp_replace(coalesce(new.phone, ''), '\D', '', 'g');
    if length(wa) = 9 then wa := '258' || wa; end if;
    quando := to_char(new.appt_date, 'DD/MM/YYYY') || ' às ' || new.appt_time;
    carro := nullif(trim(coalesce(new.brand, '') || ' ' || coalesce(new.model, '')), '');

    corpo := concat_ws(E'\n',
      'Chegou uma nova marcação pelo site.',
      '',
      'Referência: ' || new.ref,
      'Data e hora: ' || quando,
      'Entrega: ' || case new.dropoff when 'recolha' then 'Recolha e entrega no endereço do cliente' else 'O cliente deixa a viatura na oficina' end,
      '',
      'CLIENTE',
      'Nome: ' || trim(new.first_name || ' ' || new.last_name),
      'Telemóvel: +258 ' || substr(new.phone, 1, 2) || ' ' || substr(new.phone, 3, 3) || ' ' || substr(new.phone, 6),
      case when length(wa) between 10 and 15 then 'Falar no WhatsApp: https://wa.me/' || wa end,
      case when coalesce(new.email, '') <> '' then 'Email: ' || new.email end,
      'Prefere ser contactado por: ' || case new.contact_pref when 'chamada' then 'chamada' when 'email' then 'email' else 'WhatsApp' end,
      '',
      'SERVIÇOS',
      '- ' || replace(coalesce(new.services_label, array_to_string(new.services, ', ')), '; ', E'\n- '),
      'Total estimado: ' || coalesce(new.total, '-'),
      case when coalesce(new.promo, '') <> '' then 'Promoção: ' || new.promo end,
      '',
      'VIATURA',
      'Marca e modelo: ' || coalesce(carro, '-'),
      case when coalesce(new.year, '') <> '' then 'Ano: ' || new.year end,
      case when coalesce(new.km, '') <> '' then 'Quilometragem: ' || new.km || ' km' end,
      case when coalesce(new.fuel, '') <> '' then 'Combustível: ' || new.fuel end,
      case when coalesce(new.plate, '') <> '' then 'Matrícula: ' || new.plate end,
      'Chassis (VIN): ' || new.chassis,
      case when coalesce(new.notes, '') <> '' then E'\nPEDIDO DO CLIENTE\n' || new.notes end,
      '',
      'Para responder e preparar a cotação, abra o painel: ' || c.admin_url
    );

    perform net.http_post(
      url := c.url,
      body := jsonb_strip_nulls(jsonb_build_object(
        'chave', coalesce(c.key, ''),
        'para', c.to_addrs,
        'assunto', 'Nova marcação ' || new.ref || ' — ' || trim(new.first_name || ' ' || new.last_name)
                   || coalesce(' · ' || carro, '') || ' · ' || to_char(new.appt_date, 'DD/MM') || ' ' || new.appt_time,
        'texto', corpo,
        'responder', nullif(new.email, '')
      )),
      headers := jsonb_build_object('Content-Type', 'application/json')
    );
  exception when others then
    null;  -- um aviso que falhe NUNCA impede a marcação de ser gravada
  end;
  return new;
end $$;

create or replace trigger bookings_notify_email after insert on public.bookings
  for each row execute function private.notify_booking_email();

select 'OK' as estado, enabled as email_ligado from private.email_config where id = 1;

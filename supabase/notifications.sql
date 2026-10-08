-- Blackline Performance — aviso no telemóvel quando entra uma marcação nova (app gratuita "ntfy").
-- Correr UMA vez no Supabase → SQL Editor → New query → colar tudo → Run.
-- Não apaga nada e pode ser corrido outra vez sem problema (mantém o mesmo tópico).
-- No fim aparece o TÓPICO: é o "endereço secreto" que se escreve na app ntfy (ver docs/notificacoes.md).

create extension if not exists pg_net with schema extensions;

-- configuração privada (a API pública não vê o schema "private")
create table if not exists private.notify_config (
  id         int primary key default 1 check (id = 1),
  enabled    boolean not null default true,
  topic      text not null,
  click_url  text not null default ''
);
insert into private.notify_config (topic, click_url)
values ('blp-' || encode(extensions.gen_random_bytes(10), 'hex'), 'https://henriquest-dev.github.io/blackline-performance-/admin.html')
on conflict (id) do nothing;

-- envia o aviso; qualquer falha de rede NUNCA impede a marcação de ser gravada
create or replace function private.notify_new_booking() returns trigger
language plpgsql security definer set search_path = private, public, extensions as $$
declare
  c private.notify_config;
  quando text;
begin
  select * into c from private.notify_config where id = 1;
  if c.enabled is not true then return new; end if;
  begin
    quando := to_char(new.appt_date, 'DD/MM') || ' às ' || new.appt_time;
    perform net.http_post(
      url := 'https://ntfy.sh',
      body := jsonb_strip_nulls(jsonb_build_object(
        'topic', c.topic,
        'title', 'Nova marcação — Blackline',
        'message', new.first_name || ' ' || new.last_name || E'\n' ||
                   coalesce(nullif(trim(coalesce(new.brand, '') || ' ' || coalesce(new.model, '')), ''), 'Viatura') || E'\n' ||
                   coalesce(left(new.services_label, 140), '') || E'\n' || quando,
        'priority', 4,
        'tags', jsonb_build_array('car'),
        'click', nullif(c.click_url, '')
      ))
    );
  exception when others then
    null;
  end;
  return new;
end $$;

create or replace trigger bookings_notify after insert on public.bookings
  for each row execute function private.notify_new_booking();

-- resultado: copie o valor de "topico" para a app ntfy
select 'OK' as estado, topic as topico from private.notify_config where id = 1;

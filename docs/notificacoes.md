# Aviso no telemóvel quando entra uma marcação

Quando um cliente faz uma marcação no site, o Supabase envia um aviso para a app gratuita **ntfy** (ntfy.sh) no telemóvel — mesmo com o
painel fechado e o telemóvel bloqueado. Sem conta, sem domínio e sem custos.

## Ativar (uma vez)

1. **Supabase → SQL Editor → New query** → colar o ficheiro [`supabase/notifications.sql`](../supabase/notifications.sql) → **Run**.
   No fim aparece uma linha `OK` com o **tópico** (algo como `blp-8ea07cbb015a3da84f4e`). Copie-o. Pode correr o script outra vez sem mudar o tópico.
2. No telemóvel, instalar a app **ntfy** (Android: Google Play ou F-Droid · iPhone: App Store).
3. Na app: **+** → escrever o tópico exatamente como apareceu → *Subscribe*. Aceitar as notificações do sistema.
   - Android: em *Definições da app → Bateria*, escolher "Sem restrições", para os avisos chegarem sempre.
4. Testar: fazer uma marcação no site. O aviso chega em poucos segundos com o nome do cliente, viatura, serviços e data. Tocar abre o painel.

Vários telemóveis (sócio, mecânico): subscrever o mesmo tópico em cada um.

## Privacidade

- O tópico é o "endereço secreto": quem o souber lê os avisos. Não o publique.
- O aviso leva só nome, viatura, serviços e data — **não** leva telemóvel, email nem chassis. Passa pelo servidor público ntfy.sh.
- Para mudar de tópico: SQL Editor → `update private.notify_config set topic = 'blp-novo-segredo-aqui' where id = 1;`
- Para desligar: `update private.notify_config set enabled = false where id = 1;` (e `true` para voltar a ligar).
- Para o toque no aviso abrir o endereço novo do painel: `update private.notify_config set click_url = 'https://blacklineperformance.space/admin.html' where id = 1;`

Se o envio do aviso falhar (sem rede, ntfy em baixo), a marcação do cliente é gravada na mesma.

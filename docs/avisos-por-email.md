# Email para a Blackline sempre que entra uma marcação (Supabase + Google Apps Script)

Quando um cliente envia a marcação no site, a Blackline recebe **um email com todos os dados**: nome, telemóvel, link do WhatsApp, email,
serviços escolhidos (com as subopções), total, viatura (marca, modelo, ano, km, matrícula, chassis), data e hora, entrega e o
pedido estruturado do cliente. Não é preciso ter o painel aberto. Gratuito, sem instalar nada.

```
Cliente envia a marcação → linha nova em public.bookings (Supabase)
                         → trigger bookings_notify_email (usa pg_net)
                         → POST para o script do Google (Apps Script)
                         → MailApp.sendEmail → email na caixa da Blackline
```

- Se o aviso falhar, **a marcação é gravada na mesma**.
- O email leva o `Responder` ligado ao email do cliente (quando ele o deu).
- Convive com o aviso do telemóvel (ntfy): são dois avisos independentes.
- A chave serve para só a base de dados poder mandar o script enviar emails.

## Passo 1 — o script do Google

1. **script.google.com → Novo projeto** (com a conta Google cujo email vai enviar; os emails saem desta conta).
2. Apagar o que lá está e colar o conteúdo de [`supabase/email-aviso.gs`](../supabase/email-aviso.gs).
3. Na linha `const CHAVE`, trocar o texto pela chave que lhe foi dada (palavra-passe comprida) e **anotá-la**.
4. **Implementar → Nova implementação → Tipo: Aplicação Web** — *Executar como:* **Eu** · *Quem tem acesso:* **Qualquer pessoa**.
5. Autorizar. O Google avisa "app não verificada": **Avançadas → Ir para o projeto (não seguro) → Permitir**.
   Pode abrir uma página de erro do Drive: é normal; voltar ao editor e abrir **Implementar → Gerir implementações**.
6. Copiar o **endereço da aplicação Web** (termina em `/exec`).

Se mudar o código depois: **Implementar → Gerir implementações → editar → Nova versão** (o endereço mantém-se).

## Passo 2 — o SQL (Supabase → SQL Editor)

Colar e correr [`supabase/avisos-email.sql`](../supabase/avisos-email.sql). No fim aparece `OK` e `email_ligado = false`.
Pode ser corrido mais de uma vez. Se disser que o `pg_net` não ficou ativo: **Database → Extensions → pg_net → ligar**, e voltar a correr
(se já recebeu os avisos no telemóvel, ele já está ativo).

## Passo 3 — ligar

No SQL Editor, trocar os valores e correr:

```sql
update private.email_config set
  url       = 'https://script.google.com/macros/s/XXXXXXXX/exec',   -- o endereço /exec do passo 1
  key       = 'A_MESMA_CHAVE_DO_SCRIPT',
  to_addrs  = 'email-da-blackline@gmail.com',                       -- até 5, separados por vírgula
  enabled   = true
where id = 1;
```

Para desligar: `update private.email_config set enabled = false where id = 1;` · Para mudar quem recebe: alterar só `to_addrs`.
O endereço que aparece no fim do email (painel) muda com `update private.email_config set admin_url = '…' where id = 1;`.

## Passo 4 — testar

1. Fazer uma marcação de teste no site. O email chega em cerca de um minuto (ver também o spam; marcar "não é spam" uma vez).
   Depois apagar a marcação de teste no painel.
2. Para ver o que a base de dados enviou e o que o Google respondeu:

```sql
select id, status_code, content, created from net._http_response order by created desc limit 5;
```

## Se não chegar

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Nada chega e `net._http_response` está vazio | `enabled` falso, ou `url`/`to_addrs` vazios | Rever o Passo 3 |
| `{"ok":false,"motivo":"chave"}` | A chave do script e a `key` do SQL não são iguais, ou o script ainda tem `COLOQUE_` | Igualar as chaves e criar **Nova versão** |
| Código 401/403 ou página de login do Google | "Quem tem acesso" não está em **Qualquer pessoa** | Gerir implementações → editar → Qualquer pessoa |
| `{"ok":false,"motivo":"sem destinatários"}` | `to_addrs` vazio ou com email inválido | Corrigir `to_addrs` |
| Código 404 | Endereço `/exec` errado ou implementação apagada | Copiar de novo em Gerir implementações |
| Alterei o script e nada mudou | A implementação antiga continua ativa | Gerir implementações → Nova versão |

## Segurança

- `private.email_config` está no schema `private`, que a API pública não vê: a chave e o endereço do script **não ficam expostos** ao site.
- A função é `security definer` e só a base de dados a chama. O script só envia para emails válidos (máx. 5) e corta o texto (assunto 200, corpo 5000).
- A conta gratuita do Google envia cerca de 100 emails por dia — de sobra para marcações. A base de dados já bloqueia pedidos repetidos do mesmo
  número durante 60 segundos.
- **Nunca gravar a chave nem o endereço `/exec` no GitHub.** Ficam só no script do Google e no SQL executado.
- Depois dos testes, se a chave tiver sido partilhada (por exemplo numa conversa), trocá-la no script (nova versão) e em `key`.

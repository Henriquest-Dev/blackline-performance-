# Email com o PDF anexado (envio automático)

O botão **Enviar por email** do painel já está pronto. Enquanto o envio automático não estiver ativado, abre o email manualmente
(o PDF é descarregado ou partilhado). Para o PDF seguir **anexado, sem fazer nada**, ative uma vez:

Pré-requisito: o domínio **blacklineperformance.space** já comprado e ligado.

1. **Resend** (resend.com, plano gratuito): criar conta → *Domains* → adicionar `blacklineperformance.space` → colocar no DNS os registos que o Resend mostrar
   (no Netlify: *Domains → DNS*) → esperar "Verified". Criar uma **API Key** (*API Keys → Create*, permissão "Sending access").
2. **Supabase → Edge Functions → Deploy a new function** (no editor do navegador) com o nome exato `send-quote-email`; colar o conteúdo de
   [`supabase/functions/send-quote-email/index.ts`](../supabase/functions/send-quote-email/index.ts) e publicar.
   Nas definições da função, desligar **"Verify JWT"** (a função valida sozinha a sessão do painel).
3. **Supabase → Edge Functions → Secrets**, adicionar:
   - `RESEND_API_KEY` = a chave do passo 1
   - `QUOTE_FROM_EMAIL` = `Blackline Performance <cotacoes@blacklineperformance.space>`
   - `QUOTE_REPLY_TO` = (opcional) o email da oficina, para onde o cliente responde
4. Testar no painel: abrir uma marcação com email → **Enviar por email**. Deve aparecer "Email enviado … com o PDF anexado".

Não é preciso correr SQL. A chave do Resend fica só no Supabase — nunca no site nem no GitHub.

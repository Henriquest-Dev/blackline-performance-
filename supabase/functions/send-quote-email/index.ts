// Envia a cotação em PDF por email, com o PDF anexado (Resend). Só o painel (sessão válida) pode usar.
// Configuração (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY      chave da conta Resend
//   QUOTE_FROM_EMAIL    ex.: Blackline Performance <cotacoes@blacklineperformance.space>   (domínio validado no Resend)
//   QUOTE_REPLY_TO      (opcional) email para onde o cliente responde
// A função deve ser publicada com "Verify JWT" DESLIGADO: a validação é feita aqui, com o token do painel.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const T = {
  pt: { subject: 'Cotação {n} — Blackline Performance', hi: 'Olá {name},', intro: 'Segue a cotação da Blackline Performance para {car}.', total: 'Total', valid: 'Válida até', btn: 'Baixar cotação', att: 'O PDF vai também anexado a este email.', bye: 'Qualquer dúvida, responda a este email ou fale connosco pelo WhatsApp.' },
  en: { subject: 'Quotation {n} — Blackline Performance', hi: 'Hello {name},', intro: 'Please find the Blackline Performance quotation for {car}.', total: 'Total', valid: 'Valid until', btn: 'Download quotation', att: 'The PDF is also attached to this email.', bye: 'If you have any questions, reply to this email or contact us on WhatsApp.' },
};
const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const RESEND = Deno.env.get('RESEND_API_KEY'), FROM = Deno.env.get('QUOTE_FROM_EMAIL');
    if (!RESEND || !FROM) return json({ ok: false, error: 'not_configured' });
    const b = await req.json();
    const to = String(b.to || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return json({ ok: false, error: 'invalid_email' });
    if (!/^[0-9a-f-]{36}$/i.test(String(b.key || ''))) return json({ ok: false, error: 'invalid_quote' });

    const url = Deno.env.get('SUPABASE_URL')!, anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const rpc = async (fn: string, args: unknown) => {
      const r = await fetch(`${url}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
      return { ok: r.ok, data: await r.json().catch(() => null) };
    };
    // só o painel pode enviar: valida o token da sessão
    const ping = await rpc('admin_ping', { p_token: b.token });
    if (!ping.ok || ping.data !== true) return json({ ok: false, error: 'auth' }, 401);
    const q = await rpc('get_quote_pdf', { p_key: b.key });
    if (!q.ok || !q.data?.pdf) return json({ ok: false, error: 'invalid_quote' });

    const L = T[b.lang === 'en' ? 'en' : 'pt'];
    const v = { n: String(b.number || q.data.number), name: String(b.name || ''), car: String(b.car || '') };
    const subject = fill(L.subject, v);
    const link = String(b.link || '');
    const html = `<!doctype html><html><body style="margin:0;background:#F5F5F7;font-family:Arial,Helvetica,sans-serif;color:#0B0B0C">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F5F7"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border-top:4px solid #E11D2A">
<tr><td style="background:#0B0B0C;padding:20px 28px"><span style="font-size:22px;font-weight:800;color:#ffffff">blackline</span><br><span style="font-size:9px;letter-spacing:5px;font-weight:700;color:#E11D2A">PERFORMANCE</span></td></tr>
<tr><td style="padding:30px 28px 8px"><p style="margin:0 0 14px;font-size:16px">${esc(fill(L.hi, v))}</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#44444A">${esc(fill(L.intro, v))}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F5F7"><tr><td style="padding:16px 18px;font-size:13px;color:#6B6B73">${esc(L.total)}<br><b style="font-size:24px;color:#0B0B0C">${esc(b.total)}</b></td><td style="padding:16px 18px;font-size:13px;color:#6B6B73;text-align:right">${esc(L.valid)}<br><b style="font-size:15px;color:#0B0B0C">${esc(b.valid)}</b></td></tr></table></td></tr>
${/^https?:\/\//.test(link) ? `<tr><td align="center" style="padding:24px 28px 8px"><a href="${esc(link)}" style="display:inline-block;background:#E11D2A;color:#ffffff;font-weight:800;font-size:16px;text-decoration:none;padding:16px 40px">${esc(L.btn)}</a></td></tr>` : ''}
<tr><td style="padding:16px 28px 28px;font-size:12.5px;line-height:1.6;color:#6B6B73">${esc(L.att)}<br>${esc(L.bye)}</td></tr>
</table></td></tr></table></body></html>`;
    const text = `${fill(L.hi, v)}\n\n${fill(L.intro, v)}\n${L.total}: ${b.total} · ${L.valid}: ${b.valid}\n\n${L.btn}: ${link}\n\n${L.att}\n${L.bye}`;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to: [to], subject, html, text,
        reply_to: Deno.env.get('QUOTE_REPLY_TO') || undefined,
        attachments: [{ filename: `Cotacao-${v.n.replace(/[^\w-]+/g, '_')}.pdf`, content: q.data.pdf }],
      }),
    });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) return json({ ok: false, error: 'provider', detail: out?.message || r.status });
    return json({ ok: true, id: out.id });
  } catch (e) {
    return json({ ok: false, error: 'server', detail: String(e) });
  }
});

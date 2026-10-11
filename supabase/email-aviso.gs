// Blackline Performance — envia por email os dados de cada marcação nova (Google Apps Script).
// Ver docs/avisos-por-email.md. Trocar CHAVE por uma palavra-passe comprida e usar a MESMA no SQL (email_key).
const CHAVE = 'COLOQUE_AQUI_UMA_CHAVE_COMPRIDA'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents)
    if (CHAVE.indexOf('COLOQUE_') === 0 || d.chave !== CHAVE) return resposta(false, 'chave')

    const para = String(d.para || '')
      .split(',')
      .map(function (s) { return s.trim() })
      .filter(function (s) { return EMAIL.test(s) })
      .slice(0, 5)
      .join(',')
    if (!para) return resposta(false, 'sem destinatários')

    const opcoes = {
      to: para,
      subject: String(d.assunto || 'Nova marcação — Blackline Performance').slice(0, 200),
      body: String(d.texto || '').slice(0, 5000),
      name: 'Blackline Performance — Site',
    }
    // ao carregar em "Responder", a resposta vai para o email do cliente (se o deu)
    if (EMAIL.test(String(d.responder || ''))) opcoes.replyTo = String(d.responder)
    MailApp.sendEmail(opcoes)
    return resposta(true)
  } catch (err) {
    return resposta(false, 'erro')
  }
}

function resposta(ok, motivo) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok, motivo: motivo || null })).setMimeType(ContentService.MimeType.JSON)
}

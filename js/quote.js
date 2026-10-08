/* Blackline Performance — cotação em PDF a partir de uma marcação */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const A = () => window.BLAdmin;
  const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const num = v => { const n = Number(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
  const mt = n => {
    const v = Math.round(num(n) * 100) / 100;
    const [i, d] = Math.abs(v).toFixed(2).split('.');
    return (v < 0 ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (d !== '00' ? ',' + d : '') + ' MT';
  };
  const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const addDays = (iso, n) => { const d = new Date(iso + 'T00:00'); d.setDate(d.getDate() + Number(n || 0)); return d; };

  const T = {
    pt: { title: 'COTAÇÃO', no: 'Nº', date: 'Data', valid: 'Válida até', booking: 'Ref. marcação', appt: 'Marcação', client: 'CLIENTE', vehicle: 'VIATURA', details: 'DETALHES',
      desc: 'Descrição', qty: 'Qtd', unit: 'Preço unit.', total: 'Total', subtotal: 'Subtotal', discount: 'Desconto', vatIncl: 'IVA incluído ({r}%)', vatInclM: 'IVA incluído', vatAdd: 'IVA ({r}%)', net: 'Valor sem IVA',
      grand: 'TOTAL', notes: 'Observações', terms: 'Condições', bank: 'Pagamento', plate: 'Matrícula', chassis: 'Chassis', km: 'Km', page: 'Página {p} de {n}', quoteLine: '(a orçamentar)',
      pickup: 'Recolha e entrega', msg: 'Olá {n}, segue a cotação {q} da *Blackline Performance* para {car}.\n\nTotal: *{t}* · válida até {v}', link: '*BAIXAR COTAÇÃO* (PDF)\n{u}\n\nQualquer dúvida estamos ao dispor.' },
    en: { title: 'QUOTATION', no: 'No.', date: 'Date', valid: 'Valid until', booking: 'Booking ref.', appt: 'Appointment', client: 'CUSTOMER', vehicle: 'VEHICLE', details: 'DETAILS',
      desc: 'Description', qty: 'Qty', unit: 'Unit price', total: 'Total', subtotal: 'Subtotal', discount: 'Discount', vatIncl: 'VAT included ({r}%)', vatInclM: 'VAT included', vatAdd: 'VAT ({r}%)', net: 'Amount excl. VAT',
      grand: 'TOTAL', notes: 'Notes', terms: 'Terms', bank: 'Payment', plate: 'Plate', chassis: 'Chassis', km: 'Mileage', page: 'Page {p} of {n}', quoteLine: '(to be quoted)',
      pickup: 'Collection and delivery', msg: 'Hello {n}, please find quotation {q} from *Blackline Performance* for {car}.\n\nTotal: *{t}* · valid until {v}', link: '*DOWNLOAD QUOTATION* (PDF)\n{u}\n\nLet us know if you have any questions.' },
  };
  const tr = (lang, k, v) => (T[lang][k] || k).replace(/\{(\w+)\}/g, (_, x) => v?.[x] ?? '');

  let booking = null, q = null;

  /* ---------- logótipo para o PDF (SVG → PNG) ---------- */
  let logoPng = null;
  const loadLogo = () => logoPng ? Promise.resolve(logoPng) : new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      c.getContext('2d').drawImage(img, 0, 0, 256, 256);
      try { logoPng = c.toDataURL('image/png'); } catch (e) { logoPng = null; }
      res(logoPng);
    };
    img.onerror = () => res(null);
    img.src = 'assets/favicon.svg';
  });

  /* ---------- montar cotação ---------- */
  function fromBooking(b) {
    const s = A().settings(), co = s.company || {};
    const lang = b.lang === 'en' ? 'en' : 'pt';
    const all = s.groups.flatMap(g => g.items);
    const P = window.BLStore.pricing;
    const tokens = Array.isArray(b.services) ? b.services : String(b.services || '').split(',').filter(Boolean);
    const ids = tokens.filter(x => !x.includes(':'));
    const optsOf = id => tokens.filter(x => x.startsWith(id + ':')).map(x => x.slice(id.length + 1));
    let discount = 0;
    const items = ids.flatMap(id => {
      const sv = all.find(x => x.id === id);
      if (!sv) return [];
      const nm = v => v?.[lang] || v?.pt || '';
      const sel = optsOf(id);
      const chosen = P.chosen(sv, sel);
      if (chosen.length) {
        // uma linha por subopção; promoção do serviço entra como desconto
        const deal = P.best(s, sv, undefined, sel);
        if (deal) discount += deal.was - deal.price;
        return chosen.map(o => ({ desc: `${nm(sv.name) || id} — ${nm(o.name)}` + (o.price == null || o.price === '' ? ' ' + tr(lang, 'quoteLine') : ''), qty: 1, price: Number(o.price) || 0, kind: 'service' }));
      }
      const deal = P.best(s, sv);
      const base = P.base(sv);
      const price = deal ? deal.price : (base == null ? 0 : base);
      const name = (nm(sv.name) || id) + (base == null ? ' ' + tr(lang, 'quoteLine') : '');
      return [{ desc: name, qty: 1, price, kind: 'service' }];
    });
    if (b.dropoff === 'recolha') items.push({ desc: tr(lang, 'pickup'), qty: 1, price: Number(s.booking?.pickupFee) || 0, kind: 'service' });
    if (!items.length) items.push({ desc: '', qty: 1, price: 0, kind: 'labour' });
    return {
      number: `${b.ref}-C1`, date: todayISO(), validDays: Number(co.quoteValidityDays) || 15, lang,
      items, discount, vatMode: co.pricesIncludeVat === false ? 'add' : 'incl', vatRate: Number(co.vatRate) || 0, vatAmount: 0, showVat: true,
      notes: b.notes ? (lang === 'en' ? 'Reported by customer: ' : 'Indicado pelo cliente: ') + b.notes : '',
    };
  }

  function totals(x) {
    const items = x.items.reduce((a, it) => a + num(it.qty) * num(it.price), 0);
    const after = Math.max(0, items - num(x.discount));
    const r = num(x.vatRate) / 100;
    let net, vat, total;
    if (x.vatMode === 'add') { net = after; vat = after * r; total = net + vat; }
    else if (x.vatMode === 'incl') { total = after; net = after / (1 + r); vat = total - net; }
    else if (x.vatMode === 'manual') { total = after; vat = Math.min(Math.max(0, num(x.vatAmount)), after); net = total - vat; }
    else { total = after; net = after; vat = 0; }
    return { items, after, net, vat, total };
  }

  /* ---------- editor ---------- */
  const svcOptions = () => {
    const s = A().settings(), P = window.BLStore.pricing;
    const price = x => { const b = P.base(x); return b == null ? 'orçamento' : (P.hasOpts(x) ? 'desde ' : '') + mt(P.best(s, x)?.price ?? b); };
    const oprice = o => o.price == null || o.price === '' ? 'orçamento' : mt(o.price);
    return '<option value="">Escolher serviço…</option>' + s.groups.map(g => `<optgroup label="${esc(g.name?.pt)}">${g.items.map(x =>
      `<option value="${esc(x.id)}">${esc(x.name?.pt)} — ${price(x)}</option>` +
      P.opts(x).map(o => `<option value="${esc(x.id + ':' + o.id)}">&nbsp;&nbsp;↳ ${esc(o.name?.pt)} — ${oprice(o)}</option>`).join('')).join('')}</optgroup>`).join('');
  };
  function renderItems() {
    $('#q-items').innerHTML = q.items.map((it, i) => `
      <tr data-i="${i}">
        <td><input data-k="desc" value="${esc(it.desc)}" placeholder="${it.kind === 'part' ? 'Peça / material (ex.: Pastilhas de travão Bosch)' : it.kind === 'labour' ? 'Mão de obra (ex.: Substituição de pastilhas)' : 'Descrição'}"></td>
        <td class="num"><input data-k="qty" type="number" min="0" step="1" value="${it.qty}"></td>
        <td class="num"><input data-k="price" type="number" min="0" step="50" value="${it.price}"></td>
        <td class="num line-total">${mt(num(it.qty) * num(it.price))}</td>
        <td><button type="button" class="icon-btn icon-btn--danger" data-del title="Remover linha">×</button></td>
      </tr>`).join('');
    renderTotals();
  }
  function renderTotals() {
    const t = totals(q);
    const L = q.lang;
    $('#q-sum').innerHTML = `
      <div><dt>${tr(L, 'subtotal')}</dt><dd>${mt(t.items)}</dd></div>
      ${num(q.discount) ? `<div><dt>${tr(L, 'discount')}</dt><dd>−${mt(q.discount)}</dd></div>` : ''}
      ${q.vatMode === 'add' ? `<div><dt>${tr(L, 'vatAdd', { r: q.vatRate })}</dt><dd>${mt(t.vat)}</dd></div>` : ''}
      ${q.vatMode === 'incl' ? `<div class="muted"><dt>${tr(L, 'vatIncl', { r: q.vatRate })}</dt><dd>${mt(t.vat)}</dd></div>` : ''}
      ${q.vatMode === 'manual' ? `<div class="muted"><dt>${tr(L, 'vatInclM')}</dt><dd>${mt(t.vat)}</dd></div>` : ''}
      <div class="grand"><dt>${tr(L, 'grand')}</dt><dd>${mt(t.total)}</dd></div>`;
    $('#q-vatrate-f').hidden = !['incl', 'add'].includes(q.vatMode);
    $('#q-vatamount-f').hidden = q.vatMode !== 'manual';
    $('.q-showvat').hidden = q.vatMode === 'none';
    $('#q-vathelp').textContent = {
      incl: `O cliente paga ${mt(t.total)}. O IVA (${num(q.vatRate)}%) já está dentro deste valor e é calculado sozinho.`,
      manual: `O cliente paga ${mt(t.total)}. Escreva o valor do IVA que está dentro deste total.`,
      add: `O IVA (${num(q.vatRate)}%) é somado aos preços: o cliente paga ${mt(t.total)}.`,
      none: 'Sem IVA na cotação.',
    }[q.vatMode] || '';
    $$('#q-items tr').forEach(r => { const it = q.items[+r.dataset.i]; r.querySelector('.line-total').textContent = mt(num(it.qty) * num(it.price)); });
  }
  const readHead = () => {
    q.number = $('#q-number').value.trim(); q.date = $('#q-date').value || todayISO();
    q.validDays = num($('#q-valid').value) || 15; q.lang = $('#q-lang').value;
    q.notes = $('#q-notes').value; q.discount = num($('#q-discount').value); q.vatMode = $('#q-vatmode').value;
    q.vatRate = num($('#q-vatrate').value); q.vatAmount = num($('#q-vatamount').value); q.showVat = $('#q-showvat').checked;
  };

  function open(b) {
    booking = b;
    q = A().parseQuote(b) || fromBooking(b);
    q.vatRate = q.vatRate ?? (Number(A().settings().company?.vatRate) || 0);
    $('#q-sub').textContent = `${A().name(b)} · ${[b.brand, b.model].filter(Boolean).join(' ')} · ${A().fmtDay(b.date, b.time)}`;
    $('#q-number').value = q.number; $('#q-date').value = q.date; $('#q-valid').value = q.validDays; $('#q-lang').value = q.lang;
    $('#q-notes').value = q.notes || ''; $('#q-discount').value = q.discount || 0; $('#q-vatmode').value = q.vatMode;
    if (q.vatAmount == null) q.vatAmount = 0;
    if (q.showVat == null) q.showVat = true;
    $('#q-vatrate').value = q.vatRate; $('#q-vatamount').value = q.vatAmount || ''; $('#q-showvat').checked = q.showVat;
    $('#q-svc-pick').innerHTML = svcOptions(); $('#q-svc-pick').hidden = true;
    const canShare = !!(navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.pdf', { type: 'application/pdf' })] }));
    $('#q-share').hidden = true; prep = null;   // o passo 2 só aparece depois de abrir a conversa
    $('#q-email').hidden = !b.email;
    $('#q-hint').textContent = window.BLStore.canLinkPdf
      ? (canShare ? `Passo 1: abre a conversa com +258 ${b.phone} (sem precisar de o ter nos contactos). Passo 2: anexa o PDF — na lista de partilha escolha o WhatsApp e a conversa em "Recentes".`
                  : `A conversa abre com +258 ${b.phone} e o PDF é descarregado: arraste o ficheiro para a conversa. A mensagem leva também o link do PDF.`)
      : 'Neste computador o PDF é descarregado e a conversa do cliente abre no WhatsApp — arraste o ficheiro para a conversa.';
    renderItems();
    $('#qmodal').hidden = false;
    document.body.classList.add('no-scroll');
    loadLogo();
  }
  const close = () => { $('#qmodal').hidden = true; if ($('#drawer').hidden) document.body.classList.remove('no-scroll'); };
  $$('[data-close-quote]').forEach(x => x.addEventListener('click', close));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#qmodal').hidden) { e.stopImmediatePropagation(); close(); } }, true);

  $('#q-items').addEventListener('input', e => {
    const k = e.target.dataset.k; if (!k) return;
    const it = q.items[+e.target.closest('tr').dataset.i];
    it[k] = k === 'desc' ? e.target.value : num(e.target.value);
    renderTotals();
  });
  $('#q-items').addEventListener('click', e => {
    if (!e.target.closest('[data-del]')) return;
    q.items.splice(+e.target.closest('tr').dataset.i, 1); renderItems();
  });
  $$('[data-qadd]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.qadd;
    if (k === 'service') { const sel = $('#q-svc-pick'); sel.hidden = false; sel.value = ''; sel.focus(); return; }
    q.items.push({ desc: '', qty: 1, price: 0, kind: k }); renderItems();
    $$('#q-items tr:last-child input')[0]?.focus();
  }));
  $('#q-svc-pick').addEventListener('change', e => {
    const s = A().settings(), P = window.BLStore.pricing;
    const [id, oid] = e.target.value.split(':');
    const sv = s.groups.flatMap(g => g.items).find(x => x.id === id); if (!sv) return;
    const nm = v => v?.[q.lang] || v?.pt || '';
    const o = oid && P.opts(sv).find(x => x.id === oid);
    if (o) q.items.push({ desc: `${nm(sv.name)} — ${nm(o.name)}`, qty: 1, price: Number(o.price) || 0, kind: 'service' });
    else { const d = P.best(s, sv); q.items.push({ desc: nm(sv.name), qty: 1, price: d ? d.price : Number(P.base(sv)) || 0, kind: 'service' }); }
    e.target.hidden = true; renderItems();
  });
  ['#q-discount', '#q-vatmode', '#q-lang', '#q-vatrate', '#q-vatamount', '#q-showvat'].forEach(sel => ['input', 'change'].forEach(ev => $(sel).addEventListener(ev, () => {
    readHead();
    // ao passar para valor manual, começa pelo IVA automático
    if (sel === '#q-vatmode' && q.vatMode === 'manual' && !q.vatAmount) {
      const t = totals({ ...q, vatMode: 'incl' }); q.vatAmount = Math.round(t.vat); $('#q-vatamount').value = q.vatAmount;
    }
    renderTotals();
  })));

  /* ---------- PDF ---------- */
  async function buildPdf() {
    readHead();
    if (!window.jspdf) throw new Error('Gerador de PDF indisponível (sem ligação à internet?).');
    await loadLogo();
    const { jsPDF } = window.jspdf;
    const s = A().settings(), co = s.company || {}, c = s.contacts || {};
    const b = booking, L = q.lang, t = totals(q);
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, M = 16;
    const INK = [11, 11, 12], RED = [225, 29, 42], MUTED = [107, 107, 115], LINE = [226, 226, 231], SOFT = [245, 245, 247];
    const fmt = iso => new Date(iso + 'T00:00').toLocaleDateString(L === 'en' ? 'en-GB' : 'pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const header = () => {
      doc.setFillColor(...INK); doc.rect(0, 0, W, 40, 'F');
      doc.setFillColor(...RED); doc.lines([[40, 0], [-8, 40], [-40, 0]], W - 40, 0, [1, 1], 'F', true);
      if (logoPng) doc.addImage(logoPng, 'PNG', M, 10, 20, 20);
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(19); doc.text('blackline', M + 25, 20);
      doc.setTextColor(...RED); doc.setFontSize(6.6); doc.setCharSpace(1.9); doc.text('PERFORMANCE', M + 25.4, 25.5); doc.setCharSpace(0);
      doc.setTextColor(255, 255, 255); doc.setFontSize(20); doc.text(tr(L, 'title'), W - 50, 19, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(`${tr(L, 'no')} ${q.number}`, W - 50, 26, { align: 'right' });
    };
    const footer = () => {
      const n = doc.getNumberOfPages();
      for (let p = 1; p <= n; p++) {
        doc.setPage(p);
        doc.setDrawColor(...RED); doc.setLineWidth(.8); doc.line(M, 280, W - M, 280);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6); doc.setTextColor(...MUTED);
        const parts = [co.legalName || 'Blackline Performance', c.phone, c.instagram && 'Instagram @' + c.instagram, c.tiktok && 'TikTok @' + c.tiktok, co.nuit && 'NUIT ' + co.nuit, co.address].filter(Boolean);
        doc.text(parts.join('  ·  '), M, 285, { maxWidth: W - 2 * M - 30 });
        doc.text(tr(L, 'page', { p, n }), W - M, 285, { align: 'right' });
      }
    };
    header();

    // blocos de informação
    let y = 52;
    const col = (x, title, lines) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...RED); doc.setCharSpace(.6); doc.text(title, x, y); doc.setCharSpace(0);
      doc.setDrawColor(...INK); doc.setLineWidth(.5); doc.line(x, y + 1.8, x + 52, y + 1.8);
      let yy = y + 7;
      lines.filter(l => l && l[1]).forEach(([k, v, bold]) => {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...MUTED);
        if (k) { doc.text(k, x, yy); }
        doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(9); doc.setTextColor(...INK);
        const wrapped = doc.splitTextToSize(String(v), k ? 31 : 52);
        doc.text(wrapped, k ? x + 21 : x, yy);
        yy += 5 * wrapped.length;
      });
      return yy;
    };
    const valid = addDays(q.date, q.validDays);
    const validStr = valid.toLocaleDateString(L === 'en' ? 'en-GB' : 'pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const y1 = col(M, tr(L, 'client'), [['', A().name(b), true], ['', A().tel(b.phone)], ['', b.email]]);
    const y2 = col(M + 61, tr(L, 'vehicle'), [['', [b.brand, b.model, b.year].filter(Boolean).join(' '), true], [tr(L, 'plate'), b.plate], [tr(L, 'chassis'), b.chassis], [tr(L, 'km'), b.km]]);
    const y3 = col(M + 122, tr(L, 'details'), [[tr(L, 'date'), fmt(q.date)], [tr(L, 'valid'), validStr, true], [tr(L, 'booking'), b.ref], [tr(L, 'appt'), b.date ? fmt(b.date) + (b.time ? ' ' + b.time : '') : '']]);
    y = Math.max(y1, y2, y3) + 6;

    // tabela
    const cx = { desc: M, qty: 128, unit: 158, total: W - M };
    const thead = () => {
      doc.setFillColor(...INK); doc.rect(M, y, W - 2 * M, 8, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
      doc.text(tr(L, 'desc'), cx.desc + 3, y + 5.3);
      doc.text(tr(L, 'qty'), cx.qty, y + 5.3, { align: 'right' });
      doc.text(tr(L, 'unit'), cx.unit, y + 5.3, { align: 'right' });
      doc.text(tr(L, 'total'), cx.total - 3, y + 5.3, { align: 'right' });
      y += 8;
    };
    thead();
    q.items.filter(it => it.desc || num(it.price)).forEach((it, i) => {
      const lines = doc.splitTextToSize(it.desc || '—', 98);
      const h = Math.max(8, 4 + lines.length * 4.4);
      if (y + h > 250) { doc.addPage(); header(); y = 50; thead(); }
      if (i % 2) { doc.setFillColor(...SOFT); doc.rect(M, y, W - 2 * M, h, 'F'); }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...INK);
      doc.text(lines, cx.desc + 3, y + 5.2);
      doc.text(String(num(it.qty)), cx.qty, y + 5.2, { align: 'right' });
      doc.text(mt(it.price), cx.unit, y + 5.2, { align: 'right' });
      doc.setFont('helvetica', 'bold'); doc.text(mt(num(it.qty) * num(it.price)), cx.total - 3, y + 5.2, { align: 'right' });
      y += h;
      doc.setDrawColor(...LINE); doc.setLineWidth(.2); doc.line(M, y, W - M, y);
    });

    // totais
    y += 6;
    if (y > 225) { doc.addPage(); header(); y = 52; }
    const tx = 122, rows = [[tr(L, 'subtotal'), mt(t.items)]];
    if (num(q.discount)) rows.push([tr(L, 'discount'), '- ' + mt(q.discount)]);
    if (q.vatMode === 'add') { rows.push([tr(L, 'net'), mt(t.net)]); rows.push([tr(L, 'vatAdd', { r: q.vatRate }), mt(t.vat)]); }
    if (q.vatMode === 'incl' && q.showVat !== false) rows.push([tr(L, 'vatIncl', { r: q.vatRate }), mt(t.vat)]);
    if (q.vatMode === 'manual' && q.showVat !== false) rows.push([tr(L, 'vatInclM'), mt(t.vat)]);
    const ty0 = y;
    rows.forEach(([k, v]) => {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...MUTED); doc.text(k, tx, y + 4);
      doc.setTextColor(...INK); doc.text(v, W - M - 3, y + 4, { align: 'right' });
      y += 6.5;
    });
    doc.setFillColor(...RED); doc.rect(tx - 3, y, W - M - tx + 3, 11, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(tr(L, 'grand'), tx, y + 7.2);
    doc.setFontSize(13); doc.text(mt(t.total), W - M - 3, y + 7.4, { align: 'right' });
    const yEndTotals = y + 11;

    // observações (ao lado dos totais)
    let ny = ty0;
    const block = (title, text, x, width) => {
      if (!text) return;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...RED); doc.setCharSpace(.6); doc.text(title.toUpperCase(), x, ny + 3); doc.setCharSpace(0);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.6); doc.setTextColor(...INK);
      const ls = doc.splitTextToSize(text, width);
      doc.text(ls, x, ny + 8);
      ny += 10 + ls.length * 4;
    };
    block(tr(L, 'notes'), q.notes, M, 96);
    y = Math.max(ny, yEndTotals) + 8;
    if (y > 255) { doc.addPage(); header(); y = 52; }
    ny = y;
    block(tr(L, 'terms'), co.quoteTerms, M, W - 2 * M);
    block(tr(L, 'bank'), co.bankDetails, M, W - 2 * M);

    footer();
    return doc;
  }

  const fileName = () => `Cotacao-${(q.number || 'Blackline').replace(/[^\w-]+/g, '_')}.pdf`;
  const quoteData = () => { readHead(); const t = totals(q); return { ...q, total: Math.round(t.total * 100) / 100 }; };
  const download = blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = fileName(); a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  $('#q-save').addEventListener('click', async () => {
    try { await A().saveQuote(booking, quoteData(), { sent: false }); A().toast('Cotação guardada.'); } catch (e) { /* já mostrado */ }
  });
  $('#q-download').addEventListener('click', async () => {
    try {
      const doc = await buildPdf(); const blob = doc.output('blob');
      download(blob);
      await A().saveQuote(booking, quoteData(), { sent: false, blob });
    } catch (e) { A().toast(A().errMsg(e), 'err'); }
  });
  /* ---------- envio: WhatsApp e email ----------
   * Um link wa.me/mailto nunca anexa ficheiros; só a partilha do telemóvel (Web Share) anexa o PDF, mas a lista de
   * partilha só mostra contactos guardados. Por isso o envio é em dois toques:
   *  1) abre a conversa com o número do cliente (funciona sem o contacto guardado) → a conversa passa a existir;
   *  2) partilha o PDF anexado e escolhe essa conversa em "Recentes".
   * No computador o PDF é descarregado e arrasta-se para a conversa (WhatsApp Web) ou para o email. */
  const canShareFile = () => !!(navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.pdf', { type: 'application/pdf' })] }));
  let prep = null;                                   // PDF já gerado e guardado, reutilizado nos dois toques
  $('#qmodal').addEventListener('input', () => { prep = null; });
  const prepare = async () => {
    if (prep) return prep;
    const doc = await buildPdf();
    const blob = doc.output('blob');
    const data = quoteData(), t = totals(q);
    const car = [booking.brand, booking.model].filter(Boolean).join(' ');
    const validStr = addDays(q.date, q.validDays).toLocaleDateString(q.lang === 'en' ? 'en-GB' : 'pt-PT');
    let msg = tr(q.lang, 'msg', { n: booking.firstName || '', q: q.number, car, t: mt(t.total), v: validStr });
    const saved = await A().saveQuote(booking, data, { sent: true, blob });
    if (saved.url) msg += '\n\n' + tr(q.lang, 'link', { u: saved.url });
    return (prep = { blob, msg, url: saved.url, file: new File([blob], fileName(), { type: 'application/pdf' }) });
  };
  const busy = (btn, on, label) => { btn.disabled = on; if (on) { btn.dataset.l = btn.innerHTML; btn.textContent = label; } else if (btn.dataset.l) btn.innerHTML = btn.dataset.l; };
  const fail = (e, fb) => A().toast(A().errMsg ? A().errMsg(e) : (e.message || fb), 'err');
  const shareFile = async (r, extra = {}) => {
    try { await navigator.share({ files: [r.file], title: fileName(), ...extra }); return true; }
    catch (e) { if (e.name !== 'AbortError') throw e; return false; }
  };
  const step2 = on => { const b = $('#q-share'); b.hidden = !canShareFile(); b.classList.toggle('btn--red', on); b.classList.toggle('btn--ghost', !on); if (on) b.scrollIntoView({ block: 'nearest' }); };

  // WhatsApp — passo 1: abrir a conversa com o número do cliente
  $('#q-send').addEventListener('click', async () => {
    const btn = $('#q-send'); busy(btn, true, 'A preparar…');
    const win = window.open('about:blank', '_blank');   // abre já (os navegadores bloqueiam janelas abertas depois de esperar pela rede)
    try {
      const r = await prepare();
      const mobile = canShareFile();
      if (!mobile) download(r.blob);                     // computador: o PDF fica descarregado para arrastar para a conversa
      const wa = `https://wa.me/258${booking.phone}?text=${encodeURIComponent(r.msg)}`;
      win ? (win.location.href = wa) : window.open(wa, '_blank', 'noopener');
      if (mobile) { step2(true); A().toast('Conversa aberta. Envie a mensagem e volte aqui para anexar o PDF (passo 2).'); }
      else A().toast('Conversa aberta e PDF descarregado — arraste o ficheiro PDF para a conversa e envie.');
    } catch (e) { win && win.close(); fail(e, 'Não foi possível gerar o PDF.'); }
    finally { busy(btn, false); }
  });

  // WhatsApp — passo 2 (telemóvel): partilhar o PDF anexado e escolher a conversa em "Recentes"
  $('#q-share').addEventListener('click', async () => {
    const btn = $('#q-share'); busy(btn, true, 'A preparar…');
    try { const r = await prepare(); await shareFile(r); step2(false); }
    catch (e) { fail(e, 'Não foi possível partilhar o PDF.'); }
    finally { busy(btn, false); }
  });

  // Email com o PDF anexado
  $('#q-email').addEventListener('click', async () => {
    const btn = $('#q-email'); busy(btn, true, 'A preparar…');
    try {
      const r = await prepare();
      const subject = `${q.lang === 'en' ? 'Quotation' : 'Cotação'} ${q.number} — Blackline Performance`;
      if (canShareFile()) {
        // telemóvel: o email abre com o PDF anexado; o destinatário não vem preenchido, por isso o email do cliente é copiado
        try { await navigator.clipboard.writeText(booking.email); } catch (e) { /* sem acesso à área de transferência */ }
        A().toast(`Email do cliente copiado (${booking.email}) — escolha o Gmail/Email e cole em "Para".`);
        await shareFile(r, { text: r.msg });
      } else {
        download(r.blob);
        location.href = `mailto:${encodeURIComponent(booking.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(r.msg)}`;
        A().toast('PDF descarregado — anexe o ficheiro ao email que abriu.');
      }
    } catch (e) { fail(e, 'Não foi possível gerar o PDF.'); }
    finally { busy(btn, false); }
  });

  window.BLQuote = { open, buildPdf: async b => { if (b) open(b); return buildPdf(); } };
})();

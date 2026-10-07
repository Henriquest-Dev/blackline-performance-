/* Blackline Performance — painel de administração */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const S = window.BLStore;
  const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const STATUS = { novo: 'Novo', contactado: 'Contactado', confirmado: 'Confirmado', concluido: 'Concluído', cancelado: 'Cancelado' };
  const FUEL = { gasolina: 'Gasolina', diesel: 'Diesel', hibrido: 'Híbrido', eletrico: 'Elétrico' };
  const PREF = { whatsapp: 'WhatsApp', chamada: 'Chamada', email: 'Email' };
  const ERR = {
    auth: 'Utilizador ou palavra-passe incorretos.',
    locked: 'Demasiadas tentativas. Tente novamente dentro de 15 minutos.',
    session_expired: 'A sessão expirou. Entre novamente.',
    weak_password: 'A nova palavra-passe deve ter pelo menos 8 caracteres.',
    not_admin: 'Esta conta não tem acesso ao painel. Peça para ser adicionada como administradora.',
    unconfirmed: 'O email desta conta ainda não foi confirmado.',
    network: 'Sem ligação à internet ou ao servidor.',
    forbidden: 'Sem permissão para esta operação.',
  };
  const errMsg = e => ERR[e.code || e.message] || (e.message === 'Failed to fetch' ? 'Sem ligação ao servidor.' : e.message || 'Ocorreu um erro.');

  $$('.js-year').forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------------- util UI ---------------- */
  let toastT;
  const toast = (msg, kind = '') => {
    const t = $('#toast');
    t.textContent = msg; t.className = 'toast ' + kind; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 3200);
  };
  const saveState = (state, msg) => {
    const el = $('#save-state');
    el.className = 'save save--' + state;
    el.textContent = msg || { saving: 'A guardar…', saved: 'Alterações guardadas', error: 'Erro ao guardar' }[state] || '';
  };
  const guard = async fn => {
    try { return await fn(); } catch (e) {
      if ((e.code || e.message) === 'session_expired') { S.logout(); showLogin(ERR.session_expired); }
      if (e.code === 'forbidden') toast(ERR.forbidden, 'err');
      throw e;
    }
  };
  $$('[data-pw]').forEach(b => b.addEventListener('click', () => {
    const i = $('#' + b.dataset.pw); const show = i.type === 'password';
    i.type = show ? 'text' : 'password'; b.textContent = show ? 'Ocultar' : 'Mostrar';
  }));

  /* ---------------- login ---------------- */
  const modeText = S.mode !== 'local'
    ? 'Ligado à base de dados da Blackline (Supabase).'
    : 'Modo demonstração — os dados ficam neste navegador.';
  $('#lg-mode').textContent = modeText;
  $('#lg-user-label').textContent = S.loginLabel;

  function showLogin(msg) {
    $('#app').hidden = true; $('#login').hidden = false;
    $('#lg-err').textContent = msg || '';
    setTimeout(() => $('#lg-user').focus(), 50);
  }
  async function showApp() {
    $('#login').hidden = true; $('#app').hidden = false;
    $('#mode-banner').hidden = S.mode !== 'local';
    renderStorage();
    await loadSettings();
    await loadBookings();
    if (!unsubscribe) unsubscribe = S.onNewBooking(b => {
      if (bookings.some(x => x.id === b.id)) return;
      bookings.unshift(b); renderBookings();
      toast(`Nova marcação: ${name(b)} — ${fmtDay(b.date, b.time)}`);
    });
  }
  let unsubscribe = null;
  $('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('#lg-btn'); btn.disabled = true; btn.textContent = 'A entrar…';
    $('#lg-err').textContent = '';
    try {
      await S.login($('#lg-user').value, $('#lg-pass').value);
      $('#lg-pass').value = '';
      await showApp();
    } catch (err) { $('#lg-err').textContent = errMsg(err); }
    finally { btn.disabled = false; btn.textContent = 'Entrar'; }
  });
  $('#logout').addEventListener('click', async () => { unsubscribe?.(); unsubscribe = null; await S.logout(); showLogin(); });

  /* ---------------- navegação ---------------- */
  const TITLES = { bookings: 'Marcações', services: 'Serviços e preços', promos: 'Promoções', contacts: 'Contactos e horário', account: 'Conta' };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-view]'); if (!b) return;
    const v = b.dataset.view;
    $$('.side__nav [data-view]').forEach(x => x.classList.toggle('is-active', x.dataset.view === v));
    $$('.view').forEach(x => x.classList.toggle('is-active', x.id === 'v-' + v));
    $('#view-title').textContent = TITLES[v];
    document.body.classList.remove('side-open');
    window.scrollTo({ top: 0 });
  });
  $('#top-menu').addEventListener('click', () => document.body.classList.toggle('side-open'));

  /* ---------------- marcações ---------------- */
  let bookings = [];
  const TZ = 'Africa/Maputo';   // hora de Moçambique, em qualquer dispositivo
  const fmtDT = iso => { if (!iso) return ''; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: TZ }) + ' ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: TZ }); };
  const fmtDay = (date, time) => { if (!date) return '—'; const d = new Date(date + 'T00:00'); return (isNaN(d) ? date : d.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })) + (time ? ' · ' + time : ''); };
  const tel = p => '+258 ' + String(p || '').replace(/^(\d{2})(\d{3})(\d{0,4}).*/, '$1 $2 $3').trim();
  const name = b => [b.firstName, b.lastName].filter(Boolean).join(' ');
  const car = b => [b.brand, b.model, b.year].filter(Boolean).join(' ');
  const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

  async function loadBookings() {
    try {
      bookings = await guard(() => S.listBookings());
      renderBookings();
    } catch (e) { toast('Não foi possível carregar as marcações: ' + errMsg(e), 'err'); }
  }
  function filtered() {
    const q = $('#bk-search').value.trim().toLowerCase();
    const st = $('#bk-status').value;
    const when = $('#bk-when').value;
    const today = todayISO();
    return bookings.filter(b => {
      if (st && b.status !== st) return false;
      if (when === 'upcoming' && (b.date < today || b.status === 'concluido' || b.status === 'cancelado')) return false;
      if (when === 'past' && b.date >= today) return false;
      if (!q) return true;
      return [b.ref, name(b), b.phone, b.email, b.plate, b.chassis, b.brand, b.model, b.servicesLabel].join(' ').toLowerCase().includes(q);
    }).sort((a, b) => when === 'upcoming' ? (a.date + a.time).localeCompare(b.date + b.time) : String(b.createdAt).localeCompare(String(a.createdAt)));
  }
  function renderBookings() {
    const list = filtered();
    const news = bookings.filter(b => b.status === 'novo').length;
    $('#nav-count').hidden = !news; $('#nav-count').textContent = news;
    $('#bk-summary').textContent = `${list.length} de ${bookings.length} marcações` + (news ? ` · ${news} por contactar` : '');
    $('#bk-empty').hidden = !!list.length;
    $('#bk-table tbody').innerHTML = list.map(b => `
      <tr data-id="${esc(b.id)}" class="${b.status === 'novo' ? 'is-new' : ''}">
        <td data-l="Recebido"><span class="muted">${esc(fmtDT(b.createdAt))}</span><br><span class="ref">${esc(b.ref)}</span></td>
        <td data-l="Cliente"><b>${esc(name(b))}</b><br><span class="muted">${esc(tel(b.phone))}</span></td>
        <td data-l="Viatura">${esc(car(b))}${b.plate ? `<br><span class="plate">${esc(b.plate)}</span>` : ''}</td>
        <td data-l="Serviços" class="svc">${esc(b.servicesLabel)}</td>
        <td data-l="Marcação"><b>${esc(fmtDay(b.date, b.time))}</b>${b.dropoff === 'recolha' ? '<br><span class="muted">Recolha</span>' : ''}</td>
        <td data-l="Estado"><span class="pill pill--${esc(b.status)}">${STATUS[b.status] || esc(b.status)}</span></td>
      </tr>`).join('');
  }
  ['#bk-search', '#bk-status', '#bk-when'].forEach(s => $(s).addEventListener('input', renderBookings));
  $('#bk-refresh').addEventListener('click', loadBookings);
  $('#bk-table tbody').addEventListener('click', e => { const tr = e.target.closest('tr'); if (tr) openDrawer(tr.dataset.id); });

  $('#bk-export').addEventListener('click', () => {
    const cols = [['ref', 'Referência'], ['createdAt', 'Recebido'], ['status', 'Estado'], ['firstName', 'Nome'], ['lastName', 'Apelido'], ['phone', 'Telemóvel'], ['email', 'Email'], ['contactPref', 'Contacto preferido'],
      ['servicesLabel', 'Serviços'], ['total', 'Total estimado'], ['brand', 'Marca'], ['model', 'Modelo'], ['year', 'Ano'], ['km', 'Km'], ['fuel', 'Combustível'], ['plate', 'Matrícula'], ['chassis', 'Chassis'],
      ['date', 'Data'], ['time', 'Hora'], ['dropoff', 'Entrega'], ['notes', 'Pedido do cliente'], ['internalNote', 'Nota interna']];
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = '﻿' + cols.map(c => q(c[1])).join(';') + '\n' + filtered().map(b => cols.map(c => q(c[0] === 'phone' ? tel(b.phone) : b[c[0]])).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `marcacoes-blackline-${todayISO()}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  /* detalhe */
  let current = null, noteT;
  function openDrawer(id) {
    current = bookings.find(b => b.id === id); if (!current) return;
    const b = current;
    $('#dr-ref').textContent = b.ref + ' · recebido ' + fmtDT(b.createdAt);
    $('#dr-title').textContent = name(b);
    setStatusUI(b.status);
    const row = (k, v) => v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '';
    $('#dr-details').innerHTML = `
      <h3>Marcação</h3><dl>
        ${row('Data e hora', esc(fmtDay(b.date, b.time)))}${row('Entrega', b.dropoff === 'recolha' ? 'Recolha e entrega no endereço' : 'Na oficina')}
        ${row('Serviços', `<span class="pre">${String(b.servicesLabel || '').split('; ').map(esc).join('\n')}</span>`)}${row('Total estimado', esc(b.total))}</dl>
      ${b.notes ? `<h3>Pedido do cliente</h3><div class="dr-notes">${esc(b.notes)}</div>` : ''}
      <h3>Viatura</h3><dl>
        ${row('Marca e modelo', esc([b.brand, b.model].filter(Boolean).join(' ')))}${row('Ano', esc(b.year))}${row('Combustível', esc(FUEL[b.fuel] || b.fuel))}
        ${row('Quilometragem', b.km && esc(b.km) + ' km')}${row('Matrícula', b.plate && `<span class="plate">${esc(b.plate)}</span>`)}${row('Chassis (VIN)', `<span class="mono">${esc(b.chassis) || '—'}</span>`)}</dl>
      <h3>Cliente</h3><dl>
        ${row('Telemóvel', esc(tel(b.phone)))}${row('Email', esc(b.email))}${row('Contacto preferido', esc(PREF[b.contactPref] || b.contactPref))}
        ${row('Idioma', b.lang === 'en' ? 'Inglês' : 'Português')}</dl>`;
    const first = b.firstName || '';
    const msg = `Olá ${first}, daqui fala a Blackline Performance. Recebemos o seu pedido ${b.ref} para ${fmtDay(b.date, b.time)} (${[b.brand, b.model].filter(Boolean).join(' ')}). Podemos confirmar?`;
    $('#dr-wa').href = `https://wa.me/258${b.phone}?text=${encodeURIComponent(msg)}`;
    $('#dr-call').href = `tel:+258${b.phone}`;
    $('#dr-mail').hidden = !b.email; $('#dr-mail').href = `mailto:${b.email}?subject=${encodeURIComponent('Marcação ' + b.ref)}`;
    $('#dr-note').value = b.internalNote || '';
    const q = parseQuote(b);
    $('#dr-quote-state').innerHTML = q ? `Nº ${esc(q.number)} · ${mt(q.total || 0)}${b.quoteAt ? ' · enviada ' + esc(fmtDT(b.quoteAt)) : ' · guardada'}${b.quoteUrl ? ` · <a href="${esc(b.quoteUrl)}" target="_blank" rel="noopener">ver PDF</a>` : ''}` : 'Ainda não preparada';
    $('#dr-quote').textContent = q ? 'Abrir cotação' : 'Preparar cotação PDF';
    $('#drawer').hidden = false;
    document.body.classList.add('no-scroll');
    setTimeout(() => $('.drawer__panel').classList.add('is-in'), 10);
  }
  const closeDrawer = () => {
    $('.drawer__panel').classList.remove('is-in');
    setTimeout(() => { $('#drawer').hidden = true; document.body.classList.remove('no-scroll'); }, 220);
  };
  $$('[data-close-drawer]').forEach(x => x.addEventListener('click', closeDrawer));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer(); });
  const parseQuote = b => { if (!b.quote) return null; if (typeof b.quote === 'object') return b.quote; try { return JSON.parse(b.quote); } catch (e) { return null; } };
  $('#dr-quote').addEventListener('click', () => current && window.BLQuote && window.BLQuote.open(current));
  const setStatusUI = st => $$('#dr-status button').forEach(b => { b.classList.toggle('on', b.dataset.v === st); b.setAttribute('aria-checked', b.dataset.v === st); });

  const patch = async (p) => {
    if (!current) return;
    Object.assign(current, p);
    renderBookings();
    saveState('saving');
    try { await guard(() => S.updateBooking(current.id, p)); saveState('saved'); }
    catch (e) { saveState('error'); toast(errMsg(e), 'err'); }
  };
  $('#dr-status').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; setStatusUI(b.dataset.v); patch({ status: b.dataset.v }); });
  $('#dr-note').addEventListener('input', e => { clearTimeout(noteT); const v = e.target.value; noteT = setTimeout(() => patch({ internalNote: v }), 700); });
  $('#dr-delete').addEventListener('click', async () => {
    if (!current || !confirm(`Eliminar a marcação ${current.ref} de ${name(current)}? Esta ação não pode ser anulada.`)) return;
    try { await guard(() => S.deleteBooking(current.id)); bookings = bookings.filter(b => b !== current); renderBookings(); closeDrawer(); toast('Marcação eliminada.'); }
    catch (e) { toast(errMsg(e), 'err'); }
  });

  /* ---------------- definições (serviços, contactos) ---------------- */
  let settings = null, saveT;
  const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const setPath = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => (a[k] = a[k] && typeof a[k] === 'object' ? a[k] : {}), o); t[last] = v; };

  async function loadSettings() {
    settings = JSON.parse(JSON.stringify(await S.getSettings()));
    $$('[data-bind]').forEach(i => { const v = getPath(settings, i.dataset.bind); i.value = v == null ? '' : String(v); });
    renderGroups(); renderPromos();
  }
  const queueSave = () => {
    saveState('saving');
    clearTimeout(saveT);
    saveT = setTimeout(async () => {
      try { await guard(() => S.saveSettings(settings)); saveState('saved'); }
      catch (e) { saveState('error'); toast(errMsg(e), 'err'); }
    }, 700);
  };
  document.addEventListener('input', e => {
    const i = e.target.closest('[data-bind]'); if (!i || !settings) return;
    let v = i.value;
    if (i.type === 'number') v = v === '' ? 0 : Number(v);
    if (i.dataset.type === 'bool') v = v === 'true';
    if (i.dataset.bind === 'contacts.whatsapp') v = v.replace(/\D/g, '');
    if (/instagram|tiktok/.test(i.dataset.bind)) v = v.replace(/^@/, '').trim();
    setPath(settings, i.dataset.bind, v);
    queueSave();
  });

  const uid = p => p + '-' + Math.random().toString(36).slice(2, 7);
  const slug = t => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  const mt = n => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' MT';
  const allServices = () => settings.groups.flatMap(g => g.items);

  /* --- novo serviço --- */
  const fillGroupSelects = () => {
    const opts = settings.groups.map((g, i) => `<option value="${i}">${esc(g.name?.pt || 'Sem nome')}</option>`).join('');
    const sel = $('#ns-group'); const cur = sel.value;
    sel.innerHTML = opts + '<option value="__new">+ Nova categoria…</option>';
    if (cur && sel.querySelector(`option[value="${cur}"]`)) sel.value = cur;
    $('#ns-newgroup-wrap').hidden = sel.value !== '__new';
  };
  $('#ns-group').addEventListener('change', e => { $('#ns-newgroup-wrap').hidden = e.target.value !== '__new'; });
  $('#ns-form').addEventListener('submit', e => {
    e.preventDefault();
    const msg = $('#ns-msg'); msg.className = 'form-msg';
    const namePt = $('#ns-name-pt').value.trim();
    if (!namePt) { msg.textContent = 'Indique o nome do serviço.'; msg.classList.add('is-err'); $('#ns-name-pt').focus(); return; }
    let gi = $('#ns-group').value;
    if (gi === '__new') {
      const gname = $('#ns-newgroup').value.trim();
      if (!gname) { msg.textContent = 'Indique o nome da nova categoria.'; msg.classList.add('is-err'); $('#ns-newgroup').focus(); return; }
      settings.groups.push({ id: uid('grp'), name: { pt: gname, en: gname }, items: [] });
      gi = settings.groups.length - 1;
    }
    let id = slug(namePt) || uid('svc');
    if (allServices().some(x => x.id === id)) id = id + '-' + Math.random().toString(36).slice(2, 5);
    const price = $('#ns-price').value;
    const dur = $('#ns-dur').value.trim();
    settings.groups[+gi].items.push({
      id, active: $('#ns-active').checked, price: price === '' ? null : Number(price), from: $('#ns-from').checked,
      name: { pt: namePt, en: $('#ns-name-en').value.trim() || namePt },
      desc: { pt: $('#ns-desc-pt').value.trim(), en: $('#ns-desc-en').value.trim() },
      dur: { pt: dur, en: dur },
    });
    e.target.reset(); $('#ns-active').checked = true; $('#ns-group').value = gi;
    renderGroups(); queueSave();
    msg.textContent = `"${namePt}" adicionado.`; msg.classList.add('is-ok');
    const row = $(`.svc-row[data-id="${id}"]`); row?.classList.add('flash'); row?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  /* --- subopções (subpreços) de cada serviço --- */
  const hasOpts = s => (s.options || []).some(o => o.active !== false);
  const openOpts = new Set();
  function optsEditor(s, si) {
    const list = s.options || [];
    const sum = list.filter(o => o.active !== false && o.price != null && o.price !== '').reduce((a, o) => a + Number(o.price), 0);
    return `
    <details class="svc-opts" data-s="${si}" data-sid="${esc(s.id)}" ${openOpts.has(s.id) ? 'open' : ''}>
      <summary><span>Subopções e subpreços</span> <b>${list.length ? list.length + (list.length === 1 ? ' opção' : ' opções') : 'nenhuma'}</b>${list.length ? `<em>todas juntas: ${mt(sum)}</em>` : ''}</summary>
      <div class="svc-opts__body">
        <p class="muted">O cliente escolhe as partes que quer e vê a descrição e o preço de cada uma; o preço do serviço passa a ser a soma das escolhidas. Preço vazio = a orçamentar.</p>
        <label class="f f--inline"><span>O cliente pode escolher</span><select data-sf="optMode">
          <option value="multi" ${s.optMode !== 'single' ? 'selected' : ''}>Várias opções (ex.: frente + trás + laterais)</option>
          <option value="single" ${s.optMode === 'single' ? 'selected' : ''}>Só uma opção (ex.: tamanho do motor)</option></select></label>
        ${list.length ? `<div class="opt-row opt-row--head"><span>Ativa</span><span>Opção (PT / EN)</span><span>Descrição (PT / EN)</span><span>Preço (MT)</span><span>Ordem</span><span></span></div>` : ''}
        ${list.map((o, oi) => `
        <div class="opt-row ${o.active === false ? 'is-off' : ''}" data-o="${oi}">
          <label class="chk" data-l="Ativa"><input type="checkbox" data-of="active" ${o.active !== false ? 'checked' : ''}><span></span></label>
          <div class="stack" data-l="Opção"><input data-of="name.pt" value="${esc(o.name?.pt)}" placeholder="Ex.: Frente (para-brisas)"><input data-of="name.en" value="${esc(o.name?.en)}" placeholder="Ex.: Front (windscreen)"></div>
          <div class="stack" data-l="Descrição"><input data-of="desc.pt" value="${esc(o.desc?.pt)}" placeholder="Descrição curta"><input data-of="desc.en" value="${esc(o.desc?.en)}" placeholder="Short description"></div>
          <div data-l="Preço (MT)"><input type="number" min="0" step="50" data-of="price" value="${o.price ?? ''}" placeholder="Orçamento"></div>
          <div class="order" data-l="Ordem"><button type="button" class="icon-btn" data-omove="-1" ${oi === 0 ? 'disabled' : ''} title="Subir">↑</button><button type="button" class="icon-btn" data-omove="1" ${oi === list.length - 1 ? 'disabled' : ''} title="Descer">↓</button></div>
          <button type="button" class="icon-btn icon-btn--danger" data-odel title="Apagar opção">×</button>
        </div>`).join('')}
        <button type="button" class="btn btn--ghost btn--sm" data-oadd>+ Adicionar subopção</button>
      </div>
    </details>`;
  }

  /* --- lista de serviços --- */
  function renderGroups() {
    fillGroupSelects();
    const q = ($('#svc-search')?.value || '').trim().toLowerCase();
    const gOpts = sel => settings.groups.map((g, i) => `<option value="${i}" ${i === sel ? 'selected' : ''}>${esc(g.name?.pt || 'Sem nome')}</option>`).join('');
    let shown = 0;
    $('#groups').innerHTML = settings.groups.map((g, gi) => {
      const rows = g.items.map((s, si) => ({ s, si })).filter(({ s }) => !q || [s.name?.pt, s.name?.en, s.desc?.pt].join(' ').toLowerCase().includes(q));
      shown += rows.length;
      if (q && !rows.length) return '';
      return `
      <div class="card group" data-g="${gi}">
        <div class="group__head">
          <label class="f"><span>Categoria — português</span><input data-gf="name.pt" value="${esc(g.name?.pt)}"></label>
          <label class="f"><span>Categoria — inglês</span><input data-gf="name.en" value="${esc(g.name?.en)}"></label>
          <div class="group__tools">
            <span class="muted">${g.items.length} serviço${g.items.length === 1 ? '' : 's'}</span>
            <button type="button" class="icon-btn" data-gmove="-1" title="Subir categoria" ${gi === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="icon-btn" data-gmove="1" title="Descer categoria" ${gi === settings.groups.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" class="icon-btn icon-btn--danger" data-gdel title="Apagar categoria">Apagar</button>
          </div>
        </div>
        <div class="svc-list">
          <div class="svc-row svc-row--head"><span>Ativo</span><span>Serviço (PT / EN)</span><span>Descrição (PT / EN)</span><span>Duração</span><span>Preço (MT)</span><span>"desde"</span><span>Categoria</span><span>Ordem</span><span></span></div>
          ${rows.map(({ s, si }) => {
            const d = window.BLStore.pricing.best(settings, s);
            return `
            <div class="svc-row ${s.active === false ? 'is-off' : ''}" data-s="${si}" data-id="${esc(s.id)}">
              <label class="chk" data-l="Ativo"><input type="checkbox" data-sf="active" ${s.active !== false ? 'checked' : ''}><span></span></label>
              <div class="stack" data-l="Serviço"><input data-sf="name.pt" value="${esc(s.name?.pt)}" placeholder="Nome em português"><input data-sf="name.en" value="${esc(s.name?.en)}" placeholder="Name in English"></div>
              <div class="stack" data-l="Descrição"><input data-sf="desc.pt" value="${esc(s.desc?.pt)}" placeholder="Descrição"><input data-sf="desc.en" value="${esc(s.desc?.en)}" placeholder="Description"></div>
              <div class="stack" data-l="Duração"><input data-sf="dur.pt" value="${esc(s.dur?.pt)}" placeholder="1 h"><input data-sf="dur.en" value="${esc(s.dur?.en)}" placeholder="1 h"></div>
              <div data-l="Preço (MT)"><input type="number" min="0" step="50" data-sf="price" value="${s.price ?? ''}" placeholder="Orçamento" ${hasOpts(s) ? 'disabled title="Com subopções o preço é a soma das subopções escolhidas pelo cliente"' : ''}>${hasOpts(s) ? '<small class="opt-hint">soma das subopções</small>' : d ? `<small class="promo-hint">Promoção: ${mt(d.price)}</small>` : ''}</div>
              <label class="chk" data-l="desde"><input type="checkbox" data-sf="from" ${s.from ? 'checked' : ''}><span></span></label>
              <div data-l="Categoria"><select data-smove-group>${gOpts(gi)}</select></div>
              <div class="order" data-l="Ordem"><button type="button" class="icon-btn" data-smove="-1" ${si === 0 ? 'disabled' : ''} title="Subir">↑</button><button type="button" class="icon-btn" data-smove="1" ${si === g.items.length - 1 ? 'disabled' : ''} title="Descer">↓</button></div>
              <button type="button" class="icon-btn icon-btn--danger" data-sdel title="Apagar serviço">×</button>
            </div>
            ${optsEditor(s, si)}`; }).join('')}
          ${!g.items.length ? '<p class="muted pad">Sem serviços nesta categoria.</p>' : ''}
        </div>
      </div>`; }).join('') || '<div class="card"><p>Nenhum serviço corresponde à pesquisa.</p></div>';
    const total = allServices().length, active = allServices().filter(x => x.active !== false).length;
    $('#svc-count').textContent = q ? `${shown} de ${total} serviços` : `${total} serviços · ${active} ativos · ${settings.groups.length} categorias`;
  }
  $('#svc-search').addEventListener('input', renderGroups);
  const gOf = el => settings.groups[+el.closest('[data-g]').dataset.g];
  const sOf = el => gOf(el).items[+el.closest('[data-s]').dataset.s];
  $('#groups').addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.gf) { setPath(gOf(el), el.dataset.gf, el.value); queueSave(); if (el.dataset.gf === 'name.pt') fillGroupSelects(); }
    if (el.dataset.sf) {
      const s = sOf(el), k = el.dataset.sf;
      if (el.type === 'checkbox') { s[k] = el.checked; if (k === 'active') el.closest('.svc-row').classList.toggle('is-off', !el.checked); }
      else if (k === 'price') s.price = el.value === '' ? null : Number(el.value);
      else setPath(s, k, el.value);
      queueSave();
    }
    if (el.dataset.of) {
      const s = sOf(el), o = s.options[+el.closest('[data-o]').dataset.o], k = el.dataset.of;
      if (el.type === 'checkbox') { o[k] = el.checked; el.closest('.opt-row').classList.toggle('is-off', !el.checked); }
      else if (k === 'price') o.price = el.value === '' ? null : Number(el.value);
      else setPath(o, k, el.value);
      if (k === 'price' || k === 'active') refreshOptsSummary(el);
      queueSave();
    }
  });
  const refreshOptsSummary = el => {
    const box = el.closest('.svc-opts'), s = sOf(el);
    const sum = (s.options || []).filter(o => o.active !== false && o.price != null && o.price !== '').reduce((a, o) => a + Number(o.price), 0);
    const em = box.querySelector('summary em'); if (em) em.textContent = 'todas juntas: ' + mt(sum);
  };
  $('#groups').addEventListener('toggle', e => {
    const d = e.target; if (!d.matches?.('.svc-opts')) return;
    d.open ? openOpts.add(d.dataset.sid) : openOpts.delete(d.dataset.sid);
  }, true);
  $('#groups').addEventListener('change', e => {
    const el = e.target; if (!el.matches('[data-smove-group]')) return;
    const from = gOf(el), s = sOf(el), to = settings.groups[+el.value];
    if (to === from) return;
    from.items.splice(from.items.indexOf(s), 1); to.items.push(s);
    renderGroups(); queueSave(); toast(`"${s.name?.pt}" movido para ${to.name?.pt}.`);
  });
  $('#groups').addEventListener('click', e => {
    const el = e.target.closest('button'); if (!el) return;
    if (el.hasAttribute('data-oadd')) {
      const s = sOf(el); s.options = s.options || []; if (!s.optMode) s.optMode = 'multi';
      s.options.push({ id: uid('op'), active: true, price: null, name: { pt: '', en: '' }, desc: { pt: '', en: '' } });
      openOpts.add(s.id); renderGroups(); queueSave();
      $$(`.svc-opts[data-sid="${CSS.escape(s.id)}"] .opt-row:last-of-type input[data-of="name.pt"]`)[0]?.focus();
      return;
    }
    if (el.hasAttribute('data-odel')) {
      const s = sOf(el), oi = +el.closest('[data-o]').dataset.o;
      if (!confirm(`Apagar a subopção "${s.options[oi].name?.pt || 'sem nome'}"?`)) return;
      s.options.splice(oi, 1); renderGroups(); queueSave(); return;
    }
    if (el.dataset.omove) {
      const s = sOf(el), i = +el.closest('[data-o]').dataset.o, j = i + +el.dataset.omove;
      [s.options[i], s.options[j]] = [s.options[j], s.options[i]]; renderGroups(); queueSave(); return;
    }
    if (el.hasAttribute('data-sdel')) {
      const g = gOf(el), s = sOf(el);
      if (!confirm(`Apagar o serviço "${s.name?.pt || 'sem nome'}"?`)) return;
      g.items.splice(g.items.indexOf(s), 1); renderGroups(); renderPromos(); queueSave();
    } else if (el.dataset.smove) {
      const g = gOf(el), i = +el.closest('[data-s]').dataset.s, j = i + +el.dataset.smove;
      [g.items[i], g.items[j]] = [g.items[j], g.items[i]]; renderGroups(); queueSave();
    } else if (el.hasAttribute('data-gdel')) {
      const g = gOf(el);
      if (!confirm(`Apagar a categoria "${g.name?.pt}" e os ${g.items.length} serviços dentro dela?`)) return;
      settings.groups.splice(settings.groups.indexOf(g), 1); renderGroups(); renderPromos(); queueSave();
    } else if (el.dataset.gmove) {
      const i = +el.closest('[data-g]').dataset.g, j = i + +el.dataset.gmove;
      [settings.groups[i], settings.groups[j]] = [settings.groups[j], settings.groups[i]];
      renderGroups(); queueSave();
    }
  });
  $('#add-group').addEventListener('click', () => {
    const name = prompt('Nome da nova categoria (português):', '');
    if (!name) return;
    settings.groups.push({ id: uid('grp'), name: { pt: name.trim(), en: name.trim() }, items: [] });
    renderGroups(); queueSave();
    $('#ns-group').value = String(settings.groups.length - 1);
    $('#new-svc').scrollIntoView({ behavior: 'smooth' });
    toast('Categoria criada. Adicione-lhe serviços no formulário acima.');
  });
  $('#reset-services').addEventListener('click', () => {
    if (!confirm('Repor todos os serviços e preços para os valores originais? As suas alterações a serviços serão perdidas.')) return;
    const d = S.defaults(); settings.groups = d.groups; settings.booking = d.booking;
    $$('[data-bind^="booking."]').forEach(i => { i.value = getPath(settings, i.dataset.bind) ?? ''; });
    renderGroups(); renderPromos(); queueSave();
  });

  /* --- promoções --- */
  const P = () => window.BLStore.pricing;
  const PSTATE = { live: ['Ativa', 'confirmado'], scheduled: ['Agendada', 'contactado'], ended: ['Terminada', 'concluido'], off: ['Desativada', 'cancelado'] };
  const fmtD = d => d ? new Date(d + 'T00:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  function renderPromoPicker(selected = []) {
    $('#pf-services').innerHTML = settings.groups.map(g => `
      <fieldset><legend>${esc(g.name?.pt)}</legend>
        ${g.items.map(s => `<label class="${s.price == null ? 'is-quote' : ''}" title="${s.price == null ? 'Sob orçamento — o desconto não se aplica automaticamente' : ''}"><input type="checkbox" value="${esc(s.id)}" ${selected.includes(s.id) ? 'checked' : ''}> ${esc(s.name?.pt)} <em>${s.price == null ? 'orçamento' : mt(s.price)}</em></label>`).join('')}
      </fieldset>`).join('');
  }
  function renderPromos() {
    if (!settings) return;
    settings.promos = settings.promos || [];
    const names = ids => ids && ids.length ? allServices().filter(s => ids.includes(s.id)).map(s => s.name?.pt).join(', ') || '—' : 'Todos os serviços com preço';
    const live = settings.promos.filter(p => P().promoStatus(p) === 'live').length;
    $('#nav-promos').hidden = !live; $('#nav-promos').textContent = live;
    $('#promo-empty').hidden = !!settings.promos.length;
    $('#promo-table tbody').innerHTML = settings.promos.map((p, i) => {
      const st = PSTATE[P().promoStatus(p)];
      return `<tr data-i="${i}">
        <td data-l="Promoção"><b>${esc(p.title?.pt)}</b>${p.desc?.pt ? `<br><span class="muted">${esc(p.desc.pt)}</span>` : ''}${p.showOnSite === false ? '<br><span class="muted">Não aparece no site</span>' : ''}</td>
        <td data-l="Desconto"><b>${esc(P().label(p, mt))}</b>${p.type === 'price' ? '<br><span class="muted">preço fixo</span>' : ''}</td>
        <td data-l="Serviços" class="svc">${esc(names(p.services))}</td>
        <td data-l="Período">${p.start ? fmtD(p.start) : 'Sem início'}<br><span class="muted">${p.end ? 'até ' + fmtD(p.end) : 'sem fim'}</span></td>
        <td data-l="Estado"><span class="pill pill--${st[1]}">${st[0]}</span></td>
        <td class="actions"><button type="button" class="icon-btn" data-pedit>Editar</button><button type="button" class="icon-btn" data-ptoggle>${p.active ? 'Desativar' : 'Ativar'}</button><button type="button" class="icon-btn icon-btn--danger" data-pdel>Apagar</button></td>
      </tr>`; }).join('');
    if (!$('#pf-id').value) renderPromoPicker([]);
  }
  const typeLabel = () => { $('#pf-value-label').textContent = { percent: 'Desconto (%) *', fixed: 'Desconto (MT) *', price: 'Preço promocional (MT) *' }[$('#pf-type').value]; };
  $('#pf-type').addEventListener('change', typeLabel);
  const resetPromoForm = () => {
    $('#promo-form').reset(); $('#pf-id').value = ''; $('#pf-active').checked = true; $('#pf-show').checked = true;
    $('#pf-title').textContent = 'Nova promoção'; $('#pf-submit').textContent = 'Criar promoção'; $('#pf-cancel').hidden = true;
    typeLabel(); renderPromoPicker([]);
  };
  $('#pf-cancel').addEventListener('click', resetPromoForm);
  $('#promo-form').addEventListener('submit', e => {
    e.preventDefault();
    const msg = $('#pf-msg'); msg.className = 'form-msg';
    const title = $('#pf-title-pt').value.trim(), value = $('#pf-value').value, type = $('#pf-type').value;
    const fail = t => { msg.textContent = t; msg.classList.add('is-err'); };
    if (!title) return fail('Indique o título da promoção.');
    if (value === '' || Number(value) <= 0) return fail('Indique o valor do desconto.');
    if (type === 'percent' && Number(value) >= 100) return fail('A percentagem deve ser inferior a 100.');
    const start = $('#pf-start').value, end = $('#pf-end').value;
    if (start && end && end < start) return fail('A data de fim é anterior à data de início.');
    const promo = {
      id: $('#pf-id').value || uid('promo'), active: $('#pf-active').checked, showOnSite: $('#pf-show').checked,
      type, value: Number(value), services: $$('#pf-services input:checked').map(i => i.value), start, end,
      title: { pt: title, en: $('#pf-title-en').value.trim() || title },
      desc: { pt: $('#pf-desc-pt').value.trim(), en: $('#pf-desc-en').value.trim() },
    };
    const i = settings.promos.findIndex(p => p.id === promo.id);
    i > -1 ? (settings.promos[i] = promo) : settings.promos.unshift(promo);
    const editing = i > -1;
    resetPromoForm(); renderPromos(); renderGroups(); queueSave();
    msg.textContent = editing ? 'Promoção atualizada.' : 'Promoção criada.'; msg.classList.add('is-ok');
  });
  $('#promo-table').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const i = +b.closest('tr').dataset.i, p = settings.promos[i];
    if (b.hasAttribute('data-pdel')) {
      if (!confirm(`Apagar a promoção "${p.title?.pt}"?`)) return;
      settings.promos.splice(i, 1);
    } else if (b.hasAttribute('data-ptoggle')) {
      p.active = !p.active;
    } else if (b.hasAttribute('data-pedit')) {
      $('#pf-id').value = p.id; $('#pf-title-pt').value = p.title?.pt || ''; $('#pf-title-en').value = p.title?.en || '';
      $('#pf-desc-pt').value = p.desc?.pt || ''; $('#pf-desc-en').value = p.desc?.en || '';
      $('#pf-type').value = p.type; $('#pf-value').value = p.value; $('#pf-start').value = p.start || ''; $('#pf-end').value = p.end || '';
      $('#pf-active').checked = !!p.active; $('#pf-show').checked = p.showOnSite !== false;
      renderPromoPicker(p.services || []); typeLabel();
      $('#pf-title').textContent = 'Editar promoção'; $('#pf-submit').textContent = 'Guardar alterações'; $('#pf-cancel').hidden = false;
      $('#v-promos').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    renderPromos(); renderGroups(); queueSave();
  });

  /* ---------------- conta ---------------- */
  function renderStorage() {
    $('#storage-info').innerHTML = S.mode !== 'local'
      ? '<span class="pill pill--confirmado">Ligado</span> Marcações, serviços, preços, promoções, contactos, cotações e os PDFs das cotações estão guardados na base de dados Supabase da Blackline. A palavra-passe do painel é verificada no Supabase.'
      : '<span class="pill pill--novo">Demonstração</span> Os dados estão guardados apenas neste navegador. Para ligar a base de dados:';
    $('#storage-steps').hidden = S.mode !== 'local';
  }
  $('#pw-form').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('#pw-msg'); msg.className = 'form-msg';
    const o = $('#pw-old').value, n = $('#pw-new').value, n2 = $('#pw-new2').value;
    if (n.length < 8) { msg.textContent = ERR.weak_password; msg.classList.add('is-err'); return; }
    if (n !== n2) { msg.textContent = 'As palavras-passe novas não coincidem.'; msg.classList.add('is-err'); return; }
    try { await guard(() => S.changePassword(o, n)); msg.textContent = 'Palavra-passe alterada.'; msg.classList.add('is-ok'); e.target.reset(); }
    catch (err) { msg.textContent = err.code === 'auth' || err.message === 'auth' ? 'A palavra-passe atual não está correta.' : errMsg(err); msg.classList.add('is-err'); }
  });
  $('#backup-export').addEventListener('click', async () => {
    const data = await S.exportAll();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = `blackline-copia-${todayISO()}.json`; a.click();
  });
  $('#backup-import').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!confirm('Repor esta cópia? Os preços e contactos atuais serão substituídos.')) return;
      await guard(() => S.importAll(data)); await loadSettings(); await loadBookings(); toast('Cópia reposta.');
    } catch (err) { toast('Ficheiro inválido.', 'err'); }
    e.target.value = '';
  });

  window.BLAdmin = {
    settings: () => settings,
    async saveQuote(b, data, opts = {}) {
      saveState('saving');
      try {
        const r = await guard(() => S.saveQuote(b.id, data, opts));
        b.quote = data;
        if (opts.sent) { b.quoteAt = new Date().toISOString(); if (b.status === 'novo') b.status = 'contactado'; }
        if (r?.url) { b.quoteUrl = r.url; b.quoteHasPdf = true; }
        saveState('saved'); renderBookings(); if (current === b) openDrawer(b.id);
        return r || {};
      } catch (e) { saveState('error'); toast(errMsg(e), 'err'); throw e; }
    },
    parseQuote, fmtDay, tel, name, toast, errMsg,
    async savePatch(b, p) {
      Object.assign(b, p);
      saveState('saving');
      try { await guard(() => S.updateBooking(b.id, p)); saveState('saved'); renderBookings(); if (current === b) openDrawer(b.id); return true; }
      catch (e) { saveState('error'); toast(errMsg(e), 'err'); return false; }
    },
  };

  /* ---------------- arranque ---------------- */
  S.hasSession().then(ok => (ok ? showApp() : showLogin())).catch(() => showLogin());
})();

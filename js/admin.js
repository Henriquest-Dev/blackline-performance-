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
      throw e;
    }
  };
  $$('[data-pw]').forEach(b => b.addEventListener('click', () => {
    const i = $('#' + b.dataset.pw); const show = i.type === 'password';
    i.type = show ? 'text' : 'password'; b.textContent = show ? 'Ocultar' : 'Mostrar';
  }));

  /* ---------------- login ---------------- */
  const modeText = S.mode === 'remote'
    ? 'Ligado à Folha Google da Blackline.'
    : 'Modo demonstração — os dados ficam neste navegador.';
  $('#lg-mode').textContent = modeText;

  function showLogin(msg) {
    $('#app').hidden = true; $('#login').hidden = false;
    $('#lg-err').textContent = msg || '';
    setTimeout(() => $('#lg-user').focus(), 50);
  }
  async function showApp() {
    $('#login').hidden = true; $('#app').hidden = false;
    $('#mode-banner').hidden = S.mode === 'remote';
    renderStorage();
    await loadSettings();
    await loadBookings();
  }
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
  $('#logout').addEventListener('click', () => { S.logout(); showLogin(); });

  /* ---------------- navegação ---------------- */
  const TITLES = { bookings: 'Marcações', services: 'Serviços e preços', contacts: 'Contactos e horário', account: 'Conta' };
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
  const fmtDT = iso => { if (!iso) return ''; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }); };
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
      ['date', 'Data'], ['time', 'Hora'], ['dropoff', 'Entrega'], ['notes', 'Descrição'], ['internalNote', 'Nota interna']];
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
        ${row('Serviços', esc(b.servicesLabel))}${row('Total estimado', esc(b.total))}</dl>
      <h3>Viatura</h3><dl>
        ${row('Marca e modelo', esc([b.brand, b.model].filter(Boolean).join(' ')))}${row('Ano', esc(b.year))}${row('Combustível', esc(FUEL[b.fuel] || b.fuel))}
        ${row('Quilometragem', b.km && esc(b.km) + ' km')}${row('Matrícula', b.plate && `<span class="plate">${esc(b.plate)}</span>`)}${row('Chassis (VIN)', `<span class="mono">${esc(b.chassis) || '—'}</span>`)}</dl>
      <h3>Cliente</h3><dl>
        ${row('Telemóvel', esc(tel(b.phone)))}${row('Email', esc(b.email))}${row('Contacto preferido', esc(PREF[b.contactPref] || b.contactPref))}
        ${row('Idioma', b.lang === 'en' ? 'Inglês' : 'Português')}${row('Descrição', esc(b.notes))}</dl>`;
    const first = b.firstName || '';
    const msg = `Olá ${first}, daqui fala a Blackline Performance. Recebemos o seu pedido ${b.ref} para ${fmtDay(b.date, b.time)} (${[b.brand, b.model].filter(Boolean).join(' ')}). Podemos confirmar?`;
    $('#dr-wa').href = `https://wa.me/258${b.phone}?text=${encodeURIComponent(msg)}`;
    $('#dr-call').href = `tel:+258${b.phone}`;
    $('#dr-mail').hidden = !b.email; $('#dr-mail').href = `mailto:${b.email}?subject=${encodeURIComponent('Marcação ' + b.ref)}`;
    $('#dr-note').value = b.internalNote || '';
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
    $$('[data-bind]').forEach(i => { const v = getPath(settings, i.dataset.bind); i.value = v ?? ''; });
    renderGroups();
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
    if (i.dataset.bind === 'contacts.whatsapp') v = v.replace(/\D/g, '');
    if (/instagram|tiktok/.test(i.dataset.bind)) v = v.replace(/^@/, '').trim();
    setPath(settings, i.dataset.bind, v);
    queueSave();
  });

  const uid = p => p + '-' + Math.random().toString(36).slice(2, 7);
  function renderGroups() {
    $('#groups').innerHTML = settings.groups.map((g, gi) => `
      <div class="card group" data-g="${gi}">
        <div class="group__head">
          <label class="f"><span>Categoria — português</span><input data-gf="name.pt" value="${esc(g.name?.pt)}"></label>
          <label class="f"><span>Categoria — inglês</span><input data-gf="name.en" value="${esc(g.name?.en)}"></label>
          <div class="group__tools">
            <button type="button" class="icon-btn" data-gmove="-1" title="Subir" ${gi === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="icon-btn" data-gmove="1" title="Descer" ${gi === settings.groups.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" class="icon-btn icon-btn--danger" data-gdel title="Apagar categoria">Apagar</button>
          </div>
        </div>
        <div class="svc-list">
          <div class="svc-row svc-row--head"><span>Ativo</span><span>Serviço (PT / EN)</span><span>Descrição (PT / EN)</span><span>Duração</span><span>Preço (MT)</span><span>"desde"</span><span></span></div>
          ${g.items.map((s, si) => `
            <div class="svc-row ${s.active === false ? 'is-off' : ''}" data-s="${si}">
              <label class="chk" data-l="Ativo"><input type="checkbox" data-sf="active" ${s.active !== false ? 'checked' : ''}><span></span></label>
              <div class="stack" data-l="Serviço"><input data-sf="name.pt" value="${esc(s.name?.pt)}" placeholder="Nome em português"><input data-sf="name.en" value="${esc(s.name?.en)}" placeholder="Name in English"></div>
              <div class="stack" data-l="Descrição"><input data-sf="desc.pt" value="${esc(s.desc?.pt)}" placeholder="Descrição"><input data-sf="desc.en" value="${esc(s.desc?.en)}" placeholder="Description"></div>
              <div class="stack" data-l="Duração"><input data-sf="dur.pt" value="${esc(s.dur?.pt)}" placeholder="1 h"><input data-sf="dur.en" value="${esc(s.dur?.en)}" placeholder="1 h"></div>
              <div data-l="Preço (MT)"><input type="number" min="0" step="50" data-sf="price" value="${s.price ?? ''}" placeholder="Orçamento"></div>
              <label class="chk" data-l="desde"><input type="checkbox" data-sf="from" ${s.from ? 'checked' : ''}><span></span></label>
              <button type="button" class="icon-btn icon-btn--danger" data-sdel title="Apagar serviço">×</button>
            </div>`).join('')}
        </div>
        <button type="button" class="btn btn--ghost btn--sm" data-sadd>+ Adicionar serviço</button>
      </div>`).join('');
  }
  const gOf = el => settings.groups[+el.closest('[data-g]').dataset.g];
  const sOf = el => gOf(el).items[+el.closest('[data-s]').dataset.s];
  $('#groups').addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.gf) { setPath(gOf(el), el.dataset.gf, el.value); queueSave(); }
    if (el.dataset.sf) {
      const s = sOf(el), k = el.dataset.sf;
      if (el.type === 'checkbox') { s[k] = el.checked; if (k === 'active') el.closest('.svc-row').classList.toggle('is-off', !el.checked); }
      else if (k === 'price') s.price = el.value === '' ? null : Number(el.value);
      else setPath(s, k, el.value);
      queueSave();
    }
  });
  $('#groups').addEventListener('click', e => {
    const el = e.target.closest('button'); if (!el) return;
    if (el.hasAttribute('data-sadd')) {
      gOf(el).items.push({ id: uid('svc'), active: true, price: null, name: { pt: '', en: '' }, desc: { pt: '', en: '' }, dur: { pt: '', en: '' } });
      renderGroups(); queueSave();
      const rows = $$(`[data-g="${settings.groups.indexOf(gOf(el)) }"] .svc-row:not(.svc-row--head)`);
      rows[rows.length - 1]?.querySelector('input[data-sf="name.pt"]')?.focus();
    } else if (el.hasAttribute('data-sdel')) {
      const g = gOf(el), s = sOf(el);
      if (!confirm(`Apagar o serviço "${s.name?.pt || 'sem nome'}"?`)) return;
      g.items.splice(g.items.indexOf(s), 1); renderGroups(); queueSave();
    } else if (el.hasAttribute('data-gdel')) {
      const g = gOf(el);
      if (!confirm(`Apagar a categoria "${g.name?.pt}" e os ${g.items.length} serviços dentro dela?`)) return;
      settings.groups.splice(settings.groups.indexOf(g), 1); renderGroups(); queueSave();
    } else if (el.dataset.gmove) {
      const i = +el.closest('[data-g]').dataset.g, j = i + +el.dataset.gmove;
      [settings.groups[i], settings.groups[j]] = [settings.groups[j], settings.groups[i]];
      renderGroups(); queueSave();
    }
  });
  $('#add-group').addEventListener('click', () => {
    settings.groups.push({ id: uid('grp'), name: { pt: 'Nova categoria', en: 'New category' }, items: [] });
    renderGroups(); queueSave();
  });
  $('#reset-services').addEventListener('click', () => {
    if (!confirm('Repor todos os serviços e preços para os valores originais? As suas alterações a serviços serão perdidas.')) return;
    const d = S.defaults(); settings.groups = d.groups; settings.booking = d.booking;
    $$('[data-bind^="booking."]').forEach(i => { i.value = getPath(settings, i.dataset.bind) ?? ''; });
    renderGroups(); queueSave();
  });

  /* ---------------- conta ---------------- */
  function renderStorage() {
    $('#storage-info').innerHTML = S.mode === 'remote'
      ? '<span class="pill pill--confirmado">Ligado</span> As marcações e definições estão guardadas na Folha Google da Blackline. Pode também abrir a folha "Marcações" diretamente no Google Sheets.'
      : '<span class="pill pill--novo">Demonstração</span> Os dados estão guardados apenas neste navegador. Clientes noutros dispositivos não aparecem aqui até ligar a Folha Google:';
    $('#storage-steps').hidden = S.mode === 'remote';
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

  /* ---------------- arranque ---------------- */
  S.token ? showApp().catch(() => showLogin()) : showLogin();
})();

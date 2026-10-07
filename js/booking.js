/* Blackline Performance — marcação de serviço */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = $('#agendar');
  if (!root) return;

  const gsap = window.gsap;
  const I = window.BLi18n;
  const t = (k, v) => I.t(k, v);
  const L = v => I.pick(v);

  const BRANDS = ['Audi', 'BMW', 'Chevrolet', 'Ford', 'Honda', 'Hyundai', 'Isuzu', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Porsche', 'Renault', 'Subaru', 'Suzuki', 'Toyota', 'Volkswagen', 'Volvo'];
  const MORNING = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  const AFTERNOON = ['13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

  let settings = window.BL_DEFAULTS;
  let GROUPS = [], SERVICES = [];
  const loadServices = s => {
    settings = s;
    GROUPS = s.groups.map(g => ({ ...g, items: g.items.filter(i => i.active !== false) })).filter(g => g.items.length);
    SERVICES = GROUPS.flatMap(g => g.items);
  };
  loadServices(settings);
  const pickupFee = () => Number(settings.booking?.pickupFee) || 0;

  const state = {
    step: 0, reached: 0, services: new Set(),
    brand: '', model: '', year: '', km: '', fuel: '', plate: '', chassis: '',
    date: null, slot: '', drop: 'oficina',
    first: '', last: '', phone: '', email: '', pref: 'whatsapp', notes: '', consent: false, ref: '',
    opts: {}, svcNotes: {}, goal: '', symptoms: new Set(), since: '', drive: '', urgency: 'normal', parts: 'oficina',
  };

  const mt = n => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' MT';
  const P = window.BLStore.pricing;
  // subopções escolhidas (null = serviço sem subopções)
  const picked = s => P.hasOpts(s) && (state.opts[s.id]?.size || 0) > 0;
  const sel = s => picked(s) ? [...state.opts[s.id]] : undefined;
  const deal = s => P.best(settings, s, undefined, sel(s));
  const base = s => P.base(s, sel(s));
  const finalPrice = s => { const d = deal(s); return d ? d.price : Number(base(s)) || 0; };
  // "desde": preço fixo marcado como "desde", ou subopções ainda por escolher
  const isFrom = s => P.hasOpts(s) ? !picked(s) : !!s.from;
  const isQuote = s => base(s) == null || P.partQuote(s, sel(s));
  const priceLabel = s => {
    if (base(s) == null) return t('bk.quote');
    return (isFrom(s) ? t('bk.from') + ' ' : '') + mt(finalPrice(s)) + (P.partQuote(s, sel(s)) ? ' + ' + t('bk.quote').toLowerCase() : '');
  };
  const priceHTML = s => { const d = deal(s); return d ? `<s>${mt(d.was)}</s><span class="now">${(isFrom(s) ? t('bk.from') + ' ' : '') + mt(d.price)}</span>` : priceLabel(s); };
  const optPrice = o => o.price == null || o.price === '' ? t('bk.quote') : mt(o.price);
  const optNames = s => P.chosen(s, sel(s)).map(o => L(o.name));
  const svcLine = s => L(s.name) + (picked(s) ? ' — ' + optNames(s).join(', ') : '');
  const promoTag = s => { const d = deal(s); return d ? `<span class="bk-promo-tag">${P.label(d.promo, mt)}</span>` : ''; };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const dateLong = d => cap(d.toLocaleDateString(I.locale(), { weekday: 'long', day: 'numeric', month: 'long' }));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const chosen = () => SERVICES.filter(s => state.services.has(s.id));
  const brandLabel = () => state.brand === '__other' ? '' : state.brand;
  const carLabel = () => [brandLabel(), state.model].filter(Boolean).join(' ');
  const whenLabel = () => state.date && state.slot ? `${dateLong(state.date)}, ${state.slot}` : '';
  const fullName = () => [state.first, state.last].filter(Boolean).join(' ');
  const telLabel = () => '+258 ' + state.phone.replace(/^(\d{2})(\d{3})(\d{0,4}).*/, '$1 $2 $3').trim();
  const fuelLabel = () => state.fuel ? t({ gasolina: 'bk.fuelG', diesel: 'bk.fuelD', hibrido: 'bk.fuelH', eletrico: 'bk.fuelE' }[state.fuel]) : '';
  const isoDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  /* ---------------- Serviços ---------------- */
  const renderServices = () => {
    $('#bk-services').innerHTML = GROUPS.map(g => `
      <div class="bk-group">
        <h3 class="bk-group__name">${esc(L(g.name))}</h3>
        ${g.items.map(s => `
          <div class="bk-svc-wrap${state.services.has(s.id) ? ' is-on' : ''}" data-svc="${esc(s.id)}">
          <label class="bk-svc">
            <input type="checkbox" value="${esc(s.id)}" ${state.services.has(s.id) ? 'checked' : ''}>
            <span class="bk-box" aria-hidden="true"></span>
            <span class="bk-svc__main"><b>${esc(L(s.name))}${promoTag(s)}</b><small>${esc(L(s.desc))}</small></span>
            <span class="bk-svc__dur">${esc(L(s.dur))}</span>
            <span class="bk-svc__price">${priceHTML(s)}</span>
          </label>
          ${state.services.has(s.id) ? optsHTML(s) : ''}
          </div>`).join('')}
      </div>`).join('');
  };
  // painel de subopções + detalhe do serviço (aparece quando o serviço está escolhido)
  function optsHTML(s) {
    const has = P.hasOpts(s), single = s.optMode === 'single', cur = new Set(state.opts[s.id] || []);
    const list = has ? `
      <div class="bk-opts__head"><span>${single ? t('bk.optsSingle') : t('bk.optsMulti')}</span>
        ${single ? '' : `<button type="button" data-opt-all>${cur.size === P.opts(s).length ? t('bk.optsNone') : t('bk.optsAll')}</button>`}</div>
      <div class="bk-opts__list">${P.opts(s).map(o => `
        <label class="bk-opt">
          <input type="${single ? 'radio' : 'checkbox'}" name="opt-${esc(s.id)}" value="${esc(o.id)}" ${cur.has(o.id) ? 'checked' : ''}>
          <span class="bk-opt__mark" aria-hidden="true"></span>
          <span class="bk-opt__main"><b>${esc(L(o.name))}</b>${L(o.desc) ? `<small>${esc(L(o.desc))}</small>` : ''}</span>
          <span class="bk-opt__price">${optPrice(o)}</span>
        </label>`).join('')}</div>
      ${picked(s) ? `<div class="bk-opts__sum"><span>${esc(L(s.name))}</span><b>${priceLabel(s)}</b></div>` : ''}` : '';
    return `<div class="bk-opts">${list}
      <label class="bk-opts__note"><span>${t('bk.svcNote')}</span><input type="text" maxlength="160" data-svc-note value="${esc(state.svcNotes[s.id] || '')}" placeholder="${esc(t('bk.svcNotePh'))}"></label>
      <p class="bk-err" data-err="opt-${esc(s.id)}"></p></div>`;
  }
  const refreshSvc = id => {
    const w = $(`.bk-svc-wrap[data-svc="${CSS.escape(id)}"]`, root); if (!w) return;
    const s = SERVICES.find(x => x.id === id);
    const on = state.services.has(id);
    w.classList.toggle('is-on', on);
    w.querySelector('.bk-svc__price').innerHTML = priceHTML(s);
    const old = w.querySelector('.bk-opts'), focusNote = document.activeElement?.matches?.('[data-svc-note]') && w.contains(document.activeElement);
    if (old && focusNote) return;
    old?.remove();
    if (on) w.insertAdjacentHTML('beforeend', optsHTML(s));
  };
  $('#bk-services').addEventListener('change', e => {
    const w = e.target.closest('.bk-svc-wrap'); if (!w) return;
    const id = w.dataset.svc;
    if (e.target.matches('.bk-svc input[type=checkbox]')) {
      e.target.checked ? state.services.add(id) : state.services.delete(id);
      clearErr('services'); refreshSvc(id); update(); return;
    }
    if (e.target.closest('.bk-opt')) {
      const set = new Set(state.opts[id] || []);
      if (e.target.type === 'radio') { set.clear(); set.add(e.target.value); }
      else e.target.checked ? set.add(e.target.value) : set.delete(e.target.value);
      state.opts[id] = set; clearErr('opt-' + id); clearErr('services'); refreshSvc(id); update();
    }
  });
  $('#bk-services').addEventListener('input', e => {
    if (!e.target.matches('[data-svc-note]')) return;
    state.svcNotes[e.target.closest('.bk-svc-wrap').dataset.svc] = e.target.value.trim();
  });
  $('#bk-services').addEventListener('click', e => {
    const b = e.target.closest('[data-opt-all]'); if (!b) return;
    const id = b.closest('.bk-svc-wrap').dataset.svc, s = SERVICES.find(x => x.id === id);
    const all = P.opts(s).map(o => o.id), cur = state.opts[id] || new Set();
    state.opts[id] = new Set(cur.size === all.length ? [] : all);
    clearErr('opt-' + id); refreshSvc(id); update();
  });

  /* ---------------- Viatura ---------------- */
  const renderSelects = () => {
    const b = $('#bk-brand'), cur = b.value;
    b.innerHTML = `<option value="">${t('bk.select')}</option>` + BRANDS.map(x => `<option>${x}</option>`).join('') + `<option value="__other">${t('bk.other')}</option>`;
    b.value = cur;
    const y = $('#bk-year');
    if (!y.options.length) {
      const top = new Date().getFullYear() + 1;
      y.innerHTML = '<option value="">—</option>' + Array.from({ length: top - 1984 }, (_, i) => `<option>${top - i}</option>`).join('');
    }
  };
  const field = (sel, key, fmt = v => v.trim()) => {
    const el = $(sel);
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => {
      if (key === 'km') { const d = el.value.replace(/\D/g, '').slice(0, 7); el.value = d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''; }
      if (key === 'plate' || key === 'chassis') { const p = el.selectionStart; el.value = el.value.toUpperCase(); el.setSelectionRange(p, p); }
      state[key] = fmt(el.value); clearErr(key); update();
    });
  };
  field('#bk-brand', 'brand'); field('#bk-model', 'model'); field('#bk-year', 'year');
  field('#bk-km', 'km'); field('#bk-plate', 'plate', v => v.replace(/\s+/g, ' ').trim());
  field('#bk-chassis', 'chassis', v => v.replace(/\s+/g, '').trim());
  field('#bk-first', 'first'); field('#bk-last', 'last');
  field('#bk-phone', 'phone', v => v.replace(/\D/g, '').replace(/^258(?=\d{9}$)/, ''));
  field('#bk-email', 'email'); field('#bk-notes', 'notes');
  $('#bk-consent').addEventListener('change', e => { state.consent = e.target.checked; clearErr('consent'); });

  const segmented = (sel, key) => $(sel).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    state[key] = b.dataset.v;
    $$('button', $(sel)).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); });
    update();
  });
  segmented('#bk-fuel', 'fuel'); segmented('#bk-pref', 'pref');
  // "Sobre o pedido": objetivo (uma escolha) e sinais (várias)
  $('#bk-goal').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    state.goal = state.goal === b.dataset.v ? '' : b.dataset.v;
    $$('button', $('#bk-goal')).forEach(x => x.setAttribute('aria-pressed', x.dataset.v === state.goal));
  });
  $('#bk-symptoms').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    state.symptoms.has(b.dataset.v) ? state.symptoms.delete(b.dataset.v) : state.symptoms.add(b.dataset.v);
    b.setAttribute('aria-pressed', state.symptoms.has(b.dataset.v));
  });
  [['#bk-since', 'since'], ['#bk-drive', 'drive'], ['#bk-urgency', 'urgency'], ['#bk-parts', 'parts']]
    .forEach(([sel, k]) => $(sel).addEventListener('change', e => (state[k] = e.target.value)));
  const optText = (sel, v) => { const o = v && $(`${sel} option[value="${v}"]`); return o ? o.textContent : ''; };
  const chipText = (sel, v) => { const b = $(`${sel} button[data-v="${v}"]`); return b ? b.textContent : v; };
  // linhas do pedido (para o resumo e para o painel)
  const aboutRows = () => [
    [t('bk.goal'), state.goal && chipText('#bk-goal', state.goal)],
    [t('bk.symptoms'), [...state.symptoms].map(v => chipText('#bk-symptoms', v)).join(', ')],
    [t('bk.since'), optText('#bk-since', state.since)],
    [t('bk.drive'), optText('#bk-drive', state.drive)],
    [t('bk.urgency'), state.urgency === 'urgente' ? optText('#bk-urgency', 'urgente') : ''],
    [t('bk.parts'), optText('#bk-parts', state.parts)],
  ].filter(r => r[1]);
  $$('input[name="bk-drop"]').forEach(r => r.addEventListener('change', () => { state.drop = r.value; update(); }));

  /* ---------------- Calendário ---------------- */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const first = new Date(today); if (new Date().getHours() >= 15) first.setDate(first.getDate() + 1);
  const last = new Date(today); last.setDate(last.getDate() + 60);
  let view = new Date(first.getFullYear(), first.getMonth(), 1);

  // ocupação de exemplo, estável por data (até haver agenda real)
  const hash = (d, k = 0) => ((d.getFullYear() * 400 + d.getMonth() * 37 + d.getDate() * 11 + k * 7) * 2654435761 >>> 0) % 100;
  // feriados nacionais de Moçambique (datas fixas)
  const HOLIDAYS = ['01-01', '02-03', '04-07', '05-01', '06-25', '09-07', '09-25', '10-04', '12-25'];
  const isHoliday = d => HOLIDAYS.includes(String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
  // sábados, domingos e feriados: por marcação (sujeito a confirmação)
  const special = d => d.getDay() === 0 || d.getDay() === 6 || isHoliday(d);
  const weekendOpen = () => (settings.booking?.weekend || 'request') !== 'closed';
  const slotsFor = d => {
    const close = settings.booking?.weekdayClose || '17:30';
    const [ch, cm] = close.split(':').map(Number);
    const lastStart = ch * 60 + cm - 30;
    const afternoon = [];
    for (let m = 13 * 60 + 30; m <= lastStart; m += 30) afternoon.push(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'));
    const list = [...MORNING.filter(x => { const [h, m] = x.split(':').map(Number); return h * 60 + m <= lastStart; }), ...afternoon];
    return list.map((tm, k) => {
      const [h, m] = tm.split(':').map(Number);
      const at = new Date(d); at.setHours(h, m);
      return { t: tm, free: (special(d) || hash(d, k) > 34) && at.getTime() > Date.now() + 2 * 3600e3 };
    });
  };
  const dayOpen = d => d >= first && d <= last && (!special(d) || weekendOpen()) && slotsFor(d).some(s => s.free);
  const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();

  const renderCal = () => {
    $('#bk-dow').innerHTML = t('bk.dow').split(',').map(d => `<span>${d}</span>`).join('');
    $('#bk-cal-month').textContent = cap(view.toLocaleDateString(I.locale(), { month: 'long', year: 'numeric' }));
    const pad = (view.getDay() + 6) % 7;
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    let html = '<span></span>'.repeat(pad);
    for (let i = 1; i <= days; i++) {
      const d = new Date(view.getFullYear(), view.getMonth(), i);
      const open = dayOpen(d);
      const cls = [sameDay(d, today) ? 'today' : '', sameDay(d, state.date) ? 'on' : ''].join(' ').trim();
      html += `<button type="button" data-d="${i}" class="${cls}" ${open ? '' : 'disabled'} aria-label="${dateLong(d)}${open ? '' : ' — ' + t('bk.unavailable')}">${i}</button>`;
    }
    $('#bk-cal-grid').innerHTML = html;
    $('[data-cal="-1"]').disabled = view <= new Date(first.getFullYear(), first.getMonth(), 1);
    $('[data-cal="1"]').disabled = view >= new Date(last.getFullYear(), last.getMonth(), 1);
  };
  const renderTimes = () => {
    const box = $('#bk-times');
    if (!state.date) { box.innerHTML = `<p class="bk-times__empty">${t('bk.pickDay')}</p>`; return; }
    const slots = slotsFor(state.date);
    const group = (label, list) => list.length ? `<div class="bk-times__group"><span>${label}</span><div>${list.map(s =>
      `<button type="button" data-t="${s.t}" ${s.free ? '' : 'disabled'} class="${s.t === state.slot ? 'on' : ''}">${s.t}</button>`).join('')}</div></div>` : '';
    box.innerHTML = `<p class="bk-times__day">${dateLong(state.date)}</p>` +
      (special(state.date) ? `<p class="bk-times__note">${t('bk.weekendNote')}</p>` : '') +
      group(t('bk.morning'), slots.filter(s => s.t < '12:00')) + group(t('bk.afternoon'), slots.filter(s => s.t > '12:00'));
  };
  $$('.bk-cal__nav').forEach(b => b.addEventListener('click', () => {
    view = new Date(view.getFullYear(), view.getMonth() + +b.dataset.cal, 1); renderCal();
  }));
  $('#bk-cal-grid').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    state.date = new Date(view.getFullYear(), view.getMonth(), +b.dataset.d);
    state.slot = '';
    renderCal(); renderTimes(); update();
    if (matchMedia('(max-width: 860px)').matches) $('#bk-times').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  $('#bk-times').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    state.slot = b.dataset.t;
    $$('button', $('#bk-times')).forEach(x => x.classList.toggle('on', x === b));
    clearErr('slot'); update();
  });

  /* ---------------- Validação ---------------- */
  const setErr = (k, msg) => {
    const p = $(`[data-err="${k}"]`, root); if (!p) return;
    p.textContent = msg;
    p.closest('.bk-f')?.classList.add('has-err');
  };
  function clearErr(k) {
    const p = $(`[data-err="${k}"]`, root); if (!p) return;
    p.textContent = ''; p.closest('.bk-f')?.classList.remove('has-err');
  }
  const validate = step => {
    const e = {};
    if (step === 0 && !state.services.size) e.services = t('err.services');
    if (step === 0) chosen().filter(s => P.hasOpts(s) && !picked(s)).forEach(s => (e['opt-' + s.id] = t('err.opts', { s: L(s.name) })));
    if (step === 1) {
      if (!state.brand) e.brand = t('err.brand');
      if (!state.model) e.model = t('err.model');
      if (state.plate && !/^[A-Z0-9 -]{5,10}$/.test(state.plate)) e.plate = t('err.plate');
      if (!state.chassis) e.chassis = t('err.chassis');
      else if (!/^[A-Z0-9-]{6,20}$/.test(state.chassis)) e.chassis = t('err.chassisFmt');
    }
    if (step === 2 && !(state.date && state.slot)) e.slot = state.date ? t('err.slotTime') : t('err.slot');
    if (step === 3) {
      if (state.first.length < 2) e.first = t('err.first');
      if (state.last.length < 2) e.last = t('err.last');
      if (!/^8[2-7]\d{7}$/.test(state.phone)) e.phone = t('err.phone');
      if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) e.email = t('err.email');
      if (!state.consent) e.consent = t('err.consent');
    }
    Object.entries(e).forEach(([k, m]) => setErr(k, m));
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      const errEl = $(`[data-err="${firstKey}"]`, root);
      errEl.closest('.bk-f, section')?.querySelector('input, select, textarea')?.focus({ preventScroll: true });
      errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      gsap && gsap.fromTo($$('.bk-err', root).filter(x => x.textContent), { x: -6 }, { x: 0, duration: .4, ease: 'elastic.out(1, .4)' });
    }
    return !firstKey;
  };

  /* ---------------- Resumo ---------------- */
  const totals = () => {
    const list = chosen();
    const sum = list.reduce((a, s) => a + finalPrice(s), 0) + (state.drop === 'recolha' ? pickupFee() : 0);
    return { sum, quote: list.some(isQuote), from: list.some(isFrom) };
  };
  const totalLabel = () => { const x = totals(); return (x.from ? t('bk.from') + ' ' : '') + mt(x.sum); };
  const update = () => {
    const list = chosen();
    $('#bk-sum-services').innerHTML = list.length
      ? '<ul>' + list.map(s => `<li><span>${esc(L(s.name))}${picked(s) ? `<small>${esc(optNames(s).join(', '))}</small>` : ''}</span><span>${priceLabel(s)}</span></li>`).join('') +
        (state.drop === 'recolha' ? `<li><span>${t('bk.pickup')}</span><span>${mt(pickupFee())}</span></li>` : '') + '</ul>'
      : '—';
    $('#bk-sum-car').innerHTML = carLabel()
      ? `${esc(carLabel())}${state.year ? ' · ' + state.year : ''}${state.plate ? `<br><span class="bk-mini-plate">${esc(state.plate)}</span>` : ''}${state.chassis ? `<br><span class="bk-mono-sm">${esc(state.chassis)}</span>` : ''}` : '—';
    $('#bk-sum-date').textContent = whenLabel() || '—';
    $('#bk-sum-client').innerHTML = fullName() ? `${esc(fullName())}${state.phone ? '<br>' + telLabel() : ''}` : '—';
    $('#bk-total').textContent = totalLabel();
    $('#bk-total-note').textContent = totals().quote ? t('bk.noteQuote') : t('bk.noteVat');
    $('#bk-pickup-note').textContent = t('bk.drop2d', { fee: mt(pickupFee()) });
  };

  const renderReview = () => {
    const sec = (title, step, rows) => `
      <div class="bk-rv">
        <div class="bk-rv__head"><h3>${title}</h3><button type="button" data-go="${step}">${t('bk.edit')}</button></div>
        <dl>${rows.filter(r => r[1]).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      </div>`;
    $('#bk-review').innerHTML =
      sec(t('bk.t1'), 0, chosen().map(s => [esc(L(s.name)), priceLabel(s) + (picked(s) ? `<small class="bk-rv__sub">${esc(optNames(s).join(', '))}</small>` : '') +
        (state.svcNotes[s.id] ? `<small class="bk-rv__sub">“${esc(state.svcNotes[s.id])}”</small>` : '')]).concat(state.drop === 'recolha' ? [[t('bk.pickup'), mt(pickupFee())]] : [])) +
      sec(t('bk.t2'), 1, [[t('bk.rvMakeModel'), esc(carLabel())], [t('bk.year'), state.year], [t('bk.fuel'), fuelLabel()], [t('bk.km'), state.km && state.km + ' km'],
        [t('bk.plate'), state.plate && `<span class="bk-mini-plate">${esc(state.plate)}</span>`], [t('bk.chassis'), `<span class="bk-mono-sm">${esc(state.chassis)}</span>`]]) +
      (aboutRows().length ? sec(t('bk.rvDetails'), 1, aboutRows().map(([k, v]) => [k, esc(v)])) : '') +
      sec(t('bk.t3'), 2, [[t('bk.rvDate'), state.date && dateLong(state.date)], [t('bk.rvTime'), state.slot], [t('bk.rvDrop'), state.drop === 'recolha' ? t('bk.rvDropHome') : t('bk.rvDropShop')]]) +
      sec(t('bk.t4'), 3, [[t('bk.rvName'), esc(fullName())], [t('bk.phone'), telLabel()], [t('bk.email'), esc(state.email)], [t('bk.rvPref'), t('bk.pref.' + state.pref)], [t('bk.notes'), esc(state.notes)]]) +
      `<div class="bk-rv__total"><span>${t('bk.total')}</span><b>${totalLabel()}</b></div>`;
  };

  /* ---------------- Etapas ---------------- */
  const steps = $$('.bk-step', root);
  const tabs = $$('#bk-tabs li');
  const nextBtn = $('#bk-next'), backBtn = $('#bk-back');

  const chrome = () => {
    const s = state.step, sent = s === 5;
    $('#bk-title').textContent = t('bk.h' + s);
    const sub = t('bk.d' + s);
    $('#bk-sub').textContent = sub; $('#bk-sub').hidden = !sub;
    $('#bk-step-n').textContent = sent ? t('bk.done') : t('bk.step', { n: s + 1 });
    $('#bk-bar').style.transform = `scaleX(${sent ? 1 : (s + 1) / 5})`;
    tabs.forEach((li, i) => {
      li.classList.toggle('is-current', i === s);
      li.classList.toggle('is-done', i < s || sent);
      const b = li.querySelector('button');
      b.disabled = sent || i > state.reached;
      b.setAttribute('aria-current', i === s ? 'step' : 'false');
    });
    root.classList.toggle('is-sent', sent);
    backBtn.hidden = s === 0 || sent;
    nextBtn.textContent = sent ? t('bk.finish') : s === 4 ? t('bk.send') : t('bk.next');
    update();
  };

  const go = to => {
    if (to === state.step) return;
    const from = steps[state.step], dir = to > state.step ? 1 : -1;
    if (to === 4) renderReview();
    if (to === 2) { renderCal(); renderTimes(); }
    state.step = to;
    state.reached = Math.max(state.reached, Math.min(to, 4));
    const show = () => { steps.forEach(x => x.classList.toggle('is-active', x === steps[to])); $('#bk-body').scrollTo({ top: 0 }); };
    if (gsap) {
      gsap.to([from, '#bk-title', '#bk-sub', '#bk-step-n'], { opacity: 0, y: -8 * dir, duration: .16, ease: 'power1.in', onComplete: () => {
        show(); chrome();
        gsap.fromTo([steps[to], '#bk-title', '#bk-sub', '#bk-step-n'], { opacity: 0, y: 12 * dir }, { opacity: 1, y: 0, duration: .35, ease: 'power2.out', stagger: .02, clearProps: 'transform' });
      } });
    } else { show(); chrome(); }
  };

  const send = async () => {
    clearErr('send');
    nextBtn.disabled = true;
    nextBtn.textContent = t('bk.sending');
    const x = totals();
    const record = {
      firstName: state.first, lastName: state.last, phone: state.phone, email: state.email, contactPref: state.pref,
      // serviços + subopções escolhidas ("smash", "smash:frente", …)
      services: chosen().flatMap(s => [s.id, ...(picked(s) ? sel(s).map(o => s.id + ':' + o) : [])]).slice(0, 40),
      servicesLabel: chosen().map(s => (s.name?.pt || L(s.name)) + (picked(s) ? ' (' + P.chosen(s, sel(s)).map(o => o.name?.pt || L(o.name)).join(', ') + ')' : '')).join('; ').slice(0, 1500),
      total: (x.from ? 'desde ' : '') + mt(x.sum) + (x.quote ? ' + orçamento' : ''),
      promo: [...new Set(chosen().map(deal).filter(Boolean).map(d => (d.promo.title?.pt || '') + ' (' + P.label(d.promo, mt) + ')'))].join('; '),
      brand: brandLabel() || 'Outra', model: state.model, year: state.year, km: state.km, fuel: state.fuel, plate: state.plate, chassis: state.chassis,
      date: isoDate(state.date), time: state.slot, dropoff: state.drop, notes: notesText(), lang: I.lang,
      website: $('#bk-website').value,
    };
    try {
      const saved = await window.BLStore.addBooking(record);
      state.ref = saved.ref;
      $('#bk-code').textContent = saved.ref;
      renderSent();
      go(5);
    } catch (err) {
      setErr('send', err.message === 'too_many_requests' ? t('err.rate') : t('err.send'));
    } finally {
      nextBtn.disabled = false;
      if (state.step !== 5) nextBtn.textContent = t('bk.send');
    }
  };
  // observações estruturadas, sempre em português para o painel
  function notesText() {
    const pt = (k, v) => k ? I.pt(k) : v;
    const pick = (sel, v) => { const o = v && $(`${sel} [value="${v}"], ${sel} [data-v="${v}"]`, root); return o ? pt(o.dataset.i18n, o.textContent) : ''; };
    const lines = [
      state.goal && 'Objetivo: ' + pick('#bk-goal', state.goal),
      state.symptoms.size && 'Sinais: ' + [...state.symptoms].map(v => pick('#bk-symptoms', v)).join(', '),
      state.since && 'Desde: ' + pick('#bk-since', state.since),
      state.drive && 'Viatura anda: ' + pick('#bk-drive', state.drive),
      state.urgency === 'urgente' && 'Urgência: URGENTE',
      state.date && special(state.date) && 'Dia por marcação (fim de semana / feriado) — confirmar com o cliente',
      'Peças: ' + pick('#bk-parts', state.parts),
      ...chosen().filter(s => state.svcNotes[s.id]).map(s => `${s.name?.pt || L(s.name)}: ${state.svcNotes[s.id]}`),
      state.notes && 'Outros detalhes: ' + state.notes,
    ].filter(Boolean);
    return lines.join('\n').slice(0, 2000);
  }
  const renderSent = () => {
    $('#bk-sent-text').innerHTML = t('bk.sent', { car: esc(carLabel()), when: whenLabel(), pref: t('bk.pref.' + state.pref) });
    $('#bk-sent-when').textContent = `${whenLabel()} — ${state.drop === 'recolha' ? t('bk.atHome') : t('bk.atShop')}.`;
  };

  nextBtn.addEventListener('click', () => {
    if (state.step === 5) return close();
    if (!validate(state.step)) return;
    state.step === 4 ? send() : go(state.step + 1);
  });
  backBtn.addEventListener('click', () => state.step > 0 && go(state.step - 1));
  tabs.forEach((li, i) => li.querySelector('button').addEventListener('click', () => i <= state.reached && go(i)));
  root.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g && state.step !== 5 && +g.dataset.go <= state.reached) go(+g.dataset.go);
  });

  /* ---------------- Calendário (.ics) ---------------- */
  $('#bk-ics').addEventListener('click', () => {
    if (!state.date || !state.slot) return;
    const [h, m] = state.slot.split(':').map(Number);
    const s = new Date(state.date); s.setHours(h, m);
    const e = new Date(s.getTime() + 2 * 3600e3);
    const f = d => d.getFullYear() + [d.getMonth() + 1, d.getDate()].map(n => String(n).padStart(2, '0')).join('') + 'T' + [d.getHours(), d.getMinutes()].map(n => String(n).padStart(2, '0')).join('') + '00';
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Blackline Performance//PT', 'BEGIN:VEVENT',
      `UID:${Date.now()}@blackline-performance`, `DTSTART:${f(s)}`, `DTEND:${f(e)}`,
      `SUMMARY:Blackline Performance — ${chosen().map(svcLine).join('; ')}`,
      `DESCRIPTION:${carLabel()} ${state.plate} · Ref. ${state.ref}`,
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'marcacao-blackline.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  /* ---------------- Idioma ---------------- */
  document.addEventListener('lang:change', () => {
    renderServices(); renderSelects(); renderCal(); renderTimes();
    if (state.step === 4) renderReview();
    if (state.step === 5) renderSent();
    chrome();
  });

  /* ---------------- Abrir / fechar ---------------- */
  let lastFocus = null;
  const reset = () => {
    Object.assign(state, { step: 0, reached: 0, brand: '', model: '', year: '', km: '', fuel: '', plate: '', chassis: '', date: null, slot: '', drop: 'oficina', first: '', last: '', phone: '', email: '', pref: 'whatsapp', notes: '', consent: false, ref: '' });
    state.services.clear();
    Object.assign(state, { opts: {}, svcNotes: {}, goal: '', since: '', drive: '', urgency: 'normal', parts: 'oficina' }); state.symptoms.clear();
    $$('#bk-goal button, #bk-symptoms button').forEach(b => b.setAttribute('aria-pressed', 'false'));
    $$('input:not([type=radio]), textarea', root).forEach(i => i.type === 'checkbox' ? (i.checked = false) : (i.value = ''));
    $$('select', root).forEach(s => (s.value = ''));
    $('#bk-urgency').value = 'normal'; $('#bk-parts').value = 'oficina';
    $('input[name="bk-drop"][value="oficina"]').checked = true;
    $$('#bk-fuel button').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-checked', 'false'); });
    $$('#bk-pref button').forEach(b => { const on = b.dataset.v === 'whatsapp'; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    $$('.bk-err', root).forEach(p => clearErr(p.dataset.err));
    steps.forEach((x, i) => x.classList.toggle('is-active', i === 0));
    view = new Date(first.getFullYear(), first.getMonth(), 1);
    renderServices();
  };

  const open = serviceId => {
    if (root.classList.contains('is-open')) return;
    if (state.step === 5) reset();
    String(serviceId || '').split(',').filter(id => SERVICES.some(s => s.id === id)).forEach(id => state.services.add(id));
    renderServices();
    lastFocus = document.activeElement;
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-locked');
    document.dispatchEvent(new CustomEvent('booking:open'));
    chrome();
    if (gsap) {
      gsap.fromTo('.bk', { yPercent: 6, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .55, ease: 'power3.out' });
      gsap.fromTo('.bk-tabs li', { opacity: 0 }, { opacity: 1, stagger: .04, duration: .4, delay: .15 });
    }
    setTimeout(() => $('.bk-step.is-active input, .bk-step.is-active select, .bk-step.is-active button', root)?.focus({ preventScroll: true }), 300);
  };

  function close() {
    if (!root.classList.contains('is-open')) return;
    const finish = () => {
      root.classList.remove('is-open');
      root.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-locked');
      document.dispatchEvent(new CustomEvent('booking:close'));
      if (state.step === 5) reset();
      gsap && gsap.set('.bk', { clearProps: 'all' });
      lastFocus?.focus?.({ preventScroll: true });
      if (location.hash === '#agendar') history.replaceState(null, '', location.pathname + location.search);
    };
    gsap ? gsap.to('.bk', { yPercent: 4, opacity: 0, duration: .25, ease: 'power2.in', onComplete: finish }) : finish();
  }

  $$('[data-close]', root).forEach(b => b.addEventListener('click', close));
  root.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && e.target.matches('input:not([type=checkbox]):not([type=radio]), select')) { e.preventDefault(); nextBtn.click(); }
    if (e.key === 'Tab') {
      const f = $$('button:not([disabled]), input:not([tabindex="-1"]), select, textarea, a[href]', root).filter(x => x.offsetParent && !x.closest('[hidden]'));
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  document.addEventListener('click', e => {
    const tgt = e.target.closest('[data-book]');
    if (!tgt || root.contains(tgt)) return;
    e.preventDefault();
    open(tgt.dataset.book);
  });
  document.addEventListener('keydown', e => {
    const tgt = e.target.closest?.('[data-book][role="button"]');
    if (tgt && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(tgt.dataset.book); }
  });
  if (location.hash === '#agendar') addEventListener('load', () => open());

  // arranque: definições (preços) do painel
  steps[0].classList.add('is-active');
  renderServices(); renderSelects(); renderCal(); renderTimes(); chrome();
  window.BLStore.getSettings().then(s => { loadServices(s); renderServices(); update(); });

  window.BLBooking = { open, close };
})();

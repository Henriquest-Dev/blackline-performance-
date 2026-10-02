/* Blackline Performance — marcação de serviço */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = $('#agendar');
  if (!root) return;

  const gsap = window.gsap;
  const PHONE = '258860424242';
  const PICKUP = 500;

  // Preços indicativos (MZN) — substituir pela tabela real da oficina
  const GROUPS = [
    { name: 'Manutenção', items: [
      { id: 'revisao', name: 'Revisão completa', desc: 'Óleo, filtros de óleo, ar e habitáculo, verificação de 40 pontos.', dur: '2 h', price: 3500 },
      { id: 'oleo', name: 'Mudança de óleo e filtro', desc: 'Óleo de especificação do fabricante.', dur: '45 min', price: 1800 },
      { id: 'travoes', name: 'Travões', desc: 'Pastilhas e/ou discos, eixo dianteiro ou traseiro.', dur: '1 h 30', price: 2500, from: true },
      { id: 'diagnostico', name: 'Diagnóstico computorizado', desc: 'Leitura de avarias e relatório.', dur: '45 min', price: 1500 },
    ] },
    { name: 'Mecânica e eletricidade', items: [
      { id: 'mecanica', name: 'Mecânica geral', desc: 'Motor, suspensão, direção e transmissão.', dur: 'A definir', price: null },
      { id: 'eletricidade', name: 'Eletricidade auto', desc: 'Baterias, alternador, cablagens e iluminação.', dur: '1 h', price: 1500, from: true },
      { id: 'ac', name: 'Ar condicionado', desc: 'Verificação de fugas e carga de gás.', dur: '1 h', price: 2000 },
    ] },
    { name: 'Carroçaria e estética', items: [
      { id: 'pintura', name: 'Bate-chapa e pintura', desc: 'Reparação de danos e pintura com acabamento de fábrica.', dur: 'A definir', price: null },
      { id: 'lavagem', name: 'Lavagem completa', desc: 'Exterior, interior e jantes.', dur: '1 h', price: 800 },
      { id: 'detailing', name: 'Detailing e ceramic coating', desc: 'Correção de pintura e proteção cerâmica.', dur: '1 dia', price: 8000, from: true },
      { id: 'smash', name: 'Smash & Grab', desc: 'Película de segurança nos vidros laterais e traseiro.', dur: '3 h', price: 4500 },
    ] },
    { name: 'Performance', items: [
      { id: 'tuning', name: 'Tuning e personalização', desc: 'Reprogramação, escapes, jantes e acessórios.', dur: 'A definir', price: null },
    ] },
  ];
  const SERVICES = GROUPS.flatMap(g => g.items);
  const BRANDS = ['Audi', 'BMW', 'Chevrolet', 'Ford', 'Honda', 'Hyundai', 'Isuzu', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Porsche', 'Renault', 'Subaru', 'Suzuki', 'Toyota', 'Volkswagen', 'Volvo', 'Outra'];
  const MORNING = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  const AFTERNOON = ['13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

  const state = {
    step: 0, reached: 0, services: new Set(),
    brand: '', model: '', year: '', km: '', fuel: '', plate: '',
    date: null, slot: '', drop: 'oficina',
    first: '', last: '', phone: '', email: '', pref: 'WhatsApp', notes: '', consent: false,
  };

  const mt = n => n.toLocaleString('pt-PT').replace(/ | /g, ' ') + ' MT';
  const priceLabel = s => s.price == null ? 'Sob orçamento' : (s.from ? 'desde ' : '') + mt(s.price);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const dateLong = d => cap(d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const chosen = () => SERVICES.filter(s => state.services.has(s.id));
  const carLabel = () => [state.brand === 'Outra' ? '' : state.brand, state.model].filter(Boolean).join(' ');
  const whenLabel = () => state.date && state.slot ? `${dateLong(state.date)}, ${state.slot}` : '';
  const telLabel = () => '+258 ' + state.phone.replace(/^(\d{2})(\d{3})(\d{0,4}).*/, '$1 $2 $3').trim();
  const fullName = () => [state.first, state.last].filter(Boolean).join(' ');

  /* ---------------- Serviços ---------------- */
  $('#bk-services').innerHTML = GROUPS.map(g => `
    <div class="bk-group">
      <h3 class="bk-group__name">${g.name}</h3>
      ${g.items.map(s => `
        <label class="bk-svc">
          <input type="checkbox" value="${s.id}">
          <span class="bk-box" aria-hidden="true"></span>
          <span class="bk-svc__main"><b>${s.name}</b><small>${s.desc}</small></span>
          <span class="bk-svc__dur">${s.dur}</span>
          <span class="bk-svc__price">${priceLabel(s)}</span>
        </label>`).join('')}
    </div>`).join('');
  $('#bk-services').addEventListener('change', e => {
    if (!e.target.matches('input[type=checkbox]')) return;
    e.target.checked ? state.services.add(e.target.value) : state.services.delete(e.target.value);
    clearErr('services'); update();
  });
  const syncServices = () => $$('#bk-services input').forEach(i => { i.checked = state.services.has(i.value); });

  /* ---------------- Viatura ---------------- */
  $('#bk-brand').innerHTML = '<option value="">Selecione</option>' + BRANDS.map(b => `<option>${b}</option>`).join('');
  {
    const y = new Date().getFullYear() + 1;
    $('#bk-year').innerHTML = '<option value="">—</option>' + Array.from({ length: y - 1989 }, (_, i) => `<option>${y - i}</option>`).join('');
  }
  const field = (sel, key, fmt = v => v.trim()) => {
    const el = $(sel);
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => {
      if (key === 'km') { const d = el.value.replace(/\D/g, '').slice(0, 7); el.value = d ? (+d).toLocaleString('pt-PT').replace(/ | /g, ' ') : ''; }
      if (key === 'plate') { const p = el.selectionStart; el.value = el.value.toUpperCase(); el.setSelectionRange(p, p); }
      state[key] = fmt(el.value); clearErr(key); update();
    });
  };
  field('#bk-brand', 'brand'); field('#bk-model', 'model'); field('#bk-year', 'year');
  field('#bk-km', 'km'); field('#bk-plate', 'plate', v => v.replace(/\s+/g, ' ').trim());
  field('#bk-first', 'first'); field('#bk-last', 'last');
  field('#bk-phone', 'phone', v => v.replace(/\D/g, ''));
  field('#bk-email', 'email'); field('#bk-notes', 'notes');
  $('#bk-consent').addEventListener('change', e => { state.consent = e.target.checked; clearErr('consent'); });

  const segmented = (sel, key) => $(sel).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    state[key] = b.dataset.v;
    $$('button', $(sel)).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); });
    update();
  });
  segmented('#bk-fuel', 'fuel'); segmented('#bk-pref', 'pref');
  $$('input[name="bk-drop"]').forEach(r => r.addEventListener('change', () => { state.drop = r.value; update(); }));

  /* ---------------- Calendário ---------------- */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const first = new Date(today); if (new Date().getHours() >= 15) first.setDate(first.getDate() + 1);
  const last = new Date(today); last.setDate(last.getDate() + 60);
  let view = new Date(first.getFullYear(), first.getMonth(), 1);

  // ocupação de exemplo, estável por data
  const hash = (d, k = 0) => ((d.getFullYear() * 400 + d.getMonth() * 37 + d.getDate() * 11 + k * 7) * 2654435761 >>> 0) % 100;
  const slotsFor = d => {
    const sat = d.getDay() === 6;
    const list = sat ? MORNING : [...MORNING, ...AFTERNOON];
    return list.map((t, k) => {
      const [h, m] = t.split(':').map(Number);
      const at = new Date(d); at.setHours(h, m);
      return { t, free: hash(d, k) > 34 && at.getTime() > Date.now() + 2 * 3600e3 };
    });
  };
  const dayOpen = d => d >= first && d <= last && d.getDay() !== 0 && slotsFor(d).some(s => s.free);
  const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();

  const renderCal = () => {
    $('#bk-cal-month').textContent = cap(view.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }));
    const startPad = (view.getDay() + 6) % 7;
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    let html = '<span></span>'.repeat(startPad);
    for (let i = 1; i <= days; i++) {
      const d = new Date(view.getFullYear(), view.getMonth(), i);
      const open = dayOpen(d);
      const cls = [sameDay(d, today) ? 'today' : '', sameDay(d, state.date) ? 'on' : ''].join(' ').trim();
      html += `<button type="button" data-d="${i}" class="${cls}" ${open ? '' : 'disabled'} aria-label="${dateLong(d)}${open ? '' : ' — indisponível'}">${i}</button>`;
    }
    $('#bk-cal-grid').innerHTML = html;
    $('[data-cal="-1"]').disabled = view <= new Date(first.getFullYear(), first.getMonth(), 1);
    $('[data-cal="1"]').disabled = view >= new Date(last.getFullYear(), last.getMonth(), 1);
  };
  const renderTimes = () => {
    const box = $('#bk-times');
    if (!state.date) { box.innerHTML = '<p class="bk-times__empty">Selecione um dia no calendário para ver os horários disponíveis.</p>'; return; }
    const slots = slotsFor(state.date);
    const group = (label, list) => list.length ? `<div class="bk-times__group"><span>${label}</span><div>${list.map(s =>
      `<button type="button" data-t="${s.t}" ${s.free ? '' : 'disabled'} class="${s.t === state.slot ? 'on' : ''}">${s.t}</button>`).join('')}</div></div>` : '';
    box.innerHTML = `<p class="bk-times__day">${dateLong(state.date)}</p>` +
      group('Manhã', slots.filter(s => s.t < '12:00')) + group('Tarde', slots.filter(s => s.t > '12:00'));
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
    const p = $(`[data-err="${k}"]`, root); if (p) p.textContent = msg;
    const f = p?.closest('.bk-f'); f && f.classList.add('has-err');
  };
  function clearErr(k) {
    const p = $(`[data-err="${k}"]`, root); if (!p) return;
    p.textContent = ''; p.closest('.bk-f')?.classList.remove('has-err');
  }
  const validate = step => {
    const e = {};
    if (step === 0 && !state.services.size) e.services = 'Selecione pelo menos um serviço.';
    if (step === 1) {
      if (!state.brand) e.brand = 'Indique a marca.';
      if (!state.model) e.model = 'Indique o modelo.';
      if (state.plate && !/^[A-Z0-9 -]{5,10}$/.test(state.plate)) e.plate = 'Matrícula inválida.';
    }
    if (step === 2 && !(state.date && state.slot)) e.slot = state.date ? 'Escolha um horário.' : 'Escolha o dia e o horário.';
    if (step === 3) {
      if (state.first.length < 2) e.first = 'Indique o nome.';
      if (state.last.length < 2) e.last = 'Indique o apelido.';
      if (!/^8[2-7]\d{7}$/.test(state.phone)) e.phone = 'Número moçambicano com 9 dígitos (ex.: 84 123 4567).';
      if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) e.email = 'Email inválido.';
      if (!state.consent) e.consent = 'Necessário para podermos contactá-lo.';
    }
    Object.entries(e).forEach(([k, m]) => setErr(k, m));
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      const el = $(`[data-err="${firstKey}"]`, root).closest('.bk-f, section')?.querySelector('input, select, textarea');
      el?.focus({ preventScroll: true });
      $(`[data-err="${firstKey}"]`, root).scrollIntoView({ behavior: 'smooth', block: 'center' });
      gsap && gsap.fromTo($$('.bk-err', root).filter(x => x.textContent), { x: -6 }, { x: 0, duration: .4, ease: 'elastic.out(1, .4)' });
    }
    return !firstKey;
  };

  /* ---------------- Resumo ---------------- */
  const totals = () => {
    const list = chosen();
    const sum = list.reduce((a, s) => a + (s.price || 0), 0) + (state.drop === 'recolha' ? PICKUP : 0);
    return { sum, quote: list.some(s => s.price == null), from: list.some(s => s.from) };
  };
  const update = () => {
    const list = chosen();
    $('#bk-sum-services').innerHTML = list.length
      ? '<ul>' + list.map(s => `<li><span>${s.name}</span><span>${priceLabel(s)}</span></li>`).join('') +
        (state.drop === 'recolha' ? `<li><span>Recolha e entrega</span><span>${mt(PICKUP)}</span></li>` : '') + '</ul>'
      : '—';
    $('#bk-sum-car').innerHTML = carLabel()
      ? `${esc(carLabel())}${state.year ? ' · ' + state.year : ''}${state.plate ? `<br><span class="bk-mini-plate">${esc(state.plate)}</span>` : ''}` : '—';
    $('#bk-sum-date').textContent = whenLabel() || '—';
    $('#bk-sum-client').innerHTML = fullName() ? `${esc(fullName())}${state.phone ? '<br>' + telLabel() : ''}` : '—';
    const t = totals();
    $('#bk-total').textContent = (t.from ? 'desde ' : '') + mt(t.sum);
    $('#bk-total-note').textContent = t.quote
      ? 'Inclui serviços sob orçamento — valor final após avaliação.'
      : 'Valores indicativos, IVA incluído.';
  };

  const renderReview = () => {
    const sec = (title, step, rows) => `
      <div class="bk-rv">
        <div class="bk-rv__head"><h3>${title}</h3><button type="button" data-go="${step}">Alterar</button></div>
        <dl>${rows.filter(r => r[1]).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      </div>`;
    const t = totals();
    $('#bk-review').innerHTML =
      sec('Serviços', 0, chosen().map(s => [s.name, priceLabel(s)]).concat(state.drop === 'recolha' ? [['Recolha e entrega', mt(PICKUP)]] : [])) +
      sec('Viatura', 1, [['Marca e modelo', esc(carLabel())], ['Ano', state.year], ['Combustível', state.fuel], ['Quilometragem', state.km && state.km + ' km'], ['Matrícula', state.plate && `<span class="bk-mini-plate">${esc(state.plate)}</span>`]]) +
      sec('Data e hora', 2, [['Data', state.date && dateLong(state.date)], ['Hora', state.slot], ['Entrega', state.drop === 'recolha' ? 'Recolha e entrega no endereço' : 'Na oficina']]) +
      sec('Contacto', 3, [['Nome', esc(fullName())], ['Telemóvel', telLabel()], ['Email', esc(state.email)], ['Preferência', state.pref], ['Descrição', esc(state.notes)]]) +
      `<div class="bk-rv__total"><span>Total estimado</span><b>${(t.from ? 'desde ' : '') + mt(t.sum)}</b></div>`;
  };

  /* ---------------- Etapas ---------------- */
  const steps = $$('.bk-step', root);
  const tabs = $$('#bk-tabs li');
  const nextBtn = $('#bk-next'), backBtn = $('#bk-back');

  const chrome = () => {
    const s = state.step, sent = s === 5;
    const sec = steps[s];
    $('#bk-title').textContent = sec.dataset.title;
    $('#bk-sub').textContent = sec.dataset.sub || '';
    $('#bk-sub').hidden = !sec.dataset.sub;
    $('#bk-step-n').textContent = sent ? 'Concluído' : `Etapa ${s + 1} de 5`;
    $('#bk-bar').style.transform = `scaleX(${sent ? 1 : (s + 1) / 5})`;
    tabs.forEach((li, i) => {
      li.classList.toggle('is-current', i === s);
      li.classList.toggle('is-done', i < s || sent);
      li.querySelector('button').disabled = sent || i > state.reached;
      li.querySelector('button').setAttribute('aria-current', i === s ? 'step' : 'false');
    });
    root.classList.toggle('is-sent', sent);
    backBtn.hidden = s === 0 || sent;
    nextBtn.textContent = sent ? 'Concluir' : s === 4 ? 'Enviar pedido' : 'Continuar';
    update();
  };

  const go = to => {
    if (to === state.step) return;
    const from = steps[state.step], dir = to > state.step ? 1 : -1;
    if (to === 4) renderReview();
    if (to === 2) { renderCal(); renderTimes(); }
    state.step = to;
    state.reached = Math.max(state.reached, Math.min(to, 4));
    const show = () => {
      steps.forEach(x => x.classList.toggle('is-active', x === steps[to]));
      $('#bk-body').scrollTo({ top: 0 });
    };
    if (window.gsap) {
      gsap.to([from, '#bk-title', '#bk-sub', '#bk-step-n'], { opacity: 0, y: -8 * dir, duration: .16, ease: 'power1.in', onComplete: () => {
        show(); chrome();
        gsap.fromTo([steps[to], '#bk-title', '#bk-sub', '#bk-step-n'], { opacity: 0, y: 12 * dir }, { opacity: 1, y: 0, duration: .35, ease: 'power2.out', stagger: .02, clearProps: 'transform' });
      } });
    } else { show(); chrome(); }
  };

  const send = () => {
    nextBtn.disabled = true;
    nextBtn.textContent = 'A enviar…';
    setTimeout(() => {
      nextBtn.disabled = false;
      const code = 'BLP-' + new Date().toISOString().slice(2, 10).replace(/-/g, '').slice(2) + '-' + String(Math.floor(100 + Math.random() * 900));
      $('#bk-code').textContent = code;
      $('#bk-sent-text').innerHTML = `Recebemos o seu pedido para <b>${esc(carLabel())}</b> em <b>${whenLabel()}</b>. A marcação fica confirmada quando a oficina o contactar por ${state.pref === 'Chamada' ? 'chamada' : state.pref}.`;
      $('#bk-sent-when').textContent = `${whenLabel()}${state.drop === 'recolha' ? ' — recolha no seu endereço' : ' — na oficina'}.`;
      const msg = [
        `Pedido de marcação ${code}`,
        `Serviços: ${chosen().map(s => s.name).join(', ')}`,
        `Viatura: ${[carLabel(), state.year, state.fuel, state.km && state.km + ' km', state.plate].filter(Boolean).join(' · ')}`,
        `Data: ${whenLabel()}${state.drop === 'recolha' ? ' (recolha e entrega)' : ''}`,
        `Cliente: ${fullName()} · ${telLabel()}${state.email ? ' · ' + state.email : ''}`,
        state.notes ? `Descrição: ${state.notes}` : '',
      ].filter(Boolean).join('\n');
      $('#bk-wa').href = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
      try { localStorage.setItem('blp:lastBooking', JSON.stringify({ code, when: whenLabel(), services: [...state.services] })); } catch (e) { /* sem storage */ }
      go(5);
    }, 700);
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
      `SUMMARY:Blackline Performance — ${chosen().map(x => x.name).join(', ')}`,
      `DESCRIPTION:${carLabel()} ${state.plate} · Ref. ${$('#bk-code').textContent}`,
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'marcacao-blackline.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  /* ---------------- Abrir / fechar ---------------- */
  let lastFocus = null;
  const reset = () => {
    Object.assign(state, { step: 0, reached: 0, brand: '', model: '', year: '', km: '', fuel: '', plate: '', date: null, slot: '', drop: 'oficina', first: '', last: '', phone: '', email: '', pref: 'WhatsApp', notes: '', consent: false });
    state.services.clear();
    $$('input:not([type=radio]), textarea', root).forEach(i => i.type === 'checkbox' ? (i.checked = false) : (i.value = ''));
    $$('select', root).forEach(s => (s.value = ''));
    $('input[name="bk-drop"][value="oficina"]').checked = true;
    $$('#bk-fuel button').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-checked', 'false'); });
    $$('#bk-pref button').forEach(b => { const on = b.dataset.v === 'WhatsApp'; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    $$('.bk-err', root).forEach(p => clearErr(p.dataset.err));
    steps.forEach((x, i) => x.classList.toggle('is-active', i === 0));
    view = new Date(first.getFullYear(), first.getMonth(), 1);
  };

  const open = serviceId => {
    if (root.classList.contains('is-open')) return;
    if (state.step === 5) reset();
    if (serviceId && SERVICES.some(s => s.id === serviceId)) state.services.add(serviceId);
    syncServices();
    lastFocus = document.activeElement;
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-locked');
    document.dispatchEvent(new CustomEvent('booking:open'));
    chrome();
    if (window.gsap) {
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
      gsap?.set?.('.bk', { clearProps: 'all' });
      lastFocus?.focus?.({ preventScroll: true });
      if (location.hash === '#agendar') history.replaceState(null, '', location.pathname + location.search);
    };
    window.gsap ? gsap.to('.bk', { yPercent: 4, opacity: 0, duration: .25, ease: 'power2.in', onComplete: finish }) : finish();
  }

  $$('[data-close]', root).forEach(b => b.addEventListener('click', close));
  root.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && e.target.matches('input:not([type=checkbox]):not([type=radio]), select')) { e.preventDefault(); nextBtn.click(); }
    if (e.key === 'Tab') {
      const f = $$('button:not([disabled]), input, select, textarea, a[href]', root).filter(x => x.offsetParent && !x.closest('[hidden]'));
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-book]');
    if (!t || root.contains(t)) return;
    e.preventDefault();
    open(t.dataset.book);
  });
  document.addEventListener('keydown', e => {
    const t = e.target.closest?.('[data-book][role="button"]');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(t.dataset.book); }
  });
  if (location.hash === '#agendar') addEventListener('load', () => open());

  steps[0].classList.add('is-active');
  renderCal(); renderTimes(); chrome();
  window.BLBooking = { open, close };
})();

/* Blackline Performance — experiência de agendamento (5 passos + confirmação) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = $('#agendar');
  if (!root) return;

  const PHONE = '258860424242';
  const ic = (d) => `<svg viewBox="0 0 24 24"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  // Preços de exemplo (MZN) — substituir pelos reais
  const SERVICES = [
    { id: 'revisao', name: 'Revisão completa', desc: 'Óleo, filtros, travões & check-up de 40 pontos', price: 3500, dur: '≈ 2h', icon: ic('M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5Z') },
    { id: 'mecanica', name: 'Mecânica geral', desc: 'Diagnóstico e reparação de motor, suspensão & caixa', price: 1500, from: true, dur: '1h+', icon: ic('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 14H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1A1.7 1.7 0 0 0 10 3V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 10h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z') },
    { id: 'eletricidade', name: 'Eletricidade auto', desc: 'Diagnóstico eletrónico, baterias & cablagens', price: 1500, from: true, dur: '1h+', icon: ic('M13 2 4 14h7l-1 8 9-12h-7l1-8Z') },
    { id: 'pintura', name: 'Bate-chapa & pintura', desc: 'Reparação de chapa, pintura e acabamento de fábrica', price: null, dur: 'Orçamento', icon: ic('M19 11h-6a2 2 0 0 0-2 2v2M7 3h10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM11 15h2v6h-2z') },
    { id: 'detailing', name: 'Detailing · Ceramic', desc: 'Polimento em 3 fases & ceramic coating 9H', price: 8000, from: true, dur: '1 dia', icon: ic('M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3ZM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z') },
    { id: 'lavagem', name: 'Lavagem premium', desc: 'Interior & exterior detalhado, motor opcional', price: 800, dur: '≈ 1h', icon: ic('M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z') },
    { id: 'tuning', name: 'Tuning & performance', desc: 'Remap, escapes, jantes & personalização', price: null, dur: 'Orçamento', icon: ic('M12 14l4-4M3.3 17a9 9 0 1 1 17.4 0M7 17h10') },
    { id: 'smash', name: 'Smash & Grab', desc: 'Película de segurança anti-arrombamento', price: 4500, dur: '≈ 3h', icon: ic('M12 3 5 6v6c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V6l-7-3Z') },
  ];
  const BRANDS = ['Toyota', 'BMW', 'Mercedes-Benz', 'Land Rover', 'Volkswagen', 'Ford', 'Nissan', 'Hyundai', 'Mitsubishi', 'Outra'];
  const SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:30', '14:30', '15:30', '16:30'];
  const PICKUP = 500;
  const TITLES = $$('.bk-step', root).map(s => s.dataset.title);

  const state = { step: 0, services: new Set(), brand: '', model: '', year: '', plate: '', date: null, slot: '', pickup: false, name: '', phone: '', email: '', notes: '' };

  const mt = n => n.toLocaleString('pt-PT') + ' MT';
  const fmtDate = (d, opts = { weekday: 'long', day: 'numeric', month: 'long' }) => d.toLocaleDateString('pt-PT', opts);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------- Render: serviços ---------- */
  const servicesEl = $('#bk-services');
  servicesEl.innerHTML = SERVICES.map(s => `
    <button type="button" class="bk-svc" data-id="${s.id}" aria-pressed="false">
      <span class="bk-svc__ico">${s.icon}</span>
      <span class="bk-svc__txt"><b>${s.name}</b><small>${s.desc}</small></span>
      <span class="bk-svc__meta"><b>${s.price == null ? 'Orçamento' : (s.from ? 'desde ' : '') + mt(s.price)}</b><small>${s.dur}</small></span>
      <span class="bk-svc__tick"><svg class="ico"><use href="#i-check"/></svg></span>
    </button>`).join('');
  servicesEl.addEventListener('click', e => {
    const b = e.target.closest('.bk-svc'); if (!b) return;
    const id = b.dataset.id;
    state.services.has(id) ? state.services.delete(id) : state.services.add(id);
    syncServices();
    window.gsap && gsap.fromTo(b, { scale: .97 }, { scale: 1, duration: .45, ease: 'back.out(3)' });
    update();
  });
  const syncServices = () => $$('.bk-svc', servicesEl).forEach(b => {
    const on = state.services.has(b.dataset.id);
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
  });

  /* ---------- Render: viatura ---------- */
  const brandsEl = $('#bk-brands');
  brandsEl.innerHTML = BRANDS.map(b => `<button type="button" data-brand="${b}">${b}</button>`).join('');
  brandsEl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    state.brand = b.dataset.brand;
    $$('button', brandsEl).forEach(x => x.classList.toggle('on', x === b));
    update();
  });
  const bind = (id, key, fn = v => v) => $(id).addEventListener('input', e => { state[key] = fn(e.target.value); update(); });
  bind('#bk-model', 'model', v => v.trim());
  bind('#bk-year', 'year', v => v.trim());
  bind('#bk-plate', 'plate', v => v.toUpperCase().replace(/\s+/g, ' ').trim());
  bind('#bk-name', 'name', v => v.trim());
  bind('#bk-phone', 'phone', v => v.replace(/[^\d]/g, ''));
  bind('#bk-email', 'email', v => v.trim());
  bind('#bk-notes', 'notes', v => v.trim());
  $('#bk-pickup').addEventListener('change', e => { state.pickup = e.target.checked; update(); });

  /* ---------- Render: datas & horários ---------- */
  const daysEl = $('#bk-days'), slotsEl = $('#bk-slots');
  const days = [];
  {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    if (new Date().getHours() >= 15) start.setDate(start.getDate() + 1);
    for (let i = 0; days.length < 14; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i); days.push(d);
    }
  }
  // ocupação pseudo-aleatória mas estável por data
  const busy = (d, slot) => {
    const k = d.getDate() * 31 + d.getMonth() * 7 + SLOTS.indexOf(slot) * 13;
    return (k * 2654435761 % 100) < 28;
  };
  const isPast = (d, slot) => {
    const [h, m] = slot.split(':').map(Number);
    const t = new Date(d); t.setHours(h, m);
    return t.getTime() < Date.now() + 60 * 60 * 1000;
  };
  daysEl.innerHTML = days.map((d, i) => {
    const closed = d.getDay() === 0;
    return `<button type="button" data-i="${i}" ${closed ? 'disabled' : ''}>
      <small>${cap(fmtDate(d, { weekday: 'short' }).replace('.', ''))}</small>${d.getDate()}${closed ? '<em>Fechado</em>' : ''}</button>`;
  }).join('');
  daysEl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    state.date = days[+b.dataset.i]; state.slot = '';
    $$('button', daysEl).forEach(x => x.classList.toggle('on', x === b));
    renderSlots(); update();
  });
  const renderSlots = () => {
    if (!state.date) { slotsEl.innerHTML = '<p class="bk-hint">Escolha primeiro um dia.</p>'; return; }
    const sat = state.date.getDay() === 6;
    slotsEl.innerHTML = SLOTS.map(s => {
      const off = (sat && s > '12:00') || busy(state.date, s) || isPast(state.date, s);
      return `<button type="button" data-slot="${s}" ${off ? 'disabled' : ''}>${s}</button>`;
    }).join('');
    $('#bk-month').textContent = cap(fmtDate(state.date, { month: 'long', year: 'numeric' }));
    window.gsap && gsap.from($$('button', slotsEl), { y: 10, opacity: 0, stagger: .025, duration: .35, ease: 'power2.out' });
  };
  slotsEl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    state.slot = b.dataset.slot;
    $$('button', slotsEl).forEach(x => x.classList.toggle('on', x === b));
    update();
  });
  $('#bk-month').textContent = cap(fmtDate(days[0], { month: 'long', year: 'numeric' }));
  renderSlots();

  /* ---------- Cálculos ---------- */
  const chosen = () => SERVICES.filter(s => state.services.has(s.id));
  const totalLabel = () => {
    const list = chosen();
    if (!list.length) return '—';
    let sum = list.reduce((a, s) => a + (s.price || 0), 0) + (state.pickup ? PICKUP : 0);
    const quote = list.some(s => s.price == null);
    const from = list.some(s => s.from);
    if (!sum) return 'Sob orçamento';
    return (from ? 'desde ' : '') + mt(sum) + (quote ? ' + orç.' : '');
  };
  const carLabel = () => [state.brand !== 'Outra' ? state.brand : '', state.model].filter(Boolean).join(' ') || '';
  const whenLabel = () => state.date && state.slot ? `${cap(fmtDate(state.date))} · ${state.slot}` : '';

  const valid = (step = state.step) => [
    () => state.services.size > 0,
    () => !!state.brand && state.model.length > 0,
    () => !!state.date && !!state.slot,
    () => state.name.length >= 3 && state.phone.length >= 9 && (!state.email || /.+@.+\..+/.test(state.email)),
    () => true,
  ][step]?.() ?? true;

  /* ---------- UI comum ---------- */
  const nextBtn = $('#bk-next');
  const bar = $('#bk-bar');
  const update = () => {
    // cartão da viatura
    $('#bk-car-name').textContent = carLabel() || 'Escolha a marca';
    $('#bk-plate-preview').textContent = state.plate || 'AAA 000 MC';
    // resumos
    $$('[data-sum="total"]', root).forEach(el => el.textContent = totalLabel());
    const sum = {
      service: chosen().map(s => s.name).join(', ') || 'Escolha o que precisa',
      car: [carLabel(), state.plate].filter(Boolean).join(' · ') || 'Marca, modelo & matrícula',
      date: whenLabel() || 'Escolha o melhor momento',
      client: state.name || 'Para confirmarmos',
    };
    Object.entries(sum).forEach(([k, v]) => { const el = $(`[data-sum="${k}"]`, root); if (el) el.textContent = v; });
    nextBtn.disabled = !valid();
  };

  const stepsEls = $$('.bk-step', root);
  const sideSteps = $$('#bk-steps li');
  const renderTicket = () => {
    const row = (k, v) => `<div class="bk-ticket__row"><span>${k}</span><b>${v}</b></div>`;
    $('#bk-ticket').innerHTML = `
      <div class="bk-ticket__head">
        <span class="brand__badge"><svg><use href="#bl-mark"/></svg></span>
        <div><small>Blackline Performance</small><b>${whenLabel()}</b></div>
      </div>
      <div class="bk-ticket__list">${chosen().map(s => `<div class="bk-ticket__svc"><span>${s.name}</span><b>${s.price == null ? 'Orçamento' : (s.from ? 'desde ' : '') + mt(s.price)}</b></div>`).join('')}
        ${state.pickup ? `<div class="bk-ticket__svc"><span>Recolha &amp; entrega</span><b>${mt(PICKUP)}</b></div>` : ''}
      </div>
      <div class="bk-ticket__cut"></div>
      ${row('Viatura', [carLabel(), state.year].filter(Boolean).join(' · '))}
      ${state.plate ? row('Matrícula', `<span class="plate">${state.plate}</span>`) : ''}
      ${row('Cliente', state.name)}
      ${row('Contacto', '+258 ' + state.phone)}
      ${state.notes ? row('Notas', state.notes) : ''}
      <div class="bk-ticket__total"><span>Estimativa</span><b>${totalLabel()}</b></div>`;
  };

  const go = (to) => {
    const from = state.step;
    if (to === from) return;
    const dir = to > from ? 1 : -1;
    if (to === 4) renderTicket();
    state.step = to;
    const outEl = stepsEls[from], inEl = stepsEls[to];
    const swap = () => {
      outEl.classList.remove('is-active');
      inEl.classList.add('is-active');
      $('#bk-body').scrollTop = 0;
    };
    if (window.gsap) {
      gsap.to(outEl, { x: -40 * dir, opacity: 0, duration: .22, ease: 'power2.in', onComplete: () => {
        swap(); gsap.set(outEl, { clearProps: 'all' });
        gsap.fromTo(inEl, { x: 40 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: 'power3.out' });
        gsap.fromTo(inEl.children, { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: .04, duration: .45, ease: 'power3.out', delay: .05 });
      } });
    } else swap();
    chrome();
  };

  const chrome = () => {
    const s = state.step;
    const done = s === 5;
    $('#bk-title').textContent = TITLES[s];
    $('#bk-count').textContent = done ? 'Tudo pronto' : `Passo ${s + 1} de 5`;
    bar.style.transform = `scaleX(${done ? 1 : (s + 1) / 5})`;
    root.classList.toggle('is-done', done);
    $('[data-back]', root).style.visibility = s === 0 || done ? 'hidden' : 'visible';
    nextBtn.innerHTML = s === 4 ? 'Confirmar marcação <svg class="ico"><use href="#i-check"/></svg>' : 'Continuar <svg class="ico"><use href="#i-arrow"/></svg>';
    sideSteps.forEach((li, i) => {
      li.classList.toggle('done', i < s || done);
      li.classList.toggle('active', i === s && !done);
    });
    update();
  };

  /* ---------- Confirmar ---------- */
  const confirm = () => {
    nextBtn.disabled = true;
    nextBtn.innerHTML = '<span class="bk-spin"></span> A enviar…';
    setTimeout(() => {
      const code = 'BLP-' + String(Math.floor(1000 + Math.random() * 9000));
      $('#bk-code').textContent = code;
      $('#bk-done-text').innerHTML = `Obrigado, <b>${state.name.split(' ')[0]}</b>! Reservámos <b>${whenLabel()}</b> para a sua <b>${carLabel()}</b>.`;
      $('#bk-done-when').textContent = whenLabel();
      const msg = [
        `Olá Blackline! Acabei de agendar pelo site (${code}).`,
        `Serviço: ${chosen().map(s => s.name).join(', ')}`,
        `Viatura: ${[carLabel(), state.year, state.plate].filter(Boolean).join(' · ')}`,
        `Data: ${whenLabel()}${state.pickup ? ' (com recolha ao domicílio)' : ''}`,
        `Nome: ${state.name} · +258 ${state.phone}`,
        state.notes ? `Notas: ${state.notes}` : '',
      ].filter(Boolean).join('\n');
      $('#bk-wa').href = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
      try { localStorage.setItem('blp:lastBooking', JSON.stringify({ code, when: whenLabel(), services: [...state.services] })); } catch (e) { /* sem storage */ }
      go(5);
      if (window.gsap) {
        const tl = gsap.timeline({ delay: .3 });
        tl.fromTo('.bk-done__check circle', { strokeDashoffset: 151 }, { strokeDashoffset: 0, duration: .7, ease: 'power2.out' })
          .fromTo('.bk-done__check path', { strokeDashoffset: 40 }, { strokeDashoffset: 0, duration: .4, ease: 'power2.out' }, '-=.2')
          .fromTo('.bk-done__check', { scale: .8 }, { scale: 1, duration: .6, ease: 'back.out(3)' }, '<')
          .from('.bk-done__steps li', { x: -16, opacity: 0, stagger: .08, duration: .4 }, '-=.2');
        confetti();
      }
    }, 900);
  };

  // pequenas "faíscas" nas cores da marca
  const confetti = () => {
    const box = $('.booking__app', root);
    for (let i = 0; i < 26; i++) {
      const p = document.createElement('i');
      p.className = 'bk-spark';
      p.style.background = ['#E11D2A', '#0B0B0C', '#D7D7DC'][i % 3];
      box.appendChild(p);
      gsap.fromTo(p, { x: box.clientWidth / 2, y: 190, scale: gsap.utils.random(.6, 1.2), rotate: 0, opacity: 1 }, {
        x: `+=${gsap.utils.random(-200, 200)}`, y: `+=${gsap.utils.random(-160, 60)}`, rotate: gsap.utils.random(-260, 260),
        opacity: 0, duration: gsap.utils.random(.9, 1.5), ease: 'power3.out', onComplete: () => p.remove(),
      });
    }
  };

  /* ---------- Calendário (.ics) ---------- */
  $('#bk-ics').addEventListener('click', () => {
    if (!state.date || !state.slot) return;
    const [h, m] = state.slot.split(':').map(Number);
    const s = new Date(state.date); s.setHours(h, m);
    const e = new Date(s.getTime() + 2 * 3600 * 1000);
    const f = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Blackline Performance//PT', 'BEGIN:VEVENT',
      `UID:${Date.now()}@blackline`, `DTSTART:${f(s)}`, `DTEND:${f(e)}`,
      `SUMMARY:Blackline Performance — ${chosen().map(x => x.name).join(', ')}`,
      `DESCRIPTION:${carLabel()} ${state.plate} · Código ${$('#bk-code').textContent}`,
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'blackline-marcacao.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  /* ---------- Navegação ---------- */
  nextBtn.addEventListener('click', () => {
    if (!valid()) return;
    state.step === 4 ? confirm() : go(state.step + 1);
  });
  $('[data-back]', root).addEventListener('click', () => state.step > 0 && go(state.step - 1));
  root.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && e.target.matches('input') && valid()) nextBtn.click();
    if (e.key === 'Tab') { // manter o foco dentro do diálogo
      const f = $$('button:not([disabled]), input, textarea, a[href]', $('.booking__app', root)).filter(x => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- Abrir / fechar ---------- */
  let lastFocus = null;
  const reset = () => {
    Object.assign(state, { step: 0, brand: '', model: '', year: '', plate: '', date: null, slot: '', pickup: false, name: '', phone: '', email: '', notes: '' });
    state.services.clear();
    $$('input, textarea', root).forEach(i => i.type === 'checkbox' ? (i.checked = false) : (i.value = ''));
    $$('.on', root).forEach(x => x.classList.remove('on'));
    stepsEls.forEach((s, i) => s.classList.toggle('is-active', i === 0));
    renderSlots();
  };

  const open = (serviceId) => {
    if (root.classList.contains('is-open')) return;
    if (state.step === 5) reset();
    if (serviceId && SERVICES.some(s => s.id === serviceId)) { state.services.add(serviceId); }
    syncServices();
    lastFocus = document.activeElement;
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-locked');
    document.dispatchEvent(new CustomEvent('booking:open'));
    chrome();
    if (window.gsap) {
      gsap.killTweensOf(['.booking__backdrop', '.booking__shell']);
      const tl = gsap.timeline();
      tl.fromTo('.booking__backdrop', { opacity: 0 }, { opacity: 1, duration: .4 })
        .fromTo('.booking__shell', { y: 80, scale: .94, opacity: 0, clipPath: 'inset(20% 10% 20% 10% round 40px)' },
          { y: 0, scale: 1, opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: .8, ease: 'expo.out' }, '<.05')
        .from('.booking__side > *', { x: -30, opacity: 0, stagger: .06, duration: .6, ease: 'power3.out' }, '<.2')
        .from('#bk-steps li', { x: -14, opacity: 0, stagger: .05, duration: .4 }, '<.1')
        .from('.bk-side__car img', { x: 160, opacity: 0, duration: 1, ease: 'power4.out' }, '<')
        .fromTo(stepsEls[state.step].children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: .04, duration: .5, ease: 'power3.out' }, '<');
    }
    setTimeout(() => $('.bk-svc, .bk-step.is-active input', root)?.focus({ preventScroll: true }), 350);
  };

  function close() {
    if (!root.classList.contains('is-open')) return;
    const finish = () => {
      root.classList.remove('is-open');
      root.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-locked');
      document.dispatchEvent(new CustomEvent('booking:close'));
      if (state.step === 5) reset();
      lastFocus?.focus?.({ preventScroll: true });
      if (location.hash === '#agendar') history.replaceState(null, '', location.pathname + location.search);
    };
    if (window.gsap) {
      gsap.timeline({ onComplete: finish })
        .to('.booking__shell', { y: 60, scale: .96, opacity: 0, duration: .35, ease: 'power2.in' })
        .to('.booking__backdrop', { opacity: 0, duration: .3 }, '<.1');
    } else finish();
  }

  $$('[data-close]', root).forEach(b => b.addEventListener('click', close));
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

  stepsEls[0].classList.add('is-active');
  chrome();
  window.BLBooking = { open, close };
})();

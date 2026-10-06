/* Blackline Performance — interações e animações de scroll */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#year').textContent = new Date().getFullYear();
  const I = window.BLi18n;

  /* ---------- Contactos e textos editáveis no painel ---------- */
  let settings = null;
  const applySettings = () => {
    if (!settings) return;
    const c = settings.contacts;
    const wa = String(c.whatsapp || '').replace(/\D/g, '');
    const tel = String(c.phone || '').replace(/[^\d+]/g, '');
    const hrefs = {
      whatsapp: wa && `https://wa.me/${wa}`,
      phone: tel && `tel:${tel}`,
      instagram: c.instagram && `https://www.instagram.com/${c.instagram.replace(/^@/, '')}/`,
      tiktok: c.tiktok && `https://www.tiktok.com/@${c.tiktok.replace(/^@/, '')}`,
    };
    const texts = {
      phone: c.phone, instagram: c.instagram && '@' + c.instagram.replace(/^@/, ''), tiktok: c.tiktok && '@' + c.tiktok.replace(/^@/, ''),
      hours: I.pick(c.hours), payment: I.pick(c.payment),
    };
    $$('[data-href]').forEach(a => { const h = hrefs[a.dataset.href]; if (h) a.href = h; else if (a.dataset.href !== 'phone') a.hidden = !h; });
    $$('[data-set]').forEach(el => { const v = texts[el.dataset.set]; if (v) el.textContent = v; });
  };
  /* ---------- Promoções ---------- */
  const renderPromos = () => {
    const sec = $('#promocoes'); if (!sec || !settings) return;
    const P = window.BLStore.pricing;
    const list = P.livePromos(settings).filter(p => p.showOnSite !== false);
    sec.hidden = !list.length;
    if (!list.length) return;
    const mt = n => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' MT';
    const fmt = d => new Date(d + 'T00:00').toLocaleDateString(I.locale(), { day: 'numeric', month: 'long' });
    const all = settings.groups.flatMap(g => g.items).filter(x => x.active !== false);
    const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    $('#promo-list').innerHTML = list.map(p => {
      const svcs = p.services && p.services.length ? all.filter(x => p.services.includes(x.id)) : [];
      const names = svcs.length ? svcs.map(x => I.pick(x.name)).join(' · ') : I.t('promo.all');
      const big = p.type === 'price' ? mt(p.value) : P.label(p, mt);
      return `<article class="promo">
        <div class="promo__value"><small>${p.type === 'price' ? I.t('promo.price') : I.t('promo.tag')}</small><b class="${p.type === 'price' ? 'is-price' : ''}">${esc(big)}</b></div>
        <div class="promo__body">
          <h3>${esc(I.pick(p.title))}</h3>
          ${I.pick(p.desc) ? `<p>${esc(I.pick(p.desc))}</p>` : ''}
          <p class="promo__svcs">${esc(names)}</p>
          <div class="promo__foot">
            <span>${p.end ? I.t('promo.until', { d: fmt(p.end) }) : ''}</span>
            <a class="btn btn--red btn--sm" href="#agendar" data-book="${esc(svcs.map(x => x.id).join(','))}">${I.t('promo.cta')}</a>
          </div>
        </div>
      </article>`;
    }).join('');
    window.ScrollTrigger && ScrollTrigger.refresh();
  };
  window.BLStore.getSettings().then(s => { settings = s; applySettings(); renderPromos(); });
  document.addEventListener('lang:change', renderPromos);
  document.addEventListener('lang:change', () => {
    applySettings(); showcase.caption();
    burger.setAttribute('aria-label', I.t(menu.classList.contains('is-open') ? 'nav.close' : 'nav.open'));
  });

  /* ---------- Carrossel: viaturas na oficina ---------- */
  const showcase = (() => {
    const slides = $$('.showcase__slide');
    const bars = $('#sc-bars');
    if (!slides.length) return { caption() {} };
    let i = 0, timer = null;
    const DUR = 5200;
    bars.innerHTML = slides.map((_, k) => `<button type="button" aria-label="${k + 1}"><i></i></button>`).join('');
    $('#sc-t').textContent = String(slides.length).padStart(2, '0');
    const caption = () => {
      const s = slides[i];
      $('#sc-n').textContent = String(i + 1).padStart(2, '0');
      $('#sc-name').textContent = s.dataset.name;
      $('#sc-job').textContent = s.dataset['job' + (I.lang === 'en' ? 'En' : 'Pt')];
    };
    const go = (to, dir = 1) => {
      const from = slides[i];
      i = (to + slides.length) % slides.length;
      const next = slides[i];
      $$('button', bars).forEach((b, k) => b.classList.toggle('on', k === i));
      if (window.gsap && !reduced && from !== next) {
        gsap.to(from, { xPercent: -40 * dir, opacity: 0, duration: .6, ease: 'power3.in', onComplete: () => from.classList.remove('is-active') });
        next.classList.add('is-active');
        gsap.fromTo(next, { xPercent: 50 * dir, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: .35 });
        gsap.fromTo(['#sc-name', '#sc-job'], { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .06, ease: 'power3.out', delay: .4, onStart: caption });
      } else {
        slides.forEach(sl => sl.classList.toggle('is-active', sl === next));
        caption();
      }
      restart();
    };
    const restart = () => {
      clearTimeout(timer);
      const bar = $$('button i', bars)[i];
      $$('button i', bars).forEach(x => { x.style.transition = 'none'; x.style.transform = 'scaleX(0)'; });
      if (reduced) return;
      requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = `transform ${DUR}ms linear`; bar.style.transform = 'scaleX(1)'; }));
      timer = setTimeout(() => go(i + 1), DUR);
    };
    $$('[data-sc]').forEach(b => b.addEventListener('click', () => go(i + +b.dataset.sc, +b.dataset.sc)));
    bars.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { const k = $$('button', bars).indexOf(b); go(k, k > i ? 1 : -1); } });
    // arrastar no telemóvel
    let x0 = null;
    const stage = $('#sc-stage');
    stage.addEventListener('pointerdown', e => { x0 = e.clientX; });
    stage.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); });
    const box = $('.showcase');
    box.addEventListener('mouseenter', () => clearTimeout(timer));
    box.addEventListener('mouseleave', restart);
    document.addEventListener('visibilitychange', () => (document.hidden ? clearTimeout(timer) : restart()));
    $$('button', bars)[0].classList.add('on');
    caption(); restart();
    return { caption };
  })();

  /* ---------- Nav: fundo ao rolar, esconde ao descer, menu mobile ---------- */
  const nav = $('.nav');
  const burger = $('.nav__burger');
  const menu = $('#menu');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 20);
    nav.classList.toggle('is-hidden', y > lastY && y > 400 && !nav.classList.contains('is-open'));
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', !open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', I.t(open ? 'nav.close' : 'nav.open'));
    document.documentElement.classList.toggle('is-locked', open);
    document.dispatchEvent(new CustomEvent(open ? 'menu:open' : 'menu:close'));
    if (open && window.gsap && !reduced) {
      gsap.fromTo(menu, { clipPath: 'polygon(100% 0, 100% 0, 80% 100%, 100% 100%)' },
        { clipPath: 'polygon(0 0, 100% 0, 100% 100%, -20% 100%)', duration: .7, ease: 'expo.inOut' });
      gsap.fromTo('.menu__links a', { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .7, ease: 'expo.out', delay: .25 });
      gsap.fromTo('.menu__foot > *, .menu__mark', { y: 30, opacity: 0 }, { y: 0, opacity: (i, el) => el.classList.contains('menu__mark') ? .12 : 1, stagger: .08, duration: .7, ease: 'expo.out', delay: .45 });
    }
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  document.addEventListener('booking:open', () => menu.classList.contains('is-open') && setMenu(false));
  matchMedia('(min-width: 861px)').addEventListener('change', e => e.matches && setMenu(false));

  /* ---------- Filtros dos serviços ---------- */
  const cards = $$('.gallery .card');
  const applyFilter = (f) => {
    const show = cards.filter(c => f === 'all' || c.dataset.cat === f);
    $('.showcase').hidden = f !== 'all';
    cards.forEach(c => c.classList.toggle('is-hidden', !show.includes(c)));
    if (window.gsap && !reduced) {
      gsap.fromTo(show, { opacity: 0, y: 30, scale: .96 },
        { opacity: 1, y: 0, scale: 1, duration: .6, stagger: .05, ease: 'power3.out', overwrite: true });
    }
    window.ScrollTrigger && ScrollTrigger.refresh();
  };
  $$('.filter').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter').forEach(b => b.classList.toggle('is-active', b === btn));
    if (window.gsap && !reduced) {
      const visible = cards.filter(c => !c.classList.contains('is-hidden'));
      gsap.to(visible, { opacity: 0, y: -14, duration: .22, stagger: .015, ease: 'power2.in',
        onComplete: () => applyFilter(btn.dataset.filter) });
    } else applyFilter(btn.dataset.filter);
  }));

  /* ---------- Contadores ---------- */
  const counters = $$('[data-count]');
  const runCount = (el) => {
    const end = +el.dataset.count;
    if (!window.gsap || reduced) { el.textContent = end.toLocaleString('pt-PT'); return; }
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('pt-PT'); } });
  };

  /* Sem GSAP (CDN bloqueado) ou movimento reduzido: conteúdo estático visível */
  if (!window.gsap || !window.ScrollTrigger || reduced) {
    counters.forEach(runCount);
    $$('.process__steps li').forEach(li => li.classList.add('is-lit'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll (Lenis) ---------- */
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    ['booking:open', 'menu:open'].forEach(ev => document.addEventListener(ev, () => lenis.stop()));
    ['booking:close', 'menu:close'].forEach(ev => document.addEventListener(ev, () => lenis.start()));
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2 || a.hasAttribute('data-book')) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      setTimeout(() => lenis.scrollTo(id === '#top' ? 0 : target, { offset: -70 }), a.closest('.menu') ? 120 : 0);
    }));
  }

  /* ---------- Intro da hero ---------- */
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from('.hero__dark', { xPercent: -100, duration: 1.3, ease: 'expo.inOut' })
    .from('.hero__light', { opacity: 0, duration: .8 }, '-=.6')
    .from('.hero__ghost span', { xPercent: -30, opacity: 0, duration: 1.6, stagger: .12 }, '-=.6')
    .from('.hero__title .line > span', { yPercent: 110, duration: 1.1, stagger: .09 }, '<')
    .from('.hero__copy .eyebrow, .hero__lead', { y: 20, opacity: 0, duration: .9, stagger: .1 }, '-=.9')
    .from('.hero__car', { x: () => innerWidth * .45, opacity: 0, duration: 1.6, ease: 'power4.out' }, '-=1.2')
    .from('.hero__bar', { yPercent: 100, duration: 1 }, '-=1.1')
    .from('.hero__social > *', { opacity: 0, x: -14, stagger: .06, duration: .6 }, '-=.8')
    .from('.nav__inner > *', { y: -20, opacity: 0, stagger: .06, duration: .7 }, '-=1');


  const mm = gsap.matchMedia();

  mm.add('(min-width: 861px)', () => {
    /* Parallax com o rato na hero */
    const hero = $('.hero');
    const carX = gsap.quickTo('.hero__car img', 'x', { duration: 1, ease: 'power3' });
    const carY = gsap.quickTo('.hero__car img', 'y', { duration: 1, ease: 'power3' });
    const ghostX = gsap.quickTo('.hero__ghost', 'x', { duration: 1.4, ease: 'power3' });
    const move = (e) => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      carX(nx * -24); carY(ny * -10); ghostX(nx * 40);
    };
    hero.addEventListener('mousemove', move);

    /* 1) Hero fixa: o conteúdo sai, o carro arranca para a direita */
    gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=85%', pin: true, scrub: 1 },
    })
      .to('.hero__copy', { y: -120, opacity: 0, ease: 'none' }, 0)
      .to('.hero__ghost', { xPercent: -25, ease: 'none' }, 0)
      .to('.hero__car', { xPercent: 60, scale: 1.08, ease: 'power1.in' }, 0)
      .fromTo('.hero__bar', { yPercent: 0 }, { yPercent: 100, ease: 'none', immediateRender: false }, 0)
      .fromTo('.hero__social', { autoAlpha: 1 }, { autoAlpha: 0, ease: 'none', immediateRender: false }, 0)
      .to('.hero__dark', { width: '100%', ease: 'none' }, .15);

    /* 2) Telemóveis entram e "assentam" como no vídeo */
    gsap.timeline({
      scrollTrigger: { trigger: '.app', start: 'top top', end: '+=110%', pin: true, scrub: 1 },
    })
      .fromTo('.phone--front', { y: 380, rotate: 0, xPercent: -40 }, { y: 0, rotate: 6, xPercent: 0, ease: 'power2.out' }, 0)
      .fromTo('.phone--back', { y: 520, rotate: 0, x: 140, opacity: 0 }, { y: 0, rotate: -12, x: 0, opacity: 1, ease: 'power2.out' }, .12)
      .from('.app__copy > *', { x: 80, opacity: 0, stagger: .06, ease: 'power2.out' }, .35)
      .from('.phone .ph-steps li', { x: -20, opacity: 0, stagger: .05 }, .55);
    gsap.from('.brands__inner', {
      y: 30, opacity: 0, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: '.brands', start: 'top 95%' },
    });

    /* Como funciona: a linha vermelha avança e acende cada etapa */
    const steps = $$('.process__steps li');
    gsap.fromTo('.process__fill', { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: {
        trigger: '.process', start: 'top 55%', end: 'bottom 75%', scrub: .6,
        onUpdate: self => steps.forEach((li, i) => li.classList.toggle('is-lit', self.progress >= i / steps.length + .02)),
      },
    });
    gsap.from('.process__steps li', {
      y: 70, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.process__steps', start: 'top 85%' },
    });

    /* 4) Cartões das features em "escada" ligados ao scroll */
    gsap.utils.toArray('.feat').forEach((f, i) => {
      gsap.fromTo(f, { y: 140 + i * 70, opacity: 0 }, {
        y: 0, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: '.feats', start: 'top 95%', end: 'top 45%', scrub: 1 },
      });
    });

    /* 5) Cartão CTA escuro cresce ao entrar */
    gsap.fromTo('.cta__card', { scale: .86, y: 80, borderRadius: 60 }, {
      scale: 1, y: 0, borderRadius: 30, ease: 'none',
      scrollTrigger: { trigger: '.cta', start: 'top 95%', end: 'top 35%', scrub: 1 },
    });
    gsap.to('.cta__pattern', { x: -120, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.cta__mark', { x: 200, rotate: 18, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.cta', start: 'top 90%', end: 'top 30%', scrub: 1 } });
  });

  mm.add('(max-width: 860px)', () => {
    gsap.from('.phone--front', { y: 160, rotate: 0, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.app__phones', start: 'top 85%' } });
    gsap.from('.phone--back', { y: 220, rotate: 0, opacity: 0, duration: 1.1, delay: .12, ease: 'power3.out', scrollTrigger: { trigger: '.app__phones', start: 'top 85%' } });
    gsap.from('.app__copy > *', { y: 40, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.app__copy', start: 'top 85%' } });
    gsap.utils.toArray('.feat').forEach(f => gsap.from(f, { y: 60, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: f, start: 'top 90%' } }));
    gsap.from('.cta__card', { scale: .92, y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cta', start: 'top 85%' } });
    $$('.process__steps li').forEach(li => gsap.from(li, {
      x: 40, opacity: 0, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: li, start: 'top 85%', onEnter: () => li.classList.add('is-lit') },
    }));
  });

  /* 3) Serviços: título sobe, galeria aparece em cascata */
  gsap.from('.section-head > *', {
    y: 50, opacity: 0, stagger: .08, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.services', start: 'top 75%' },
  });
  gsap.from('.showcase', {
    y: 70, opacity: 0, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.showcase', start: 'top 88%' },
  });
  gsap.from('.showcase__stage', {
    clipPath: 'inset(0 0 0 100%)', duration: 1.2, ease: 'expo.inOut',
    scrollTrigger: { trigger: '.showcase', start: 'top 80%' },
  });
  ScrollTrigger.batch('.gallery .card', {
    start: 'top 92%',
    onEnter: batch => gsap.fromTo(batch, { y: 90, opacity: 0, scale: .94 },
      { y: 0, opacity: 1, scale: 1, duration: 1, stagger: .08, ease: 'power3.out', overwrite: true }),
  });
  gsap.set('.gallery .card', { opacity: 0 });
  gsap.utils.toArray('.card img').forEach(img => gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, {
    yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
  }));

  gsap.from('.features__head > div:first-child > *', {
    y: 40, opacity: 0, stagger: .08, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.features', start: 'top 75%' },
  });
  gsap.from('.process__head > *, .process__cta', {
    y: 40, opacity: 0, stagger: .08, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.process', start: 'top 75%' },
  });
  ScrollTrigger.create({ trigger: '.stats', start: 'top 85%', once: true, onEnter: () => counters.forEach(runCount) });

  gsap.from('.cta__card > :not(.cta__pattern):not(.cta__mark)', {
    y: 40, opacity: 0, stagger: .1, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.cta__card', start: 'top 70%' },
  });

  gsap.from('.footer__grid > *', {
    y: 40, opacity: 0, stagger: .08, duration: .9, ease: 'power3.out',
    scrollTrigger: { trigger: '.footer', start: 'top 90%' },
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();

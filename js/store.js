/* Blackline Performance — camada de dados
 * Modo Supabase (js/env.js preenchido): base de dados Supabase — marcações, definições, cotações e PDFs.
 * Modo local    (sem Supabase): localStorage do navegador — só para demonstração.
 */
(() => {
  const ENV = window.BL_ENV || {};
  const CFG = window.BL_CONFIG || {};
  const DEFAULTS = window.BL_DEFAULTS;
  const CONFIGURED = !!(ENV.SUPABASE_URL && ENV.SUPABASE_PUBLISHABLE_KEY);
  const SB = CONFIGURED && !!window.supabase?.createClient;
  const db = SB ? window.supabase.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) : null;
  // Supabase configurado mas indisponível: nunca guardar marcações só no navegador do cliente
  const OFFLINE = CONFIGURED && !SB;
  if (OFFLINE) console.error('Supabase configurado mas a biblioteca não carregou.');

  const K = { settings: 'blp:settings', bookings: 'blp:bookings', pass: 'blp:adminHash', token: 'blp:adminToken' };
  const clone = o => JSON.parse(JSON.stringify(o));
  const ls = {
    get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  };
  const ss = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) { /* */ } },
  };
  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const fail = (code, msg) => Object.assign(new Error(msg || code), { code });
  // traduz erros do Supabase para códigos usados na interface
  const CODES = ['auth', 'locked', 'session_expired', 'weak_password', 'too_many_requests', 'invalid_date', 'not_found', 'bad_settings'];
  const sbErr = e => {
    const m = String(e?.message || e || '');
    if (CODES.includes(m.trim())) return fail(m.trim(), m.trim());
    if (/too_many_requests/.test(m)) return fail('too_many_requests', 'too_many_requests');
    if (/invalid_date/.test(m)) return fail('invalid_date');
    if (/Invalid login credentials/i.test(m)) return fail('auth');
    if (/Email not confirmed/i.test(m)) return fail('unconfirmed');
    if (/JWT|session|not authenticated/i.test(m)) return fail('session_expired');
    if (/row-level security|permission denied/i.test(m)) return fail('forbidden');
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return fail('network');
    return fail(e?.code || 'error', m);
  };
  const must = ({ data, error }) => { if (error) throw sbErr(error); return data; };

  // junta definições guardadas com os valores por defeito (campos novos aparecem sempre)
  function merge(saved) {
    const s = clone(DEFAULTS);
    if (!saved || typeof saved !== 'object') return s;
    if (saved.contacts) s.contacts = Object.assign(s.contacts, saved.contacts);
    if (saved.booking) s.booking = Object.assign(s.booking, saved.booking);
    if (Array.isArray(saved.groups) && saved.groups.length) s.groups = saved.groups;
    if (saved.company) s.company = Object.assign(s.company, saved.company);
    if (Array.isArray(saved.promos)) s.promos = saved.promos;
    return s;
  }

  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const newRef = () => {
    const d = new Date();
    return 'BLP-' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
  };

  /* ---------- conversão marcação ↔ linha da tabela ---------- */
  const toRow = b => ({
    ref: b.ref, first_name: b.firstName, last_name: b.lastName || '', phone: b.phone, email: b.email || null,
    contact_pref: b.contactPref || 'whatsapp', lang: b.lang || 'pt',
    services: b.services, services_label: b.servicesLabel || null, total: b.total || null, promo: b.promo || null,
    brand: b.brand || null, model: b.model, year: b.year || null, km: b.km || null, fuel: b.fuel || null, plate: b.plate || null, chassis: b.chassis,
    appt_date: b.date, appt_time: b.time, dropoff: b.dropoff || 'oficina', notes: b.notes || null,
  });
  const fromRow = r => {
    const q = r.quote || (Array.isArray(r.quotes) ? r.quotes[0] : r.quotes);
    return {
      id: r.id, ref: r.ref, createdAt: r.created_at, status: r.status,
      firstName: r.first_name, lastName: r.last_name, phone: r.phone, email: r.email || '', contactPref: r.contact_pref, lang: r.lang,
      services: r.services || [], servicesLabel: r.services_label || '', total: r.total || '', promo: r.promo || '',
      brand: r.brand || '', model: r.model || '', year: r.year || '', km: r.km || '', fuel: r.fuel || '', plate: r.plate || '', chassis: r.chassis || '',
      date: r.appt_date, time: r.appt_time, dropoff: r.dropoff, notes: r.notes || '', internalNote: r.internal_note || '',
      quote: q ? Object.assign({}, q.data, { number: q.number, total: Number(q.total) }) : null,
      quoteAt: q?.sent_at || '', quoteHasPdf: !!q?.has_pdf,
      quoteUrl: q?.has_pdf && q?.public_key ? new URL('cotacao.html?q=' + q.public_key, location.href).href : '',
    };
  };

  let settingsCache = null;
  const TOKEN_KEY = 'blp:sbToken';
  const tok = {
    get() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } },
    set(v) { try { v ? localStorage.setItem(TOKEN_KEY, v) : localStorage.removeItem(TOKEN_KEY); } catch (e) { /* */ } },
  };
  const rpc = async (fn, args = {}) => {
    const { data, error } = await db.rpc(fn, args);
    if (error) { const e = sbErr(error); if (e.code === 'session_expired') tok.set(null); throw e; }
    return data;
  };
  const adminRpc = (fn, args = {}) => rpc(fn, Object.assign({ p_token: tok.get() }, args));
  const blobToBase64 = blob => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });

  const Store = {
    mode: SB ? 'supabase' : OFFLINE ? 'offline' : 'local',
    client: db,
    defaults: () => clone(DEFAULTS),

    /* ---------- público ---------- */
    async getSettings() {
      if (settingsCache) return settingsCache;
      if (!SB) return (settingsCache = merge(ls.get(K.settings)));
      try {
        const row = must(await db.from('settings').select('data').eq('id', 1).maybeSingle());
        return (settingsCache = merge(row?.data));
      } catch (e) {
        console.warn('Definições indisponíveis — a usar valores por defeito.', e);
        return (settingsCache = merge(null));
      }
    },

    async addBooking(b) {
      const { website, ...data } = b;
      const rec = Object.assign({ id: newId(), ref: newRef(), createdAt: new Date().toISOString(), status: 'novo', internalNote: '' }, data);
      if (website) return rec;                                   // robô: finge sucesso
      if (OFFLINE) throw fail('network');
      if (!SB) {
        const list = ls.get(K.bookings, []);
        list.unshift(rec);
        if (!ls.set(K.bookings, list)) throw fail('storage');
        return rec;
      }
      for (let attempt = 0; attempt < 3; attempt++) {
        const { error } = await db.from('bookings').insert(toRow(rec));   // sem .select(): visitantes não leem marcações
        if (!error) return rec;
        if (error.code === '23505' && /ref/.test(error.message)) { rec.ref = newRef(); continue; }
        throw sbErr(error);
      }
      throw fail('error');
    },

    /* ---------- administração (sessão validada no Supabase) ---------- */
    loginLabel: 'Utilizador',
    async hasSession() {
      if (!SB) return !!ss.get(K.token);
      if (!tok.get()) return false;
      try { return !!(await adminRpc('admin_ping')); } catch (e) { return false; }
    },
    async login(user, pass) {
      if (OFFLINE) throw fail('network');
      if (SB) {
        const token = await rpc('admin_login', { p_username: String(user), p_password: String(pass) });
        if (!token) throw fail('auth');
        tok.set(token);
        return true;
      }
      const hash = await sha256(pass);
      const expected = ls.get(K.pass, CFG.adminPassHash);
      if (user.trim().toLowerCase() !== (CFG.adminUser || 'admin') || hash !== expected) throw fail('auth');
      ss.set(K.token, 'local-' + newId());
      return true;
    },
    async logout() {
      if (SB) { try { await adminRpc('admin_logout'); } catch (e) { /* */ } tok.set(null); }
      else ss.set(K.token, null);
    },

    async listBookings() {
      if (!SB) return ls.get(K.bookings, []);
      return (await adminRpc('admin_list_bookings') || []).map(fromRow);
    },
    async updateBooking(id, patch) {
      if (!SB) {
        const list = ls.get(K.bookings, []);
        const i = list.findIndex(b => b.id === id);
        if (i > -1) { Object.assign(list[i], patch); ls.set(K.bookings, list); }
        return true;
      }
      const p = {};
      if ('status' in patch) p.status = patch.status;
      if ('internalNote' in patch) p.internal_note = patch.internalNote || '';
      if (Object.keys(p).length) await adminRpc('admin_update_booking', { p_id: id, p_patch: p });
      return true;
    },
    async deleteBooking(id) {
      if (!SB) { ls.set(K.bookings, ls.get(K.bookings, []).filter(b => b.id !== id)); return true; }
      await adminRpc('admin_delete_booking', { p_id: id });
      return true;
    },
    async saveSettings(settings) {
      settingsCache = merge(settings);
      if (!SB) { ls.set(K.settings, settings); return true; }
      await adminRpc('admin_save_settings', { p_data: settings });
      return true;
    },
    async changePassword(oldPass, newPass) {
      if (SB) { await adminRpc('admin_change_password', { p_old: oldPass, p_new: newPass }); return true; }
      const expected = ls.get(K.pass, CFG.adminPassHash);
      if (await sha256(oldPass) !== expected) throw fail('auth');
      ls.set(K.pass, await sha256(newPass));
      return true;
    },

    /* ---------- cotações: dados + PDF guardados no Supabase ---------- */
    // devolve { url } — link para o cliente abrir o PDF (só no Supabase)
    async saveQuote(bookingId, quote, { sent = false, blob = null } = {}) {
      if (!SB) {
        const patch = { quote: JSON.stringify(quote) };
        if (sent) patch.quoteAt = new Date().toISOString();
        const list = ls.get(K.bookings, []);
        const b = list.find(x => x.id === bookingId);
        if (b) { Object.assign(b, patch); if (sent && b.status === 'novo') b.status = 'contactado'; ls.set(K.bookings, list); }
        return { url: null };
      }
      const pdf = blob ? await blobToBase64(blob) : null;
      const key = await adminRpc('admin_save_quote', { p_booking_id: bookingId, p_quote: quote, p_pdf_base64: pdf, p_sent: !!sent });
      return { url: key && pdf ? new URL('cotacao.html?q=' + key, location.href).href : null, key };
    },
    canLinkPdf: SB,

    /* ---------- verificação periódica de novas marcações (painel) ---------- */
    onNewBooking(cb, ms = 30000) {
      if (!SB) return () => {};
      let known = null;
      const tick = async () => {
        try {
          const list = await this.listBookings();
          if (known) list.filter(b => !known.has(b.id)).forEach(cb);
          known = new Set(list.map(b => b.id));
        } catch (e) { /* tenta na próxima */ }
      };
      tick();
      const t = setInterval(tick, ms);
      return () => clearInterval(t);
    },

    async exportAll() { return { settings: await this.getSettings(), bookings: await this.listBookings(), exportedAt: new Date().toISOString() }; },
    async importAll(data) {
      if (data.settings) await this.saveSettings(data.settings);
      if (!SB && Array.isArray(data.bookings)) ls.set(K.bookings, data.bookings);
    },
  };

  /* ---------- preços e promoções (usado pelo site e pelo painel) ---------- */
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const Pricing = {
    promoStatus(p, day = iso(new Date())) {
      if (!p.active) return 'off';
      if (p.start && day < p.start) return 'scheduled';
      if (p.end && day > p.end) return 'ended';
      return 'live';
    },
    livePromos(settings, day) { return (settings.promos || []).filter(p => this.promoStatus(p, day) === 'live'); },
    applies(p, serviceId) { return !p.services || !p.services.length || p.services.includes(serviceId); },
    discounted(price, p) {
      const v = Number(p.value) || 0;
      if (p.type === 'percent') return Math.max(0, Math.round(price * (1 - v / 100)));
      if (p.type === 'fixed') return Math.max(0, price - v);
      if (p.type === 'price') return Math.max(0, v);
      return price;
    },
    /* subopções: [{id, name, desc, price|null, active}] — o preço do serviço passa a ser a soma das escolhidas */
    opts(service) { return (service.options || []).filter(o => o.active !== false && (o.name?.pt || o.name?.en)); },
    hasOpts(service) { return this.opts(service).length > 0; },
    chosen(service, sel) { const set = new Set(sel || []); return this.opts(service).filter(o => set.has(o.id)); },
    // preço base de um serviço com as subopções escolhidas (null = sob orçamento)
    base(service, sel) {
      if (this.hasOpts(service)) {
        const list = sel ? this.chosen(service, sel) : [];
        if (!sel) { const p = this.opts(service).map(o => o.price).filter(v => v != null && v !== ''); return p.length ? Math.min(...p.map(Number)) : null; }
        const priced = list.filter(o => o.price != null && o.price !== '');
        return priced.length ? priced.reduce((a, o) => a + Number(o.price), 0) : (list.length ? null : 0);
      }
      return service.price == null || service.price === '' ? null : Number(service.price);
    },
    // há subopções escolhidas sem preço (a orçamentar)?
    partQuote(service, sel) { return this.hasOpts(service) && sel ? this.chosen(service, sel).some(o => o.price == null || o.price === '') : false; },
    // melhor promoção válida para um serviço (só para serviços com preço)
    best(settings, service, day, sel) {
      const base = this.base(service, sel);
      if (base == null || (!base && this.hasOpts(service))) return null;
      let bestP = null, bestV = base;
      this.livePromos(settings, day).filter(p => this.applies(p, service.id)).forEach(p => {
        const v = this.discounted(base, p);
        if (v < bestV) { bestV = v; bestP = p; }
      });
      return bestP ? { promo: bestP, price: bestV, was: base } : null;
    },
    label(p, mt) {
      const v = Number(p.value) || 0;
      return p.type === 'percent' ? `-${v}%` : p.type === 'fixed' ? `-${mt(v)}` : mt(v);
    },
  };
  Store.pricing = Pricing;

  window.BLStore = Store;
})();

/* Blackline Performance — camada de dados
 * Modo local  (BL_CONFIG.backendUrl vazio): localStorage do navegador — para demonstração.
 * Modo online (backendUrl preenchido): Google Apps Script + Folha Google (ver backend/apps-script.gs).
 */
(() => {
  const CFG = window.BL_CONFIG || {};
  const DEFAULTS = window.BL_DEFAULTS;
  const REMOTE = !!CFG.backendUrl;
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

  // junta definições guardadas com os valores por defeito (campos novos aparecem sempre)
  function merge(saved) {
    const s = clone(DEFAULTS);
    if (!saved) return s;
    if (saved.contacts) s.contacts = Object.assign(s.contacts, saved.contacts);
    if (saved.booking) s.booking = Object.assign(s.booking, saved.booking);
    if (Array.isArray(saved.groups) && saved.groups.length) s.groups = saved.groups;
    if (saved.company) s.company = Object.assign(s.company, saved.company);
    if (Array.isArray(saved.promos)) s.promos = saved.promos;
    return s;
  }

  async function remote(payload) {
    // text/plain evita o "preflight" CORS que o Apps Script não suporta
    const res = await fetch(CFG.backendUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!data.ok) throw Object.assign(new Error(data.error || 'Erro no servidor'), { code: data.error });
    return data;
  }

  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const newRef = () => {
    const d = new Date();
    return 'BLP-' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
  };

  let settingsCache = null;

  const Store = {
    mode: REMOTE ? 'remote' : 'local',
    defaults: () => clone(DEFAULTS),

    /* ---------- público ---------- */
    async getSettings() {
      if (settingsCache) return settingsCache;
      if (!REMOTE) return (settingsCache = merge(ls.get(K.settings)));
      try {
        const cached = ss.get(K.settings);
        if (cached) return (settingsCache = merge(JSON.parse(cached)));
        const res = await fetch(CFG.backendUrl + '?action=settings');
        const data = await res.json();
        ss.set(K.settings, JSON.stringify(data.settings || null));
        return (settingsCache = merge(data.settings));
      } catch (e) {
        console.warn('Definições online indisponíveis — a usar valores por defeito.', e);
        return (settingsCache = merge(null));
      }
    },

    async addBooking(b) {
      const rec = Object.assign({ id: newId(), ref: newRef(), createdAt: new Date().toISOString(), status: 'novo', internalNote: '' }, b);
      if (!REMOTE) {
        const list = ls.get(K.bookings, []);
        list.unshift(rec);
        if (!ls.set(K.bookings, list)) throw new Error('storage');
        return rec;
      }
      const data = await remote({ action: 'booking', booking: rec });
      return Object.assign(rec, { ref: data.ref || rec.ref });
    },

    /* ---------- administração ---------- */
    get token() { return ss.get(K.token); },
    async login(user, pass) {
      if (REMOTE) {
        const data = await remote({ action: 'login', user, pass });
        ss.set(K.token, data.token);
        return true;
      }
      const hash = await sha256(pass);
      const expected = ls.get(K.pass, CFG.adminPassHash);
      if (user.trim().toLowerCase() !== (CFG.adminUser || 'admin') || hash !== expected) throw Object.assign(new Error('Credenciais inválidas'), { code: 'auth' });
      ss.set(K.token, 'local-' + newId());
      return true;
    },
    logout() { ss.set(K.token, null); },

    async listBookings() {
      if (!REMOTE) return ls.get(K.bookings, []);
      return (await remote({ action: 'list', token: this.token })).bookings || [];
    },
    async updateBooking(id, patch) {
      if (!REMOTE) {
        const list = ls.get(K.bookings, []);
        const i = list.findIndex(b => b.id === id);
        if (i > -1) { Object.assign(list[i], patch); ls.set(K.bookings, list); }
        return true;
      }
      await remote({ action: 'update', token: this.token, id, patch });
      return true;
    },
    async deleteBooking(id) {
      if (!REMOTE) { ls.set(K.bookings, ls.get(K.bookings, []).filter(b => b.id !== id)); return true; }
      await remote({ action: 'delete', token: this.token, id });
      return true;
    },
    async saveSettings(settings) {
      settingsCache = merge(settings);
      if (!REMOTE) { ls.set(K.settings, settings); return true; }
      await remote({ action: 'saveSettings', token: this.token, settings });
      ss.set(K.settings, JSON.stringify(settings));
      return true;
    },
    async changePassword(oldPass, newPass) {
      if (REMOTE) { await remote({ action: 'password', token: this.token, old: oldPass, new: newPass }); return true; }
      const expected = ls.get(K.pass, CFG.adminPassHash);
      if (await sha256(oldPass) !== expected) throw Object.assign(new Error('A palavra-passe atual não está correta.'), { code: 'auth' });
      ls.set(K.pass, await sha256(newPass));
      return true;
    },
    // cópia de segurança (útil no modo local)
    async exportAll() { return { settings: await this.getSettings(), bookings: await this.listBookings(), exportedAt: new Date().toISOString() }; },
    async importAll(data) {
      if (data.settings) await this.saveSettings(data.settings);
      if (!REMOTE && Array.isArray(data.bookings)) ls.set(K.bookings, data.bookings);
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
    // melhor promoção válida para um serviço (só para serviços com preço)
    best(settings, service, day) {
      if (service.price == null || service.price === '') return null;
      const base = Number(service.price);
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

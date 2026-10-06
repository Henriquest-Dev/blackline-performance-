/**
 * Blackline Performance — servidor gratuito em Google Apps Script
 *
 * Guarda as marcações e as definições do site (preços, contactos) numa Folha Google.
 * Instalação: ver docs/painel-admin.md (passo a passo, ~10 minutos).
 *
 * Folhas criadas automaticamente:
 *   "Marcações" — uma linha por pedido (pode abrir e filtrar diretamente no Google Sheets)
 *   "Config"    — definições do site em JSON (não editar à mão)
 */

const SHEET_BOOKINGS = 'Marcações';
const SHEET_CONFIG = 'Config';
const DEFAULT_USER = 'admin';
const DEFAULT_PASS = 'Blackline@2026';   // mude no painel → Conta, logo após instalar
const TOKEN_HOURS = 8;

const COLS = ['id', 'ref', 'createdAt', 'status', 'firstName', 'lastName', 'phone', 'email', 'contactPref',
  'services', 'servicesLabel', 'total', 'brand', 'model', 'year', 'km', 'fuel', 'plate', 'chassis',
  'date', 'time', 'dropoff', 'notes', 'lang', 'internalNote'];

/* ---------------- entrada HTTP ---------------- */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'settings') return json({ ok: true, settings: readSettings() });
  return json({ ok: true, service: 'blackline-performance' });
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (err) { return json({ ok: false, error: 'bad_json' }); }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    switch (body.action) {
      case 'booking': return json(addBooking(body.booking || {}));
      case 'login': return json(login(body.user, body.pass));
      case 'list': auth(body.token); return json({ ok: true, bookings: listBookings() });
      case 'update': auth(body.token); updateBooking(body.id, body.patch || {}); return json({ ok: true });
      case 'delete': auth(body.token); deleteBooking(body.id); return json({ ok: true });
      case 'saveSettings': auth(body.token); writeSettings(body.settings); return json({ ok: true });
      case 'password': auth(body.token); changePassword(body.old, body.new); return json({ ok: true });
      default: return json({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------------- marcações ---------------- */
function bookingsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_BOOKINGS);
  if (!sh) {
    sh = ss.insertSheet(SHEET_BOOKINGS);
    sh.appendRow(COLS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLS.length).setFontWeight('bold');
  }
  return sh;
}

function addBooking(b) {
  // validação mínima e anti-spam
  if (b.website) return { ok: true, ref: 'BLP-OK' };                       // honeypot preenchido por robôs
  if (!b.firstName || !b.phone || !b.date || !b.time) throw new Error('missing_fields');
  const props = PropertiesService.getScriptProperties();
  const last = Number(props.getProperty('last_' + b.phone) || 0);
  if (Date.now() - last < 60 * 1000) throw new Error('too_many_requests');
  props.setProperty('last_' + b.phone, String(Date.now()));

  b.id = b.id || Utilities.getUuid();
  b.createdAt = new Date().toISOString();
  b.status = 'novo';
  b.internalNote = '';
  if (Array.isArray(b.services)) b.services = b.services.join(',');
  bookingsSheet().appendRow(COLS.map(c => clean(b[c])));
  return { ok: true, ref: b.ref, id: b.id };
}

function listBookings() {
  const values = bookingsSheet().getDataRange().getValues();
  const head = values.shift();
  return values.filter(r => r[0]).map(r => {
    const o = {};
    head.forEach((h, i) => { o[h] = r[i] instanceof Date ? r[i].toISOString() : r[i]; });
    o.services = String(o.services || '').split(',').filter(String);
    return o;
  }).reverse();
}

function findRow(id) {
  const sh = bookingsSheet();
  const ids = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues();
  for (let i = 0; i < ids.length; i++) if (ids[i][0] === id) return { sh: sh, row: i + 2 };
  throw new Error('not_found');
}

function updateBooking(id, patch) {
  const f = findRow(id);
  ['status', 'internalNote'].forEach(k => {
    if (k in patch) f.sh.getRange(f.row, COLS.indexOf(k) + 1).setValue(clean(patch[k]));
  });
}

function deleteBooking(id) {
  const f = findRow(id);
  f.sh.deleteRow(f.row);
}

/* ---------------- definições ---------------- */
function configSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_CONFIG) || ss.insertSheet(SHEET_CONFIG);
}
function readSettings() {
  const v = configSheet().getRange('A1').getValue();
  try { return v ? JSON.parse(v) : null; } catch (e) { return null; }
}
function writeSettings(s) {
  if (!s || typeof s !== 'object') throw new Error('bad_settings');
  const txt = JSON.stringify(s);
  if (txt.length > 45000) throw new Error('settings_too_large');
  configSheet().getRange('A1').setValue(txt);
  configSheet().getRange('A2').setValue('Atualizado: ' + new Date().toISOString());
}

/* ---------------- autenticação ---------------- */
function hash(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}
function storedHash() {
  const props = PropertiesService.getScriptProperties();
  let h = props.getProperty('ADMIN_HASH');
  if (!h) { h = hash(DEFAULT_PASS); props.setProperty('ADMIN_HASH', h); }
  return h;
}
function login(user, pass) {
  const props = PropertiesService.getScriptProperties();
  const fails = Number(props.getProperty('login_fails') || 0);
  const until = Number(props.getProperty('login_lock_until') || 0);
  if (Date.now() < until) throw new Error('locked');
  if (String(user || '').trim().toLowerCase() !== DEFAULT_USER || hash(String(pass || '')) !== storedHash()) {
    props.setProperty('login_fails', String(fails + 1));
    if (fails + 1 >= 5) { props.setProperty('login_lock_until', String(Date.now() + 15 * 60 * 1000)); props.setProperty('login_fails', '0'); }
    throw new Error('auth');
  }
  props.setProperty('login_fails', '0');
  const token = Utilities.getUuid() + Utilities.getUuid();
  CacheService.getScriptCache().put('tok_' + token, '1', TOKEN_HOURS * 3600);
  return { ok: true, token: token };
}
function auth(token) {
  if (!token || !CacheService.getScriptCache().get('tok_' + token)) throw new Error('session_expired');
}
function changePassword(oldPass, newPass) {
  if (hash(String(oldPass || '')) !== storedHash()) throw new Error('auth');
  if (!newPass || String(newPass).length < 8) throw new Error('weak_password');
  PropertiesService.getScriptProperties().setProperty('ADMIN_HASH', hash(String(newPass)));
}

/* ---------------- util ---------------- */
function clean(v) {
  if (v == null) return '';
  let s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s;   // evita fórmulas injetadas na folha
  return s.slice(0, 2000);
}
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

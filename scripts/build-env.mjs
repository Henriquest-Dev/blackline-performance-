// Gera js/env.js a partir do ficheiro .env (o site é estático: o navegador não lê .env).
// Uso: node scripts/build-env.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, '.env');
if (!existsSync(file)) { console.error('Falta o ficheiro .env (copie .env.example).'); process.exit(1); }

const env = Object.fromEntries(readFileSync(file, 'utf8').split(/\r?\n/)
  .map(l => l.trim()).filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));

const url = env.SUPABASE_URL || '', key = env.SUPABASE_PUBLISHABLE_KEY || '';
if (/^sb_secret_|service_role/i.test(key)) { console.error('ERRO: isso é uma chave SECRETA. Use a chave publishable (sb_publishable_...).'); process.exit(1); }
if (url && !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) console.warn('Aviso: SUPABASE_URL não parece um URL do Supabase.');

const out = `/* Gerado por scripts/build-env.mjs a partir de .env — não editar à mão. */
window.BL_ENV = ${JSON.stringify({ SUPABASE_URL: url.replace(/\/$/, ''), SUPABASE_PUBLISHABLE_KEY: key }, null, 2)};
`;
writeFileSync(join(root, 'js/env.js'), out);
console.log('js/env.js atualizado', url ? `(${url})` : '(sem Supabase — modo demonstração)');

#!/usr/bin/env node
// Sinh lại sprite bằng mô hình ảnh GPT qua CLIProxyAPI (http://localhost:8317).
// Node 18+, không phụ thuộc npm. Chạy từ thư mục gốc dự án:
//   node tools/gen-sprites.mjs [--wait-until HH:MM] [--only a,b] [--force]
//        [--concurrency N] [--dry-run] [--quality low|medium|high]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REF_DIR = path.join(ROOT, 'art', 'reference');
const OUT_DIR = path.join(ROOT, 'art', 'generated');
const LOG_FILE = path.join(OUT_DIR, '_log.json');
const PROMPTS_FILE = path.join(ROOT, 'art', 'prompts.json');
const ENV_FILE = path.join(ROOT, '.env.local');

const MIN = 60 * 1000;
const PROBE_BUDGET_MS = 3 * 60 * MIN;
const REQUEST_TIMEOUT_MS = 10 * MIN;

// ---------- tiện ích ----------
const ts = () => new Date().toLocaleTimeString('vi-VN', { hour12: false });
const log = (...a) => console.log(`[${ts()}]`, ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
  const o = { waitUntil: null, only: null, force: false, concurrency: 2, dryRun: false, quality: 'high' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => argv[++i];
    if (a === '--wait-until') o.waitUntil = val();
    else if (a === '--only') o.only = String(val() || '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--force') o.force = true;
    else if (a === '--concurrency') o.concurrency = Math.max(1, parseInt(val(), 10) || 2);
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '--quality') o.quality = val();
    else if (a === '--help' || a === '-h') { o.help = true; }
    else { console.error(`Tham số không hợp lệ: ${a}`); process.exit(2); }
  }
  if (!['low', 'medium', 'high'].includes(o.quality)) {
    console.error('--quality phải là low, medium hoặc high.');
    process.exit(2);
  }
  if (o.waitUntil && !/^\d{1,2}:\d{2}$/.test(o.waitUntil)) {
    console.error('--wait-until phải có dạng HH:MM, ví dụ 04:20.');
    process.exit(2);
  }
  return o;
}

function loadEnvFile() {
  const out = {};
  if (!fs.existsSync(ENV_FILE)) return out;
  for (const raw of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); });
  });
}

// Tự tìm khoá client của CLIProxyAPI trên máy này: mục đầu tiên dưới `access:` -> `api-keys:` trong config.yaml.
// Khối `api-keys:` cấp cao là khoá nhà cung cấp nên chỉ dùng khi file không có khối `access:`.
// Khoá chỉ nằm trong biến của tiến trình này: không in ra, không ghi vào file nào.
function readClientKey(file) {
  let text; try { text = fs.readFileSync(file, 'utf8'); } catch { return ''; }
  const lines = text.split(/\r?\n/);
  const indent = (l) => l.match(/^\s*/)[0].length;
  const firstItem = (from, base) => {
    for (let k = from; k < lines.length; k++) {
      const l = lines[k]; if (!l.trim() || l.trim().startsWith('#')) continue;
      if (indent(l) < base || (indent(l) === base && !l.trim().startsWith('-'))) return '';
      const m = l.match(/^\s*-\s*(.+?)\s*$/);
      if (m) return m[1].replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '');
    }
    return '';
  };
  const a = lines.findIndex((l) => /^access:\s*(#.*)?$/.test(l));
  if (a >= 0) {
    for (let k = a + 1; k < lines.length; k++) {
      const l = lines[k]; if (!l.trim() || l.trim().startsWith('#')) continue;
      if (indent(l) === 0) break;
      if (/^\s+api-keys:\s*(#.*)?$/.test(l)) return firstItem(k + 1, indent(l));
    }
    return '';
  }
  const t = lines.findIndex((l) => /^api-keys:\s*(#.*)?$/.test(l));
  return t >= 0 ? firstItem(t + 1, 0) : '';
}
function proxyRoots() {
  const home = process.env.USERPROFILE || process.env.HOME || '';
  return home ? [path.join(home, 'Documents', 'Codex', 'Tools', 'HybridAgent')] : [];
}
function findProxyKey(explicit) {
  const cands = [];
  if (explicit) cands.push(explicit);
  for (const r of proxyRoots()) cands.push(path.join(r, 'config.yaml'), path.join(r, 'CLIProxyAPI', 'config.yaml'));
  for (const f of cands) { const k = readClientKey(f); if (k) return k; }
  return '';
}
// Proxy đang tắt thì thử bật bằng Start-Proxy.ps1 của chủ máy (một lần).
let triedStart = false;
async function tryStartProxy() {
  if (triedStart || process.platform !== 'win32') return false; triedStart = true;
  for (const r of proxyRoots()) {
    const ps = path.join(r, 'Start-Proxy.ps1');
    if (!fs.existsSync(ps)) continue;
    console.log('CLIProxyAPI đang tắt, thử bật bằng Start-Proxy.ps1 ...');
    try {
      const { spawn } = await import('node:child_process');
      spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
      await new Promise((res) => setTimeout(res, 8000));
      return true;
    } catch { return false; }
  }
  return false;
}

async function loadConfig() {
  const file = loadEnvFile();
  const get = (k) => (process.env[k] && process.env[k].trim()) || file[k] || '';
  let key = get('CLIPROXY_API_KEY');
  if (!key) {
    key = findProxyKey(get('CLIPROXY_CONFIG'));
    if (key) console.log('Đã tự lấy khoá client từ config.yaml của CLIProxyAPI (chỉ giữ trong bộ nhớ, không in, không lưu).');
  }
  if (!key && process.stdin.isTTY) {
    console.log('Chưa có CLIPROXY_API_KEY (khoá API của CLIProxyAPI, mục api-keys trong config.yaml).');
    key = await ask('Nhập khoá API (sẽ lưu vào .env.local): ');
    if (key) {
      const prefix = fs.existsSync(ENV_FILE) && !fs.readFileSync(ENV_FILE, 'utf8').endsWith('\n') ? '\n' : '';
      fs.appendFileSync(ENV_FILE, `${prefix}CLIPROXY_API_KEY=${key}\n`);
      console.log('Đã lưu khoá vào .env.local.');
    }
  }
  return {
    url: (get('CLIPROXY_URL') || 'http://127.0.0.1:8317').replace(/\/+$/, ''),
    key,
    imageModel: get('IMAGE_MODEL'),
  };
}

// ---------- prompt ----------
function buildPrompt(P, name, withRef, transparent) {
  const s = P.sprites[name];
  let style = s.kind === 'flat' && P.style_flat ? P.style_flat : P.style;
  if (!withRef) style = style.replace(/Keep the exact[^.]*reference image[^.]*\./, '');
  const parts = [style.trim(), s.prompt.trim(), P.negative.trim()];
  if (!transparent) {
    parts[0] = parts[0].replace(/a fully transparent background \(if transparency[^)]*\)/, 'a perfectly flat pure magenta #FF00FF background with no gradient');
    parts.push('Background: perfectly flat pure magenta #FF00FF, uniform, no gradient, no shadow, no magenta anywhere on the subject itself.');
  }
  return parts.join('\n\n');
}

// ---------- PNG tối giản (RGBA/RGB 8-bit, không interlace) để tách nền magenta khi cần ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
const crc32 = (buf) => { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

function decodePng(buf) {
  if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  let p = 8, w = 0, h = 0, depth = 0, ctype = 0, inter = 0; const idat = [];
  while (p + 8 <= buf.length) {
    const len = buf.readUInt32BE(p); const type = buf.toString('latin1', p + 4, p + 8); const d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; ctype = d[9]; inter = d[12]; }
    else if (type === 'IDAT') idat.push(d);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (depth !== 8 || inter !== 0 || (ctype !== 6 && ctype !== 2)) return null;
  const bpp = ctype === 6 ? 4 : 3; const stride = w * bpp;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)]; raw.copy(cur, 0, y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = cur[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[i] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4, s = x * bpp;
      px[o] = cur[s]; px[o + 1] = cur[s + 1]; px[o + 2] = cur[s + 2]; px[o + 3] = bpp === 4 ? cur[s + 3] : 255;
    }
    [prev, cur] = [cur, prev];
  }
  return { w, h, px };
}

function encodePng(w, h, px) {
  const rows = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { rows[y * (w * 4 + 1)] = 0; px.copy(rows, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
}

// Trả về { buf, note }: nếu ảnh đã trong suốt thì giữ nguyên; nếu nền magenta thì tách nền.
function ensureTransparent(buf, name) {
  let img;
  try { img = decodePng(buf); } catch { img = null; }
  if (!img) return { buf, note: 'không đọc được PNG để kiểm tra nền' };
  const { w, h, px } = img;
  let transparent = 0;
  for (let i = 3; i < px.length; i += 4) if (px[i] < 250) transparent++;
  if (transparent > w * h * 0.01) return { buf, note: '' };
  const corner = (x, y) => { const o = (y * w + x) * 4; return px[o] > 180 && px[o + 2] > 180 && px[o + 1] < 110; };
  if (!(corner(0, 0) && corner(w - 1, 0) && corner(0, h - 1) && corner(w - 1, h - 1))) {
    return { buf, note: name === 'san' ? '' : 'nền đặc, không phải magenta, chưa tách nền' };
  }
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const s = Math.min(r, b) - g; // độ "magenta"
    if (s >= 110) { px[i + 3] = 0; continue; }
    if (s > 50) {
      const k = (110 - s) / 60; // 0..1
      px[i + 3] = Math.round(px[i + 3] * k);
      px[i] = Math.min(r, g + 40); px[i + 2] = Math.min(b, g + 40); // khử viền magenta
    }
  }
  return { buf: encodePng(w, h, px), note: 'đã tách nền magenta thành trong suốt' };
}

// ---------- HTTP ----------
class HttpError extends Error {
  constructor(status, body, where) {
    super(`HTTP ${status} tại ${where}: ${String(body).slice(0, 400)}`);
    this.status = status; this.body = String(body); this.where = where;
  }
}

const isQuotaBody = (b) => /quota|limit|cooldown|exhaust|too many|rate/i.test(b || '');

async function http(cfg, method, pathname, { json, form, raw } = {}) {
  const headers = { Authorization: `Bearer ${cfg.key}` };
  let body;
  if (json !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(json); }
  else if (form) body = form;
  let res;
  try {
    res = await fetch(cfg.url + pathname, { method, headers, body, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (e) {
    const err = new HttpError(0, `${e.name}: ${e.message}${e.cause ? ' / ' + (e.cause.code || e.cause.message) : ''}`, pathname);
    err.network = true; throw err;
  }
  if (raw) return res;
  const text = await res.text();
  if (!res.ok) throw new HttpError(res.status, text, pathname);
  return { text, type: res.headers.get('content-type') || '' };
}

// ---------- chọn mô hình ----------
function pickImageModel(ids, forced) {
  if (forced) return { model: forced, why: 'theo IMAGE_MODEL' };
  const cands = ids.filter((i) => /gpt-image/i.test(i)).map((id) => {
    const m = id.match(/gpt-image-(\d+(?:\.\d+)?)/i);
    const ver = m ? parseFloat(m[1]) : 0;
    const variant = /-(flare|sunburst|mini)/i.test(id) ? 1 : 0; // ưu tiên bản thường
    return { id, score: (variant ? 0 : 1000) + ver * 10 };
  }).sort((a, b) => b.score - a.score);
  if (cands.length) return { model: cands[0].id, why: 'bản gpt-image mới nhất trong danh sách' };
  // CLIProxyAPI chấp nhận gpt-image-* trong handler dù /v1/models không liệt kê; mặc định của nó là gpt-image-2.
  return { model: 'gpt-image-2', why: 'không thấy gpt-image trong /v1/models, dùng mặc định của CLIProxyAPI' };
}

function pickTextModel(ids) {
  const g = ids.filter((i) => /^gpt-/i.test(i) && !/image|audio|realtime|tts|transcribe|embed|search/i.test(i));
  const pref = g.find((i) => /gpt-5\.\d+-mini$/i.test(i)) || g.find((i) => /mini/i.test(i)) || g.find((i) => /^gpt-5/i.test(i)) || g[0];
  return pref || 'gpt-5.4-mini';
}

async function probe(cfg) {
  const t0 = Date.now(); let attempt = 0;
  for (;;) {
    attempt++;
    try {
      const { text } = await http(cfg, 'GET', '/v1/models');
      let j; try { j = JSON.parse(text); } catch { j = {}; }
      const ids = (j.data || j.models || []).map((m) => (typeof m === 'string' ? m : m.id || m.name)).filter(Boolean);
      return ids;
    } catch (e) {
      if (e.status === 401 || e.status === 403) {
        console.error('Khoá API bị từ chối (HTTP ' + e.status + '). Kiểm tra CLIPROXY_API_KEY trong .env.local và mục api-keys của CLIProxyAPI.');
        process.exit(3);
      }
      const retryable = e.network || e.status === 429 || e.status >= 500 || isQuotaBody(e.body) || e.status === 404;
      const left = PROBE_BUDGET_MS - (Date.now() - t0);
      log(`Lần thăm dò ${attempt} thất bại: ${e.message}`);
      if (e.network && await tryStartProxy()) continue;
      if (!retryable || left < 5 * MIN) {
        console.error('Không kết nối được CLIProxyAPI. Hãy kiểm tra CLIProxyAPI đã chạy chưa và CLIPROXY_URL (mặc định http://localhost:8317).');
        process.exit(3);
      }
      log('CLIProxyAPI chưa sẵn sàng hoặc đang hết hạn mức/cooldown. Chờ 5 phút rồi thử lại...');
      await sleep(5 * MIN);
    }
  }
}

// ---------- đọc kết quả ảnh ----------
async function extractImageFromImagesResponse(text) {
  let j; try { j = JSON.parse(text); } catch { throw new Error('Phản hồi không phải JSON: ' + text.slice(0, 200)); }
  const d = (j.data && j.data[0]) || null;
  if (d && d.b64_json) return Buffer.from(d.b64_json, 'base64');
  if (d && d.url) return fetchUrl(d.url);
  throw new Error('Phản hồi không có b64_json/url: ' + text.slice(0, 200));
}

async function fetchUrl(url) {
  if (url.startsWith('data:')) return Buffer.from(url.split(',')[1] || '', 'base64');
  const r = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!r.ok) throw new Error(`Tải ảnh từ url thất bại: HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

function findImageCalls(node, out) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach((n) => findImageCalls(n, out)); return; }
  if (node.type === 'image_generation_call' && typeof node.result === 'string' && node.result.length > 100) out.push(node.result);
  for (const k of Object.keys(node)) if (k !== 'partial_image_b64') findImageCalls(node[k], out);
}

async function extractImageFromResponses(text) {
  const found = [];
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) { try { findImageCalls(JSON.parse(trimmed), found); } catch { /* thử SSE */ } }
  if (!found.length) {
    for (const line of text.split(/\r?\n/)) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try { findImageCalls(JSON.parse(payload), found); } catch { /* bỏ qua */ }
    }
  }
  if (!found.length) throw new Error('Phản hồi /v1/responses không chứa image_generation_call.result: ' + text.slice(0, 200));
  return Buffer.from(found[found.length - 1], 'base64');
}

// ---------- các chiến lược ----------
const STRATEGIES = [
  { id: 'edits', label: '/v1/images/edits (có ảnh tham chiếu)', needsRef: true },
  { id: 'generations', label: '/v1/images/generations (không ảnh tham chiếu)', needsRef: false },
  { id: 'responses', label: '/v1/responses + công cụ image_generation', needsRef: false },
];

async function runStrategy(id, ctx, name, s) {
  const { cfg, st, quality } = ctx;
  const refPath = path.join(REF_DIR, name + '.png');
  const hasRef = fs.existsSync(refPath);
  const transparent = st.transparent;
  const prompt = buildPrompt(ctx.P, name, hasRef && id !== 'generations', transparent);
  if (id === 'edits') {
    const fd = new FormData();
    fd.append('image', new Blob([fs.readFileSync(refPath)], { type: 'image/png' }), name + '.png');
    fd.append('model', st.imageModel);
    fd.append('prompt', prompt);
    fd.append('size', s.size);
    fd.append('quality', quality);
    fd.append('output_format', 'png');
    if (transparent) fd.append('background', 'transparent');
    const { text } = await http(cfg, 'POST', '/v1/images/edits', { form: fd });
    return extractImageFromImagesResponse(text);
  }
  if (id === 'generations') {
    const body = { model: st.imageModel, prompt, size: s.size, quality, output_format: 'png', n: 1 };
    if (transparent) body.background = 'transparent';
    const { text } = await http(cfg, 'POST', '/v1/images/generations', { json: body });
    return extractImageFromImagesResponse(text);
  }
  const tool = { type: 'image_generation', model: st.imageModel, size: s.size, quality, output_format: 'png' };
  if (transparent) tool.background = 'transparent';
  const content = [{ type: 'input_text', text: prompt }];
  if (hasRef) content.push({ type: 'input_image', image_url: 'data:image/png;base64,' + fs.readFileSync(refPath).toString('base64') });
  const body = { model: st.textModel, input: [{ role: 'user', content }], tools: [tool], tool_choice: { type: 'image_generation' }, stream: true };
  const { text } = await http(cfg, 'POST', '/v1/responses', { json: body });
  return extractImageFromResponses(text);
}

const UNSUPPORTED_RE = /not supported|unsupported|unknown model|invalid model|no such model|not found|does not exist|not implemented|no auth|no available|model.*not/i;
const BACKGROUND_RE = /background|transparen/i;

// Thử sinh một sprite; trả về { buf, strategy } hoặc ném lỗi.
async function generateOne(ctx, name) {
  const { st } = ctx; const s = ctx.P.sprites[name];
  const hasRef = fs.existsSync(path.join(REF_DIR, name + '.png'));
  let quotaWaited = 0;
  let lastErr = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const order = st.locked != null ? [st.locked] : STRATEGIES.map((_, i) => i).filter((i) => !st.disabled.has(i));
    if (!order.length) throw new Error('Mọi chiến lược đều không được CLIProxyAPI hỗ trợ. Lỗi cuối: ' + (lastErr ? lastErr.message : '?'));
    let retryNow = false;
    for (const idx of order) {
      const strat = STRATEGIES[idx];
      if (strat.needsRef && !hasRef) { lastErr = new Error(`thiếu ảnh tham chiếu art/reference/${name}.png`); continue; }
      try {
        const buf = await runStrategy(strat.id, ctx, name, s);
        if (st.locked == null) { st.locked = idx; log(`Chiến lược dùng được: ${strat.label}. Các sprite sau sẽ dùng tiếp cách này.`); }
        return { buf, strategy: strat.id };
      } catch (e) {
        lastErr = e;
        const body = e.body || e.message || '';
        if (e.status === 401) { console.error('Khoá API bị từ chối (401). Dừng.'); process.exit(3); }
        if ((e.status === 400 || e.status === 422) && BACKGROUND_RE.test(body) && st.transparent) {
          st.transparent = false;
          log('Mô hình không nhận background=transparent. Chuyển sang nền magenta #FF00FF rồi tự tách nền.');
          retryNow = true; break; // thử lại ngay với cấu hình mới
        }
        if (e.status === 429 || (e.status >= 500) || e.network || (e.status === 200)) { if (st.locked != null) break; continue; }
        if (st.locked == null && e.status >= 400 && (UNSUPPORTED_RE.test(body) || [404, 405, 415, 501].includes(e.status) || e.status === 400 || e.status === 422)) {
          st.disabled.add(idx);
          log(`Chiến lược "${strat.label}" không dùng được (${e.message.slice(0, 160)}). Thử cách tiếp theo.`);
          continue;
        }
        if (st.locked != null) break; // lỗi riêng của sprite này (ví dụ bộ lọc nội dung)
      }
    }
    if (retryNow) { attempt--; continue; }
    if (!lastErr) lastErr = new Error('lỗi không xác định');
    if (attempt === 3) break;
    if (lastErr.status === 429) {
      if (isQuotaBody(lastErr.body) && quotaWaited < PROBE_BUDGET_MS && /quota|cooldown|exhaust|usage_limit|limit_reached/i.test(lastErr.body)) {
        log(`${name}: hết hạn mức/cooldown, chờ 5 phút...`); await sleep(5 * MIN); quotaWaited += 5 * MIN; attempt--; continue;
      }
      log(`${name}: bị giới hạn tốc độ (429), chờ 60 giây (lần ${attempt}/3)...`);
      await sleep(60 * 1000);
    } else {
      const wait = 5000 * 2 ** (attempt - 1);
      log(`${name}: lỗi (${lastErr.message.slice(0, 160)}). Thử lại sau ${wait / 1000} giây (lần ${attempt}/3)...`);
      await sleep(wait);
    }
  }
  throw lastErr;
}

// ---------- chờ đến giờ ----------
async function waitUntil(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const now = new Date();
  const target = new Date(now); target.setHours(h, m, 0, 0);
  if (target <= now) {
    const ago = now - target;
    if (ago < 6 * 60 * MIN) { log(`Đã quá ${hhmm} (${Math.round(ago / MIN)} phút trước), chạy ngay.`); return; }
    target.setDate(target.getDate() + 1);
  }
  log(`Sẽ bắt đầu lúc ${target.toLocaleString('vi-VN', { hour12: false })}.`);
  let lastPrint = 0;
  for (;;) {
    const left = target - Date.now();
    if (left <= 0) break;
    if (Date.now() - lastPrint >= 10 * MIN || lastPrint === 0) {
      lastPrint = Date.now();
      log(`Còn ${Math.floor(left / (60 * MIN))} giờ ${Math.round((left % (60 * MIN)) / MIN)} phút nữa đến ${hhmm}...`);
    }
    await sleep(Math.min(left, 30 * 1000)); // ngủ từng đoạn ngắn để chịu được máy sleep/đổi giờ
  }
  log('Đến giờ, bắt đầu.');
}

// ---------- main ----------
async function main() {
  const opt = parseArgs(process.argv.slice(2));
  if (opt.help) {
    console.log('Dùng: node tools/gen-sprites.mjs [--wait-until HH:MM] [--only a,b,c] [--force] [--concurrency N] [--dry-run] [--quality low|medium|high]');
    return 0;
  }
  const P = JSON.parse(fs.readFileSync(PROMPTS_FILE, 'utf8'));
  const all = Object.keys(P.sprites);
  let names = all;
  if (opt.only) {
    const bad = opt.only.filter((n) => !P.sprites[n]);
    if (bad.length) { console.error('Không có sprite: ' + bad.join(', ')); return 2; }
    names = opt.only;
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const logData = fs.existsSync(LOG_FILE) ? (() => { try { return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')); } catch { return {}; } })() : {};
  const outPath = (n) => path.join(OUT_DIR, n + '.png');
  const todo = names.filter((n) => opt.force || !fs.existsSync(outPath(n)));
  const skipped = names.length - todo.length;

  if (opt.dryRun) {
    console.log(`=== KẾ HOẠCH (dry-run, không gọi mạng) ===`);
    console.log(`Tổng sprite: ${all.length}; được chọn: ${names.length}; cần sinh: ${todo.length}; bỏ qua vì đã có: ${skipped}`);
    console.log(`Chất lượng: ${opt.quality}; song song: ${opt.concurrency}; chờ đến: ${opt.waitUntil || '(không)'}`);
    for (const n of todo) {
      const s = P.sprites[n]; const hasRef = fs.existsSync(path.join(REF_DIR, n + '.png'));
      console.log(`\n--- ${n} | ${s.kind} | ${s.size} | tham chiếu: ${hasRef ? 'có' : 'KHÔNG CÓ (art/reference/' + n + '.png)'}`);
      console.log(buildPrompt(P, n, hasRef, true));
    }
    return 0;
  }

  if (!todo.length) { log('Không có gì để làm: mọi sprite đã có trong art/generated (dùng --force để sinh lại).'); return 0; }

  const cfg = await loadConfig();
  if (!cfg.key) { console.error('Thiếu CLIPROXY_API_KEY. Đặt trong .env.local hoặc biến môi trường.'); return 2; }

  if (opt.waitUntil) await waitUntil(opt.waitUntil);

  log(`Thăm dò ${cfg.url}/v1/models ...`);
  const ids = await probe(cfg);
  log(`Có ${ids.length} mô hình: ${ids.join(', ') || '(trống)'}`);
  const { model, why } = pickImageModel(ids, cfg.imageModel);
  const textModel = pickTextModel(ids);
  log(`Mô hình ảnh: ${model} (${why}). Mô hình văn bản cho /v1/responses: ${textModel}.`);

  const st = { imageModel: model, textModel, transparent: true, locked: null, disabled: new Set() };
  const ctx = { cfg, P, st, quality: opt.quality };
  const results = { ok: [], failed: [] };
  const saveLog = () => fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2));
  let idx = 0; let done = 0;

  async function worker() {
    for (;;) {
      const name = todo[idx++];
      if (!name) return;
      const t0 = Date.now();
      log(`(${++done}/${todo.length}) Đang sinh ${name} [${P.sprites[name].size}] ...`);
      try {
        const r = await generateOne(ctx, name);
        let buf = r.buf; let note = '';
        { const t = ensureTransparent(buf, name); buf = t.buf; note = t.note; }
        fs.writeFileSync(outPath(name), buf);
        const ms = Date.now() - t0;
        logData[name] = { status: 'ok', strategy: r.strategy, model: st.imageModel, ms, error: note || '', time: new Date().toISOString() };
        results.ok.push(name);
        log(`Xong ${name} (${(ms / 1000).toFixed(0)} giây, ${r.strategy})${note ? ' - ' + note : ''}`);
      } catch (e) {
        logData[name] = { status: 'failed', strategy: st.locked != null ? STRATEGIES[st.locked].id : null, model: st.imageModel, ms: Date.now() - t0, error: String(e.message || e).slice(0, 600), time: new Date().toISOString() };
        results.failed.push(name);
        log(`LỖI ${name}: ${String(e.message || e).slice(0, 300)}`);
      }
      saveLog();
    }
  }
  await Promise.all(Array.from({ length: Math.min(opt.concurrency, todo.length) }, worker));
  saveLog();

  console.log('\n=== TỔNG KẾT ===');
  console.log(`Thành công: ${results.ok.length}; thất bại: ${results.failed.length}; bỏ qua (đã có): ${skipped}`);
  if (results.failed.length) {
    console.log('Thất bại: ' + results.failed.join(', '));
    console.log('Chạy lại cùng lệnh để tiếp tục các sprite còn thiếu (chi tiết trong art/generated/_log.json).');
    return 1;
  }
  console.log('Hoàn tất. Ảnh nằm trong art/generated/.');
  return 0;
}

main().then((c) => process.exit(c)).catch((e) => { console.error('Lỗi không mong đợi:', e); process.exit(1); });

/* TimoHouse Phase 1 – helpers dùng chung (namespace TH). Không phụ thuộc DOM trừ download/stripTags. */
window.TH = window.TH || {};
(function (TH) {
  const F = {};
  F.DEMO_TODAY = '2026-09-29';
  F.today = () => (TH.store && TH.store.meta && TH.store.meta.today) || F.DEMO_TODAY;
  F.defaultPeriod = (historical = '2026-09') => TH.store?.dataset && TH.store.dataset !== 'classic' ? TH.store.meta.period : historical;
  F.pad = (n, l = 2) => String(n).padStart(l, '0');
  F.uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  F.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* Tiền VND kiểu Việt Nam: 7.036.256.236 (dấu chấm nhóm nghìn), làm tròn đồng */
  const group = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  F.vnd = (n, opt = {}) => {
    if (n == null || n === '' || isNaN(n)) return '–';
    const r = Math.round(Number(n));
    return (r < 0 ? '-' : '') + group(String(Math.abs(r))) + (opt.unit ? ' ' + opt.unit : '');
  };
  F.vndd = (n) => F.vnd(n) + ' đ';
  F.num0 = (n) => (n == null || isNaN(n)) ? '–' : group(String(Math.round(n)));
  F.dec = (n, d = 2) => (n == null || isNaN(n) || !isFinite(n)) ? '–' : Number(n).toFixed(d).replace('.', ',');
  F.pctv = (v, d = 1) => (v == null || isNaN(v) || !isFinite(v)) ? '–' : (v * 100).toFixed(d).replace('.', ',') + '%';
  F.pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  F.short = (n) => { const a = Math.abs(n); if (a >= 1e9) return (n / 1e9).toFixed(2).replace('.', ',') + ' tỷ'; if (a >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',') + ' tr'; if (a >= 1e3) return Math.round(n / 1e3) + 'k'; return String(Math.round(n)); };
  /* Ngày ISO 'YYYY-MM-DD' */
  F.parseISO = (s) => { if (!s) return null; const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
  F.toISO = (d) => d.getFullYear() + '-' + F.pad(d.getMonth() + 1) + '-' + F.pad(d.getDate());
  F.date = (s) => { if (!s) return '–'; const d = F.parseISO(s); return F.pad(d.getDate()) + '/' + F.pad(d.getMonth() + 1) + '/' + d.getFullYear(); };
  F.dateShort = (s) => { if (!s) return '–'; const d = F.parseISO(s); return F.pad(d.getDate()) + '/' + F.pad(d.getMonth() + 1); };
  F.datetime = (s) => { if (!s) return '–'; const t = s.slice(11, 16); return F.date(s) + (t ? ' ' + t : ''); };
  F.addDays = (s, n) => { const d = F.parseISO(s); d.setDate(d.getDate() + n); return F.toISO(d); };
  F.addMonths = (s, n) => { const d = F.parseISO(s); const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n); const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(day, last)); return F.toISO(d); };
  F.daysBetween = (a, b) => Math.round((F.parseISO(b) - F.parseISO(a)) / 86400000);
  F.daysUntil = (s) => F.daysBetween(F.today(), s);
  /* Kỳ 'YYYY-MM' */
  F.period = (s) => s ? s.slice(0, 7) : '';
  F.periodLabel = (p) => { if (!p) return '–'; const [y, m] = p.split('-'); return 'Tháng ' + Number(m) + '/' + y; };
  F.periodShort = (p) => { if (!p) return '–'; const [y, m] = p.split('-'); return m + '/' + y; };
  F.daysInMonth = (p) => { const [y, m] = p.split('-').map(Number); return new Date(y, m, 0).getDate(); };
  F.prevPeriod = (p) => { const [y, m] = p.split('-').map(Number); return m === 1 ? (y - 1) + '-12' : y + '-' + F.pad(m - 1); };
  F.nextPeriod = (p) => { const [y, m] = p.split('-').map(Number); return m === 12 ? (y + 1) + '-01' : y + '-' + F.pad(m + 1); };
  F.periodEnd = (p) => p + '-' + F.pad(F.daysInMonth(p));
  F.monthsBetween = (a, b) => { const da = F.parseISO(a), db = F.parseISO(b); return (db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth()) - (db.getDate() < da.getDate() ? 1 : 0); };
  F.nowISO = () => F.today() + 'T' + F.pad(new Date().getHours()) + ':' + F.pad(new Date().getMinutes());
  F.initials = (name) => (name || '?').trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(-2).join('').toUpperCase();
  F.num = (v) => { if (typeof v === 'number') return v; const n = Number(String(v == null ? '' : v).replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.-]/g, '')); return isNaN(n) ? 0 : n; };
  F.norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  F.slug = (s) => F.norm(s).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  F.mask = (s, keep = 3) => { s = String(s || ''); return s.length <= keep ? s : '•'.repeat(Math.max(3, s.length - keep)) + s.slice(-keep); };
  /* số tiền bằng chữ */
  const DIG = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  function read3(n, full) {
    const tr = Math.floor(n / 100), ch = Math.floor(n % 100 / 10), dv = n % 10; let s = '';
    if (full || tr > 0) { s += DIG[tr] + ' trăm'; if (ch === 0 && dv > 0) s += ' lẻ'; }
    if (ch > 1) { s += ' ' + DIG[ch] + ' mươi'; if (dv === 1) s += ' mốt'; else if (dv === 5) s += ' lăm'; else if (dv > 0) s += ' ' + DIG[dv]; }
    else if (ch === 1) { s += ' mười'; if (dv === 5) s += ' lăm'; else if (dv > 0) s += ' ' + DIG[dv]; }
    else if (dv > 0) s += ' ' + DIG[dv];
    return s.trim();
  }
  F.words = (n) => {
    n = Math.round(Math.abs(n || 0)); if (n === 0) return 'Không đồng';
    const units = ['', ' nghìn', ' triệu', ' tỷ']; const parts = []; let i = 0;
    while (n > 0) { parts.unshift({ v: n % 1000, u: units[i] }); n = Math.floor(n / 1000); i++; }
    const s = parts.map((p, idx) => p.v === 0 ? '' : read3(p.v, idx > 0) + p.u).filter(Boolean).join(' ').trim();
    return s.charAt(0).toUpperCase() + s.slice(1) + ' đồng';
  };
  F.download = (name, content, type = 'text/csv;charset=utf-8') => {
    const blob = new Blob(['﻿' + content], { type }); const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.hidden = true; a.tabIndex = -1; a.setAttribute('aria-label', 'Tải ' + name);
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  F.csv = (rows, headers) => {
    const q = v => { v = v == null ? '' : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    return [headers.map(q).join(','), ...rows.map(r => r.map(q).join(','))].join('\n');
  };
  F.parseCSV = (text) => {
    const rows = []; let row = [], cell = '', q = false; text = text.replace(/^﻿/, '');
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"') q = true; else if (c === ',' || c === ';' || c === '\t') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.some(c => String(c).trim() !== ''));
  };
  F.hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(16); };
  F.sum = (arr, f) => arr.reduce((s, x) => s + (f ? (f(x) || 0) : (x || 0)), 0);
  F.by = (arr, key) => { const m = {}; arr.forEach(x => { const k = typeof key === 'function' ? key(x) : x[key]; (m[k] = m[k] || []).push(x); }); return m; };
  F.idx = (arr, key = 'id') => { const m = {}; arr.forEach(x => { m[x[key]] = x; }); return m; };
  F.cmp = (a, b) => (a > b ? 1 : a < b ? -1 : 0);
  F.stripTags = (html) => String(html == null ? '' : html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  /* Mã phòng hiển thị = số phòng + mã tòa (501S43); mã tòa T/S/G = tiền tố mã */
  F.groupOf = (bCode) => { const c = String(bCode || '').toUpperCase(); return /^T/.test(c) ? 'T' : /^S/.test(c) ? 'S' : /^G/.test(c) ? 'G' : ''; };
  TH.f = F;
  Object.assign(TH, { esc: F.esc, vnd: F.vnd, fdate: F.date });
})(window.TH);

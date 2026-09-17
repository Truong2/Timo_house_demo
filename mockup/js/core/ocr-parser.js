/* TimoHouse mockup – parser trích xuất hợp đồng theo template "HỢP ĐỒNG CHO THUÊ PHÒNG" (HĐ mới của Linh, 4 trang).
   Đầu vào: text đã đọc từ PDF điền trên máy (pdf.js) hoặc file .txt; ảnh scan chưa hỗ trợ.
   Đầu ra: danh sách field {key,label,value,confidence,group,money,raw,confirmed} + bảng tài sản bàn giao (Điều 2.2). */
window.TH = window.TH || {};
(function (TH) {
  const F = TH.f;
  const P = {};
  /* ---------- Schema: 43 trường, 7 nhóm theo cấu trúc template ---------- */
  P.GROUPS = [['sign', 'Thông tin ký kết', 'file-text'], ['landlord', 'Bên cho thuê (Bên A)', 'landmark'], ['tenant', 'Bên thuê (Bên B)', 'user'], ['room', 'Đối tượng thuê (Điều 1)', 'home'], ['term', 'Thời hạn (Điều 3)', 'calendar'], ['money', 'Giá & thanh toán (Điều 4)', 'coins'], ['services', 'Đơn giá dịch vụ (Điều 4.2)', 'sliders']];
  const D = (key, label, group, type = 'text', o = {}) => Object.assign({ key, label, group, type, req: false, money: false }, o);
  P.FIELDS = [
    D('contractNo', 'Số hợp đồng', 'sign'), D('signDate', 'Ngày ký', 'sign', 'date'), D('signPlace', 'Địa điểm ký', 'sign'),
    D('landlordName', 'Đại diện chủ nhà', 'landlord'), D('landlordId', 'CCCD bên A', 'landlord'), D('landlordIdPlace', 'Nơi cấp (bên A)', 'landlord'), D('landlordAddress', 'Hộ khẩu bên A', 'landlord', 'textarea'), D('landlordPhone', 'SĐT bên A', 'landlord'),
    D('tenantName', 'Họ tên đầy đủ', 'tenant', 'text', { req: true }), D('dob', 'Ngày sinh', 'tenant', 'date'), D('phone', 'Số điện thoại', 'tenant', 'text', { req: true }), D('idNumber', 'Số CCCD', 'tenant', 'text', { req: true }), D('idPlace', 'Nơi cấp (bên B)', 'tenant'), D('address', 'Hộ khẩu thường trú', 'tenant', 'textarea'),
    D('buildingName', 'Tòa nhà', 'room', 'select', { req: true }), D('roomCode', 'Phòng số', 'room', 'select', { req: true }), D('occupants', 'Số người ở', 'room', 'number'), D('maxOccupants', 'Số người tối đa', 'room', 'number'), D('vehicleCount', 'Số xe', 'room', 'number'),
    D('handoverDate', 'Ngày giao nhận phòng', 'term', 'date'), D('billingStart', 'Ngày tính tiền phòng', 'term', 'date'), D('start', 'Từ ngày', 'term', 'date', { req: true }), D('end', 'Đến ngày', 'term', 'date', { req: true }), D('months', 'Thời hạn (tháng)', 'term', 'readonly'), D('noticeDate', 'Hạn báo chấm dứt', 'term', 'date'),
    D('price', 'Giá thuê/tháng (VND)', 'money', 'money', { req: true, money: true }), D('priceWords', 'Bằng chữ (giá thuê)', 'money'), D('paidBefore', 'Đã thanh toán trước khi ký (VND)', 'money', 'money', { money: true }), D('paidAtSign', 'Đóng thêm khi ký (VND)', 'money', 'money', { money: true }), D('elecIndex', 'Số điện', 'money', 'number'), D('waterIndex', 'Số nước', 'money', 'number'), D('deposit', 'Tiền đặt cọc (VND)', 'money', 'money', { req: true, money: true }), D('depositWords', 'Bằng chữ (tiền cọc)', 'money'), D('payDay', 'Ngày thanh toán', 'money', 'select', { req: true }), D('bankAccount', 'Tài khoản nhận', 'money'), D('transferNote', 'Nội dung chuyển khoản', 'money'), D('note', 'Ghi chú', 'money'),
    D('svc_internet', 'Internet (đ/tháng)', 'services', 'money', { money: true }), D('svc_electric', 'Điện (đ/số)', 'services', 'money', { money: true }), D('svc_water', 'Nước (đ/người)', 'services', 'money', { money: true }), D('svc_common', 'Dịch vụ chung (đ/người)', 'services', 'money', { money: true }), D('svc_ebike', 'Xe đạp điện (đ/xe)', 'services', 'money', { money: true }), D('svc_evcar', 'Xe điện xanh SM (đ/xe)', 'services', 'money', { money: true }),
  ];
  P.field = (key) => P.FIELDS.find(f => f.key === key);
  P.CONFIRM_AT = 0.8;
  /* Danh mục tài sản bàn giao theo template (Điều 2.2) */
  P.ASSETS = { furniture: ['Giường', 'Tủ quần áo', 'Chăn ga gối', 'Đệm', 'Rèm', 'Bàn', 'Ghế', 'Kệ bếp, chậu rửa', 'Tủ bếp trên, dưới', 'Cửa nhà vệ sinh', 'Cửa ra vào', 'Cửa ban công', 'Cửa sổ', 'Tường', 'Đồ décor'], device: ['Điều hòa và điều khiển', 'Bình nóng lạnh', 'Máy giặt', 'Máy hút mùi', 'Tủ lạnh', 'Thiết bị mạng', 'Quạt trần', 'Bóng điện', 'Ổ cắm điện', 'Bồn rửa mặt', 'Gương', 'Vòi sen, vòi xịt, bồn cầu', 'Công tơ điện', 'Đồng hồ nước', 'Chìa khóa phòng, cổng'] };

  /* ---------- Helpers ---------- */
  const BLANK = /^[\s.…_:\-–]*$/;                       // chỗ chấm chưa điền
  const clean = (s) => String(s == null ? '' : s).replace(/[…]+/g, ' ').replace(/\.{3,}/g, ' ').replace(/\s+/g, ' ').replace(/^[\s.:\-–]+|[\s.:\-–,]+$/g, '').trim();
  const isBlank = (s) => BLANK.test(String(s == null ? '' : s).replace(/[…]/g, '.'));
  const val = (m, i = 1) => { if (!m) return ''; const v = clean(m[i]); return isBlank(v) ? '' : v; };
  P.normalize = (text) => String(text || '').normalize('NFC').replace(/\r/g, '').replace(/\f\s*\d{1,2}\s*(?=\n)/g, '\f').replace(/[ \t ]+/g, ' ');
  const flat = (text) => text.replace(/[\f\n]+/g, ' ').replace(/\s+/g, ' ');
  const block = (t, from, to) => { const a = t.search(from); if (a < 0) return ''; const rest = t.slice(a); const b = to ? rest.search(to) : -1; return b > 0 ? rest.slice(0, b) : rest; };
  const rx = (t, re, i = 1) => val(t.match(re), i);
  /* ngày: dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy, "ngày d tháng m năm y" → trả 'dd/mm/yyyy' hoặc '' */
  P.parseDate = (s) => { s = clean(s); if (!s) return ''; let m = s.match(/(\d{1,2})\s*[\/.\-]\s*(\d{1,2})\s*[\/.\-]\s*(\d{4})/); if (!m) m = s.match(/(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i); if (!m) return ''; const d = Number(m[1]), mo = Number(m[2]), y = Number(m[3]); if (d < 1 || d > 31 || mo < 1 || mo > 12) return ''; return F.pad(d) + '/' + F.pad(mo) + '/' + y; };
  const isoOf = (vn) => F.fromVN(vn);
  /* tiền: "6.500.000đ", "6,500,000", "6.5 triệu", "6tr5" → số */
  P.parseMoney = (s) => { s = clean(s).toLowerCase(); if (!s) return 0; let m = s.match(/([\d.,]+)\s*(triệu|tr)\b\s*(\d)?/); if (m) { const base = Number(m[1].replace(/,/g, '.')); return Math.round(base * 1e6 + (m[3] ? Number(m[3]) * 1e5 : 0)); } m = s.match(/\d[\d.,\s]*/); if (!m) return 0; return F.num(m[0].replace(/[.,\s]/g, '')); };
  const digits = (s) => clean(s).replace(/\D/g, '');
  const noDiacritics = (s) => s === F.norm(s).toUpperCase() || s === s.toUpperCase() && /^[A-Z\s]+$/.test(s);

  /* ---------- Trích xuất ---------- */
  P.parse = (text) => {
    const raw = P.normalize(text); const t = flat(raw); const out = {}; const conf = {};
    const set = (k, v, c) => { out[k] = v == null ? '' : String(v); conf[k] = v === '' || v == null ? 0 : c; };
    /* Ký kết */
    set('contractNo', rx(t, /HĐ số\s*:\s*(.*?)\s*(?=Hôm nay)/i), 0.95);
    const sd = t.match(/Hôm nay,?\s*ngày\s*(.*?)\s*tháng\s*(.*?)\s*năm\s*(.*?)\s*(?=Tại địa chỉ)/i);
    const sdv = sd ? P.parseDate([digits(sd[1]), digits(sd[2]), digits(sd[3])].every(Boolean) ? digits(sd[1]) + '/' + digits(sd[2]) + '/' + digits(sd[3]) : '') : '';
    set('signDate', sdv, 0.95); if (sd && !sdv && !isBlank(sd[1] + sd[2] + sd[3])) { out.signDate = clean(sd[0].replace(/Hôm nay,?/i, '')); conf.signDate = 0.5; }
    set('signPlace', rx(t, /Tại địa chỉ\s*:\s*(.*?)\s*(?=Chúng tôi gồm)/i), 0.95);
    /* Bên A */
    const A = block(t, /BÊN A\s*\)/i, /(\d\s*\.\s*)?BÊN THUÊ PHÒNG|BÊN B\s*\)/i);
    set('landlordName', rx(A, /\(Ông\/Bà\)\s*:\s*(.*?)\s*(?=-?\s*Số CMT)/i), 0.95);
    const lid = digits(rx(A, /Số CMT\/CCCD\s*:\s*(.*?)\s*(?=Nơi cấp)/i)); set('landlordId', lid, /^\d{12}$/.test(lid) ? 0.95 : lid ? 0.6 : 0);
    set('landlordIdPlace', rx(A, /Nơi cấp\s*:\s*(.*?)\s*(?=-\s*Hộ khẩu)/i), 0.95);
    set('landlordAddress', rx(A, /Hộ khẩu thường trú\s*:\s*(.*?)\s*(?=-\s*SĐT)/i), 0.95);
    const lph = digits(rx(A, /SĐT\s*:\s*(.*?)\s*$/i)); set('landlordPhone', lph, /^0\d{9}$/.test(lph) ? 0.95 : lph ? 0.6 : 0);
    /* Bên B */
    const B = block(t, /BÊN B\s*\)/i, /ĐIỀU 1/i);
    const tn = rx(B, /Họ tên đầy đủ\s*:\s*(.*?)\s*(?=Ngày sinh)/i); set('tenantName', tn, tn && noDiacritics(tn) ? 0.6 : 0.95);
    set('dob', P.parseDate(rx(B, /Ngày sinh\s*:?\s*(.*?)\s*(?=-\s*Các số điện thoại)/i)), 0.95);
    const phones = rx(B, /Các số điện thoại đang dùng\s*:\s*(.*?)\s*(?=-\s*Số CCCD)/i).split(/[,;\/]|\s{2,}|\s(?=0\d{2,3}\s?\d)/).map(digits).filter(Boolean);
    set('phone', phones[0] || '', /^0\d{9}$/.test(phones[0] || '') ? 0.95 : phones[0] ? 0.55 : 0);
    const tid = digits(rx(B, /Số CCCD\s*:\s*(.*?)\s*(?=Nơi cấp)/i)); set('idNumber', tid, /^\d{12}$/.test(tid) ? 0.95 : tid ? 0.6 : 0);
    set('idPlace', rx(B, /Nơi cấp\s*:\s*(.*?)\s*(?=-\s*Hộ khẩu)/i), 0.95);
    set('address', rx(B, /Hộ khẩu thường trú\s*\(ghi chi ti[êế]t\)\s*:\s*(.*?)\s*$/i), 0.95);
    /* Điều 1 */
    const E1 = block(t, /ĐIỀU 1/i, /ĐIỀU 2/i);
    /* "P302 - Tòa TH01" / "302, tòa A" / "A.03.02" → mã phòng + gợi ý tòa */
    const roomRaw = rx(E1, /thuê phòng số\s*:\s*(.*?)\s*(?=1\.2)/i); const rs = P.splitRoomRef(roomRaw);
    set('roomCode', rs.room, 0.95); const buildingHint = rs.building;
    const occ = digits(rx(E1, /Số lượng\s*:\s*(.*?)\s*người/i)); set('occupants', occ, 0.95);
    const mx = digits(rx(E1, /Số người tối đa là\s*(.*?)\s*người/i)); set('maxOccupants', mx, 0.95);
    const vc = rx(E1, /Số xe\s*:\s*(.*?)\s*$/i); set('vehicleCount', vc ? (digits(vc) || '1') : '', 0.9);
    /* Điều 3 */
    const E3 = block(t, /ĐIỀU 3/i, /ĐIỀU 4/i);
    set('handoverDate', P.parseDate(rx(E3, /3\.1\..*?là ngày\s*(.*?)\s*(?=3\.2)/i)), 0.95);
    set('billingStart', P.parseDate(rx(E3, /3\.2\..*?là ngày\s*(.*?)\s*(?=3\.3)/i)), 0.95);
    const mo = digits(rx(E3, /Thời hạn hợp đồng là\s*:?\s*(\d+)\s*tháng/i)); set('months', mo, 0.9);
    const stR = rx(E3, /tính từ ngày\s*(.*?)\s*(?=đến ngày)/i), enR = rx(E3, /đến ngày\s*(.*?)\s*(?=3\.4)/i);
    const st = P.parseDate(stR), en = P.parseDate(enR);
    set('start', st, 0.95); if (stR && !st) { out.start = stR; conf.start = 0.5; }
    set('end', en, 0.95); if (enR && !en) { out.end = enR; conf.end = 0.5; }
    if (st && en) { const diff = isoOf(en) > isoOf(st) ? F.monthsDiff(isoOf(st), isoOf(en)) : -1; if (diff < 1) conf.end = 0.5; else if (mo && Number(mo) !== diff) conf.end = 0.6; if (!mo) set('months', String(Math.max(diff, 0)), 0.85); }
    set('noticeDate', P.parseDate(rx(E3, /vào trước ngày\s*(.*?)\s*(?=Qua ngày trên)/i)), 0.95);
    /* Điều 4 */
    const E4 = block(t, /ĐIỀU 4/i, /ĐIỀU 5/i);
    const prR = rx(E4, /Giá cho thuê phòng là\s*:\s*(.*?)\s*\/\s*tháng/i); const pr = P.parseMoney(prR);
    set('price', pr ? String(pr) : (prR || ''), pr >= 100000 ? 0.95 : prR ? 0.5 : 0);
    const prW = rx(E4, /\/\s*tháng\s*\(Bằng chữ\s*:\s*(.*?)\)/i); set('priceWords', prW, 0.9);
    if (pr && prW && !P.wordsMatch(prW, pr)) conf.price = Math.min(conf.price, 0.7);
    const pb = rx(E4, /đã thanh toán trước khi ký hợp đồng\s*:\s*(.*?)\s*(?=-\s*Số tiền đóng thêm)/i); set('paidBefore', pb ? String(P.parseMoney(pb)) : '', 0.9);
    const pa = rx(E4, /đóng thêm vào thời điểm ký hợp đồng\s*:\s*(.*?)\s*(?=4\.2)/i); set('paidAtSign', pa ? String(P.parseMoney(pa)) : '', 0.9);
    set('elecIndex', digits(rx(E4, /Số điện\s*:\s*(.*?)\s*(?=Số nước)/i)), 0.9);
    set('waterIndex', digits(rx(E4, /Số nước\s*:\s*(.*?)\s*(?=4\.3|Internet|Điện\s*:)/i)), 0.9);
    const dpR = rx(E4, /01 tháng tiền nhà\s*:\s*(.*?)\s*\(Bằng chữ/i); const dp = P.parseMoney(dpR);
    set('deposit', dp ? String(dp) : (dpR || ''), dp >= 100000 ? 0.95 : dpR ? 0.5 : 0);
    if (dp && pr && dp !== pr) conf.deposit = 0.6;  // template: cọc = 01 tháng tiền nhà
    set('depositWords', rx(E4, /tiền nhà\s*:.*?\(Bằng chữ\s*:\s*(.*?)\)/i), 0.9);
    const pd = rx(E4, /Vào ngày\s*(\d{1,2})\s*hàng tháng/i); set('payDay', pd ? F.pad(Number(pd)) : '25', pd ? 0.95 : 0.85);
    set('bankAccount', rx(E4, /Ngân hàng\s*(.*?)\s*(?=Nếu Bên B chuyển)/i), 0.95);
    set('transferNote', rx(t, /Nội dung chuyển khoản\s*:\s*(?:Phòng\s*\+\s*Tòa)?\s*(.*?)\s*(?=4\.4\.4)/i), 0.9);
    set('note', '', 1); conf.note = 1;
    /* Đơn giá dịch vụ (bảng 4.2, vị trí trong text có thể lệch trang) */
    const svc = (re) => { const m = t.match(re); return m ? P.parseMoney(m[1]) : 0; };
    const S = { svc_internet: /Internet\s*:?\s*([\d.,]+)\s*đ?\s*\/\s*tháng/i, svc_electric: /Điện\s*:?\s*([\d.,]+)\s*đ?\s*\/\s*số/i, svc_water: /Nước\s*:?\s*([\d.,]+)\s*đ?\s*\/\s*người/i, svc_common: /Dịch vụ chung[\s\S]{0,90}?([\d.,]+)\s*đ?\s*\/\s*người/i, svc_ebike: /Xe đạp điện\s*:?\s*([\d.,]+)\s*đ?\s*\/\s*xe/i, svc_evcar: /xanh SM\s*:?\s*([\d.,]+)\s*đ?\s*\/\s*xe/i };
    Object.keys(S).forEach(k => { const v = svc(S[k]); set(k, v ? String(v) : '', 0.92); });
    /* Suy diễn tòa nhà từ gợi ý sau mã phòng / nội dung chuyển khoản; khớp phòng chính xác hoặc theo số */
    const bld = P.guessBuilding([buildingHint, out.transferNote, out.roomCode].filter(Boolean).join(' '));
    set('buildingName', bld ? bld.name : '', 0.85);
    if (out.roomCode && TH.store && TH.store.state) { const rm = P.matchRoom(out.roomCode, bld ? bld.id : null); if (!rm) conf.roomCode = Math.min(conf.roomCode, 0.5); else if (rm.code !== out.roomCode) conf.roomCode = Math.min(conf.roomCode, 0.75); }
    /* Kết quả */
    const fields = P.FIELDS.map(d => { const value = out[d.key] == null ? '' : out[d.key]; const confidence = Math.round((conf[d.key] || 0) * 100) / 100; return { key: d.key, label: d.label, value, confidence, group: d.group, money: !!d.money, raw: value, confirmed: confidence >= P.CONFIRM_AT }; });
    const assets = P.parseAssets(raw);
    const found = fields.filter(f => f.value !== '').length;
    return { fields, assets, buildingHint, meta: { found, total: fields.length, pending: fields.filter(f => !f.confirmed).length, roomRaw } };
  };
  /* "P302 - Tòa TH01" → { room:'P302', building:'TH01' }; "302, tòa A" → { room:'302', building:'A' }; "A.03.02" → { room:'A.03.02', building:'' } */
  P.splitRoomRef = (s) => { s = clean(s); if (!s) return { room: '', building: '' }; let m = s.match(/^(.*?)\s*(?:[-–,]|\s)\s*(?:tòa|toà|building)\s*:?\s*(.+)$/i); if (m) return { room: clean(m[1].replace(/^phòng\s*/i, '')), building: clean(m[2]) }; m = s.match(/^(.*?)\s*[-–,]\s*(.+)$/); if (m && /\d/.test(m[1]) && !/\d[.\-]\d/.test(s)) return { room: clean(m[1]), building: clean(m[2]) }; return { room: s.replace(/^phòng\s*/i, ''), building: '' }; };
  /* so sánh "bằng chữ" với số: bỏ đuôi "một tháng", "/tháng", dấu câu */
  P.wordsMatch = (words, n) => { const norm = (x) => F.norm(x).replace(/\b(mot thang|moi thang|\/ ?thang|chan|\.|,)\b/g, '').replace(/[^a-z]/g, ''); return norm(words) === norm(F.words(n)); };
  P.guessBuilding = (hint) => { if (!hint || !TH.store || !TH.store.state) return null; const h = F.norm(hint); const toks = h.split(/[^a-z0-9]+/).filter(Boolean); const bs = TH.store.where('buildings', b => !b.stub); const codeToks = (b) => F.norm(b.code || '').split(/[^a-z0-9]+/).filter(Boolean); return bs.find(b => h.includes(F.norm(b.name))) || bs.find(b => b.code && (toks.includes(F.norm(b.code)) || toks.includes(codeToks(b).join('')))) || bs.find(b => { const ct = codeToks(b); return ct.length > 1 && ct.every(x => toks.includes(x)); }) || bs.find(b => b.prefix && new RegExp('(^|[^a-z0-9])' + F.norm(b.prefix) + '[.\\-]?\\d').test(h)) || null; };
  /* Khớp phòng: chính xác theo mã, nếu không thì theo chuỗi số cuối (302 ↔ A.03.02 / P302 / 302) trong tòa đã chọn (hoặc mọi tòa) */
  P.matchRoom = (code, buildingId) => { if (!code || !TH.store || !TH.store.state) return null; const rooms = TH.store.where('rooms', r => !buildingId || r.buildingId === buildingId); const nc = F.norm(code).replace(/[^a-z0-9]/g, ''); let r = rooms.find(x => F.norm(x.code).replace(/[^a-z0-9]/g, '') === nc); if (r) return r; const num = (code.match(/\d+/g) || []).join(''); if (!num || num.length < 2) return null; const cand = rooms.filter(x => (x.code.match(/\d+/g) || []).join('').replace(/^0+/, '') === num.replace(/^0+/, '')); if (cand.length === 1) return cand[0]; if (cand.length > 1 && buildingId) return cand[0]; return null; };
  /* Tổng hợp thực thể từ một bản trích xuất – dùng chung cho card Kết quả, guard tạo HĐ và prefill wizard */
  P.entities = (o) => {
    const St = TH.store; const v = (k) => { const f = (o.fields || []).find(x => x.key === k); return f ? f.value : ''; }; const ph = (s) => String(s || '').replace(/\D/g, '');
    const tenantData = { name: v('tenantName'), phone: v('phone'), idNumber: v('idNumber'), idPlace: v('idPlace'), dob: v('dob'), address: v('address') };
    let match = null, matchBy = null;
    if (St && St.state) { if (o.tenantId && St.get('tenants', o.tenantId)) { match = St.get('tenants', o.tenantId); matchBy = 'chọn'; } else if (ph(tenantData.phone)) { match = St.one('tenants', t => ph(t.phone) === ph(tenantData.phone)); matchBy = match ? 'SĐT' : null; } if (!match && ph(tenantData.idNumber)) { match = St.one('tenants', t => ph(t.idNumber) === ph(tenantData.idNumber)); matchBy = match ? 'CCCD' : null; } if (!match && tenantData.name) { match = St.one('tenants', t => F.norm(t.name) === F.norm(tenantData.name)); matchBy = match ? 'tên' : null; } }
    const weak = !!match && matchBy === 'tên';  // trùng tên nhưng khác SĐT/CCCD → chỉ gợi ý, mặc định tạo khách mới
    const missing = match && !weak ? ['idNumber', 'idPlace', 'dob', 'address'].filter(k => !match[k] && tenantData[k]) : [];
    const bMatch = St && St.state ? (St.one('buildings', b => b.name === v('buildingName')) || P.guessBuilding([o.buildingHint, v('transferNote')].filter(Boolean).join(' '))) : null;
    const room = { code: v('roomCode'), match: null, suggested: null }; if (St && St.state && room.code) { const rm = P.matchRoom(room.code, bMatch ? bMatch.id : null); if (rm && F.norm(rm.code).replace(/[^a-z0-9]/g, '') === F.norm(room.code).replace(/[^a-z0-9]/g, '')) room.match = rm; else room.suggested = rm; }
    const svc = [['svc_internet', 'Internet', 'tháng'], ['svc_electric', 'Điện', 'số'], ['svc_water', 'Nước', 'người'], ['svc_common', 'Dịch vụ chung', 'người'], ['svc_ebike', 'Xe đạp điện', 'xe'], ['svc_evcar', 'Xe điện xanh SM', 'xe']].map(([k, label, unit]) => ({ key: k, label, unit, price: Number(v(k)) || 0 })).filter(s => s.price > 0);
    const n = (k) => Number(v(k)) || 0;
    return { tenant: { data: tenantData, match, matchBy, weak, missing }, building: { hint: o.buildingHint || '', name: v('buildingName'), match: bMatch }, room, contract: { contractNo: v('contractNo'), signDate: v('signDate'), start: v('start'), end: v('end'), months: v('months'), price: n('price'), deposit: n('deposit'), paidBefore: n('paidBefore'), paidAtSign: n('paidAtSign'), payDay: v('payDay'), noticeDate: v('noticeDate'), occupants: v('occupants'), bankAccount: v('bankAccount'), transferNote: v('transferNote') }, services: svc, vehicles: Math.max(0, Math.min(10, n('vehicleCount'))), assets: o.assets || [] };
  };
  /* Bảng tài sản Điều 2.2 – nhận diện theo tên chuẩn của template ở bất kỳ layout nào (mỗi ô một dòng hoặc cả hàng một dòng); text giữa hai tên là số lượng/tình trạng của tên đứng trước */
  P.parseAssets = (raw) => {
    const region = block(raw, /Tên nội thất/i, /ĐIỀU 3/i); if (!region) return [];
    const nr = F.norm(region); const names = [].concat(P.ASSETS.furniture.map(n => [n, 'furniture']), P.ASSETS.device.map(n => [n, 'device'])).sort((a, b) => b[0].length - a[0].length);
    const taken = []; const hits = [];
    names.forEach(([name, kind]) => { const key = F.norm(name); let i = 0; while ((i = nr.indexOf(key, i)) >= 0) { const end = i + key.length; const before = i === 0 ? ' ' : nr[i - 1], after = nr[end] || ' '; const ok = /[\s:|]/.test(before) && /[\s:,.|]/.test(after) && !taken.some(([a, b]) => i < b && end > a); if (ok) { taken.push([i, end]); hits.push({ name, kind, pos: i, end }); } i = end; } });
    hits.sort((a, b) => a.pos - b.pos);
    const COND = /(bình thường|sạch|tốt|mới|cũ|hỏng|hư|bẩn|trầy|xước|thiếu|không có)/gi;
    return hits.map((h, i) => { const rest = region.slice(h.end, i + 1 < hits.length ? hits[i + 1].pos : undefined).replace(/(Số|lượng|Tình trạng|Tên thiết bị|Tên nội thất)/gi, ' '); const q = rest.match(/(?:^|[\s:])(\d+)\s*(bộ|cái|chiếc|đôi)?(?=\s|$)/i); const conds = (rest.match(COND) || []).map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()); const desc = clean(rest.replace(COND, ' ').replace(q ? q[0] : '', ' ').replace(/[\d\f]/g, ' ')); return { name: h.name, kind: h.kind, qty: q ? q[1] + (q[2] ? ' ' + q[2] : '') : '', condition: conds.join(' '), desc: desc.length <= 60 ? desc : '' }; });
  };

  /* ---------- Đọc file trong trình duyệt ---------- */
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  let pdfjsReady = null;
  P.loadPdfjs = () => { if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib); if (pdfjsReady) return pdfjsReady; pdfjsReady = new Promise((res, rej) => { const s = document.createElement('script'); s.src = PDFJS + 'pdf.min.js'; const to = setTimeout(() => { pdfjsReady = null; rej(new Error('Không tải được pdf.js (quá 15 giây) – kiểm tra kết nối hoặc dùng file .txt')); }, 15000); s.onload = () => { clearTimeout(to); window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; res(window.pdfjsLib); }; s.onerror = () => { clearTimeout(to); pdfjsReady = null; rej(new Error('Không tải được pdf.js – kiểm tra kết nối hoặc dùng file .txt')); }; document.head.appendChild(s); }); return pdfjsReady; };
  /* pdf.js tách dấu thanh tiếng Việt và chữ số thành item riêng ("C Ộ NG", "0273 03005504") → ghép theo tọa độ: cùng dòng và khoảng cách < 0.22 cỡ chữ thì nối liền, ngược lại chèn space; đổi dòng khi y thay đổi */
  P.joinTextItems = (items) => { let s = '', px = null, py = null; items.forEach(it => { if (!it.str) { if (it.hasEOL) { s += '\n'; px = null; } return; } const x = it.transform[4], y = it.transform[5], h = Math.abs(it.transform[3]) || it.height || 10; if (px !== null) { const sameLine = Math.abs(y - py) < Math.max(2, h * 0.5); if (!sameLine) s += '\n'; else { const gap = x - px; s += gap < h * 0.22 && !/\s$/.test(s) && !/^\s/.test(it.str) ? '' : ' '; } } s += it.str; px = x + (it.width || 0); py = y; if (it.hasEOL) { s += '\n'; px = null; } }); return s; };
  P.extractPdfText = async (file) => { const lib = await P.loadPdfjs(); const data = await file.arrayBuffer(); const doc = await lib.getDocument({ data }).promise; const parts = []; for (let i = 1; i <= doc.numPages; i++) { const page = await doc.getPage(i); const tc = await page.getTextContent(); parts.push(P.joinTextItems(tc.items)); } return { text: parts.join('\n\f'), pages: doc.numPages }; };
  P.readFile = (file) => { const name = String(file.name || ''); if (/\.txt$/i.test(name)) return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res({ text: String(r.result || '').replace(/^﻿/, ''), pages: 4 }); r.onerror = () => rej(new Error('Không đọc được file')); r.readAsText(file, 'utf-8'); }); if (/\.pdf$/i.test(name)) return P.extractPdfText(file); if (/\.(jpe?g|png)$/i.test(name)) return Promise.reject(new Error('Ảnh scan chưa hỗ trợ trong mockup – tải PDF điền trên máy hoặc file .txt')); return Promise.reject(new Error('Chỉ nhận PDF hoặc .txt')); };
  TH.ocrParser = P;
})(window.TH);

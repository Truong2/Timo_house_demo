/* Kho tài liệu (UI-26) và OCR hợp đồng khách (UI-08 mở rộng; đặc tả dòng 168–173, 371–374, DEC-07, E05/E06).
   Tài liệu: sửa = tải phiên bản mới; tài liệu gắn giao dịch không xóa được; chỉ xem tài liệu của tòa trong phạm vi.
   OCR: mô phỏng trong mockup (không gọi dịch vụ ngoài) – trường đọc từ dữ liệu lượt thuê, có nhiễu cố định để minh họa ca sai/thiếu (E05) và đã rà (E06).
   "Áp dụng" chỉ khi đủ trường bắt buộc và đã rà mọi nhóm; tạo phiên biểu phí mới qua addRateVersion – không ghi vào hóa đơn. Chạy lại = phiên mới. */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, A = TH.auth;
  const fail = (fields, msg = 'Dữ liệu chưa hợp lệ') => { const e = new Error(msg); e.fields = fields; throw e; };
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h >>> 0; };
  Q.DOC_TYPES = [['red_book', 'Sổ đỏ'], ['owner_contract', 'HĐ chủ nhà'], ['tenant_contract', 'HĐ khách'], ['appendix', 'Phụ lục'], ['handover', 'Biên bản bàn giao'], ['voucher', 'Phiếu thu / chi'], ['meter_photo', 'Ảnh chỉ số'], ['asset', 'Tài sản'], ['other', 'Khác']];
  Q.OBJ_TYPES = { building: 'Tòa', room: 'Phòng', stay: 'Lượt thuê / khách', ownerContract: 'HĐ chủ nhà', invoice: 'Hóa đơn', payment: 'Phiếu thu', refund: 'Phiếu hoàn', expense: 'Chứng từ chi' };
  const LINKED = ['stay', 'ownerContract', 'invoice', 'payment', 'refund', 'expense'];
  /* Toàn bộ tài liệu = kho tài liệu + file HĐ khách của lượt thuê (UI-07) */
  /* Tải xuống (mô phỏng): kiểm quyền + phạm vi, ghi nhật ký */
  X.downloadDocument = (id) => {
    _.need('documents.view');
    const d = Q.documentsAll().find(x => x.id === id); if (!d || d.status === 'deleted') throw new Error('Không tìm thấy tài liệu (đã xóa)');
    if (!A.inScope(d.buildingId)) throw new Error('Tòa ngoài phạm vi được giao');
    _.audit('download', 'document', id, 'Tải xuống ' + d.name); _.done(); return d;
  };
  Q.documentsAll = () => [...S.all('documents'), ...S.all('contractFiles').map(f => { const s = Q.stay(f.stayId) || {}; const newer = S.one('contractFiles', x => x.stayId === f.stayId && (x.version || 1) > (f.version || 1)); return { id: 'cf:' + f.id, fileId: f.id, source: 'contractFile', type: 'tenant_contract', name: f.name, size: f.size, objectType: 'stay', objectId: f.stayId, buildingId: s.buildingId, roomId: s.roomId, version: f.version || 1, validTo: s.endDate, uploadedBy: f.uploadedBy, uploadedAt: f.uploadedAt, status: newer ? 'superseded' : 'current', ocrStatus: Q.ocrStatusOf ? Q.ocrStatusOf(f.id) : null }; })];
  Q.documentsScoped = () => Q.scoped(Q.documentsAll()).filter(d => d.status !== 'deleted');
  Q.docObjectHref = (d) => ({ stay: '#/stays/' + d.objectId, ownerContract: '#/owners/' + d.objectId, building: '#/buildings/' + d.objectId, invoice: '#/billing/invoices/' + d.objectId, refund: '#/refunds/' + d.objectId, payment: '#/billing/receipts/' + d.objectId })[d.objectType] || null;

  X.uploadDocument = (d) => {
    _.need('documents.upload');
    const errs = {};
    const old = d.replaceId ? S.get('documents', d.replaceId) : null;
    if (d.replaceId && (!old || old.status !== 'current')) throw new Error('Chỉ tải phiên bản mới cho tài liệu đang hiện hành');
    const type = old ? old.type : d.type; const bid = old ? old.buildingId : d.buildingId;
    if (!Q.DOC_TYPES.some(x => x[0] === type)) errs.type = 'Chọn loại tài liệu';
    if (!Q.building(bid)) errs.buildingId = 'Chọn tòa';
    else if (!A.inScope(bid)) errs.buildingId = 'Tòa ngoài phạm vi được giao';
    if (!String(d.name || '').trim()) errs.name = 'Chọn file';
    else { try { _.checkFile(d.name); } catch (e) { errs.name = e.message; } }
    if (!old && d.objectType === 'stay') { const st = Q.stay(d.objectId); if (!st || st.buildingId !== bid) errs.objectId = 'Nhập mã khách / lượt thuê / phòng đang ở thuộc tòa'; }
    if (!old && d.objectType === 'payment') { const py = S.get('payments', d.objectId); if (!py || (py.buildingId && py.buildingId !== bid)) errs.objectId = 'Nhập mã phiếu thu của tòa'; }
    // B17: gắn phòng / chứng từ chi phải trỏ đúng đối tượng thuộc tòa
    if (!old && d.objectType === 'room') { const rm = Q.room(d.roomId); if (!rm || rm.buildingId !== bid) errs.roomId = 'Chọn phòng thuộc tòa'; }
    if (!old && d.objectType === 'expense') { const ex = S.get('expenses', d.objectId); if (!ex || (ex.buildingId && ex.buildingId !== bid)) errs.objectId = 'Nhập mã chứng từ chi của tòa'; }
    if (Object.keys(errs).length) fail(errs);
    if (old) S.update('documents', old.id, { status: 'superseded', supersededAt: F.nowISO() });
    const doc = S.add('documents', { code: S.nextCode('documents', 'TL-'), type, name: d.name, size: Number(d.size) || 0, objectType: old ? old.objectType : d.objectType || 'building', objectId: old ? old.objectId : d.objectType === 'room' ? d.roomId : d.objectId || bid,
      buildingId: bid, roomId: old ? old.roomId : d.objectType === 'stay' ? (Q.stay(d.objectId) || {}).roomId || null : d.roomId || null, version: old ? (old.version || 1) + 1 : 1, prevId: old ? old.id : null, validTo: d.validTo || (old && old.validTo) || null, note: d.note || '', uploadedBy: _.who(), uploadedAt: F.nowISO(), status: 'current' });
    _.audit(old ? 'version' : 'upload', 'document', doc.id, `${old ? 'Phiên bản ' + doc.version + ' của' : 'Tải lên'} ${doc.name}`); _.done(); return doc;
  };
  Q.docVersions = (id) => { const out = []; let d = S.get('documents', id); while (d) { out.push(d); d = d.prevId ? S.get('documents', d.prevId) : null; } return out; };
  X.deleteDocument = (id, reason) => {
    _.need('documents.upload');
    const d = S.get('documents', id); if (!d) throw new Error(String(id).startsWith('cf:') ? 'File HĐ khách gắn lượt thuê – không xóa, chỉ tải phiên bản mới' : 'Không tìm thấy tài liệu');
    if (LINKED.includes(d.objectType)) throw new Error('Tài liệu gắn ' + (Q.OBJ_TYPES[d.objectType] || 'giao dịch').toLowerCase() + ' – không xóa được, chỉ tải phiên bản mới');
    if (!A.inScope(d.buildingId)) throw new Error('Tòa ngoài phạm vi được giao');
    if (!String(reason || '').trim()) fail({ reason: 'Nhập lý do xóa' });
    S.update('documents', id, { status: 'deleted', deletedBy: _.who(), deletedAt: F.nowISO(), deleteReason: reason });
    _.audit('delete', 'document', id, 'Xóa tài liệu ' + d.name + ': ' + reason); _.done();
  };

  /* ---------- OCR (mô phỏng) ---------- */
  Q.OCR_GROUPS = [['party', 'Khách / liên hệ'], ['place', 'Tòa / phòng'], ['dates', 'Ngày ký, vào ở, tính tiền, hết hạn'], ['money', 'Giá, cọc, kỳ trả'], ['fees', 'Biểu phí dịch vụ'], ['meter', 'Chỉ số đầu, số người, số xe']];
  const FEE = [['electric', 'Điện', 'đ/kWh', 'meter'], ['water', 'Nước', 'đ/người', 'person'], ['internet', 'Internet', 'đ/phòng', 'room'], ['elevator', 'Thang máy', 'đ/người', 'person'], ['cleaning', 'DV vệ sinh', 'đ/phòng', 'room'], ['washer', 'Máy giặt / máy sấy', 'đ/người', 'person'], ['combo', 'DV combo / dịch vụ chung', 'đ/người', 'person'], ['ev', 'Sạc / gửi xe điện', 'đ/xe', 'vehicle']];
  // Trường bắt buộc trước khi áp dụng (E05, đặc tả §3.3): bên thuê, phòng, ngày ký / nhận / tính tiền / hết hạn, giá, cọc, kỳ và hạn thanh toán
  /* D8: điều khoản HĐ áp vào lượt thuê khi "Áp dụng" (cùng bảng so sánh E06) */
  Q.OCR_TERMS = [['endDate', 'Ngày hết hạn', 'endDate'], ['payMonths', 'Kỳ thanh toán (tháng)', 'payMonths'], ['dueDay', 'Hạn thanh toán (ngày)', 'dueDay'], ['deposit', 'Tiền cọc theo HĐ', 'depositAmount'],
    ['people', 'Số người ở', 'people'], ['vehicles', 'Số xe', 'vehicles'], ['signDate', 'Ngày ký', 'dealDate'], ['moveInDate', 'Ngày vào ở', 'moveInDate'], ['rentStart', 'Ngày tính tiền phòng', 'rentStart']];
  Q.ocrTermsCompare = (o) => { const s = Q.stay(o.stayId) || {}; const issued = !!S.one('invoices', i => i.stayId === o.stayId && i.lifecycle !== 'draft');
    return Q.OCR_TERMS.map(([k, l, f]) => { const nv = Q.ocrValue(k, (o.fields.find(x => x.key === k) || {}).value); return { key: k, label: l, cur: s[f] ?? null, next: nv === '' ? null : nv, locked: issued && ['signDate', 'moveInDate', 'rentStart'].includes(k) }; }); };
  Q.OCR_REQUIRED = ['name', 'room', 'signDate', 'moveInDate', 'rentStart', 'endDate', 'rent', 'deposit', 'payMonths', 'dueDay'];
  /* Vòng đời OCR của file HĐ (UI-08): mới tải → đang trích xuất → chờ rà soát / không đọc được → đã áp dụng; phiên cũ bị thay khi chạy lại */
  Q.OCR_ST = { uploaded: ['Mới tải', 'gray'], extracting: ['Đang trích xuất', 'blue'], review: ['Chờ rà soát', 'amber'], error: ['Không đọc được', 'red'], applied: ['Đã áp dụng', 'green'], superseded: ['Đã thay bằng lần chạy mới', 'gray'] };
  Q.ocrStatusOf = (fileId) => { const o = Q.ocrOf(fileId)[0]; return o ? o.status : ((S.get('contractFiles', fileId) || {}).ocr === 'extracting' ? 'extracting' : 'uploaded'); };
  Q.ocrSession = (id) => S.get('ocrSessions', id);
  Q.ocrOf = (fileId) => S.where('ocrSessions', o => o.fileId === fileId).sort((a, b) => b.run - a.run);
  X.runOcr = (fileId) => {
    _.need('ocr.review');
    const f = S.get('contractFiles', fileId); if (!f) throw new Error('Không tìm thấy file hợp đồng');
    const s = Q.stay(f.stayId); if (!A.inScope(s.buildingId)) throw new Error('Lượt thuê ngoài phạm vi được giao'); const c = Q.customer(s.customerId) || {}; const rv = Q.rateOf(s.id) || { items: {} }; const room = Q.room(s.roomId) || {};
    const run = Q.ocrOf(fileId).length + 1; const h = hash(fileId + '#' + run);
    const blurred = /mờ|thiếu|blur/i.test(f.name);
    const rd = S.where('meterReadings', r => r.stayId === s.id && !r.vacant).sort((a, b) => String(a.period).localeCompare(String(b.period)))[0];
    const fld = (group, key, label, value, conf = 0.97, page = 1, region = '') => ({ group, key, label, value: value == null ? '' : value, raw: value == null ? '' : value, confidence: conf, page, region, edited: false });
    // nhiễu cố định: lượt đầu đọc sai đơn giá điện (+500) và thiếu tiền cọc – minh họa E05; lượt sau đọc đúng hơn
    const noisy = run === 1 && h % 2 === 0;
    const fields = [
      fld('party', 'name', 'Tên người thuê', c.name, 0.95, 1, 'Bên B'), fld('party', 'phone', 'SĐT', c.phone, noisy ? 0.58 : 0.93, 1, 'Bên B'), fld('party', 'idNo', 'CCCD', c.idNo || '', 0.9, 1, 'Bên B'),
      fld('place', 'building', 'Tòa', (Q.building(s.buildingId) || {}).code, 0.98, 1, 'Điều 1'), fld('place', 'room', 'Phòng', room.code, 0.98, 1, 'Điều 1'),
      fld('dates', 'signDate', 'Ngày ký', s.dealDate || s.rentStart, 0.9, 1, 'Đầu HĐ'), fld('dates', 'moveInDate', 'Ngày vào ở', s.moveInDate, 0.88, 2, 'Điều 2'), fld('dates', 'rentStart', 'Ngày tính tiền phòng', s.rentStart, 0.92, 2, 'Điều 2'), fld('dates', 'endDate', 'Ngày hết hạn', s.endDate, 0.9, 2, 'Điều 2'),
      fld('money', 'rent', 'Giá thuê / tháng', s.rent, 0.96, 2, 'Điều 3'), fld('money', 'deposit', 'Tiền cọc', noisy ? null : s.depositAmount, noisy ? 0 : 0.94, 2, 'Điều 3'), fld('money', 'payMonths', 'Kỳ thanh toán (tháng)', s.payMonths || 1, 0.9, 2, 'Điều 3'), fld('money', 'dueDay', 'Hạn thanh toán (ngày)', 5, 0.85, 2, 'Điều 3'),
      ...FEE.map(([k, l, u], i) => { const it = rv.items[k]; const v = it ? it.unit : null; return fld('fees', 'fee_' + k, l + ' (' + u + ')', noisy && k === 'electric' && v ? v + 500 : v, noisy && k === 'electric' ? 0.61 : v ? 0.9 : 0.5, 3, 'Phụ lục phí, dòng ' + (i + 1)); }),
      fld('meter', 'elOpen', 'Chỉ số điện đầu kỳ', rd ? rd.elPrev : null, 0.8, 3, 'Biên bản bàn giao'), fld('meter', 'people', 'Số người ở', s.people || 1, 0.92, 1, 'Điều 1'), fld('meter', 'vehicles', 'Số xe', s.vehicles || 0, 0.9, 1, 'Điều 1'),
    ];
    // B15: phiên chờ rà soát trước đó bị thay – không áp dụng được nữa
    S.where('ocrSessions', x => x.fileId === fileId && x.status === 'review').forEach(x => S.update('ocrSessions', x.id, { status: 'superseded', supersededAt: F.nowISO() }));
    S.update('contractFiles', fileId, { ocr: 'extracting' }); // bước "đang trích xuất" (mô phỏng đồng bộ)
    const o = S.add('ocrSessions', { fileId, stayId: s.id, run, status: blurred ? 'error' : 'review', error: blurred ? 'File mờ / thiếu trang – nhập tay có bằng chứng' : null, fields, confirmed: {}, createdBy: _.who(), createdAt: F.nowISO(), pages: 3 });
    S.update('contractFiles', fileId, { ocr: o.status });
    _.audit('ocr', 'contractFile', fileId, `Đọc OCR lần ${run} – ${f.name}${blurred ? ' (lỗi / thiếu trang)' : ''}`); _.done(); return o;
  };
  /* D11: số tiền kiểu Việt Nam – "3.800" / "3,800" → 3800; "4,2 triệu" / "4.2tr" → 4.200.000; chữ → null (không hợp lệ) */
  const moneyOf = (v) => {
    if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? v : null;
    let s = String(v ?? '').trim().toLowerCase().replace(/\s+/g, ''); if (!s) return null;
    const unit = s.match(/^(\d+(?:[.,]\d+)?)(tr|triệu|trieu|k|nghìn|ngàn)$/);
    if (unit) return Math.round(Number(unit[1].replace(',', '.')) * (/^(k|nghìn|ngàn)$/.test(unit[2]) ? 1e3 : 1e6));
    s = s.replace(/(vnđ|vnd|đ|d)$/, '');
    return /^\d{1,3}([.,]\d{3})+$|^\d+$/.test(s) ? Number(s.replace(/[.,]/g, '')) : null;
  };
  const dateOf = (v) => { const s = String(v ?? '').trim(); let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!m) { const x = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (x) m = [0, x[3], x[2].padStart(2, '0'), x[1].padStart(2, '0')]; }
    if (!m) return null; const iso = m[1] + '-' + m[2] + '-' + m[3]; const t = new Date(iso + 'T00:00:00Z'); return !isNaN(t) && t.toISOString().slice(0, 10) === iso ? iso : null; };
  const intIn = (lo, hi) => (v) => { const s = String(v ?? '').trim(); return /^\d+$/.test(s) && +s >= lo && +s <= hi ? +s : null; };
  const OCR_KIND = { rent: moneyOf, deposit: moneyOf, signDate: dateOf, moveInDate: dateOf, rentStart: dateOf, endDate: dateOf, payMonths: intIn(1, 12), dueDay: intIn(1, 31), people: intIn(0, 30), vehicles: intIn(0, 20), elOpen: intIn(0, 9999999) };
  const kindOf = (key) => OCR_KIND[key] || (String(key).startsWith('fee_') ? moneyOf : null);
  const OCR_HINT = { money: 'số tiền (vd 3.800 hoặc 4,2 triệu)', date: 'ngày dd/mm/yyyy', int: 'số nguyên' };
  const hintOf = (key) => kindOf(key) === moneyOf ? OCR_HINT.money : kindOf(key) === dateOf ? OCR_HINT.date : OCR_HINT.int;
  /* Giá trị hợp lệ đã chuẩn hóa; undefined = trường tự do; null = không hợp lệ */
  Q.ocrValue = (key, value) => { const fn = kindOf(key); if (!fn) return value; if (value === '' || value == null) return ''; const v = fn(value); return v == null ? null : v; };
  const needOpen = (sid) => { _.need('ocr.review'); const o = Q.ocrSession(sid); if (!o) throw new Error('Không tìm thấy phiên OCR');
    const st = Q.stay(o.stayId); if (st && !A.inScope(st.buildingId)) throw new Error('Lượt thuê ngoài phạm vi được giao'); /* D10 */
    if (o.status === 'applied') throw new Error('Phiên đã áp dụng – chạy lại OCR để tạo phiên mới'); if (o.status === 'superseded') throw new Error('Phiên đã được thay bằng lần chạy OCR mới – mở phiên mới nhất'); if (o.status === 'error') throw new Error('File lỗi / thiếu trang – nhập tay ở tab Biểu phí'); return o; };
  X.ocrSetField = (sid, key, value) => {
    const o = needOpen(sid);
    const v = Q.ocrValue(key, value); // "3.800" → 3800 (A7); D11: chữ / ngày sai → lỗi trường
    if (v === null) fail({ [key]: 'Không hợp lệ – nhập ' + hintOf(key) });
    const fields = o.fields.map(f => f.key === key ? Object.assign({}, f, { value: v, edited: String(v) !== String(f.raw) }) : f);
    const g = (o.fields.find(f => f.key === key) || {}).group;
    const confirmed = Object.assign({}, o.confirmed); delete confirmed[g]; // sửa trường → nhóm phải rà lại
    S.update('ocrSessions', sid, { fields, confirmed }); _.done();
  };
  /* Rà xong một nhóm: trường bắt buộc có giá trị; trường độ tin cậy < 70% phải được sửa hoặc người rà xác nhận đúng (ackLow) */
  Q.ocrGroupIssues = (o, group, ackLow) => o.fields.filter(f => f.group === group).map(f => (Q.OCR_REQUIRED.includes(f.key) && (f.value === '' || f.value == null)) ? f.label + ': thiếu' : Q.ocrValue(f.key, f.value) === null ? f.label + ': không hợp lệ' : (f.confidence < 0.7 && !f.edited && !ackLow) ? f.label + ': độ tin cậy ' + Math.round(f.confidence * 100) + '% – kiểm tra với bản gốc' : null).filter(Boolean);
  X.ocrConfirmGroup = (sid, group, ackLow) => {
    const o = needOpen(sid);
    const issues = Q.ocrGroupIssues(o, group, ackLow);
    if (issues.length) throw new Error('Chưa rà xong nhóm: ' + issues.join('; '));
    S.update('ocrSessions', sid, { confirmed: Object.assign({}, o.confirmed, { [group]: { by: _.who(), at: F.nowISO() } }) }); _.done();
  };
  Q.ocrReady = (o) => { const missing = Q.OCR_GROUPS.filter(([g]) => !o.confirmed[g]).map(([, l]) => l); const req = o.fields.filter(f => Q.OCR_REQUIRED.includes(f.key) && (f.value === '' || f.value == null)).map(f => f.label); return { ok: !missing.length && !req.length && o.status === 'review', missing, req }; };
  /* Áp dụng: phiên biểu phí mới có ngày hiệu lực – không đổi hóa đơn đã phát hành; lưu bản OCR gốc + bản đã sửa + người xác nhận */
  X.ocrApply = (sid, d = {}) => {
    const o = needOpen(sid); _.need('rates.manage');
    const file = S.get('contractFiles', o.fileId) || {};
    if (S.one('contractFiles', x => x.stayId === o.stayId && (x.version || 1) > (file.version || 1))) throw new Error('Đã có file HĐ mới hơn cho lượt thuê – chạy OCR trên file mới nhất'); // D9
    const r = Q.ocrReady(o); if (!r.ok) throw new Error('Chưa áp dụng được (E05): ' + [...r.req.map(x => 'thiếu ' + x), ...r.missing.map(x => 'chưa rà nhóm ' + x)].join('; '));
    if (!d.from) fail({ from: 'Nhập ngày hiệu lực của biểu phí' });
    _.guardEffective(d.from, 'biểu phí từ OCR'); // B16: không áp vào kỳ đã khóa
    const val = (k) => (o.fields.find(f => f.key === k) || {}).value;
    const cur = Q.rateOf(o.stayId) || { items: {} }; const items = JSON.parse(JSON.stringify(cur.items || {}));
    const rent = moneyOf(val('rent')); if (!(rent > 0)) fail({ from: 'Giá thuê trên bản OCR không hợp lệ – sửa trường "Giá thuê" trước khi áp dụng' });
    const bad = o.fields.filter(f => Q.ocrValue(f.key, f.value) === null); if (bad.length) fail({ from: 'Trường không hợp lệ: ' + bad.map(f => f.label).join(', ') });
    FEE.forEach(([k, , , method]) => { const v = moneyOf(val('fee_' + k)); if (v > 0) items[k] = Object.assign({}, items[k] || { method }, { unit: v }); });
    const res = X.addRateVersion(o.stayId, { from: d.from, rent, items, reason: 'Áp dụng từ OCR hợp đồng (phiên ' + o.run + ') – ' + (d.reason || 'đã rà soát') }, true);
    // D8: điều khoản HĐ (hết hạn, kỳ / hạn trả, cọc theo HĐ, người / xe, ngày) vào lượt thuê
    const terms = {}; Q.OCR_TERMS.forEach(([k]) => { const v = Q.ocrValue(k, val(k)); if (v !== '' && v != null) terms[k] = v; });
    const tr = _.applyStayTerms(o.stayId, terms, 'OCR phiên ' + o.run);
    const held = X.depositIn(o.stayId); res.terms = tr;
    if (terms.deposit != null && held > 0 && Math.abs(held - terms.deposit) > 0.5) res.depositWarn = { contract: terms.deposit, held };
    S.update('contractFiles', o.fileId, { ocr: 'applied' });
    S.update('ocrSessions', sid, { status: 'applied', appliedBy: _.who(), appliedAt: F.nowISO(), rateVersionId: res.version.id, terms: tr, edited: o.fields.filter(f => f.edited).map(f => ({ key: f.key, from: f.raw, to: f.value })) });
    _.audit('apply', 'ocr', sid, `Áp dụng OCR phiên ${o.run} vào biểu phí từ ${F.date(d.from)} (${o.fields.filter(f => f.edited).length} trường đã sửa)`); _.done();
    return res;
  };
})(window.TH);

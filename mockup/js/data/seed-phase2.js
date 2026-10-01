/* Dữ liệu demo Phase 2 – dựng trong TH.seed.build (nối tiếp hook seedExtras của 1B), không lưu localStorage.
   Kinh doanh (UI-19…22): deal suy từ lượt thuê thật của seed – 22 phòng mới tháng 9 (đã nhận) và 26 lượt đã cọc chờ vào tháng 10 (chờ nhận);
   lead / lượt xem / sale / nguồn là dữ liệu sinh xác định (đối tác lấy từ danh sách người nhận hoa hồng SRC-09).
   Số đối chiếu Excel (hoa hồng T8, G1, âm dương, sổ sửa chữa) đọc thẳng từ TH.data.p2 (seed-p2.js). */
(function (TH) {
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0); };
  const P2 = TH.data.p2;
  const CHANNELS = ['Facebook', 'Tờ rơi', 'Đăng tin', 'Zalo'];
  const GROUPS = ['LEAD - CTV', 'PHÒNG KD', 'SALE VH', 'VẬN HÀNH'];
  const prev = TH.data.seedExtras;
  TH.data.seedExtras = (st) => {
    if (prev) prev(st);
    const D = TH.calc.dates, CM = TH.calc.commission;
    /* Chính sách hoa hồng theo hiệu lực (SRC-09: trước 4/2025 cơ bản 35%, từ 4/2025 là 50%) */
    st.commissionPolicies = [
      { id: 'cp_2025_01', from: '2025-01-01', base: 0.35, partners: {}, fullTermMonths: 6, share: { 2: 0.25, 3: 0.1667 }, forfeitRate: 0.35, note: 'SRC-09: mức cơ bản đầu năm 2025' },
      { id: 'cp_2025_04', from: '2025-04-01', base: 0.5, partners: { MOITHUE: 0.65 }, fullTermMonths: 6, share: { 2: 0.25, 3: 0.1667 }, forfeitRate: 0.5, note: 'SRC-09: từ 4/2025 cơ bản 50% × 1 tháng giá chốt; MOITHUE 65%' },
    ];
    const sales = st.employees.filter(e => e.title === 'SALE').sort((a, b) => a.code.localeCompare(b.code));
    const me = st.employees.find(e => e.key === 'NV42064945');
    const partners = P2 ? [...new Set(P2.commission.rows.filter(r => r.recipientKind === 'partner').map(r => r.recipient))] : ['TINCITY', '90 LAND', 'MOITHUE'];
    const leads = [], viewings = [], deals = [], commissions = [];
    const custBy = {}; st.customers.forEach(c => { custBy[c.id] = c; });
    const roomBy = {}; st.rooms.forEach(r => { roomBy[r.id] = r; });
    const bBy = {}; st.buildings.forEach(b => { bBy[b.id] = b; });
    // Thời hạn HĐ (tháng) từ ngày tính tiền đến ngày hết hạn (ngày hết hạn = ngày trước mốc tròn tháng)
    const monthsBetween = (a, b) => { if (!a || !b) return 12; const e = D.addDays(b, 1); const m = (Number(e.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + Number(e.slice(5, 7)) - Number(a.slice(5, 7)); return Math.max(1, m + (Number(e.slice(8)) >= Number(a.slice(8)) ? 0 : -1)); };
    const src = st.stays.filter(s => ['PHÒNG MỚI THÁNG 9', 'PHÒNG MỚI THÁNG 10'].includes(s.source)).sort((a, b) => a.code.localeCompare(b.code));
    src.forEach((s, i) => {
      const h = hash('deal' + s.code); const c = custBy[s.customerId] || {};
      const saleIds = [i < 5 && me ? me.id : sales[h % sales.length].id];
      if (h % 7 === 0) { const o = sales[(h >>> 3) % sales.length].id; if (o !== saleIds[0]) saleIds.push(o); }
      const viaPartner = h % 3 === 0;
      const partner = viaPartner ? partners[(h >>> 5) % partners.length] : null;
      const group = viaPartner ? 'LEAD - CTV' : GROUPS[1 + (h >>> 4) % 3];
      const closeDate = D.addDays(s.rentStart, -(4 + h % 12));
      const sentAt = D.addDays(closeDate, -(1 + (h >>> 2) % 5));
      const code = 'GD-' + closeDate.slice(2, 4) + closeDate.slice(5, 7) + '-' + String(i + 1).padStart(3, '0');
      const leadId = 'ld_' + s.code;
      leads.push({ id: leadId, code: 'LD-' + String(i + 1).padStart(4, '0'), name: c.name, phone: c.phone, source: viaPartner ? 'Đối tác' : CHANNELS[h % 4], group, partner, saleIds, sentAt,
        areaId: (bBy[s.buildingId] || {}).areaId, status: 'closed', note: '', createdAt: sentAt + 'T09:00:00' });
      viewings.push({ id: 'vw_' + s.code, leadId, buildingId: s.buildingId, roomId: s.roomId, date: D.addDays(sentAt, 1), saleId: saleIds[0], result: 'closed' });
      if (h % 2) { const alt = st.rooms.find(r => r.buildingId === s.buildingId && r.id !== s.roomId && r.price > 0); if (alt) viewings.push({ id: 'vw2_' + s.code, leadId, buildingId: alt.buildingId, roomId: alt.id, date: D.addDays(sentAt, 1), saleId: saleIds[0], result: 'viewed' }); }
      const received = s.status === 'active';
      const term = monthsBetween(s.rentStart, s.endDate);
      const deal = { id: 'dl_' + s.code, code, leadId, customerId: s.customerId, roomId: s.roomId, buildingId: s.buildingId, stayId: s.id, saleIds, partner, source: viaPartner ? 'Đối tác' : CHANNELS[h % 4], group,
        closeDate, moveInDate: s.moveInDate || s.rentStart, billingStart: s.rentStart, term, price: s.rent, deposit: s.depositAmount, status: received ? 'received' : 'closed', note: '',
        events: [{ type: 'close', at: closeDate, by: (st.employees.find(e => e.id === saleIds[0]) || {}).name, note: 'Chốt thuê' }].concat(received ? [{ type: 'receive', at: s.moveInDate || s.rentStart, by: 'Import', note: 'Khách nhận phòng' }] : []) };
      deals.push(deal); s.dealId = deal.id;
      /* Hoa hồng: qua đối tác → 1 dòng cho đối tác; không → chia cho các sale (trùng 2 người 25%) */
      const pol = CM.policyAt(st.commissionPolicies, closeDate);
      const recips = partner ? [{ kind: 'partner', name: partner }] : saleIds.map(id => ({ kind: 'sale', employeeId: id, name: (st.employees.find(e => e.id === id) || {}).name }));
      recips.forEach((r, k) => {
        const sg = CM.suggest({ term, partner, share: recips.length }, pol);
        commissions.push({ id: 'cm_' + s.code + '_' + k, dealId: deal.id, buildingId: s.buildingId, roomId: s.roomId, recipient: r, F: s.rent, term, share: recips.length, suggestedH: sg.rate, reasons: sg.reasons, H: sg.rate, deduction: 0,
          amount: CM.amount(s.rent, sg.rate), status: received ? 'approved' : 'pending', approvedAmount: received ? CM.amount(s.rent, sg.rate) : null, approvedBy: received ? 'Import' : null, installments: [], createdAt: closeDate + 'T10:00:00' });
      });
      if (received && h % 3 !== 1) st.contractFiles.push({ id: 'cf_' + s.code, stayId: s.id, name: 'HĐ thuê ' + s.code + '.pdf', size: 420000 + h % 90000, version: 1, uploadedBy: 'Import', uploadedAt: s.rentStart + 'T08:00:00', ocr: 'none' });
    });
    /* Khách xem chưa chốt (UI-20): 40 lead sinh, vài SĐT trùng khách cũ để minh họa cảnh báo E08 */
    const priced = st.rooms.filter(r => r.price > 0);
    for (let i = 0; i < 40; i++) {
      const h = hash('lead' + i); const saleId = i < 6 && me ? me.id : sales[h % sales.length].id;
      const dup = i % 13 === 5 && leads[i] ? leads[i].phone : null;
      const sentAt = D.addDays('2026-09-28', -(h % 40));
      const id = 'ld_x' + i; const r = priced[h % priced.length];
      const status = ['new', 'viewed', 'considering', 'lost'][h % 4];
      leads.push({ id, code: 'LD-' + String(src.length + i + 1).padStart(4, '0'), name: 'Khách xem ' + String(i + 1).padStart(2, '0'), phone: dup || ('09' + String(10000000 + hash('lp' + i) % 89999999)), source: CHANNELS[h % 4],
        group: GROUPS[h % 4], partner: h % 5 === 0 ? partners[h % partners.length] : null, saleIds: [saleId], sentAt, areaId: (bBy[r.buildingId] || {}).areaId, status, note: dup ? 'Trùng SĐT khách đã có – demo E08' : '', createdAt: sentAt + 'T09:00:00' });
      if (status !== 'new') viewings.push({ id: 'vwx_' + i, leadId: id, buildingId: r.buildingId, roomId: r.id, date: D.addDays(sentAt, 1), saleId, result: status === 'lost' ? 'lost' : 'viewed' });
    }
    st.leads = leads; st.viewings = viewings; st.deals = deals; st.commissions = commissions; st.salesTargets = [];
    // STK nhận hoa hồng của sale (demo, đã che số) – chỉ admin / kế toán thấy ở UI-22
    st.employees.filter(e => ['SALE', 'NVKD', 'TNKD'].includes(e.title)).forEach(e => { let hh = 0; for (const ch of e.id) hh = (hh * 31 + ch.charCodeAt(0)) >>> 0; e.bank = ['VCB', 'TCB', 'MB', 'ACB'][hh % 4] + ' ···' + String(1000 + hh % 9000); });

    /* Sổ sửa chữa T8 (UI-47, SRC-16): 2 thợ kỹ thuật, mọi dòng của sheet Excel ghi vào kỳ sổ 08/2026 (đã xác nhận – kỳ chạy song song, không ghi lại chi phí);
       phân loại việc / lý do / người chịu suy từ nội dung và ghi chú. Lương thợ: phần cố định lấy từ sheet LƯƠNG THÁNG 8. */
    const RP = TH.calc.repairs; const logs = [], adv = [];
    (P2 ? P2.repairs.workers : []).forEach(w => {
      const e = st.employees.find(x => x.key === w.empKey); if (!e) return;
      e.repairPay = { base: w.excel.base, seniority: w.excel.seniority, lunch: w.excel.lunch, source: 'SRC-16 LƯƠNG THÁNG 8' };
      adv.push({ id: 'ra_' + e.id + '_2026-08', workerId: e.id, period: '2026-08', amount: w.excel.advance, date: '2026-07-26', note: 'Ứng chi vật tư kỳ 08/2026 (SRC-16)' });
      w.rows.forEach(r => {
        const bId = 'b_' + r.b; const room = r.room ? roomBy['r_' + r.room + r.b] : null;
        logs.push({ id: 'rl_' + e.id + '_' + r.row, code: 'SC-2608-' + String(logs.length + 1).padStart(4, '0'), period: '2026-08', date: r.date, buildingId: bBy[bId] ? bId : null, buildingCode: r.b, roomId: room ? room.id : null, roomCode: r.room,
          desc: r.desc, jobType: RP.classifyJob(r.desc), workerId: e.id, labor: r.labor, material: r.material, paintFrom: r.paint, reason: RP.classifyReason(r.note || '', r.flag || ''), bearer: RP.classifyBearer(r.note || '', r.flag || ''),
          collectStatus: RP.collectOf(r.note || '', r.flag || ''), note: [r.note, r.flag].filter(Boolean).join(' · '), status: 'confirmed', posted: 'excel', source: 'SRC-16', excel: { sheet: w.sheet, row: r.row } });
      });
    });
    st.repairLogs = logs; st.repairAdvances = adv;

    /* Cổ đông & tỷ lệ góp (UI-31, SRC-07): G1 có 9 dòng gồm quỹ CHUNG; tên cổ đông đã ẩn danh. Tòa khác chưa có tỷ lệ (nhập tay – CH-30). */
    const SH = P2 ? P2.shares : null;
    st.shareholders = SH ? SH.holders.map(h => ({ id: 'sh_' + h.code, code: h.code, name: h.name, common: h.common, note: h.common ? 'Nhận phần chênh làm tròn (OQ-08)' : '' })) : [];
    st.shareRatios = SH ? SH.holders.map(h => ({ id: 'sr_G1_' + h.code, buildingId: 'b_' + SH.building, shareholderId: 'sh_' + h.code, pct: h.pct, from: '2026-01-01', to: null, reason: 'Tỷ lệ góp theo bảng kê G1 (SRC-07)' })) : [];
    st.shareRuns = [];

    /* Kho tài liệu (UI-26): HĐ chủ nhà của mỗi tòa + sổ đỏ vài tòa (dữ liệu sinh); HĐ khách lấy từ file hợp đồng của lượt thuê */
    const docs = [];
    st.ownerContracts.forEach((oc, i) => { const b = bBy[oc.buildingId]; if (!b) return;
      docs.push({ id: 'doc_oc_' + b.code, code: 'TL-' + String(docs.length + 1).padStart(4, '0'), type: 'owner_contract', name: 'HĐ thuê nhà ' + b.code + '.pdf', size: 800000 + hash('d' + b.code) % 400000, objectType: 'ownerContract', objectId: oc.id,
        buildingId: b.id, roomId: null, version: 1, validTo: oc.endDate, uploadedBy: 'Import', uploadedAt: oc.startDate + 'T08:00:00', status: 'current' });
      if (i % 9 === 0) docs.push({ id: 'doc_rb_' + b.code, code: 'TL-' + String(docs.length + 1).padStart(4, '0'), type: 'red_book', name: 'Sổ đỏ ' + b.code + ' (bản sao).pdf', size: 1200000, objectType: 'building', objectId: b.id,
        buildingId: b.id, roomId: null, version: 1, validTo: null, uploadedBy: 'Import', uploadedAt: '2026-01-05T08:00:00', status: 'current' });
    });
    st.documents = docs; st.ocrSessions = [];
    /* E3 [GĐ-E5]: tòa trả điện qua chủ nhà (UI-43, đặc tả dòng 496, 856): S32 theo Sheet1 ẩn SRC-14 – 2.500đ/kWh; S39 ghi "đã tt cho chủ nhà", chưa có đơn giá */
    [['b_S32', { unitPrice: 2500, from: '2026-01-01', note: 'SRC-14 Sheet1: điện thanh toán chủ nhà' }], ['b_S39', { unitPrice: null, from: '2026-01-01', note: 'Hóa đơn ghi "đã tt cho chủ nhà" – chờ đơn giá' }]].forEach(([id, vo]) => { const b = st.buildings.find(x => x.id === id); if (b) b.vendor = Object.assign({}, b.vendor || {}, { electricViaOwner: vo }); });

    /* Hộp thư phản hồi Zalo (UI-39 Phase 2, CH-37): vài tin khách trả lời, gán trưởng phòng phụ trách theo cơ cấu tổ chức (đi lên từ quản lý tòa tới TPVH) */
    const up = (id) => (st.orgLinks.find(l => l.employeeId === id && !l.to) || {}).leaderId;
    const head = (bid) => { const a = st.assignments.find(x => x.buildingId === bid && x.responsibility === 'operate' && !x.to && !x.roomId); let e = a && a.employeeId; const tp = (id) => (st.employees.find(x => x.id === id) || {}).title === 'TPVH'; if (e && tp(e)) return e; for (let i = 0; i < 5 && e; i++) { const u = up(e); if (!u) break; if (tp(u)) return u; e = u; } return null; }; // cùng quy tắc Q.inboxAssignee
    const texts = ['Em chuyển khoản tối nay ạ', 'Cho em xin gia hạn đến ngày 10', 'Phòng em điện sao cao vậy ạ?', 'Em muốn gia hạn hợp đồng thêm 6 tháng', 'Bình nóng lạnh phòng em bị hỏng ạ'];
    st.zaloInbox = st.stays.filter(x => x.status === 'active').filter((x, i) => i % 131 === 7).slice(0, 5).map((x, i) => ({ id: 'zi_demo_' + i, messageId: 'demo_' + i, stayId: x.id, buildingId: x.buildingId, text: texts[i % texts.length],
      at: '2026-09-2' + (3 + i) + 'T1' + i + ':15:00', assigneeId: head(x.buildingId), status: i === 4 ? 'done' : 'open', customerCode: x.code, notes: i === 4 ? [{ text: 'Đã báo kỹ thuật thay bình', by: 'Demo', at: '2026-09-27T16:00:00' }] : [], source: 'demo' }));
  };
})(window.TH);

/* Hoa hồng Phase 2 (UI-22; đặc tả §3.5 dòng 301–313, SRC-09, CH-01/19/20, GĐ OQ-13). Chỉ admin / kế toán xem & thao tác (CH-01).
   Mỗi deal sinh dòng hoa hồng: qua đối tác → 1 dòng cho đối tác; không → chia cho các sale (trùng 2 người 25%, 3 người 16,67%).
   Tỷ lệ gợi ý theo chính sách có hiệu lực; duyệt khác gợi ý phải có lý do. Chi nhiều đợt, tổng không vượt số đã duyệt; mỗi đợt chi = chứng từ
   chi phí "Hoa hồng" dòng 40 Phí marketing, kỳ = tháng thực chi; ngày đủ điều kiện chỉ là điều kiện được phép chi. */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, Cc = TH.calc, CM = TH.calc.commission;
  const fail = (fields, msg = 'Dữ liệu chưa hợp lệ') => { const e = new Error(msg); e.fields = fields; throw e; };
  Q.CM_ST = { pending: ['Chờ duyệt', 'amber'], approved: ['Đã duyệt', 'blue'], paid: ['Đã chi đủ', 'green'], void: ['Hủy', 'gray'] };
  Q.commissionPolicy = (date) => CM.policyAt(S.all('commissionPolicies'), date || F.today());
  Q.commissionsOf = (dealId) => S.where('commissions', c => c.dealId === dealId);
  Q.commissionPaid = (c) => (c.installments || []).reduce((t, i) => t + i.amount, 0);

  /* (Tính lại) dòng hoa hồng của deal. Dòng đã chi giữ nguyên; bỏ cọc → cơ sở F = cọc − tiền ngày đã ở */
  X.buildDealCommissions = (dealId, silent) => {
    if (!TH.ms.on('2')) return []; // hoa hồng tự động thuộc Phase 2; bỏ cọc ở UI-07 mốc 1A vẫn chạy
    const d = Q.deal(dealId); if (!d) throw new Error('Không tìm thấy giao dịch');
    const pol = Q.commissionPolicy(d.closeDate);
    const recips = d.partner ? [{ kind: 'partner', name: d.partner }] : (d.saleIds || []).map(id => ({ kind: 'sale', employeeId: id, name: (Q.emp(id) || {}).name }));
    const forfeit = d.status === 'forfeited' && d.forfeit;
    const F0 = forfeit ? d.forfeit.base : d.price;
    const term = forfeit ? 'forfeit' : d.term;
    const cur = Q.commissionsOf(dealId);
    recips.forEach((r, k) => {
      const sg = CM.suggest({ term, partner: d.partner, share: recips.length }, pol);
      const old = cur.find(c => (c.recipient.employeeId || c.recipient.name) === (r.employeeId || r.name));
      if (old && old.status === 'paid' && !forfeit) return;
      const amount = CM.amount(F0, sg.rate); const paid = old ? Q.commissionPaid(old) : 0;
      const rec = { dealId, buildingId: d.buildingId, roomId: d.roomId, recipient: r, F: F0, term, share: recips.length, suggestedH: sg.rate, reasons: sg.reasons, H: sg.rate, deduction: 0, amount,
        status: 'pending', approvedAmount: null, approvedBy: null, installments: old ? old.installments || [] : [], recover: 0 };
      // B5: đã chi nhiều hơn số tính lại → giữ "đã chi đủ" với số duyệt = số mới và khoản cần thu hồi (không để dòng kẹt ở chờ duyệt)
      if (paid > amount + 0.5) Object.assign(rec, { status: 'paid', approvedAmount: amount, approvedBy: 'Tính lại', recover: Math.round((paid - amount) * 100) / 100 });
      if (old) S.update('commissions', old.id, Object.assign(rec, { note: forfeit ? 'Tính lại do khách bỏ cọc' + (rec.recover ? ` – đã chi vượt ${F.vnd(rec.recover)}, cần thu hồi` : '') : old.note }));
      else S.add('commissions', rec);
    });
    if (!silent) { _.audit('update', 'deal', dealId, 'Tính lại hoa hồng ' + d.code); _.done(); }
  };
  /* Duyệt: H khác gợi ý hoặc có khoản trừ (hỗ trợ khách…) → bắt buộc lý do; cảnh báo khi số duyệt ≠ F × H − trừ */
  X.approveCommission = (id, d = {}) => { _.needMs('2', 'Hoa hồng (UI-22)');
    _.need('commission.approve');
    const c = S.get('commissions', id); if (!c) throw new Error('Không tìm thấy dòng hoa hồng');
    if (!['pending', 'approved'].includes(c.status)) throw new Error('Dòng hoa hồng không ở trạng thái duyệt được');
    const H = d.H != null && d.H !== '' ? Number(d.H) : c.H; const ded = Number(d.deduction) || 0;
    const errs = {};
    if (!(H > 0 && H <= 1)) errs.H = 'Tỷ lệ từ 0 đến 100%';
    if (ded < 0) errs.deduction = 'Khoản trừ không âm';
    if ((!CM.sameRate(H, c.suggestedH) || ded > 0) && !String(d.reason || '').trim()) errs.reason = 'Tỷ lệ khác gợi ý / có khoản trừ – nhập lý do';
    if (Object.keys(errs).length) fail(errs);
    const amount = CM.amount(c.F, H, ded);
    if (!(amount > 0)) fail({ deduction: 'Thành tiền sau trừ phải > 0' });
    const paid = Q.commissionPaid(c);
    if (paid > amount + 0.5) fail({ H: 'Số duyệt nhỏ hơn số đã chi ' + F.vnd(paid) });
    S.update('commissions', id, { H, deduction: ded, amount, approvedAmount: amount, status: paid + 0.5 >= amount ? 'paid' : 'approved', approvedBy: _.who(), approvedAt: F.nowISO(), reason: d.reason || null });
    _.audit('approve', 'commission', id, `Duyệt hoa hồng ${(Q.deal(c.dealId) || {}).code}: ${c.recipient.name} ${(H * 100).toFixed(2)}% = ${F.vnd(amount)}${d.reason ? ' – ' + d.reason : ''}`); _.done();
  };
  /* Chi (từng đợt): đủ điều kiện CH-19; tổng ≤ số duyệt; mỗi đợt ghi nhận đúng tháng thực chi. */
  X.payCommission = (id, d) => { _.needMs('2', 'Hoa hồng (UI-22)');
    _.need('commission.pay');
    const c = S.get('commissions', id); if (!c) throw new Error('Không tìm thấy dòng hoa hồng');
    if (c.status !== 'approved') throw new Error(c.status === 'pending' ? 'Chưa duyệt hoa hồng' : 'Dòng hoa hồng không chi được');
    const deal = Q.deal(c.dealId); const el = Q.dealEligibility(deal);
    if (!el.ok) throw new Error('Chưa đủ điều kiện chi: ' + el.missing.join(', '));
    const amt = Number(d.amount); const left = c.approvedAmount - Q.commissionPaid(c);
    const errs = {};
    if (!(amt > 0)) errs.amount = 'Nhập số chi';
    else if (amt > left + 0.5) errs.amount = 'Vượt số còn được chi ' + F.vnd(left);
    if (!d.date) errs.date = 'Nhập ngày chi';
    else if (el.date && d.date < el.date) errs.date = 'Ngày chi trước ngày đủ điều kiện ' + F.date(el.date);
    if (Object.keys(errs).length) fail(errs);
    const recognition = Q.param('commissionRecognitionMode', d.date) || 'paidAt';
    const period = recognition === 'eligibleAt' ? CM.recognitionPeriod(el.date) : F.period(d.date);
    const lateNote = recognition === 'eligibleAt' ? ' · phương án OQ-13 theo kỳ đủ điều kiện' : ' · ghi nhận theo kỳ thực chi';
    if ((S.get('periods', period) || {}).status === 'closed') throw new Error(`Kỳ ghi nhận ${F.periodShort(period)} đã khóa; chọn ngày chi thuộc kỳ mở, hệ thống không tự đẩy kỳ`);
    _.guardPeriod(period, 'ghi chi hoa hồng');
    const exp = X.addExpense({ category: 'commission', reportLine: 'marketing', scope: 'building', buildingId: c.buildingId, roomId: c.roomId, amount: amt, date: d.date, period, method: d.method || 'bank',
      vendor: c.recipient.name, note: `Hoa hồng ${deal.code} – ${c.recipient.name} (${(c.H * 100).toFixed(2)}% × ${F.vnd(c.F)})${lateNote}`, source: 'commission', refId: id }, true);
    const inst = [...(c.installments || []), { amount: amt, date: d.date, period, expenseId: exp.id, by: _.who() }];
    S.update('commissions', id, { installments: inst, status: Q.commissionPaid({ installments: inst }) + 0.5 >= c.approvedAmount ? 'paid' : 'approved' });
    _.audit('pay', 'commission', id, `Chi hoa hồng ${deal.code}: ${F.vnd(amt)} (kỳ ${period})`); _.done();
    return exp;
  };
  /* Chính sách tỷ lệ mới có ngày hiệu lực (admin) – không áp ngược kỳ đã khóa */
  X.addCommissionPolicy = (d) => { _.needMs('2', 'Hoa hồng (UI-22)');
    _.need('commission.policy');
    const errs = {};
    if (!d.from) errs.from = 'Nhập ngày hiệu lực';
    const base = Number(d.base); if (!(base > 0 && base <= 1)) errs.base = 'Tỷ lệ cơ bản 0–100%';
    if (!String(d.note || '').trim()) errs.note = 'Nhập lý do / căn cứ';
    // E2: tỷ lệ riêng theo đối tác (vd MOITHUE 65%, đặc tả dòng 311) – nhập trong form, 0–100%
    let partners = null;
    if (d.partners) { partners = {}; Object.entries(d.partners).forEach(([k, r]) => { const key = String(k || '').trim().toUpperCase(); if (!key) return;
      if (!/^[A-Z0-9][A-Z0-9 ._-]{1,29}$/.test(key)) errs.partners = 'Tên đối tác không hợp lệ: ' + k; else if (!(Number(r) > 0 && Number(r) <= 1)) errs.partners = `Tỷ lệ đối tác ${key} phải trong 0–100%`; else partners[key] = Number(r); }); }
    if (Object.keys(errs).length) fail(errs);
    _.guardEffective(d.from, 'chính sách hoa hồng');
    const cur = Q.commissionPolicy(d.from);
    const v = S.add('commissionPolicies', { from: d.from, base, partners: partners || cur.partners, fullTermMonths: cur.fullTermMonths, share: cur.share, forfeitRate: Number(d.forfeitRate) || base, note: d.note });
    _.audit('create', 'commissionPolicy', v.id, `Chính sách hoa hồng từ ${F.date(d.from)}: cơ bản ${Math.round(base * 100)}%`); _.done(); return v;
  };

  /* E2: đối tác giới thiệu khách – tên lấy từ giao dịch / khách xem / chính sách; tài khoản nhận hoa hồng (đặc tả dòng 309 "STK người nhận"), chỉ admin / kế toán */
  Q.partnerOf = (name) => S.one('partners', p => String(p.name).toUpperCase() === String(name || '').toUpperCase());
  Q.partnerNames = () => [...new Set([...S.all('deals').map(d => d.partner), ...S.all('leads').map(l => l.partner), ...Object.keys(Q.commissionPolicy().partners || {}), ...S.all('partners').map(p => p.name)].filter(Boolean).map(x => String(x).trim()))].sort();
  X.savePartner = (d) => { _.needMs('2', 'Hoa hồng (UI-22)');
    _.need('commission.pay');
    const errs = {}; const name = String(d.name || '').trim();
    if (!name) errs.name = 'Nhập tên đối tác';
    else if (!d.id && Q.partnerOf(name)) errs.name = 'Đối tác đã có – sửa dòng cũ';
    if (!String(d.bank || '').trim()) errs.bank = 'Nhập ngân hàng';
    if (!/^[\d ]{6,24}$/.test(String(d.number || '').trim())) errs.number = 'Số tài khoản 6–24 chữ số';
    if (!String(d.holder || '').trim()) errs.holder = 'Nhập chủ tài khoản';
    if (Object.keys(errs).length) fail(errs);
    const rec = { name, bank: d.bank.trim(), number: d.number.trim(), holder: d.holder.trim(), note: d.note || '' };
    const p = d.id ? S.update('partners', d.id, rec) : S.add('partners', rec);
    _.audit(d.id ? 'update' : 'create', 'partner', p.id, `${d.id ? 'Sửa' : 'Thêm'} tài khoản đối tác ${name}: ${rec.bank} ${rec.number}`); _.done(); return p;
  };

  /* Đối chiếu file hoa hồng T8 (SRC-09): web tính I = F × H từng dòng (F bỏ cọc tính lại từ công thức), gợi ý tỷ lệ theo chính sách tại 31/08 */
  Q.commissionBench = () => {
    const B = TH.data.p2 && TH.data.p2.commission; if (!B) return null;
    const pol = CM.policyAt(S.all('commissionPolicies'), '2026-08-31');
    const rows = B.rows.map(r => {
      const F0 = r.forfeit ? CM.forfeitBase(r.forfeit) : r.F;
      const sg = CM.suggest({ term: r.term, partner: r.recipientKind === 'partner' ? r.recipient : null, share: r.share }, pol);
      const web = r.I != null ? CM.amount(F0, r.H) : null;
      const why = CM.sameRate(sg.rate, r.H) ? '' : r.H === 0.35 ? 'Đối tác / người nhận áp 35% (thỏa thuận riêng)' : r.term !== 'forfeit' && Number(r.term) < 6 ? 'HĐ ngắn hạn – Excel không chia theo số tháng' : 'Tỷ lệ riêng ' + (r.H * 100).toFixed(2).replace(/\.?0+$/, '') + '%';
      return Object.assign({}, r, { Fweb: F0, suggested: sg.rate, reasons: sg.reasons, match: CM.sameRate(sg.rate, r.H), web, diff: web != null ? Math.round((web - r.I) * 100) / 100 : null, why });
    });
    const withI = rows.filter(r => r.I != null);
    const suggestedTotal = Math.round(withI.reduce((t, r) => t + CM.amount(r.Fweb, r.suggested), 0) * 100) / 100;
    return { period: B.period, sheet: B.sheet, rows, excelTotal: B.excelTotal, webTotal: Math.round(withI.reduce((t, r) => t + r.web, 0) * 100) / 100, suggestedTotal, suggestedDiff: Math.round((suggestedTotal - B.excelTotal) * 100) / 100,
      countI: withI.length, matched: withI.filter(r => r.match).length, mismatch: withI.filter(r => Math.abs(r.diff) > 0.01).length };
  };
})(window.TH);

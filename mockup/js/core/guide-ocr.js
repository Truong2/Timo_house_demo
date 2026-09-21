/* Panel Hướng dẫn – Phase 1 spec v1.8 Wave 2: F12 OCR hợp đồng & Data Onboarding (§12.8, §12.9) thay F12 P2 cũ + runAllOcr. Progress lưu chung store.state.guide. */
(function (TH) {
  const F = TH.f, Q = TH.q, St = TH.store, X = TH.actions, G = TH.guide; if (!G) return;
  const u = (c, f) => St.rawAll(c).filter(x => x && x.source === 'user' && (!f || f(x)));
  const ctx = () => {
    const jobs = u('ocrJobs').sort((a, b) => F.cmp(b.createdAt || '', a.createdAt || ''));
    const job = jobs[0] || null; const committed = jobs.find(j => j.status === 'COMMITTED') || null;
    const c = committed && committed.result ? St.rawGet('contracts', committed.result.contractId) : null;
    const b = c ? St.rawGet('buildings', c.buildingId) : null;
    return { job, committed, ocrContract: c, ocrBuilding: b, visited: St.state.guide.visited || {} };
  };
  const v = (c, path) => Object.keys(c.visited).some(k => k === path || k.startsWith(path + '?'));
  const jobRoute = (c) => c.job ? '#/contracts/ocr?id=' + c.job.id : '#/contracts/ocr';
  const OCR = [
    { key: 'F12', title: 'OCR hợp đồng & Data Onboarding', golive: '', ms: [
      { id: 'F12.1', title: 'Tải file mẫu, kiểm tra hash & chạy OCR', route: '#/contracts/ocr', role: 'ops', how: 'Vận hành → Trích xuất hợp đồng → chọn loại tài liệu "Hợp đồng thuê" → "Dùng file mẫu (.txt)" (hoặc "Mô phỏng ảnh JPG"). Bấm lại lần nữa để thấy cảnh báo trùng hash (AC-1).', expect: 'Job UPLOADED → PROCESSING → READY_FOR_REVIEW; upload cùng file không tạo job/HĐ trùng.', check: c => !!c.job, hl: 'ocr-sample' },
      { id: 'F12.2', title: 'Review 13 nhóm entity – xử lý xung đột khách hàng', route: c => jobRoute(c), role: 'ops', how: 'Nhóm "Khách hàng": CCCD trùng hồ sơ Nguyễn Thị Hương nhưng SĐT khác → sửa SĐT/tên (Cần kiểm tra), chọn Update (hoặc Link). Tòa & phòng đề xuất LINK; sửa "Đến ngày", "Tiền đặt cọc".', expect: 'Match CCCD → SĐT → tên+ngày sinh; xung đột bắt buộc review; tòa/phòng có sẵn không bị tạo trùng (§12.8.6).', check: c => !!c.job && ['REVIEWING', 'VALIDATED', 'COMMIT_FAILED', 'COMMITTED'].includes(c.job.status), hl: 'ocr-validate' },
      { id: 'F12.3', title: 'Giá dịch vụ HĐ ≠ giá tòa', route: c => jobRoute(c) + '&open=CONTRACT_SERVICE', role: 'ops', how: 'Nhóm "Dịch vụ & Giá": Điện 4.000đ ≠ giá riêng tòa Sunrise 3.800đ → chọn "Cập nhật giá tòa từ ngày 01/11/2026"; Internet 100.000 ≠ 200.000 → "Chỉ áp dụng cho HĐ này".', expect: 'Giá HĐ luôn snapshot vào Contract Service; giá tòa chỉ đổi khi người dùng chọn, tạo Service Price mới có hiệu lực, không ghi đè lịch sử (§12.8.10).', check: c => !!c.job && c.job.decisions && c.job.decisions.CONTRACT_SERVICE && Object.values(c.job.decisions.CONTRACT_SERVICE.items || {}).some(i => i.resolved), hl: 'ocr-validate' },
      { id: 'F12.4', title: 'Xem payload → Validate → Commit (có rollback)', route: c => jobRoute(c), role: 'ops', how: '"Xem payload" để soát dữ liệu sẽ ghi → "Validate" (lỗi hiện trong từng nhóm) → "Xác nhận tạo hợp đồng". Tick "Mô phỏng lỗi kỹ thuật" một lần để thấy COMMIT_FAILED + rollback, rồi "Thử lại commit".', expect: 'Commit 1 transaction: Customer → Building → Room → Contract + người thuê, dịch vụ snapshot, cọc RECEIVABLE, xe, chỉ số OPENING, tài sản bàn giao, điều khoản, tài liệu; lỗi → rollback toàn bộ (AC-9).', check: c => !!c.committed, hl: 'ocr-commit' },
      { id: 'F12.5', title: 'Kết quả & dữ liệu xuất hiện ở module liên quan', route: c => c.ocrContract ? '#/contracts/' + c.ocrContract.id + '?tab=deposit' : '#/contracts', role: 'ops', how: 'Màn Kết quả liệt kê entity Create/Link kèm link. Mở HĐ: tab Người thuê, Cọc (Deposit Ledger), Điều khoản & bàn giao, Tài liệu; tab Dịch vụ & Bảng giá của tòa Sunrise thấy giá điện mới sắp hiệu lực.', expect: 'HĐ ở Dự thảo (OCR không tự kích hoạt – AC-11), không tự gia hạn (AC-12); mọi bản ghi truy ngược được Job → File → Trang (§12.8.15–17).', check: c => !!c.ocrContract && v(c, '/contracts/' + c.ocrContract.id), hl: 'ocr-open-contract' },
    ] },
  ];
  const idx = G.FLOWS.findIndex(f => f.key === 'H1');
  G.FLOWS.splice(idx >= 0 ? idx + 1 : G.FLOWS.length, 0, ...OCR);
  OCR.forEach(f => f.ms.forEach(m => { const chk = m.check; const rt = m.route; m.check = (c) => chk(Object.assign({}, c, ctx())); if (typeof rt === 'function') m.route = (c) => rt(Object.assign({}, c || {}, ctx())); }));

  /* Chạy kỹ thuật F12 (dùng trong runAll): upload → review → resolve → validate → commit */
  G.runAllOcr = async () => {
    const log = []; const prevRole = TH.auth.role(); TH.auth.switchRole('ops');
    const O = TH.ocrOnb; const spec = TH.ocr.sampleSpec(); const tag = Date.now().toString().slice(-5);
    const j = X.ocrUpload({ fileName: 'HD-cho-thue-phong-auto-' + tag + '.txt', size: 12 * 1024, text: TH.ocr.sampleText() + '\n[auto ' + tag + ']', pages: 4, docType: 'contract' }); X.ocrExtract(j.id); X.ocrFinish(j.id); log.push('OCR ' + j.code);
    const room = St.where('rooms', r => r.status === 'ready' && r.buildingId === spec.room.buildingId && r.id !== spec.room.id)[0] || spec.room;
    X.ocrSetField(j.id, 'contractNo', spec.contractNo.replace('12/', tag.slice(-2) + '/')); X.ocrSetField(j.id, 'tenantName', spec.tenantName); X.ocrSetField(j.id, 'phone', spec.phone); X.ocrSetField(j.id, 'end', spec.end); X.ocrSetField(j.id, 'deposit', String(spec.deposit)); X.ocrSetField(j.id, 'roomCode', room.code);
    j.fields.filter(f => f.decision === 'pending').forEach(f => X.ocrConfirmField(j.id, f.key));
    const S = O.sections(j); const cust = S.find(s => s.key === 'CUSTOMER'); const svc = S.find(s => s.key === 'CONTRACT_SERVICE');
    if (cust.match) X.ocrDecide(j.id, 'CUSTOMER', { decision: 'update', candidateId: cust.match.id }); else X.ocrDecide(j.id, 'CUSTOMER', { decision: 'create' });
    X.ocrDecide(j.id, 'ROOM', { decision: 'link', candidateId: room.id });
    svc.conflicts.forEach(i => X.ocrServiceMode(j.id, i.key, { mode: i.key === 'svc_electric' ? 'updateBuilding' : 'snapshot', effectiveFrom: '2026-11-01' }));
    // Nếu HĐ trùng (khách+phòng+ngày) do lần chạy trước → đổi ngày bắt đầu
    let val = X.ocrValidate(j.id); if (!val.ok && val.errors.some(e => /Trùng hợp đồng/.test(e.msg))) { const st = F.addDays(F.fromVN(spec.start), Math.floor(Math.random() * 20) + 1); X.ocrSetField(j.id, 'start', F.date(st)); X.ocrSetField(j.id, 'end', F.date(F.addDays(F.addMonths(st, 12), -1))); val = X.ocrValidate(j.id); }
    if (!val.ok) throw new Error('OCR validate: ' + val.errors.map(e => e.msg).join('; '));
    try { X.ocrCommit(j.id, { simulateFail: true }); } catch (e) { log.push('rollback OK'); }
    X.ocrRetry(j.id); const r = X.ocrCommit(j.id); log.push('HĐ ' + (Q.contract(r.contractId) || {}).code + ' (' + r.entities.length + ' entity)');
    St.state.guide.visited = Object.assign(St.state.guide.visited || {}, { '/contracts/ocr': 1, ['/contracts/' + r.contractId]: 1 });
    if (prevRole && prevRole !== 'ops') try { TH.auth.switchRole(prevRole); } catch (e) { }
    return log.join(' · ');
  };
})(window.TH);

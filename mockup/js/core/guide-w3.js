/* Panel Hướng dẫn – Phase 1 spec v1.8 Wave 3: F13 "HĐ sắp hết hạn, trả phòng & vận hành theo kỳ" (§4.11, §4.13, §4.17, §12.11) + runAllW3. */
(function (TH) {
  const F = TH.f, Q = TH.q, St = TH.store, X = TH.actions, G = TH.guide; if (!G) return;
  const u = (c, f) => St.rawAll(c).filter(x => x && x.source === 'user' && (!f || f(x)));
  const ctx = () => { const fu = u('contractFollowUps').sort((a, b) => F.cmp(b.at || '', a.at || ''))[0] || null; const pendEnd = St.rawAll('contracts').find(c => c && c.status === 'pending_end') || null; const bpLocked = St.rawAll('billingPeriods').find(b => b && b.status === 'LOCKED' && b.lockedBy) || null; const confirmed = St.rawAll('meterReadings').filter(m => m && m.status === 'confirmed' && m.confirmedBy).length; return { fu, pendEnd, bpLocked, confirmed, visited: St.state.guide.visited || {} }; };
  const v = (c, path) => Object.keys(c.visited).some(k => k === path || k.startsWith(path + '?'));
  const W3 = [
    { key: 'F13', title: 'HĐ sắp hết hạn, trả phòng & vận hành theo kỳ', golive: '', ms: [
      { id: 'F13.1', title: 'Work Queue HĐ sắp hết hạn – ghi nhận liên hệ', route: '#/contracts/expiring', role: 'ops', how: 'Vận hành → HĐ sắp hết hạn: bảng đủ cột (khách, người ở cùng, quản lý, còn lại, công nợ, liên hệ gần nhất, kết quả, deadline). Bấm "Ghi nhận liên hệ" trên một dòng → kết quả "Đã liên hệ"/"Chưa phản hồi".', expect: 'Hệ thống chỉ tạo work queue – không tự gia hạn/kết thúc (§4.11). Kết quả & deadline hiện trên dòng; có thể giao người xử lý, export.', check: c => !!c.fu, hl: 'expiring-follow' },
      { id: 'F13.2', title: 'Gia hạn → HĐ mới Dự thảo → duyệt', route: '#/contracts/expiring?result=renew', role: 'ops', how: 'Trên Work Queue chọn "Gia hạn → HĐ mới dự thảo" (hoặc kết quả Gia hạn khi ghi nhận liên hệ): review giá/cọc/dịch vụ/thời hạn → Gửi duyệt → Duyệt & kích hoạt.', expect: 'HĐ cũ → Chờ gia hạn, HĐ mới Dự thảo → Chờ duyệt → Hiệu lực kế tiếp; gia hạn không ghi đè HĐ cũ (§12.7.4); tab Gia hạn hiện chuỗi HĐ.', check: c => St.rawAll('contracts').some(x => x && x.source === 'user' && x.contractType === 'renewal'), hl: 'contracts-table' },
      { id: 'F13.3', title: 'Xác nhận trả phòng → phòng Sắp trống', route: c => c.pendEnd ? '#/contracts/' + c.pendEnd.id : '#/contracts?status=active', role: 'ops', how: 'Chi tiết HĐ hiệu lực → "Xác nhận trả phòng": loại kết thúc, lý do chuẩn (Master Data), ngày thông báo, ngày ra dự kiến.', expect: 'HĐ → Chờ kết thúc; phòng → Sắp trống (tab Sắp trống ở Phòng, lịch sử trạng thái ghi lý do/tham chiếu HĐ); đến ngày ra phòng tự sang Chờ dọn.', check: c => St.rawAll('contracts').some(x => x && x.source === 'user' && ['pending_end', 'pending_settlement', 'ended'].includes(x.status) && x.moveOutDate), hl: 'contract-terminate' },
      { id: 'F13.4', title: 'Điện nước theo kỳ: nhập → validate → xác nhận', route: '#/meters', role: 'accountant', how: 'Tài chính → Điện / Nước: chọn kỳ & tòa → nhập chỉ số mới (hoặc "Copy chỉ số kỳ trước"), đính ảnh công tơ → "Xác nhận chỉ số". Thử nhập mới < cũ để thấy chặn.', expect: 'Validate: mới < cũ, thiếu chỉ số, trùng kỳ, bất thường ±50%; chỉ số đã xác nhận/đã dùng hóa đơn chỉ sửa qua "mở lại" có lý do (§12.10.3); tab Lịch sử theo kỳ.', check: c => c.confirmed > 0, hl: 'meter-confirm' },
      { id: 'F13.5', title: 'Kỳ hóa đơn: khóa kỳ & mở lại có lý do', route: '#/finance/periods', role: 'accountant', how: 'Tài chính → Kỳ hóa đơn: xem thống kê kỳ, "Khóa kỳ" (bị chặn nếu còn hóa đơn nháp – tick khóa cưỡng bức), rồi thử tạo hóa đơn kỳ đã khóa; "Mở lại kỳ" cần lý do (Admin).', expect: 'Kỳ LOCKED chặn tạo/phát hành hóa đơn & sửa chỉ số của kỳ; mọi thao tác có audit (§12.11.1).', check: c => !!c.bpLocked, hl: 'period-lock' },
      { id: 'F13.6', title: 'Khách thuê: trạng thái, cờ suy ra, bulk update, export theo bộ lọc', route: '#/tenants?hasContract=yes', role: 'admin', how: 'Khách thuê: lọc Tổ chức/Quản lý/Tòa/Phòng/HĐ hiệu lực/Công nợ/Zalo/Vai trò → chọn nhiều → "Cập nhật trạng thái" (preview số khách) → "Xuất theo bộ lọc" (file ghi thời điểm + điều kiện).', expect: 'Chỉ một field Trạng thái (Master Data); HĐ hiệu lực / sắp hết / công nợ / hoàn cọc / Zalo là cờ riêng, không đổi trạng thái tự động (§4.8).', check: c => St.rawAll('auditLog').some(x => x && x.action === 'bulk_status'), hl: 'tenants-table' },
    ] },
  ];
  const idx = G.FLOWS.findIndex(f => f.key === 'F12');
  G.FLOWS.splice(idx >= 0 ? idx + 1 : G.FLOWS.length, 0, ...W3);
  W3.forEach(f => f.ms.forEach(m => { const chk = m.check; const rt = m.route; m.check = (c) => chk(Object.assign({}, c, ctx())); if (typeof rt === 'function') m.route = (c) => rt(Object.assign({}, c || {}, ctx())); }));

  G.runAllW3 = async () => {
    const log = []; const prevRole = TH.auth.role(); TH.auth.switchRole('ops'); const tag = Date.now().toString().slice(-4);
    // F13.1–2: follow-up + renewal
    const q = Q.expiringQueue().find(x => x.c.status === 'active' && !x.c.renewedToId); if (q) { X.addFollowUp({ contractId: q.c.id, result: 'contacted', note: 'Auto ' + tag }); const n = X.renewContract(q.c.id, { end: F.addDays(F.addMonths(q.c.end, 12), 0) }); X.submitContract(n.id); TH.auth.switchRole('admin'); X.approveContract(n.id, { key: 'auto-renew:' + n.id }); log.push('Gia hạn ' + q.c.code + ' → ' + n.code); TH.auth.switchRole('ops'); }
    // F13.3: confirm move-out on another active contract
    const c = St.rawAll('contracts').find(x => x && x.status === 'active' && !x.renewedToId && F.daysUntil(x.end) > 60); if (c) { X.confirmMoveOut(c.id, { moveOutDate: F.addDays(F.today(), 10), endType: 'early_tenant', reasonCode: 'early_tenant', note: 'Auto ' + tag }); log.push('Trả phòng ' + c.code + ' → ' + Q.room(c.roomId).status); }
    // F13.4: meters
    TH.auth.switchRole('accountant'); const period = St.state.meta.period; const row = Q.meterRows(period).find(x => x.contract && !x.electric.cur); if (row) { X.saveMeterRow({ roomId: row.room.id, period, type: 'electric', curr: row.electric.prevValue + 90 }); X.saveMeterRow({ roomId: row.room.id, period, type: 'water', curr: row.water.prevValue + 4 }); const r = X.confirmReadings(period, { buildingId: row.room.buildingId }); log.push('Chỉ số ' + row.room.code + ' xác nhận ' + r.confirmed); }
    // F13.5: lock/reopen previous period
    const prev = Q.billingPeriods().find(b => b.code < period && b.status !== 'LOCKED') || null; if (prev) { X.lockBillingPeriod(prev.code, { force: true }); log.push('Khóa kỳ ' + prev.code); } else { const bp = Q.billingPeriods().find(b => b.code < period); if (bp) { TH.auth.switchRole('admin'); X.reopenBillingPeriod(bp.code, 'Auto ' + tag); X.lockBillingPeriod(bp.code, { force: true }); log.push('Mở lại & khóa kỳ ' + bp.code); } }
    // F13.6: bulk tenant status
    TH.auth.switchRole('admin'); const ts = St.rawAll('tenants').filter(t => t && t.source === 'user').slice(0, 2).map(t => t.id); if (ts.length) { X.bulkTenantStatus(ts, 'active', 'Auto ' + tag); log.push('Bulk trạng thái ' + ts.length + ' khách'); }
    St.state.guide.visited = Object.assign(St.state.guide.visited || {}, { '/contracts/expiring': 1, '/meters': 1, '/finance/periods': 1, '/tenants': 1 });
    if (prevRole && prevRole !== 'admin') try { TH.auth.switchRole(prevRole); } catch (e) { }
    return log.join(' · ');
  };
})(window.TH);

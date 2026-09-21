/* Dữ liệu trình diễn Phase 1: một nguồn duy nhất, chỉ điền form và không tự submit. */
(function (TH) {
  const F = TH.f, U = TH.ui, St = TH.store, esc = F.esc;
  const D = {};
  const TODAY = '2026-10-28';
  const PERIOD = '2026-10';

  D.profile = Object.freeze({
    id: 'phase1-nguyen-demo-khach',
    name: 'Full flow Phase 1 – Nguyễn Demo Khách',
    today: TODAY,
    period: PERIOD,
    landlord: { type: 'person', name: 'Nguyễn Demo Chủ Nhà', phone: '0909 000 111', email: 'demo.chunha@gmail.com', taxCode: '0109998888', bankAccount: 'Vietcombank – 0123456789', address: '99 Đường Demo, Cầu Giấy, Hà Nội', cycleMonths: 3, status: 'active' },
    area: { code: 'KV-CG-DEMO', name: 'Khu Cầu Giấy', districtsText: 'Cầu Giấy, Nam Từ Liêm' },
    building: { code: 'TH-DEMO-01', name: 'Tòa Demo Onboard', address: '99 Đường Demo, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', prefix: 'Z', floors: 5, perFloor: 4 },
    ownerContract: { signedDate: '2026-10-01', type: 'Hợp đồng thuê tòa nhà', start: '2026-10-01', end: '2029-09-30', rent: 90000000, deposit: 180000000, priceHoldMonths: 24, cycleMonths: 3, note: 'Hợp đồng đầu vào dùng cho demo Phase 1.' },
    rooms: { floorFrom: 1, floorTo: 5, perFloor: 4, type: 'Phòng đơn', area: 25, price: 6500000, skip: false },
    roomCode: 'Z.01.01',
    tenant: { name: 'Nguyễn Demo Khách', phone: '0912 000 111', zalo: '0912 000 111', email: 'demo.khach@gmail.com', idNumber: '012345678999', idPlace: 'Cục Cảnh sát QLHC về TTXH', dob: '1995-06-15', address: 'Cầu Giấy, Hà Nội', job: 'Nhân viên văn phòng', segment: 'Văn phòng', verified: true, note: 'Khách mẫu xuyên suốt luồng demo Phase 1.' },
    contract: { start: '2026-10-01', end: '2027-09-30', cycle: 'monthly', payDay: 5, listPrice: 6500000, price: 6500000, deposit: 13000000, note: 'Thu tiền ngày 05 hàng tháng.' },
    services: [
      { code: 'INTERNET', name: 'Internet', price: 200000, qty: 1, note: 'Gói Internet phòng' },
      { code: 'QUANLY', name: 'Phí quản lý', price: 150000, qty: 1, note: 'Phí quản lý tháng' },
      { code: 'GUIXE', name: 'Gửi xe', price: 100000, qty: 1, note: '01 xe máy' }
    ],
    meter: { electricDelta: 150, waterDelta: 12 },
    invoice: { period: PERIOD, expectedTotal: 7715000, issueLater: true },
    payment: { date: TODAY, amount: 3000000, method: 'Chuyển khoản', ref: 'CK289104', note: 'Khách thanh toán một phần hóa đơn kỳ 10/2026.', remaining: 4715000 },
    termination: { endType: 'early_tenant', reasonCode: 'early_tenant', noticeDate: TODAY, actualEnd: TODAY, issueFinal: true },
    refund: { inspection: { wall: 'ok', furniture: 'minor', utilities: 'ok', devices: 'ok' }, offsetDebt: true, debtOffset: 4715000, deductions: [{ group: 'Khấu hao', desc: 'Khấu hao thiết bị phòng Z.01.01', amount: 200000 }, { group: 'Dịch vụ', desc: 'Vệ sinh phòng Z.01.01', amount: 200000 }], amount: 7885000, paidDate: TODAY, paidMethod: 'Chuyển khoản', paidRef: 'UNC289104', paidEvidence: 'uy_nhiem_chi_hoan_coc.pdf' },
    expense: { date: TODAY, docDate: TODAY, desc: 'Sửa khóa phòng Z.01.01', amount: 350000, payMethod: 'cash', supplier: 'Thợ khóa Minh Tâm', recordType: 'ops', note: 'Chi phí sửa khóa thuộc Tòa Demo Onboard.' },
    user: { name: 'Lê Demo Vận Hành', email: 'demo.vanhanh@timohouse.vn', phone: '0913 222 333', role: 'ops', region: 'Cầu Giấy', effectiveDate: TODAY, status: 'active', note: 'Phụ trách Tòa Demo Onboard.' }
  });

  const P = D.profile;
  const raw = c => St.rawAll ? St.rawAll(c) : (St.state[c] || []);
  const norm = s => F.norm(String(s || ''));
  D.context = () => {
    const landlord = raw('landlords').find(x => norm(x.name) === norm(P.landlord.name) || norm(x.phone) === norm(P.landlord.phone));
    const area = raw('areas').find(x => x.code === P.area.code || norm(x.name) === norm(P.area.name));
    const building = raw('buildings').find(x => x.code === P.building.code || norm(x.name) === norm(P.building.name));
    const room = building && raw('rooms').find(x => x.buildingId === building.id && x.code === P.roomCode);
    const tenant = raw('tenants').find(x => norm(x.phone) === norm(P.tenant.phone) || (norm(x.name) === norm(P.tenant.name) && x.source === 'user'));
    const contract = room && tenant && raw('contracts').filter(x => x.roomId === room.id && x.tenantId === tenant.id).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0];
    const invoice = contract && raw('invoices').filter(x => x.contractId === contract.id && x.period === PERIOD && x.docStatus !== 'cancelled').sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0];
    const payment = invoice && raw('paymentAllocations').map(a => ({ a, p: raw('payments').find(p => p.id === a.paymentId) })).filter(x => x.a.invoiceId === invoice.id && x.p && x.p.status !== 'reversed').sort((a, b) => String(b.p.createdAt || '').localeCompare(String(a.p.createdAt || '')))[0]?.p;
    const refund = contract && raw('refunds').filter(x => x.contractId === contract.id).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0];
    return { landlord, area, building, room, tenant, contract, invoice, payment, refund };
  };

  const defs = {
    landlord: { title: 'Thông tin chủ nhà', values: P.landlord },
    area: { title: 'Thêm nhanh Khu nhà', values: P.area },
    'owner-contract': { title: 'Hợp đồng đầu vào', values: P.ownerContract },
    building: { title: 'Tòa nhà mới', values: P.building, relations: 'Khu nhà quản lý: Khu Cầu Giấy' },
    rooms: { title: 'Sinh phòng cho Tòa Demo Onboard', values: P.rooms, relations: 'Tạo 20 phòng Z.01.01 → Z.05.04' },
    tenant: { title: 'Hồ sơ khách thuê', values: P.tenant },
    contract: { title: 'Hợp đồng khách thuê', values: P.contract, relations: 'Nguyễn Demo Khách → TH-DEMO-01 → Z.01.01; 3 dịch vụ cố định = 450.000đ' },
    activation: { title: 'Chứng từ khi kích hoạt', values: { depositNow: true, depositMethod: 'Chuyển khoản', depositDate: TODAY, firstInvoice: false }, relations: 'Ghi nhận cọc khi kích hoạt; tạo hóa đơn kỳ 10/2026 ở bước Hóa đơn để trình diễn kiểm tra điện nước.' },
    'invoice-scope': { title: 'Phạm vi lập hóa đơn', values: { period: PERIOD, building: P.building.name, services: 'Tiền phòng, Điện, Nước, Dịch vụ cố định', issueLater: true } },
    meter: { title: 'Chỉ số điện nước', values: { room: P.roomCode, electricNew: 'Chỉ số cũ + 150 kWh', waterNew: 'Chỉ số cũ + 12 m³' }, relations: 'Hóa đơn dự kiến: 7.715.000đ' },
    zalo: { title: 'Gửi hóa đơn / nhắc nợ Zalo', values: { customer: P.tenant.name, room: P.roomCode, invoicePeriod: PERIOD, remaining: P.payment.remaining }, relations: 'Chỉ xem trước và chọn đúng người nhận; người demo vẫn bấm Xác nhận gửi.' },
    payment: { title: 'Thu tiền một phần', values: P.payment, relations: 'Phân bổ vào hóa đơn kỳ 10/2026; còn nợ 4.715.000đ' },
    termination: { title: 'Kết thúc hợp đồng', values: P.termination },
    'refund-inspection': { title: 'Hiện trạng trả phòng', values: P.refund.inspection },
    'refund-deductions': { title: 'Khấu trừ hoàn cọc', values: { deductions: P.refund.deductions, offsetDebt: true, debtOffset: P.refund.debtOffset, expectedRefund: P.refund.amount } },
    'refund-paid': { title: 'Chứng từ hoàn cọc', values: { paidDate: P.refund.paidDate, paidMethod: P.refund.paidMethod, paidRef: P.refund.paidRef, paidEvidence: P.refund.paidEvidence } },
    expense: { title: 'Chi phí vận hành', values: P.expense, relations: 'Liên kết Tòa Demo Onboard; diễn giải nêu rõ phòng Z.01.01' },
    import: { title: 'Import khách thuê', kind: 'file', values: { file: 'mau-import-khach-phase1.csv', validRooms: 'Z.01.02, Z.01.03, Z.01.04', intentionalErrors: 'Trùng SĐT, CCCD sai, thiếu SĐT, phòng Z.99.99 không tồn tại' } },
    user: { title: 'Tài khoản vận hành', values: P.user, relations: 'Phạm vi: Tòa Demo Onboard' }
  };
  D.get = key => defs[key] ? Object.assign({ kind: 'form' }, defs[key]) : null;

  D.bar = key => {
    const d = defs[key]; if (!d) return '';
    return `<div class="demo-sample-bar" data-demo-bar-key="${esc(key)}" role="region" aria-label="Dữ liệu trình diễn ${esc(d.title)}"><div class="demo-sample-copy"><span class="demo-sample-badge">Dữ liệu demo</span><div><b>${esc(P.name)}</b><small>${esc(d.title)} · Chỉ điền form, không tự lưu</small></div></div><div class="demo-sample-actions">${U.btn({ label: 'Xem dữ liệu mẫu', icon: 'eye', cls: 'btn-outline', size: 'btn-sm', attrs: { 'data-demo-view': key } })}${U.btn({ label: d.kind === 'file' ? 'Dùng file mẫu' : 'Điền dữ liệu mẫu', icon: d.kind === 'file' ? 'file-check' : 'pencil', cls: 'btn-primary', size: 'btn-sm', attrs: { 'data-demo-fill': key } })}</div></div>`;
  };

  const label = k => ({ type: 'Loại', name: 'Tên', phone: 'Số điện thoại', email: 'Email', taxCode: 'Mã số thuế', bankAccount: 'Tài khoản nhận', address: 'Địa chỉ', cycleMonths: 'Chu kỳ trả', status: 'Trạng thái', code: 'Mã', districtsText: 'Quận/Huyện', signedDate: 'Ngày ký', start: 'Ngày bắt đầu', end: 'Ngày kết thúc', rent: 'Giá thuê/tháng', deposit: 'Tiền cọc', priceHoldMonths: 'Giữ giá', note: 'Ghi chú', floorFrom: 'Từ tầng', floorTo: 'Đến tầng', perFloor: 'Phòng/tầng', area: 'Diện tích', price: 'Giá thuê', dob: 'Ngày sinh', idNumber: 'CCCD', job: 'Nghề nghiệp', segment: 'Phân khúc', payDay: 'Ngày thu', listPrice: 'Giá niêm yết', amount: 'Số tiền', method: 'Phương thức', ref: 'Mã tham chiếu', actualEnd: 'Ngày kết thúc thực tế', reason: 'Lý do', paidRef: 'Mã UNC', paidEvidence: 'Chứng từ', role: 'Vai trò', region: 'Khu vực', effectiveDate: 'Ngày hiệu lực', building: 'Tòa nhà', room: 'Phòng', period: 'Kỳ' }[k] || k);
  const fmt = v => typeof v === 'boolean' ? (v ? 'Có' : 'Không') : typeof v === 'number' ? F.vnd(v) : Array.isArray(v) ? v.map(x => typeof x === 'object' ? Object.values(x).join(' · ') : x).join('<br>') : String(v ?? '');
  D.view = key => {
    const d = defs[key]; if (!d) return;
    U.modal({ title: 'Dữ liệu mẫu – ' + d.title, size: 'md', sub: P.name, body: `<div class="sample-meta"><dl>${Object.entries(d.values || {}).map(([k, v]) => `<dt>${esc(label(k))}</dt><dd>${Array.isArray(v) ? fmt(v) : esc(fmt(v))}</dd>`).join('')}</dl></div>${d.relations ? U.note('info', 'Liên kết dữ liệu', esc(d.relations)) : ''}${U.note('info', 'Nguyên tắc demo', 'Nút điền mẫu chỉ cập nhật trường trên màn hình. Dữ liệu chỉ được tạo khi người demo bấm Lưu/Tiếp tục/Xác nhận.')}` });
  };

  const fire = el => { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
  const setOne = (root, name, value) => {
    if (!root) return false;
    const all = [...root.querySelectorAll(`[name="${CSS.escape(name)}"]`)]; if (!all.length) return false;
    const el = all[0];
    if (el.type === 'radio') { const hit = all.find(x => String(x.value) === String(value)); if (!hit) return false; hit.checked = true; fire(hit); return true; }
    if (el.type === 'checkbox') { el.checked = !!value; fire(el); return true; }
    if (el.tagName === 'SELECT') {
      const exact = [...el.options].find(o => String(o.value) === String(value));
      const byText = [...el.options].find(o => norm(o.textContent).includes(norm(value)));
      const opt = exact || byText; if (!opt) return false; el.value = opt.value; fire(el); return true;
    }
    el.value = el.hasAttribute('data-money') && value !== '' ? F.vnd(value) : value;
    fire(el); return true;
  };
  const setMany = (root, values) => Object.entries(values).reduce((n, [k, v]) => n + (setOne(root, k, v) ? 1 : 0), 0);
  const scopeOf = (key, trigger) => {
    const bar = trigger && trigger.closest('[data-demo-bar-key]');
    if (bar) return bar.parentElement || document;
    if (['tenant', 'payment', 'termination', 'refund-paid', 'expense', 'user', 'area', 'zalo'].includes(key)) return document.querySelector('#overlay-root .overlay:last-child') || document;
    if (key === 'contract') return document.getElementById('cf') || document;
    return document.getElementById('content') || document;
  };
  const missing = (what, href, button) => {
    const m = U.modal({ title: 'Thiếu dữ liệu tiền đề', size: 'sm', body: U.note('warn', what, 'Bộ tự điền không chọn record seed ở tòa khác để tránh sai liên kết.'), footer: U.btn({ label: 'Đóng', act: 'close-demo', cls: 'btn-ghost' }) + U.btn({ label: button || 'Đi tới bước cần làm', icon: 'arrow-right', cls: 'btn-primary', attrs: { 'data-demo-go': href } }) });
    m.el.querySelector('[data-act=close-demo]').addEventListener('click', () => m.close());
    return false;
  };
  const attachFile = (root, name, dzName) => {
    const dz = root.querySelector(`[data-dz="${dzName}"]`) || root.querySelector('[data-dz]'); if (!dz) return false;
    dz._files = [{ name, size: 286 * 1024, type: 'application/pdf' }]; if (dz._render) dz._render(); return true;
  };
  const selectDemoEntities = (root, ctx) => {
    let n = 0;
    n += setOne(root, 'tenantId', ctx.tenant.id) ? 1 : 0;
    n += setOne(root, 'buildingId', ctx.building.id) ? 1 : 0;
    n += setOne(root, 'roomId', ctx.room.id) ? 1 : 0;
    return n;
  };

  D.apply = async (key, root, trigger) => {
    const d = defs[key]; if (!d) return false; root = root || scopeOf(key, trigger); const c = D.context(); let n = 0;
    if (key === 'landlord') { n = setMany(root, P.landlord); const ops = raw('users').find(x => x.role === 'ops' && x.status === 'active'); if (ops) n += setOne(root, 'managerId', ops.id) ? 1 : 0; }
    else if (key === 'area') n = setMany(root, P.area);
    else if (key === 'owner-contract') n = setMany(root, P.ownerContract);
    else if (key === 'building') { n = setMany(root, P.building); const ops = raw('users').find(x => x.role === 'ops' && x.status === 'active'); if (ops) n += setOne(root, 'managerId', ops.id) ? 1 : 0; const areaOpt = root.querySelector('select[name=areaRef]'); if (areaOpt) { const opts = [...areaOpt.options]; const o = opts.find(x => /\(mới\)/i.test(x.textContent) && norm(x.textContent).includes(norm(P.area.name))) || opts.find(x => norm(x.textContent).includes(norm(P.area.code))) || opts.find(x => norm(x.textContent).includes(norm(P.area.name))); if (o) { areaOpt.value = o.value; fire(areaOpt); n++; } else U.toast('warn', 'Chưa có Khu Cầu Giấy trong wizard', 'Bấm Thêm nhanh, điền mẫu Khu nhà rồi quay lại tòa.'); } }
    else if (key === 'rooms') n = setMany(root, P.rooms);
    else if (key === 'tenant') n = setMany(root, P.tenant);
    else if (key === 'contract') {
      if (!c.building || !c.room || !c.tenant) return missing('Cần hoàn tất onboarding Tòa Demo Onboard, phòng Z.01.01 và tạo Nguyễn Demo Khách trước.', '#/landlords/new', 'Mở onboarding Chủ nhà');
      n += selectDemoEntities(root, c); n += setMany(root, P.contract);
      const remove = () => root.querySelector('#svc-body [data-act=rm-svc]'); let guard = 0; while (remove() && guard++ < 20) remove().click();
      P.services.forEach(s => { const add = root.querySelector('[data-act=add-svc]'); if (add) add.click(); let rows = root.querySelectorAll('#svc-body tr'); const idx = rows.length - 1; if (idx < 0) return; const svc = raw('services').find(x => x.code === s.code || norm(x.name) === norm(s.name)); if (svc) setOne(root, `sv_id_${idx}`, svc.id); rows = root.querySelectorAll('#svc-body tr'); const row = rows[idx]; if (!row) return; setOne(row, `sv_price_${idx}`, s.price); setOne(row, `sv_qty_${idx}`, s.qty); setOne(row, `sv_note_${idx}`, s.note); n += 4; });
    } else if (key === 'activation') n = setMany(root, { depositNow: true, depositMethod: 'Chuyển khoản', depositDate: TODAY, firstInvoice: false });
    else if (key === 'invoice-scope') {
      if (!c.building || !c.contract) return missing('Cần có hợp đồng hiệu lực tại phòng Z.01.01 trước khi lập hóa đơn.', '#/contracts/new', 'Mở tạo Hợp đồng');
      const q = Object.assign({}, (TH.router.current || {}).query || {}, { step: 1, period: PERIOD, buildingId: c.building.id, svc: 'RENT,DIEN,NUOC,FIXED', issue: 'later', room: '' });
      TH.router.replaceQuery(q); TH.router.refresh(); n = 6;
    } else if (key === 'meter') {
      if (!c.room || !c.contract) return missing('Chưa có phòng Z.01.01 với hợp đồng hiệu lực.', '#/contracts/new', 'Mở tạo Hợp đồng');
      const ep = root.querySelector(`input[data-m=electricPrev][data-r="${CSS.escape(c.room.id)}"]`), ec = root.querySelector(`input[data-m=electricCurr][data-r="${CSS.escape(c.room.id)}"]`), wp = root.querySelector(`input[data-m=waterPrev][data-r="${CSS.escape(c.room.id)}"]`), wc = root.querySelector(`input[data-m=waterCurr][data-r="${CSS.escape(c.room.id)}"]`);
      if (!ec || !wc) return missing('Phạm vi hóa đơn chưa chứa phòng Z.01.01. Hãy chọn Tòa Demo Onboard ở bước phạm vi.', '#/invoices/batch', 'Mở lập hóa đơn');
      ec.value = Number(ep.value || 0) + P.meter.electricDelta; fire(ec); wc.value = Number(wp.value || 0) + P.meter.waterDelta; fire(wc); n = 2;
    } else if (key === 'zalo') {
      if (!c.invoice) return missing('Cần phát hành hóa đơn kỳ 10/2026 của Nguyễn Demo Khách trước.', '#/invoices', 'Mở danh sách Hóa đơn');
      const sel = root.querySelector('select[name=templateId]'); if (sel) { const o = [...sel.options].find(x => /nhắc|hóa đơn/i.test(x.textContent)); if (o) { sel.value = o.value; fire(sel); n++; } }
      root.querySelectorAll('[data-ri]').forEach(x => { const row = x.closest('tr'); const good = row && norm(row.textContent).includes(norm(P.tenant.name)); x.checked = !!good && !x.disabled; fire(x); if (good) n++; });
    } else if (key === 'payment') {
      if (!c.invoice || !c.tenant) return missing('Cần phát hành hóa đơn kỳ 10/2026 của Nguyễn Demo Khách trước khi thu tiền.', '#/invoices', 'Mở danh sách Hóa đơn');
      n += setOne(root, 'tenantId', c.tenant.id) ? 1 : 0; n += setMany(root, P.payment);
      const auto = root.querySelector('[data-act=auto]'); if (auto) { auto.click(); n++; }
    } else if (key === 'termination') {
      if (!c.contract) return missing('Chưa có hợp đồng của Nguyễn Demo Khách tại phòng Z.01.01.', '#/contracts', 'Mở danh sách Hợp đồng');
      n = setMany(root, P.termination);
    } else if (key === 'refund-inspection') {
      if (!c.refund) return missing('Cần kết thúc hợp đồng và tạo hồ sơ hoàn cọc trước.', '#/contracts', 'Mở Hợp đồng');
      Object.entries(P.refund.inspection).forEach(([k, desired]) => { const el = root.querySelector(`[data-act=insp][data-k="${k}"]`); if (!el) return; const current = el.classList.contains('warn') ? 'minor' : el.classList.contains('on') ? 'ok' : 'bad'; if (current !== desired) { el.click(); n++; } });
    } else if (key === 'refund-deductions') {
      if (!c.refund) return missing('Cần kết thúc hợp đồng và tạo hồ sơ hoàn cọc trước.', '#/contracts', 'Mở Hợp đồng');
      while (root.querySelectorAll('#ded-body tr').length < 2) root.querySelector('[data-act=add-ded]')?.click();
      P.refund.deductions.forEach((x, i) => { n += setMany(root, { ['g_' + i]: x.group, ['d_' + i]: x.desc, ['a_' + i]: x.amount }); }); n += setOne(root, 'offsetDebt', true) ? 1 : 0; n += setOne(root, 'debtOffset', P.refund.debtOffset) ? 1 : 0;
    } else if (key === 'refund-paid') { if (!c.refund) return missing('Chưa có hồ sơ hoàn cọc đã duyệt.', '#/refunds', 'Mở Hoàn cọc'); n = setMany(root, { paidDate: P.refund.paidDate, paidMethod: P.refund.paidMethod, paidRef: P.refund.paidRef }); if (attachFile(root, P.refund.paidEvidence, 'ev')) n++; }
    else if (key === 'expense') { if (!c.building) return missing('Cần tạo Tòa Demo Onboard trước khi ghi nhận chi phí.', '#/landlords/new', 'Mở onboarding Chủ nhà'); n = setMany(root, P.expense); n += setOne(root, 'buildingId', c.building.id) ? 1 : 0; const cat = root.querySelector('select[name=categoryCode]'); if (cat) { const o = [...cat.options].find(x => /sửa|bảo trì/i.test(x.textContent) && !x.disabled); if (o) { cat.value = o.value; fire(cat); n++; } } }
    else if (key === 'user') { if (!c.building) return missing('Cần tạo Tòa Demo Onboard trước khi phân phạm vi tài khoản.', '#/landlords/new', 'Mở onboarding Chủ nhà'); n = setMany(root, P.user); n += setOne(root, 'b_' + c.building.id, true) ? 1 : 0; }
    else if (key === 'import') { if (!c.building || !c.room) return missing('Cần tạo dải phòng Z.* của Tòa Demo Onboard trước khi import.', '#/landlords/new', 'Mở onboarding Chủ nhà'); const inp = root.querySelector('[data-dz] input[type=file]'); if (inp) { const dt = new DataTransfer(); dt.items.add(D.sampleFile()); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true })); n = 1; } }
    U.toast(n ? 'ok' : 'info', n ? `Đã điền ${n} trường dữ liệu mẫu` : 'Không tìm thấy trường phù hợp trên màn hình', 'Chưa lưu/submit – hãy kiểm tra rồi bấm nút nghiệp vụ.');
    return !!n;
  };

  D.sampleFile = () => {
    const rows = [
      ['Nguyễn Demo Import 01', '0912 100 001', '012345670001', 'Z.01.02', '2026-10-01', '0912 100 001'],
      ['Nguyễn Demo Import 02', '0912 100 002', '012345670002', 'Z.01.03', '2026-10-05', ''],
      ['Nguyễn Demo Import 03', '0912 100 003', '012345670003', 'Z.01.04', '2026-10-10', ''],
      ['Dòng lỗi trùng SĐT', P.tenant.phone, '012345670004', 'Z.02.01', '2026-10-12', ''],
      ['Dòng lỗi CCCD', '0912 100 005', '12345', 'Z.02.02', '2026-10-12', ''],
      ['Dòng lỗi thiếu SĐT', '', '012345670006', 'Z.02.03', '2026-10-15', ''],
      ['Dòng lỗi phòng', '0912 100 007', '012345670007', 'Z.99.99', '2026-10-18', '']
    ];
    return new File(['\ufeff' + F.csv(rows, ['Họ tên', 'SĐT', 'CCCD', 'Phòng', 'Ngày bắt đầu thuê', 'Zalo'])], 'mau-import-khach-phase1.csv', { type: 'text/csv' });
  };

  D.restart = async () => {
    const ok = await U.confirm({ title: 'Bắt đầu lại demo Phase 1?', text: 'Toàn bộ dữ liệu nghiệp vụ sẽ được reset về seed sạch. Phase 2–3 bị tắt, ngày nghiệp vụ đặt 28/10/2026 và wizard Chủ nhà sẽ mở.', ok: 'Bắt đầu lại', danger: true });
    if (!ok) return false;
    St.reset(true); TH.phase.set(2, false); TH.phase.set(3, false); St.state.meta.today = TODAY; St.state.meta.period = PERIOD; St.state.guide = { done: {}, ts: {}, visited: {}, current: null, pin: {} }; St.saveNow(); TH.auth.login('admin', 'demo123'); TH._wz = TH._wz || {}; delete TH._wz.landlordOnboarding; document.getElementById('overlay-root').innerHTML = ''; U.openCount = 0; document.body.classList.remove('modal-open'); TH.go('#/landlords/new'); TH.layout.refreshTop(); TH.router.refresh(); U.toast('ok', 'Đã sẵn sàng demo Phase 1', 'Admin · ngày 28/10/2026 · kỳ 10/2026 · Phase 2–3 tắt'); return true;
  };

  const inject = (target, key) => { if (!target || target.querySelector(`:scope > [data-demo-bar-key="${key}"]`)) return; target.insertAdjacentHTML('afterbegin', D.bar(key)); };
  D.decorate = () => {
    const content = document.getElementById('content');
    const lf = document.getElementById('onboard-landlord'); if (lf) inject(lf.parentElement, 'landlord');
    const oc = document.getElementById('onboard-contract'); if (oc) inject(oc.parentElement, 'owner-contract');
    document.querySelectorAll('[data-new-building]').forEach(x => inject(x.querySelector('.card-b') || x, 'building'));
    document.querySelectorAll('[data-room-spec]').forEach(x => inject(x.querySelector('.card-b') || x, 'rooms'));
    const cf = document.getElementById('cf'); if (cf) inject(cf, 'contract');
    if (content && location.hash.includes('/contracts/new') && document.getElementById('act-opts')) inject(document.getElementById('act-opts').parentElement, 'activation');
    if (content && location.hash.includes('/invoices/batch')) inject(content, content.querySelector('input[data-m]') ? 'meter' : 'invoice-scope');
    if (content && location.hash.includes('/refunds/new')) { if (content.querySelector('#ded-body')) inject(content.querySelector('#ded-body').closest('.card-b') || content, 'refund-deductions'); else if (content.querySelector('[data-act=insp]')) inject(content.querySelector('[data-act=insp]').closest('.card-b') || content, 'refund-inspection'); }
    if (content && location.hash.includes('/settings/import') && /type=tenant/.test(location.hash)) inject(content, 'import');
    document.querySelectorAll('#overlay-root .overlay').forEach(ov => { if (ov.dataset.demoDecorated) return; const title = ov.querySelector('.drawer-h h2')?.textContent || ''; let key = '';
      if (/Thêm nhanh Khu nhà/i.test(title)) key = 'area'; else if (/Thêm khách thuê|Sửa khách thuê/i.test(title)) key = 'tenant'; else if (/Ghi nhận thu tiền/i.test(title)) key = 'payment'; else if (/Kết thúc hợp đồng/i.test(title)) key = 'termination'; else if (/Ghi nhận đã hoàn cọc/i.test(title)) key = 'refund-paid'; else if (/Thêm chi phí|Sửa chi phí/i.test(title)) key = 'expense'; else if (/Tạo tài khoản|Sửa tài khoản/i.test(title)) key = 'user'; else if (/Zalo|nhắc tiền|gửi hóa đơn/i.test(title)) key = 'zalo';
      if (key) { inject(ov.querySelector('.drawer-b'), key); ov.dataset.demoDecorated = '1'; }
    });
  };
  let raf = 0; const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(D.decorate); };
  document.addEventListener('click', async e => {
    const view = e.target.closest('[data-demo-view]'); if (view) { e.preventDefault(); return D.view(view.dataset.demoView); }
    const fill = e.target.closest('[data-demo-fill]'); if (fill) { e.preventDefault(); return D.apply(fill.dataset.demoFill, scopeOf(fill.dataset.demoFill, fill), fill); }
    const restart = e.target.closest('[data-demo-restart]'); if (restart) { e.preventDefault(); return D.restart(); }
    const go = e.target.closest('[data-demo-go]'); if (go) { e.preventDefault(); document.getElementById('overlay-root').innerHTML = ''; U.openCount = 0; document.body.classList.remove('modal-open'); TH.go(go.dataset.demoGo); }
  });
  window.addEventListener('hashchange', schedule); document.addEventListener('DOMContentLoaded', () => { new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true }); schedule(); });
  window.__timehouseDemo = Object.assign(window.__timehouseDemo || {}, { startPhase1Demo: D.restart, fillSample: (key, root) => D.apply(key, root || document), context: D.context, profile: P });
  TH.demoData = D;
})(window.TH);

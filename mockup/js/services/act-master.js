/* Actions – tòa nhà, phòng, chủ nhà, HĐ đầu vào, lịch trả chủ nhà (UI-02 → UI-05). */
(function (TH) {
  const S = TH.store, F = TH.f, X = TH.actions, _ = X._, Q = TH.q, Cc = TH.calc;

  X.addBuilding = (d) => {
    _.need('buildings.manage');
    const code = String(d.code || '').trim().toUpperCase();
    const errs = {};
    if (!code) errs.code = 'Nhập mã tòa'; else if (S.one('buildings', b => String(b.code).toUpperCase() === code)) errs.code = 'Mã tòa đã tồn tại (không phân biệt hoa/thường)';
    if (!String(d.address || '').trim()) errs.address = 'Nhập địa chỉ tòa nhà';
    if (!d.areaId) errs.areaId = 'Chọn khu vực';
    if (!d.managerId) errs.managerId = 'Chọn quản lý';
    if (Object.keys(errs).length) { const e = new Error('Dữ liệu chưa hợp lệ'); e.fields = errs; throw e; }
    const group = F.groupOf(code) || d.group || 'S';
    const tpl = { T: 'TECH', G: 'G1_TECH', S: 'VP' }[group];
    const b = S.add('buildings', { id: 'b_' + code, code, group, areaId: d.areaId, address: d.address.trim(), status: 'active', floors: Number(d.floors) || null,
      floorAreaM2: d.floorAreaM2 === '' || d.floorAreaM2 == null ? null : Number(d.floorAreaM2), businessRegistration: d.businessRegistration || '', features: d.features || '',
      template: tpl, accountId: (S.one('accounts', a => a.template === tpl) || {}).id, ownerRent: 0, operatedFrom: d.operatedFrom || F.today(), note: d.note || '' });
    S.add('assignments', { employeeId: d.managerId, buildingId: b.id, responsibility: 'operate', from: d.operatedFrom || F.today(), to: null, reason: 'Nhận tòa mới' });
    const n = Number(d.rooms) || 0, floors = Number(d.floors) || 1;
    for (let i = 0; i < n; i++) {
      const fl = 1 + Math.floor(i / Math.max(1, Math.ceil(n / floors))), num = fl * 100 + (i % Math.ceil(n / floors)) + 1;
      S.add('rooms', { id: 'r_' + num + code, code: num + code, buildingId: b.id, number: num, floor: fl, listPrice: 0, mgmtPrice: 0, price: 0, exploitation: 'timehouse', status: 'vacant_ready', type: 'Phòng đơn' });
    }
    _.audit('create', 'building', b.id, `Thêm tòa ${code} (${n} phòng)`);
    _.done(); return b;
  };
  /* Sửa hồ sơ tòa (UI-02): mã tòa không đổi; "ngừng khai thác" thay cho xóa – chỉ khi không còn lượt thuê hiệu lực */
  X.updateBuilding = (id, d) => {
    _.need('buildings.manage');
    const b = Q.building(id); if (!b) throw new Error('Không tìm thấy tòa');
    const errs = {};
    if (d.address != null && !String(d.address).trim()) errs.address = 'Nhập địa chỉ';
    if (d.areaId != null && d.areaId !== '' && !S.get('areas', d.areaId)) errs.areaId = 'Chọn khu vực';
    if (d.floors != null && d.floors !== '' && !(Number(d.floors) >= 1 && Number(d.floors) <= 60)) errs.floors = 'Số tầng từ 1 đến 60';
    if (d.floorAreaM2 != null && d.floorAreaM2 !== '' && !(Number(d.floorAreaM2) > 0)) errs.floorAreaM2 = 'Diện tích sàn phải lớn hơn 0';
    if (d.group && !['T', 'S', 'G'].includes(d.group)) errs.group = 'Nhóm T/S/G';
    if (d.status && !['active', 'inactive'].includes(d.status)) errs.status = 'Trạng thái không hợp lệ';
    if (d.status === 'inactive' && (Q.roomsByBuilding()[id] || []).some(r => Q.currentStay(r.id) || Q.pendingStay(r.id))) errs.status = 'Tòa còn lượt thuê hiệu lực – kết thúc lượt thuê trước khi ngừng khai thác';
    if (Object.keys(errs).length) { const e = new Error('Dữ liệu chưa hợp lệ'); e.fields = errs; throw e; }
    const patch = {};
    ['address', 'areaId', 'operatedFrom', 'level', 'note', 'status', 'group', 'template', 'accountId', 'businessRegistration', 'features'].forEach(k => { if (d[k] != null) patch[k] = typeof d[k] === 'string' ? d[k].trim() : d[k]; });
    if (d.floors != null && d.floors !== '') patch.floors = Number(d.floors);
    if (d.floorAreaM2 != null) patch.floorAreaM2 = d.floorAreaM2 === '' ? null : Number(d.floorAreaM2);
    if (patch.status === 'inactive') (Q.roomsByBuilding()[id] || []).forEach(r => S.update('rooms', r.id, { status: 'inactive' }));
    if (patch.status === 'active' && b.status === 'inactive') (Q.roomsByBuilding()[id] || []).forEach(r => { if (r.status === 'inactive') S.update('rooms', r.id, { status: 'vacant_cleaning' }); });
    const changed = Object.keys(patch).filter(k => String(patch[k] ?? '') !== String(b[k] ?? ''));
    S.update('buildings', id, patch);
    _.audit('update', 'building', id, `Sửa tòa ${b.code}: ${changed.join(', ') || 'không đổi'}`); _.done(); return Q.building(id);
  };
  X.updateBuildingProfile = (id, data) => X.updateBuilding(id, data);
  X.addRoom = (buildingId, d) => {
    _.need('buildings.manage');
    const b = Q.building(buildingId); const num = String(d.number ?? '').trim().toUpperCase();
    if (!b || !/^\d+[A-Z]*$/.test(num)) throw new Error('Nhập số phòng (cho phép hậu tố chữ)');
    const code = num + b.code;
    if (S.get('rooms', 'r_' + code)) throw new Error('Phòng ' + code + ' đã tồn tại');
    const r = S.add('rooms', { id: 'r_' + code, code, buildingId, number: num, floor: Number(d.floor) || Math.floor(parseInt(num,10) / 100), listPrice: Number(d.listPrice) || 0, mgmtPrice: d.mgmtPrice!=null?Number(d.mgmtPrice):Number(d.listPrice)||0, price: d.price!=null?Number(d.price):Number(d.listPrice)||0,
      area: Number(d.area) || null, readyDate: d.readyDate || null, exploitation: d.exploitation || 'timehouse', status: 'vacant_ready', type: d.type || 'Phòng đơn' });
    _.audit('create', 'room', r.id, 'Thêm phòng ' + code); _.done(); return r;
  };
  /* Sửa phòng (UI-03 E02): tầng, loại, diện tích, giá niêm yết / quản lý / cho thuê, loại khai thác, ngày sẵn sàng.
     Đổi giá phải có ngày hiệu lực (không vào kỳ đã khóa) và giữ lịch sử giá; phòng đang có khách không chuyển thành đồng hồ chung. */
  X.updateRoom = (id, d) => {
    _.need('buildings.manage');
    const r = Q.room(id); if (!r) throw new Error('Không tìm thấy phòng');
    const errs = {}; const num = (k) => d[k] == null || d[k] === '' ? null : Number(String(d[k]).replace(/\./g, '').replace(',', '.'));
    ['listPrice', 'mgmtPrice', 'price', 'area'].forEach(k => { const v = num(k); if (v != null && !(v >= 0)) errs[k] = 'Số không âm'; });
    if (num('floor') != null && !(num('floor') >= 0 && num('floor') <= 60)) errs.floor = 'Tầng từ 0 đến 60';
    if (d.exploitation && !TH.data.catalog.exploitation[d.exploitation]) errs.exploitation = 'Chọn loại khai thác';
    if (d.exploitation === 'meter_common' && Q.currentStay(id)) errs.exploitation = 'Phòng đang có khách – không chuyển thành đồng hồ chung';
    const priceChanged = ['listPrice', 'mgmtPrice', 'price'].some(k => num(k) != null && Math.abs(num(k) - (r[k] || 0)) > 0.5);
    if (priceChanged && !d.effectiveFrom) errs.effectiveFrom = 'Nhập ngày hiệu lực giá mới';
    if (Object.keys(errs).length) { const e = new Error('Dữ liệu chưa hợp lệ'); e.fields = errs; throw e; }
    if (priceChanged) _.guardEffective(d.effectiveFrom, 'giá phòng');
    const patch = {};
    ['listPrice', 'mgmtPrice', 'price', 'area', 'floor'].forEach(k => { const v = num(k); if (v != null) patch[k] = v; });
    ['type', 'exploitation', 'readyDate', 'note'].forEach(k => { if (d[k] != null && d[k] !== '') patch[k] = d[k]; });
    if (d.readyDate === '') patch.readyDate = null;
    if (priceChanged) patch.priceHistory = [...(r.priceHistory || []), { from: d.effectiveFrom, listPrice: r.listPrice, mgmtPrice: r.mgmtPrice, price: r.price, toList: patch.listPrice ?? r.listPrice, toMgmt: patch.mgmtPrice ?? r.mgmtPrice, toPrice: patch.price ?? r.price, by: _.who(), at: F.nowISO(), reason: d.reason || '' }];
    S.update('rooms', id, patch);
    _.audit('update', 'room', id, `Sửa phòng ${r.code}: ${Object.keys(patch).filter(k => k !== 'priceHistory').join(', ')}${priceChanged ? ' (giá từ ' + F.date(d.effectiveFrom) + ')' : ''}`); _.done(); return Q.room(id);
  };
  /* Đổi trạng thái phòng bắt buộc lý do; trống cần xử lý → sẵn sàng sau kiểm tra/dọn (CH-21) */
  X.setRoomStatus = (id, status, reason) => {
    _.need('rooms.status');
    if (!String(reason || '').trim()) throw new Error('Nhập lý do đổi trạng thái');
    const r = Q.room(id);
    if (!TH.auth.inScope(r.buildingId)) throw new Error('Phòng ngoài phạm vi được giao');
    if (Q.currentStay(id) && status !== 'occupied') throw new Error('Phòng đang có lượt thuê hiệu lực – kết thúc lượt thuê trước');
    S.update('rooms', id, { status, statusReason: reason, statusAt: F.today() });
    _.audit('status', 'room', id, `Phòng ${r.code} → ${(TH.data.catalog.roomStatuses[status] || {}).label}: ${reason}`); _.done();
  };

  /* Phụ lục thay giá HĐ chủ nhà: không chồng ngày hiệu lực; đóng phiên cũ tại ngày trước hiệu lực */
  X.addOwnerRate = (contractId, d) => {
    _.need('owners.manage');
    const from = d.from, rent = Number(d.rent);
    if (!from || !rent) throw new Error('Nhập ngày hiệu lực và giá thuê mới');
    if (!String(d.reason || '').trim()) throw new Error('Nhập lý do thay đổi');
    _.guardEffective(from, 'phụ lục giá chủ nhà');
    const oc0 = S.get('ownerContracts', contractId);
    if (oc0 && (from < oc0.startDate || (oc0.endDate && from > oc0.endDate))) throw new Error(`Ngày hiệu lực phải trong thời hạn HĐ (${F.date(oc0.startDate)} → ${F.date(oc0.endDate)})`);
    const vs = S.where('ownerRateVersions', v => v.contractId === contractId);
    if (vs.some(v => v.from >= from)) throw new Error('Ngày hiệu lực phải sau phiên giá gần nhất (' + F.date(vs.map(v => v.from).sort().pop()) + ')');
    vs.filter(v => !v.to).forEach(v => S.update('ownerRateVersions', v.id, { to: TH.calc.dates.addDays(from, -1) }));
    const v = S.add('ownerRateVersions', { contractId, from, to: null, monthlyRent: rent, deposit: Number(d.deposit) || null, reason: d.reason, appendixNo: 'PL-' + (vs.length + 1) });
    if (d.deposit) S.update('ownerContracts', contractId, { deposit: Number(d.deposit) });
    const n = X.rescheduleOwner(contractId, from);
    _.audit('create', 'ownerRate', v.id, `Phụ lục giá HĐ chủ nhà: ${F.vnd(rent)} từ ${F.date(from)}; tính lại ${n} kỳ trả chưa chi đủ`); _.done(); return v;
  };
  /* Số phải trả của một kỳ trả = Σ giá hiệu lực từng tháng trong kỳ (phụ lục giữa kỳ tính đúng tháng) */
  const opAmount = (contractId, from, months) => Array.from({ length: months }, (_, i) => X.ownerRentAt(contractId, F.addMonths(from, i))).reduce((s, v) => s + v, 0);
  /* Tính lại lịch trả sau phụ lục: kỳ chưa chi đủ có tháng từ ngày hiệu lực trở đi */
  X.rescheduleOwner = (contractId, from) => {
    let n = 0;
    S.where('ownerPayments', o => o.contractId === contractId && (o.paid || 0) < o.amountDue && F.addMonths(o.from, o.months) > from).forEach(o => {
      const amt = opAmount(contractId, o.from, o.months); if (Math.abs(amt - o.amountDue) > 0.5) { S.update('ownerPayments', o.id, { amountDue: amt, rescheduledAt: F.nowISO() }); n++; }
    });
    return n;
  };
  /* Lịch trả cho HĐ mới: từ tháng bắt đầu (không trước kỳ hiện tại) đến hết HĐ, tối đa 12 tháng tới */
  X.buildOwnerSchedule = (contractId) => {
    const oc = S.get('ownerContracts', contractId);
    let from = oc.startDate.slice(0, 8) + '01'; const cur = F.period(F.today()) + '-01'; if (from < cur) from = cur;
    const until = F.addMonths(cur, 12); let n = 0;
    for (let f = from; f < until && (!oc.endDate || f <= oc.endDate); f = F.addMonths(f, oc.payCycleMonths)) {
      if (S.one('ownerPayments', o => o.contractId === contractId && o.from === f)) continue;
      const dueMonth=F.addMonths(f, Number(oc.dueMonthOffset)||0),last=TH.calc.dates.addDays(F.addMonths(dueMonth,1),-1).slice(-2);
      const months=Array.from({length:oc.payCycleMonths},(_,i)=>F.addMonths(f,i)).filter(month=>!oc.endDate||month<=oc.endDate).length;
      S.add('ownerPayments', { contractId, buildingId: oc.buildingId, from: f, months, dueDate: dueMonth.slice(0,8)+String(Math.min(oc.payDay,+last)).padStart(2,'0'), amountDue: opAmount(contractId, f, months), paid: 0, paidAt: null }); n++;
    }
    return n;
  };
  /* Tạo chủ nhà + HĐ thuê đầu vào (UI-04): giá theo hiệu lực, cọc chủ nhà, kỳ trả → sinh lịch trả UI-05 */
  X.addOwnerContract = (d) => {
    _.need('owners.manage');
    const errs = {};
    const b = Q.building(d.buildingId); if (!b) errs.buildingId = 'Chọn tòa';
    if (!d.ownerId && !String(d.ownerName || '').trim()) errs.ownerName = 'Nhập tên chủ nhà';
    if (!d.startDate) errs.startDate = 'Nhập ngày bắt đầu';
    if (!d.endDate || (d.startDate && d.endDate <= d.startDate)) errs.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    if (!(Number(d.monthlyRent) > 0)) errs.monthlyRent = 'Nhập giá thuê/tháng';
    if (![1, 2, 3, 4, 6, 12].includes(Number(d.payCycleMonths))) errs.payCycleMonths = 'Chọn kỳ trả';
    const payDay = Number(d.payDay) || 5; if (payDay < 1 || payDay > 31) errs.payDay = 'Ngày trả từ 1 đến 31';
    if (b && S.one('ownerContracts', c => c.buildingId === b.id && (!c.endDate || c.endDate >= (d.startDate || F.today())))) errs.buildingId = 'Tòa đã có HĐ đầu vào còn hiệu lực – dùng phụ lục';
    if (Object.keys(errs).length) { const e = new Error('Dữ liệu chưa hợp lệ'); e.fields = errs; throw e; }
    _.guardEffective(d.startDate, 'HĐ chủ nhà');
    const owner = d.ownerId ? S.get('owners', d.ownerId) : S.add('owners', { name: d.ownerName.trim(), phone: d.ownerPhone || '', idNo: d.ownerIdNo || '', bank: d.ownerBank || '' });
    const code = d.code || 'HĐCN-' + b.code + (S.where('ownerContracts', c => c.buildingId === b.id).length ? '-' + (S.where('ownerContracts', c => c.buildingId === b.id).length + 1) : '');
    const oc = S.add('ownerContracts', { id: 'oc_' + code, code, buildingId: b.id, ownerId: owner.id, signDate: d.signDate || d.startDate, startDate: d.startDate, endDate: d.endDate, deposit: Number(d.deposit) || 0, payCycleMonths: Number(d.payCycleMonths), payDay, dueMonthOffset:Number(d.dueMonthOffset)||0, status: 'active', source: 'web',
      holdPriceTo: d.holdPriceTo || null, terms: d.terms || '', operator: d.operator || (d.operatorName || d.operatorPhone || d.operatorIdNo ? { name: d.operatorName || '', phone: d.operatorPhone || '', idNo: d.operatorIdNo || '' } : null), buildingFeatures: d.buildingFeatures || '', businessRegistration: d.businessRegistration || '', sourceRef: d.sourceRef || 'Nhập trên web', note: d.note || '' });
    S.add('ownerRateVersions', { contractId: oc.id, from: d.startDate, to: null, monthlyRent: Number(d.monthlyRent), reason: 'Giá theo HĐ gốc' });
    const n = X.buildOwnerSchedule(oc.id);
    _.audit('create', 'ownerContract', oc.id, `HĐ chủ nhà ${code} tòa ${b.code}: ${F.vnd(Number(d.monthlyRent))}/tháng, ${n} kỳ trả`); _.done(); return oc;
  };
  X.updateOwnerContractMeta = (id, d) => {
    _.need('owners.manage');
    const oc = S.get('ownerContracts', id); if (!oc) throw new Error('Không tìm thấy hợp đồng chủ nhà');
    if (!TH.auth.inScope(oc.buildingId)) throw new Error('Hợp đồng ngoài phạm vi được giao');
    const before = {}; const patch = {};
    ['holdPriceTo', 'terms', 'buildingFeatures', 'businessRegistration', 'sourceRef', 'note'].forEach(k => { if (d[k] != null) { before[k] = oc[k] || ''; patch[k] = typeof d[k] === 'string' ? d[k].trim() : d[k]; } });
    patch.operator = { name: String(d.operatorName || '').trim(), idNo: String(d.operatorIdNo || '').trim(), phone: String(d.operatorPhone || '').trim() };
    before.operator = oc.operator || null;
    S.update('ownerContracts', id, patch);
    _.audit('update', 'ownerContract', id, `Cập nhật thông tin bổ sung HĐ ${oc.code}`, { before, after: patch, reason: d.reason || 'Cập nhật hồ sơ', sourceRef: patch.sourceRef || oc.sourceRef || 'web' });
    _.done(); return S.get('ownerContracts', id);
  };
  X.ownerRentAt = (contractId, date) => { const v = S.where('ownerRateVersions', x => x.contractId === contractId && x.from <= date && (!x.to || date <= x.to))[0]; return v ? v.monthlyRent : 0; };
  /* Khách của chủ nhà đã đóng thẳng cho chủ (UI-03/UI-05, §3.12e, OQ-14): ghi "Chủ nhà đã thu" trên hóa đơn
     → hóa đơn không còn là công nợ khách; số đó trừ vào kỳ trả chủ nhà (kỳ chứa tháng hóa đơn, nếu đã chi đủ thì kỳ chưa chi kế tiếp). */
  X.isOwnerTenantInv = (inv) => { const r = Q.room(inv.roomId), s = Q.stay(inv.stayId); return (r && r.exploitation === 'owner_tenant') || !!(s && s.ownerTenant); };
  X.markOwnerCollected = (invId, d = {}) => {
    _.need('ownerPayments.record');
    const inv = Q.invoice(invId); if (!inv) throw new Error('Không tìm thấy hóa đơn');
    if (!TH.auth.inScope(inv.buildingId)) throw new Error('Hóa đơn ngoài phạm vi được giao');
    if (inv.lifecycle === 'draft') throw new Error('Phát hành hóa đơn trước khi ghi bù trừ');
    if (!X.isOwnerTenantInv(inv)) throw new Error('Chỉ áp cho phòng "Khách của chủ nhà" (UI-03 loại khai thác)');
    const rem = Q.invState(inv).remaining, amount = d.amount != null && d.amount !== '' ? Number(d.amount) : rem;
    if (!(amount > 0)) throw new Error('Hóa đơn không còn số phải thu');
    if (amount - rem > 0.5) throw new Error('Số bù trừ vượt số còn phải thu (' + F.vnd(rem) + ')');
    if (!d.date) throw new Error('Nhập ngày khách đóng cho chủ nhà');
    if (!String(d.reason || '').trim()) throw new Error('Nhập căn cứ (chủ nhà xác nhận, tin nhắn…)');
    _.guardPeriod(inv.period, 'ghi bù trừ chủ nhà');
    const oc = S.one('ownerContracts', c => c.buildingId === inv.buildingId && c.startDate <= d.date && (!c.endDate || d.date <= c.endDate)) || S.one('ownerContracts', c => c.buildingId === inv.buildingId);
    if (!oc) throw new Error('Tòa chưa có HĐ chủ nhà để bù trừ');
    const ps = Cc.dates.periodStart(inv.period);
    const ops = S.where('ownerPayments', o => o.contractId === oc.id).sort((a, b) => a.from.localeCompare(b.from));
    const left = (o) => o.amountDue - (o.paid || 0);
    const op = ops.find(o => o.from <= ps && ps < F.addMonths(o.from, o.months) && left(o) + 0.5 >= amount) || ops.find(o => o.from > ps && left(o) + 0.5 >= amount) || ops.find(o => o.from >= ps.slice(0, 8) + '01' && left(o) + 0.5 >= amount);
    if (!op) throw new Error('Không có kỳ trả chủ nhà còn đủ số phải chi để bù trừ ' + F.vnd(amount));
    const rec = { invoiceId: inv.id, opId: op.id, amount, date: d.date, reason: d.reason, by: _.who(), at: F.nowISO() };
    S.update('ownerPayments', op.id, { paid: (op.paid || 0) + amount, offsets: [...(op.offsets || []), rec] });
    S.update('invoices', inv.id, { ownerSettled: (inv.ownerSettled || 0) + amount, ownerSettlements: [...(inv.ownerSettlements || []), rec] });
    _.audit('offset', 'invoice', inv.id, `Chủ nhà đã thu ${inv.code}: ${F.vnd(amount)} – bù trừ kỳ trả chủ nhà ${F.date(op.from)}`); _.done(); return rec;
  };
  X.unmarkOwnerCollected = (invId, reason) => {
    _.need('ownerPayments.record');
    const inv = Q.invoice(invId); if (!inv || !(inv.ownerSettled > 0)) throw new Error('Hóa đơn chưa có bù trừ chủ nhà');
    if (!TH.auth.inScope(inv.buildingId)) throw new Error('Hóa đơn ngoài phạm vi được giao');
    if (!String(reason || '').trim()) throw new Error('Nhập lý do hủy bù trừ');
    _.guardPeriod(inv.period, 'hủy bù trừ chủ nhà');
    (inv.ownerSettlements || []).forEach(x => { const op = S.get('ownerPayments', x.opId); if (op) S.update('ownerPayments', op.id, { paid: Math.max(0, (op.paid || 0) - x.amount), offsets: (op.offsets || []).filter(o => o.invoiceId !== inv.id) }); });
    S.update('invoices', inv.id, { ownerSettled: 0, ownerSettlements: [] });
    _.audit('offset', 'invoice', inv.id, `Hủy bù trừ chủ nhà ${inv.code}: ${reason}`); _.done();
  };
  /* Ghi chi tiền nhà (UI-05) → khoản chi gốc ở UI-15 */
  X.recordOwnerPayment = (opId, d) => {
    _.need('ownerPayments.record');
    const op = S.get('ownerPayments', opId); const oc = S.get('ownerContracts', op.contractId); const b = Q.building(oc.buildingId);
    const amount = Number(d.amount); if (!amount || amount <= 0) throw new Error('Nhập số tiền chi');
    if (amount > op.amountDue - (op.paid || 0) + 0.5) throw new Error('Số chi vượt số còn phải trả của kỳ (' + F.vnd(op.amountDue - (op.paid || 0)) + ')');
    if (!d.date) throw new Error('Nhập ngày chi');
    _.guardPeriod(F.period(d.date), 'ghi chi');
    const exp = X.addExpense({ date: d.date, period: F.period(op.from), category: 'owner_rent', scope: 'building', buildingId: b.id, amount, vendor: (S.get('owners', oc.ownerId) || {}).name, method: d.method || 'bank', note: `Tiền nhà ${b.code} kỳ ${F.date(op.from)} (${op.months} tháng)`, source: 'ownerPayment', refId: op.id, evidence: d.evidence || d.reference || null }, true);
    const payment = { amount, date: d.date, method: d.method || 'bank', reference: String(d.reference || '').trim(), evidence: String(d.evidence || '').trim(), expenseId: exp.id, by: _.who(), at: F.nowISO() };
    S.update('ownerPayments', opId, { paid: (op.paid || 0) + amount, paidAt: d.date, expenseIds: [...(op.expenseIds || []), exp.id], payments: [...(op.payments || []), payment] });
    _.audit('pay', 'ownerPayment', opId, `Ghi chi tiền nhà ${b.code}: ${F.vnd(amount)}`); _.done(); return exp;
  };
})(window.TH);

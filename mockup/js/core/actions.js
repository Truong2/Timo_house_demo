/* Actions: toàn bộ nghiệp vụ ghi. Ném Error khi vi phạm quy tắc; UI bắt và toast. */
(function (TH) {
  const F = TH.f, Q = TH.q, St = TH.store, Au = TH.auth;
  const X = {};
  const err = (m) => { throw new Error(m); };
  const req = (v, m) => { if (v === undefined || v === null || v === '' || (typeof v === 'number' && isNaN(v))) err(m); return v; };
  const me = () => (St.state.session || {}).userId || null;
  const yearCode = (date = F.today()) => String(date || F.today()).slice(0, 4);
  const periodCode = (period = F.today().slice(0, 7)) => String(period || F.today().slice(0, 7)).replace('-', '');
  const idem = (key, fn) => { if (!key) return fn(); St.state.meta.idem = St.state.meta.idem || {}; if (St.state.meta.idem[key]) { const prev = St.state.meta.idem[key]; return Object.assign({ duplicate: true }, prev); } const res = fn(); try { St.state.meta.idem[key] = res && typeof res === 'object' ? JSON.parse(JSON.stringify(res)) : { ok: true }; } catch (e) { St.state.meta.idem[key] = { id: res && res.id, code: res && res.code }; } St.save(); return res; };
  const done = () => { St.save(); St.emit('change'); };

  // Giữ quan hệ Chủ nhà ↔ Tòa nhà nhất quán ở mọi điểm ghi.
  // Xóa buildingId khỏi các chủ nhà khác trước khi thêm vào chủ nhà mới.
  const assignBuildingLandlord = (building, landlordId) => {
    if (!building) return;
    const nextId = landlordId || null;
    (St.state.landlords || []).forEach(l => {
      l.buildingIds = Array.isArray(l.buildingIds) ? l.buildingIds : [];
      if (l.id !== nextId) l.buildingIds = l.buildingIds.filter(id => id !== building.id);
    });
    building.landlordId = nextId;
    if (nextId) {
      const landlord = (St.state.landlords || []).find(l => l && l.id === nextId);
      if (!landlord) err('Chủ nhà được chọn không tồn tại');
      landlord.buildingIds = [...new Set([...(landlord.buildingIds || []), building.id])];
    }
  };
  const grantBuildingToManager = (building) => {
    if (!building || !building.managerId) return;
    const user = (St.state.users || []).find(u => u && u.id === building.managerId);
    if (!user || user.role !== 'ops') return;
    user.buildingIds = [...new Set([...(user.buildingIds || []), building.id])];
  };

  /* ---------- Tòa & phòng ---------- */
  X.saveBuilding = (d) => {
    Au.need('buildings.manage');
    req(d.name, 'Tên tòa là bắt buộc'); req(d.address, 'Địa chỉ là bắt buộc');
    if (d.code && St.one('buildings', b => b.code === d.code && b.id !== d.id)) err('Mã tòa ' + d.code + ' đã tồn tại');
    if (d.id) {
      const old = St.get('buildings', d.id);
      if (d.status === 'inactive' && old.status !== 'inactive') { Au.need('deactivateBuilding'); checkDeactivate(d.id); }
      const nextLandlordId = d.landlordId === undefined ? old.landlordId : d.landlordId;
      const b = St.update('buildings', d.id, d); assignBuildingLandlord(b, nextLandlordId); grantBuildingToManager(b); St.audit('update', 'building', b.id, 'Cập nhật tòa ' + b.name); done(); return b;
    }
    const code = d.code || St.nextCode('buildings', 'TH-', 2);
    if (St.byCode('buildings', code)) err('Mã tòa ' + code + ' đã tồn tại');
    req(d.landlordId, 'Tòa nhà phải thuộc một chủ nhà – tạo qua Onboarding chủ nhà (Chủ nhà → HĐ đầu vào → Tòa → Phòng)');
    const b = St.add('buildings', Object.assign({ code, floors: 1, perFloor: 0, status: 'active', payCycle: 3, payDay: 5, roomCount: 0, amenities: [] }, d, { code, prefix: autoPrefix(d, code) }));
    assignBuildingLandlord(b, d.landlordId); grantBuildingToManager(b);
    St.audit('create', 'building', b.id, 'Tạo tòa ' + b.name); done(); return b;
  };
  // FR-BLD-02: không ngừng tòa còn HĐ hiệu lực / giữ chỗ / HĐ dự thảo
  function checkDeactivate(id) {
    if (Q.roomsOf(id).some(r => r.status === 'occupied')) err('Tòa còn hợp đồng hiệu lực, không thể ngừng sử dụng (FR-BLD-02)');
    if (Q.roomsOf(id).some(r => r.status === 'held')) err('Tòa còn phòng đang giữ chỗ – hủy giữ chỗ trước khi ngừng sử dụng');
    if (St.one('contracts', c => c.buildingId === id && c.status === 'draft')) err('Tòa còn hợp đồng dự thảo – hủy hoặc kích hoạt trước khi ngừng sử dụng');
  }
  X.deactivateBuilding = (id) => { Au.need('deactivateBuilding'); checkDeactivate(id); St.update('buildings', id, { status: 'inactive' }); let n = 0; Q.roomsOf(id).forEach(r => { if (['ready', 'maintenance'].includes(r.status)) { r.status = 'inactive'; r.physical = 'maintenance'; n++; } }); St.audit('deactivate', 'building', id, 'Ngừng sử dụng tòa' + (n ? ' – ' + n + ' phòng → Ngừng sử dụng' : '')); done(); };
  X.setBuildingStatus = (id, status) => { Au.need('deactivateBuilding'); if (status === 'inactive') checkDeactivate(id); St.update('buildings', id, { status }); St.audit('status', 'building', id, 'Tòa → ' + Q.label('building', status)); done(); };
  X.saveRoom = (d) => {
    Au.need('rooms.manage', d.id ? { type: 'room', record: St.get('rooms', d.id) } : { buildingId: d.buildingId });
    const code = req(d.code, 'Mã phòng là bắt buộc').trim(); req(d.buildingId, 'Chọn tòa nhà');
    const dup = St.one('rooms', r => r.buildingId === d.buildingId && r.code === code && r.id !== d.id); if (dup) err('Mã phòng ' + code + ' đã tồn tại trong tòa (FR-BLD-03)');
    if (d.id) { const r = St.update('rooms', d.id, d); St.audit('update', 'room', r.id, 'Cập nhật phòng ' + r.code); done(); return r; }
    const r = St.add('rooms', Object.assign({ floor: 1, type: 'Phòng đơn', area: 20, price: 0, physical: 'good', status: 'ready', managerId: Q.building(d.buildingId).managerId, direction: '', furniture: 'Cơ bản', defaultServiceIds: [] }, d, { code }));
    St.audit('create', 'room', r.id, 'Tạo phòng ' + r.code); done(); return r;
  };
  // Tiền tố mã phòng: nhập tay → chữ cái đầu của mã (TH-HBT → H) → chữ cái đầu tên tòa (bỏ 'Tòa') → X
  const autoPrefix = (d, code) => { const p = String(d.prefix || '').trim(); if (/^[A-Za-z]/.test(p)) return p.slice(0, 1).toUpperCase(); const seg = String(code || '').split('-')[1] || ''; if (/^[A-Za-z]/.test(seg)) return seg[0].toUpperCase(); const n = F.norm(String(d.name || '').replace(/^tòa\s+/i, '')).replace(/[^a-z]/g, ''); return (n[0] || 'x').toUpperCase(); };
  // Sinh phòng theo lưới tầng × số phòng/tầng (mã <prefix>.<tầng>.<số>), bỏ qua mã trùng; cập nhật floors/perFloor/roomCount của tòa
  const makeRooms = (b, { floorFrom = 1, floorTo, perFloor, price, type, area }) => {
    const made = []; let skipped = 0; const f0 = Math.max(1, Number(floorFrom) || 1), f1 = Math.max(f0, Number(floorTo) || f0), n1 = Math.max(0, Number(perFloor) || 0);
    const prefix = autoPrefix(b, b.code);
    for (let f = f0; f <= f1; f++) for (let n = 1; n <= n1; n++) { const code = prefix + '.' + F.pad(f) + '.' + F.pad(n); if (St.one('rooms', r => r.buildingId === b.id && r.code === code)) { skipped++; continue; } made.push(St.add('rooms', { code, buildingId: b.id, floor: f, type: type || 'Phòng đơn', area: Number(area) || 25, price: F.num(price) || 5000000, physical: 'good', status: 'ready', managerId: b.managerId, direction: '', furniture: 'Cơ bản', defaultServiceIds: [], source: 'user' })); }
    if (made.length) { b.prefix = prefix; b.floors = Math.max(Number(b.floors) || 1, f1); b.perFloor = Math.max(Number(b.perFloor) || 0, n1); b.roomCount = Q.roomsOf(b.id).length; b.stub = false; }
    return { made, skipped };
  };
  X.createRoomsBulk = ({ buildingId, floorFrom, floorTo, perFloor, price, type, area }) => {
    Au.need('rooms.manage', { buildingId });
    const b = Q.building(buildingId); if (!b || !b.id) err('Không tìm thấy tòa'); const r = makeRooms(b, { floorFrom, floorTo, perFloor, price, type, area });
    St.audit('bulk_create', 'room', buildingId, 'Tạo nhanh ' + r.made.length + ' phòng (' + r.skipped + ' bỏ qua vì trùng mã)'); done(); return r;
  };
  X.setRoomStatus = (id, status, note) => {
    Au.need('rooms.manage', { type: 'room', record: St.get('rooms', id) });
    const r = Q.room(id); const allowed = { ready: ['maintenance', 'inactive'], maintenance: ['ready', 'inactive'], inactive: ['ready'], cleaning: ['ready'], held: [] };
    if (Q.activeContractOfRoom(id)) err('Phòng đang có hợp đồng hiệu lực – hãy kết thúc hợp đồng trước'); if (r.status === 'occupied') { St.update('rooms', id, { status: 'ready' }); r.status = 'ready'; }
    if (!(allowed[r.status] || []).includes(status)) err('Không thể chuyển ' + Q.label('room', r.status) + ' → ' + Q.label('room', status));
    St.update('rooms', id, { status, physical: status === 'maintenance' ? 'maintenance' : 'good' }); St.audit('room_status', 'room', id, r.code + ': ' + Q.label('room', r.status) + ' → ' + Q.label('room', status) + (note ? ' – ' + note : '')); done();
  };
  X.confirmCleaned = (id) => { const r = Q.room(id); Au.need('rooms.manage', { type: 'room', record: r }); if (r.status !== 'cleaning') err('Phòng không ở trạng thái Chờ dọn'); St.update('rooms', id, { status: 'ready', physical: 'good' }); St.audit('confirmCleaned', 'room', id, 'Xác nhận dọn xong phòng ' + r.code + ' → Sẵn sàng'); done(); };
  X.holdRoom = ({ roomId, tenantId, until, deposit, note }) => { const r = Q.room(roomId); Au.need('holds.manage', { type: 'room', record: r }); if (r.status !== 'ready') err('Chỉ giữ chỗ phòng Sẵn sàng'); if (Q.building(r.buildingId).status === 'inactive') err('Tòa đang tạm ngừng – không giữ chỗ'); if (!Q.landlordContractOf(r.buildingId)) err(Q.building(r.buildingId).name + ' chưa có HĐ đầu vào hiệu lực – bổ sung hợp đồng với chủ nhà trước khi khai thác'); req(tenantId, 'Chọn khách'); req(until, 'Chọn ngày giữ đến'); if (until < F.today()) err('Ngày giữ đến phải từ hôm nay trở đi'); St.update('rooms', roomId, { status: 'held' }); const h = St.add('holds', { roomId, tenantId, until, deposit: deposit || 0, note: note || '', createdBy: me() }); St.audit('hold', 'room', roomId, 'Giữ chỗ phòng ' + r.code + ' cho ' + Q.tenant(tenantId).name); done(); return h; };
  X.releaseHold = (roomId, reason) => {
    const h = Q.roomHold(roomId);
    Au.need('holds.manage', h ? { type: 'hold', record: h } : { type: 'room', record: Q.room(roomId) });
    if (h) {
      if (h.code || h.leadId) Object.assign(h, { status: 'cancelled', cancelledAt: F.nowISO(), cancelReason: reason || '' }); else St.remove('holds', h.id);
      const lead = h.leadId && St.get('leads', h.leadId);
      if (lead && lead.status === 'held') {
        if (TH.crmBoard && TH.crmBoard.place) TH.crmBoard.place(lead, 'considering'); else lead.status = 'considering';
        lead.updatedAt = F.nowISO();
      }
    }
    const r = Q.room(roomId); if (r.status === 'held') St.update('rooms', roomId, { status: 'ready' }); St.audit('release_hold', 'room', roomId, 'Hủy giữ chỗ phòng ' + r.code + (h ? ' (' + Q.tenant(h.tenantId).name + ')' : '') + (reason ? ' – ' + reason : '')); done();
  };
  X.saveRoomServices = (roomId, serviceIds) => { Au.need('rooms.manage', { type: 'room', record: St.get('rooms', roomId) }); St.update('rooms', roomId, { defaultServiceIds: serviceIds }); done(); };
  X.saveRoomAsset = (d) => { const room = St.get('rooms', d.roomId || (St.get('roomAssets', d.id) || {}).roomId); Au.need('rooms.manage', { type: 'room', record: room }); if (d.id) St.update('roomAssets', d.id, d); else St.add('roomAssets', d); done(); };
  X.removeRoomAsset = (id) => { const asset = St.get('roomAssets', id); Au.need('rooms.manage', { type: 'roomAsset', record: asset }); St.remove('roomAssets', id); done(); };

  /* ---------- Chủ nhà ---------- */
  X.saveLandlord = (d) => {
    Au.need('landlords.manage');
    req(d.name, 'Tên chủ nhà là bắt buộc'); req(d.phone, 'Số điện thoại là bắt buộc');
    if (d.id) {
      const old = St.get('landlords', d.id); const prevB = (old.buildingIds || []).slice(); const selected = Array.isArray(d.buildingIds) ? [...new Set(d.buildingIds)] : prevB;
      const l = St.update('landlords', d.id, Object.assign({}, d, { buildingIds: selected }));
      prevB.filter(id => !selected.includes(id)).forEach(id => { const b = St.get('buildings', id); if (b && b.landlordId === l.id) assignBuildingLandlord(b, null); });
      selected.forEach(id => { const b = St.get('buildings', id); if (b) assignBuildingLandlord(b, l.id); });
      l.buildingIds = selected.filter(id => !!St.get('buildings', id));
      St.audit('update', 'landlord', l.id, 'Cập nhật chủ nhà ' + l.name); done(); return l;
    }
    const selected = Array.isArray(d.buildingIds) ? [...new Set(d.buildingIds)] : [];
    const l = St.add('landlords', Object.assign({ code: St.nextCode('landlords', 'CN', 3), type: 'person', buildingIds: [], status: 'active', cycleMonths: 3, managerId: me() }, d, { buildingIds: [] }));
    selected.forEach(id => { const b = St.get('buildings', id); if (b) assignBuildingLandlord(b, l.id); });
    St.audit('create', 'landlord', l.id, 'Thêm chủ nhà ' + l.name); done(); return l;
  };

  /* Lịch trả chủ nhà theo HĐ (dùng chung cho onboarding, tạo HĐ và nút "Tạo lịch"): bỏ qua kỳ đã có cùng hạn */
  const buildSchedule = (c, { from, periods } = {}) => {
    const existing = St.where('landlordPayments', p => p.landlordContractId === c.id); const made = [];
    Q.landlordSchedulePreview({ start: c.start, end: c.end, rent: c.rent, cycleMonths: c.cycleMonths, from, periods }).forEach(x => { if (existing.some(p => p.dueDate === x.dueDate)) return; made.push(St.add('landlordPayments', { landlordContractId: c.id, landlordId: c.landlordId, buildingId: (c.buildingIds || [])[0] || null, periodLabel: Q.landlordPeriodLabel(existing.length + made.length + 1, x.dueDate, Number(c.cycleMonths)), dueDate: x.dueDate, amount: x.amount, status: x.dueDate < F.today() ? 'pending' : 'upcoming', paidDate: null, evidence: null })); });
    if (made.length) St.audit('schedule', 'landlordContract', c.id, 'Sinh ' + made.length + ' kỳ thanh toán chủ nhà');
    return made;
  };
  /* Onboarding: Chủ nhà → HĐ đầu vào → Tòa nhà → Phòng trong một lần xác nhận (transactional).
     Quy tắc: có tòa ⇒ phải có HĐ đầu vào (tạo mới hoặc gắn vào HĐ đang hiệu lực); phòng sinh theo lưới; lịch trả chủ nhà sinh tự động. */
  X.createLandlordOnboarding = (payload = {}) => {
    Au.need('landlords.manage'); Au.need('buildings.manage'); Au.need('catalog.manage');
    const landlordData = Object.assign({}, payload.landlord || {});
    const areaDrafts = (payload.areas || []).map(x => Object.assign({}, x));
    const buildingDrafts = (payload.buildings || []).map(x => Object.assign({}, x, { data: x.data ? Object.assign({}, x.data) : null }));
    const contractData = payload.contract ? Object.assign({}, payload.contract) : null;
    const roomSpecs = (payload.rooms || []).map(x => Object.assign({}, x));
    const existingLandlord = landlordData.id ? St.get('landlords', landlordData.id) : null;

    req(landlordData.name, 'Tên chủ nhà là bắt buộc'); req(landlordData.phone, 'Số điện thoại là bắt buộc');
    if (landlordData.id && !existingLandlord) err('Không tìm thấy chủ nhà cần bổ sung tòa');
    const areaRefs = new Set(); const areaCodes = new Set();
    areaDrafts.forEach(a => {
      req(a.ref, 'Thiếu mã tham chiếu Khu nhà'); req(a.name, 'Tên Khu nhà là bắt buộc');
      if (areaRefs.has(a.ref)) err('Khu nhà nháp bị trùng'); areaRefs.add(a.ref);
      if (a.code) {
        const code = String(a.code).trim();
        if (areaCodes.has(code) || St.byCode('areas', code)) err('Mã Khu nhà ' + code + ' đã tồn tại');
        a.code = code; areaCodes.add(code);
      }
    });
    const knownArea = ref => areaRefs.has(ref) || !!St.get('areas', ref);
    const buildingRefs = new Set(); const buildingCodes = new Set();
    buildingDrafts.forEach(item => {
      req(item.ref, 'Thiếu mã tham chiếu tòa nhà');
      if (buildingRefs.has(item.ref)) err('Tòa nhà bị chọn trùng'); buildingRefs.add(item.ref);
      if (item.mode === 'existing') {
        const b = St.get('buildings', item.id); if (!b) err('Tòa nhà đã chọn không tồn tại');
        if (b.landlordId && b.landlordId !== landlordData.id) err('Tòa ' + b.name + ' đã thuộc chủ nhà khác');
        return;
      }
      const d = item.data || {}; req(d.name, 'Tên tòa là bắt buộc'); req(d.address, 'Địa chỉ tòa là bắt buộc'); req(d.areaRef, 'Khu nhà quản lý là bắt buộc');
      if (!knownArea(d.areaRef)) err('Khu nhà của tòa ' + d.name + ' không tồn tại');
      if (d.code) {
        const code = String(d.code).trim();
        if (buildingCodes.has(code) || St.byCode('buildings', code)) err('Mã tòa ' + code + ' đã tồn tại');
        d.code = code; buildingCodes.add(code);
      }
    });
    // Có tòa ⇒ bắt buộc có HĐ đầu vào
    if (buildingDrafts.length && !contractData) err('Tòa nhà phải đi kèm hợp đồng đầu vào với chủ nhà');
    let existingContract = null;
    if (contractData) {
      if (!buildingDrafts.length) err('Hợp đồng đầu vào cần ít nhất một tòa');
      contractData.buildingRefs = (contractData.buildingRefs || []).length ? contractData.buildingRefs : [...buildingRefs];
      contractData.buildingRefs.forEach(ref => { if (!buildingRefs.has(ref)) err('Hợp đồng chứa tòa không thuộc hồ sơ onboarding'); });
      if (String(contractData.mode || '').startsWith('existing:')) {
        existingContract = St.get('landlordContracts', String(contractData.mode).slice(9));
        if (!existingContract || !existingLandlord || existingContract.landlordId !== existingLandlord.id) err('Hợp đồng đầu vào cần gắn không thuộc chủ nhà này');
        if (Q.lcStatus(existingContract) === 'ended') err('Hợp đồng ' + existingContract.code + ' đã kết thúc – tạo hợp đồng mới');
      } else {
        req(contractData.start, 'Ngày bắt đầu hợp đồng là bắt buộc'); req(contractData.end, 'Ngày kết thúc hợp đồng là bắt buộc');
        if (contractData.end <= contractData.start) err('Ngày kết thúc hợp đồng phải sau ngày bắt đầu');
        if (!(F.num(contractData.rent) > 0)) err('Giá thuê hợp đồng phải lớn hơn 0');
        if (![3, 4, 6].includes(Number(contractData.cycleMonths))) err('Chu kỳ trả phải là 3, 4 hoặc 6 tháng');
      }
    }
    roomSpecs.forEach(sp => {
      if (!buildingRefs.has(sp.ref)) err('Khai báo phòng cho tòa không thuộc hồ sơ');
      const item = buildingDrafts.find(x => x.ref === sp.ref); if (item.mode === 'existing' && Q.roomsOf(item.id).length) err('Tòa đã có phòng – không sinh lại danh sách phòng');
      if (!(Number(sp.floorFrom) >= 1)) err('Từ tầng phải ≥ 1'); if (!(Number(sp.floorTo) >= Number(sp.floorFrom))) err('Đến tầng phải ≥ từ tầng'); if (!(Number(sp.perFloor) >= 1 && Number(sp.perFloor) <= 20)) err('Số phòng mỗi tầng 1–20'); if (!(F.num(sp.price) > 0)) err('Giá tham chiếu phòng phải lớn hơn 0');
    });

    const snapshot = {};
    ['areas', 'landlords', 'buildings', 'rooms', 'landlordContracts', 'landlordPayments', 'users', 'auditLog'].forEach(k => snapshot[k] = JSON.parse(JSON.stringify(St.state[k] || [])));
    try {
      const areaMap = new Map(); const createdAreas = [];
      areaDrafts.forEach(a => {
        const area = St.add('areas', { code: a.code || St.nextCode('areas', 'KV', 2), name: a.name.trim(), districts: Array.isArray(a.districts) ? a.districts.filter(Boolean) : [], leadEmployeeId: a.leadEmployeeId || null, status: 'active' });
        areaMap.set(a.ref, area); createdAreas.push(area); St.audit('create', 'area', area.id, 'Tạo Khu nhà ' + area.name + ' từ onboarding chủ nhà');
      });
      const landlord = existingLandlord
        ? St.update('landlords', existingLandlord.id, Object.assign({}, landlordData, { cycleMonths: Number(landlordData.cycleMonths) || 3 }))
        : St.add('landlords', Object.assign({ code: St.nextCode('landlords', 'CN', 3), type: 'person', buildingIds: [], status: 'active', cycleMonths: 3, managerId: me(), source: 'user' }, landlordData, { buildingIds: [] }));
      landlord.buildingIds = Array.isArray(landlord.buildingIds) ? landlord.buildingIds : [];
      St.audit(existingLandlord ? 'update' : 'create', 'landlord', landlord.id, (existingLandlord ? 'Cập nhật' : 'Thêm') + ' chủ nhà ' + landlord.name + ' qua onboarding');

      const cycle = contractData ? Number(existingContract ? existingContract.cycleMonths : contractData.cycleMonths) : Number(landlord.cycleMonths) || 3;
      const buildingMap = new Map(); const buildings = [];
      buildingDrafts.forEach(item => {
        let b;
        if (item.mode === 'existing') b = St.get('buildings', item.id);
        else {
          const d = item.data || {}; const area = areaMap.get(d.areaRef) || St.get('areas', d.areaRef); const code = d.code || St.nextCode('buildings', 'TH-', 2);
          b = St.add('buildings', Object.assign({ code, floors: 1, perFloor: 0, status: 'active', payDay: 5, roomCount: 0, amenities: [], buildingType: 'T', condition: 'medium', operatingSince: F.today(), source: 'user' }, d, { code, prefix: autoPrefix(d, code), floors: Number(d.floors) || 1, perFloor: Number(d.perFloor) || 0, payCycle: cycle, areaId: area.id, landlordId: landlord.id }));
          delete b.areaRef; delete b.ref; St.audit('create', 'building', b.id, 'Tạo tòa ' + b.name + ' từ onboarding ' + landlord.name);
        }
        b.payCycle = cycle; assignBuildingLandlord(b, landlord.id); grantBuildingToManager(b); buildingMap.set(item.ref, b); buildings.push(b);
      });

      const rooms = [];
      roomSpecs.forEach(sp => { const b = buildingMap.get(sp.ref); const r = makeRooms(b, sp); rooms.push(...r.made); St.audit('bulk_create', 'room', b.id, 'Sinh ' + r.made.length + ' phòng cho tòa ' + b.name + ' từ onboarding'); });

      let contract = null; let payments = [];
      if (contractData) {
        const ids = contractData.buildingRefs.map(ref => buildingMap.get(ref).id);
        if (existingContract) {
          contract = existingContract; contract.buildingIds = [...new Set([...(contract.buildingIds || []), ...ids])];
          St.audit('update', 'landlordContract', contract.id, 'Bổ sung ' + ids.length + ' tòa vào HĐ đầu vào ' + contract.code);
        } else {
          const first = St.get('buildings', ids[0]);
          contract = St.add('landlordContracts', Object.assign({ code: 'HD-' + first.code + '-' + F.pad(Q.landlordContracts(landlord.id).length + 1, 3), landlordId: landlord.id, status: 'active', type: 'Hợp đồng thuê tòa nhà', managerId: me(), deposit: 0, priceHoldMonths: 0, source: 'user' }, contractData, { landlordId: landlord.id, buildingIds: ids, cycleMonths: Number(contractData.cycleMonths), rent: F.num(contractData.rent), deposit: F.num(contractData.deposit), priceHoldMonths: Number(contractData.priceHoldMonths) || 0 }));
          delete contract.buildingRefs; delete contract.mode; delete contract.enabled; delete contract.contractEnabled;
          St.audit('create', 'landlordContract', contract.id, 'Tạo HĐ đầu vào ' + contract.code + ' từ onboarding');
          payments = buildSchedule(contract);
        }
      }
      done(); return { landlord, areas: createdAreas, buildings, rooms, contract, payments };
    } catch (e) {
      Object.keys(snapshot).forEach(k => { St.state[k] = snapshot[k]; }); St.saveNow(); throw e;
    }
  };
  X.setLandlordStatus = (id, status) => { Au.need('landlords.manage'); St.update('landlords', id, { status }); done(); };
  X.saveLandlordContract = (d) => {
    Au.need('landlords.manage');
    req(d.landlordId, 'Thiếu chủ nhà'); req(d.start, 'Ngày bắt đầu'); req(d.end, 'Ngày kết thúc'); if (d.end <= d.start) err('Ngày kết thúc phải sau ngày bắt đầu'); req(d.rent, 'Giá thuê');
    if (![3, 4, 6].includes(Number(d.cycleMonths))) err('Chu kỳ trả phải là 3, 4 hoặc 6 tháng (BR-11)');
    const ids = (d.buildingIds && d.buildingIds.length) ? d.buildingIds : ((d.id && St.get('landlordContracts', d.id)) || {}).buildingIds || []; if (!ids.length) err('Hợp đồng cần liên kết ít nhất một tòa');
    ids.forEach(bid => {
      const b = Q.building(bid); if (!b || !b.id) err('Tòa không tồn tại');
      if (b.landlordId && b.landlordId !== d.landlordId) err(b.name + ' đã thuộc chủ nhà khác – không thể đưa vào hợp đồng');
      const clash = St.one('landlordContracts', c => c.id !== d.id && (c.buildingIds || []).includes(bid) && Q.lcStatus(c) !== 'ended' && c.start <= d.end && c.end >= d.start); if (clash) err(b.name + ' đã có HĐ ' + clash.code + ' trùng thời gian (' + F.date(clash.start) + ' – ' + F.date(clash.end) + ')');
    });
    let c;
    if (d.id) c = St.update('landlordContracts', d.id, Object.assign({}, d, { buildingIds: ids })); else c = St.add('landlordContracts', Object.assign({ code: 'HD-' + Q.building(ids[0]).code + '-' + F.pad(Q.landlordContracts(d.landlordId).length + 1, 3), status: 'active', type: 'Hợp đồng thuê tòa nhà', managerId: me(), deposit: 0, priceHoldMonths: 0, source: 'user' }, d, { buildingIds: ids }));
    ids.forEach(bid => { const b = Q.building(bid); b.payCycle = Number(c.cycleMonths); assignBuildingLandlord(b, c.landlordId); });
    const made = d.id ? [] : buildSchedule(c);
    St.audit('save', 'landlordContract', c.id, 'Lưu HĐ đầu vào ' + c.code + (made.length ? ' – sinh ' + made.length + ' kỳ trả' : '')); done(); return c;
  };
  X.generateLandlordSchedule = (contractId, { from, periods } = {}) => {
    Au.need('landlordPayments.manage');
    const c = St.get('landlordContracts', contractId); if (!c) err('Không tìm thấy hợp đồng đầu vào');
    const made = buildSchedule(c, { from, periods }); done(); return made;
  };
  X.addLandlordPayment = (d) => { Au.need('landlordPayments.manage'); req(d.dueDate, 'Hạn thanh toán'); req(d.amount, 'Số tiền'); const p = St.add('landlordPayments', Object.assign({ status: 'upcoming', paidDate: null, evidence: null }, d)); done(); return p; };
  X.markLandlordPaid = (id, { paidDate, evidence, amount }) => { Au.need('landlordPayments.manage'); req(paidDate, 'Ngày thanh toán'); const cur = St.get('landlordPayments', id); if (cur.status === 'paid') err('Kỳ này đã được ghi nhận thanh toán'); const patch = { status: 'paid', paidDate, evidence: evidence || 'chung_tu.pdf' }; if (F.num(amount) > 0) patch.amount = F.num(amount); const p = St.update('landlordPayments', id, patch);
    // Tiền trả chủ nhà là chi phí Thuê nhà của tòa → ghi vào sổ chi phí (1 kỳ trả = 1 chi phí, không tạo trùng)
    if (!St.one('expenses', e => e.landlordPaymentId === id)) { const ll = St.get('landlords', p.landlordId) || {}; const ex = St.add('expenses', { code: St.nextCode('expenses', 'CP', 4), date: paidDate, categoryCode: 'GV-THUE', group: 'Thuê nhà', desc: 'Trả tiền thuê nhà ' + (ll.name || '') + ' – ' + (p.periodLabel || ''), buildingId: p.buildingId || null, amount: p.amount, recordType: 'ops', method: 'cash', evidence: patch.evidence, note: 'Tự tạo từ kỳ thanh toán chủ nhà', createdBy: me(), status: 'recorded', landlordPaymentId: id, landlordId: p.landlordId }); p.expenseId = ex.id; }
    St.audit('landlord_paid', 'landlordPayment', id, 'Ghi nhận trả chủ nhà ' + F.vnd(p.amount) + ' – ' + p.periodLabel); done(); return p; };

  /* ---------- Khách thuê ---------- */
  X.saveTenant = (d) => {
    Au.need('tenants.manage', d.id ? { type: 'tenant', record: St.get('tenants', d.id) } : null);
    req(d.name, 'Họ tên là bắt buộc'); req(d.phone, 'Số điện thoại là bắt buộc');
    if (d.idNumber && !/^\d{12}$/.test(String(d.idNumber).replace(/\s/g, ''))) err('CCCD phải đúng 12 số');
    const ph = String(d.phone).replace(/\s/g, ''); const dupT = St.one('tenants', t => t.id !== d.id && String(t.phone || '').replace(/\s/g, '') === ph); if (dupT) err('Số điện thoại đã thuộc khách ' + dupT.name + ' (' + dupT.code + ') – không cho phép trùng SĐT');
    if (d.id) { const t = St.update('tenants', d.id, d); St.audit('update', 'tenant', t.id, 'Cập nhật khách ' + t.name); done(); return t; }
    const t = St.add('tenants', Object.assign({ code: St.nextCode('tenants', 'KH', 5), zalo: d.phone, email: '', idNumber: '', idPlace: '', dob: '', job: '', segment: '', address: '', verified: false, managerId: me(), note: '' }, d));
    St.audit('create', 'tenant', t.id, 'Tạo khách thuê ' + t.name); done(); return t;
  };

  /* ---------- Hợp đồng ---------- */
  function validateContract(d) {
    req(d.tenantId, 'Chọn khách thuê'); req(d.roomId, 'Chọn phòng'); req(d.start, 'Ngày bắt đầu'); req(d.end, 'Ngày kết thúc');
    if (d.end <= d.start) err('Ngày kết thúc phải sau ngày bắt đầu'); req(d.price, 'Giá thuê thực tế'); if (d.deposit == null) err('Tiền cọc là bắt buộc');
    const clash = St.one('contracts', c => c.roomId === d.roomId && c.id !== d.id && c.id !== d.renewedFromId && c.status === 'active' && !(d.end < c.start || d.start > c.end)); if (clash) err('Phòng đã có hợp đồng ' + clash.code + ' hiệu lực trùng khoảng thuê (FR-CUS-02)');
  }
  X.saveContractDraft = (d) => {
    Au.need('contracts.manage', d.id ? { type: 'contract', record: St.get('contracts', d.id) } : { type: 'room', record: St.get('rooms', d.roomId) });
    req(d.tenantId, 'Chọn khách thuê'); req(d.roomId, 'Chọn phòng');
    const room = Q.room(d.roomId); const base = { buildingId: room.buildingId, listPrice: d.listPrice || room.price, cycle: 'monthly', payDay: d.payDay || 5, status: 'draft', managerId: room.managerId, signedDate: null, note: d.note || '', renewedFromId: null, renewedToId: null };
    const svcRows = d.services || [], memRows = d.members || [], vehicles = (d.vehicles || []).filter(v => v && (v.type || v.plate)).map(v => ({ type: v.type || 'Xe máy', plate: String(v.plate || '').trim().toUpperCase() })); d = Object.assign({}, d, { vehicles }); delete d.services; delete d.members;
    let c; if (d.id && St.get('contracts', d.id)) { c = St.get('contracts', d.id); if (c.status !== 'draft') err('Chỉ sửa được hợp đồng Dự thảo'); Object.assign(c, d, { buildingId: room.buildingId, managerId: room.managerId, listPrice: d.listPrice || room.price }); } else c = St.add('contracts', Object.assign(base, d, { code: d.code || St.nextCode('contracts', 'HD-' + yearCode() + '-', 3), status: 'draft' }));
    St.removeWhere('contractServices', s => s.contractId === c.id); svcRows.forEach(s => { if (s.serviceId || s.name) St.add('contractServices', { contractId: c.id, serviceId: s.serviceId || null, name: s.name, unit: s.unit, price: F.num(s.price), qty: Math.max(0, F.num(s.qty)), note: s.note || '' }); });
    St.removeWhere('contractMembers', s => s.contractId === c.id); memRows.forEach(m => { if (m.name) St.add('contractMembers', { contractId: c.id, name: m.name, dob: m.dob || '', idNumber: m.idNumber || '', relation: m.relation || 'Người thuê (chính)', phone: m.phone || '', note: m.note || '' }); });
    St.audit('save_draft', 'contract', c.id, 'Lưu nháp hợp đồng ' + c.code); done(); return c;
  };
  /* Kích hoạt HĐ có thể sinh chứng từ đi kèm (opts): thu cọc ngay (payments kind=deposit) và hóa đơn nháp kỳ đầu (tiền phòng tính theo ngày + DV cố định).
     Kết quả phụ (phiếu thu/hóa đơn/ghi chú) đặt ở X.lastActivation để UI hiển thị. */
  const prorateFirstInvoice = (inv, c) => { const period = inv.period; const [y, m] = period.split('-').map(Number); const dim = new Date(y, m, 0).getDate(); const startDay = Number(String(c.start).slice(8, 10)) || 1; if (startDay <= 1) return; const days = dim - startDay + 1; const line = Q.invLines(inv.id).find(l => l.kind === 'rent'); if (!line) return; line.amount = Math.round(c.price * days / dim / 1000) * 1000; line.desc += ' (từ ' + F.date(c.start) + ', ' + days + '/' + dim + ' ngày)'; inv.total = F.sum(Q.invLines(inv.id), l => l.amount); };
  X.activateContract = (id, key, opts = {}) => idem(key, () => {
    Au.need('contracts.manage', { type: 'contract', record: St.get('contracts', id) });
    const c = St.get('contracts', id); if (!c) err('Không tìm thấy hợp đồng'); if (c.status === 'active') return c; if (c.status !== 'draft') err('Chỉ kích hoạt được hợp đồng Dự thảo');
    validateContract(c); const room = Q.room(c.roomId);
    // Gia hạn: HĐ mới kích hoạt thay thế HĐ cũ trên cùng phòng (phòng vẫn Đang thuê, cọc chuyển tiếp)
    const prev = c.renewedFromId ? St.get('contracts', c.renewedFromId) : null; const renewing = !!(prev && prev.status === 'active' && prev.roomId === c.roomId);
    if (!renewing && !['ready', 'held'].includes(room.status)) err('Phòng ' + room.code + ' đang ' + Q.label('room', room.status) + ', không thể kích hoạt hợp đồng');
    if (Q.building(room.buildingId).status === 'inactive') err('Tòa ' + Q.building(room.buildingId).name + ' đang tạm ngừng – không thể kích hoạt hợp đồng');
    // Chuỗi pháp lý: phòng chỉ cho thuê khi tòa có HĐ đầu vào hiệu lực tại ngày bắt đầu; HĐ khách kết thúc sau HĐ chủ nhà → cảnh báo
    const lc = Q.landlordContractOf(room.buildingId, c.start) || Q.landlordContractOf(room.buildingId); if (!lc) err(Q.building(room.buildingId).name + ' chưa có HĐ đầu vào hiệu lực – bổ sung hợp đồng với chủ nhà trước khi cho thuê');
    const hold = renewing ? null : Q.roomHold(room.id); if (hold && hold.tenantId !== c.tenantId) err('Phòng ' + room.code + ' đang giữ chỗ cho khách ' + Q.tenant(hold.tenantId).name + ' – hủy giữ chỗ trước'); if (hold) { if (hold.code || hold.leadId) Object.assign(hold, { status: 'converted', convertedAt: F.nowISO(), contractId: c.id }); else St.remove('holds', hold.id); St.audit('release_hold', 'room', room.id, 'Giữ chỗ chuyển thành hợp đồng ' + c.code); }
    Object.assign(c, { status: 'active', signedDate: c.signedDate || F.today(), activatedAt: F.nowISO() });
    if (renewing) { Object.assign(prev, { status: 'ended', actualEnd: F.addDays(c.start, -1), renewedToId: c.id, endReason: 'Gia hạn bằng hợp đồng ' + c.code }); if (!c.depositPaymentId && prev.depositPaymentId) { c.depositPaymentId = prev.depositPaymentId; c.depositPaidAt = prev.depositPaidAt; c.depositCarriedFrom = prev.code; } St.audit('renew', 'contract', prev.id, 'Gia hạn ' + prev.code + ' → ' + c.code + ' (kích hoạt)'); }
    St.update('rooms', room.id, { status: 'occupied' });
    St.audit('activate', 'contract', c.id, 'Kích hoạt hợp đồng ' + c.code + ' – phòng ' + room.code + ' → Đang thuê');
    const extras = X.lastActivation = { contractId: c.id, payment: null, invoice: null, notes: [] };
    if (c.end > lc.end) extras.notes.push('HĐ kết thúc sau HĐ chủ nhà ' + lc.code + ' (' + F.date(lc.end) + ') – cần gia hạn HĐ đầu vào');
    if (opts.depositNow && c.deposit > 0 && !c.depositPaymentId) {
      try { Au.need('payments.record'); const date = opts.depositDate || F.today(); if (Q.periodLocked && Q.periodLocked(F.period(date))) err('Kỳ ' + F.periodLabel(F.period(date)) + ' đã khóa');
        const pay = St.add('payments', { code: St.nextCode('payments', 'PAY-' + date.slice(0, 7).replace('-', '') + '-', 3), kind: 'deposit', contractId: c.id, tenantId: c.tenantId, roomId: c.roomId, buildingId: c.buildingId, date, amount: c.deposit, method: opts.depositMethod || 'Tiền mặt', ref: opts.depositRef || '', evidence: '', note: 'Thu tiền cọc hợp đồng ' + c.code, status: 'recorded', createdBy: me(), unallocated: 0, history: [{ at: F.nowISO(), who: (St.state.session || {}).name, what: 'Thu tiền cọc khi kích hoạt HĐ' }] });
        c.depositPaymentId = pay.id; c.depositPaidAt = date; St.audit('deposit', 'contract', c.id, 'Thu cọc ' + F.vnd(c.deposit) + ' (' + pay.code + ') khi kích hoạt ' + c.code); extras.payment = pay;
      } catch (e) { extras.notes.push('Chưa ghi nhận thu cọc: ' + e.message); }
    }
    if (opts.firstInvoice) {
      try { const period = F.period(c.start); const res = X.createInvoiceDrafts({ period, contractIds: [c.id], services: ['FIXED'], key: 'act-inv:' + c.id }); const inv = res && res.created && res.created[0];
        if (inv) { prorateFirstInvoice(inv, c); extras.invoice = inv; } else if (res && res.skipped && res.skipped[0]) extras.notes.push('Không tạo hóa đơn kỳ đầu: ' + res.skipped[0].why);
      } catch (e) { extras.notes.push('Không tạo hóa đơn kỳ đầu: ' + e.message); }
    }
    done(); return c;
  });
  X.cancelContract = (id, reason) => { const c = St.get('contracts', id); Au.need('contracts.manage', { type: 'contract', record: c }); if (c.status !== 'draft') err('Chỉ hủy được hợp đồng Dự thảo'); c.status = 'cancelled'; c.note = (c.note ? c.note + ' | ' : '') + 'Hủy: ' + (reason || ''); St.audit('cancel', 'contract', id, 'Hủy hợp đồng ' + c.code); done(); };
  X.terminateContract = (id, { actualEnd, reason, toCleaning = true, createRefund = true }) => {
    Au.need('contracts.manage', { type: 'contract', record: St.get('contracts', id) });
    const c = St.get('contracts', id); if (!c) err('Hợp đồng không tồn tại hoặc đã bị xóa'); if (c.status !== 'active') err('Hợp đồng không còn hiệu lực'); req(actualEnd, 'Ngày kết thúc thực tế');
    if (actualEnd < c.start) err('Ngày kết thúc thực tế không được trước ngày bắt đầu');
    Object.assign(c, { status: 'ended', actualEnd, endReason: reason || '', endedAt: F.nowISO() });
    const room = Q.room(c.roomId); if (toCleaning) St.update('rooms', room.id, { status: 'cleaning', physical: 'needs_clean' }); else St.update('rooms', room.id, { status: 'ready', physical: 'good' });
    let rf = null;
    if (createRefund && !St.one('refunds', r => r.contractId === c.id)) {
      const debt = Q.contractDebt(c.id);
      rf = St.add('refunds', { code: St.nextCode('refunds', 'RC' + periodCode() + '-', 3), contractId: c.id, tenantId: c.tenantId, roomId: c.roomId, buildingId: c.buildingId, requestDate: F.today(), moveOutDate: actualEnd, deposit: c.deposit, debt, offsetDebt: false, deductionsTotal: 200000, refundAmount: Math.max(0, c.deposit - 200000), status: 'draft', handlerId: me(), approverRole: 'Kế toán trưởng', rejectReason: '', inspection: {}, files: [] });
      Q.refundDefaults().forEach(d => St.add('refundDeductions', Object.assign({ refundId: rf.id }, d)));
    }
    St.audit('terminate', 'contract', c.id, 'Kết thúc hợp đồng ' + c.code + ' – phòng ' + room.code + (toCleaning ? ' → Chờ dọn' : ' → Sẵn sàng (không qua dọn)') + (rf ? ' – tạo hồ sơ hoàn cọc ' + rf.code : '')); done(); return { contract: c, refund: rf };
  };
  X.renewContract = (id, { end, price, deposit }) => {
    Au.need('contracts.manage', { type: 'contract', record: St.get('contracts', id) });
    const old = St.get('contracts', id); if (old.status !== 'active') err('Chỉ gia hạn hợp đồng hiệu lực'); req(end, 'Ngày kết thúc mới'); if (end <= old.end) err('Ngày kết thúc mới phải sau ' + F.date(old.end));
    const start = F.addDays(old.end, 1);
    if (old.renewedToId && (St.get('contracts', old.renewedToId) || {}).status === 'draft') return St.get('contracts', old.renewedToId);
    const n = St.add('contracts', Object.assign({}, old, { id: undefined, code: St.nextCode('contracts', 'HD-' + yearCode() + '-', 3), start, end, price: price || old.price, deposit: deposit != null ? deposit : old.deposit, status: 'draft', signedDate: null, renewedFromId: old.id, renewedToId: null, createdAt: undefined, source: undefined, activatedAt: null, depositPaymentId: null, depositPaidAt: null, note: '' }));
    Q.contractServices(old.id).forEach(s => St.add('contractServices', Object.assign({}, s, { id: undefined, contractId: n.id, createdAt: undefined, source: undefined })));
    Q.contractMembers(old.id).forEach(m => St.add('contractMembers', Object.assign({}, m, { id: undefined, contractId: n.id, createdAt: undefined, source: undefined })));
    old.renewedToId = n.id;
    St.audit('renew', 'contract', old.id, 'Lập hợp đồng gia hạn ' + n.code + ' (nháp) đến ' + F.date(end) + ' – HĐ cũ kết thúc khi HĐ mới kích hoạt'); done(); return n;
  };
  X.updateContractNote = (id, note) => { Au.need('contracts.manage', { type: 'contract', record: St.get('contracts', id) }); const c = St.update('contracts', id, { note, noteBy: (St.state.session || {}).name, noteAt: F.nowISO() }); St.audit('note', 'contract', id, 'Cập nhật ghi chú hợp đồng ' + c.code); done(); return c; };

  /* ---------- Danh mục ---------- */
  X.saveService = (d) => {
    Au.need('manageCatalog'); req(d.name, 'Tên dịch vụ'); req(d.unit, 'Đơn vị'); req(d.price, 'Giá mặc định'); req(d.effectiveFrom, 'Ngày hiệu lực');
    let s; if (d.id) { const old = St.get('services', d.id); const priceChanged = Number(old.price) !== Number(d.price); s = St.update('services', d.id, d); if (priceChanged) St.add('priceHistory', { serviceId: s.id, date: d.effectiveFrom, price: Number(d.price), scope: d.scope === 'all' ? 'Tất cả tòa nhà' : (d.buildingIds || []).map(b => Q.building(b).name).join(', '), userId: me(), userName: (St.state.session || {}).name }); }
    else { s = St.add('services', Object.assign({ code: F.slug(d.name).toUpperCase().replace(/-/g, '_'), group: 'Dịch vụ tiện ích', method: 'fixed', scope: 'all', buildingIds: [], effectiveTo: '', status: 'active', icon: 'package', note: '' }, d)); St.add('priceHistory', { serviceId: s.id, date: s.effectiveFrom, price: Number(s.price), scope: 'Tất cả tòa nhà', userId: me(), userName: (St.state.session || {}).name }); }
    St.audit('save', 'service', s.id, 'Lưu dịch vụ ' + s.name); done(); return s;
  };
  X.deleteService = (id) => { Au.need('manageCatalog'); const used = St.one('contractServices', cs => cs.serviceId === id && Q.contract(cs.contractId).status === 'active'); if (used) err('Dịch vụ đang được dùng trong hợp đồng hiệu lực – hãy chuyển sang Ngừng hoạt động thay vì xóa'); St.remove('services', id); done(); };
  X.applyPriceList = ({ buildingIds, effectiveFrom, serviceIds }) => { Au.need('manageCatalog'); let n = 0; St.where('rooms', r => buildingIds.includes(r.buildingId) && r.status !== 'occupied').forEach(r => { r.defaultServiceIds = serviceIds.slice(); n++; }); St.audit('apply_price', 'service', null, 'Áp bảng giá cho ' + n + ' phòng chưa có HĐ, hiệu lực ' + F.date(effectiveFrom)); done(); return n; };
  X.saveCatalogItem = (col, d) => { Au.need('manageCatalog'); req(d.name, 'Tên là bắt buộc'); if (d.id) St.update(col, d.id, d); else St.add(col, Object.assign({ code: St.nextCode(col, { expenseGroups: 'NC', leadSources: 'NK', vendors: 'NCC' }[col] || 'PT', 2), status: 'active' }, d)); done(); };
  X.removeCatalogItem = (col, id) => { Au.need('manageCatalog'); St.remove(col, id); done(); };

  /* ---------- Điện nước & hóa đơn ---------- */
  X.saveMeterReadings = (period, rows) => {
    Au.need('meterReadings.manage');
    let n = 0; const skipped = [];
    rows.forEach(r => { ['electric', 'water'].forEach(type => { const prev = r[type + 'Prev'], curr = r[type + 'Curr']; if (curr == null || curr === '') return; const room = Q.room(r.roomId); if (Number(curr) < Number(prev)) { skipped.push(room.code + ' (' + (type === 'electric' ? 'điện' : 'nước') + ' mới < cũ)'); return; } let m = St.one('meterReadings', x => x.roomId === r.roomId && x.period === period && x.type === type && x.status !== 'used'); if (m) Object.assign(m, { prev: Number(prev), curr: Number(curr), contractId: r.contractId || m.contractId || null }); else St.add('meterReadings', { roomId: r.roomId, period, type, prev: Number(prev), curr: Number(curr), status: 'draft', enteredBy: me(), contractId: r.contractId || null }); n++; }); });
    St.audit('meter', 'meterReadings', period, 'Lưu tạm ' + n + ' chỉ số kỳ ' + F.periodLabel(period) + (skipped.length ? ' (bỏ qua ' + skipped.length + ')' : '')); done(); const res = { saved: n, skipped }; res.valueOf = () => n; res.toString = () => String(n); return res;
  };
  X.batchRows = (period, buildingIds) => {
    const svc = F.by(St.all('services'), 'code'); const S = c => (svc[c] || [{}])[0];
    return St.where('contracts', c => c.status === 'active' && c.start <= period + '-31' && (!buildingIds || !buildingIds.length || buildingIds.includes(c.buildingId))).map(c => {
      const room = Q.room(c.roomId); const inv = St.one('invoices', i => i.contractId === c.id && i.period === period && i.docStatus !== 'cancelled');
      const prevE = St.where('meterReadings', m => m.roomId === c.roomId && m.type === 'electric' && m.period < period).sort((a, b) => F.cmp(b.period, a.period))[0];
      const prevW = St.where('meterReadings', m => m.roomId === c.roomId && m.type === 'water' && m.period < period).sort((a, b) => F.cmp(b.period, a.period))[0];
      const invLineIds = inv ? Q.invLines(inv.id).map(l => l.meterId).filter(Boolean) : [];
      // chỉ số kỳ này: nháp của phòng, hoặc chỉ số đã dùng cho chính hóa đơn của HĐ này; chỉ số đã dùng bởi HĐ khác chỉ làm mốc "cũ"
      const cur = (type) => { const all = St.where('meterReadings', m => m.roomId === c.roomId && m.type === type && m.period === period); const own = all.find(m => m.status !== 'used' || invLineIds.includes(m.id)); const usedByOther = all.filter(m => m.status === 'used' && !invLineIds.includes(m.id)); return { own: own || null, usedPrev: usedByOther.length ? Math.max(...usedByOther.map(m => m.curr)) : null }; };
      const rE = cur('electric'), rW = cur('water'); const curE = rE.own, curW = rW.own;
      const fixed = F.sum(Q.contractServices(c.id).filter(s => Q.service(s.serviceId).method !== 'meter'), s => s.price * s.qty);
      const warns = []; if (inv) warns.push(inv.docStatus === 'draft' ? 'Đã có nháp' : 'Đã có hóa đơn'); if (!curE || !curW) warns.push((rE.usedPrev != null || rW.usedPrev != null) ? 'Thiếu chỉ số (chỉ số cũ của HĐ trước)' : 'Thiếu chỉ số'); if (curE && curE.curr < curE.prev || curW && curW.curr < curW.prev) warns.push('Chỉ số mới < cũ'); if (Q.contractStatus(c) === 'expiring') warns.push('HĐ sắp hết hạn');
      return { contract: c, room, invoice: inv, electricPrev: curE ? curE.prev : (rE.usedPrev != null ? rE.usedPrev : (prevE ? prevE.curr : 0)), electricCurr: curE ? curE.curr : null, waterPrev: curW ? curW.prev : (rW.usedPrev != null ? rW.usedPrev : (prevW ? prevW.curr : 0)), waterCurr: curW ? curW.curr : null, rent: c.price, fixed, warns, priceE: S('DIEN').price, priceW: S('NUOC').price, valid: !inv && curE && curW && curE.curr >= curE.prev && curW.curr >= curW.prev };
    }).sort((a, b) => F.cmp(a.room.code, b.room.code));
  };
  X.createInvoiceDrafts = ({ period, contractIds, services, issueNow, key }) => idem(key, () => {
    if (issueNow) Au.need('issueInvoice');
    const svc = F.by(St.all('services'), 'code'); const S = c => (svc[c] || [{}])[0]; const created = []; const skipped = [];
    contractIds.forEach(cid => {
      const c = St.get('contracts', cid); if (!c || c.status !== 'active') return;
      if (St.one('invoices', i => i.contractId === cid && i.period === period && i.docStatus !== 'cancelled')) { skipped.push({ c, why: 'Đã có hóa đơn kỳ này' }); return; }
      const e = St.one('meterReadings', m => m.roomId === c.roomId && m.type === 'electric' && m.period === period && m.status !== 'used'); const w = St.one('meterReadings', m => m.roomId === c.roomId && m.type === 'water' && m.period === period && m.status !== 'used');
      const useE = !services || services.includes('DIEN'), useW = !services || services.includes('NUOC'), useF = !services || services.includes('FIXED');
      if ((useE && (!e || e.curr < e.prev)) || (useW && (!w || w.curr < w.prev))) { skipped.push({ c, why: 'Thiếu chỉ số / chỉ số không hợp lệ' }); return; }
      const due = period + '-' + F.pad(Math.min(28, c.payDay || 5));
      const inv = St.add('invoices', { code: St.nextCode('invoices', 'HD-' + period.replace('-', '') + '-', 3), contractId: c.id, roomId: c.roomId, buildingId: c.buildingId, tenantId: c.tenantId, period, issueDate: null, dueDate: due, docStatus: 'draft', total: 0, note: '', createdBy: me(), reminderCount: 0, lastReminderAt: null, accountingNote: '' });
      let seq = 1; const L = (item, desc, qty, unitPrice, kind, extra = {}) => St.add('invoiceLines', Object.assign({ invoiceId: inv.id, seq: seq++, item, desc, qty, unitPrice, amount: qty * unitPrice, kind }, extra));
      L('Tiền phòng', 'Tiền thuê phòng ' + F.periodLabel(period).toLowerCase(), 1, c.price, 'rent');
      if (useF) Q.contractServices(c.id).forEach(s => { const sv = Q.service(s.serviceId); if (sv.method === 'meter') return; L(s.name, s.name + ' ' + F.periodLabel(period).toLowerCase() + (s.qty > 1 ? ' (' + s.qty + ' ' + s.unit + ')' : ''), s.qty, s.price, 'service', { serviceId: s.serviceId }); });
      if (useE) { L('Điện', 'Tiền điện (' + (e.curr - e.prev) + ' kWh x ' + F.vnd(S('DIEN').price) + ')', e.curr - e.prev, S('DIEN').price, 'electric', { meterId: e.id }); e.status = 'used'; e.contractId = c.id; }
      if (useW) { L('Nước', 'Tiền nước (' + (w.curr - w.prev) + ' m³ x ' + F.vnd(S('NUOC').price) + ')', w.curr - w.prev, S('NUOC').price, 'water', { meterId: w.id }); w.status = 'used'; w.contractId = c.id; }
      inv.total = F.sum(Q.invLines(inv.id), l => l.amount); created.push(inv);
    });
    if (issueNow) created.forEach(inv => { inv.docStatus = 'issued'; inv.issueDate = F.today(); if (inv.dueDate < inv.issueDate) inv.dueDate = inv.issueDate; });
    St.audit('create_invoices', 'invoice', period, 'Tạo ' + created.length + ' hóa đơn ' + (issueNow ? 'và phát hành' : 'nháp') + ' kỳ ' + F.periodLabel(period) + (skipped.length ? ' (' + skipped.length + ' bỏ qua)' : '')); done(); return { created, skipped, id: period + created.length };
  });
  X.issueInvoice = (id) => { Au.need('issueInvoice'); const inv = St.get('invoices', id); if (inv.docStatus !== 'draft') return inv; if (!Q.invLines(id).length) err('Hóa đơn chưa có dòng phí'); Object.assign(inv, { docStatus: 'issued', issueDate: F.today(), dueDate: inv.dueDate < F.today() ? F.today() : inv.dueDate }); St.audit('issue', 'invoice', id, 'Phát hành hóa đơn ' + inv.code + ' – ' + F.vnd(inv.total)); done(); return inv; };
  X.issueInvoices = (ids) => { Au.need('issueInvoice'); let n = 0; ids.forEach(id => { const inv = St.get('invoices', id); if (inv && inv.docStatus === 'draft' && Q.invLines(id).length) { Object.assign(inv, { docStatus: 'issued', issueDate: F.today(), dueDate: inv.dueDate < F.today() ? F.today() : inv.dueDate }); n++; } }); St.audit('issue_bulk', 'invoice', null, 'Phát hành ' + n + ' hóa đơn nháp'); done(); return n; };
  X.cancelDraftInvoice = (id) => { const inv = St.get('invoices', id); if (inv.docStatus !== 'draft') err('Chỉ hủy được hóa đơn Nháp'); inv.docStatus = 'cancelled'; St.where('meterReadings', m => Q.invLines(id).some(l => l.meterId === m.id)).forEach(m => m.status = 'draft'); St.audit('cancel', 'invoice', id, 'Hủy hóa đơn nháp ' + inv.code); done(); };
  X.adjustInvoice = (id, { desc, amount, reason }) => { Au.need('adjustInvoice'); const inv = St.get('invoices', id); if (inv.docStatus === 'draft') err('Hóa đơn nháp – sửa trực tiếp thay vì điều chỉnh'); if (inv.docStatus === 'cancelled') err('Hóa đơn đã hủy – không điều chỉnh'); req(desc, 'Mô tả điều chỉnh'); if (!amount) err('Số tiền điều chỉnh khác 0'); if (inv.total + amount < Q.invPaid(inv)) err('Tổng sau điều chỉnh (' + F.vnd(inv.total + amount) + ') thấp hơn số đã thu ' + F.vnd(Q.invPaid(inv)) + ' – hoàn tác khoản thu trước'); const seq = Q.invLines(id).length + 1; St.add('invoiceLines', { invoiceId: id, seq, item: 'Điều chỉnh', desc: desc + (reason ? ' (' + reason + ')' : ''), qty: 1, unitPrice: amount, amount, kind: 'adjust' }); const before = inv.total; inv.total = F.sum(Q.invLines(id), l => l.amount); inv.docStatus = 'adjusted'; St.audit('adjust', 'invoice', id, 'Điều chỉnh ' + inv.code + ': ' + F.vnd(before) + ' → ' + F.vnd(inv.total), { before, after: inv.total, reason }); done(); return inv; };
  X.addInvoiceLine = (id, { item, desc, qty, unitPrice }) => { const inv = St.get('invoices', id); if (inv.docStatus !== 'draft') err('Chỉ thêm dòng cho hóa đơn Nháp'); req(item, 'Tên khoản'); const q = F.num(qty) || 1, up = F.num(unitPrice); if (!up) err('Đơn giá khác 0'); const l = St.add('invoiceLines', { invoiceId: id, seq: Q.invLines(id).length + 1, item, desc: desc || item, qty: q, unitPrice: up, amount: q * up, kind: 'service' }); inv.total = F.sum(Q.invLines(id), x => x.amount); St.audit('add_line', 'invoice', id, 'Thêm dòng "' + item + '" ' + F.vnd(q * up) + ' vào ' + inv.code); done(); return l; };
  X.updateInvoiceNote = (id, accountingNote) => { St.update('invoices', id, { accountingNote, accountingNoteBy: (St.state.session || {}).name, accountingNoteAt: F.nowISO() }); done(); };

  /* ---------- Thu tiền ---------- */
  X.recordPayment = (d, key) => idem(key, () => {
    Au.need('recordPayment'); req(d.tenantId, 'Chọn khách thuê'); req(d.date, 'Ngày thu'); const amount = F.num(d.amount); if (amount <= 0) err('Số tiền phải lớn hơn 0'); req(d.method, 'Phương thức thanh toán');
    const allocs = (d.allocations || []).map(a => ({ invoiceId: a.invoiceId, amount: F.num(a.amount) })).filter(a => a.amount > 0);
    if (allocs.some(a => a.amount < 0)) err('Số phân bổ không được âm');
    const total = F.sum(allocs, a => a.amount); if (total > amount) err('Tổng phân bổ (' + F.vnd(total) + ') vượt khoản thu (' + F.vnd(amount) + ')');
    allocs.forEach(a => { const inv = St.get('invoices', a.invoiceId); if (!inv) err('Hóa đơn không tồn tại'); if (inv.docStatus === 'draft') err('Không phân bổ vào hóa đơn Nháp'); if (a.amount > Q.invRemaining(inv) + 0.5) err('Phân bổ ' + F.vnd(a.amount) + ' vượt số còn lại của ' + inv.code + ' (BR-22)'); });
    const first = allocs[0] ? St.get('invoices', allocs[0].invoiceId) : null; const room = first ? Q.room(first.roomId) : Q.tenantRoom(Q.tenant(d.tenantId));
    const p = St.add('payments', { code: St.nextCode('payments', 'PAY-' + F.today().slice(0, 7).replace('-', '') + '-', 3), tenantId: d.tenantId, roomId: room ? room.id : null, buildingId: room ? room.buildingId : null, date: d.date, amount, method: d.method, ref: d.ref || '', evidence: d.evidence || '', note: d.note || '', status: 'recorded', createdBy: me(), bank: d.method === 'Chuyển khoản' ? 'Vietcombank' : '', transferContent: d.method === 'Chuyển khoản' ? ('THANH TOAN TIEN NHA ' + (room ? room.code : '')) : '', unallocated: amount - total, history: [{ at: F.nowISO(), who: (St.state.session || {}).name, what: 'Tạo & xác nhận khoản thu' }] });
    allocs.forEach(a => St.add('paymentAllocations', { paymentId: p.id, invoiceId: a.invoiceId, amount: a.amount }));
    allocs.forEach(a => { const inv = St.get('invoices', a.invoiceId); St.audit('payment', 'invoice', inv.id, 'Thu ' + F.vnd(a.amount) + ' vào ' + inv.code + ' (' + p.code + ') – còn lại ' + F.vnd(Q.invRemaining(inv))); });
    St.audit('payment', 'payment', p.id, 'Ghi nhận khoản thu ' + p.code + ' ' + F.vnd(amount) + ' – ' + Q.tenant(d.tenantId).name); done(); return p;
  });
  // Xác nhận thu tiền đơn giản: thu ĐỦ số còn lại của các hóa đơn đã chọn, 1 khoản thu / khách, bắt buộc minh chứng
  X.confirmPayments = ({ invoiceIds, date, method, ref, evidence, note }, key) => idem(key, () => {
    Au.need('recordPayment'); req(date, 'Ngày thu'); req(method, 'Phương thức thanh toán'); req(evidence, 'Đính kèm minh chứng thu tiền (ảnh chuyển khoản / biên lai)');
    const invs = (invoiceIds || []).map(id => St.get('invoices', id)).filter(i => i && !['draft', 'cancelled'].includes(i.docStatus) && Q.invRemaining(i) > 0);
    if (!invs.length) err('Không có hóa đơn nào còn nợ để xác nhận');
    const total = F.sum(invs, i => Q.invRemaining(i));
    const payments = Object.entries(F.by(invs, 'tenantId')).map(([tid, list]) => X.recordPayment({ tenantId: tid, date, method, ref: ref || '', evidence, note: note || ('Xác nhận thu ' + list.map(i => i.code).join(', ')), amount: F.sum(list, i => Q.invRemaining(i)), allocations: list.map(i => ({ invoiceId: i.id, amount: Q.invRemaining(i) })) }, key + ':' + tid));
    St.audit('confirm_pay', 'payment', payments.length === 1 ? payments[0].id : null, 'Xác nhận thu ' + invs.length + ' hóa đơn – ' + F.vnd(total) + ' (' + payments.map(p => p.code).join(', ') + ') – minh chứng ' + evidence); done(); return { payments, invoices: invs, total };
  });
  X.reversePayment = (id, reason) => { Au.need('reversePayment'); const p = St.get('payments', id); if (p.status === 'reversed') err('Khoản thu đã được hoàn tác'); req(reason, 'Nhập lý do hoàn tác'); p.status = 'reversed'; p.reverseReason = reason; p.reversedAt = F.nowISO(); (p.history = p.history || []).push({ at: F.nowISO(), who: (St.state.session || {}).name, what: 'Hoàn tác ghi nhận: ' + reason }); St.audit('reverse', 'payment', id, 'Hoàn tác khoản thu ' + p.code + ' – ' + reason, { before: 'recorded', after: 'reversed' }); done(); return p; };
  X.adjustPaymentAllocations = (id, allocations, reason) => {
    Au.need('adjustPayment'); const p = St.get('payments', id); if (p.status !== 'recorded') err('Chỉ điều chỉnh khoản thu đang ghi nhận'); req(reason, 'Nhập lý do điều chỉnh');
    const before = Q.payAllocs(id).map(a => ({ invoiceId: a.invoiceId, amount: a.amount }));
    const next = allocations.map(a => ({ invoiceId: a.invoiceId, amount: F.num(a.amount) })).filter(a => a.amount > 0); if (F.sum(next, a => a.amount) > p.amount) err('Tổng phân bổ vượt khoản thu');
    // validate toàn bộ trước khi ghi (còn lại của hóa đơn + phần cũ của chính khoản thu này)
    next.forEach(a => { const inv = St.get('invoices', a.invoiceId); if (!inv) err('Hóa đơn không tồn tại'); if (inv.docStatus === 'draft' || inv.docStatus === 'cancelled') err('Không phân bổ vào hóa đơn ' + Q.label('invDoc', inv.docStatus)); const mine = F.sum(before.filter(b => b.invoiceId === a.invoiceId), b => b.amount); if (a.amount > Q.invRemaining(inv) + mine + 0.5) err('Phân bổ ' + F.vnd(a.amount) + ' vượt số còn lại của ' + inv.code + ' (' + F.vnd(Q.invRemaining(inv) + mine) + ')'); });
    St.removeWhere('paymentAllocations', a => a.paymentId === id);
    next.forEach(a => St.add('paymentAllocations', { paymentId: id, invoiceId: a.invoiceId, amount: a.amount }));
    p.unallocated = p.amount - F.sum(next, a => a.amount); p.adjusted = true; (p.history = p.history || []).push({ at: F.nowISO(), who: (St.state.session || {}).name, what: 'Điều chỉnh phân bổ: ' + reason });
    St.audit('adjust', 'payment', id, 'Điều chỉnh phân bổ ' + p.code, { before, after: next, reason }); done(); return p;
  };

  /* ---------- Hoàn cọc ---------- */
  X.saveRefund = (d) => {
    req(d.contractId, 'Chọn hợp đồng'); const c = Q.contract(d.contractId); if (!['ended', 'active'].includes(c.status)) err('Hợp đồng không hợp lệ');
    if (c.renewedToId) err('Hợp đồng đã gia hạn bằng ' + (Q.contract(c.renewedToId).code || '') + ' – tiền cọc chuyển sang hợp đồng mới, không hoàn cọc');
    let rf; const existing = d.id ? St.get('refunds', d.id) : St.one('refunds', r => r.contractId === d.contractId && ['draft', 'rejected', 'needs_edit'].includes(r.status));
    if (existing && !['draft', 'rejected', 'needs_edit'].includes(existing.status)) err('Hồ sơ ' + existing.code + ' đang ' + Q.label('refund', existing.status) + ' – không sửa được phương án');
    const other = St.one('refunds', r => r.contractId === c.id && (!existing || r.id !== existing.id) && ['pending', 'approved', 'refunded'].includes(r.status)); if (other) err('Hợp đồng đã có hồ sơ hoàn cọc ' + other.code + ' (' + Q.label('refund', other.status) + ')');
    const debt = Q.contractDebt(c.id);
    const base = { contractId: c.id, tenantId: c.tenantId, roomId: c.roomId, buildingId: c.buildingId, requestDate: F.today(), moveOutDate: d.moveOutDate || c.actualEnd || c.end, deposit: c.deposit, debt, offsetDebt: !!d.offsetDebt, approverRole: d.approverRole || 'Kế toán trưởng', inspection: d.inspection || {}, files: d.files || [], handlerId: me() };
    if (existing) { rf = existing; Object.assign(rf, base, { status: rf.status === 'rejected' ? 'draft' : rf.status }); if (d.inspection2) rf.inspection2 = d.inspection2; if (d.photos) rf.photos = d.photos; } else rf = St.add('refunds', Object.assign({ code: St.nextCode('refunds', 'RC' + periodCode() + '-', 3), status: 'draft', rejectReason: '' }, base));
    if (d.deductions) { St.removeWhere('refundDeductions', x => x.refundId === rf.id); d.deductions.forEach(x => { if (x.desc || x.amount) { const code = x.groupCode || ({ 'Khấu hao': 'KH', 'Sửa chữa': 'SC', 'Dịch vụ': 'VS', 'Công nợ': 'CN', 'Khác': 'KHAC' }[x.group] || 'KHAC'); St.add('refundDeductions', { refundId: rf.id, group: x.group || ((Q.L.deductionGroup[code] || ['Khác'])[0]), groupCode: code, desc: x.desc || '', amount: Math.max(0, F.num(x.amount)), evidenceCount: x.evidenceCount || 0, status: x.evidenceCount ? 'confirmed' : 'pending' }); } }); }
    const comp = Q.refundCompute(rf); rf.deductionsTotal = comp.ded; rf.refundAmount = comp.refund; rf.exceeds = comp.ded + comp.debt > rf.deposit;
    St.audit('save', 'refund', rf.id, 'Lưu phương án hoàn cọc ' + rf.code); done(); return rf;
  };
  X.submitRefund = (id) => { const rf = St.get('refunds', id); if (!['draft', 'rejected', 'needs_edit'].includes(rf.status)) err('Hồ sơ không ở trạng thái Nháp/Cần chỉnh sửa'); const ded = Q.refundDeductions(id); if (!ded.length) err('Cần ít nhất một dòng khấu trừ hoặc ghi rõ không khấu trừ'); if (ded.some(x => x.amount > 0 && !x.evidenceCount && x.group !== 'Khấu hao')) err('Dòng khấu trừ chưa có bằng chứng (FR-FIN-06)'); const comp = Q.refundCompute(rf); if (comp.ded + comp.debt > rf.deposit) err('Khấu trừ vượt tiền cọc – xử lý theo OI-07, không thể gửi duyệt'); Object.assign(rf, { status: 'pending', submittedAt: F.nowISO(), submittedBy: me(), rejectReason: '' }); (rf.history = rf.history || []).push({ at: F.nowISO(), by: me(), status: 'pending', note: 'Gửi duyệt' }); St.audit('submit', 'refund', id, 'Gửi duyệt hoàn cọc ' + rf.code + ' – đề nghị hoàn ' + F.vnd(rf.refundAmount)); done(); return rf; };
  X.approveRefund = (id) => { Au.need('approveRefund', 'Chỉ Admin hoặc Kế toán được duyệt hoàn cọc (FR-FIN-07)'); const rf = St.get('refunds', id); if (rf.status !== 'pending') err('Hồ sơ không ở trạng thái Chờ duyệt'); Object.assign(rf, { status: 'approved', approvedAt: F.nowISO(), approvedBy: me(), approvedAmount: rf.refundAmount }); (rf.history = rf.history || []).push({ at: F.nowISO(), by: me(), status: 'approved', note: 'Duyệt hoàn cọc' }); St.audit('approve', 'refund', id, 'Duyệt hoàn cọc ' + rf.code + ' – ' + F.vnd(rf.refundAmount)); done(); return rf; };
  X.rejectRefund = (id, reason) => { Au.need('rejectRefund', 'Chỉ Admin hoặc Kế toán được từ chối hoàn cọc (FR-FIN-07)'); const rf = St.get('refunds', id); if (rf.status !== 'pending') err('Hồ sơ không ở trạng thái Chờ duyệt'); req(reason, 'Nhập lý do từ chối'); Object.assign(rf, { status: 'rejected', rejectReason: reason, rejectedAt: F.nowISO(), rejectedBy: me() }); (rf.history = rf.history || []).push({ at: F.nowISO(), by: me(), status: 'rejected', note: reason }); St.audit('reject', 'refund', id, 'Từ chối hoàn cọc ' + rf.code + ': ' + reason); done(); return rf; };
  X.recordRefundPaid = (id, { paidDate, paidMethod, paidRef, paidEvidence }) => { Au.need('recordRefundPaid'); const rf = St.get('refunds', id); if (rf.status !== 'approved') err('Chỉ ghi nhận hoàn cho hồ sơ Đã duyệt'); req(paidDate, 'Ngày hoàn'); req(paidMethod, 'Phương thức'); req(paidEvidence, 'Bằng chứng hoàn tiền là bắt buộc'); Object.assign(rf, { status: 'refunded', paidDate, paidMethod, paidRef: paidRef || '', paidEvidence, paidBy: me(), paidAt: F.nowISO() }); St.where('refundDeductions', d => d.refundId === id).forEach(d => { d.status = 'refunded'; d.refundedAt = rf.paidAt; }); (rf.history = rf.history || []).push({ at: F.nowISO(), by: me(), status: 'refunded', note: 'Đã hoàn tiền ' + paidMethod }); St.audit('refunded', 'refund', id, 'Ghi nhận đã hoàn cọc ' + rf.code + ' – ' + F.vnd(rf.refundAmount) + ' (phòng giữ nguyên trạng thái)'); done(); return rf; };

  /* ---------- Chi phí ---------- */
  X.saveExpense = (d) => {
    req(d.date, 'Ngày chi'); req(d.group, 'Nhóm chi'); const amount = F.num(d.amount); if (amount <= 0) err('Số tiền phải lớn hơn 0');
    const common = !d.buildingId; let allocs = [];
    if (common && d.allocations && d.allocations.length) { allocs = d.allocations.filter(a => a.buildingId).map(a => ({ buildingId: a.buildingId, pct: F.num(a.pct) })); const tot = F.sum(allocs, a => a.pct); if (Math.round(tot) !== 100) err('Tổng tỷ lệ phân bổ phải bằng 100% (hiện ' + tot + '%) – FR-FIN-05'); }
    let ex; const category = Q.expenseCategory ? Q.expenseCategory(d.categoryCode) : {}; const payload = { date: d.date, categoryCode: d.categoryCode || '', group: category.name || d.group, desc: d.desc || '', buildingId: d.buildingId || null, amount, recordType: d.recordType || (common ? 'common' : 'ops'), method: d.method || 'cash', depreciationMonths: d.method === 'depreciation' ? (d.depreciationMonths || 36) : undefined, evidence: d.evidence || '', note: d.note || '', status: common && !allocs.length ? 'pending_alloc' : 'recorded' };
    if (d.id) { ex = St.update('expenses', d.id, payload); St.removeWhere('expenseAllocations', a => a.expenseId === ex.id); } else ex = St.add('expenses', Object.assign({ code: St.nextCode('expenses', 'CP', 4), createdBy: me() }, payload));
    allocs.forEach(a => St.add('expenseAllocations', { expenseId: ex.id, buildingId: a.buildingId, pct: a.pct, amount: Math.round(amount * a.pct / 100) }));
    St.audit('save', 'expense', ex.id, 'Lưu chi phí ' + ex.code + ' ' + F.vnd(amount)); done(); return ex;
  };
  X.deleteExpense = (id) => { const ex = St.get('expenses', id); if (ex.source === 'seed') err('Chỉ xóa được chi phí do bạn tạo trong phiên demo'); St.remove('expenses', id); St.removeWhere('expenseAllocations', a => a.expenseId === id); St.audit('delete', 'expense', id, 'Xóa chi phí ' + ex.code); done(); };

  /* ---------- Zalo ---------- */
  X.saveZaloEvent = (d) => { Au.need('zaloConfig'); const e = St.get('zaloEvents', d.id); if (e.p2 && !TH.phase.on(2)) err('Sự kiện "Đến kỳ trả chủ nhà" thuộc Phase 2 (OI-03) – bật Phase 2 để cấu hình'); Object.assign(e, d); St.audit('save', 'zaloEvent', e.id, 'Lưu cấu hình sự kiện ' + e.name); done(); return e; };
  X.toggleZaloEvent = (id, on) => { Au.need('zaloConfig'); const e = St.get('zaloEvents', id); if (e.p2 && !TH.phase.on(2)) err('Sự kiện thuộc Phase 2 – bật Phase 2 để kích hoạt'); e.enabled = !!on; St.audit('toggle', 'zaloEvent', id, (on ? 'Bật' : 'Tắt') + ' rule ' + e.name); done(); };
  X.saveTemplate = (d) => { Au.need('zaloConfig'); req(d.name, 'Tên mẫu'); req(d.body, 'Nội dung mẫu'); let t; if (d.id) t = St.update('zaloTemplates', d.id, d); else t = St.add('zaloTemplates', Object.assign({ code: 'TM_' + F.slug(d.name).toUpperCase().replace(/-/g, '_').slice(0, 14) + '_' + F.pad(St.all('zaloTemplates').length + 1, 3) }, d)); done(); return t; };
  // Xác định người nhận + re-check công nợ (FR-ZAL-02)
  X.buildRecipients = (sourceKey, opts = {}) => {
    const out = []; const seen = new Set();
    const push = (o) => { const k = o.tenantId + '|' + (o.invoiceId || o.contractId || ''); if (seen.has(k)) return; seen.add(k); out.push(o); };
    const rangeOK = (inv) => (!opts.buildingId || inv.buildingId === opts.buildingId) && (!opts.period || inv.period === opts.period);
    const evalInv = (inv, why) => { const t = Q.tenant(inv.tenantId); const rem = Q.invRemaining(inv); let elig = 'ok', reason = why; if (rem <= 0) { elig = 'skip'; reason = 'Đã thanh toán đủ'; } else if (!t.phone) { elig = 'error'; reason = 'Thiếu SĐT'; } else if (Q.recentMessageTo(t.id, 3) && !opts.ignoreRecent) { elig = 'skip'; reason = 'Đã nhận tin trong 3 ngày qua'; } else if (rem < inv.total) reason = 'Thanh toán một phần – gửi số còn nợ'; push({ tenantId: t.id, invoiceId: inv.id, roomId: inv.roomId, buildingId: inv.buildingId, amount: rem, due: inv.dueDate, elig, reason }); };
    if (sourceKey === 'issued') St.where('invoices', i => i.docStatus !== 'draft' && i.docStatus !== 'cancelled' && rangeOK(i) && (!opts.issuedFrom || (i.issueDate || '') >= opts.issuedFrom)).forEach(i => evalInv(i, 'Hóa đơn đã phát hành'));
    if (sourceKey === 'overdue') St.where('invoices', i => Q.invOverdue(i) && rangeOK(i)).forEach(i => evalInv(i, 'Quá hạn ' + Q.invOverdueDays(i) + ' ngày'));
    if (sourceKey === 'due_soon') { const n = opts.days || 3; St.where('invoices', i => i.docStatus !== 'draft' && i.docStatus !== 'cancelled' && rangeOK(i) && F.daysUntil(i.dueDate) >= 0 && F.daysUntil(i.dueDate) <= n).forEach(i => evalInv(i, 'Đến hạn trong ' + F.daysUntil(i.dueDate) + ' ngày')); }
    if (sourceKey === 'debt') St.where('invoices', i => i.docStatus !== 'draft' && i.docStatus !== 'cancelled' && rangeOK(i) && Q.invRemaining(i) > 0 && Q.invDebtFlag(i)).forEach(i => evalInv(i, 'Cần xử lý công nợ (phát hành ≥ 5 ngày)'));
    if (sourceKey === 'contract_expiry') St.where('contracts', c => Q.contractStatus(c) === 'expiring' && (!opts.buildingId || c.buildingId === opts.buildingId)).forEach(c => { const t = Q.tenant(c.tenantId); push({ tenantId: t.id, contractId: c.id, roomId: c.roomId, buildingId: c.buildingId, amount: 0, due: c.end, elig: t.phone ? 'ok' : 'error', reason: t.phone ? 'Còn ' + F.daysUntil(c.end) + ' ngày' : 'Thiếu SĐT' }); });
    if (sourceKey === 'refund_done') St.where('refunds', r => r.status === 'refunded' && (!opts.buildingId || r.buildingId === opts.buildingId) && (!opts.refundId || r.id === opts.refundId)).forEach(r => { const t = Q.tenant(r.tenantId); const already = St.one('zaloMessages', m => m.refundId === r.id && ['delivered', 'accepted'].includes(m.status)); push({ tenantId: t.id, refundId: r.id, roomId: r.roomId, buildingId: r.buildingId, amount: r.refundAmount, due: r.paidDate, elig: already ? 'skip' : (t.phone ? 'ok' : 'error'), reason: already ? 'Đã gửi thông báo hoàn cọc' : 'Đã hoàn ' + F.date(r.paidDate) }); });
    if (sourceKey === 'broadcast') St.where('contracts', c => c.status === 'active' && (!opts.buildingId || c.buildingId === opts.buildingId)).forEach(c => { const t = Q.tenant(c.tenantId); push({ tenantId: t.id, contractId: c.id, roomId: c.roomId, buildingId: c.buildingId, amount: 0, elig: t.phone ? 'ok' : 'error', reason: 'Cư dân đang thuê' }); });
    if (sourceKey === 'manual' && opts.invoiceIds) opts.invoiceIds.forEach(id => { const inv = St.get('invoices', id); if (inv && inv.docStatus !== 'draft' && inv.docStatus !== 'cancelled') evalInv(inv, 'Chọn tay'); });
    if (sourceKey === 'manual' && opts.tenantIds) opts.tenantIds.filter(id => !out.some(o => o.tenantId === id)).forEach(id => { const t = Q.tenant(id); const c = Q.activeContractOfTenant(id); push({ tenantId: id, contractId: c ? c.id : null, roomId: c ? c.roomId : null, buildingId: c ? c.buildingId : null, amount: 0, elig: t.phone ? 'ok' : 'error', reason: 'Chọn tay' }); });
    return out;
  };
  X.createZaloBatch = ({ name, eventKey, sourceKey, templateId, recipients, sendMode, sendAt, scopeLabel, period, key }) => idem(key, () => {
    req(templateId, 'Chọn mẫu thông báo');
    const ev = St.one('zaloEvents', e => e.key === eventKey); if (ev && !ev.enabled && sourceKey !== 'test') err('Rule "' + ev.name + '" đang tắt – bật tại Cấu hình → Thông báo & nhắc việc (#/zalo/config) trước khi tạo đợt gửi');
    // re-check công nợ ngay lúc xác nhận (FR-ZAL-02): khách đã trả đủ → bỏ qua, trả một phần → số còn nợ mới
    recipients = recipients.map(r => { if (!r.invoiceId || r.elig === 'error') return r; const inv = St.get('invoices', r.invoiceId); if (!inv || inv.docStatus === 'cancelled') return Object.assign({}, r, { elig: 'skip', reason: 'Hóa đơn không còn hiệu lực' }); const rem = Q.invRemaining(inv); if (rem <= 0) return Object.assign({}, r, { elig: 'skip', reason: 'Đã thanh toán đủ (re-check lúc gửi)', amount: 0 }); return Object.assign({}, r, { amount: rem }); });
    const ok = recipients.filter(r => r.elig === 'ok' && r.selected !== false); if (!ok.length) err('Không có người nhận đủ điều kiện (sau re-check công nợ)');
    const tpl = Q.template(templateId);
    const b = St.add('zaloBatches', { code: St.nextCode('zaloBatches', 'ZL-' + periodCode(period) + '-', 3), name: name || (Q.L.eventName[eventKey] || 'Thông báo') + ' ' + F.date(F.today()), eventKey, sourceKey, audience: 'Khách thuê', plannedCount: ok.length, sentCount: 0, failedCount: 0, sentAt: null, createdBy: me(), status: sendMode === 'later' ? 'scheduled' : 'draft', templateId, scopeLabel: scopeLabel || 'Tất cả tòa nhà', period: period || F.today().slice(0, 7), sendMode: sendMode || 'now', sendAt: sendAt || null, rules: 'Re-check công nợ trước khi gửi · Chỉ gửi 1 tin / khách / kỳ · Bỏ qua nếu khách đã nhận tin trong 3 ngày qua', skipped: recipients.filter(r => r.elig === 'skip').length, errors: recipients.filter(r => r.elig === 'error').length, source: 'user' });
    recipients.filter(r => r.selected !== false && r.elig !== 'error').forEach(r => { const t = Q.tenant(r.tenantId); const inv = r.invoiceId ? St.get('invoices', r.invoiceId) : null; const content = Q.renderTemplate(tpl.body, Q.templateCtx(inv, t, { room: Q.room(r.roomId), buildingId: r.buildingId, amount: r.amount, due: r.due, end: r.contractId ? Q.contract(r.contractId).end : null, paidDate: r.refundId ? (St.get('refunds', r.refundId) || {}).paidDate : null })); St.add('zaloMessages', { batchId: b.id, tenantId: r.tenantId, roomId: r.roomId, buildingId: r.buildingId, invoiceId: r.invoiceId || null, contractId: r.contractId || null, refundId: r.refundId || null, channel: 'Zalo', templateCode: tpl.code, status: r.elig === 'skip' ? 'skipped' : 'queued', errorCode: '', skipReason: r.elig === 'skip' ? r.reason : '', sentAt: null, phone: t.phone, content, amountAtSend: r.amount, retryOfId: null, attempt: 1, source: 'user' }); });
    St.audit('create', 'zaloBatch', b.id, 'Tạo đợt gửi ' + b.code + ' – ' + b.name + ' (' + ok.length + ' người)');
    if (sendMode !== 'later') X.startBatch(b.id); else done();
    return b;
  });
  const timers = {};
  X.startBatch = (id) => {
    const b = St.get('zaloBatches', id); if (!b || b.status === 'sending') return; b.status = 'sending'; b.startedAt = F.nowISO(); b.sentAt = b.sentAt || F.nowISO(); done();
    X.resumeBatch(id);
  };
  X.resumeBatch = (id) => {
    if (timers[id]) return; let tick = 0;
    timers[id] = setInterval(() => {
      const b = St.get('zaloBatches', id); if (!b) { clearInterval(timers[id]); delete timers[id]; return; }
      const msgs = Q.batchMessages(id); let changed = 0; tick++;
      msgs.forEach((m, i) => {
        const h = parseInt(F.hash(m.id + ':' + tick + ':' + i).slice(0, 4), 16) % 100;
        if (m.status === 'queued' && h < 45) { m.status = 'sending'; m.sentAt = F.nowISO(); changed++; }
        else if (m.status === 'sending' && h < 60) { m.status = 'accepted'; changed++; }
        else if (m.status === 'accepted' && h < 50) { const r = parseInt(F.hash(m.id).slice(-2), 16) % 100; if (r < 88) m.status = 'delivered'; else if (r < 95) { m.status = 'failed'; m.errorCode = r < 92 ? 'ZLM-1001' : (r < 94 || !(TH.phase && TH.phase.on(2)) ? 'ZLM-2003' : 'ZLM-4008'); } else m.status = 'unknown'; if (TH.phase && TH.phase.on(2)) { m.providerCode = m.status === 'failed' ? ({ 'ZLM-1001': '300', 'ZLM-2003': '403', 'ZLM-4008': '408' })[m.errorCode] : m.status === 'delivered' ? '200' : ''; m.providerMsg = Q.providerMsg ? Q.providerMsg(m.providerCode) : ''; (m.attempts = m.attempts || []).push({ n: m.attempt || 1, at: F.nowISO(), code: m.providerCode, msg: m.providerMsg }); } changed++; }
      });
      const c = Q.batchCounts(id); b.sentCount = c.delivered + c.accepted; b.failedCount = c.failed;
      if (!msgs.some(m => ['queued', 'sending', 'accepted'].includes(m.status)) || tick > 60) {
        msgs.forEach(m => { if (['queued', 'sending', 'accepted'].includes(m.status)) m.status = 'delivered'; });
        const c2 = Q.batchCounts(id); b.sentCount = c2.delivered; b.failedCount = c2.failed;
        b.status = c2.failed === 0 && c2.unknown === 0 ? 'done' : (c2.delivered === 0 ? 'failed' : 'partial'); b.finishedAt = F.nowISO();
        b.errors = c2.failed ? 'Một số tin thất bại (mã ZLM-1001 SĐT không hợp lệ / ZLM-2003 khách chặn tin)' : '';
        St.audit('finish', 'zaloBatch', id, 'Đợt gửi ' + b.code + ' kết thúc: ' + c2.delivered + ' đã giao, ' + c2.failed + ' thất bại');
        clearInterval(timers[id]); delete timers[id];
      }
      if (changed || !timers[id]) { St.save(); St.emit('change', { source: 'timer' }); }
    }, 900);
  };
  X.resumeBatches = () => St.where('zaloBatches', b => b.status === 'sending').forEach(b => X.resumeBatch(b.id));
  X.retryBatch = (id) => { const b = St.get('zaloBatches', id); const targets = Q.batchMessages(id).filter(m => ['failed', 'unknown'].includes(m.status) && !St.one('zaloMessages', x => x.retryOfId === m.id)); if (!targets.length) err('Không có tin đủ điều kiện thử lại (chỉ tin Thất bại/Chưa rõ, chưa thử lại)'); targets.forEach(m => { St.add('zaloMessages', Object.assign({}, m, { id: undefined, status: 'queued', errorCode: '', sentAt: null, retryOfId: m.id, attempt: (m.attempt || 1) + 1, createdAt: undefined, source: 'user' })); m.retried = true; }); St.audit('retry', 'zaloBatch', id, 'Thử lại ' + targets.length + ' tin của ' + b.code); b.status = 'sending'; done(); X.resumeBatch(id); return targets.length; };
  X.retryMessage = (mid) => { Au.need('zalo.send'); const m = St.get('zaloMessages', mid); if (!['failed', 'unknown'].includes(m.status)) err('Chỉ thử lại tin Thất bại/Chưa rõ kết quả'); if (TH.phase.on(2) && St.state.meta.zaloPolicy && (m.attempt || 1) >= St.state.meta.zaloPolicy.maxRetry) err('Đã quá số lần retry theo chính sách (' + St.state.meta.zaloPolicy.maxRetry + ')'); if (St.one('zaloMessages', x => x.retryOfId === mid)) err('Tin này đã được thử lại'); St.add('zaloMessages', Object.assign({}, m, { id: undefined, status: 'queued', errorCode: '', sentAt: null, retryOfId: mid, attempt: (m.attempt || 1) + 1, createdAt: undefined, source: 'user' })); m.retried = true; const b = St.get('zaloBatches', m.batchId); b.status = 'sending'; St.audit('retry', 'zaloMessage', mid, 'Thử lại tin cho ' + Q.tenant(m.tenantId).name); done(); X.resumeBatch(m.batchId); };
  X.sendTest = (eventKey, tenantId) => { const ev = St.one('zaloEvents', e => e.key === eventKey); const t = Q.tenant(tenantId); const c = Q.activeContractOfTenant(tenantId); const inv = c ? St.where('invoices', i => i.contractId === c.id && i.docStatus !== 'draft').sort((a, b) => F.cmp(b.period, a.period))[0] : null; return X.createZaloBatch({ name: 'Gửi thử – ' + ev.name, eventKey, sourceKey: 'test', templateId: ev.templateId, recipients: [{ tenantId, invoiceId: inv ? inv.id : null, contractId: c ? c.id : null, roomId: c ? c.roomId : null, buildingId: c ? c.buildingId : null, amount: inv ? Q.invRemaining(inv) : 0, due: inv ? inv.dueDate : null, elig: 'ok', reason: 'Gửi thử' }], sendMode: 'now', scopeLabel: 'Gửi thử 1 khách' }); };

  /* ---------- Tài khoản ---------- */
  X.saveUser = (d) => {
    Au.need('manageUsers'); req(d.name, 'Họ tên'); req(d.email, 'Email'); req(d.phone, 'Số điện thoại'); req(d.role, 'Vai trò'); req(d.effectiveDate, 'Ngày hiệu lực');
    if (d.role === 'tech') d.role = 'kythuat'; { const ph = TH.phase ? TH.phase.ofRole(d.role) : 1; if (ph > 1 && !d.id && !TH.phase.on(ph)) err('Vai trò ' + Au.ROLE_LABEL[d.role] + ' thuộc Phase ' + ph + ' – bật Phase ' + ph + ' trong Công cụ nâng cao để tạo'); }
    if (St.one('users', u => u.email.toLowerCase() === d.email.toLowerCase() && u.id !== d.id)) err('Email đã tồn tại');
    d.buildingIds = d.role === 'ops' && Array.isArray(d.buildingIds) ? [...new Set(d.buildingIds)] : [];
    let u; if (d.id) u = St.update('users', d.id, d); else u = St.add('users', Object.assign({ username: d.email.split('@')[0].toLowerCase(), status: 'active', lastLogin: null, note: '', scope: d.scope || 'Toàn hệ thống' }, d));
    St.audit('save', 'user', u.id, 'Lưu tài khoản ' + u.name + ' (' + Au.ROLE_LABEL[u.role] + ')'); done(); return u;
  };
  X.setUserStatus = (id, status) => { Au.need('manageUsers'); const u = St.update('users', id, { status }); St.audit('status', 'user', id, u.name + ' → ' + Q.label('user', status)); done(); };
  X.resetPassword = (id) => { Au.need('manageUsers'); St.audit('reset_pw', 'user', id, 'Đặt lại mật khẩu ' + Q.userName(id)); done(); };

  /* ---------- Import ---------- */
  X.runImport = ({ type, fileName, rows, checksum, key }) => idem(key || ('import:' + checksum), () => {
    let created = 0, skipped = 0;
    rows.forEach(r => {
      if (r.status === 'error') { skipped++; return; }
      const d = r.data;
      if (type === 'tenant') { if (St.one('tenants', t => t.phone.replace(/\s/g, '') === String(d.phone || '').replace(/\s/g, ''))) { skipped++; return; } St.add('tenants', { code: St.nextCode('tenants', 'KH', 5), name: d.name, phone: d.phone, zalo: d.zalo || d.phone, email: d.email || '', idNumber: d.idNumber || '', dob: '', job: d.job || '', segment: '', verified: false, managerId: me(), note: 'Import từ ' + fileName, importRoom: d.roomCode || '' }); created++; }
      if (type === 'room') { const b = St.one('buildings', x => x.code === d.buildingCode || x.name === d.buildingCode); if (!b || St.one('rooms', x => x.buildingId === b.id && x.code === d.code)) { skipped++; return; } St.add('rooms', { code: d.code, buildingId: b.id, floor: F.num(d.floor) || 1, type: d.type || 'Phòng đơn', area: F.num(d.area) || 20, price: F.num(d.price), physical: 'good', status: 'ready', managerId: b.managerId, direction: '', furniture: 'Cơ bản', defaultServiceIds: [] }); created++; }
      if (type === 'meter') { const room = St.one('rooms', x => x.code === d.roomCode); if (!room) { skipped++; return; } ['electric', 'water'].forEach(tp => { const prev = F.num(d[tp + 'Prev']), curr = F.num(d[tp + 'Curr']); if (!curr) return; let m = St.one('meterReadings', x => x.roomId === room.id && x.period === d.period && x.type === tp); if (m && m.status === 'used') return; if (m) Object.assign(m, { prev, curr }); else St.add('meterReadings', { roomId: room.id, period: d.period, type: tp, prev, curr, status: 'draft', enteredBy: me() }); }); created++; }
      if (type === 'invoice') { const room = St.one('rooms', x => x.code === d.roomCode); const c = room ? Q.activeContractOfRoom(room.id) : null; if (!c || St.one('invoices', i => i.contractId === c.id && i.period === d.period && i.docStatus !== 'cancelled')) { skipped++; return; }
        const inv = St.add('invoices', { code: St.nextCode('invoices', 'HD-' + d.period.replace('-', '') + '-', 3), contractId: c.id, roomId: room.id, buildingId: c.buildingId, tenantId: c.tenantId, period: d.period, issueDate: null, dueDate: /^\d{4}-\d{2}-\d{2}$/.test(d.dueDate || '') ? d.dueDate : d.period + '-' + F.pad(Math.min(28, c.payDay || 5)), docStatus: 'draft', total: 0, note: d.note || ('Import từ ' + fileName), createdBy: me(), reminderCount: 0, lastReminderAt: null, accountingNote: '', source: 'import' });
        let seq = 1; const L = (item, desc, amount, kind) => St.add('invoiceLines', { invoiceId: inv.id, seq: seq++, item, desc, qty: 1, unitPrice: amount, amount, kind }); const per = F.periodLabel(d.period).toLowerCase();
        L('Tiền phòng', 'Tiền thuê phòng ' + per, F.num(d.rent) || c.price, 'rent'); if (F.num(d.electric) > 0) L('Điện', 'Tiền điện ' + per + ' (nhập từ file)', F.num(d.electric), 'electric'); if (F.num(d.water) > 0) L('Nước', 'Tiền nước ' + per + ' (nhập từ file)', F.num(d.water), 'water'); if (F.num(d.other) > 0) L(d.otherDesc || 'Dịch vụ khác', (d.otherDesc || 'Dịch vụ khác') + ' ' + per, F.num(d.other), 'service');
        inv.total = F.sum(Q.invLines(inv.id), l => l.amount); created++; }
      if (type === 'contract') { const room = St.one('rooms', x => x.code === d.roomCode); const t = St.one('tenants', x => x.phone.replace(/\s/g, '') === String(d.phone || '').replace(/\s/g, '')); if (!room || !t) { skipped++; return; } St.add('contracts', { code: St.nextCode('contracts', 'HD-' + yearCode() + '-', 3), tenantId: t.id, roomId: room.id, buildingId: room.buildingId, start: d.start, end: d.end, listPrice: F.num(d.price), price: F.num(d.price), deposit: F.num(d.deposit), cycle: 'monthly', payDay: 5, status: 'draft', managerId: room.managerId, note: 'Import từ ' + fileName }); created++; }
    });
    const job = St.add('importJobs', { type, fileName, rows: rows.length, valid: rows.filter(r => r.status === 'ok').length, warn: rows.filter(r => r.status === 'warn').length, error: rows.filter(r => r.status === 'error').length, created, skipped, status: 'done', createdBy: me(), checksum });
    if (TH.phase && TH.phase.on(2)) Object.assign(job, { code: St.nextCode('importJobs', 'IMP-' + F.today().slice(0, 7).replace('-', '') + '-', 3), progress: 100, ok: created, failed: skipped, status: skipped ? 'partial' : 'done', updatedAt: F.nowISO(), fileSize: (rows.length * 0.12).toFixed(1) + ' KB', lines: rows.map(r => ({ i: r.i, src: Object.values(r.data || {}).filter(Boolean).join(' | '), data: r.data, status: r.status === 'error' ? 'failed' : 'ok', reason: (r.issues || []).join('; '), hash: F.hash(type + ':' + JSON.stringify(r.data)) })), attempts: [{ n: 1, at: F.nowISO(), by: me(), total: rows.length, ok: created, failed: skipped, status: skipped ? 'partial' : 'done', note: skipped ? 'Bỏ qua ' + skipped + ' dòng lỗi' : 'Hoàn tất không lỗi' }], mapping: Object.keys(rows[0] && rows[0].data || {}), rules: [], buildingLabel: 'Tất cả tòa nhà', period: F.today().slice(0, 7), typeLabel: (Q.L.jobType || {})[type] || type });
    St.audit('import', 'importJobs', job.id, 'Import ' + type + ' từ ' + fileName + ': tạo ' + created + ', bỏ qua ' + skipped); done(); return job;
  });
  X.addDocument = (entityType, entityId, file) => { const d = St.add('documents', { entityType, entityId, name: file.label || file.name, fileName: file.name, size: file.size ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : '0.3 MB', date: F.today(), expiry: file.expiry || '', kind: /pdf/i.test(file.name) ? 'pdf' : /png|jpg|jpeg/i.test(file.name) ? 'img' : 'doc', uploadedBy: me() }); St.audit('upload', entityType, entityId, 'Tải lên tệp ' + file.name + (file.expiry ? ' · hết hạn ' + F.date(file.expiry) : '')); done(); return d; };
  X.removeDocument = (id) => { St.remove('documents', id); done(); };

  /* ---------- Demo tools ---------- */
  X.setToday = (iso) => { St.state.meta.today = iso; St.saveNow(); St.emit('change'); };

  /* ---------- Authorization boundary ----------
     UI visibility is only a convenience. Every mutating public action is
     checked here before its original implementation can touch state/audit. */
  const raw = (col, id) => St.rawGet ? St.rawGet(col, id) : (St.state[col] || []).find(x => x && x.id === id);
  const recordCtx = (type, col, value) => {
    const rec = value && typeof value === 'object' ? (value.id ? raw(col, value.id) || value : value) : raw(col, value);
    return rec ? { type, record: rec } : null;
  };
  const guard = (names, permission, context) => String(names).split(' ').forEach(name => {
    const fn = X[name]; if (!fn) return;
    X[name] = function (...args) {
      const ctx = context ? context(...args) : null;
      Au.need(permission, ctx);
      return fn.apply(this, args);
    };
  });
  guard('saveBuilding deactivateBuilding setBuildingStatus', 'buildings.manage', (v) => recordCtx('building', 'buildings', v));
  guard('saveRoom', 'rooms.manage', d => d && d.buildingId ? { buildingId: d.buildingId } : recordCtx('room', 'rooms', d));
  guard('createRoomsBulk', 'rooms.manage', d => ({ buildingId: d && d.buildingId }));
  guard('setRoomStatus confirmCleaned saveRoomServices', 'rooms.manage', id => recordCtx('room', 'rooms', id));
  guard('holdRoom', 'holds.manage', d => { if (Au.role() === 'ops' && (!d || !Au.inScope('tenant', raw('tenants', d.tenantId)))) throw new Error('Khách thuê ngoài phạm vi được giao.'); return recordCtx('room', 'rooms', d && d.roomId); });
  guard('releaseHold', 'holds.manage', id => {
    const hold = (St.rawAll ? St.rawAll('holds') : St.state.holds || []).find(h => h && h.roomId === id && !['cancelled', 'expired'].includes(h.status));
    return hold ? { type: 'hold', record: hold } : recordCtx('room', 'rooms', id);
  });
  guard('saveRoomAsset', 'rooms.manage', d => d && d.roomId ? recordCtx('room', 'rooms', d.roomId) : recordCtx('roomAsset', 'roomAssets', d));
  guard('removeRoomAsset', 'rooms.manage', id => recordCtx('roomAsset', 'roomAssets', id));
  guard('saveLandlord setLandlordStatus saveLandlordContract generateLandlordSchedule createLandlordOnboarding', 'landlords.manage');
  guard('addLandlordPayment markLandlordPaid', 'landlordPayments.manage');
  guard('saveTenant', 'tenants.manage', d => d && d.id ? recordCtx('tenant', 'tenants', d) : null);
  guard('saveContractDraft', 'contracts.manage', d => { if (Au.role() === 'ops' && (!d || !Au.inScope('tenant', raw('tenants', d.tenantId)))) throw new Error('Khách thuê ngoài phạm vi được giao.'); return d && d.roomId ? recordCtx('room', 'rooms', d.roomId) : recordCtx('contract', 'contracts', d); });
  guard('activateContract cancelContract terminateContract renewContract updateContractNote', 'contracts.manage', id => recordCtx('contract', 'contracts', id));
  guard('saveService deleteService applyPriceList saveCatalogItem removeCatalogItem', 'catalog.manage');
  guard('saveMeterReadings', 'meterReadings.manage');
  guard('createInvoiceDrafts cancelDraftInvoice addInvoiceLine updateInvoiceNote', 'invoices.prepare');
  guard('issueInvoice issueInvoices', 'invoices.prepare');
  guard('adjustInvoice', 'payments.adjust');
  guard('recordPayment', 'payments.record', d => {
    const invoices = ((d && d.allocations) || []).map(a => raw('invoices', a.invoiceId)).filter(Boolean);
    if (Au.role() === 'ops' && (!invoices.length || invoices.some(i => !Au.inScope('invoice', i)))) throw new Error('Khoản thu có hóa đơn ngoài phạm vi tòa được giao.');
    return invoices[0] ? { type: 'invoice', record: invoices[0] } : null;
  });
  guard('confirmPayments', 'payments.record', d => {
    const invoices = ((d && d.invoiceIds) || []).map(id => raw('invoices', id)).filter(Boolean);
    if (Au.role() === 'ops' && (!invoices.length || invoices.some(i => !Au.inScope('invoice', i)))) throw new Error('Có hóa đơn ngoài phạm vi tòa được giao.');
    return invoices[0] ? { type: 'invoice', record: invoices[0] } : null;
  });
  guard('reversePayment', 'payments.reverse', id => recordCtx('payment', 'payments', id));
  guard('adjustPaymentAllocations', 'payments.adjust', id => recordCtx('payment', 'payments', id));
  guard('saveRefund', 'refunds.prepare', d => d && d.contractId ? recordCtx('contract', 'contracts', d.contractId) : recordCtx('refund', 'refunds', d));
  guard('submitRefund', 'refunds.prepare', id => recordCtx('refund', 'refunds', id));
  guard('approveRefund rejectRefund', 'refunds.approve', id => recordCtx('refund', 'refunds', id));
  guard('recordRefundPaid', 'refunds.pay', id => recordCtx('refund', 'refunds', id));
  guard('saveExpense', 'expenses.manage', d => {
    if (Au.role() === 'ops') {
      if (!d || !d.buildingId) throw new Error('Vận hành không được xử lý chi phí chung.');
      if (d.id) { const old = raw('expenses', d.id); if (!old || old.createdBy !== me()) throw new Error('Vận hành chỉ được sửa khoản chi do mình tạo.'); }
    }
    return d && d.buildingId ? { buildingId: d.buildingId } : null;
  });
  guard('deleteExpense', 'expenses.manage', id => { const ex = raw('expenses', id); if (Au.role() === 'ops' && (!ex || ex.createdBy !== me())) throw new Error('Vận hành chỉ được xóa khoản chi do mình tạo.'); return recordCtx('expense', 'expenses', id); });
  guard('saveZaloEvent toggleZaloEvent saveTemplate', 'zalo.config');
  guard('createZaloBatch startBatch resumeBatch resumeBatches retryBatch retryMessage sendTest', 'zalo.send');
  guard('saveUser setUserStatus resetPassword', 'users.manage');
  guard('runImport', 'import.view', d => {
    if (!d || !Au.importTypes().includes(d.type)) throw new Error('Vai trò hiện tại không được import loại dữ liệu này.');
    return null;
  });
  guard('addDocument', 'documents.manage', (type, id) => ({ type, record: Au.resource(type, id) }));
  guard('removeDocument', 'documents.manage', id => recordCtx('document', 'documents', id));
  guard('setToday', 'advancedTools');
  TH.actions = X;
})(window.TH);

/* Workbook alignment v2.3 – additive master data and safe backfills. */
(function (TH) {
  const F = TH.f;
  const seed = TH.seed = TH.seed || {};
  const add = (st, col, obj) => {
    if (!obj.id) obj.id = F.uid(col.slice(0, 3));
    if (!obj.createdAt) obj.createdAt = F.nowISO();
    if (!obj.source) obj.source = 'seed-wb';
    st[col].push(obj); return obj;
  };
  const activeAt = (a, at = F.today()) => a && a.start <= at && (!a.end || a.end >= at);
  // Loại nhà T/S/G (giả định #2 Decision Pack): T = thuê lại chủ nhà, S = sở hữu (HĐ chủ nhà đã kết thúc → đã mua lại),
  // G = góp vốn cổ đông. Tòa vừa có dự án vừa có HĐ chủ nhà xen kẽ G/T để bộ lọc loại nhà có đủ dữ liệu demo.
  const buildingTypeOf = (b, i, projectBuildings, contractsByBuilding) => {
    const lc = contractsByBuilding[b.id];
    if (lc && lc.status === 'ended') return 'S';
    if (projectBuildings.has(b.id)) return i % 2 ? 'T' : 'G';
    return b.landlordId ? 'T' : 'S';
  };
  // Sửa dữ liệu đã seed ở phiên bản trước (idempotent qua meta.wbFixups); không đụng record nghiệp vụ khác.
  seed.workbookFixups = (st) => {
    st.meta.wbFixups = st.meta.wbFixups || {};
    if (!st.meta.wbFixups.buildingTypeV2) {
      const projectBuildings = new Set((st.projects || []).map(p => p && p.buildingId).filter(Boolean));
      const contractsByBuilding = {};
      (st.landlordContracts || []).forEach(c => (c.buildingIds || []).forEach(id => { if (!contractsByBuilding[id] || (c.start || '') < contractsByBuilding[id].start) contractsByBuilding[id] = c; }));
      st.buildings.forEach((b, i) => { if (b && b.source !== 'user') b.buildingType = buildingTypeOf(b, i, projectBuildings, contractsByBuilding); });
      st.meta.wbFixups.buildingTypeV2 = true;
    }
    // Tài sản hạ tầng gắn với tòa (thang máy, PCCC, máy phát, điện, chiếu sáng, an ninh) ở tòa thuê lại chủ nhà (T)
    // → quyền sở hữu Chủ nhà, để hồ sơ tòa có đủ 2 danh sách "tài sản chủ nhà / tài sản đầu tư" (workbook 5.2) và ROI loại trừ đúng.
    if (!st.meta.wbFixups.assetOwnershipV1) {
      const landlordCats = new Set(['thangmay', 'pccc', 'mayphat', 'dien', 'chieusang', 'anninh']);
      const typeOf = {}; st.buildings.forEach(b => { if (b) typeOf[b.id] = b.buildingType; });
      (st.assets || []).forEach(a => { if (a && a.source !== 'user' && typeOf[a.buildingId] === 'T' && landlordCats.has(a.category) && !a.roomId) a.ownership = 'landlord'; });
      st.meta.wbFixups.assetOwnershipV1 = true;
    }
  };
  seed.workbook = (st) => {
    st.areas = st.areas || []; st.salesTeams = st.salesTeams || [];
    const districts = [...new Set(st.buildings.filter(Boolean).map(b => b.district).filter(Boolean))];
    districts.forEach((district, i) => {
      let area = st.areas.find(a => a.districts && a.districts.includes(district));
      if (!area) {
        const first = st.buildings.find(b => b.district === district);
        const lead = first && st.buildingAssignments.find(a => a.buildingId === first.id && a.role === 'lead' && activeAt(a));
        area = add(st, 'areas', { code: 'KV' + F.pad(i + 1), name: 'Khu ' + district, districts: [district], leadEmployeeId: lead ? lead.employeeId : null, status: 'active' });
      }
      st.buildings.filter(b => b.district === district).forEach(b => { if (!b.areaId) b.areaId = area.id; });
    });

    const projectBuildings = new Set(st.projects.map(p => p && p.buildingId).filter(Boolean));
    const contractsByBuilding = {};
    st.landlordContracts.forEach(c => (c.buildingIds || []).forEach(id => { if (!contractsByBuilding[id] || (c.start || '') < contractsByBuilding[id].start) contractsByBuilding[id] = c; }));
    st.buildings.forEach((b, i) => {
      if (!b) return;
      b.buildingType = b.buildingType || buildingTypeOf(b, i, projectBuildings, contractsByBuilding);
      b.areaM2 = b.areaM2 || Math.max(1, Number(b.floors) || 1) * Math.max(1, Number(b.perFloor) || 1) * 35;
      b.condition = b.condition || (i % 5 === 0 ? 'old' : i % 3 === 0 ? 'medium' : 'new');
      b.operatingSince = b.operatingSince || (contractsByBuilding[b.id] || {}).start || '2024-01-01';
      b.licenseExpiry = b.licenseExpiry || (i < 3 ? F.addMonths(F.today(), 5 + i * 3) : '');
      b.pccc = b.pccc || { status: i === 4 ? 'missing' : 'valid', expiry: i === 1 ? F.addDays(F.today(), 22) : F.addMonths(F.today(), 12) };
    });

    const roles = ['lead', 'ops', 'cleaning', 'tech'];
    const emps = st.employees.filter(e => e && e.status === 'working');
    st.buildings.filter(b => b && !b.stub).slice(0, 5).forEach((b, bi) => roles.forEach((role, ri) => {
      if (st.buildingAssignments.some(a => a.buildingId === b.id && a.role === role && activeAt(a))) return;
      const pool = emps.filter(e => role === 'tech' ? e.dept === 'kythuat' : role === 'cleaning' ? /vệ sinh|tapvu/i.test(F.norm(e.title || '')) : e.dept === 'vanhanh');
      const e = pool[(bi + ri) % Math.max(1, pool.length)] || emps[(bi + ri) % Math.max(1, emps.length)];
      if (e) add(st, 'buildingAssignments', { employeeId: e.id, buildingId: b.id, role, primary: true, start: e.startDate || '2024-01-01', end: null, status: 'active' });
    }));

    const parents = [
      ['GV', 'Giá vốn'], ['DV', 'Giá gốc dịch vụ'], ['VH', 'Chi phí vận hành'], ['BH', 'Chi phí bán hàng phát sinh']
    ];
    const children = [
      ['GV-THUE', 'Thuê nhà', 'GV'], ['GV-TB', 'Mua sắm thiết bị', 'GV'],
      ['DV-DIEN', 'Điện', 'DV'], ['DV-NUOC', 'Nước', 'DV'], ['DV-MANG', 'Mạng / Internet', 'DV'], ['DV-RAC', 'Rác', 'DV'], ['DV-MT', 'Môi trường', 'DV'], ['DV-TM', 'Bảo trì thang máy', 'DV'],
      ['VH-L-QL', 'Lương quản lý', 'VH'], ['VH-L-QLT', 'Lương quản lý tổng', 'VH'], ['VH-L-TPVH', 'Lương trưởng vận hành', 'VH'], ['VH-L-PPVH', 'Lương phó vận hành', 'VH'], ['VH-L-NGUON', 'Lương nhân viên nguồn', 'VH'], ['VH-L-NVKD', 'Lương kinh doanh', 'VH'], ['VH-L-VS', 'Lương vệ sinh', 'VH'], ['VH-L-KT', 'Lương kế toán', 'VH'], ['VH-L-SC', 'Lương sửa chữa', 'VH'], ['VH-L-BV', 'Lương bảo vệ', 'VH'], ['VH-VP', 'Văn phòng và dịch vụ', 'VH'],
      ['BH-MKT', 'Marketing', 'BH'], ['BH-SC', 'Sửa chữa / thay thế / bảo trì', 'BH'], ['BH-KHAC', 'Chi phí khác', 'BH']
    ];
    parents.forEach(([code, name]) => { if (!st.expenseGroups.some(g => g.code === code)) add(st, 'expenseGroups', { code, name, fullName: name, parentCode: null, status: 'active' }); });
    children.forEach(([code, name, parentCode]) => { if (!st.expenseGroups.some(g => g.code === code)) add(st, 'expenseGroups', { code, name, fullName: name, parentCode, status: 'active' }); });
    const expenseMap = { 'Thuê nhà': 'GV-THUE', 'Mua sắm TS': 'GV-TB', 'Điện nước': 'DV-DIEN', 'Lương': 'VH-L-QL', 'Marketing': 'BH-MKT', 'Sửa chữa': 'BH-SC', 'Khác': 'BH-KHAC' };
    st.expenseGroups.forEach(g => { if (!('parentCode' in g) && expenseMap[g.name]) g.parentCode = expenseMap[g.name].split('-')[0]; });
    st.expenses.forEach(e => { if (!e.categoryCode) e.categoryCode = expenseMap[e.group] || 'BH-KHAC'; });

    const dedMap = { 'Khấu hao': 'KH', 'Khấu hao / hao mòn': 'KH', 'Sửa chữa': 'SC', 'Dịch vụ': 'VS', 'Vệ sinh / dọn dẹp': 'VS', 'Công nợ': 'CN', 'Khác': 'KHAC', 'Chi khác': 'KHAC' };
    st.refundDeductions.forEach(d => { if (!d.groupCode) d.groupCode = dedMap[d.group] || 'KHAC'; });
    const svcMap = { DIEN: 'electric', NUOC: 'water', INTERNET: 'internet', THANGMAY: 'elevator', QUANLY: 'common', SACXE: 'ev_charge', GUIXE: 'parking' };
    st.services.forEach(s => { if (!s.wbType && svcMap[s.code]) s.wbType = svcMap[s.code]; });

    st.contracts.forEach(c => {
      if (!Array.isArray(c.vehicles)) c.vehicles = [];
      if (!c.vehicles.length) {
        const parking = st.contractServices.find(s => s.contractId === c.id && (st.services.find(x => x.id === s.serviceId) || {}).code === 'GUIXE');
        for (let i = 0; parking && i < Number(parking.qty || 0); i++) c.vehicles.push({ type: 'Xe máy', plate: '29-X' + F.pad((i + 1) * 7, 2) + '.' + F.pad(100 + i, 3) });
      }
    });
    st.leadSources.forEach((s, i) => { if (!s.kind) s.kind = ['REF', 'FLY'].includes(s.code) || i % 4 === 3 ? 'partner' : 'internal'; });
    st.leads.forEach(l => { if (!l.handoverDate) l.handoverDate = (l.createdAt || F.nowISO()).slice(0, 10); });

    if (!st.salesTeams.length) {
      const sales = st.users.filter(u => u.role === 'sale');
      const a = add(st, 'salesTeams', { code: 'SALE-01', name: 'Team Kinh doanh 1', leadUserId: sales[0] ? sales[0].id : null, status: 'active' });
      const b = add(st, 'salesTeams', { code: 'SALE-02', name: 'Team Kinh doanh 2', leadUserId: sales[1] ? sales[1].id : (sales[0] ? sales[0].id : null), status: 'active' });
      sales.forEach((u, i) => { if (!u.teamId) u.teamId = (i % 2 ? b : a).id; });
    }
    st.documents.forEach((d, i) => { if (!('expiry' in d)) d.expiry = /PCCC|ĐKKD/i.test(d.name || '') && i < 8 ? F.addDays(F.today(), 20 + i * 9) : ''; });
    st.meta.wbSeeded = true;
  };
})(window.TH);

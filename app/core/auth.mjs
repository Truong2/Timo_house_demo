// Phân quyền theo dòng Authorization của FR02–FR05 (Common Rule 7).
// Mỗi quyền ghi nguồn cho từng vai trò: 'SRS' (có trong SRS) · 'ASSUMED' (SRS đỏ, giả định) ·
// 'own' (chỉ hồ sơ do mình tạo) · 'scope' (chỉ tòa được phân công). Thuần — nhận state làm tham số.

export const ROLES = [
  ['admin', 'Admin'], ['accountant', 'Kế toán'], ['tpvh', 'TPVH'],
  ['tnvh', 'TNVH/Trưởng khu vực'], ['nvvh', 'NVVH'], ['source', 'NV nguồn'],
  ['sales', 'NVKD/Sale'], ['technical', 'Kỹ thuật'], ['cleaning', 'Vệ sinh'], ['shareholder', 'Cổ đông'],
];
export const roleLabel = (r) => ROLES.find((x) => x[0] === r)?.[1] || r;

export const USERS = {
  admin: { id: 'u-admin', name: 'Admin demo', title: 'Quản trị viên' },
  accountant: { id: 'u-accountant', name: 'Kế toán demo', title: 'Kế toán' },
  tpvh: { id: 'u-tpvh', name: 'Đặng Đình Mạnh', title: 'TPVH', employeeId: 'emp-manh' },
  tnvh: { id: 'u-tnvh', name: 'TNVH demo', title: 'TNVH/Trưởng khu vực' },
  nvvh: { id: 'u-nvvh', name: 'Đỗ Thuỳ Linh', title: 'NVVH', employeeId: 'emp-linh' },
  source: { id: 'u-source', name: 'NV nguồn demo', title: 'NV nguồn' },
  sales: { id: 'u-sales', name: 'NVKD demo', title: 'NVKD/Sale' },
  technical: { id: 'u-technical', name: 'Kỹ thuật demo', title: 'Kỹ thuật' },
  cleaning: { id: 'u-cleaning', name: 'Vệ sinh demo', title: 'Vệ sinh' },
  shareholder: { id: 'u-shareholder', name: 'Cổ đông demo', title: 'Cổ đông' },
};
export const currentUser = (state) => ({ ...USERS[state.meta.role], role: state.meta.role });

const A = 'ASSUMED';
export const PERMS = {
  'landlord.view': { label: 'Xem chủ nhà', fr: 'FR02', roles: { admin: 'SRS', accountant: 'SRS', tpvh: 'SRS', nvvh: 'scope', source: A } },
  'landlord.create': { label: 'Tạo chủ nhà', fr: 'FR02', roles: { admin: 'SRS', accountant: 'SRS', source: 'SRS' } },
  'landlord.edit': { label: 'Sửa hồ sơ chủ nhà', fr: 'FR02', roles: { admin: 'SRS', accountant: 'SRS', source: 'own' } },
  'landlord.deactivate': { label: 'Ngừng hoạt động chủ nhà', fr: 'FR02', roles: { admin: 'SRS', accountant: 'SRS' } },
  'landlord.reopen': { label: 'Mở lại chủ nhà', fr: 'FR02', roles: { admin: 'SRS' } },
  'extraction.run': { label: 'Trích xuất & commit HĐ chủ nhà', fr: 'FR03', roles: { admin: 'SRS', accountant: 'SRS', source: 'SRS' } },
  'headLease.view': { label: 'Xem HĐ đầu vào', fr: 'FR03', roles: { admin: 'SRS', accountant: 'SRS', source: 'SRS', tpvh: A, nvvh: A } },
  'headLease.editDraft': { label: 'Sửa HĐ đầu vào Nháp', fr: 'FR03', roles: { admin: 'SRS', accountant: 'SRS', source: 'own' } },
  'headLease.activate': { label: 'Kích hoạt HĐ đầu vào', fr: 'FR03', roles: { admin: 'SRS', accountant: 'SRS' } },
  'headLease.adjust': { label: 'Điều chỉnh lịch đóng tiền', fr: 'FR03', roles: { admin: 'SRS', accountant: 'SRS' } },
  'headLease.liquidate': { label: 'Thanh lý / gia hạn HĐ đầu vào', fr: 'FR03', roles: { admin: 'SRS', accountant: 'SRS' } },
  'building.view': { label: 'Xem tòa nhà', fr: 'FR04', roles: { admin: 'SRS', accountant: 'SRS', tpvh: 'SRS', nvvh: 'scope', source: A } },
  'building.edit': { label: 'Sửa hồ sơ tòa', fr: 'FR04', roles: { admin: 'SRS', accountant: 'SRS' } },
  'building.upload': { label: 'Tải tài liệu', fr: 'FR04', roles: { admin: 'SRS', accountant: 'SRS', source: A } },
  'building.transition': { label: 'Chuyển trạng thái tòa', fr: 'FR04', roles: { admin: 'SRS', accountant: 'SRS' } },
  'building.assign': { label: 'Phân công tòa (FR20)', fr: 'FR20', roles: { admin: A, tpvh: A } },
  'document.verify': { label: 'Xác minh tài liệu', fr: 'FR04', roles: { admin: A, accountant: A } },
  'room.view': { label: 'Xem phòng', fr: 'FR05', roles: { admin: A, accountant: A, tpvh: A, nvvh: 'scope' } },
  'room.create': { label: 'Tạo phòng', fr: 'FR05', roles: { admin: A, accountant: A, tpvh: A, nvvh: 'scope' } },
  'room.edit': { label: 'Đổi giá / trạng thái phòng', fr: 'FR05', roles: { admin: A, accountant: A, tpvh: A, nvvh: 'scope' } },
  'shareholder.view': { label: 'Xem cổ đông', fr: 'FR29', roles: { admin: 'SRS', accountant: 'SRS', shareholder: 'SRS' } },
  'report.profit.view': { label: 'Xem Report A và bảng cổ phần', fr: 'FR31', roles: { admin: 'SRS', accountant: 'SRS', tpvh: 'SRS', shareholder: 'SRS' } },
};

export function registerPerms(map) {
  for (const [key, value] of Object.entries(map)) {
    if (PERMS[key]) throw new Error(`Quyền trùng: ${key}`);
    PERMS[key] = value;
  }
}

/** Tòa trong phạm vi của người dùng (BUILDING_ASSIGNMENT); null = không giới hạn. */
export function scopeBuildingIds(state, today) {
  const u = currentUser(state);
  if (u.role !== 'nvvh') return null;
  return new Set(state.buildingAssignments
    .filter((a) => a.employeeId === u.employeeId && a.from <= today && (!a.to || a.to >= today))
    .map((a) => a.buildingId));
}

/**
 * can(state, 'landlord.edit', { entity, buildingId, today }) → { ok, reason, assumed }
 * reason: tooltip "Thiếu quyền: … · vai trò được phép: … (FRxx)".
 */
export function can(state, perm, ctx = {}) {
  const p = PERMS[perm];
  if (!p) return { ok: false, reason: `Quyền chưa khai báo: ${perm}` };
  const role = state.meta.role;
  const mode = p.roles[role];
  const allowed = Object.keys(p.roles).map(roleLabel).join(', ');
  const deny = (why) => ({ ok: false, reason: why || `Thiếu quyền: ${p.label} · vai trò được phép: ${allowed} (${p.fr})` });
  if (!mode) return deny();
  const u = currentUser(state);
  if (mode === 'own' && ctx.entity && ctx.entity.createdBy !== u.id) return deny(`Thiếu quyền: ${roleLabel(role)} chỉ sửa hồ sơ do mình tạo (${p.fr})`);
  if (mode === 'scope' && ctx.buildingId) {
    const ids = scopeBuildingIds(state, ctx.today || '9999-12-31');
    if (ids && !ids.has(ctx.buildingId)) return deny(`Ngoài phạm vi: tòa không thuộc phân công của bạn (${p.fr})`);
  }
  return { ok: true, assumed: mode === A, reason: mode === A ? `Quyền giả định (ASSUMED) — SRS ${p.fr} chưa nêu` : '' };
}

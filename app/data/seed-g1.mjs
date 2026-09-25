// Tòa G1 đang khai thác — số thật từ TimoHouse_Mockup_Seed_Data_v1.0.md §3, §4, §6, §9, §13.
// G1 trong seed KHÔNG có chủ nhà / HĐ đầu vào (§4 chỉ có tiền thuê 48.000.000) → UI gắn chip.

export const COMPANY_ACCOUNTS = [
  { id: 'acc-bidv', label: 'BIDV 2120368058 – NGUYEN THI HANG', bank: 'BIDV', no: '2120368058', holder: 'NGUYEN THI HANG' },
];

export const EMPLOYEES = [
  { id: 'emp-manh', name: 'Đặng Đình Mạnh', title: 'TPVH' },
  { id: 'emp-huy', name: 'Trần Quang Huy', title: 'TNVH' },
  { id: 'emp-linh', name: 'Đỗ Thuỳ Linh', title: 'NVVH' },
  { id: 'emp-huyen', name: 'Nguyễn Thị Thương Huyền', title: 'NVVH' },
  { id: 'emp-huong', name: 'Đỗ Thanh Hương', title: 'NVVH' },
];

export const G1 = {
  id: 'bld-g1', code: 'G1', codeSuggestion: null, codeLocked: true, name: 'G1', address: null, addressSource: null,
  area: null, floors: null, floorArea: null, structure: null, purpose: 'Kinh doanh cho thuê', scope: null,
  origin: 'seed', jobId: null, status: 'Đang khai thác', group: 'G', grade: 'L2', gradeIllustrative: true,
  amenities: { elevator: true, washer: true }, amenitiesIllustrative: true,
  customerAccountId: 'acc-bidv', accountFrom: '2026-01-01', invoiceTemplate: 'G1 TECH', meterReadingDay: 22,
  opsStartDate: null, hkdRegistration: 'Đã đăng ký (theo tài liệu)', seedRent: 48000000, seedDeposit: 48000000,
  createdAt: '2026-01-01T08:00',
};

/** §6.1 + §6.2: [phòng, niêm yết, QL, hiện tại, người, CS mới, công nợ, ngày vào] */
const ROWS = [
  ['101', 3600000, 3500000, 3500000, 2, 804, 0, null],
  ['201', 4200000, 4100000, 4100000, 2, 838, 0, null],
  ['202', 4000000, 3800000, 3800000, 2, 2547, 0, null],
  ['203', 4300000, 4100000, 4100000, 3, 532, 0, '2026-08-01'],
  ['301', 4200000, 3900000, 3900000, 1, 382, 0, null],
  ['302', 4000000, 3800000, 3800000, 2, 675, 0, null],
  ['303', 4300000, 4400000, 4400000, 2, 1578, 0, '2026-09-01'],
  ['304', 4400000, 4400000, 4400000, 2, 1159, 60000, '2026-09-01'],
  ['401', 4400000, 3800000, 3800000, 1, 1547, 0, null],
  ['402', 4000000, 3900000, 3900000, 2, 1228, 0, null],
  ['403', 4500000, 4400000, 4400000, 2, 1640, 0, '2026-09-01'],
  ['404', 4400000, 4200000, 4200000, 1, 948, 0, null],
  ['601', 4100000, 3900000, 3900000, 2, 690, 0, null],
  ['603', 3300000, 3000000, 3000000, 2, 559, 0, null],
  ['604', 3500000, 3500000, 3500000, 1, 2029, 6000, '2026-09-01'],
];

export const G1_ROOMS = ROWS.map(([n, list, mgmt, cur, occ, reading, debt, since]) => ({
  id: `${n}G1`, buildingId: 'bld-g1', number: n, floor: Number(n[0]), type: 'Phòng thường', area: null, capacity: null,
  listPrice: list, mgmtPrice: mgmt, lease: { price: cur, occupants: occ, since, contractId: null },
  debt, status: 'Đang thuê', statusFrom: since || '2026-01-01', readyDate: null, vacantFrom: null,
  source: 'seed', furniture: [], hasWaterMeter: n === '304', lastReading: reading, createdAt: '2026-01-01T08:00',
}));

export const G1_METERS = [
  { id: 'MT-G1-MAIN', buildingId: 'bld-g1', roomId: null, kind: 'MAIN', utility: 'điện', code: '000G1', unitPrice: 3500, handoverReading: null, sourceRef: 'Seed §4', readings: [{ period: '2026-09', kwh: 882 }] },
  { id: 'MT-G1-COMMON', buildingId: 'bld-g1', roomId: null, kind: 'COMMON', utility: 'điện', code: 'Điện vệ sinh chung', unitPrice: 3800, handoverReading: null, sourceRef: 'Seed §6.3',
    readings: [
      { period: '2026-09', group: '201G1, 202G1', old: 1935, new: 1967, kwh: 32, people: 3, perPerson: 40533.33 },
      { period: '2026-09', group: '203G1, 301G1, 302G1', old: 144, new: 209, kwh: 65, people: 3, perPerson: 82333.33 },
      { period: '2026-09', group: '603G1, 604G1', old: null, new: null, kwh: 1.5, people: null, perPerson: null, note: 'ghi thẳng 6.000' },
    ] },
  { id: 'MT-304G1-E', buildingId: 'bld-g1', roomId: '304G1', kind: 'ROOM', utility: 'điện', code: '304G1-E', readings: [{ period: '2026-09', old: 1159, new: 1159, kwh: 0 }] },
  { id: 'MT-304G1-W', buildingId: 'bld-g1', roomId: '304G1', kind: 'ROOM', utility: 'nước', code: '304G1-W', readings: [{ period: '2026-09', old: 18, new: 18, m3: 0 }] },
];

/** §13 — Report A G1 kỳ 08/2026 đã khóa. */
export const G1_SNAPSHOT = { buildingId: 'bld-g1', period: '08/2026', locked: true, revenue: 84186000, netProfit: 14664969.25, vacant: 0, newRooms: 2, broken: 1 };

/** Hồ sơ pháp lý G1 — trạng thái MINH HỌA theo phác họa 4.2 của spec. */
export const G1_DOCS = [
  { type: 'Giấy chứng nhận nhà đất/sổ đỏ', fileName: 'GCN_G1.pdf', verifyStatus: 'Đã xác minh', illustrative: true, basis: 'Minh họa · phác họa 4.2' },
  { type: 'Hồ sơ PCCC', fileName: 'PCCC_G1.pdf', verifyStatus: 'Đã xác minh', expiryDate: '2026-12-13', illustrative: true, basis: 'Minh họa · phác họa 4.2' },
  { type: 'Giấy đăng ký hộ kinh doanh', fileName: 'HKD_G1.pdf', verifyStatus: 'Chờ xác minh', illustrative: true, basis: 'Minh họa · phác họa 4.2' },
  { type: 'Biên bản bàn giao/kiểm kê tài sản', fileName: 'Bien_ban_ban_giao_G1.pdf', verifyStatus: 'Đã xác minh', illustrative: true, basis: 'Minh họa · phác họa 4.2' },
];

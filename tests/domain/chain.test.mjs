// Chuỗi Nguồn nhà: commit trích xuất → HĐ đầu vào → tòa → phòng. Kiểm các con số SRS nêu.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, env, tx } from './helpers.mjs';
import { choose, commitJob, remainingConflicts, uploadFile, commitDuplicate } from '../../app/core/domain/extraction.mjs';
import { activationBlockers, activate, buildSchedule, setDates, setSigner, adjustPeriod, periodStatus, displayStatus } from '../../app/core/domain/headLeases.mjs';
import { addBankAccount, findDuplicate, landlordLabel, deactivateLandlord, validateLandlord, matchesKeyword } from '../../app/core/domain/landlords.mjs';
import { saveCode, transitionBlockers, transition, assignManager, setAccount, legalChecklist, addDocument } from '../../app/core/domain/buildings.mjs';
import { genByFloor, parseCSV, mapColumns, validateImport, createRooms, TRANSITIONS, transitionsFrom, applyTransition, vacancyType, checkPreview } from '../../app/core/domain/rooms.mjs';
import { normalizePhone, addMonths, addDays } from '../../app/core/format.mjs';
import { readFileSync } from 'node:fs';

const E = env();
const resolveAll = (d) => {
  choose(d, E, 'LLX-001', 'dates', 'draft');
  choose(d, E, 'LLX-001', 'deposit', 'once');
  choose(d, E, 'LLX-001', 'partyB', 'proxy');
};
const committed = () => tx(fresh(), (d) => { resolveAll(d); return commitJob(d, E, 'LLX-001'); });

test('seed: 6 chủ nhà thiếu HĐ, job LLX-001 còn 3 xung đột', () => {
  const s = fresh();
  assert.equal(s.landlords.length, 6);
  assert.ok(s.landlords.every((l) => landlordLabel(s, l) === 'missing'));
  assert.equal(remainingConflicts(s.extractionJobs[0]).length, 3);
});

test('xung đột "Hỏi lại chủ nhà" vẫn chặn commit', () => {
  const { state } = tx(fresh(), (d) => { resolveAll(d); choose(d, E, 'LLX-001', 'deposit', 'ask'); });
  assert.equal(remainingConflicts(state.extractionJobs[0]).length, 1);
  assert.throws(() => tx(state, (d) => commitJob(d, E, 'LLX-001')), /xung đột/);
});

test('commit tạo đúng số entity trong một transaction', () => {
  const { state, result } = committed();
  assert.equal(result.headLeaseId, 'HL-0031');
  assert.equal(result.landlordId, 'LL-0007');
  const hl = state.headLeases[0];
  assert.equal(hl.status, 'Nháp');
  const b = state.buildings.find((x) => x.id === result.buildingId);
  assert.equal(b.status, 'Chuẩn bị');
  assert.equal(b.codeSuggestion, 'PD25A');
  assert.equal(state.documents.filter((d) => d.links.headLeaseId === 'HL-0031').length, 3);
  assert.equal(state.assets.length, 11);
  assert.equal(state.meters.filter((m) => m.buildingId === b.id).length, 2);
  assert.equal(state.rooms.filter((r) => r.buildingId === b.id).length, 0);
  assert.equal(landlordLabel(state, state.landlords.find((l) => l.id === 'LL-0007')), 'draft');
});

test('rollback: lỗi giữa chừng không để lại entity nào', () => {
  const base = tx(fresh(), resolveAll).state;
  for (const stage of ['landlord', 'building', 'headLease', 'document', 'asset']) {
    assert.throws(() => tx(base, (d) => commitJob(d, E, 'LLX-001', { failAt: stage })), /rollback/);
  }
  assert.equal(base.landlords.length, 6);
  assert.equal(base.headLeases.length, 0);
  assert.equal(base.extractionJobs[0].committed, null);
});

test('upload trùng hash mở lại job cũ', () => {
  const { result } = tx(fresh(), (d) => uploadFile(d, E, { name: 'x.doc', sizeKb: 96, hash: 'd8403819975d' }));
  assert.equal(result.reopened, true);
  assert.equal(result.job.id, 'LLX-001');
  const other = tx(fresh(), (d) => uploadFile(d, E, { name: 'y.pdf', sizeKb: 10, hash: 'abc' })).result;
  assert.equal(other.job.id, 'LLX-002');
});

test('dò trùng CCCD → SĐT → Tên và chuẩn hóa SĐT', () => {
  const { state } = committed();
  assert.equal(findDuplicate(state, { idNo: '001070018351' }).key, 'CCCD');
  assert.equal(findDuplicate(state, { phone: '+84 916 122 338' }).key, 'SĐT');
  assert.equal(findDuplicate(state, { name: 'phi van thang' }).key, 'Tên');
  assert.equal(normalizePhone('+84916122338'), '0916122338');
  assert.ok(commitDuplicate(state));
  assert.deepEqual(Object.keys(validateLandlord({ type: 'Cá nhân', name: 'A', idNo: '123', phone: '0916' })).sort(), ['idIssued', 'idNo', 'idPlace', 'phone']);
  assert.ok(matchesKeyword(state.landlords[1], 'Khiết'));
});

test('kích hoạt bị chặn đủ 3 điều kiện, rồi sinh 20 kỳ × 342.000.000', () => {
  let { state } = committed();
  const hl = state.headLeases[0];
  assert.deepEqual(activationBlockers(state, hl).map((b) => b.code), ['dates', 'bank', 'signer']);
  state = tx(state, (d) => {
    addBankAccount(d, E, 'LL-0007', { bank: 'VCB', no: '0123456789', holder: 'Phi Van Thang' });
    setDates(d, E, 'HL-0031', { startDate: '2026-10-01' });
    setSigner(d, E, 'HL-0031', { name: 'Nguyễn Đình Chung (ủy quyền)' });
    activate(d, E, 'HL-0031');
  }).state;
  const rows = state.headLeasePaymentSchedule;
  assert.equal(rows.length, 20);
  assert.ok(rows.every((r) => r.amount === 342000000 && r.dueDate.endsWith('-10')));
  assert.equal(rows.reduce((s, r) => s + r.amount, 0), 6840000000);
  assert.equal(state.headLeases[0].endDate, '2031-09-30');
  assert.equal(state.headLeases[0].status, 'Hiệu lực');
  assert.throws(() => tx(state, (d) => deactivateLandlord(d, E, 'LL-0007', 'x')), /BR-2.01.6/);
});

test('tháng miễn: miễn 1 tháng đầu → kỳ 1 = 228.000.000', () => {
  const rows = buildSchedule({ id: 'HL', startDate: '2026-10-01', months: 60, cycleMonths: 3, rent: 114000000, dueWindow: { to: 10 }, freeMonths: [1] });
  assert.equal(rows[0].amount, 228000000);
  assert.equal(rows[1].amount, 342000000);
});

test('kỳ trả: trạng thái và không sửa kỳ đã trả', () => {
  const p = { dueDate: '2026-10-10', amount: 100, paid: 0 };
  assert.equal(periodStatus(p, '2026-09-01'), 'Chưa đến hạn');
  assert.equal(periodStatus(p, '2026-09-30'), 'Sắp đến hạn');
  assert.equal(periodStatus(p, '2026-10-11'), 'Quá hạn');
  assert.equal(periodStatus({ ...p, paid: 50 }, '2026-10-11'), 'Trả một phần');
  const s = { headLeasePaymentSchedule: [{ id: 'K1', no: 1, amount: 100, paid: 10, adjustments: [] }], audit: [], meta: { seq: {} } };
  assert.throws(() => adjustPeriod(s, E, 'K1', 50, 'x'), /đã trả/);
  assert.equal(displayStatus({ status: 'Hiệu lực', endDate: '2027-01-01' }, '2026-09-24'), 'Sắp hết');
});

test('tòa: mã lưu một lần, chặn chuyển Đang khai thác tới khi đủ điều kiện', () => {
  let { state, result } = committed();
  const bId = result.buildingId;
  assert.throws(() => tx(state, (d) => saveCode(d, E, bId, 'G1')), /đã được dùng/);
  state = tx(state, (d) => saveCode(d, E, bId, 'pd25a')).state;
  assert.equal(state.buildings.find((b) => b.id === bId).code, 'PD25A');
  assert.throws(() => tx(state, (d) => saveCode(d, E, bId, 'X1')), /không đổi/);
  const b = state.buildings.find((x) => x.id === bId);
  assert.equal(transitionBlockers(state, b, E.today).hard.length, 4);
  assert.equal(legalChecklist(state, b).find((r) => r.type === 'Hồ sơ PCCC').reg, 'Chưa có');
  state = tx(state, (d) => addDocument(d, E, { type: 'Giấy đăng ký hộ kinh doanh', buildingId: bId, fileName: 'hkd.pdf' })).state;
  const hkd = legalChecklist(state, state.buildings.find((x) => x.id === bId)).find((r) => r.type === 'Giấy đăng ký hộ kinh doanh');
  assert.equal(hkd.reg, 'Đã đăng ký (theo tài liệu)');
  assert.equal(hkd.verify, 'Chờ xác minh');
});

test('phòng: sinh 2×3, import CSV mẫu 2/1/1, tạo phòng Sẵn sàng', () => {
  const { rows } = genByFloor({ buildingCode: 'PD25A', floors: 2, perFloor: 3 });
  assert.deepEqual(rows.map((r) => r.code), ['101PD25A', '102PD25A', '103PD25A', '201PD25A', '202PD25A', '203PD25A']);
  const csv = parseCSV(readFileSync(new URL('../../app/samples/phong_25A_PhuDien.csv', import.meta.url), 'utf8'));
  const res = validateImport(csv.slice(1), mapColumns(csv[0]), { buildingCode: 'PD25A', generated: new Set(rows.map((r) => r.number)) });
  assert.deepEqual(res.map((r) => r.status), ['ok', 'ok', 'dup', 'missing']);
  assert.equal(res[2].label, 'Trùng mã với dòng sinh theo tầng');
  assert.equal(res[3].label, 'Thiếu sức chứa');
  assert.equal(checkPreview([{ number: '1', capacity: 2 }, { number: '1', capacity: 2 }])[1].errors.length, 1);

  let { state, result } = committed();
  assert.throws(() => tx(state, (d) => createRooms(d, E, result.buildingId, rows, 'floor-gen')), /lưu mã/);
  state = tx(state, (d) => { saveCode(d, E, result.buildingId, 'PD25A'); createRooms(d, E, result.buildingId, rows, 'floor-gen'); }).state;
  const created = state.rooms.filter((r) => r.buildingId === result.buildingId);
  assert.equal(created.length, 6);
  assert.ok(created.every((r) => r.status === 'Sẵn sàng' && r.number && r.id === `${r.number}PD25A`));
});

test('vòng đời phòng: không bao giờ đặt Đang thuê bằng tay', () => {
  assert.ok(TRANSITIONS.every((t) => t.to !== 'Đang thuê'));
  assert.equal(transitionsFrom('Đang thuê').length, 0);
  assert.equal(vacancyType('Sẵn sàng'), 'Trống ở luôn');
  assert.equal(vacancyType('Chờ dọn'), 'Trống ở luôn');
  assert.equal(vacancyType('Trống hết tháng'), 'Trống hết tháng');
  assert.equal(vacancyType('Giữ chỗ'), 'Đang chờ');
  assert.equal(vacancyType('Ngừng khai thác'), null);
  let { state, result } = committed();
  state = tx(state, (d) => { saveCode(d, E, result.buildingId, 'PD25A'); createRooms(d, E, result.buildingId, genByFloor({ buildingCode: 'PD25A', floors: 1, perFloor: 1 }).rows, 'floor-gen'); }).state;
  assert.throws(() => tx(state, (d) => applyTransition(d, E, '101PD25A', 'Đang thuê', 'x')), /Không được/);
  assert.throws(() => tx(state, (d) => applyTransition(d, E, '101PD25A', 'Giữ chỗ', 'x')), /bút toán cọc/);
  state = tx(state, (d) => { applyTransition(d, E, '101PD25A', 'Bảo trì', 'hỏng vòi'); applyTransition(d, E, '101PD25A', 'Sẵn sàng', 'nghiệm thu'); }).state;
  assert.equal(state.roomStatusHistory.filter((h) => h.roomId === '101PD25A').length, 3);
});

test('tòa Chuẩn bị → Đang khai thác khi đủ điều kiện', () => {
  let { state, result } = committed();
  const bId = result.buildingId;
  state = tx(state, (d) => {
    addBankAccount(d, E, 'LL-0007', { bank: 'VCB', no: '1', holder: 'A' });
    setDates(d, E, 'HL-0031', { startDate: '2026-10-01' });
    setSigner(d, E, 'HL-0031', { name: 'B' });
    activate(d, E, 'HL-0031');
    saveCode(d, E, bId, 'PD25A');
    createRooms(d, E, bId, genByFloor({ buildingCode: 'PD25A', floors: 1, perFloor: 2 }).rows, 'floor-gen');
    assignManager(d, E, bId, 'emp-linh', '2026-09-24');
    setAccount(d, E, bId, 'acc-bidv', '2026-09-24');
  }).state;
  assert.deepEqual(transitionBlockers(state, state.buildings.find((b) => b.id === bId), E.today).hard, []);
  assert.throws(() => tx(state, (d) => transition(d, E, bId, {})), /Nhóm/);
  state = tx(state, (d) => transition(d, E, bId, { group: 'G', grade: 'L3' })).state;
  assert.equal(state.buildings.find((b) => b.id === bId).status, 'Đang khai thác');
  assert.equal(state.buildingTypeHistory.filter((h) => h.buildingId === bId).length, 2);
  assert.equal(landlordLabel(state, state.landlords.find((l) => l.id === 'LL-0007')), 'active');
});

test('format: cộng tháng kẹp cuối tháng', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addDays('2026-10-01', -1), '2026-09-30');
});

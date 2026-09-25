// Trạng thái ban đầu: demo được cả luồng "tạo mới từ HĐ chủ nhà" (job LLX-001 đang review, chưa có LL-0007)
// lẫn luồng "đang vận hành" (tòa G1, 15 phòng Đang thuê).
import { SRC } from '../data/landlord-tungsoi.mjs';
import { SEED_LANDLORDS } from '../data/seed-landlords.mjs';
import { COMPANY_ACCOUNTS, EMPLOYEES, G1, G1_ROOMS, G1_METERS, G1_SNAPSHOT, G1_DOCS } from '../data/seed-g1.mjs';
import { seedTenancy } from '../data/seed-tenancy.mjs';
import { seedService } from '../data/seed-service.mjs';
import { seedBilling } from '../data/seed-billing.mjs';
import { seedHr } from '../data/seed-hr.mjs';
import { seedFinance } from '../data/seed-finance.mjs';
import { seedReports } from '../data/seed-reports.mjs';
import { seedAdmin } from '../data/seed-admin.mjs';
import { initialParams } from './params.mjs';

export const SCHEMA = 2;

export function buildInitialState() {
  const stubs = SEED_LANDLORDS.map(([, , code, rooms]) => ({
    id: `bld-${code.toLowerCase()}`, code, codeSuggestion: null, codeLocked: true, name: code, address: null,
    area: null, floors: null, floorArea: null, structure: null, purpose: null, scope: null, origin: 'seed', stub: true,
    status: 'Đang khai thác', group: null, grade: null, amenities: {}, customerAccountId: null, invoiceTemplate: null,
    meterReadingDay: 22, hkdRegistration: null, seedRoomCount: rooms, createdAt: '2026-01-01T08:00',
  }));
  const landlords = SEED_LANDLORDS.map(([id, name, code, , note]) => ({
    id, type: 'Cá nhân', name, idNo: null, idIssued: null, idPlace: null, taxCode: null, legalName: null, representative: null,
    phone: null, email: null, address: null, contactAddress: null, defaultCycle: null, method: null, bankAccounts: [],
    status: 'Hoạt động', source: { kind: 'seed', note }, hintBuildings: [`bld-${code.toLowerCase()}`],
    createdBy: 'seed', createdAt: '2026-01-01T08:00',
  }));
  const documents = G1_DOCS.map((d, i) => ({
    id: `DOC-${String(i + 1).padStart(4, '0')}`, links: { buildingId: 'bld-g1', landlordId: null, headLeaseId: null },
    version: 1, prevId: null, sizeKb: null, issuedDate: null, expiryDate: null, note: '', uploadedBy: 'Seed', uploadedAt: '2026-01-01T08:00', ...d,
  }));
  return {
    meta: {
      schema: SCHEMA, role: 'admin', showPending: true, period: '2026-09', navOpen: {},
      session: { token: 'demo-admin', role: 'admin', userId: 'u-admin', remember: true },
      seq: { LL: 6, HL: 30, LLX: 1, BLD: 7, DOC: documents.length, AS: 0, MT: 0, AUD: 0,
        TEN: 0, CT: 0, INV: 0, PAY: 0, EXP: 0, PR: 0, IMP: 0 },
    },
    companyAccounts: COMPANY_ACCOUNTS,
    employees: EMPLOYEES,
    landlords,
    headLeases: [],
    headLeasePaymentSchedule: [],
    buildings: [G1, ...stubs],
    buildingTypeHistory: [
      { buildingId: 'bld-g1', attr: 'group', value: 'G', effectiveFrom: '2026-01-01', by: 'Seed §4', at: '2026-01-01T08:00' },
      { buildingId: 'bld-g1', attr: 'grade', value: 'L2', effectiveFrom: '2026-01-01', by: 'Seed (minh họa)', at: '2026-01-01T08:00' },
    ],
    buildingAssignments: [
      { buildingId: 'bld-g1', employeeId: 'emp-linh', role: 'Phụ trách chính', from: '2026-01-01', to: null },
      { buildingId: 'bld-t3', employeeId: 'emp-huyen', role: 'Phụ trách chính', from: '2026-01-01', to: null },
      { buildingId: 'bld-t10', employeeId: 'emp-huyen', role: 'Phụ trách chính', from: '2026-01-01', to: null },
    ],
    meters: G1_METERS,
    rooms: G1_ROOMS,
    roomStatusHistory: G1_ROOMS.map((r) => ({ roomId: r.id, status: 'Đang thuê', from: r.statusFrom, to: null, reason: 'Kích hoạt HĐ', by: 'Hệ thống' })),
    roomPriceHistory: G1_ROOMS.flatMap((r) => [
      { roomId: r.id, kind: 'listPrice', value: r.listPrice, effectiveFrom: '2026-01-01', by: 'Seed §6.1' },
      { roomId: r.id, kind: 'mgmtPrice', value: r.mgmtPrice, effectiveFrom: '2026-01-01', by: 'Seed §6.1' },
    ]),
    documents,
    assets: [],
    extractionJobs: [{
      id: SRC.job, file: { name: SRC.file, sizeKb: SRC.sizeKb, pages: SRC.pages, hash: SRC.hash },
      uploadedBy: SRC.uploadedBy, uploadedAt: '2026-09-24T09:05', step: 2, status: 'Đang review',
      choices: {}, enteredDates: null, dup: null, committed: null, createdBy: 'u-accountant',
    }],
    reportSnapshots: [G1_SNAPSHOT],
    audit: [],
    drafts: {},
    params: initialParams(),
    ...seedTenancy(), ...seedService(), ...seedBilling(), ...seedHr(),
    ...seedFinance(), ...seedReports(), ...seedAdmin(),
  };
}

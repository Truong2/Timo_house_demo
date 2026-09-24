// UI-03 — Chi tiết HĐ đầu vào HL-0031 sau commit trích xuất (trạng thái Nháp).
import { page, chip, btn, card, table, tabs, alert, dl, grid, note, icon, vnd, timeline } from '../shell.mjs';
import { LANDLORD, PARTY_B, BUILDING, LEASE } from '../data/landlord-tungsoi.mjs';

const blank = (t = 'Trống trên HĐ') => `<span class="wtx">${icon('alert', 12)} ${t}</span>`;

const body = `
${tabs(['Tổng quan', 'Lịch đóng tiền', 'Tòa/Phân bổ', 'Pháp lý', 'Điều khoản', 'Lịch sử'], 0)}
${alert('Chưa kích hoạt được', 'Thiếu ngày giao nhà và ngày bắt đầu/kết thúc (Đ.2) · thiếu tài khoản nhận của chủ nhà · Bên B là cá nhân, chờ xác nhận người ký thay Timehouse.', 'danger')}
${grid('1fr 1fr 1fr', [
  card(`${icon('users', 16)} ② Các bên`, dl([
    ['Bên A', `<b>${LANDLORD.name}</b> · ${LANDLORD.code} ▸`],
    ['CCCD bên A', `<span class="mono">${LANDLORD.idNo}</span>`],
    ['Bên B (trên HĐ)', `${PARTY_B.name} ${chip('Cá nhân', 'warn')}`],
    ['Ký thay Timehouse', blank('Chờ xác nhận ủy quyền')],
  ], 1)),
  card(`${icon('building', 16)} ③ Đối tượng thuê · Đ.1, Đ.3`, dl([
    ['Địa chỉ', BUILDING.address],
    ['GCN số · nơi cấp · ngày', blank()],
    ['Số tầng · DT sàn', blank()],
    ['Kết cấu · phạm vi', `${BUILDING.structure} · toàn bộ`],
    ['Mục đích', BUILDING.purpose],
  ], 1)),
  card(`${icon('calendar', 16)} ④ Thời gian · Đ.2`, dl([
    ['Ngày ký', blank()],
    ['Ngày giao nhà', blank()],
    ['Ngày bắt đầu tính tiền', '<span class="muted">Gộp với ngày bắt đầu (Đ.2.2)</span>'],
    ['Từ → đến', blank()],
    ['Thời hạn', `${LEASE.months} tháng`],
    ['Gia hạn', LEASE.renewNotice],
  ], 1)),
])}
<div style="height:14px"></div>
${grid('1fr 1fr 1fr', [
  card(`${icon('coins', 16)} ⑤ Giá · Đ.4`, dl([
    ['Tiền thuê', `<b>${vnd(LEASE.rent)} đ/tháng</b>`],
    ['Giữ giá · lịch tăng giá', '<span class="muted">Không có trên HĐ</span>'],
    ['Khi gia hạn', 'Theo thị trường (4.2)'],
    ['Tháng miễn', '<span class="muted">Không có</span>'],
    ['Thuế nhà đất, TNCN', 'Bên A chịu'],
  ], 1)),
  card(`${icon('lock', 16)} ⑥ Cọc · Đ.5`, dl([
    ['Số tiền', `<b>${vnd(LEASE.deposit)} đ</b> · một lần`],
    ['Nguyên văn', `<span class="muted">${LEASE.depositRaw}</span>`],
    ['Thời điểm trả', 'Tiền mặt, ngay sau khi ký'],
    ['Khấu trừ', 'Bên A không tự khấu trừ (5.3)'],
  ], 1) + note('Theo dõi riêng, KHÔNG ghi chi phí (BR-2.02.10).')),
  card(`${icon('wallet', 16)} ⑦ Thanh toán · Đ.4.4`, dl([
    ['Kỳ trả', LEASE.cycle],
    ['Hạn trả', LEASE.dueWindow],
    ['Hình thức', LEASE.method],
    ['STK nhận', blank('Hồ sơ chủ nhà chưa có')],
  ], 1)),
])}
<div style="height:14px"></div>
${card(`${icon('calendar', 16)} ⑧ Lịch đóng tiền chủ nhà`, `
  <div style="display:flex;gap:12px;align-items:center;border:1px dashed var(--bd);border-radius:8px;padding:14px;background:#F8FAFC">
    ${icon('lock', 22)}
    <div style="flex:1"><b>Chưa sinh được lịch</b><p class="muted" style="font-size:12.5px">Cần ngày bắt đầu (Đ.2.2). Khi có ngày: ${LEASE.months} tháng ÷ 3 = 20 kỳ · mỗi kỳ = ${vnd(LEASE.rent)} × 3 = <b>${vnd(LEASE.rent * 3)} đ</b> (không có tháng miễn) · hạn ngày 01–10 tháng đầu kỳ.</p></div>
    ${btn('Nhập ngày bắt đầu', 'outline', 'calendar')}
  </div>`, btn('Sinh lại lịch', 'outline sm dis', 'refresh'))}
${grid('1.3fr 1fr', [
  card(`${icon('alert', 16)} Điều khoản rủi ro — lưu nguyên văn, không thành rule chung`, table([{ h: 'Điều' }, { h: 'Nội dung' }, { h: 'Mức' }], [
    ['6.2 · 10.2', 'Bên B chậm thanh toán 01 tháng → bên A có quyền lấy nhà', chip('Rủi ro cao', 'danger')],
    ['6.1', 'Bên A hủy HĐ → bồi thường 03 tháng tiền thuê', chip('Lệch 10.4', 'warn')],
    ['10.4', 'Bên A tự ý chấm dứt → trả cọc + bồi thường 03 lần tiền cọc', chip('Lệch 6.1', 'warn')],
    ['10.4', 'Bên B tự ý chấm dứt → mất cọc + bồi thường 03 lần tiền cọc', chip('Lưu', 'neutral', 'info')],
    ['7.2', 'Bên B được chấm dứt không phạt khi thiên tai, dịch bệnh, chiến tranh', chip('Lưu', 'neutral', 'info')],
    ['PL II · 7.1', 'Trả tài sản “không tính hao mòn” ≠ “trừ hao mòn theo thời gian”', chip('Lệch', 'warn')],
  ], { compact: 1 }), '', 'flush'),
  card(`${icon('users', 16)} ⑨ Phần cổ đông`, `
    <div style="border:1px dashed var(--bd);border-radius:8px;padding:12px;background:#F8FAFC">
      ${chip('Làm sau', 'neutral', 'clock')}
      <p style="margin-top:6px">Chia nghĩa vụ góp theo % cổ đông của tòa sẽ bật khi có module <b>Cổ đông góp vốn (UI-29)</b>.</p>
      <p class="muted" style="font-size:12px;margin-top:4px">Đ.7.2: khi đổi người góp vốn, hai bên ký bổ sung <b>Phụ lục góp vốn 3 bên</b> — lưu thành loại tài liệu riêng.</p>
    </div>` + timeline([['done', 'Trích xuất & commit', 'LLX-001 · 24/09/2026'], ['cur', 'Nháp — bổ sung ngày, STK, người ký', ''], ['todo', 'Kích hoạt → sinh lịch 20 kỳ', ''], ['todo', 'Gắn % cổ đông', 'Làm sau']]).replace('<ul class="tl">', '<ul class="tl" style="margin-top:12px">')),
])}
`;

export default {
  file: 'UI-03-head-lease-verified.png',
  html: page({
    active: 'UI-03', breadcrumb: ['Nguồn nhà & tòa/phòng', 'Hợp đồng đầu vào', LEASE.code],
    title: `HĐ đầu vào ${LEASE.code}`, status: chip('Nháp', 'neutral', 'edit'),
    subtitle: `${LANDLORD.name} → 25A Phú Diễn · ${LEASE.months} tháng · ${vnd(LEASE.rent)} đ/tháng · kỳ ${LEASE.cycle}`,
    actions: `${btn('Gia hạn', 'outline dis', 'refresh')}${btn('Bổ sung & kích hoạt', 'primary', 'check')}`,
    body,
  }),
};

// Những điểm còn mâu thuẫn được xuất ra sổ hỏi khách; mã Q bền vững qua các đợt.
export const QUESTIONS = [
  { id: 'Q-01', title: 'Mẫu số prorate 30/31 ngày', current: 'Dùng 30; riêng phép đối soát Seed ghi sai khác', source: 'SRS FR12/FR16, Seed §6.2', param: 'P-03' },
  { id: 'Q-02', title: 'Mốc báo hết hợp đồng 30/35 ngày', current: 'Dùng 35 ngày, không tự gia hạn', source: 'SRS FR15, HĐ mẫu', param: 'P-32' },
  { id: 'Q-03', title: 'Hai mẫu số phòng', current: 'N phân bổ gồm phòng trống; hiệu suất theo phòng có hóa đơn', source: 'SRS FR22/FR25', param: 'P-05' },
  { id: 'Q-04', title: 'Trọng số M1/M2/M3', current: 'Cộng thẳng theo Seed', source: 'Seed §10, SRS FR21', param: 'P-19' },
  { id: 'Q-05', title: 'Login demo và thời hạn phiên', current: 'Chọn vai trò rồi bấm Đăng nhập; phiên demo chỉ lưu role và token', source: 'SRS FR00 Screen 00.1', param: null },
  { id: 'Q-06', title: 'Audit đăng nhập/đăng xuất', current: 'Ghi audit cho phiên demo', source: 'SRS FR00; Common Rule 5', param: null },
];

export const question = (id) => QUESTIONS.find((x) => x.id === id);

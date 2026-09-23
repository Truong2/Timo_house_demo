/* Central registry for business assumptions that still need client confirmation. */
(function (TH) {
  const rows = [
    ['P-01','Bảng bậc lương/phòng (ma trận level × dải hiệu suất)','UI-19, UI-22','≥98%: 130.000/100; 95–98%: 120.000/95; 93–95%: 119.000/95; 90–93%: 110.000/90; dưới 90% cần chốt',''],
    ['P-02','Số tháng khấu hao từng nhóm tài sản','UI-27, UI-31','< 10tr: 12 tháng; ≥ 10tr: 36 tháng; cải tạo theo HĐ còn lại ≤ 60',12],
    ['P-03','Prorate chia 30 hay số ngày thực','UI-07, UI-12, UI-16, UI-26','÷30 = 1.140.000 đ; ÷31 = 1.103.225,806 đ (301T41, 9 ngày)',30],
    ['P-04','Ý nghĩa nhóm T/S/G và hạng L1–L3','UI-04, UI-31','T/S/G = dòng sản phẩm; L = tình trạng tòa','T/S/G'],
    ['P-05','Hai mẫu số phòng (N phân bổ vs số phòng tính hiệu suất)','UI-05, UI-22, UI-25, UI-30','N kể cả phòng trống; hiệu suất dùng phòng có hóa đơn',''],
    ['P-06','Kỳ lương và các ngày chốt 16 / 20 / sau 20','UI-19, UI-22, UI-30','Theo lịch mặc định, khai báo dạng tham số','16/20'],
    ['P-07','Hoa hồng nhiều đợt và mức ngoài tham chiếu','UI-26','Cho phép nhiều đợt; mức lạ chỉ cảnh báo','35%/50%'],
    ['P-08','Tòa mới áp đơn giá cố định đến khi nào','UI-22','2 tháng đầu hoặc lấp đầy ≥ 70%','2 tháng / 70%'],
    ['P-09','Phạt trễ hạn 200.000đ/ngày, mốc bắt đầu và trần','UI-12, UI-14','Từ ngày thứ 6, không trần mặc định','200000'],
    ['P-10','Basis và cách chia lợi nhuận cổ đông','UI-29, UI-31','Theo quý, lũy kế dương, basis AC','quý / AC'],
    ['P-11','Ngưỡng vốn hóa thiết bị thành tài sản','UI-24, UI-27','2.000.000đ/đơn vị',2000000],
    ['P-12','Định nghĩa số phòng dưới quyền của Lead','UI-18, UI-22','Σ phòng kể cả trống; TPVH tính toàn hệ thống',''],
    ['P-13','Điện chung gộp vào doanh thu điện hay tách dòng','UI-10, UI-31','Gộp vào doanh thu điện','gộp'],
    ['P-14','Thứ tự phân bổ payment vào dòng hóa đơn','UI-13, UI-31','Nợ cũ → dịch vụ → thu khác → tiền phòng → cọc',''],
    ['P-15','Cách chia tiền thuê khi 1 HĐ đầu vào gắn nhiều tòa','UI-03, UI-28','Theo số phòng, cho override bằng phụ lục','số phòng'],
    ['P-16','Mức khấu trừ hoàn cọc mặc định','UI-16','Hao mòn 200.000, vệ sinh 100.000, sơn 300–500.000',''],
    ['P-17','Mốc 5 ngày chuyển công nợ','UI-01, UI-14','5 ngày sau ngày phát hành',5],
    ['P-18','Ngày chi lương thực tế','UI-23','20–25 tháng kế tiếp, chỉ ảnh hưởng sổ quỹ','20–25'],
    ['P-19','Giờ chụp snapshot mốc thu tiền','UI-21','23:59 ngày 5 / 10 / 15','23:59'],
    ['P-20','Ngưỡng tuổi việc để tô màu ưu tiên Work Queue','UI-01','Công nợ > 5 / > 15 ngày; HĐ sắp hết < 7 ngày','5/15/7'],
    ['P-21','Ngày tham chiếu xác định phụ trách chính cho kỳ lương','UI-20, UI-22','Ngày 15 của kỳ',15],
    ['P-22','Có tách vai trò HR và Quản lý Tổng không','UI-33','Gộp vào Admin/Kế toán','gộp'],
    ['P-23','Ngưỡng cảnh báo HĐ đầu vào sắp hết và mốc nhắc trả chủ nhà','UI-03, UI-28','6 tháng; nhắc 15/7/1 ngày','6 tháng'],
    ['P-24','Thời điểm sinh mã khách và mã khi đổi phòng','UI-06','Sinh khi Chờ ký; đổi phòng giữ số thứ tự','Chờ ký'],
    ['P-25','Ảnh công tơ bắt buộc ở loại chỉ số nào','UI-10','Bắt buộc với chỉ số đầu và cuối','đầu/cuối'],
    ['P-26','Tiền mặt NVVH giữ có tính vào mốc thu không','UI-13, UI-21','Không tính cho tới khi kế toán xác nhận','không'],
    ['P-27','Nợ phá HĐ thu hồi ở tháng sau tính cho kỳ nào','UI-13, UI-14, UI-21','CF ghi tháng thu, không hồi tố hiệu suất','tháng thu'],
    ['P-28','Chi lương: tạm ứng, duyệt đợt, đối chiếu ngân hàng','UI-23','Cho tạm ứng trước khóa, Admin duyệt đợt',''],
    ['P-29','Thành phần Đã góp, phí môi giới và cọc chủ nhà','UI-28, UI-29','Là vốn góp, không phải chi phí tháng',''],
    ['P-30','Dịch vụ chung trên HĐ khách và cách tính điện chung','UI-07, UI-09, UI-12, UI-31','HĐ gộp bốn khoản; hệ thống tách combo và công tơ',''],
    ['P-31','Nước theo đầu người hay đồng hồ khi hợp đồng có cả hai','UI-07, UI-09, UI-10, UI-12','Cần xác nhận điều khoản áp dụng',''],
    ['P-32','Báo trước 30/35 ngày và tự gia hạn hợp đồng','UI-07, UI-15, UI-01','Hợp đồng mẫu: 30 ngày và mặc nhiên gia hạn','30 ngày'],
    ['P-33','Phạt chậm trả theo hợp đồng mẫu hay rule hệ thống','UI-12, UI-14','HĐ: từ mùng 1 tháng sau, tối đa 3 ngày','3 ngày'],
    ['P-34','Chuyển người thuê trên cùng phòng và phí nhượng','UI-06, UI-07, UI-15','Chưa có loại sự kiện trong vòng đời hợp đồng',''],
    ['P-35','Chuẩn nội dung chuyển khoản so với mã phòng','UI-07, UI-12, UI-13','HĐ: P302 - TH01 - TÊN; mã phòng: 302TH01',''],
    ['P-36','SLA hoàn cọc tính từ lúc bàn giao phòng và chìa khóa','UI-16, UI-01','Hợp đồng mẫu quy định 10 ngày',10],
  ].map(([code,label,screens,source,value]) => ({ code,label,screens:screens.split(', '),source,value,status:'assumed' }));
  const byCode = Object.fromEntries(rows.map(x => [x.code,x]));
  const P = {
    all: () => rows.map(x => Object.assign({}, x, { value: value(x.code) })),
    get: code => { const x = byCode[code]; return x ? Object.assign({}, x, { value:value(code) }) : null; },
    value,
    set(code, next) { if (!byCode[code]) throw new Error('Mã tham số không tồn tại'); TH.store.state.meta.paramValues = TH.store.state.meta.paramValues || {}; TH.store.state.meta.paramValues[code] = next; TH.store.audit('update','businessParam',code,'Cập nhật tham số '+code,{ value:next }); TH.store.save(); },
    chip(code) { const x = byCode[code]; return x ? `<span class="chip amber">Cần xác nhận nghiệp vụ · ${code}</span>` : ''; }
  };
  function value(code) { const x = byCode[code]; if (!x) return undefined; const v = TH.store && TH.store.state && TH.store.state.meta.paramValues && TH.store.state.meta.paramValues[code]; return v === undefined ? x.value : v; }
  TH.params = P;
})(window.TH);

"""Generate two internally consistent sample contracts for the TimoHouse demo.

Requires reportlab: python -m pip install reportlab
The documents are explicitly marked as unsigned sample data.
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "contracts_demo"
OUT.mkdir(parents=True, exist_ok=True)

pdfmetrics.registerFont(TTFont("TimesVN", "C:/Windows/Fonts/times.ttf"))
pdfmetrics.registerFont(TTFont("TimesVN-Bold", "C:/Windows/Fonts/timesbd.ttf"))
pdfmetrics.registerFontFamily("TimesVN", normal="TimesVN", bold="TimesVN-Bold")

ST = getSampleStyleSheet()
ST.add(ParagraphStyle(name="DocTitleVN", fontName="TimesVN-Bold", fontSize=16, leading=19, alignment=TA_CENTER, spaceAfter=8))
ST.add(ParagraphStyle(name="CenterVN", fontName="TimesVN", fontSize=10, leading=14, alignment=TA_CENTER, spaceAfter=4))
ST.add(ParagraphStyle(name="BodyVN", fontName="TimesVN", fontSize=10.5, leading=15, alignment=TA_JUSTIFY, spaceAfter=5))
ST.add(ParagraphStyle(name="HeadVN", fontName="TimesVN-Bold", fontSize=11, leading=15, spaceBefore=10, spaceAfter=5))
ST.add(ParagraphStyle(name="CellVN", fontName="TimesVN", fontSize=9.5, leading=12))
ST.add(ParagraphStyle(name="CellBoldVN", fontName="TimesVN-Bold", fontSize=9.5, leading=12))
ST.add(ParagraphStyle(name="NoteVN", fontName="TimesVN", fontSize=9, leading=13, textColor=colors.HexColor("#8a3d24")))


def p(text, style="BodyVN"):
    return Paragraph(text, ST[style])


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("TimesVN", 8)
    canvas.setFillColor(colors.HexColor("#8a3d24"))
    canvas.drawString(18 * mm, 15 * mm, "DỮ LIỆU MẪU ĐỒNG BỘ · CHƯA KÝ · KHÔNG CÓ GIÁ TRỊ GIAO KẾT")
    canvas.setFillColor(colors.black)
    canvas.drawRightString(192 * mm, 15 * mm, f"Trang {doc.page}")
    canvas.restoreState()


def build(path, story):
    doc = BaseDocTemplate(str(path), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm,
                          topMargin=20 * mm, bottomMargin=23 * mm, title=path.stem,
                          author="TimoHouse demo")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height,
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates(PageTemplate(id="contract", frames=frame, onPage=footer))
    doc.build(story)


def title(story, text, code):
    story.extend([
        p("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", "CenterVN"),
        p("Độc lập – Tự do – Hạnh phúc", "CenterVN"),
        Spacer(1, 6 * mm), p(text, "DocTitleVN"),
        p(f"Mã hợp đồng: <b>{code}</b>", "CenterVN"),
        p("Bản dữ liệu mẫu đồng bộ để kiểm thử nhập hợp đồng và OCR; các bên chưa ký.", "NoteVN"),
    ])


def para(story, label, text):
    story.append(p(f"<b>{label}</b> {text}"))


def section(story, heading, *lines):
    story.append(p(heading, "HeadVN"))
    for line in lines:
        story.append(p(line))


def table(rows, widths=None):
    converted = [[p(str(value), "CellBoldVN" if i == 0 else "CellVN") for value in row]
                 for i, row in enumerate(rows)]
    t = Table(converted, colWidths=widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#9b9b9b")),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eaeef1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


def signatures(story, left, right):
    story.append(Spacer(1, 7 * mm))
    story.append(table([[left, right], ["(Ký và ghi rõ họ tên sau khi xác nhận)",
                                        "(Ký và ghi rõ họ tên sau khi xác nhận)"],
                        ["\n\n\n", "\n\n\n"]], [87 * mm, 87 * mm]))


def owner_contract():
    s = []
    title(s, "HỢP ĐỒNG THUÊ TOÀ NHÀ", "HĐCN-TH01-2026-001")
    para(s, "Ngày lập mẫu:", "25/08/2026. Địa điểm: Tòa TH01, số 25 Nguyễn Cơ Thạch, phường Từ Liêm, Hà Nội.")
    para(s, "BÊN A – CHỦ NHÀ:", "Ông PHÍ VĂN THẮNG; CCCD 001070018351; điện thoại 0916122338; địa chỉ liên hệ: Tổ 18 Phú Diễn, Hà Nội.")
    para(s, "BÊN B – ĐƠN VỊ THUÊ VÀ KHAI THÁC:", "Ông NGUYỄN ĐÌNH CHUNG; CCCD 001096005087; điện thoại 0393542196; địa chỉ liên hệ: Nam Cao, Quảng Oai, Hà Nội.")
    section(s, "Điều 1. Tài sản thuê và phạm vi khai thác",
            "Bên A cho Bên B thuê toàn bộ <b>tòa TH01</b> tại <b>số 25 Nguyễn Cơ Thạch, phường Từ Liêm, Hà Nội</b>. Tòa gồm <b>10 tầng, 30 phòng</b>; danh sách phòng tại Phụ lục 1 là một phần của hợp đồng mẫu này.",
            "Bên B được quản lý và cho khách thuê lại từng phòng. Phòng <b>P302 – TH01</b> (mã dữ liệu <b>302TH01</b>) thuộc danh sách phòng bàn giao; có thể ký hợp đồng thuê riêng với khách.")
    section(s, "Điều 2. Thời hạn thuê và bàn giao",
            "Ngày bàn giao tòa: <b>01/09/2026</b>. Thời gian thuê và tính tiền: <b>60 tháng</b>, từ <b>01/09/2026</b> đến hết <b>31/08/2031</b>.",
            "Mọi gia hạn, thay đổi giá hoặc thay đổi danh sách phòng phải lập phụ lục có ngày hiệu lực rõ ràng.")
    section(s, "Điều 3. Giá thuê, tiền cọc và lịch trả chủ nhà",
            "Giá thuê toàn tòa: <b>114.000.000 đồng/tháng</b>. Tiền cọc Bên B giao Bên A: <b>114.000.000 đồng</b>, là khoản bảo đảm riêng, không tính vào tiền thuê tháng.",
            "Kỳ thanh toán: <b>03 tháng/lần</b>, trả vào <b>ngày 01 đến ngày 10 của tháng đầu kỳ</b>; ngày đến hạn cuối là <b>ngày 10</b>. Với giá gốc, mỗi kỳ đủ 03 tháng là <b>342.000.000 đồng</b>.",
            "Các kỳ đầu: <b>09–11/2026</b> (hạn 10/09/2026), <b>12/2026–02/2027</b> (hạn 10/12/2026), <b>03–05/2027</b> (hạn 10/03/2027), <b>06–08/2027</b> (hạn 10/06/2027). Tiếp tục chu kỳ 03 tháng cho đến hết hợp đồng; kỳ cuối 06–08/2031.",
            "Bên B thanh toán bằng chuyển khoản hoặc tiền mặt, kèm chứng từ. Nếu có phụ lục thay giá giữa kỳ, các bên đối chiếu số phải trả theo giá hiệu lực của từng tháng.")
    section(s, "Điều 4. Bàn giao và cho thuê lại",
            "Hai bên đối chiếu từng phòng, chìa khóa, công tơ và tài sản khi bàn giao. Danh sách dưới đây là dữ liệu phòng thống nhất dùng để kiểm thử; số đo, tình trạng và chỉ số bàn giao từng phòng cần xác nhận bằng biên bản thực tế.",
            "Bên B được ký hợp đồng khách thuê phòng thuộc danh sách bàn giao, thu tiền thuê phòng và phí dịch vụ theo hợp đồng khách. Giá thuê toàn tòa trả Bên A độc lập với giá thuê từng phòng của khách.")
    s.append(p("Phụ lục 1. Danh sách phòng thuộc tòa TH01", "HeadVN"))
    rows = [["Tầng", "Các phòng bàn giao", "Ghi chú"]]
    for floor in range(1, 11):
        room_numbers = [f"P{floor * 100 + i:03d}" for i in range(1, 4)]
        rows.append([str(floor), ", ".join(room_numbers),
                     "P302 thuê cho khách TRẦN MINH AN" if floor == 3 else "Thuộc tòa TH01"])
    s.append(table(rows, [20 * mm, 76 * mm, 78 * mm]))
    para(s, "Quy ước mã dữ liệu:", "P302 – TH01 tại hợp đồng tương ứng mã phòng 302TH01 trong hệ thống; tất cả phòng trong danh sách thuộc cùng địa chỉ tòa TH01 nêu tại Điều 1.")
    signatures(s, "BÊN A – CHỦ NHÀ", "BÊN B – ĐƠN VỊ THUÊ")
    build(OUT / "Hop_dong_chu_nha_TH01_demo_dong_bo.pdf", s)


def tenant_contract():
    s = []
    title(s, "HỢP ĐỒNG CHO THUÊ PHÒNG", "HĐKH-TH01-P302-2026-001")
    para(s, "Ngày lập mẫu:", "17/09/2026. Địa điểm: Tòa TH01, số 25 Nguyễn Cơ Thạch, phường Từ Liêm, Hà Nội.")
    para(s, "BÊN A – BÊN CHO THUÊ PHÒNG:", "Ông NGUYỄN ĐÌNH CHUNG; CCCD 001096005087; điện thoại 0393542196. Là Bên B thuê và được quyền cho thuê lại tòa TH01 theo hợp đồng HĐCN-TH01-2026-001.")
    para(s, "BÊN B – KHÁCH THUÊ:", "Ông TRẦN MINH AN; ngày sinh 15/06/1998; CCCD 001098000001; điện thoại 0988123456; địa chỉ liên hệ: 123 Minh Khai, phường Vĩnh Tuy, Hà Nội.")
    section(s, "Điều 1. Phòng thuê",
            "Bên A cho Bên B thuê <b>phòng P302 – tòa TH01</b>, mã dữ liệu <b>302TH01</b>, tại <b>số 25 Nguyễn Cơ Thạch, phường Từ Liêm, Hà Nội</b>. Phòng P302 nằm ở tầng 3 và có trong danh sách bàn giao của hợp đồng chủ nhà HĐCN-TH01-2026-001.",
            "Mục đích sử dụng: để ở; số người ở <b>02</b>, số xe máy <b>01</b>. Người ở thêm hoặc xe điện phát sinh cần được ghi nhận và đối chiếu biểu phí.")
    section(s, "Điều 2. Ngày ký, nhận phòng và thời hạn",
            "Ngày ký mẫu: <b>17/09/2026</b>. Ngày giao, nhận phòng: <b>01/10/2026</b>. Ngày bắt đầu tính tiền phòng và dịch vụ: <b>01/10/2026</b>.",
            "Thời hạn thuê: <b>12 tháng</b>, từ <b>01/10/2026</b> đến hết <b>30/09/2027</b>. Mọi gia hạn phải được hai bên xác nhận bằng văn bản trước khi hết hạn.")
    section(s, "Điều 3. Giá thuê, đặt cọc và tiền đã thanh toán",
            "Tiền thuê phòng: <b>4.500.000 đồng/tháng</b>. Tiền cọc duy trì hợp đồng: <b>4.500.000 đồng</b> (tương đương 01 tháng tiền phòng). Kỳ trả tiền thuê: <b>01 tháng/lần</b>.",
            "Khoản đã nộp trước ngày ký: <b>1.000.000 đồng</b>. Khoản nộp thêm ngày 17/09/2026: <b>8.000.000 đồng</b>. Tổng đã nộp: <b>9.000.000 đồng</b>, phân bổ <b>4.500.000 đồng tiền cọc</b> và <b>4.500.000 đồng tiền thuê phòng kỳ 10/2026</b>. Việc đã thực thu phải được xác nhận bằng chứng từ trước khi ghi sổ.",
            "Tiền dịch vụ tính theo sử dụng thực tế và biểu phí tại Điều 4; các khoản phát sinh tháng 10/2026 chưa nằm trong 9.000.000 đồng nêu trên.")
    section(s, "Điều 4. Biểu phí dịch vụ và chỉ số bàn giao",
            "Chỉ số bàn giao ngày <b>01/10/2026</b>: điện <b>1.250 kWh</b>; nước <b>85 m³</b>. Chỉ số này là mốc đầu để tính phần sử dụng tiếp theo, không phải lượng điện nước phải trả tại ngày nhận phòng.")
    s.append(table([
        ["Dịch vụ", "Đơn giá", "Cách tính"],
        ["Điện", "4.000 đồng/kWh", "Số kWh mới trừ chỉ số đầu kỳ"],
        ["Nước", "120.000 đồng/người/tháng", "02 người: 240.000 đồng/tháng"],
        ["Internet", "100.000 đồng/phòng/tháng", "01 phòng"],
        ["Dịch vụ chung", "120.000 đồng/người/tháng", "02 người: 240.000 đồng/tháng"],
        ["Xe máy", "0 đồng/xe/tháng", "01 xe máy; chưa có xe điện"],
        ["Xe đạp điện nếu phát sinh", "150.000 đồng/xe/tháng", "Chỉ thu khi đăng ký sử dụng"],
        ["Xe điện dịch vụ SM nếu phát sinh", "400.000 đồng/xe/tháng", "Chỉ thu khi đăng ký sử dụng"],
    ], [48 * mm, 54 * mm, 72 * mm]))
    section(s, "Điều 5. Lịch thanh toán của khách",
            "Bên A gửi thông báo tiền thuê kỳ sau và phí dịch vụ phát sinh vào <b>ngày 25 hằng tháng</b>. Bên B thanh toán từ <b>ngày 25 đến hết ngày 30 của tháng trước kỳ thuê</b>. Ví dụ tiền phòng tháng 11/2026 đến hạn 25–30/10/2026; tiền phòng tháng 10/2026 đã được phân bổ tại Điều 3.",
            "Nội dung chuyển khoản: <b>P302 - TH01 - TRAN MINH AN</b>. Tài khoản nhận tiền phải thể hiện trên thông báo chính thức của Bên A; bản mẫu này không chỉ định tài khoản nhận tiền.")
    section(s, "Điều 6. Bàn giao, thay đổi và kết thúc",
            "Hai bên lập biên bản bàn giao hiện trạng, chìa khóa, tài sản và chỉ số công tơ của riêng phòng P302. Mọi thay đổi giá, số người, số xe hoặc biểu phí phải được xác nhận, ghi ngày hiệu lực và lưu cùng hợp đồng.",
            "Khi kết thúc hợp đồng, hai bên đối chiếu tiền thuê, tiền dịch vụ, tài sản và tiền cọc; việc hoàn cọc hoặc khấu trừ căn cứ chứng từ và biên bản bàn giao đã xác nhận.")
    signatures(s, "BÊN A – BÊN CHO THUÊ PHÒNG", "BÊN B – KHÁCH THUÊ")
    build(OUT / "Hop_dong_khach_thue_P302_TH01_demo_dong_bo.pdf", s)


if __name__ == "__main__":
    owner_contract()
    tenant_contract()
    for path in sorted(OUT.glob("*.pdf")):
        print(path)

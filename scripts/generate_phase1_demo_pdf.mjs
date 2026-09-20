import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs', 'phase1-demo');
const EVIDENCE = path.join(OUT, 'evidence');
const PDF_PATH = path.join(OUT, 'TimeHouse_Phase1_Workflow_Demo_v1.0.pdf');
const SOURCE_MANIFEST = path.join(OUT, 'demo-source-manifest.json');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const EXPECTED_MILESTONES = 40;
const EXPECTED_SLIDES = 35;
const REUSE = process.argv.includes('--reuse-latest');
const KEEP_HTML = process.argv.includes('--keep-html');

const roleLabel = {
  admin: 'Quản trị viên',
  accountant: 'Kế toán',
  ops: 'Vận hành',
  sale: 'Kinh doanh',
  kythuat: 'Kỹ thuật',
};

function ensureInsideWorkspace(target) {
  const relative = path.relative(ROOT, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside a workspace child directory: ${target}`);
  }
}

function latestUatPhase1() {
  const root = path.join(ROOT, 'docs', 'uat');
  if (!fs.existsSync(root)) throw new Error('Không tìm thấy docs/uat để dùng --reuse-latest.');
  const manifests = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(root, entry.name, 'phase-1', 'manifest.json');
    if (fs.existsSync(candidate)) manifests.push(candidate);
  }
  manifests.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (!manifests.length) throw new Error('Không tìm thấy manifest Phase 1 đã chạy.');
  return path.dirname(manifests[0]);
}

function captureCurrentUi() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'timehouse-phase1-demo-'));
  console.log('[demo] Chạy lại 40 mốc Phase 1 để chụp UI hiện tại...');
  execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'capture_phase1_walkthrough.mjs')], {
    cwd: ROOT,
    env: { ...process.env, TIMEHOUSE_UAT_ROOT: tempRoot, CHROME_PATH: CHROME },
    stdio: 'inherit',
    timeout: 15 * 60 * 1000,
  });
  return { source: path.join(tempRoot, 'phase-1'), tempRoot };
}

function prepareSource() {
  const captured = REUSE ? { source: latestUatPhase1(), tempRoot: '' } : captureCurrentUi();
  const manifestPath = path.join(captured.source, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const failed = manifest.milestones.filter((item) => item.status !== 'PASS');
  if (manifest.milestones.length !== EXPECTED_MILESTONES || failed.length || manifest.qa?.status !== 'PASS') {
    throw new Error(`Nguồn UAT không hợp lệ: ${manifest.milestones.length}/${EXPECTED_MILESTONES} mốc, ${failed.length} lỗi, QA ${manifest.qa?.status}.`);
  }

  fs.mkdirSync(OUT, { recursive: true });
  ensureInsideWorkspace(EVIDENCE);
  fs.rmSync(EVIDENCE, { recursive: true, force: true });
  fs.mkdirSync(EVIDENCE, { recursive: true });
  const sourceEvidence = path.join(captured.source, 'evidence');
  for (const name of fs.readdirSync(sourceEvidence)) {
    if (name.toLowerCase().endsWith('.png')) fs.copyFileSync(path.join(sourceEvidence, name), path.join(EVIDENCE, name));
  }
  fs.writeFileSync(SOURCE_MANIFEST, JSON.stringify({
    ...manifest,
    demoDocument: {
      title: 'TimeHouse Phase 1 Workflow Demo v1.0',
      slides: EXPECTED_SLIDES,
      generatedFrom: path.relative(ROOT, captured.source).replaceAll('\\', '/'),
      reusedLatestUat: REUSE,
    },
  }, null, 2), 'utf8');
  return { manifest, tempRoot: captured.tempRoot };
}

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function dataUrl(file) {
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

function shot(name) {
  const file = path.join(EVIDENCE, name);
  if (!fs.existsSync(file)) throw new Error(`Thiếu ảnh evidence: ${name}`);
  return dataUrl(file);
}

function compactRoute(route = '') {
  return route
    .replace(/\?.*$/, '')
    .replace(/\/(?:lan|bui|roo|con|inv|pay|ref|zal)_[a-z0-9]+/gi, '/:id');
}

function milestoneMap(manifest) {
  return Object.fromEntries(manifest.milestones.map((item) => [item.id, item]));
}

function footer(number, section = 'PHASE 1 · CORE RENTAL / GO-LIVE') {
  return `<footer><span>${esc(section)}</span><span>Mockup tương tác · Dữ liệu minh họa</span><b>${String(number).padStart(2, '0')}</b></footer>`;
}

function slideShell(number, title, subtitle, content, options = {}) {
  const klass = ['slide', options.className || ''].filter(Boolean).join(' ');
  return `<section class="${klass}" data-slide="${number}">
    <div class="topline"><span>${esc(options.eyebrow || `PHASE 1 · WORKFLOW ${String(number).padStart(2, '0')}`)}</span><span class="status">${esc(options.status || 'MOCKUP HIỆN TẠI')}</span></div>
    <header class="slide-head"><h1>${esc(title)}</h1>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</header>
    <main>${content}</main>
    ${footer(number, options.footer)}
  </section>`;
}

function infoCard(label, value, tone = '') {
  return `<div class="info-card ${tone}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
}

function pill(text, tone = 'blue') {
  return `<span class="pill ${tone}">${esc(text)}</span>`;
}

function imagePanel(src, caption, className = '') {
  return `<figure class="screen ${className}"><img src="${src}" alt="${esc(caption)}"><figcaption>${esc(caption)}</figcaption></figure>`;
}

function workflowFacts({ goal, role, route, input, action, outcome, note }) {
  return `<aside class="workflow-facts">
    <div class="fact"><span>Mục tiêu nghiệp vụ</span><strong>${esc(goal)}</strong></div>
    <div class="fact-row"><div class="fact"><span>Vai trò</span><strong>${esc(role)}</strong></div><div class="fact"><span>Điều hướng</span><code>${esc(route)}</code></div></div>
    <div class="fact"><span>Dữ liệu nhập</span><p>${esc(input)}</p></div>
    <div class="fact"><span>Thao tác chính</span><p>${esc(action)}</p></div>
    <div class="fact outcome"><span>Kết quả mong đợi</span><p>${esc(outcome)}</p></div>
    ${note ? `<div class="speaker-note">${esc(note)}</div>` : ''}
  </aside>`;
}

function workflowSlide(number, title, subtitle, images, facts, options = {}) {
  const imageMarkup = images.length === 1
    ? imagePanel(shot(images[0].file), images[0].caption, 'single')
    : `<div class="screen-grid ${images.length > 2 ? 'quad' : ''}">${images.map((item) => imagePanel(shot(item.file), item.caption)).join('')}</div>`;
  return slideShell(number, title, subtitle, `<div class="workflow-layout"><div class="visual-stage">${imageMarkup}${options.callout ? `<div class="visual-callout">${esc(options.callout)}</div>` : ''}</div>${workflowFacts(facts)}</div>`, options);
}

function roadmapSlide(number) {
  return slideShell(number, 'Roadmap phát triển TimeHouse', 'Phase 1 tạo nền dữ liệu vận hành; Phase 2–3 kế thừa và mở rộng.', `<div class="roadmap">
    <article class="phase active"><div class="phase-no">01</div><span>HIỆN TẠI</span><h2>Core Rental / Go-live</h2><p>Vận hành cho thuê cốt lõi từ chủ nhà, phòng, khách thuê đến hóa đơn, thu tiền và trả phòng.</p><ul><li>Dữ liệu vận hành thống nhất</li><li>40 mốc workflow đã kiểm thử</li><li>Mockup tương tác để chốt nghiệp vụ</li></ul></article>
    <div class="road-arrow">→</div>
    <article class="phase"><div class="phase-no">02</div><span>DỰ KIẾN</span><h2>Sales, Automation & Operations</h2><p>CRM, lịch xem/giữ chỗ, bảo trì, đối soát, tự động hóa thông báo và báo cáo quản trị.</p><ul><li>Giảm thao tác thủ công</li><li>Mở rộng kiểm soát vận hành</li></ul></article>
    <div class="road-arrow">→</div>
    <article class="phase"><div class="phase-no">03</div><span>ĐỊNH HƯỚNG</span><h2>Enterprise & Investment</h2><p>Tài sản, nhân sự, cổ đông, đầu tư, ngân hàng và BI trên nền dữ liệu Phase 1–2.</p><ul><li>Quản trị doanh nghiệp</li><li>Minh bạch đầu tư</li></ul></article>
  </div><div class="scope-warning">Phase 2–3 là roadmap dự kiến/định hướng, không phải cam kết chức năng production trong Phase 1.</div>`, { eyebrow: 'TIMEHOUSE · ROADMAP', status: '3 PHASE' });
}

function makeSlides(manifest) {
  const m = milestoneMap(manifest);
  const logo = dataUrl(path.join(ROOT, 'mockup', 'assets', 'logo.svg'));
  const slides = [];
  slides.push(`<section class="slide cover" data-slide="1">
    <div class="cover-orb one"></div><div class="cover-orb two"></div>
    <div class="cover-brand"><img src="${logo}" alt="TimeHouse"><span>TIMEHOUSE</span></div>
    <div class="cover-copy"><span class="cover-kicker">CUSTOMER DEMO · PHASE 1</span><h1>Workflow vận hành<br>nhà cho thuê</h1><p>Từ thiết lập chủ nhà và tòa nhà đến thu tiền, hoàn cọc và đưa phòng trở lại sẵn sàng.</p><div class="cover-meta">Core Rental / Go-live · Phiên bản 1.0 · 18/09/2026</div></div>
    <div class="cover-preview"><img src="${shot('S0.2-result.png')}" alt="Tổng quan TimeHouse"><div class="preview-badge">40/40 mốc Phase 1 PASS</div></div>
    ${footer(1, 'TIMEHOUSE · CUSTOMER DEMO')}</section>`);

  slides.push(slideShell(2, 'Mục tiêu buổi demo', 'Thống nhất quy trình trước khi chuyển sang thiết kế và triển khai production.', `<div class="goals">
    <article><b>01</b><h2>Nhìn thấy luồng xuyên suốt</h2><p>Theo dõi một vòng đời thuê hoàn chỉnh thay vì xem từng màn hình rời rạc.</p></article>
    <article><b>02</b><h2>Kiểm tra dữ liệu nhập</h2><p>Xác nhận trường bắt buộc, vai trò thao tác và kết quả sau mỗi bước.</p></article>
    <article><b>03</b><h2>Khóa phạm vi Phase 1</h2><p>Phân biệt chức năng go-live với các nội dung mở rộng của Phase 2–3.</p></article>
    <article><b>04</b><h2>Ghi nhận điểm cần chốt</h2><p>Quy tắc nghiệp vụ, biểu mẫu, tích hợp và tiêu chí nghiệm thu production.</p></article>
  </div><div class="demo-story"><strong>Câu chuyện demo:</strong><span>Tạo chủ nhà & tòa</span><i>→</i><span>Cho thuê phòng</span><i>→</i><span>Lập hóa đơn & thu tiền</span><i>→</i><span>Trả phòng & hoàn cọc</span></div>`, { eyebrow: 'TIMEHOUSE · MỤC TIÊU', status: 'CUSTOMER WORKSHOP' }));

  slides.push(roadmapSlide(3));

  slides.push(slideShell(4, 'Phase 1 mang lại điều gì?', 'Một nền vận hành cho thuê đủ để chạy quy trình hằng ngày trên dữ liệu thống nhất.', `<div class="value-grid">
    ${infoCard('Tài sản vận hành', 'Chủ nhà · Khu nhà · Tòa · Phòng', 'blue')}
    ${infoCard('Doanh thu', 'Hợp đồng · Dịch vụ · Hóa đơn', 'green')}
    ${infoCard('Dòng tiền', 'Công nợ · Thu tiền · Hoàn cọc', 'amber')}
    ${infoCard('Kiểm soát', 'Vai trò · Trạng thái · Lịch sử', 'violet')}
  </div><div class="outcome-band"><div><span>ĐẦU VÀO</span><strong>Dữ liệu danh mục và điều khoản thuê</strong></div><i>→</i><div><span>XỬ LÝ</span><strong>Workflow có vai trò và checkpoint rõ ràng</strong></div><i>→</i><div><span>ĐẦU RA</span><strong>Công nợ, chứng từ và trạng thái phòng cập nhật</strong></div></div><div class="disclaimer"><b>Hiện trạng:</b> mockup tương tác phục vụ trình diễn, rà soát và chốt yêu cầu. Dữ liệu lưu trên trình duyệt; Zalo và dịch vụ ngoài đang mô phỏng.</div>`, { eyebrow: 'PHASE 1 · GIÁ TRỊ', status: 'CORE RENTAL' }));

  slides.push(slideShell(5, 'Luồng nghiệp vụ end-to-end', 'Một chuỗi dữ liệu liên tục, có điểm kiểm soát theo từng vai trò.', `<div class="journey">
    ${[['01','Thiết lập','Chủ nhà · Khu nhà · Tòa · Phòng'],['02','Cho thuê','Khách thuê · Hợp đồng · Cọc'],['03','Tính tiền','Điện nước · Dịch vụ · Hóa đơn'],['04','Thu & nhắc','Công nợ · Khoản thu · Zalo'],['05','Trả phòng','Kết thúc HĐ · Hoàn cọc · Dọn phòng']].map(([n,t,d], i) => `<article><span>${n}</span><h2>${t}</h2><p>${d}</p>${i < 4 ? '<i>→</i>' : ''}</article>`).join('')}
  </div><div class="journey-checks"><span>✓ Dữ liệu có chủ sở hữu</span><span>✓ Trạng thái chuyển có điều kiện</span><span>✓ Chứng từ liên kết</span><span>✓ Có lịch sử và báo cáo</span></div>`, { eyebrow: 'PHASE 1 · LUỒNG TỔNG THỂ', status: '5 CHẶNG' }));

  slides.push(slideShell(6, 'Ai thực hiện bước nào?', 'Phân vai giúp tách trách nhiệm vận hành, tài chính và quản trị hệ thống.', `<div class="roles">
    <article class="admin"><div class="role-icon">A</div><h2>Quản trị viên</h2><p>Danh mục, người dùng, onboarding chủ nhà/tòa và các đợt gửi Zalo.</p><div>${pill('Thiết lập', 'blue')}${pill('Phân quyền', 'blue')}${pill('Thông báo', 'blue')}</div></article>
    <article class="ops"><div class="role-icon">V</div><h2>Vận hành</h2><p>Khách thuê, hợp đồng, trạng thái phòng, kết thúc thuê và phương án hoàn cọc.</p><div>${pill('Cho thuê', 'green')}${pill('Trả phòng', 'green')}</div></article>
    <article class="accountant"><div class="role-icon">K</div><h2>Kế toán</h2><p>Điện nước, hóa đơn, công nợ, thu tiền, duyệt hoàn cọc, chi phí và báo cáo.</p><div>${pill('Chứng từ', 'amber')}${pill('Dòng tiền', 'amber')}</div></article>
  </div><div class="rbac-note"><b>Nguyên tắc:</b> người dùng chỉ thấy chức năng và dữ liệu thuộc vai trò/phạm vi tòa được phân công.</div>`, { eyebrow: 'PHASE 1 · VAI TRÒ', status: 'RBAC' }));

  slides.push(workflowSlide(7, 'Tổng quan điều hành', 'Bắt đầu ngày làm việc từ KPI phòng, tiến độ thu và các khoản cần xử lý.', [{ file: 'S0.2-result.png', caption: 'Dashboard theo kỳ 10/2026' }], {
    goal: 'Nắm nhanh tình hình vận hành và tài chính trong kỳ', role: roleLabel[m['S0.2'].role], route: '#/dashboard', input: 'Kỳ 10/2026; có thể lọc theo Khu nhà và Tòa nhà', action: 'Quan sát KPI, biểu đồ, tiến độ thu và danh sách quá hạn', outcome: 'Ưu tiên đúng phòng, công nợ và công việc cần xử lý trong ngày',
  }, { eyebrow: 'S0 · KHỞI ĐỘNG', callout: 'Dashboard là điểm vào chung; dữ liệu chi tiết được xử lý tại từng phân hệ.' }));

  slides.push(slideShell(8, 'Mô hình dữ liệu quản lý', 'Khu nhà là danh mục quản lý; Quận/Huyện chỉ là thông tin địa lý của tòa.', `<div class="model">
    <article class="entity owner"><span>1</span><h2>Chủ nhà</h2><p>Hồ sơ đối tác và hợp đồng đầu vào</p></article><i>1 → N</i>
    <article class="entity building"><span>2</span><h2>Tòa nhà</h2><p>Thuộc một chủ nhà và một Khu nhà</p></article><i>1 → N</i>
    <article class="entity room"><span>3</span><h2>Phòng</h2><p>Trạng thái, giá và khả năng cho thuê</p></article>
    <article class="entity area"><span>⌖</span><h2>Khu nhà quản lý</h2><p>Nhóm một hoặc nhiều tòa để lọc, phân công và báo cáo</p></article><div class="area-link"></div>
  </div><div class="model-rules"><div><b>Chủ nhà không gắn Khu nhà trực tiếp</b><span>Khu vực của chủ nhà được suy ra qua các tòa đang liên kết.</span></div><div><b>Liên kết hai chiều phải đồng nhất</b><span>Tòa đổi chủ phải gỡ liên kết chủ cũ trước khi gắn chủ mới.</span></div><div><b>Không tự chuyển chủ</b><span>Tòa đã thuộc chủ khác bị khóa trong onboarding.</span></div></div>`, { eyebrow: 'F00 · MÔ HÌNH DỮ LIỆU', status: 'CHỦ NHÀ → TÒA → PHÒNG' }));

  slides.push(slideShell(9, 'Onboarding trong một quy trình', 'Không cần tạo rời rạc từng danh mục rồi quay lại liên kết.', `<div class="wizard-flow">
    ${[['1','Chủ nhà','Tên, liên hệ, mã số thuế'],['2','HĐ & Tòa nhà','Điều khoản đầu vào, Khu nhà, địa chỉ'],['3','Phòng','Sinh lưới tầng × số phòng'],['4','Xác nhận','Kiểm tra và lưu một lần']].map(([n,t,d], i) => `<article><span>${n}</span><h2>${t}</h2><p>${d}</p>${i < 3 ? '<i>→</i>' : ''}</article>`).join('')}
  </div><div class="wizard-benefits"><div><b>Không phát sinh dữ liệu rác</b><p>Khu nhà thêm nhanh và tòa mới chỉ được ghi thật khi hoàn tất.</p></div><div><b>Ràng buộc nghiệp vụ sớm</b><p>Kiểm tra chủ sở hữu, HĐ đầu vào và thông tin bắt buộc trước khi tạo phòng.</p></div><div><b>Sẵn sàng cho thuê</b><p>Hoàn tất một lần với chủ nhà, tòa, 20 phòng và lịch trả chủ nhà.</p></div></div>`, { eyebrow: 'F00 · ONBOARDING', status: '4 BƯỚC' }));

  slides.push(workflowSlide(10, 'Khai báo chủ nhà, tòa và Khu nhà', 'Wizard giữ toàn bộ dữ liệu nháp đến bước xác nhận cuối.', [{ file: 'F00.1-result.png', caption: 'Bước 3 – sinh phòng theo tòa vừa khai báo' }], {
    goal: 'Tạo đầy đủ chuỗi Chủ nhà → HĐ đầu vào → Tòa → Phòng', role: 'Quản trị viên', route: '#/landlords/new', input: 'Nguyễn Demo Chủ Nhà · 0909 000 111 · Tòa Demo Onboard · Khu Cầu Giấy · 5 tầng × 4 phòng', action: 'Nhập chủ nhà; thêm nhanh Khu nhà; khai báo tòa, HĐ đầu vào và cấu hình sinh phòng', outcome: 'Hiển thị lưới 20 phòng, tòa thuộc đúng chủ nhà và Khu nhà quản lý',
  }, { eyebrow: 'F00.1 · ONBOARDING', callout: 'Khu nhà thêm nhanh được tự chọn cho tòa hiện tại và dùng lại cho các tòa khác.' }));

  slides.push(workflowSlide(11, 'Kết quả sau onboarding', 'Từ một lần lưu hình thành hồ sơ chủ nhà, tòa, phòng và lịch thanh toán đầu vào.', [
    { file: 'F00.2-result.png', caption: 'Tòa liên kết trong hồ sơ chủ nhà' },
    { file: 'F00.3-result.png', caption: 'Lịch trả chủ nhà sinh theo chu kỳ 3 tháng' },
  ], {
    goal: 'Xác nhận quan hệ và nghĩa vụ với chủ nhà đã được tạo đúng', role: 'Quản trị viên', route: '#/landlords/:id', input: 'Giá thuê 90.000.000đ/tháng · cọc 180.000.000đ · chu kỳ trả 3 tháng', action: 'Hoàn tất onboarding rồi kiểm tra tab Tòa nhà và Hợp đồng đầu vào', outcome: '1 tòa · 20 phòng · 12 kỳ thanh toán, mỗi kỳ 270.000.000đ',
  }, { eyebrow: 'F00.2–F00.4 · KẾT QUẢ', callout: 'Phòng chỉ được cho thuê khi tòa có hợp đồng đầu vào hiệu lực.' }));

  slides.push(workflowSlide(12, 'Kho phòng và vòng đời trạng thái', 'Mỗi trạng thái quyết định thao tác tiếp theo có thể thực hiện.', [{ file: 'S0.4-result.png', caption: 'Danh sách phòng đang Sẵn sàng cho thuê' }], {
    goal: 'Theo dõi khả năng khai thác từng phòng', role: 'Vận hành', route: '#/rooms', input: 'Bộ lọc trạng thái, tòa nhà, tầng hoặc mã phòng', action: 'Chọn tab Sẵn sàng và mở thao tác trên phòng phù hợp', outcome: 'Phòng Sẵn sàng có thể Giữ chỗ/Tạo hợp đồng; trạng thái thay đổi theo vòng đời thuê',
  }, { eyebrow: 'S0.4 · PHÒNG', callout: 'Sẵn sàng → Giữ chỗ → Đang thuê → Chờ dọn → Sẵn sàng; Bảo trì/Ngừng là nhánh kiểm soát riêng.' }));

  slides.push(workflowSlide(13, 'Tạo hồ sơ khách thuê', 'Thông tin liên hệ và định danh được quản lý tập trung trước khi lập hợp đồng.', [{ file: 'F01.1-result.png', caption: 'Drawer Thêm khách thuê với các trường nghiệp vụ' }], {
    goal: 'Tạo hồ sơ khách để tái sử dụng trong hợp đồng và công nợ', role: 'Vận hành', route: '#/tenants', input: 'Họ tên, SĐT, Zalo, email, CCCD, nghề nghiệp và phân khúc', action: 'Bấm Thêm khách thuê, nhập các trường bắt buộc và lưu', outcome: 'Khách có mã KH… và trạng thái Khách mới',
  }, { eyebrow: 'F01.1 · KHÁCH THUÊ' }));

  slides.push(workflowSlide(14, 'Dữ liệu mẫu khách thuê', 'Một bộ dữ liệu xuyên suốt toàn bộ câu chuyện demo.', [
    { file: 'F01.2-input.png', caption: 'Thông tin được nhập trên form' },
    { file: 'F01.2-result.png', caption: 'Khách mới xuất hiện trong danh sách' },
  ], {
    goal: 'Kiểm tra dữ liệu nhập và kết quả sau khi lưu', role: 'Vận hành', route: '#/tenants', input: 'Nguyễn Demo Khách · 0912 000 111 · demo.khach@gmail.com · CCCD 012345678999', action: 'Điền form và bấm Lưu khách thuê', outcome: 'Hồ sơ được tạo, có thể chọn ngay khi lập hợp đồng',
  }, { eyebrow: 'F01.2 · KHÁCH THUÊ' }));

  slides.push(workflowSlide(15, 'Chọn phòng và bắt đầu hợp đồng', 'Luồng tạo hợp đồng đi từ chính phòng Sẵn sàng để hạn chế chọn sai.', [
    { file: 'F02.1-input.png', caption: 'Chọn thao tác Tạo hợp đồng tại phòng' },
    { file: 'F02.1-result.png', caption: 'Form được nạp sẵn phòng và giá tham chiếu' },
  ], {
    goal: 'Gắn đúng khách, phòng và điều kiện cho thuê', role: 'Vận hành', route: '#/rooms → #/contracts/new', input: 'Phòng A.01.03 đang Sẵn sàng', action: 'Bấm Tạo hợp đồng tại dòng phòng', outcome: 'Wizard hợp đồng nạp sẵn phòng, giá và dịch vụ mặc định',
  }, { eyebrow: 'F02.1 · HỢP ĐỒNG' }));

  slides.push(workflowSlide(16, 'Thiết lập thời hạn và chu kỳ thu', 'Các điều kiện thời gian được kiểm tra trước khi chuyển sang giá và dịch vụ.', [{ file: 'F02.2-result.png', caption: 'Hợp đồng với checklist kiểm tra dữ liệu' }], {
    goal: 'Khóa thời gian thuê và lịch thu tiền', role: 'Vận hành', route: '#/contracts/new', input: 'Nguyễn Demo Khách · 01/10/2026–30/09/2027 · ngày thanh toán 05', action: 'Chọn khách, giữ phòng, nhập thời hạn và ngày thu', outcome: 'Checklist xác nhận đủ khách, phòng, thời hạn và điều kiện giá',
  }, { eyebrow: 'F02.2 · HỢP ĐỒNG' }));

  slides.push(workflowSlide(17, 'Giá thuê, cọc, dịch vụ và kích hoạt', 'Hợp đồng chỉ chuyển Hiệu lực sau bước review và xác nhận.', [
    { file: 'F02.3-result.png', caption: 'Giá thuê, cọc và dịch vụ đi kèm' },
    { file: 'F02.4-result.png', caption: 'Hợp đồng Hiệu lực và phòng Đang thuê' },
  ], {
    goal: 'Hoàn tất điều khoản tài chính và đưa phòng vào trạng thái thuê', role: 'Vận hành', route: '#/contracts/:id', input: 'Giá 6.500.000đ · cọc 13.000.000đ · Internet, phí quản lý, gửi xe', action: 'Lưu dự thảo, review, ghi nhận thu cọc và kích hoạt', outcome: 'HĐ Hiệu lực; phòng Đang thuê; phiếu thu cọc được tạo',
  }, { eyebrow: 'F02.3–F02.4 · HỢP ĐỒNG' }));

  slides.push(slideShell(18, 'Chu kỳ lập hóa đơn hằng tháng', 'Kế toán kiểm tra dữ liệu trước khi phát sinh chứng từ.', `<div class="billing-flow">
    ${[['1','Chọn kỳ & phạm vi','Tòa, phòng, dịch vụ'],['2','Nhập chỉ số','Điện và nước'],['3','Preflight','Hợp lệ, cảnh báo, dự thu'],['4','Tạo nháp','Kiểm tra chứng từ'],['5','Phát hành','Ghi nhận phải thu']].map(([n,t,d], i) => `<article><span>${n}</span><h2>${t}</h2><p>${d}</p>${i < 4 ? '<i>→</i>' : ''}</article>`).join('')}
  </div><div class="billing-rules"><div><b>Không dùng trùng chỉ số</b><p>Đối chiếu kỳ trước và cảnh báo dữ liệu bất thường.</p></div><div><b>Nháp trước, phát hành sau</b><p>Có cơ hội kiểm tra tiền phòng, dịch vụ và điện nước.</p></div><div><b>Công nợ sinh từ chứng từ</b><p>Chỉ hóa đơn đã phát hành mới trở thành khoản phải thu.</p></div></div>`, { eyebrow: 'F03 · CHU KỲ HÓA ĐƠN', status: 'KỲ 10/2026' }));

  slides.push(workflowSlide(19, 'Chọn kỳ, tòa và dịch vụ tính tiền', 'Wizard lọc đúng hợp đồng hiệu lực trong phạm vi đã chọn.', [{ file: 'F03.1-result.png', caption: 'Bước 1 – chọn kỳ và phạm vi lập hóa đơn' }], {
    goal: 'Xác định đúng phạm vi tạo hóa đơn hàng loạt', role: 'Kế toán', route: '#/invoices/batch', input: 'Kỳ 10/2026 · tòa có phòng demo · Tiền phòng, Điện, Nước, Dịch vụ cố định', action: 'Chọn kỳ, tòa, phòng demo và bộ dịch vụ áp dụng', outcome: 'Wizard tìm đúng hợp đồng hiệu lực và báo dữ liệu còn thiếu',
  }, { eyebrow: 'F03.1 · HÓA ĐƠN' }));

  slides.push(workflowSlide(20, 'Nhập chỉ số điện nước', 'Sản lượng được tự tính từ chỉ số cũ và mới.', [{ file: 'F03.2-result.png', caption: 'Điện +150 kWh, nước +12 m³ đã lưu tạm' }], {
    goal: 'Ghi nhận mức sử dụng của kỳ trước khi tính tiền', role: 'Kế toán', route: '#/invoices/batch?step=2', input: 'Điện mới = điện cũ +150 · Nước mới = nước cũ +12', action: 'Nhập chỉ số mới và bấm Lưu tạm', outcome: 'Sản lượng tự tính; phòng hết cảnh báo thiếu chỉ số',
  }, { eyebrow: 'F03.2 · ĐIỆN NƯỚC' }));

  slides.push(workflowSlide(21, 'Preflight và tạo hóa đơn nháp', 'Kiểm tra hợp lệ trước khi tạo hàng loạt giúp hạn chế sửa chứng từ.', [
    { file: 'F03.3-input.png', caption: 'Preflight: phòng hợp lệ, cảnh báo và dự thu' },
    { file: 'F03.3-result.png', caption: 'Kết quả tạo hóa đơn nháp' },
  ], {
    goal: 'Phát hiện dữ liệu thiếu hoặc trùng trước khi lập hóa đơn', role: 'Kế toán', route: '#/invoices/batch?step=3–4', input: 'Phòng demo đã có chỉ số và dịch vụ hợp lệ', action: 'Tiếp tục preflight rồi bấm Tạo hóa đơn nháp', outcome: 'Sinh mã HD-202610-… ở trạng thái Nháp',
  }, { eyebrow: 'F03.3 · HÓA ĐƠN' }));

  slides.push(workflowSlide(22, 'Phát hành hóa đơn', 'Bước phát hành khóa chứng từ và hình thành công nợ phải thu.', [
    { file: 'F03.4-input.png', caption: 'Chi tiết hóa đơn Nháp trước phát hành' },
    { file: 'F03.4-result.png', caption: 'Hóa đơn Đã phát hành, trạng thái Chưa thu' },
  ], {
    goal: 'Xác nhận số tiền chính thức phải thu trong kỳ', role: 'Kế toán', route: '#/invoices/:id', input: 'Hóa đơn HD-202610-… vừa tạo', action: 'Kiểm tra chi tiết, bấm Phát hành và xác nhận', outcome: 'Hóa đơn Đã phát hành; công nợ chuyển Chưa thu',
  }, { eyebrow: 'F03.4 · HÓA ĐƠN' }));

  slides.push(workflowSlide(23, 'Gửi hóa đơn qua Zalo', 'Danh sách người nhận và số dư được kiểm tra trước khi tạo đợt gửi.', [
    { file: 'F04.1-result.png', caption: 'Preview người nhận và nội dung nhắc tiền' },
    { file: 'F04.3-result.png', caption: 'Theo dõi trạng thái giao nhận của đợt gửi' },
  ], {
    goal: 'Thông báo hóa đơn có kiểm soát và truy vết được', role: 'Quản trị viên', route: '#/invoices/:id → #/zalo/history', input: 'Hóa đơn vừa phát hành · Zalo 0912 000 111', action: 'Mở preview, xác nhận gửi và theo dõi kết quả', outcome: 'Đợt ZL-… có trạng thái từng người nhận và lịch sử gửi',
  }, { eyebrow: 'F04 · ZALO', status: 'MÔ PHỎNG', callout: 'Luồng gửi/retry đang mô phỏng; production phụ thuộc tài khoản Zalo OA/ZNS và API thực tế.' }));

  slides.push(workflowSlide(24, 'Theo dõi công nợ', 'Một dòng công nợ cho biết tổng phải thu, đã thu, còn lại và lịch sử nhắc.', [{ file: 'F05.1-result.png', caption: 'Công nợ của phòng demo trước khi thu tiền' }], {
    goal: 'Xác định chính xác số tiền còn phải thu', role: 'Kế toán', route: '#/receivables', input: 'Tìm theo phòng A.01.03 hoặc mã hóa đơn', action: 'Mở Thu tiền & công nợ và lọc đúng khách/phòng', outcome: 'Hiển thị tổng hóa đơn, đã thu 0 và toàn bộ số dư còn lại',
  }, { eyebrow: 'F05.1 · CÔNG NỢ' }));

  slides.push(workflowSlide(25, 'Ghi nhận thu tiền một phần', 'Khoản thu được phân bổ vào hóa đơn và cập nhật số còn nợ ngay lập tức.', [
    { file: 'F05.2-input.png', caption: 'Drawer ghi nhận khoản thu và phân bổ' },
    { file: 'F05.2-result.png', caption: 'Kết quả khoản thu PAY…' },
  ], {
    goal: 'Phản ánh đúng tiền thực nhận và số dư sau thu', role: 'Kế toán', route: '#/receivables → #/payments/:id', input: '3.000.000đ · Chuyển khoản · CK289104 · thanh toán một phần', action: 'Nhập khoản thu, tự động phân bổ và xác nhận', outcome: 'Tạo PAY…; hóa đơn chuyển Thu một phần; số dư giảm 3.000.000đ',
  }, { eyebrow: 'F05.2–F05.4 · THU TIỀN' }));

  slides.push(workflowSlide(26, 'Nhắc công nợ và xử lý tin lỗi', 'Số dư được đọc lại tại thời điểm gửi, không dùng số tiền cũ.', [
    { file: 'F06.1-result.png', caption: 'Preview nhắc nợ với số dư mới' },
    { file: 'F06.3-result.png', caption: 'Retry riêng các tin failed/unknown' },
  ], {
    goal: 'Nhắc đúng số còn nợ và kiểm soát trường hợp gửi lỗi', role: 'Quản trị viên', route: '#/receivables → #/zalo/history', input: 'Hóa đơn còn nợ sau khoản thu 3.000.000đ', action: 'Chọn dòng công nợ, preview, gửi và retry tin đủ điều kiện', outcome: 'Tin chứa số dư hiện tại; tin đã giao giữ nguyên, tin lỗi có lần thử mới',
  }, { eyebrow: 'F06 · NHẮC NỢ', status: 'MÔ PHỎNG' }));

  slides.push(workflowSlide(27, 'Kết thúc hợp đồng', 'Hợp đồng kết thúc tạo hồ sơ hoàn cọc và chuyển phòng sang Chờ dọn.', [
    { file: 'F07.2-input.png', caption: 'Modal ghi nhận kết thúc hợp đồng' },
    { file: 'F07.2-result.png', caption: 'Hợp đồng Đã kết thúc và hồ sơ hoàn cọc' },
  ], {
    goal: 'Khởi tạo quy trình trả phòng có kiểm soát', role: 'Vận hành', route: '#/contracts/:id', input: 'Ngày 28/10/2026 · lý do Khách trả phòng sớm', action: 'Bấm Kết thúc hợp đồng, giữ tùy chọn tạo hồ sơ hoàn cọc và xác nhận', outcome: 'HĐ Đã kết thúc; phòng Chờ dọn; hồ sơ RC… Nháp được tạo',
  }, { eyebrow: 'F07 · TRẢ PHÒNG' }));

  slides.push(workflowSlide(28, 'Lập phương án hoàn cọc', 'Các khoản khấu trừ có bằng chứng và được review trước khi gửi duyệt.', [{ file: 'F08.1-result.png', caption: 'Tóm tắt tiền cọc, công nợ, khấu trừ và số hoàn' }], {
    goal: 'Tính minh bạch số tiền cần hoàn cho khách', role: 'Vận hành', route: '#/refunds/new', input: 'Cọc 13.000.000đ · khấu hao 200.000đ · vệ sinh 200.000đ · không bù trừ nợ', action: 'Thêm khấu trừ, đính kèm bằng chứng, kiểm tra và gửi duyệt', outcome: 'Tổng khấu trừ 400.000đ; số dự kiến hoàn 12.600.000đ',
  }, { eyebrow: 'F08.1–F08.2 · HOÀN CỌC', callout: 'OI-07 cần khách hàng xác nhận: mockup mặc định không tự bù trừ công nợ vào tiền cọc.' }));

  slides.push(workflowSlide(29, 'Duyệt, hoàn tiền và đưa phòng về Sẵn sàng', 'Tách rõ “đã duyệt” với “đã chuyển tiền”, sau đó hoàn tất dọn phòng.', [
    { file: 'F08.3-result.png', caption: 'Kế toán duyệt hồ sơ hoàn cọc' },
    { file: 'F08.4-result.png', caption: 'Ghi nhận đã hoàn kèm chứng từ' },
    { file: 'F09.2-result.png', caption: 'Phòng trở lại trạng thái Sẵn sàng' },
  ], {
    goal: 'Khép kín vòng đời thuê và sẵn sàng khai thác lại phòng', role: 'Kế toán → Vận hành', route: '#/refunds/:id → #/rooms', input: 'UNC289104 · ngày 28/10/2026 · bằng chứng chuyển khoản', action: 'Duyệt hồ sơ, xác nhận đã hoàn, sau đó xác nhận dọn xong', outcome: 'Hồ sơ Đã hoàn; phòng rời Chờ dọn và trở lại Sẵn sàng',
  }, { eyebrow: 'F08.3–F09.2 · KHÉP VÒNG ĐỜI' }));

  slides.push(workflowSlide(30, 'Các chức năng hỗ trợ Phase 1', 'Bổ sung dữ liệu, kiểm soát truy cập và báo cáo vận hành.', [
    { file: 'F10.1-result.png', caption: 'Chi phí vận hành và phân bổ' },
    { file: 'F10.2-result.png', caption: 'Import có kiểm tra dòng hợp lệ/lỗi' },
    { file: 'F10.3-result.png', caption: 'Tài khoản và phạm vi tòa' },
    { file: 'F10.4-result.png', caption: 'Báo cáo công nợ theo kỳ' },
  ], {
    goal: 'Hỗ trợ vận hành thực tế ngoài luồng thuê chính', role: 'Admin · Kế toán', route: '#/expenses · #/settings/users · #/reports', input: 'Chi phí 350.000đ · file import mẫu 10 dòng · tài khoản Vận hành · kỳ 10/2026', action: 'Ghi chi phí, import có preview, phân quyền theo tòa và xuất báo cáo', outcome: 'Dữ liệu được kiểm tra, phân quyền và truy xuất theo kỳ',
  }, { eyebrow: 'F10 · CHỨC NĂNG BỔ TRỢ' }));

  slides.push(slideShell(31, 'Phụ lục · Tuyến demo đề xuất', 'Kịch bản 25–30 phút, ưu tiên các điểm cần khách hàng xác nhận.', `<div class="runbook">
    ${[['00–03’','Bối cảnh & roadmap','Trang 1–6','Chốt mục tiêu buổi trao đổi'],['03–08’','Chủ nhà → Tòa → Phòng','Trang 7–12','Nhấn mạnh Khu nhà và HĐ đầu vào'],['08–13’','Khách thuê & Hợp đồng','Trang 13–17','Chốt trường nhập và quy tắc kích hoạt'],['13–18’','Điện nước & Hóa đơn','Trang 18–22','Chốt kỳ, giá và kiểm soát dữ liệu'],['18–22’','Thu tiền & Zalo','Trang 23–26','Phân biệt mô phỏng và tích hợp thật'],['22–27’','Trả phòng & Hoàn cọc','Trang 27–29','Chốt bù trừ nợ và thẩm quyền duyệt'],['27–30’','Bổ trợ & thảo luận','Trang 30–35','Ghi nhận yêu cầu và bước tiếp theo']].map((r) => `<div class="run-row"><b>${r[0]}</b><strong>${r[1]}</strong><span>${r[2]}</span><p>${r[3]}</p></div>`).join('')}
  </div>`, { eyebrow: 'PHỤ LỤC · NGƯỜI DEMO', status: '25–30 PHÚT', footer: 'TIMEHOUSE · DEMO RUNBOOK' }));

  slides.push(slideShell(32, 'Phụ lục · Bộ dữ liệu demo', 'Dùng thống nhất để khách hàng dễ đối chiếu giữa các màn hình.', `<div class="data-table">
    <div class="data-row head"><span>Nhóm</span><span>Dữ liệu mẫu</span><span>Điểm cần quan sát</span></div>
    <div class="data-row"><b>Chủ nhà</b><span>Nguyễn Demo Chủ Nhà · 0909 000 111</span><span>1 tòa liên kết</span></div>
    <div class="data-row"><b>Tòa & Khu nhà</b><span>Tòa Demo Onboard · Khu Cầu Giấy</span><span>5 tầng × 4 phòng</span></div>
    <div class="data-row"><b>HĐ đầu vào</b><span>90.000.000đ/tháng · cọc 180.000.000đ</span><span>Chu kỳ 3 tháng · 12 kỳ trả</span></div>
    <div class="data-row"><b>Khách thuê</b><span>Nguyễn Demo Khách · 0912 000 111</span><span>CCCD 012345678999</span></div>
    <div class="data-row"><b>Hợp đồng thuê</b><span>01/10/2026–30/09/2027 · ngày thu 05</span><span>Giá 6.500.000đ · cọc 13.000.000đ</span></div>
    <div class="data-row"><b>Điện nước</b><span>Điện +150 kWh · Nước +12 m³</span><span>Kỳ 10/2026</span></div>
    <div class="data-row"><b>Khoản thu</b><span>3.000.000đ · CK289104</span><span>Thu một phần</span></div>
    <div class="data-row"><b>Hoàn cọc</b><span>Khấu trừ 400.000đ · UNC289104</span><span>Dự kiến hoàn 12.600.000đ</span></div>
  </div>`, { eyebrow: 'PHỤ LỤC · DỮ LIỆU MẪU', status: 'DEMO DATA', footer: 'TIMEHOUSE · DEMO RUNBOOK' }));

  slides.push(slideShell(33, 'Phụ lục · Checklist trước khi demo', 'Chuẩn bị trong 5 phút để tuyến thao tác không bị gián đoạn.', `<div class="checklist">
    ${[['01','Mở mockup ở Chrome 1440×1080, zoom 100%'],['02','Reset dữ liệu và xác nhận phạm vi chỉ bật Phase 1'],['03','Đăng nhập Admin; kiểm tra chuyển vai trò Vận hành/Kế toán'],['04','Đặt ngày nghiệp vụ 28/10/2026 và kỳ 10/2026'],['05','Kiểm tra phòng A.01.03 đang Sẵn sàng trước khi tạo HĐ'],['06','Giữ sẵn PDF này và đánh dấu các trang cần trao đổi'],['07','Nhắc rõ Zalo, ngân hàng và file chứng từ đang mô phỏng'],['08','Chuẩn bị nơi ghi nhận quyết định, người phụ trách và deadline']].map(([n,t]) => `<div class="check"><span>${n}</span><b>${t}</b><i>□</i></div>`).join('')}
  </div><div class="red-note"><b>Không dùng dữ liệu thật trong buổi demo.</b> Tất cả tên, số điện thoại, CCCD và mã giao dịch trong tài liệu là dữ liệu minh họa.</div>`, { eyebrow: 'PHỤ LỤC · CHUẨN BỊ', status: 'PRE-DEMO', footer: 'TIMEHOUSE · DEMO RUNBOOK' }));

  slides.push(slideShell(34, 'Phụ lục · Các điểm cần khách hàng xác nhận', 'Tập trung vào quyết định nghiệp vụ thay vì màu sắc hoặc dữ liệu minh họa.', `<div class="decision-grid">
    <article><span>01</span><h2>Chủ nhà & HĐ đầu vào</h2><p>HĐ có bắt buộc với mọi tòa? Chu kỳ trả và giữ giá tính thế nào?</p></article>
    <article><span>02</span><h2>Khu nhà quản lý</h2><p>Danh mục Khu nhà dùng cho phân công, lọc và báo cáo ở cấp nào?</p></article>
    <article><span>03</span><h2>Hóa đơn & chỉ số</h2><p>Ngày chốt, cách làm tròn, giá bậc thang và xử lý chỉ số bất thường?</p></article>
    <article><span>04</span><h2>Thu tiền & công nợ</h2><p>Nguyên tắc phân bổ khi một khoản thu trả cho nhiều hóa đơn?</p></article>
    <article><span>05</span><h2>Hoàn cọc</h2><p>Có tự bù trừ công nợ? Ai duyệt và ngưỡng tiền có nhiều cấp?</p></article>
    <article><span>06</span><h2>Tích hợp thật</h2><p>Zalo OA/ZNS, ngân hàng, cổng thanh toán và SLA do bên nào cung cấp?</p></article>
  </div>`, { eyebrow: 'PHỤ LỤC · DECISION LOG', status: 'CẦN CHỐT', footer: 'TIMEHOUSE · DEMO RUNBOOK' }));

  slides.push(`<section class="slide closing" data-slide="35">
    <div class="closing-mark">35</div><div class="closing-content"><span>THẢO LUẬN & BƯỚC TIẾP THEO</span><h1>Workflow đã đúng với cách<br>doanh nghiệp đang vận hành?</h1><p>Ghi nhận khác biệt, khóa quy tắc nghiệp vụ và thống nhất tiêu chí nghiệm thu Phase 1.</p>
    <div class="next-steps"><div><b>1</b><span>Chốt luồng và trường dữ liệu</span></div><div><b>2</b><span>Xác nhận tích hợp và phân quyền</span></div><div><b>3</b><span>Lập backlog production & UAT</span></div></div>
    <div class="closing-questions"><strong>Câu hỏi mở</strong><span>Điểm nào cần thay đổi?</span><span>Ai là người phê duyệt?</span><span>Dữ liệu thật được cung cấp khi nào?</span></div></div>
    <div class="closing-brand"><img src="${logo}" alt="TimeHouse"><b>TimeHouse</b><small>Quản lý nhà cho thuê</small></div>${footer(35, 'TIMEHOUSE · CUSTOMER DEMO')}</section>`);

  if (slides.length !== EXPECTED_SLIDES) throw new Error(`Số slide sai: ${slides.length}/${EXPECTED_SLIDES}`);
  return slides;
}

function stylesheet() {
  return `
    @page { size: 13.333333in 7.5in; margin: 0; }
    * { box-sizing: border-box; }
    :root { --navy:#102e5e; --blue:#2864ed; --sky:#eaf2ff; --ink:#0d1b36; --muted:#64748b; --line:#dbe4f0; --green:#10a55a; --amber:#e79710; --red:#dc3848; --paper:#f4f7fb; }
    html, body { margin:0; padding:0; background:#cbd5e1; font-family:"Segoe UI",Arial,sans-serif; color:var(--ink); -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    body { width:1440px; }
    .slide { width:1440px; height:810px; position:relative; overflow:hidden; background:#f7f9fc; page-break-after:always; break-after:page; padding:28px 50px 46px; }
    .slide:last-child { page-break-after:auto; break-after:auto; }
    .slide::before { content:""; position:absolute; inset:0 0 auto 0; height:6px; background:linear-gradient(90deg,var(--navy),var(--blue) 65%,#63a7ff); }
    .topline { height:28px; display:flex; align-items:center; justify-content:space-between; color:#45617f; font-size:12px; font-weight:800; letter-spacing:.12em; }
    .status { padding:6px 10px; border-radius:999px; background:#e6efff; color:#2157c8; letter-spacing:.06em; }
    .slide-head { height:88px; padding-top:8px; }
    .slide-head h1 { margin:0; font-size:34px; line-height:1.08; letter-spacing:-.03em; }
    .slide-head p { margin:8px 0 0; font-size:17px; color:var(--muted); }
    main { height:594px; }
    footer { position:absolute; left:50px; right:50px; bottom:12px; height:24px; display:flex; align-items:center; gap:22px; border-top:1px solid var(--line); color:#738198; font-size:11px; letter-spacing:.04em; padding-top:8px; }
    footer span:nth-child(2) { margin-left:auto; }
    footer b { width:30px; height:23px; border-radius:7px; display:grid; place-items:center; color:white; background:var(--navy); }
    h2,p { margin-top:0; }
    .pill { display:inline-flex; padding:7px 10px; border-radius:999px; font-size:12px; font-weight:700; margin:8px 6px 0 0; background:#e9f1ff; color:#2157c8; }
    .pill.green { background:#e7f8ef; color:#0e8550; }.pill.amber { background:#fff3d6; color:#a76300; }
    .workflow-layout { height:100%; min-width:0; display:grid; grid-template-columns:minmax(0,1fr) 390px; gap:24px; }
    .visual-stage { min-width:0; min-height:0; height:100%; position:relative; border-radius:18px; background:#e9eef5; border:1px solid #d9e2ef; padding:12px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
    .screen { margin:0; min-width:0; min-height:0; width:100%; height:100%; position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:12px; background:white; box-shadow:0 12px 35px rgba(23,43,77,.12); }
    .screen img { display:block; min-width:0; min-height:0; width:100%; height:100%; object-fit:contain; background:#eef2f7; }
    .screen figcaption { position:absolute; left:10px; bottom:10px; max-width:calc(100% - 20px); padding:7px 10px; border-radius:8px; color:white; background:rgba(9,26,55,.85); font-size:11px; font-weight:650; }
    .screen-grid { min-width:0; min-height:0; width:100%; height:100%; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:10px; }
    .screen-grid.quad { grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; }
    .visual-callout { position:absolute; right:22px; top:22px; max-width:360px; background:#0d2855; color:white; padding:11px 14px; border-radius:10px; font-size:12px; line-height:1.4; box-shadow:0 8px 20px rgba(13,40,85,.25); }
    .workflow-facts { height:100%; display:flex; flex-direction:column; gap:9px; }
    .fact { border:1px solid var(--line); background:white; border-radius:13px; padding:12px 14px; }
    .fact span { display:block; margin-bottom:5px; color:#6a7a91; font-size:10px; letter-spacing:.1em; font-weight:800; text-transform:uppercase; }
    .fact strong,.fact p,.fact code { font-size:14px; line-height:1.35; }
    .fact p { margin:0; color:#34445c; }
    .fact code { font-family:"Segoe UI",Arial,sans-serif; color:#2057c8; font-weight:700; word-break:break-word; }
    .fact-row { display:grid; grid-template-columns:1fr 1.35fr; gap:9px; }
    .fact.outcome { background:#ebfaf1; border-color:#bdebd0; }
    .fact.outcome p { color:#087340; font-weight:700; }
    .speaker-note { padding:10px 12px; border-left:4px solid var(--amber); background:#fff7e4; color:#74501a; font-size:11px; line-height:1.4; border-radius:8px; }
    .cover { background:linear-gradient(135deg,#0a2550 0%,#123b79 62%,#1f62c5 100%); color:white; padding:54px 64px; }
    .cover::before { display:none; }.cover footer { border-color:rgba(255,255,255,.2); color:#c8d8f2; left:64px; right:64px; }
    .cover-brand { height:42px; display:flex; align-items:center; gap:12px; font-size:18px; font-weight:800; letter-spacing:.08em; }.cover-brand img { width:38px; height:38px; filter:brightness(0) invert(1); }
    .cover-copy { position:absolute; left:64px; top:165px; width:610px; z-index:2; }.cover-kicker { font-size:13px; font-weight:800; letter-spacing:.18em; color:#9ac5ff; }.cover-copy h1 { margin:19px 0; font-size:62px; line-height:1.03; letter-spacing:-.045em; }.cover-copy p { font-size:20px; line-height:1.5; color:#dbeafe; width:570px; }.cover-meta { margin-top:46px; padding-top:16px; border-top:1px solid rgba(255,255,255,.25); color:#aac7ed; font-size:13px; }
    .cover-preview { position:absolute; width:610px; height:470px; right:35px; top:145px; border:10px solid rgba(255,255,255,.14); border-radius:24px; overflow:hidden; box-shadow:0 30px 80px rgba(0,0,0,.35); }.cover-preview img { display:block; width:100%; height:100%; object-fit:cover; object-position:left top; }.preview-badge { position:absolute; left:25px; bottom:25px; padding:12px 16px; border-radius:12px; background:#0da664; color:white; font-weight:800; }
    .cover-orb { position:absolute; border-radius:50%; filter:blur(1px); opacity:.14; background:#78b3ff; }.cover-orb.one { width:300px; height:300px; right:280px; top:15px; }.cover-orb.two { width:220px; height:220px; left:0; bottom:0; }
    .goals { display:grid; grid-template-columns:1fr 1fr; gap:18px; height:460px; }.goals article { background:white; border:1px solid var(--line); border-radius:18px; padding:26px; position:relative; }.goals b { position:absolute; right:20px; top:18px; color:#d9e6fa; font-size:42px; }.goals h2 { font-size:22px; margin:22px 0 9px; }.goals p { color:#53647b; font-size:15px; line-height:1.5; width:82%; }.goals article::before { content:""; position:absolute; top:24px; left:26px; width:34px; height:5px; border-radius:5px; background:var(--blue); }
    .demo-story { margin-top:18px; height:80px; display:flex; align-items:center; justify-content:center; gap:14px; background:var(--navy); color:white; border-radius:18px; }.demo-story strong { color:#91bcff; margin-right:10px; }.demo-story span { font-weight:700; }.demo-story i { color:#6c9fe9; font-style:normal; }
    .roadmap { display:grid; grid-template-columns:1fr 50px 1fr 50px 1fr; height:500px; align-items:center; }.phase { height:430px; background:white; border:1px solid var(--line); border-radius:20px; padding:28px; position:relative; }.phase.active { color:white; background:linear-gradient(150deg,#10346b,#2467e8); border:none; box-shadow:0 20px 45px rgba(32,88,194,.26); }.phase-no { font-size:66px; font-weight:900; color:#e3ebf7; line-height:1; }.phase.active .phase-no { color:rgba(255,255,255,.18); }.phase > span { display:inline-block; margin:18px 0 12px; padding:6px 9px; border-radius:7px; font-size:10px; letter-spacing:.12em; font-weight:800; color:#4e6380; background:#edf2f8; }.phase.active > span { color:#d8e8ff; background:rgba(255,255,255,.13); }.phase h2 { font-size:24px; min-height:58px; }.phase p,.phase li { font-size:14px; line-height:1.45; color:#586a82; }.phase.active p,.phase.active li { color:#d9e8ff; }.phase ul { padding-left:18px; }.road-arrow { font-size:34px; color:#9fb0c5; text-align:center; }.scope-warning { height:62px; border-radius:14px; display:flex; align-items:center; justify-content:center; background:#fff5dd; color:#81570d; font-size:14px; font-weight:700; }
    .value-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }.info-card { height:160px; border-radius:18px; background:white; border:1px solid var(--line); padding:26px 22px; }.info-card span { display:block; color:#687b94; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; }.info-card strong { display:block; margin-top:22px; font-size:21px; line-height:1.35; }.info-card.blue { border-top:5px solid var(--blue); }.info-card.green { border-top:5px solid var(--green); }.info-card.amber { border-top:5px solid var(--amber); }.info-card.violet { border-top:5px solid #8b5cf6; }
    .outcome-band { height:180px; margin-top:22px; padding:26px 30px; display:flex; align-items:center; justify-content:space-between; gap:22px; color:white; background:var(--navy); border-radius:20px; }.outcome-band div { flex:1; }.outcome-band span { display:block; color:#92b8ef; font-size:11px; font-weight:800; letter-spacing:.12em; margin-bottom:12px; }.outcome-band strong { font-size:18px; line-height:1.4; }.outcome-band i { color:#6e9fdf; font-size:30px; font-style:normal; }.disclaimer { margin-top:20px; padding:18px 22px; border-radius:14px; background:#fff4d8; color:#70501a; font-size:14px; }
    .journey { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; height:380px; align-items:center; }.journey article { height:275px; position:relative; padding:26px 18px; text-align:center; background:white; border:1px solid var(--line); border-radius:20px; }.journey article span { display:grid; width:55px; height:55px; border-radius:50%; place-items:center; margin:0 auto 25px; background:#e7f0ff; color:#1d5cd7; font-weight:900; font-size:18px; }.journey h2 { font-size:21px; }.journey p { font-size:14px; color:#64748b; line-height:1.45; }.journey i { position:absolute; right:-25px; top:116px; z-index:3; display:grid; place-items:center; width:36px; height:36px; border-radius:50%; background:var(--blue); color:white; font-style:normal; }.journey-checks { height:100px; margin-top:25px; border-radius:18px; background:var(--navy); color:white; display:flex; align-items:center; justify-content:space-around; font-weight:700; }.journey-checks span { color:#dceaff; }
    .roles { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; height:460px; }.roles article { background:white; border:1px solid var(--line); border-radius:20px; padding:34px; border-top:6px solid var(--blue); }.roles article.ops { border-top-color:var(--green); }.roles article.accountant { border-top-color:var(--amber); }.role-icon { width:66px; height:66px; border-radius:18px; display:grid; place-items:center; color:white; background:var(--blue); font-size:26px; font-weight:900; }.ops .role-icon { background:var(--green); }.accountant .role-icon { background:var(--amber); }.roles h2 { margin:28px 0 14px; font-size:24px; }.roles p { color:#55667c; line-height:1.55; font-size:15px; min-height:116px; }.rbac-note { margin-top:20px; padding:19px 25px; border-radius:15px; background:#e9f1ff; color:#214f9a; font-size:15px; }
    .model { height:300px; display:flex; align-items:center; gap:20px; position:relative; }.entity { width:270px; height:185px; background:white; border:1px solid var(--line); border-radius:20px; padding:24px; position:relative; }.entity span { width:44px; height:44px; border-radius:12px; display:grid; place-items:center; background:#e8f0ff; color:var(--blue); font-weight:900; }.entity h2 { margin:18px 0 6px; }.entity p { color:#64748b; font-size:14px; line-height:1.4; }.model > i { color:#758ba7; font-style:normal; font-weight:800; }.entity.area { position:absolute; right:290px; bottom:-40px; height:120px; width:310px; border-color:#a7d8bd; background:#edf9f2; }.entity.area h2 { margin:10px 0 2px; font-size:18px; }.entity.area p { margin-left:58px; margin-top:-38px; }.model-rules { margin-top:60px; display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }.model-rules div { min-height:140px; padding:22px; border-radius:16px; background:white; border:1px solid var(--line); }.model-rules b { display:block; margin-bottom:10px; font-size:16px; }.model-rules span { color:#64748b; line-height:1.45; font-size:14px; }
    .wizard-flow,.billing-flow { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; height:285px; align-items:center; }.wizard-flow article,.billing-flow article { height:215px; padding:26px 20px; background:white; border:1px solid var(--line); border-radius:18px; position:relative; }.wizard-flow span,.billing-flow span { display:grid; place-items:center; width:42px; height:42px; border-radius:50%; color:white; background:var(--blue); font-weight:900; }.wizard-flow h2,.billing-flow h2 { margin:24px 0 8px; font-size:19px; }.wizard-flow p,.billing-flow p { color:#64748b; font-size:14px; }.wizard-flow i,.billing-flow i { position:absolute; right:-26px; top:88px; z-index:2; color:var(--blue); font-style:normal; font-size:23px; }.wizard-benefits,.billing-rules { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-top:25px; }.wizard-benefits div,.billing-rules div { height:180px; border-radius:18px; padding:25px; background:var(--navy); color:white; }.wizard-benefits b,.billing-rules b { font-size:17px; }.wizard-benefits p,.billing-rules p { margin-top:14px; color:#c8daf3; font-size:14px; line-height:1.5; }
    .billing-flow { grid-template-columns:repeat(5,1fr); height:270px; }.billing-flow article { height:205px; padding:22px 16px; }.billing-flow h2 { font-size:17px; }.billing-flow i { right:-24px; }.billing-rules { margin-top:24px; }.billing-rules div { height:190px; }
    .runbook { display:flex; flex-direction:column; gap:9px; }.run-row { height:68px; display:grid; grid-template-columns:100px 280px 150px 1fr; align-items:center; border:1px solid var(--line); border-radius:13px; background:white; padding:0 20px; }.run-row b { color:#1f5fd8; }.run-row strong { font-size:16px; }.run-row span { color:#687a91; font-weight:700; }.run-row p { margin:0; color:#55667c; font-size:13px; }
    .data-table { border-radius:16px; overflow:hidden; border:1px solid var(--line); background:white; }.data-row { min-height:60px; display:grid; grid-template-columns:210px 1.45fr 1fr; align-items:center; border-bottom:1px solid var(--line); padding:10px 20px; font-size:14px; }.data-row:last-child { border-bottom:0; }.data-row.head { min-height:52px; color:white; background:var(--navy); font-size:12px; text-transform:uppercase; letter-spacing:.08em; font-weight:800; }.data-row b { color:#1f58bd; }.data-row span:last-child { color:#64748b; }
    .checklist { display:grid; grid-template-columns:1fr 1fr; gap:12px 18px; }.check { height:91px; display:grid; grid-template-columns:50px 1fr 28px; gap:15px; align-items:center; padding:0 20px; background:white; border:1px solid var(--line); border-radius:15px; }.check span { display:grid; place-items:center; width:42px; height:42px; border-radius:12px; background:#e8f1ff; color:#1e5fd7; font-weight:900; }.check b { font-size:14px; line-height:1.35; }.check i { font-size:24px; color:#9aabba; font-style:normal; }.red-note { margin-top:18px; padding:18px 22px; background:#fff0f1; color:#8d2631; border-radius:14px; font-size:14px; }
    .decision-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }.decision-grid article { height:250px; padding:24px; background:white; border:1px solid var(--line); border-radius:18px; position:relative; }.decision-grid span { position:absolute; right:20px; top:16px; color:#d9e5f5; font-size:40px; font-weight:900; }.decision-grid h2 { margin-top:52px; font-size:19px; }.decision-grid p { color:#5b6d84; font-size:14px; line-height:1.5; }
    .closing { background:linear-gradient(135deg,#0a2550,#15458d); color:white; padding:65px 75px; }.closing::before { display:none; }.closing footer { left:75px; right:75px; color:#c4d7f2; border-color:rgba(255,255,255,.2); }.closing-mark { position:absolute; right:85px; top:20px; color:rgba(255,255,255,.06); font-size:260px; font-weight:900; }.closing-content { width:1050px; position:relative; z-index:2; }.closing-content > span { color:#9bc5ff; font-weight:800; letter-spacing:.14em; font-size:13px; }.closing h1 { font-size:50px; line-height:1.08; letter-spacing:-.04em; margin:30px 0 20px; }.closing-content > p { color:#d7e6fa; font-size:19px; width:800px; line-height:1.5; }.next-steps { display:flex; gap:14px; margin-top:36px; }.next-steps div { width:285px; padding:18px; border-radius:15px; background:rgba(255,255,255,.09); display:flex; gap:12px; align-items:center; }.next-steps b { width:32px; height:32px; border-radius:9px; display:grid; place-items:center; background:#2c72e8; }.next-steps span { font-size:13px; font-weight:700; }.closing-questions { margin-top:28px; display:flex; gap:18px; align-items:center; color:#cfe0f7; }.closing-questions strong { color:#8dbbfa; }.closing-questions span { padding:9px 13px; border:1px solid rgba(255,255,255,.22); border-radius:9px; font-size:12px; }.closing-brand { position:absolute; right:75px; bottom:78px; display:grid; grid-template-columns:42px 1fr; column-gap:10px; align-items:center; }.closing-brand img { width:42px; height:42px; filter:brightness(0) invert(1); grid-row:1 / span 2; }.closing-brand b { font-size:18px; }.closing-brand small { color:#a9c7ed; }
    @media print { html,body { background:white; } }
  `;
}

function htmlDocument(slides) {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=1440"><title>TimeHouse Phase 1 Workflow Demo</title><style>${stylesheet()}</style></head><body>${slides.join('\n')}</body></html>`;
}

async function renderPdf(html, tempRoot) {
  if (!fs.existsSync(CHROME)) throw new Error(`Không tìm thấy Chrome tại ${CHROME}`);
  const htmlPath = path.join(tempRoot || fs.mkdtempSync(path.join(os.tmpdir(), 'timehouse-demo-html-')), 'phase1-demo.html');
  fs.writeFileSync(htmlPath, html, 'utf8');
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 1, locale: 'vi-VN' });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => document.fonts.ready);
    const qa = await page.evaluate(() => {
      const slides = [...document.querySelectorAll('.slide')];
      const missingImages = [...document.images].filter((img) => !img.complete || !img.naturalWidth).map((img) => img.alt || img.src.slice(0, 80));
      const overflow = slides.filter((slide) => slide.scrollWidth > slide.clientWidth + 1 || slide.scrollHeight > slide.clientHeight + 1).map((slide) => slide.dataset.slide);
      return { slides: slides.length, missingImages, overflow };
    });
    if (qa.slides !== EXPECTED_SLIDES || qa.missingImages.length || qa.overflow.length) {
      throw new Error(`QA HTML lỗi: ${JSON.stringify(qa)}`);
    }
    if (process.env.TIMEHOUSE_DEMO_QA_DIR) {
      const qaDir = path.resolve(process.env.TIMEHOUSE_DEMO_QA_DIR);
      fs.mkdirSync(qaDir, { recursive: true });
      for (const slideNo of [1, 3, 10, 17, 23, 29, 30, 35]) {
        const target = page.locator(`.slide[data-slide="${slideNo}"]`);
        await target.screenshot({ path: path.join(qaDir, `slide-${String(slideNo).padStart(2, '0')}.png`) });
      }
    }
    const buffer = await page.pdf({
      width: '13.333333in', height: '7.5in', printBackground: true,
      preferCSSPageSize: true, margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    const pageCount = (buffer.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
    if (pageCount !== EXPECTED_SLIDES) throw new Error(`PDF có ${pageCount} trang, kỳ vọng ${EXPECTED_SLIDES}.`);
    fs.writeFileSync(PDF_PATH, buffer);
    if (KEEP_HTML) fs.copyFileSync(htmlPath, path.join(OUT, 'TimeHouse_Phase1_Workflow_Demo_v1.0.html'));
    return { qa, bytes: buffer.length, pageCount };
  } finally {
    await browser.close();
  }
}

async function main() {
  ensureInsideWorkspace(OUT);
  const source = prepareSource();
  const slides = makeSlides(source.manifest);
  const renderTemp = source.tempRoot || fs.mkdtempSync(path.join(os.tmpdir(), 'timehouse-demo-render-'));
  const result = await renderPdf(htmlDocument(slides), renderTemp);
  const evidenceCount = fs.readdirSync(EVIDENCE).filter((name) => name.endsWith('.png')).length;
  console.log(JSON.stringify({
    pdf: PDF_PATH,
    pages: result.pageCount,
    bytes: result.bytes,
    evidencePng: evidenceCount,
    milestones: `${source.manifest.summary.pass}/${source.manifest.summary.total} PASS`,
    qa: 'PASS',
    source: REUSE ? 'latest UAT Phase 1' : 'fresh Phase 1 capture',
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

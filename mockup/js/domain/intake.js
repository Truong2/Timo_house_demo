/* Shared contract/Excel/manual intake model. Pure: no store or browser APIs. */
(function (TH) {
  const I = TH.intake = {};
  I.norm = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/\s+/g, ' ').trim();
  I.code = v => String(v ?? '').replace(/\s+/g, '').toUpperCase();
  I.money = v => { if (typeof v === 'number') return Number.isFinite(v) ? v : null; const s = String(v ?? '').trim(); if (!s) return null; if (!/^[\d\s.,]+$/.test(s)) return null; const n = Number(s.replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.')); return Number.isFinite(n) ? n : null; };
  I.date = v => {
    const s = String(v ?? '').trim(); let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) { const x = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/); if (x) m = [s, x[3], x[2].padStart(2, '0'), x[1].padStart(2, '0')]; }
    if (!m) return ''; const iso = `${m[1]}-${m[2]}-${m[3]}`; const d = new Date(iso + 'T00:00:00Z'); return !isNaN(d) && d.toISOString().slice(0, 10) === iso ? iso : '';
  };
  I.fees = [['electric', 'Điện', 'meter'], ['water', 'Nước', 'person'], ['cleaning', 'Vệ sinh', 'room'], ['internet', 'Internet', 'room'], ['elevator', 'Thang máy', 'person'], ['ev', 'Xe điện / gửi xe', 'vehicle'], ['washer', 'Máy giặt', 'person'], ['combo', 'Dịch vụ chung', 'person']];
  // [key, label, input type, required, section]
  const shared = [['buildingCode', 'Mã tòa', 'text', true, 2], ['buildingAddress', 'Địa chỉ tòa', 'text', true, 2], ['contractCode', 'Mã hợp đồng', 'text', true, 1], ['signDate', 'Ngày ký / chốt', 'date', true, 1], ['startDate', 'Ngày bắt đầu thuê / tính tiền phòng', 'date', true, 1], ['endDate', 'Ngày hết hạn', 'date', true, 1], ['deposit', 'Cọc theo hợp đồng', 'number', true, 1], ['payMonths', 'Kỳ thanh toán (tháng)', 'number', true, 1], ['dueFromDay', 'Từ ngày thanh toán', 'number', false, 1], ['dueDay', 'Đến ngày thanh toán', 'number', false, 1], ['dueMonthOffset', 'Tháng trả (-1: tháng trước; 0: đầu kỳ)', 'number', false, 1]];
  I.fields = {
    owner: [['name', 'Tên chủ nhà / pháp nhân', 'text', true, 0], ['phone', 'Số điện thoại chủ nhà', 'tel', false, 0], ['idNo', 'CCCD / mã số pháp nhân', 'text', false, 0], ['partyAddress', 'Địa chỉ liên hệ chủ nhà', 'text', false, 0], ['bank', 'Tài khoản nhận tiền / ngân hàng', 'text', false, 0], ['operatorName', 'Bên thuê khai thác', 'text', true, 1], ['operatorIdNo', 'CCCD / mã số bên khai thác', 'text', false, 1], ['operatorPhone', 'SĐT bên khai thác', 'tel', false, 1], ...shared, ['handoverDate', 'Ngày bàn giao tòa', 'date', true, 1], ['rent', 'Tiền thuê toàn tòa / tháng', 'number', true, 1], ['holdPriceTo', 'Giữ giá đến ngày', 'date', false, 1], ['terms', 'Thuế / PCCC / điều khoản, phụ lục', 'textarea', false, 1], ['floors', 'Số tầng', 'number', false, 2], ['area', 'Diện tích sàn (m²)', 'number', false, 2], ['areaId', 'Khu vực', 'area', true, 2], ['managerId', 'Quản lý vận hành', 'manager', true, 2]],
    tenant: [['name', 'Họ tên khách', 'text', true, 0], ['phone', 'Số điện thoại khách', 'tel', true, 0], ['idNo', 'CCCD / giấy tờ', 'text', false, 0], ['birthDate', 'Ngày sinh', 'date', false, 0], ['partyAddress', 'Địa chỉ liên hệ khách', 'text', false, 0], ['occupation', 'Nghề nghiệp / phân khúc', 'text', false, 0], ['operatorName', 'Bên cho thuê phòng', 'text', false, 1], ...shared, ['roomCode', 'Mã phòng (ví dụ 302G1)', 'text', true, 2], ['moveInDate', 'Ngày nhận phòng', 'date', true, 1], ['svcStart', 'Ngày bắt đầu tính dịch vụ', 'date', true, 1], ['rent', 'Giá thuê thực tế / tháng', 'number', true, 1], ['listPrice', 'Giá niêm yết (đối chiếu)', 'number', false, 1], ['mgmtPrice', 'Giá quản lý (đối chiếu)', 'number', false, 1], ['people', 'Số người ở', 'number', true, 1], ['vehicles', 'Số xe điện tính phí', 'number', false, 1], ['vehicleList', 'Danh sách xe: loại xe | biển số (mỗi dòng một xe)', 'textarea', false, 1], ['elOpen', 'Chỉ số điện bàn giao', 'number', false, 1], ['waOpen', 'Chỉ số nước bàn giao', 'number', false, 1], ['status', 'Trạng thái khi tạo', 'status', true, 1], ['openingDeposit', 'Cọc cũ đang giữ (chuyển đổi dữ liệu)', 'number', false, 1], ['openingDebt', 'Nợ đầu kỳ cần đối chiếu', 'number', false, 1], ['declaredPaid', 'Hợp đồng / nguồn ghi đã nộp', 'number', false, 1], ['paidDeposit', 'Đề xuất phân bổ vào cọc', 'number', false, 1], ['paidRent', 'Đề xuất phân bổ vào tiền thuê', 'number', false, 1], ['terms', 'Ghi chú / điều khoản', 'textarea', false, 1]]
  };
  I.fields.owner.push(['partyType','Loại chủ nhà (cá nhân / pháp nhân)','partyType',false,0],['relatedPersons','Người liên quan / đại diện / đồng sở hữu','textarea',false,0],['depositPaid','Cọc đã giao chủ nhà (theo chứng từ)','number',false,1],['buildingFeatures','Đặc điểm tòa / tài sản bàn giao','textarea',false,2],['businessRegistration','Đăng ký kinh doanh / PCCC','textarea',false,2]);
  I.fields.tenant.push(['openingAsOf','Ngày ghi nhận cọc cũ đầu kỳ','date',false,1],['openingPeriod','Kỳ công nợ đầu kỳ (YYYY-MM)','month',false,1]);
  I.blank = kind => ({ kind, data: { status: 'pending' }, rooms: [], items: {}, sources: {}, conflicts: [], sourceErrors: [], files: [], reviewed: false });
  I.roomCode = (room, building) => { let r = I.code(room).replace(/^PHÒNG|^PHONG|^P(?=\d)/, '').replace(/[-–]/g, ''); const b = I.code(building); return r.endsWith(b) && b ? r : r + b; };
  I.merge = (draft, next) => {
    for (const [k, v] of Object.entries(next.data || {})) {
      if (v == null || v === '') continue;
      if (draft.data[k] != null && draft.data[k] !== '' && String(draft.data[k]) !== String(v) && draft.sources[k]) draft.conflicts.push({ key: k, before: draft.data[k], next: v, source: next.sources?.[k] });
      else { draft.data[k] = v; if (next.sources?.[k]) draft.sources[k] = next.sources[k]; }
    }
    for (const r of next.rooms || []) {
      const existing = draft.rooms.find(x => I.code(x.code) === I.code(r.code));
      if (!existing) draft.rooms.push(r);
      else for (const [key, value] of Object.entries(r)) if (!['source', 'sources', 'code'].includes(key) && value != null && value !== '') {
        if(existing[key]==null||existing[key]===''){existing[key]=value;if(r.sources?.[key]){existing.sources ||= {};existing.sources[key]=r.sources[key];}}
        else if(String(existing[key])!==String(value))draft.conflicts.push({ key: 'room:' + r.code + ':' + key, before: existing[key], next: value, source: r.sources?.[key]||r.source });
      }
    }
    for (const [k, v] of Object.entries(next.items || {})) { if (draft.items[k] && JSON.stringify(draft.items[k]) !== JSON.stringify(v)) draft.conflicts.push({ key: 'fee:' + k, before: draft.items[k], next: v, source: next.sources?.['fee:' + k] }); else draft.items[k] = v; }
    for(const e of next.sourceErrors||[])if(!draft.sourceErrors.some(x=>x.message===e.message))draft.sourceErrors.push(e); draft.reviewed = false; return draft;
  };
  /* Parse anchored labels, never infer from filename or existing records. */
  I.extract = (kind, pages, fileName) => {
    const out = I.blank(kind); out.data = {}; const text = pages.map(p => p.text).join('\n'); const t = text.replace(/\s+/g, ' ');
    const put = (k, value, raw) => { if (value === '' || value == null) return; out.data[k] = value; const page = pages.find(p => p.text.replace(/\s+/g, ' ').includes(raw)) || pages[0]; out.sources[k] = { file: fileName, page: page?.page || 1, raw, method: page?.method || 'text', confidence:page?.confidence??null }; };
    const find = (k, re, convert = v => v.trim()) => { const m = t.match(re); if (m) put(k, convert(m[1]), m[0]); };
    const amount = '([\\d][\\d.,]*)'; const date = '(\\d{1,2}/\\d{1,2}/\\d{4})';
    const party = kind === 'owner' ? t.match(/BÊN A\s*[–:-][\s\S]*?(?=BÊN B\s*[–:-])/i)?.[0] : t.match(/BÊN B\s*[–:-][\s\S]*?(?=Điều 1|ĐIỀU 1)/i)?.[0];
    if (party) {
      const name = party.match(/(?:Ông|Bà|Họ tên(?: đầy đủ)?)\s*[:.]?\s*([^;:]+?)(?:;|\s+CCCD|\s+Ngày sinh)/i); if (name) put('name', name[1].trim(), name[0]);
      const id = party.match(/CCCD(?:\s+số)?\s*[:.]?\s*(\d{9,12})/i); if (id) put('idNo', id[1], id[0]);
      const phone = party.match(/(?:điện thoại|SĐT)\s*[:.]?\s*(0[\d ]{9,13})/i); if (phone) put('phone', phone[1].replace(/\s/g, ''), phone[0]);
      const address = party.match(/(?:địa chỉ liên hệ|Hộ khẩu thường trú)[^:]*:\s*([^;]+?)(?:\.\s|$)/i); if (address) put('partyAddress', address[1], address[0]);
      const birth = party.match(new RegExp('ngày sinh[: ]+' + date, 'i')); if (birth) put('birthDate', I.date(birth[1]), birth[0]);
    }
    find('contractCode', /(?:Mã hợp đồng|HĐ số)\s*:\s*([^\s]+)/i);
    find('buildingCode', /tòa\s+([TSG][A-Z]?\d+[A-Z]?)/i, I.code);
    find('buildingAddress', /(?:tại|Địa điểm:)\s*(?:Tòa\s+[A-Z]+\d+,?\s*)?(số\s+\d[^.]+?Hà Nội)/i);
    find('signDate', new RegExp('(?:Ngày lập mẫu|Ngày ký(?: mẫu)?)[: ]+' + date, 'i'), I.date);
    find('startDate', new RegExp('(?:từ|tính tiền phòng(?: và dịch vụ)?:)\\s*(?:ngày\\s*)?' + date, 'i'), I.date);
    find('endDate', new RegExp('đến(?: hết)?\\s*(?:ngày\\s*)?' + date, 'i'), I.date);
    find('deposit', new RegExp(kind === 'owner' ? 'Tiền cọc Bên B giao Bên A[: ]+' + amount : 'Tiền cọc duy trì hợp đồng[: ]+' + amount, 'i'), I.money);
    find('rent', new RegExp(kind === 'owner' ? 'Giá thuê toàn tòa[: ]+' + amount : '(?:Tiền thuê phòng|Giá cho thuê phòng(?: là)?)[: ]+' + amount, 'i'), I.money);
    find('payMonths', /(?:Kỳ thanh toán|Kỳ trả tiền thuê)\s*:\s*(\d+)\s*tháng/i, Number);
    const due = t.match(/(?:ngày|từ ngày)\s*(\d{1,2})\s*(?:đến(?: hết)?(?: ngày)?|[–-])\s*(\d{1,2})\s*(?:của tháng|tháng)/i);
    if (due) { put('dueFromDay', +due[1], due[0]); put('dueDay', +due[2], due[0]); put('dueMonthOffset', /tháng trước kỳ|tháng trước kỳ thuê/i.test(t) ? -1 : 0, due[0]); }
    const operatorSection = kind === 'owner' ? t.match(/BÊN B\s*[–:-][\s\S]*?(?=Điều 1)/i)?.[0] : t.match(/BÊN A\s*[–:-][\s\S]*?(?=BÊN B\s*[–:-])/i)?.[0];
    if (operatorSection) { const n = operatorSection.match(/Ông\s+([^;]+);/i); if (n) put('operatorName', n[1], n[0]); for (const [k,re] of [['operatorIdNo', /CCCD\s*(\d{9,12})/i], ['operatorPhone', /điện thoại\s*(0\d{9})/i]]) { const m = operatorSection.match(re); if(m) put(k,m[1],m[0]); } }
    if (kind === 'owner') {
      find('handoverDate', new RegExp('Ngày bàn giao tòa[: ]+' + date, 'i'), I.date);
      find('floors', /(?:Tòa gồm|Nhà có)\s*(\d+)\s*tầng/i, Number);
      const roomText = t.split(/Phụ lục 1\. Danh sách phòng/i).pop();
      if (roomText !== t) for (const m of roomText.matchAll(/\bP(\d{3,4}[A-Z]?)\b/g)) { const code = I.roomCode(m[1], out.data.buildingCode); if (!out.rooms.some(r => r.code === code)) out.rooms.push({ code, number: m[1], floor: Math.floor(parseInt(m[1],10)/100), exploitation: 'timehouse', source: { file: fileName, page:pages.find(p=>/Phụ lục 1\. Danh sách phòng/i.test(p.text))?.page||1, raw: m[0] } }); }
    } else {
      find('roomCode', /phòng\s+(?:số[: ]*)?(P?\d{2,4}[A-Z]?)\s*[–-]/i, v => I.roomCode(v, out.data.buildingCode));
      find('moveInDate', new RegExp('Ngày giao, nhận phòng[: ]+' + date, 'i'), I.date);
      find('svcStart', new RegExp('Ngày bắt đầu tính tiền phòng và dịch vụ[: ]+' + date, 'i'), I.date);
      find('people', /số người ở\s*(\d+)/i, Number); find('vehicles', /số xe điện\s*(\d+)/i, Number);
      const motor = t.match(/số xe máy\s*(\d+)/i); if (motor) put('vehicleList', Array.from({length:+motor[1]},()=> 'Xe máy |').join('\n'), motor[0]);
      find('elOpen', new RegExp('điện\\s*' + amount + '\\s*kWh', 'i'), I.money); find('waOpen', new RegExp('nước\\s*' + amount + '\\s*m³', 'i'), I.money);
      find('declaredPaid', new RegExp('Tổng đã nộp[: ]+' + amount, 'i'), I.money);
      find('paidDeposit', new RegExp('phân bổ\\s*' + amount + '\\s*đồng tiền cọc', 'i'), I.money);
      find('paidRent', new RegExp('và\\s*' + amount + '\\s*đồng tiền thuê phòng kỳ', 'i'), I.money);
      for (const [key,label,method] of I.fees) {
        const re = new RegExp(label + '\\s*' + amount + '\\s*(?:đồng|đ)\\s*/\\s*(kWh|số|m³|người|phòng|xe)(?:/tháng)?', 'i'); const m = t.match(re);
        if (m) { out.items[key] = { unit: I.money(m[1]), method: /kWh|số|m³/i.test(m[2]) ? 'meter' : ({người:'person',phòng:'room',xe:'vehicle'}[m[2].toLowerCase()] || method) }; out.sources['fee:'+key] = { file:fileName, raw:m[0], page: pages.find(p => p.text.includes(m[0]))?.page || 1 }; }
      }
      out.data.status = 'pending';
    }
    out.data.terms = /DỮ LIỆU MẪU|dữ liệu mẫu/i.test(t) ? 'Hợp đồng mẫu chưa ký – xác nhận dùng dữ liệu demo.' : '';
    return out;
  };
  I.aliases = { name: ['ho ten','ten khach','ten chu nha','chu nha'], phone:['sdt','so dien thoai'], idNo:['cccd','ma so phap nhan'], partyAddress:['dia chi lien he'], buildingCode:['ma toa','toa'], buildingAddress:['dia chi toa','dia chi'], contractCode:['ma hop dong','so hop dong'], operatorName:['ben khai thac','ben cho thue'], roomCode:['ma phong','ma'], number:['so phong','phong'], floor:['tang'], rent:['gia thue','gia thue thang','gia phong hien tai'], listPrice:['gia niem yet'], mgmtPrice:['gia ql','gia quan ly'], deposit:['coc theo hop dong','tien coc'], openingDeposit:['coc dang giu','coc khach cu'], openingDebt:['no cu'], declaredPaid:['tong da dong','da nop'], moveInDate:['ngay vao o','ngay nhan phong'], startDate:['ngay bat dau','ngay tinh tien phong'], svcStart:['ngay bat dau dich vu'], endDate:['ngay het han','ngay het han hd'], signDate:['ngay ky'], handoverDate:['ngay ban giao'], payMonths:['ky tt','ky thanh toan'], people:['so nguoi'], exploitation:['loai khai thac'], areaId:['ma khu vuc'], managerId:['ma nv quan ly'], status:['trang thai'], bank:['ngan hang'], elOpen:['dien dau ky'], waOpen:['nuoc dau ky'] };
  I.mapping = headers => Object.fromEntries(headers.map((h, i) => { const n = I.norm(h); const field = [...Object.keys(I.aliases), ...I.fields.owner.map(f=>f[0]), ...I.fields.tenant.map(f=>f[0]),'price',...I.fees.flatMap(([k])=>[k+'Unit',k+'Method'])].find(k => I.norm(k) === n || (I.aliases[k] || []).includes(n)); return field ? [field,i] : null; }).filter(Boolean));
  I.sheetProfile = name => /^NHÀ [TSG]$|^G1[678]$/i.test(name.trim()) ? 'house' : /^PHÒNG MỚI/i.test(name.trim()) ? 'new' : /^HOÀN CỌC$/i.test(name.trim()) ? 'refund' : /^(DATA|CHỦ NHÀ|KHÁCH HÀNG)$/i.test(name.trim()) ? 'template' : 'reference';
  I.fromRows = (kind, rows, { file = '', sheet = '', mapping = null, cells = {}, asOf = '' } = {}) => {
    const profile = I.sheetProfile(sheet), header = profile === 'template' ? 0 : 1;
    if(profile==='reference')return [];
    if(profile==='refund')return rows.slice(2).map((row,i)=>{
      if(!row||!/^\d+[A-Z]*[TSG]\d+[A-Z]*$/i.test(I.code(row[0])))return null;
      const d=I.blank(kind);d.data={roomCode:I.code(row[0]),buildingCode:I.code(row[1]),status:'ended'};d.sourceRow=i+3;
      d.referenceOnly={contractDeposit:I.money(row[8]),roomAmount:I.money(row[7]),source:{file,sheet,depositCell:'I'+(i+3),roomAmountCell:'H'+(i+3)}};
      d.sources.roomCode={file,sheet,cell:'A'+(i+3),raw:row[0]};
      d.sourceErrors.push({key:'status',message:'Sheet HOÀN CỌC chỉ dùng đối chiếu kết thúc và hoàn cọc; không tạo lượt thuê mới'});
      return d;
    }).filter(Boolean);
    const mapped = mapping || I.mapping(rows[header] || []), results=[];
    const map = kind==='owner'&&['house','new'].includes(profile) ? Object.fromEntries(Object.entries(mapped).filter(([key])=>['buildingCode','roomCode','number'].includes(key))) : ['house','new'].includes(profile)?Object.fromEntries(Object.entries(mapped).filter(([key])=>key!=='status')):mapped;
    const at = (row,col) => { let c=col+1,s=''; while(c){s=String.fromCharCode(65+(c-1)%26)+s;c=Math.floor((c-1)/26);} return s+(row+1); };
    for (let ri = header + 1; ri < rows.length; ri++) {
      const row = rows[ri]; if (!row || row.every(v=>v==null||v==='')) continue;
      if (profile !== 'template' && !/^\d+[A-Z]*[TSG]\d+[A-Z]*$/i.test(I.code(row[0]))) continue;
      const d = I.blank(kind); d.data = {}; d.sourceRow = ri + 1;
      for (const [key, ci] of Object.entries(map)) {
        const v = row[ci]; const cell = cells[at(ri,ci)] || {};
        if (cell.error || (cell.formula && cell.value == null) || /^#(?:REF|VALUE|DIV|N\/A|NAME|NUM)/.test(String(v))) { d.sourceErrors.push({key, message:`${sheet}!${at(ri,ci)}: ô lỗi / công thức chưa có kết quả`}); continue; }
        if (v == null || v === '') continue;
        let value=v; const f = I.fields[kind].find(f=>f[0]===key);
        if (f?.[2] === 'date') value=I.date(v); if (f?.[2] === 'number') value=I.money(v);
        if (f && value == null || f?.[2]==='date' && !value) d.sourceErrors.push({key,message:`${at(ri,ci)}: ${f[1]} không hợp lệ`});
        d.data[key]=value; d.sources[key]={file,sheet,cell:at(ri,ci),raw:v,formula:cell.formula||null};
      }
      d.data.buildingCode = I.code(d.data.buildingCode);
      if (profile !== 'template') {
        const house = profile === 'house'; d.data.roomCode=I.code(row[0]);
        const v = (k, c) => { const value=row[c]; if(value!=null && value!=='') {d.data[k]=I.money(value); d.sources[k]={file,sheet,cell:at(ri,c),raw:value,formula:cells[at(ri,c)]?.formula||null};} };
        v('listPrice',house?6:5); v('mgmtPrice',house?7:6);
        // New-room H is already prorated: monthly G is the source monthly rent.
        v('rent',house?8:6); delete d.data.deposit;
        if(house) {v('openingDeposit',5);v('deposit',9);} else v('deposit',8);
        v('people',house?14:13); v('openingDebt',house?12:11); v('declaredPaid',house?49:45);
        const dateCols = house ? [52,54] : [48,50];
        if(profile==='new') dateCols.splice(0,2,48,50);
        for(const [key,col] of [['moveInDate',dateCols[0]],['endDate',dateCols[1]]]) if (map[key]===col && row[col]) {d.data[key]=I.date(row[col]);d.sources[key]={file,sheet,cell:at(ri,col),raw:row[col]};}
        const starts = {electric:house?15:14,water:house?20:19,cleaning:house?25:24,internet:house?28:27,elevator:house?31:30,ev:house?34:33,washer:house?37:36,combo:house?40:39};
        for (const [k,base] of Object.entries(starts)) { const meter=['electric','water'].includes(k), col=base+(meter?3:1), unit=I.money(row[col]); if(unit!=null){ d.items[k]={unit,method:k==='electric'?'meter':k==='water'?(row[base]!=null||row[base+1]!=null?'meter':'person'):I.fees.find(f=>f[0]===k)[2]}; d.sources['fee:'+k]={file,sheet,cell:at(ri,col),raw:row[col]};} }
        if(d.data.moveInDate&&asOf){d.data.status=d.data.moveInDate>asOf?'pending':'active';d.sources.status={...d.sources.moveInDate,raw:`Theo ngày nhận phòng ${d.data.moveInDate} so với ngày kiểm tra ${asOf}`};}
        for(const [addr,cell] of Object.entries(cells)) if(addr.match(/\d+$/)?.[0]===String(ri+1) && (cell.error || cell.formula && cell.value==null)) d.sourceErrors.push({key:addr,message:`${sheet}!${addr}: ô lỗi / thiếu kết quả`});
      }
      if (d.data.roomCode) d.data.roomCode=I.roomCode(d.data.roomCode,d.data.buildingCode);
      if(profile==='template')for(const [key,,method] of I.fees)if(d.data[key+'Unit']!=null){d.items[key]={unit:I.money(d.data[key+'Unit']),method:d.data[key+'Method']||method};d.sources['fee:'+key]=d.sources[key+'Unit'];delete d.data[key+'Unit'];delete d.data[key+'Method'];}
      if (kind==='owner') {
        const number=profile==='template'?String(d.data.number ?? d.data.roomCode?.replace(d.data.buildingCode,'') ?? ''):String(d.data.roomCode||'').replace(d.data.buildingCode,'');
        if(number) d.rooms.push({code:I.roomCode(number,d.data.buildingCode),number,floor:d.data.floor??Math.floor(parseInt(number,10)/100),listPrice:I.money(d.data.listPrice),mgmtPrice:I.money(d.data.mgmtPrice),price:I.money(profile==='template'?d.data.price:d.data.rent),exploitation:/^0{2,}/.test(number)?'meter_common':d.data.exploitation||'timehouse',source:{file,sheet,cell:at(ri,0),row:ri+1},sources:{code:d.sources.roomCode||{file,sheet,cell:at(ri,0)},listPrice:d.sources.listPrice,mgmtPrice:d.sources.mgmtPrice,price:d.sources[profile==='template'?'price':'rent']}});
        for(const key of ['number','roomCode','floor','listPrice','mgmtPrice','price','exploitation'])delete d.data[key];
        if(profile!=='template') {for(const key of ['rent','deposit','openingDeposit','declaredPaid','people','openingDebt','moveInDate','endDate','payMonths','status'])delete d.data[key];d.items={};}
      }
      results.push(d);
    }
    if(kind!=='owner') return results;
    const grouped=[]; for(const d of results){ const ex=grouped.find(x=>x.data.buildingCode===d.data.buildingCode && x.data.contractCode===d.data.contractCode); if(ex) I.merge(ex,d); else grouped.push(d); } return grouped;
  };
})(window.TH);

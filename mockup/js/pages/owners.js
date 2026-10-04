/* UI-04 Chủ nhà & HĐ đầu vào (E03 phụ lục thay giá) · UI-05 Lịch trả chủ nhà (ghi chi → UI-15). */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc;


  const contractState=c=>c.startDate>F.today()?'future':c.endDate&&c.endDate<F.today()?'expired':c.endDate&&F.daysBetween(F.today(),c.endDate)<=90?'expiring':'active';
  const contractStates=[['future','Chưa hiệu lực','blue'],['active','Đang hiệu lực','green'],['expiring','Sắp hết hạn','amber'],['expired','Hết hạn','gray']];
  const contractChip=c=>{const [,label,tone]=contractStates.find(x=>x[0]===contractState(c));return U.chip(label,tone,true);};
  const ownerBack=q=>q.return&&/^#\/owners(?:\?|$)/.test(q.return)?q.return:'#/owners';
  TH.router.handle('/owners',(root,p,q)=>{
    const all=S.all('owners').map(o=>({...o,contracts:S.where('ownerContracts',c=>c.ownerId===o.id&&TH.auth.inScope(c.buildingId))}));
    const rows=all.filter(o=>K.match(q.q,o.name,o.phone,...o.contracts.flatMap(c=>[c.contractCode,c.code,Q.building(c.buildingId)?.code])))
      .filter(o=>!q.building&&!q.status||o.contracts.some(c=>(!q.building||c.buildingId===q.building)&&(!q.status||contractState(c)===q.status)));
    const back=TH.router.href('/owners',q);
    const profile=o=>TH.router.href('/owner-profiles/'+o.id,{return:back});
    TH.layout.crumb([{label:'Vận hành'},{label:'Chủ nhà'}]);
    root.innerHTML=U.pageHead({title:'Danh sách chủ nhà',sub:'Quản lý hồ sơ chủ nhà, hợp đồng đầu vào và các tòa liên kết.',acts:[U.btn({label:'Thêm chủ nhà',icon:'plus',href:TH.router.href('/owners/new',{return:back}),cls:'btn-primary',perm:'owners.manage'})]})
      +'<div class="mb16">'+K.kpis([{label:'Chủ nhà',value:all.length,icon:'users',tone:'blue'},{label:'Hợp đồng đang hiệu lực',value:all.reduce((n,o)=>n+o.contracts.filter(c=>['active','expiring'].includes(contractState(c))).length,0),icon:'file-text',tone:'green'},{label:'Hợp đồng sắp hết hạn',value:all.reduce((n,o)=>n+o.contracts.filter(c=>contractState(c)==='expiring').length,0),icon:'calendar',tone:'amber'}])+'</div>'
      +K.filters([{name:'q',type:'search',label:'Tìm chủ nhà',placeholder:'Tên, SĐT, mã hợp đồng hoặc tòa'},{name:'building',label:'Tòa liên kết',options:K.buildingOpts()},{name:'status',label:'Trạng thái hợp đồng',options:contractStates.map(([key,label])=>[key,label])}],q)
      +'<div class="mt16">'+K.tableCard('owner-list',rows.length+' chủ nhà','','Mỗi chủ nhà một hồ sơ, có thể liên kết nhiều hợp đồng và tòa.')+'</div>';
    K.bindFilters(root);
    U.table(root.querySelector('#owner-list'),{rows,pageSize:20,unit:'chủ nhà',empty:U.empty({icon:'users',title:all.length?'Không tìm thấy chủ nhà':'Chưa có hồ sơ chủ nhà',text:all.length?'Thử đổi từ khóa hoặc xóa bộ lọc.':'Thêm chủ nhà để bắt đầu nhập hợp đồng đầu vào.'}),cols:[
      {key:'name',label:'Chủ nhà',sortable:true,render:o=>U.cell2('<a href="'+esc(profile(o))+'"><b>'+esc(o.name)+'</b></a>',o.partyType==='legal'?'Pháp nhân':'Cá nhân')},
      {key:'phone',label:'Liên hệ',render:o=>U.cell2(esc(Q.pii(o.phone)||'Chưa có SĐT'),o.idNo?'Giấy tờ: '+esc(Q.pii(o.idNo)):'Chưa có giấy tờ')},
      {key:'buildings',label:'Tòa liên kết',render:o=>[...new Set(o.contracts.map(c=>c.buildingId))].map(id=>'<a class="code" href="#/buildings/'+esc(id)+'">'+esc(Q.building(id)?.code||'—')+'</a>').join(' · ')||'—'},
      {key:'count',label:'Hợp đồng',sortable:true,num:true,sortVal:o=>o.contracts.length,render:o=>o.contracts.length},
      {key:'status',label:'Tình trạng hợp đồng',render:o=>contractStates.filter(([key])=>o.contracts.some(c=>contractState(c)===key)).map(([key,label,tone])=>U.chip(label+' · '+o.contracts.filter(c=>contractState(c)===key).length,tone,true)).join(' ')||U.chip('Chưa có hợp đồng','gray')},
      {key:'actions',label:'Thao tác',render:o=>U.btn({label:'Xem hồ sơ',icon:'eye',href:profile(o),size:'btn-sm'})}
    ]});
  });
  TH.router.handle('/owner-profiles/:id',(root,p,q)=>{
    const o=S.get('owners',p.id),back=ownerBack(q);
    TH.layout.crumb([{label:'Chủ nhà',href:back},{label:o?.name||'Hồ sơ chủ nhà'}]);
    if(!o){root.innerHTML=U.card({body:U.empty({title:'Không tìm thấy chủ nhà',action:U.btn({label:'Về danh sách',href:back})})});return;}
    const contracts=S.where('ownerContracts',c=>c.ownerId===o.id&&TH.auth.inScope(c.buildingId)),here=TH.router.href('/owner-profiles/'+o.id,q);
    root.innerHTML=U.pageHead({title:esc(o.name),back,sub:'Hồ sơ chủ nhà · '+contracts.length+' hợp đồng liên kết',chips:U.chip(o.partyType==='legal'?'Pháp nhân':'Cá nhân','blue'),acts:[U.btn({label:'Thêm hợp đồng',icon:'plus',cls:'btn-primary',href:TH.router.href('/owners/new',{return:here,party:o.id}),perm:'owners.manage'})]})
      +'<div class="owner-profile-grid mb16">'+U.card({title:'Thông tin chủ nhà',icon:'user',body:U.kv([['Họ tên / pháp nhân',esc(o.name)],['Số điện thoại',esc(Q.pii(o.phone)||'—')],['CCCD / mã số',esc(Q.pii(o.idNo)||'—')],['Địa chỉ liên hệ',esc(o.address||o.partyAddress||'—')]])})
      +U.card({title:'Thanh toán và người liên quan',icon:'landmark',body:U.kv([['Tài khoản / ngân hàng',esc(TH.auth.can('customers.pii')?o.bank||'—':'•••')],['Đại diện / đồng sở hữu',esc(o.relatedPersons||'—')],['Tòa liên kết',[...new Set(contracts.map(c=>c.buildingId))].map(id=>'<a href="#/buildings/'+esc(id)+'">'+esc(Q.building(id)?.code||'—')+'</a>').join(' · ')||'—']])})+'</div>'
      +K.tableCard('owner-contracts','Hợp đồng đầu vào','','Xem hợp đồng, phụ lục và lịch thanh toán theo từng tòa.')
      +'<div class="mt16">'+U.card({title:'File hợp đồng và nguồn xác nhận',icon:'folder',body:contracts.map(c=>{
        const result=S.one('intakeResults',r=>r.targetId===c.id);
        return '<section class="owner-files"><div class="row between wrap"><b>'+esc(c.contractCode||c.code)+'</b>'+(result?U.btn({label:'Nguồn và lịch sử',icon:'history',size:'btn-sm',act:'owner-history',attrs:{'data-id':result.id}}):'')+'</div>'+(TH.intakeView.attachments(c.id)||'<p class="muted mt8">Chưa có file gốc đính kèm.</p>')+'</section>';
      }).join('')||U.empty({icon:'folder',title:'Chưa có hợp đồng đính kèm'})})+'</div>';
    U.table(root.querySelector('#owner-contracts'),{rows:contracts,pageSize:20,cols:[
      {key:'code',label:'Mã hợp đồng',render:c=>'<a href="'+esc(TH.router.href('/owners/'+c.id,{return:here}))+'"><b>'+esc(c.contractCode||c.code)+'</b></a>'},
      {key:'building',label:'Tòa',render:c=>'<a class="code" href="#/buildings/'+esc(c.buildingId)+'">'+esc(Q.building(c.buildingId)?.code||'—')+'</a>'},
      {key:'dates',label:'Thời hạn',render:c=>U.cell2(F.date(c.startDate),F.date(c.endDate))},
      {key:'rent',label:'Giá thuê / tháng',num:true,render:c=>F.vnd(X.ownerRentAt(c.id,F.today()<c.startDate?c.startDate:F.today()))},
      {key:'cycle',label:'Kỳ thanh toán',render:c=>c.payCycleMonths+' tháng/lần'},
      {key:'status',label:'Trạng thái',render:contractChip},
      {key:'actions',label:'Thao tác',render:c=>U.btn({label:'Xem hợp đồng',icon:'file-text',size:'btn-sm',href:TH.router.href('/owners/'+c.id,{return:here})})+U.btn({label:'Lịch trả',icon:'calendar',size:'btn-sm',href:'#/owner-payments?building='+c.buildingId})}
    ]});
    U.bind(root,{'owner-history':el=>TH.intakeView.historyDrawer(S.get('intakeResults',el.dataset.id).draft)});
    root.querySelectorAll('[data-file]').forEach(el=>el.onclick=()=>TH.intakeFiles.download(el.dataset.file).catch(e=>U.toast('err','Không tải được file',e.message)));
  });

  TH.pages.ownerPayDrawer = (opId) => {
    const o = S.get('ownerPayments', opId); const b = Q.building(o.buildingId);
    K.formDrawer({ title: 'Ghi chi tiền nhà – ' + b.code, sub: `Kỳ từ ${F.date(o.from)} · ${o.months} tháng · hạn ${F.date(o.dueDate)}`, modal: true, fields: [
      { name: 'amount', label: 'Số tiền chi', type: 'money', req: true, value: Math.max(0, o.amountDue - o.paid) },
      { name: 'date', label: 'Ngày chi', type: 'date', req: true, value: F.today() },
      { name: 'method', label: 'Phương thức', type: 'select', options: [['bank', 'Chuyển khoản'], ['cash', 'Tiền mặt']], value: 'bank' },
      { name: 'reference', label: 'Mã giao dịch / số phiếu', req: true, placeholder: 'VD: UNC-202609-001' },
      { name: 'evidence', label: 'Chứng từ / nguồn đối chiếu', req: true, placeholder: 'Tên file hoặc mã tài liệu', span: true },
      { type: 'html', span: true, html: U.note('info', '', 'Khoản chi được ghi một lần ở Chi phí (UI-15) loại "Tiền thuê nhà trả chủ". Báo cáo dùng tiền thuê 1 tháng theo HĐ, không cộng lặp.') }],
      submit: 'Ghi chi', onSubmit: (d) => { X.recordOwnerPayment(opId, d); U.toast('ok', 'Đã ghi chi tiền nhà'); } });
  };

  TH.router.handle('/owners/:id', (root, p, q) => {
    const oc = S.get('ownerContracts', p.id); if (!oc) { root.innerHTML = U.empty({ title: 'Không tìm thấy hợp đồng' }); return; }
    const b = Q.building(oc.buildingId), own = S.get('owners', oc.ownerId);
    if(q.return?.startsWith('#/owner-profiles/'))TH.layout.setActive('owners');
    TH.layout.crumb(q.return?.startsWith('#/owner-profiles/')?[{label:'Chủ nhà',href:'#/owners'},{label:own.name,href:q.return},{label:'Hợp đồng đầu vào'}]:[{ label: 'Tòa nhà', href: '#/buildings' }, { label: b.code, href: '#/buildings/' + b.id }, { label: 'Chủ nhà & HĐ' }]);
    const vs = S.where('ownerRateVersions', v => v.contractId === oc.id).sort((a, c) => a.from.localeCompare(c.from));
    const cur = X.ownerRentAt(oc.id, F.today());
    const linkedDocs = Q.documentsAll ? Q.documentsAll().filter(d => d.status !== 'deleted' && Q.canDownloadDoc(d) && ((d.objectType === 'ownerContract' && d.objectId === oc.id) || (d.objectType === 'building' && d.objectId === b.id))) : [];
    root.innerHTML = U.pageHead({ title: 'Chủ nhà & hợp đồng đầu vào', back: q.return?.startsWith('#/') ? q.return : '#/buildings/' + b.id + '?tab=chu-nha-hd', sub: `${esc(oc.code)} · Tòa ${esc(b.code)}`, acts: [
      U.btn({ label: 'Xem lịch trả', icon: 'calendar', href: '#/owner-payments?building=' + b.id }), U.btn({ label: 'Sửa thông tin bổ sung', icon: 'pencil', act: 'meta', perm: 'owners.manage' }), U.btn({ label: 'Thêm phụ lục thay giá', icon: 'plus', cls: 'btn-primary', act: 'appendix', perm: 'owners.manage' })] })
      + `<div class="two-col"><div class="side-stack">
        ${U.card({ title: 'Thông tin hợp đồng ' + (oc.startDate > F.today() ? U.chip('Chưa hiệu lực', 'blue') : oc.endDate && oc.endDate < F.today() ? U.chip('Hết hạn', 'gray') : F.daysBetween(F.today(), oc.endDate) <= 90 ? U.chip('Sắp hết hạn', 'amber') : U.chip('Đang hiệu lực', 'green')), icon: 'file-text', body: U.kv([['Mã HĐ', esc(oc.code)], ['Phạm vi', 'Toàn bộ tòa ' + esc(b.code)], ['Ngày ký / bàn giao', F.date(oc.signDate)], ['Thời hạn', F.date(oc.startDate) + ' → ' + F.date(oc.endDate)],
          ['Giá thuê hiện hành', '<b>' + F.vndd(cur) + '</b>/tháng'], ['Cọc chủ nhà', F.vndd(oc.deposit) + ' <small class="muted">(dòng tiền, không vào chi phí lợi nhuận)</small>'], ['Kỳ trả', oc.payCycleMonths + ' tháng/lần, hạn ngày ' + oc.payDay + ' đầu kỳ'], ['Giữ giá đến', oc.holdPriceTo ? F.date(oc.holdPriceTo) : 'Chưa có dữ liệu']]) })}
        ${U.card({ title: 'Lịch sử giá / phụ lục', icon: 'history', body: '<div id="vt"></div>', bodyCls: 'flush' })}
      </div><div class="side-stack">
        ${U.card({ title: 'Chủ nhà', icon: 'user', body: U.kv([['Họ tên', esc(own.name)], ['SĐT', esc(Q.pii(own.phone))], ['CCCD', esc(Q.pii(own.idNo))], ['Ngân hàng', esc(own.bank)]]) })}
        ${U.card({ title: 'Điều khoản, khai thác và nguồn', icon: 'clipboard-check', body: U.kv([['Bên thuê khai thác', esc((oc.operator || {}).name || 'Chưa có dữ liệu')], ['Liên hệ bên khai thác', esc([(oc.operator || {}).phone, (oc.operator || {}).idNo].filter(Boolean).join(' · ') || 'Chưa có dữ liệu')], ['Thuế / PCCC / điều khoản', esc(oc.terms || 'Chưa có dữ liệu')], ['Đặc điểm / tài sản bàn giao', esc(oc.buildingFeatures || b.features || 'Chưa có dữ liệu')], ['ĐKKD / PCCC', esc(oc.businessRegistration || b.businessRegistration || 'Chưa có dữ liệu')], ['Nguồn', esc(oc.sourceRef || oc.source || 'Chưa có dữ liệu')], ['Ghi chú', esc(oc.note || 'Chưa có dữ liệu')]]) })}
        ${U.card({title:'File hợp đồng, PCCC và sổ đỏ',icon:'folder',body:(TH.intakeView.attachments(oc.id)||'')+(linkedDocs.map(d=>`<div class="mini-row"><span class="grow"><b>${esc(d.name)}</b><small class="muted">${esc(d.type||'Tài liệu')} · v${d.version||1}</small></span>${U.actBtn({icon:'download',label:'Tải tài liệu',act:'docdl',attrs:{'data-id':d.id}})}</div>`).join('')||(!TH.intakeView.attachments(oc.id)?'<p class="muted">Chưa có file đính kèm.</p>':''))})}
        ${U.note('info', 'Báo cáo dùng giá nào?', 'Dòng "Tiền thuê nhà 1 tháng" của báo cáo lấy giá hiệu lực trong kỳ (dù trả 3 tháng/lần), như mẫu G1 C22.')}
      </div></div>`;
    U.table(root.querySelector('#vt'), { rows: vs, noPager: true, cols: [
      { key: 'no', label: 'Phụ lục', render: v => esc(v.appendixNo || 'HĐ gốc') }, { key: 'f', label: 'Từ ngày', render: v => F.date(v.from) }, { key: 't', label: 'Đến ngày', render: v => v.to ? F.date(v.to) : '–' },
      { key: 'r', label: 'Giá thuê', num: true, render: v => F.vnd(v.monthlyRent) }, { key: 'l', label: 'Lý do', render: v => esc(v.reason || '') },
      { key: 's', label: 'Trạng thái', render: v => (!v.to || v.to >= F.today()) && v.from <= F.today() ? U.chip('Đang áp dụng', 'green') : v.from > F.today() ? U.chip('Sắp hiệu lực', 'blue') : U.chip('Hết hiệu lực', 'gray') }] });
    root.querySelectorAll('[data-file]').forEach(el=>el.onclick=()=>TH.intakeFiles.download(el.dataset.file).catch(e=>U.toast('err','Không tải được file',e.message)));
    U.bind(root, { docdl: el => TH.pages.docDownload(el.dataset.id), meta: () => K.formDrawer({ title: 'Sửa thông tin bổ sung – ' + oc.code, fields: [
      { name: 'holdPriceTo', label: 'Giữ giá đến ngày', type: 'date', value: oc.holdPriceTo || '' }, { name: 'sourceRef', label: 'Nguồn / mã hồ sơ', value: oc.sourceRef || '' },
      { name: 'operatorName', label: 'Bên thuê khai thác', value: (oc.operator || {}).name || '' }, { name: 'operatorPhone', label: 'SĐT bên khai thác', value: (oc.operator || {}).phone || '' }, { name: 'operatorIdNo', label: 'CCCD / mã số bên khai thác', value: (oc.operator || {}).idNo || '' },
      { name: 'terms', label: 'Thuế / PCCC / điều khoản, phụ lục', type: 'textarea', span: true, value: oc.terms || '' }, { name: 'buildingFeatures', label: 'Đặc điểm tòa / tài sản bàn giao', type: 'textarea', span: true, value: oc.buildingFeatures || '' },
      { name: 'businessRegistration', label: 'Đăng ký kinh doanh / PCCC', type: 'textarea', span: true, value: oc.businessRegistration || '' }, { name: 'note', label: 'Ghi chú', type: 'textarea', span: true, value: oc.note || '' }, { name: 'reason', label: 'Lý do cập nhật', req: true, span: true }],
      submit: 'Lưu thông tin', onSubmit: d => { X.updateOwnerContractMeta(oc.id, d); U.toast('ok', 'Đã lưu thông tin hợp đồng'); } }), appendix: () => K.formDrawer({ title: 'Thêm phụ lục thay giá', sub: `Hiện tại ${F.vndd(cur)}/tháng, cọc ${F.vndd(oc.deposit)}`, fields: [
      { name: 'from', label: 'Ngày hiệu lực', type: 'date', req: true, help: 'Phải sau phiên giá gần nhất; phiên cũ tự đóng ngày trước đó' },
      { name: 'rent', label: 'Giá thuê mới/tháng', type: 'money', req: true }, { name: 'deposit', label: 'Tiền cọc mới (nếu đổi)', type: 'money' },
      { name: 'reason', label: 'Lý do thay đổi', type: 'textarea', req: true, span: true }],
      submit: 'Lưu phụ lục', onSubmit: (d) => { X.addOwnerRate(oc.id, d); U.toast('ok', 'Đã lưu phụ lục'); } }) });
  });

  TH.router.handle('/owner-payments', (root, p, q) => {
    let rows = S.all('ownerPayments').filter(o => TH.auth.inScope(o.buildingId));
    if (q.building) rows = rows.filter(o => o.buildingId === q.building);
    if (q.status === 'due') rows = rows.filter(o => o.paid < o.amountDue && F.daysBetween(F.today(), o.dueDate) <= 7);
    if (q.status === 'paid') rows = rows.filter(o => o.paid >= o.amountDue);
    if (q.status === 'open') rows = rows.filter(o => o.paid < o.amountDue);
    rows.sort((a, c) => a.dueDate.localeCompare(c.dueDate));
    const due = rows.reduce((s, o) => s + o.amountDue, 0), paid = rows.reduce((s, o) => s + o.paid, 0);
    root.innerHTML = U.pageHead({ title: 'Lịch trả chủ nhà', sub: 'Lịch phát sinh từ kỳ trả của HĐ đầu vào; ghi chi tạo khoản chi gốc ở Chi phí', acts: [U.btn({ label: 'Xuất', icon: 'download', act: 'exp' })] })
      + `<div class="grid grid-3 mb16">${U.kpi({ label: 'Tổng phải trả', value: F.vnd(due), cap: rows.length + ' kỳ', icon: 'landmark' })}${U.kpi({ label: 'Đã chi', value: F.vnd(paid), icon: 'check-circle', tone: 'green' })}${U.kpi({ label: 'Còn phải trả', value: F.vnd(due - paid), cap: rows.filter(o => o.paid < o.amountDue).length + ' kỳ', icon: 'alert-triangle', tone: 'amber' })}</div>`
      + K.filters([{ name: 'building', label: 'Tòa', options: K.buildingOpts() }, { name: 'status', label: 'Trạng thái', options: [['open', 'Chưa trả'], ['due', 'Đến hạn ≤ 7 ngày'], ['paid', 'Đã trả']] }], q)
      + '<div class="mt16">' + K.tableCard('t') + '</div>';
    K.bindFilters(root);
    U.table(root.querySelector('#t'), { rows, pageSize: 20, cols: TH.pages.ownerPayCols() });
    U.bind(root, { 'op-pay': (el) => TH.pages.ownerPayDrawer(el.dataset.id), 'op-trace': (el) => TH.pages.ownerPayTrace(el.dataset.id), exp: () => K.csv('lich-tra-chu-nha.csv', ['Tòa', 'Kỳ từ', 'Số tháng', 'Hạn', 'Phải trả', 'Đã chi'], rows.map(o => [(Q.building(o.buildingId) || {}).code, o.from, o.months, o.dueDate, o.amountDue, o.paid])) });
  });
})(window.TH);

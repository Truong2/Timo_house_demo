/* Presentation helpers for contract intake; sources and history stay read-only. */
(function (TH) {
  const U=TH.ui,F=TH.f,S=TH.store,I=TH.intake,esc=F.esc;
  const money=new Set(['rent','deposit','depositPaid','listPrice','mgmtPrice','price','openingDeposit','openingDebt','declaredPaid','paidDeposit','paidRent','monthlyRent','unit']);
  const roomLabels={number:'Số phòng',floor:'Tầng',exploitation:'Loại khai thác',listPrice:'Giá niêm yết',mgmtPrice:'Giá quản lý',price:'Giá thuê',rooms:'Danh sách phòng'};
  const methods={meter:'Theo chỉ số',person:'Theo người',room:'Theo phòng',vehicle:'Theo xe',fixed:'Cố định'};
  const V=TH.intakeView={money,methods};
  V.label=key=>{
    if(!key)return 'Thông tin hồ sơ';
    if(key.startsWith('fee:'))return 'Phí '+(I.fees.find(f=>f[0]===key.slice(4))?.[1]||key.slice(4));
    if(key.startsWith('room:')){const [,code,field]=key.split(':');return code+' · '+V.label(field);}
    return I.fields.owner.concat(I.fields.tenant).find(f=>f[0]===key)?.[1]||roomLabels[key]||'Thông tin bổ sung';
  };
  V.value=(key,value)=>{
    if(value===undefined||value===null||value==='')return '—';
    const field=key?.split(':').at(-1);
    if(money.has(field))return Number.isFinite(Number(value))?F.vnd(value)+' VND':String(value);
    if(field==='status')return ({pending:'Chờ nhận phòng',active:'Đang ở',ended:'Đã kết thúc'})[value]||String(value);
    if(field==='exploitation')return TH.data.catalog.exploitation[value]||String(value);
    if(field==='partyType')return value==='legal'?'Pháp nhân':'Cá nhân';
    if(typeof value==='object'){
      if('unit' in value)return F.vnd(value.unit)+' VND · '+(methods[value.method]||value.method);
      if(Array.isArray(value))return value.length?value.map(r=>r?.code?r.code+' · '+['floor','exploitation','listPrice','mgmtPrice','price'].filter(k=>r[k]!=null).map(k=>V.label(k)+': '+V.value(k,r[k])).join(' · '):V.value('',r)).join('; '):'Không có dòng';
      return Object.entries(value).filter(([k])=>!['sources','source'].includes(k)).map(([k,v])=>V.label(k)+': '+V.value(k,v)).join(' · ');
    }
    if(/^\d{4}-\d{2}-\d{2}$/.test(String(value)))return F.date(value);
    return String(value);
  };
  V.evidence=(key,raw)=>{if(typeof raw==='string'&&/^[{\[]/.test(raw.trim())){try{return V.value(key,JSON.parse(raw));}catch{}}return typeof raw==='object'?V.value(key,raw):String(raw??'');};
  V.moneyInput=opts=>typeof opts.value==='string'&&opts.value.trim()!==''&&!Number.isFinite(Number(opts.value))?U.money({...opts,value:''}).replace('value=""','value="'+esc(opts.value)+'"'):U.money(opts);
  V.source=s=>s?[s.file||'Nhập tay',s.sheet?s.sheet+'!'+(s.cell||s.row||''):'',s.page?'trang '+s.page:'',s.confidence!=null?'OCR '+Math.round(s.confidence)+'%':''].filter(Boolean).join(' · '):'';
  V.sourceButton=(key,s)=>s?U.btn({label:V.source(s),icon:s.page?'file-text':'info',cls:'btn-ghost intake-source',attrs:{'data-intake':'source','data-key':key},title:'Xem nguồn đối chiếu'}):'<span class="help">Chưa có nguồn đối chiếu</span>';
  V.attachments=target=>S.where('intakeAttachments',a=>a.targetId===target).map(a=>U.fileItem({name:a.name},U.btn({label:'Tải file gốc',icon:'download',size:'btn-sm',attrs:{'data-file':a.fileId}}))).join('');
  TH.intakeAttachmentList=V.attachments;
  V.history=(history=[])=>history.length?U.timeline([...history].reverse().map(h=>({
    when:F.datetime(h.at),color:h.action==='confirm'?'green':'blue',
    title:({confirm:'Xác nhận hồ sơ',resolve:'Đối chiếu nguồn', 'edit-rooms':'Cập nhật danh sách phòng','edit-fees':'Cập nhật biểu phí','remove-room':'Bỏ phòng khỏi bản nháp','select-existing-party':'Chọn hồ sơ liên kết','choose-existing-conflict':'Đối chiếu hồ sơ hiện có','dismiss-source-error':'Xác nhận không dùng ô lỗi','merge-source':'Gộp nguồn bổ sung'})[h.action]||('Chỉnh sửa '+V.label(h.key)),
    sub:esc(S.get('users',h.by)?.name||h.by||'Người nhập')+(h.key?'<br>'+esc(V.value(h.key,h.before))+' → '+esc(V.value(h.key,h.choice==='old'?h.before:h.value??h.next)):'')+(h.choice?'<br>'+esc(['old','keep'].includes(h.choice)?'Giữ giá trị hiện có':'Áp dụng nguồn bổ sung'):'')
  }))):U.empty({icon:'history',title:'Chưa có chỉnh sửa',text:'Lịch sử sẽ xuất hiện khi bạn cập nhật hoặc xác nhận hồ sơ.'});
  V.historyDrawer=draft=>U.drawer({title:'Nguồn và lịch sử xác nhận',wide:true,body:U.card({title:'Nguồn dữ liệu',body:Object.entries(draft.sources||{}).map(([key,s])=>'<div class="intake-source-row"><b>'+esc(V.label(key))+'</b><span>'+esc(V.source(s))+'</span><small>'+esc(V.evidence(key,s.raw))+'</small></div>').join('')||'<p class="muted">Chưa có nguồn.</p>'})+U.card({title:'Lịch sử thao tác',cls:'mt16',body:V.history(draft.history)})});
  V.sourceDrawer=(key,s)=>U.drawer({title:V.label(key),body:U.kv([['Nguồn',esc(V.source(s))],['Cách nhập',esc(({ocr:'Nhận dạng ảnh', 'pdf-text':'Đọc văn bản PDF'})[s?.method]||'Nguồn bổ sung / nhập tay')]])+'<div class="intake-evidence"><b>Nội dung đối chiếu</b><p>'+esc(s?.raw!=null?V.evidence(key,s.raw):'Nguồn không lưu nội dung chi tiết.')+'</p></div>'});
})(window.TH);

/* UI-26: register imported commission lines; Phase 1 does not calculate commission policy. */
(function(TH){
  const F=TH.f,U=TH.ui,St=TH.store,Q=TH.q,esc=F.esc;
  const money=n=>F.vnd(Number(n)||0);
  const contractOf=x=>x.contractId&&St.get('contracts',x.contractId);
  const eligible=x=>{
    if(x.eligibilityOverrideReason)return {ok:true,text:'Kế toán xác nhận thủ công'};
    const c=contractOf(x);
    if(!c)return {ok:false,text:'Chưa gắn HĐ đã ký'};
    if(!['active','ended'].includes(c.status))return {ok:false,text:'HĐ chưa hiệu lực'};
    const paid=F.sum(St.where('depositLedger',d=>d.contractId===c.id&&String(d.type).toUpperCase()==='RECEIVED'),d=>Number(d.amount)||0);
    return paid>=Number(c.deposit||0)&&paid>0?{ok:true,text:'Đủ HĐ và cọc'}:{ok:false,text:'Chưa có bằng chứng cọc đủ'};
  };
  const duplicate=(x,ignoreId='')=>St.where('commissions',r=>r.id!==ignoreId&&((x.dealKey&&r.dealKey===x.dealKey&&Number(r.installmentNo||1)===Number(x.installmentNo||1))||(r.roomCode===x.roomCode&&F.norm(r.recipient)===F.norm(x.recipient)&&Number(r.amount)===Number(x.amount)&&r.period===x.period)))[0];
  const status=x=>({imported:'Chờ xác minh',confirmed:'Đã xác nhận',paid:'Đã chi',cancelled:'Đã hủy'})[x.status]||'Chờ xác minh';
  TH.router.register('/commissions',(root,p,q)=>{
    TH.router.crumb([{label:'Tài chính'},{label:'Hoa hồng'}]);
    const period=q.period||St.state.meta.period,source=St.where('commissions',x=>x.period===period),rows=source.filter(x=>(!q.buildingCode||x.buildingCode===q.buildingCode)&&(!q.recipient||x.recipient===q.recipient)&&(!q.status||x.status===q.status));
    const groups=Object.entries(F.by(rows.filter(x=>x.status!=='cancelled'),x=>x.recipient)).sort((a,b)=>a[0].localeCompare(b[0],'vi'));
    const canManage=TH.auth.can('commission.pay');
    root.innerHTML=`${U.pageHead({title:'Hoa hồng',sub:'Sổ import theo người nhận và kỳ chi · Phase 1 chỉ import, không chạy Commission Engine (X-02).',chips:TH.params.chip('P-07')+TH.params.chip('P-03'),acts:[canManage?U.btn({label:'Import CSV',icon:'upload',cls:'btn-primary',act:'import'}):'',U.btn({label:'Xuất CSV',icon:'download',cls:'btn-outline',act:'export'}),U.btn({label:'Mẫu CSV',icon:'file-text',cls:'btn-ghost',act:'template'})]})}<input type="file" id="commission-file" accept=".csv,text/csv" hidden>
    ${U.filterbar([U.field({label:'Kỳ trả',input:U.select({name:'period',value:period,options:[[period,F.periodLabel(period)],['2026-08','Tháng 8/2026']],attrs:{'data-on':'f'}})}),U.field({label:'Tòa',input:U.select({name:'buildingCode',value:q.buildingCode||'',all:'Tất cả tòa',options:[...new Set(source.map(x=>x.buildingCode))].sort().map(x=>[x,x]),attrs:{'data-on':'f'}})}),U.field({label:'Người nhận',input:U.select({name:'recipient',value:q.recipient||'',all:'Tất cả',options:[...new Set(source.map(x=>x.recipient))].sort().map(x=>[x,x]),attrs:{'data-on':'f'}})}),U.field({label:'Trạng thái chi',input:U.select({name:'status',value:q.status||'',all:'Tất cả',options:[['imported','Chờ xác minh'],['confirmed','Đã xác nhận'],['paid','Đã chi'],['cancelled','Đã hủy']],attrs:{'data-on':'f'}})})])}
    ${U.note('info','Nguồn và giới hạn','13 dòng trích từ sheet HOA HỒNG THÁNG 9.26. Một số ô “Tổng nhận” trong sheet gồm các dòng ngoài trích đoạn; bảng nhóm chỉ cộng dòng đang hiện. Nguồn không có deal key, số đợt, HĐ ký, chứng từ cọc hoặc ngày chi: các dòng này chưa được coi là đã đủ điều kiện hay đã chi.')}
    <div class="grid grid-3 mb16">${U.kpi({label:'Dòng đang hiển thị',value:rows.length,icon:'list',tone:'blue'})}${U.kpi({label:'Thành tiền các dòng trích',value:money(F.sum(rows,x=>x.amount)),icon:'banknote',tone:'green'})}${U.kpi({label:'Người nhận',value:groups.length,icon:'users',tone:'purple'})}</div>
    ${U.card({title:'① Danh sách dòng hoa hồng · '+F.periodLabel(period),sub:'Mỗi đợt trả là một dòng; số tiền import được giữ nguyên dù đối chiếu lệch.',body:'<div id="commission-table"></div>'})}
    <div class="grid grid-2 mt16">${U.card({title:'③ Mức tham chiếu (cảnh báo, không chặn)',body:`<div class="small">Đối tác/lead <b>50%</b> · Nhân viên <b>35%</b>. HĐ dưới 6 tháng: mức ÷ 6 × số tháng; trùng n nguồn: mức ÷ n. Không có bậc thang. ${TH.params.chip('P-07')}</div>`})}${U.card({title:'④ Điều kiện đủ để ghi chi phí',body:'<div class="small">HĐ đã ký/hiệu lực <b>và</b> cọc đã thu đủ. File ghi “đủ” không thay được chứng từ. Kế toán có thể xác nhận thủ công với lý do; khoản chưa chi vẫn treo, chưa vào chi phí.</div>'})}</div>
    ${U.card({title:'⑤ Nhóm chi theo cá nhân · '+F.periodLabel(period),sub:'Tổng dòng trích và ô Tổng nhận trong sheet được trình bày riêng.',cls:'mt16',body:groups.length?`<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Người nhận</th><th class="num">Số dòng</th><th class="num">Tổng dòng trích</th><th class="num">Đã chi có chứng từ</th><th class="num">Tổng nhận (sheet)</th><th>Nội dung CK</th></tr></thead><tbody>${groups.map(([name,items])=>`<tr><td><b>${esc(name)}</b></td><td class="num">${items.length}</td><td class="num">${money(F.sum(items,x=>x.amount))}</td><td class="num">${money(F.sum(items.filter(x=>x.status==='paid'),x=>x.amount))}</td><td class="num">${[...new Set(items.filter(x=>x.totalReceived!=null).map(x=>x.totalReceived))].map(money).join(', ')||'—'}</td><td>HH ${esc(name)} lần 1</td></tr>`).join('')}</tbody></table></div>`:U.empty({title:'Không có nhóm chi trong bộ lọc'})})}
    ${U.card({title:'⑥ Quy tắc cố định',cls:'mt16',body:'<div class="small">Hoa hồng theo <b>cá nhân</b>, không theo team · Không có hoa hồng cho HĐ gia hạn · Đã chi không tự thu hồi khi khách bỏ/phá HĐ · Là <b>chi phí bán hàng</b>, không thuộc chi phí lương · Mỗi đợt chi có chứng từ riêng.</div>'})}`;
    const cols=[
      {key:'code',label:'Dòng / Deal',sortable:true,render:x=>`<b>${esc(x.code)}</b><div class="xs muted">${esc(x.dealKey||'Chưa có deal key')}</div>`},
      {key:'installmentNo',label:'Đợt',render:x=>x.installmentNo?`${x.installmentNo}/${x.installmentTotal||'?'}`:'—'},
      {key:'buildingCode',label:'Tòa',sortable:true},{key:'roomCode',label:'Phòng',sortable:true},{key:'recipient',label:'Người nhận',sortable:true},
      {key:'price',label:'Giá chốt',num:true,render:x=>money(x.price)},{key:'rate',label:'Tỷ lệ',num:true,render:x=>`${x.rate}%${[35,50].includes(Number(x.rate))?'':TH.params.chip('P-07')}`},
      {key:'amount',label:'Số tiền file',num:true,sortable:true,render:x=>money(x.amount)},
      {key:'reconcile',label:'Đối chiếu',render:x=>{const d=Number(x.amount)-Number(x.price)*Number(x.rate)/100;return Math.abs(d)>1000?U.chip('Lệch '+money(d),'amber'):'Khớp';}},
      {key:'eligible',label:'Điều kiện đủ',render:x=>{const e=eligible(x);return U.chip(e.text,e.ok?'green':'amber');}},
      {key:'status',label:'Trạng thái',render:x=>U.chip(status(x),x.status==='paid'?'green':x.status==='cancelled'?'gray':'amber')},
      {key:'actions',label:'Thao tác',render:x=>canManage?U.btn({label:'Chi tiết',cls:'btn-outline',size:'btn-sm',act:'detail',attrs:{'data-id':x.id}}):''}
    ];
    const wrap=root.querySelector('#commission-table');
    if(rows.length)U.table(wrap,{rows,cols,unit:'dòng hoa hồng',pageSize:20,sortKey:'roomCode',sortDir:'asc'});
    else wrap.innerHTML=U.empty({title:source.length?'Không có dòng phù hợp bộ lọc':'Chưa có dữ liệu hoa hồng'});
    U.onChange(root,{f:()=>{TH.router.replaceQuery(U.formData(root.querySelector('.filterbar')));TH.router.refresh();}});
    U.bind(root,{import:()=>root.querySelector('#commission-file').click(),export:()=>F.download('hoa-hong-'+period+'.csv',F.csv(rows.map(x=>[x.dealKey||'',x.installmentNo||'',x.installmentTotal||'',x.period,x.buildingCode,x.roomCode,x.recipient,x.price,x.rate,x.amount,x.status,x.paidDate||'',x.evidence||'']),['dealKey','installmentNo','installmentTotal','period','buildingCode','roomCode','recipient','price','rate','amount','status','paidDate','evidence']),'text/csv'),template:()=>F.download('mau-import-hoa-hong.csv',F.csv([],['dealKey','installmentNo','installmentTotal','period','buildingCode','roomCode','recipient','price','rate','amount']),'text/csv'),detail:el=>detail(St.get('commissions',el.dataset.id))});
    root.querySelector('#commission-file').addEventListener('change',e=>{if(e.target.files[0])importCsv(e.target.files[0]);e.target.value='';});
  },{menu:'commissions',permission:'commissions.view'});

  async function importCsv(file){
    try{
      const matrix=F.parseCSV(await file.text()),keys=matrix.shift()?.map(x=>x.trim())||[],required=['period','buildingCode','roomCode','recipient','price','rate','amount'];
      if(required.some(k=>!keys.includes(k)))throw Error('Thiếu cột: '+required.filter(k=>!keys.includes(k)).join(', '));
      const parsed=matrix.map((cells,i)=>{const x=Object.fromEntries(keys.map((k,j)=>[k,(cells[j]||'').trim()]));['price','rate','amount','installmentNo','installmentTotal'].forEach(k=>x[k]=x[k]?Number(x[k]):null);x.line=i+2;return x;});
      const invalid=parsed.filter(x=>!/^\d{4}-\d{2}$/.test(x.period)||!x.roomCode||!x.recipient||!(x.price>0)||!(x.rate>0)||!(x.amount>0)).map(x=>x.line);
      if(invalid.length)throw Error('Dòng chưa hợp lệ: '+invalid.join(', '));
      const fresh=[],skipped=[];
      parsed.forEach(x=>{if(duplicate(x)||fresh.some(y=>(x.dealKey&&y.dealKey===x.dealKey&&y.installmentNo===x.installmentNo)||(y.roomCode===x.roomCode&&F.norm(y.recipient)===F.norm(x.recipient)&&y.amount===x.amount&&y.period===x.period)))skipped.push(x);else fresh.push(x);});
      const c=await U.confirm({title:'Xác nhận import hoa hồng',text:`${fresh.length} dòng mới; ${skipped.length} dòng trùng sẽ bỏ qua. Dòng mới chỉ ở trạng thái Chờ xác minh.`,ok:'Import'});if(!c)return;
      fresh.forEach(x=>{delete x.line;St.add('commissions',{...x,code:St.nextCode('commissions','HH-'+x.period.replace('-','')+'-',3),status:'imported',source:'csv:'+file.name,transferContent:'HH '+x.recipient+' lần '+(x.installmentNo||1)});});
      St.audit('import','commission','',`Import ${fresh.length} dòng hoa hồng từ ${file.name}`,{duplicates:skipped.length});U.toast('ok','Import hoàn tất',fresh.length+' dòng mới; '+skipped.length+' dòng trùng');TH.router.refresh();
    }catch(e){U.toast('err','Không import được hoa hồng',e.message);}
  }

  function detail(x){
    if(!x)return;const e=eligible(x),delta=Number(x.amount)-Number(x.price)*Number(x.rate)/100,can=TH.auth.can('commission.pay');
    const m=U.modal({title:'Dòng hoa hồng '+esc(x.code),body:`${U.kv([['Phòng / tòa',esc(x.roomCode)+' · '+esc(x.buildingCode)],['Người nhận',esc(x.recipient)],['Giá chốt',money(x.price)],['Tỷ lệ',x.rate+'%'],['Số tiền file',money(x.amount)],['Giá × tỷ lệ',money(Number(x.price)*Number(x.rate)/100)],['Chênh lệch',money(delta)],['Điều kiện',U.chip(e.text,e.ok?'green':'amber')],['Ngày chi',x.paidDate?F.date(x.paidDate):'Chưa có'],['Chứng từ',esc(x.evidence||'Chưa có')],['Lý do xác nhận thủ công',esc(x.eligibilityOverrideReason||'—')]],'one')}${Math.abs(delta)>1000?U.note('warn','Lệch trên 1.000đ','Giữ số tiền theo file; cần kiểm tra giảm trừ, không tự ghi đè.'):''}`,footer:can&&x.status!=='paid'&&x.status!=='cancelled'?[U.btn({label:'Ghép HĐ',cls:'btn-outline',act:'link'}),x.status==='imported'?U.btn({label:'Xác nhận thủ công',cls:'btn-outline',act:'confirm'}):'',x.status==='confirmed'?U.btn({label:'Ghi đã chi',cls:'btn-primary',act:'pay'}):'',U.btn({label:'Hủy dòng',cls:'btn-ghost',act:'cancel'})].join(''):''});
    U.bind(m.el,{
      link:()=>{m.close();const matches=St.where('contracts',c=>Q.room(c.roomId).code===x.roomCode);const d=U.modal({title:'Ghép hợp đồng cho '+esc(x.roomCode),body:matches.length?U.field({label:'Hợp đồng',input:U.select({name:'contractId',options:matches.map(c=>[c.id,c.code])})}):U.empty({title:'Chưa có HĐ tương ứng',text:'Sổ trích đoạn không cung cấp HĐ đã ký cho phòng này.'}),footer:matches.length?U.btn({label:'Ghép HĐ',cls:'btn-primary',act:'save'}):''});U.bind(d.el,{save:()=>{const id=d.data().contractId;St.update('commissions',x.id,{contractId:id});St.audit('link','commission',x.id,'Ghép HĐ '+(St.get('contracts',id)||{}).code);d.close();TH.router.refresh();}});},
      confirm:async()=>{m.close();const c=await U.confirm({title:'Xác nhận thủ công điều kiện đủ',text:'Nguồn chưa đủ bằng chứng HĐ/cọc. Bắt buộc ghi lý do và chứng từ đối chiếu.',body:U.field({label:'Lý do và chứng từ',req:true,input:U.input({name:'reason'})}),ok:'Xác nhận'});if(!c)return;if(!c.reason?.trim())return U.toast('err','Thiếu lý do');St.update('commissions',x.id,{status:'confirmed',eligibilityOverrideReason:c.reason.trim()});St.audit('confirm','commission',x.id,'Xác nhận thủ công điều kiện',{reason:c.reason.trim()});TH.router.refresh();},
      pay:async()=>{m.close();const c=await U.confirm({title:'Ghi đã chi '+x.code,text:'Mỗi đợt chi tạo một chi phí bán hàng ở tháng ngày chi; chứng từ bắt buộc.',body:U.field({label:'Ngày chi',req:true,input:U.date({name:'paidDate',value:F.today()})})+U.field({label:'Mã chứng từ',req:true,input:U.input({name:'evidence'})}),ok:'Ghi đã chi'});if(!c)return;if(!/^\d{4}-\d{2}-\d{2}$/.test(c.paidDate||'')||!c.evidence?.trim())return U.toast('err','Thiếu ngày chi hoặc chứng từ');if(St.get('commissions',x.id).status==='paid')return;const b=St.one('buildings',z=>z.code===x.buildingCode);if(!St.one('expenses',z=>z.commissionId===x.id))St.add('expenses',{code:St.nextCode('expenses','CP-HH-',4),commissionId:x.id,buildingId:b?.id||null,amount:Number(x.amount),docDate:c.paidDate,date:c.paidDate,accountingPeriod:c.paidDate.slice(0,7),categoryCode:'BH-HH',desc:'Hoa hồng '+x.roomCode+' · '+x.recipient,group:'Hoa hồng',recordType:'ops',method:'cash',payMethod:'bank',status:'recorded',dataSource:'commission',evidence:c.evidence.trim()});St.update('commissions',x.id,{status:'paid',paidDate:c.paidDate,evidence:c.evidence.trim()});St.audit('pay','commission',x.id,'Chi hoa hồng',{amount:x.amount,evidence:c.evidence.trim()});TH.router.refresh();},
      cancel:async()=>{m.close();const c=await U.confirm({title:'Hủy dòng '+x.code,body:U.field({label:'Lý do hủy',req:true,input:U.input({name:'reason'})}),ok:'Hủy dòng',danger:true});if(!c)return;if(!c.reason?.trim())return U.toast('err','Thiếu lý do');St.update('commissions',x.id,{status:'cancelled',cancelReason:c.reason.trim()});St.audit('cancel','commission',x.id,'Hủy dòng hoa hồng',{reason:c.reason.trim()});TH.router.refresh();}
    });
  }
})(window.TH);

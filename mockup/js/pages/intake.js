/* One four-step workspace for contract, manual and spreadsheet intake. */
(function (TH) {
  const I=TH.intake,B=TH.intakeFiles,S=TH.store,U=TH.ui,K=TH.kit,V=TH.intakeView,F=TH.f,esc=F.esc;
  const button=(label,act,attrs={},primary=false,icon='')=>U.btn({label,icon,cls:primary?'btn-primary':'btn-ghost',attrs:{'data-intake':act,...attrs}});
  const options=(rows,value)=>rows.map(([id,label])=>'<option value="'+esc(id)+'" '+(String(value)===String(id)?'selected':'')+'>'+esc(label)+'</option>').join('');
  const clone=x=>JSON.parse(JSON.stringify(x));
  const moneyValue=raw=>raw.trim()===''?'':/^-?\d[\d.,\s]*$/.test(raw.trim())?F.num(raw):raw;
  const modes=[{key:'contract',label:'Trích xuất hợp đồng',icon:'file-text'},{key:'manual',label:'Nhập thủ công',icon:'pencil'},{key:'excel',label:'Excel / CSV',icon:'upload'}];
  async function workspace(root,p,q,kind) {
    let draft=I.blank(kind),step=Math.max(0,Math.min(3,Number(q.step)||0)),mode=modes.some(m=>m.key===q.mode)?q.mode:'contract';
    let queue=[],sheets=[],sheetIndex=0,selectedFile,controller,busy=false,committing=false,message='',messageTone='info',progress=0,lastFile,showErrors=false;
    let previewObserver,previewWidth=0;
    let disposed=false,readRun=0,previewId='',previewPage=1,zoom=1,previewDoc,previewTask,previewUrl='',previewLoad=0,previewPaint=0,canvasTask;
    const touched=new Set();
    const active=()=>!disposed&&root.isConnected;
    const clearPreview=()=>{previewLoad++;previewPaint++;canvasTask?.cancel();canvasTask=null;previewTask?.destroy().catch(()=>{});previewTask=null;previewDoc=null;if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl='';};
    root._dispose=()=>{disposed=true;readRun++;controller?.abort();previewObserver?.disconnect();clearPreview();};
    root._deferRefresh=()=>committing||busy;
    draft.id=F.uid('intake');draft.history=[];
    if(q.draft){try{draft=await B.getDraft(q.draft);if(!draft||draft.kind!==kind)throw new Error('Không tìm thấy bản nháp phù hợp');}catch(e){if(active())root.innerHTML=U.card({body:U.empty({icon:'file-text',title:'Không mở được bản nháp',text:esc(e.message),action:U.btn({label:'Tạo hồ sơ mới',href:kind==='owner'?'#/owners/new':'#/tenants/intake'})})});return;}}
    if(!active())return;
    draft.history||=[];draft.files||=[];draft.sources||={};draft.conflicts||=[];draft.sourceErrors||=[];
    if(q.party&&kind==='owner'&&!q.draft){const party=S.get('owners',q.party);if(party){draft.selectedPartyId=party.id;for(const [key,value] of Object.entries({name:party.name,phone:party.phone,idNo:party.idNo,partyAddress:party.address||party.partyAddress,bank:party.bank,partyType:party.partyType,relatedPersons:party.relatedPersons})){if(value!=null){draft.data[key]=value;draft.sources[key]={file:'Hồ sơ chủ nhà đã chọn',raw:value};}}}}
    if(q.room&&kind==='tenant'&&!draft.data.roomCode){const r=TH.q.room(q.room),b=r&&TH.q.building(r.buildingId);if(b){draft.data.roomCode=r.code;draft.data.buildingCode=b.code;draft.data.buildingAddress=b.address;}}
    const steps=kind==='owner'?['Chủ nhà','Hợp đồng đầu vào','Tòa và phòng','Rà soát']:['Khách hàng','Tòa và phòng','Hợp đồng và biểu phí','Rà soát'];
    const sectionFor=s=>kind==='owner'?s:s===1?2:s===2?1:s;
    const stepFor=key=>key==='rooms'?2:key.startsWith('fee:')?2:(kind==='tenant'?({0:0,1:2,2:1}[I.fields[kind].find(f=>f[0]===key)?.[4]]):I.fields[kind].find(f=>f[0]===key)?.[4])??3;
    const back=q.return?.startsWith('#/')?q.return:kind==='owner'?'#/owners':'#/tenants';
    const persist=async()=>{await B.saveDraft(draft);if(active()){q={...q,draft:draft.id,mode,step};TH.router.replaceQuery(q);}};
    const record=h=>{draft.history.push({at:F.nowISO(),by:S.session?.userId,...h});draft.reviewed=false;};
    const change=(key,value)=>{const old=draft.data[key];if(String(old??'')===String(value??''))return;record({key,before:old,value,source:draft.sources[key]});draft.data[key]=value;draft.sources[key]={file:'Nhập tay',raw:value,at:F.nowISO()};delete draft.existingChoices?.[key];draft.sourceErrors=draft.sourceErrors.filter(e=>e.key!==key);};
    const currentSource=key=>key.startsWith('room:')?(()=>{const [,code,field]=key.split(':');const r=draft.rooms.find(r=>r.code===code);return r?.sources?.[field]||r?.source;})():draft.sources[key];
    const field=(f,review)=>{
      const [key,label,type,required]=f,v=draft.data[key]??'',id='intake-'+key,attrs={id,'data-input':key,'aria-required':required||kind==='owner'&&key==='phone'?'true':undefined};
      let control;
      if(['area','manager','status','partyType'].includes(type)){
        const rows=type==='area'?S.all('areas').map(a=>[a.id,a.name||a.id]):type==='manager'?S.all('employees').map(a=>[a.id,a.name]):type==='partyType'?[['individual','Cá nhân'],['legal','Pháp nhân']]:[['pending','Chờ nhận phòng'],['active','Đang ở']];
        control=U.select({name:key,value:v,options:[['','Chọn…'],...rows],attrs});
      }else if(type==='textarea')control=U.textarea({name:key,value:v,rows:3,attrs});
      else if(V.money.has(key))control=V.moneyInput({name:key,value:v,attrs});
      else if(type==='date')control=U.date({name:key,value:v,attrs});
      else control=U.input({name:key,type,value:v,attrs:{...attrs,step:type==='number'?'any':undefined}});
      return U.field({name:key,label,req:required||kind==='owner'&&key==='phone',input:control,cls:type==='textarea'||['bank','buildingAddress','partyAddress'].includes(key)?'span2':'',help:V.sourceButton(key,draft.sources[key])}).replace('<label>','<label for="'+id+'">');
    };
    const fieldGroup=key=>{
      if(['operatorName','operatorIdNo','operatorPhone'].includes(key))return 'Bên khai thác / cho thuê';
      if(['terms','holdPriceTo','relatedPersons','buildingFeatures','businessRegistration'].includes(key))return 'Điều khoản và thông tin bổ sung';
      if(['openingDeposit','openingAsOf','openingDebt','openingPeriod','declaredPaid','paidDeposit','paidRent','depositPaid'].includes(key))return 'Số dư và chứng từ đối chiếu';
      if(['people','vehicles','vehicleList','elOpen','waOpen'].includes(key))return 'Người ở và bàn giao';
      if(['rent','deposit','payMonths','dueFromDay','dueDay','dueMonthOffset','listPrice','mgmtPrice'].includes(key))return 'Giá thuê và thanh toán';
      if(['contractCode','signDate','startDate','endDate','handoverDate','moveInDate','svcStart'].includes(key))return 'Hợp đồng và thời hạn';
      return step===0?'Thông tin '+(kind==='owner'?'chủ nhà':'khách hàng'):'Thông tin tòa và phòng';
    };
    const form=review=>{
      const groups=new Map();for(const f of I.fields[kind].filter(f=>f[4]===sectionFor(step))){const title=fieldGroup(f[0]);if(!groups.has(title))groups.set(title,[]);groups.get(title).push(f);}
      return [...groups].map(([title,fields])=>'<section class="intake-form-group"><h3>'+esc(title)+'</h3><div class="form-grid">'+fields.map(f=>field(f,review)).join('')+'</div></section>').join('');
    };
    const roomEditor=()=>'<section class="intake-form-group" data-field="rooms"><div class="section-h"><div><h3>Danh sách phòng</h3><div class="sub">Chỉ thêm phòng có trong nguồn hoặc đã đối chiếu thực tế.</div></div>'+button('Thêm phòng','room-edit',{},false,'plus')+'</div><div id="intake-rooms"></div></section>';
    const fees=()=>'<section class="intake-form-group"><h3>Biểu phí dịch vụ</h3><p class="muted small">Hiệu lực từ ngày tính tiền phòng. Để trống đơn giá nếu không thu; giá trị 0 là mức phí đã khai báo.</p><div class="tbl-wrap"><table class="tbl intake-fee-table"><thead><tr><th>Khoản phí</th><th class="num">Đơn giá (VND)</th><th>Cách tính</th><th>Nguồn đối chiếu</th></tr></thead><tbody>'+I.fees.map(([key,label,method])=>'<tr><td><b>'+esc(label)+'</b></td><td><div class="field" data-field="fee:'+key+'">'+V.moneyInput({name:'fee-'+key,value:draft.items[key]?.unit??'',placeholder:'Không thu',attrs:{'data-fee':key,'aria-label':'Đơn giá '+label}})+'</div></td><td>'+U.select({name:'method-'+key,value:draft.items[key]?.method||method,options:Object.entries(V.methods),attrs:{'data-method':key,'aria-label':'Cách tính '+label}})+'</td><td>'+V.sourceButton('fee:'+key,draft.sources['fee:'+key])+'</td></tr>').join('')+'</tbody></table></div></section>';
    const linkPicker=()=>step===0?'<section class="intake-form-group">'+U.field({label:'Liên kết hồ sơ '+(kind==='owner'?'chủ nhà':'khách hàng')+' đã có',help:'Chọn sau khi đối chiếu giấy tờ. Thông tin khác nhau sẽ được rà soát trước khi ghi.',input:U.select({name:'existing-party',value:draft.selectedPartyId||'',options:[['','Tự đối chiếu theo giấy tờ / SĐT'],...S.all(kind==='owner'?'owners':'customers').map(x=>[x.id,x.name+' · '+TH.q.pii(x.phone||x.idNo||x.id)])],attrs:{id:'intake-existing-party','aria-label':'Liên kết hồ sơ đã có'}})})+'</section>':kind==='tenant'&&step===1?'<section class="intake-form-group">'+U.field({label:'Đối chiếu phòng hiện có',help:'Chọn để áp dụng mã phòng và địa chỉ tòa.',input:U.select({name:'existing-room',options:[['','Chọn phòng'],...S.all('rooms').filter(r=>TH.auth.inScopeRoom(r.id)&&r.exploitation!=='meter_common').map(r=>[r.id,r.code+' · '+TH.q.building(r.buildingId)?.address])],attrs:{id:'intake-existing-room','aria-label':'Đối chiếu phòng hiện có'}})})+'</section>':'';
    const conflict=(c,index,existing=false)=>'<section class="intake-conflict"><div class="row between wrap"><b>'+esc(V.label(c.key))+'</b>'+U.chip(existing&&draft.existingChoices?.[c.key]==='source'?'Đã chọn nguồn mới':'Cần đối chiếu','amber')+'</div><div class="intake-compare"><div><small>Giá trị hiện có</small><p>'+esc(V.value(c.key,c.before))+'</p></div><div><small>Giá trị từ nguồn</small><p>'+esc(V.value(c.key,c.next))+'</p><span class="help">'+esc(V.source(c.source))+'</span></div></div><div class="row wrap">'+button('Giữ giá trị hiện có',existing?'existing':'resolve',existing?{'data-key':c.key,'data-choice':'old'}:{'data-index':index,'data-choice':'old'})+button('Áp dụng nguồn bổ sung',existing?'existing':'resolve',existing?{'data-key':c.key,'data-choice':'source'}:{'data-index':index,'data-choice':'new'})+'</div></section>';
    const errorSummary=review=>review.errors.length?'<div role="alert">'+U.note('danger',review.errors.length+' vấn đề cần xử lý','<ul class="intake-errors">'+review.errors.map(error=>{const key=Object.keys(review.fieldErrors).find(k=>review.fieldErrors[k].includes(error));return '<li>'+(key?button(error,'error',{'data-key':key}):esc(error))+'</li>';}).join('')+'</ul>')+'</div>':U.note('ok','Thông tin hợp lệ','Đối chiếu bản gốc và xác nhận trước khi ghi hồ sơ.');
    const reviewBody=review=>'<div class="row between wrap mb16"><div><b>'+esc(draft.data.name||'Chưa có tên')+'</b><div class="muted small mt4">'+esc([draft.data.buildingCode,draft.data.roomCode].filter(Boolean).join(' · '))+'</div></div>'+U.chip(review.status,review.errors.length?'amber':'green',true)+'</div>'+planned(review)+errorSummary(review)
      +(review.warnings.length?'<details class="intake-details mt16"><summary>'+review.warnings.length+' lưu ý cần đối chiếu</summary>'+review.warnings.map(w=>'<p>'+esc(w)+'</p>').join('')+'</details>':'')
      +draft.conflicts.map((c,i)=>conflict(c,i)).join('')+review.existingConflicts.map((c,i)=>conflict(c,i,true)).join('')
      +draft.sourceErrors.map((e,i)=>'<section class="intake-conflict">'+U.note('warn','Nguồn chưa dùng được',esc(e.message))+button('Đã đối chiếu, không dùng giá trị lỗi','dismiss',{'data-index':i})+'</section>').join('')
      +'<details class="intake-details mt16"><summary>Thông tin và nguồn từng trường</summary><div class="intake-review-fields">'+I.fields[kind].map(f=>'<div><b>'+esc(f[1])+'</b><span>'+esc(V.value(f[0],draft.data[f[0]]))+'</span>'+V.sourceButton(f[0],draft.sources[f[0]])+'</div>').join('')+'</div></details>'
      +(draft.rooms.length?'<details class="intake-details mt16"><summary>'+draft.rooms.length+' phòng và nguồn đối chiếu</summary>'+draft.rooms.map(r=>'<div class="intake-source-row"><b>'+esc(r.code)+'</b><span>'+esc(TH.data.catalog.exploitation[r.exploitation]||r.exploitation)+'</span>'+['number','floor','exploitation','listPrice','mgmtPrice','price'].map(key=>'<small>'+esc(V.label(key))+': '+esc(V.value(key,r[key]))+' '+V.sourceButton('room:'+r.code+':'+key,r.sources?.[key]||r.source)+'</small>').join('')+'</div>').join('')+'</details>':'')
      +'<div class="intake-confirm mt16">'+U.check({name:'reviewed',checked:draft.reviewed,attrs:{id:'intake-confirm',disabled:busy||committing},label:'Tôi đã đối chiếu nguồn, trạng thái, phí, số dư và đồng ý liên kết các hồ sơ hiện có.'})+'</div>';
    function render() {
      if(!active())return;
      const review=I.validate(draft);
      TH.layout.crumb([{label:kind==='owner'?'Chủ nhà':'Khách hàng',href:back},{label:'Thêm hồ sơ'},{label:steps[step]}]);
      const tabs=U.tabs(modes,mode,'intake-modes','intake-mode');
      const upload=mode==='manual'?U.note('info','Nhập thông tin thủ công','Điền thông tin đã đối chiếu. Bạn có thể bổ sung hợp đồng hoặc Excel mà không mất dữ liệu đang nhập.')
        :U.dropzone({name:'intake',hint:mode==='contract'?'PDF, JPG, PNG · tối đa 30 MB/file. File Word cần xuất PDF trước khi trích xuất.':'XLSX, CSV · tối đa 30 MB/file. Chọn sheet và kiểm tra ánh xạ trước khi nhập.',multiple:false,accept:mode==='contract'?'.pdf,.jpg,.jpeg,.png':'.xlsx,.csv'})
        +(sheets.length&&mode==='excel'?'<div class="intake-mapping mt16">'+U.field({label:'Sheet / phạm vi nhập',input:U.select({name:'sheet',value:sheetIndex,options:sheets.map((s,i)=>[i,s.name]),attrs:{id:'intake-sheet','aria-label':'Chọn sheet / phạm vi nhập'}})})+'<div id="intake-mapping" class="mt16"></div>'+button('Đọc các dòng trong sheet','sheet',{},false,'list')+'</div>':'');
      const wizard=U.wizard(steps.map((title,i)=>({title,sub:i===3?(review.errors.length?review.errors.length+' vấn đề':'Sẵn sàng đối chiếu'):Object.keys(review.fieldErrors).some(k=>stepFor(k)===i)?'Cần bổ sung':'Thông tin hồ sơ'})),step);
      previewObserver?.disconnect();
      root.innerHTML=U.pageHead({title:kind==='owner'?'Thêm chủ nhà':'Thêm khách hàng',back,sub:'Nhập hợp đồng, đối chiếu thông tin và xác nhận hồ sơ.',chips:U.chip('Bản nháp','gray'),acts:[button('Mở bản nháp','drafts',{},false,'folder'),button('Lưu nháp','save',{},false,'save')]})
        +'<div class="intake-workspace">'+U.card({cls:'mb16',bodyCls:'intake-entry',body:'<div class="row between wrap">'+tabs+(mode==='excel'?button('Tải mẫu Excel','template',{},false,'download'):'')+'</div>'+upload+'<div id="intake-progress" role="status" aria-live="polite" class="intake-status '+messageTone+'">'+(message?esc(message):'')+'</div>'+(busy?'<progress class="intake-progress" max="1" value="'+progress+'" aria-label="Tiến trình đọc file"></progress>'+button('Hủy đọc file','cancel'):lastFile&&messageTone==='danger'?button('Thử đọc lại','retry',{},false,'refresh'):'')})
        +(queue.length?U.card({title:queue.length+' bộ hồ sơ từ sheet',cls:'mb16',sub:'Mở từng bộ để bổ sung hoặc gộp nguồn trước khi xác nhận.',body:'<div id="intake-queue"></div>',bodyCls:'flush',footer:button('Xác nhận các bộ đã chọn, hợp lệ','batch',{'disabled':busy||committing})}):'')
        +wizard+'<div class="intake-review-layout '+(mode==='contract'?'with-preview':'')+'">'
        +(mode==='contract'?U.card({title:'File hợp đồng gốc',icon:'file-text',cls:'intake-preview',body:previewShell()}):'')
        +U.card({title:steps[step],sub:'Bước '+(step+1)+' / 4 · Trường có dấu * là bắt buộc.',cls:'intake-form-card',body:step<3?form(review)+linkPicker()+(kind==='owner'&&step===2?roomEditor():'')+(kind==='tenant'&&step===2?fees():''):reviewBody(review)})+'</div>'
        +'<footer class="card intake-footer"><div><b>Bước '+(step+1)+' / 4</b><small>'+(busy?'Đang đọc file…':committing?'Đang ghi hồ sơ…':draft.updatedAt?'Đã lưu nháp '+F.datetime(draft.updatedAt):'Chỉ ghi hồ sơ sau khi xác nhận rà soát')+'</small></div><div class="row wrap">'+(step?button('Quay lại','prev',{'disabled':busy||committing},false,'arrow-left'):'')+(step<3?button('Tiếp tục','next',{'disabled':busy||committing},true,'arrow-right'):button('Xác nhận hồ sơ','commit',{'disabled':!!review.errors.length||!draft.reviewed||busy||committing},true,'check-circle'))+'</div></footer>'
        +U.card({title:'File đính kèm và lịch sử',icon:'folder',cls:'mt16',actions:button('Lịch sử thao tác','history',{},false,'history'),body:draft.files.map(f=>U.fileItem({name:f.name,size:Math.round(f.size/1024)+' KB'},button('Tải file gốc','file',{'data-file':f.id},false,'download')+(/\.(pdf|png|jpe?g)$/i.test(f.name)?button('Xem file','preview',{'data-file':f.id},false,'eye'):''))).join('')||'<p class="muted">Chưa đính kèm file. Có thể nhập tay hoặc bổ sung nguồn sau.</p>'})+'</div>';
      root.querySelectorAll('.wizard .wz-step').forEach((el,i)=>{
        const b=document.createElement('button');b.type='button';b.className=el.className;b.dataset.intake='step';b.dataset.step=i;b.disabled=busy||committing;b.innerHTML=el.innerHTML;b.setAttribute('aria-current',i===step?'step':'false');el.replaceWith(b);
        const valid=!Object.keys(review.fieldErrors).some(k=>stepFor(k)===i);b.classList.toggle('done',i<step&&valid);if(i<step&&!valid)b.querySelector('.n').textContent=i+1;
      });
      root.querySelector('.wizard').setAttribute('aria-label','Các bước nhập hồ sơ');
      const fileInput=root.querySelector('[data-dz] input');if(fileInput){fileInput.id='intake-file';fileInput.disabled=busy||committing;const dz=fileInput.closest('.dropzone');dz.setAttribute('role','button');dz.setAttribute('tabindex','0');dz.setAttribute('aria-label',mode==='contract'?'Chọn hợp đồng PDF, JPG, PNG':'Chọn workbook XLSX hoặc CSV');dz.onclick=e=>{if(e.target!==fileInput&&!busy&&!committing)fileInput.click();};dz.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();if(!busy&&!committing)fileInput.click();}};fileInput.onchange=()=>read(fileInput.files[0]);dz.ondragover=e=>{e.preventDefault();dz.classList.add('hover');};dz.ondragleave=()=>dz.classList.remove('hover');dz.ondrop=e=>{e.preventDefault();dz.classList.remove('hover');if(!busy&&!committing)read(e.dataTransfer.files[0]);};}
      root.oninput=e=>{const el=e.target;if(el.matches('[data-money]')&&el.value.trim()!==''&&/^[\d.,]+$/.test(el.value))el.value=F.vnd(F.num(el.value));};
      root.querySelectorAll('[data-input]').forEach(el=>{el.onchange=()=>{touched.add(el.dataset.input);change(el.dataset.input,el.hasAttribute('data-money')?(moneyValue(el.value)):el.type==='number'?(el.value===''?'':Number(el.value)):el.value);updateFieldErrors();};});
      root.querySelectorAll('[data-fee],[data-method]').forEach(el=>el.onchange=()=>{
        const key=el.dataset.fee||el.dataset.method,old=draft.items[key],value=root.querySelector('[data-fee="'+key+'"]').value;
        if(value.trim()===''){delete draft.items[key];delete draft.sources['fee:'+key];}else{draft.items[key]={unit:moneyValue(value),method:root.querySelector('[data-method="'+key+'"]').value};draft.sources['fee:'+key]={file:'Nhập tay',raw:clone(draft.items[key]),at:F.nowISO()};}
        if(JSON.stringify(old)!==JSON.stringify(draft.items[key]))record({action:'edit-fees',key:'fee:'+key,before:old,value:draft.items[key]});touched.add('fee:'+key);updateFieldErrors();
      });
      const room=root.querySelector('#intake-existing-room');if(room)room.onchange=()=>{const r=TH.q.room(room.value);if(!r)return;const b=TH.q.building(r.buildingId);change('roomCode',r.code);change('buildingCode',b.code);change('buildingAddress',b.address);render();};
      const party=root.querySelector('#intake-existing-party');if(party)party.onchange=()=>{draft.selectedPartyId=party.value||null;draft.existingChoices={};record({action:'select-existing-party',partyId:draft.selectedPartyId});render();};
      const confirm=root.querySelector('#intake-confirm');if(confirm)confirm.onchange=()=>{draft.reviewed=confirm.checked;root.querySelector('[data-intake="commit"]').disabled=!draft.reviewed||!!I.validate(draft).errors.length||busy||committing;};
      root.querySelectorAll('[data-intake]').forEach(el=>el.onclick=async()=>{if(el.disabled)return;try{await action(el);}catch(e){if(active()){message=e.message;messageTone='danger';render();}}});
      root.querySelectorAll('[data-act="intake-mode"]').forEach(el=>{el.disabled=busy||committing;el.onclick=async()=>{if(busy||committing)return;try{mode=el.dataset.key;render();await persist();}catch(e){message=e.message;messageTone='danger';render();}};});
      const sh=root.querySelector('#intake-sheet');if(sh){sh.onchange=()=>{sheetIndex=Number(sh.value);mapping();};mapping();}
      if(step===2&&kind==='owner')mountRooms();if(queue.length)mountQueue();updateFieldErrors();
      if(busy||committing){root.querySelectorAll('[data-input],[data-fee],[data-method],[data-map],#intake-sheet,#intake-existing-party,#intake-existing-room').forEach(el=>el.disabled=true);}
      TH.auth.enforceUI(root);
      if(mode==='contract'){const stage=root.querySelector('#intake-preview-stage');if(stage){previewWidth=stage.clientWidth;previewObserver=new ResizeObserver(()=>{if(active()&&Math.abs(stage.clientWidth-previewWidth)>1){previewWidth=stage.clientWidth;if(previewDoc||previewUrl)paintPreview();}});previewObserver.observe(stage);}const f=draft.files.find(f=>f.id===previewId)||draft.files.find(f=>/\.(pdf|png|jpe?g)$/i.test(f.name));if(f)showPreview(f.id,previewPage);}
    }
    function updateFieldErrors(){const r=I.validate(draft),errors={};for(const [key,msg] of Object.entries(r.fieldErrors)){if(showErrors||touched.has(key))errors[key]=msg;}U.setErrors(root,errors);root.querySelectorAll('[data-input]').forEach(el=>el.setAttribute('aria-invalid',errors[el.dataset.input]?'true':'false'));}
    function mountRooms(){U.table(root.querySelector('#intake-rooms'),{rows:draft.rooms,noPager:true,empty:U.empty({icon:'building',title:'Chưa có phòng trong bản nháp',text:'Đọc hợp đồng hoặc thêm phòng đã được đối chiếu.'}),cols:[
      {key:'number',label:'Phòng',render:r=>'<b class="code">'+esc(I.roomCode(r.number,draft.data.buildingCode))+'</b>'},
      {key:'floor',label:'Tầng'},
      {key:'exploitation',label:'Loại khai thác',render:r=>esc(TH.data.catalog.exploitation[r.exploitation]||r.exploitation)},
      ...[['listPrice','Giá niêm yết'],['mgmtPrice','Giá quản lý'],['price','Giá thuê']].map(([key,label])=>({key,label,num:true,render:r=>r[key]==null?'—':F.vnd(r[key])})),
      {key:'actions',label:'Thao tác',render:(r,i)=>button('Sửa','room-edit',{'data-index':i},false,'pencil')+button('Bỏ','room-remove',{'data-index':i},false,'trash')}
    ]});root.querySelectorAll('#intake-rooms [data-intake]').forEach(el=>el.onclick=()=>action(el).catch(e=>U.toast('err','Không thực hiện được',e.message)));}
    function mountQueue(){U.table(root.querySelector('#intake-queue'),{rows:queue,noPager:true,cols:[
      {key:'select',label:'Chọn',render:(d,i)=>'<input type="checkbox" data-select="'+i+'" aria-label="Chọn dòng '+esc(d.sourceRow||i+1)+'" '+(d.selected?'checked':'')+' '+(committing?'disabled':'')+'>'},
      {key:'row',label:'Dòng nguồn',render:(d,i)=>d.sourceRow||i+1},
      {key:'code',label:'Tòa / phòng',render:d=>'<b class="code">'+esc(d.data.roomCode||d.data.buildingCode||'Chưa có mã')+'</b>'},
      {key:'name',label:'Tên hồ sơ',render:d=>esc(d.data.name||'Thiếu tên')},
      {key:'status',label:'Kiểm tra',render:d=>{const v=I.validate(d);return S.get('intakeResults',d.id)?U.chip('Đã nhập','green'):U.chip(v.status,v.errors.length?'amber':'green',true);}},
      {key:'actions',label:'Thao tác',render:(d,i)=>button('Mở sửa','queue',{'data-index':i},false,'pencil')+button('Gộp nguồn','merge',{'data-index':i},false,'plus')}
    ]});root.querySelectorAll('[data-select]').forEach(el=>el.onchange=()=>queue[Number(el.dataset.select)].selected=el.checked);root.querySelectorAll('#intake-queue [data-intake]').forEach(el=>el.onclick=()=>action(el).catch(e=>U.toast('err','Không thực hiện được',e.message)));}
    function editRoom(index){
      const old=index===undefined?null:draft.rooms[index],r=old||{exploitation:'timehouse'};
      K.formDrawer({title:old?'Sửa phòng '+r.code:'Thêm phòng vào bản nháp',wide:true,note:U.note('info','Thông tin phòng','Chỉ nhập phòng đã được đối chiếu. Giá và lịch sử của phòng hiện có được giữ khi liên kết.'),fields:[
        {name:'number',label:'Số phòng',req:true,value:r.number||''},{name:'floor',label:'Tầng',type:'number',value:r.floor??0},
        {name:'exploitation',label:'Loại khai thác',type:'select',options:Object.entries(TH.data.catalog.exploitation),value:r.exploitation,req:true,span:true},
        ...[['listPrice','Giá niêm yết'],['mgmtPrice','Giá quản lý'],['price','Giá thuê']].map(([name,label])=>({name,label,type:'money',value:r[name]??''})),
        ...(old?[{type:'html',span:true,html:['number','floor','exploitation','listPrice','mgmtPrice','price'].map(key=>'<div class="intake-source-row"><b>'+esc(V.label(key))+'</b><small>'+esc(V.source(r.sources?.[key]||r.source))+'</small></div>').join('')}]:[])
      ],submit:'Lưu phòng vào nháp',onSubmit:(data,drawer)=>{
        const number=I.code(data.number),code=I.roomCode(number,draft.data.buildingCode),errs={};
        if(!/^\d+[A-Z]*$/.test(number))errs.number='Số phòng không hợp lệ';
        if(draft.rooms.some((x,i)=>i!==index&&I.roomCode(x.number,draft.data.buildingCode)===code))errs.number='Phòng đã có trong bản nháp';
        if(!Number.isFinite(Number(data.floor))||Number(data.floor)<0)errs.floor='Tầng phải là số không âm';
        if(/^0{2,}/.test(number)&&data.exploitation!=='meter_common')errs.exploitation='Phòng đồng hồ chung phải chọn đúng loại khai thác';
        for(const key of ['listPrice','mgmtPrice','price']){const raw=drawer.el.querySelector('[name="'+key+'"]').value;data[key]=raw.trim()===''?undefined:moneyValue(raw);if(data[key]!=null&&(!Number.isFinite(data[key])||data[key]<0))errs[key]='Giá phải là số không âm';}
        if(Object.keys(errs).length)throw Object.assign(new Error('Kiểm tra thông tin phòng'),{fields:errs});
        const value={...old,...data,number,code,sources:{...old?.sources}};
        for(const key of ['number','floor','exploitation','listPrice','mgmtPrice','price'])if(String(old?.[key]??'')!==String(value[key]??''))value.sources[key]={file:'Nhập tay',raw:value[key],at:F.nowISO()};
        if(old)draft.rooms[index]=value;else draft.rooms.push(value);
        record({action:'edit-rooms',key:'rooms',before:old?[old]:[],value:[value]});showErrors=true;render();
      }});
    }
    function mapping(){
      const s=sheets[sheetIndex],profile=I.sheetProfile(s.name),box=root.querySelector('#intake-mapping');
      if(profile!=='template'){box.innerHTML=U.note(profile==='reference'?'warn':'info',profile==='reference'?'Sheet chỉ dùng đối chiếu':'Đã nhận diện cấu trúc sheet',profile==='reference'?'Không tạo hồ sơ từ sheet này.':'Bỏ dòng tổng, giữ nguồn ô/công thức. Bổ sung tên, ngày và địa chỉ còn thiếu.');return;}
      const map=I.mapping(s.rows[0]||[]),keys=[...new Set([...I.fields[kind].map(f=>f[0]),'number','floor','exploitation','listPrice','mgmtPrice','price',...I.fees.flatMap(([k])=>[k+'Unit',k+'Method'])])];
      const mapLabel=key=>{const fee=I.fees.find(([k])=>key===k+'Unit'||key===k+'Method');return fee?fee[1]+' · '+(key.endsWith('Unit')?'Đơn giá':'Cách tính'):V.label(key);};
      box.innerHTML='<details open class="intake-details"><summary>Ánh xạ cột · dòng đầu là tiêu đề</summary><div class="form-grid mt16">'+(s.rows[0]||[]).map((h,i)=>U.field({label:h||'Cột '+(i+1),input:U.select({name:'map-'+i,value:Object.keys(map).find(k=>map[k]===i)||'',options:[['','Không nhập'],...keys.map(k=>[k,mapLabel(k)])],attrs:{'data-map':i,'aria-label':'Ánh xạ '+(h||'cột '+(i+1))}})})).join('')+'</div></details>';
    }
    const schedule=()=>{const d=draft.data;if(!(d.rent>0&&d.startDate&&d.endDate&&d.payMonths>0))return '<p>Hoàn thiện thời hạn, giá và kỳ trả để xem lịch dự kiến.</p>';let from=d.startDate.slice(0,8)+'01',cur=F.today().slice(0,8)+'01';if(from<cur)from=cur;const until=F.addMonths(cur,12),rows=[];for(let month=from;month<until&&month<=d.endDate&&rows.length<12;month=F.addMonths(month,+d.payMonths)){const months=Array.from({length:+d.payMonths},(_,i)=>F.addMonths(month,i)).filter(x=>x<=d.endDate).length,dueMonth=F.addMonths(month,+d.dueMonthOffset||0),last=+TH.calc.dates.addDays(F.addMonths(dueMonth,1),-1).slice(-2),due=dueMonth.slice(0,8)+String(Math.min(+d.dueDay||1,last)).padStart(2,'0');rows.push(`<tr><td>${F.date(month)}</td><td>${months} tháng</td><td>${F.date(due)}</td><td class="num">${F.vnd(months*d.rent)}</td></tr>`);}return rows.length?`<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Từ kỳ</th><th>Thời lượng</th><th>Hạn trả</th><th class="num">Số phải trả</th></tr></thead><tbody>${rows.join('')}</tbody></table></div><p class="muted">Hiển thị lịch trong 12 tháng tới; các kỳ tiếp theo được tạo khi vận hành gia hạn lịch.</p>`:'<p>Hợp đồng bắt đầu ngoài cửa sổ lịch 12 tháng tới.</p>';};
    const planned=review=>kind==='owner'?`<div class="intake-summary"><p>Chủ nhà: <b>${review.links.party?'Liên kết hồ sơ hiện có':'Tạo mới'}</b> · Hợp đồng: <b>${review.links.contract?'Liên kết':'Tạo mới'}</b> · Tòa: <b>${review.links.building?'Liên kết':'Tạo mới'}</b> · Phòng mới: <b>${draft.rooms.filter(r=>!S.one('rooms',x=>I.code(x.code)===I.code(r.code))).length}</b> / ${draft.rooms.length}</p><h3>Lịch trả chủ nhà dự kiến</h3>${schedule()}</div>`:`<div class="intake-summary"><p>Khách hàng: <b>${review.links.party?'Liên kết hồ sơ hiện có':'Tạo mới'}</b> · Phòng: <b>${review.links.room?esc(review.links.room.code):'Chưa khớp'}</b> · Lượt thuê: <b>${review.links.stay?'Liên kết':'Tạo mới'}</b> · Trạng thái: <b>${esc(V.value('status',draft.data.status))}</b></p><p>Giá thuê ${F.vnd(draft.data.rent||0)}/tháng · cọc hợp đồng ${F.vnd(draft.data.deposit||0)} · ${Object.keys(draft.items).length} loại phí từ ${F.date(draft.data.startDate)}.</p><p>Cọc cũ đang giữ: ${F.vnd(draft.data.openingDeposit||0)}; nợ đầu kỳ: ${F.vnd(draft.data.openingDebt||0)}; đề xuất thu chờ chứng từ: ${F.vnd(draft.data.declaredPaid||0)}.</p></div>`;

    function previewShell(){
      const files=draft.files.filter(f=>/\.(pdf|png|jpe?g)$/i.test(f.name));
      if(!files.length)return U.empty({icon:'file-text',title:'Chưa có file hợp đồng',text:'Chọn PDF hoặc ảnh ở vùng tải file để trích xuất và đối chiếu.'});
      return U.select({name:'preview-file',value:previewId||files[0].id,options:files.map(f=>[f.id,f.name]),attrs:{id:'intake-preview-file','aria-label':'File đang đối chiếu'}})
        +'<div class="intake-preview-tools"><div class="row">'+button('','page-prev',{'disabled':true,'aria-label':'Trang trước'},false,'chevron-left')+'<span id="intake-page-count" class="small">Trang '+previewPage+'</span>'+button('','page-next',{'disabled':true,'aria-label':'Trang sau'},false,'chevron-right')+'</div><div class="row">'+button('','zoom-out',{'disabled':true,'aria-label':'Thu nhỏ'},false,'minus')+'<span id="intake-zoom" class="small">'+Math.round(zoom*100)+'%</span>'+button('','zoom-in',{'disabled':true,'aria-label':'Phóng to'},false,'plus')+'</div></div>'
        +'<div id="intake-preview-status" role="status" aria-live="polite" class="small muted"></div><div id="intake-preview-stage" class="intake-preview-stage"><canvas aria-label="Trang hợp đồng gốc"></canvas><img alt="Ảnh hợp đồng gốc" hidden></div>';
    }
    async function showPreview(id,page=1){
      if(!active()||mode!=='contract')return;
      const stage=root.querySelector('#intake-preview-stage');if(!stage)return;
      if(previewId===id&&(previewDoc||previewUrl)){previewPage=page;await paintPreview();return;}
      clearPreview();previewId=id;previewPage=page;const load=previewLoad;
      const status=root.querySelector('#intake-preview-status');status.textContent='Đang mở file gốc…';
      try{
        const f=await B.file(id);if(!active()||load!==previewLoad)return;
        if(/\.pdf$/i.test(f.name)){
          const lib=await import('../../vendor/intake/pdf/pdf.mjs');if(!active()||load!==previewLoad)return;
          lib.GlobalWorkerOptions.workerSrc='vendor/intake/pdf/pdf.worker.mjs';
          previewTask=lib.getDocument({data:new Uint8Array(await f.blob.arrayBuffer()),standardFontDataUrl:'vendor/intake/standard_fonts/',cMapUrl:'vendor/intake/cmaps/',cMapPacked:true});
          const doc=await previewTask.promise;if(!active()||load!==previewLoad){await doc.destroy();return;}
          previewDoc=doc;
        }else previewUrl=URL.createObjectURL(f.blob);
        if(!active()||load!==previewLoad)return;
        await paintPreview();
      }catch(e){if(active()&&load===previewLoad){status.textContent='';stage.innerHTML=U.empty({icon:'alert-circle',title:'Không mở được file gốc',text:esc(e.message)+' Chọn lại file ở vùng tải lên; dữ liệu nháp vẫn được giữ.'});}}
    }
    async function paintPreview(){
      if(!active()||mode!=='contract')return;
      const stage=root.querySelector('#intake-preview-stage');if(!stage)return;
      const draw=++previewPaint;canvasTask?.cancel();canvasTask=null;
      const doc=previewDoc;previewPage=Math.max(1,Math.min(previewPage,doc?.numPages||1));
      root.querySelector('#intake-page-count').textContent=doc?'Trang '+previewPage+' / '+doc.numPages:'Ảnh gốc';
      root.querySelector('#intake-zoom').textContent=Math.round(zoom*100)+'%';
      const select=root.querySelector('#intake-preview-file');select.value=previewId;select.onchange=()=>showPreview(select.value,1);
      root.querySelector('[data-intake="page-prev"]').disabled=!doc||previewPage<=1;
      root.querySelector('[data-intake="page-next"]').disabled=!doc||previewPage>=doc.numPages;
      root.querySelector('[data-intake="zoom-out"]').disabled=zoom<=0.5;
      root.querySelector('[data-intake="zoom-in"]').disabled=zoom>=2;
      const canvas=stage.querySelector('canvas'),img=stage.querySelector('img');if(!canvas||!img)return;
      root.querySelector('#intake-preview-status').textContent='';
      if(previewUrl){canvas.hidden=true;img.hidden=false;img.src=previewUrl;img.style.width=Math.round(Math.max(240,stage.clientWidth-24)*zoom)+'px';return;}
      if(!doc)return;
      try{
        const page=await doc.getPage(previewPage);if(!active()||draw!==previewPaint)return;
        const base=page.getViewport({scale:1}),scale=Math.max(0.25,(stage.clientWidth-24)/base.width)*zoom,viewport=page.getViewport({scale});
        const dpr=window.devicePixelRatio||1;canvas.hidden=false;img.hidden=true;canvas.width=Math.floor(viewport.width*dpr);canvas.height=Math.floor(viewport.height*dpr);canvas.style.width=Math.floor(viewport.width)+'px';canvas.style.height=Math.floor(viewport.height)+'px';
        canvasTask=page.render({canvasContext:canvas.getContext('2d'),viewport,transform:dpr===1?undefined:[dpr,0,0,dpr,0,0]});await canvasTask.promise;
      }catch(e){if(e.name!=='RenderingCancelledException'&&active()&&draw===previewPaint)root.querySelector('#intake-preview-status').textContent='Không hiển thị được trang: '+e.message;}
    }
    async function read(file){
      if(!file||busy||committing||!active())return;
      controller?.abort();const run=++readRun,abort=new AbortController();controller=abort;lastFile=file;busy=true;progress=0;message='Đang lưu file gốc…';messageTone='info';render();
      const valid=()=>active()&&run===readRun&&!abort.signal.aborted;
      try{
        const f=await B.addFile(file,kind);if(!valid())return;
        if(!draft.files.some(x=>x.id===f.id))draft.files.push(f);selectedFile=f;draft.reviewed=false;
        if(/\.(xlsx|csv)$/i.test(file.name)){
          const result=await B.workbook(file);if(!valid())return;sheets=result;sheetIndex=0;message='Chọn sheet, kiểm tra ánh xạ rồi đọc dòng.';
        }else{
          previewId=f.id;previewPage=1;clearPreview();
          const pages=await B.contract(file,{signal:abort.signal,progress:(m,p)=>{if(!valid())return;message=m;progress=Math.min(1,Math.max(0,p||0));const el=root.querySelector('#intake-progress');if(el)el.textContent=m;const bar=root.querySelector('progress');if(bar)bar.value=progress;}});
          if(!valid())return;
          const data=I.extract(kind,pages,file.name);draft.extractedPages=[...(draft.extractedPages||[]),...pages.map(p=>({...p,file:file.name}))];I.merge(draft,data);
          message='Đã đọc '+pages.length+' trang. Đối chiếu thông tin đã nhận dạng; bổ sung các trường còn trống.';messageTone='ok';
        }
        if(valid())await persist();
      }catch(e){if(active()&&run===readRun){message=abort.signal.aborted||e.name==='AbortError'?'Đã hủy đọc file. Có thể chọn lại hoặc thử lại.':e.message;messageTone=abort.signal.aborted?'info':'danger';}}
      finally{if(active()&&run===readRun){busy=false;render();}}
    }
    async function action(el){
      const act=el.dataset.intake;
      if((busy||committing)&&!['cancel','file','source','history','page-prev','page-next','zoom-in','zoom-out'].includes(act))return;
      if(act==='step'||act==='next'||act==='prev'){showErrors=true;step=act==='step'?Number(el.dataset.step):step+(act==='next'?1:-1);render();await persist();}
      if(act==='error'){const key=el.dataset.key;showErrors=true;step=stepFor(key);render();const target=root.querySelector('[name="'+key+'"]')||root.querySelector('[data-field="'+key+'"]');target?.scrollIntoView({block:'center',behavior:'smooth'});target?.focus();}
      if(act==='save'){await persist();message='Đã lưu bản nháp. Bạn có thể mở lại trên trình duyệt này.';messageTone='ok';render();}
      if(act==='cancel'){controller?.abort();readRun++;busy=false;message='Đã hủy đọc file. Dữ liệu đang nhập được giữ nguyên.';messageTone='info';render();}
      if(act==='retry')await read(lastFile);
      if(act==='template')await B.template(kind);
      if(act==='file')await B.download(el.dataset.file);
      if(act==='history')V.historyDrawer(draft);
      if(act==='source'){const s=currentSource(el.dataset.key);if(!s)return;if(s.page){const file=draft.files.find(f=>f.name===s.file);if(file){mode='contract';previewPage=Number(s.page)||1;const id=file.id;render();await showPreview(id,previewPage);root.querySelector('.intake-preview')?.scrollIntoView({block:'start',behavior:'smooth'});}}[...root.querySelectorAll('[data-intake=source]')].find(b=>b.dataset.key===el.dataset.key)?.focus();V.sourceDrawer(el.dataset.key,s);}
      if(act==='preview'){mode='contract';previewId=el.dataset.file;clearPreview();previewPage=1;render();}
      if(['page-prev','page-next','zoom-in','zoom-out'].includes(act)){if(act==='page-prev')previewPage--;if(act==='page-next')previewPage++;if(act==='zoom-in')zoom=Math.min(2,zoom+0.25);if(act==='zoom-out')zoom=Math.max(0.5,zoom-0.25);await paintPreview();}
      if(act==='drafts'){
        await persist();const drafts=(await B.drafts(kind)).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));if(!active())return;
        U.drawer({title:'Bản nháp '+(kind==='owner'?'chủ nhà':'khách hàng'),wide:true,body:drafts.map(d=>U.fileItem({name:d.data.name||d.data.roomCode||d.data.buildingCode||'Hồ sơ chưa có tên',size:'Cập nhật '+F.datetime(d.updatedAt)},U.btn({label:'Tiếp tục',icon:'arrow-right',href:TH.router.href(kind==='owner'?'/owners/new':'/tenants/intake',{return:back,draft:d.id,mode,step:0}),attrs:{'data-open-draft':true}}))).join('')||U.empty({title:'Chưa có bản nháp'}),onMount:drawer=>drawer.el.querySelectorAll('[data-open-draft]').forEach(a=>a.onclick=()=>drawer.close())});
      }
      if(act==='room-edit')editRoom(el.dataset.index===undefined?undefined:Number(el.dataset.index));
      if(act==='room-remove'){const index=Number(el.dataset.index),r=draft.rooms[index];if(await U.confirm({title:'Bỏ phòng khỏi bản nháp',text:'Bỏ phòng '+esc(r.code)+' khỏi danh sách đang nhập?',ok:'Bỏ phòng',danger:true})){draft.rooms.splice(index,1);record({action:'remove-room',key:'rooms',before:[r],value:[]});render();}}
      if(act==='sheet'){
        const s=sheets[sheetIndex];let map=null;
        if(I.sheetProfile(s.name)==='template'){map={};root.querySelectorAll('[data-map]').forEach(el=>{if(el.value){if(map[el.value]!=null)throw new Error('Hai cột cùng ánh xạ '+V.label(el.value));map[el.value]=Number(el.dataset.map);}});}
        queue=I.fromRows(kind,s.rows,{file:selectedFile.name,sheet:s.name,cells:s.cells,mapping:map,asOf:F.today()});
        for(const d of queue){d.id=F.uid('intake');d.files=[selectedFile];d.history=[];await B.saveDraft(d);}
        message=queue.length+' bộ hồ sơ. Mở sửa để bổ sung hoặc gộp vào hồ sơ hiện tại.';messageTone='info';render();
      }
      if(act==='queue'){const previous=draft;draft=queue[Number(el.dataset.index)];step=0;showErrors=false;touched.clear();clearPreview();render();await B.saveDraft(previous);await persist();}
      if(act==='merge'){const other=queue[Number(el.dataset.index)];if(other===draft)throw new Error('Đang mở chính hồ sơ này');I.merge(draft,other);for(const f of other.files)if(!draft.files.some(x=>x.id===f.id))draft.files.push(f);record({action:'merge-source'});await persist();render();}
      if(act==='resolve'){
        const c=draft.conflicts[Number(el.dataset.index)];
        if(el.dataset.choice==='new'){
          if(c.key.startsWith('fee:')){draft.items[c.key.slice(4)]=c.next;draft.sources[c.key]=c.source;}
          else if(c.key.startsWith('room:')){const [,code,key]=c.key.split(':'),r=draft.rooms.find(r=>r.code===code);r[key]=c.next;r.sources||={};r.sources[key]=c.source;}
          else{draft.data[c.key]=c.next;draft.sources[c.key]=c.source;}
        }
        record({action:'resolve',...c,choice:el.dataset.choice});draft.conflicts.splice(Number(el.dataset.index),1);render();
      }
      if(act==='existing'){const c=I.validate(draft).existingConflicts.find(x=>x.key===el.dataset.key);if(!c)throw new Error('Xung đột đã được xử lý');draft.existingChoices||={};if(el.dataset.choice==='old'){draft.data[c.key]=c.before;draft.sources[c.key]={file:'Hồ sơ hiện có',raw:c.before};delete draft.existingChoices[c.key];}else draft.existingChoices[c.key]='source';record({action:'choose-existing-conflict',key:c.key,choice:el.dataset.choice,before:c.before,next:c.next,source:c.source});render();}
      if(act==='dismiss'){const error=draft.sourceErrors.splice(Number(el.dataset.index),1)[0];record({action:'dismiss-source-error',error});render();}
      if(act==='commit'){
        if(!draft.reviewed||I.validate(draft).errors.length)return;
        committing=true;render();try{await persist();if(!active())return;const result=I.commit(draft);await B.saveDraft(draft).catch(()=>{});if(active())TH.go(result.href);}finally{committing=false;if(active())render();}
      }
      if(act==='batch'){
        const selected=queue.filter(d=>d.selected&&!S.get('intakeResults',d.id));if(!selected.length)throw new Error('Chọn ít nhất một bộ hồ sơ chưa nhập');
        const confirm=await U.confirm({title:'Xác nhận nhập hồ sơ',text:'Bạn đã đối chiếu '+selected.length+' bộ được chọn? Chỉ bộ hợp lệ được ghi; các bộ lỗi giữ trong bản nháp.',ok:'Đã đối chiếu – nhập hồ sơ'});if(!confirm||!active())return;
        committing=true;render();let count=0,failed=0;
        try{for(const d of selected){if(!active())break;if(I.validate(d).errors.length){failed++;continue;}try{d.reviewed=true;await B.saveDraft(d);if(!active())break;I.commit(d);count++;await B.saveDraft(d).catch(e=>U.toast('info','Hồ sơ đã được ghi','Không lưu lại được bản nháp: '+e.message));}catch(e){d.reviewed=false;d.sourceErrors.push({key:'commit',message:e.message});await B.saveDraft(d);failed++;}}message='Đã nhập '+count+' bộ hợp lệ; '+failed+' bộ lỗi giữ trong bản nháp.';messageTone=failed?'warn':'ok';}finally{committing=false;render();}
      }
    }
    render();
    if(q.read){const fileId=q.read;delete q.read;try{const f=await B.file(fileId);if(active())await read(f.blob);}catch(e){if(active()){message=e.message;messageTone='danger';render();}}}
  }
  TH.router.handle('/owners/new',(r,p,q)=>workspace(r,p,q,'owner'));
  TH.router.handle('/tenants/intake',(r,p,q)=>workspace(r,p,q,'tenant'));
})(window.TH);

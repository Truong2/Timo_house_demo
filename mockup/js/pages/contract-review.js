/* UI-08: real originals and the same OCR review/apply boundary as existing sessions. */
(function(TH){
  const S=TH.store,Q=TH.q,X=TH.actions,U=TH.ui,K=TH.kit,F=TH.f,B=TH.intakeFiles,V=TH.intakeView,esc=F.esc;
  TH.pages.realOcrReview=(root,p)=>{
    let step=0,busy=false,committing=false,disposed=false,run=0,message='',confirmed=false,signed=false,localErrors={};
    let from=TH.calc.dates.periodStart(TH.calc.dates.nextPeriod(S.meta.period)),controller,pdfTask,pdfDoc,canvasTask,url='',previewId='',page=1,zoom=1,previewRun=0,previewPending=null,paintRun=0;
    root.classList.add('intake-workspace');
    const session=()=>Q.ocrSession(p.id),active=()=>!disposed&&root.isConnected;
    const allowed=()=>{const o=session();if(!o||!TH.auth.can('ocr.review')||!TH.auth.inScope(Q.stay(o.stayId)?.buildingId))throw new Error('Phiên OCR ngoài phạm vi được phép rà soát');return o;};
    const clear=()=>{previewRun++;canvasTask?.cancel();pdfTask?.destroy().catch(()=>{});pdfTask=null;pdfDoc=null;if(url)URL.revokeObjectURL(url);url='';previewId='';previewPending=null;};
    const actor=S.session?.userId;root._deferRefresh=()=>{try{allowed();return actor===S.session?.userId&&TH.ms.on('2');}catch{return false;}};root._dispose=()=>{disposed=true;root.classList.remove('intake-workspace');run++;controller?.abort();clear();};
    try{allowed();}catch(e){root.innerHTML=U.card({body:U.empty({title:e.message})});return;}
    if(session().status==='review')step=1;if(session().status==='applied')step=3;
    const error=e=>{if(active()){message=e.message;busy=false;render();}};
    const mutate=(fn,key)=>{confirmed=false;try{allowed();fn();if(key)delete localErrors[key];update();}catch(e){if(e.fields)Object.assign(localErrors,e.fields);if(key&&e.fields){const group=session().fields.find(f=>f.key===key)?.group;if(group)X.ocrUnconfirmGroup(p.id,group);}update();U.toast('err',e.message);}};
    const groupCard=(group,label,o)=>U.card({title:label,cls:'mb16',body:'<div class="form-grid">'+o.fields.filter(f=>f.group===group).map(f=>{
      const pii=f.key==='idNo'&&!TH.auth.can('customers.pii'),val=pii?Q.pii(f.value):f.value,attrs={id:'ocr-'+f.key,'data-ocr-field':f.key,disabled:pii||o.status!=='review'||busy};
      const control=f.group==='fees'?V.moneyInput({value:val,attrs}):['rent','deposit'].includes(f.key)?V.moneyInput({value:val,attrs}):U.input({value:val,type:/Date|Start/.test(f.key)?'date':'text',attrs});
      const source=pii?'':V.sourceButton(f.key,f.source);
      const fee=f.group==='fees'?U.select({value:f.feeAction,options:[['keep','Giữ phí hiện có (chưa có nguồn)'],['set','Áp dụng đơn giá'],['remove','Không thu khoản này']],attrs:{'data-fee-action':f.key,disabled:o.status!=='review'||busy,'aria-label':'Lựa chọn '+f.label}})+U.select({value:f.method,options:Object.entries(V.methods),attrs:{'data-fee-method':f.key,disabled:o.status!=='review'||busy,'aria-label':'Cách tính '+f.label}}):'';
      return U.field({name:f.key,label:f.label,req:Q.realOcrRequired.includes(f.key),input:control+fee,help:source+(f.edited?' · Đã sửa':'')});
    }).join('')+'</div>'+U.check({name:'group-'+group,label:'Đã đối chiếu nhóm này với bản gốc, gồm trường có độ tin cậy thấp.',checked:!!o.confirmed[group],attrs:{'data-ocr-group':group,disabled:o.status!=='review'||busy}})});
    const compare=o=>{
      const st=Q.stay(o.stayId),cur=Q.rateOf(st.id,from)||{items:{}};
      const terms=Q.ocrTermsCompare(o).filter(t=>o.fields.some(f=>f.key===t.key&&f.value!==''&&f.value!=null)).map(t=>({label:t.label,a:V.value(t.key,t.cur),b:V.value(t.key,t.next),note:t.locked?'Giữ ngày hiện có: đã phát hành hóa đơn':''}));
      const rent=o.fields.find(f=>f.key==='rent');terms.unshift({label:'Giá thuê',a:F.vnd(cur.rent),b:V.value('rent',rent?.value)});
      o.fields.filter(f=>f.group==='fees').forEach(f=>terms.push({label:f.label,a:cur.items[f.key.slice(4)]?F.vnd(cur.items[f.key.slice(4)].unit):'Không thu',b:f.feeAction==='keep'?'Giữ nguyên':f.feeAction==='remove'?'Không thu':V.value('rent',f.value)}));
      return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Trường</th><th>Hiện có</th><th>Sau áp dụng</th><th>Lưu ý</th></tr></thead><tbody>'+terms.map(t=>'<tr><td>'+esc(t.label)+'</td><td class="num">'+esc(t.a)+'</td><td class="num">'+esc(t.b)+'</td><td>'+esc(t.note||'')+'</td></tr>').join('')+'</tbody></table></div>';
    };
    function render(){
      if(!active())return;const o=allowed(),st=Q.stay(o.stayId),file=S.get('contractFiles',o.fileId),open=o.status==='review';
      TH.layout.crumb([{label:'Khách hàng',href:'#/tenants'},{label:st.code,href:'#/stays/'+st.id},{label:'Rà soát hợp đồng'}]);
      root.innerHTML=U.pageHead({title:'Rà soát hợp đồng '+esc(st.code),back:'#/stays/'+st.id+'?tab=hop-dong',sub:'Đọc bản gốc → xác nhận từng nhóm → áp dụng hợp đồng và biểu phí theo ngày hiệu lực.',chips:U.chip(Q.OCR_ST[o.status]?.[0]||o.status,'blue'),acts:[U.btn({label:'Chạy lại OCR',act:'rerun',icon:'refresh',attrs:{disabled:busy||committing}})]})
      +U.wizard(['Tải và đọc file','Khách hàng và phòng','Hợp đồng và biểu phí','Rà soát áp dụng'].map(title=>({title})),step)
      +'<div class="intake-review-layout with-preview">'+U.card({title:'Hợp đồng gốc',cls:'intake-preview',body:U.dropzone({name:'real-ocr',hint:'PDF, JPG, PNG · tối đa 30 MB',multiple:false,accept:'.pdf,.jpg,.jpeg,.png'})+(file?'<p class="small">'+esc(file.name)+'</p>':'')+'<div id="real-ocr-progress" role="status">'+esc(message)+'</div>'+(busy?U.btn({label:'Hủy đọc',act:'cancel'}):'')+'<div class="row wrap mt8">'+U.btn({label:'Trang trước',act:'page-prev'})+'<span id="real-page"></span>'+U.btn({label:'Trang sau',act:'page-next'})+U.btn({label:'−',act:'zoom-out',attrs:{'aria-label':'Thu nhỏ'}})+U.btn({label:'+',act:'zoom-in',attrs:{'aria-label':'Phóng to'}})+'</div><div class="intake-preview-stage"><canvas id="real-ocr-canvas"></canvas><img id="real-ocr-image" alt="Hợp đồng gốc" hidden></div>'})
      +U.card({title:['Tải và đọc file','Khách hàng và phòng','Điều khoản và biểu phí','So sánh trước khi áp dụng'][step],cls:'intake-form-card',body:(step===0?U.note('info','Đối chiếu đúng lượt thuê',esc(st.code)+' · '+esc(Q.roomCode(st.roomId))+'. Chọn file hoặc chạy lại khi bản gốc thiếu.'):step===1?Q.OCR_GROUPS.slice(0,2).map(([g,l])=>groupCard(g,l,o)).join(''):step===2?Q.OCR_GROUPS.slice(2).map(([g,l])=>groupCard(g,l,o)).join(''):compare(o)+U.field({label:'Hiệu lực từ',name:'from',input:U.date({value:from,attrs:{id:'real-ocr-from',disabled:!open||busy}})})+U.check({label:'Bản gốc là hợp đồng đã ký',checked:signed||file?.signed===true,attrs:{id:'real-ocr-signed',disabled:!open}})+U.check({label:'Tôi đã đối chiếu thay đổi và xác nhận áp dụng.',checked:confirmed,attrs:{id:'real-ocr-confirm',disabled:!open}}))+'<div id="real-ocr-errors" class="mt16"></div>'})+'</div>'
      +'<footer class="card intake-footer"><div>Bước '+(step+1)+' / 4 · '+(TH.auth.can('rates.manage')?'Chỉ ghi khi đã rà soát đủ nhóm':'Bạn được rà soát; admin/kế toán áp dụng')+'</div><div class="row wrap">'+(step?U.btn({label:'Quay lại',act:'prev'}):'')+(step<3?U.btn({label:'Tiếp tục',act:'next',cls:'btn-primary',attrs:{disabled:busy}}):TH.auth.can('rates.manage')?U.btn({label:'Áp dụng hợp đồng/biểu phí',act:'apply',cls:'btn-primary',attrs:{disabled:true},id:'real-ocr-apply'}):'')+'</div></footer>';
      root.querySelectorAll('.wizard .wz-step').forEach((el,i)=>{const b=document.createElement('button');b.type='button';b.className=el.className;b.innerHTML=el.innerHTML;b.disabled=busy;b.onclick=()=>{step=i;render();};b.setAttribute('aria-current',step===i?'step':'false');el.replaceWith(b);});
      const input=root.querySelector('[data-dz] input');input.id='real-ocr-upload';input.disabled=busy||committing;input.onchange=()=>upload(input.files[0]);const dz=input.closest('.dropzone');dz.tabIndex=0;dz.setAttribute('role','button');dz.onclick=e=>{if(e.target!==input&&!busy)input.click();};dz.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();input.click();}};dz.ondragover=e=>e.preventDefault();dz.ondrop=e=>{e.preventDefault();if(!busy)upload(e.dataTransfer.files[0]);};
      root.querySelectorAll('[data-ocr-field]').forEach(el=>el.onchange=()=>mutate(()=>{const key=el.dataset.ocrField,f=session().fields.find(f=>f.key===key);if(f.group==='fees')X.realOcrFee(p.id,key,el.value===''?'remove':'set',f.method);X.ocrSetField(p.id,key,el.hasAttribute('data-money')?el.value.replace(/\./g,''):el.value);},el.dataset.ocrField));
      root.querySelectorAll('[data-fee-action],[data-fee-method]').forEach(el=>el.onchange=()=>mutate(()=>{const key=el.dataset.feeAction||el.dataset.feeMethod;if(root.querySelector('[data-fee-action="'+key+'"]').value!=='set')delete localErrors[key];X.realOcrFee(p.id,key,root.querySelector('[data-fee-action="'+key+'"]').value,root.querySelector('[data-fee-method="'+key+'"]').value);}));
      root.querySelectorAll('[data-ocr-group]').forEach(el=>el.onchange=()=>{const g=el.dataset.ocrGroup;mutate(()=>{if(el.checked)X.ocrConfirmGroup(p.id,g,true);else X.ocrUnconfirmGroup(p.id,g);});});
      const confirm=root.querySelector('#real-ocr-confirm');if(confirm)confirm.onchange=()=>{confirmed=confirm.checked;update();};const date=root.querySelector('#real-ocr-from');if(date)date.onchange=()=>{from=date.value;confirmed=false;update();};const sign=root.querySelector('#real-ocr-signed');if(sign)sign.onchange=()=>{signed=sign.checked;confirmed=false;update();};
      U.bind(root,{next:()=>{step++;render();},prev:()=>{step--;render();},cancel:()=>{run++;controller?.abort();busy=false;message='Đã hủy đọc; dữ liệu rà soát được giữ nguyên.';render();},rerun:()=>{const n=X.createRealOcr(o.stayId,o.fileId);TH.go('#/ocr/'+n.id);},apply:()=>{if(committing)return;const ready=Q.ocrReady(session());if(!confirmed||!ready.ok||Object.keys(localErrors).length)return;committing=true;update();try{const res=X.ocrApply(p.id,{from,confirmed:true,signed:signed||file?.signed===true,reason:'Đã đối chiếu bản gốc thật'});U.toast('ok','Đã áp dụng hợp đồng và biểu phí',res.depositWarn?'Cọc theo HĐ khác cọc thực thu; sổ cọc giữ nguyên.':'Hóa đơn đã phát hành giữ nguyên.');TH.go('#/stays/'+st.id+'?tab=bieu-phi');}catch(e){U.toast('err',e.message);}finally{committing=false;update();}},'page-prev':()=>{if(page>1){page--;paint();}},'page-next':()=>{if(page<(pdfDoc?.numPages||1)){page++;paint();}},'zoom-in':()=>{zoom=Math.min(2,zoom+.25);paint();},'zoom-out':()=>{zoom=Math.max(.5,zoom-.25);paint();},source:el=>{const f=session().fields.find(f=>f.key===el.dataset.key);if(f?.source){page=f.source.page||1;paint();V.sourceDrawer(f.key,f.source);}}});
      root.querySelectorAll('[data-intake=source]').forEach(el=>el.onclick=()=>{const f=session().fields.find(f=>f.key===el.dataset.key);if(f?.source){page=f.source.page||1;paint();V.sourceDrawer(f.key,f.source);}});
      update();if(file?.blobId)preview(file.blobId).catch(e=>{if(active())root.querySelector('#real-ocr-progress').textContent=e.message;});
    }
    function update(){
      if(!active())return;const o=session(),r=Q.ocrReady(o),errors={...(r.fieldErrors||{}),...localErrors};
      const review=root.querySelector('#real-ocr-confirm');if(review)review.checked=confirmed;
      root.querySelectorAll('[data-ocr-group]').forEach(el=>el.checked=!!o.confirmed[el.dataset.ocrGroup]);
      root.querySelectorAll('[data-fee-action]').forEach(el=>el.value=o.fields.find(f=>f.key===el.dataset.feeAction).feeAction);
      const issues=Object.entries(errors).map(([key,message])=>({key,message:(o.fields.find(f=>f.key===key)?.label||key)+': '+message,group:o.fields.find(f=>f.key===key)?.group}));
      r.missing.forEach(label=>issues.push({message:'Chưa rà nhóm '+label,group:Q.OCR_GROUPS.find(([,l])=>l===label)?.[0]}));
      root.querySelector('#real-ocr-errors').innerHTML=issues.length?U.note('warn','Cần đối chiếu','<ul class="intake-errors">'+issues.map((x,i)=>'<li><button type="button" class="btn btn-link" data-ocr-error="'+i+'">'+esc(x.message)+'</button></li>').join('')+'</ul>'):o.status==='applied'?U.note('ok','Đã áp dụng','Phiên này chỉ để xem lịch sử.'):U.note('ok','Đã rà soát đủ nhóm','Chọn ngày hiệu lực và xác nhận trước khi áp dụng.');
      root.querySelectorAll('[data-ocr-error]').forEach(el=>el.onclick=()=>{const issue=issues[+el.dataset.ocrError];step=issue.group?['party','place'].includes(issue.group)?1:2:0;render();if(issue.key)root.querySelector('#ocr-'+issue.key)?.focus();});
      U.setErrors(root,errors);const apply=root.querySelector('[data-act=apply]');if(apply)apply.disabled=!r.ok||!!Object.keys(localErrors).length||!confirmed||busy||committing;
      root.querySelectorAll('.wizard .wz-step').forEach((el,i)=>{
        const complete=i===0?o.status!=='uploaded':i===1?['party','place'].every(g=>o.confirmed[g]):i===2?['dates','money','fees','meter'].every(g=>o.confirmed[g]):o.status==='applied';
        el.classList.toggle('done',!!complete);const n=el.querySelector('.n');n.innerHTML=complete?TH.icon('check'):String(i+1);
      });
    }
    async function upload(file){if(!file||busy)return;busy=true;const token=++run;render();try{const blob=await B.addFile(file,'tenant',{stayId:session().stayId});if(!active()||token!==run){await B.cleanupFile(blob.id);return;}const f=X.registerContractFile(session().stayId,{name:blob.name,size:blob.size,blobId:blob.id,hash:blob.hash,source:'ocr',signed:false},true);if(session().fileId===f.id){busy=false;message='Đã bổ sung bản gốc; dữ liệu rà soát được giữ nguyên.';render();if(session().status==='uploaded')await readOriginal();}else{const n=X.createRealOcr(session().stayId,f.id);TH.go('#/ocr/'+n.id);}}catch(e){error(e);}finally{busy=false;}}
    async function readOriginal(){const o=allowed(),file=S.get('contractFiles',o.fileId);if(!file?.blobId)return;busy=true;const token=++run;controller=new AbortController();message='Đang đọc hợp đồng gốc…';render();try{const stored=await B.file(file.blobId);const pages=await B.contract(stored.blob,{signal:controller.signal,progress:m=>{if(active()&&token===run)root.querySelector('#real-ocr-progress').textContent=m;}});if(!active()||token!==run)return;X.realOcrSource(p.id,file.id,TH.intake.extract('tenant',pages,file.name),pages.length);step=1;message='Đã đọc bản gốc. Rà soát từng nhóm trước khi áp dụng.';}catch(e){if(active()&&token===run)message=e.name==='AbortError'?'Đã hủy đọc':e.message;}finally{if(active()&&token===run){busy=false;render();}}}
    async function preview(id){
      if(previewId===id){if(previewPending)await previewPending;await paint();return;}
      clear();previewId=id;const token=previewRun;
      previewPending=(async()=>{
        const f=await B.file(id);if(!active()||token!==previewRun)return;
        if(/\.pdf$/i.test(f.name)){
          const lib=await import('../../vendor/intake/pdf/pdf.mjs'),data=new Uint8Array(await f.blob.arrayBuffer());
          if(!active()||token!==previewRun)return;
          lib.GlobalWorkerOptions.workerSrc='vendor/intake/pdf/pdf.worker.mjs';
          const task=pdfTask=lib.getDocument({data,standardFontDataUrl:'vendor/intake/standard_fonts/'}),doc=await task.promise;
          if(!active()||token!==previewRun){await doc.destroy();return;}pdfDoc=doc;
        }else{if(!active()||token!==previewRun)return;url=URL.createObjectURL(f.blob);}
      })();
      try{await previewPending;if(active()&&token===previewRun)await paint();}finally{if(token===previewRun)previewPending=null;}
    }
    async function paint(){if(!active())return;const token=++paintRun,canvas=root.querySelector('#real-ocr-canvas'),img=root.querySelector('#real-ocr-image');if(!canvas)return;canvasTask?.cancel();root.querySelector('#real-page').textContent=page+' / '+(pdfDoc?.numPages||1)+' · '+Math.round(zoom*100)+'%';try{if(pdfDoc){page=Math.max(1,Math.min(pdfDoc.numPages,page));const pg=await pdfDoc.getPage(page);if(!active()||!canvas.isConnected||token!==paintRun)return;const width=canvas.parentElement.clientWidth||400,v=pg.getViewport({scale:1}),view=pg.getViewport({scale:width/v.width*zoom});canvas.width=view.width;canvas.height=view.height;canvas.hidden=false;img.hidden=true;canvasTask=pg.render({canvasContext:canvas.getContext('2d'),viewport:view});await canvasTask.promise;}else if(url){canvas.hidden=true;img.hidden=false;img.src=url;img.style.width=zoom*100+'%';}}catch(e){if(e.name!=='RenderingCancelledException'&&active())root.querySelector('#real-ocr-progress').textContent=e.message;}}
    render();if(session().status==='uploaded'&&S.get('contractFiles',session().fileId)?.blobId)readOriginal();
  };
})(window.TH);

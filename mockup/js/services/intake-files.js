/* Browser-local originals/drafts and real PDF/image/XLSX readers. No cloud upload. */
(function (TH) {
  const B = TH.intakeFiles = {}, base = 'vendor/intake/';
  const need = kind => TH.actions._.need(kind === 'owner' ? 'owners.manage' : 'tenants.manage');
  let db;
  const open = () => db || (db = new Promise((resolve, reject) => {
    const r = indexedDB.open('timohouse-intake-v1', 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('files', { keyPath: 'id' }); r.result.createObjectStore('drafts', { keyPath: 'id' }); };
    r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
  }));
  const op = async (collection, mode, fn) => {
    const d = await open(); return new Promise((resolve, reject) => {
      const tx = d.transaction(collection, mode), r = fn(tx.objectStore(collection)); let result;
      r.onsuccess = () => { result = r.result; }; tx.oncomplete = () => resolve(result);
      tx.onerror = tx.onabort = () => reject(tx.error || new Error('Không lưu được IndexedDB'));
    });
  };
  const draftAccess = d => {
    need(d.kind);
    if(d.createdBy && d.createdBy !== TH.store.session?.userId) throw new Error('Bản nháp thuộc tài khoản khác');
    if(d.targetStayId && !TH.auth.inScope(TH.q.stay(d.targetStayId)?.buildingId)) throw new Error('Lượt thuê ngoài phạm vi');
  };
  B.saveDraft = async draft => { draftAccess(draft); draft.id ||= TH.f.uid('intake'); draft.createdBy ||= TH.store.session?.userId; draft.updatedAt = TH.f.nowISO(); await op('drafts', 'readwrite', s => s.put(JSON.parse(JSON.stringify(draft)))); return draft; };
  B.drafts = async kind => { need(kind); return (await op('drafts','readonly',s=>s.getAll())).filter(d=>d.kind===kind && (!d.createdBy || d.createdBy === TH.store.session?.userId)); };
  B.getDraft = async id => { const d=await op('drafts','readonly',s=>s.get(id)); if(d) draftAccess(d); return d; };
  const fileBinding = (kind, context = {}) => {
    if(context.stayId){ TH.actions._.needMs('2','OCR hợp đồng');TH.actions._.need('ocr.review'); const st=TH.q.stay(context.stayId);if(!st || !TH.auth.inScope(st.buildingId))throw new Error('Lượt thuê ngoài phạm vi');return {stayId:st.id,buildingId:st.buildingId}; }
    if(kind==='document'){TH.actions._.needMs('2','Kho tài liệu');TH.actions._.need('documents.upload');if(!TH.q.building(context.buildingId)||!TH.auth.inScope(context.buildingId))throw new Error('Tòa ngoài phạm vi');return {buildingId:context.buildingId};}
    need(kind);return {};
  };
  B.addFile = async (file,kind,context={}) => {
    const actor=TH.store.session?.userId,binding=fileBinding(kind,context);
    if(file.size>30*1024*1024) throw new Error('File vượt 30 MB; tách thành các file nhỏ hơn');
    if(kind==='document') TH.actions._.checkFile(file.name);
    else if(!/\.(pdf|png|jpe?g|xlsx|csv)$/i.test(file.name)) throw new Error('Chỉ hỗ trợ PDF, JPG, PNG, XLSX, CSV');
    const buffer=await file.arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(n=>n.toString(16).padStart(2,'0')).join('');
    // Stage uploads separately by actor and binding; a shared hash never grants file access.
    if(actor!==TH.store.session?.userId)throw new Error('Tài khoản đã thay đổi khi đọc file');fileBinding(kind,context);
    const id=kind+'-'+hash+'-'+actor+'-'+(binding.stayId||binding.buildingId||'draft');
    const old=await op('files','readonly',s=>s.get(id));
    const rec=old||{id,kind,name:file.name,size:file.size,blob:file,hash,createdBy:TH.store.session.userId,binding};
    await op('files','readwrite',s=>s.put(rec));return {id:rec.id,name:rec.name,size:rec.size,hash:rec.hash};
  };
  B.file = async id => {
    const actor=TH.store.session?.userId,f=await op('files','readonly',s=>s.get(id));
    if(actor!==TH.store.session?.userId)throw new Error('Tài khoản đã thay đổi khi đọc file');
    // Resolve references after asynchronous storage access so revoked assignments take effect.
    const docs=TH.q.documentsAll?.().filter(d=>d.blobId===id)||[];
    const visible=docs.some(d=>TH.q.canDownloadDoc(d) || (d.status!=='deleted' && d.type==='tenant_contract' && TH.auth.can('ocr.review') && TH.auth.inScope(d.buildingId)) || (d.status!=='deleted' && d.type==='owner_contract' && TH.auth.can('owners.view') && TH.auth.inScope(d.buildingId)));
    if(docs.length && !visible)throw new Error('File ngoài phạm vi được phép đọc');
    if(!docs.length){
      if(!f){const drafts=await op('drafts','readonly',s=>s.getAll());const d=drafts.find(d=>d.createdBy===actor&&d.files?.some(x=>x.id===id));if(d){draftAccess(d);throw new Error('File gốc không còn trong trình duyệt này');}}
      if(!f || f.createdBy!==TH.store.session?.userId)throw new Error('File ngoài phạm vi được phép đọc');fileBinding(f.kind,f.binding||{});
    }
    if(!f)throw new Error('File gốc không còn trong trình duyệt này');return f;
  };
  B.cleanupFile = async id => {
    const f=await op('files','readonly',s=>s.get(id));if(!f || f.createdBy!==TH.store.session?.userId)return;
    if(TH.q.documentsAll?.().some(d=>d.blobId===id))return;
    if((await op('drafts','readonly',s=>s.getAll())).some(d=>d.files?.some(x=>x.id===id)))return;
    await op('files','readwrite',s=>s.delete(id));
  };
  B.download = async (id,name) => { const f=await B.file(id),url=URL.createObjectURL(f.blob),a=document.createElement('a');a.href=url;a.download=name||f.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); };
  B.startStay = async (stayId,blobId,contractId) => {
    TH.actions._.needMs('2','OCR hợp đồng');TH.actions._.need('ocr.review');
    const st=TH.q.stay(stayId);if(!st || !TH.auth.inScope(st.buildingId))throw new Error('Lượt thuê ngoài phạm vi');
    const file=contractId?TH.store.get('contractFiles',contractId):TH.store.one('contractFiles',f=>f.stayId===stayId && (!blobId || f.blobId===blobId));
    if(contractId && (!file || file.stayId!==stayId))throw new Error('File không thuộc lượt thuê');
    const session=TH.actions.createRealOcr(stayId,file?.id);TH.go('#/ocr/'+session.id);
  };
  const scripts = {};
  const script = path => scripts[path] ||= new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+path;s.onload=resolve;s.onerror=()=>{delete scripts[path];reject(new Error('Không tải được bộ đọc. Chạy npm run prepare:intake rồi thử lại.'));};document.head.append(s);});
  B.workbook = async file => {
    await script('xlsx.full.min.js');
    const wb=window.XLSX.read(await file.arrayBuffer(),{type:'array',cellFormula:true,cellDates:true,raw:true});
    return wb.SheetNames.map(name=>{
      const sheet=wb.Sheets[name],cells={};
      for(const [addr,c] of Object.entries(sheet)) if(!addr.startsWith('!')) cells[addr]={value:c.v,formula:c.f,error:c.t==='e'||!!(c.f&&/\[[^\]]+\]/.test(c.f))};
      const rows=window.XLSX.utils.sheet_to_json(sheet,{header:1,defval:null,raw:true}).map(row=>row.map(v=>v instanceof Date?`${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,'0')}-${String(v.getDate()).padStart(2,'0')}`:v));
      return {name:/\.csv$/i.test(file.name)?'DATA':name,rows,cells};
    });
  };
  B.contract = async (file,{signal,progress=()=>{}}={}) => {
    const abort=()=>{if(signal?.aborted) throw new DOMException('Đã hủy đọc file','AbortError');};
    let worker,pdf,task;
    const cancel=()=>{worker?.terminate();task?.destroy();}; signal?.addEventListener('abort',cancel,{once:true});
    const recognize=async (src,page)=>{
      abort(); if(!worker){await script('tesseract/tesseract.min.js');abort();worker=await window.Tesseract.createWorker('vie+eng',1,{workerPath:base+'tesseract/worker.min.js',corePath:base+'core',langPath:base+'lang',logger:m=>progress(`OCR trang ${page}: ${m.status}`,m.progress||0)});}
      const result=await worker.recognize(src);abort();return {page,text:result.data.text,method:'ocr',confidence:result.data.confidence};
    };
    try {
      if(!/\.pdf$/i.test(file.name)) return [await recognize(file,1)];
      const lib=await import('../../vendor/intake/pdf/pdf.mjs');
      lib.GlobalWorkerOptions.workerSrc=base+'pdf/pdf.worker.mjs';
      task=lib.getDocument({data:new Uint8Array(await file.arrayBuffer()),standardFontDataUrl:base+'standard_fonts/',cMapUrl:base+'cmaps/',cMapPacked:true});pdf=await task.promise;
      if(pdf.numPages>100) throw new Error('Tối đa 100 trang mỗi hợp đồng');
      const pages=[];
      for(let i=1;i<=pdf.numPages;i++) {
        abort();progress(`Đọc trang ${i}/${pdf.numPages}`,i/pdf.numPages);
        const p=await pdf.getPage(i),content=await p.getTextContent();let text='',lastY;
        for(const item of content.items){if(lastY!=null&&Math.abs(item.transform[5]-lastY)>3)text+='\n';text+=item.str+(item.hasEOL?'\n':' ');lastY=item.transform[5];}
        if(text.replace(/\s/g,'').length>=100&&/(hợp đồng|hop dong|bên a|bên b|phụ lục|chủ nhà|khách thuê|phòng thuê)/i.test(text)) pages.push({page:i,text,method:'pdf-text'});
        else {const viewport=p.getViewport({scale:2}),canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;await p.render({canvasContext:canvas.getContext('2d'),viewport}).promise;pages.push(await recognize(canvas,i));canvas.width=canvas.height=0;}
      }
      return pages;
    } finally {signal?.removeEventListener('abort',cancel);await worker?.terminate();await pdf?.destroy();}
  };
  B.template = async kind => {
    await script('xlsx.full.min.js');
    const keys=TH.intake.fields[kind].map(f=>f[0]);
    if(kind==='owner')keys.push('number','floor','exploitation','listPrice','mgmtPrice','price');
    else for(const [key] of TH.intake.fees) keys.push(key+'Unit',key+'Method');
    const wb=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(wb,window.XLSX.utils.aoa_to_sheet([keys]),'DATA');window.XLSX.writeFile(wb,`Mau-${kind}.xlsx`);
  };
})(window.TH);

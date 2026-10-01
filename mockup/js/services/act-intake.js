/* One validate/commit boundary for manual, contract and spreadsheets. */
(function(TH){
  const I=TH.intake,S=TH.store,X=TH.actions,F=TH.f;
  const need=d=>{X._.need(d.kind==='owner'?'owners.manage':'tenants.manage');if(d.kind==='owner')X._.need('buildings.manage');};
  const same=(a,b)=>I.norm(a)===I.norm(b);
  I.proposalBalance=p=>Math.max(0,p.amount-(p.paymentIds||[]).reduce((n,id)=>{const pay=S.get('payments',id);return n+(pay&&pay.status!=='reversed'?pay.amount:0);},0));
  X.confirmIntakePayment=(id,data)=>{
    X._.need('payments.record');const p=S.get('intakePaymentProposals',id);
    if(!p||p.stayId!==data.stayId)throw new Error('Đề xuất không thuộc lượt thuê này');
    if(!data.evidence&&!String(data.reference||'').trim())throw new Error('Nhập chứng từ hoặc mã tham chiếu thực thu');
    if(!(data.amount>0)||data.amount>I.proposalBalance(p))throw new Error('Số thu vượt phần đề xuất còn chưa xác nhận');
    const category=data.type==='deposit'?'deposit':'rent',limit=category==='deposit'?p.deposit:p.rent;
    if(limit>0){const used=(p.paymentIds||[]).reduce((n,id)=>{const x=S.get('payments',id);return n+(x&&x.status!=='reversed'&&(x.type==='deposit'?'deposit':'rent')===category?x.amount:0);},0);if(data.amount>limit-used)throw new Error('Số thu vượt phân bổ đề xuất cho '+(category==='deposit'?'cọc':'tiền thuê'));}
    return S.atomic(()=>{const pay=X.recordPayment(data,true);S.update('intakePaymentProposals',id,{paymentIds:[...(p.paymentIds||[]),pay.id],confirmedBy:S.session.userId});S.audit('confirm','intakePaymentProposal',id,'Xác nhận thực thu bằng '+pay.code);return pay;});
  };
  I.validate=d=>{
    const v=d.data,errors=[],warnings=[],links={},existingConflicts=[];
    try{need(d);}catch(e){errors.push(e.message);}
    for(const [k,label,type,required] of I.fields[d.kind]) {
      const value=v[k];if(required&&(value==null||String(value).trim()===''))errors.push('Thiếu '+label);
      if(value!=null&&value!=='') {if(type==='date'&&!I.date(value))errors.push(label+': ngày không hợp lệ');if(type==='month'&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(value))errors.push(label+': kỳ không hợp lệ');if(type==='number'&&(!Number.isFinite(Number(value))||(k!=='dueMonthOffset'&&Number(value)<0)))errors.push(label+': số không hợp lệ');}
    }
    if(d.kind==='owner'&&!String(v.phone||'').trim())errors.push('Thiếu số điện thoại chủ nhà');
    if(v.phone&&!/^0\d{9}$/.test(String(v.phone).replace(/\s/g,'')))errors.push('SĐT phải có 10 chữ số, bắt đầu 0');
    if(v.endDate&&v.startDate&&v.endDate<=v.startDate)errors.push('Ngày hết hạn phải sau ngày bắt đầu');
    if(v.signDate&&v.startDate&&v.signDate>v.startDate)errors.push('Ngày ký không sau ngày bắt đầu');
    if(![1,2,3,4,6,12].includes(+v.payMonths))errors.push('Kỳ thanh toán: 1, 2, 3, 4, 6 hoặc 12 tháng');
    if(v.dueDay!=null&&v.dueDay!==''&&!(+v.dueDay>=1&&+v.dueDay<=31))errors.push('Hạn trả từ ngày 1 đến 31');
    if(v.dueFromDay!=null&&v.dueFromDay!==''&&!(+v.dueFromDay>=1&&+v.dueFromDay<=31))errors.push('Ngày đầu thanh toán từ 1 đến 31');
    if(v.dueFromDay&&v.dueDay&&+v.dueFromDay>+v.dueDay)errors.push('Ngày bắt đầu thanh toán sau ngày đến hạn');
    if(v.dueMonthOffset!=null&&v.dueMonthOffset!==''&&![-1,0].includes(+v.dueMonthOffset))errors.push('Tháng thanh toán chỉ nhận -1 hoặc 0');
    if(v.declaredPaid>0&&(+v.paidDeposit||0)+(+v.paidRent||0)>+v.declaredPaid)errors.push('Phân bổ đã nộp vượt tổng đã nộp');
    if((v.paidDeposit>0||v.paidRent>0)&&!(v.declaredPaid>0))errors.push('Có phân bổ đã nộp nhưng thiếu tổng đã nộp');
    if(v.partyType&&!['individual','legal'].includes(v.partyType))errors.push('Loại chủ nhà không hợp lệ');
    if(d.conflicts?.length)errors.push(`${d.conflicts.length} xung đột nguồn chưa chọn giá trị áp dụng`);
    for(const e of d.sourceErrors||[])errors.push(e.message);
    for(const [key,src] of Object.entries(d.sources||{}))if(src.method==='ocr'&&src.confidence!=null&&src.confidence<80)warnings.push('OCR độ tin cậy thấp ở '+key+' (trang '+src.page+'); kiểm tra trực tiếp file gốc.');
    const building=S.one('buildings',b=>I.code(b.code)===I.code(v.buildingCode));links.building=building;
    if(building&&!TH.auth.inScope(building.id))errors.push('Tòa ngoài phạm vi được giao');
    const difference=(key,old,label)=>{
      if(!old||!v[key]||same(old,v[key]))return;
      existingConflicts.push({key,label,before:old,next:v[key],source:d.sources?.[key],oldSource:'Hồ sơ hiện có'});
      if(d.existingChoices?.[key]!=='source')errors.push(label+' khác hồ sơ hiện có; chọn giá trị áp dụng');
      if(key==='buildingAddress'&&d.existingChoices?.[key]==='source'&&!TH.auth.can('buildings.manage'))errors.push('Thiếu quyền sửa địa chỉ tòa hiện có');
    };
    if(building)difference('buildingAddress',building.address,'Địa chỉ tòa');
    const collection=d.kind==='owner'?'owners':'customers';
    const matches=S.where(collection,c=>(v.idNo&&c.idNo===v.idNo)||(!v.idNo&&v.phone&&c.phone===v.phone)||(v.idNo&&!c.idNo&&v.phone&&c.phone===v.phone));
    if(matches.length>1)errors.push('Nhiều hồ sơ cùng giấy tờ / SĐT; cần xử lý trùng trước');
    const selected=d.selectedPartyId&&S.get(collection,d.selectedPartyId);
    if(d.selectedPartyId&&!selected)errors.push('Hồ sơ được chọn để liên kết không còn tồn tại');
    if(selected&&matches.length&&matches.some(x=>x.id!==selected.id))errors.push('Giấy tờ/SĐT thuộc hồ sơ khác với hồ sơ được chọn');
    links.party=selected||matches[0];
    if(links.party){difference('name',links.party.name,'Tên hồ sơ');for(const key of d.kind==='owner'?['phone','idNo','bank','partyAddress']:['phone','idNo','birthDate','partyAddress','occupation'])difference(key,key==='partyAddress'?(links.party.partyAddress||links.party.address):links.party[key],key);}
    if(v.phone&&v.idNo&&!links.party&&S.one(collection,c=>c.phone===v.phone&&c.idNo&&c.idNo!==v.idNo))warnings.push('SĐT đã dùng bởi giấy tờ khác; tạo hồ sơ riêng, đối chiếu số liên hệ.');
    if(d.kind==='owner'){
      if(!(v.rent>0))errors.push('Giá thuê toàn tòa phải lớn hơn 0');
      if(v.depositPaid>v.deposit)warnings.push('Cọc đã giao lớn hơn cọc hợp đồng; đối chiếu chứng từ');
      if(!S.get('areas',v.areaId))errors.push('Chọn khu vực hợp lệ');
      if(!S.get('employees',v.managerId))errors.push('Chọn người phụ trách hợp lệ');
      if(!d.rooms.length&&!S.where('rooms',r=>r.buildingId===building?.id).length)errors.push('Bổ sung danh sách phòng thực tế; không tự suy ra từ số tầng');
      const seen=new Set();for(const r of d.rooms){
        const code=I.roomCode(r.number,v.buildingCode);if(!/^\d+[A-Z]*$/.test(String(r.number)))errors.push('Số phòng không hợp lệ: '+r.number);
        if(seen.has(code))errors.push('Phòng trùng: '+code);seen.add(code);
        if(!TH.data.catalog.exploitation[r.exploitation])errors.push('Chọn loại khai thác phòng '+code);
        for(const key of ['listPrice','mgmtPrice','price'])if(r[key]!=null&&!(Number.isFinite(Number(r[key]))&&Number(r[key])>=0))errors.push('Giá phòng '+code+' không hợp lệ: '+key);
        if(/^0{2,}/.test(String(r.number))&&r.exploitation!=='meter_common')errors.push(code+': đồng hồ chung không phải phòng thuê');
        const old=S.one('rooms',x=>I.code(x.code)===code);if(old){warnings.push('Liên kết phòng '+code+'; giữ nguyên giá và lịch sử hiện có');if(old.exploitation!==r.exploitation)errors.push('Loại khai thác khác phòng hiện có: '+code);}
      }
      links.contract=S.one('ownerContracts',c=>c.buildingId===building?.id&&c.startDate===v.startDate&&c.ownerId===links.party?.id);
      if(!links.contract&&building&&S.one('ownerContracts',c=>c.buildingId===building.id&&c.startDate<=v.endDate&&(!c.endDate||c.endDate>=v.startDate)))errors.push('Đã có hợp đồng đầu vào chồng thời hạn; dùng phụ lục/gia hạn tại hợp đồng hiện có');
      if(links.contract&&(X.ownerRentAt(links.contract.id,v.startDate)!==+v.rent||links.contract.endDate!==v.endDate||links.contract.deposit!==+v.deposit||links.contract.payCycleMonths!==+v.payMonths||links.contract.payDay!==+(v.dueDay||links.contract.payDay)))errors.push('Hợp đồng đã có khác giá/cọc/kỳ trả/thời hạn; dùng phụ lục');
      warnings.push('Lịch trả theo cơ chế hiện tại: tối đa 12 tháng tới; cọc hợp đồng không tự ghi chi.');
    }else{
      const room=S.one('rooms',r=>I.code(r.code)===I.code(v.roomCode));links.room=room;
      if(!room||room.buildingId!==building?.id)errors.push('Chọn đúng phòng đã có trong tòa');
      if(room?.exploitation==='meter_common')errors.push('Đồng hồ chung không được tạo lượt thuê');
      if(!['active','pending'].includes(v.status))errors.push('Chỉ nhập đang ở hoặc chờ nhận; lịch sử hoàn cọc chỉ đối chiếu');
      if(v.svcStart<v.signDate)errors.push('Ngày dịch vụ không trước ngày ký');
      if(!(v.people>=1))errors.push('Số người ở tối thiểu 1');
      if(room?.exploitation!=='owner_live'&&!(v.rent>0))errors.push('Giá thuê phải lớn hơn 0');
      links.stay=S.one('stays',s=>s.roomId===room?.id&&s.customerId===links.party?.id&&s.rentStart===v.startDate);
      if(d.targetStayId&&links.stay?.id!==d.targetStayId)errors.push('Thông tin không khớp lượt thuê đích. Đối chiếu khách, phòng và ngày bắt đầu; không tạo lượt thuê thay thế.');
      if(links.stay){
        if(links.stay.rent!==+v.rent||links.stay.endDate!==v.endDate)errors.push('Lượt thuê đã có khác giá/thời hạn: dùng gia hạn/biểu phí có hiệu lực');
        if(links.stay.depositAmount!==+v.deposit||links.stay.payMonths!==+v.payMonths||links.stay.people!==+v.people||links.stay.svcStart!==v.svcStart)errors.push('Lượt thuê đã có khác cọc/kỳ trả/người ở/ngày dịch vụ; rà lại điều khoản lượt thuê');
        const rate=TH.q.rateOf(links.stay.id,v.startDate);for(const [key,item] of Object.entries(d.items))if(!rate?.items[key]||Number(rate.items[key].unit)!==Number(item.unit)||rate.items[key].method!==item.method)errors.push('Phí '+key+' khác biểu phí hiện có; dùng phiên biểu phí có ngày hiệu lực.');
        warnings.push('Gắn hợp đồng vào lượt thuê '+links.stay.code+'; không tạo lại số dư hoặc biểu phí.');
      }else if(room){
        const pending=TH.q.pendingStay(room.id),active=TH.q.currentStay(room.id);
        if(pending)errors.push('Phòng đã giữ cho lượt thuê '+pending.code);
        if(active&&(v.status==='active'||v.startDate<=(active.plannedLeaveDate||active.endDate)))errors.push('Thời gian chồng lượt thuê '+active.code);
      }
      for(const [key,f] of Object.entries(d.items)){if(!I.fees.some(x=>x[0]===key)||!['meter','person','room','vehicle','fixed'].includes(f.method)||!(Number(f.unit)>=0))errors.push('Biểu phí không hợp lệ: '+key);}
      if(!Object.keys(d.items).length)warnings.push('Chưa có phí dịch vụ. Xác nhận thực tế không thu dịch vụ hoặc bổ sung trước khi nhập.');
      if(v.declaredPaid>0)warnings.push('Đã nộp '+F.vnd(v.declaredPaid)+': chỉ đề xuất thu, chưa tăng tiền thực thu.');
      if(v.openingDeposit>0)warnings.push('Cọc cũ '+F.vnd(v.openingDeposit)+': số dư đầu kỳ, không phiếu thu mới.');
      if(v.openingDeposit>0&&!v.openingAsOf)errors.push('Chọn ngày ghi số dư cọc đầu kỳ');
      if(v.openingDebt>0&&!v.openingPeriod)errors.push('Chọn kỳ ghi công nợ đầu kỳ');
      if(v.openingDebt>0)warnings.push('Nợ đầu kỳ '+F.vnd(v.openingDebt)+': xác nhận nguồn, tạo hóa đơn số dư đầu kỳ.');
    }
    const unique=[...new Set(errors)];
    const outOfScope=d.data.status==='ended'||unique.some(x=>/Đồng hồ chung|chỉ đối chiếu lịch sử/.test(x));
    return {errors:unique,warnings,links,existingConflicts,status:outOfScope?'Không thuộc phạm vi nhập':unique.length?(unique.some(x=>/xung đột|khác|trùng|chồng/i.test(x))?'Xung đột':'Thiếu dữ liệu'):links.contract||links.stay?'Trùng — liên kết':'Tạo mới'};
  };
  I.commit=d=>{
    need(d);if(!d.id||!d.reviewed)throw new Error('Lưu bản nháp và xác nhận rà soát trước khi ghi');
    const done=S.get('intakeResults',d.id);if(done)return done;
    const check=I.validate(d);if(check.errors.length)throw new Error(check.errors.join('\n'));
    return S.atomic(()=>{
      const v=d.data,L=check.links;let owner=L.party,building=L.building,contract=L.contract,stay=L.stay;
      if(d.kind==='owner'){
        if(!building)building=X.addBuilding({code:I.code(v.buildingCode),address:v.buildingAddress,areaId:v.areaId,managerId:v.managerId,floors:v.floors,operatedFrom:v.startDate,rooms:0,note:[v.buildingFeatures,v.businessRegistration].filter(Boolean).join(' · ')});
        else if(d.existingChoices?.buildingAddress==='source'&&!same(building.address,v.buildingAddress))X.updateBuilding(building.id,{address:v.buildingAddress});
        for(const r of d.rooms)if(!S.one('rooms',x=>I.code(x.code)===I.roomCode(r.number,v.buildingCode)))X.addRoom(building.id,r);
        if(!contract){
          contract=X.addOwnerContract({buildingId:building.id,ownerId:owner?.id,ownerName:v.name,ownerPhone:v.phone,ownerIdNo:v.idNo,ownerBank:v.bank,signDate:v.signDate,startDate:v.startDate,endDate:v.endDate,monthlyRent:v.rent,deposit:v.deposit,payCycleMonths:v.payMonths,payDay:+v.dueDay||1,dueMonthOffset:v.dueMonthOffset});
          owner=S.get('owners',contract.ownerId);
          const ownerPatch={partyType:v.partyType||owner.partyType||null,relatedPersons:v.relatedPersons||owner.relatedPersons||''};
          for(const [key,value] of [['name',v.name],['phone',v.phone],['idNo',v.idNo],['bank',v.bank],['address',v.partyAddress]])if(value!=null&&value!==''&&(!owner[key]||d.existingChoices?.[key==='address'?'partyAddress':key]==='source'))ownerPatch[key]=value;
          S.update('owners',owner.id,ownerPatch);
          S.update('ownerContracts',contract.id,{intakeId:d.id,contractCode:v.contractCode,signDate:v.signDate,handoverDate:v.handoverDate,operator:{name:v.operatorName,idNo:v.operatorIdNo,phone:v.operatorPhone},terms:v.terms,holdPriceTo:v.holdPriceTo,dueFromDay:v.dueFromDay,dueDay:v.dueDay,dueMonthOffset:v.dueMonthOffset,depositPaidDeclared:v.depositPaid??null,buildingFeatures:v.buildingFeatures,businessRegistration:v.businessRegistration,sourceFiles:d.files});
        }
        else if(L.party){const patch={};for(const [key,value] of [['name',v.name],['phone',v.phone],['idNo',v.idNo],['bank',v.bank],['address',v.partyAddress]])if(value!=null&&value!==''&&(!L.party[key]||d.existingChoices?.[key==='address'?'partyAddress':key]==='source'))patch[key]=value;if(Object.keys(patch).length)S.update('owners',L.party.id,patch);}
      }else if(!stay){
        if(L.building&&d.existingChoices?.buildingAddress==='source'&&!same(L.building.address,v.buildingAddress))X.updateBuilding(L.building.id,{address:v.buildingAddress});
        stay=X.createStay({...v,roomId:L.room.id,customerId:L.party?.id,dealDate:v.signDate,rentStart:v.startDate,openingDepositDate:v.openingAsOf,confirmedContract:true,items:d.items});
        S.update('stays',stay.id,{intakeId:d.id,contractCode:v.contractCode,vehicleList:v.vehicleList||'',openingReadings:{electric:v.elOpen??null,water:v.waOpen??null,date:v.moveInDate},dueFromDay:v.dueFromDay,dueDay:v.dueDay,dueMonthOffset:v.dueMonthOffset,terms:v.terms});
        const cust=S.get('customers',stay.customerId),customerPatch={};
        for(const [key,value] of [['name',v.name],['phone',v.phone],['idNo',v.idNo],['birthDate',v.birthDate],['partyAddress',v.partyAddress],['occupation',v.occupation]])if(value!=null&&value!==''&&(!cust[key]||d.existingChoices?.[key]==='source'))customerPatch[key]=value;
        if(Object.keys(customerPatch).length)S.update('customers',stay.customerId,customerPatch);
        if(v.openingDebt>0){const period=v.openingPeriod,id='inv_OPEN-'+stay.code+'-'+period;S.add('invoices',{id,code:'OPEN-'+period+'-'+stay.code,period,stayId:stay.id,roomId:stay.roomId,buildingId:stay.buildingId,customerCode:stay.code,lifecycle:'issued',kind:'opening',lines:[[11,null,null,1,1,+v.openingDebt,+v.openingDebt]],totalDue:+v.openingDebt,dueTo:period+'-01',dueFrom:period+'-01',cutoff:period+'-01',issueDate:period+'-01',note:'Số dư đầu kỳ từ bản nhập '+d.id});}
      }
      if(d.kind==='tenant'&&stay&&L.party&&stay===L.stay){if(L.building&&d.existingChoices?.buildingAddress==='source'&&!same(L.building.address,v.buildingAddress))X.updateBuilding(L.building.id,{address:v.buildingAddress});const customerPatch={};for(const [key,value] of [['name',v.name],['phone',v.phone],['idNo',v.idNo],['birthDate',v.birthDate],['partyAddress',v.partyAddress],['occupation',v.occupation]])if(value!=null&&value!==''&&(!L.party[key]||d.existingChoices?.[key]==='source'))customerPatch[key]=value;if(Object.keys(customerPatch).length)S.update('customers',L.party.id,customerPatch);}
      const target=contract||stay;
      for(const file of d.files||[])if(!S.one('intakeAttachments',a=>a.targetId===target.id&&a.fileId===file.id))S.add('intakeAttachments',{targetId:target.id,kind:d.kind,fileId:file.id,name:file.name});
      if(d.kind==='tenant'&&v.declaredPaid>0&&!S.one('intakePaymentProposals',p=>p.stayId===stay.id&&p.contractCode===v.contractCode))S.add('intakePaymentProposals',{stayId:stay.id,contractCode:v.contractCode,amount:+v.declaredPaid,deposit:+v.paidDeposit||0,rent:+v.paidRent||0,status:'pending',intakeId:d.id});
      d.history ||= [];d.history.push({at:F.nowISO(),by:S.session.userId,action:'confirm',targetId:target.id});
      const result=S.add('intakeResults',{id:d.id,kind:d.kind,targetId:target.id,ownerId:contract?.ownerId,buildingId:building?.id||stay.buildingId,href:d.kind==='owner'?'#/owner-profiles/'+contract.ownerId:'#/stays/'+stay.id,draft:{sources:JSON.parse(JSON.stringify(d.sources)),history:JSON.parse(JSON.stringify(d.history)),files:d.files.map(f=>({id:f.id,name:f.name})),roomSources:d.rooms.map(r=>({code:r.code,sources:r.sources||r.source}))}});
      S.audit('confirm','intake',d.id,'Xác nhận nhập '+v.contractCode,{fileIds:(d.files||[]).map(f=>f.id)});return result;
    });
  };
})(window.TH);

(()=>{
  const students=window.KOUSEI_STUDENTS||[];
  const APPLICATION_DEADLINE = new Date('2026-08-13T00:00:00+09:00').getTime();
  const leaderGrid=document.getElementById('leaderGrid');
  const memberGrid=document.getElementById('memberGrid');
  const leaderPicker=document.getElementById('leaderPicker');
  const memberPicker=document.getElementById('memberPicker');
  const leaderPickerBtn=document.getElementById('leaderPickerBtn');
  const memberPickerBtn=document.getElementById('memberPickerBtn');
  const leaderPickerText=document.getElementById('leaderPickerText');
  const memberPickerText=document.getElementById('memberPickerText');
  const memberChips=document.getElementById('memberChips');
  let leaderId='';
  const memberIds=new Set();
  let db=null;
  try{firebase.initializeApp(window.KOUSEI_FIREBASE_CONFIG);db=firebase.database();}catch(e){console.error(e)}

  const getStudent=id=>students.find(s=>s.id===id);
  const studentLabel=s=>`${s.nameJP} · ${s.nameKR}`;

  const option=(s,type)=>{
    const el=document.createElement('label');
    el.className='picker-option';
    el.dataset.id=s.id;
    el.innerHTML=`<input type="${type}" name="${type==='radio'?'leader':'member'}" value="${s.id}"><span class="picker-name"><strong><span class="picker-class-prefix">${s.grade}年 ${s.className}組</span> ${s.nameJP}</strong><small>${s.grade}학년 ${s.className}반 ${s.nameKR}</small></span><span class="picker-check">✓</span>`;
    return el;
  };
  students.forEach(s=>{leaderGrid.appendChild(option(s,'radio'));memberGrid.appendChild(option(s,'checkbox'));});

  const closePickers=(except=null)=>{
    if(except!==leaderPicker) leaderPicker.hidden=true;
    if(except!==memberPicker) memberPicker.hidden=true;
    leaderPickerBtn.classList.toggle('open',!leaderPicker.hidden);
    memberPickerBtn.classList.toggle('open',!memberPicker.hidden);
  };
  leaderPickerBtn.addEventListener('click',()=>{
    const willOpen=leaderPicker.hidden;
    closePickers(willOpen?leaderPicker:null);
    leaderPicker.hidden=!willOpen;
    leaderPickerBtn.classList.toggle('open',willOpen);
  });
  memberPickerBtn.addEventListener('click',()=>{
    const willOpen=memberPicker.hidden;
    closePickers(willOpen?memberPicker:null);
    memberPicker.hidden=!willOpen;
    memberPickerBtn.classList.toggle('open',willOpen);
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('.picker-wrap')) closePickers();
  });

  const refreshMembers=()=>{
    memberGrid.querySelectorAll('.picker-option').forEach(x=>{
      const input=x.querySelector('input');
      const blocked=x.dataset.id===leaderId;
      if(blocked){input.checked=false;memberIds.delete(x.dataset.id);}
      input.disabled=blocked;
      x.classList.toggle('disabled',blocked);
      x.classList.toggle('selected',!blocked&&input.checked);
    });
    const ms=[...memberIds].map(getStudent).filter(Boolean);
    memberPickerText.textContent=ms.length?`공동 운영자 ${ms.length}명 선택됨`:'공동 운영자 선택';
    memberChips.innerHTML=ms.map(s=>`<span class="selected-chip">${s.nameKR}<button type="button" data-remove="${s.id}" aria-label="${s.nameKR} 선택 해제">×</button></span>`).join('');
  };

  leaderGrid.addEventListener('change',e=>{
    if(e.target.name!=='leader')return;
    leaderId=e.target.value;
    leaderGrid.querySelectorAll('.picker-option').forEach(x=>x.classList.toggle('selected',x.dataset.id===leaderId));
    const leader=getStudent(leaderId);
    leaderPickerText.textContent=leader?studentLabel(leader):'대표 운영자 선택';
    leaderPicker.hidden=true;
    leaderPickerBtn.classList.remove('open');
    refreshMembers();
  });
  memberGrid.addEventListener('change',e=>{
    if(e.target.name!=='member')return;
    if(e.target.checked)memberIds.add(e.target.value); else memberIds.delete(e.target.value);
    refreshMembers();
  });
  memberChips.addEventListener('click',e=>{
    const btn=e.target.closest('[data-remove]'); if(!btn)return;
    const id=btn.dataset.remove; memberIds.delete(id);
    const input=memberGrid.querySelector(`input[value="${id}"]`); if(input) input.checked=false;
    refreshMembers();
  });

  const status=document.getElementById('formStatus'); const btn=document.getElementById('submitBtn');
  const form=document.getElementById('boothForm');
  const closeApplications=()=>{
    if(Date.now()<APPLICATION_DEADLINE)return false;
    form.querySelectorAll('input, textarea, button').forEach(el=>el.disabled=true);
    btn.textContent='부스 신청이 마감되었습니다';
    status.className='status error';
    status.textContent='2026년 8월 12일 24:00부로 부스 신청이 마감되었습니다.';
    return true;
  };
  closeApplications(); setInterval(closeApplications,30000);

  const receipt=code=>{
    const leader=getStudent(leaderId); const ms=[...memberIds].map(getStudent).filter(Boolean);
    document.getElementById('receiptTitle').textContent=document.getElementById('boothName').value.trim();
    document.getElementById('receiptLeader').textContent=leader?studentLabel(leader):'-';
    document.getElementById('receiptMembers').textContent=ms.length?ms.map(x=>x.nameKR).join(' · '):'없음';
    document.getElementById('receiptCode').textContent=code;
    document.getElementById('receiptOverlay').classList.add('show');
  };
  document.getElementById('closeReceipt').onclick=()=>document.getElementById('receiptOverlay').classList.remove('show');

  form.addEventListener('submit',async e=>{
    e.preventDefault(); if(closeApplications())return;
    status.className='status';status.textContent='';
    const boothName=document.getElementById('boothName').value.trim(); const idea=document.getElementById('idea').value.trim();
    if(!boothName){status.classList.add('error');status.textContent='부스명을 입력해 주세요.';document.getElementById('boothName').focus();return;}
    if(!leaderId){status.classList.add('error');status.textContent='대표 운영자를 선택해 주세요.';leaderPickerBtn.focus();return;}
    if(!idea){status.classList.add('error');status.textContent='하고 싶은 부스 내용을 입력해 주세요.';document.getElementById('idea').focus();return;}
    if(!db){status.classList.add('error');status.textContent='Firebase 연결에 실패했습니다.';return;}
    btn.disabled=true;btn.textContent='접수 중...';
    const now=Date.now(); const code=`FES-${String(now%10000).padStart(4,'0')}-${Math.floor(Math.random()*90+10)}`;
    const leader=getStudent(leaderId); const members=[...memberIds].map(getStudent).filter(Boolean);
    const payload={receiptCode:code,boothName,leader:{id:leader.id,nameJP:leader.nameJP,nameKR:leader.nameKR,grade:leader.grade,className:leader.className},members:members.map(x=>({id:x.id,nameJP:x.nameJP,nameKR:x.nameKR,grade:x.grade,className:x.className})),idea,intro:document.getElementById('intro').value.trim(),request:document.getElementById('request').value.trim(),status:'pending',createdAt:firebase.database.ServerValue.TIMESTAMP};
    try{
      await db.ref('festivalBoothApplications').push(payload);
      status.classList.add('ok');status.textContent='접수 완료!';receipt(code);
      e.target.reset(); leaderId=''; memberIds.clear();
      leaderPickerText.textContent='대표 운영자 선택'; memberPickerText.textContent='공동 운영자 선택'; memberChips.innerHTML='';
      document.querySelectorAll('.picker-option').forEach(x=>{x.classList.remove('selected','disabled');const i=x.querySelector('input');i.disabled=false;});
      closePickers();
    }catch(err){console.error(err);status.classList.add('error');status.textContent='접수에 실패했습니다. Firebase Database 규칙을 확인해 주세요.';}
    finally{btn.disabled=false;btn.textContent='부스 신청하기';}
  });
})();

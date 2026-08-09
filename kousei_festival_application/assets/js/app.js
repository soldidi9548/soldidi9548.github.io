(()=>{
  const students=window.KOUSEI_STUDENTS||[];
  const APPLICATION_DEADLINE=new Date('2026-08-13T00:00:00+09:00').getTime();
  let db=null,auth=null,currentStudent=null;
  const memberIds=new Set();
  try{firebase.initializeApp(window.KOUSEI_FIREBASE_CONFIG);db=firebase.database();auth=firebase.auth();}catch(e){console.error(e)}
  const $=id=>document.getElementById(id), getStudent=id=>students.find(s=>s.id===id), studentLabel=s=>`${s.nameJP} · ${s.nameKR}`;
  const form=$('boothForm'), loginBox=$('studentLogin'), status=$('formStatus'), btn=$('submitBtn');
  const memberGrid=$('memberGrid'),memberPicker=$('memberPicker'),memberPickerBtn=$('memberPickerBtn'),memberPickerText=$('memberPickerText'),memberChips=$('memberChips');
  const idFromUser=u=>String(u?.email||'').replace(/@kousei\.local$/,'');

  const option=s=>{const el=document.createElement('label');el.className='picker-option';el.dataset.id=s.id;el.innerHTML=`<input type="checkbox" name="member" value="${s.id}"><span class="picker-name"><strong><span class="picker-class-prefix">${s.grade}年 ${s.className}組</span> ${s.nameJP}</strong><small>${s.grade}학년 ${s.className}반 ${s.nameKR}</small></span><span class="picker-check">✓</span>`;return el};
  students.forEach(s=>memberGrid.appendChild(option(s)));
  const refreshMembers=()=>{memberGrid.querySelectorAll('.picker-option').forEach(x=>{const i=x.querySelector('input'),blocked=currentStudent&&x.dataset.id===currentStudent.id;if(blocked){i.checked=false;memberIds.delete(x.dataset.id)}i.disabled=!!blocked;x.classList.toggle('disabled',!!blocked);x.classList.toggle('selected',!blocked&&i.checked)});const ms=[...memberIds].map(getStudent).filter(Boolean);memberPickerText.textContent=ms.length?`공동 운영자 ${ms.length}명 선택됨`:'공동 운영자 선택';memberChips.innerHTML=ms.map(s=>`<span class="selected-chip">${s.nameKR}<button type="button" data-remove="${s.id}" aria-label="${s.nameKR} 선택 해제">×</button></span>`).join('')};
  memberPickerBtn.onclick=()=>{memberPicker.hidden=!memberPicker.hidden;memberPickerBtn.classList.toggle('open',!memberPicker.hidden)};
  document.addEventListener('click',e=>{if(!e.target.closest('.picker-wrap')){memberPicker.hidden=true;memberPickerBtn.classList.remove('open')}});
  memberGrid.onchange=e=>{if(e.target.name!=='member')return;e.target.checked?memberIds.add(e.target.value):memberIds.delete(e.target.value);refreshMembers()};
  memberChips.onclick=e=>{const b=e.target.closest('[data-remove]');if(!b)return;memberIds.delete(b.dataset.remove);const i=memberGrid.querySelector(`input[value="${b.dataset.remove}"]`);if(i)i.checked=false;refreshMembers()};

  const showUser=u=>{const s=getStudent(idFromUser(u));currentStudent=s||null;if(s){$('leaderSelf').textContent=`${s.grade}학년 ${s.className}반 ${s.nameKR} · ${s.nameJP}`;loginBox.hidden=true;form.hidden=false;refreshMembers()}else{form.hidden=true;loginBox.hidden=false;$('loginStatus').className='status error';$('loginStatus').textContent='등록된 학생 계정이 아닙니다.'}};
  $('loginBtn').onclick=async()=>{const email=$('loginEmail').value.trim(),pw=$('loginPassword').value;const st=$('loginStatus');st.className='status';st.textContent='로그인 중...';try{await auth.signInWithEmailAndPassword(email,pw);st.textContent=''}catch(e){st.className='status error';st.textContent='ID 또는 비밀번호를 확인해 주세요.'}};
  $('loginPassword').addEventListener('keydown',e=>{if(e.key==='Enter')$('loginBtn').click()});
  $('logoutBtn').onclick=()=>auth.signOut();
  auth.onAuthStateChanged(u=>{if(u)showUser(u);else{currentStudent=null;form.hidden=true;loginBox.hidden=false;$('loginStatus').textContent='';memberIds.clear();refreshMembers()}});

  const closeApplications=()=>{if(Date.now()<APPLICATION_DEADLINE)return false;form.querySelectorAll('input,textarea,button').forEach(el=>el.disabled=true);btn.textContent='부스 신청이 마감되었습니다';status.className='status error';status.textContent='2026년 8월 12일 24:00부로 부스 신청이 마감되었습니다.';return true};closeApplications();setInterval(closeApplications,30000);
  const receipt=code=>{const ms=[...memberIds].map(getStudent).filter(Boolean);$('receiptTitle').textContent=$('boothName').value.trim();$('receiptLeader').textContent=currentStudent?studentLabel(currentStudent):'-';$('receiptMembers').textContent=ms.length?ms.map(x=>x.nameKR).join(' · '):'없음';$('receiptCode').textContent=code;$('receiptOverlay').classList.add('show')};$('closeReceipt').onclick=()=>$('receiptOverlay').classList.remove('show');

  form.addEventListener('submit',async e=>{e.preventDefault();if(closeApplications())return;status.className='status';status.textContent='';if(!auth.currentUser||!currentStudent){status.classList.add('error');status.textContent='학생 로그인이 필요합니다.';return}const boothName=$('boothName').value.trim(),idea=$('idea').value.trim();if(!boothName){status.classList.add('error');status.textContent='부스명을 입력해 주세요.';return}if(!idea){status.classList.add('error');status.textContent='하고 싶은 부스 내용을 입력해 주세요.';return}btn.disabled=true;btn.textContent='접수 중...';const now=Date.now(),code=`FES-${String(now%10000).padStart(4,'0')}-${Math.floor(Math.random()*90+10)}`;const members=[...memberIds].map(getStudent).filter(Boolean);const leader=currentStudent;const payload={receiptCode:code,boothName,leader:{id:leader.id,nameJP:leader.nameJP,nameKR:leader.nameKR,grade:leader.grade,className:leader.className},members:members.map(x=>({id:x.id,nameJP:x.nameJP,nameKR:x.nameKR,grade:x.grade,className:x.className})),idea,intro:$('intro').value.trim(),request:$('request').value.trim(),status:'pending',createdAt:firebase.database.ServerValue.TIMESTAMP};try{await db.ref('festivalBoothApplications').push(payload);status.classList.add('ok');status.textContent='접수 완료!';receipt(code);e.target.reset();memberIds.clear();refreshMembers();}catch(err){console.error(err);status.classList.add('error');status.textContent='접수에 실패했습니다. Firebase Database 규칙을 확인해 주세요.'}finally{btn.disabled=false;btn.textContent='부스 신청하기'}});
})();

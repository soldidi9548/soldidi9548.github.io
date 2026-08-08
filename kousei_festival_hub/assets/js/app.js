const grid=document.getElementById('boothGrid');
const empty=document.getElementById('empty');
const count=document.getElementById('boothCount');
const FESTIVAL_END_AT=1786708800000; // 2026-08-14 21:00 KST/JST
const FIREWORK_GOAL=30;
let filter='all';

function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function boothColors(b){return b.type==='student'?['#ef9aa9','#fff']:['#82c7ed','#fff']}
function festivalClosed(){return Date.now()>=FESTIVAL_END_AT}
function renderBooths(){
  const open=window.KOUSEI_BOOTHS.filter(b=>b.status==='open');
  const data=open.filter(b=>filter==='all'||b.type===filter);
  count.textContent=`${open.length} BOOTHS OPEN`;
  grid.innerHTML=data.map(b=>{
    const [a,c]=boothColors(b);
    return `<a class="stall ${esc(b.type)}" href="${esc(b.href)}" style="--stripe1:${a};--stripe2:${c}">
      <div class="stall-roof"></div>
      <div class="stall-body">
        <div class="stall-icon">${esc(b.icon)}</div>
        <div class="stall-title-kr">${esc(b.titleKR)}</div>
        <p class="stall-desc">${esc(b.desc)}</p>
        <div class="stall-operator"><strong>${esc(b.operatorsJP)}</strong><span>${esc(b.operatorsKR)}</span></div>
      </div>
      <div class="stall-sign"><small>${esc(b.badge)}</small><strong>${esc(b.titleJP)}</strong></div>
      <span class="badge">${b.type==='student'?'STUDENT':'OFFICIAL'}</span>
      <div class="stall-counter"></div>
    </a>`
  }).join('');
  empty.hidden=data.length>0;
}
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');filter=btn.dataset.filter;renderBooths()}));
renderBooths();

// Passport
const loginModal=document.getElementById('loginModal');
const loginBtn=document.getElementById('passportLoginBtn');
const logoutBtn=document.getElementById('passportLogoutBtn');
const loginSubmit=document.getElementById('loginSubmit');
const loginStatus=document.getElementById('loginStatus');
const studentSelect=document.getElementById('studentSelect');
const passwordInput=document.getElementById('passportPassword');
const passportUser=document.getElementById('passportUser');
const stampBook=document.getElementById('stampBook');
const fragmentHeld=document.getElementById('fragmentHeld');
const fragmentSent=document.getElementById('fragmentSent');
const sendOne=document.getElementById('sendOneFragment');
const sendAll=document.getElementById('sendAllFragments');
const fireworkFill=document.getElementById('fireworkFill');
const fireworkCount=document.getElementById('fireworkCount');
const fireworkPercent=document.getElementById('fireworkPercent');
const fireworkScene=document.getElementById('fireworkScene');
const fireworkMessage=document.getElementById('fireworkMessage');
const hall=document.getElementById('hallOfFame');
const hallBody=document.getElementById('hallBody');
const hallCountdown=document.getElementById('hallCountdown');
let db=null,auth=null,stampRef=null,passportRef=null,currentPassport={stamps:{},donated:0};

function emailFor(id){return `${id}@kousei.local`}
function studentByEmail(email){return (window.KOUSEI_STUDENTS||[]).find(s=>emailFor(s.id)===email)}
function studentById(id){return (window.KOUSEI_STUDENTS||[]).find(s=>s.id===id)}
function fillStudents(){studentSelect.innerHTML=(window.KOUSEI_STUDENTS||[]).map(s=>`<option value="${esc(s.id)}">${s.grade}年 ${esc(s.className)}組 ${esc(s.nameJP)} · ${s.grade}학년 ${esc(s.className)}반 ${esc(s.nameKR)}</option>`).join('')}
function openLogin(){loginStatus.textContent='';passwordInput.value='';loginModal.hidden=false;setTimeout(()=>passwordInput.focus(),30)}
function closeLogin(){loginModal.hidden=true}
loginBtn.addEventListener('click',openLogin);document.querySelectorAll('[data-close-login]').forEach(x=>x.addEventListener('click',closeLogin));

function renderStampBook(stamps={}){
  const open=window.KOUSEI_BOOTHS.filter(b=>b.status==='open');
  stampBook.innerHTML=open.map(b=>`<div class="stamp-slot ${stamps[b.id]?'stamped':''}"><div class="stamp-icon">${esc(b.icon)}</div><strong>${esc(b.titleKR)}</strong><span>${stamps[b.id]?'STAMPED':'아직 도장 없음'}</span></div>`).join('') || '<div class="stamp-slot"><strong>OPEN 준비 중</strong></div>';
}
function stampCount(pass=currentPassport){return Object.keys((pass&&pass.stamps)||{}).length}
function renderFragments(){
  const earned=stampCount();
  const donated=Math.max(0,Number(currentPassport.donated)||0);
  const held=Math.max(0,earned-donated);
  fragmentHeld.textContent=held;
  fragmentSent.textContent=donated;
  const usable=!!(auth&&auth.currentUser)&&held>0&&!festivalClosed();
  sendOne.disabled=!usable;
  sendAll.disabled=!usable;
  sendAll.textContent=held>1?`조각 ${held}개 모두 보내기`:'모두 보내기';
}
function renderPassport(pass={}){
  currentPassport={stamps:pass.stamps||{},donated:Number(pass.donated)||0,studentId:pass.studentId||''};
  renderStampBook(currentPassport.stamps);
  renderFragments();
}
renderStampBook({});fillStudents();renderFragments();

function renderFireworks(total=0){
  total=Math.max(0,Number(total)||0);
  const pct=Math.min(100,Math.round(total/FIREWORK_GOAL*100));
  fireworkFill.style.width=`${pct}%`;
  fireworkCount.textContent=`${Math.min(total,FIREWORK_GOAL)} / ${FIREWORK_GOAL}`;
  fireworkPercent.textContent=`${pct}%`;
  const full=total>=FIREWORK_GOAL;
  fireworkScene.classList.toggle('unlocked',full);
  fireworkMessage.innerHTML=full?'<strong>불꽃놀이 준비 완료!</strong><span>모두의 조각이 모였습니다. 오늘 밤 바닷가에서 불꽃이 올라갑니다.</span>':'<strong>불꽃놀이 준비 중</strong><span>부스 도장 1개마다 축제 조각 1개를 얻어요. 패스포트에서 조각을 보내 주세요.</span>';
}

async function donateFragments(amount){
  const u=auth&&auth.currentUser;if(!u||festivalClosed())return;
  const stamps=stampCount();
  const current=Math.max(0,Number(currentPassport.donated)||0);
  const available=Math.max(0,stamps-current);
  const requested=Math.max(0,Math.min(Number(amount)||0,available));
  if(!requested)return;
  sendOne.disabled=true;sendAll.disabled=true;
  try{
    const ref=db.ref(`festivalPassports/${u.uid}/donated`);
    const tx=await ref.transaction(v=>{
      const old=Math.max(0,Number(v)||0);
      const room=Math.max(0,stamps-old);
      if(!room)return;
      return old+Math.min(requested,room);
    });
    if(!tx.committed)return;
    const newDonated=Number(tx.snapshot.val())||0;
    const delta=Math.max(0,newDonated-current);
    if(delta){await db.ref('festivalFireworks/total').transaction(v=>Math.max(0,Number(v)||0)+delta)}
  }catch(e){console.error(e);alert('축제 조각 전송에 실패했습니다. 다시 시도해 주세요.')}finally{renderFragments()}
}
sendOne.addEventListener('click',()=>donateFragments(1));
sendAll.addEventListener('click',()=>donateFragments(Math.max(0,stampCount()-Number(currentPassport.donated||0))));

try{
  if(!firebase.apps.length)firebase.initializeApp(window.KOUSEI_FIREBASE_CONFIG);
  auth=firebase.auth();db=firebase.database();
  db.ref('festivalFireworks/total').on('value',s=>renderFireworks(s.val()||0));
  auth.onAuthStateChanged(user=>{
    if(passportRef){passportRef.off();passportRef=null}
    if(!user){passportUser.textContent='아직 패스포트를 열지 않았습니다.';loginBtn.hidden=false;logoutBtn.hidden=true;renderPassport({});return}
    const s=studentByEmail(user.email||'');
    if(!s){passportUser.textContent='학생 계정으로 로그인해 주세요.';loginBtn.hidden=false;logoutBtn.hidden=true;renderPassport({});return}
    passportUser.innerHTML=`<strong>${esc(s.grade)}年 ${esc(s.className)}組 ${esc(s.nameJP)}</strong> · ${esc(s.grade)}학년 ${esc(s.className)}반 ${esc(s.nameKR)}`;
    loginBtn.hidden=true;logoutBtn.hidden=false;
    db.ref(`festivalPassports/${user.uid}/studentId`).set(s.id).catch(()=>{});
    passportRef=db.ref(`festivalPassports/${user.uid}`);
    passportRef.on('value',snap=>renderPassport(snap.val()||{}));
    closeLogin();
  });
}catch(e){passportUser.textContent='Firebase 설정을 확인해 주세요.';console.error(e)}

loginSubmit.addEventListener('click',async()=>{
  const id=studentSelect.value,pw=passwordInput.value;
  if(!pw){loginStatus.textContent='비밀번호를 입력해 주세요.';return}
  loginSubmit.disabled=true;loginStatus.textContent='확인 중...';
  try{await auth.signInWithEmailAndPassword(emailFor(id),pw);loginStatus.textContent=''}catch(e){loginStatus.textContent='학생 또는 비밀번호를 확인해 주세요.'}finally{loginSubmit.disabled=false}
});
passwordInput.addEventListener('keydown',e=>{if(e.key==='Enter')loginSubmit.click()});
logoutBtn.addEventListener('click',()=>auth&&auth.signOut());

function formatRemain(ms){
  if(ms<=0)return '집계가 완료되었습니다.';
  const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000);
  return `${d?d+'일 ':''}${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function nameHtml(student){return student?`<strong>${esc(student.nameJP)}</strong><span>${esc(student.nameKR)} · ${student.grade}학년 ${esc(student.className)}반</span>`:'<strong>—</strong><span>기록 없음</span>'}
function groupedRanks(items,key){
  const sorted=items.slice().sort((a,b)=>b[key]-a[key] || a.studentId.localeCompare(b.studentId));
  return sorted.slice(0,3);
}
async function openHall(){
  try{
    const snap=await db.ref('festivalPassports').once('value');
    const raw=snap.val()||{};
    const rows=Object.values(raw).map(p=>({studentId:p.studentId||'',stamps:Object.keys(p.stamps||{}).length,donated:Number(p.donated)||0})).filter(x=>studentById(x.studentId));
    const stamps=groupedRanks(rows,'stamps'),donated=groupedRanks(rows,'donated');
    const maxBooths=window.KOUSEI_BOOTHS.filter(b=>b.status==='open').length;
    const finishers=rows.filter(x=>x.stamps>=maxBooths).map(x=>studentById(x.studentId));
    const rankCard=(title,icon,list,key,unit)=>`<article class="honor-card"><div class="honor-icon">${icon}</div><div class="honor-kicker">${title}</div>${list.length?list.map((r,i)=>{const s=studentById(r.studentId);return `<div class="honor-row"><b>${i+1}</b><div>${nameHtml(s)}</div><em>${r[key]}${unit}</em></div>`}).join(''):'<p class="honor-empty">기록이 없습니다.</p>'}</article>`;
    hallBody.innerHTML=rankCard('축제 탐험왕','🎪',stamps,'stamps','개')+rankCard('불꽃 공헌상','🎆',donated,'donated','개')+`<article class="honor-card finisher-card"><div class="honor-icon">🏮</div><div class="honor-kicker">ALL STAMPS</div><h3>축제 완주자</h3>${finishers.length?`<div class="finisher-list">${finishers.map(s=>`<div>${nameHtml(s)}</div>`).join('')}</div>`:'<p class="honor-empty">모든 부스를 완주한 학생이 없습니다.</p>'}</article>`;
    hall.classList.add('open');hallCountdown.textContent='2026.08.14 · 21:00 집계 완료';
  }catch(e){hallBody.innerHTML='<div class="hall-error">명예의 전당 데이터를 불러오지 못했습니다. Firebase 규칙을 확인해 주세요.</div>';console.error(e)}
}
let hallOpened=false;
function tickHall(){
  const remain=FESTIVAL_END_AT-Date.now();
  if(remain>0){hallCountdown.textContent=`공개까지 ${formatRemain(remain)}`;return}
  if(!hallOpened){hallOpened=true;openHall();renderFragments()}
}
tickHall();setInterval(tickHall,1000);

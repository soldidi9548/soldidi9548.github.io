const grid=document.getElementById('boothGrid');
const empty=document.getElementById('empty');
const count=document.getElementById('boothCount');
let filter='all';

function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function boothColors(b){return b.type==='student'?['#ef9aa9','#fff']:['#82c7ed','#fff']}
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
let db=null,auth=null,stampRef=null;

function emailFor(id){return `${id}@kousei.local`}
function studentByEmail(email){return (window.KOUSEI_STUDENTS||[]).find(s=>emailFor(s.id)===email)}
function fillStudents(){studentSelect.innerHTML=(window.KOUSEI_STUDENTS||[]).map(s=>`<option value="${esc(s.id)}">${s.grade}年 ${esc(s.className)}組 ${esc(s.nameJP)} · ${s.grade}학년 ${esc(s.className)}반 ${esc(s.nameKR)}</option>`).join('')}
function openLogin(){loginStatus.textContent='';passwordInput.value='';loginModal.hidden=false;setTimeout(()=>passwordInput.focus(),30)}
function closeLogin(){loginModal.hidden=true}
loginBtn.addEventListener('click',openLogin);document.querySelectorAll('[data-close-login]').forEach(x=>x.addEventListener('click',closeLogin));

function renderStampBook(stamps={}){
  const open=window.KOUSEI_BOOTHS.filter(b=>b.status==='open');
  stampBook.innerHTML=open.map(b=>`<div class="stamp-slot ${stamps[b.id]?'stamped':''}"><div class="stamp-icon">${esc(b.icon)}</div><strong>${esc(b.titleKR)}</strong><span>${stamps[b.id]?'STAMPED':'아직 도장 없음'}</span></div>`).join('') || '<div class="stamp-slot"><strong>OPEN 준비 중</strong></div>';
}
renderStampBook({});fillStudents();

try{
  if(!firebase.apps.length)firebase.initializeApp(window.KOUSEI_FIREBASE_CONFIG);
  auth=firebase.auth();db=firebase.database();
  auth.onAuthStateChanged(user=>{
    if(stampRef){stampRef.off();stampRef=null}
    if(!user){passportUser.textContent='아직 패스포트를 열지 않았습니다.';loginBtn.hidden=false;logoutBtn.hidden=true;renderStampBook({});return}
    const s=studentByEmail(user.email||'');
    if(!s){passportUser.textContent='학생 계정으로 로그인해 주세요.';loginBtn.hidden=false;logoutBtn.hidden=true;renderStampBook({});return}
    passportUser.innerHTML=`<strong>${esc(s.grade)}年 ${esc(s.className)}組 ${esc(s.nameJP)}</strong> · ${esc(s.grade)}학년 ${esc(s.className)}반 ${esc(s.nameKR)}`;
    loginBtn.hidden=true;logoutBtn.hidden=false;
    stampRef=db.ref(`festivalPassports/${user.uid}/stamps`);
    stampRef.on('value',snap=>renderStampBook(snap.val()||{}));
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

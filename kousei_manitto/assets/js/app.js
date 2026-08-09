(() => {
  'use strict';

  const students = Array.isArray(window.KOUSEI_STUDENTS) ? window.KOUSEI_STUDENTS : [];
  const firebaseConfig = window.KOUSEI_FIREBASE_CONFIG || {};
  const manittoConfig = window.KOUSEI_MANITTO_CONFIG || {};
  const AUTH_DOMAIN = manittoConfig.authDomain || 'kousei.local';

  const missions = [
    { day:1, icon:'💌', kicker:'FIRST HELLO', title:'첫 인사', description:'마니또의 사물함에 익명으로 첫 메시지를 남겨주세요.' },
    { day:2, icon:'🎁', kicker:'SMALL GIFT', title:'작은 선물', description:'마니또에게 어울린다고 생각하는 이미지 한 장과 함께 작은 선물을 보내주세요.' },
    { day:3, icon:'☀️', kicker:'SAY HELLO FIRST', title:'오늘은 내가 먼저', description:'오늘 하루 중 한 번, 정체를 들키지 않게 마니또에게 먼저 말을 걸어주세요.' },
    { day:4, icon:'🔎', kicker:'WHO AM I?', title:'나는 누구게?', description:'사물함에 자신을 추측할 수 있는 힌트 하나와 마지막 메시지를 남겨주세요. 너무 결정적인 힌트는 금지!' }
  ];

  let auth = null, db = null, activeStudent = null;
  const configured = firebaseConfig.apiKey && !String(firebaseConfig.apiKey).includes('PASTE_');
  if (configured) {
    try {
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      db = firebase.database();
      auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(() => {});
    } catch (e) { console.error(e); }
  }

  const grid = document.getElementById('studentGrid');
  const searchInput = document.getElementById('searchInput');
  const emptyState = document.getElementById('emptyState');
  const modal = document.getElementById('manittoModal');
  const modalClose = document.getElementById('modalClose');
  const unlockPanel = document.getElementById('unlockPanel');
  const resultPanel = document.getElementById('resultPanel');
  const unlockForm = document.getElementById('unlockForm');
  const passwordInput = document.getElementById('passwordInput');
  const unlockButton = document.getElementById('unlockButton');
  const unlockStatus = document.getElementById('unlockStatus');
  const lockAgain = document.getElementById('lockAgain');
  const toast = document.getElementById('toast');

  const studentById = id => students.find(s => s.lockerId === id);
  const loginEmail = student => `${student.lockerId}@${AUTH_DOMAIN}`;

  function missionIndexNow(){
    const raw = String(manittoConfig.startDate || '').trim();
    const start = new Date(`${raw}T00:00:00`);
    if (!raw || Number.isNaN(start.getTime())) return 0;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    return Math.floor((today - startDay) / 86400000);
  }

  function renderMission(){
    const index = missionIndexNow();
    const before = index < 0;
    const after = index > 3;
    const current = missions[Math.min(Math.max(index,0),3)];

    document.getElementById('missionDayBadge').textContent = after ? 'COMPLETE' : `DAY ${current.day}`;
    document.getElementById('todayDay').textContent = String(current.day).padStart(2,'0');
    document.getElementById('todayKicker').textContent = after ? 'MISSION COMPLETE' : before ? 'COMING SOON' : current.kicker;
    document.getElementById('todayTitle').textContent = after ? '마니또 미션 완료!' : current.title;
    document.getElementById('todayDescription').textContent = after ? '4일간의 마니또 미션이 모두 끝났습니다. 마지막 정체 공개까지 비밀을 지켜주세요.' : current.description;
    document.getElementById('todayIcon').textContent = after ? '🎆' : current.icon;

    const progress = document.getElementById('missionProgress');
    progress.replaceChildren();
    missions.forEach((m,i) => {
      const item = document.createElement('div');
      item.className = 'progress-item';
      let state = 'future', tag = '🔒';
      if (after || i < index) { state='past'; tag='✓'; }
      else if ((!before && i === index) || (before && i === 0)) { state='current'; tag=before?'SOON':'NOW'; }
      item.classList.add(state);
      item.innerHTML = `<span class="progress-day">DAY ${m.day}</span><strong>${m.title}</strong><b>${tag}</b>`;
      progress.appendChild(item);
    });

    const note = document.getElementById('missionDateNote');
    const startRaw = String(manittoConfig.startDate || '');
    if (startRaw) {
      const start = new Date(`${startRaw}T00:00:00`);
      if (!Number.isNaN(start.getTime())) {
        const fmt = new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric'});
        const end = new Date(start); end.setDate(end.getDate()+3);
        note.textContent = `MISSION PERIOD · ${fmt.format(start)} — ${fmt.format(end)}`;
      }
    }
  }

  function renderStudents(query=''){
    const q = query.trim().toLowerCase();
    const sorted = [...students]
      .filter(s => [s.nameJP,s.nameKR,s.grade,s.className,`${s.grade}학년 ${s.className}반`].join(' ').toLowerCase().includes(q))
      .sort((a,b)=>Number(a.grade)-Number(b.grade) || String(a.className).localeCompare(String(b.className),'en') || String(a.nameJP).localeCompare(String(b.nameJP),'ja'));
    grid.replaceChildren();
    sorted.forEach(student => {
      const btn = document.createElement('button');
      btn.type='button'; btn.className='student-card';
      btn.innerHTML = `<div class="card-top"><span>${student.grade}-${student.className}</span><i>✦</i></div><div class="card-body"><div class="name-jp"></div><div class="name-ko"></div><div class="meta"></div></div><div class="card-foot">나의 마니또 확인 <span>→</span></div>`;
      btn.querySelector('.name-jp').textContent = student.nameJP;
      btn.querySelector('.name-ko').textContent = student.nameKR;
      btn.querySelector('.meta').textContent = `${student.grade}학년 ${student.className}반 · ${student.age}`;
      btn.addEventListener('click',()=>openModal(student));
      grid.appendChild(btn);
    });
    emptyState.hidden = sorted.length !== 0;
  }

  async function openModal(student){
    activeStudent = student;
    document.getElementById('modalPlate').textContent = `${student.grade}-${student.className}`;
    document.getElementById('modalName').textContent = student.nameJP;
    document.getElementById('modalSub').textContent = `${student.nameKR} · ${student.grade}학년 ${student.className}반 · ${student.age}`;
    resetModal();
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
    if (auth && auth.currentUser && auth.currentUser.email === loginEmail(student)) await revealResult(student);
  }

  function resetModal(){
    unlockPanel.hidden=false; resultPanel.hidden=true; passwordInput.value=''; unlockStatus.textContent=''; unlockButton.disabled=false;
  }

  function closeModal(){
    modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); activeStudent=null;
  }

  unlockForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!activeStudent || !auth) { unlockStatus.textContent='Firebase 연결을 확인해 주세요.'; return; }
    unlockButton.disabled=true; unlockStatus.textContent='확인 중…';
    try {
      if (auth.currentUser && auth.currentUser.email !== loginEmail(activeStudent)) await auth.signOut();
      if (!auth.currentUser) await auth.signInWithEmailAndPassword(loginEmail(activeStudent), passwordInput.value);
      await revealResult(activeStudent);
      unlockStatus.textContent='';
    } catch(err) {
      console.error(err); unlockStatus.textContent='비밀번호가 맞지 않습니다.'; passwordInput.select();
    } finally { unlockButton.disabled=false; }
  });

  async function revealResult(student){
    if (!db) { showToast('Firebase 연결을 확인해 주세요.'); return; }
    unlockPanel.hidden=true; resultPanel.hidden=false;
    document.getElementById('targetNameJP').textContent='확인 중…';
    document.getElementById('targetNameKR').textContent='';
    document.getElementById('targetMeta').textContent='';
    try {
      // 확정된 마니또 추첨 결과. 화면에는 본인 인증 후 자신의 결과만 표시됩니다.
      const assignmentData = JSON.parse(atob('eyJtaW8iOiJrYWl0byIsInRzdW11Z2kiOiJtZWkiLCJtaXp1a2kiOiJ5dXUiLCJtZWkiOiJzaHV0byIsImthaXRvIjoia290b25lIiwicmluIjoidHN1bXVnaSIsInl1dSI6Im1penVraSIsIm5hZ2kiOiJrZWkiLCJ5dWkiOiJuYWdpIiwia2VpIjoicmluIiwic2h1dG8iOiJ5dWkiLCJrb3RvbmUiOiJtaW8ifQ=='));
      const targetId = assignmentData[student.lockerId];
      const target = studentById(targetId);
      if (!target) {
        document.getElementById('targetNameJP').textContent='결과를 확인할 수 없습니다.';
        document.getElementById('targetNameKR').textContent='관리자에게 문의해 주세요.';
        return;
      }
      document.getElementById('targetNameJP').textContent=target.nameJP;
      document.getElementById('targetNameKR').textContent=target.nameKR;
      document.getElementById('targetMeta').textContent=`${target.grade}학년 ${target.className}반 · ${target.age}`;
    } catch(err) {
      console.error(err);
      document.getElementById('targetNameJP').textContent='결과를 불러올 수 없습니다.';
      document.getElementById('targetNameKR').textContent='Database 규칙을 확인해 주세요.';
    }
  }

  lockAgain.addEventListener('click', async()=>{ if(auth) await auth.signOut().catch(()=>{}); resetModal(); });
  modalClose.addEventListener('click',closeModal);
  modal.addEventListener('click',e=>{ if(e.target===modal) closeModal(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&modal.classList.contains('open')) closeModal(); });
  searchInput.addEventListener('input',()=>renderStudents(searchInput.value));

  function showToast(message){ toast.textContent=message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove('show'),2600); }

  renderMission();
  renderStudents();
})();

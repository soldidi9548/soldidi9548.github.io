(function(){
  const CFG=window.KOUSEI_COURAGE, FCFG=window.KOUSEI_FIREBASE_CONFIG;
  firebase.initializeApp(FCFG);
  const auth=firebase.auth(), db=firebase.database();
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});

  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const authView=$('#authView'), appView=$('#appView'), playerLogin=$('#playerLogin'), gmLogin=$('#gmLogin'), authError=$('#authError');
  const roomView=$('#roomView'), roomBody=$('#roomBody'), gmPicker=$('#gmRoomPicker');
  let mode='player', currentUser=null, me=null, isGM=false, roomId='LIVE', roomRef=null, roomUnsub=null, queueRef=null, queueUnsub=null, latestRoom=null, latestQueue={};
  let toastTimer=null, endingTimer=null, testPreviewId=null;

  const realPlayersById=Object.fromEntries(CFG.players.map(p=>[p.id,p]));
  const TEST_PLAYERS=[1,2,3,4].map(n=>({id:`test_p${n}`,nameJP:`TEST PLAYER ${n}`,nameKR:`테스트 플레이어 ${n}`,grade:n<=2?1:n===3?2:3,className:'TEST'}));
  const testPlayersById=Object.fromEntries(TEST_PLAYERS.map(p=>[p.id,p]));
  const playerByEmail=email=>CFG.players.find(p=>p.email.toLowerCase()===String(email||'').toLowerCase());
  const isTestRoom=()=>String(roomId||'').startsWith('TEST_');
  const playerMeta=id=>realPlayersById[id]||testPlayersById[id]||{id,nameJP:id,nameKR:id,grade:'-'};
  const roomStage=r=>Number(r?.stage||0);
  const sub=r=>r?.substep||'lobby';

  function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600)}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function activeIds(r){
    if(isTestRoom()) return Array.isArray(r?.testPlayers)?r.testPlayers:[];
    if(Array.isArray(r?.players)) return r.players.filter(Boolean);
    if(r?.players&&typeof r.players==='object') return Object.values(r.players).filter(Boolean);
    return [];
  }
  function playerSlot(r,id){return activeIds(r).indexOf(id)}
  function allSameVote(r,key,expected){const ids=activeIds(r),v=r?.votes?.[key]||{};return ids.length>=3&&ids.every(id=>v[id]!==undefined&&v[id]!==null)&&ids.every(id=>String(v[id])===String(expected))}
  function voteCount(r,key){const ids=activeIds(r),v=r?.votes?.[key]||{};return ids.filter(id=>v[id]!==undefined&&v[id]!==null).length}
  function roomLabel(){return isTestRoom()?`GM TEST · ${String(roomId).endsWith('_4')?'4':'3'}인 모드`:'접속순 자동 매칭';}
  function selectedClass(selected,value,index){return String(selected)===String(value)||String(selected)===String(index)?'selected':''}
  function inCurrentGame(r,id){return activeIds(r).includes(id)}
  function queueEntries(){return Object.entries(latestQueue||{}).sort((a,b)=>Number(a[1]?.joinedAt||0)-Number(b[1]?.joinedAt||0));}
  function queuePosition(id){const i=queueEntries().findIndex(([pid])=>pid===id);return i<0?null:i+1;}

  const sel=$('#characterSelect');
  CFG.players.slice().sort((a,b)=>a.className.localeCompare(b.className)||a.grade-b.grade).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=`${p.nameJP} · ${p.nameKR} (${p.grade}학년 ${p.className}반)`;sel.appendChild(o)});
  $$('.mode-tab').forEach(btn=>btn.onclick=()=>{mode=btn.dataset.mode;$$('.mode-tab').forEach(b=>b.classList.toggle('active',b===btn));playerLogin.classList.toggle('hidden',mode!=='player');gmLogin.classList.toggle('hidden',mode!=='gm');authError.textContent=''});
  $('#playerLoginBtn').onclick=async()=>{authError.textContent='';const p=realPlayersById[sel.value];try{await auth.signInWithEmailAndPassword(p.email,$('#playerPassword').value)}catch(e){authError.textContent='로그인 실패: 비밀번호 또는 Firebase Authentication 설정을 확인해 주세요.'}};
  $('#gmLoginBtn').onclick=async()=>{authError.textContent='';try{await auth.signInWithEmailAndPassword(CFG.gmEmail,$('#gmPassword').value)}catch(e){authError.textContent='GM 로그인 실패: Firebase에 gm@kousei.local 계정을 만들었는지 확인해 주세요.'}};
  $('#logoutBtn').onclick=()=>auth.signOut();
  $('#changeRoomBtn').onclick=()=>{};

  auth.onAuthStateChanged(async user=>{
    currentUser=user;
    if(!user){detachRoom();me=null;isGM=false;roomId='LIVE';testPreviewId=null;authView.classList.remove('hidden');appView.classList.add('hidden');return}
    isGM=user.email.toLowerCase()===CFG.gmEmail.toLowerCase();
    me=isGM?{id:'gm',nameKR:'관리자',nameJP:'GM'}:playerByEmail(user.email);
    if(!me){auth.signOut();return}
    authView.classList.add('hidden');appView.classList.remove('hidden');
    $('#roleBadge').textContent=isGM?'GM':'PLAYER';
    $('#whoAmI').textContent=isGM?'게임 마스터':`${me.nameJP} · ${me.nameKR}`;
    $('#connectionState').textContent='Firebase 연결됨';
    gmPicker.classList.add('hidden'); roomView.classList.remove('hidden'); $('#changeRoomBtn').classList.add('hidden');
    $('#roomEyebrow').textContent=isGM?'GM CONTROL':'COURAGE TEST'; $('#roomTitle').textContent='最後の出席 · 마지막 출석';
    await joinGlobal();
    if(!isGM) await enqueueMe();
    await tryFillAndStart();
  });

  function detachRoom(){
    if(roomUnsub&&roomRef)roomRef.off('value',roomUnsub);
    if(queueUnsub&&queueRef)queueRef.off('value',queueUnsub);
    roomUnsub=null;queueUnsub=null;roomRef=null;queueRef=null;latestRoom=null;latestQueue={};clearTimeout(endingTimer);
  }

  async function joinGlobal(){
    detachRoom(); roomId='LIVE'; roomRef=db.ref('courageGame/live'); queueRef=db.ref('courageGame/queue');
    roomUnsub=snap=>{latestRoom=snap.val()||{};renderRoom(latestRoom);maybeAutoAdvance(latestRoom);maybeEnding(latestRoom)};
    queueUnsub=snap=>{latestQueue=snap.val()||{}; if(latestRoom)renderRoom(latestRoom); tryFillAndStart();};
    roomRef.on('value',roomUnsub,err=>toast(`Database 오류: ${err.message}`));
    queueRef.on('value',queueUnsub);
  }

  async function enqueueMe(){
    if(!me||isGM)return;
    const snap=await roomRef.once('value'), r=snap.val()||{};
    if(inCurrentGame(r,me.id))return;
    const q=await queueRef.child(me.id).once('value');
    if(!q.exists()) await queueRef.child(me.id).set({uid:currentUser.uid,name:me.nameKR,joinedAt:firebase.database.ServerValue.TIMESTAMP});
  }

  async function replayMe(){
    if(isGM||!me)return;
    await queueRef.child(me.id).set({uid:currentUser.uid,name:me.nameKR,joinedAt:firebase.database.ServerValue.TIMESTAMP,replay:true});
    toast('다음 게임 대기열에 다시 등록했어요.');
  }

  async function tryFillAndStart(){
    if(isTestRoom())return;
    const root=db.ref('courageGame');
    await root.transaction(data=>{
      data=data||{}; const live=data.live||{}; const stage=Number(live.stage||0);
      if(stage>0)return data;
      const q=data.queue||{};
      let players=Array.isArray(live.players)?live.players.filter(Boolean):[];
      const queued=Object.entries(q).sort((a,b)=>Number(a[1]?.joinedAt||0)-Number(b[1]?.joinedAt||0));
      for(const [id] of queued){ if(players.length>=4)break; if(players.includes(id)){delete q[id];continue;} players.push(id); delete q[id]; }
      if(players.length){ live.players=players; live.status='waiting'; live.stage=0; live.substep='lobby'; live.createdAt=live.createdAt||Date.now(); }
      if(players.length===4){
        live.stage=1; live.status='playing'; live.substep='main'; live.distortedId=players[Math.floor(Math.random()*players.length)]; live.witnessId=players[Math.floor(Math.random()*players.length)]; live.startedAt=Date.now(); live.hintLevel=0; live.testimonyUsed=0;
        delete live.votes; delete live.stageData; delete live.attendance; delete live.ending; delete live.objectives;
      }
      data.live=live; data.queue=q; return data;
    },()=>{},false).catch(()=>{});
  }

  async function gmStartThree(){
    if(!isGM)return; const snap=await roomRef.once('value'),r=snap.val()||{},ids=activeIds(r);
    if(roomStage(r)!==0||ids.length!==3){toast('현재 대기 중인 학생이 정확히 3명일 때만 시작할 수 있어요.');return}
    const distorted=ids[Math.floor(Math.random()*ids.length)],witness=ids[Math.floor(Math.random()*ids.length)];
    await roomRef.update({stage:1,status:'playing',substep:'main',distortedId:distorted,witnessId:witness,startedAt:firebase.database.ServerValue.TIMESTAMP,hintLevel:0,testimonyUsed:0,votes:null,stageData:null,attendance:null,ending:null,objectives:null});
  }

  async function finishAndNext(){
    if(!isGM)return;
    if(!confirm('현재 게임을 종료하고 다음 대기자 게임을 열까요?'))return;
    await roomRef.set(null); await tryFillAndStart(); toast('다음 게임을 열었어요.');
  }

  function renderRoom(r){
    if(isTestRoom()&&testPreviewId){renderPlayer(r,testPreviewId,true);prependTestBar(r);return}
    if(isGM){renderGM(r);return}
    if(inCurrentGame(r,me.id)){renderPlayer(r,me.id,false);return}
    renderWaiting(r);
  }

  function renderWaiting(r){
    const pos=queuePosition(me.id), playing=roomStage(r)>0, current=activeIds(r);
    const status=playing?'현재 다른 팀이 게임 진행 중입니다.':'현재 참가자를 모집 중입니다.';
    roomBody.innerHTML=`<div class="game-header"><div><span class="eyebrow">WAITING ROOM</span><h3>대기실</h3></div><div class="progress">대기 순번 ${pos??'-'}</div></div><div class="card"><h4>${esc(me.nameJP)} · ${esc(me.nameKR)}</h4><p>${status}</p><div class="record">현재 게임 인원 ${current.length}명\n대기열 ${queueEntries().length}명\n내 순번 ${pos??'배정 중'}</div></div><div class="notice">접속 순서대로 배정됩니다. 한 번에 한 팀만 게임을 진행합니다.</div>`;
  }
  function prependTestBar(r){
    const ids=activeIds(r);const wrap=document.createElement('div');wrap.className='card test-switcher';
    wrap.innerHTML=`<span class="eyebrow">GM TEST VIEW</span><div class="test-tabs"><button class="ghost small test-view ${!testPreviewId?'active':''}" data-view="gm">GM 화면</button>${ids.map((id,i)=>`<button class="ghost small test-view ${testPreviewId===id?'active':''}" data-view="${id}">P${i+1} 화면</button>`).join('')}</div><div class="gm-controls"><button id="autoSolveTest" class="primary">현재 단계 정답 자동 입력</button><button id="resetTest" class="ghost">테스트 처음부터</button><button id="exitTest" class="ghost">테스트 종료</button></div>`;
    roomBody.prepend(wrap);
    $$('.test-view').forEach(b=>b.onclick=()=>{testPreviewId=b.dataset.view==='gm'?null:b.dataset.view;renderRoom(latestRoom||{})});
    $('#autoSolveTest').onclick=()=>autoSolveCurrent(latestRoom||{});
    $('#resetTest').onclick=()=>startGMTest(activeIds(r).length||3);
    $('#exitTest').onclick=async()=>{await roomRef.set(null);leaveToPicker()};
  }

  function renderLobby(r,gm){
    const ids=activeIds(r), q=queueEntries();
    let html=`<div class="game-header"><div><span class="eyebrow">LOBBY</span><h3>${esc(roomLabel())}</h3></div><div class="progress">PLAYER ${ids.length} / 4</div></div><div class="roster">`;
    ids.forEach((id,i)=>{const p=playerMeta(id);html+=`<div class="roster-row"><div class="name"><strong>${i+1}. ${esc(p.nameJP)}</strong> · ${esc(p.nameKR)}</div><span class="state ready">입장 완료</span></div>`});
    for(let i=ids.length;i<4;i++)html+=`<div class="roster-row"><div class="name"><strong>${i+1}. 빈 자리</strong></div><span class="state">대기 중</span></div>`;
    html+=`</div><div class="ready-box"><p>${ids.length===3?'현재 3명입니다. 4번째 참가자가 들어오면 자동으로 시작합니다.':`4명이 모이면 자동으로 시작합니다. (${ids.length}/4)`}</p>`;
    if(gm&&ids.length===3)html+=`<button id="gmStart3Btn" class="primary">3명으로 지금 시작</button>`;
    html+=`</div>`;
    if(gm){html+=`<div class="card"><h4>다음 대기열</h4>${q.length?q.map(([id,v],i)=>`<div class="roster-row"><div class="name"><strong>${i+1}. ${esc(playerMeta(id).nameKR)}</strong></div><span class="state">대기</span></div>`).join(''):'<p class="state">대기 중인 학생이 없습니다.</p>'}</div><div class="card"><h4>GM 관리</h4><div class="gm-controls"><button id="finishNextLobby" class="ghost">현재 대기방 비우고 다음 순번</button></div></div>`}
    roomBody.innerHTML=html;
    if($('#gmStart3Btn'))$('#gmStart3Btn').onclick=gmStartThree;
    if($('#finishNextLobby'))$('#finishNextLobby').onclick=finishAndNext;
  }

  function renderPlayer(r,actorId,testing){
    const s=roomStage(r);
    if(s===0){if(!testing)renderLobby(r,false);return}
    if(!testing&&r?.excluded?.[actorId]){roomBody.innerHTML=`<div class="notice warning">이번 게임에서는 결석 처리되어 있습니다. GM에게 복귀 처리를 요청하세요.</div>`;return}
    if(s===1)renderS1(r,actorId);else if(s===2)renderS2(r,actorId);else if(s===3)renderS3(r,actorId);else if(s===4)renderS4(r,actorId);else if(s===5)renderFinal(r,actorId);
  }

  function stageHeader(data,r){return `<div class="game-header"><div><span class="eyebrow">${esc(data.label)}</span><h3>${esc(data.title)}</h3></div><div class="progress">${esc(roomLabel())}<br>출석 인원 ${activeIds(r).length+1}명</div></div><p class="story">${esc(data.intro||'')}</p>${basicInfoHTML(r)}${hintHTML(r)}`}
  function suspectRows(showItem=false){return CFG.suspects.map(x=>`<tr><td><strong>${esc(x.jp)}</strong><br><span>${esc(x.kr)}</span></td><td>${esc(x.grade)}</td><td>${esc(x.club)}</td><td>${esc(String(x.order))}번째</td>${showItem?`<td>${esc(x.item)}</td>`:''}</tr>`).join('')}
  function basicInfoHTML(r){
    const s=roomStage(r),ss=sub(r);
    if(s===1)return `<div class="card case-file"><div class="case-file-head"><span class="eyebrow">COMMON FILE</span><h4>과거 담력시험 참가자 기본 정보</h4></div><p class="state">이 정보는 모든 플레이어에게 공통으로 공개됩니다. 개인 기록과 함께 비교하세요.</p><div class="table-scroll"><table class="case-table"><thead><tr><th>학생</th><th>학년</th><th>동아리</th><th>출발</th><th>소지품</th></tr></thead><tbody>${suspectRows(true)}</tbody></table></div></div>`;
    if(s===2)return `<div class="card case-file"><div class="case-file-head"><span class="eyebrow">CASE FILE</span><h4>현재까지 복원된 기본 정보</h4></div><div class="case-grid"><div><b>대상 학생</b><span>水無瀬 空 · 미나세 소라</span></div><div><b>학적</b><span>2학년 · 수영부</span></div><div><b>출발 순서</b><span>4번째</span></div><div><b>조사 상태</b><span>귀환 시각 미확인</span></div></div><p class="state">STAGE 1에서 복원한 정보입니다. 이번 라운드의 개인 시간 기록과 연결하세요.</p></div>`;
    if(s===3)return `<div class="card case-file"><div class="case-file-head"><span class="eyebrow">CASE FILE</span><h4>사건 기본 기록</h4></div><div class="case-grid"><div><b>참가자</b><span>青木 春 / 水無瀬 空 / 白川 蓮 / 橘 直</span></div><div><b>복원된 이름</b><span>水無瀬 空</span></div><div><b>확인 시각</b><span>22:47</span></div><div><b>확인 내용</b><span>소라는 당시 일행과 함께 있었음</span></div></div><p class="state">과거 증언의 “22시 40분 이전”과 이미 모순됩니다. ${ss==='map'?'지금까지 검증한 위치 기록을 지도와 함께 비교하세요.':'개인 화면의 기록 차이를 먼저 확인하세요.'}</p></div>`;
    if(s===4)return `<div class="card case-file"><div class="case-file-head"><span class="eyebrow">REFERENCE</span><h4>과거 참가자 식별 정보</h4></div><div class="table-scroll"><table class="case-table compact"><thead><tr><th>학생</th><th>동아리</th><th>대표 소지품</th></tr></thead><tbody>${CFG.suspects.map(x=>`<tr><td><strong>${esc(x.jp)}</strong><br><span>${esc(x.kr)}</span></td><td>${esc(x.club)}</td><td>${esc(x.item)}</td></tr>`).join('')}</tbody></table></div><div class="case-grid small-grid"><div><b>확정 위치</b><span>두 번째 표식 이후 숲길</span></div><div><b>확정 상태</b><span>소라는 일행과 분리됨</span></div></div><p class="state">그림 증언에서 인물을 표현할 때 이 기본 정보를 참고할 수 있습니다.</p></div>`;
    if(s===5)return `<div class="card case-file"><div class="case-file-head"><span class="eyebrow">CASE RECORD</span><h4>지금까지 확인된 사건 기록</h4></div><div class="case-grid"><div><b>01 · NAME</b><span>水無瀬 空</span></div><div><b>02 · LAST CONFIRMED</b><span>22:47 · 일행과 함께 있음</span></div><div><b>03 · SEPARATION</b><span>두 번째 표식 이후 숲길</span></div><div><b>04 · TRUTH</b><span>의도적으로 남겨짐</span></div></div></div>`;
    return '';
  }
  function hintHTML(r){const lvl=Number(r.hintLevel||0),s=roomStage(r),data=s===5?CFG.stages.final:CFG.stages[s];if(!lvl||!data?.hints)return'';return `<div class="notice">HINT ${lvl} · ${esc(data.hints[Math.min(lvl-1,data.hints.length-1)])}</div>`}
  function optionLabel(o){
    if(o&&typeof o==='object'&&o.jp)return `${o.jp} · ${o.kr}`;
    const text=String(o??'');
    const suspect=CFG.suspects.find(x=>x.jp===text);
    return suspect?`${suspect.jp} · ${suspect.kr}`:text;
  }
  function choicesHTML(options,selected,valueFn=i=>i){return `<div class="choices">${options.map((o,i)=>{const value=valueFn(i,o);return `<button class="choice ${selectedClass(selected,value,i)}" data-v="${esc(i)}">${esc(optionLabel(o))}</button>`}).join('')}</div>`}
  function bindVote(key,actorId,transform=i=>i){$$('.choice').forEach(b=>b.onclick=()=>roomRef.child(`votes/${key}/${actorId}`).set(transform(Number(b.dataset.v))))}

  function renderS1(r,actorId){const d=CFG.stages[1],ids=activeIds(r),slot=playerSlot(r,actorId),clue=d.clues[Math.min(slot,d.clues.length-1)],vote=r?.votes?.s1?.[actorId];let html=stageHeader(d,r);html+=`<div class="card"><h4>${esc(clue.title)}</h4><div class="record">${esc(clue.text)}</div></div><div class="card"><h4>후보 학생</h4>${choicesHTML(CFG.suspects,vote,(i,o)=>o.id)}</div><div class="notice">전원 같은 학생을 선택해야 제출됩니다. 현재 선택 ${voteCount(r,'s1')} / ${ids.length}</div>`;roomBody.innerHTML=html;bindVote('s1',actorId,i=>CFG.suspects[i].id)}

  function renderS2(r,actorId){const d=CFG.stages[2],ids=activeIds(r),slot=playerSlot(r,actorId),ss=sub(r);let html=stageHeader(d,r);if(ss==='time'){const clue=d.p1[Math.min(slot,d.p1.length-1)];html+=`<div class="card"><h4>${esc(clue.title)}</h4><div class="record">${esc(clue.text)}</div></div><div class="card"><h4>복원된 실제 시각</h4>${choicesHTML(d.timeOptions,r?.votes?.s2time?.[actorId],(i,o)=>o)}</div><div class="notice">세 자료를 연결해야 ±8분 중 방향을 결정할 수 있습니다. ${voteCount(r,'s2time')}/${ids.length}</div>`;roomBody.innerHTML=html;bindVote('s2time',actorId,i=>d.timeOptions[i])}else{const clue=d.p2[Math.min(slot,d.p2.length-1)];html+=`<div class="notice success">1차 복원 완료 · 22:47</div><div class="card"><h4>${esc(clue.title)}</h4><div class="record">${esc(clue.text)}</div></div><div class="card"><h4>현재 기록으로 확정할 수 있는 것은?</h4>${choicesHTML(d.meaningOptions,r?.votes?.s2meaning?.[actorId])}</div>`;roomBody.innerHTML=html;bindVote('s2meaning',actorId,i=>i)}}

  function renderS3(r,actorId){const d=CFG.stages[3],ids=activeIds(r),slot=playerSlot(r,actorId),ss=sub(r);let html=stageHeader(d,r);if(ss==='different'){const arr=actorId===r.distortedId?d.distorted:d.normal;const opts=ids.map(id=>({jp:playerMeta(id).nameJP,kr:playerMeta(id).nameKR}));html+=`<div class="card"><h4>복구 기록 A</h4><div class="record">${arr.map(x=>'• '+x).join('\n')}</div></div><div class="card"><h4>다른 기록을 보고 있는 사람은?</h4>${choicesHTML(opts,r?.votes?.s3different?.[actorId],i=>ids[i])}</div>`;roomBody.innerHTML=html;bindVote('s3different',actorId,i=>ids[i])}else if(ss==='count'){const clue=d.verifyClues[Math.min(slot,d.verifyClues.length-1)];html+=`<div class="card"><h4>${esc(clue.title)}</h4><div class="record">${esc(clue.text)}</div></div><div class="card"><h4>두 번째 표식 통과 인원</h4>${choicesHTML(d.countOptions,r?.votes?.s3count?.[actorId],(i,o)=>o)}</div>`;roomBody.innerHTML=html;bindVote('s3count',actorId,i=>d.countOptions[i])}else{html+=`<div class="notice success">두 번째 표식까지는 4명이 함께 있었습니다.</div><div class="card"><h4>코스 지도</h4><div class="record">관리동\n↓\n두 번째 표식\n↓\n숲길\n↓\n세 번째 표식\n↓\n숙소</div></div><div class="card"><h4>소라는 어디에서 일행과 떨어졌습니까?</h4>${choicesHTML(d.mapOptions,r?.votes?.s3map?.[actorId])}</div>`;roomBody.innerHTML=html;bindVote('s3map',actorId,i=>i)}}

  function renderS4(r,actorId){const d=CFG.stages[4],ss=sub(r);let html=stageHeader(d,r);if(ss==='witness'){const witness=actorId===r.witnessId,assignments=stage4Assignments(r),assigned=assignments[actorId]||[];if(witness){html+=`<div class="card warning"><h4>👁 WITNESS · 당신만 보는 원본</h4><div class="record">${esc(d.witnessRecord.join('\n'))}</div></div><div class="notice warning">${esc(d.rules)}</div><div class="card"><h4>남은 증언권</h4><div class="dots">${'● '.repeat(Math.max(0,5-Number(r.testimonyUsed||0)))}${'○ '.repeat(Number(r.testimonyUsed||0))}</div><button id="useTestimony" class="primary">그림 증언 1회 사용</button></div><div class="notice">당신은 WITNESS입니다. 조사 목표는 없습니다. 다른 참가자의 질문에 그림으로만 답하세요.</div>`}else{html+=`<div class="notice">WITNESS는 밴드에서 그림으로만 답할 수 있습니다. 질문은 자유입니다.</div>`;assigned.forEach(idx=>{const obj=d.objectives[idx],selected=r?.objectives?.[actorId]?.[idx];html+=`<div class="card objective"><h4>당신의 조사 목표 · ${esc(obj.title)}</h4>${choicesHTML(obj.options,selected).replaceAll('class="choice ',`class="choice s4obj" data-obj="${idx}" `)}</div>`});html+=`<div class="notice">조사 목표를 서로 공유하고 WITNESS에게 질문하세요. 모든 목표가 정답이면 사건 복원 단계가 열립니다.</div>`}roomBody.innerHTML=html;$$('.s4obj').forEach(b=>b.onclick=()=>roomRef.child(`objectives/${actorId}/${b.dataset.obj}`).set(Number(b.dataset.v)));if($('#useTestimony'))$('#useTestimony').onclick=()=>roomRef.child('testimonyUsed').transaction(v=>Math.min(5,Number(v||0)+1))}else{html+=`<div class="notice success">개인 조사 목표가 모두 해결되었습니다.</div><div class="card"><h4>소라는 왜 혼자 남게 되었습니까?</h4>${choicesHTML(d.truthOptions,r?.votes?.s4truth?.[actorId])}</div>`;roomBody.innerHTML=html;bindVote('s4truth',actorId,i=>i)}}

  function renderFinal(r,actorId){const d=CFG.stages.final,ids=activeIds(r),ss=sub(r);let html=stageHeader(d,r);if(ss==='fact'){html+=`<div class="card"><h4>공식 기록</h4><div class="record">담력시험 출발 — 4명\n담력시험 귀환 — 4명\n실종 — 0명\n사고 — 없음</div></div><div class="card"><h4>확실하게 증명된 사실</h4>${choicesHTML(d.facts,r?.votes?.ffact?.[actorId])}</div>`;roomBody.innerHTML=html;bindVote('ffact',actorId,i=>i)}else if(ss==='soraCheck'){html+=`<div class="card"><h4>宿舎 帰還確認表</h4><div class="record">青木 春　✓\n白川 蓮　✓\n橘 直　✓\n█████　✓</div></div><div class="notice">네 번째 이름으로 가장 먼저 水無瀬 空의 기록을 대조합니다.</div><button id="checkSora" class="primary">水無瀬 空 기록 대조</button>`;roomBody.innerHTML=html;$('#checkSora').onclick=()=>roomRef.update({substep:'pattern',votes:null})}else if(ss==='pattern'){html+=`<div class="notice warning">水無瀬 空 — 일치하지 않습니다.<br>귀환을 증명하는 기록이 없습니다.</div><div class="card"><h4>두 기록의 공통점</h4><div class="record">과거: 실제 귀환 3 / 기록 귀환 4 → +1\n현재: 실제 참가 ${ids.length} / 출석 인원 ${ids.length+1} → +1</div>${choicesHTML(d.pattern,r?.votes?.fpattern?.[actorId])}</div>`;roomBody.innerHTML=html;bindVote('fpattern',actorId,i=>i)}else if(ss==='repair'){html+=`<div class="card"><h4>이 기록을 끝내기 위해 필요한 것은?</h4>${choicesHTML(d.ending,r?.votes?.frepair?.[actorId])}</div>`;roomBody.innerHTML=html;bindVote('frepair',actorId,i=>i)}else if(ss==='attendance'){const at=r.attendance||{},count=ids.filter(id=>at[id]).length,mine=!!at[actorId];html+=`<div class="final-screen"><div class="notice success">공식 기록 수정 완료<br>귀환 4 → 3 / 실종 0 → 1 / 水無瀬 空 — 未帰還</div><h3>현재 출석 확인</h3><p>이번에는 전원이 확인될 때까지 이동하지 마십시오.</p><div class="count-big">${count} / ${ids.length+1}</div><button id="attendBtn" class="primary" ${mine?'disabled':''}>${mine?'出席 완료':'出席する · 출석하기'}</button></div>`;roomBody.innerHTML=html;if(!mine)$('#attendBtn').onclick=()=>roomRef.child(`attendance/${actorId}`).set(true)}else{roomBody.innerHTML=endingHTML(r);if($('#replayBtn')&&!$('#replayBtn').disabled)$('#replayBtn').onclick=replayMe}}

  function endingHTML(r){const ids=activeIds(r),at=r.attendance||{},count=ids.filter(id=>at[id]).length,queued=!isGM&&queuePosition(me?.id)!=null;return `<div class="final-screen"><div class="count-big">${count} / ${count}</div><div class="sora-line">水無瀬 空<br><strong>「帰ります。」</strong><br><span class="state">돌아갈게.</span></div><div class="big">全員、出席しました。</div><p>전원 출석했습니다.</p><p class="story"><strong>이번에는 아무도 두고 가지 않았습니다.</strong></p><div class="eyebrow">肝試し — CLEAR</div>${!isGM?`<button id="replayBtn" class="primary" ${queued?'disabled':''}>${queued?'다음 게임 대기 중':'다시 참여하기'}</button>`:''}</div>`}
  async function maybeEnding(r){if(roomStage(r)!==5||sub(r)!=='attendance')return;const ids=activeIds(r),at=r.attendance||{};if(ids.length>=3&&ids.every(id=>at[id])){clearTimeout(endingTimer);endingTimer=setTimeout(()=>{if(latestRoom&&roomStage(latestRoom)===5&&sub(latestRoom)==='attendance')roomRef.update({substep:'ending',ending:{at:firebase.database.ServerValue.TIMESTAMP}})},2200)}}

  function renderGM(r){const s=roomStage(r);if(s===0){renderLobby(r,true);return}const data=s===5?CFG.stages.final:CFG.stages[s],ids=activeIds(r),ss=sub(r);let html=`<div class="game-header"><div><span class="eyebrow">GM CONTROL · ${esc(data.label)}</span><h3>${esc(data.title)}</h3></div><div class="progress">${esc(roomLabel())}<br>${esc(ss)}</div></div><div class="gm-grid"><div class="card"><h4>현재 상태</h4><div class="record">PLAYER ${ids.length}명\n참가자 ${ids.length}명\n게임 상태 ${roomStage(r)>0?'진행 중':'대기 중'}\n다음 대기 ${queueEntries().length}명\n출석 표시 ${ids.length+1}명</div></div><div class="card"><h4>특수 상태</h4><div class="record">STAGE 3 변조 대상: ${esc(playerMeta(r.distortedId).nameKR||'-')}\nSTAGE 4 WITNESS: ${esc(playerMeta(r.witnessId).nameKR||'-')}\n증언 사용: ${Number(r.testimonyUsed||0)}/5</div></div></div>`;
    html+=gmDetail(r)+`<div class="card"><h4>GM 조작</h4><div class="gm-controls"><button id="hint1" class="ghost">힌트 1 공개</button><button id="hint2" class="ghost">힌트 2 공개</button><button id="testMinus" class="ghost">증언권 +1</button><button id="testPlus" class="ghost">증언권 -1</button><button id="force" class="ghost">현재 단계 강제 진행</button><button id="finishGame" class="primary">게임 종료 · 다음 팀</button><button id="resetRoom" class="ghost">${isTestRoom()?'테스트 데이터 초기화':'현재 게임 초기화'}</button></div></div>`;roomBody.innerHTML=html;
    $('#hint1').onclick=()=>roomRef.child('hintLevel').set(1);$('#hint2').onclick=()=>roomRef.child('hintLevel').set(2);$('#testMinus').onclick=()=>roomRef.child('testimonyUsed').transaction(v=>Math.max(0,Number(v||0)-1));$('#testPlus').onclick=()=>roomRef.child('testimonyUsed').transaction(v=>Math.min(5,Number(v||0)+1));$('#force').onclick=()=>forceNext(r);if($('#finishGame'))$('#finishGame').onclick=finishAndNext;$('#resetRoom').onclick=()=>{if(confirm('현재 게임 데이터를 초기화할까요?')){if(isTestRoom())startGMTest(activeIds(r).length||3);else roomRef.update({stage:0,status:'waiting',substep:'lobby',votes:null,stageData:null,attendance:null,ending:null,objectives:null,hintLevel:0,testimonyUsed:0})}};
  }

  function gmDetail(r){const s=roomStage(r),ss=sub(r),ids=activeIds(r);let x=`<div class="card"><h4>PLAYER별 정보</h4>`;ids.forEach((id,i)=>{let info='';if(s===1)info=CFG.stages[1].clues[i].title+' — '+CFG.stages[1].clues[i].text;if(s===2){const c=(ss==='time'?CFG.stages[2].p1[i]:CFG.stages[2].p2[i]);if(c)info=c.title+' — '+c.text}if(s===3&&ss==='different')info=id===r.distortedId?'변조 기록 수신자':'정상 기록';if(s===3&&ss==='count'){const c=CFG.stages[3].verifyClues[i];if(c)info=c.title+' — '+c.text}if(s===4&&ss==='witness'){if(id===r.witnessId)info='WITNESS · 조사 목표 없음 · 그림 증언 담당';else{const a=stage4Assignments(r)[id]||[];info=a.map(idx=>{const o=CFG.stages[4].objectives[idx];return `목표: ${o.title} / 정답: ${o.options[o.answer]}`}).join(' | ')}}x+=`<div class="roster-row"><div class="name"><strong>${esc(playerMeta(id).nameKR)}</strong><div class="state">${esc(info)}</div></div></div>`});const answer=s===1?'水無瀬 空':s===2?(ss==='time'?'22:47':'22:47은 소라가 일행과 함께 있었음이 확인된 마지막 시각'):s===3?(ss==='different'?playerMeta(r.distortedId).nameKR:ss==='count'?'4명':'두 번째 표식 → 세 번째 표식 사이 숲길'):s===4?(ss==='witness'?'개인 목표 전부 해결':CFG.stages[4].truthOptions[CFG.stages[4].truthAnswer]):s===5?(ss==='fact'?CFG.stages.final.facts[CFG.stages.final.factAnswer]:ss==='pattern'?CFG.stages.final.pattern[CFG.stages.final.patternAnswer]:ss==='repair'?CFG.stages.final.ending[CFG.stages.final.endingAnswer]:'진행 중'):'-';return x+`</div><div class="notice">GM 정답 · <strong>${esc(answer||'-')}</strong></div>`}

  async function forceNext(r){const s=roomStage(r),ss=sub(r);if(s===1)return advance(2,'time');if(s===2&&ss==='time')return roomRef.update({substep:'meaning',votes:null});if(s===2)return advance(3,'different');if(s===3&&ss==='different')return roomRef.update({substep:'count',votes:null});if(s===3&&ss==='count')return roomRef.update({substep:'map',votes:null});if(s===3)return advance(4,'witness');if(s===4&&ss==='witness')return roomRef.update({substep:'truth',votes:null});if(s===4)return advance(5,'fact');if(s===5&&ss==='fact')return roomRef.update({substep:'soraCheck',votes:null});if(s===5&&ss==='soraCheck')return roomRef.update({substep:'pattern',votes:null});if(s===5&&ss==='pattern')return roomRef.update({substep:'repair',votes:null});if(s===5&&ss==='repair')return roomRef.update({substep:'attendance',votes:null});if(s===5&&ss==='attendance')return roomRef.update({substep:'ending'})}

  async function autoSolveCurrent(r){if(!isTestRoom())return;const ids=activeIds(r),s=roomStage(r),ss=sub(r);let updates={};
    if(s===1)ids.forEach(id=>updates[`votes/s1/${id}`]=CFG.stages[1].answer);
    else if(s===2&&ss==='time')ids.forEach(id=>updates[`votes/s2time/${id}`]=CFG.stages[2].timeAnswer);
    else if(s===2&&ss==='meaning')ids.forEach(id=>updates[`votes/s2meaning/${id}`]=CFG.stages[2].meaningAnswer);
    else if(s===3&&ss==='different')ids.forEach(id=>updates[`votes/s3different/${id}`]=r.distortedId);
    else if(s===3&&ss==='count')ids.forEach(id=>updates[`votes/s3count/${id}`]=CFG.stages[3].countAnswer);
    else if(s===3&&ss==='map')ids.forEach(id=>updates[`votes/s3map/${id}`]=CFG.stages[3].mapAnswer);
    else if(s===4&&ss==='witness'){const a=stage4Assignments(r);Object.entries(a).forEach(([id,list])=>list.forEach(idx=>updates[`objectives/${id}/${idx}`]=CFG.stages[4].objectives[idx].answer));}
    else if(s===4&&ss==='truth')ids.forEach(id=>updates[`votes/s4truth/${id}`]=CFG.stages[4].truthAnswer);
    else if(s===5&&ss==='fact')ids.forEach(id=>updates[`votes/ffact/${id}`]=CFG.stages.final.factAnswer);
    else if(s===5&&ss==='soraCheck')updates['substep']='pattern';
    else if(s===5&&ss==='pattern')ids.forEach(id=>updates[`votes/fpattern/${id}`]=CFG.stages.final.patternAnswer);
    else if(s===5&&ss==='repair')ids.forEach(id=>updates[`votes/frepair/${id}`]=CFG.stages.final.endingAnswer);
    else if(s===5&&ss==='attendance')ids.forEach(id=>updates[`attendance/${id}`]=true);
    else if(s===5&&ss==='ending'){toast('이미 CLEAR 상태예요.');return}
    await roomRef.update(updates);toast('현재 단계 정답을 입력했어요.');
  }
})();

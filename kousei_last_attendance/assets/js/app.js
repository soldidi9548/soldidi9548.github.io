(function(){
  const CFG=window.KOUSEI_COURAGE, FCFG=window.KOUSEI_FIREBASE_CONFIG;
  firebase.initializeApp(FCFG);
  const auth=firebase.auth(), db=firebase.database();
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});

  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const authView=$('#authView'), appView=$('#appView'), playerLogin=$('#playerLogin'), gmLogin=$('#gmLogin'), authError=$('#authError');
  const roomView=$('#roomView'), roomBody=$('#roomBody'), gmPicker=$('#gmRoomPicker');
  let mode='player', currentUser=null, me=null, isGM=false, roomId=null, roomRef=null, roomUnsub=null, latestRoom=null;
  let toastTimer=null, endingTimer=null;

  const playersById=Object.fromEntries(CFG.players.map(p=>[p.id,p]));
  const playerByEmail=email=>CFG.players.find(p=>p.email.toLowerCase()===String(email||'').toLowerCase());
  const roomPlayers=id=>CFG.players.filter(p=>p.className===id).sort((a,b)=>a.grade-b.grade||a.nameKR.localeCompare(b.nameKR,'ko'));
  const refPath=()=>`courageGame/rooms/${roomId}`;
  const roomStage=(r)=>Number(r?.stage||0);
  const sub=(r)=>r?.substep||'lobby';

  function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function activeIds(r){const excluded=r?.excluded||{};return roomPlayers(roomId).map(p=>p.id).filter(id=>!excluded[id])}
  function playerSlot(r,id){return activeIds(r).indexOf(id)}
  function allReady(r){const ids=activeIds(r);return ids.length>=3 && ids.every(id=>r?.ready?.[id]) && !!r?.gmReady}
  function allSameVote(r,key,expected){const ids=activeIds(r);const v=r?.votes?.[key]||{};return ids.length>0&&ids.every(id=>v[id]!==undefined&&v[id]!==null)&&ids.every(id=>String(v[id])===String(expected))}
  function voteCount(r,key){const ids=activeIds(r), v=r?.votes?.[key]||{};return ids.filter(id=>v[id]!==undefined&&v[id]!==null).length}
  function roomLabel(){return `${roomId}반 · 1·2·3학년 ${roomId}반`}

  // auth UI
  const sel=$('#characterSelect');
  CFG.players.slice().sort((a,b)=>a.className.localeCompare(b.className)||a.grade-b.grade).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=`${p.nameJP} · ${p.nameKR} (${p.grade}학년 ${p.className}반)`;sel.appendChild(o)});
  $$('.mode-tab').forEach(btn=>btn.onclick=()=>{mode=btn.dataset.mode;$$('.mode-tab').forEach(b=>b.classList.toggle('active',b===btn));playerLogin.classList.toggle('hidden',mode!=='player');gmLogin.classList.toggle('hidden',mode!=='gm');authError.textContent=''});
  $('#playerLoginBtn').onclick=async()=>{authError.textContent='';const p=playersById[sel.value];try{await auth.signInWithEmailAndPassword(p.email,$('#playerPassword').value)}catch(e){authError.textContent='로그인 실패: 비밀번호 또는 Firebase Authentication 설정을 확인해 주세요.'}};
  $('#gmLoginBtn').onclick=async()=>{authError.textContent='';try{await auth.signInWithEmailAndPassword(CFG.gmEmail,$('#gmPassword').value)}catch(e){authError.textContent='GM 로그인 실패: Firebase에 gm@kousei.local 계정을 만들었는지 확인해 주세요.'}};
  $('#logoutBtn').onclick=()=>auth.signOut();
  $('#changeRoomBtn').onclick=()=>{detachRoom();roomId=null;roomView.classList.add('hidden');gmPicker.classList.remove('hidden')};
  $$('.room-buttons button').forEach(b=>b.onclick=()=>joinRoom(b.dataset.room));

  auth.onAuthStateChanged(user=>{
    currentUser=user;
    if(!user){detachRoom();me=null;isGM=false;roomId=null;authView.classList.remove('hidden');appView.classList.add('hidden');return}
    isGM=user.email.toLowerCase()===CFG.gmEmail.toLowerCase();
    me=isGM?{id:'gm',nameKR:'관리자',nameJP:'GM'}:playerByEmail(user.email);
    if(!me){auth.signOut();return}
    authView.classList.add('hidden');appView.classList.remove('hidden');
    $('#roleBadge').textContent=isGM?'GM':'PLAYER';$('#whoAmI').textContent=isGM?'게임 마스터':`${me.nameJP} · ${me.nameKR}`;
    $('#connectionState').textContent='Firebase 연결됨';
    if(isGM){gmPicker.classList.remove('hidden');roomView.classList.add('hidden')}else{joinRoom(me.className)}
  });

  function detachRoom(){if(roomUnsub){roomRef.off('value',roomUnsub);roomUnsub=null}roomRef=null;latestRoom=null;clearTimeout(endingTimer)}
  async function joinRoom(id){detachRoom();roomId=id;roomRef=db.ref(`courageGame/rooms/${id}`);gmPicker.classList.add('hidden');roomView.classList.remove('hidden');$('#changeRoomBtn').classList.toggle('hidden',!isGM);$('#roomEyebrow').textContent='COURAGE TEST ROOM';$('#roomTitle').textContent=roomLabel();
    if(!isGM){await roomRef.child(`presence/${me.id}`).set({name:me.nameKR,uid:currentUser.uid,at:firebase.database.ServerValue.TIMESTAMP})}
    roomUnsub=snap=>{latestRoom=snap.val()||{};renderRoom(latestRoom);maybeAutoStart(latestRoom);maybeAutoAdvance(latestRoom);maybeEnding(latestRoom)};roomRef.on('value',roomUnsub);
  }

  async function maybeAutoStart(r){if(isGM&&roomStage(r)===0&&allReady(r)&&!r.starting){
    const ids=activeIds(r);const distorted=ids[Math.floor(Math.random()*ids.length)], witness=ids[Math.floor(Math.random()*ids.length)];
    await roomRef.update({stage:1,substep:'main',starting:false,distortedId:distorted,witnessId:witness,startedAt:firebase.database.ServerValue.TIMESTAMP,hintLevel:0,votes:null,stageData:null,attendance:null,ending:null});
  }}

  async function maybeAutoAdvance(r){if(!isGM)return; const s=roomStage(r), ss=sub(r);
    if(s===1 && allSameVote(r,'s1',CFG.stages[1].answer)) await advance(2,'time');
    else if(s===2 && ss==='time' && allSameVote(r,'s2time',CFG.stages[2].timeAnswer)) await roomRef.update({substep:'meaning',votes:null,hintLevel:0});
    else if(s===2 && ss==='meaning' && allSameVote(r,'s2meaning',CFG.stages[2].meaningAnswer)) await advance(3,'different');
    else if(s===3 && ss==='different' && allSameVote(r,'s3different',r.distortedId)) await roomRef.update({substep:'count',votes:null,hintLevel:0});
    else if(s===3 && ss==='count' && allSameVote(r,'s3count',CFG.stages[3].countAnswer)) await roomRef.update({substep:'map',votes:null,hintLevel:0});
    else if(s===3 && ss==='map' && allSameVote(r,'s3map',CFG.stages[3].mapAnswer)) await advance(4,'witness');
    else if(s===4 && ss==='witness' && objectivesComplete(r)) await roomRef.update({substep:'truth',votes:null,hintLevel:0});
    else if(s===4 && ss==='truth' && allSameVote(r,'s4truth',CFG.stages[4].truthAnswer)) await advance(5,'fact');
    else if(s===5 && ss==='fact' && allSameVote(r,'ffact',CFG.stages.final.factAnswer)) await roomRef.update({substep:'soraCheck',votes:null,hintLevel:0});
    else if(s===5 && ss==='pattern' && allSameVote(r,'fpattern',CFG.stages.final.patternAnswer)) await roomRef.update({substep:'repair',votes:null,hintLevel:0});
    else if(s===5 && ss==='repair' && allSameVote(r,'frepair',CFG.stages.final.endingAnswer)) await roomRef.update({substep:'attendance',votes:null,hintLevel:0});
  }
  async function advance(stage,substep){await roomRef.update({stage,substep,votes:null,hintLevel:0,stageData:null})}
  function objectivesComplete(r){const ids=activeIds(r), obj=r?.objectives||{};return ids.every((id,i)=>Number(obj[id])===Number(CFG.stages[4].objectives[i].answer))}

  function renderRoom(r){
    if(isGM) renderGM(r); else renderPlayer(r);
  }

  function renderLobby(r,gm){const ids=activeIds(r);const ready=r.ready||{};let html=`<div class="game-header"><div><span class="eyebrow">LOBBY</span><h3>${esc(roomLabel())}</h3></div><div class="progress">PLAYER ${ids.length}명 + GM 1명</div></div><div class="roster">`;
    roomPlayers(roomId).forEach(p=>{const ex=!!r?.excluded?.[p.id];html+=`<div class="roster-row"><div class="name"><strong>${esc(p.nameJP)}</strong> · ${esc(p.nameKR)} <span class="state">${p.grade}학년</span></div><span class="state ${ready[p.id]?'ready':''} ${ex?'off':''}">${ex?'결석 처리':ready[p.id]?'READY':'대기 중'}</span>${gm?`<button class="ghost small absence" data-id="${p.id}">${ex?'복귀':'결석'}</button>`:''}</div>`});
    html+=`<div class="roster-row"><div class="name"><strong>GM</strong> · 관리자</div><span class="state ${r.gmReady?'ready':''}">${r.gmReady?'READY':'대기 중'}</span></div></div><div class="ready-box"><p>${allReady(r)?'전원 준비 완료. 게임을 시작합니다…':'학생 전원과 GM이 READY 해야 시작됩니다.'}</p>`;
    if(gm) html+=`<button id="gmReadyBtn" class="primary">${r.gmReady?'GM READY 취소':'GM READY'}</button>`; else html+=`<button id="playerReadyBtn" class="primary">${ready[me.id]?'READY 취소':'READY'}</button>`;
    html+=`</div>`;roomBody.innerHTML=html;
    if(gm){$('#gmReadyBtn').onclick=()=>roomRef.child('gmReady').set(!r.gmReady);$$('.absence').forEach(b=>b.onclick=()=>roomRef.child(`excluded/${b.dataset.id}`).set(!r?.excluded?.[b.dataset.id]))}else $('#playerReadyBtn').onclick=()=>roomRef.child(`ready/${me.id}`).set(!ready[me.id]);
  }

  function renderPlayer(r){const s=roomStage(r);if(s===0){renderLobby(r,false);return} if(r?.excluded?.[me.id]){roomBody.innerHTML=`<div class="notice warning">이번 게임에서는 결석 처리되어 있습니다. GM에게 복귀 처리를 요청하세요.</div>`;return}
    if(s===1) renderS1(r,false); else if(s===2) renderS2(r,false); else if(s===3) renderS3(r,false); else if(s===4) renderS4(r,false); else if(s===5) renderFinal(r,false);
  }

  function stageHeader(data,r){return `<div class="game-header"><div><span class="eyebrow">${esc(data.label)}</span><h3>${esc(data.title)}</h3></div><div class="progress">${esc(roomLabel())}<br>출석 인원 ${activeIds(r).length+1}명</div></div><p class="story">${esc(data.intro||'')}</p>${hintHTML(r)}`}
  function hintHTML(r){const lvl=Number(r.hintLevel||0), s=roomStage(r), data=s===5?CFG.stages.final:CFG.stages[s];if(!lvl||!data?.hints)return'';return `<div class="notice">HINT ${lvl} · ${esc(data.hints[Math.min(lvl-1,data.hints.length-1)])}</div>`}
  function choicesHTML(options,key,r,selected){return `<div class="choices">${options.map((o,i)=>`<button class="choice ${String(selected)===String(i)||String(selected)===String(o)?'selected':''}" data-v="${esc(i)}">${esc(o.jp?`${o.jp} · ${o.kr}`:o)}</button>`).join('')}</div>`}
  function bindVote(key,options,transform=i=>i){$$('.choice').forEach(b=>b.onclick=()=>roomRef.child(`votes/${key}/${me.id}`).set(transform(Number(b.dataset.v))))}

  function renderS1(r,gm){const d=CFG.stages[1], ids=activeIds(r), slot=gm?0:playerSlot(r,me.id), clue=d.clues[Math.min(slot,d.clues.length-1)], vote=r?.votes?.s1?.[me?.id];let html=stageHeader(d,r);
    if(!gm) html+=`<div class="card"><h4>${esc(clue.title)}</h4><div class="record">${esc(clue.text)}</div></div><div class="card"><h4>후보 학생</h4>${choicesHTML(CFG.suspects,'s1',r,vote)}</div><div class="notice">전원 같은 학생을 선택해야 제출됩니다. 현재 선택 ${voteCount(r,'s1')} / ${ids.length}</div>`;
    roomBody.innerHTML=html;if(!gm) bindVote('s1',CFG.suspects,i=>CFG.suspects[i].id)
  }

  function renderS2(r,gm){const d=CFG.stages[2], ids=activeIds(r), slot=gm?0:playerSlot(r,me.id), ss=sub(r);let html=stageHeader(d,r);
    if(ss==='time'){const clue=d.p1[Math.min(slot,d.p1.length-1)];if(!gm)html+=`<div class="card"><h4>${esc(clue.title)}</h4><div class="record">${esc(clue.text)}</div></div><div class="card"><h4>복원된 실제 시각</h4>${choicesHTML(d.timeOptions,'s2time',r,r?.votes?.s2time?.[me.id])}</div><div class="notice">세 자료를 연결해야 ±8분 중 방향을 결정할 수 있습니다. ${voteCount(r,'s2time')}/${ids.length}</div>`}
    else {const clue=d.p2[Math.min(slot,d.p2.length-1)];if(!gm)html+=`<div class="notice success">1차 복원 완료 · 22:47</div><div class="card"><h4>${esc(clue.title)}</h4><div class="record">${esc(clue.text)}</div></div><div class="card"><h4>현재 기록으로 확정할 수 있는 것은?</h4>${choicesHTML(d.meaningOptions,'s2meaning',r,r?.votes?.s2meaning?.[me.id])}</div>`}
    roomBody.innerHTML=html;if(!gm){if(ss==='time')bindVote('s2time',d.timeOptions,i=>d.timeOptions[i]);else bindVote('s2meaning',d.meaningOptions,i=>i)}
  }

  function renderS3(r,gm){const d=CFG.stages[3], ids=activeIds(r), slot=gm?0:playerSlot(r,me.id), ss=sub(r);let html=stageHeader(d,r);
    if(ss==='different'&&!gm){const arr=me.id===r.distortedId?d.distorted:d.normal;html+=`<div class="card"><h4>복구 기록 A</h4><div class="record">${arr.map(x=>'• '+x).join('\n')}</div></div><div class="card"><h4>다른 기록을 보고 있는 사람은?</h4>${choicesHTML(ids.map(id=>({jp:playersById[id].nameJP,kr:playersById[id].nameKR})),'s3different',r,r?.votes?.s3different?.[me.id])}</div>`}
    else if(ss==='count'&&!gm){const clue=d.verifyClues[Math.min(slot,d.verifyClues.length-1)];html+=`<div class="card"><h4>${esc(clue.title)}</h4><div class="record">${esc(clue.text)}</div></div><div class="card"><h4>두 번째 표식 통과 인원</h4>${choicesHTML(d.countOptions,'s3count',r,r?.votes?.s3count?.[me.id])}</div>`}
    else if(ss==='map'&&!gm){html+=`<div class="notice success">두 번째 표식까지는 4명이 함께 있었습니다.</div><div class="card"><h4>코스 지도</h4><div class="record">관리동\n↓\n두 번째 표식\n↓\n숲길\n↓\n세 번째 표식\n↓\n숙소</div></div><div class="card"><h4>소라는 어디에서 일행과 떨어졌습니까?</h4>${choicesHTML(d.mapOptions,'s3map',r,r?.votes?.s3map?.[me.id])}</div>`}
    roomBody.innerHTML=html;if(!gm){if(ss==='different')bindVote('s3different',ids,i=>ids[i]);else if(ss==='count')bindVote('s3count',d.countOptions,i=>d.countOptions[i]);else bindVote('s3map',d.mapOptions,i=>i)}
  }

  function renderS4(r,gm){const d=CFG.stages[4], ids=activeIds(r), slot=gm?0:playerSlot(r,me.id), ss=sub(r);let html=stageHeader(d,r);
    if(ss==='witness'&&!gm){const witness=me.id===r.witnessId, obj=d.objectives[Math.min(slot,d.objectives.length-1)];if(witness){html+=`<div class="card warning"><h4>👁 WITNESS · 당신만 보는 원본</h4><div class="record">${esc(d.witnessRecord.join('\n'))}</div></div><div class="notice warning">${esc(d.rules)}</div><div class="card"><h4>남은 증언권</h4><div class="dots">${'● '.repeat(Math.max(0,5-Number(r.testimonyUsed||0)))}${'○ '.repeat(Number(r.testimonyUsed||0))}</div><button id="useTestimony" class="primary">그림 증언 1회 사용</button></div>`}
      else html+=`<div class="notice">WITNESS는 밴드에서 그림으로만 답할 수 있습니다. 질문은 자유입니다.</div>`;
      html+=`<div class="card objective"><h4>당신의 조사 목표 · ${esc(obj.title)}</h4>${choicesHTML(obj.options,'objective',r,r?.objectives?.[me.id])}</div><div class="notice">모든 조사 목표가 정답이면 사건 복원 단계가 열립니다.</div>`;
    } else if(ss==='truth'&&!gm){html+=`<div class="notice success">개인 조사 목표가 모두 해결되었습니다.</div><div class="card"><h4>소라는 왜 혼자 남게 되었습니까?</h4>${choicesHTML(d.truthOptions,'s4truth',r,r?.votes?.s4truth?.[me.id])}</div>`}
    roomBody.innerHTML=html;if(!gm){if(ss==='witness'){const obj=d.objectives[Math.min(slot,d.objectives.length-1)];$$('.choice').forEach(b=>b.onclick=()=>roomRef.child(`objectives/${me.id}`).set(Number(b.dataset.v)));if($('#useTestimony'))$('#useTestimony').onclick=()=>roomRef.child('testimonyUsed').transaction(v=>Math.min(5,Number(v||0)+1));}else bindVote('s4truth',d.truthOptions,i=>i)}
  }

  function renderFinal(r,gm){const d=CFG.stages.final, ids=activeIds(r), ss=sub(r);let html=stageHeader(d,r);
    if(ss==='fact'&&!gm){html+=`<div class="card"><h4>공식 기록</h4><div class="record">담력시험 출발 — 4명\n담력시험 귀환 — 4명\n실종 — 0명\n사고 — 없음</div></div><div class="card"><h4>확실하게 증명된 사실</h4>${choicesHTML(d.facts,'ffact',r,r?.votes?.ffact?.[me.id])}</div>`}
    else if(ss==='soraCheck'&&!gm){html+=`<div class="card"><h4>宿舎 帰還確認表</h4><div class="record">青木 春　✓\n白川 蓮　✓\n橘 直　✓\n█████　✓</div></div><div class="notice">네 번째 이름으로 가장 먼저 水無瀬 空의 기록을 대조합니다.</div><button id="checkSora" class="primary">水無瀬 空 기록 대조</button>`}
    else if(ss==='pattern'&&!gm){html+=`<div class="notice warning">水無瀬 空 — 일치하지 않습니다.<br>귀환을 증명하는 기록이 없습니다.</div><div class="card"><h4>두 기록의 공통점</h4><div class="record">과거: 실제 귀환 3 / 기록 귀환 4 → +1\n현재: 실제 참가 ${ids.length} / 출석 인원 ${ids.length+1} → +1</div>${choicesHTML(d.pattern,'fpattern',r,r?.votes?.fpattern?.[me.id])}</div>`}
    else if(ss==='repair'&&!gm){html+=`<div class="card"><h4>이 기록을 끝내기 위해 필요한 것은?</h4>${choicesHTML(d.ending,'frepair',r,r?.votes?.frepair?.[me.id])}</div>`}
    else if(ss==='attendance'&&!gm){const at=r.attendance||{}, count=ids.filter(id=>at[id]).length, mine=!!at[me.id];html+=`<div class="final-screen"><div class="notice success">공식 기록 수정 완료<br>귀환 4 → 3 / 실종 0 → 1 / 水無瀬 空 — 未帰還</div><h3>현재 출석 확인</h3><p>이번에는 전원이 확인될 때까지 이동하지 마십시오.</p><div class="count-big">${count} / ${ids.length+1}</div><button id="attendBtn" class="primary" ${mine?'disabled':''}>${mine?'出席 완료':'出席する · 출석하기'}</button></div>`}
    else if(ss==='ending'&&!gm){html+=endingHTML(r)}
    roomBody.innerHTML=html;if(!gm){if(ss==='fact')bindVote('ffact',d.facts,i=>i);else if(ss==='soraCheck')$('#checkSora').onclick=()=>roomRef.update({substep:'pattern',votes:null});else if(ss==='pattern')bindVote('fpattern',d.pattern,i=>i);else if(ss==='repair')bindVote('frepair',d.ending,i=>i);else if(ss==='attendance')$('#attendBtn').onclick=()=>roomRef.child(`attendance/${me.id}`).set(true)}
  }

  function endingHTML(r){const ids=activeIds(r), at=r.attendance||{}, count=ids.filter(id=>at[id]).length;return `<div class="final-screen"><div class="count-big">${count} / ${count}</div><div class="sora-line">水無瀬 空<br><strong>「帰ります。」</strong><br><span class="state">돌아갈게.</span></div><div class="big">全員、出席しました。</div><p>전원 출석했습니다.</p><p class="story"><strong>이번에는 아무도 두고 가지 않았습니다.</strong></p><div class="eyebrow">肝試し — CLEAR</div></div>`}

  async function maybeEnding(r){if(roomStage(r)!==5||sub(r)!=='attendance')return;const ids=activeIds(r), at=r.attendance||{};if(ids.length&&ids.every(id=>at[id])){clearTimeout(endingTimer);endingTimer=setTimeout(()=>{if(latestRoom&&roomStage(latestRoom)===5&&sub(latestRoom)==='attendance')roomRef.update({substep:'ending',ending:{at:firebase.database.ServerValue.TIMESTAMP}})},3500)}}

  function renderGM(r){const s=roomStage(r);if(s===0){renderLobby(r,true);return}const data=s===5?CFG.stages.final:CFG.stages[s], ids=activeIds(r), ss=sub(r);let html=`<div class="game-header"><div><span class="eyebrow">GM CONTROL · ${esc(data.label)}</span><h3>${esc(data.title)}</h3></div><div class="progress">${esc(roomLabel())}<br>${esc(ss)}</div></div><div class="gm-grid"><div class="card"><h4>현재 상태</h4><div class="record">PLAYER ${ids.length}명\nREADY ${ids.filter(id=>r?.ready?.[id]).length}/${ids.length}\nGM READY ${r.gmReady?'YES':'NO'}\n출석 표시 ${ids.length+1}명</div></div><div class="card"><h4>특수 상태</h4><div class="record">STAGE 3 변조 대상: ${esc(playersById[r.distortedId]?.nameKR||'-')}\nSTAGE 4 WITNESS: ${esc(playersById[r.witnessId]?.nameKR||'-')}\n증언 사용: ${Number(r.testimonyUsed||0)}/5</div></div></div>`;
    html+=gmDetail(r)+`<div class="card"><h4>GM 조작</h4><div class="gm-controls"><button id="hint1" class="ghost">힌트 1 공개</button><button id="hint2" class="ghost">힌트 2 공개</button><button id="testMinus" class="ghost">증언권 +1</button><button id="testPlus" class="ghost">증언권 -1</button><button id="force" class="ghost">현재 단계 강제 진행</button><button id="resetRoom" class="ghost">반 전체 초기화</button></div><p class="admin-note">강제 진행은 현재 세부단계를 다음 단계로 넘깁니다. 본게임에서는 정상 진행을 권장합니다.</p></div>`;roomBody.innerHTML=html;
    $('#hint1').onclick=()=>roomRef.child('hintLevel').set(1);$('#hint2').onclick=()=>roomRef.child('hintLevel').set(2);$('#testMinus').onclick=()=>roomRef.child('testimonyUsed').transaction(v=>Math.max(0,Number(v||0)-1));$('#testPlus').onclick=()=>roomRef.child('testimonyUsed').transaction(v=>Math.min(5,Number(v||0)+1));$('#force').onclick=()=>forceNext(r);$('#resetRoom').onclick=()=>{if(confirm(`${roomId}반 게임을 완전히 초기화할까요?`))roomRef.set(null)};
  }

  function gmDetail(r){const s=roomStage(r), ss=sub(r), ids=activeIds(r);let x=`<div class="card"><h4>PLAYER별 정보</h4>`;
    ids.forEach((id,i)=>{let info='';if(s===1)info=CFG.stages[1].clues[i].title+' — '+CFG.stages[1].clues[i].text;if(s===2)info=(ss==='time'?CFG.stages[2].p1[i]:CFG.stages[2].p2[i])?.title+' — '+(ss==='time'?CFG.stages[2].p1[i]:CFG.stages[2].p2[i])?.text;if(s===3&&ss==='different')info=id===r.distortedId?'변조 기록 수신자':'정상 기록';if(s===3&&ss==='count')info=CFG.stages[3].verifyClues[i]?.title+' — '+CFG.stages[3].verifyClues[i]?.text;if(s===4&&ss==='witness'){const o=CFG.stages[4].objectives[i];info=(id===r.witnessId?'WITNESS / ':'')+`목표: ${o.title} / 정답: ${o.options[o.answer]}`;}x+=`<div class="roster-row"><div class="name"><strong>${esc(playersById[id].nameKR)}</strong><div class="state">${esc(info)}</div></div></div>`});
    const answer=s===1?'水無瀬 空':s===2?(ss==='time'?'22:47':'22:47은 소라가 일행과 함께 있었음이 확인된 마지막 시각'):s===3?(ss==='different'?playersById[r.distortedId]?.nameKR:ss==='count'?'4명':'두 번째 표식 → 세 번째 표식 사이 숲길'):s===4?(ss==='witness'?'개인 목표 전부 해결':CFG.stages[4].truthOptions[CFG.stages[4].truthAnswer]):s===5?(ss==='fact'?CFG.stages.final.facts[CFG.stages.final.factAnswer]:ss==='pattern'?CFG.stages.final.pattern[CFG.stages.final.patternAnswer]:ss==='repair'?CFG.stages.final.ending[CFG.stages.final.endingAnswer]:'진행 중'):'-';
    x+=`</div><div class="notice">GM 정답 · <strong>${esc(answer||'-')}</strong></div>`;return x}

  async function forceNext(r){const s=roomStage(r), ss=sub(r);if(s===1)return advance(2,'time');if(s===2&&ss==='time')return roomRef.update({substep:'meaning',votes:null});if(s===2)return advance(3,'different');if(s===3&&ss==='different')return roomRef.update({substep:'count',votes:null});if(s===3&&ss==='count')return roomRef.update({substep:'map',votes:null});if(s===3)return advance(4,'witness');if(s===4&&ss==='witness')return roomRef.update({substep:'truth',votes:null});if(s===4)return advance(5,'fact');if(s===5&&ss==='fact')return roomRef.update({substep:'soraCheck',votes:null});if(s===5&&ss==='soraCheck')return roomRef.update({substep:'pattern',votes:null});if(s===5&&ss==='pattern')return roomRef.update({substep:'repair',votes:null});if(s===5&&ss==='repair')return roomRef.update({substep:'attendance',votes:null});if(s===5&&ss==='attendance')return roomRef.update({substep:'ending'})}
})();

const apps = {};
let topZ = 20;
let galleryIndex = 0;

const firebaseConfig = {
  apiKey: "AIzaSyDHnQensIYvBGiXbyhHxy8_2nh3udHvl_c",
  authDomain: "soldidi9548-1c9ee.firebaseapp.com",
  projectId: "soldidi9548-1c9ee",
  storageBucket: "soldidi9548-1c9ee.firebasestorage.app",
  messagingSenderId: "1029951349830",
  appId: "1:1029951349830:web:f9ad92a6d29b5852959647",
  measurementId: "G-210BSM3TVB"
};

let guestbookDB = null;
try {
  firebase.initializeApp(firebaseConfig);
  guestbookDB = firebase.firestore();
} catch (error) {
  console.error('Firebase 초기화 실패:', error);
}

const gallery = [
  ['assets/gallery/13db3a86-e4b5-4e11-8e56-619fac63a3b2.webp','MONO 01','MONO'],
  ['assets/gallery/55fbb6a8-3381-434d-b7a9-de4758109ac0.webp','MONO 02','MONO'],
  ['assets/gallery/835e0647-b440-4146-9826-89bf88775e91.webp','MONO 03','MONO'],
  ['assets/gallery/38979dcc-e7fb-4aae-af33-1783ee97c35d.webp','MONO 04','MONO'],
  ['assets/gallery/528587c9-7578-4b02-82b0-46840d0ca0d0.webp','MONO 05','MONO'],
  ['assets/gallery/HMzbfbCbwAAes80.jpeg','COLOR 01','COLOR'],
  ['assets/gallery/HMzcKpFagAA1NIa.jpeg','COLOR 02','COLOR'],
  ['assets/gallery/HMzV6kgaUAATMp6.jpeg','COLOR 03','COLOR'],
  ['assets/gallery/HMzX59RakAA6Vyk.jpeg','COLOR 04','COLOR'],
  ['assets/gallery/HMzXyDbbsAAS0Q1.jpeg','COLOR 05','COLOR']
];

const diaryDefaults = [
 {type:'PERSONA',title:'지새야',content:`masterpiece, best quality, absurdres, 1woman, bright pink eyes, glossy eyes, medium almond-shaped eyes, calm gaze, defined upper eyelashes, soft lower eyelashes, very long platinum blonde hair, waist-length hair, silky hair, smooth hair, fair skin, natural skin texture, balanced facial structure, natural facial proportions, subtle cheekbones, refined korean beauty, light pink blush, soft natural makeup, glossy lips, gentle expression, charming face, highly detailed face, small face, side-parted hairstyle, no fringe, forehead fully exposed, hair naturally swept back from the face, pink off-shoulder blouse, white mini skirt`},
 {type:'PROMPT',title:'Lawn Wedding',content:`masterpiece, best quality, absurdres, ultra detailed,
1man, 1woman.

Composition: facing each other, close distance, hands meeting at the center of the composition, fingers touching, ring exchange, eye contact, romantic atmosphere.

Environment: vast green meadow, countless wildflowers, warm spring afternoon, gentle breeze, flower petals drifting through the air, golden sunlight, cinematic lighting, soft depth of field, dreamy atmosphere, ethereal, fantasy romance.

Man (left):
standing on the left, slim build, gentle smile, extending his right hand toward the woman, carefully placing a wildflower ring onto her ring finger, looking at her with affectionate eyes, (외형 프롬)

Woman (right):
woman standing on the right, white flowing silk dress, slightly lowering her gaze, softly smiling, extending her left hand toward the man, fingers relaxed, (외형 프롬)`},
 {type:'OOC',title:'The Unsent Letter',content:`[OOC: 잠시 롤플레잉 중지. 새로운 시점의 일회성 에피소드로 전환한다. PC가 사망한 이후 NPC의 시간을 살펴본다. NPC는 끝내 전하지 못했던 마음을 담아 PC에게 편지를 쓴다. 사망 이유는 NPC와 PC 모두 예상하지 못한, 갑작스러운 사고였다. 편지를 쓰는 시점은 사망 후 1년 뒤, PC의 기일이며 편지 내용은 애도, 후회, 죄책감, 집착, 그리움, 체념, 사랑, 복합 감정 등을 NPC의 특성에 따라 구성한다. 반드시 NPC의 1인칭 편지 형식으로만 출력하며, 편지 외의 서술이나 해설은 출력하지 않는다. 지금까지의 RP에서 형성된 관계성, 호감도, 성격, 말투, 세계관을 모두 반영한다. 분량은 5K이상 분량으로 작성하며 감정을 서두르지 않고 천천히 쌓아 올린다. 두 사람이 함께했던 기억, 사소한 일상, 행복했던 순간, 갈등, 끝내 하지 못했던 말, 마지막 순간에 대한 후회, 혼자 남겨진 이후의 삶, 아직도 남아 있는 습관과 공허함 등을 구체적으로 담아낸다. 관계에 따라 감정 표현과 내용은 자연스럽게 달라져야 하며, 단순히 슬퍼하는 것에 그치지 않고 부정, 분노, 죄책감, 후회, 체념, 그리움, 사랑 등 다양한 감정이 시간의 흐름에 따라 변화하도록 서술한다. 문장은 실제 사람이 직접 쓴 편지처럼 자연스럽고 진솔하게 작성하며, 독자가 함께 애도하게 될 정도로 긴 여운을 남긴다.]`}
];

const ott = [
 ['Magical Girl: ???','어느 날 갑자기 마법소녀가 되었다.','#판타지 #청춘 #성장 #히빌','assets/ott/magical-girl.png',''],
 ['ARÉN','인간과 인어 사이에서 태어난 혼혈 인어.','#판타지 #로맨스 #일상 #코믹 #수인','assets/ott/aren.png','https://inkchat.ai/character/dac7df75-e6df-4b93-8618-72440213fb4c'],
 ['STAY WITH: LOVE','7일간의 사랑, N개의 진실.','#연애프로그램 #시뮬레이션 #일상 #힐링 #로맨스','assets/ott/stay-with-love.png','https://inkchat.ai/character/eec425c2-8e33-4b18-8202-c32ee003d732'],
 ['아르카디아 정신의학 연구센터','기억이 바뀌면, 사람도 바뀔까?','#추리 #피폐 #공포 #탈출','assets/ott/arcadia.png','https://ccuc.chat/character/01KYGPVN93FS3J227ZWJSF73GB'],
 ['멜투컴퍼니','01.01 | 20:00 | LIVE ON','#고수위 #성인방송 #BJ #다인물','assets/ott/melt-company.png','https://t.melting.chat/dk4b50'],
 ['카일로스 블러드문','"햇빛 좀 쬔다고 재가 될 거였으면, 지금까지 살아있겠냐?"','#뱀파이어 #고수위 #판타지 #로맨스 #인간불신','assets/ott/kairos.png','https://t.melting.chat/zmuzrq9'],
 ['에스텔 제국','어느 날 갑자기 로판 세계관에 퐁당!','#로맨스판타지 #다인물','assets/ott/estelle.png','https://t.melting.chat/tklgnc'],
 ['지새야','아무래도, 미친X에게 잘못 걸린 것 같다...','#GL #HL #SY그룹 #다정 #쓰레기 #집통소','assets/ott/jisaeya.png','https://t.melting.chat/kljagm']
];

const chats = {
 '아스타로트':[
 ['them','아스타로트','이건 계약 연장이야.\n기존 계약의 위험요소가 완전히 제거되지 않았다고 판단될 시, 담당자의 재량으로 안전 확보 시점까지 계약 효력을 임시 연장할 수 있다. 17조 2항. 네가 안 읽은 부분에 아마 있었을 거다.'],
 ['me','지새야','뭐, 만약 계약을 연장한다면, 제 쇼핑에 계속 함께하신다는 건가요?'],
 ['them','아스타로트','애기야. 지금 내가 네놈 쇼핑 따라다니게 생긴 얼굴로 보여?\n계약 연장의 골자는 쇼핑 따위가 아니야. 네가 내 눈 밖에 있을 때 무슨 일이 벌어지는지, 어젯밤에 똑똑히 확인했어. 그러니까 앞으로 넌, 내가 필요할 때, 내 눈앞에 있어야 한다. 이게 새로운 조건이야.'],
 ['me','지새야','... 근데, 언제까지요?'],
 ['them','아스타로트','…내가, 괜찮아질 때까지.\n아니. 정정하지.\n네가… 내 것이 될 때까지.'],
 ['me','지새야','저는 남의 거 되는 걸 제일 싫어하는데요.'],
 ['them','아스타로트','...알아, 네 말 전부. 그냥, 이건 내 사정이야.\n네가 그딴 옷을 입고, 그딴 새끼들 눈앞에 있는 걸 내가 더는 못 봐주겠다고. …씨발, 잠을 잘 수가 없어.']
 ],
 '은시온':[
 ['me','지새야','번호, 주세요.'],['them','은시온','나?\n...이름은 은시온. 저장해 둬, 아가씨.'],['sep','','다른 날'],['them','은시온','아가씨. 오늘 밤, 나랑 드라이브라도 갈 생각 있나?'],['me','지새야','나중에요.'],['them','은시온','...거 참.\n너무 오래 기다리게 하진 마.']
 ],
 '한유명':[
 ['them','한유명','이 넓은 데서 혼자 뭐해. 심심하게.\n나랑 더 재미있는 거 안 할래?'],['me','지새야','... 부끄러움도 없냐 너는.'],['them','한유명','부끄러워야 할 이유가 있나? 네 앞인데.\n그리고, 이런 걸 보여주는데 부끄러워하면 오히려 실례 아니야?'],['me','지새야','어이가 없어서 말이 안 나오네.'],['sep','','다른 날'],['them','한유명','이걸로 끝이라고 생각하면 곤란한데. 이건 그냥, 전채 요리 같은 거였으니까.\n이제 진짜 시작해볼까, 공주님?']
 ]
};

function login(){
 const status=document.querySelector('#login-status'); status.textContent='Welcome... Loading [□□□□□□]';
 let n=0; const t=setInterval(()=>{n++; status.textContent=`Welcome... Loading [${'■'.repeat(n)}${'□'.repeat(6-n)}]`; if(n===6){clearInterval(t);setTimeout(()=>{document.querySelector('#login-screen').classList.remove('active');document.querySelector('#desktop').classList.add('active');updateTheme();},250)}},120);
}
document.querySelector('#login-btn').addEventListener('click',login);
document.querySelectorAll('#login-id,#login-pw').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')login()}));

function updateTheme(){const h=new Date().getHours();const day=h>=6&&h<18;document.querySelector('.morning').className='wallpaper morning '+(day?'visible':'hidden');document.querySelector('.night').className='wallpaper night '+(day?'hidden':'visible')}
setInterval(updateTheme,60000);
function updateClock(){const d=new Date();document.querySelector('#clock-time').textContent=d.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});document.querySelector('#clock-date').textContent=d.toLocaleDateString('ko-KR')}
updateClock();setInterval(updateClock,1000);

function particles(){const p=document.createElement('span');p.className='particle';p.textContent=(new Date().getHours()>=6&&new Date().getHours()<18)?['♡','✦','❀','✧'][Math.floor(Math.random()*4)]:['☆','✦','♡','✧'][Math.floor(Math.random()*4)];p.style.left=Math.random()*100+'%';p.style.fontSize=(10+Math.random()*20)+'px';p.style.animationDuration=(8+Math.random()*9)+'s';p.style.setProperty('--drift',(Math.random()*150-75)+'px');document.querySelector('#particles').appendChild(p);setTimeout(()=>p.remove(),18000)}
setInterval(particles,700);

document.addEventListener('mousemove',e=>{if(!document.querySelector('#desktop').classList.contains('active'))return;const x=(e.clientX/innerWidth-.5)*8,y=(e.clientY/innerHeight-.5)*8;document.querySelectorAll('.wallpaper').forEach(w=>w.style.transform=`translate(${x}px,${y}px) scale(1.02)`) });
document.addEventListener('click',e=>{if(!document.querySelector('#desktop').classList.contains('active'))return;const s=document.createElement('span');s.textContent=Math.random()>.5?'♡':'✦';s.style.cssText=`position:fixed;left:${e.clientX}px;top:${e.clientY}px;color:white;z-index:1000;pointer-events:none;font-size:20px;animation:pop .7s forwards`;document.body.appendChild(s);setTimeout(()=>s.remove(),800)});
const style=document.createElement('style');style.textContent='@keyframes pop{to{transform:translateY(-30px) scale(1.8);opacity:0}}';document.head.appendChild(style);

const appDefs={
 about:{title:'ABOUT',html:()=>`<div class="about-card"><div class="profile-box">♡</div><div class="about-copy"><h2 class="section-title">soldidi9548</h2><p>성인 | 여성<br>제작, 소비, OOC | 짤뽑 t2i<br>FUB FREE | 팔로우, 하트, 알티, 인용, 멘션 등 반응 잦습니다.</p><p><b>@soldidi9548</b><br><a href="https://x.com/soldidi9548" target="_blank" rel="noopener">X 계정 열기</a></p></div></div>`},
 gallery:{title:'GALLERY',html:galleryHTML},
 diary:{title:'DIARY',html:diaryHTML},
 ott:{title:'OTT',html:ottHTML},
 messenger:{title:'MESSENGER',html:messengerHTML},
 guestbook:{title:'GUESTBOOK',html:guestbookHTML},
 trash:{title:'TRASH',html:()=>`<div class="trash-empty"><div><div style="font-size:54px">⌫</div><b>TRASH IS EMPTY</b><p>숨겨진 기능 없이 비어 있는 휴지통입니다.</p></div></div>`},
 search:{title:'SEARCH RESULTS',html:()=>'<div id="search-results" class="search-results"></div>'}
};

document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('dblclick',()=>openApp(b.dataset.open)));
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{if(innerWidth<700)openApp(b.dataset.open)}));

function openApp(id){
 if(apps[id]){apps[id].classList.remove('minimized');focusWindow(apps[id]);return}
 const el=document.querySelector('#window-template').content.firstElementChild.cloneNode(true);el.dataset.app=id;el.querySelector('.window-title').textContent=appDefs[id].title;el.querySelector('.window-content').innerHTML=appDefs[id].html();el.style.left=(120+Object.keys(apps).length*26)+'px';el.style.top=(45+Object.keys(apps).length*22)+'px';document.querySelector('#windows').appendChild(el);apps[id]=el;wireWindow(el);focusWindow(el);addTask(id);wireApp(id,el);
}
function focusWindow(el){el.style.zIndex=++topZ}
function wireWindow(el){
 el.addEventListener('mousedown',()=>focusWindow(el)); const bar=el.querySelector('.window-titlebar');let drag=false,ox=0,oy=0;
 bar.addEventListener('mousedown',e=>{if(e.target.tagName==='BUTTON'||el.classList.contains('maximized'))return;drag=true;ox=e.clientX-el.offsetLeft;oy=e.clientY-el.offsetTop});
 document.addEventListener('mousemove',e=>{if(!drag)return;el.style.left=Math.max(0,Math.min(innerWidth-el.offsetWidth,e.clientX-ox))+'px';el.style.top=Math.max(0,Math.min(innerHeight-60-el.offsetHeight,e.clientY-oy))+'px'});document.addEventListener('mouseup',()=>drag=false);
 el.querySelector('[data-act="close"]').addEventListener('click',()=>closeApp(el.dataset.app));el.querySelector('[data-act="min"]').addEventListener('click',()=>el.classList.add('minimized'));el.querySelector('[data-act="max"]').addEventListener('click',()=>el.classList.toggle('maximized'));
}
function closeApp(id){if(apps[id]?._guestbookUnsubscribe)apps[id]._guestbookUnsubscribe();apps[id]?.remove();delete apps[id];document.querySelector(`[data-task="${id}"]`)?.remove()}
function addTask(id){const b=document.createElement('button');b.className='task-item';b.dataset.task=id;b.textContent=appDefs[id].title;b.addEventListener('click',()=>{apps[id].classList.toggle('minimized');focusWindow(apps[id])});document.querySelector('#task-items').appendChild(b)}

function galleryHTML(){return `<div class="tabs"><button class="tab-btn active" data-gallery-filter="ALL">ALL</button><button class="tab-btn" data-gallery-filter="MONO">MONO</button><button class="tab-btn" data-gallery-filter="COLOR">COLOR</button></div><div class="gallery-grid">${gallery.map((g,i)=>`<button class="gallery-card" data-gallery-index="${i}" data-type="${g[2]}"><img src="${g[0]}" alt="${g[1]}"><span>${g[1]}</span></button>`).join('')}</div>`}
function diaryHTML(){return `<div class="tabs"><button class="tab-btn active" data-diary-filter="ALL">ALL</button><button class="tab-btn" data-diary-filter="PERSONA">PERSONA</button><button class="tab-btn" data-diary-filter="PROMPT">PROMPT</button><button class="tab-btn" data-diary-filter="OOC">OOC</button><button class="tab-btn" id="diary-add">+ ADD</button></div><div id="diary-list" class="diary-list"></div>`}
function ottHTML(){return `<div class="ott-grid">${ott.map(o=>`<article class="ott-card"><img src="${o[3]}" alt="${o[0]}"><div class="ott-body"><h3>${o[0]}</h3><p>${o[1]}</p><div class="tags">${o[2]}</div>${o[4]?`<a class="play-btn" href="${o[4]}" target="_blank" rel="noopener">PLAY NOW</a>`:`<span class="play-btn coming">COMING SOON</span>`}</div></article>`).join('')}</div>`}
function messengerHTML(){const names=Object.keys(chats);return `<div class="messenger"><aside class="chat-list">${names.map((n,i)=>`<button class="chat-person ${i===0?'active':''}" data-chat="${n}">${n}</button>`).join('')}</aside><section class="chat-pane"><div id="chat-messages" class="chat-messages"></div><div class="chat-input"><input placeholder="메시지를 입력하세요..." disabled><button disabled>전송</button></div></section></div>`}
function guestbookHTML(){return `<p class="guest-note">누구나 함께 볼 수 있는 공개 방명록입니다. 닉네임 20자 · 내용 300자까지 작성할 수 있어요.</p><div class="guest-form"><input id="guest-name" maxlength="20" placeholder="닉네임"><textarea id="guest-text" maxlength="300" rows="4" placeholder="내용"></textarea><div class="guest-form-bottom"><span id="guest-count">0 / 300</span><button id="guest-submit">등록</button></div></div><p id="guest-status" class="guest-status">방명록을 불러오는 중...</p><div id="guest-list" class="guest-list"></div>`}

function wireApp(id,el){if(id==='gallery')wireGallery(el);if(id==='diary')wireDiary(el);if(id==='messenger')wireMessenger(el);if(id==='guestbook')wireGuestbook(el)}
function wireGallery(el){el.querySelectorAll('[data-gallery-index]').forEach(b=>b.addEventListener('click',()=>showImage(+b.dataset.galleryIndex)));el.querySelectorAll('[data-gallery-filter]').forEach(b=>b.addEventListener('click',()=>{el.querySelectorAll('[data-gallery-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');el.querySelectorAll('.gallery-card').forEach(c=>c.style.display=b.dataset.galleryFilter==='ALL'||c.dataset.type===b.dataset.galleryFilter?'block':'none')}))}
function showImage(i){galleryIndex=i;document.querySelector('#viewer-img').src=gallery[i][0];document.querySelector('#viewer-caption').textContent=`${gallery[i][1]}  ·  ${i+1} / ${gallery.length}`;document.querySelector('#image-viewer').classList.add('open')}
document.querySelector('.modal-close').addEventListener('click',()=>document.querySelector('#image-viewer').classList.remove('open'));document.querySelector('.viewer-prev').addEventListener('click',()=>showImage((galleryIndex-1+gallery.length)%gallery.length));document.querySelector('.viewer-next').addEventListener('click',()=>showImage((galleryIndex+1)%gallery.length));

function getDiary(){try{return JSON.parse(localStorage.getItem('soldidi_diary'))||diaryDefaults}catch{return diaryDefaults}}
function saveDiary(d){localStorage.setItem('soldidi_diary',JSON.stringify(d))}
function wireDiary(el){let filter='ALL';const render=()=>{const data=getDiary().filter(d=>filter==='ALL'||d.type===filter);el.querySelector('#diary-list').innerHTML=data.map((d,i)=>`<button class="diary-item" data-di="${i}"><small>${d.type}</small><b>${d.title}</b></button>`).join('');el.querySelectorAll('[data-di]').forEach((b,i)=>b.addEventListener('click',()=>showDiary(data[i]))) };render();el.querySelectorAll('[data-diary-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.diaryFilter;el.querySelectorAll('[data-diary-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');render()}));el.querySelector('#diary-add').addEventListener('click',()=>{const pw=prompt('관리자 비밀번호');if(pw!=='soldidi9548'){alert('비밀번호가 다릅니다.');return}const type=prompt('분류: PERSONA / PROMPT / OOC','PERSONA');const title=prompt('제목');const content=prompt('내용');if(!title||!content)return;const d=getDiary();d.unshift({type:(type||'OOC').toUpperCase(),title,content});saveDiary(d);render()})}
function showDiary(d){const w=apps.diary.querySelector('.window-content');w.innerHTML=`<div class="diary-detail"><button class="square-btn" id="diary-back">← BACK</button><h2>${d.title}</h2><small>${d.type}</small><div class="copy-row"><button class="copy-btn" id="copy-diary">COPY</button></div><pre>${escapeHTML(d.content)}</pre></div>`;w.querySelector('#diary-back').addEventListener('click',()=>{closeApp('diary');openApp('diary')});w.querySelector('#copy-diary').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(d.content);alert('복사했습니다.')}catch{alert('브라우저 보안 설정으로 복사가 막혔습니다.')}})}
function escapeHTML(s){return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}

function wireMessenger(el){const render=name=>{el.querySelector('#chat-messages').innerHTML=chats[name].map(m=>{if(m[0]==='sep')return `<div class="day-sep">— ${m[2]} —</div>`;return m[2].split('\n').filter(Boolean).map((line,i)=>`<div class="bubble ${m[0]} ${i>0?'continuation':''}">${i===0?`<b>${m[1]}</b>`:''}${escapeHTML(line)}</div>`).join('')}).join('');const pane=el.querySelector('#chat-messages');pane.scrollTop=pane.scrollHeight};render(Object.keys(chats)[0]);el.querySelectorAll('[data-chat]').forEach(b=>b.addEventListener('click',()=>{el.querySelectorAll('[data-chat]').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.chat)}))}
function formatGuestDate(timestamp){
  if(!timestamp)return '방금 전';
  const date=timestamp.toDate?timestamp.toDate():new Date(timestamp);
  return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(date);
}
function wireGuestbook(el){
  const nameInput=el.querySelector('#guest-name');
  const textInput=el.querySelector('#guest-text');
  const submit=el.querySelector('#guest-submit');
  const status=el.querySelector('#guest-status');
  const list=el.querySelector('#guest-list');
  const count=el.querySelector('#guest-count');
  let sending=false;

  textInput.addEventListener('input',()=>count.textContent=`${textInput.value.length} / 300`);

  if(!guestbookDB){
    status.textContent='방명록 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    submit.disabled=true;
    return;
  }

  const query=guestbookDB.collection('guestbook').orderBy('createdAt','desc').limit(100);
  const unsubscribe=query.onSnapshot(snapshot=>{
    const entries=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
    list.innerHTML=entries.length?entries.map(g=>`<article class="guest-entry"><header><span><i class="guest-dot"></i>${escapeHTML(String(g.name||'익명'))}</span><time>${formatGuestDate(g.createdAt)}</time></header><p>${escapeHTML(String(g.text||'')).replace(/\n/g,'<br>')}</p></article>`).join(''):'<p class="guest-empty">아직 작성된 방명록이 없습니다. 첫 글을 남겨주세요 ♡</p>';
    status.textContent=`방명록 ${entries.length}개`;
  },error=>{
    console.error('방명록 불러오기 실패:',error);
    status.textContent='방명록을 불러오지 못했습니다. Firestore 규칙을 확인해 주세요.';
    list.innerHTML='<p class="guest-error">연결 오류가 발생했습니다.</p>';
  });

  el._guestbookUnsubscribe=unsubscribe;
  submit.addEventListener('click',async()=>{
    if(sending)return;
    const name=nameInput.value.trim();
    const text=textInput.value.trim();
    if(!name||!text)return alert('닉네임과 내용을 입력해 주세요.');
    if(name.length>20||text.length>300)return alert('글자 수 제한을 확인해 주세요.');
    const lastWrite=Number(localStorage.getItem('soldidi_guest_last_write')||0);
    if(Date.now()-lastWrite<10000)return alert('도배 방지를 위해 10초 뒤에 다시 작성해 주세요.');
    sending=true;submit.disabled=true;submit.textContent='등록 중...';
    try{
      await guestbookDB.collection('guestbook').add({
        name,
        text,
        createdAt:firebase.firestore.FieldValue.serverTimestamp()
      });
      localStorage.setItem('soldidi_guest_last_write',String(Date.now()));
      nameInput.value='';textInput.value='';count.textContent='0 / 300';
    }catch(error){
      console.error('방명록 등록 실패:',error);
      alert('등록하지 못했습니다. Firestore 규칙을 확인해 주세요.');
    }finally{
      sending=false;submit.disabled=false;submit.textContent='등록';
    }
  });
}

function doSearch(){const q=document.querySelector('#site-search').value.trim().toLowerCase();if(!q)return;openApp('search');const results=[];if(['소개','about','soldidi'].some(x=>x.includes(q)||q.includes(x)))results.push(['ABOUT','about']);gallery.forEach(g=>{if(g[1].toLowerCase().includes(q))results.push([g[1],'gallery'])});getDiary().forEach(d=>{if((d.title+' '+d.type+' '+d.content).toLowerCase().includes(q))results.push([`${d.type} · ${d.title}`,'diary'])});ott.forEach(o=>{if((o[0]+' '+o[1]+' '+o[2]).toLowerCase().includes(q))results.push([`OTT · ${o[0]}`,'ott'])});Object.keys(chats).forEach(n=>{if(n.toLowerCase().includes(q))results.push([`CHAT · ${n}`,'messenger'])});const box=apps.search.querySelector('#search-results');box.innerHTML=results.length?results.map(r=>`<button class="search-result" data-target="${r[1]}">${r[0]}</button>`).join(''):'<p>검색 결과가 없습니다.</p>';box.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',()=>openApp(b.dataset.target)))}
document.querySelector('#search-btn').addEventListener('click',doSearch);document.querySelector('#site-search').addEventListener('keydown',e=>{if(e.key==='Enter')doSearch()});
document.querySelector('#start-btn').addEventListener('click',()=>openApp('about'));

const tabButtons=[...document.querySelectorAll('.tab-btn')];
const pages=[...document.querySelectorAll('.page')];
function showPage(name){
  pages.forEach(page=>page.classList.toggle('active',page.id===`page-${name}`));
  tabButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.page===name));
  try{window.scrollTo({top:0,behavior:'smooth'});}catch(_){window.scrollTo(0,0);}
  history.replaceState(null,'',`#${name}`);
  setTimeout(setupReveal,80);
}
tabButtons.forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.page)));

// ------------------------------------------------------------
// 학생 카드 자동 생성
// 데이터는 assets/js/students.js 한 곳에서만 관리합니다.
// ------------------------------------------------------------
const students = Array.isArray(window.KOUSEI_STUDENTS) ? window.KOUSEI_STUDENTS : [];
function createStudentCard(student){
  const card=document.createElement('button');
  card.className='student-card';
  card.type='button';
  card.dataset.age=student.age||'';
  card.dataset.gender=student.gender||'';
  card.dataset.grade=`${student.grade}학년 ${student.className}반`;
  card.dataset.jname=student.nameJP||'';
  card.dataset.keyword=student.keyword||'';
  card.dataset.name=student.nameKR||'';
  card.dataset.popup=student.popupImage||'';
  card.dataset.quoteJp=student.quoteJP||'';
  card.dataset.quoteKo=student.quoteKR||'';
  const image=document.createElement('div');
  image.className='student-image';
  const img=document.createElement('img');
  img.src=student.cardImage||'';
  img.alt=student.nameKR||student.nameJP||'학생';
  img.loading='lazy';
  img.decoding='async';
  image.appendChild(img);
  const body=document.createElement('div');
  body.className='student-body';
  const num=document.createElement('div');
  num.className='student-num';
  num.textContent=`${student.grade}年 ${student.className}組`;
  const name=document.createElement('div');
  name.className='student-name';
  name.textContent=student.nameJP||'';
  const nameKo=document.createElement('div');
  nameKo.className='student-name-ko';
  nameKo.textContent=[student.nameKR,student.gender,student.age].filter(Boolean).join(' · ');
  const quote=document.createElement('div');
  quote.className='student-quote';
  const quoteJp=document.createElement('div');
  quoteJp.className='quote-jp';
  quoteJp.textContent=student.quoteJP||'';
  const quoteKo=document.createElement('div');
  quoteKo.className='quote-ko';
  quoteKo.textContent=student.quoteKR||'';
  quote.append(quoteJp,quoteKo);
  body.append(num,name,nameKo,quote);
  card.append(image,body);
  card.addEventListener('click',()=>openModal(card));
  return card;
}
function renderStudents(){
  const allGrid=document.getElementById('allStudentsGrid');
  if(allGrid){
    allGrid.replaceChildren();
    students.forEach(student=>allGrid.appendChild(createStudentCard(student)));
  }
  document.querySelectorAll('.roster-grid[data-gender][data-grade]').forEach(grid=>{
    const gender=grid.dataset.gender;
    const grade=Number(grid.dataset.grade);
    grid.replaceChildren();
    students.filter(student=>student.gender===gender && Number(student.grade)===grade)
      .forEach(student=>grid.appendChild(createStudentCard(student)));
  });
}

const modal=document.getElementById('studentModal');
const closeBtn=modal.querySelector('.modal-close');
function openModal(card){
  for(const [id,key] of [['modalName','jname'],['modalJName','name'],['modalGrade','grade'],['modalAge','age'],['modalGender','gender'],['modalKeyword','keyword']]) document.getElementById(id).textContent=card.dataset[key]||'';
  const modalQuote=document.getElementById('modalQuote');
  modalQuote.replaceChildren();
  const quoteJp=document.createElement('div');
  quoteJp.className='quote-jp';
  quoteJp.textContent=card.dataset.quoteJp||'';
  const quoteKo=document.createElement('div');
  quoteKo.className='quote-ko';
  quoteKo.textContent=card.dataset.quoteKo||'';
  modalQuote.append(quoteJp,quoteKo);
  const popupImage=card.dataset.popup;
  const modalImage=document.getElementById('modalImage');
  if(popupImage){
    modalImage.replaceChildren(); const img=document.createElement('img'); img.src=popupImage; img.alt=card.dataset.name||''; img.decoding='async'; modalImage.appendChild(img);
  }else{
    modalImage.replaceChildren(); const source=card.querySelector('.student-image img'); if(source){const img=source.cloneNode(true); modalImage.appendChild(img);}
  }
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');closeBtn.focus();
}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')}
closeBtn.addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

renderStudents();

let observer;
function setupReveal(){
  if(observer)observer.disconnect();
  document.querySelectorAll('.page.active .page-title,.page.active .notice,.page.active .notice-join-wrap,.page.active .moved-operation,.page.active .uniform-layout,.page.active .student-card,.page.active details,.page.active .space-empty,.page.active .schedule-day,.page.active .schedule-notice').forEach(el=>el.classList.add('reveal'));
  observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});
  document.querySelectorAll('.page.active .reveal').forEach(el=>observer.observe(el));
}
const firstPage=location.hash.replace('#','');
showPage(firstPage&&document.getElementById(`page-${firstPage}`)?firstPage:'notice');

// Sparkling mouse trail
if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
  const canvas=document.getElementById('trailCanvas'),ctx=canvas.getContext('2d');let particles=[];
  const resize=()=>{canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)};resize();addEventListener('resize',resize);
  addEventListener('mousemove',e=>{if(Math.random()>.4)particles.push({x:e.clientX,y:e.clientY,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,a:1,r:Math.random()*2+1})});
  function tick(){ctx.clearRect(0,0,innerWidth,innerHeight);particles=particles.filter(p=>p.a>.03);for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.a*=.94;p.r*=.99;ctx.globalAlpha=p.a;ctx.fillStyle='#72c5f2';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;requestAnimationFrame(tick)}tick();
}

// Prompt copy buttons
document.querySelectorAll('.copy-prompt-btn').forEach(button=>{
  button.addEventListener('click', async ()=>{
    const promptBox = button.parentElement.querySelector('.prompt-box');
    const text = promptBox ? promptBox.textContent.trim() : '';
    if(!text) return;
    try{await navigator.clipboard.writeText(text);}catch(error){
      const area = document.createElement('textarea');area.value = text;area.style.position = 'fixed';area.style.opacity = '0';document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();
    }
    const original = button.textContent;button.textContent = '복사됨';button.classList.add('copied');setTimeout(()=>{button.textContent = original;button.classList.remove('copied');}, 1300);
  });
});

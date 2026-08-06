
const tabButtons=[...document.querySelectorAll('.tab-btn')];
const pages=[...document.querySelectorAll('.page')];
function showPage(name){
  pages.forEach(page=>page.classList.toggle('active',page.id===`page-${name}`));
  tabButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.page===name));
  window.scrollTo({top:0,behavior:'smooth'});
  history.replaceState(null,'',`#${name}`);
  setTimeout(setupReveal,80);
}
tabButtons.forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.page)));
const firstPage=location.hash.replace('#','');showPage(firstPage&&document.getElementById(`page-${firstPage}`)?firstPage:'notice');

const modal=document.getElementById('studentModal');
const closeBtn=modal.querySelector('.modal-close');
function openModal(card){
  for(const [id,key] of [['modalName','name'],['modalJName','jname'],['modalGrade','grade'],['modalAge','age'],['modalGender','gender'],['modalKeyword','keyword'],['modalQuote','quote'],['modalDesc','desc']]) document.getElementById(id).textContent=card.dataset[key]||'';
  document.getElementById('modalImage').textContent=card.querySelector('.student-image').textContent;
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');closeBtn.focus();
}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')}
document.querySelectorAll('.student-card[data-name]').forEach(card=>card.addEventListener('click',()=>openModal(card)));
closeBtn.addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

let observer;
function setupReveal(){if(observer)observer.disconnect();document.querySelectorAll('.page.active .page-title,.page.active .notice,.page.active .notice-join-wrap,.page.active .moved-operation,.page.active .uniform-layout,.page.active .student-card,.page.active details,.page.active .space-empty').forEach(el=>el.classList.add('reveal'));observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});document.querySelectorAll('.page.active .reveal').forEach(el=>observer.observe(el))}setupReveal();

// Paper-plane cursor + sparkling wake
if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
 const plane=document.querySelector('.cursor-plane'),canvas=document.getElementById('trailCanvas'),ctx=canvas.getContext('2d');let mx=innerWidth/2,my=innerHeight/2,px=mx,py=my,angle=0,particles=[];
 const resize=()=>{canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)};resize();addEventListener('resize',resize);
 addEventListener('mousemove',e=>{const vx=e.clientX-mx,vy=e.clientY-my;mx=e.clientX;my=e.clientY;if(Math.abs(vx)+Math.abs(vy)>1)angle=Math.atan2(vy,vx)*180/Math.PI+18;plane.style.opacity=1;if(Math.random()>.45)particles.push({x:mx-10,y:my+6,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5,a:1,r:Math.random()*2+1})});
 function tick(){px+=(mx-px)*.28;py+=(my-py)*.28;plane.style.transform=`translate(${px-17}px,${py-17}px) rotate(${angle}deg)`;ctx.clearRect(0,0,innerWidth,innerHeight);particles=particles.filter(p=>p.a>.03);for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.a*=.94;p.r*=.99;ctx.globalAlpha=p.a;ctx.fillStyle='#72c5f2';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;requestAnimationFrame(tick)}tick();
 document.querySelectorAll('a,button,summary').forEach(el=>{el.addEventListener('mouseenter',()=>plane.style.scale='1.28');el.addEventListener('mouseleave',()=>plane.style.scale='1')});
}

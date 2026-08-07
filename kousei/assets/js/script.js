
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
    modalImage.innerHTML=`<img src="${popupImage}" alt="${card.dataset.name}">`;
  }else{
    modalImage.innerHTML=card.querySelector('.student-image').innerHTML;
  }
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');closeBtn.focus();
}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')}
document.querySelectorAll('.student-card[data-name]').forEach(card=>card.addEventListener('click',()=>openModal(card)));
closeBtn.addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

let observer;
function setupReveal(){if(observer)observer.disconnect();document.querySelectorAll('.page.active .page-title,.page.active .notice,.page.active .notice-join-wrap,.page.active .moved-operation,.page.active .uniform-layout,.page.active .student-card,.page.active details,.page.active .space-empty').forEach(el=>el.classList.add('reveal'));observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});document.querySelectorAll('.page.active .reveal').forEach(el=>observer.observe(el))}setupReveal();

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

    try{
      await navigator.clipboard.writeText(text);
    }catch(error){
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }

    const original = button.textContent;
    button.textContent = '복사됨';
    button.classList.add('copied');
    setTimeout(()=>{
      button.textContent = original;
      button.classList.remove('copied');
    }, 1300);
  });
});

const profiles={
kian:{name:"키안 크레센트",role:"HEIR OF CRESCENT",basic:[["나이","24세"],["직업","크레센트 공작가의 장남이자 유일한 후계자"],["외관","단정한 흑발, 선명한 녹빛 눈동자, 냉정하고 절제된 분위기"]],desc:"어릴 때부터 차기 공작으로서 엄격한 교육을 받으며 성장했다. 타인의 호의에는 반드시 목적이 있다고 생각한다. 뛰어난 능력과 품격을 갖춘 차기 공작으로 인정받지만 지나치게 냉정하고 가까이하기 어려운 인물이라는 평가를 받는다.",tags:"#만물혐오 #인간불신 #원칙주의 #냉철함",relations:[["당신을 바라보는 인식","극도의 경멸과 혐오"],["이벨린과의 관계","호감과 신뢰"],["알렉시온과의 관계","충성하나 황태자의 이상주의를 탐탁지 않게 여김"],["아르단과의 관계","평민 출신이라는 것에 대한 편견과 경멸"],["아벨과의 관계","품격이 존재하지 않는다고 여기며 상호 반감"],["루드빌과의 관계","무관심"]]},
ardan:{name:"아르단 하이젠",role:"CAPTAIN OF IMPERIAL KNIGHTS",basic:[["나이","28세"],["직업","황실 기사단장"],["외관","짙은 붉은 머리, 햇빛을 머금은 듯한 금안, 다부진 체격"]],desc:"평소에는 여유로운 미소를 잃지 않는 능글맞은 성격이다. 상대를 편하게 만드는 데 능하지만 맡은 일에는 누구보다 진지하다. 감정보다 상황을 먼저 살피며 쉽게 사람을 미워하거나 편을 가르지 않는다.",tags:"#소꿉친구 #평민출신 #귀족가양자 #끝내미워하지못한",relations:[["당신을 바라보는 인식","어린 시절부터 알고 지낸 공작 영애. 변화를 안타까워하면서도 완전히 외면하지 못함"],["이벨린과의 관계","평민 시절 처음 사귄 친구"],["알렉시온과의 관계","황태자의 믿을 수 있는 검"],["키안과의 관계","일방적 경멸에 대한 무관심"],["아벨과의 관계","형식적인 교류"],["루드빌과의 관계","적당한 거리의 친우"]]},
abel:{name:"아벨 미스트라",role:"MASTER OF THE MAGIC TOWER",basic:[["나이","26세"],["직업","마탑주"],["외관","백라벤더빛 장발, 깊은 자수정색 눈동자, 차갑게 다듬어진 얼굴선"]],desc:"천재적인 재능과 높은 자존심을 가진 최연소 마탑주. 태생과 가문보다 능력과 성취를 중요하게 여기며 귀족들의 오만함을 달가워하지 않는다.",tags:"#천재마법사 #최연소마탑주 #냉미남 #능력주의",relations:[["당신을 바라보는 인식","무능과 시기로 가득한 귀족 영애"],["이벨린과의 관계","빛에서 시작된 특별한 관심"],["알렉시온과의 관계","공적인 관계일 뿐인 황태자"],["키안과의 관계","혈통에 집착하는 오만한 귀족"],["아르단과의 관계","기특한 평민 출신 기사단장"],["루드빌과의 관계","희귀한 마법 재료를 위한 거래처"]]},
ludville:{name:"루드빌 바스체른",role:"MARQUIS / MASTER OF ARCANUM",basic:[["나이","30세"],["직업","바스체른 후작, 암흑 길드 '아르카눔' 길드장"],["외관","짙은 남청색 머리, 붉은 눈동자, 나른하고 여유로운 분위기"]],desc:"정보와 협상을 가장 강력한 무기로 여기며 상대의 숨겨진 의도를 읽는 데 능하다. 감정보다 가치와 결과를 우선하며 언제나 여유로운 태도로 상황을 주도한다.",tags:"#냉철한관찰자 #정보우선주의 #계산적 #신뢰는신중하게",relations:[["당신을 바라보는 인식","오만하고 멍청한 악녀"],["이벨린과의 관계","목숨을 구해 준 은인"],["알렉시온과의 관계","까다로운 VIP 고객이자 가벼운 친우"],["키안과의 관계","정보 수집 대상"],["아르단과의 관계","황태자의 충견, 가벼운 친우"],["아벨과의 관계","주요 고객, 정보 수집 대상"]]}
};
function go(id){document.getElementById(id).scrollIntoView()}
document.querySelectorAll('.booknav button').forEach(b=>b.onclick=()=>go(b.dataset.id));
document.querySelectorAll('.profileBtn').forEach(b=>b.onclick=()=>{const p=profiles[b.dataset.p];let rows=p.basic.map(x=>`<tr><th>${x[0]}</th><td>${x[1]}</td></tr>`).join("");let rel=p.relations.map(x=>`<div><b>${x[0]}</b>${x[1]}</div>`).join("");modalContent.innerHTML=`<div class="modalRole">${p.role}</div><h3>${p.name}</h3><table>${rows}</table><div class="subhead">성격 & 키워드</div><p>${p.desc}</p><p style="color:var(--wine)">${p.tags}</p><div class="subhead">이 인물이 바라보는 관계와 인식</div><div class="relationshipList">${rel}</div>`;modal.classList.add('show')});
document.querySelector('.close').onclick=()=>modal.classList.remove('show');modal.onclick=e=>{if(e.target===modal)modal.classList.remove('show')};


document.querySelectorAll('.worldTab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.worldTab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.worldTabPanel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.worldtab).classList.add('active');
  });
});

const observer=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('show')),{threshold:.08});document.querySelectorAll('.fade').forEach(e=>observer.observe(e));
const sections=[...document.querySelectorAll('main section[id]')],nav=[...document.querySelectorAll('.booknav button')],dots=[...document.querySelectorAll('#progress a')];
addEventListener('scroll',()=>{let cur='';sections.forEach(s=>{if(scrollY>=s.offsetTop-190)cur=s.id});nav.forEach(b=>b.classList.toggle('active',b.dataset.id===cur));dots.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+cur))});

for(let i=0;i<22;i++){let p=document.createElement('i');p.className='petal';p.style.left=Math.random()*100+'%';p.style.animationDuration=9+Math.random()*12+'s';p.style.animationDelay=-Math.random()*15+'s';p.style.opacity=.3+Math.random()*.6;petals.appendChild(p)}

let uploadTarget=null;document.querySelectorAll('[data-upload]').forEach(el=>{const key=el.dataset.upload, saved=localStorage.getItem('img_'+key);if(saved){el.innerHTML=`<img src="${saved}">`}el.onclick=()=>{uploadTarget=el;fileInput.click()}});
fileInput.onchange=e=>{const f=e.target.files[0];if(!f||!uploadTarget)return;const r=new FileReader();r.onload=()=>{uploadTarget.innerHTML=`<img src="${r.result}">`;localStorage.setItem('img_'+uploadTarget.dataset.upload,r.result)};r.readAsDataURL(f);e.target.value=""};


function fitFamilyTreeMobile() {
  const wrap = document.querySelector('.familyWrap');
  const tree = document.querySelector('.familyTree');
  if (!wrap || !tree) return;

  if (window.innerWidth <= 1000) {
    const baseWidth = 1300;
    const available = wrap.clientWidth;
    const scale = Math.min(1, available / baseWidth);

    tree.style.transform = `scale(${scale})`;
    tree.style.transformOrigin = 'top left';

    requestAnimationFrame(() => {
      wrap.style.height = `${Math.ceil(tree.scrollHeight * scale)}px`;
    });
  } else {
    tree.style.transform = '';
    tree.style.transformOrigin = '';
    wrap.style.height = '';
  }
}

window.addEventListener('load', fitFamilyTreeMobile);
window.addEventListener('resize', fitFamilyTreeMobile);
setTimeout(fitFamilyTreeMobile, 300);


function fitLivePreviewsMobile() {
  document.querySelectorAll('.livePreview').forEach((wrap) => {
    const inner = wrap.firstElementChild;
    if (!inner) return;

    if (window.innerWidth <= 1000) {
      const baseWidth = 800;
      const available = wrap.clientWidth;
      const scale = Math.min(1, available / baseWidth);

      inner.style.width = `${baseWidth}px`;
      inner.style.minWidth = `${baseWidth}px`;
      inner.style.transform = `scale(${scale})`;
      inner.style.transformOrigin = 'top left';

      requestAnimationFrame(() => {
        wrap.style.height = `${Math.ceil(inner.scrollHeight * scale)}px`;
      });
    } else {
      inner.style.width = '';
      inner.style.minWidth = '';
      inner.style.transform = '';
      inner.style.transformOrigin = '';
      wrap.style.height = '';
    }
  });
}

window.addEventListener('load', fitLivePreviewsMobile);
window.addEventListener('resize', fitLivePreviewsMobile);
setTimeout(fitLivePreviewsMobile, 350);


function applyMobileScaleV4() {
  const mobile = window.innerWidth <= 1000;

  const familyWrap = document.querySelector('.familyWrap');
  const familyTree = document.querySelector('.familyTree');

  if (familyWrap && familyTree) {
    if (mobile) {
      const familyBaseWidth = 1300;
      const familyScale = Math.min(1, familyWrap.clientWidth / familyBaseWidth);
      familyTree.style.width = familyBaseWidth + 'px';
      familyTree.style.transformOrigin = 'top left';
      familyTree.style.transform = `scale(${familyScale})`;
      familyWrap.style.height = Math.ceil(familyTree.scrollHeight * familyScale) + 'px';
    } else {
      familyTree.style.transform = '';
      familyWrap.style.height = '';
    }
  }

  document.querySelectorAll('.livePreview').forEach((wrap) => {
    const inner = wrap.firstElementChild;
    if (!inner) return;

    if (mobile) {
      const baseWidth = 800;
      const scale = Math.min(1, wrap.clientWidth / baseWidth);
      inner.style.width = baseWidth + 'px';
      inner.style.minWidth = baseWidth + 'px';
      inner.style.maxWidth = baseWidth + 'px';
      inner.style.transformOrigin = 'top left';
      inner.style.transform = `scale(${scale})`;
      wrap.style.height = Math.ceil(inner.scrollHeight * scale) + 'px';
      wrap.style.overflow = 'hidden';
    } else {
      inner.style.width = '';
      inner.style.minWidth = '';
      inner.style.maxWidth = '';
      inner.style.transform = '';
      wrap.style.height = '';
      wrap.style.overflow = '';
    }
  });
}

window.addEventListener('DOMContentLoaded', applyMobileScaleV4);
window.addEventListener('load', applyMobileScaleV4);
window.addEventListener('resize', applyMobileScaleV4);
setTimeout(applyMobileScaleV4, 500);

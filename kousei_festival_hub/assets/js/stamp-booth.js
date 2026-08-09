(function(){
  const meta=window.KOUSEI_BOOTH_STAMP;
  if(!meta)return;
  const wrap=document.createElement('div');
  wrap.id='kouseiStampBar';
  wrap.innerHTML=`<div class="ks-copy"><b>FESTIVAL PASSPORT</b><span id="ksState">체험 후 도장을 받을 수 있어요.</span></div><button id="ksButton" type="button" disabled>도장 받기</button>`;
  const style=document.createElement('style');
  style.textContent=`#kouseiStampBar{position:sticky;bottom:14px;z-index:50;margin:24px auto 0;max-width:680px;background:#fffffff2;border:1px solid #ddcfba;border-radius:18px;padding:12px 14px;box-shadow:0 14px 36px #4c3d2c22;display:flex;gap:14px;align-items:center;justify-content:space-between;backdrop-filter:blur(8px)}#kouseiStampBar .ks-copy{display:flex;flex-direction:column;gap:2px}#kouseiStampBar b{font-size:9px;letter-spacing:.15em;color:#69809a}#kouseiStampBar span{font-size:12px;color:#657487}#ksButton{border:0;border-radius:999px;background:#304b68;color:#fff;padding:10px 15px;font-weight:900;cursor:pointer;white-space:nowrap}#ksButton:disabled{opacity:.38;cursor:not-allowed}@media(max-width:520px){#kouseiStampBar{margin-left:0;margin-right:0}#kouseiStampBar span{font-size:11px}}`;
  document.head.appendChild(style);document.body.appendChild(wrap);
  const btn=document.getElementById('ksButton'),state=document.getElementById('ksState');
  let eligible=false,auth=null,db=null;
  window.KOUSEI_ENABLE_STAMP=function(){eligible=true;btn.disabled=false;state.textContent='체험 완료! 이제 도장을 받을 수 있어요.'};
  try{if(!firebase.apps.length)firebase.initializeApp(window.KOUSEI_FIREBASE_CONFIG);auth=firebase.auth();db=firebase.database();auth.onAuthStateChanged(u=>{if(!u){state.textContent=eligible?'메인에서 패스포트를 먼저 열어 주세요.':'체험 후 도장을 받을 수 있어요.';return}db.ref(`festivalPassports/${u.uid}/stamps/${meta.id}`).once('value').then(s=>{if(s.exists()){btn.disabled=true;btn.textContent='도장 완료 ✓';state.textContent='이 부스의 도장을 이미 받았어요.'}})})}catch(e){state.textContent='도장 저장 설정을 확인해 주세요.';console.error(e)}
  btn.addEventListener('click',async()=>{if(!eligible)return;const u=auth&&auth.currentUser;if(!u){alert('축제 메인에서 패스포트를 먼저 열어 주세요.');return}btn.disabled=true;try{await db.ref(`festivalPassports/${u.uid}/stamps/${meta.id}`).set({at:firebase.database.ServerValue.TIMESTAMP,title:meta.title||meta.id});btn.textContent='도장 완료 ✓';state.textContent='패스포트에 도장이 찍혔습니다!'}catch(e){btn.disabled=false;state.textContent='도장 저장에 실패했습니다. 다시 시도해 주세요.'}});
})();

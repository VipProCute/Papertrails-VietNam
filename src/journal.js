'use strict';
/* ============================== Sổ tem: nhận tem và giao diện ============================== */
function awardStamp(id){const s=STAMP_BY_ID[id];if(!s||SAVE.stamps[id])return false;SAVE.stamps[id]=Date.now();saveSoon();
  BUS.emit('stamp',{id,title:s.title});stampPop(s);return true}
let popT=0,popQ=[];
function stampPop(s){popQ.push(s);if(popQ.length===1)showPop()}
function showPop(){const s=popQ[0],el=$('stampPop');if(!s)return;el.innerHTML='<small>Tem mới</small>';el.appendChild(document.createTextNode(s.title));
  requestAnimationFrame(()=>el.classList.add('on'));
  clearTimeout(popT);popT=setTimeout(()=>{el.classList.remove('on');setTimeout(()=>{popQ.shift();if(popQ.length)showPop()},500)},3000)}
BUS.on('visit',e=>awardStamp(e.id));
BUS.on('bridge',e=>{let n=e.n;if(!n&&typeof BRIDGE!=='undefined'){const b=BRIDGE.find(q=>q.name===e.name);if(b)n=b.n}if(n)awardStamp(n)});
BUS.on('region',e=>awardStamp('r_'+e.id));
BUS.on('pick',e=>{if(e.kind!=='domdom')awardStamp('f_'+e.kind)});

/* vẽ một tem từ atlas */
function drawStamp(cv,name){const dpr=Math.min(2,window.devicePixelRatio||1),W=84;cv.width=cv.height=W*dpr;const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);
  const sp=typeof SPR!=='undefined'&&SPR[name];if(sp&&sp.px){const [x,y,w,h]=sp.px,k=Math.min((cv.width-10*dpr)/w,(cv.height-10*dpr)/h);g.imageSmoothingQuality='high';g.drawImage(acv,x,y,w,h,(cv.width-w*k)/2,(cv.height-h*k)/2,w*k,h*k)}
  else{g.fillStyle='rgba(43,38,34,.35)';g.font=(46*dpr)+'px "Patrick Hand",cursive';g.textAlign='center';g.textBaseline='middle';g.fillText('?',cv.width/2,cv.height/2)}}
function lockedStamp(cv){const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=cv.height=84*dpr;const g=cv.getContext('2d');g.fillStyle='rgba(43,38,34,.3)';g.font=(46*dpr)+'px "Patrick Hand",cursive';g.textAlign='center';g.textBaseline='middle';g.fillText('?',cv.width/2,cv.height/2)}

function buildJournal(){const body=$('jBody');body.textContent='';let have=0;
  for(const grp of STAMP_GROUPS){const list=STAMPS.filter(s=>s.group===grp);if(!list.length)continue;
    const h=document.createElement('div');h.className='jgroup';h.textContent=grp;body.appendChild(h);const gr=document.createElement('div');gr.className='jgrid';body.appendChild(gr);
    for(const s of list){const got=!!SAVE.stamps[s.id];if(got)have++;const el=document.createElement('div');el.className='stamp'+(got?'':' lock');
      const cv=document.createElement('canvas');got?drawStamp(cv,s.sprite):lockedStamp(cv);el.appendChild(cv);
      const t=document.createElement('h3');t.textContent=got?s.title:'Chưa tìm thấy';el.appendChild(t);
      if(got){const p=document.createElement('p');p.textContent=s.text;el.appendChild(p)}gr.appendChild(el)}}
  $('jCount').textContent=have+' / '+STAMPS.length}
function toggleJournal(on){const open=!$('journal').hidden;if(on===undefined)on=!open;if(on===open)return;if(on&&(state!=='play'||!openModal('journal')))return;if(!on)closeModal('journal');$('journal').hidden=!on;
  if(on){keys.clear();ptr=null;buildJournal();$('jBody').scrollTop=0;$('bJClose').focus()}else $('bJournal').blur()}
$('bJournal').addEventListener('click',e=>{e.currentTarget.blur();toggleJournal()});$('bJClose').addEventListener('click',()=>toggleJournal(false));
$('journal').addEventListener('pointerdown',e=>{if(e.target===$('journal'))toggleJournal(false)});
addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='KeyJ')toggleJournal();else if(e.code==='Escape'&&!$('journal').hidden)toggleJournal(false)});

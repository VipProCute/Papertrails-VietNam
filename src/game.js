'use strict';
/* ============================== luật chơi ============================== */
/* công dụng từng món: ammo = bánh để ném, boost = tỉnh táo, shield = no bụng, feast = bánh lớn */
const FOOD_FX={banhmi:'ammo',banhxeo:'ammo',caphe:'boost',pho:'shield',miquang:'shield',hutieu:'shield',banhchung:'feast',comlam:'feast',xoi:'feast'};
let modal=false,rideK=0,lockIn=false,mode=SAVE.mode,big=0,shield=0,boostT=0,invT=0,downT=0,prevFrame=0,overT=0,modalOwner='';
/* khoá chung cho các lớp phủ: chỉ chủ sở hữu mới nhả được trạng thái dừng game */
function openModal(who){if(modal)return false;modal=true;modalOwner=who;return true}
function closeModal(who){if(modalOwner===who){modal=false;modalOwner=''}}
function eatFood(kind){const fx=FOOD_FX[kind]||'ammo';
  if(fx==='boost'){boostT=10;player.stam=100;player.tired=false;toast('Cà phê! Tỉnh táo 10 giây')}
  else if(fx==='shield'){shield=Math.min(2,shield+1);toast('No bụng, chịu được một lần cắn')}
  else if(fx==='feast'){big++;toast('Bánh lớn, ném ra chó sẽ mê hơn')}
  else food+=kind==='banhxeo'?2:1;
  BUS.emit('eat',{kind})}
/* dịch chuyển người chơi (tải lại ô nếu xa) */
function tpTo(x,z){if(Math.hypot(x-player.x,z-player.z)>9){tiles.forEach(dropTile);player.x=x;player.z=z;firstFill=true;updateTiles(0)}else{player.x=x;player.z=z}
  collide(player,.1);player.vx=player.vz=0;camT.set(player.x,0,player.z)}
function nearestHome(){let best=null,bd=1e9;const c=p=>{const d=Math.hypot(p[0]-player.x,p[1]-player.z);if(d<bd){bd=d;best=p}};
  for(const p of SAVE.lampPos)c(p);if(SAVE.home)c([SAVE.home.x,SAVE.home.z]);if(best)return [best[0],best[1]+.5];return ctr(0,0)}
function hurt(why,d){if(state!=='play'||invT>0||downT>0||lockIn)return;BUS.emit('hurt',{why});
  if(shield>0){shield--;invT=1.5;const sx=d?d.x:why==='bike'?bike.x:player.x,sz=d?d.z:why==='bike'?bike.z:player.z-1,k=Math.hypot(player.x-sx,player.z-sz)||1;
    player.x+=(player.x-sx)/k*.6;player.z+=(player.z-sz)/k*.6;collide(player,.1);if(d){d.state='home';d.cool=6}toast('No bụng đỡ giùm một lần!');sfx.thr();hud();return}
  if(mode==='chal'){gameOver(why);return}
  downT=1.2;invT=0;food=big=0;boostT=0;for(const g of dogs)if(g.state==='chase'||g.state==='alert'||g.state==='treat'){g.state='home';g.cool=6}
  toast(why==='dog'?'Chó cắn! Bạn ngã, rơi hết đồ ăn':'Xe ủi! Bạn ngã, rơi hết đồ ăn');sfx.over();hud()}
function wake(){const p=nearestHome();tpTo(p[0],p[1]);player.fall=0;invT=2.5;BUS.emit('respawn',{x:player.x,z:player.z});toast('Bạn tỉnh dậy bên đèn lồng')}
function throwTreat(){if(state!=='play'||modal||downT>0||(food<=0&&big<=0))return;let tgt=null,bd=1e9;for(const d of dogs)if(d.state==='chase'||d.state==='alert'){const k=Math.hypot(d.x-player.x,d.z-player.z);if(k<bd){bd=k;tgt=d}}
  let ax=-player.dir,az=0;if(tgt){ax=(tgt.x-player.x)/bd;az=(tgt.z-player.z)/bd}const reach=Math.min(.9,tgt?bd*.5:.9);
  const bg=food<=0,m=cardMesh(bg?'banhchung':'banhmi');m.rotation.x=-HALF;const x=player.x+ax*reach,z=player.z+az*reach;m.position.set(x,.03,z);scene.add(m);treats.push({m,x,z,ttl:bg?27:9,k:bg?3:1});if(bg)big--;else food--;sfx.thr();hud()}
function gameOver(why){if(state!=='play')return;state='over';cause=why;sfx.over();ptr=null;
  const best=SAVE.best||0,sc=score(),rec=sc>best;if(rec)SAVE.best=sc;saveNow();BUS.emit('over',{why,score:sc});
  $('oTitle').textContent=why==='dog'?'Bị chó cắn!':'Bị xe máy ủi!';
  $('oMsg').textContent=why==='dog'?pickMsg(['Con vàng giữ nhà quá tận tâm. Lần sau thấy nó dựng tai thì chạy ngay, hoặc ném bánh mì rồi đi vòng.','Chó làng không đùa. Giữ sức chạy cho lúc cần và đừng đi sát cổng nhà người ta.']):pickMsg(['Chú chở hàng không kịp phanh. Nghe “bíp bíp” là phải bước khỏi đường mòn ngay.','Đường mòn vắng mà xe máy thì nhanh. Lần sau nghe còi nhớ nép vào lề.']);
  $('score').innerHTML=`<span>Quãng đường <b>${Math.round(dist)} m</b></span><span>Món ăn nhặt được <b>${foodAll}</b></span><span>Đèn lồng đã thắp <b>${lamps}</b></span><span>Tổng điểm <b>${sc}</b>${rec?' · kỷ lục mới':' · kỷ lục '+best}</span>`;
  clearTimeout(overT);overT=setTimeout(()=>{if(state!=='over')return;$('over').hidden=false;$('bAgain').focus()},850)}
const pickMsg=a=>a[(Math.random()*a.length)|0],score=()=>Math.round(dist)+foodAll*10+lamps*25;
function resetRun(){food=big=shield=0;boostT=invT=downT=0;player.m.visible=true;prevFrame=0;visited.clear()}
function begin(from){initAudio();initTracks();if(AC&&soundOn&&AC.state==='suspended')AC.resume();$('start').hidden=true;resetRun();
  if(from==='home'&&SAVE.home){tiles.forEach(dropTile);player.x=SAVE.home.x;player.z=SAVE.home.z+.5;firstFill=true;updateTiles(0);collide(player,.1);camT.set(player.x,0,player.z)}
  tiles.forEach(t=>{t.target=0;t.p=0;t.wait=0;fold(t)});firstFill=true;state='play';lastBiome=-1;SAVE.stats.runs++;saveSoon();BUS.emit('begin',{})}
function restart(){clearTimeout(overT);tiles.forEach(dropTile);eaten.clear();treats.forEach(t=>scene.remove(t.m));treats.length=0;
  Object.assign(player,{x:0,z:0,vx:0,vz:0,stam:100,tired:false,fall:0,dir:1});const c=ctr(0,0);player.x=c[0];player.z=c[1];resetRun();
  dist=foodAll=lamps=0;time=0;clock=18;bike.on=false;bike.m.visible=bike.bub.visible=false;bike.next=16;firstFill=true;lastBiome=-1;lastBridge='';
  camT.set(player.x,0,player.z);$('over').hidden=true;hud();updateTiles(0);state='play';SAVE.stats.runs++;saveSoon();BUS.emit('restart',{})}
const visited=new Set();
$('bStart').addEventListener('click',()=>begin());$('bGo').addEventListener('click',()=>begin('home'));$('bAgain').addEventListener('click',restart);
function setMode(m){mode=SAVE.mode=m;$('mWalk').setAttribute('aria-pressed',m==='walk');$('mChal').setAttribute('aria-pressed',m==='chal');$('modeNote').textContent=m==='walk'?'Bị chó cắn thì ngã, tỉnh dậy bên đèn lồng gần nhất.':'Bị cắn hoặc bị xe ủi là hết chuyến, tính điểm.';saveSoon()}
$('mWalk').addEventListener('click',()=>setMode('walk'));$('mChal').addEventListener('click',()=>setMode('chal'));setMode(mode);
$('bGo').hidden=!SAVE.home;
$('bReset').addEventListener('click',()=>{if(confirm('Xoá toàn bộ tiến độ: tem, đèn lồng đã thắp, vùng đã đi qua và kỷ lục?')){saveReset();location.reload()}});
if(SAVE.best)$('best').textContent='Kỷ lục thử thách: '+SAVE.best+' điểm';

let hudKey='',hudStam,hudTired;function hud(){const k=Math.round(dist)+'|'+food+'|'+lamps+'|'+big+'|'+shield+'|'+Math.ceil(boostT);if(k!==hudKey){hudKey=k;$('hDist').textContent=Math.round(dist);$('hFood').textContent=food;$('hBig').textContent=big;$('hShield').textContent=shield;$('hLamp').textContent=lamps;
    $('hBoost').hidden=boostT<=0;$('hBoostT').textContent=Math.ceil(boostT)}
  if(player.stam!==hudStam){hudStam=player.stam;$('stamFill').style.width=hudStam+'%'}if(player.tired!==hudTired){hudTired=player.tired;$('stam').classList.toggle('low',hudTired)}compass()}
/* la bàn: mũi tên chỉ về vùng chưa đến gần nhất, cập nhật tối đa 4 lần/giây */
const CARD8=['Bắc','Đông Bắc','Đông','Đông Nam','Nam','Tây Nam','Tây','Tây Bắc'];let cmpT=0,cmpKey='-';
function compass(){const n=performance.now();if(n-cmpT<250)return;cmpT=n;const el=$('compass');let h=null;
  if(state==='play'&&typeof nextRegionHint==='function'){try{h=nextRegionHint(player.x,player.z,new Set(SAVE.regions))}catch(e){}}
  if(!h){if(cmpKey!==''){cmpKey='';el.hidden=true}return}
  let dx,dz,dm;const B=typeof BIOME!=='undefined'&&BIOME[h.b];
  if(B&&B.site){dx=B.site[0]*TS-player.x;dz=B.site[1]*TS-player.z;dm=Math.hypot(dx,dz)*2}else{dx=Math.cos(h.ang||0);dz=Math.sin(h.ang||0);dm=(h.dist||0)*2}
  const bear=Math.atan2(dx,-dz),deg=(bear*180/Math.PI+360)%360,lab=h.name+' · '+Math.round(dm/10)*10+' m',k=lab+'|'+Math.round(deg/3);
  if(k===cmpKey)return;cmpKey=k;el.hidden=false;$('cmpArrow').style.transform='rotate('+deg.toFixed(1)+'deg)';$('cmpTxt').textContent=lab;el.title=h.name||''}
let toastT=0;function toast(s){$('toast').textContent=s;$('toast').classList.add('on');toastT=3.2}
let warnKey='';function warn(s,cls){const k=s+cls;if(k===warnKey)return;warnKey=k;const w=$('warn');w.textContent=s;w.className=(s?'on ':'')+(cls||'')}
let lastBiome=0,lastBridge='',lastCi=1e9,lastCj=1e9;

function updatePlayer(dt){
  if(downT>0){downT-=dt;player.fall=Math.min(1,player.fall+dt*3.5);player.vx=player.vz=0;player.frame=0;player.m.visible=true;if(downT<=0)wake();return}
  if(player.fall>0)player.fall=Math.max(0,player.fall-dt*4);if(boostT>0)boostT-=dt;if(invT>0){invT-=dt;player.m.visible=invT<=0||((time*10|0)&1)===0}else player.m.visible=true;
  let ix=0,iz=0;if(keys.has('KeyW')||keys.has('ArrowUp'))iz-=1;if(keys.has('KeyS')||keys.has('ArrowDown'))iz+=1;if(keys.has('KeyA')||keys.has('ArrowLeft'))ix-=1;if(keys.has('KeyD')||keys.has('ArrowRight'))ix+=1;
  if(!ix&&!iz&&ptr){const dx=ptr.x-player.x,dz=ptr.z-player.z,d=Math.hypot(dx,dz);if(d>.14){ix=dx/d;iz=dz/d}}
  if(lockIn)ix=iz=0;
  const l=Math.hypot(ix,iz);if(l>1){ix/=l;iz/=l}
  const wantRun=(keys.has('ShiftLeft')||keys.has('ShiftRight')||runBtn)&&l>0;if(player.stam<=0)player.tired=true;if(player.stam>28)player.tired=false;
  const run=wantRun&&!player.tired&&!rideK;player.stam=clamp(player.stam+(run?(boostT>0?0:-23):l>0?11:20)*dt,0,100);
  const tl=tileAt(player.x,player.z),trail=pathDist(player.x,player.z)<.32;
  const br=bridgeAt(player.x,player.z,0),sp=1.25*(run?1.75:1)*(tl&&tl.type==='paddy'&&!rideK?.76:1)*(trail?1.1:1)*(br?br.B.sp:1)*(boostT>0?1.15:1)*(rideK||1);
  const k=1-Math.exp(-14*dt);player.vx+=(ix*sp-player.vx)*k;player.vz+=(iz*sp-player.vz)*k;
  const ox=player.x,oz=player.z;player.x+=player.vx*dt;player.z+=player.vz*dt;if(!lockIn)collide(player,.1);
  const mv=Math.hypot(player.x-ox,player.z-oz);dist+=mv*2;SAVE.stats.dist+=mv*2;
  if(l>0){if(Math.abs(ix)>.15)player.dir=ix>0?1:-1;heading[0]=lerp(heading[0],ix,dt*3);heading[1]=lerp(heading[1],iz,dt*3)}
  player.ph+=mv;const walking=mv>dt*.25;player.frame=walking?1+((player.ph/.2|0)%2):0;
  if(player.frame&&player.frame!==prevFrame)BUS.emit('step',{surface:br?'wood':tl&&tl.type==='paddy'?'paddy':trail?(lastBiome===2||lastBiome===5?'stone':'dirt'):'grass'});prevFrame=player.frame;
  {const ci=Math.round(player.x/TS),cj=Math.round(player.z/TS);if(ci!==lastCi||cj!==lastCj){lastCi=ci;lastCj=cj;markCell(ci+','+cj)}}
  if(run&&walking&&Math.random()<dt*14)puff(player.x-player.dir*.08,.03,player.z,(Math.random()-.5)*.3,.3,(Math.random()-.5)*.3,.45);
  /* nhặt đồ, thắp đèn */
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const t=tiles.get((Math.round(player.x/TS)+a)+','+(Math.round(player.z/TS)+b));if(!t)continue;
    if(t.pick&&t.p>.9&&Math.hypot(t.pick.x-player.x,t.pick.z-player.z)<.34){const pk=t.pick;t.grp.remove(pk.m);t.pick=null;eaten.add(t.key);foodAll++;SAVE.stats.food++;sfx.pick();BUS.emit('pick',{kind:pk.kind,x:pk.x,z:pk.z});eatFood(pk.kind);saveSoon();for(let q=0;q<6;q++)puff(player.x,.3,player.z,(Math.random()-.5)*1.2,.6+Math.random()*.6,(Math.random()-.5)*1.2,.5)}
    if(t.lamp&&!t.lamp.lit&&t.p>.9&&Math.hypot(t.lamp.x-player.x,t.lamp.z-player.z)<.85){t.lamp.lit=true;t.lamp.c.m.geometry=cardGeo('denlong_on');litSet.add(t.key);addHalo(t);lamps++;SAVE.stats.lamps++;sfx.lamp();BUS.emit('lamp',{key:t.key,x:t.lamp.x,z:t.lamp.z})}
    if(t.marks&&t.p>.9)for(const mk of t.marks)if(!visited.has(mk.id)&&Math.hypot(mk.x-player.x,mk.z-player.z)<1){visited.add(mk.id);BUS.emit('visit',{id:mk.id,x:mk.x,z:mk.z,b:t.b})}}
  const b=biomeAt(Math.round(player.x/TS),Math.round(player.z/TS));if(b!==lastBiome){lastBiome=b;toast(BIOME[b].name);BUS.emit('region',{id:BIOME[b].id||String(b),b,name:BIOME[b].name})}
  const nb=bridgeAt(player.x,player.z,0);if(nb){if(nb.B.name!==lastBridge){lastBridge=nb.B.name;toast(lastBridge);BUS.emit('bridge',{name:nb.B.name,n:nb.B.n})}}else lastBridge='';
}
function moveTo(o,tx,tz,sp,dt){const dx=tx-o.x,dz=tz-o.z,d=Math.hypot(dx,dz);if(d<1e-3)return 0;const tl=tileAt(o.x,o.z),s=Math.min(d,sp*(tl&&tl.type==='paddy'?.8:1)*dt);o.x+=dx/d*s;o.z+=dz/d*s;if(Math.abs(dx)>.05)o.dir=dx>0?1:-1;o.ph+=s;return d}
const zGeo=cardGeo('zzz'),gGeo=cardGeo('gau');
function updateDogs(dt){let chasing=false,nch=0;const sl=nightF>.6;for(const d of dogs)if(d.state==='alert'||d.state==='chase')nch++;
  for(const d of dogs){const up=d.tile.p>.85;if(!up&&d.state==='sit'){d.m.visible=false;d.bub.visible=false;continue}d.m.visible=true;
    const dp=Math.hypot(player.x-d.x,player.z-d.z);let fr=0,bub=false,zz=false;
    if(d.state==='sit'){d.cool-=dt;if(dp>.01&&!sl)d.dir=player.x>d.x?1:-1;zz=sl&&dp<5;if(d.cool<=0&&dp<d.notice*(sl?.55:1)&&state==='play'){if(rideK){d.cool=3.5;sfx.bark()}else if(nch<3){nch++;d.state='alert';d.timer=.62;sfx.bark()}}}
    else if(d.state==='alert'){bub=true;chasing=true;d.timer-=dt;d.dir=player.x>d.x?1:-1;if(d.timer<=0){d.state='chase';d.timer=9;d.bark=.9}}
    else if(d.state==='chase'){chasing=true;let tr=null;for(const t of treats)if(Math.hypot(t.x-d.x,t.z-d.z)<3.2){tr=t;break}
      if(tr){d.state='treat';d.tr=tr}else{moveTo(d,player.x,player.z,d.speed,dt);collide(d,.08);fr=1+((d.ph/.16|0)%2);d.timer-=dt;d.bark-=dt;if(d.bark<=0){d.bark=1.1;sfx.bark()}bub=d.bark>.7;
        if(Math.random()<dt*9)puff(d.x-d.dir*.1,.03,d.z,0,.25,0,.4);
        if(dp<.21)hurt('dog',d);else if(d.timer<=0||dp>3.9){d.state='home';d.cool=6}}}
    else if(d.state==='treat'){const tr=d.tr;if(treats.indexOf(tr)<0){d.state='home';d.cool=8}else{const k=moveTo(d,tr.x,tr.z,d.speed,dt);collide(d,.08);fr=k>.14?1+((d.ph/.16|0)%2):0;if(k<=.14){const L=3.2*(tr.k||1);tr.ttl=Math.min(tr.ttl,L);tr.m.scale.setScalar(Math.max(.2,tr.ttl/L))}}}
    else if(d.state==='home'){const k=moveTo(d,d.hx,d.hz,1.2,dt);collide(d,.08);fr=1+((d.ph/.2|0)%2);if(k<.06){d.state='sit';d.cool=Math.max(d.cool,4)}}
    const dy=deckY(d.x,d.z);d.m.geometry=dGeo[fr];d.m.position.set(d.x,.012+dy+(fr?Math.abs(Math.sin(d.ph*18))*.03:0),d.z);d.m.scale.x=d.dir;
    {const wg=zz?zGeo:gGeo;if(d.bub.geometry!==wg)d.bub.geometry=wg}d.bub.visible=bub||zz;if(bub||zz)d.bub.position.set(d.x+.05,.42+dy,d.z-.02)}
  for(let k=treats.length-1;k>=0;k--){const t=treats[k];t.ttl-=dt;if(t.ttl<=0){scene.remove(t.m);treats.splice(k,1)}}
  return chasing}
function spawnBike(){const pi=Math.round(player.x/TS),pj=Math.round(player.z/TS),jr=Math.round(pj/4)*4,ic=Math.round(pi/5)*5;
  const dRow=Math.abs(player.z-jr*TS),dCol=Math.abs(player.x-ic*TS);let row=dRow<dCol;if(Math.random()<.22)row=!row;const s=Math.random()<.5?1:-1;bike.pts=[];
  for(let k=-7;k<=7;k++){const p=row?ctr(pi+k*s,jr):ctr(ic,pj+k*s),a=bike.pts[bike.pts.length-1];if(a&&!row&&wetSpan(a,p))break;bike.pts.push(p)}
  if(bike.pts.length<3){bike.next=4;return}
  bike.dirName=row?(s>0?'phía Tây':'phía Đông'):(s>0?'phía Bắc':'phía Nam');
  bike.seg=0;bike.t=0;bike.on=true;bike.honk=0;bike.speed=3.9+Math.min(2,dist/450);bike.m.visible=true;sfx.horn()}
function updateBike(dt){
  if(!bike.on){if(state==='play'){bike.next-=dt*((BIOME[lastBiome]&&BIOME[lastBiome].bike)||1);if(bike.next<=0)spawnBike()}if(engGain)engGain.gain.value*=.9;bikeLight.intensity=0;beam.visible=false;return false}
  let a=bike.pts[bike.seg],b=bike.pts[bike.seg+1];let len=Math.hypot(b[0]-a[0],b[1]-a[1]);bike.t+=bike.speed*dt/len;
  while(bike.t>=1){bike.t-=1;bike.seg++;if(bike.seg>=bike.pts.length-1){bike.on=false;bike.m.visible=bike.bub.visible=false;bike.next=Math.max(7,11+Math.random()*10-dist/250);return false}a=bike.pts[bike.seg];b=bike.pts[bike.seg+1]}
  bike.x=lerp(a[0],b[0],bike.t);bike.z=lerp(a[1],b[1],bike.t);const dx=b[0]-a[0],dz=b[1]-a[1];
  if(Math.abs(dx)>=Math.abs(dz)){bike.m.geometry=bGeo.side;bike.m.scale.x=dx>0?1:-1}else{bike.m.geometry=dz>0?bGeo.front:bGeo.back;bike.m.scale.x=1}
  bike.m.position.set(bike.x,.012+deckY(bike.x,bike.z)+Math.abs(Math.sin(time*30))*.012,bike.z);
  const dp=Math.hypot(bike.x-player.x,bike.z-player.z);bike.honk-=dt;const near=dp<4.2*(nightF>.6?.7:1);if(near&&bike.honk<=0){bike.honk=.8;sfx.horn()}
  bike.bub.visible=near&&bike.honk>.35;if(bike.bub.visible)bike.bub.position.set(bike.x,1.0,bike.z);
  if(Math.random()<dt*22)puff(bike.x-dx/len*.35,.04,bike.z-dz/len*.35,(Math.random()-.5)*.4,.3+Math.random()*.3,(Math.random()-.5)*.4,.6);
  if(engGain){engGain.gain.value=clamp(.16*(1-dp/11),0,.16);engOsc.frequency.value=88+Math.sin(time*40)*5+clamp(9-dp,0,9)*4}
  bikeLight.position.set(bike.x+dx/len*.7,.45,bike.z+dz/len*.7);bikeLight.intensity=nightF*.55;beam.visible=nightF>.05;beam.position.set(bike.x+dx/len*1.1,.022,bike.z+dz/len*1.1);beam.scale.set(1.5,1,1.5);beamMat.opacity=nightF*.16;
  if(state==='play'&&dp<.3)hurt('bike');
  return dp<11}

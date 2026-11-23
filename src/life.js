'use strict';
/* ============================== gói 2: thế giới sống ============================== */
/* thú vật biết tránh người, cưỡi trâu voi, đò ngang, đêm có đom đóm và chợ đêm, thời tiết từng vùng */
(function(){
const stampOf=id=>{if(typeof awardStamp==='function')try{awardStamp(id)}catch(e){}};
const act=$('actBtn'),hDom=$('hDom'),hDomN=$('hDomN'),touch=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches),sfxO=n=>{try{sfx[n]&&sfx[n]()}catch(e){}};
const live=[],seen={};let ride=null,fer=null,cur=null,nightNo=1,scanT=0,promptKey='';
const react=k=>{if(!seen[k]){seen[k]=1;stampOf('a_'+k)}};
const inPlay=()=>state==='play'&&!modal;

/* ---------- 1. thú vật ---------- */
function reset(a){const i=live.indexOf(a);if(i>=0)live.splice(i,1);
  if(a.c.gone){a.c.gone=false;if(tiles.get(a.t.key)===a.t)buildBlockers(a.t)}
  if(a.det){a.det=false;if(tiles.get(a.t.key)===a.t){a.t.grp.add(a.m);a.t.cards.push(a.c);fold(a.t)}else scene.remove(a.m)}
  a.x=a.hx;a.z=a.hz;a.m.position.set(a.hx,a.y0,a.hz);a.m.visible=true;a.st='idle';a.fw=a.fh=1;a.fx=a.tf=a.fx<0?-1:1;a.m.scale.set(a.sc*a.fx,a.sc,a.sc)}
function goLive(a){if(live.indexOf(a)<0)live.push(a)}
function scare(a){a.cd=1.6;react(a.kind);BUS.emit('scare',{kind:a.kind});goLive(a)}
const face=(a,dx)=>{if(Math.abs(dx)>.02)a.tf=dx>0?1:-1};
function waterTarget(a){const p=a.t.pond;if(p){const k=a.hx*50|0,l=a.hz*50|0;return {x:p.x+(h2(k,l,5)-.5)*.7,z:p.z+(h2(k,l,6)-.5)*.6}}
  const ri=riverInfo(a.x,a.z);if(ri.d<RW+1.1)return {x:a.x-ri.nx*(ri.d-RW*.4),z:a.z-ri.nz*(ri.d-RW*.4)};return null}
function stepTo(a,tx,tz,sp,dt){const dx=tx-a.x,dz=tz-a.z,d=Math.hypot(dx,dz);if(d<.03)return 0;const s=Math.min(d,sp*dt);a.x+=dx/d*s;a.z+=dz/d*s;face(a,dx);return d-s}
function stepAnimal(a,dt){const dx=player.x-a.x,dz=player.z-a.z,d=Math.hypot(dx,dz)||1e-3,k=a.kind,m=a.m;a.ph+=dt;a.tm-=dt;a.cd-=dt;let y=a.y0;
  if(k==='co'){
    if(a.st==='fly'){const e=3-a.tm;a.x+=a.vx*dt*(1+e*.5);a.z+=a.vz*dt*(1+e*.5);y=a.y0+smooth(e/1.3)*1.6+Math.max(0,e-1.3)*.4+Math.sin(a.ph*9)*.04;a.fh=1+.28*Math.sin(a.ph*22);a.fw=1+.12*Math.sin(a.ph*22+1);face(a,a.vx);if(a.tm<=0){a.st='gone';a.tm=18+Math.random()*6;m.visible=false}}
    else if(a.st==='gone'){if(a.tm<=0){if(d>1.8){a.st='land';a.tm=.5;a.x=a.hx;a.z=a.hz;m.visible=true;a.fw=a.fh=0}else a.tm=1}}
    else if(a.st==='land'){a.fw=a.fh=smooth(1-a.tm/.5);if(a.tm<=0)return reset(a)}}
  else if(k==='ga'||k==='vit'){
    if(a.st==='run'){a.x+=a.vx*dt;a.z+=a.vz*dt;if(k==='ga')collide(a,.05);y+=Math.abs(Math.sin(a.ph*22))*.05;face(a,a.vx);if(a.tm<=0){a.st='away';a.tm=2.5+Math.random()*3}}
    else if(a.st==='away'){if(d<.45&&a.cd<=0&&inPlay()){scare(a);a.st='run';a.tm=.4;a.vx=-dx/d*2.4;a.vz=-dz/d*2.4}else if(a.tm<=0)a.st='back'}
    else if(a.st==='back'){const r=stepTo(a,a.hx,a.hz,.6,dt);if(k==='ga')collide(a,.05);y+=Math.abs(Math.sin(a.ph*12))*.012;if(r<=0)return reset(a);if(d<.4&&a.cd<=0&&inPlay()){scare(a);a.st='run';a.tm=.4;a.vx=-dx/d*2.4;a.vz=-dz/d*2.4}}
    else if(a.st==='slide'||a.st==='unslide'){const sl=a.st==='slide',r=stepTo(a,sl?a.tg.x:a.hx,sl?a.tg.z:a.hz,.9,dt);y+=sl?.012:.004;if(r<=0){if(sl){a.st='swim';a.tm=6+Math.random()*4}else return reset(a)}}
    else if(a.st==='swim'){y+=.012+Math.sin(a.ph*2.4)*.008;if(a.tm<=0)a.st='unslide'}}
  else if(a.st==='walk'){if(stepTo(a,a.hx,a.hz,.85,dt)<=0)return reset(a)}
  if(a.fx!==a.tf){a.fx+=(a.tf-a.fx)*Math.min(1,dt*14);if(Math.abs(a.tf-a.fx)<.02)a.fx=a.tf}
  m.position.set(a.x,y,a.z);m.scale.set(a.sc*a.fx*a.fw,a.sc*a.fh,a.sc)}
function idleAnimal(a,dt,d,dx,dz){const k=a.kind;
  if(a.fx!==a.tf){a.fx+=(a.tf-a.fx)*Math.min(1,dt*14);if(Math.abs(a.tf-a.fx)<.02)a.fx=a.tf;a.m.scale.x=a.sc*a.fx}
  if(k==='trau'||k==='voi'){if(d<3.2){if(Math.abs(dx)>.25)face(a,dx);react(k)}}
  else if(a.cd>0)a.cd-=dt;
  else if(k==='co'){if(d<.9){scare(a);a.st='fly';a.tm=3;a.vx=-dx/d*1.6;a.vz=-dz/d*1.6;a.ph=0}}
  else if(d<.5){scare(a);a.vx=-dx/d*2.4;a.vz=-dz/d*2.4;const w=k==='vit'?waterTarget(a):null;if(w){a.st='slide';a.tg=w}else{a.st='run';a.tm=.45}a.ph=0}}
function updAnimals(dt){
  if(inPlay()){const pi=Math.round(player.x/TS),pj=Math.round(player.z/TS);
    for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const t=tiles.get((pi+c)+','+(pj+b));if(!t||t.p<=.9||!t.animals.length)continue;
      for(const a of t.animals)if(a.st==='idle'){const dx=player.x-a.x,dz=player.z-a.z,d=Math.hypot(dx,dz);if(d<3.4)idleAnimal(a,dt,d||1e-3,dx,dz)}}}
  for(let i=live.length-1;i>=0;i--){const a=live[i];if(tiles.get(a.t.key)!==a.t||a.t.p<=.9){reset(a);continue}stepAnimal(a,dt)}}

/* ---------- 2. cưỡi trâu, voi ---------- */
function mount(a){if(ride||fer)return;const i=a.t.cards.indexOf(a.c);if(i>=0)a.t.cards.splice(i,1);a.c.gone=true;buildBlockers(a.t);a.det=true;scene.add(a.m);a.m.rotation.x=0;const j=live.indexOf(a);if(j>=0)live.splice(j,1);
  const el=a.kind==='voi';a.st='ridden';ride={a,R:el?14:8,lift:el?.66:.44};rideK=el?1:1.15;react(a.kind);toast(el?'Bạn ngồi trên lưng voi':'Bạn ngồi trên lưng trâu');sfxO('pick');BUS.emit('ride',{on:true,kind:a.kind})}
function dismount(){if(!ride)return;const a=ride.a;ride=null;rideK=0;player.m.scale.set(player.dir,1,1);a.st='walk';a.tf=a.fx<0?-1:1;goLive(a);BUS.emit('ride',{on:false,kind:a.kind})}

/* ---------- 3. đò ngang ---------- */
function ferryFar(f){let ent=false,lx=0,lz=0;for(let s=.1;s<3.6;s+=.08){const x=f.sx+f.dx*s,z=f.sz+f.dz*s,d=riverD(x,z);if(d<RW-.05){ent=true;lx=x;lz=z}else if(ent&&d>RW+.3)return {x,z,bx:lx-f.dx*.25,bz:lz-f.dz*.25}}return null}
function startFerry(f){if(!f.far)return;fer={f,u:0,s:[player.x,player.z],b0:[f.bx,f.bz],far:f.far,bx:f.bx,bz:f.bz};lockIn=true;player.vx=player.vz=0;sfxO('rustle')}
function stepFerry(dt){const F=fer,f=F.f,u=Math.min(1,F.u+=dt/2.7);let px,pz;
  if(u<.13){const q=smooth(u/.13);px=lerp(F.s[0],F.b0[0],q);pz=lerp(F.s[1],F.b0[1],q);F.bx=F.b0[0];F.bz=F.b0[1]}
  else if(u<.87){const q=smooth((u-.13)/.74);F.bx=px=lerp(F.b0[0],F.far.bx,q);F.bz=pz=lerp(F.b0[1],F.far.bz,q)}
  else{const q=smooth((u-.87)/.13);F.bx=F.far.bx;F.bz=F.far.bz;px=lerp(F.far.bx,F.far.x,q);pz=lerp(F.far.bz,F.far.z,q)}
  player.x=px;player.z=pz;player.vx=player.vz=0;
  if(F.u>=1){f.sx=F.far.x;f.sz=F.far.z;f.bx=F.far.bx;f.bz=F.far.bz;f.dx=-f.dx;f.dz=-f.dz;f.far=null;f.bc.m.position.x=f.bx;f.bc.m.position.z=f.bz;fer=null;lockIn=false;collide(player,.1);toast('Đã sang sông');BUS.emit('ferry',{})}}
function ferryScan(){for(let i=ferries.length-1;i>=0;i--){const f=ferries[i];if(tiles.get(f.t.key)!==f.t){ferries.splice(i,1);continue}
    if(f.t.p>.9&&Math.hypot(player.x-f.sx,player.z-f.sz)<.8){if(!f.far)f.far=ferryFar(f);if(f.far)return {txt:'Qua đò',f}}else f.far=null}return null}

/* ---------- 4. đêm: đom đóm, chợ đêm ---------- */
const FF=[];for(let k=0;k<6;k++){const m=cardMesh('domdom');m.castShadow=false;m.visible=false;scene.add(m);FF.push({m,on:false,ox:0,oz:0,ph:Math.random()*6,sp:.3+Math.random()*.3})}
let ffT=0,dom=0;const domShow=()=>{hDom.hidden=!(dom>0);hDomN.textContent=dom};
function fireflies(dt){const night=nightF>.6&&inPlay();
  if(!night){for(const f of FF)if(f.on){f.on=false;f.m.visible=false}return}
  ffT-=dt;if(ffT<=0){ffT=.6;const f=FF.find(q=>!q.on);if(f)for(let n=0;n<4;n++){const i=Math.round(player.x/TS)+((Math.random()*7)|0)-3,j=Math.round(player.z/TS)+((Math.random()*7)|0)-3;if(!onPath(i,j))continue;const c=ctr(i,j),x=c[0]+(Math.random()-.5)*.9,z=c[1]+(Math.random()-.5)*.9;
    if(Math.hypot(x-player.x,z-player.z)>1.2&&riverD(x,z)>RW+.2){f.on=true;f.ox=x;f.oz=z;f.m.visible=true;break}}}
  for(const f of FF){if(!f.on)continue;f.ph+=dt;const x=f.ox+Math.sin(f.ph*f.sp*2)*.45,z=f.oz+Math.cos(f.ph*f.sp*1.7)*.4;f.m.position.set(x,.14+.1*Math.sin(f.ph*1.3),z);f.m.scale.setScalar(.85+.25*Math.sin(f.ph*5));
    const d=Math.hypot(x-player.x,z-player.z);if(d>7){f.on=false;f.m.visible=false}
    else if(d<.3){f.on=false;f.m.visible=false;dom++;SAVE.stats.dom=(SAVE.stats.dom|0)+1;domShow();sfxO('pick');for(let q=0;q<5;q++)puff(x,.2,z,(Math.random()-.5)*.8,.5,(Math.random()-.5)*.8,.4);
      BUS.emit('pick',{kind:'domdom',x,z});toast('Bắt được đom đóm '+Math.min(dom,10)+'/10');if(dom>=10)stampOf('n_domdom');saveSoon()}}}
const paid=new Set();/* tem thưởng chợ đêm đã nhận, giữ ngoài ô để nạp lại ô không nhận lần nữa */
function market(){const pi=Math.round(player.x/TS),pj=Math.round(player.z/TS),on=nightF>.6;
  for(let b=-2;b<=2;b++)for(let c=-2;c<=2;c++){const t=tiles.get((pi+c)+','+(pj+b));if(!t||!t.stalls.length)continue;
    for(const s of t.stalls){const lit=on&&t.p>.9;if(lit&&!s.den){const m=cardMesh('daydenlong');m.castShadow=false;m.position.set(s.x,.3,s.z+.05);m.rotation.x=0;t.grp.add(m);s.den=m}if(s.den)s.den.visible=lit;
      const sk=nightNo+':'+s.x.toFixed(2)+','+s.z.toFixed(2);if(lit&&inPlay()&&!paid.has(sk)&&Math.hypot(player.x-s.x,player.z-s.z)<1.1){paid.add(sk);stampOf('n_chodem');food++;hud();toast('Chợ đêm: chủ quán tặng một chiếc bánh');sfxO('pick')}}}}

/* ---------- 5. thời tiết, hạt bay theo vùng ---------- */
const WN=150,wPos=new Float32Array(WN*3),wCol=new Float32Array(WN*3),wS=[];for(let k=0;k<WN;k++)wS.push([Math.random(),Math.random(),Math.random(),Math.random()]);
const wGeo=new THREE.BufferGeometry();wGeo.setAttribute('position',new THREE.BufferAttribute(wPos,3));wGeo.setAttribute('color',new THREE.BufferAttribute(wCol,3));
const mkTex=f=>{const c=mk(32,32),x=c.getContext('2d');f(x);return new THREE.CanvasTexture(c)};
const tSoft=mkTex(x=>{const g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.5,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32)}),
  tLine=mkTex(x=>{const g=x.createLinearGradient(0,2,0,30);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,.9)');x.fillStyle=g;x.fillRect(15,2,2,28)});
const wMat=new THREE.PointsMaterial({size:.14,map:tSoft,vertexColors:true,transparent:true,opacity:.8,depthWrite:false,sizeAttenuation:true});
const wPts=new THREE.Points(wGeo,wMat);wPts.frustumCulled=false;wPts.visible=false;scene.add(wPts);
/* n: số hạt, sz: cỡ, fall: tốc độ rơi, wx/wz: gió, sw: độ lắc, H: bề cao, op: độ đậm */
const WX={dbsh:{n:70,sz:.12,col:['#e6c26a','#c9a24e','#9fae5a'],fall:.15,wx:.35,wz:.1,sw:.5,H:2.2,op:.75},tb:{n:100,sz:.24,col:['#e8eef2','#dfe7ee','#f4b6c2','#f6c9d0'],fall:.05,wx:.25,wz:.1,sw:.4,H:1.6,op:.55},
  ntb:{n:90,sz:.09,col:['#e8d6a8','#f2e6c4'],fall:.02,wx:1.6,wz:.2,sw:.3,H:1.6,op:.7},tn:{n:60,sz:.14,col:['#d9822b','#b8683a','#7a8f3a','#c9a24e'],fall:.6,wx:.3,wz:.1,sw:.8,H:3,op:.85},
  tnbRain:{n:150,sz:.34,col:['#cfe3f0'],fall:6,wx:.5,wz:0,sw:0,H:3.4,op:.55,line:1}};
let wCfg=null,rainK=0,rainOn=false;const cc=new THREE.Color();
function setCfg(c){if(c===wCfg)return;wCfg=c;if(!c){wPts.visible=false;return}wPts.visible=true;wMat.size=c.sz;wMat.map=c.line?tLine:tSoft;wGeo.setDrawRange(0,c.n);
  for(let k=0;k<WN;k++){cc.set(c.col[k%c.col.length]);wCol[k*3]=cc.r;wCol[k*3+1]=cc.g;wCol[k*3+2]=cc.b}wGeo.attributes.color.needsUpdate=true}
function weather(dt){const b=typeof lastBiome==='number'&&BIOME[lastBiome]?BIOME[lastBiome].id:'',cyc=time%90,want=b==='tnb'&&state==='play'&&cyc>55&&cyc<80;
  if(want!==rainOn){rainOn=want;BUS.emit('weather',{kind:want?'rain':'clear'})}
  rainK+=((want?1:0)-rainK)*Math.min(1,dt*.7);if(!want&&rainK<.01)rainK=0;
  setCfg(rainK>0?WX.tnbRain:state==='menu'?null:WX[b]||null);if(!wCfg)return;const c=wCfg,T=time,px=player.x,pz=player.z;
  wMat.opacity=c.op*(c.line?rainK:1-.55*nightF);if(rainK>0)hemi.intensity*=1-.1*rainK;
  for(let k=0;k<c.n;k++){const q=wS[k];let x=px+mod(q[0]*12+c.wx*T-px+6,12)-6,z=pz+mod(q[1]*9+c.wz*T-pz+4.5,9)-4.5;const y=mod(q[2]*c.H-c.fall*T,c.H);
    if(c.sw){x+=Math.sin(T*c.sw*(.6+q[3])+q[1]*6)*.3;z+=Math.cos(T*c.sw*.7+q[0]*6)*.2}wPos[k*3]=x;wPos[k*3+1]=y+.04;wPos[k*3+2]=z}
  wGeo.attributes.position.needsUpdate=true}

/* ---------- nút nhắc, phím E ---------- */
function setPrompt(t){if(t===promptKey)return;promptKey=t;act.hidden=!t;if(t)act.textContent=t}
function doAct(){if(!inPlay()||lockIn||downT>0)return;if(ride){dismount();return}if(cur){if(cur.a)mount(cur.a);else if(cur.f)startFerry(cur.f)}}
act.addEventListener('click',doAct);act.addEventListener('pointerdown',e=>e.stopPropagation());
addEventListener('keydown',e=>{if(e.code==='KeyE'&&!e.repeat)doAct()});

BUS.on('tick',dt=>{
  updAnimals(dt);
  if(ride){const a=ride.a;if(Math.hypot(a.hx-player.x,a.hz-player.z)>ride.R)dismount()}
  if(fer)stepFerry(dt);
  cur=null;
  if(ride)cur={txt:'Xuống '+(ride.a.kind==='voi'?'voi':'trâu')+(touch?'':' (E)')};
  else if(!fer){let bd=.45;const pi=Math.round(player.x/TS),pj=Math.round(player.z/TS);
    for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const t=tiles.get((pi+c)+','+(pj+b));if(!t||t.p<=.9)continue;for(const a of t.animals)if((a.kind==='trau'||a.kind==='voi')&&a.st==='idle'){const d=Math.hypot(player.x-a.x,player.z-a.z);if(d<bd){bd=d;cur={a,txt:'Cưỡi '+(a.kind==='voi'?'voi':'trâu')}}}}
    if(!cur)cur=ferryScan();if(cur&&!touch)cur.txt+=' (E)'}
  fireflies(dt);scanT-=dt;if(scanT<=0){scanT=.25;market()}});
BUS.on('frame',dt=>{
  if(ride){const a=ride.a,m=a.m;a.x=player.x;a.z=player.z;a.tf=player.dir;a.fx+=(a.tf-a.fx)*Math.min(1,dt*10);const bob=player.frame?Math.abs(Math.sin(player.ph*15.7))*.025:0;
    m.position.set(player.x,a.y0+deckY(player.x,player.z)+bob,player.z);m.scale.set(a.sc*a.fx,a.sc,a.sc);
    player.m.position.y+=ride.lift;player.m.position.z+=.05;player.m.scale.set(player.dir*.75,.75,.75)}
  if(fer){fer.f.bc.m.position.set(fer.bx,.042+Math.sin(time*4)*.02,fer.bz);if(fer.u>.1&&fer.u<.9)player.m.position.y+=.07}
  weather(dt);setPrompt(!modal&&state==='play'&&!lockIn&&cur?cur.txt:'')});
const clearAll=()=>{if(ride){scene.remove(ride.a.m);ride=null}rideK=0;fer=null;lockIn=false;player.m.scale.set(player.dir,1,1);for(const a of live.slice())reset(a);live.length=0};
BUS.on('hurt',dismount);BUS.on('over',dismount);BUS.on('restart',()=>{clearAll();dom=SAVE.stats.dom|0;domShow()});
BUS.on('night',d=>{if(d.night){nightNo++;paid.clear()}});
dom=(SAVE.stats&&SAVE.stats.dom)|0;domShow();
window.__life={live,ferries,FF,get ride(){return ride},get fer(){return fer},mount,dismount,doAct,WX};
})();

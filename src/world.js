'use strict';
/* ---- hình vẽ thay thế: nếu có assets/sprites/manifest.json thì dán tranh mới đè lên hình vẽ bằng code ---- */
function paintArt(n,im,glowIm){const s=SPR[n],d=s.def,x=s.px[0],y=s.px[1],W=s.px[2],H=s.px[3],t=mk(W,H),c=t.getContext('2d');c.drawImage(im,PAD,PAD,d.w,d.h);
  const o=edged(t,d),oc=o.getContext('2d');oc.globalCompositeOperation='source-atop';oc.fillStyle=oc.createPattern(grainCv,'repeat');oc.globalAlpha=.6;oc.fillRect(0,0,W,H);
  actx.clearRect(x,y,W,H);actx.drawImage(o,x,y);if(glowIm){ectx.fillStyle='#000';ectx.fillRect(x,y,W,H);ectx.drawImage(glowIm,x+PAD,y+PAD,d.w,d.h)}}
const loadImg=src=>new Promise(res=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);im.src=src});
(async function loadArt(){try{const r=await fetch('assets/sprites/manifest.json',{cache:'no-cache'});if(!r.ok)return;const mf=await r.json(),sp=mf.sprites||{};let n=0;
  await Promise.all(Object.keys(sp).filter(k=>SPR[k]).map(async k=>{const im=await loadImg('assets/sprites/'+sp[k].file);if(!im)return;const gl=sp[k].glow?await loadImg('assets/sprites/'+sp[k].glow):null;paintArt(k,im,gl);n++}));
  if(n){atlasTex.needsUpdate=true;glowTex.needsUpdate=true;for(const k in FOOT)delete FOOT[k];try{tiles.forEach(buildBlockers)}catch(e){}}}catch(e){}})();

/* ---- hitbox theo hình vẽ: cột nào của dải chân hình (cao .05..32) có giấy thì chặn ---- */
const FOOT={},FB_LO=.05,FB_HI=.32,NOFOOT=new Set(['lua','luavang']);
function footprint(n){if(FOOT[n])return FOOT[n];const s=SPR[n],d=s.def,[X,Y,W,H]=s.px,k=d.H/d.h,yb=Y+PAD+d.h,y0=Math.max(Y,yb-Math.round(FB_HI/k));let y1=yb-Math.round(FB_LO/k);if(y1<=y0)y1=y0+1;
  const h=y1-y0,p=actx.getImageData(X,y0,W,h).data,min=Math.max(2,h*.25),runs=[];let a=-1;
  for(let c=0;c<=W;c++){let count=0;if(c<W)for(let y=0;y<h;y++)if(p[(y*W+c)*4+3]>128)count++;if(c<W&&count>=min){if(a<0)a=c}else if(a>=0){const last=runs[runs.length-1];if(last&&a-last[1]-1<3)last[1]=c-1;else runs.push([a,c-1]);a=-1}}
  let f=runs.filter(q=>q[1]-q[0]+1>=3).map(q=>q.map(c=>(c+.5-W/2)*k));if(d.solid&&f.length)f=[[f[0][0],f[f.length-1][1]]];return FOOT[n]=f}
function cardBlk(c,out){const d=SPR[c.n].def,f=NOFOOT.has(c.n)?[]:footprint(c.n);
  if(!f.length){if(d.bw)for(let k=-1;k<=1;k++){const x=c.x+k*d.bw*c.sc*.8;out.push({ax:x,az:c.z,bx:x,bz:c.z,r:d.b})}else out.push({ax:c.x,az:c.z,bx:c.x,bz:c.z,r:d.b});return}
  const r=d.deep?d.deep/2+.05:.07,co=Math.cos(c.yaw),si=Math.sin(c.yaw),back=d.deep?d.deep/2:0;
  for(const [a,b] of f){const sh=Math.min(r,(b-a)/2),l=a+sh,h=b-sh;out.push({ax:c.x+co*l*c.sx-si*back,az:c.z-si*l*c.sx-co*back,bx:c.x+co*h*c.sx-si*back,bz:c.z-si*h*c.sx-co*back,r});
    if(c.cross)out.push({ax:c.x-si*l*c.sc,az:c.z-co*l*c.sc,bx:c.x-si*h*c.sc,bz:c.z-co*h*c.sc,r})}}
function buildBlockers(t){t.blockers=t.extra.slice();for(const c of t.src)if(!(c.card&&c.card.gone))cardBlk(c,t.blockers)}

/* ============================== thế giới vô tận ============================== */
const TS=2,RC=5.6,RR=2.05,RF=2.8,MAXD=.6;
/* BIOME, biomeAt: xem regions.js */
const mod=(a,n)=>((a%n)+n)%n;
/* ---- sông: các dải chéo song song, uốn nhẹ ---- */
const RW=.5,RSP=17;
function riverF(x,z){return (x*.866-z*.5)/RSP+.32+.07*Math.sin(z*.23+1.3)+.045*Math.sin(x*.17+z*.11)}
function riverInfo(x,z){const f=riverF(x,z),q=f-Math.floor(f)-.5;
  let gx=.866/RSP+.045*.17*Math.cos(x*.17+z*.11),gz=-.5/RSP+.07*.23*Math.cos(z*.23+1.3)+.045*.11*Math.cos(x*.17+z*.11);
  const g=Math.hypot(gx,gz),sg=q<0?-1:1;return {d:Math.abs(q)/g,nx:gx/g*sg,nz:gz/g*sg,s:sg}}
const riverD=(x,z)=>riverInfo(x,z).d;
const ctrMemo=new Map(),edgeVMemo=new Map();
const edgeH=(i,j)=>mod(j,4)===0||h2(i,j,21)<.09;        /* đường nối ô (i,j) với ô phía đông */
function ctr(i,j){const key=i+','+j;if(ctrMemo.has(key))return ctrMemo.get(key);const c=[i*TS+(h2(i,j,23)-.5)*1.05,j*TS+(h2(i,j,24)-.5)*1.05],r=riverInfo(c[0],c[1]);
  if(r.d<RW+.45){const k=RW+.45-r.d;c[0]+=r.nx*k;c[1]+=r.nz*k}ctrMemo.set(key,c);if(ctrMemo.size>40000)ctrMemo.clear();return c}
function edgeV(i,j){const key=i+','+j;if(edgeVMemo.has(key))return edgeVMemo.get(key);let ok=mod(i,5)===0||h2(i,j,22)<.09;
  if(ok){const a=ctr(i,j),b=ctr(i,j+1);for(let k=0;k<14;k++)if(riverD(lerp(a[0],b[0],k/13),lerp(a[1],b[1],k/13))<RW+.08){ok=false;break}}
  edgeVMemo.set(key,ok);if(edgeVMemo.size>40000)edgeVMemo.clear();return ok}
const onPath=(i,j)=>edgeH(i,j)||edgeH(i-1,j)||edgeV(i,j)||edgeV(i,j-1);
function segD(px,pz,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((px-a[0])*dx+(pz-a[1])*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(px-a[0]-dx*t,pz-a[1]-dz*t)}
function pathDist(x,z){const i=Math.round(x/TS),j=Math.round(z/TS);let d=1e9;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const ii=i+a,jj=j+b,c=ctr(ii,jj);if(edgeH(ii,jj))d=Math.min(d,segD(x,z,c,ctr(ii+1,jj)));if(edgeV(ii,jj))d=Math.min(d,segD(x,z,c,ctr(ii,jj+1)))}return d}
function wetSpan(a,b){let t0=-1,t1=0;for(let k=0;k<48;k++){const t=k/47;if(riverD(lerp(a[0],b[0],t),lerp(a[1],b[1],t))<RW+.04){if(t0<0)t0=t;t1=t}}return t0<0?null:{t0,t1}}
const BRIDGE=[{name:'Cầu ngói chợ Lương',n:'cau_ngoi',lift:.08,hw:.26,sp:1},{name:'Cầu khỉ dừa miền Tây',n:'cau_dua',lift:.38,hw:.16,sp:.7},
  {name:'Chùa Cầu Hội An',n:'chua_cau',lift:.26,hw:.26,sp:1},{name:'Cầu treo Tây Bắc',n:'cau_treo',lift:.22,hw:.24,sp:.85},
  {name:'Cầu treo Tây Nguyên',n:'cau_treo',lift:.22,hw:.24,sp:.85},{name:'Cầu sắt Bình Lợi',n:'cau_sat',lift:.2,hw:.26,sp:1}];

const tiles=new Map(),glowTiles=[],dogs=[],eaten=new Set(),litSet=new Set(),ferries=[],ANIMAL={ga:1,co:1,trau:1,vit:1,voi:1},STALLS={quan:1,xebanhmi:1,xehutieu:1};
const FOODS=[...new Set(BIOME.flatMap(b=>b.foods))];
const cornerCol=(ci,cj)=>{const c=new THREE.Color(0,0,0);for(let a=-1;a<=0;a++)for(let b=-1;b<=0;b++)c.add(BIOME[biomeAt(ci+a,cj+b)].lin);return c.multiplyScalar(.25*(.9+.2*h2(ci,cj,7)))};

function makeTile(i,j){
  const cx=i*TS,cz=j*TS,b=biomeAt(i,j),rnd=rng((h2(i,j,1)*4294967296)>>>0),key=i+','+j;
  const rD=riverD(cx,cz),near=rD<RW+1.5;
  const t={i,j,b,key,cards:[],blockers:[],src:[],extra:[],bridges:[],bob:[],p:0,target:0,wait:0,grp:new THREE.Group(),type:'open',dog:null,pick:null,lamp:null,halos:[],marks:[],animals:[],stalls:[],ferry:null,pond:null};
  const items=[],isPath=onPath(i,j),pc=ctr(i,j),dO=Math.hypot(i,j);
  /* nền giấy */
  const gg=new THREE.PlaneGeometry(TS,TS).rotateX(-HALF),col=new Float32Array(12);
  [[i,j],[i+1,j],[i,j+1],[i+1,j+1]].forEach((q,k)=>{const c=cornerCol(q[0],q[1]);col[k*3]=c.r;col[k*3+1]=c.g;col[k*3+2]=c.b});
  gg.setAttribute('color',new THREE.BufferAttribute(col,3));const gm=new THREE.Mesh(gg,groundMat);gm.position.set(cx,0,cz);gm.receiveShadow=true;t.grp.add(gm);t.gg=gg;
  const flat=(n,x,z,sx,sz,y,rot)=>{const m=new THREE.Mesh(flatGeo(n),flatMat);m.position.set(x,y,z);m.scale.set(sx,1,sz);m.rotation.y=rot||0;m.receiveShadow=true;t.grp.add(m);return m};
  let he=null;if(edgeH(i,j)){const e=he=ctr(i+1,j),dx=e[0]-pc[0],dz=e[1]-pc[1];flat('duong',(pc[0]+e[0])/2,(pc[1]+e[1])/2,Math.hypot(dx,dz)+.12,.58,.008,-Math.atan2(dz,dx))}
  if(edgeV(i,j)){const e=ctr(i,j+1),dx=e[0]-pc[0],dz=e[1]-pc[1];flat('duong',(pc[0]+e[0])/2,(pc[1]+e[1])/2,Math.hypot(dx,dz)+.12,.58,.009,-Math.atan2(dz,dx))}
  if(isPath)flat('duongtron',pc[0],pc[1],.78,.78,.011,rnd()*6);
  /* dựng thiệp */
  const card=(n,x,z,o)=>{o=o||{};const d=SPR[n].def,m=cardMesh(n);m.position.set(x,.012+t.cards.length*.0007,z);m.rotation.order='YXZ';m.rotation.y=o.yaw!==undefined?o.yaw:(rnd()-.5)*.24;
    const fl=o.flip!==undefined?o.flip:(d.bw?1:(rnd()<.5?-1:1)),sc=o.s||(.92+rnd()*.18);m.scale.set(sc*fl,sc,sc);m.rotation.x=-HALF;
    const c={m,delay:rnd()*MAXD,cross:null};if(d.cross){c.cross=cardMesh(n);c.cross.position.z=.002;m.add(c.cross)}
    t.grp.add(m);t.cards.push(c);if(LANDMARK[n])t.marks.push({id:LANDMARK[n],x,z});
    if(ANIMAL[n])t.animals.push(c.an={kind:n,c,m,t,x,z,hx:x,hz:z,sc,fx:fl,tf:fl,fw:1,fh:1,y0:m.position.y,st:'idle',tm:0,ph:0,cd:0,tg:null,det:false});if(STALLS[n])t.stalls.push({x,z,c,n,night:0,den:null});
    if(d.glow&&d.bw){const hm=new THREE.Mesh(haloGeo,haloMat);hm.position.set(x,.016,z+.46);hm.scale.set(d.bw*1.7,1,.62);hm.visible=false;t.grp.add(hm);t.halos.push(hm)}
    if(d.b&&o.block!==false)t.src.push({n,x,z,yaw:m.rotation.y,sx:sc*fl,sc,cross:!!d.cross,card:c});
    return c};
  if(he){const ws=wetSpan(pc,he);if(ws){const dx=he[0]-pc[0],dz=he[1]-pc[1],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len,type=BRIDGE[b],t0=clamp(ws.t0-.3/len,0,1),t1=clamp(ws.t1+.3/len,0,1),x0=pc[0]+dx*t0,z0=pc[1]+dz*t0,x1=pc[0]+dx*t1,z1=pc[1]+dz*t1;
      const B={x0,z0,x1,z1,ux,uz,len:len*(t1-t0),...type},mx=(x0+x1)/2,mz=(z0+z1)/2;let bx=-uz,bz=ux;if(bz>0){bx=-bx;bz=-bz}t.bridges.push(B);
      flat('vancau',mx,mz,B.len+.05,type.hw*2+.04,.02,-Math.atan2(uz,ux));const c=card(type.n,mx+bx*(type.hw+.02),mz+bz*(type.hw+.02),{yaw:-Math.atan2(uz,ux),flip:1,s:1,block:false});{const k=clamp((B.len+.7)/(SPR[type.n].def.H*SPR[type.n].def.w/SPR[type.n].def.h),.8,1.5);c.m.scale.set(k,k,k)}
      if(type.n==='chua_cau'){t.glowBr=[x0+bx*(type.hw+.02),z0+bz*(type.hw+.02),x1+bx*(type.hw+.02),z1+bz*(type.hw+.02)];for(const u of [.5]){const hm=new THREE.Mesh(haloGeo,haloMat);hm.position.set(lerp(x0,x1,u)-bx*.15,.02,lerp(z0,z1,u)-bz*.15);hm.scale.set(1.5,1,.45);hm.visible=false;t.grp.add(hm);t.halos.push(hm)}}}}
  const free=(x,z,d)=>{const r=d.r||.12;if(riverD(x,z)<RW+r+.06)return false;if(isPath){if(d.bw){for(let k=-1;k<=1;k++)if(pathDist(x+k*d.bw,z)<.44)return false}else if(pathDist(x,z)<r+.3)return false}
    for(const it of items)if(Math.hypot(x-it.x,z-it.z)<r+it.r+.04)return false;return true};
  const put=(n,o)=>{o=o||{};const d=SPR[n].def,sp=d.bw?.5:.8;for(let k=0;k<(o.tries||9);k++){const x=cx+(rnd()-.5)*2*sp,z=o.north&&k<6?cz-.1-rnd()*.7:cz+(rnd()-.5)*1.6;
      if(free(x,z,d)){items.push({x,z,r:d.r||.12});card(n,x,z,o);return {x,z}}}return null};
  const many=(n,f)=>{for(let k=0;k<n;k++)f()},pick=a=>a[(rnd()*a.length)|0];
  const trees=[['tre','tre','cau','chuoi'],['dua','cayxoai','chuoi','chuoi'],['cau','hoagiay','cau','bui'],['thong','dao','thong','che'],['thong','caphe_cay','dao','caphe_cay'],['cau','hoagiay','dua','bui']][b];
  const houseN=['nhangoi','nhala','nhapho','nhasan','nharong','nhaong'][b];
  const addDog=(x,z)=>{if(dO<2.6||t.dog)return;const m=cardMesh('cho_sit');m.position.set(x,.012,z);m.rotation.x=-.2;m.visible=false;scene.add(m);
    const bub=cardMesh('gau');bub.castShadow=false;bub.visible=false;scene.add(bub);
    t.dog={m,bub,tile:t,x,z,hx:x,hz:z,state:'sit',timer:0,cool:0,dir:1,ph:0,bark:0,speed:1.78+Math.min(.3,dO*.006),notice:1.45+Math.min(.5,dO*.01)};dogs.push(t.dog)};
  const doHouse=()=>{const h=put(houseN,{north:true,tries:14});if(!h)return false;
    if(b===4){put('congchieng');if(rnd()<.5)put(pick(trees));if(rnd()<.5)put('bui');if(rnd()<.16)put('voi');many(rnd()*2|0,()=>put('ga'))}
    else if(b===5){put('denduong');if(rnd()<.5)put(pick(trees));if(rnd()<.45)put('nhaong',{north:true,tries:10})}
    else{put('chum');put(pick(trees));if(rnd()<.5)put(b===0?'rom':'bui');many(1+(rnd()*2|0),()=>put('ga'))}
    if(rnd()<(b===2||b===5?.25:Math.min(.8,.5+dO*.01))){const x=h.x+(rnd()-.5)*.7,z=h.z+.34;if(riverD(x,z)>RW+.2&&(!isPath||pathDist(x,z)>.3)){items.push({x,z,r:.14});addDog(x,z)}}return true};
  const doPaddy=()=>{t.type='paddy';const gold=rnd()<.3;flat(b===3?'bacthang':gold?'ruongvang':'ruong',cx,cz,1.88,1.88,.004,(rnd()*4|0)*HALF);
    if(b!==3)for(let r=0;r<4;r++)card(gold?'luavang':'lua',cx+(rnd()-.5)*.3,cz-.66+r*.42,{yaw:0,s:1.15});else many(3,()=>put('che'));
    if(rnd()<.22)put('trau');if(rnd()<.4)many(1+(rnd()*2|0),()=>put('co'));if(rnd()<.14)put('bunhin')};
  const doPond=()=>{t.pond={x:cx,z:cz};flat('ao',cx,cz,1.86,1.86,.004,(rnd()*4|0)*HALF);t.extra.push({ax:cx,az:cz,bx:cx,bz:cz,r:.68});items.push({x:cx,z:cz,r:.78});
    many(3,()=>card('sen',cx+(rnd()-.5)*.8,cz+(rnd()-.5)*.7,{}));if(b===1&&rnd()<.6)card('xuong',cx+.1,cz+.25,{});if(b===1)many(2+(rnd()*2|0),()=>put('vit'));if(rnd()<.5)card('co',cx-.3,cz-.1,{});many(3,()=>put('lau'));put(pick(trees))};
  const doGrove=()=>{many(3+(rnd()*3|0),()=>put(pick(trees)));many(2,()=>put('bui'));if(rnd()<.4)put('datang')};
  const doSide=()=>{many(1+(rnd()*2|0),()=>put(pick(trees)));many(1+(rnd()*2|0),()=>put(b===2?'hoagiay':'bui'));many(2,()=>put('lau'));if(rnd()<.2)put('datang')};
  const doStall=()=>{put(rnd()<.5?'quan':'xebanhmi',{north:true,flip:1,yaw:0});doSide()};
  const doBank=()=>{many(2+(rnd()*3|0),()=>put('lau'));many(1+(rnd()*2|0),()=>put(pick(trees)));if(rnd()<.5)put('bui');
    const afloat=n=>{for(let k=0;k<12;k++){const x=cx+(rnd()-.5)*TS,z=cz+(rnd()-.5)*TS;if(riverD(x,z)>=RW-.15||bridgeHere(x,z))continue;const c=card(n,x,z,{block:false,flip:rnd()<.5?1:-1,yaw:(rnd()-.5)*.3});if(n==='thuyen'||n==='ghe'||n==='thuyenthung')t.bob.push({m:c.m,ph:rnd()*TAU});break}};
    const bridgeHere=(x,z)=>t.bridges.some(B=>{const dx=x-B.x0,dz=z-B.z0,u=(dx*B.ux+dz*B.uz)/B.len;return u>=-.2&&u<=1.2&&Math.abs(-dx*B.uz+dz*B.ux)<B.hw+1.1});many(1+(rnd()*2|0),()=>afloat('lucbinh'));if(b===1){if(rnd()<.5)afloat('ghe');if(rnd()<.2)afloat('thuyen')}else if(b===2){if(rnd()<.45)afloat('thuyenthung')}else if(rnd()<.35)afloat('thuyen')};
  /* Tây Nguyên: rẫy cà phê, Đông Nam Bộ: vườn cao su, phố nhà ống, miền Tây: vườn xoài */
  const doCoffee=()=>{flat('ray_caphe',cx,cz,1.88,1.88,.004,(rnd()*4|0)*HALF);t.marks.push({id:'caphe_ray',x:cx,z:cz});
    for(let rw=0;rw<2;rw++)for(let k=0;k<3;k++){const x=cx+(k-1)*.58+(rnd()-.5)*.1,z=cz+(rw?.38:-.42)+(rnd()-.5)*.1;if(riverD(x,z)>RW+.2){items.push({x,z,r:.2});card('caphe_cay',x,z,{yaw:0})}}
    if(rnd()<.3)put('thong')};
  const doRubber=()=>{const d=SPR.cay_caosu.def;for(let rw=0;rw<2;rw++)for(let k=0;k<4;k++){const x=cx+(k-1.5)*.5+(rnd()-.5)*.06,z=cz+(rw?.52:-.5)+(rnd()-.5)*.06;if(free(x,z,d)){items.push({x,z,r:.2});card('cay_caosu',x,z,{yaw:0})}}};
  const doStreet=()=>{put('nhaong',{north:true,tries:14});if(rnd()<.6)put('nhaong',{north:true,tries:14});put('denduong');if(rnd()<.35)put(pick(['xehutieu','xebanhmi','quan']),{flip:1,yaw:0});if(rnd()<.4)put('bui')};
  const doStall5=()=>{put(pick(['xehutieu','xehutieu','quan','xebanhmi']),{north:true,flip:1,yaw:0});put('denduong');doSide()};
  const doOrchard=()=>{many(2,()=>put('cayxoai'));put('chuoi');put('bui');if(rnd()<.3)put('lau')};
  const r=rnd();
  if(b===2)flat('san',cx,cz,2.12,2.12,.003,0);
  if(b===5&&(isPath||near||r<.6))flat('duong_nhua',cx,cz,2.12,2.12,.003,0);
  if(i===0&&j===0){put('cotmoc');put('bui');put('lau')}
  else if(isPath){
    if(near)doBank();else if(b===0){r<.26?doHouse()||doSide():r<.31?(put('conglang',{north:true,tries:14}),doSide()):r<.38?(put('da'),put('gieng'),put('quan',{flip:1,yaw:0})):r<.43?(put('dinh',{north:true,tries:14}),put('cau'),put('bui')):(doSide(),rnd()<.25&&put('rom'))}
    else if(b===1){r<.28?doHouse()||doSide():r<.38?doStall():r<.52?doOrchard():doSide()}
    else if(b===2){r<.6?(doHouse(),put('hoagiay')):r<.76?doStall():doSide();if(rnd()<.08)put('thapcham',{north:true,tries:14});if(rnd()<.2)put('dua');if(rnd()<.14)put('xuongrong')}
    else if(b===4){r<.3?doHouse()||doSide():r<.42?(many(2,()=>put('datang')),put('thong')):r<.56?(many(3,()=>put('caphe_cay')),put('thong')):doSide();if(rnd()<.05)put('voi')}
    else if(b===5){r<.5?doHouse()||doStreet():r<.62?(put('caooc',{north:true,tries:14}),put('denduong')):r<.8?doStall5():doStreet()}
    else{r<.22?doHouse()||doSide():r<.34?(many(3,()=>put('datang')),put('thong')):doSide()}
    if(rnd()<.14)put('cotdien');if(rnd()<.1)put('cotmoc');
  }else{
    if(near)doBank();else if(b===0){r<.5?doPaddy():r<.62?doGrove():r<.72?doPond():r<.84?doHouse()||doGrove():(put('rom'),put('chuoi'),put('bui'),rnd()<.4&&put('trau'))}
    else if(b===1){r<.26?doPond():r<.44?doGrove():r<.6?doPaddy():r<.76?doOrchard():r<.9?doHouse()||doGrove():(put('chuoi'),put('lau'),put('bui'))}
    else if(b===2){r<.5?(doHouse(),put('hoagiay')):r<.75?(put('gieng'),doGrove()):r<.86?doPond():doStall();if(!near&&rnd()<.1)put('thapcham',{north:true,tries:14});if(rnd()<.2)put('dua');if(rnd()<.12)put('xuongrong')}
    else if(b===4){r<.28?doCoffee():r<.5?doGrove():r<.66?doHouse()||doGrove():r<.74?(put('voi'),doSide()):r<.86?(many(3,()=>put('datang')),put('thong')):doGrove()}
    else if(b===5){r<.3?doHouse()||doStreet():r<.4?(put('caooc',{north:true,tries:14}),put('denduong')):r<.5?doStall5():r<.6?doStreet():doRubber()}
    else{r<.42?doPaddy():r<.68?doGrove():r<.8?doHouse()||doGrove():r<.9?(many(4,()=>put('datang')),put('dao')):doPond()}
  }
  /* cột đèn lồng và món ăn nằm dọc đường mòn */
  if(isPath){
    if((i===0&&j===0)||rnd()<(b===2?.4:.2)){const a0=rnd()*TAU;for(let k=0;k<8;k++){const a=a0+k*TAU/8,x=pc[0]+Math.cos(a)*.56,z=pc[1]+Math.sin(a)*.5,d=SPR.denlong_off.def;
        if(free(x,z,d)&&pathDist(x,z)>.36){items.push({x,z,r:.13});const lit=litSet.has(key),c=card(lit?'denlong_on':'denlong_off',x,z,{flip:1,yaw:0,s:1});t.lamp={c,x,z,lit,halo:null};if(lit)addHalo(t);break}}}
    if(!(i===0&&j===0)&&rnd()<.45&&!eaten.has(key)){const kind=h2(i,j,41)<.55?'banhmi':pick(BIOME[b].foods),m=cardMesh(kind);m.position.set(pc[0]+(rnd()-.5)*.2,.1,pc[1]+(rnd()-.5)*.2);m.rotation.x=-.5;m.scale.setScalar(0);t.grp.add(m);t.pick={m,x:m.position.x,z:m.position.z,kind,ph:rnd()*6,at:tileAnimTime}}
  }
  /* bến đò: ô đường mòn sát sông mà không có cầu thì đôi khi có thuyền đợi khách, bấm E để sang bờ bên kia */
  if(isPath&&near&&!t.bridges.length&&!(i===0&&j===0)&&h2(i,j,77)<.2&&!bridgeNear(i,j))for(const k of [0,1,-1,2,-2]){const q0=riverInfo(pc[0],pc[1]),qx=pc[0]-q0.nz*k*.4,qz=pc[1]+q0.nx*k*.4,q=riverInfo(qx,qz),dd=q.d-RW;if(dd<-.1||dd>1.4)continue;
    const ex=qx-q.nx*dd,ez=qz-q.nz*dd,sx=ex+q.nx*.45,sz=ez+q.nz*.45,bx=ex-q.nx*.3,bz=ez-q.nz*.3;
    if(Math.abs(sx-cx)>TS*.55||Math.abs(sz-cz)>TS*.55||riverD(sx,sz)<RW+.3||items.some(it=>Math.hypot(sx-it.x,sz-it.z)<it.r+.3))continue;
    let tx=-q.nz,tz=q.nx;if(tx<0){tx=-tx;tz=-tz}const ya=-Math.atan2(tz,tx),bc=card(b===1?'ghe':'thuyen',bx,bz,{block:false,flip:1,yaw:0,s:1}),jc=card('bendo',ex+q.nx*.12,ez+q.nz*.12,{block:false,flip:1,yaw:0,s:1});
    t.bob.push({m:bc.m,ph:rnd()*TAU});items.push({x:sx,z:sz,r:.2});t.ferry={t,bc,jc,sx,sz,bx,bz,dx:-q.nx,dz:-q.nz,far:null};ferries.push(t.ferry);break}
  buildBlockers(t);scene.add(t.grp);tiles.set(key,t);if(t.glowBr)glowTiles.push(t);return t;
}
/* có cầu trong vòng 2 ô ngang, 1 ô dọc thì không đặt bến đò (cầu nằm trên hàng j chia hết cho 4, nên bến đò rơi vào hàng giữa) */
function bridgeNear(i,j){for(let a=-2;a<=2;a++)for(let b=-1;b<=1;b++)if(edgeH(i+a,j+b)&&wetSpan(ctr(i+a,j+b),ctr(i+a+1,j+b)))return true;return false}
function addHalo(t){if(t.lamp.halo)return;const m=new THREE.Mesh(haloGeo,haloMat);m.position.set(t.lamp.x+.1,.02,t.lamp.z+.1);t.grp.add(m);t.lamp.halo=m;t.halos.push(m);m.visible=t.p>.6}
function dropTile(t){scene.remove(t.grp);t.gg.dispose();if(t.dog){scene.remove(t.dog.m,t.dog.bub);const idx=dogs.indexOf(t.dog);if(idx>=0){dogs.copyWithin(idx,idx+1);dogs.pop()}}
  if(t.glowBr){const idx=glowTiles.indexOf(t);if(idx>=0){glowTiles.copyWithin(idx,idx+1);glowTiles.pop()}}tiles.delete(t.key);if(!tiles.size){tileScanI=tileScanJ=NaN;tileScanPending=false;tileAnimTime=0}}
function fold(t){const up=t.target===1;for(let idx=0;idx<t.cards.length;idx++){const c=t.cards[idx],q=clamp(t.p*(1+MAXD)-c.delay,0,1),e=up?backOut(q):smooth(q);c.m.rotation.x=-HALF*(1-e);if(c.cross)c.cross.rotation.y=HALF*smooth(q*2-1)}for(let idx=0;idx<t.halos.length;idx++)t.halos[idx].visible=t.p>.6}
let firstFill=true,heading=[0,-1],tileScanI=NaN,tileScanJ=NaN,tileScanPending=false,tileAnimTime=0;
const tileFrame={px:0,pz:0,rx:0,rz:0,dt:0};
function updateTile(t){const {px,pz,rx,rz,dt}=tileFrame,dp=Math.hypot(t.i-px,t.j-pz);if(dp>RC+1.3){dropTile(t);return}
  if(t.target===0){const d=Math.hypot(t.i-rx,t.j-rz);if(d<RR||dp<1.2){t.target=1;t.wait=firstFill?.25+d*.16:.05+Math.random()*.12}}
  else if(t.target===1&&dp>1.6&&Math.hypot(t.i-rx,t.j-rz)>RF){t.target=0;t.wait=Math.random()*.15}
  if(t.wait>0)t.wait-=dt;else if(t.p!==t.target){if(t.p===0&&t.cards.length)sfx.rustle();t.p=clamp(t.p+(t.target?dt/.9:-dt/.55),0,1);fold(t)}
  const pk=t.pick;if(pk){const k=t.p>.9?1:0,s=pk.m.scale.x;if(k||s){if(s!==k)pk.m.scale.setScalar(clamp(s+(k?1:-1)*dt*5,0,1));pk.ph+=tileAnimTime-pk.at;pk.at=tileAnimTime;pk.m.position.y=.1+Math.sin(pk.ph*2.2)*.03;pk.m.rotation.z=Math.sin(pk.ph*1.6)*.2}}
  if(t.p>.9)for(let idx=0;idx<t.bob.length;idx++){const b=t.bob[idx];b.m.position.y=.012+Math.sin(time*1.3+b.ph)*.012}
}
function updateTiles(dt){
  const px=player.x/TS,pz=player.z/TS,pi=Math.round(px),pj=Math.round(pz);
  if(firstFill||pi!==tileScanI||pj!==tileScanJ||tileScanPending){tileScanI=pi;tileScanJ=pj;tileScanPending=false;let budget=firstFill?999:4;
    scan:for(let dj=-6;dj<=6;dj++)for(let di=-6;di<=6;di++)if(di*di+dj*dj<=RC*RC&&!tiles.has((pi+di)+','+(pj+dj))){if(!budget){tileScanPending=true;break scan}makeTile(pi+di,pj+dj);budget--}}
  tileFrame.px=px;tileFrame.pz=pz;tileFrame.rx=px+heading[0]*.7;tileFrame.rz=pz-.2+heading[1]*.7;tileFrame.dt=dt;tileAnimTime+=dt;
  tiles.forEach(updateTile);firstFill=false;
}
function blockersNear(x,z,f){const i=Math.round(x/TS),j=Math.round(z/TS);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const t=tiles.get((i+a)+','+(j+b));if(t&&t.p>.4)for(const k of t.blockers)f(k)}}
function bridgeAt(x,z,pad){const i=Math.round(x/TS),j=Math.round(z/TS);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const t=tiles.get((i+a)+','+(j+b));if(t)for(const B of t.bridges){const dx=x-B.x0,dz=z-B.z0,u=(dx*B.ux+dz*B.uz)/B.len,s=-dx*B.uz+dz*B.ux;if(u>=0&&u<=1&&Math.abs(s)<=B.hw+pad)return {B,u,s}}}return null}
function deckY(x,z){const br=bridgeAt(x,z,.06);if(!br)return 0;const {B,u}=br;return B.lift*smooth(clamp(u/.2,0,1))*smooth(clamp((1-u)/.2,0,1))*(B.n==='cau_treo'?1-.3*Math.sin(Math.PI*u):1)}
function pushOut(o,rad,k){const dx=k.bx-k.ax,dz=k.bz-k.az,L=dx*dx+dz*dz,t=L>1e-8?clamp(((o.x-k.ax)*dx+(o.z-k.az)*dz)/L,0,1):0,px=k.ax+dx*t,pz=k.az+dz*t,ex=o.x-px,ez=o.z-pz,d=Math.hypot(ex,ez),m=k.r+rad;
  if(d>=m)return;if(d>1e-4){o.x=px+ex/d*m;o.z=pz+ez/d*m}else{const l=Math.sqrt(L)||1;let nx=-dz/l,nz=dx/l;if(!L){nx=0;nz=1}if(nz<0){nx=-nx;nz=-nz}o.x=px+nx*m;o.z=pz+nz*m}}
function collide(o,rad){for(let it=0;it<2;it++)blockersNear(o.x,o.z,k=>pushOut(o,rad,k));
  const ri=riverInfo(o.x,o.z);if(ri.d<RW+rad){const br=bridgeAt(o.x,o.z,.1);if(br){const m=br.B.hw-rad*.6;if(Math.abs(br.s)>m){const k=Math.sign(br.s)*m-br.s;o.x+=-br.B.uz*k;o.z+=br.B.ux*k}}else{const k=RW+rad-ri.d;o.x+=ri.nx*k;o.z+=ri.nz*k}}}
const hitDbg=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:'#ff2d55',depthTest:false,transparent:true}));hitDbg.renderOrder=999;hitDbg.frustumCulled=false;hitDbg.visible=false;scene.add(hitDbg);
function updateHit(){if(!hitDbg.visible)return;const p=[],line=(ax,az,bx,bz)=>p.push(ax,.03,az,bx,.03,bz),circle=(x,z,r)=>{for(let k=0;k<10;k++){const a=k*TAU/10,b=(k+1)*TAU/10;line(x+Math.cos(a)*r,z+Math.sin(a)*r,x+Math.cos(b)*r,z+Math.sin(b)*r)}};
  blockersNear(player.x,player.z,k=>{const dx=k.bx-k.ax,dz=k.bz-k.az,L=Math.hypot(dx,dz),nx=L?-dz/L:0,nz=L?dx/L:1;line(k.ax,k.az,k.bx,k.bz);for(const s of [-1,1])line(k.ax+nx*k.r*s,k.az+nz*k.r*s,k.bx+nx*k.r*s,k.bz+nz*k.r*s);circle(k.ax,k.az,k.r);circle(k.bx,k.bz,k.r)});
  circle(player.x,player.z,.1);hitDbg.geometry.dispose();hitDbg.geometry=new THREE.BufferGeometry();hitDbg.geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3))}
const tileAt=(x,z)=>tiles.get(Math.round(x/TS)+','+Math.round(z/TS));

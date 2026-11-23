'use strict';
/* ============================== nhân vật ============================== */
const player={x:0,z:0,vx:0,vz:0,dir:1,stam:100,tired:false,ph:0,frame:0,m:cardMesh('k_idle'),fall:0};
scene.add(player.m);player.m.rotation.order='YXZ';
const kGeo=[cardGeo('k_idle'),cardGeo('k_w1'),cardGeo('k_w2')],dGeo=[cardGeo('cho_sit'),cardGeo('cho_run1'),cardGeo('cho_run2')];
let state='menu',dist=0,food=0,foodAll=0,lamps=0,time=0,clock=18,cause='';
const treats=[];
const bike={on:false,m:cardMesh('xm_side'),bub:cardMesh('bip'),pts:[],seg:0,t:0,x:0,z:0,speed:4,next:16,honk:0};
bike.m.visible=false;bike.bub.visible=false;bike.bub.castShadow=false;scene.add(bike.m,bike.bub);
const bGeo={side:cardGeo('xm_side'),front:cardGeo('xm_front'),back:cardGeo('xm_back')};
/* bụi giấy */
const puffs=[];for(let k=0;k<26;k++){const m=cardMesh('bui_khoi');m.castShadow=false;m.visible=false;scene.add(m);puffs.push({m,life:0,vx:0,vy:0,vz:0})}
let puffI=0;function puff(x,y,z,vx,vy,vz,life){const p=puffs[puffI=(puffI+1)%puffs.length];p.m.position.set(x,y,z);p.vx=vx;p.vy=vy;p.vz=vz;p.life=p.max=life||.6;p.m.visible=true}

/* ============================== điều khiển ============================== */
const keys=new Set();let ptr=null,runBtn=false;
/* nút, liên kết, ô nhập đang giữ phím thì để chúng tự xử lý Enter/Space */
const ownsKey=()=>{const a=document.activeElement;return !!(a&&a!==document.body&&/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(a.tagName))};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#topR button,#pad button,#actBtn');if(b&&e.detail>0)b.blur()});
addEventListener('keydown',e=>{if(e.repeat)return;keys.add(e.code);if(e.code==='Space'&&!ownsKey()){e.preventDefault();throwTreat()}
  if(e.code==='Enter'&&state!=='play'&&!ownsKey()){state==='menu'?begin():restart()}if(e.code==='KeyM')toggleSound();if(e.code==='KeyN')toggleNight();if(e.code==='KeyP')POST.on=!POST.on;if(e.code==='KeyH')hitDbg.visible=!hitDbg.visible});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();ptr=null});
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),hit=new THREE.Vector3();
function ground(e){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);return ray.ray.intersectPlane(plane,hit)?{x:hit.x,z:hit.z}:null}
canvas.addEventListener('pointerdown',e=>{if(state==='play'){ptr=ground(e);canvas.setPointerCapture(e.pointerId)}});
canvas.addEventListener('pointermove',e=>{if(ptr)ptr=ground(e)||ptr});
const up=()=>{ptr=null};canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
canvas.addEventListener('contextmenu',e=>e.preventDefault());
const hold=(el,fn)=>{el.addEventListener('pointerdown',e=>{e.preventDefault();fn(true)});['pointerup','pointercancel','pointerleave'].forEach(n=>el.addEventListener(n,()=>fn(false)))};
hold($('bRun'),v=>runBtn=v);$('bThrow').addEventListener('pointerdown',e=>{e.preventDefault();throwTreat()});

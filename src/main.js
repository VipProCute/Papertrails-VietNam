'use strict';
/* ============================== vòng lặp ============================== */
{const c=ctr(0,0);player.x=c[0];player.z=c[1];camT.set(c[0],0,c[1])}
let last=performance.now();
function step(dt){
  time+=dt;if(state==='play'&&!modal){clock+=dt;updatePlayer(dt);BUS.emit('tick',dt)}
  updateTiles(dt);
  const chasing=modal?false:state==='play'?updateDogs(dt):(dogs.forEach(d=>{d.m.visible=d.tile.p>.85;d.bub.visible=false}),false);
  const biking=modal?(engGain&&(engGain.gain.value=0),false):state!=='menu'?updateBike(dt):false;
  if(modal)warn('','');else if(state==='play'){if(chasing)warn(food+big>0?'Chó đuổi! Chạy đi, hoặc ném bánh mì (Space)':'Chó đuổi! Giữ Shift mà chạy','dog');else if(biking&&bike.on)warn('Bíp bíp! Xe máy tới từ '+bike.dirName+', tránh khỏi đường mòn','');else warn('','')}else warn('','');
  if(state==='over'){player.fall=Math.min(1,player.fall+dt*3.5);if(engGain&&!bike.on)engGain.gain.value=0}
  player.m.geometry=kGeo[state==='play'?player.frame:0];
  player.m.position.set(player.x,.012+deckY(player.x,player.z)+(player.frame?Math.abs(Math.sin(player.ph*15.7))*.025:0),player.z);
  player.m.scale.x=player.dir;player.m.rotation.x=-.2-player.fall*1.3;player.m.rotation.z=player.fall*.5*player.dir;
  for(const p of puffs)if(p.life>0){p.life-=dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;p.vy-=dt*.9;p.m.scale.setScalar(Math.max(.01,p.life/p.max));if(p.life<=0)p.m.visible=false}
  dayNight();updateCamera(dt);music(dt);updateHit();
  if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').classList.remove('on')}
  hud();BUS.emit('frame',dt);
}
let pfT=0,pfN=0;function perf(dt){if(document.hidden||dt>1){pfT=pfN=0;return}pfT+=dt;pfN++;if(pfT<2.5)return;const fps=pfN/pfT;pfT=pfN=0;if(fps>=27||POST.q>=3)return;POST.q++;
  if(POST.q===1){renderer.setPixelRatio(1);resize()}else if(POST.q===2){POST.on=false}else{renderer.shadowMap.enabled=false;sun.castShadow=false;cardMat.needsUpdate=groundMat.needsUpdate=flatMat.needsUpdate=true}}
function frame(now){const raw=(now-last)/1000,dt=Math.min(.05,raw);last=now;step(dt);draw();perf(raw);requestAnimationFrame(frame)}
updateTiles(0);hud();requestAnimationFrame(frame);
window.__g={player,tiles,dogs,bike,step,spawnBike,riverD,riverInfo,bridgeAt,deckY,water,get state(){return state},set clock(v){clock=v},begin,restart,render:()=>draw(),POST,toggleNight,SPR,ecv,acv,camera,addFood:n=>{food+=n},SAVE,BUS,awardStamp:id=>typeof awardStamp==='function'&&awardStamp(id),get mode(){return mode},set mode(v){setMode(v)},get shield(){return shield},set shield(v){shield=v},get big(){return big},get boostT(){return boostT},set boostT(v){boostT=v},get invT(){return invT},eatFood,hurt,tpTo,hit:()=>{hitDbg.visible=!hitDbg.visible}};

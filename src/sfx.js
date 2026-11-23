'use strict';
/* ============================== hiệu ứng mẫu (sample) + tiếng nền ============================== */
/* Tất cả đi qua master (nút tắt tiếng). Thiếu manifest/tệp/AudioContext thì trả false và giữ tiếng tổng hợp cũ. */
const SX={man:null,ask:false,b:{},loops:{},ambBus:null,last:{},tm:0,rain:false,reg:'',eng:null,engOff:false,nx:{rooster:0,bark:0,moo:0},dawn:0};
const SX_DIR='assets/audio/sfx/';
function sxInit(){if(SX.ask||!AC)return;SX.ask=true;SX.ambBus=AC.createGain();SX.ambBus.gain.value=.18;SX.ambBus.connect(master);
  if(location.protocol==='file:'){SX.man={};return}
  try{fetch(SX_DIR+'manifest.json').then(r=>r.ok?r.json():null).then(j=>{SX.man=(j&&j.sounds)||{};['step_dirt','step_grass','step_wood','pickup','dog_bark','horn','paper'].forEach(sxBufs)}).catch(()=>{SX.man={}})}catch(e){SX.man={}}}
const sxHas=n=>!!(SX.man&&SX.man[n]&&SX.man[n].length);
/* nạp lười mọi biến thể của một âm; trả mảng buffer đã giải mã (null khi chưa có) */
function sxBufs(n){if(!AC||!SX.man)return null;const f=SX.man[n];if(!f||!f.length)return null;let e=SX.b[n];
  if(!e){e=SX.b[n]={list:[]};f.forEach(fn=>loadBuf(SX_DIR+fn,b=>{if(b)e.list.push(b)}))}return e.list.length?e.list:null}
function playSfx(n,o){o=o||{};if(!soundOn)return true;const bs=sxBufs(n);if(!bs)return false;
  let vol=o.vol==null?1:o.vol,pan=o.pan||0;
  if(o.at&&typeof player!=='undefined'){const dx=o.at.x-player.x,dz=o.at.z-player.z,d=Math.hypot(dx,dz);if(d>=9)return true;const k=1-d/9;vol*=k*k;pan=clamp(dx/9,-1,1)*.6}
  let i=(Math.random()*bs.length)|0;if(bs.length>1&&i===SX.last[n])i=(i+1)%bs.length;SX.last[n]=i;
  try{const t=AC.currentTime+(o.delay||0),s=AC.createBufferSource(),g=AC.createGain();s.buffer=bs[i];s.playbackRate.value=(o.rate||1)*(.94+Math.random()*.12);g.gain.value=vol;s.connect(g);
    if(pan&&AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=pan;g.connect(p);p.connect(master)}else g.connect(master);s.start(t)}catch(e){return false}return true}
/* vòng lặp nền: nối liền (loop buffer), vào 1 s */
function loopSfx(n,vol){if(!soundOn)return false;const L=SX.loops[n]||(SX.loops[n]={src:null,g:null,vol:0});L.vol=vol;if(L.src||!(vol>.003)||!SX.ambBus)return !!L.src;
  const bs=sxBufs(n);if(!bs)return false;try{const s=AC.createBufferSource(),g=AC.createGain(),t=AC.currentTime;s.buffer=bs[0];s.loop=true;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+1);s.connect(g);g.connect(SX.ambBus);s.start(t,Math.random()*bs[0].duration);L.src=s;L.g=g}catch(e){return false}return true}
function setLoopVol(n,vol,fade){const L=SX.loops[n];if(!L||!L.src){if(vol>.003)loopSfx(n,vol);return}L.vol=vol;const t=AC.currentTime,f=fade==null?1:fade,g=L.g.gain;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(vol,t+f);
  if(vol<=.003)setTimeout(()=>{if(L.vol<=.003&&L.src){try{L.src.stop()}catch(e){}L.src=null;L.g=null}},f*1000+150)}
/* tiếng cũ: thử mẫu trước, không có thì tổng hợp */
const SX0={rustle:sfx.rustle,pick:sfx.pick,lamp:sfx.lamp,bark:sfx.bark,horn:sfx.horn};
sfx.rustle=function(){if(!AC||AC.currentTime-lastRustle<.09)return;lastRustle=AC.currentTime;if(!playSfx('paper',{vol:.1}))hiss(.16,.05,2600+Math.random()*2200)};
sfx.pick=function(){if(!playSfx('pickup',{vol:.7}))SX0.pick()};
sfx.lamp=function(){if(!playSfx('chime',{vol:.6}))SX0.lamp()};
sfx.bark=function(){if(!playSfx('dog_bark',{vol:.7}))SX0.bark()};
sfx.horn=function(){if(!playSfx('horn',{vol:.6}))SX0.horn()};
/* bus: pick và lamp đã gọi trực tiếp sfx.pick/lamp nên không nghe lại ở đây (tránh kêu đôi) */
BUS.on('step',e=>{if(!AC||!soundOn)return;if(!playSfx('step_'+e.surface,{vol:.22}))hiss(.05,.018,1700+Math.random()*900)});
BUS.on('stamp',()=>{if(playSfx('stamp',{vol:.8}))playSfx('success',{vol:.7,delay:.4});else try{tone(784,.18,'triangle',.14);tone(1175,.4,'sine',.12,0,.12)}catch(e){}});
function sxAnimal(k){k=String(k||'').toLowerCase();return /voi|eleph/.test(k)?'elephant':/vit|duck/.test(k)?'duck':/trau|bo$|moo|cow|buffalo/.test(k)?'moo':/ga|hen|chick/.test(k)?'hen':'flap'}
BUS.on('scare',e=>{playSfx(sxAnimal(e&&e.kind),{vol:.7})});
BUS.on('ride',e=>{if(e&&e.on)playSfx(sxAnimal(e.kind)==='elephant'?'elephant':'moo',{vol:.7})});
BUS.on('ferry',()=>{playSfx('oar',{vol:.6});playSfx('splash',{vol:.5,delay:.5})});
BUS.on('weather',e=>{const v=e&&(e.type||e.kind||e.state||e.weather||e.on);SX.rain=v===true||/rain|mua/i.test(String(v))});
BUS.on('visit',e=>{if(e.id==='dinh')playSfx('bell',{vol:.7});else if(e.id==='congchieng')playSfx('gong',{vol:.7})});
BUS.on('region',e=>{try{SX.reg=BIOME[e.b].amb}catch(x){}});
BUS.on('night',e=>{if(e&&!e.night)SX.dawn=1.5+Math.random()*2});
/* trộn tiếng nền, tối đa 2 lần/giây */
const SXT={};
function sxMix(dt){const nf=typeof nightF==='number'?nightF:0,day=1-nf,r=SX.reg,play=state==='play';
  SXT.amb_birds=play?.8*day:0;SXT.amb_crickets=play?.8*nf:0;SXT.amb_frogs=play&&(r==='fields'||r==='river')?.7*nf:0;
  let rv=0;if(play&&typeof riverD==='function'&&typeof player!=='undefined'){const d=riverD(player.x,player.z);if(d<2.5)rv=(1-d/2.5)*.9}SXT.amb_river=rv;
  SXT.amb_waves=play&&r==='coast'?.8:0;SXT.amb_wind=play&&r==='mountain'?.8:0;
  const cs=sxHas('amb_city')?'amb_city':'amb_market';SXT.amb_city=SXT.amb_market=0;SXT[cs]=play&&r==='city'?.8:0;SXT.amb_rain=play&&SX.rain?.9:0;
  for(const n in SXT)if(SX.loops[n]&&SX.loops[n].src)setLoopVol(n,SXT[n],1.5);else if(SXT[n]>.01)loopSfx(n,SXT[n]);
  if(!play)return;
  if(SX.dawn>0){SX.dawn-=dt;if(SX.dawn<=0)playSfx('rooster',{vol:.5})}
  if(nf>.7){SX.nx.bark-=dt;if(SX.nx.bark<=0){SX.nx.bark=12+Math.random()*18;playSfx('dog_bark',{vol:.18,rate:.9})}}
  if(day>.8&&r==='fields'){SX.nx.moo-=dt;if(SX.nx.moo<=0){SX.nx.moo=30+Math.random()*40;playSfx('moo',{vol:.3})}}}
/* động cơ xe máy: nếu có mẫu 'engine' thì thay tiếng tổng hợp (âm lượng/độ cao lấy từ engGain/engOsc mà game.js đặt) */
function sxEngine(){if(!engGain||!engOsc||SX.engOff||!SX.man)return;const E=SX.eng;
  if(!E){if(engGain.gain.value<.002)return;const bs=sxBufs('engine');if(!bs){if(!sxHas('engine'))SX.engOff=true;return}
    try{const s=AC.createBufferSource(),g=AC.createGain();s.buffer=bs[0];s.loop=true;g.gain.value=0;s.connect(g);g.connect(master);s.start();SX.eng={s,g};engGain.disconnect()}catch(e){SX.engOff=true}return}
  const t=AC.currentTime;E.g.gain.setTargetAtTime(clamp(engGain.gain.value/.16,0,1)*.6,t,.05);E.s.playbackRate.setTargetAtTime(clamp(engOsc.frequency.value/88,.7,1.6),t,.05)}
BUS.on('frame',dt=>{if(!AC||!soundOn)return;if(!SX.ask)sxInit();if(!SX.man)return;try{sxEngine()}catch(e){}
  SX.tm+=dt;if(SX.tm>=.5){const d=SX.tm;SX.tm=0;try{sxMix(d)}catch(e){}}});
window.__sfx={SX,playSfx,loopSfx,setLoopVol,sxBufs,sxMix,sxAnimal};

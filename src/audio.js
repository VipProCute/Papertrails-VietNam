'use strict';
/* ============================== âm thanh ============================== */
let AC=null,master=null,soundOn=true,engGain=null,engOsc=null,noiseBuf=null,lastRustle=0,musicT=0;
function initAudio(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=soundOn?.55:0;master.connect(AC.destination);
  noiseBuf=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  engOsc=AC.createOscillator();engOsc.type='sawtooth';engOsc.frequency.value=80;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=520;engGain=AC.createGain();engGain.gain.value=0;engOsc.connect(f);f.connect(engGain);engGain.connect(master);engOsc.start();if(!soundOn)AC.suspend()}catch(e){AC=null}}
function tone(f,dur,type,vol,f2,when){if(!AC||!soundOn)return;const t=AC.currentTime+(when||0),o=AC.createOscillator(),gn=AC.createGain();o.type=type||'triangle';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(vol||.2,t+.012);gn.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(gn);gn.connect(master);o.start(t);o.stop(t+dur+.05)}
function hiss(dur,vol,freq,when){if(!AC||!soundOn)return;const t=AC.currentTime+(when||0),s=AC.createBufferSource(),f=AC.createBiquadFilter(),gn=AC.createGain();s.buffer=noiseBuf;f.type='bandpass';f.frequency.value=freq;f.Q.value=.8;
  gn.gain.setValueAtTime(vol,t);gn.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(gn);gn.connect(master);s.start(t,Math.random()*.2,dur)}
const PENTA=[293.7,329.6,392,440,493.9,587.3,659.3,784];
const sfx={rustle(){if(!AC||AC.currentTime-lastRustle<.09)return;lastRustle=AC.currentTime;hiss(.16,.05,2600+Math.random()*2200)},
  pick(){tone(PENTA[3],.18,'triangle',.22);tone(PENTA[6],.3,'triangle',.2,0,.09)},lamp(){[2,4,5,7].forEach((n,k)=>tone(PENTA[n],.4,'sine',.16,0,k*.08))},
  bark(){for(let k=0;k<2;k++){tone(520,.11,'square',.16,240,k*.17);hiss(.09,.12,1200,k*.17)}},horn(){tone(466,.16,'square',.13,0,0);tone(466,.22,'square',.13,0,.22)},
  thr(){tone(600,.15,'sine',.12,250)},over(){[4,3,1,0].forEach((n,k)=>tone(PENTA[n]/2,.5,'triangle',.22,0,k*.2))}};
/* nhạc nền theo vùng: fetch + decodeAudioData, mỗi bài là chuỗi nguồn chồng nhau (hoà chuyển XF giây ở điểm lặp, không khe hở).
   Mỗi vùng có cặp <khoá>_day/_night.mp3; bài ngày/đêm chỉ nạp khi sắp cần (mỗi bài giải mã ra cỡ 60 MB), lỗi thì dùng day/night chung;
   giữ vùng đang đứng và 1 vùng vừa rời. Nhạc vùng to hơn bài chung ~3,5 dB nên nhân RGV. */
const XF=3,RXF=1.2,RGV=.67,TRK={},REGM={};let trkOn=false,musicBus=null,curReg='',regTm=0,chS={st:0,buf:null,src:null,g:null},chOn=false,chChk=0;
function loadBuf(url,cb){try{fetch(url).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(ab=>new Promise((ok,no)=>{const p=AC.decodeAudioData(ab,ok,no);if(p&&p.catch)p.catch(no)})).then(b=>cb(b),()=>cb(null)).catch(()=>{})}catch(e){cb(null)}}
function mkSlot(url,out,fb){const bus=AC.createGain();bus.gain.value=0;bus.connect(out);return{url,buf:null,st:0,v:null,bus,fb}}
function slotLoad(s){if(s.st)return;s.st=1;loadBuf(s.url,b=>{s.buf=b;s.st=b?2:3})}
function slotBuf(s){return s.buf||(s.st===3&&s.fb&&s.fb.buf)||null}
function slotVoice(s,buf,now,fade){const src=AC.createBufferSource(),g=AC.createGain();src.buffer=buf;g.gain.setValueAtTime(fade?0:1,now);if(fade)g.gain.linearRampToValueAtTime(1,now+XF);src.connect(g);g.connect(s.bus);
  const lp=buf.duration<=XF*2+1;src.loop=lp;src.start(now);return{src,g,t0:now,d:buf.duration,lp}}
function slotStop(s){if(s.v){try{s.v.src.stop()}catch(e){}try{s.v.src.disconnect()}catch(e){}s.v=null}}
function slotTick(s,on,now){const buf=slotBuf(s);if(!on||!buf){slotStop(s);return}
  if(!s.v){s.v=slotVoice(s,buf,now,false);return}const o=s.v;
  if(!o.lp&&now>=o.t0+o.d-XF-.05){s.v=slotVoice(s,buf,now,true);o.g.gain.cancelScheduledValues(now);o.g.gain.setValueAtTime(1,now);o.g.gain.linearRampToValueAtTime(0,now+XF);try{o.src.stop(now+XF+.15)}catch(e){}}}
function mkReg(key,gen){const rg=AC.createGain();rg.gain.value=0;rg.connect(musicBus);const p='assets/audio/'+(gen?'':key+'_'),g=TRK.gen;
  const r={key,rg,lv:0,last:AC.currentTime,day:mkSlot(p+'day.mp3',rg,gen?null:g&&g.day),night:mkSlot(p+'night.mp3',rg,gen?null:g&&g.night)};REGM[key]=r;if(gen){slotLoad(r.day);slotLoad(r.night)}return r}
function dropReg(r){slotStop(r.day);slotStop(r.night);r.day.buf=r.night.buf=null;try{r.rg.disconnect()}catch(e){}delete REGM[r.key]}
function initTracks(){if(trkOn||!AC||location.protocol==='file:')return;trkOn=true;try{musicBus=AC.createGain();musicBus.connect(master);
  const g=mkReg('gen',true);TRK.gen=g;TRK.day=g.day;TRK.night=g.night;chS.g=AC.createGain();chS.g.gain.value=0;chS.g.connect(master)}catch(e){trkOn=false}}
BUS.on('region',e=>{try{const k=BIOME[e.b].music;if(k)curReg=k}catch(x){}});
/* đoạn chó đuổi: nạp lười chase.mp3, vào 0.5 s, nhạc vùng hạ còn 35%, ra 1.5 s; thiếu tệp thì bỏ qua */
function chaseTick(now){if(now-chChk>=.25){chChk=now;let on=false;if(state==='play'&&typeof dogs!=='undefined')for(const d of dogs)if(d.state==='chase'){on=true;break}chOn=on}
  if(chOn&&!chS.st){chS.st=1;loadBuf('assets/audio/chase.mp3',b=>{chS.buf=b;chS.st=b?2:3})}
  const go=chOn&&chS.buf;musicBus.gain.setTargetAtTime(go?.35:1,now,go?.2:.6);
  if(go&&!chS.src){const s=AC.createBufferSource();s.buffer=chS.buf;s.loop=true;s.connect(chS.g);s.start(now);chS.src=s;const g=chS.g.gain;g.cancelScheduledValues(now);g.setValueAtTime(g.value,now);g.linearRampToValueAtTime(.47,now+.5)}
  else if(!go&&chS.src){const s=chS.src;chS.src=null;const g=chS.g.gain;g.cancelScheduledValues(now);g.setValueAtTime(g.value,now);g.linearRampToValueAtTime(0,now+1.5);try{s.stop(now+1.7)}catch(e){}}}
function tracks(){if(!trkOn)return false;const now=AC.currentTime,dt=Math.min(.25,Math.max(0,now-regTm));regTm=now;
  if(curReg&&!REGM[curReg]){let n=0,old=null;for(const k in REGM)if(k!=='gen'&&k!==curReg){n++;if(!old||REGM[k].last<old.last)old=REGM[k]}if(n>=2&&old)dropReg(old);mkReg(curReg,false)}
  const cr=REGM[curReg];if(cr){cr.last=now;if(nightF<.85)slotLoad(cr.day);if(nightF>.15)slotLoad(cr.night)}const useCur=!!(cr&&(cr.day.buf||cr.night.buf));let any=false;
  const lvl=state==='over'?.25:.5,kk=1-Math.exp(-dt/RXF);
  for(const k in REGM){const r=REGM[k],want=(k===curReg&&useCur)||(k==='gen'&&!useCur)?1:0;r.lv+=(want-r.lv)*kk;if(!want&&r.lv<.01)r.lv=0;r.rg.gain.value=r.lv;const run=r.lv>0;
    slotTick(r.day,run,now);slotTick(r.night,run,now);if(slotBuf(r.day)||slotBuf(r.night))any=true;
    if(run){r.day.bus.gain.setTargetAtTime((1-nightF)*lvl*(r.day.buf&&k!=='gen'?RGV:1),now,.8);r.night.bus.gain.setTargetAtTime(nightF*lvl*(r.night.buf&&k!=='gen'?RGV:1),now,.8)}}
  try{chaseTick(now)}catch(e){}return any}
function music(dt){if(!AC||!soundOn||state==='menu')return;if(tracks())return;if(state!=='play')return;musicT-=dt;if(musicT<=0){musicT=.35+Math.random()*1.1;const n=PENTA[(Math.random()*PENTA.length)|0];tone(n,1.3,'triangle',.05);if(Math.random()<.3)tone(n*1.5,1.1,'triangle',.03,0,.12)}}
function toggleSound(){soundOn=!soundOn;if(master)master.gain.value=soundOn?.55:0;try{if(AC)soundOn?AC.resume():AC.suspend()}catch(e){}$('bSound').textContent='Tiếng: '+(soundOn?'bật':'tắt');$('bSound').setAttribute('aria-pressed',soundOn)}
$('bSound').addEventListener('click',toggleSound);

'use strict';
/* ============================== lưu tiến độ (localStorage, một khoá) ============================== */
const SAVE_KEY='ptvn:v1'+(typeof SEED!=='undefined'&&SEED?':s'+SEED:'');
const saveDefaults=()=>({best:0,mode:'walk',stamps:{},regions:[],lamps:{},eaten:[],cells:[],stats:{dist:0,food:0,lamps:0,runs:0},quest:{},daily:{},home:null,lampPos:[]});
const SAVE=saveDefaults();
(function loadSave(){let raw=null;try{raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch(e){}
  if(raw&&typeof raw==='object'){for(const k in SAVE)if(raw[k]!==undefined&&typeof raw[k]===typeof SAVE[k]&&(Array.isArray(raw[k])===Array.isArray(SAVE[k])))SAVE[k]=raw[k];
    if(raw.home&&typeof raw.home.x==='number'&&typeof raw.home.z==='number')SAVE.home={x:raw.home.x,z:raw.home.z};else SAVE.home=null;SAVE.stats=Object.assign(saveDefaults().stats,SAVE.stats);
    /* đổi bản cũ (lit + lampPos) sang một sổ đèn duy nhất: khoá ô -> [x,z] */
    if(!raw.lamps||typeof raw.lamps!=='object'||Array.isArray(raw.lamps)){const L={};if(Array.isArray(raw.lit))for(const k of raw.lit)if(typeof k==='string')L[k]=null;
      if(Array.isArray(raw.lampPos))for(const p of raw.lampPos)if(Array.isArray(p)&&isFinite(p[0])&&isFinite(p[1]))L[Math.round(p[0]/TS)+','+Math.round(p[1]/TS)]=[p[0],p[1]];SAVE.lamps=L}}
  try{const old=SAVE_KEY==='ptvn:v1'?+localStorage.getItem('loigiay_best')||0:0;if(old>SAVE.best)SAVE.best=old}catch(e){}
  if(SAVE.mode!=='walk'&&SAVE.mode!=='chal')SAVE.mode='walk'})();
/* đèn lồng đã thắp: SAVE.lamps là sổ duy nhất (tối đa 1500 cái mới nhất), litSet và lampPos suy ra từ đó */
const LAMP_MAX=1500;
function lampSync(){const L=SAVE.lamps,ks=Object.keys(L);for(let i=0;i<ks.length-LAMP_MAX;i++){delete L[ks[i]];litSet.delete(ks[i])}
  SAVE.lampPos=[];for(const k in L){litSet.add(k);if(L[k])SAVE.lampPos.push(L[k])}}
lampSync();
const cellSet=new Set(SAVE.cells);
function markCell(key){if(cellSet.has(key))return;cellSet.add(key);SAVE.cells.push(key);if(SAVE.cells.length>6000){cellSet.delete(SAVE.cells.shift())}saveSoon()}
let saveTimer=0;
let saveWarn=false;
function saveNow(){clearTimeout(saveTimer);saveTimer=0;try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE,(k,v)=>k==='lampPos'?undefined:v))}catch(e){if(!saveWarn){saveWarn=true;try{toast('Không lưu được tiến độ (bộ nhớ trình duyệt đầy)')}catch(x){}}}}
function saveSoon(){if(saveTimer)return;saveTimer=setTimeout(saveNow,1500)}
function saveReset(){clearTimeout(saveTimer);saveTimer=0;const d=saveDefaults();for(const k in d)SAVE[k]=d[k];litSet.clear();cellSet.clear();
  try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem('loigiay_best')}catch(e){}}
addEventListener('pagehide',saveNow);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveNow()});
BUS.on('region',e=>{if(e&&e.id&&SAVE.regions.indexOf(e.id)<0){SAVE.regions.push(e.id);saveSoon()}});
BUS.on('lamp',e=>{SAVE.home={x:e.x,z:e.z};SAVE.lamps[e.key]=[e.x,e.z];lampSync();saveSoon()});

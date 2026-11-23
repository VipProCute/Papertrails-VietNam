'use strict';
const $=id=>document.getElementById(id);
if(!window.THREE){$('err').hidden=false;$('err').textContent='Không tải được thư viện 3D. Kiểm tra kết nối mạng rồi tải lại trang.';throw new Error('THREE chưa nạp');}

/* ============================== tiện ích ============================== */
const HALF=Math.PI/2, TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const backOut=t=>{const c=1.9;t-=1;return 1+(c+1)*t*t*t+c*t*t};
let SEED=0;{const p=new URLSearchParams(window.location.search),d=new Date();if(p.get('daily')==='1')SEED=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();else if(/^[+-]?\d+$/.test(p.get('seed')||''))SEED=Number(p.get('seed'))|0}
function h2(x,y,k){let h=(Math.imul(x|0,0x9e3779b1)^Math.imul(y|0,0x85ebca6b)^Math.imul((k|0)+SEED*7919,0xc2b2ae35))>>>0;
  h^=h>>>15;h=Math.imul(h,0x2c1b3c6d)>>>0;h^=h>>>12;h=Math.imul(h,0x297a2d39)>>>0;h^=h>>>15;return (h>>>0)/4294967296}
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function vnoise(x,y,k){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);
  const a=h2(xi,yi,k),b=h2(xi+1,yi,k),c=h2(xi,yi+1,k),d=h2(xi+1,yi+1,k);return a+(b-a)*ux+(c-a)*uy+(a-b-c+d)*ux*uy}
/* ============================== bus sự kiện ============================== */
const BUS={_m:{},on(ev,fn){(this._m[ev]||(this._m[ev]=[])).push(fn)},emit(ev,d){const a=this._m[ev];if(a)for(const f of a){try{f(d)}catch(e){console.error(e)}}}};

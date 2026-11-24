'use strict';
/* ============================== tranh giấy: vẽ bộ hình ============================== */
const C={cream:'#f3e6c8',son:'#c8452c',sonD:'#9c3220',hoe:'#e3b23c',hoeD:'#b98a2a',cham:'#2e4d6b',chamL:'#52789a',la:'#5f8f4e',laD:'#3d6b3f',
  laL:'#9dbb5c',nau:'#6e4a2c',nauL:'#a87c4b',nauD:'#4a3120',than:'#2b2622',hong:'#e58fa2',hongD:'#c75a7a',nuoc:'#4aa3a1',nuocL:'#86cbc2',
  da:'#8f8a7c',daL:'#b5ae9c',trang:'#f8f2e2',tuong:'#e7c45e',ngoi:'#c9553a',ngoiD:'#a03f2a',rom:'#d9b660',romD:'#b08a3c',dat:'#e9d7ae',damau:'#e2b58f',den:'#ffd27a'};
let g,_a=1;const ar=()=>{_a=(_a*16807)%2147483647;return _a/2147483647};
function P(c,p){g.fillStyle=c;g.beginPath();for(let i=0;i<p.length;i++)i?g.lineTo(p[i][0],p[i][1]):g.moveTo(p[i][0],p[i][1]);g.closePath();g.fill()}
function R(c,x,y,w,h){g.fillStyle=c;g.fillRect(x,y,w,h)}
function E(c,x,y,rx,ry,rot){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry===undefined?rx:ry,rot||0,0,TAU);g.fill()}
function L(c,w,p){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();for(let i=0;i<p.length;i++)i?g.lineTo(p[i][0],p[i][1]):g.moveTo(p[i][0],p[i][1]);g.stroke()}
function Q(c,w,x0,y0,cx,cy,x1,y1){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(cx,cy,x1,y1);g.stroke()}
function leaf(c,x,y,len,wid,a){g.save();g.translate(x,y);g.rotate(a);g.fillStyle=c;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.5,-wid,len,0);g.quadraticCurveTo(len*.5,wid,0,0);g.fill();g.restore()}
function blob(c,x,y,rx,ry,wob){g.fillStyle=c;g.beginPath();const n=14,ph=ar()*9;for(let i=0;i<=n;i++){const a=i/n*TAU,k=1+Math.sin(a*3+ph)*(wob||.08)+Math.sin(a*5+ph*2)*(wob||.08)*.6;
  const px=x+Math.cos(a)*rx*k,py=y+Math.sin(a)*ry*k;i?g.lineTo(px,py):g.moveTo(px,py)}g.closePath();g.fill()}
function T(c,s,x,y,font){g.fillStyle=c;g.font=(font||'bold 18px')+' "Be Vietnam Pro",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(s,x,y)}
function star(c,x,y,r){const p=[];for(let i=0;i<10;i++){const a=-HALF+i*Math.PI/5,q=i%2?r*.42:r;p.push([x+Math.cos(a)*q,y+Math.sin(a)*q])}P(c,p)}
function roof(x,y,w,h,ins,c1,c2,row){g.save();g.beginPath();g.moveTo(x+ins,y);g.lineTo(x+w-ins,y);g.lineTo(x+w,y+h);g.lineTo(x,y+h);g.closePath();g.fillStyle=c1;g.fill();g.clip();
  g.strokeStyle=c2;g.lineWidth=2.5;row=row||16;for(let r=0,yy=y+row;yy<y+h+row;yy+=row,r++)for(let xx=x-row+(r%2?row/2:0);xx<x+w+row;xx+=row){g.beginPath();g.arc(xx,yy-row,row/2,0,Math.PI);g.stroke()}g.restore()}
function lantern(x,y,r,c,c2){E(c,x,y,r,r*1.15);g.strokeStyle=c2;g.lineWidth=1.5;for(let k=-1;k<=1;k++){g.beginPath();g.ellipse(x,y,r*Math.abs(k)*.6+.5,r*1.15,0,0,TAU);g.stroke()}
  R(C.nauD,x-r*.4,y-r*1.3,r*.8,r*.25);R(C.nauD,x-r*.4,y+r*1.05,r*.8,r*.25);L(c,2,[[x,y+r*1.3],[x,y+r*2]])}
function flag(x,y,h){L(C.nauD,4,[[x,y],[x,y-h]]);P(C.son,[[x+2,y-h],[x+46,y-h+3],[x+44,y-h+30],[x+2,y-h+28]]);star(C.hoe,x+23,y-h+15,9)}

const DEFS=[];
/* o: {r: khoảng trống cần quanh chân, b: bán kính chắn đường, bw: nửa bề ngang chắn, cross: thiệp chữ thập, glow(w,h)} */
function S(name,w,h,H,draw,o){DEFS.push(Object.assign({name,w,h,H,draw},o||{}))}

/* ---- cây cỏ ---- */
S('tre',210,310,1.55,(w,h)=>{for(let k=0;k<6;k++){const x0=w/2+(k-2.5)*13,ln=(k-2.5)*18+ar()*10-5,ty=36+ar()*40;Q(k%2?C.laD:C.la,8,x0,h,x0+ln*.2,h*.55,x0+ln,ty);
    for(let n=1;n<6;n++){const t=n/6,px=lerp(x0,x0+ln,t*t),py=lerp(h,ty,t);L(C.laL,2,[[px-4,py],[px+4,py]])}
    for(let m=0;m<8;m++){const t=.45+ar()*.55,px=lerp(x0,x0+ln,t*t),py=lerp(h,ty,t);leaf(ar()<.5?C.laL:C.la,px,py,34+ar()*22,6,(ar()<.5?Math.PI:0)+(ar()-.5)*1.3+.35)}}},{r:.2,b:.11});
S('chuoi',220,250,1.05,(w,h)=>{P(C.laL,[[w/2-11,h],[w/2+11,h],[w/2+7,120],[w/2-7,120]]);L(C.la,2,[[w/2-3,h-6],[w/2-2,130]]);
    [-2.9,-2.45,-1.95,-1.25,-.7,-.25].forEach((a,i)=>{leaf(i%2?C.la:C.laD,w/2,122,100,24,a);g.save();g.translate(w/2,122);g.rotate(a);L(C.laL,2.5,[[6,0],[92,0]]);g.restore()});
    for(let k=0;k<5;k++)E(C.hoe,w/2+16+k*3,150+k*6,5,10,.5);leaf('#7a3550',w/2+30,186,16,7,1.4)},{r:.2,b:.1});
S('cau',130,350,1.75,(w,h)=>{Q(C.da,10,w/2-4,h,w/2+8,h*.6,w/2,70);for(let y=h-20;y>90;y-=22)L(C.daL,2,[[w/2-3+ (h-y)*.01,y],[w/2+6,y]]);
    for(let k=0;k<8;k++){const a=-Math.PI+k*Math.PI/7+(ar()-.5)*.2;leaf(k%2?C.la:C.laD,w/2,70,56,9,a+ (a<-HALF?-.25:.25)*0)}
    for(let k=0;k<5;k++)E('#d9822b',w/2-8+k*4,84+ (k%2)*5,4)},{r:.15,b:.08});
S('dua',250,350,1.75,(w,h)=>{Q(C.nauL,13,w/2-30,h,w/2-34,h*.55,w/2+6,80);for(let k=1;k<9;k++){const t=k/9;L(C.nau,2,[[w/2-36+t*t*40,h-t*(h-80)],[w/2-22+t*t*30,h-t*(h-80)-4]])}
    for(let k=0;k<9;k++){const a=-Math.PI-.3+k*(Math.PI+.6)/8;leaf(k%2?C.la:C.laD,w/2+6,80,104,15,a);g.save();g.translate(w/2+6,80);g.rotate(a);L(C.laL,2,[[8,0],[96,0]]);g.restore()}
    E(C.nau,w/2-4,96,10);E(C.nauD,w/2+12,100,10);E(C.nau,w/2+4,108,9)},{r:.2,b:.1});
S('da',380,330,1.75,(w,h)=>{P(C.nau,[[w/2-34,h],[w/2+36,h],[w/2+20,170],[w/2-20,170]]);for(let k=0;k<7;k++){const x=w/2-70+k*24+ar()*8;if(Math.abs(x-w/2)>26)L(C.nauL,3,[[x,150],[x+ar()*6-3,h-ar()*20]])}
    L(C.nauD,3,[[w/2-8,h],[w/2-4,180]]);L(C.nauD,3,[[w/2+12,h],[w/2+8,190]]);
    blob(C.laD,w/2,110,170,100,.07);blob(C.la,w/2-50,95,95,60,.1);blob(C.la,w/2+70,120,80,50,.1);blob(C.laL,w/2+10,70,70,34,.1);
    for(let k=0;k<40;k++)leaf(C.laD,40+ar()*300,30+ar()*150,12,4,ar()*TAU)},{r:.38,b:.2,cross:1});
S('dao',250,270,1.25,(w,h)=>{L(C.nauD,12,[[w/2,h],[w/2-4,150]]);L(C.nauD,7,[[w/2-4,170],[70,100]]);L(C.nauD,7,[[w/2-4,160],[185,90]]);L(C.nauD,5,[[w/2-4,150],[w/2+6,60]]);
    blob(C.hong,75,88,58,44,.12);blob(C.hong,180,82,56,46,.12);blob('#f2b3c0',w/2+4,52,60,40,.12);blob(C.hong,w/2,112,70,36,.1);
    for(let k=0;k<46;k++)E(k%3?C.hongD:C.trang,30+ar()*190,22+ar()*118,3.2)},{r:.24,b:.1,cross:1});
S('thong',190,310,1.5,(w,h)=>{R(C.nau,w/2-8,h-60,16,60);for(let k=0;k<4;k++){const y=h-70-k*58,ww=84-k*15;P(k%2?C.laD:'#2f5a45',[[w/2-ww,y],[w/2,y-96],[w/2+ww,y]]);
    for(let m=0;m<5;m++)L(C.la,2.5,[[w/2-ww+12+m*(ww*2-24)/4,y-6],[w/2-ww+18+m*(ww*2-24)/4,y-18]])}},{r:.22,b:.1,cross:1});
S('bui',170,96,.34,(w,h)=>{blob(C.laD,w/2,h-28,76,34,.1);blob(C.la,w/2-22,h-36,44,26,.12);blob(C.laL,w/2+28,h-30,34,18,.12);for(let k=0;k<9;k++)E(k%2?C.hoe:C.trang,24+ar()*120,h-52+ar()*30,3.6)},{r:.14});
S('hoagiay',200,150,.56,(w,h)=>{L(C.nau,5,[[w/2,h],[w/2-6,80]]);blob(C.laD,w/2,74,86,56,.1);for(let k=0;k<60;k++){const a=ar()*TAU,r=ar();E(k%4?C.hongD:'#e86aa0',w/2+Math.cos(a)*r*80,70+Math.sin(a)*r*50,4.5)}
    for(let k=0;k<10;k++)leaf(C.la,30+ar()*140,30+ar()*90,12,4,ar()*TAU)},{r:.18,b:.08});
S('lau',110,76,.26,(w,h)=>{for(let k=0;k<9;k++){const a=-HALF+(k-4)*.24+(ar()-.5)*.1;leaf(k%2?C.la:C.laL,w/2+(k-4)*5,h,50+ar()*20,5,a)}},{r:.1});
S('che',230,84,.3,(w,h)=>{for(let k=0;k<3;k++){blob(C.laD,44+k*70,h-26,42,28,.06);Q(C.laL,4,14+k*70,h-36,44+k*70,h-66,74+k*70,h-36)}},{r:.2});
S('sen',120,96,.3,(w,h)=>{E(C.la,34,h-14,30,11);E(C.laD,86,h-10,26,9);L(C.laD,3,[[60,h-8],[60,40]]);[-2.2,-1.85,-1.57,-1.3,-.95].forEach((a,i)=>leaf(i%2?C.hong:'#f2b3c0',60,46,34,9,a));E(C.hoe,60,42,5)},{r:.1});
function lua(c1,c2){return (w,h)=>{for(let x=10;x<w-8;x+=9){const hh=28+ar()*22;leaf(ar()<.5?c1:c2,x,h,hh,4,-HALF+(ar()-.5)*.5)}}}
S('lua',370,62,.22,lua(C.la,C.laL));S('luavang',370,62,.22,lua(C.hoe,C.rom));
S('datang',160,104,.36,(w,h)=>{P(C.da,[[8,h],[30,h-58],[78,h-92],[128,h-66],[152,h]]);P(C.daL,[[30,h-58],[78,h-92],[92,h-50],[52,h-30]]);L(C.la,3,[[18,h-4],[26,h-18]]);L(C.la,3,[[134,h-4],[128,h-16]])},{r:.16,b:.13});

/* ---- đồ vật làng quê ---- */
S('rom',170,210,.82,(w,h)=>{L(C.nauD,7,[[w/2,h-40],[w/2,14]]);g.fillStyle=C.rom;g.beginPath();g.moveTo(14,h);g.quadraticCurveTo(20,70,w/2,56);g.quadraticCurveTo(w-20,70,w-14,h);g.closePath();g.fill();
    for(let k=0;k<26;k++){const x=24+ar()*(w-48),y=84+ar()*(h-96);L(C.romD,2,[[x,y],[x+ar()*8-4,y+16]])}P(C.romD,[[w/2-30,66],[w/2,40],[w/2+30,66]])},{r:.22,b:.18});
S('chum',84,96,.3,(w,h)=>{E(C.nau,w/2,h-40,36,40);E(C.nauD,w/2,h-76,24,7);Q(C.nauL,4,20,h-50,16,h-30,24,h-14)},{r:.11,b:.09});
S('gieng',160,136,.46,(w,h)=>{R(C.da,26,h-56,108,56);E(C.daL,80,h-56,54,13);E(C.cham,80,h-56,42,9);for(let k=0;k<5;k++)L(C.daL,2,[[30+k*24,h-44],[30+k*24,h-6]]);
    L(C.nauD,6,[[22,h],[22,20]]);L(C.nauD,6,[[138,h],[138,20]]);L(C.nauD,6,[[14,22],[146,22]]);L(C.than,2,[[80,24],[80,62]]);P(C.nauL,[[70,62],[90,62],[87,80],[73,80]])},{r:.22,b:.2});
S('cotdien',150,370,1.95,(w,h)=>{P(C.da,[[w/2-7,h],[w/2+7,h],[w/2+4,10],[w/2-4,10]]);R(C.nauD,w/2-46,40,92,7);R(C.nauD,w/2-34,66,68,6);
    for(let k=0;k<14;k++)Q(C.than,1.8,w/2-44+ar()*30,44+ar()*30,w/2+ar()*30-15,70+ar()*36,w/2+12+ar()*34,44+ar()*30);E(C.than,w/2+6,88,13,10);
    P(C.daL,[[w/2-8,120],[w/2-40,104],[w/2-40,144]]);P(C.daL,[[w/2+8,128],[w/2+40,112],[w/2+40,152]]);R(C.cham,w/2-12,176,24,16);L(C.trang,2,[[w/2-7,184],[w/2+7,184]])},{r:.14,b:.08});
function denlong(on){return (w,h)=>{L(C.nauD,8,[[26,h],[26,24]]);L(C.nauD,6,[[22,30],[84,30]]);L(C.nauD,4,[[26,62],[52,32]]);L(C.than,2,[[78,30],[78,50]]);lantern(78,74,20,on?'#ffb23e':'#a2513a',on?'#ffe9a6':C.sonD)}}
S('denlong_off',116,250,.92,denlong(0),{r:.13,b:.07});
S('denlong_on',116,250,.92,denlong(1),{r:.13,b:.07,glow:()=>{E('#ffd98a',78,74,20,23);L('#ffb23e',2,[[78,100],[78,114]])}});
S('cotmoc',74,84,.28,(w,h)=>{g.fillStyle=C.trang;g.beginPath();g.moveTo(8,h);g.lineTo(8,28);g.quadraticCurveTo(w/2,-6,w-8,28);g.lineTo(w-8,h);g.closePath();g.fill();
    g.fillStyle=C.son;g.beginPath();g.moveTo(8,34);g.lineTo(8,28);g.quadraticCurveTo(w/2,-6,w-8,28);g.lineTo(w-8,34);g.closePath();g.fill();T(C.than,'QL1',w/2,48,'bold 15px');T(C.than,'36km',w/2,66,'bold 13px')},{r:.1,b:.07});
S('bunhin',150,210,.78,(w,h)=>{L(C.nauD,6,[[w/2,h],[w/2,60]]);L(C.nauD,5,[[20,96],[w-20,96]]);P(C.cham,[[w/2-28,84],[w/2+28,84],[w/2+34,150],[w/2-34,150]]);P(C.chamL,[[w/2-28,84],[26,108],[22,92]]);P(C.chamL,[[w/2+28,84],[w-26,108],[w-22,92]]);
    for(let k=0;k<7;k++)L(C.rom,3,[[w/2-28+k*9,150],[w/2-30+k*9+ar()*6,170]]);E(C.rom,w/2,66,17);L(C.than,2,[[w/2-7,64],[w/2-3,64]]);L(C.than,2,[[w/2+3,64],[w/2+7,64]]);P('#ead9a0',[[w/2-44,58],[w/2,26],[w/2+44,58]])},{r:.14,b:.07});
S('quan',270,210,.84,(w,h)=>{L(C.nauD,5,[[150,h],[150,40]]);for(let k=0;k<6;k++)P(k%2?C.trang:C.son,[[150,26],[40+k*37,74],[40+(k+1)*37,74]]);
    R(C.nauL,96,h-58,110,8);L(C.nau,5,[[104,h-50],[104,h]]);L(C.nau,5,[[198,h-50],[198,h]]);R(C.chamL,112,h-84,16,26);E(C.trang,146,h-64,7,9);E(C.trang,164,h-64,7,9);E(C.nau,186,h-70,9,13);
    const stool=(x,c)=>{P(c,[[x-15,h-28],[x+15,h-28],[x+19,h],[x-19,h]]);R(C.trang,x-8,h-18,16,3)};stool(46,C.son);stool(240,'#3f7fbf');stool(74,'#3f7fbf');
    R(C.trang,20,84,74,26);T(C.son,'TRÀ ĐÁ',57,98,'bold 16px')},{r:.34,b:.2,bw:.2,solid:1});
S('xebanhmi',230,230,.9,(w,h)=>{E(C.than,58,h-22,22);E(C.da,58,h-22,8);E(C.than,172,h-22,22);E(C.da,172,h-22,8);R(C.hoe,24,h-104,182,70);R(C.hoeD,24,h-44,182,10);
    R(C.nuocL,36,h-160,130,56);for(let k=0;k<5;k++)E(C.nauL,56+k*24,h-118,10,5,-.4);L(C.nauD,4,[[36,h-160],[36,h-104]]);L(C.nauD,4,[[166,h-160],[166,h-104]]);
    for(let k=0;k<6;k++)P(k%2?C.trang:C.son,[[18+k*33,h-196],[18+(k+1)*33,h-196],[18+(k+1)*33,h-166],[18+k*33,h-160]]);T(C.son,'BÁNH MÌ',114,h-76,'bold 22px');L(C.nauD,5,[[206,h-90],[224,h-100]])},{r:.3,b:.2,bw:.14,solid:1});
S('xuong',230,84,.3,(w,h)=>{g.fillStyle=C.nau;g.beginPath();g.moveTo(6,h-40);g.quadraticCurveTo(w/2,h+4,w-6,h-40);g.quadraticCurveTo(w/2,h-22,6,h-40);g.fill();L(C.nauL,3,[[40,h-28],[190,h-28]]);L(C.nauD,4,[[90,h-70],[150,h-12]])},{r:.2});

/* ---- nhà cửa ---- */
S('nhangoi',400,270,1.3,(w,h)=>{R(C.da,14,h-16,w-28,16);R(C.tuong,30,h-116,w-60,100);for(let k=0;k<3;k++){const x=62+k*100;R(C.nauD,x,h-96,76,80);R(C.nau,x+4,h-92,32,76);R(C.nau,x+40,h-92,32,76)}
    for(let k=0;k<4;k++)R(C.nau,48+k*100,h-116,10,100);roof(8,h-196,w-16,84,44,C.ngoi,C.ngoiD);R(C.ngoiD,50,h-206,w-100,12);
    Q(C.ngoiD,8,52,h-200,30,h-204,22,h-222);Q(C.ngoiD,8,w-52,h-200,w-30,h-204,w-22,h-222);Q(C.ngoiD,6,10,h-112,2,h-116,0,h-128);Q(C.ngoiD,6,w-10,h-112,w-2,h-116,w,h-128);flag(w-46,h-110,120)},
  {r:.62,b:.24,bw:.5,solid:1,deep:.42,glow:(w,h)=>{for(let k=0;k<3;k++)R(C.den,62+k*100+8,h-88,60,40)}});
S('nhala',350,250,1.12,(w,h)=>{for(let k=0;k<4;k++)L(C.nauD,7,[[50+k*84,h],[50+k*84,h-40]]);R(C.nauL,34,h-128,w-68,92);for(let x=44;x<w-40;x+=12)L(C.nau,2,[[x,h-124],[x,h-40]]);R(C.nauD,150,h-110,54,74);R(C.nau,36,h-44,w-72,8);
    g.fillStyle=C.rom;g.beginPath();g.moveTo(6,h-116);g.quadraticCurveTo(w/2,h-250,w-6,h-116);g.closePath();g.fill();for(let k=0;k<40;k++){const x=26+ar()*(w-52),y=h-196+ar()*70;if(y>h-116-(1-Math.abs(x-w/2)/(w/2))*120)L(C.romD,2,[[x,y],[x+ar()*6-3,y+14]])}
    R(C.nauD,250,h-104,44,34);E(C.nau,60,h-22,20,22)},{r:.58,b:.24,bw:.44,solid:1,deep:.42,glow:(w,h)=>{R(C.den,156,h-104,42,62);R(C.den,254,h-100,36,26)}});
S('nhapho',310,350,1.65,(w,h)=>{R('#e6b84a',16,h-250,w-32,250);R('#d7a63c',16,h-140,w-32,10);roof(4,h-320,w-8,76,26,C.ngoiD,'#7d3524',14);for(let k=0;k<8;k++)E(C.la,30+ar()*250,h-262+ar()*14,7,4);
    for(let k=0;k<3;k++){const x=44+k*84;R(C.nauD,x,h-230,54,76);R('#3f7d7a',x+3,h-227,22,70);R('#3f7d7a',x+29,h-227,22,70);for(let m=0;m<5;m++){L(C.nauD,1.5,[[x+5,h-216+m*13],[x+23,h-216+m*13]]);L(C.nauD,1.5,[[x+31,h-216+m*13],[x+49,h-216+m*13]])}}
    R(C.nauD,26,h-150,w-52,8);for(let x=30;x<w-28;x+=14)L(C.nauD,3,[[x,h-150],[x,h-132]]);R(C.nauD,34,h-112,100,112);R(C.nau,40,h-106,42,106);R(C.nau,88,h-106,40,106);R(C.nauD,170,h-112,104,112);R(C.than,176,h-106,92,106);
    R(C.nauD,60,h-130,190,18);T(C.hoe,'HIỆU MAY',155,h-121,'bold 13px');[[150,C.son],[190,C.hoe],[228,'#3f7d7a'],[262,C.son]].forEach((q,i)=>{L(C.than,1.5,[[q[0],h-112],[q[0],h-96+ (i%2)*6]]);lantern(q[0],h-80+(i%2)*6,12,q[1],C.cream)})},
  {r:.56,b:.24,bw:.4,solid:1,deep:.42,glow:(w,h)=>{for(let k=0;k<3;k++)R(C.den,44+k*84+4,h-226,46,30);R(C.den,180,h-70,84,66);[[150,0],[190,1],[228,0],[262,1]].forEach(q=>E('#ffd98a',q[0],h-80+q[1]*6,11,13))}});
S('nhasan',370,290,1.32,(w,h)=>{for(let k=0;k<5;k++)L(C.nauD,8,[[40+k*72,h],[40+k*72,h-84]]);R(C.nau,26,h-92,w-52,10);R(C.nauL,36,h-170,w-72,80);for(let y=h-160;y<h-94;y+=13)L(C.nau,2,[[38,y],[w-38,y]]);R(C.nauD,150,h-154,50,64);R(C.nauD,250,h-150,40,30);R(C.nauD,70,h-150,40,30);
    P('#5c4a3a',[[4,h-162],[70,h-270],[w-70,h-270],[w-4,h-162]]);for(let k=0;k<50;k++){const x=30+ar()*(w-60),y=h-262+ar()*92;L('#473829',2,[[x,y],[x+ar()*4-2,y+12]])}L(C.nauD,6,[[62,h-274],[w-62,h-274]]);
    L(C.nau,5,[[160,h-90],[136,h]]);L(C.nau,5,[[192,h-90],[168,h]]);for(let k=1;k<5;k++)L(C.nau,4,[[160-k*5,h-90+k*18],[192-k*5,h-90+k*18]])},
  {r:.6,b:.22,bw:.46,solid:1,deep:.36,glow:(w,h)=>{R(C.den,254,h-146,32,22);R(C.den,74,h-146,32,22);R(C.den,156,h-148,38,52)}});
S('dinh',480,330,1.7,(w,h)=>{R(C.da,10,h-26,w-20,26);R(C.daL,150,h-26,180,26);for(let k=0;k<4;k++)L(C.da,2,[[160,h-20+k*6],[320,h-20+k*6]]);R(C.nauD,50,h-130,w-100,104);for(let k=0;k<6;k++)R(C.son,56+k*72,h-134,14,108);
    R(C.than,206,h-112,68,86);R(C.hoe,186,h-142,108,18);T(C.son,'ĐÌNH LÀNG',240,h-132,'bold 13px');
    const tier=(x,y,ww,hh)=>{roof(x,y,ww,hh,ww*.16,C.ngoi,C.ngoiD);Q(C.ngoiD,9,x+8,y+hh-4,x-14,y+hh-6,x-22,y+hh-34);Q(C.ngoiD,9,x+ww-8,y+hh-4,x+ww+14,y+hh-6,x+ww+22,y+hh-34)};
    tier(24,h-208,w-48,74);R(C.tuong,120,h-232,w-240,26);tier(88,h-292,w-176,62);R(C.ngoiD,150,h-302,w-300,12);E(C.hoe,w/2,h-312,14);Q(C.la,5,170,h-304,200,h-322,222,h-306);Q(C.la,5,w-170,h-304,w-200,h-322,w-222,h-306)},
  {r:.75,b:.26,bw:.6,solid:1,deep:.42,glow:(w,h)=>{R(C.den,212,h-106,56,60)}});
S('conglang',370,310,1.55,(w,h)=>{R(C.tuong,30,h-210,64,210);R(C.tuong,w-94,h-210,64,210);R(C.da,22,h-20,80,20);R(C.da,w-102,h-20,80,20);R(C.son,40,h-190,44,150);R(C.son,w-84,h-190,44,150);
    R(C.tuong,30,h-236,w-60,46);R(C.cham,60,h-228,w-120,30);T(C.trang,'LÀNG VĂN HOÁ',w/2,h-212,'bold 19px');roof(10,h-282,w-20,48,30,C.ngoi,C.ngoiD,14);Q(C.ngoiD,7,14,h-236,2,h-240,0,h-258);Q(C.ngoiD,7,w-14,h-236,w-2,h-240,w,h-258);
    g.globalCompositeOperation='destination-out';g.fillRect(96,h-188,w-192,190);g.globalCompositeOperation='source-over'},{r:.5,b:.14,bw:.44});

/* ---- cầu và thuyền ---- */
S('chua_cau',480,160,.8,(w,h)=>{R(C.da,16,116,448,44);for(let k=0;k<3;k++){E(C.than,94+k*142,150,42,27);R(C.than,52+k*142,149,84,11)}R(C.trang,12,110,456,10);R(C.nau,24,54,416,56);
    R(C.nauD,28,86,408,20);for(let x=34;x<432;x+=20){L(C.nauL,2,[[x,87],[x+18,104]]);L(C.nauL,2,[[x,104],[x+18,87]])}for(let x=28;x<448;x+=58)R(C.nauD,x,52,7,58);
    for(let k=0;k<8;k++){const x=48+k*51;L(C.than,1.5,[[x,55],[x,65]]);lantern(x,74,8,k%2?C.son:C.hoe,C.cream)}roof(10,19,444,39,32,C.ngoi,C.ngoiD,12);
    Q(C.ngoiD,6,26,55,6,58,3,37);Q(C.ngoiD,6,440,55,466,56,474,34);L(C.cham,5,[[60,18],[404,18]]);Q(C.trang,4,190,17,225,-2,258,17);E(C.chamL,226,9,7);
    R(C.sonD,418,58,50,52);R(C.son,424,61,38,45);R(C.nauD,434,78,16,32);roof(405,33,73,29,15,C.ngoi,C.ngoiD,10)},
  {glow:()=>{R('#8f6230',32,58,378,26);for(let k=0;k<8;k++)E('#ffda83',48+k*51,74,8,9)}});
S('cau_ngoi',480,160,.8,(w,h)=>{for(let x=28;x<470;x+=60){R(C.da, x-9,142,26,18);R(C.nauD,x,59,8,88)}R(C.nau,18,132,444,8);R(C.nauL,22,104,436,6);
    for(let x=30;x<460;x+=24)L(C.nau,3,[[x,108],[x,132]]);R(C.nauD,22,61,436,8);roof(8,21,464,44,46,C.nau,C.nauD,12);Q(C.nauD,7,14,62,2,61,1,40);Q(C.nauD,7,466,62,478,61,479,40);Q(C.nauD,5,54,22,240,2,426,22)},{});
S('cau_dua',480,160,.75,(w,h)=>{for(const x of [42,240,438]){L(C.romD,7,[[x-23,h],[x+23,66]]);L(C.nauL,6,[[x+23,h],[x-23,66]]);L(C.nau,2,[[x-8,105],[x+8,105]])}
    Q(C.nau,17,8,84,240,103,472,84);Q(C.nauL,10,8,81,240,100,472,81);for(let x=16;x<474;x+=19){const y=84+19*(1-Math.pow((x-240)/232,2))*.5;L(C.nauD,3,[[x,y-7],[x-2,y+7]])}
    Q(C.romD,5,10,44,240,52,470,44);for(const x of [30,240,450])L(C.romD,4,[[x,46],[x,94]])},{});
S('cau_treo',480,160,.8,(w,h)=>{for(const x of [38,442]){L(C.romD,9,[[x-25,h],[x,15],[x+25,h]]);L(C.nau,4,[[x-16,84],[x+16,84]]);P(x<100?C.son:C.cham,[[x+4,22],[x+29,28],[x+21,58],[x+4,50]])}
    for(let x=15;x<470;x+=13){const y=112+17*Math.sin((x-15)/455*Math.PI);L(C.nauL,7,[[x,y],[x+11,y]])}Q(C.nauD,3,34,25,240,144,446,25);Q(C.romD,3,30,44,240,161,450,44);
    for(let x=55;x<435;x+=24){const u=(x-34)/412,y=25+238*u*(1-u);L(C.nau,2,[[x,y],[x,112+17*Math.sin((x-15)/455*Math.PI)]])}},{});
S('thuyen',300,100,.35,(w,h)=>{P(C.nauD,[[5,62],[48,75],[246,75],[295,51],[267,88],[228,98],[62,98],[28,88]]);Q(C.nauL,4,8,62,150,96,294,52);
    P(C.rom,[[80,73],[84,40],[106,16],[190,16],[214,40],[218,73]]);for(let x=90;x<216;x+=20)Q(C.nau,2,x,72,x-8,29,x-2,20);L(C.nau,3,[[106,16],[190,16]]);E(C.trang,270,70,10,6);E(C.son,271,70,6);E(C.than,272,70,2)},{});
S('lucbinh',120,110,.3,(w,h)=>{for(let k=0;k<9;k++){const a=k/9*TAU;E(k%2?C.la:C.laD,60+Math.cos(a)*34,86+Math.sin(a)*14,19,11,a*.2)}L(C.laD,3,[[61,88],[61,24]]);
    for(let k=0;k<6;k++){const y=28+k*7;E(k%2?'#ac8bc6':'#c3a5da',58+(k%2)*7,y,7,5)}E(C.hoe,61,30,2)},{});

/* ---- con vật ---- */
S('trau',270,200,.72,(w,h)=>{const c='#4f5560',d='#3a3f48';L(d,13,[[70,h-70],[64,h]]);L(d,13,[[100,h-66],[104,h]]);L(d,13,[[170,h-66],[166,h]]);L(d,13,[[196,h-70],[204,h]]);E(c,134,h-88,84,44);E(c,222,h-110,30,26);E(d,244,h-98,14,11);
    Q(C.daL,7,208,h-130,186,h-162,214,h-168);Q(C.daL,7,234,h-132,262,h-158,238,h-170);E(C.trang,228,h-114,4);E(C.than,229,h-114,2);Q(d,5,52,h-100,34,h-84,40,h-50);
    P(C.nau,[[112,h-128],[146,h-128],[142,h-168],[118,h-168]]);L(C.nauD,7,[[122,h-128],[110,h-98]]);E(C.damau,130,h-178,12);P('#ead9a0',[[100,h-178],[130,h-204],[160,h-178]]);L(C.nauD,3,[[138,h-170],[176,h-160]])},{r:.3,b:.22});
S('co',86,116,.36,(w,h)=>{L(C.than,2.5,[[40,h-44],[38,h]]);L(C.than,2.5,[[48,h-44],[52,h]]);E(C.trang,42,h-58,22,15,-.3);Q(C.trang,8,54,h-66,66,h-84,56,h-98);E(C.trang,56,h-100,7);P(C.hoe,[[60,h-104],[82,h-98],[60,h-96]]);E(C.than,58,h-101,1.5)},{r:.1});
S('ga',76,76,.2,(w,h)=>{L(C.hoeD,2.5,[[34,h-16],[32,h]]);L(C.hoeD,2.5,[[42,h-16],[44,h]]);E('#b8683a',38,h-28,20,15);P(C.nauD,[[18,h-30],[4,h-50],[22,h-40]]);E('#b8683a',56,h-44,9);P(C.son,[[52,h-52],[56,h-60],[60,h-52]]);P(C.hoe,[[64,h-46],[74,h-42],[64,h-40]]);E(C.than,58,h-46,1.5)},{r:.08});
function cho(mode){return (w,h)=>{const c='#d9a441',d='#b9842e';
  if(mode===0){L(d,9,[[98,h-50],[98,h-4]]);L(c,9,[[110,h-50],[110,h-4]]);g.fillStyle=c;g.beginPath();g.ellipse(74,h-40,34,26,-.5,0,TAU);g.fill();E(c,54,h-18,22,14);Q(d,7,36,h-26,14,h-34,22,h-58);
    E(c,112,h-76,21);P(d,[[96,h-90],[98,h-112],[110,h-96]]);P(d,[[114,h-96],[124,h-114],[130,h-92]]);E(C.trang,128,h-68,11,8);E(C.than,138,h-70,3.5);E(C.than,116,h-80,2.6)}
  else{const y=h-52;if(mode===1){L(d,8,[[100,y+6],[134,y+40]]);L(c,8,[[108,y+4],[146,y+30]]);L(d,8,[[52,y+6],[18,y+38]]);L(c,8,[[46,y+4],[10,y+26]])}else{L(d,8,[[100,y+6],[86,y+46]]);L(c,8,[[108,y+4],[104,y+48]]);L(d,8,[[52,y+6],[66,y+46]]);L(c,8,[[46,y+4],[54,y+48]])}
    E(c,78,y,44,18);Q(d,7,36,y-6,16,y-30,34,y-44);E(c,128,y-20,20);P(d,[[112,y-32],[110,y-56],[124,y-40]]);P(d,[[128,y-40],[134,y-60],[142,y-36]]);
    P(C.trang,[[136,y-22],[158,y-20],[140,y-10]]);P(C.sonD,[[138,y-12],[156,y-10],[142,y-2]]);P(C.trang,[[142,y-12],[146,y-6],[150,y-11]]);E(C.than,157,y-21,3.2);E(C.than,130,y-26,2.8);L(C.than,2.5,[[122,y-34],[134,y-29]])}}}
S('cho_sit',164,124,.36,cho(0));S('cho_run1',164,124,.36,cho(1));S('cho_run2',164,124,.36,cho(2));

/* ---- lữ khách đội nón lá ---- */
function khach(mode){return (w,h)=>{const hip=[64,h-78];const leg=(dx,c)=>{L(c,11,[hip,[64+dx,h-8]]);L(C.nauD,9,[[60+dx,h-4],[72+dx,h-4]])};
  if(mode===0){leg(-6,'#3b3530');leg(8,C.than)}else if(mode===1){leg(-22,'#3b3530');leg(22,C.than)}else{leg(14,'#3b3530');leg(-12,C.than)}
  P(C.cham,[[26,h-150],[50,h-152],[50,h-88],[24,h-92]]);E(C.rom,38,h-156,15,9);
  P('#7a4b2e',[[44,h-150],[86,h-150],[90,h-74],[42,h-74]]);L('#5c3620',2,[[66,h-146],[66,h-78]]);
  const ax=mode===1?16:mode===2?-8:6;L('#7a4b2e',9,[[70,h-140],[78+ax,h-104]]);E(C.damau,80+ax,h-100,5);L(C.than,1.5,[[82+ax,h-98],[84+ax,h-84]]);lantern(84+ax,h-74,7,'#ffb23e',C.son);
  E(C.damau,66,h-164,15);E(C.than,74,h-166,2);R(C.trang,50,h-154,34,8);for(let k=0;k<5;k++)R(C.than,52+k*7,h-154+(k%2)*4,4,4);
  P('#ead9a0',[[14,h-166],[66,h-208],[118,h-166]]);L('#c9b06a',2,[[30,h-172],[102,h-172]]);L('#c9b06a',2,[[44,h-184],[88,h-184]]);L(C.son,2,[[56,h-166],[60,h-150]])}}
const kglow=mode=>(w,h)=>{const ax=mode===1?16:mode===2?-8:6;E('#ffd98a',84+ax,h-74,7,8)};
S('k_idle',134,216,.72,khach(0),{glow:kglow(0)});S('k_w1',134,216,.72,khach(1),{glow:kglow(1)});S('k_w2',134,216,.72,khach(2),{glow:kglow(2)});

/* ---- xe máy chở hàng ---- */
S('xm_side',330,260,.9,(w,h)=>{const wy=h-38;E(C.than,70,wy,37);E(C.da,70,wy,15);E(C.than,256,wy,37);E(C.da,256,wy,15);
    P(C.son,[[84,wy-56],[236,wy-66],[250,wy-36],[214,wy-6],[110,wy-6],[78,wy-30]]);P(C.sonD,[[226,wy-70],[250,wy-124],[262,wy-120],[246,wy-40]]);L(C.da,6,[[256,wy],[248,wy-70]]);
    R(C.than,96,wy-72,104,14);E(C.hoe,264,wy-104,10);L(C.than,6,[[236,wy-134],[262,wy-126]]);P(C.sonD,[[40,wy-40],[100,wy-58],[100,wy-46]]);
    /* hàng hoá */ R(C.nauL,30,wy-124,78,56);L(C.nau,2,[[30,wy-96],[108,wy-96]]);R(C.rom,38,wy-174,62,50);L(C.romD,2,[[69,wy-174],[69,wy-124]]);R(C.nuocL,46,wy-212,46,38);L(C.son,3,[[60,wy-212],[60,wy-68]]);L(C.son,3,[[84,wy-212],[84,wy-68]]);
    for(let k=0;k<3;k++)E('#b8683a',52+k*16,wy-222,9,8);
    /* người lái */ L(C.cham,15,[[150,wy-74],[196,wy-44]]);L(C.cham,13,[[196,wy-44],[200,wy-14]]);P(C.hong,[[124,wy-74],[170,wy-74],[178,wy-152],[136,wy-156]]);for(let k=0;k<12;k++)E(C.trang,132+ar()*38,wy-146+ar()*64,2.6);
    L(C.hong,11,[[166,wy-140],[236,wy-128]]);E(C.damau,158,wy-170,17);R(C.chamL,154,wy-170,24,15);E(C.hoe,156,wy-178,21,15);R(C.hoe,150,wy-176,34,6);E(C.than,170,wy-172,2.2)},
  {glow:(w,h)=>{E('#fff0b8',264,h-142,10)}});
function xmfb(front){return (w,h)=>{const cx=w/2;E(C.than,cx,h-38,15,36);
  const gio=(x)=>{P(C.nauL,[[x-30,h-112],[x+30,h-112],[x+24,h-58],[x-24,h-58]]);for(let k=0;k<4;k++)L(C.nau,2,[[x-26+k*17,h-110],[x-22+k*15,h-60]]);for(let k=0;k<7;k++)E(k%3===0?C.son:k%3===1?C.hoe:C.la,x-22+k*7.4,h-118-(k%2)*7,8)};gio(cx-58);gio(cx+58);L(C.nauD,5,[[cx-84,h-112],[cx+84,h-112]]);
  if(front){P(C.son,[[cx-22,h-70],[cx+22,h-70],[cx+30,h-136],[cx-30,h-136]]);P(C.sonD,[[cx-12,h-40],[cx+12,h-40],[cx+16,h-74],[cx-16,h-74]]);E(C.hoe,cx,h-116,13);L(C.than,6,[[cx-52,h-142],[cx+52,h-142]]);E(C.da,cx-58,h-156,9,11);E(C.da,cx+58,h-156,9,11);L(C.than,3,[[cx-52,h-142],[cx-58,h-152]]);L(C.than,3,[[cx+52,h-142],[cx+58,h-152]]);
    P(C.hong,[[cx-28,h-140],[cx+28,h-140],[cx+24,h-196],[cx-24,h-196]]);for(let k=0;k<10;k++)E(C.trang,cx-20+ar()*40,h-190+ar()*46,2.6);L(C.hong,10,[[cx-24,h-186],[cx-48,h-146]]);L(C.hong,10,[[cx+24,h-186],[cx+48,h-146]]);
    E(C.damau,cx,h-208,17);R(C.chamL,cx-15,h-208,30,15);E(C.hoe,cx,h-218,22,16);R(C.hoe,cx-20,h-216,40,6);E(C.than,cx-7,h-211,2);E(C.than,cx+7,h-211,2)}
  else{P(C.sonD,[[cx-20,h-52],[cx+20,h-52],[cx+24,h-96],[cx-24,h-96]]);R(C.son,cx-9,h-76,18,9);P(C.hong,[[cx-28,h-130],[cx+28,h-130],[cx+24,h-196],[cx-24,h-196]]);L(C.hong,10,[[cx-24,h-186],[cx-46,h-146]]);L(C.hong,10,[[cx+24,h-186],[cx+46,h-146]]);
    E(C.hoe,cx,h-212,22,19);R(C.rom,cx-34,h-150,68,56);L(C.romD,2,[[cx,h-150],[cx,h-94]]);L(C.son,3,[[cx-34,h-122],[cx+34,h-122]]);R(C.nuocL,cx-24,h-186,48,36);for(let k=0;k<3;k++)E('#b8683a',cx-16+k*16,h-194,9,8)}}}
S('xm_front',200,260,.9,xmfb(1),{glow:(w,h)=>{E('#fff0b8',w/2,h-116,13)}});S('xm_back',200,260,.9,xmfb(0),{glow:(w,h)=>{R('#ff5a3c',w/2-9,h-76,18,9)}});

/* ---- món ăn, bong bóng chữ ---- */
S('banhmi',96,96,.25,(w,h)=>{g.save();g.translate(w/2,h/2);g.rotate(-.5);E('#c98a3c',0,0,40,15);E('#e8b866',0,-4,34,8);for(let k=-2;k<=2;k++)L('#a56a24',2.5,[[k*13-3,-10],[k*13+4,2]]);leaf(C.la,-30,8,60,5,0);E(C.son,-10,9,5,3);E(C.son,12,9,5,3);g.restore()});
S('pho',96,96,.25,(w,h)=>{P(C.trang,[[10,44],[86,44],[70,84],[26,84]]);L(C.cham,3,[[14,52],[82,52]]);E('#c98a3c',48,44,38,10);E('#e8d9a8',48,43,32,7);E(C.sonD,36,42,8,4);E(C.sonD,58,44,8,4);E(C.la,48,40,4);E(C.la,64,40,3);L(C.nauD,3,[[58,40],[84,10]]);L(C.nauD,3,[[64,42],[90,14]]);Q(C.trang,3,34,30,28,20,36,10);Q(C.trang,3,48,28,42,18,50,8)});
S('caphe',96,96,.25,(w,h)=>{P(C.nuocL,[[28,22],[68,22],[62,86],[34,86]]);P('#6b3f24',[[30,40],[66,40],[62,86],[34,86]]);P('#c69a6a',[[29,34],[67,34],[66,46],[30,46]]);R(C.trang,36,50,10,10);R(C.trang,50,62,10,10);L(C.son,4,[[56,8],[48,70]]);E(C.trang,48,22,20,4)});
S('banhchung',96,96,.25,(w,h)=>{P(C.laD,[[14,26],[82,20],[86,78],[18,84]]);P(C.la,[[14,26],[82,20],[80,30],[16,36]]);L(C.rom,3,[[36,24],[40,82]]);L(C.rom,3,[[60,22],[64,80]]);L(C.rom,3,[[15,44],[84,40]]);L(C.rom,3,[[17,64],[85,60]])});
S('gau',140,96,.42,(w,h)=>{g.fillStyle=C.trang;g.beginPath();g.ellipse(w/2,40,62,34,0,0,TAU);g.fill();P(C.trang,[[40,62],[30,92],[66,68]]);T(C.son,'Gâu!',w/2,41,'bold 34px')});
S('bip',190,96,.46,(w,h)=>{g.fillStyle=C.hoe;g.beginPath();g.ellipse(w/2,40,88,34,0,0,TAU);g.fill();P(C.hoe,[[70,64],[64,92],[100,68]]);T(C.than,'Bíp bíp!',w/2,41,'bold 30px')});
S('bui_khoi',44,44,.14,(w,h)=>{E(C.dat,w/2,h/2,18)});

/* ---- hình in phẳng trên mặt trang ---- */
function ruong(c1,c2,c3){return (w,h)=>{g.fillStyle=c1;g.beginPath();const n=40;for(let i=0;i<=n;i++){const a=i/n*TAU,cs=Math.cos(a),sn=Math.sin(a),m=Math.max(Math.abs(cs),Math.abs(sn));const r=(w/2-4)/m*(1-.03*Math.abs(Math.sin(a*7+c1.length)))-Math.pow(Math.abs(cs*sn)*2,3)*26;
    const x=w/2+cs*r,y=h/2+sn*r;i?g.lineTo(x,y):g.moveTo(x,y)}g.closePath();g.fill();g.save();g.clip();
    for(let y=14;y<h;y+=17)for(let x=10+((y/17|0)%2)*7;x<w;x+=14){L(c2,2.4,[[x,y],[x-2,y-8]]);L(c2,2.4,[[x,y],[x+3,y-7]])}
    E(c3,w*.3,h*.62,26,7);E(c3,w*.7,h*.3,20,5);g.restore()}}
S('ruong',260,260,1,ruong('#86ad5e','#4f8a4a','#9cc7b0'),{flat:1});S('ruongvang',260,260,1,ruong('#d8b655','#b08a2e','#c9b06a'),{flat:1});
S('bacthang',260,260,1,(w,h)=>{const cs=['#5f8f4e','#7da657','#9dbb5c','#bccf74','#d8d68a'];for(let k=0;k<5;k++){blob(cs[k],w/2+k*5,h/2+k*9,(w/2-6)*(1-k*.19),(h/2-6)*(1-k*.19),.05)}
    for(let k=0;k<5;k++){g.strokeStyle='#3d6b3f';g.lineWidth=2;g.beginPath();g.ellipse(w/2+k*5,h/2+k*9+3,(w/2-10)*(1-k*.19),(h/2-10)*(1-k*.19),0,.2,Math.PI-.2);g.stroke()}},{flat:1});
S('ao',260,260,1,(w,h)=>{blob('#c9b98a',w/2,h/2,w/2-6,h/2-10,.06);blob(C.nuoc,w/2,h/2,w/2-22,h/2-26,.07);for(let k=0;k<7;k++){const x=50+ar()*150,y=60+ar()*130;Q(C.nuocL,3,x,y,x+12,y-6,x+26,y)}
    for(let k=0;k<5;k++)E(C.la,54+ar()*150,60+ar()*130,11,7)},{flat:1});
S('san',260,260,1,(w,h)=>{R('#c9a27a',4,4,w-8,h-8);for(let y=4,r=0;y<h-8;y+=21,r++)for(let x=4-(r%2)*16;x<w-8;x+=32){g.fillStyle=h2(x,y,3)<.5?'#c0946b':'#d1ad86';g.fillRect(Math.max(4,x+1),y+1,Math.min(30,w-6-x),19)}},{flat:1,noEdge:1});
S('duong',140,70,1,(w,h)=>{g.fillStyle=C.dat;g.beginPath();g.moveTo(0,10);for(let x=0;x<=w;x+=10)g.lineTo(x,8+Math.sin(x*.21)*3+ar()*3);for(let x=w;x>=0;x-=10)g.lineTo(x,h-8+Math.sin(x*.17)*3-ar()*3);g.closePath();g.fill();
    for(let k=0;k<16;k++)E('#d9c494',ar()*w,16+ar()*(h-32),2.4)},{flat:1,noEdge:1});
S('duongtron',110,110,1,(w,h)=>{blob(C.dat,w/2,h/2,w/2-8,h/2-8,.07);for(let k=0;k<10;k++)E('#d9c494',22+ar()*66,22+ar()*66,2.4)},{flat:1,noEdge:1});
S('vancau',200,60,1,(w,h)=>{R(C.nauD,0,0,w,h);for(let x=1;x<w;x+=13){R((x/13|0)%2?C.nauL:C.nau,x,1,11,h-2);L(C.nauD,1,[[x+3,6],[x+3,h-7]]);E(C.than,x+6,5,1);E(C.than,x+6,h-5,1)}},{flat:1,noEdge:1});

/* ============================== vùng mới: Tây Nguyên, Đông Nam Bộ, Nam Trung Bộ, Tây Nam Bộ ============================== */
const GR='#8d8f97',GRD='#6d7079',IRON='#5d6a78',IRONL='#8895a3',BRK='#b5533a',BRKD='#8a3a28',BRKL='#cf7a55';
/* ---- Tây Nguyên ---- */
S('nharong',300,420,2.0,(w,h)=>{for(let k=0;k<5;k++)L(C.nauD,9,[[56+k*47,h],[56+k*47,h-76]]);L(C.nau,5,[[120,h-76],[100,h-6]]);L(C.nau,5,[[150,h-76],[130,h-6]]);for(let k=1;k<5;k++)L(C.nauL,4,[[118-k*4,h-76+k*14],[148-k*4,h-76+k*14]]);
    R(C.nau,34,h-90,232,14);R(C.nauL,64,h-140,172,52);for(let x=70;x<232;x+=12)L(C.nau,2,[[x,h-138],[x,h-92]]);R(C.nauD,126,h-134,48,44);
    g.save();g.beginPath();g.moveTo(w/2,6);g.quadraticCurveTo(w/2+34,h*.52,w-8,h-122);g.lineTo(8,h-122);g.quadraticCurveTo(w/2-34,h*.52,w/2,6);g.closePath();g.fillStyle=C.rom;g.fill();g.clip();
    for(let y=24;y<h-120;y+=13)L(C.romD,2,[[0,y],[w,y+6]]);for(let k=0;k<50;k++){const x=20+ar()*260,y=30+ar()*(h-160);L(C.romD,2,[[x,y],[x+ar()*5-2,y+12]])}g.restore();
    L(C.nauD,6,[[w/2-22,34],[w/2+12,4]]);L(C.nauD,6,[[w/2+22,34],[w/2-12,4]]);R(C.nauD,6,h-126,w-12,10);for(let k=0;k<4;k++)E(C.son,70+k*53,h-121,5)},
  {r:.6,b:.24,bw:.4,solid:1,deep:.4,glow:(w,h)=>{R(C.den,132,h-128,36,34)}});
S('congchieng',260,180,.7,(w,h)=>{L(C.nauD,8,[[30,h],[30,16]]);L(C.nauD,8,[[230,h],[230,16]]);L(C.nau,5,[[30,h-26],[230,h-26]]);R(C.nauD,18,22,224,10);
    for(let k=0;k<5;k++){const x=56+k*37,r=19-k*1.2,y=84+k*3;L(C.than,1.5,[[x-r*.5,32],[x,y-r]]);L(C.than,1.5,[[x+r*.5,32],[x,y-r]]);E(C.hoeD,x,y,r+3);E(C.hoe,x,y,r);E(C.hoeD,x,y,r*.5);E(C.hoe,x,y,r*.28)}
    L(C.nau,4,[[238,h-30],[248,h-70]]);E(C.nauL,250,h-74,6)},{r:.3,b:.16,bw:.2});
S('caphe_cay',170,150,.5,(w,h)=>{L(C.nauD,6,[[w/2,h],[w/2,h-34]]);blob(C.laD,w/2,h-64,74,52,.1);blob(C.la,w/2-24,h-72,42,30,.12);blob(C.laL,w/2+26,h-80,32,18,.12);
    for(let k=0;k<22;k++){const a=ar()*TAU,r=ar();E(k%4?C.son:C.sonD,w/2+Math.cos(a)*r*60,h-62+Math.sin(a)*r*38,4.2)}for(let k=0;k<5;k++)E(C.trang,30+ar()*110,h-104+ar()*40,3)},{r:.16,b:.08});
S('voi',330,250,.95,(w,h)=>{const c=GR,d=GRD;for(const x of [92,128])L(d,38,[[x,h-92],[x,h-4]]);for(const x of [206,240])L(c,38,[[x,h-92],[x,h-4]]);for(const x of [92,128,206,240])R(C.trang,x-14,h-9,28,9);
    E(c,160,h-120,106,70);Q(d,9,58,h-150,34,h-120,42,h-76);E(c,262,h-134,50,48);Q(c,36,268,h-110,310,h-70,288,h-14);Q(d,3,270,h-100,300,h-70,282,h-20);
    E(d,224,h-134,30,42,.1);E(GR,226,h-134,22,32,.1);Q(C.trang,9,250,h-104,286,h-96,306,h-122);E(C.than,278,h-146,4);
    P(C.son,[[104,h-184],[200,h-186],[208,h-152],[96,h-150]]);for(let k=0;k<6;k++)E(C.hoe,112+k*16,h-168,4);L(C.hoe,3,[[100,h-152],[204,h-154]])},{r:.45,b:.26});
S('ray_caphe',260,260,1,(w,h)=>{blob('#b8683e',w/2,h/2,w/2-6,h/2-8,.05);for(let y=44,r=0;y<h-24;y+=46,r++){L('#9c5436',3,[[26,y+14],[w-26,y+14]]);for(let x=34+(r%2)*10;x<w-30;x+=34){blob(C.laD,x,y,14,11,.08);blob(C.la,x-3,y-4,9,6,.1);E(C.son,x+5,y+2,2.6);E(C.son,x-7,y+3,2.6)}}},{flat:1});

/* ---- Đông Nam Bộ ---- */
S('nhaong',220,420,1.95,(w,h)=>{R('#d98fa5',0,70,22,h-70);R('#7fb6c9',w-18,90,18,h-90);R('#e9dcc0',20,56,w-40,h-56);const cs=['#f2a7b9','#8fd0b4','#f0c46a'];
    for(let s=0;s<3;s++){const top=h-370+s*90,bot=top+90;R(cs[s],20,top,w-40,90);R(C.nauD,50,top+14,w-100,46);R(C.chamL,54,top+18,w-108,38);L(C.trang,2,[[w/2,top+18],[w/2,top+56]]);R(C.nauD,28,bot-26,w-56,5);for(let x=32;x<w-32;x+=12)L(C.nauD,2,[[x,bot-24],[x,bot-4]]);R(C.nauD,24,bot-4,w-48,6);for(let k=0;k<3;k++)E(C.la,48+k*62,bot-30,9,7)}
    R(C.nauD,16,52,w-32,10);R(C.da,60,24,52,30);E(C.cham,86,22,26,8);R(C.nauD,150,34,4,20);R(C.sonD,138,h-112,66,28);
    R('#8f8a7c',36,h-82,w-72,82);for(let y=h-78;y<h;y+=7)L(C.da,1.5,[[36,y],[w-36,y]]);R(C.son,24,h-114,w-48,32);T(C.trang,'TẠP HOÁ',w/2,h-98,'bold 18px')},
  {r:.5,b:.22,bw:.26,solid:1,deep:.36,glow:(w,h)=>{for(let s=0;s<3;s++)R(C.den,58,h-370+s*90+22,w-116,30)}});
S('caooc',240,520,2.5,(w,h)=>{R(C.da,8,h-34,w-16,34);R('#2f5f7f',44,70,w-88,h-100);P('#2f5f7f',[[44,70],[70,40],[w-70,40],[w-44,70]]);R('#244b66',70,18,w-140,26);L(C.than,3,[[w/2,18],[w/2,4]]);E(C.son,w/2,5,3);
    for(let y=82;y<h-60;y+=22)for(let x=52;x<w-56;x+=20)R((x+y)%3?'#52789a':'#7fa6c2',x,y,16,17);for(let y=82;y<h-60;y+=22)L('#244b66',2,[[44,y-3],[w-44,y-3]]);R(C.nauD,44,h-96,w-88,8);R('#3f7d7a',60,h-84,w-120,50);L(C.trang,2,[[w/2,h-84],[w/2,h-34]])},
  {r:.5,b:.22,bw:.3,solid:1,deep:.36,glow:(w,h)=>{for(let y=82;y<h-60;y+=22)for(let x=52;x<w-56;x+=20)if(h2(x,y,5)<.5)R(C.den,x,y,16,17)}});
S('cay_caosu',170,330,1.6,(w,h)=>{P('#cfc6b4',[[w/2-9,h],[w/2+9,h],[w/2+6,92],[w/2-6,92]]);for(let k=0;k<7;k++)L('#a89f8c',1.5,[[w/2-6+ar()*10,h-ar()*40],[w/2-4+ar()*8,h-80-ar()*110]]);
    L(C.nauD,3,[[w/2-9,h-120],[w/2+9,h-86]]);L(C.trang,2,[[w/2+2,h-100],[w/2+8,h-76]]);E(C.nauL,w/2+9,h-72,8,4);E(C.trang,w/2+9,h-73,5,2);
    blob(C.laD,w/2,62,64,44,.1);blob(C.la,w/2-22,54,36,24,.12);blob(C.laL,w/2+26,70,30,16,.12);for(let k=0;k<12;k++)leaf(k%2?C.la:C.laL,40+ar()*90,28+ar()*60,22,5,ar()*TAU)},{r:.2,b:.08,cross:1});
S('xehutieu',230,230,.9,(w,h)=>{E(C.than,58,h-22,22);E(C.da,58,h-22,8);E(C.than,172,h-22,22);E(C.da,172,h-22,8);R(C.cham,24,h-104,182,70);R(C.chamL,24,h-44,182,10);
    R(C.nuocL,36,h-158,100,54);for(let k=0;k<3;k++){P(C.trang,[[44+k*30,h-124],[68+k*30,h-124],[64+k*30,h-110],[48+k*30,h-110]]);E('#e8d9a8',56+k*30,h-125,12,4)}L(C.nauD,4,[[36,h-158],[36,h-104]]);L(C.nauD,4,[[136,h-158],[136,h-104]]);
    for(let k=0;k<4;k++)P(k%2?C.trang:C.son,[[18+k*33,h-188],[18+(k+1)*33,h-188],[18+(k+1)*33,h-162],[18+k*33,h-158]]);
    R(C.da,164,h-136,42,32);E(C.than,185,h-136,21,5);Q(C.trang,4,176,h-142,168,h-168,180,h-192);Q(C.trang,4,194,h-142,202,h-170,190,h-198);Q(C.trang,3,186,h-142,182,h-176,192,h-210);
    T(C.trang,'HỦ TIẾU',90,h-72,'bold 20px');L(C.nauD,5,[[206,h-90],[224,h-100]])},{r:.3,b:.2,bw:.14,solid:1});
S('denduong',110,330,1.6,(w,h)=>{R(C.da,18,h-18,28,18);L(C.da,9,[[32,h-10],[32,64]]);Q(C.da,7,32,64,34,26,88,26);P('#4a5260',[[70,20],[106,22],[100,36],[76,34]]);R(C.den,76,34,24,4)},{r:.12,b:.07,glow:(w,h)=>{E('#ffd98a',88,40,14,6);E('#fff0b8',88,36,7,3)}});
S('duong_nhua',260,260,1,(w,h)=>{R('#8f9096',0,0,w,h);for(let k=0;k<90;k++)E(k%2?'#a2a3a7':'#7c7d83',ar()*w,ar()*h,2+ar()*2);for(let x=8;x<w;x+=52)R('#c9c8c0',x,h/2-2,28,4);R('#b3b2ab',0,12,w,2);R('#b3b2ab',0,h-14,w,2)},{flat:1,noEdge:1});
S('cau_sat',480,160,.8,(w,h)=>{for(const x of [24,222,420])R(C.da,x,128,36,32);R('#4a5260',10,118,460,14);L(IRON,9,[[16,118],[70,32],[410,32],[464,118]]);R(IRON,60,26,360,10);
    for(let x=70;x<=410;x+=34){L(IRON,4,[[x,34],[x,118]]);if(x<410)L(IRONL,3,[[x,118],[x+34,34]])}for(let x=70;x<=410;x+=34)for(const y of [38,114])E(C.daL,x,y,2.6);L(IRON,5,[[16,118],[70,118]]);L(IRON,5,[[410,118],[464,118]]);R(IRON,10,132,460,6)},{});

/* ---- Nam Trung Bộ ---- */
S('thapcham',240,400,1.9,(w,h)=>{const T3=[[34,172,h-140,140],[56,128,h-240,100],[76,88,h-318,78]];
    for(const [x,wd,yt,hg] of T3){R(BRK,x,yt,wd,hg);for(let y=yt+14;y<yt+hg;y+=14)L(BRKD,1.5,[[x,y],[x+wd,y]]);R(BRKD,x+wd*.18,yt,7,hg);R(BRKD,x+wd*.82-7,yt,7,hg);R(BRKD,x-8,yt,wd+16,10);R(BRKL,x-8,yt,wd+16,3);
      P(BRK,[[x-4,yt],[x+14,yt],[x+5,yt-28]]);P(BRK,[[x+wd+4,yt],[x+wd-14,yt],[x+wd-5,yt-28]])}
    P(C.than,[[100,h],[100,h-62],[120,h-90],[140,h-62],[140,h]]);for(const y of [h-206,h-292])P(BRKD,[[106,y+30],[106,y+10],[120,y-4],[134,y+10],[134,y+30]]);
    P(BRK,[[76,h-318],[164,h-318],[120,h-390]]);for(let y=h-330;y>h-386;y-=12)L(BRKD,1.5,[[120-(y-(h-390))*.6,y],[120+(y-(h-390))*.6,y]]);L(C.hoe,4,[[120,h-390],[120,h-398]]);E(C.hoe,120,h-398,4)},
  {r:.5,b:.22,bw:.3,solid:1,deep:.4});
S('thuyenthung',170,90,.32,(w,h)=>{L(C.nauL,5,[[112,h-48],[158,8]]);P(C.nauL,[[148,6],[164,8],[158,26],[142,22]]);g.fillStyle=C.cham;g.beginPath();g.ellipse(85,h-46,76,40,0,0,Math.PI);g.fill();
    g.save();g.beginPath();g.ellipse(85,h-46,76,40,0,0,Math.PI);g.clip();for(let k=0;k<7;k++)L(C.chamL,2,[[85+(k-3)*24,h-46],[85+(k-3)*10,h]]);L(C.chamL,2,[[10,h-30],[160,h-30]]);g.restore();
    E(C.chamL,85,h-46,76,11);E(C.nauD,85,h-47,66,7);P('#ead9a0',[[58,h-52],[84,h-78],[110,h-52]])},{});
S('xuongrong',100,140,.42,(w,h)=>{const g2=C.laD;R(g2,40,40,22,h-40);E(g2,51,40,11);L(g2,13,[[40,h-52],[14,h-62],[14,h-92]]);E(g2,14,h-94,6.5);L(g2,13,[[62,h-70],[86,h-78],[86,h-104]]);E(g2,86,h-106,6.5);
    for(let k=0;k<14;k++){const x=44+ar()*14,y=48+ar()*(h-70);L(C.trang,1.5,[[x,y],[x+(ar()-.5)*6,y-4]])}E(C.hong,51,30,5);R(C.son,34,h-8,34,8);R(C.nauD,30,h-4,42,4)},{r:.12,b:.07});

/* ---- Tây Nam Bộ ---- */
S('ghe',320,150,.5,(w,h)=>{P(C.nauD,[[6,96],[40,108],[276,108],[314,84],[292,136],[244,148],[70,148],[26,134]]);Q(C.nauL,4,8,96,160,140,312,86);
    for(let k=0;k<5;k++)blob(k%2?C.la:C.laL,126+k*30,102,24,13,.1);for(let k=0;k<4;k++)E(k%2?C.hoe:'#e58f3a',142+k*34,96,9,11);
    L(C.nauL,6,[[110,102],[110,10]]);L(C.nauL,5,[[96,14],[300,14]]);for(let k=0;k<6;k++){const x=134+k*30,y=44+(k%3)*12;L(C.than,1.5,[[x,14],[x,y]]);E([C.hoe,C.son,C.laL,'#b8683a',C.hong,C.hoe][k],x,y+12,11,14)}
    P(C.cham,[[38,60],[64,60],[68,104],[34,104]]);E(C.damau,50,50,10);P('#ead9a0',[[28,48],[50,26],[72,48]]);L(C.nau,4,[[60,80],[24,144]])},{});
S('cayxoai',260,300,1.4,(w,h)=>{Q(C.nauD,16,w/2,h,w/2-4,h*.7,w/2+2,150);L(C.nauD,7,[[w/2,170],[w/2-50,120]]);L(C.nauD,7,[[w/2,164],[w/2+54,116]]);
    blob(C.laD,w/2,100,120,84,.08);blob(C.la,w/2-46,92,70,48,.1);blob(C.la,w/2+52,104,62,42,.1);blob(C.laL,w/2+4,60,56,26,.12);for(let k=0;k<30;k++)leaf(k%2?C.laL:C.la,30+ar()*200,34+ar()*130,16,4,ar()*TAU);
    for(let k=0;k<8;k++){const x=56+ar()*150,y=96+ar()*66;L(C.nauD,1.5,[[x,y-14],[x,y-6]]);E('#f2c230',x,y,9,13,.3);E('#e58f3a',x+3,y+4,4,6,.3)}},{r:.3,b:.1,cross:1});
S('vit',76,76,.2,(w,h)=>{L(C.hoe,2.5,[[34,h-12],[32,h]]);L(C.hoe,2.5,[[42,h-12],[44,h]]);E(C.trang,36,h-26,24,16);P(C.trang,[[14,h-32],[2,h-46],[18,h-38]]);E(C.damau,40,h-26,11,6,-.3);E(C.trang,54,h-44,10);P(C.hoe,[[61,h-45],[74,h-41],[61,h-38]]);E(C.than,57,h-46,1.5)},{r:.08});

/* ---- món ăn mới ---- */
S('miquang',96,96,.25,(w,h)=>{P(C.trang,[[10,44],[86,44],[70,84],[26,84]]);L(C.nuoc,3,[[14,52],[82,52]]);E('#c98a3c',48,44,38,10);E('#e9c25a',48,43,32,7);E(C.son,34,42,7,3.5);E(C.hong,60,43,8,3.5);E(C.trang,48,38,6,4);E(C.hoe,48,38,3);for(let k=0;k<4;k++)E(C.nauL,30+k*12,45,2.5);E(C.la,64,38,3);
    P('#e8b866',[[56,34],[84,20],[88,32],[62,42]]);L(C.nauD,3,[[24,36],[8,6]]);L(C.nauD,3,[[30,38],[16,10]])});
S('comlam',96,96,.25,(w,h)=>{g.save();g.translate(w/2,h/2+6);g.rotate(-.45);P('#7aa04a',[[-40,-14],[34,-14],[34,14],[-40,14]]);P(C.laL,[[-40,-14],[34,-14],[34,-8],[-40,-8]]);L(C.laD,3,[[-14,-14],[-14,14]]);L(C.laD,3,[[16,-14],[16,14]]);E(C.laD,34,0,5,14);E(C.trang,-40,0,6,14);E('#eadfc0',-40,0,3.5,9);g.restore();
    P(C.trang,[[10,70],[28,60],[30,66],[14,78]]);Q(C.trang,3,18,52,10,40,18,30);Q(C.trang,3,30,50,24,38,32,26)});
S('hutieu',96,96,.25,(w,h)=>{P(C.trang,[[10,44],[86,44],[70,84],[26,84]]);L(C.son,3,[[12,50],[84,50]]);L(C.cham,2,[[22,66],[74,66]]);E('#c98a3c',48,44,38,10);E('#efe4c0',48,43,32,7);E(C.hong,34,42,8,4);E(C.hong,58,43,7,4);E(C.nauL,46,40,6,3);E(C.la,66,40,3);E(C.la,28,41,3);E(C.trang,48,44,10,3);
    L(C.nauD,3,[[58,40],[84,10]]);L(C.nauD,3,[[64,42],[90,14]]);Q(C.trang,3,34,30,28,20,36,10)});
S('banhxeo',96,96,.25,(w,h)=>{E(C.trang,48,74,42,12);g.fillStyle='#e8b24a';g.beginPath();g.ellipse(48,66,38,36,0,Math.PI,TAU);g.fill();g.fillStyle='#f3cf70';g.beginPath();g.ellipse(48,66,28,26,0,Math.PI,TAU);g.fill();L(C.hoeD,3,[[10,66],[86,66]]);
    for(let k=0;k<5;k++)E(C.son,28+k*10,48+(k%2)*6,3);Q(C.trang,3,36,32,40,22,52,28);Q(C.trang,3,52,30,60,20,70,32);leaf(C.laL,70,64,24,7,-.6);leaf(C.la,64,70,22,6,.2)});
S('xoi',96,96,.25,(w,h)=>{E(C.laD,48,74,44,15);E(C.la,48,72,38,11);['#d9473a',C.hoe,'#6aa84f','#7a3b8a',C.trang].forEach((c,k)=>{E(c,22+k*13,58,10,14);E('#ffffff',20+k*13,52,2.4)});L(C.nauL,3,[[40,86],[60,90]])});

/* ---- gói 2: thế giới sống (bóng ngủ, đom đóm, bến đò, dây đèn lồng chợ đêm) ---- */
S('zzz',110,84,.34,(w,h)=>{E(C.trang,52,32,48,26);P(C.trang,[[22,50],[14,76],[44,54]]);T(C.cham,'z z',52,33,'bold 32px');T(C.chamL,'z',88,14,'bold 18px')},{noEdge:0});
S('domdom',60,60,.17,(w,h)=>{E(C.trang,20,24,10,6,-.7);E(C.trang,40,24,10,6,.7);E(C.nauD,30,26,6,12);E('#ffe66a',30,44,9,8)},{glow:()=>{E('#fff6a8',30,44,14,13);E('#ffe66a',30,44,7)}});
S('bendo',220,100,.36,(w,h)=>{P(C.nauL,[[8,40],[212,40],[204,66],[16,66]]);for(let x=24;x<204;x+=22)L(C.nau,2,[[x,41],[x-4,66]]);R(C.nauD,10,64,200,8);for(const x of [22,110,198])L(C.nauD,10,[[x,70],[x,98]]);L(C.nau,3,[[22,66],[198,66]]);Q(C.rom,3,24,40,110,28,196,40)},{});
const ddlX=k=>20+k*36,ddlY=k=>12+62*(k/6)*(1-k/6);
S('daydenlong',260,84,.27,(w,h)=>{Q(C.than,2,2,12,130,46,258,12);for(let k=0;k<7;k++)lantern(ddlX(k),ddlY(k)+10,9,k%2?'#e8483a':'#ffb23e','#ffe9a6')},{glow:()=>{for(let k=0;k<7;k++){E('#ffd98a',ddlX(k),ddlY(k)+10,9,10);E('#ffb23e',ddlX(k),ddlY(k)+10,13,15)}}});

/* ---- dựng tấm atlas ---- */
const ATLAS_W=2048,ATLAS_H=4096,PAD=7,SPR={};let grainCv=null;
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const acv=mk(ATLAS_W,ATLAS_H),actx=acv.getContext('2d'),ecv=mk(ATLAS_W,ATLAS_H),ectx=ecv.getContext('2d');
ectx.fillStyle='#000';ectx.fillRect(0,0,ATLAS_W,ATLAS_H);
function edged(t,d){if(d.noEdge)return t;const o=mk(t.width,t.height),oc=o.getContext('2d');for(let k=0;k<12;k++)oc.drawImage(t,Math.cos(k/12*TAU)*3.4,Math.sin(k/12*TAU)*3.4);
  oc.globalCompositeOperation='source-in';oc.fillStyle=C.cream;oc.fillRect(0,0,t.width,t.height);oc.globalCompositeOperation='source-over';oc.drawImage(t,0,0);return o}
(function bake(){
  const order=DEFS.slice().sort((a,b)=>b.h-a.h);let x=2,y=2,rowH=0;
  for(const d of order){const W=d.w+PAD*2,H=d.h+PAD*2;if(x+W>ATLAS_W-2){x=2;y+=rowH+2;rowH=0}if(y+H>ATLAS_H)console.warn('atlas đầy',d.name);
    const t=mk(W,H);g=t.getContext('2d');g.translate(PAD,PAD);_a=1+d.name.length*977+d.w;d.draw(d.w,d.h);
    actx.drawImage(edged(t,d),x,y);
    if(d.glow){ectx.save();ectx.translate(x+PAD,y+PAD);g=ectx;d.glow(d.w,d.h);ectx.restore()}
    const sc=d.H/d.h;SPR[d.name]={u0:x/ATLAS_W,u1:(x+W)/ATLAS_W,v0:1-(y+H)/ATLAS_H,v1:1-y/ATLAS_H,cw:W*sc,ch:H*sc,pad:PAD*sc,def:d,px:[x,y,W,H]};
    x+=W+2;rowH=Math.max(rowH,H)}
  /* thớ giấy phủ lên mọi hình */
  const n=mk(256,256),nc=n.getContext('2d'),id=nc.createImageData(256,256);for(let i=0;i<id.data.length;i+=4){const v=Math.random();id.data[i]=id.data[i+1]=id.data[i+2]=v<.5?60:255;id.data[i+3]=Math.random()*26}
  nc.putImageData(id,0,0);nc.strokeStyle='rgba(90,60,30,.10)';nc.lineWidth=1;for(let k=0;k<70;k++){const fx=Math.random()*256,fy=Math.random()*256,a=Math.random()*TAU;nc.beginPath();nc.moveTo(fx,fy);nc.lineTo(fx+Math.cos(a)*14,fy+Math.sin(a)*14);nc.stroke()}
  grainCv=n;actx.globalCompositeOperation='source-atop';actx.fillStyle=actx.createPattern(n,'repeat');actx.fillRect(0,0,ATLAS_W,ATLAS_H);actx.globalCompositeOperation='source-over';
})();

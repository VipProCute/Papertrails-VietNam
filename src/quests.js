'use strict';
/* ============================== Việc vặt: nhờ vả nho nhỏ để chuyến đi có hướng ============================== */
const Q_GIVERS={quan:1,xebanhmi:1,hutieu:1,chonoi:1,nhasan:1,nharong:1};
/* nơi đến theo vùng: luôn là thứ có thật trong vùng đó */
const Q_DEST={dbsh:['dinh','gieng','conglang'],tb:['nhasan'],ntb:['nhapho','thapcham'],tn:['nharong'],dnb:['caooc'],tnb:['chonoi']};
const Q_NAME={dinh:'đình làng',gieng:'giếng làng',conglang:'cổng làng',nhasan:'nhà sàn',nhapho:'nhà phố cổ',thapcham:'tháp Chàm',nharong:'nhà rông',caooc:'cao ốc',chonoi:'ghe chợ nổi'};
/* d: nơi đến; t: tiêu đề ngắn; s: lời nhờ; r: phần thưởng (banh | khien | caphe) */
const Q_TPL=[
  {d:'dinh',t:'Ấm trà cho các cụ',s:'Bà Tư nhờ con mang ấm trà đá này ra đình làng cho các cụ đang đánh cờ.',r:'khien'},
  {d:'dinh',t:'Tờ báo ra đình',s:'Ông chủ quán nhờ con đem tờ báo sáng ra đình làng, các bác ngoài đó đang chờ đọc.',r:'banh'},
  {d:'dinh',t:'Nải chuối cúng đình',s:'Cô bán hàng nhờ con đem nải chuối chín này ra đình làng để cúng rằm.',r:'banh'},
  {d:'gieng',t:'Cái gáo mới',s:'Bác bán hàng gửi cái gáo mới ra giếng làng cho mấy bà hay ra rửa rau.',r:'banh'},
  {d:'gieng',t:'Chiếc xô bỏ quên',s:'Có người bỏ quên cái xô ở quán. Con mang ra giếng làng trả giúp nhé.',r:'khien'},
  {d:'conglang',t:'Thư gửi đầu làng',s:'Chú bán hàng nhờ đưa lá thư này tới cổng làng, bác đưa thư đang đợi ở đó.',r:'caphe'},
  {d:'conglang',t:'Bánh cho bác gác cổng',s:'Mang gói bánh nóng này ra cổng làng cho bác trông cổng, bác chưa kịp ăn sáng.',r:'banh'},
  {d:'nhasan',t:'Ấm trà lên nhà sàn',s:'Cô chủ nhờ con mang ấm trà nóng này lên nhà sàn, trên đó đang có khách quý.',r:'khien'},
  {d:'nhasan',t:'Cuộn vải thổ cẩm',s:'Mang cuộn vải thổ cẩm này tới nhà sàn, bà trong bản đang đợi để may áo.',r:'banh'},
  {d:'nhapho',t:'Lồng đèn cho nhà phố',s:'Chủ quán nhờ con mang chiếc lồng đèn mới tới một nhà phố cổ, họ treo trước hiên.',r:'banh'},
  {d:'nhapho',t:'Bát cao lầu nóng',s:'Bát cao lầu này còn nóng. Mang nhanh tới nhà phố cổ nhé, khách đang đói.',r:'khien'},
  {d:'thapcham',t:'Hoa dâng tháp Chàm',s:'Bà nhờ con đem bó hoa này tới tháp Chàm, bà đã hứa dâng từ sáng.',r:'caphe'},
  {d:'nharong',t:'Muối ớt cho già làng',s:'Bác nhờ con đem gói muối ớt này tới nhà rông, già làng đang họp bản.',r:'khien'},
  {d:'nharong',t:'Cà phê lên nhà rông',s:'Mang gói cà phê rang mới này tới nhà rông, anh em trong buôn đang đợi.',r:'caphe'},
  {d:'caooc',t:'Hộp cơm trưa',s:'Anh nhờ con mang hộp cơm này tới cao ốc, chị nhân viên quên mất bữa trưa.',r:'banh'},
  {d:'caooc',t:'Ly cà phê sữa đá',s:'Giao ly cà phê sữa đá này tới cao ốc kẻo đá tan, giờ họp sắp bắt đầu.',r:'caphe'},
  {d:'chonoi',t:'Giỏ chôm chôm',s:'Cô nhờ con mang giỏ chôm chôm này ra ghe chợ nổi, thương hồ đang đợi.',r:'banh'},
  {d:'chonoi',t:'Nhắn tin cho ghe',s:'Nhắn giùm cô một câu: ra ghe chợ nổi, hàng về đủ rồi. Bác sẽ mừng lắm.',r:'khien'}
];
const Q_REW={banh:'+2 bánh',khien:'một lần no bụng',caphe:'tỉnh táo 10 giây'};
const QST={cur:null,scanT:0,seen:{},cool:0,card:null,hintKey:''};
function qRegionId(){try{return regionAt(player.x,player.z).id||'dbsh'}catch(e){return'dbsh'}}
/* giver đang đứng gần (trong các ô đã tải) */
function qFindGiver(){let best=null,bd=.49;tiles.forEach(t=>{if(!t.marks)return;for(const m of t.marks)if(Q_GIVERS[m.id]){const d=(m.x-player.x)**2+(m.z-player.z)**2;if(d<bd){bd=d;best=m}}});return best}
/* nơi đến gần nhất đã tải, cách giver >= 12 */
function qFindDest(q,from){let best=null,bd=1e9;tiles.forEach(t=>{if(!t.marks)return;for(const m of t.marks)if(m.id===q.dest&&Math.hypot(m.x-q.gx,m.z-q.gz)>=12){const d=Math.hypot(m.x-from.x,m.z-from.z);if(d<bd){bd=d;best=m}}});return best?{m:best,d:bd}:null}
function qPickOffer(g){const kinds=Q_DEST[qRegionId()]||Q_DEST.dbsh,dk=kinds[Math.floor(Math.random()*kinds.length)];
  const opts=[];Q_TPL.forEach((t,i)=>{if(t.d===dk)opts.push(i)});const ti=opts[Math.floor(Math.random()*opts.length)];
  return {id:'q'+ti,ti,dest:dk,gx:g?g.x:player.x,gz:g?g.z:player.z}}
function qSave(){SAVE.quest=QST.cur?{id:QST.cur.id,ti:QST.cur.ti,dest:QST.cur.dest,gx:QST.cur.gx,gz:QST.cur.gz}:{};saveSoon()}
function qCanOffer(){return state==='play'&&!modal&&!QST.cur&&invT<=0&&downT<=0&&!(typeof dogs!=='undefined'&&dogs.some(d=>d.state==='chase'||d.state==='alert'))}
function qOpenCard(q){if(QST.card||!qCanOffer()||!openModal('quest'))return false;QST.card=q;try{keys.clear();ptr=null}catch(e){}
  $('qText').textContent=Q_TPL[q.ti].s;$('qRew').textContent='Thưởng: '+Q_REW[Q_TPL[q.ti].r]+'. Tìm '+Q_NAME[q.dest]+' gần đây.';$('qCard').hidden=false;$('qYes').focus();return true}
function qCloseCard(){QST.card=null;$('qCard').hidden=true;closeModal('quest');try{$('qYes').blur()}catch(e){}}
function qAccept(){const q=QST.card;if(!q)return;qCloseCard();QST.cur=q;QST.hintKey='';qSave();qRefresh(true);BUS.emit('quest',{state:'start',id:q.id});toast('Nhận việc: '+Q_TPL[q.ti].t)}
function qLater(){if(!QST.card)return;qCloseCard();QST.cool=60}
function qDrop(silent){if(!QST.cur)return;const id=QST.cur.id;QST.cur=null;qSave();qRefresh(true);BUS.emit('quest',{state:'drop',id});if(!silent)toast('Đã bỏ việc')}
function qComplete(){const q=QST.cur;if(!q)return;const tp=Q_TPL[q.ti];QST.cur=null;
  if(tp.r==='banh'){food+=2}else if(tp.r==='khien'){shield=Math.min(2,shield+1)}else if(typeof eatFood==='function'){eatFood('caphe')}else{food+=2}
  SAVE.stats.errands=(SAVE.stats.errands||0)+1;qSave();toast('Xong việc! Thưởng: '+Q_REW[tp.r]);BUS.emit('quest',{state:'done',id:q.id});
  const n=SAVE.stats.errands;if(typeof awardStamp==='function'){if(n>=1)awardStamp('q_1');if(n>=5)awardStamp('q_5');if(n>=15)awardStamp('q_15')}
  qRefresh(true);try{if(typeof tone==='function'){tone(660,.15,'triangle',.12);tone(990,.3,'sine',.1,0,.12)}}catch(e){}}
/* cập nhật thẻ nhỏ dưới HUD */
function qRefresh(force){const el=$('qTag');if(!el)return;
  if(!QST.cur||state!=='play'){if(!el.hidden)el.hidden=true;QST.hintKey='';return}
  const tp=Q_TPL[QST.cur.ti];let txt,deg=null;const f=qFindDest(QST.cur,player);
  if(f){const dx=f.m.x-player.x,dz=f.m.z-player.z;deg=(Math.atan2(dx,-dz)*180/Math.PI+360)%360;txt=Q_NAME[QST.cur.dest]+' · '+Math.round(f.d*2/10)*10+' m'}
  else txt='Hỏi đường: tìm '+Q_NAME[QST.cur.dest]+' quanh đây';
  const k=tp.t+'|'+txt+'|'+(deg===null?'':Math.round(deg/3));if(!force&&k===QST.hintKey)return;QST.hintKey=k;
  el.hidden=false;$('qTitle').textContent=tp.t;$('qHint').textContent=txt;const a=$('qArrow');a.style.display=deg===null?'none':'';if(deg!==null)a.style.transform='rotate('+deg.toFixed(1)+'deg)'}
function qScan(){
  if(QST.cur){const f=qFindDest(QST.cur,player);if(f&&f.d<1.6){qComplete();return}qRefresh();return}
  if(QST.cool>0||!qCanOffer())return;const g=qFindGiver();if(!g)return;const key=Math.round(g.x)+','+Math.round(g.z),now=performance.now();
  if(QST.seen[key]&&now-QST.seen[key]<60000)return;QST.seen[key]=now;qOpenCard(qPickOffer(g))}
BUS.on('tick',dt=>{if(QST.cool>0)QST.cool-=dt;QST.scanT-=dt;if(QST.scanT>0)return;QST.scanT=1;qScan()});
BUS.on('over',()=>{qDrop(true)});BUS.on('restart',()=>{QST.cool=0;qDrop(true)});
BUS.on('begin',()=>{QST.cool=15;const s=SAVE.quest;
  if(s&&typeof s.ti==='number'&&Q_TPL[s.ti]&&Q_TPL[s.ti].d===s.dest&&typeof s.gx==='number'&&typeof s.gz==='number')QST.cur={id:s.id,ti:s.ti,dest:s.dest,gx:s.gx,gz:s.gz};
  qRefresh(true)});
/* bàn phím: Enter nhận, Esc để sau (bắt trước các trình nghe khác, kể cả Esc của sổ tem) */
addEventListener('keydown',e=>{if(!QST.card)return;if(e.code==='Enter'||e.code==='NumpadEnter'){if(document.activeElement&&document.activeElement.id==='qNo')return;e.preventDefault();e.stopImmediatePropagation();qAccept()}else if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();qLater()}},true);
$('qYes').addEventListener('click',qAccept);$('qNo').addEventListener('click',qLater);$('qDrop').addEventListener('click',()=>qDrop(false));
/* gỡ lỗi: __quests.offer() mở thẻ ngay, .accept(), .complete() hoàn thành ngay */
window.__quests={Q:QST,offer(){QST.cool=0;if(QST.cur)return false;return qOpenCard(qPickOffer(qFindGiver()))},accept:qAccept,complete:qComplete,drop:()=>qDrop(false),scan:qScan,TPL:Q_TPL};

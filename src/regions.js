'use strict';
/* ============================== sáu vùng đất theo địa lý thật ============================== */
/* trên màn hình: lên = bắc = z âm. Toạ độ ô (i,j) = (x/2, z/2). site = tâm vùng (đơn vị ô). */
const BIOME=[
  {id:'dbsh',name:'Đồng bằng sông Hồng',col:'#b3b168',site:[0,0],music:'dbsh',amb:'fields',bike:1,foods:['banhmi','pho','banhchung','caphe']},
  {id:'tnb',name:'Tây Nam Bộ',col:'#9cb866',site:[-18,112],music:'tnb',amb:'river',bike:.8,foods:['banhmi','banhxeo','hutieu']},
  {id:'ntb',name:'Nam Trung Bộ',col:'#d6bf8c',site:[14,40],music:'ntb',amb:'coast',bike:1.2,foods:['banhmi','miquang','caphe']},
  {id:'tb',name:'Tây Bắc',col:'#93b07c',site:[-34,-14],music:'tb',amb:'mountain',bike:.5,foods:['banhmi','xoi','comlam']},
  {id:'tn',name:'Tây Nguyên',col:'#c9a274',site:[-22,48],music:'tn',amb:'forest',bike:.7,foods:['banhmi','comlam','caphe']},
  {id:'dnb',name:'Đông Nam Bộ',col:'#cfc4a8',site:[4,84],music:'dnb',amb:'city',bike:1.8,foods:['banhmi','hutieu','caphe']}];
BIOME.forEach(b=>b.lin=new THREE.Color(b.col).convertSRGBToLinear());
const REGION_BY_ID={};BIOME.forEach((b,k)=>{b.b=k;REGION_BY_ID[b.id]=b});
/* vùng gần nhất sau khi uốn toạ độ bằng nhiễu thấp tần để biên giới lượn sóng */
function biomeAt(i,j){if(i*i+j*j<20)return 0;
  const wi=i+(vnoise(i/9,j/9,31)-.5)*10,wj=j+(vnoise(i/9+50,j/9+17,32)-.5)*10;let best=0,bd=1e18;
  for(let k=0;k<BIOME.length;k++){const s=BIOME[k].site,d=(wi-s[0])*(wi-s[0])+(wj-s[1])*(wj-s[1]);if(d<bd){bd=d;best=k}}return best}
const regionAt=(x,z)=>BIOME[biomeAt(Math.round(x/2),Math.round(z/2))];
/* gợi ý vùng chưa ghé gần nhất: ang = góc hướng (atan2(dz,dx) trong toạ độ thế giới) */
function nextRegionHint(x,z,visited){let best=null,bd=1e18;
  for(let k=0;k<BIOME.length;k++){const r=BIOME[k];if(visited&&visited.has&&visited.has(r.id))continue;const dx=r.site[0]*2-x,dz=r.site[1]*2-z,d=Math.hypot(dx,dz);if(d<bd){bd=d;best={b:k,name:r.name,ang:Math.atan2(dz,dx),dist:d}}}return best}

/* sprite -> id con dấu (nhật ký) */
const LANDMARK={dinh:'dinh',conglang:'conglang',gieng:'gieng',quan:'quan',xebanhmi:'xebanhmi',da:'da',nharong:'nharong',congchieng:'congchieng',thapcham:'thapcham',thuyenthung:'thuyenthung',
  caooc:'caooc',xehutieu:'hutieu',cay_caosu:'caosu',ray_caphe:'caphe_ray',caphe_cay:'caphe_ray',nhasan:'nhasan',nhapho:'nhapho',ghe:'chonoi',cayxoai:'miet_vuon',bunhin:'bunhin',rom:'rom'};

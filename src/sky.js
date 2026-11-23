'use strict';
/* ============================== ngày và đêm, máy quay ============================== */
const cDay=new THREE.Color('#d9c9a3'),cNight=new THREE.Color('#0c1024'),cTmp=new THREE.Color();
const sDay=new THREE.Color('#fff1d6'),sNight=new THREE.Color('#6d8be0'),hDay=new THREE.Color('#fff6e0'),hNight=new THREE.Color('#2a3a78'),gDay=new THREE.Color('#b9a47a'),gNight=new THREE.Color('#10152a'),sDusk=new THREE.Color('#ff9a5a');
const DAYLEN=190;let nightBtn=-1;
function dayNight(){const ph=(clock%DAYLEN)/DAYLEN,n=smooth((ph-.52)/.12)-smooth((ph-.9)/.08),dusk=Math.max(0,1-Math.abs(n-.5)*2);nightF=n;
  cTmp.copy(cDay).lerp(cNight,n);if(dusk>0)cTmp.lerp(sDusk,dusk*.18);scene.background.copy(cTmp);scene.fog.color.copy(cTmp);base.material.color.set('#cbbf8f').lerp(cNight,n*.85);
  sun.color.copy(sDay).lerp(sNight,n).lerp(sDusk,dusk*.45);sun.intensity=lerp(.84,.17,n);hemi.color.copy(hDay).lerp(hNight,n);hemi.groundColor.copy(gDay).lerp(gNight,n);hemi.intensity=lerp(.7,.3,n);
  cardMat.emissiveIntensity=lerp(.1,1.15,n);haloMat.opacity=n*.85;lamp.intensity=n*1.9;
  const wu=waterMat.uniforms;wu.uN.value=n;wu.uT.value=time;let bn=0;for(const t of tiles.values())if(t.glowBr&&t.p>.9&&Math.hypot(t.i-player.x/TS,t.j-player.z/TS)<6){wu.uBr.value[bn++].set(...t.glowBr);if(bn===6)break}wu.uBn.value=bn;
  mFinal.uniforms.uBloom.value=lerp(.05,.8,n);mFinal.uniforms.uN.value=n;mFinal.uniforms.uT.value=time;mBright.uniforms.th.value=lerp(.96,.6,n);
  flies.visible=n>.02;if(flies.visible){ffMat.opacity=n*.95;for(let k=0;k<FFN;k++){const q=ffSeed[k],bx=player.x+mod(q[3]-player.x+5.5,11)-5.5,bz=player.z+mod(q[4]-player.z+5.5,11)-5.5,bl=.5+.5*Math.sin(time*q[2]*2.2+q[0]);
      ffPos[k*3]=bx+Math.sin(time*.5*q[2]+q[0])*.5;ffPos[k*3+1]=bl<.25?-5:.18+.22*(1+Math.sin(time*.7+q[1]));ffPos[k*3+2]=bz+Math.cos(time*.4*q[2]+q[1])*.5}ffGeo.attributes.position.needsUpdate=true}
  const nb=n>.5?1:0;if(nb!==nightBtn){const first=nightBtn<0;nightBtn=nb;if(!first)BUS.emit('night',{night:!!nb});$('bNight').textContent=nb?'Chuyển ngày':'Chuyển đêm'}return n}
function toggleNight(){const ph=(clock%DAYLEN)/DAYLEN;clock+=(ph>.5&&ph<.93?(1.02-ph):mod(.66-ph,1))*DAYLEN}
$('bNight').addEventListener('click',toggleNight);
const camT=new THREE.Vector3();let camDist=10.8;
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);postSize();camera.aspect=w/h;camDist=10.8*clamp(1.45/camera.aspect,1,1.75);camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
function updateCamera(dt){const k=1-Math.exp(-dt*3.4);camT.x+=(player.x+heading[0]*.5-camT.x)*k;camT.z+=(player.z-.55+heading[1]*.4-camT.z)*k;
  const pitch=42*Math.PI/180,d=camDist*(typeof viewK==='number'?viewK:1)*(state==='over'?.86:1);camera.position.set(camT.x+Math.sin(time*.4)*.03,d*Math.sin(pitch),camT.z+d*Math.cos(pitch));camera.lookAt(camT.x,0,camT.z);
  sun.position.set(player.x-5,10,player.z+6.5);sun.target.position.set(player.x,0,player.z);base.position.set(player.x,-.02,player.z);water.position.x=Math.round(player.x);water.position.z=Math.round(player.z);lamp.position.set(player.x+player.dir*.1,.3,player.z+.15)}

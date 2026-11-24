'use strict';
/* ============================== cảnh 3D ============================== */
const canvas=$('c');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'})}
catch(e){$('err').hidden=false;$('err').textContent='Trình duyệt này không bật được WebGL nên game không chạy được.';throw e}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.outputEncoding=THREE.sRGBEncoding;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#d9c9a3');scene.fog=new THREE.Fog('#d9c9a3',14.5,22);
const camera=new THREE.PerspectiveCamera(27,1,.8,70);
const hemi=new THREE.HemisphereLight('#fff6e0','#b9a47a',.78);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff1d6',.95);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:1,far:40});sun.shadow.bias=-.0012;sun.shadow.radius=3;scene.add(sun,sun.target);
const lamp=new THREE.PointLight('#ffb866',0,4.2,1.5);scene.add(lamp);
const bikeLight=new THREE.PointLight('#fff0c0',0,3.6,1.6);scene.add(bikeLight);

const atlasTex=new THREE.CanvasTexture(acv);atlasTex.encoding=THREE.sRGBEncoding;atlasTex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
const glowTex=new THREE.CanvasTexture(ecv);glowTex.encoding=THREE.sRGBEncoding;
const cardMat=new THREE.MeshLambertMaterial({map:atlasTex,emissiveMap:glowTex,emissive:0xffffff,emissiveIntensity:.15,alphaTest:.5,side:THREE.DoubleSide});
const flatMat=new THREE.MeshLambertMaterial({map:atlasTex,alphaTest:.5});
const paperTex=(()=>{const c=mk(256,256),x=c.getContext('2d');x.fillStyle='#f4f0e4';x.fillRect(0,0,256,256);for(let k=0;k<2600;k++){x.fillStyle=`rgba(${Math.random()<.5?'80,60,30':'255,255,255'},${Math.random()*.07})`;x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*2,1+Math.random()*2)}
  x.strokeStyle='rgba(90,70,40,.06)';for(let k=0;k<90;k++){const fx=Math.random()*256,fy=Math.random()*256,a=Math.random()*TAU;x.beginPath();x.moveTo(fx,fy);x.lineTo(fx+Math.cos(a)*18,fy+Math.sin(a)*18);x.stroke()}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;return t})();
const groundMat=new THREE.MeshLambertMaterial({map:paperTex,vertexColors:true});
const haloTex=(()=>{const c=mk(128,128),x=c.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,190,90,.9)');gr.addColorStop(.4,'rgba(255,170,70,.35)');gr.addColorStop(1,'rgba(255,160,60,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})();
const haloMat=new THREE.MeshBasicMaterial({map:haloTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
const haloGeo=new THREE.PlaneGeometry(1.7,1.7).rotateX(-HALF);
const base=new THREE.Mesh(new THREE.PlaneGeometry(90,90).rotateX(-HALF),new THREE.MeshLambertMaterial({color:'#cbbf8f'}));base.position.y=-.02;scene.add(base);
/* nước giấy, ánh đèn trên sóng */
const waterMat=new THREE.ShaderMaterial({fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uN:{value:0},uBr:{value:Array.from({length:6},()=>new THREE.Vector4())},uBn:{value:0}}]),vertexShader:
 `varying vec2 vW;
 #include <fog_pars_vertex>
 void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;
 #include <fog_vertex>
 }`,fragmentShader:
 `varying vec2 vW;uniform float uT,uN;uniform vec4 uBr[6];uniform int uBn;const float RW=.5,RSP=17.;
 #include <fog_pars_fragment>
 float riverF(float x,float z){return (x*.866-z*.5)/RSP+.32+.07*sin(z*.23+1.3)+.045*sin(x*.17+z*.11);}
 vec4 riverInfo(float x,float z){float f=riverF(x,z),q=f-floor(f)-.5;float gx=.866/RSP+.045*.17*cos(x*.17+z*.11),gz=-.5/RSP+.07*.23*cos(z*.23+1.3)+.045*.11*cos(x*.17+z*.11);
  float g=length(vec2(gx,gz)),sg=q<0.?-1.:1.;return vec4(abs(q)/g,gx/g*sg,gz/g*sg,sg);}
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 void main(){vec4 ri=riverInfo(vW.x,vW.y);float d=ri.x;if(d>RW)discard;vec3 col=vec3(.37,.61,.60);
  if(d>RW-.045)col=vec3(.937,.902,.80);else if(d>RW-.12)col=vec3(.30,.52,.53);
  else{float along=dot(vW,vec2(.5,.866)),wave=pow(.5+.5*sin(along*24.+uT*1.4+sin(vW.x*3.)),18.);col=mix(col,vec3(.65,.80,.75),wave*.15);}
  col+=(hash(floor(vW*260.))-.5)*.06;col=mix(col,col*vec3(.16,.21,.38),uN*.92);
  for(int k=0;k<6;k++){if(k>=uBn)break;vec4 b=uBr[k];vec2 dv=b.zw-b.xy;float t=dot(vW-b.xy,dv)/dot(dv,dv),dz=vW.y-mix(b.y,b.w,t);
   dz-=.5;if(t>=0.&&t<=1.&&dz>0.&&dz<1.1){float f=1.-dz/1.1,col8=pow(.5+.5*sin(t*50.27),3.),rip=.6+.4*sin(dz*30.-uT*2.2+vW.x*7.);col+=vec3(1.,.62,.22)*uN*f*(.16+.8*col8*rip);}}
  gl_FragColor=vec4(col,1.);
 #include <fog_fragment>
 }`});
const water=new THREE.Mesh(new THREE.PlaneGeometry(40,40).rotateX(-HALF),waterMat);water.position.y=.015;water.receiveShadow=false;scene.add(water);

const GEO={},FGEO={};
function setUV(geo,s){const uv=geo.attributes.uv;for(let k=0;k<4;k++)uv.setXY(k,lerp(s.u0,s.u1,uv.getX(k)),lerp(s.v0,s.v1,uv.getY(k)));return geo}
function cardGeo(n){if(!GEO[n]){const s=SPR[n];GEO[n]=setUV(new THREE.PlaneGeometry(s.cw,s.ch).translate(0,s.ch/2-s.pad,0),s)}return GEO[n]}
function flatGeo(n){if(!FGEO[n])FGEO[n]=setUV(new THREE.PlaneGeometry(1,1),SPR[n]).rotateX(-HALF);return FGEO[n]}
const depthMat=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:atlasTex,alphaTest:.5,side:THREE.DoubleSide});
function cardMesh(n){const m=new THREE.Mesh(cardGeo(n),cardMat);m.castShadow=true;m.customDepthMaterial=depthMat;return m}

/* ---- hậu kỳ: làm mờ xa gần kiểu tilt-shift, quầng sáng đèn, chỉnh màu, tối góc, hạt giấy ---- */
const POST={on:true,q:0,rs:null,h1:null,h2:null,q1:null,q2:null,cam:new THREE.OrthographicCamera(-1,1,1,-1,0,1),scn:new THREE.Scene(),quad:null};
const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const mBlur=new THREE.ShaderMaterial({uniforms:{t:{value:null},d:{value:new THREE.Vector2()}},vertexShader:VS,depthTest:false,depthWrite:false,fragmentShader:
 'varying vec2 vUv;uniform sampler2D t;uniform vec2 d;void main(){vec4 c=texture2D(t,vUv)*.227;c+=(texture2D(t,vUv+d)+texture2D(t,vUv-d))*.1946;c+=(texture2D(t,vUv+d*2.)+texture2D(t,vUv-d*2.))*.1216;c+=(texture2D(t,vUv+d*3.)+texture2D(t,vUv-d*3.))*.054;c+=(texture2D(t,vUv+d*4.)+texture2D(t,vUv-d*4.))*.0162;gl_FragColor=c;}'});
const mBright=new THREE.ShaderMaterial({uniforms:{t:{value:null},th:{value:.7}},vertexShader:VS,depthTest:false,depthWrite:false,fragmentShader:
 'varying vec2 vUv;uniform sampler2D t;uniform float th;void main(){vec3 c=texture2D(t,vUv).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(th,th+.22,l),1.);}'});
const mFinal=new THREE.ShaderMaterial({uniforms:{tS:{value:null},tB:{value:null},tG:{value:null},uBloom:{value:.2},uN:{value:0},uT:{value:0},uF:{value:.46},uRes:{value:new THREE.Vector2(1,1)}},vertexShader:VS,depthTest:false,depthWrite:false,fragmentShader:
 `varying vec2 vUv;uniform sampler2D tS,tB,tG;uniform float uBloom,uN,uT,uF;uniform vec2 uRes;
 float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
 void main(){float dy=vUv.y-uF;float coc=smoothstep(.12,.44,abs(dy))*(dy>0.?1.:.85);
  vec3 c=mix(texture2D(tS,vUv).rgb,texture2D(tB,vUv).rgb,coc);vec3 g=texture2D(tG,vUv).rgb*uBloom;c=1.-(1.-c)*(1.-min(g,vec3(1.)));c+=g*.35;
  float l=dot(c,vec3(.299,.587,.114));c=mix(c,c*vec3(.78,.9,1.18),uN*(1.-smoothstep(.2,.65,l))*.7);
  c=mix(vec3(l),c,1.03);c=(c-.5)*1.07+.5+vec3(.012,.006,-.008)*(1.-uN);
  float v=smoothstep(.42,1.02,length((vUv-.5)*vec2(1.12,1.)));c*=1.-v*(.4+.28*uN);
  c+=(hash(vUv*uRes+fract(uT)*61.)-.5)*.04;gl_FragColor=vec4(c,1.);}`});
POST.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mBlur);POST.quad.frustumCulled=false;POST.scn.add(POST.quad);
function postSize(){const w=canvas.width,h=canvas.height,o={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:false};
  ['rs','h1','h2','q1','q2'].forEach(k=>POST[k]&&POST[k].dispose());
  const RT=renderer.capabilities.isWebGL2&&THREE.WebGLMultisampleRenderTarget?THREE.WebGLMultisampleRenderTarget:THREE.WebGLRenderTarget;
  POST.rs=new RT(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:true});POST.rs.texture.encoding=THREE.sRGBEncoding;
  const w2=Math.max(2,w>>1),h2=Math.max(2,h>>1),w4=Math.max(2,w>>2),h4=Math.max(2,h>>2);
  POST.h1=new THREE.WebGLRenderTarget(w2,h2,o);POST.h2=new THREE.WebGLRenderTarget(w2,h2,o);POST.q1=new THREE.WebGLRenderTarget(w4,h4,o);POST.q2=new THREE.WebGLRenderTarget(w4,h4,o);mFinal.uniforms.uRes.value.set(w,h)}
function pass(m,dst){POST.quad.material=m;renderer.setRenderTarget(dst);renderer.render(POST.scn,POST.cam)}
function blur(src,tmp,dst,sp){mBlur.uniforms.t.value=src.texture;mBlur.uniforms.d.value.set(sp/src.width,0);pass(mBlur,tmp);mBlur.uniforms.t.value=tmp.texture;mBlur.uniforms.d.value.set(0,sp/src.height);pass(mBlur,dst)}
function draw(){if(!POST.on){renderer.setRenderTarget(null);renderer.render(scene,camera);return}
  renderer.setRenderTarget(POST.rs);renderer.render(scene,camera);
  blur(POST.rs,POST.h1,POST.h2,1.2);blur(POST.h2,POST.h1,POST.h2,2.4);
  mBright.uniforms.t.value=POST.h2.texture;pass(mBright,POST.q1);blur(POST.q1,POST.q2,POST.q1,1.4);blur(POST.q1,POST.q2,POST.q1,3.2);
  const u=mFinal.uniforms;u.tS.value=POST.rs.texture;u.tB.value=POST.h2.texture;u.tG.value=POST.q1.texture;pass(mFinal,null)}
/* đom đóm ban đêm */
const FFN=46,ffPos=new Float32Array(FFN*3),ffSeed=[];for(let k=0;k<FFN;k++)ffSeed.push([Math.random()*TAU,Math.random()*TAU,.5+Math.random(),Math.random()*11,Math.random()*11]);
const ffGeo=new THREE.BufferGeometry();ffGeo.setAttribute('position',new THREE.BufferAttribute(ffPos,3));
const dotTex=(()=>{const c=mk(32,32),x=c.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'#fff');gr.addColorStop(.35,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);return new THREE.CanvasTexture(c)})();
const ffMat=new THREE.PointsMaterial({map:dotTex,color:'#e4ff7a',size:.13,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
const flies=new THREE.Points(ffGeo,ffMat);flies.frustumCulled=false;flies.visible=false;scene.add(flies);
const beamMat=new THREE.MeshBasicMaterial({map:dotTex,color:'#ffe9b0',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
const beam=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-HALF),beamMat);beam.visible=false;scene.add(beam);
let nightF=0;

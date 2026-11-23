# Cat gon, chuan hoa va ma hoa MP3 cac tieng dong CC0. Dung: python sfxproc.py <sfx_raw> <out_dir> <pylib>
import sys,os,json
sys.path.insert(0,sys.argv[3])
import numpy as np,soundfile as sf,lameenc
from scipy.signal import resample_poly
raw,out=sys.argv[1],sys.argv[2];SR=44100
def load(f):
    x,sr=sf.read(os.path.join(raw,f),always_2d=True);x=x.mean(axis=1)
    if sr!=SR:x=resample_poly(x,SR,sr)
    return x.astype(np.float64)
def bursts(x,gap=.08,th=.05):
    m=np.abs(x);idx=np.where(m>m.max()*th)[0];cut=np.where(np.diff(idx)>SR*gap)[0];s=[idx[0]]+[idx[c+1] for c in cut];e=[idx[c] for c in cut]+[idx[-1]]
    return [x[max(0,a-200):b+int(SR*.06)] for a,b in zip(s,e) if b-a>SR*.04]
def trim(x,th=.02):
    m=np.abs(x);idx=np.where(m>m.max()*th)[0];return x[max(0,idx[0]-100):idx[-1]+1]
def shot(x,maxs,peak):
    x=trim(x)[:int(maxs*SR)].copy();n=min(len(x)//3,int(SR*.12));x[-n:]*=np.linspace(1,0,n);x[:64]*=np.linspace(0,1,64);return x/np.abs(x).max()*peak
def loop(x,start,dur,peak,xf=.7):
    a=int(start*SR);n=int(dur*SR);k=int(xf*SR);seg=x[a:a+n+k].copy()
    if len(seg)<n+k:n=len(seg)-k
    body=seg[:n].copy();t=np.linspace(0,1,k);body[:k]=body[:k]*np.sqrt(t)+seg[n:n+k]*np.sqrt(1-t)
    return body/np.abs(body).max()*peak
def enc(x,name,kbps=96):
    e=lameenc.Encoder();e.set_bit_rate(kbps);e.set_in_sample_rate(SR);e.set_channels(1);e.set_quality(2)
    b=e.encode((np.clip(x,-1,1)*32767).astype(np.int16).tobytes())+e.flush();open(os.path.join(out,name),'wb').write(b);return len(b)
M={};SRC={}
def add(key,x,src,kbps=96):
    n=len(M.setdefault(key,[]))+1;fn=f"{key}_{n}.mp3";sz=enc(x,fn,kbps);M[key].append(fn);SRC[fn]=src;print(f"{fn:22s} {len(x)/SR:5.2f}s {sz//1024:4d}KB <- {src}")
S=lambda key,files,maxs=1.0,peak=.8:[add(key,shot(load(f),maxs,peak),f) for f in files]
S('step_dirt',['step_dirt_1.ogg'],.5,.5)
for b in bursts(load('step_dirt_2.mp3'))[1:4]:add('step_dirt',shot(b,.45,.5),'step_dirt_2.mp3')
S('step_grass',['step_leaves_1.ogg','step_leaves_2.ogg'],.45,.45);S('step_wood',['step_wood_1.ogg','step_wood_2.ogg','step_wood_3.ogg'],.35,.55)
S('step_paddy',['step_mud_1.ogg','step_mud_2.ogg','step_mud_3.ogg'],.5,.5)
for b in bursts(load('dog_bark_1.wav'),gap=.06)[:3]:add('dog_bark',shot(b,.6,.8),'dog_bark_1.wav')
S('dog_growl',['dog_growl_1.ogg'],.7,.7);S('horn',['horn_bicycle_1.wav'],.8,.7);S('flap',['wing_flap_1.ogg'],2.2,.7)
S('bell',['bell_temple_1.wav'],5.5,.8);S('gong',['gong_2.ogg'],4.0,.8);S('gong',['gong_pack_1.ogg'],1.4,.8)
S('woodblock',['woodblock_1.ogg','woodblock_2.ogg','woodblock_3.ogg'],.35,.7);S('chime',['bell_pack_1.ogg'],1.3,.6)
S('paper',['paper_rustle_1.mp3','paper_rustle_2.mp3','paper_rustle_3.mp3'],.6,.5);S('page',['page_turn_1.wav','page_turn_2.wav','page_turn_3.wav'],.9,.6)
S('stamp',['stamp_thud_1.ogg','stamp_thud_2.ogg'],.45,.8);S('pickup',['pickup_pop_1.ogg','pickup_key_1.mp3'],.5,.6);S('coin',['coin_1.ogg','coin_2.ogg','coin_3.ogg'],.45,.6)
S('shutter',['camera_shutter_1.ogg','camera_shutter_2.ogg'],.9,.7);S('success',['success_chime_1.ogg'],2.3,.6);S('splash',['splash_1.ogg','splash_2.ogg','splash_3.ogg'],1.4,.7)
for key,f,st,du in [('amb_frogs','amb_frogs_poland.ogg',.5,20),('amb_crickets','amb_crickets.mp3',.3,10),('amb_birds','amb_birds_morning.ogg',2,24),('amb_river','amb_stream_2.ogg',.2,6),
    ('amb_rain','amb_rain_1.mp3',10,18),('amb_market','amb_market_crowd.ogg',1,20),('amb_waves','amb_waves_beach_1.flac',.1,3.2),('amb_wind','amb_wind_1.ogg',.6,5.2)]:
    x=load(f);xf=.7 if du>5 else .4;M.setdefault(key,[]);fn=key+'.mp3';sz=enc(loop(x,st,du,.5,xf),fn,80);M[key].append(fn);SRC[fn]=f;print(f"{fn:22s} {du:5.1f}s {sz//1024:4d}KB <- {f}")
json.dump({'sounds':M},open(os.path.join(out,'manifest.json'),'w'),indent=1)
cr={c['file']:c for c in json.load(open(os.path.join(raw,'credits.json'),encoding='utf-8'))}
L=['# Nguồn tiếng động','','Mọi file trong thư mục này đều là CC0 hoặc phạm vi công cộng, đã cắt gọn và chuyển sang MP3.','','| File | Gốc | Tác giả | Giấy phép | Trang nguồn |','| --- | --- | --- | --- | --- |']
for fn in sorted(SRC):
    c=cr.get(SRC[fn],{});L.append(f"| {fn} | {c.get('title',SRC[fn])} | {c.get('author','?')} | {c.get('licence','?')} | {c.get('source_page','?')} |")
open(os.path.join(out,'CREDITS.md'),'w',encoding='utf-8').write('\n'.join(L)+'\n')
print('missing credits:',[SRC[f] for f in SRC if SRC[f] not in cr])

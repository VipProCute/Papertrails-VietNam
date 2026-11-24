# Goi Space victor/ace-step-jam (ACE-Step 1.5) qua Gradio HTTP API. Dung: python acejam.py spec.json outdir [ten ...]
import json,sys,time,os,requests,base64
sys.stdout.reconfigure(encoding='utf-8',errors='replace')
BASE='https://victor-ace-step-jam.hf.space/gradio_api'
spec=json.load(open(sys.argv[1],encoding='utf-8'));out=sys.argv[2];only=set(sys.argv[3:])
def gen(t):
    data=[t['prompt'],t.get('lyrics','[Instrumental]'),float(t.get('dur',120)),int(t.get('steps',8)),float(t.get('cfg',7.0)),int(t.get('seed',-1)),'',0.8]
    r=requests.post(BASE+'/call/generate',json={'data':data},timeout=60);r.raise_for_status();eid=r.json()['event_id']
    ev=None
    with requests.get(BASE+'/call/generate/'+eid,stream=True,timeout=900) as s:
        for line in s.iter_lines(decode_unicode=True):
            if not line: continue
            if line.startswith('event:'): ev=line[6:].strip()
            elif line.startswith('data:'):
                body=line[5:].strip()
                if ev=='complete': return json.loads(body)
                if ev=='error': raise RuntimeError(body[:400])
    raise RuntimeError('stream ended')
for t in spec:
    if only and t['name'] not in only: continue
    t0=time.time()
    try:
        res=gen(t);f=res[0]
        if isinstance(f,str) and f.startswith('data:'):
            ext='.wav';b=base64.b64decode(f.split(',',1)[1])
        else:
            url=f.get('url') if isinstance(f,dict) else None
            if not url: print(t['name'],'NO URL',str(res)[:200]);continue
            ext=os.path.splitext(url.split('?')[0])[1] or '.wav';b=requests.get(url,timeout=300).content
        p=os.path.join(out,t['name']+ext);open(p,'wb').write(b)
        print(t['name'],'OK',len(b)//1024,'KB',ext,round(time.time()-t0),'s',flush=True)
    except Exception as e: print(t['name'],'FAIL',str(e)[:400],flush=True)

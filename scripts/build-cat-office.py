"""Build same-origin licensed photos and deterministic original meme soundtrack."""
import pathlib, json, hashlib, urllib.request, urllib.parse, time, math, random, wave, array, subprocess, os
from media_cache import MediaCache, ensure_ffmpeg, prune
root=pathlib.Path(__file__).resolve().parents[1]
out=root/'public/assets/cat-office'
out.mkdir(parents=True,exist_ok=True)
def photos(sources):
    for item in sources:
        target=out/(item['id']+'.jpg')
        name=item['file'].replace(' ','_')
        h=hashlib.md5(name.encode()).hexdigest()
        url='https://upload.wikimedia.org/wikipedia/commons/'+h[0]+'/'+h[:2]+'/'+urllib.parse.quote(name)
        tmp=out/(item['id']+'.download')
        for attempt in range(3):
            try:
                req=urllib.request.Request(url,headers={'User-Agent':'EquilibriumpressOpenMotion/1.0 (https://github.com/Equilibriumpress/OpenMotion)'})
                with urllib.request.urlopen(req,timeout=40) as resp: tmp.write_bytes(resp.read())
                subprocess.run(['ffmpeg','-v','error','-y','-i',str(tmp),'-vf','scale=1200:1200:force_original_aspect_ratio=decrease','-frames:v','1','-q:v','3',str(target)],check=True,timeout=30)
                break
            except Exception as exc:
                print('[cat-office] photo error',item['id'],exc)
                target.unlink(missing_ok=True)
                time.sleep(2+attempt)
            finally: tmp.unlink(missing_ok=True)
        if not target.exists() or target.stat().st_size<=1000:
            raise RuntimeError('Missing required photo: '+item['id'])
        print('[cat-office] ready',item['id'],target.stat().st_size,'bytes')

rate=48000
def soundtrack(p):
    duration=sum(s['durationSec'] for s in p['scenes'])
    samples=[0.0]*round(duration*rate)
    rng=random.Random(113)
    def add(start,length,kind):
        start=round(start*rate)
        n=round(length*rate)
        phase=0.0
        for i in range(n):
            if start+i>=len(samples): break
            t=i/rate
            u=i/max(n-1,1)
            env=min(1,t/.025,(length-t)/.035)
            if kind in ('meow','scream','snore'):
                f=(390+240*math.sin(math.pi*u)+40*math.sin(2*math.pi*7*t)) if kind=='meow' else (730+370*math.sin(math.pi*u)+90*math.sin(2*math.pi*9*t)) if kind=='scream' else (90+15*math.sin(2*math.pi*2*t))
                phase+=2*math.pi*f/rate
                a=(math.sin(phase)+.35*math.sin(2*phase)+.2*math.sin(3*phase))*(.24 if kind=='scream' else .13)
                a+=rng.uniform(-1,1)*(.025 if kind=='scream' else .012)
            elif kind=='ping': a=.13*math.sin(2*math.pi*1050*t)*math.exp(-13*t)
            elif kind=='bass': a=.25*math.sin(2*math.pi*(78*t-25*t*t))*math.exp(-5*t)
            elif kind=='scratch': a=.12*rng.uniform(-1,1)*math.sin(2*math.pi*(340*t-230*t*t))
            elif kind=='typing': a=.11*rng.uniform(-1,1)*math.exp(-100*(t%.09))
            elif kind=='tick': a=.08*rng.uniform(-1,1)*math.exp(-100*(t%.18))
            else: a=0
            samples[start+i]+=a*max(0,env)
    offset=0
    for s in p['scenes']:
        for e in s.get('catOffice',{}).get('events',[]):
            add(offset+e['at'],min(e['duration'],s['durationSec']-e['at']),e['kind'])
        offset+=s['durationSec']
    pcm=array.array('h',(int(32767*max(-.95,min(.95,v+.003*rng.uniform(-1,1)))) for v in samples))
    with wave.open(str(out/(p['slug']+'.wav')),'wb') as f:
        f.setparams((1,2,rate,0,'NONE','not compressed'));f.writeframes(pcm.tobytes())
    print('[cat-office] generated',p['slug'],duration,'seconds')

def main():
    projects=[]
    for source in sorted((root/'projects').glob('*/project.json')):
        p=json.loads(source.read_text())
        if any(s.get('catOffice') for s in p['scenes']): projects.append(p)
    prune("cat-audio",{p["slug"] for p in projects})
    prune("cat-photos",{"shared"} if projects else set())
    if not projects: return
    sources=json.loads((out/'sources.json').read_text())
    cache=MediaCache("cat-photos","shared",__file__,sources,[out/(item["id"]+".jpg") for item in sources])
    if not cache.restore():
        ensure_ffmpeg()
        cache.clear_outputs()
        photos(sources)
        cache.save()
    for p in projects:
        inputs=[{"duration":s["durationSec"],"events":s.get("catOffice",{}).get("events",[])} for s in p["scenes"]]
        cache=MediaCache("cat-audio",p["slug"],__file__,inputs,[out/(p["slug"]+".wav")])
        if not cache.restore():
            cache.clear_outputs()
            soundtrack(p)
            cache.save()
if __name__=="__main__":main()

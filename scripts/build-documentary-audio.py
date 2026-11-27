"""Produce chapter-length neural narration, measured-duration caption estimates,
an original musical score and separate synthesized environmental sound beds.
No paid API or external sound recordings. All outputs are publication assets.
"""
import json, math, pathlib, re, subprocess, sys, tempfile, wave, shutil
from itertools import groupby
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT/"public/assets/audio"
MODEL="en_US-libritts_r-medium"
MODEL_BASE="https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts_r/medium/"
def run(args, **kw):
    return subprocess.run([str(a) for a in args],check=True,timeout=240,**kw)
def ff(*args):
    run(["ffmpeg","-hide_banner","-loglevel","error","-y",*args])
def concat(files, target, work, codec="libmp3lame", bitrate="128k", norm=False):
    listing=work/(target.stem+"-concat.txt")
    listing.write_text("".join("file '"+str(p)+"'\n" for p in files))
    extra=["-af","loudnorm=I=-18:TP=-2:LRA=7"] if norm else []
    ff("-f","concat","-safe","0","-i",listing,*extra,"-ar","48000","-c:a",codec,"-b:a",bitrate,target)
def fmt_time(seconds):
    ms=max(0,round(seconds*1000))
    return f"{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}"
def music(ch,duration,out):
    # Harmonic changes, soft overtone texture, and subtle pulses.
    roots=[55,65.406,49,55,46.249,58.27,65.406,55]
    r=roots[(ch-1)%len(roots)]
    third=1.189207 if ch in (1,3,5,6) else 1.259921
    expr=f"0.025*sin(2*PI*{r}*t)*(0.65+0.35*sin(2*PI*t/12))+0.016*sin(2*PI*{r*1.5}*t)*(0.7+0.3*sin(2*PI*t/9))+0.012*sin(2*PI*{r*third*2}*t)*(0.55+0.45*sin(2*PI*t/17))+0.007*sin(2*PI*{r*4}*t)*(0.5+0.5*sin(2*PI*t/7))"
    if ch in (1,3,5): expr+=f"+0.008*sin(2*PI*{r/2}*t)*(0.5+0.5*sin(2*PI*t/2.8))"
    fade=min(1.25,duration/4)
    ff("-f","lavfi","-i",f"aevalsrc={expr}:s=48000:d={duration}","-af",f"afade=t=in:d={fade},afade=t=out:st={duration-fade}:d={fade}","-ac","1","-c:a","pcm_s16le",out)
def ambience(ch,duration,out):
    # Synthetic approximations of coast/wind, geothermal hiss, and rain.
    # These are deliberately subtle and are not field recordings.
    filters={1:"lowpass=f=420,tremolo=f=0.22:d=0.75",2:"lowpass=f=180,tremolo=f=0.12:d=0.5",3:"lowpass=f=280,tremolo=f=0.17:d=0.65",4:"lowpass=f=950,tremolo=f=0.35:d=0.4",5:"lowpass=f=650,tremolo=f=0.2:d=0.5",6:"highpass=f=650,lowpass=f=2800,tremolo=f=0.7:d=0.45",7:"highpass=f=450,lowpass=f=3600,tremolo=f=0.4:d=0.3",8:"lowpass=f=450,tremolo=f=0.22:d=0.7"}
    filt=filters.get(ch,filters[1])
    fade=min(1.5,duration/4)
    ff("-f","lavfi","-i",f"anoisesrc=color=pink:amplitude=0.09:r=48000:d={duration}:seed={42+ch}","-af",f"{filt},volume=0.6,afade=t=in:d={fade},afade=t=out:st={duration-fade}:d={fade}","-ac","1","-c:a","pcm_s16le",out)
def build(p,work,python,model=MODEL):
    slug=p["slug"]
    if not re.fullmatch(r"[a-z0-9-]+",slug): raise ValueError("Invalid slug")
    chapters=[(k,list(v)) for k,v in groupby(p["scenes"],key=lambda s:s["worldStory"].get("chapter",s["id"]) if s.get("worldStory") else s["id"] if "mind-series-v1" in s.get("doodle",{}).get("extras",[]) else s.get("bucketList",{}).get("documentary",{}).get("chapter",1))]
    voicefiles=[];musicfiles=[];ambfiles=[];captions=[];offset=0.0
    for ch_index,(chapter_key,scenes) in enumerate(chapters,1):
        ch=ch_index
        duration=sum(float(s["durationSec"]) for s in scenes)
        narration=" ".join((s.get("worldStory",{}).get("narration") or s.get("bucketList",{}).get("documentary",{}).get("narration") or s.get("doodle",{}).get("narration","")).strip() for s in scenes).strip()
        raw=work/f"{ch}-raw.wav";fitted=work/f"{ch}-voice.wav"
        if narration:
            # One uninterrupted synthesis per chapter: no restart on every cut.
            if model=="espeak-nl":
                run([shutil.which("espeak-ng") or shutil.which("espeak") or "espeak-ng","-v","nl","-s","155","-w",raw,narration])
            else:
                args=[python,"-m","piper","-m",work/(model+".onnx"),"-f",raw]
                if model.startswith("nl_"): args+=["--speaker","29"]
                run(args,input=narration+"\n",text=True)
            with wave.open(str(raw)) as w: seconds=w.getnframes()/w.getframerate()
            lead=.3;tail=.45;window=max(.5,duration-lead-tail)
            rate=max(.93,seconds/window)
            remaining=rate;factors=[]
            while remaining>2:
                factors.append("atempo=2");remaining/=2
            if abs(remaining-1)>.001:factors.append(f"atempo={remaining:.7f}")
            speech=min(seconds/rate,window)
            ff("-i",raw,"-af",",".join(factors+["adelay=300:all=1","apad"]),"-t",str(duration),"-ar","48000","-ac","1","-c:a","pcm_s16le",fitted)
            # Sentence/phrase cues estimated within actual measured chapter audio.
            # This is not forced word alignment, and is documented as approximate.
            phrases=re.split(r"(?<=[.!?])\s+",narration)
            chunks=[]
            for phrase in phrases:
                words=phrase.split()
                while words:
                    take=min(10,len(words))
                    if len(words)>10 and len(words)-take<4:take=max(5,len(words)-4)
                    chunks.append(" ".join(words[:take]));words=words[take:]
            weights=[max(1,len(re.sub(r"\s+","",c)))+4 for c in chunks]
            total=sum(weights);elapsed=0
            for chunk,weight in zip(chunks,weights):
                a=offset+lead+speech*elapsed/total;elapsed+=weight
                b=offset+lead+speech*elapsed/total
                captions.append({"text":chunk,"startSec":round(a,3),"endSec":round(b,3),"style":"minimal","position":.85})
            print(f"[narration] chapter {ch}: {seconds:.2f}s synthesized; {speech:.2f}s placed in {duration:.2f}s")
        else:ff("-f","lavfi","-i","anullsrc=r=48000:cl=mono","-t",str(duration),"-c:a","pcm_s16le",fitted)
        score=work/f"{ch}-score.wav";amb=work/f"{ch}-amb.wav"
        music(ch,duration,score);ambience(ch,duration,amb)
        voicefiles.append(fitted);musicfiles.append(score);ambfiles.append(amb);offset+=duration
    concat(voicefiles,OUT/(slug+"-voice.mp3"),work,norm=True)
    concat(musicfiles,OUT/(slug+"-score.mp3"),work,bitrate="96k")
    concat(ambfiles,OUT/(slug+"-ambience.mp3"),work,bitrate="96k")
    (OUT/(slug+"-captions.json")).write_text(json.dumps(captions,ensure_ascii=False))
    (OUT/(slug+"-captions.srt")).write_text("".join(f"{i+1}\n{fmt_time(c['startSec'])} --> {fmt_time(c['endSec'])}\n{c['text']}\n\n" for i,c in enumerate(captions)))
    if any("mind-series-v1" in s.get("doodle",{}).get("extras",[]) for s in p["scenes"]):
        # Original short, quiet cues at reaction beats; no recorded samples.
        expr="+".join(f"0.10*exp(-18*max(0,t-{a}))*sin(2*PI*{hz}*(t-{a}))*between(t,{a},{a+.22})" for a,hz in [(6.5,540),(10.1,310),(14.6,220),(25.5,740),(40.0,490)])
        ff("-f","lavfi","-i",f"aevalsrc={expr}:s=48000:d={offset}","-c:a","libmp3lame","-b:a","96k",OUT/(slug+"-effects.mp3"))
    print(f"[documentary] {slug}: {offset:.0f}s, {len(chapters)} narrated chapters, {len(captions)} cues, three audio tracks")
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    projects=[]
    for path in (ROOT/"projects").glob("*/project.json"):
        p=json.loads(path.read_text())
        if any(s.get("bucketList",{}).get("documentary") or s.get("worldStory") or "mind-series-v1" in s.get("doodle",{}).get("extras",[]) for s in p.get("scenes",[])):projects.append(p)
    projects.sort(key=lambda p:not any(s.get("worldStory") for s in p["scenes"]))
    if not projects:return
    with tempfile.TemporaryDirectory() as tmp:
        work=pathlib.Path(tmp)
        run([sys.executable,"-m","venv",work/"venv"])
        python=work/"venv/bin/python"
        try: run([python,"-m","pip","install","--disable-pip-version-check","piper-tts==1.3.0"])
        except Exception as exc: print(f"[piper] {exc}",file=sys.stderr)
        models=set()
        for p in projects:
            dutch=any(s.get("worldStory") for s in p.get("scenes",[]))
            model="nl_NL-mls-medium" if dutch else MODEL
            base="https://huggingface.co/rhasspy/piper-voices/resolve/main/nl/nl_NL/mls/medium/" if dutch else MODEL_BASE
            try:
                if model not in models:
                    for suffix in [".onnx",".onnx.json"]:
                        run(["curl","-fL","--retry","2","--max-time","180","-o",work/(model+suffix),base+model+suffix])
                    models.add(model)
                build(p,work,python,model)
            except Exception as exc:
                print(f"[audio] {p['slug']}: {exc}",file=sys.stderr)
                if dutch:
                    if not (shutil.which("espeak-ng") or shutil.which("espeak")) and __import__("os").environ.get("GITHUB_ACTIONS")=="true":
                        try: run(["sudo","apt-get","install","-y","espeak-ng"])
                        except Exception as fallback_error: print(f"[espeak] {fallback_error}",file=sys.stderr)
                    if not (shutil.which("espeak-ng") or shutil.which("espeak")): continue
                    print("[audio] Using Dutch fallback voice",file=sys.stderr)
                    build(p,work,python,"espeak-nl")
if __name__=="__main__":main()

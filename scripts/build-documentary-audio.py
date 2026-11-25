"""Build the documentary voice and original instrumental bed during Pages publication.
No API key required. Source JSON remains untouched; generated media stays in dist.
"""
import json, math, os, pathlib, re, shutil, subprocess, sys, tempfile, wave
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT/"public/assets/audio"
MODEL="en_US-libritts_r-medium"
MODEL_BASE="https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/libritts_r/medium/"
def run(args, **kw):
    return subprocess.run([str(a) for a in args],check=True,timeout=240,**kw)
def ff(*args):
    run(["ffmpeg","-hide_banner","-loglevel","error","-y",*args])
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    projects=[]
    for path in (ROOT/"projects").glob("*/project.json"):
        p=json.loads(path.read_text())
        if any(s.get("bucketList",{}).get("documentary") for s in p.get("scenes",[])): projects.append(p)
    if not projects: return
    with tempfile.TemporaryDirectory() as tmp:
        work=pathlib.Path(tmp)
        # Reuse a single model installation for all episodes.
        run([sys.executable,"-m","venv",work/"venv"])
        python=work/"venv/bin/python"
        run([python,"-m","pip","install","--disable-pip-version-check","piper-tts==1.3.0"])
        for suffix in [".onnx",".onnx.json"]:
            run(["curl","-fL","--retry","2","--max-time","180","-o",work/(MODEL+suffix),MODEL_BASE+MODEL+suffix])
        for p in projects:
            slug=p["slug"]
            if not re.fullmatch(r"[a-z0-9-]+",slug): raise ValueError("Invalid project slug")
            wavs=[]; captions=[]; offset=0.0
            for i,s in enumerate(p["scenes"]):
                duration=float(s["durationSec"])
                narration=s.get("bucketList",{}).get("documentary",{}).get("narration","")
                raw=work/f"{i:03d}-raw.wav"; fitted=work/f"{i:03d}-fit.wav"
                if narration:
                    # One clip per shot; compress only when the measured speech
                    # exceeds its allotted window. Preserve all narration.
                    run([python,"-m","piper","-m",work/(MODEL+".onnx"),"-f",raw],input=narration+"\n",text=True)
                    with wave.open(str(raw)) as w: seconds=w.getnframes()/w.getframerate()
                    rate=max(1.0,seconds/max(.5,duration-1.0))
                    factors=[]
                    while rate>2:
                        factors.append("atempo=2");rate/=2
                    if rate>1.001: factors.append(f"atempo={rate:.6f}")
                    speech=min(seconds/max(1.0,seconds/max(.5,duration-1.0)),duration-1.0)
                    filters=",".join(factors+["adelay=350:all=1","apad"])
                    ff("-i",raw,"-af",filters,"-t",str(duration),"-ar","48000","-ac","1","-c:a","pcm_s16le",fitted)
                    # Approximate cue boundaries within measured speech; not forced alignment.
                    words=narration.split(); groups=[words[j:j+10] for j in range(0,len(words),10)]
                    count=0
                    for group in groups:
                        a=offset+.35+speech*count/len(words);count+=len(group)
                        b=offset+.35+speech*count/len(words)
                        captions.append({"text":" ".join(group),"startSec":round(a,3),"endSec":round(b,3),"style":"minimal","position":.87})
                else:
                    ff("-f","lavfi","-i","anullsrc=r=48000:cl=mono","-t",str(duration),"-c:a","pcm_s16le",fitted)
                wavs.append(fitted);offset+=duration
            listing=work/"concat.txt"
            listing.write_text("".join("file '"+str(w)+"'\n" for w in wavs))
            voice=OUT/(slug+"-voice.mp3")
            ff("-f","concat","-safe","0","-i",listing,"-c:a","libmp3lame","-b:a","128k",voice)
            # Original synthesized score, no external samples. Quiet sustained
            # tones and slow variation; voice remains the foreground.
            expr="0.035*(sin(2*PI*55*t)+0.45*sin(2*PI*82.4069*t)+0.26*sin(2*PI*110*t))*(0.62+0.38*sin(2*PI*t/31))+0.009*sin(2*PI*164.8138*t)*(0.5+0.5*sin(2*PI*t/17))"
            ff("-f","lavfi","-i",f"aevalsrc={expr}:s=44100:d={offset}","-af",f"afade=t=in:d=4,afade=t=out:st={offset-6}:d=6","-ac","2","-c:a","libmp3lame","-b:a","96k",OUT/(slug+"-score.mp3"))
            (OUT/(slug+"-captions.json")).write_text(json.dumps(captions,ensure_ascii=False))
            print(f"[documentary] {slug}: {offset:.0f}s, {len(captions)} captions, voice and score generated")
if __name__=="__main__": main()

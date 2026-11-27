"""Verified per-project generated-media cache."""
import hashlib, json, os, pathlib, re, shutil, subprocess, tempfile, time
ROOT=pathlib.Path(__file__).resolve().parents[1]
CACHE=ROOT/".openmotion-cache"

def digest(path):
    h=hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""): h.update(chunk)
    return h.hexdigest()

def ensure_ffmpeg():
    if all(shutil.which(x) for x in ("ffmpeg","ffprobe")): return
    if os.environ.get("GITHUB_ACTIONS")!="true": raise RuntimeError("Install ffmpeg and ffprobe")
    subprocess.run(["sudo","apt-get","update"],check=True,timeout=180)
    subprocess.run(["sudo","apt-get","install","-y","ffmpeg"],check=True,timeout=300)
    if not all(shutil.which(x) for x in ("ffmpeg","ffprobe")): raise RuntimeError("FFmpeg installation failed")

class MediaCache:
    def __init__(self,kind,slug,script,inputs,outputs):
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]*",slug): raise ValueError("Invalid cache slug")
        self.label=kind+"/"+slug
        self.slot=CACHE/"media"/kind/slug
        self.outputs=[pathlib.Path(p) for p in outputs]
        self.names=[p.relative_to(ROOT).as_posix() for p in self.outputs]
        if not self.names or len(set(self.names))!=len(self.names): raise ValueError("Invalid output list")
        self.key=hashlib.sha256(json.dumps({"script":digest(pathlib.Path(script)),"helper":digest(pathlib.Path(__file__)),"inputs":inputs,"outputs":self.names},sort_keys=True,ensure_ascii=False,separators=(",",":")).encode()).hexdigest()
        self.start=time.monotonic()
    def restore(self):
        try:
            stamp=json.loads((self.slot/"stamp.json").read_text())
            if stamp["key"]!=self.key or set(stamp["files"])!=set(self.names): raise ValueError("changed inputs")
            for name in self.names:
                source=self.slot/"files"/name
                if not source.is_file() or source.stat().st_size==0 or digest(source)!=stamp["files"][name]: raise ValueError("corrupt output")
            for name,target in zip(self.names,self.outputs):
                target.parent.mkdir(parents=True,exist_ok=True)
                shutil.copyfile(self.slot/"files"/name,target)
            print(f"[cache] HIT {self.label} ({time.monotonic()-self.start:.2f}s)",flush=True)
            return True
        except (OSError,ValueError,KeyError,TypeError):
            print(f"[cache] MISS {self.label}",flush=True)
            return False
    def clear_outputs(self):
        for p in self.outputs: p.unlink(missing_ok=True)
    def verify(self):
        for p in self.outputs:
            if not p.is_file() or p.stat().st_size==0: raise RuntimeError("Missing or empty generated media: "+str(p))
    def save(self):
        self.verify()
        self.slot.parent.mkdir(parents=True,exist_ok=True)
        with tempfile.TemporaryDirectory(dir=self.slot.parent) as temp:
            staging=pathlib.Path(temp)/"ready"
            staging.mkdir()
            hashes={}
            for name,target in zip(self.names,self.outputs):
                dest=staging/"files"/name
                dest.parent.mkdir(parents=True,exist_ok=True)
                shutil.copyfile(target,dest)
                hashes[name]=digest(dest)
            (staging/"stamp.json").write_text(json.dumps({"key":self.key,"files":hashes},sort_keys=True))
            if self.slot.exists(): shutil.rmtree(self.slot)
            staging.rename(self.slot)
        print(f"[cache] BUILT {self.label} ({time.monotonic()-self.start:.2f}s)",flush=True)

def prune(kind,active):
    base=CACHE/"media"/kind
    if base.is_dir():
        for slot in base.iterdir():
            if slot.is_dir() and slot.name not in active: shutil.rmtree(slot)

"""Cache a real elevation mesh for the UTMB explainer using existing Terrarium DEM data."""
import concurrent.futures, json, math, pathlib, subprocess, urllib.request
from media_cache import MediaCache, ensure_ffmpeg

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"public/assets/maps/utmb-explainer-relief.json"
BOUNDS=(6.62,45.66,7.22,46.14)
COLS,ROWS,ZOOM=145,161,10
N=256*2**ZOOM

def pixel(lon,lat):
    return int((lon+180)/360*N),int((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*N)

def load_tile(key):
    x,y=key
    url=f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{ZOOM}/{x}/{y}.png"
    request=urllib.request.Request(url,headers={"User-Agent":"OpenMotion-Explainer/1.0"})
    with urllib.request.urlopen(request,timeout=12) as res: data=res.read(2000001)
    if len(data)>2000000: raise ValueError("DEM tile too large")
    raw=subprocess.run(["ffmpeg","-v","error","-f","image2pipe","-i","pipe:0","-f","rawvideo","-pix_fmt","rgb24","pipe:1"],input=data,capture_output=True,check=True,timeout=10).stdout
    if len(raw)!=256*256*3: raise ValueError("DEM tile dimensions")
    return key,raw

def main():
    if not (ROOT/"projects/official-example-utmb/project.json").is_file(): return
    cache=MediaCache("explainer-relief","official-example-utmb",__file__,{"bounds":BOUNDS,"cols":COLS,"rows":ROWS,"zoom":ZOOM},[OUT])
    if cache.restore(): return
    ensure_ffmpeg()
    west,south,east,north=BOUNDS
    pixels=[pixel(west+(east-west)*i/(COLS-1),north-(north-south)*j/(ROWS-1)) for j in range(ROWS) for i in range(COLS)]
    keys=sorted({(x//256,y//256) for x,y in pixels})
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        tiles=dict(pool.map(load_tile,keys))
    heights=[]
    for x,y in pixels:
        raw=tiles[x//256,y//256]
        k=((y%256)*256+x%256)*3
        heights.append(round(raw[k]*256+raw[k+1]+raw[k+2]/256-32768))
    if min(heights)<0 or not 4000<=max(heights)<=5100: raise ValueError("Unexpected alpine elevation range")
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps({"cols":COLS,"rows":ROWS,"heights":heights},separators=(",",":")))
    cache.save()
    print("[explainer-relief]",len(keys),"real DEM tiles",COLS*ROWS,"samples")

if __name__=="__main__": main()

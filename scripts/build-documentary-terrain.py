"""Generate real WGS84 contour lines from AWS Terrarium elevation tiles.
Only small documentary extents are accepted. No fabricated contours.
"""
import json, math, pathlib, subprocess, tempfile, urllib.request
from media_cache import MediaCache, ensure_ffmpeg, prune
ROOT=pathlib.Path(__file__).resolve().parent.parent
ZOOM=11
N=2**ZOOM*256
def pixel(lon,lat):
    return (lon+180)/360*N,(1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*N
def coord(x,y):
    return [round(x/N*360-180,6),round(math.degrees(math.atan(math.sinh(math.pi*(1-2*y/N)))),6)]
def build(p,work):
    west,south,east,north=p["documentaryTerrain"]["bounds"]
    interval=int(p["documentaryTerrain"]["interval"])
    if not (west<east and south<north and 20<=interval<=500): raise ValueError("Invalid contour extent")
    x0,y0=pixel(west,north);x1,y1=pixel(east,south)
    x0,y0=int(x0)//2*2,int(y0)//2*2
    x1,y1=int(x1)+2,int(y1)+2
    if (x1-x0)*(y1-y0)>1000000: raise ValueError("Contour extent too large")
    tiles={}
    def height(x,y):
        tx,ty=x//256,y//256
        if (tx,ty) not in tiles:
            url=f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{ZOOM}/{tx}/{ty}.png"
            req=urllib.request.Request(url,headers={"User-Agent":"OpenMotion-Documentary/2.0"})
            with urllib.request.urlopen(req,timeout=25) as res: png=res.read()
            if len(png)>2000000: raise ValueError("DEM tile too large")
            raw=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-f","image2pipe","-i","pipe:0","-f","rawvideo","-pix_fmt","rgb24","pipe:1"],input=png,capture_output=True,check=True,timeout=30).stdout
            if len(raw)!=256*256*3: raise ValueError("Unexpected DEM tile dimensions")
            tiles[tx,ty]=raw
        data=tiles[tx,ty]
        i=((y%256)*256+x%256)*3
        return data[i]*256+data[i+1]+data[i+2]/256-32768
    xs=list(range(x0,x1+1,2));ys=list(range(y0,y1+1,2))
    grid=[[height(x,y) for x in xs] for y in ys]
    lines={}
    for iy in range(len(ys)-1):
        for ix in range(len(xs)-1):
            v=[grid[iy][ix],grid[iy][ix+1],grid[iy+1][ix+1],grid[iy+1][ix]]
            if max(v)<interval: continue
            corners=[(xs[ix],ys[iy]),(xs[ix+1],ys[iy]),(xs[ix+1],ys[iy+1]),(xs[ix],ys[iy+1])]
            low=max(interval,(math.floor(min(v)/interval)+1)*interval)
            for lev in range(low,int(max(v))+1,interval):
                cross=[]
                for a,b in [(0,1),(1,2),(2,3),(3,0)]:
                    if (v[a]<lev)!=(v[b]<lev):
                        t=(lev-v[a])/(v[b]-v[a])
                        cross.append(coord(corners[a][0]+(corners[b][0]-corners[a][0])*t,corners[a][1]+(corners[b][1]-corners[a][1])*t))
                if len(cross)==2: lines.setdefault(lev,[]).append(cross)
                elif len(cross)==4:
                    # Resolve saddle cells using the centre's interpolated elevation.
                    pairs=[(0,1),(2,3)] if (sum(v)/4>=lev)==(v[0]>=lev) else [(0,3),(1,2)]
                    lines.setdefault(lev,[]).extend([[cross[a],cross[b]] for a,b in pairs])
    output={"type":"FeatureCollection","features":[{"type":"Feature","properties":{"elevation":lev},"geometry":{"type":"MultiLineString","coordinates":segments}} for lev,segments in sorted(lines.items())]}
    if not output["features"]: raise ValueError("No land contours found")
    out=ROOT/"public/assets/maps"/(p["slug"]+"-contours.geojson")
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(output,separators=(",",":")))
    print(f"[terrain] {p['slug']}: {len(tiles)} actual DEM tiles; {len(lines)} contour levels")
def main():
    projects=[json.loads(f.read_text()) for f in sorted((ROOT/"projects").glob("*/project.json"))]
    projects=[p for p in projects if p.get("documentaryTerrain")]
    prune("terrain",{p["slug"] for p in projects})
    for p in projects:
        output=ROOT/"public/assets/maps"/(p["slug"]+"-contours.geojson")
        cache=MediaCache("terrain",p["slug"],__file__,p["documentaryTerrain"],[output])
        if cache.restore(): continue
        try:
            ensure_ffmpeg()
            cache.clear_outputs()
            build(p,None)
            cache.save()
        except Exception as e:
            print(f"[terrain] {p['slug']}: optional contours unavailable: {e}",flush=True)
if __name__=="__main__":main()

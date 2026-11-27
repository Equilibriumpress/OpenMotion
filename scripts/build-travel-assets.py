"""Prepare locally served, attributed Commons assets for travel documentaries.
Video excerpts become bounded deterministic frame atlases, avoiding asynchronous
HTMLVideoElement seeking during Canvas export. No placeholder image is generated.
"""
import json, pathlib, urllib.request, urllib.parse, subprocess, tempfile, time, re, html, hashlib, shutil
from media_cache import MediaCache, ensure_ffmpeg, prune
ROOT=pathlib.Path(__file__).resolve().parent.parent
UA="OpenMotionTravel/1.0 (https://github.com/Equilibriumpress/OpenMotion; Wikimedia documentary asset preparation)"
def request(url, target=None):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=90) as response:
                if target:
                    with open(target,"wb") as f: shutil.copyfileobj(response,f)
                    return
                return json.load(response)
        except Exception:
            if attempt==3: raise
            time.sleep(2**attempt)
def clean(value):
    return html.unescape(re.sub(r"<[^>]+>","",value or "")).strip()
def ff(*args):
    subprocess.run(["ffmpeg","-nostdin","-hide_banner","-loglevel","error","-y",*map(str,args)],check=True,timeout=180)
def metadata(file):
    query=urllib.parse.urlencode({"action":"query","format":"json","titles":"File:"+file,"prop":"imageinfo","iiprop":"url|extmetadata|mime|size","iiurlwidth":1920})
    pages=request("https://commons.wikimedia.org/w/api.php?"+query)["query"]["pages"]
    page=next(iter(pages.values()))
    if "imageinfo" not in page: raise RuntimeError("Unknown Commons file: "+file)
    i=page["imageinfo"][0]; ext=i["extmetadata"]
    get=lambda key:clean(ext.get(key,{}).get("value",""))
    license=get("LicenseShortName"); author=get("Artist") or get("Credit")
    if file.startswith("Japan, Okinawa, Kerama islands"): author="Cool2ikou"
    if not author or not re.search(r"^(CC BY(?:-SA)? [1-4][.][05]|CC0|Public domain|PDM)",license,re.I):
        raise RuntimeError("Unsupported or missing license/author: "+file+" "+license)
    return i,{"author":author,"license":license,"licenseUrl":get("LicenseUrl"),"sourceUrl":i["descriptionurl"],"title":file}
def build(manifest):
    items=json.loads(manifest.read_text())
    slug=manifest.parent.name
    out=ROOT/"public/assets/places-worth-exploring"/slug
    out.mkdir(parents=True,exist_ok=True)
    credits={}; downloaded={}
    with tempfile.TemporaryDirectory() as t:
        work=pathlib.Path(t)
        for asset in items:
            file=asset["file"]; ident=asset["id"]; target=out/(ident+".jpg")
            if file not in downloaded:
                info,credit=metadata(file)
                original=info["url"]; url=info.get("thumburl") or original
                if asset["kind"]=="clip":
                    # Haneji original is 1 GB; the completed Commons 720p VP9 derivative is sufficient.
                    if info.get("size",0)>150_000_000:
                        u=urllib.parse.urlsplit(original)
                        name=u.path.rsplit("/",1)[-1]
                        url=urllib.parse.urlunsplit((u.scheme,u.netloc,u.path.replace("/commons/","/commons/transcoded/",1)+"/"+name+".720p.vp9.webm","",""))
                    else: url=original
                source=work/(hashlib.sha256(file.encode()).hexdigest()+(".webm" if asset["kind"]=="clip" else ".media"))
                try: request(url,source)
                except Exception:
                    if asset["kind"]=="clip" or url==original: raise
                    request(original,source)
                downloaded[file]=(source,credit)
            source,credit=downloaded[file]
            row={**credit,"location":asset["location"],"kind":asset["kind"],"changes":"Resized and cropped for documentary framing; color and camera motion applied in renderer."}
            if asset["kind"]=="clip":
                fps=20; cols=10; count=int(asset["duration"]*fps); rows=(count+cols-1)//cols
                # 640x360 frame cells keep the atlas under common browser image limits.
                vf=f"fps={fps},scale=640:360:force_original_aspect_ratio=increase,crop=640:360,tile={cols}x{rows}:nb_frames={count}"
                ff("-ss",asset["start"],"-i",source,"-an","-vf",vf,"-frames:v","1","-q:v","2",target)
                row["videoGrid"]={"fps":fps,"cols":cols,"rows":rows,"frameWidth":640,"frameHeight":360,"frames":count}
                row["changes"]=f"Silent excerpt at {asset['start']} s, sampled at {fps} fps and resized."
            else:
                ff("-i",source,"-vf","scale=1920:1920:force_original_aspect_ratio=decrease:force_divisible_by=2","-frames:v","1","-q:v","2",target)
            if not target.is_file() or target.stat().st_size<1024: raise RuntimeError("Asset missing or empty: "+ident)
            credits[ident]=row
            print("[travel]",slug,ident,file,row["license"],flush=True)
            time.sleep(.35)
    (out/"credits.json").write_text(json.dumps(credits,ensure_ascii=False,indent=2))
    entries="".join("<li>"+html.escape(k+" · "+v["location"]+" · "+v["author"]+" · "+v["license"])+ " — <a href='"+html.escape(v["sourceUrl"],quote=True)+"'>source</a> "+("<a href='"+html.escape(v["licenseUrl"],quote=True)+"'>license</a>" if v["licenseUrl"] else "")+" · "+html.escape(v["changes"])+"</li>" for k,v in credits.items())
    (out/"credits.html").write_text("<!doctype html><meta charset=utf-8><title>Travel documentary credits</title><h1>Media credits</h1><p>Source media and their respective licenses. Adapted CC BY-SA source excerpts retain their applicable licenses; no endorsement is implied.</p><ol>"+entries+"</ol>")
    project=json.loads((manifest.parent/"project.json").read_text())
    title_shot=next((s for s in project["scenes"] if s.get("bucketList",{}).get("documentary",{}).get("mode")=="title"),None)
    title=out/(title_shot["id"]+".jpg") if title_shot else out/"missing.jpg"
    if title.exists():
        with tempfile.TemporaryDirectory() as temp:
            headline=pathlib.Path(temp)/"headline.txt"; subtitle=pathlib.Path(temp)/"subtitle.txt"
            headline.write_text(title_shot["headline"].upper()); subtitle.write_text(title_shot.get("subheadline","").upper())
            vf="scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,drawbox=x=0:y=450:w=1280:h=270:color=0x102B3B@0.77:t=fill,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:textfile="+str(headline)+":x=65:y=485:fontsize=104:fontcolor=white,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:textfile="+str(subtitle)+":x=70:y=610:fontsize=33:fontcolor=0x80D7D0"
            ff("-i",title,"-vf",vf,"-frames:v","1","-q:v","2",out/"thumbnail.jpg")
if __name__=="__main__":
    manifests=sorted((ROOT/"projects").glob("*/travel-assets.json"))
    prune("travel",{m.parent.name for m in manifests})
    for manifest in manifests:
        slug=manifest.parent.name
        items=json.loads(manifest.read_text())
        project=json.loads((manifest.parent/"project.json").read_text())
        title=next((s for s in project["scenes"] if s.get("bucketList",{}).get("documentary",{}).get("mode")=="title"),None)
        title_inputs={k:title.get(k) for k in ("id","headline","subheadline")} if title else None
        folder=ROOT/"public/assets/places-worth-exploring"/slug
        outputs=[folder/(a["id"]+".jpg") for a in items]+[folder/"credits.json",folder/"credits.html"]
        if title and any(a["id"]==title["id"] for a in items): outputs.append(folder/"thumbnail.jpg")
        cache=MediaCache("travel",slug,__file__,{"assets":items,"title":title_inputs},outputs)
        if cache.restore(): continue
        ensure_ffmpeg()
        cache.clear_outputs()
        build(manifest)
        cache.save()

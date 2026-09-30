"""
把 dist/ 裡的圖片縮成網頁用尺寸（原始檔不動），並同步改寫 HTML/XML 裡的路徑。
由 scripts/build.mjs 自動呼叫；也可以手動：python scripts/optimize-images.py dist
"""
import hashlib, re, sys
from pathlib import Path
from urllib.parse import quote
from PIL import Image, ImageOps

sys.stdout.reconfigure(encoding="utf-8")
OUT = Path(sys.argv[1]).resolve()

RULES = [  # (路徑 regex, 長邊上限)
    (r"^images/EVHIJPG/", 1600),
    (r"^(2023_images/(VIP_|GCG|LLS|LEL|LES|WGL|LER|CGF)|images/H[GPA]\d)", 480),
    (r"^documents/", 1600),
    (r"^images/(fourm23bk|web_01|bk2021)", 1600),
]
DEFAULT_MAX = 1600


def max_edge(rel):
    for pat, m in RULES:
        if re.search(pat, rel):
            return m
    return DEFAULT_MAX


def is_opaque(im):
    if im.mode in ("RGB", "L"):
        return True
    if "A" in im.getbands():
        return im.getchannel("A").getextrema()[0] >= 250
    return False


renames = {}
before = after = 0
for f in sorted(OUT.rglob("*")):
    if f.suffix.lower() not in (".png", ".jpg", ".jpeg") or not f.is_file():
        continue
    rel = f.relative_to(OUT).as_posix()
    size0 = f.stat().st_size
    before += size0
    im = ImageOps.exif_transpose(Image.open(f))
    m = max_edge(rel)
    if max(im.size) > m:
        im.thumbnail((m, m), Image.LANCZOS)
    target = f
    # 大張、不透明的 PNG（照片、主視覺）轉 JPG；檔名非 ASCII 的一併改名
    to_jpg = f.suffix.lower() == ".png" and is_opaque(im) and size0 > 300_000
    if to_jpg or not rel.isascii():
        stem = f.stem if f.stem.isascii() else "img-" + hashlib.md5(f.stem.encode()).hexdigest()[:8]
        target = f.with_name(stem + (".jpg" if to_jpg else f.suffix))
    if target.suffix.lower() in (".jpg", ".jpeg"):
        im.convert("RGB").save(target, "JPEG", quality=80, optimize=True, progressive=True)
    else:
        im.save(target, "PNG", optimize=True)
    if target != f:
        f.unlink()
        renames[rel] = target.relative_to(OUT).as_posix()
    after += target.stat().st_size

if renames:
    pairs = []
    for a, b in renames.items():
        pairs.append((a, b))
        pairs.append(("/".join(quote(p) for p in a.split("/")), b))
    for f in OUT.rglob("*"):
        if f.suffix in (".html", ".xml", ".css") and f.is_file():
            s = f.read_text(encoding="utf-8")
            t = s
            for a, b in pairs:
                t = t.replace(a, b)
            if t != s:
                f.write_text(t, encoding="utf-8")

print(f"圖片最佳化：{before / 1048576:.1f} MB → {after / 1048576:.1f} MB，改名 {len(renames)} 個")
for a, b in renames.items():
    print(f"  {a} → {b}")

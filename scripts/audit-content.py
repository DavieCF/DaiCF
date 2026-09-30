"""
內容稽核：確認 dist/ 每一頁上看得到的文字，都能在原始來源找到。

來源（corpus）：
  1. 原站舊 HTML（docs/legacy/，去掉標籤，保留 <script> 內的影片資料）
  2. data/transcribed.json（從圖片逐字轉錄的內容）
  3. data/site.json（官網頁面標題、介面字串）
比對時忽略空白與大小寫。

結果分三類：
  - 直接找得到：整段就是原文
  - 組合：由原文片段拼成（例如「院長」+「柏克萊大學 公共衛生學院」、名稱 + 年份），每一段都有出處
  - 找不到：列出來，必須人工確認

用法：python scripts/audit-content.py
"""
import html as htmllib
import json, re, sys
from html.parser import HTMLParser
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
LEGACY_DIR = ROOT / "docs/legacy"  # 舊站 HTML 已整理到這裡（2026-09-30）
LEGACY = ["index.html", "indextw.html", "Forum2021.html", "Forum2021tw.html", "Forum2022.html", "Forum2022tw.html",
          "Forum2023.html", "Forum2023tw.html", "2022ForumpageTW.html", "2022ForumpageEN.html", "2023ForumpageTW.html", "2023ForumpageEN.html"]


def squash(s):
    s = s.replace("​", "")
    return re.sub(r"\s+", "", s).lower()


def read_legacy(name):
    return (LEGACY_DIR / name).read_text(encoding="utf-8-sig")


def strip_tags(h):
    h = re.sub(r"<(script|style)[^>]*>", " ", h)
    h = re.sub(r"<[^>]+>", "", h)
    h = htmllib.unescape(h)
    return re.sub(r"[\x00-\x1f]", " ", h)


def strings(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            if not k.startswith("_"):
                yield from strings(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from strings(v)


parts = [strip_tags(read_legacy(p)) for p in LEGACY]
parts += list(strings(json.loads((ROOT / "data/transcribed.json").read_text(encoding="utf-8"))))
parts += list(strings(json.loads((ROOT / "data/site.json").read_text(encoding="utf-8"))))
CORPUS = squash("\n".join(parts))

FIXED = set()
for f in (ROOT / "data/events").glob("*.json"):
    FIXED.update(json.loads(f.read_text(encoding="utf-8")).get("_fixes", []))
# 修字後的文字在原文裡找不到，把「修正後」也加入 corpus
for line in FIXED:
    if " → " in line:
        CORPUS += squash(line.split(" → ", 1)[1])


class Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.out = []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "head"):
            self.skip += 1
        a = dict(attrs)
        if a.get("aria-hidden") == "true":
            self.skip += 1
            self._hidden_tag = tag
        for k in ("alt", "aria-label"):
            if a.get(k):
                self.out.append(a[k])

    def handle_endtag(self, tag):
        if tag in ("script", "style", "head"):
            self.skip -= 1
        if getattr(self, "_hidden_tag", None) == tag:
            self.skip -= 1
            self._hidden_tag = None

    def handle_data(self, d):
        if not self.skip and d.strip():
            self.out.append(d.strip())


# 版面自己產生的字：數字、日期、屆數、分隔符號
LAYOUT = re.compile(r"^(\d+([/:.\-]\d+)*|第 ?\d+ ?屆|Edition \d+|No\.|[·｜|、，：:–—/→+()（）\s\-]+|©.*|YouTube|404|I{1,3}|跳到主要內容|Skip to content|場演講|talks)$")

direct, composed, missing = 0, set(), {}
for page in sorted(DIST.rglob("index.html")) + [DIST / "404.html"]:
    p = Text()
    p.feed(page.read_text(encoding="utf-8"))
    for seg in p.out:
        for piece in re.split(r"\s*[·｜|—]\s*", seg):
            piece = piece.strip(" ，、:：").rstrip("…")
            if not piece or LAYOUT.match(piece):
                continue
            if squash(piece) in CORPUS:
                direct += 1
                continue
            tokens = [t.strip("()（）,") for t in re.split(r"[\s、／/：:]+", piece)]
            tokens = [t for t in tokens if t and not LAYOUT.match(t)]
            bad = [t for t in tokens if squash(t) not in CORPUS]
            if not bad:
                composed.add(piece)
                continue
            missing.setdefault(" ".join(bad), set()).add(page.relative_to(DIST).as_posix())

print(f"整段就是原文：{direct} 段")
print(f"由原文片段組合（每一段都有出處）：{len(composed)} 段")
for c in sorted(composed):
    print("   ", c[:80])
if missing:
    print(f"\n找不到出處：{len(missing)} 段（必須人工確認）")
    for k, v in sorted(missing.items()):
        print(f"  「{k}」  {', '.join(sorted(v))}")
else:
    print("\n找不到出處：0 段")
print(f"\n已套用的原文修字：{len(FIXED)} 項")
for x in sorted(FIXED):
    print("   ", x)

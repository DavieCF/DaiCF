"""
從舊版 HTML 抽出所有內容，寫成 data/events/{2021,2022,2023}.json 與 data/home.json。

原則：網站上的每一段文字都要能追溯回原站。
  - HTML 裡有的文字：這支程式直接抽，只做空白正規化（去掉換行、零寬空白 U+200B）。
  - 只存在於圖片裡的文字（議程圖、主視覺、logo）：放在 data/transcribed.json，逐字轉錄並標註來源圖檔。
  - 少數原文錯字的修正，全部列在 FIXES，並寫進每個 JSON 的 _fixes 欄位，方便審稿。

用法：python scripts/extract.py
"""
import io, json, re, sys
from html.parser import HTMLParser
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
LEGACY_DIR = ROOT / "docs/legacy"  # 舊站 HTML 已整理到這裡（2026-09-30）
TRANSCRIBED =json.loads((ROOT / "data/transcribed.json").read_text(encoding="utf-8"))

# 原文明顯的打字錯誤。key 是原文片段，value 是修正後。只收「重複字、多餘標點」這種不改變意思的錯。
FIXES = {
    "替身醫療 (Avatar 替身醫療 (Avatar Medicine)": "替身醫療 (Avatar Medicine)",  # 2022 FAQ 第 1 題重複貼上
    "Avatar Medicine Forum? ?": "Avatar Medicine Forum?",  # 2022 EN FAQ 第 5 題
    "clooaboration": "collaboration",  # 2021 Michael Morehead 講題
}
COMMA_FIX = re.compile(r",(?=[A-Za-z])")  # 英文逗號後缺空格，例如 "Director,Emulate"
applied = []


def norm(s):
    s = s.replace("​", "").replace("﻿", "")
    # 原始碼換行造成的空白：兩個中文字（含全形標點）之間的換行直接接起來。
    # 原文刻意打的空格（如「小鼠替身 免疫治療」「柏克萊大學 公共衛生學院」）不含換行，不受影響。
    s = re.sub(r"(?<=[　-鿿＀-￯])[ \t]*\n\s*(?=[　-鿿＀-￯])", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    for a, b in FIXES.items():
        if a in s:
            s = s.replace(a, b)
            applied.append((a, b))
    if COMMA_FIX.search(s):
        applied.append(("英文逗號後缺空格", "補一個空格"))
        s = COMMA_FIX.sub(", ", s)
    s = re.sub(r"\s+,", ",", s)  # "Therapy ," → "Therapy,"
    return s


# ---------------------------------------------------------------- 迷你 DOM
class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []

    @property
    def cls(self):
        return (self.attrs.get("class") or "").split()

    def text(self):
        out = []
        for c in self.children:
            if isinstance(c, str):
                out.append(c)
            elif c.tag == "br":
                out.append(" ")
            elif c.tag not in ("script", "style"):
                out.append(c.text())
        return "".join(out)

    def find_all(self, pred):
        res = []
        for c in self.children:
            if isinstance(c, Node):
                if pred(c):
                    res.append(c)
                res.extend(c.find_all(pred))
        return res

    def find(self, pred):
        r = self.find_all(pred)
        return r[0] if r else None


VOID = {"img", "br", "meta", "link", "input", "hr", "source"}


class Builder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("root", [], None)
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        self.cur.children.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not None and n.tag != tag:
            n = n.parent
        if n is not None and n.parent is not None:
            self.cur = n.parent

    def handle_data(self, d):
        self.cur.children.append(d)


def load(name):
    b = Builder()
    b.feed((LEGACY_DIR / name).read_text(encoding="utf-8-sig"))
    return b.root


def by_class(c):
    return lambda n: c in n.cls


def js_contents(name):
    """讀舊 Forum*.html 裡 const contents = [...] 的內容（以 node 執行，保證跟瀏覽器解讀一致）。"""
    import subprocess

    html = (LEGACY_DIR / name).read_text(encoding="utf-8")
    m = re.search(r"const contents = (\[[\s\S]*?\n\s*\]);", html)
    code = "process.stdout.write(JSON.stringify(" + m.group(1) + "))"
    out = subprocess.run(["node", "-e", code], capture_output=True, check=True)
    return json.loads(out.stdout.decode("utf-8"))


def yt_id(src):
    m = re.search(r"embed/([A-Za-z0-9_-]{11})", src or "")
    return m.group(1) if m else None


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def bi(zh, en):
    return {"zh": zh, "en": en}


def starts_with_name(text, name):
    return norm(text).replace(" ", "").startswith(norm(name).replace(" ", ""))


# ---------------------------------------------------------------- 影片可用性（2026-09-29 檢查）
# cjq5EUrFwL8：YouTube 回 LOGIN_REQUIRED（私人影片），縮圖 404。
UNAVAILABLE = {"cjq5EUrFwL8": "YouTube 回應 LOGIN_REQUIRED（影片已設為私人或刪除），縮圖 404。"}


def video_obj(vid):
    if not vid:
        return None
    v = {"id": vid}
    if vid in UNAVAILABLE:
        v["available"] = False
        v["_note"] = UNAVAILABLE[vid]
    return v


# ================================================================ 2023
def event_2023():
    tw, en = load("2023ForumpageTW.html"), load("2023ForumpageEN.html")
    T = TRANSCRIBED["2023"]

    def intro(doc):
        box = doc.find(by_class("IM_contant"))
        return [norm(p.text()) for p in box.find_all(lambda n: n.tag == "p") if norm(p.text())]

    def speakers(doc):
        res = []
        for v in doc.find_all(by_class("vip_intro")):
            res.append({
                "photo": v.find(lambda n: n.tag == "img").attrs["src"].lstrip("./"),
                "name": norm(v.find(by_class("vip_name")).text()),
                "title": norm(v.find(by_class("vip_title")).text()),
                "bio": norm(v.find(by_class("vip_description")).text()),
            })
        return res

    def faq(doc):
        box = doc.find(by_class("faq-item"))
        return [(norm(li.find(by_class("qa-title")).text()), norm(li.find(by_class("qa-content")).text())) for li in box.find_all(lambda n: n.tag == "li")]

    sp_zh, sp_en = speakers(tw), speakers(en)
    assert len(sp_zh) == len(sp_en)
    vids_zh, vids_en = js_contents("Forum2023tw.html"), js_contents("Forum2023.html")

    speakers_out = []
    for z, e in zip(sp_zh, sp_en):
        assert z["photo"] == e["photo"], (z, e)
        sid = slug(e["name"])
        speakers_out.append({
            "id": sid,
            "role": "speaker",
            "name": bi(z["name"], e["name"]),
            "title": bi(z["title"], e["title"]),
            "org": bi("", ""),  # 2023 的頭銜 (vip_title) 已含單位；議程的單位用議程圖 affiliation
            "bio": bi(z["bio"], e["bio"]),
            "photo": z["photo"],
            "links": {},
            "_source": "2023ForumpageTW/EN.html .vip_intro",
        })

    # 議程（議程圖轉錄）＋ 影片（Forum2023 頁）
    by_id = {s["id"]: s for s in speakers_out}
    agenda = []
    for sess in T["agenda"]:
        talks = []
        for t in sess["talks"]:
            sp = by_id[t["speaker"]]
            vz = next(x for x in vids_zh if starts_with_name(x["introtitle"], sp["name"]["zh"]))
            ve = next(x for x in vids_en if yt_id(x["videosrc"]) == yt_id(vz["videosrc"]))
            title = t.get("title") or sess["session"]
            talks.append({
                "id": f"{t['speaker']}",
                "speaker": t["speaker"],
                "title": title,
                "affiliation": t["affiliation"],
                "videoTitle": bi(norm(vz["title"]), norm(ve["title"])),
                "video": video_obj(yt_id(vz["videosrc"])),
            })
        agenda.append({"time": {"start": sess["time"][0], "end": sess["time"][1]}, "session": sess["session"], "talks": talks})

    fz, fe = faq(tw), faq(en)
    reg = []
    for a in tw.find(by_class("portal")).find_all(lambda n: n.tag == "a"):
        img = a.find(lambda n: n.tag == "img").attrs["src"].lstrip("./")
        reg.append({"platform": "accupass" if "accupass" in a.attrs["href"] else "eventbrite", "url": a.attrs["href"], "icon": img})

    p = T["partners"]
    return {
        "id": "2023", "edition": 3, "status": "past",
        "title": bi("替身醫療論壇 2023", "Avatar Medicine Forum 2023"),
        "theme": T["kv"]["theme"],
        "date": {"start": "2023-10-21", "end": "2023-10-21", "display": bi("2023/10/21", "2023/10/21")},
        "format": {"zh": "", "en": T["kv"]["format"]["en"]},
        "location": {"type": "online"},
        "hero": {"image": "images/fourm23bk.png", "ogImage": "documents/替身醫療主視覺.png"},
        "registration": reg,
        "intro": bi(intro(tw), intro(en)),
        "speakers": speakers_out,
        "agenda": agenda,
        "faq": [{"q": bi(a[0], b[0]), "a": bi(a[1], b[1])} for a, b in zip(fz, fe)],
        "partners": {
            "organizer": [dict(x, url="https://cancerfree.io/") for x in p["organizer"]],
            "coOrganizer": [dict(x, url=None) for x in p["coOrganizer"]],
            "sponsor": [dict(x, url=None, logo=None) for x in p["sponsor"]],
        },
        "sponsorComposite": p["sponsorComposite"],
        "contact": {
            "phone": "+886-2-27322701",
            "address": bi(
                norm(tw.find(by_class("address")).text()).split(":", 1)[1].strip(),
                norm(en.find(by_class("address")).text()).split(":", 1)[1].strip(),
            ),
        },
        "_sources": ["2023ForumpageTW.html", "2023ForumpageEN.html", "Forum2023tw.html", "Forum2023.html", "data/transcribed.json#2023"],
        "_open_questions": [
            "主視覺海報寫 10:30 AM – 12:25 PM，議程圖寫 09:05–12:00，兩者不一致；頁面上只顯示日期，議程以議程圖為準。",
            "閉幕致詞影片 cjq5EUrFwL8 在 YouTube 已不公開。",
            "英文 FAQ 第 4 題原文為「0. Our Forum is free of charge.」，2022 版為「ZERO.」，保留原文未改。",
        ],
    }


# ================================================================ 2022
def event_2022():
    tw, en = load("2022ForumpageTW.html"), load("2022ForumpageEN.html")
    T = TRANSCRIBED["2022"]

    def intro(doc):
        box = doc.find(by_class("ITDtext"))
        return [norm(p.text()) for p in box.find_all(lambda n: n.tag == "p") if norm(p.text())] or [norm(box.text())]

    def people(doc):
        res = []
        for blk in doc.find_all(by_class("boxes1")):
            head = blk.find(by_class("text1"))
            group = norm(head.text()) if head else ""
            for b in blk.find_all(by_class("boxes2")):
                a = b.find(lambda n: n.tag == "a")
                img = b.find(lambda n: n.tag == "img")
                name = b.find(by_class("spker_name"))
                if not name:
                    continue
                res.append({
                    "group": group,
                    "url": a.attrs.get("href") if a else None,
                    "photo": img.attrs["src"],
                    "name": norm(name.text()),
                    "title": norm(b.find(by_class("spker_title")).text()),
                    "org": norm(b.find(by_class("spker_contant")).text()),
                })
        return res

    def faq(doc):
        ts = [norm(x.text()) for x in doc.find_all(by_class("qa-title"))]
        cs = [norm(x.text()) for x in doc.find_all(by_class("qa-content"))]
        return [(re.sub(r"^\d+\.\s*", "", q), a) for q, a in zip(ts, cs)]

    pz, pe = people(tw), people(en)
    assert len(pz) == len(pe) and all(a["photo"] == b["photo"] for a, b in zip(pz, pe))
    vids_zh, vids_en = js_contents("Forum2022tw.html"), js_contents("Forum2022.html")

    speakers_out = []
    for z, e in zip(pz, pe):
        speakers_out.append({
            "id": slug(e["name"]),
            "role": "guest" if z["group"] == "貴賓" else "speaker",
            "name": bi(z["name"], e["name"]),
            "title": bi(z["title"], e["title"]),
            "org": bi(z["org"], e["org"]),
            "bio": bi("", ""),
            "photo": z["photo"],
            "links": {"website": z["url"]} if z["url"] else {},
            "_source": "2022ForumpageTW/EN.html .boxes2（貴賓／演講者）",
        })
    by_id = {s["id"]: s for s in speakers_out}
    for sess in T["agenda"]:
        for t in sess["talks"]:
            assert t["speaker"] in by_id, t["speaker"]

    agenda = []
    for sess in T["agenda"]:
        talks = []
        for t in sess["talks"]:
            sp = by_id[t["speaker"]]
            vz = next((x for x in vids_zh if starts_with_name(x["name"], sp["name"]["zh"])), None)
            vid = yt_id(vz["videosrc"]) if vz else None
            ve = next((x for x in vids_en if yt_id(x["videosrc"]) == vid), None) if vid else None
            talk = {
                "id": t["speaker"],
                "speaker": t["speaker"],
                "title": t.get("title") or sess["session"],
                "video": video_obj(vid),
            }
            if vz and vid:
                talk["videoTitle"] = bi(norm(vz["introtitle"]), norm(ve["title"]))
                # 舊中文影片頁的 description 是該場演講的中文摘要
                if norm(vz["description"]):
                    talk["summary"] = {"zh": norm(vz["description"]), "en": ""}
            talks.append(talk)
        agenda.append({"time": {"start": sess["time"][0], "end": sess["time"][1]}, "session": sess["session"], "talks": talks})

    fz, fe = faq(tw), faq(en)

    def partners(doc, lang):
        groups = {}
        cur = None
        for n in doc.find_all(lambda n: "boxes7" in n.cls or "boxes9" in n.cls):
            if "boxes7" in n.cls:
                cur = norm(n.text())
                groups[cur] = []
            elif cur:
                a = n.find(lambda x: x.tag == "a")
                img = n.find(lambda x: x.tag == "img")
                if img:
                    groups[cur].append({"url": a.attrs.get("href") if a else None, "logo": img.attrs["src"]})
        return groups

    gz = partners(tw, "zh")
    names = T["partnerNames"]
    key = {"主辦單位": "organizer", "協辦單位": "coOrganizer", "贊助單位": "sponsor"}
    partners_out = {"organizer": [], "coOrganizer": [], "sponsor": []}
    for g, items in gz.items():
        for it in items:
            if it["logo"] == "images/CFBiocn.png":
                continue  # 原頁這格是白色精拓 logo 放在白底上、連到 GeneOnline，看起來是誤放，略過
            url = it["url"]
            if url and "cancerfree.io/zh-tw" in url:
                url = "https://cancerfree.io/"  # 舊網址已 404
            partners_out[key[g]].append({"id": slug(Path(it["logo"]).stem), "name": names[it["logo"]], "url": url, "logo": it["logo"]})

    reg = []
    for a in en.find_all(by_class("boxes11")):
        link = a.find(lambda n: n.tag == "a")
        img = a.find(lambda n: n.tag == "img")
        reg.append({"platform": "accupass" if "accupass" in link.attrs["href"] else "eventbrite", "url": link.attrs["href"], "icon": img.attrs["src"]})

    title_en = norm(en.find(by_class("ITDbox2")).text())  # "2022 Avatar Medicine Forum Digital Twin & Metaverse"
    return {
        "id": "2022", "edition": 2, "status": "past",
        "title": bi("替身醫療論壇 2022", "2022 Avatar Medicine Forum"),
        "theme": bi("邁向元宇宙 替身醫療論壇", "Digital Twin & Metaverse"),
        "date": {"start": "2022-12-21", "end": "2022-12-21", "display": bi(" ／ ".join(s["zh"] for s in T["kv"]["sessions"]), " / ".join(s["zh"] for s in T["kv"]["sessions"]))},
        "format": {"zh": "", "en": ""},
        "location": {"type": "online"},
        "hero": {"image": "images/web_01.png", "ogImage": "images/web_01.png"},
        "registration": reg,
        "intro": bi(intro(tw), intro(en)),
        "speakers": speakers_out,
        "agenda": agenda,
        "faq": [{"q": bi(a[0], b[0]), "a": bi(a[1], b[1])} for a, b in zip(fz, fe)],
        "partners": partners_out,
        "_sources": ["2022ForumpageTW.html", "2022ForumpageEN.html", "Forum2022tw.html", "Forum2022.html", "data/transcribed.json#2022"],
        "_check": {"en_heading_on_page": title_en},
        "_open_questions": [
            "主視覺只寫 12/21，年份取自頁面標題「替身醫療論壇 2022」。",
            "陶秘華、林清詠、詹婷怡三場在舊影片頁沒有影片（被註解掉或網址空白）。",
        ],
    }


# ================================================================ 2021
def event_2021():
    vz, ve = js_contents("Forum2021tw.html"), js_contents("Forum2021.html")
    assert len(vz) == len(ve)
    T = TRANSCRIBED["2021"]
    speakers, talks = [], []
    intro_zh = None
    for z, e in zip(vz, ve):
        assert yt_id(z["videosrc"]) == yt_id(e["videosrc"])
        name_zh, name_en = norm(z["name"]), norm(e["introtitle"])
        sid = slug(name_en)
        if not any(s["id"] == sid for s in speakers):
            speakers.append({
                "id": sid, "role": "speaker",
                "name": bi(name_zh, name_en),
                "title": bi(norm(z["title"]), norm(e["description"])),
                "org": bi("", ""),
                "bio": bi("", ""),
                "photo": None, "links": {},
                "_source": "Forum2021tw.html / Forum2021.html 影片清單",
            })
        desc = norm(z["description"])
        part = norm(e["name"])  # EN 版用 name 欄位標 I / II / III
        talk = {
            "id": f"{sid}-{yt_id(z['videosrc'])}",
            "speaker": sid,
            "title": bi(norm(z["introtitle"]) + (f" {part}" if part in ("I", "II", "III") else ""), norm(e["title"]) + (f" {part}" if part in ("I", "II", "III") else "")),
            "video": video_obj(yt_id(z["videosrc"])),
        }
        if desc.startswith("國衛院"):
            intro_zh = intro_zh or desc  # 開幕致詞三支影片共用同一段活動說明，當作活動介紹
        elif desc:
            talk["summary"] = {"zh": desc, "en": ""}
        talks.append(talk)
    kv = T["kv"]
    return {
        "id": "2021", "edition": 1, "status": "past",
        "title": bi("患者替身醫療論壇 2021", "Avatar Medicine for Patient Forum 2021"),
        "theme": kv["theme"],
        "date": {"start": "2021-09-25", "end": "2021-09-25", "display": bi("2021/9/25", "2021/9/25")},
        "format": {"zh": "", "en": ""},
        "location": {"type": "unknown"},
        "hero": {"image": "images/bk2021.png", "ogImage": "images/bk2021.png"},
        "registration": [],
        "intro": {"zh": [intro_zh] if intro_zh else [], "en": []},
        "speakers": speakers,
        "agenda": [{"time": None, "session": bi("演講影片", "Talks"), "talks": talks}],
        "faq": [],
        "partners": {
            "organizer": [dict(x, url="https://cancerfree.io/" if x["id"] == "cancerfree" else None, logo="images/CFBiocn2.png" if x["id"] == "cancerfree" else None) for x in T["partners"]["organizer"]],
            "coOrganizer": [dict(x, url=None, logo=None) for x in T["partners"]["coOrganizer"]],
            "sponsor": [],
        },
        "_sources": ["Forum2021tw.html", "Forum2021.html", "data/transcribed.json#2021"],
        "_open_questions": [
            "2021 沒有活動頁，只有影片清單；講者照片、議程時間、活動地點都沒有原始資料。",
            "「演講影片」是議程分組的標籤（UI 文字），不是原站內容。",
        ],
    }


# ================================================================ 首頁
def home():
    tw, en = load("indextw.html"), load("index.html")

    def block(doc):
        m = doc.find(by_class("indexmassage"))
        title = norm(m.find(by_class("IM_title_txt")).text())
        paras = [norm(p.text()) for p in m.find(by_class("IM_contant")).find_all(lambda n: n.tag == "p") if norm(p.text())]
        return title, paras

    tz, pz = block(tw)
    te, pe = block(en)
    html = (LEGACY_DIR / "index.html").read_text(encoding="utf-8")
    photos = re.findall(r'hyperlink:\s*"([^"]*)",\s*image:\s*"\./([^"]+)"', html)
    return {
        "brand": {
            "name": bi(norm(tw.find(by_class("topboard-left-1")).text()), norm(en.find(by_class("topboard-left-1")).text())),
            "tagline": {"zh": "", "en": norm(en.find(by_class("topboard-left-2")).text())},
        },
        "introTitle": bi(tz, te),
        "intro": bi(pz, pe),
        "highlights": [{"image": img, "link": ("https://cancerfree.io/" if "cancerfree.io" in link else None)} for link, img in photos],
        "_sources": ["indextw.html", "index.html"],
    }


SUPPLEMENTS = json.loads((ROOT / "data/supplements.json").read_text(encoding="utf-8"))


def apply_supplements(ev):
    """合併 data/supplements.json：原站沒有、事後查證補上的影片與網址。"""
    sup = SUPPLEMENTS.get(ev["id"], {})
    for sid, v in sup.get("videos", {}).items():
        talks = [t for s in ev["agenda"] for t in s["talks"] if t["speaker"] == sid]
        assert talks, f"supplements: {ev['id']} 找不到講者 {sid}"
        for t in talks:
            if not t.get("video"):
                t["video"] = dict(v)
    for pid, v in sup.get("sponsorUrls", {}).items():
        items = [x for x in ev["partners"]["sponsor"] if x["id"] == pid]
        assert items, f"supplements: {ev['id']} 找不到贊助商 {pid}"
        for x in items:
            x["url"] = v["url"]
            x["logo"] = x.get("logo")
            x["_source"] = v["_source"]
    return ev


def main():
    out = ROOT / "data/events"
    out.mkdir(parents=True, exist_ok=True)
    for fn in (event_2021, event_2022, event_2023):
        applied.clear()
        ev = apply_supplements(fn())
        ev["_fixes"] = sorted({f"{a} → {b}" for a, b in applied})
        (out / f"{ev['id']}.json").write_text(json.dumps(ev, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        n_talks = sum(len(s["talks"]) for s in ev["agenda"])
        n_vid = sum(1 for s in ev["agenda"] for t in s["talks"] if t.get("video"))
        print(f"data/events/{ev['id']}.json  講者 {len(ev['speakers'])}  場次 {n_talks}  影片 {n_vid}  FAQ {len(ev['faq'])}  修字 {len(ev['_fixes'])}")
    applied.clear()
    h = home()
    h["_fixes"] = sorted({f"{a} → {b}" for a, b in applied})
    (ROOT / "data/home.json").write_text(json.dumps(h, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"data/home.json  介紹 {len(h['intro']['zh'])}/{len(h['intro']['en'])} 段  花絮 {len(h['highlights'])} 張")


if __name__ == "__main__":
    main()

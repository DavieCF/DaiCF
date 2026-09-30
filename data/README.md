# data/ — 網站內容

網站上的每一段文字都來自原站，不另外撰寫。來源分三種：

| 來源 | 放在哪 | 怎麼來的 |
| --- | --- | --- |
| 舊 HTML 裡的文字（`docs/legacy/`） | `events/*.json`、`home.json` | `scripts/extract.py` 直接抽，只做空白正規化 |
| 只存在圖片裡的文字（議程圖、主視覺、logo） | `transcribed.json` | 人工逐字轉錄，每段標註來源圖檔 |
| 精拓生技官網的頁面標題 | `site.json → links` | 2026-09-29 抓取各頁 `<title>` 與 meta description |

`site.json → ui` 另外有少數介面文字（按鈕、區塊標題）。原站用過的都標了 `_source`，其餘是新版介面才需要的按鈕字。

## 檔案

```
data/
├─ site.json         主辦單位、聯絡資訊、官網連結、介面文字
├─ home.json         首頁：品牌名稱、介紹、活動花絮（由 extract.py 產生）
├─ transcribed.json  從圖片轉錄的內容（人工維護）
├─ supplements.json  原站沒有、事後查證補上的影片與網址（人工維護，附出處）
└─ events/
   ├─ 2021.json      由 extract.py 產生
   ├─ 2022.json
   └─ 2023.json
```

`home.json` 與 `events/*.json` 是**產生出來的檔案**，要改內容請改來源：
- 改文字 → 改 `docs/legacy/` 裡的舊 HTML 或 `transcribed.json`，再跑 `python scripts/extract.py`
- 補影片或網址 → 改 `supplements.json`，再跑 `python scripts/extract.py`
- 舊 HTML 退役後（不再保留在 repo），就直接改 `events/*.json`，並刪掉 extract.py

## 一場活動的欄位

| 欄位 | 說明 |
| --- | --- |
| `title` `theme` | 名稱、主題。只有一種語言的原文時，另一語言留空，頁面會顯示原文 |
| `date.start` `date.display` | ISO 日期（給搜尋引擎）與原文日期字串（給人看） |
| `intro.zh[]` `intro.en[]` | 論壇介紹段落 |
| `speakers[]` | `id` 給議程引用；`role` 為 `guest`（貴賓）或 `speaker`；`links.website` 取自原頁講者照片的連結 |
| `agenda[].talks[]` | `speaker` 指向講者 id；`affiliation` 是議程圖上的單位欄；`video.id` 是 YouTube ID；`video.available: false` 表示影片已不公開，頁面不顯示 |
| `talks[].summary` | 舊中文影片頁的演講摘要（只有中文） |
| `partners` | 主辦／協辦／贊助。名稱讀自 logo 圖，網址取自原頁 logo 的連結 |
| `_sources` `_fixes` `_open_questions` | 來源檔、已修的原文錯字、待確認事項。以 `_` 開頭的欄位不會出現在頁面上 |

## 檢查

```
python scripts/audit-content.py
```

逐段比對 `dist/` 每一頁的可見文字與原始來源，列出任何找不到出處的文字。

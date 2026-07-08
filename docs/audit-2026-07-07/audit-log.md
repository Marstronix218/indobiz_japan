# Article Accuracy Audit Log — 2026-07-07 (Fable 5)

Rate basis: 1 INR ≈ 1.70円, 1 USD ≈ 162円, 1 USD ≈ 95.4 INR (2026-07-06 frankfurter).
Key conversions: ₹1 crore = 1,000万ルピー ≈ 1.7億円; ₹1 lakh crore = 1兆ルピー ≈ 1.7兆円.
Systemic bug signature: "N crore" transcribed as "N億ルピー" (10x too high; correct = N/10 億).

Verdict codes: OK | MINOR(fix in place) | MAJOR(list only) | VERIFY(needs source fetch) | STATUS(status-change candidate) | SRC(irrelevant sources attached — cleanup)

## batch-01 (idx 0-24)
- [0] c859e7d4 OK — heavy hedging but no factual claim at risk
- [1] 6629ed51 MINOR — "2025年に署名した「包括的戦略的パートナーシップ」": India-Vietnam CSP was signed 2016 (2024 action plan); year likely wrong → remove "2025年に署名した" (keep 「包括的戦略的パートナーシップ」をさらに深化させ…)
- [2] 50c4f34e OK
- [3] 4ea5b6af OK — zero-number process memo; low info value (pattern noted, no fix)
- [4] a96546c3 OK — WB election facts match BBC/Guardian; Mamata 15y ✓
- [5] 93c985eb MINOR — ₹3,936 crore ≈ 670億円, not 「約5,900億円」; 「1.65兆 crore（原表記、約25兆円相当）」→ ₹1.65 lakh crore = 1兆6,500億ルピー ≈ 約2.8兆円 (25兆円 is ~9x high). DUP pair with [9] → STATUS list (same story, both published)
- [6] 325d385d MINOR — delete dangling trailing sentence 「事実関係は以下の通り整理する。」
- [7] 21c44a62 MINOR — title/summary claim 6.6% is 「出典不明」but own sources are S&P (FY27 cut) + CRISIL → reword title + first sentences to attribute; "2026年GDP成長率"→"2026年度（FY27）"
- [8] a645aa8d OK
- [9] 55fdd36c MINOR — 「1兆6,500億ルピー（記事では約1兆9,800億円）」→ 約2.8兆円 (source would state $19.8B ≈ 3.2兆円 or ₹1.65L cr ≈2.8兆円; "記事では…円と表記" is false attribution — Indian paper wouldn't quote yen). Remove dangling 「換算根拠は下記注記を参照」. 「3,936クローレ（約700億円）」is ~OK (669億). DUP with [5]
- [10] fbc1d9ad OK — DUP pair with [21] → STATUS list
- [11] bb5117b9 MINOR — ₹30,000 crore/month = 約3,000億ルピー ≈ 5,100億円/月, not 「約3兆円」. Fix title 「月額約3兆円」→「月額約5,000億円」+ summary quote; drop "単位・桁の記載が不明確" clause (ToI/IE state Rs 30,000 crore clearly); typo 価格転換→価格転嫁 (title)
- [12] fda907b9 OK — Biocon FY27, CEO Shreehas Tambe ✓
- [13] d61a8a56 OK
- [14] ab9b8616 MINOR — April 2026 MPC "current fiscal" = FY2026-27; title+summary say 2025–26年度 → change to 2026–27年度
- [15] d2b7a408 MINOR — Assam Tata facility is OSAT/packaging, not fab → 「グジャラート州でのファブ建設とアッサム州での後工程（OSAT）施設準備」
- [16] 256653b9 OK — Accor 300 by 2030, Hoxton/InterGlobe, Sofitel Rishikesh Narendra Nagar ✓
- [17] 7e180069 MINOR — remove fabricated verification claim 「本稿作成時点で筆者は公開の会社発表、登記記録、プレスリリースを確認したが…得られていない」→ replace with neutral 「投票の日時・会合の公式記録は公開報道からは確認できていない」
- [18] d42df059 VERIFY (ToI direct URL) — 90日/120日 requirement + 12% interest; SRC cleanup: BBC quiz + rocker-gig sources are irrelevant
- [19] 7d482ae1 VERIFY (ToI direct URL) — suspect: 「2025年度に過去最多の2兆ルピー超」misattributes (headline: FY26 outflows crossed ₹2L cr topping FY25 record); 「約97,000億ルピー」= ₹96,974 crore = 約9,700億ルピー (10x bug). Fix after fetch
- [20] bbecf1fe OK — ADB Albert Park, −0.6pt → 6.3% (attributed)
- [21] fd08b159 MINOR — 「約200億ルピー」→ ₹200 crore = 約20億ルピー (10x bug). DUP with [10]
- [22] 825fe623 OK
- [23] d96a1ecc OK text; SRC cleanup: 3 irrelevant sources (Modi WFH ×2, India-Pak)
- [24] 597591c6 OK

### Status-change candidates so far
- DUP: [5] 93c985eb + [9] 55fdd36c — same Gujarat semicon approval, both published (5=economy, 9=regulation). Recommend unpublishing one (keep [9], better numbers after fix).
- DUP: [10] fbc1d9ad + [21] fd08b159 — same CCI/Pernod probe, both published. Recommend keeping [21] (more detail) or [10]; user decision.

## batch-02 (idx 25-49)
- [25] 7ab42c80 MINOR — パンクジュ・ジャイン → パンカジ・ジャイン (Pankaj); role is Member Secretary (事務局長), not plain メンバー (title+summary)
- [26] 889479d6 MINOR — title contains internal artifact 「（表記訂正）」; summary sentence 「本文で誤記されていた助成金額は…訂正されており」 refers to own draft process → rewrite title (₹2crore=約2,000万ルピー≈3,400万円, 倍増) + summary sentence
- [27] ad46fce9 OK
- [28] 4bc31717 OK content (repo 5.25% matches headline) — DUP pair with [14] ab9b8616 (same April 2026 MPC, both published) → STATUS
- [29] fbb36587 OK
- [30] 8d52980f MINOR — ₹1,600-1,700 crore/day = 約160億〜170億ルピー (not 1,600億〜1,700億); ₹1 lakh crore in 10 weeks = 約1兆ルピー (not 約10兆) — both 10x bug, source headline explicit
- [31] 68692bae OK
- [32] e83c0976 OK text; SRC cleanup (World Cup viewing source irrelevant)
- [33] 69e1afe2 OK
- [34] 9c04264c OK
- [35] 17eabf56 OK (hedged)
- [36] dd4e87d5 OK
- [37] d9e9a509 OK (1兆ドル claim flagged as unsourced in text itself)
- [38] b9dfff72 MINOR — 「南部シリコンバレーと呼ばれるシカンダラバードやテランガナ州」geography wrong (Secunderabad IS in Telangana; not called Silicon Valley) → 「テランガナ州シカンダラバードやグジャラート州で」, drop シリコンバレー clause
- [39] e40859e0 MINOR — 3× 10x bug: 38,440億ルピー→約3,844億ルピー (₹38,440cr, ToI '38.4k crore' ✓); 247,000億ルピー→約2兆4,700億ルピー (₹2.47L cr); 31,115億ルピー→約3,111億ルピー (BS '₹31,115 cr' ✓)
- [40] 4fd95ac5 OK
- [41] 9592367e MINOR — プラティシュ・クマール → プラティユシュ・クマール (Pratyush)
- [42] 8118b687 OK text; SRC cleanup (rocking horse + Spain cave sources junk)
- [43] 76a56764 MINOR — 「創業メンバーの一人アシシュ・アグラワル氏」: Groww founders are Keshre/Jain/Singh/Bansal; Agrawal not among them; source headline doesn't say founder → rephrase without 創業メンバー claim
- [44] 9d38c387 MINOR — Hemisphere board meeting date: summary 5/21 vs source headline May 20 → 5月20日. Low news value (scanx roundup) noted for report
- [45] 60bcedd2 OK content — DUP pair with [24] 597591c6 (Modi forex appeal, both published) → STATUS
- [46] 84c36a57 MINOR — 「BJPの高官が銃撃される」→ shot victim was BJP leader's aide (側近), per Guardian headline; follow-up of [4] (acceptable, not dup)
- [47] f13fdc44 OK
- [48] 86ad5b3c OK
- [49] 2bba18c3 MINOR — 「73,481株」→ 17万3,481株 (source: 1,73,481 = Indian grouping misread); reformat 63,81,15,996株→6億3,811万5,996株 / 63,82,89,477→6億3,828万9,477株; Rs.50,00,000→500万ルピー / Rs.65,00,000→650万ルピー

### Status-change candidates (added)
- DUP: [14] ab9b8616 + [28] 4bc31717 — April 2026 RBI MPC hold; keep [28] (has 5.25% figure; [14] also has FY-label error)
- DUP: [24] 597591c6 + [45] 60bcedd2 — Modi forex/fuel appeal; near-identical scope

## batch-03 (idx 50-74)
- [50] c8f76700 MINOR — fabricated reporting claims: 「一次情報の聞き取りでは…確認された」「編集部の現場取材では…指摘があった」→ rewrite as 報道ベース. DUP with [33] 69e1afe2 (same 2 sources, both published) → STATUS
- [51] 77ce03c6 MINOR(framing) — article wrongly "corrects" that speaker was Yogi not Modi; reality: Modi appealed nationally, Yogi govt issued UP directives (convoy cuts, 2-day WFH) following it (aajtak headline). Rewrite title + lead 2 sentences; drop 「事実関係を訂正する」
- [52] 3413f5ce MINOR — 「2026年5月のインドCPIは3.48%」→ April CPI announced May; attribute Moody's (6% cut) + Berger Paints (paint maker) per source headlines instead of 「機関名…明示されておらず」
- [53] d2f1a040 MINOR — remove internal artifact 「読者想定：インド市場で物流・自動車関連業務を行う日本企業。」 at start of summary
- [54] df90d3d1 OK text — DUP with [37] d9e9a509 (Modi gold appeal, both published) → STATUS
- [55] a5571e23 OK; SRC cleanup (TCS toxic workplace irrelevant)
- [56] 42eafeef OK (April CPI 3.5%/3.48% correct) — DUP with [58] b0da3691 → STATUS
- [57] 707cd474 OK (rupee record low, CEA Nageswaran FY27)
- [58] b0da3691 MINOR — 「2026年5月12日、インドの消費者物価上昇率は…3.48%に達し」→ 5月12日発表の4月CPIが3.48%. DUP with [56]
- [59] 44353c80 MINOR — サブリマラインダストリーズ → サブリマラ・インダストリーズ (Sabrimala Industries mis-split). Low news value (scanx)
- [60] 05e06e9d OK; SRC cleanup (Jio IPO source irrelevant)
- [61] 6bdd1dbb OK (5-nation tour plausible: UAE + Netherlands + Nordic summit + Italy, attributed to Reuters)
- [62] 7b08116d OK — sugar ban Sep30, Amul/MotherDairy +₹2/L, AirIndia cuts, lubricants — all match headlines
- [63] 33519d67 MINOR — causality: 「成長率が6%に低下したことを受け、利上げを…」→「成長率が6%に低下する中でも、インフレ圧力を受けて利上げの可能性」(headline: hike twice amid inflation as growth slips)
- [64] 971c3ba6 OK
- [65] c1964875 OK text; SRC cleanup ×3 (super rules/CGT/ML weather); off-target news value noted
- [66] b4931294 OK text; SRC cleanup ×3 (Pakistan jets/China-Trump/Politico)
- [67] b0888cd6 OK text; SRC cleanup ×3 (Maggi/CBSE/gold duty); evergreen how-to, low news value
- [68] 6d92f6f6 OK (20B by 2029 hedged as unsourced)
- [69] fafbd500 OK — Abbott/GE Power/Arfin figures internally consistent, crore/lakh/million conversions CORRECT here
- [70] 638003d3 MINOR — title 「出所不明の予測」+ summary 「機関名…明示していない」false: sources name Crisil (6.6%, infl 5.1%) + Morgan Stanley (6.7%) → attribute properly
- [71] c0e1b795 OK
- [72] 6016e485 OK; SRC cleanup (Lilly source irrelevant)
- [73] d16bdd12 MINOR — コウリ→コーリ (Kohli); 「無敗100点」→「ノットアウトの100点」; RCB/KKR figures plausible
- [74] 3242ab3a OK

### Status-change candidates (added)
- DUP: [33] 69e1afe2 + [50] c8f76700 — PLI aircraft/EV-startup story, same sources
- DUP: [37] d9e9a509 + [54] df90d3d1 — Modi gold-purchase appeal
- DUP: [56] 42eafeef + [58] b0da3691 — April CPI 3.48%/3.5%
- NOTE: Modi-appeal family [24][45][37][54][38][51] = 6 published articles on one event; consolidation advised

## batch-04 (idx 75-99)
- [75] 942d2b39 OK (UP storms 111 dead ✓ CNA)
- [76] 05ff4f4c OK (market wrap internally consistent w/ headlines)
- [77] f508438a OK
- [78] 5c8c6e0d OK
- [79] 22db959c OK (Tata Trusts halt; hedged)
- [80] 92d531ba OK (all claims match Reuters headlines)
- [81] d058da19 MINOR — 「投資家名…明記されていない」false: Entrackr headline says led by Prosus → add Prosus, drop that clause
- [82] 15e12c1e OK
- [83] e78cdaa1 OK
- [84] 32d4905d MINOR — anonymized 「グローバルなオーディオブランド」→ name JBL (headline explicit); SRC cleanup ×2 (tennis/murder)
- [85] 85f97df3 OK text; SRC cleanup ×2 (Zambia rift ×2)
- [86] a1244ab7 OK — DUP with [91] 32f406ef (浜松市会議体, both published) → STATUS
- [87] 8c960761 VERIFY (ToI direct) — 「輸出徴収額は…16.5ルピー、16ルピーとなる」(cut TO those levels?) check body
- [88] 6fc7d1d4 MINOR — name Emirates NBD / RBL Bank in summary (headlines explicit); fix garbled 「取得済み払込資本の49％から最大74％の範囲」→「最大74%、約30億ドル」
- [89] 116b0599 MINOR — 10x bug ×2: Q4 profit 「2965億ルピー台」→ ₹2,965 crore = 約297億ルピー; FY 「約1兆885.82億ルピー」→ ₹10,858 crore = 約1,086億ルピー. (Revenue 2.32兆ルピー is CORRECT)
- [90] 74d09d63 OK
- [91] 32f406ef OK — DUP with [86]
- [92] 8c286e46 MINOR — 「インドと湾岸各国（UAEを含む）」→ インドとUAE (bilateral per both sources) in title+summary
- [93] ac97175a OK (heavily hedged)
- [94] 748d6c52 OK
- [95] d4f3bea6 MINOR — typo 「UPS Iイベント」→「UPSI（未公表重要情報）イベント」; ultra-low news value (scanx microcap compliance) noted
- [96] 420c955b OK (Sarvam $300M HCLTech ✓)
- [97] 1b345af5 MINOR — fabricated 「記者の現地取材視点を基に」→「JETROの報告を基に」(source = jetro.go.jp)
- [98] 9bbbcc50 MAJOR/STATUS — meta-article about another article's unsourced claim (nominal GDP falling to 6th — implausible; India is 4th-5th), zero sources attached, no verifiable facts; below publication standard → recommend unpublish/rewrite
- [99] 8e6aa09e MINOR — math: VAT 25%→7% cuts fuel price 14.4% (18/125), not 18% → cost impact ≈4〜6% (not 5.4〜7.2%) in summary + implications ×2; SRC cleanup ×4 (Venky's/Wheels/Somany/Vodafone)

### Status-change candidates (added)
- DUP: [86] a1244ab7 + [91] 32f406ef — 浜松市インド会議体
- MAJOR: [98] 9bbbcc50 — unsourced meta-article, implausible premise

## batch-05 (idx 100-124)
- [100] 98e7bfaf OK; [101] acc88c9e OK; [102] 7c17ef32 OK (WPI 8.3% ✓); [103] 71fc1183 OK
- [104] 8569495c MINOR — 「差し止めを命じた具体的な行政機関名は…明確になっていない」false: own sources name Charity Commissioner → name it. DUP with [79] 22db959c → STATUS (keep [79])
- [105] 136a6fa1 OK text — TRIPLE DUP: 浜松市 council = [86][91][105] all published → STATUS
- [106] 400cc087 OK text — DUP-ish with [111] a9a3d506 (silver curbs, 1 day apart; [111] has final details) → STATUS (keep [111])
- [107] 155c1112 MINOR — remove dangling 「（出典：既存記事、現地ヒアリングの有無は本文末に注記）」(no such 注記 exists)
- [108] 0b119626 OK; [109] 5e9c662a OK (Toyota plant, NHK); [110] add67947 OK
- [111] a9a3d506 OK (restricted list details headline-backed)
- [112] 1314b3c5 OK (JSW 80mtpa attributed to Mint; SAIC stake cut ✓; battery JV ✓)
- [113] 25f03aba MINOR — strip internal reference markers 「（参考1）〜（参考5）」 (7 occurrences in summary)
- [114] 981029f4 (REVIEW) — content solid, ₹4,730cr correct; fix stale FX note 「1 USD = 83 INR換算で約USD 570 million」→ 約473億ルピー（約800億円）. STATUS candidate: review→publish after fix
- [115] e19cf94b OK (SC judges 34→38 via ordinance; ordinance-as-interim correctly explained)
- [116] b2314826 (REVIEW) — content headline-backed; STATUS candidate: review→publish (style boilerplate tail only)
- [117] f297a163 OK (exports −9.07% → $2,226.45M ✓; gold 842 vs 1,076 = −21.8% ✓)
- [118] a909c3fa MINOR — unreadable Indian units: 「単体当期純利益が150,748ラク（lakh）ルピー」→ 約1,507クロール（約151億ルピー）; 「152,602ラクルピー」→ 約153億ルピー (Godfrey Phillips)
- [119] 3d4b98bb MINOR — 10x bug in TITLE + summary + implications: 「5月に約2.7兆ルピー流出」→ ₹27,000 crore = 約2,700億ルピー; 「約27,048億ルピー」→ 約2,705億ルピー; (累計2.2兆ルピーは正しい). Internal contradiction (monthly > cumulative) currently visible
- [120] ac8bc72f OK
- [121] 1823a8ae MINOR — 「約3.12 lakh croreルピー」→ 約3.12兆ルピー（約5.3兆円）
- [122] 9b56c484 OK; [123] 19ca23bd OK (template boilerplate tail noted)
- [124] 2b2d7908 MINOR — misread: 「既存の主要株主であったICICI Prudentialの持ち分は10%にまで引き下げられる」→ Prudential plc cuts its OWN stake in ICICI Pru Life to 10% (headline); バーリ・ライフ→バーティ・ライフ (Bharti); render ₹3,500 crore = 約350億ルピー（約600億円）

### Status-change candidates (added)
- DUP: [79]+[104] Tata Trusts halt; TRIPLE [86][91][105] 浜松市; [106]+[111] silver curbs
- REVIEW→PUBLISH candidates: [114] 981029f4 (after FX-note fix), [116] b2314826

## batch-06 (idx 125-149)
- [125] OK; [128] OK; [129] OK; [130] OK (Adani DOJ drop + $10B pledge ✓); [133] OK; [135] OK; [136] OK (CALPOL); [139] OK (PR-sourced, low value); [141] OK; [142] OK; [143] OK (rupee 96.70 record low); [146] OK; [147] OK
- [126] add1ba0d MINOR — title readability: 「Rs27,048 crore流出で年累計Rs2.2 lakh croreに」→ 2,700億ルピー/2.2兆ルピー表記. NOTE: conversions in body are CORRECT. DUP with [119] 3d4b98bb (same ToI story, both published) → STATUS: keep [126], [119] is the 10x-wrong one
- [127] 0ce94512 MINOR — 10x bug ×2: 「約4,730億ルピーの資本注入」→ ₹4,730cr = 約473億ルピー; 「約5万1,970億ルピーの純利益」→ ₹51,970cr = 約5,197億ルピー. Also anonymized → name Vodafone Idea. VI family: [114 review]+[127]+[134] → STATUS note
- [131] 7f844249 MINOR — strip internal markers 「（参考資料N）」×7
- [132] 8a71f0e8 MINOR — strip citation markers 「（事実出典：[1][4]）」etc ×5 + closing bracket sentence
- [134] 97a32efc MINOR — name Vodafone Idea (anonymized 大手通信事業者); ₹1T figure correct
- [137] 170d20c8 (REVIEW) — content good, ₹590cr→59億ルピー CORRECT; anonymized IDFC First Bank → STATUS candidate publish after naming
- [138] 5eb1143f OK-ish (anonymized companies; style pattern noted)
- [140] 3b869c23 (REVIEW) — IOTC tuna quota, solid, Japan-relevant → STATUS candidate publish (editorial call: インド洋 topic)
- [144] 84a51920 MINOR — 10x bug: title 「1日750億ルピーの赤字」+ summary → ₹750cr/day = 約75億ルピー/日
- [145] dd32335a (REVIEW) — implications contain broken range 「50万〜20万ドル」+ vendor-POV fabricated figures; recommend KEEP in review
- [148] 6caefdb6 MINOR — 「概ね6%台前半に収束」wrong (range 6.2–6.7) → 「6.2〜6.7%のレンジ」; name Crisil/ICRA/Ind-Ra per headlines
- [149] a33cd5fb MINOR — drop false event date 「2026年5月19日、」(crawl date, not webinar date). DUP with [0] c859e7d4 (same DD News trio) → STATUS

### Status-change candidates (added)
- DUP: [119]+[126] FPI May outflows (keep [126]); [0]+[149] Modi post-budget webinar (DD News)
- VI family: [127]+[134] published + [114] in review — same-topic cluster; recommend publish [114] only if [127] unpublished, else keep review
- REVIEW→PUBLISH: [137] (after naming IDFC First), [140] (tuna quota)
- KEEP REVIEW: [145]

## batch-07 (idx 150-174)
- OK: [150] (90paise math all ✓), [152], [154], [156], [158], [159], [161], [163], [164], [166], [170], [171], [173]
- [151] f54f4205 MINOR — typo 「20年5月に市場投入」→「2026年5月に市場投入」
- [153] c88340ed MINOR — 「保健相」→「労働相」(EPFO under Labour Ministry; Mandaviya is Labour Minister); remove leaked editorial meta 「ここで、報道資料が示す具体的事実として…記載を控えた。」(last 2 sentences)
- [155] 4cc576d3 (REVIEW) — fabricated regional detail 「地域別には、南部・西部でセメント…北部では…」not in sources → publish candidate AFTER removing that sentence
- [157] 438291ff MINOR — math: 10,000L/day × ₹4 = ₹40,000/DAY = 月間約120万ルピー (text says 月間約4万ルピー, 30x low); implications recompute: 20%転嫁→月96万負担, 50%→60万, 100%→0
- [160] ee719be7 (REVIEW) — no factual defect found; generic labour-codes explainer → publish candidate
- [162] fae94c5a (REVIEW) — content good (UAE pipeline 50% ✓, rupee −14%弱) → publish candidate
- [165] abd07686 MINOR — nonsense numbers in implication (目標売上0.5〜1百万円 vs 費用300〜800万円) → drop 売上/費用 figures, keep KPI 20件/3社
- [167] 103431da OK text — 浜松 family 4th article → STATUS consolidate [86][91][105][167]
- [168] ccf2aeaa MINOR — implication FX range 「1ドル＝80〜90ルピー」stale (spot 96-97) → 「95〜100ルピー」
- [169] 0d92a928 MINOR — 「今年初めに決まった輸入関税の引き上げ」→ duty hike was 2026-05-13 → 「5月に決まった」
- [172] 25cf54f0 MINOR — same stale FX range 「80〜90ルピー」→「95〜100ルピー」
- [174] ff8cd3f8 MINOR — strip leaked constraint markers 「（40〜80字）」×3 in implications

## batch-08 (idx 175-199)
- OK: [183] (tiny: 補欠選挙→選挙 low-prio), [184] cockroach party ✓, [186], [187] (1.1 lakh cr ✓ correct), [188], [189] (3 differing travel stats correctly explained), [190], [191], [192] (₹1L cr ✓), [193], [194], [195], [196] (rupee 95.23 rally; timeline consistent), [197], [198] (₹92,000cr ✓ correct)
- [175] 52b72961 (REVIEW) — vague single-source speculative → KEEP review
- [176] 6ce3df85 MINOR — 「ある国からの対インド投資は1000億ドル…600社」→ name カナダ (sources = Goyal-Canada); strip 「—根拠:参考記事N」markers ×3
- [177] 4083c6af (REVIEW) — Rubio visit; strip 「（参考N）」×6 if published; DUP with [185] → KEEP review ([185] preferred)
- [178] 3b9b63bc MINOR — typo 「通貨ルルピー」→「通貨ルピー」
- [179] c24e0100 — DUP with [173] 9a0cbd22 (Hard Rock closures, both published) → STATUS; Seminole tribe detail ✓
- [180] ad120ded (REVIEW) — single-source generic AI-layoffs piece → KEEP review
- [181] e66f2365 (REVIEW) — Logitech Mac keyboards; ZERO India relevance → KEEP review (off-topic)
- [182] 083e916d (REVIEW) — PMI slowdown; OK quality, single source → publish candidate (low priority)
- [185] 1d84ef39 (REVIEW) — Rubio visit, good quality; strip 「（根拠：参考資料N）」×3 → publish candidate (instead of [177])
- [199] 6129dc48 MINOR — strip 「（参考リンクN）」markers ×3 in implications

## batch-09 (idx 200-224)
- OK: [200], [206], [207], [208], [211] (Byju 6mo ✓), [212], [213], [216] (1.98兆 ✓), [217] (40 lakh=400万 ✓), [218], [219], [220]
- [201] 5924f8b1 (REVIEW) — CD 7.70% fine; publish candidate (low prio; strip trailing 参考リンク paren)
- [202] 4825f67b MINOR — strip [1]-[4]/出典[N] markers ×7
- [203] 235d1983 MINOR — TITLE typo 「ループ安」→「ルピー安」
- [204] 2867a267 (REVIEW) — KEEP review (generic WSJ-derived, clutter)
- [205] 2c0762fb MINOR — add readable conversion 「39,437クローレ（約3,944億ルピー、約6,700億円）」
- [209] 4a14ef91 MINOR — 「ラジュラム・ラジャン」→「ラグラム・ラジャン」(Raghuram)
- [210] 14a30535 + [222] e2578452 (REVIEW both) — same HT 8thCPC single-source story → KEEP review both (speculative)
- [214] e2f2b790 MINOR — delete fabricated self-promo + garbage tail 「インドビズジャパンでは、…提供している。す。」
- [215] d9675b15 (REVIEW) — IEA $170bn ✓ → publish candidate
- [221] 57b593ca (REVIEW) — exports +8.8% consistent → publish candidate
- [223] 97cc7cbc (REVIEW) — TITLE typo 「イン出資拡大」→「インドでの投資拡大」; then publish candidate
- [224] 2492baaf MINOR — 10x bug ×2: Q4 loss 「約2,537億ルピー」→ ₹2,537cr = 約254億ルピー; FY 「約2,393.6億ルピー」→ 約239億ルピー

## batch-10 (idx 225-249)
- OK: [225], [226], [227], [228] (10cr=1億 ✓), [229], [231], [234], [235] (₹1T ✓ 28cr ✓), [237], [239], [240], [241] (1.54L cr ✓, 4.5 lakh=45万 ✓), [243], [244], [246], [247] (₹82.6cr pay ✓), [248], [249]
- [230] 1b4815aa (REVIEW) — bullet train, solid → publish candidate
- [232] 9ce3077d (REVIEW) — single-source opinion piece → KEEP review
- [233] 2fc0edad MINOR — 10x + 円/ルピー confusion: TITLE 「約3.3兆円を売り越し…22.4兆円に」→「約3,300億ルピー…2.24兆ルピーに」; summary 「約32,963 croreルピー（約3.3兆ルピー）」→（約3,296億ルピー、約5,600億円）; 「2.24 lakh crore（約22.4兆ルピー）」→（2.24兆ルピー、約3.8兆円）
- [236] e257cf08 (REVIEW) — KEEP review (generic single-source)
- [238] 37b273e8 (REVIEW) — wallets explainer → publish candidate (low prio)
- [242] 36bc1ba1 MINOR — strip 「（40〜80字）」×3
- [245] 4bbbed9c MINOR — count bug: 「月間2,320億件」→ 2,320 crore = 約232億件; TITLE garbled 「月間1回線級の飛躍」→「月間取引が過去最高」 (value 29.9兆ルピー ✓ correct)
- [244]+[249] soft-DUP (Oman FTA, same day, both published, different angles) → STATUS note (merge/one)

## batch-11 (idx 250-274)
- OK: [250], [251] (1.94兆 ✓), [253], [254], [260], [261], [262] (fire pair = different angles, acceptable), [264->see below], [265], [270], [271], [272], [273]
- [252] 627909b0 MINOR — render 「Rs 1,04,927.18」→「10万4,927ルピー」(Indian grouping)
- [255] 5f118a0b MINOR — drop implausible clause 「この規模感がインドの上場市場全体を凌駕するほど大きいと指摘し、」→「この規模感の大きさを指摘し、」
- [256] 69b9c26a (REVIEW) — publish candidate; fix 「英国の国務長官ピーター・カイル」→「英ビジネス貿易相ピーター・カイル」
- [257] 5bce8f7d MINOR — append one-line update: government denied gold sales, holdings 880.52t maintained (per [265] sources)
- [258] 2da4f876 (REVIEW) — publish candidate (low)
- [259] 21628cc5 MINOR — garbled 「1兆9,40,000億ルピー」→「1兆9,400億ルピー」; AP 「4,987クロール」→「4,987クロール（約499億ルピー）」. DUP with [251] → STATUS (keep [251])
- [263] deee3ebd MINOR — delete leaked sourcing paragraph 「各段落の出典整理：…独自推計である。」
- [264] 288d2867 (REVIEW) — publish candidate (low)
- [266] 2418de42 (REVIEW) — 10x bug: 「総額1兆ルピー（Rs 10,000 crore）」→ 1,000億ルピー (title+summary) → publish candidate AFTER fix
- [267] 9163fb33 (REVIEW) — publish candidate
- [268] 8c44b33c (REVIEW) — publish candidate
- [269] 45217b5e OK-ish — off-topic consumer tech (report note)
- [274] fa20b5af MINOR — 10x bug ×2: 「連結売上高7兆6,078億ルピー」→ ₹76,078cr = 約7,608億ルピー（約1.3兆円）; 「純利益5,073億ルピー」→ ₹5,073cr = 約507億ルピー (32.7%/52% growth rates internally consistent with crore reading)

## batch-12 (idx 275-299)
- OK: [275], [276] (高市訪印), [277], [278], [280], [281], [283], [284] (Dorjilung 1,125MW ✓), [285], [287], [288], [289] (Q4 7.8%/FY26 7.7% ✓), [290], [291] (note: names Toyota/Honda in advice — style), [293] (E85 ✓), [294] (26cr=2.6億 ✓), [296], [297], [298] (FY27 6.6% cut ✓)
- [279] 6bcbb397 MINOR — strip 「（参考資料に基づく事実）」marker
- [282] cea0c4b3 (REVIEW) — publish candidate ($47B/28社 attributed)
- [286] 87b03065 MINOR — typo 「サンクトペテルブルルク」→「サンクトペテルブルク」
- [292] 8188caaf MINOR — billion→億 bug: 「米ドルで約40億〜75億」→ 約400億〜750億ドル; 「約40億ドル想定」→ 約400億ドル; 「75億ドル上限」→ 750億ドル (headlines: $40bn/$75bn)
- [295] 35851818 MINOR — 「3億2,641,704株」→ 3,26,41,704 = 約3,264万株 (Indian grouping misparse). DUP with [299] → STATUS (keep [299])
- [299] dfaab487 MINOR — add readable 「3,26,41,704株（約3,264万株）」

## batch-13 (idx 300-324)
- OK: [300] ($89.2B=892億ドル ✓), [301] ($4.3B ✓), [302], [304], [306], [311], [313] ($90B=900億ドル ✓), [315], [317], [321], [322], [323], [324]
- [303] a24e805e MINOR — TITLE truncated 「…リライアンスの」→ complete; name アンダント→アナント・アンバニ (×4); 「弁務担当」→「法務責任者」
- [305] 46894a71 MINOR — conversions: 「約2.08億ルピー（₹208 crore）」→ 約20.8億ルピー; 「22万ルピー（Rs 22 million）」→ 約2,200万ルピー (note: ₹208cr ≈ $22M — figures likely same amount)
- [307] bf308129 (REVIEW) → publish candidate
- [308] 714e823e (REVIEW) → publish candidate
- [309] 55625d09 MINOR — 10x: TITLE 「約2.4兆ルピーの影響」→ 約2,400億ルピー; summary 「約24,000億ルピー相当の救済」→ 約2,400億ルピー (headline ₹24,000cr)
- [310] df573bb7 (REVIEW) — boilerplate duplicated ×2, thin → KEEP review
- [312] 84bacf84 MINOR — 10x: 「合計1兆ルピーの安定化基金」→ 1,000億ルピー (₹10,000cr headline). Note: supersedes [266] (same scheme) → [266] KEEP review as dup
- [314] 828ae24a MINOR — direction: 「総額を1.71兆ルピー…にまで引き上げるよう求めている」→「現行予算1.71兆ルピー（Rs 1.71 lakh crore）の倍増（3兆ルピー超）を要求」(headline: seeks doubling OF ₹1.71L cr)
- [316] 5fbd5ea8 MINOR — 10x: 「約1兆2000億ルピー超の資金が流入」→ 約1,200億ルピー超 (headline Rs 12,000+ cr)
- [318] 7e6cd365 (REVIEW) → publish candidate (low)
- [319] 1ffb092c... wait 0665fdb1 (REVIEW) → publish candidate
- [320] 2562aa1b MINOR-lite — 「2026年の実質GDP成長率見通し」→「2026年度（FY27）」. DUP with [298] f792ff71 (June MPC, both published) → STATUS (keep [298])

## batch-14 (idx 325-349)
- OK: [325], [326], [329], [330], [332] (22.9k cr ✓), [335], [339], [341], [342] (SpaceX math ✓ 1.1T/4.15T≈1/4 ✓), [343], [345] (index math ✓), [348], [349] (tanker series coherent)
- [327] e33864ba (REVIEW) — "longest-serving elected PM" premise dubious (Nehru ~17y) → KEEP review
- [328] c2b7fe54 (REVIEW) → publish candidate
- [331] 8409775d MINOR — strip 「（40〜80字）」×3
- [333] 90473a83 (REVIEW) — evergreen how-to, Feb pub → KEEP review
- [334] 8d6d7592 MINOR — garbled lead 「ペナントがパラオのタンカー」→「パラオ船籍のタンカー」; 「ゴルフ・オブ・オマーン」→「オマーン湾」
- [336] 0d102b87 (REVIEW) — fabricated company-specific KPI directives (Kubota/Yanmar/Sumitomo) → KEEP review
- [337] 58f1ac34 MINOR — typo 「製品戦略は菅別」→「チャネル別」; off-topic noted
- [338] a76eb14c (REVIEW) → publish candidate (low)
- [340] 115c0bcb (REVIEW) — MSCI top-10 interpretation ambiguous (country-weight vs constituent) → KEEP review
- [344] 463ec984 MINOR — 「トランプ前大統領」→「トランプ米大統領」; fix inverted causality 「楽観姿勢…安全資産への需要を高めた」→ neutral phrasing
- [346] 59ea3da2 VERIFY (livemint) — 「総投資額は約5,000億ルピー」suspect (maybe ₹5,000 crore = 500億)
- [347] d4f8e774 MINOR — 「RE A India」→「REA India」

## batch-15 (idx 350-374)
- OK: [350], [351], [352], [353], [354], [355], [356], [357], [358], [359], [360], [361], [362], [363] (25.4 lakh t ✓), [364], [365], [366], [367], [369] (WPI 9.68% arc ✓), [370] (Hormuz reopen; Disha ✓), [372] (rupee direction handled correctly ✓)
- [368] d627b962 (REVIEW) — 10x bug 「約2兆8,000億ルピー」→ ₹28,000cr = 約2,800億ルピー; fabricated commission numbers → KEEP review
- [371] 72457989 (REVIEW) → publish candidate (silver −87%/$75.57M, deficit $28.21B ✓)
- [373] 3f6c7725 (REVIEW) → publish candidate; change 「2025年6月」→「このほど」(date unverifiable)
- [374] e82d8052 (REVIEW) → publish candidate (IREL/Rosneft ✓ Reuters)

## batch-16 (idx 375-399)
- OK: [375], [376] (Warsh Fed ✓ in-universe), [381], [386] (5.21L cr ✓ internally consistent), [387], [388] (20万ルピー=35万円 ✓), [389] (27cr shares=2.7億株 ✓), [390], [392], [394]
- [377] (REVIEW) → publish candidate; [378] (REVIEW) → publish candidate; [379] (REVIEW) → publish candidate
- [380] 26777246 MINOR — TITLE 「最大3,000億円規模」→「最大4,500億円規模」(matches body $2-3bn=3,000〜4,500億円)
- [382] (REVIEW) → publish candidate (low)
- [383] f3cad8c7 MINOR — render 「3万6793クロール」→「3万6,793クロール（約3,679億ルピー）」
- [384] (REVIEW) → publish candidate
- [385] 717996f1 (REVIEW) — WB election referenced as upcoming but site's own coverage says BJP won May 2026 → publish candidate AFTER fixing that sentence + render 1万8,880クロール（約1,888億ルピー）
- [391] (REVIEW) → publish candidate
- [393] (REVIEW) → publish candidate (low)
- [395] (REVIEW) → publish candidate; [396] (REVIEW) → publish candidate (low); [398] (REVIEW) → publish candidate
- [397] 5d85bbc6 MINOR — 「1ラク・ルピー」→「10万ルピー」(title+summary)
- [399] 4975af60 (REVIEW) — 10x-derived yen error: 「107クロールピー(約180億〜190億円規模)」→ ₹107cr = 約10.7億ルピー（約18億円） → publish candidate AFTER fix

## batch-17 (idx 400-424)
- OK: [412] (Tata DC fire ✓), [415] (S&P 6.6/5.1 consistent), [416], [424] (DCC ✓)
- [400] (REVIEW) → publish candidate; [401] (REVIEW) → publish candidate; [403] (REVIEW) → publish candidate
- [402] (REVIEW) → publish candidate AFTER fixing implication 「94円台後半」→「1ドル＝94ルピー台後半」
- [404] (REVIEW) — thin, boilerplate ×3 → KEEP review
- [405] (REVIEW) — PR piece → KEEP review
- [406] (REVIEW) → publish candidate (low)
- [407] (REVIEW) → publish candidate AFTER 「2025年5月」→「2026年5月」
- [408] (REVIEW) — market-preview stub → KEEP review
- [409] (REVIEW) — thin + boilerplate ×5 → KEEP review
- [410] 9a75e0b4 MINOR — 「4.86ラック・クローレ（ルピー）」→ add （約4.86兆ルピー、約8.3兆円）
- [411] (REVIEW) → publish candidate
- [413] (REVIEW) → publish candidate (low)
- [414] (REVIEW) → publish candidate
- [417] (REVIEW) → publish candidate (low)
- [418] (REVIEW) → publish candidate
- [419] (REVIEW) → publish candidate AFTER 「2025年の」→「今年度の」
- [420] (REVIEW) — content-free interview teaser → KEEP review
- [421] 339130d6 MINOR — tense: 「高市早苗首相がインドを訪問し、」→「高市早苗首相がインドを訪問する方向となり、」(visit is July, article pub 6/25)
- [422] (REVIEW) → publish candidate
- [423] (REVIEW) → publish candidate

## batch-18 (idx 425-449)
- OK published: [425], [426], [427], [430], [439], [440] (Rajiv Kumar = ex-FinSec & ex-CEC, both true)
- REVIEW → publish candidates: [428] (or keep as dup of [442]), [429] (low), [431], [432], [433] (low), [436], [437], [442] (best Takaichi-visit piece), [443], [444] (duty numbers consistent with [87] arc), [445] (low), [446] (ACME-IHI strong), [447] (low), [448], [449] (consistent with [312])
- [434] (REVIEW) — generic week-ahead stub → KEEP review
- [435] (REVIEW) — fix before publish: 「2,086クロール（約2,500億円相当）」→ ₹2,086cr = 約209億ルピー（約350億円）
- [438] (REVIEW) — thin dup of [428]/[442] → KEEP review
- [441] (REVIEW) — STALE: describes April MPC as new at end of June; conflicts with own June MPC coverage [298][320] → KEEP review (do not publish)
- NOTE: Takaichi-visit family: [276][421] published + [428][437][438][442] in review — publish [442]+[437], keep [428][438] as dups

## batch-19 (idx 450-464)
- OK published: [453] (TIMM ✓), [455] (87% study ✓), [461], [464] (manual column — do not touch)
- REVIEW → publish candidates: [450] (GST 1.95L cr, consistent w/ May 1.94 ✓; add 約1.95兆ルピー rendering), [452], [454] (attributed op-ed; note GDP-rank tension w/ [448]), [456] (add 約4,934億ルピー), [457], [458] (+8.62% math ✓), [459], [460], [462] (low), [463] (low)
- [449] publish (broader) / [451] KEEP review (LPG dup of [449], numbers consistent ✓)
- REVIEW COUNT recap: recommendations recorded per batch above

# 都市生活情報 ファクトチェックログ（2026年7月）

`lib/cities/data.ts` の `living` に書かれた固有名詞・数値の独立検証記録。
執筆（第1パス）とは別クエリで再検索し、確認できなかった項目は削除した。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 都市 | 項目 | 記述 | 判定 | 出典 |
|---|---|---|---|---|
| ムンバイ | エリア | Bandra West・Powai・Lower Parel が主要な駐在員居住エリア | ✅ | https://www.rustomjee.com/blog/expat-living-elite-neighborhoods-mumbai/ |
| ムンバイ | 家賃 | 2BHK（Powai、駐在員向け）$580〜950/月 | ✅ | https://www.mumbaiexpathousing.com/mumbai-1-2-3-4-BHK-Flats-Powai-1-2bhk-flat-on-rent-near-Nomura-TCS-Cognizant-Hiranandani-gardens-powai-149.html |
| ムンバイ | 家賃 | 2BHK（Bandra West、駐在員向け）$950〜1,900/月 | ✅ | https://www.expatpropertiesmumbai.com/listings/2bhk-apartment-rent-bandra-west/ ／ https://www.nobroker.in/flats-for-rent-in-bandra_mumbai（別ソースで桁一致確認） |
| ムンバイ | 為替換算 | USD/INR ≈ 95.5（2026年7月時点、家賃のUSD換算に使用） | ✅ | https://tradingeconomics.com/india/currency |
| ムンバイ | 病院 | Kokilaben Dhirubhai Ambani Hospital（アンデリー西） | ✅ | https://www.kokilabenhospital.com/ |
| ムンバイ | 病院 | P. D. Hinduja Hospital（マーヒム）国際患者部門あり | ✅ | https://www.hindujahospital.com/international-patient/ |
| ムンバイ | 病院 | Lilavati Hospital & Research Centre（バンドラ）国際患者向けデスクあり | ✅ | https://www.lilavatihospital.com/patients-care/international-patients |
| ムンバイ | 病院（日本語対応） | いずれの病院も日本語対応スタッフ常駐の確証なし | ⚠️（未確認のため断定せず注記に留めた） | 検索結果に日本語対応の明記なし（英語・アラビア語・ロシア語等の多言語対応は確認） |
| ムンバイ | 日本人学校 | ムンバイ日本人学校（Japanese School of Mumbai、Powai・ヒランダーニ・ナレッジパーク） | ✅ | https://en.wikipedia.org/wiki/Japanese_School_of_Mumbai |
| ムンバイ | 日本人会 | ムンバイ日本人会（mumbai-japan.in） | ✅ | http://mumbai-japan.in/ |
| ムンバイ | 日本語グロサリー | 特定店舗名を確認できず | ❌（削除） | Powai近辺の日本食レストラン（Kofuku、Origami等）は複数確認できたが、グロサリー店舗名は特定できなかったため `groceries` は空配列とした |
| ムンバイ | 直行便 | ANA（全日空）が成田―ムンバイ間唯一の直行便。2026年は季節により週3〜7便で変動、3月末〜7月中旬は毎日運航 | ✅ | https://traveltradejournal.com/ana-upgrades-narita-mumbai-service-to-daily-operations-from-march-29-2026/ |
| ムンバイ | 空港アクセス | CSMIAからBandraまで車で約20〜45分、Powaiまで約25〜40分 | ✅ | https://www.taxifarefinder.com/main.php?city=Mumbai-India&from=Chhatrapati+Shivaji+International+Airport+%28BOM%29&to=Bandra+Terminus%2C+Bandra+East%2C+Mumbai%2C+Maharashtra%2C+India |
| ムンバイ | JETRO | ジェトロ・ムンバイ事務所はBKC（バンドラ・クルラ・コンプレックス）所在 | ✅ | https://www.jetro.go.jp/jetro/overseas/in_mumbai/map.html |
| ムンバイ | モンスーン影響 | 6〜9月は道路冠水・鉄道運休で通勤に遅延が生じやすい | ✅ | https://www.outlookindia.com/national/mumbai-monsoon-arrival-heavy-rain-triggers-severe-waterlogging-flooding-and-train-disruptions |
| ムンバイ | 治安 | 駅・市場でのスリ、カマティプラ／ダラヴィの単独徒歩は避ける | ✅ | https://beforeyougotravels.com/destinations/mumbai/is-it-safe |
| ムンバイ | 名物料理 | ヴァダパヴ、1966年ダーダル駅前起源 | ✅ | https://en.wikipedia.org/wiki/Vada_pav |
| ムンバイ | 名物料理 | ボンビル（ボンベイダック） | ✅ | https://migrationology.com/mumbai-street-food/ |
| ムンバイ | 工芸 | コルハープリ・チャッパル、2019年GI登録、コラバ・コーズウェイで販売 | ✅ | https://en.wikipedia.org/wiki/Kolhapuri_chappal ／ https://lbb.in/mumbai/anupam-chappals-colaba-causeway-iconic/ |
| ムンバイ | 祭事 | ガネーシュ・チャトゥルティ、年6,000体超の神像 | ✅ | https://www.abhibus.com/blog/ganesh-festival-mumbai/ |

以降の都市タスクはこの表に行を追加する。

## 独立ファクトチェック（第2パス、ムンバイのみ）

上表は執筆者自身によるセルフチェック。以下は別の担当者が、上表を読まずに `lib/cities/data.ts` の
`specialties`／`living` を独立に再検証した記録。検索クエリは執筆時と異なる言い回しを用いた。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| エリア | Bandra West・Powai・Lower Parel が駐在員向けエリア | ✅ | "Lower Parel Mumbai premium residential commercial area expats" / "pajasaapartments Japanese expats Mumbai best areas" | https://www.sobha.com/blog/lower-parel-real-estate-guide/ ／ https://www.pajasaapartments.com/blog/accommodation-for-japanese-expats-in-mumbai |
| 家賃 | 2BHK（Powai）$580〜950/月 | ✅ | "Powai 2 bedroom flat monthly rent expat rupees" ＋ "USD INR exchange rate July 2026" | https://www.99acres.com/2-bhk-flats-for-rent-in-powai-central-mumbai-suburbs-ffid（₹55,000〜90,000/月 ≒ $576〜942、1USD≈95.5円換算） |
| 家賃 | 2BHK（Bandra West）$950〜1,900/月 | ✅ | "Bandra West 2BHK apartment rent per month rupees 2026" | https://www.squareyards.com/rent/2-bhk-for-rent-in-bandra-west-mumbai（₹90,000〜1.8L/月、上限は物件次第でさらに高い） |
| 為替換算 | USD/INR（家賃換算に使用） | ✅ | "USD INR exchange rate July 2026" | https://www.exchangerates.org.uk/USD-INR-spot-exchange-rates-history-2026.html（2026年7月9日時点 1USD≈95.5円） |
| 病院 | Kokilaben Dhirubhai Ambani Hospital（アンデリー西）JCI認定 | ✅ | "Kokilaben Hospital JCI accreditation status" | https://www.kokilabenhospital.com/about/accreditations/accreditations.html |
| 病院 | P. D. Hinduja Hospital（マーヒム）1951年開業・国際患者部門 | ✅ | "P.D. Hinduja Hospital Mahim Mumbai international patients" | https://www.hindujahospital.com/international-patient/ |
| 病院 | Lilavati Hospital & Research Centre（バンドラ）空港から約20分 | ✅ | "Lilavati Hospital distance from Mumbai airport minutes" | https://www.distancesfrom.com/how-far-is-Lilavati-Hospital--Research-Centre-Mumbai-from-Chhatrapati-Shivaji-International-Airport-/HowFarHistory/18577745.aspx（CSMIAから約20分） |
| 日本人学校 | ムンバイ日本人学校（Powai・ヒランダーニ地区） | ✅ | "Japanese School of Mumbai Powai Hiranandani location" | https://en.wikipedia.org/wiki/Japanese_School_of_Mumbai（Hiranandani Knowledge Park, Powai） |
| 日本人会 | ムンバイ日本人会（mumbai-japan.in）が現在も活動中 | ✅ | "ムンバイ日本人会 活動 2026" | http://mumbai-japan.in/（2026年1月時点で2025年12月度理事会報告を掲載、活動継続を確認） |
| 直行便 | ANA成田便が「唯一」の日本発直行便 | ⚠️ 修正 | "Air India Haneda Mumbai nonstop flight launch date 2026" | https://www.airindia.com/in/en/book/exclusive-deals/fly-non-stop-mumbai-haneda.html（エア・インディアが2026年6月15日から羽田―ムンバイ間で週4便の直行便を新規就航。「唯一」は誤りのため、羽田便の存在を追記する形に修正） |
| 直行便（ANA分） | 週3〜7便変動、3月末〜7月中旬は毎日運航、所要9〜10時間 | ✅ | "ANA Narita Mumbai flight route 2026 only direct" | https://traveltradejournal.com/ana-upgrades-narita-mumbai-service-to-daily-operations-from-march-29-2026/（3/29〜7/17は毎日、7/18〜8/31は週3便で変動幅と一致、所要9時間15分） |
| 空港アクセス | CSMIAからBandraまで20〜45分、Powaiまで25〜40分 | ✅ | "Mumbai airport to Bandra drive time with traffic peak hours" / "Mumbai airport to Powai drive time traffic minutes" | https://airport-bbi.com/mumbai-airport-to-bandra-distance/（通常20〜60分、ピーク時はさらに増）／ Powaiは通常15〜20分、渋滞時30〜45分との情報と整合 |
| JETRO | ムンバイ事務所はBKC所在 | ✅ | "JETRO office Mumbai Bandra Kurla Complex location" | https://www.jetro.go.jp/jetro/overseas/in_mumbai/map.html（Naman Corporate Link, G Block, Bandra Kurla Complex） |
| モンスーン影響 | 6〜9月は道路冠水・鉄道運休で通勤遅延 | ✅ | 元記述と同旨の一般情報を確認（モンスーン期の冠水報道多数） | https://www.outlookindia.com/national/mumbai-monsoon-arrival-heavy-rain-triggers-severe-waterlogging-flooding-and-train-disruptions |
| 治安 | 駅・市場でのスリ、カマティプラ／ダラヴィの単独徒歩回避 | ✅ | "Mumbai pickpocket theft crowded train station market warning safety tips" / "Kamathipura Dharavi safety tourists avoid walking night" | https://mumbaiadventure.com/pickpocketing-mumbai/ ／ https://kakapo.travel/blog/city/is-dharavi-mumbai-safe-for-tourists |
| 名物料理 | ヴァダパヴ、1966年ダーダル駅前起源（考案者アショク・ヴァイディヤ） | ✅ | "vada pav history origin Dadar station 1966" | https://en.wikipedia.org/wiki/Vada_pav ／ https://thebetterindia.com/243528/mumbai-best-vada-pav-stall-food-origin-ashok-vaidya-maharashtra-history-san196/ |
| 名物料理 | ボンビル（ボンベイダック）、ムンバイ沿岸で獲れる魚 | ✅ | "Bombay duck fish bombil where found species name" | https://en.wikipedia.org/wiki/Bombay_duck（Harpadon nehereus、マハーラーシュトラ沿岸を含むインド沿岸で漁獲） |
| 工芸 | コルハープリ・チャッパル、牛革、2019年GI登録、コラバ・コーズウェイで販売 | ✅ | "Kolhapuri chappal geographical indication tag year registered" / "Colaba Causeway Kolhapuri chappal shop Mumbai buy" | https://en.wikipedia.org/wiki/Kolhapuri_chappal（2019年GI登録）／ https://lbb.in/mumbai/anupam-chappals-colaba-causeway-iconic/（コラバ・コーズウェイの実店舗Anupam Chappals等を確認） |
| 祭事 | ガネーシュ・チャトゥルティ、年間6,000体超の神像 | ⚠️ 修正 | "Ganesh Chaturthi Mumbai number of idols installed per year statistics" | https://www.business-standard.com/article/current-affairs/193-000-idols-immersed-in-mumbai-during-ten-day-ganesh-festival-122091000897_1.html （BMC統計で公共神像だけで2024年6万体超、家庭用含め年15万体超が海へ投入。「6,000体超」は一桁以上の過小記載だったため実数に訂正） |

修正2件（直行便の「唯一」表記、ガネーシュ・チャトゥルティの神像数）を除き、全項目が独立ソースで確認できた。
削除した項目はなし（グロサリー店舗名は第1パスで既に空配列とされており、今回もその判断を追認）。

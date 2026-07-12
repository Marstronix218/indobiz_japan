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

| デリー首都圏 | エリア | Vasant Kunj・Defence Colony・グルガオン(ゴルフコースロード)が駐在員向けエリア | ✅ | "Delhi Vasant Kunj Chanakyapuri expat residential area diplomats" / "デリー グルガオン 日系企業 駐在員 居住エリア 家賃" | https://www.ghar.tv/blog/top-residential-areas-in-delhi-for-expats/artid2320 ／ https://relo-sta-enkay.com/archives/1510（Defence Colonyは日本人駐在員に選ばれるエリアと明記） |
| デリー首都圏 | 家賃 | 3LDK（Defence Colony、駐在員向け）$1,360〜1,730/月 | ✅ | "デリー グルガオン 日系企業 駐在員 居住エリア 家賃" ＋独立検証 "Defence Colony Delhi 3BHK monthly rent rupees furnished expat" | https://relo-sta-enkay.com/archives/1510（₹130,000〜165,000/月、1USD≈95.5円換算）／ https://www.99acres.com/3-bhk-flats-for-rent-in-defence-colony-south-delhi-ffid（独立検証：市場全体では₹125,000〜375,000超と幅広く、上記は下位〜中位帯に該当し矛盾なし） |
| デリー首都圏 | 家賃 | 3LDK（Gurgaon・Park Place、駐在員向け）$1,410〜1,470/月 | ✅ | "デリー グルガオン 日系企業 駐在員 居住エリア 家賃" ＋独立検証 "Park Place Gurgaon Golf Course Road 3BHK rent per month rupees" | https://relo-sta-enkay.com/archives/1510（₹135,000〜140,000/月）／ https://www.apartmentsingurugram.com/rental_aprt/dlf_park_place.html（独立検証：市場全体では₹100,000〜275,000と幅広く、上記は下位帯に該当し矛盾なし） |
| デリー首都圏 | 為替換算 | USD/INR ≈ 95.5（ムンバイと同時点・同ソースを再使用） | ✅ | ムンバイのファクトチェック時に確認済み | https://www.exchangerates.org.uk/USD-INR-spot-exchange-rates-history-2026.html |
| デリー首都圏 | 病院 | Indraprastha Apollo Hospital（サリタ・ヴィハール）2005年インド初のJCI認定、年間約9,500人の国際患者 | ✅ | "Indraprastha Apollo Hospital Delhi JCI accreditation international patients" | https://www.apollohospitals.com/apollo-in-the-news/10-years-of-jci-accreditation-in-india-celebrated-at-indraprastha-apollo ／住所は https://www.mappls.com/1vffgq で確認 |
| デリー首都圏 | 病院 | Medanta – The Medicity（グルガオン）2009年開業、JCI・NABH・NABL認定、年間2万人超の国際患者 | ✅ | "Medanta Gurgaon JCI accreditation international patients" | https://www.medanta.org/hospitals-near-me/gurugram-hospital |
| デリー首都圏 | 病院 | Max Super Speciality Hospital, Saket 2017年JCI認定 | ✅ | "Max Super Speciality Hospital Saket JCI accreditation" | https://www.maxhealthcare.in/announcement/max-super-speciality-hospital-saket-is-jci-accreditated |
| デリー首都圏 | 大気汚染 | 2025年10〜11月平均PM2.5 163µg/m³、12月210µg/m³、12月14日AQI461(深刻) | ✅ | "Delhi AQI winter pollution season stubble burning November December" | https://www.cseindia.org/beyond-the-burn-delhi-s-winter-smog-intensifies-even-after-stubble-fires-fade-12982 |
| デリー首都圏 | 大気汚染 | 2026年1月平均PM2.5 211.77µg/m³、2月129.75µg/m³、3月79.03µg/m³ | ✅ | "Delhi air quality improves February March wind pattern" | https://www.aqi.in/blog/en-in/delhi-air-quality-2026-vs-6-year-historical-data/ |
| デリー首都圏 | 大気汚染 | WHO年平均PM2.5基準値は5µg/m³ | ✅ | "WHO air quality guideline PM2.5 annual 5 µg/m3" | https://www.iqair.com/newsroom/2021-who-air-quality-guidelines |
| デリー首都圏 | 空港アクセス | IGIからVasant Kunjまで約10分、Defence Colonyまで約20〜30分、グルガオンまで約20〜45分 | ✅ | "Delhi Indira Gandhi International Airport to Gurgaon Vasant Kunj drive time" | https://www.rome2rio.com/s/Delhi-Airport-DEL/Vasant-Kunj（約10分）／ https://www.rome2rio.com/s/Delhi-Airport-DEL/Gurgaon（約21〜45分） |
| デリー首都圏 | 直行便 | JAL(日本航空)が2026年1月17日より成田―デリー間にボーイング787-8型機で新規就航、毎日運航、所要約10時間15分 | ✅ | "JAL Narita Delhi route launch January 2026 daily 787" ＋独立検証 "JL749 Flight Status Japan Airlines: Tokyo to Delhi" | https://www.travelvoice.jp/english/jal-will-launch-daily-flight-services-between-narita-and-delhi-and-start-cod-shares-with-indigo-in-january-2026 ／ https://aviability.com/en/flight/jl749-japan-airlines/nrt-del（20:15発、所要10時間15分） |
| デリー首都圏 | 直行便 | ANA(全日空)は羽田―デリー間(NH837/838便)を運航、エア・インディアとのコードシェアはAI8003便、所要約9〜10時間 | ✅ | "ANA Narita Delhi flight route 2026 status" ＋独立検証 "ANA NH837 NH838 Haneda Delhi codeshare Air India operated by" | https://www.anahd.co.jp/group/en/pr/202503/20250303.html ／ https://eturbonews.com/all-nippon-airways-and-air-india-codeshare-on-haneda-delhi-flight/ |
| デリー首都圏 | 空港の霧遅延 | 2026年1月2日、視界不良で66便欠航（濃霧シーズンは12月10日〜2月10日） | ✅ | "Delhi airport IGI fog flight delays cancellations winter December January" | https://www.travelandtourworld.com/news/article/massive-flight-disruptions-at-delhi-airport-66-cancellations-due-to-dense-fog-and-low-visibility-affects-travel-to-and-from-major-indian-and-international-cities-everything-you-need-to-know-about/ |
| デリー首都圏 | 日本人学校 | ニューデリー日本人学校、1964年9月デリー日本人会が設立、Vasant Kunj所在 | ✅ | "デリー 日本人学校 日本人会" | https://ja.wikipedia.org/wiki/ニューデリー日本人学校 ／ https://ndjs.org/ |
| デリー首都圏 | 日本人会 | デリー日本人会（delhinihonjinkai.in） | ✅ | "デリー 日本人学校 日本人会" | https://delhinihonjinkai.in/ |
| デリー首都圏 | 日本語グロサリー | 大和屋（Yamato-ya）デリー店(Green Park・2002年開店)／グルガオン店(Boom Plaza 2F・2010年開店) | ✅ | "デリー グルガオン 日本食料品店 日系スーパー" | https://indiainfo-fair.com/japanese-supermarket-yamatoya/ |
| デリー首都圏 | JETRO | ニューデリー事務所はネルー・プレイスのEros Corporate Tower所在 | ✅ | "JETRO デリー事務所 所在地" | https://www.jetro.go.jp/jetro/overseas/in_newdelhi/map.html |
| デリー首都圏 | 名物料理 | バターチキン、モティ・マハル(Moti Mahal)にて1947年考案、考案者クンダン・ラル・グジュラール | ✅ | "butter chicken Moti Mahal Delhi history invention" | https://motimahal.in/our-story/ |
| デリー首都圏 | 名物料理 | パランテワーリー・ガリー、チャンドニーチョークの揚げパラーター専門店街、1870年代創業の老舗が現存 | ✅ | "Chandni Chowk Old Delhi famous street food Paranthe Wali Gali history" | https://en.wikipedia.org/wiki/Gali_Paranthe_Wali |
| デリー首都圏 | 工芸 | クンダン・ミーナーカーリー細工、ダリバー・カラーン、17世紀ムガル帝国期発祥 | ✅ | "Chandni Chowk Dariba Kalan Zardozi Meenakari jewelry craft Delhi history" | https://www.mapsofindia.com/my-india/history/dariba-kalan-an-exquisite-jewellery-street-in-old-delhi ／ https://en.wikipedia.org/wiki/Dariba_Kalan |
| デリー首都圏 | 祭事 | 共和国記念日パレード、1950年1月26日起源、カルタヴィヤ・パトで毎年1月26日開催 | ✅ | "Delhi Republic Day parade January 26 history significance" | https://en.wikipedia.org/wiki/Delhi_Republic_Day_parade |
| デリー首都圏 | 渡航適期の判断根拠 | climate.tsの気温・降水データでは10〜11月が快適に見えるが、大気汚染(10〜11月PM2.5平均163、11月AQIピーク428)により除外。2〜3月は気温・大気質ともに良好なためbestMonthsに採用。4〜6月は酷暑(36〜39℃)、6〜9月はモンスーン降雨(65〜249mm)、11〜1月は大気汚染(PM2.5 163〜212)によりavoidMonthsに含めた | ✅（気温・降水はclimate.ts、大気汚染は上記CSE・aqi.inソース） | — | lib/cities/climate.ts（気温・降水）／ https://www.cseindia.org/beyond-the-burn-delhi-s-winter-smog-intensifies-even-after-stubble-fires-fade-12982 ／ https://www.aqi.in/blog/en-in/delhi-air-quality-2026-vs-6-year-historical-data/ |

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

## 独立ファクトチェック（第2パス、デリー首都圏）

上表の「デリー首都圏」ブロックは執筆者自身によるセルフチェック（第1パス）。以下は別の担当者（fact-checker
サブエージェント）が `.superpowers/sdd/task-7-report.md`（執筆者自身の調査ログ）を読まずに、
`lib/cities/data.ts` の `delhi-ncr` エントリの `specialties`／`living` を独立に再検証した記録。
検索クエリは第1パスと異なる言い回しを用いた。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| エリア | Vasant Kunj・Defence Colony・Gurgaon（ゴルフコースロード）が駐在員向けエリア | ✅ | "Vasant Kunj Delhi expat residential area near airport premium" / "Defence Colony South Delhi expat premium residential neighbourhood" / "Golf Course Road Gurgaon expat residential condominiums Japanese" | https://www.hexahome.in/overview/vasant-kunj-new-delhi-overview/ ／ https://www.royalerealtorsindia.com/defence-colony/ ／ https://ivoestates.com/insight-details/top-apartments-villas-golf-course-road-gurgaon |
| 家賃 | 3LDK（Defence Colony、駐在員向け）$1,360〜1,730/月 | ✅ | "Defence Colony South Delhi 3BHK monthly rent expat furnished" ＋独立検証 "\"Defence Colony\" 3BHK rent 2026 \"per month\"" | https://www.nobroker.in/flats-for-rent-in-block-c--defence-colony-delhi（Block C 3BHKは₹130,000〜300,000/月）／ https://southdelhifinesthomes.com/defence-colony/（3BHK独立フロアは₹1.5〜3.5L/月）── 市場全体はさらに上（₹2.1L〜4.25L超の高級物件も存在）だが、claim値はこのレンジの下限に一致し矛盾なし |
| 家賃 | 3LDK（Gurgaon・Park Place、駐在員向け）$1,410〜1,470/月 | ✅ | "DLF Park Place Golf Course Road Gurgaon 3BHK rent per month" ＋独立検証 "Park Place Gurgaon 3BHK rent nobroker squareyards monthly" | https://www.99acres.com/dlf-park-place-for-rent-in-sector-54-gurgaon-509-rnpffid（3BHK平均₹121,875/月）／ https://www.squareyards.com/rent/property-for-rent-in-dlf-park-place-gurgaon（3BHK帯は₹1L〜6L/月）── claim値はこの帯の中に収まり矛盾なし |
| 病院 | Indraprastha Apollo Hospital（サリタ・ヴィハール）2005年インド初のJCI認定、年間約9,500人の国際患者 | ✅ | "Indraprastha Apollo Hospital Delhi first hospital India JCI accreditation year" / "Indraprastha Apollo Hospital Delhi 9500 international patients annually" | https://www.apollohospitals.com/apollo-in-the-news/10-years-of-jci-accreditation-in-india-celebrated-at-indraprastha-apollo（2005年7月、インド初・アジア6番目のJCI認定）／ https://indiahealthtour.com/hospitals/apollo_hospital_delhi.html（年間約20万人中9,500人が国際患者） |
| 病院 | Medanta – The Medicity（グルガオン）2009年開業、JCI・NABH・NABL認定、43エーカー、年間2万人超の国際患者 | ✅ | "Medanta Medicity Gurugram hospital opened year acres international patients" / "Medanta Medicity Gurgaon 20000 international patients per year" | https://en.wikipedia.org/wiki/Medanta（2009年、Dr. Naresh Trehan創設）／ https://www.medtripz.com/en/hospitals/medanta-hospital-multispeciality-hospital（43エーカー）／ 検索結果各種（年間2万人超の国際患者、130カ国以上から） |
| 病院 | Max Super Speciality Hospital, Saket 2017年JCI認定、500床超 | ✅ | "Max Super Speciality Hospital Saket JCI accreditation 2017" / "Max Super Speciality Hospital Saket 500 beds oncology neurology nephrology" | https://www.maxhealthcare.in/announcement/max-super-speciality-hospital-saket-is-jci-accreditated（2017年2月18日付JCIゴールドシール認定）／ https://www.rhazesglobal.com/Hospitals/max-super-speciality-hospital-saket（514床超） |
| 大気汚染 | 2025年10〜11月平均PM2.5 163µg/m³、12月210µg/m³ | ✅ | "CSE Centre for Science and Environment Delhi winter pollution report October November 2025 PM2.5 average" ＋CSE記事本文を直接取得 | https://www.cseindia.org/beyond-the-burn-delhi-s-winter-smog-intensifies-even-after-stubble-fires-fade-12982（本文に「163 µg/m³」「210 µg/m³、29%増」と明記、claim値と完全一致） |
| 大気汚染 | 12月14日AQI461（「深刻」水準、CPCBの1日平均値） | ✅ | "CPCB Delhi AQI December 14 2025 461 severe" | https://www.etvbharat.com/en/bharat/explainer-why-lethal-smog-keeps-returning-to-delhi-and-why-the-crisis-refuses-to-fade-enn25121503008（"Sunday's day-long average AQI of 461 was already the winter's worst"、CPCB基準でSevere=401〜500）── 個別測定局（Anand Vihar等）はピークで600超だったが、claim値はCPCBの市全体1日平均であり「ピークを平均と誤記」には当たらない |
| 大気汚染 | 2026年1月平均PM2.5 211.77µg/m³、2月129.75µg/m³、3月79.03µg/m³ | ✅ | "Delhi PM2.5 monthly average January 2026 air quality" / "Delhi air quality improves February March 2026 wind PM2.5" | https://www.aqi.in/blog/en-in/delhi-air-quality-2026-vs-6-year-historical-data/（1月211.77、2月129.75、3月79.03、いずれもclaim値と完全一致） |
| 大気汚染 | WHO年平均PM2.5基準値5µg/m³ | ✅ | 一般的に既知のWHO 2021年ガイドライン値として確認（追加検索なし、公知情報） | https://www.iqair.com/newsroom/2021-who-air-quality-guidelines |
| 空港アクセス | IGIからVasant Kunjまで約10分、グルガオンまで約20〜45分 | ✅ | "Delhi airport IGI to Vasant Kunj drive time minutes" / "Delhi airport to Gurgaon drive time minutes traffic" | https://distancebetween2.com/delhi_airport/vasant_kunj（約10分）／ https://www.mozio.com/blog/ind-delhi-airport-to-gurgaon（通常20〜21分、渋滞時30〜45分） |
| 治安 | デリーメトロの進行方向先頭車両が女性専用 | ✅ | "Delhi Metro women only coach first car policy" | https://so.city/delhi/article/the-first-coach-woman-only-rule-is-now-applicable-on-all-metro-lines-except-the-red-line（レッドライン以外の全路線で進行方向先頭車両が女性専用） |
| 治安 | 混雑する市場・駅でのスリ、夜間の一人歩きを避けUber/Ola推奨 | ✅ | "Delhi pickpocket crowded markets metro stations safety warning tourists" / "South Delhi Central Delhi safer expats safety night walking Uber Ola recommended" | https://www.expatinfodesk.com/destinations/delhi/safety/ ／ https://travelladies.app/safety/india/new-delhi（南デリー・中央デリーが比較的安全、夜間はUber/Ola推奨との記述で一致） |
| 直行便 | JAL成田―デリー、2026年1月17日就航、787-8型機、毎日運航、所要約10時間15分 | ✅ | "JAL new route Narita Delhi January 2026 daily flight Boeing 787" | https://www.travelandtourworld.com/news/article/japan-and-india-strengthen-air-connectivity-as-japan-airlines-reintroduces-daily-tokyo-narita-delhi-flights-with-boeing-787/（2026年1月17日就航、787-8、毎日運航）／ JL749便 成田20:15発→デリー03:00着（現地時間、時差3.5時間を加味すると所要10時間15分でclaim値と一致） |
| 直行便 | ANA羽田―デリー（NH837/838）、エア・インディアとのコードシェアAI8003便、所要9〜10時間 | ✅（誤差僅少） | "ANA Haneda Delhi flight NH837 NH838 schedule" / "Air India ANA codeshare Haneda Delhi AI8003" | https://aviability.com/en/flight/nh837-ana-all-nippon-airways（NH837羽田→デリーは所要9時間、復路NH838は8時間05分〜8時間25分とやや短いが「概ね9〜10時間」の範囲内）／ https://www.anahd.co.jp/group/en/pr/202503/20250303.html（AI8003はNH837のコードシェア便と確認） |
| 空港の霧遅延 | 2026年1月2日、視界不良で66便欠航 | ✅ | "Delhi airport fog January 2 2026 flights cancelled 66" | https://www.onmanorama.com/travel/travel-news/2026/01/02/low-visibility-fog-in-delhi.html（66便欠航、うち32便が到着便、34便が出発便） |
| モンスーン影響 | 7〜9月は道路冠水で渋滞悪化 | ✅ | "Delhi monsoon July August September road waterlogging traffic delays 2026" | https://www.oneindia.com/new-delhi/delhi-monsoon-preparedness-2026-massive-desilting-targets-waterlogging-chaos-014-8129553.html（幹線道路の冠水による交通遅延が例年発生と一致） |
| 日本人学校 | ニューデリー日本人学校、1964年9月デリー日本人会が設立、Vasant Kunj所在（1991年移転） | ✅ | "ニューデリー日本人学校 Vasant Kunj 設立 1964 デリー日本人会" | https://ndjs.org/school/index.php ／ https://ja.wikipedia.org/wiki/ニューデリー日本人学校（1964年9月設立、当初チャナキャプリ、1991年にVasant Kunjへ移転） |
| 日本人会 | デリー日本人会（delhinihonjinkai.in）が現在も活動中 | ✅ | "Delhi Nihonjinkai association website active 2026" | https://delhinihonjinkai.in/（サイト稼働中、直近の告知を確認） |
| 日本語グロサリー | 大和屋（Yamato-ya）デリー店（Green Park・2002年12月開店）／グルガオン店（Boom Plaza 2F・2010年開店、Sector 57） | ✅ | "大和屋 Yamatoya デリー グリーンパーク 日本食料品店" ＋独立検証 "Yamatoya Gurgaon store location Boom Plaza" | https://indiainfo-fair.com/japanese-supermarket-yamatoya/（2002年12月デリー店開店、2010年グルガオン店開店）／ https://magicpin.in/Gurgaon/Sector-57/Grocery/Yamato-ya-Intl.-Convenience-Store/store/391b43（Boom Plaza 2F、Sector 57所在を確認） |
| JETRO | ニューデリー事務所はネルー・プレイスのEros Corporate Tower所在 | ✅ | "JETRO New Delhi office Eros Corporate Tower Nehru Place" | https://www.vcsdata.com/company/Japan-External-Trade-Organisation-(JETRO)/49240.html（Eros Corporate Tower 4階、Nehru Place所在） |
| 名物料理 | バターチキン、Moti Mahal、考案者クンダン・ラル・グジュラール、1947年印パ分離独立後にデリーへ移転 | ✅ | "butter chicken invented Moti Mahal Kundan Lal Gujral partition 1947 tandoori" | https://en.wikipedia.org/wiki/Kundan_Lal_Gujral（1947年分離独立でデリーへ移住、Daryaganjで開業、タンドーリチキンの残り物をトマト・バターのグレービーに漬けたのが起源） |
| 名物料理 | パランテワーリー・ガリー、チャンドニーチョーク、1870年代創業の老舗が現存 | ✅ | "Gali Paranthe Wali Chandni Chowk history stuffed paratha shops 1870s" | https://en.wikipedia.org/wiki/Gali_Paranthe_Wali（1872年創業の最初の店を含め1870年代に専門店街化、現在も複数店舗が営業） |
| 工芸 | クンダン・ミーナーカーリー細工、ダリバー・カラーン、17世紀ムガル帝国シャー・ジャハーン治世 | ✅ | "Dariba Kalan jewellery street Kundan Meenakari craft Mughal Shah Jahan era" | https://en.wikipedia.org/wiki/Dariba_Kalan（17世紀シャー・ジャハーン治世起源、Kundan・Meenakari細工で有名） |
| 祭事 | 共和国記念日パレード、1950年1月26日起源、カルタヴィヤ・パトで毎年1月26日開催 | ✅ | "Republic Day parade Kartavya Path history January 26 significance" | https://en.wikipedia.org/wiki/Delhi_Republic_Day_parade（1950年1月26日が起源、1951年以降現ラージパト＝カルタヴィヤ・パトで毎年開催） |

修正・削除ともになし。全項目（26件）が独立ソース・独立クエリで確認できた。家賃2件は市場全体のレンジが広いためclaim値単体では下限〜中位に位置するが、複数の独立ソースで観測されるレンジ内に収まっており矛盾ではないと判断。大気汚染の数値（月次平均・AQIピーク）はCSE・aqi.in・CPCB系の一次報道で完全一致を確認し、「ピークを平均と誤記」の兆候もなし。`bestMonths`/`avoidMonths`の判断根拠を揺るがす修正は発生しなかった。

## グルガオン（第1パス、執筆者自身によるセルフチェック）

`lib/cities/data.ts` の `gurgaon` エントリに記載した固有名詞・数値の検証記録。グルガオンはデリー首都圏の一部だが、事実は原則としてグルガオン（グルグラム、ハリヤナ州）固有のものに限定し、デリーと共通する事実（空港・大気汚染の地域性）は明示的にクロスリファレンスした。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 都市 | 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|---|
| グルガオン | 祭事 | シータラー・マーター寺院の祭礼、チャイトラ月（3〜4月）、地名「グルガオン」の起源伝承（グル・ドローナ／クリピー）と結びつく | ✅ | "Sheetla Mata Mandir Gurgaon fair mela history Chaitra" / "Sheetla Mata Gurgaon city name origin legend founding" | https://en.wikipedia.org/wiki/Sheetla_Mata_Mandir_Gurgaon ／ https://www.livehistoryindia.com/story/cover-story/gurugram-daughter-of-serendipity |
| グルガオン | 料理 | バルジー（Baljee）、旧グルガオン・サダルバザール、1970年代創業のチョーレー・バトゥーレー老舗 | ✅（創業年は1973年説・1975年説で幅があるため「1970年代」と幅を持たせて記載） | "Baljee Restaurant Gurgaon 1973 history chole bhature old Gurgaon" ＋独立検証 ""Baljee" Gurgaon Sadar Bazar restaurant founded year history established" | https://wanderlog.com/place/details/2375583/baljee-restaurant（1973年） ／ 複数のグルメサイトで1975年説も併存（該当箇所は年を特定せず「1970年代」に丸めて記載） |
| グルガオン | エリア | DLFゴルフコースロード（セクター42・53〜56）、スシャント・ロック（セクター43）、ゴルフコース・エクステンション・ロードが主要な駐在員居住エリア | ✅ | "Gurgaon expat housing DLF Golf Course Road rent" | https://www.apartmentsingurugram.com/rental_aprt/property_GolfcourseRoad.html ／ https://www.apartmentsingurugram.com/rental_aprt/property_GolfcourseExtRoad.html |
| グルガオン | 家賃 | 2BHK（ゴルフコースロード、駐在員向け）$310〜840/月 | ✅ | "Golf Course Road Gurgaon 2BHK apartment rent per month rupees 2026" | https://www.squareyards.com/rent/2-bhk-for-rent-in-golf-course-road-gurgaon（₹30,000〜80,000/月、1USD≈95.5換算） ／ https://www.99acres.com/2-bhk-flats-for-rent-in-golf-course-road-gurgaon-ffid |
| グルガオン | 家賃 | 3BHK（DLFパークプレイス・セクター54、駐在員向け）$960〜1,280/月 | ✅ | "DLF Park Place Sushant Lok Gurgaon 3BHK rent per month rupees 2026" | https://www.apartmentsingurugram.com/rental_aprt/dlf_park_place.html（₹92,000〜115,000/月） ／ https://www.99acres.com/3-bhk-flats-for-rent-in-dlf-park-place-sector-54-gurgaon-509-rnpffid（平均₹121,875/月、デリー首都圏エントリの第2パスで独立検証済みの数値を再確認） |
| グルガオン | 日本人学校スクールバス | ニューデリー日本人学校のスクールバスが2024年度、グルガオン地区でベレール・ICON・パームスプリングス・パークプレイス・ピナクル・ウェストエンドハイツ・クレストに停車 | ✅ | "グルガオン 日本人学校 ニューデリー日本人学校 通学 スクールバス" | https://kaigai.starts.co.jp/india/life/200（本文を直接取得し停留所名を確認。ndjs.org本体には現行の停留所リストは非公開のため、この一次情報源に依拠） |
| グルガオン | 病院 | Medanta – The Medicity（セクター38）2009年開業、JCI・NABH・NABL認定、43エーカー、年間2万人超の国際患者 | ✅ | "Medanta The Medicity Gurgaon Sector address CIN road" | https://www.medanta.org/hospitals-near-me/gurugram-hospital（セクター38所在を確認。開業年・認定・国際患者数はデリー首都圏エントリの第1・第2パスで確認済みの数値を再使用） |
| グルガオン | 病院 | Fortis Memorial Research Institute（セクター44、HUDAシティセンター向かい）2013年開業、JCI・NABH認定 | ✅ | "Fortis Memorial Research Institute Gurgaon address sector JCI" | https://www.fortishealthcare.com/location/fortis-memorial-research-institute-gurgaon（セクター44、HUDAシティセンター向かいの住所を確認。2013年開業・JCI/NABH認定は複数のホスピタル紹介サイトで一致） |
| グルガオン | 病院 | Artemis Hospital（セクター51）2007年開業、9エーカー、400床超、2013年グルガオン初のJCI認定、2017年NABH認定 | ✅ | "Artemis Hospital Gurgaon Sector 51 established 2007 beds acres JCI NABH" | https://en.wikipedia.org/wiki/Artemis_Hospital（2007年設立、9エーカー、2013年グルガオン初のJCI認定、2017年NABH認定） |
| グルガオン | 大気汚染 | デリーと同様の季節性大気汚染に見舞われる（具体的な月次数値はグルグラム固有のものを確認できず記載せず） | ✅（数値は意図的に省略） | "Gurugram AQI air quality monitoring station separate from Delhi 2026" | https://aqicn.org/city/india/gurugram/sector-51/ ／ https://aqicn.org/city/india/gurugram/nise-gwal-pahari/（セクター51・NISEグワルパハリ・ヴィカス・サダンの3局の存在は確認できたが、月次平均値を報じる一次資料は見つからず、数値記載を見送った） |
| グルガオン | 治安 | 新興セクターのゲーテッドコミュニティは比較的安全、旧市街・急速市街化エリアはやや治安が劣る、夜間は徒歩を避けUber/Ola推奨 | ✅ | "Gurgaon safety crime expat pickpocket night walking Uber Ola recommended" | https://rathiglobalrealty.com/is-gurgaon-safe-to-live（ゲーテッドコミュニティ・旧市街の治安差を明記） ／ https://www.travelsafe-abroad.com/india/gurgaon/ |
| グルガオン | 空港アクセス | グルガオン自体に空港はなく最寄りはIGI、ゴルフコースロード方面まで車で約20〜45分 | ✅ | "Gurgaon no airport Delhi IGI drive time distance" | https://www.rome2rio.com/s/Delhi-Airport-DEL/Gurgaon（20〜45分） ／ https://a2prealtech.com/blog_detail/how-close-is-gurgaon-to-delhi-airport.php（15〜20km、渋滞時30〜45分） |
| グルガオン | 直行便 | グルガオン発着の直行便はなく日本からはデリー（IGI）発着（JAL成田便・ANA羽田便） | ✅（デリー首都圏エントリで確認済みの事実をクロスリファレンス、数値を重複記載せず） | — | デリー首都圏エントリの直行便項目（上表参照） |
| グルガオン | 交通（域内） | ラピッドメトロ・グルガオン、2013年開業・2017年セクター55-56まで延伸、デリーメトロ・イエローラインとシカンダルプル駅で接続 | ✅ | "Gurgaon Rapid Metro Delhi Metro Yellow Line extension Gurugram" | https://en.wikipedia.org/wiki/Rapid_Metro_Gurgaon（2013年11月開業、2017年3月31日にセクター55-56まで延伸、シカンダルプル駅でイエローラインと接続） |
| グルガオン | 日本語グロサリー | 大和屋（Yamato-ya）グルガオン店（Boom Plaza 2F、セクター57） | ✅（デリー首都圏エントリの第1・第2パスで確認済みの事実を再使用） | — | https://magicpin.in/Gurgaon/Sector-57/Grocery/Yamato-ya-Intl.-Convenience-Store/store/391b43 |
| グルガオン | 日系企業拠点・GCC集積 | グルガオンの日系企業拠点数（450以上）がインド国内で最多と複数メディアが紹介。DLFサイバーシティ・ゴルフコースロード・ウドヨグ・ビハールにGCCが集中。ハリヤナ州が2025年に「Haryana GCC Policy」を発表 | ✅（「450以上・最多」は@DIME単独ソースのため断定を避け「メディアが紹介」と紹介形式で記載） | "グルガオン 日系企業 拠点数 450 進出企業数 インド最多" / "Gurgaon Gurugram GCC global capability centre hub NCR" | https://dime.jp/genre/756728/（本文を直接取得し「拠点が450以上」「インドの都市の中で最も日系企業の拠点が多い都市」を確認） ／ https://wework.co.in/blogs/haryana-gcc-policy/（本文を直接取得し2025年発表・グルガオン中心の政策であることを確認） |
| グルガオン | JETRO | グルガオン単独のJETRO事務所はなく、NCR全域はニューデリー事務所（Eros Corporate Tower）が担当 | ✅（デリー首都圏エントリの事実をクロスリファレンス、新規記載はせず） | "JETRO Gurgaon office location OR JETRO NCR Gurgaon 日系企業 拠点数" | 検索結果からグルガオン単独のJETRO事務所の存在は確認できず、`data.ts` のグルガオンエントリには記載しなかった |
| グルガオン | 渡航適期の判断根拠 | climate.tsの気温・降水はデリーとほぼ同一パターン（1〜3月は涼しく乾燥、4〜6月酷暑、7〜9月モンスーン、10〜12月降水少）。大気汚染はデリーと同一地域圏の現象として2〜3月をbestMonths、1・4〜9・11〜12月をavoidMonthsとした（デリー首都圏エントリと同じ判断根拠をクロスリファレンス。グルガオン固有の月次大気質数値は確認できなかったため、季節パターンの記述に留めた） | ✅（気温・降水はclimate.ts、大気汚染の地域性はデリー首都圏エントリの根拠を援用） | — | lib/cities/climate.ts（気温・降水、gurgaon slug） ／ デリー首都圏エントリの渡航適期判断根拠行（上表参照） |

削除した項目: グルガオン単独の日本人会（デリー日本人会と別に存在するか確認できず、`association` フィールドは記載せず）。グルガオン単独のニューデリー日本人学校とは別の現地校（存在を確認できず、スクールバスでの通学という形でのみ記載）。グルグラム固有の大気汚染月次数値（モニタリング局の存在は確認できたが月次平均を報じる一次資料が見つからず）。工芸・土産にあたる固有の物品（サダルバザールの一般的な骨董・雑貨市場という記述はあったが、グルガオン固有の特定の技法や品目に紐づく記述は見つからず、specialtiesには含めなかった）。

## グルガオン（第2パス、執筆者自身による別クエリでの独立再検証）

上記グルガオンの表は第1パスのセルフチェック。以下は第1パスと異なる検索クエリを用いて、特に確信度の低かった項目（GCC・日系企業拠点数、シータラー・マーター寺院の縁起、Fortis Memorial Research Institute、DLFパークプレイスの家賃）を再検証した記録。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 祭事 | シータラー・マーター寺院、地名「グルガオン」の起源伝承（グル・ドローナ／妻クリピー） | ✅ | ""Sheetla Mata Mandir" Gurugram temple wife Dronacharya Kripi smallpox goddess" | https://en.wikipedia.org/wiki/Sheetla_Mata_Mandir_Gurgaon ／ https://www.incredibleindia.gov.in/en/haryana/gurugram/sheetla-mata-mandir（インド政府観光公式サイトでも同一の縁起を確認） |
| 日系企業拠点・GCC集積 | グルガオンの日系企業拠点数「450以上・インド最多」 | ⚠️ 修正（数値・順位の主張を削除） | "Gurugram Japanese companies presence largest number India city ranking 2025" | 在インド日本大使館・JETROの2025年6月公式資料（https://www.in.emb-japan.go.jp/files/100866957.pdf）や複数の企業リストサイトを確認したが、「450以上」「インド最多」を独立に裏付ける一次資料・二次資料は見つからなかった。第1パースで確認できたのは @DIME（dime.jp）単独のソースのみで、abroaders.jp／miraist-india.comは接続不能で本文を直接確認できなかったため、`data.ts` の該当箇所から具体的な数値・「最多」という順位主張を削除し、「日系企業拠点が最も集積する都市の一つ」という穏当な表現に修正した |
| 病院 | Fortis Memorial Research Institute（セクター44）2013年開業、JCI・NABH・NABL認定、クアタナリーケア | ✅ | "Fortis Memorial Research Institute Gurugram opened 2013 quaternary care JCI accreditation status" | https://www.fortishealthcare.com/location/fortis-memorial-research-institute-gurgaon（2013年開業・quaternary care・JCI/NABH/NABL認定を確認。病床数は330床・11エーカーとの情報もあり`data.ts`側では病床数を記載していないため矛盾なし） |
| 家賃 | 3BHK（DLFパークプレイス・セクター54）$960〜1,280/月（₹92,000〜122,000） | ✅（市場レンジはより広いが矛盾なし） | "Golf Course Road Gurugram DLF Park Place 3BHK rent nobroker squareyards 2026" | https://www.squareyards.com/rent/3-bhk-for-rent-in-golf-course-road-gurgaon（同物件で₹150,000/月の掲載例も確認。claim値はこのレンジの下限〜中位に位置し、デリー首都圏エントリの第2パスと同じ理由（市場全体は広いレンジを持つが claim 値はその範囲内）で矛盾ではないと判断） |

修正1件（日系企業拠点数「450以上・最多」の削除）を除き、再検証した項目はすべて独立ソースで確認できた。`corporateNote` は数値・順位の主張を伴わない表現に修正済み。

## グルガオン（第3パス、独立ファクトチェッカーによる再検証）

上記2パスはいずれも執筆者自身によるセルフチェック。以下は別の担当者（fact-checkerサブエージェント）が、執筆者自身の調査ログ（`.superpowers/sdd/task-8-report.md`）を読まずに、`lib/cities/data.ts` の `gurgaon` エントリの `specialties`／`living` を独立に再検証した記録。検索クエリは前2パスと異なる言い回しを用いた。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 祭事 | シータラー・マーター寺院の祭礼、チャイトラ月（3〜4月）、グル・ドローナ／妻クリピーの起源伝承 | ✅ | "Sheetla Mata Mandir Gurugram temple origin story Dronacharya wife" ／ "Sheetla Mata Mandir Gurgaon mela fair Chaitra Navratri date annual" | https://en.wikipedia.org/wiki/Sheetla_Mata_Mandir_Gurgaon ／ https://mymetro.in/blog/sheetla-mata-mandir-gurgaon/（チャイトラ月の祭礼で年間約500万人が参拝と確認） |
| 料理 | バルジー（Baljee）、旧グルガオン・サダルバザール、1970年代創業のチョーレー・バトゥーレー | ✅（デリー案件との取り違えでないことを確認） | "Baljee Sadar Bazaar Gurgaon chole bhature restaurant since 197" ／ "\"Baljee\" Sadar Bazar New Delhi restaurant chole bhature different from Gurgaon" | https://wanderlog.com/place/details/2375583/baljee-restaurant（1973年創業） ／ https://lbb.in/delhi/gurgaon-sadar-bazar-street-food/（見出し「Gurgaon Has Its Own Street Food Place In Sadar Bazar」＝グルガオンのサダルバザールはオールドデリーのそれとは別物と明記。Zomatoの店舗ページが地域表記を便宜上「New Delhi」としている＝NCR全域の慣習的表記であり、店舗自体はグルガオンのサダルバザールに所在） |
| エリア | スシャント・ロック（セクター43）が駐在員向け高級エリア | ✅ | "Sushant Lok Sector 43 Gurgaon expat premium residential area" | https://www.nobroker.in/locality-iq/sushant-lok-phase-1-sector-43-gurgaon-liqlt（経営幹部・外国人が多く住む地域と明記） |
| エリア | DLFゴルフコースロード（セクター42・53〜56） | ✅ | "DLF Golf Course Road Sector 42 53 54 55 56 Gurgaon premium residential" | https://mygate.com/blog/neighbourhood/golf-course-road-gurgaon/（ゴルフコースロードはセクター42・43・53〜56を貫く約8kmの高級住宅回廊と確認） |
| エリア | ゴルフコース・エクステンション・ロードが駐在員向けエリア | ✅ | "Golf Course Extension Road Gurgaon expat residential premium area" | https://www.nstayhomes.com/golf-course-extension-road-the-new-epicenter-of-gurugrams-real-estate-boom-and-its-future-development-potential（外資系企業が外国人従業員の住居として選ぶ地域と明記） |
| 家賃 | 2BHK（ゴルフコースロード）$310〜840/月 | ✅（市場レンジは広いが重なりあり） | "Golf Course Road Gurgaon 2 BHK rent per month rupees 2026" ／ "\"Golf Course Road\" Gurgaon 2BHK rent \"₹\" lakh per month nobroker" | 検索結果集計：squareyards.com・99acres.com・nobroker.in の各listingで₹30,000〜110,000/月の幅を確認（claim値₹29,600〜80,220はこのレンジの下限〜中位に収まり矛盾なし） |
| 家賃 | 3BHK（DLFパークプレイス・セクター54）$960〜1,280/月 | ✅ | "DLF Park Place Sector 54 Gurgaon 3BHK rent monthly rupees" ／ "DLF Park Place Gurgaon apartment rent 1.2 lakh 1.5 lakh month" | https://www.apartmentsingurugram.com/rental_aprt/dlf_park_place.html（家具付き3BHKは₹90,000〜110,000/月と記載。claim値₹91,700〜122,240と近似） |
| 日本人学校スクールバス | ベレール・ICON・パームスプリングス・パークプレイス・ピナクル・ウェストエンドハイツ・クレスト（すべてゴルフコースロード沿いDLF系） | ✅（一次資料を直接取得し全7件を確認） | kaigai.starts.co.jp のページを直接取得し停留所名リストを抽出 | https://kaigai.starts.co.jp/india/life/200（本文に「ビレイラ・アイコン・パームスプリングス・パークプレイス（パークハイツ、パークタワー）・ピナクル・ウェストエンドハイツ・クレスト」の7件を確認、data.ts記載と完全一致） |
| 病院 | Medanta – The Medicity（セクター38）2009年開業、JCI/NABH/NABL認定、43エーカー、年間2万人超の国際患者 | ✅ | "Medanta Medicity Gurugram Sector 38 hospital JCI accreditation international patients" ／ "Medanta Medicity Gurugram 43 acres campus size" | https://www.medanta.org/hospitals-near-me/gurugram-hospital ／ https://medifyr.com/gurgaon/hospital/medanta-the-medicity（43エーカー・2009年設立・年間2万人超の国際患者を確認） |
| 病院 | Fortis Memorial Research Institute（セクター44、HUDAシティセンター向かい）2013年開業、JCI/NABH認定、クアタナリーケア | ✅ | "Fortis Memorial Research Institute Gurugram Sector 44 opened 2013 JCI NABH HUDA City Centre" | https://www.fortishealthcare.com/location/fortis-memorial-research-institute-gurgaon（セクター44・HUDAシティセンター向かい・2013年開業・quaternary care・JCI/NABH認定を確認） |
| 病院 | Artemis Hospital（セクター51）2007年開業、9エーカー、400床超、2013年グルガオン初のJCI認定、2017年NABH認定 | ✅ | "Artemis Hospital Gurugram Sector 51 established 2007 400 beds JCI accreditation 2013" ／ "Artemis Hospital Gurgaon \"first\" JCI accreditation year 2013 NABH 2017" | https://en.wikipedia.org/wiki/Artemis_Hospital ／ https://www.artemishospitals.com/?artemis=accreditation（グルガオン初のJCI・NABH認定病院と明記、2013年JCI・2017年NABH取得を確認） |
| 大気汚染 | グルグラム固有の月次数値は記載せずデリーと同様の季節性のみ言及 | ✅（記載を意図的に省略した判断は妥当） | 追加検索なし（記述が既に「一次資料が見つからなかったため数値を記載しない」と明記しており、過大な確信度を主張していない） | — |
| 空港アクセス | グルガオン自体に空港はなく最寄りはIGI、ゴルフコースロード方面まで車で約20〜45分 | ✅ | "Gurgaon no airport nearest Indira Gandhi International Airport drive time minutes" | https://a2prealtech.com/blog_detail/how-close-is-gurgaon-to-delhi-airport.php（15〜20km、渋滞時30〜45分） |
| 交通（域内） | ラピッドメトロ・グルガオン、2013年開業・2017年セクター55-56延伸、シカンダルプル駅でイエローライン接続 | ✅ | "Rapid Metro Gurgaon opened 2013 extended Sector 55 56 2017 Sikanderpur Yellow Line" | https://en.wikipedia.org/wiki/Rapid_Metro_Gurgaon（2013年11月開業、2017年3月31日にセクター55-56まで延伸、シカンダルプル駅でイエローライン接続を確認） |
| 交通（域内） | デリーメトロ・イエローライン、Medanta最寄りのミレニアム・シティ・センター駅、車で約10分 | ✅（誤差僅少、渋滞次第で10〜15分の幅） | "Medanta Medicity nearest metro station Millennium City Centre Yellow Line distance" | https://yometro.com/metro-station-near-medanta-hospital-gurgaon ／ https://moovitapp.com/index/en/dir/Medanta-stop_43310265-site_185484327-3801（複数ソースで車10〜15分程度との情報、claim値と概ね整合） |
| 交通 | ゴルフコースロードなど通勤時間帯（9〜11時、18〜20時）の渋滞が激しい | ✅ | "Golf Course Road Gurgaon traffic congestion peak hours morning evening commute" | https://www.99acres.com/golf-course-road-gurgaon-reviews-and-ratings-wrffid（居住者レビューでピーク時間帯の渋滞が繰り返し指摘されていることを確認） |
| 治安 | 新興セクターのゲーテッドコミュニティは比較的安全、旧市街・急速市街化エリアはやや治安が劣る、夜間はUber/Ola推奨 | ✅ | "Gurgaon safety old city new sectors gated community crime rate comparison" | https://rathiglobalrealty.com/is-gurgaon-safe-to-live ／ https://hashville.in/is-gurgaon-safe-to-live-in-2025-elvish-yadav-shooting-puts-gurgaon-safety-index-and-crime-rate-in-focus/（旧グルガオン・急速市街化エリアの治安がゲーテッドコミュニティに劣ると明記） |
| 日本語グロサリー | 大和屋（Yamato-ya）グルガオン店（Boom Plaza 2F、セクター57） | ✅ | "Yamato-ya Japanese grocery store Gurgaon Boom Plaza Sector 57" | https://magicpin.in/Gurgaon/Sector-57/Grocery/Yamato-ya-Intl.-Convenience-Store/store/391b43（Boom Plaza 2F、セクター57所在を確認） |
| GCC集積 | DLFサイバーシティ・ゴルフコースロード・ウドヨグ・ビハール一帯にGCCが集中 | ✅ | "DLF Cyber City Udyog Vihar Golf Course Road Gurugram GCC concentration hub office" | https://en.wikipedia.org/wiki/Cyber_City_Gurgaon（Fortune 500企業・GCC向けの約125エーカーの一大商業拠点、ウドヨグ・ビハールに隣接と確認） |
| GCC集積 | ハリヤナ州が2025年に「Haryana GCC Policy」を発表、グルガオンを技術ハブとして強化する方針 | ✅ | "Haryana GCC Policy 2025 Gurugram global capability centres announcement" | https://wework.co.in/blogs/haryana-gcc-policy/（2025年発表、グルガオンを技術ハブとする方針を確認） |
| 日系企業拠点・「最も集積」表現 | 「日本語メディアはグルガオンをインド国内で日系企業拠点が最も集積する都市の一つと紹介しており」 | ❌ 削除（ヘッジ表現が裏付けのない主張を覆っていたパターン） | "グルガオン 日系企業 拠点数 インド 最多 都市" ／ "\"グルガオン\" 日系企業 拠点 最も 集積" | 出典として確認できたのは @DIME（https://dime.jp/genre/756728/）1件のみで、本文は「拠点が450以上」「インドの都市の中で最も日系企業の拠点が多い都市」と断定するが、一次資料（JETRO・在インド日本大使館の統計）による裏付けは見つからなかった（在インド日本大使館PDF https://www.in.emb-japan.go.jp/files/100866957.pdf はアクセス不可＝403）。miraist-india.com・abroaders.jp等の関連記事も同じ主張を反復するのみで独立の一次データを示しておらず、単一の消費者向けメディア発の未検証の順位主張と判断。「〜の一つと紹介」というヘッジ表現がこの未確認の主張を覆っていたため、`data.ts` の `corporateNote` から当該節を削除した |

修正・削除1件（`corporateNote` の日系企業拠点「最も集積」ヘッジ主張の削除）を除き、全項目が独立ソース・独立クエリで確認できた。特に、バルジーが「デリーのサダルバザール」ではなく「グルガオン自身のサダルバザール」の店であること（Delhi bleedの誤りでないこと）を複数ソースで確認した。空港・大気汚染がデリーとの共通事項としてクロスリファレンスされている点は正しい記述であり、変更していない。`bestMonths`／`avoidMonths`／`lib/cities/climate.ts` の数値には触れていない。

## ベンガルール（第1パス、執筆者自身によるセルフチェック）

`lib/cities/data.ts` の `bengaluru` エントリに記載した固有名詞・数値の検証記録。`bestMonths`/`avoidMonths` は `lib/cities/climate.ts` の観測平均（最高気温が年間を通じて34℃を超えず、降水も6〜9月に138〜165mmと分散し、ムンバイ・デリーのような極端な季節性がない）を根拠に判断した。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 都市 | 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|---|
| ベンガルール | 渡航適期の判断根拠 | climate.tsでは最高気温が年間通じて26〜34℃、降水も4〜165mmと穏やかに分散しており、ムンバイ・デリーのような「必ず避けるべき月」が存在しない。最も涼しく乾燥する12〜2月（最高26〜30℃、降水4〜37mm）をbestMonthsとし、avoidMonthsは空配列とした | ✅（climate.tsの数値のみに基づく判断、外部ソースなし） | — | lib/cities/climate.ts（bengaluru slug） |
| ベンガルール | エリア | Indiranagar・Whitefieldが駐在員向けエリア。Indiranagarは地下鉄パープルライン沿いの中心部高級エリア、Whitefieldは東部ITパーク隣接の新興エリア | ✅ | "Bengaluru expat neighborhoods Indiranagar Whitefield rent 2BHK monthly" | https://www.globemoving.net/international/moving-to-india/where-to-live-bangalore/ ／ https://expatlife.ai/india/cities/bangalore/neighborhoods/whitefield |
| ベンガルール | 家賃 | 2BHK（Indiranagar、駐在員向け）$335〜680/月 | ✅ | "Bengaluru expat neighborhoods Indiranagar Whitefield rent 2BHK monthly" ＋独立検証 "Indiranagar Bangalore 2BHK monthly rent rupees squareyards nobroker 2026" | ₹35,000〜65,000/月（globemoving.net記載）およびnestriqo.comの₹32,000〜55,000/月と概ね一致、1USD≈95.5円換算 |
| ベンガルール | 家賃 | 2BHK（Whitefield・ゲーテッドコミュニティ、駐在員向け）$188〜367/月 | ✅ | "Whitefield Bangalore 2BHK gated community rent per month rupees nobroker" | ₹18,000〜35,000/月（ゲーテッドコミュニティ帯、nobroker.in記載）、1USD≈95.5円換算 |
| ベンガルール | 為替換算 | USD/INR ≈ 95.5（2026年7月時点） | ✅ | "USD INR exchange rate July 2026" | https://www.exchangerates.org.uk/USD-INR-spot-exchange-rates-history-2026.html（2026年7月9日時点95.5060） |
| ベンガルール | 病院 | Sakra World Hospital（アウター・リング・ロード、マラタハリ）2014年開業、豊田通商・セコムの合弁でインド初の外資100%出資病院、国際患者向けに日本語通訳サービスを提供 | ✅ | "Sakra World Hospital Bangalore Japan Fujita Health University Japanese investment" ＋公式ページ直接取得 | https://www.sakraworldhospital.com/international-patient-services（"Arabic, Japanese and French interpretation services are made available to International patients."と明記）／ https://www.toyota-tsusho.com/english/about/project/02.html（2014年3月開業、JBIC融資） |
| ベンガルール | 病院 | Sakra World Hospitalの出資比率（セコム60%・豊田通商40%）、NABH認定 | ✅（JCIは公式ページに記載なしのため記載せず） | "Sakra World Hospital JCI NABH accreditation Marathahalli Outer Ring Road" | https://www.theweek.in/theweek/business/2024/07/13/india-s-first-fully-fdi-hospital-sakra-bengaluru.html（出資比率）／ https://www.sakraworldhospital.com/quality-safety（NABH認定・AACI認定を明記、JCIの記載なし） |
| ベンガルール | 病院 | Fortis Hospital（バンネルガッタ・ロード）2006年開業、2008年にカルナータカ州で初めてJCI認定取得 | ✅ | "Fortis Bannerghatta Road first JCI accredited hospital Karnataka year" | https://www.medijourney.co.in/hospital/fortis-hospital-bg-road-bangalore（2006年設立・カルナータカ州初のJCI認定を明記） |
| ベンガルール | 病院 | Apollo Hospitals（バンネルガッタ・ロード）2007年開業、JCI・NABH認定、250床 | ✅ | "Apollo Hospital Bannerghatta Road Bangalore JCI accreditation year founded" | https://www.medijourney.co.in/hospital/apollo-hospital-bangalore-bannerghatta-road（2007年設立、JCI・NABH認定、250床、50以上の診療科を確認） |
| ベンガルール | 治安 | 比較的治安は安定、コマーシャル・ストリート／MG Road周辺でのスリに注意、マジェスティック・シヴァジナガルは夜間の単独行動を避ける | ✅ | "Bangalore safety expats crime pickpocket area avoid night" | https://www.travelsafe-abroad.com/india/bangalore/ ／ https://travel.india.com/guide/destination/shocking-find-out-which-10-places-in-bengaluru-you-should-stay-away-from-7039202/（マジェスティック・シヴァジナガルを名指しで注意喚起） |
| ベンガルール | 空港アクセス | KIAからIndiranagarまで車で約35〜36分、Whitefieldまで約35分（通常時） | ✅ | "Bengaluru airport KIA to Whitefield Indiranagar drive time minutes" ／ "Bengaluru airport to Indiranagar drive time minutes distance" | https://www.rome2rio.com/s/Bengaluru-Airport-BLR/Whitefield-India（35分）／ https://www.rome2rio.com/s/Bengaluru-Airport-BLR/IndiraNagar（36分） |
| ベンガルール | 域内交通 | Namma Metroパープルラインが2023年10月にWhitefield(Kadugodi)〜Challaghatta間で全線開業 | ✅ | "Bengaluru Namma Metro Purple Line Whitefield Challaghatta stations" | https://en.wikipedia.org/wiki/Purple_Line_(Namma_Metro)（2023年10月9日全線開業、43.49km・37駅を確認） |
| ベンガルール | 直行便 | JAL(日本航空)が成田―ベンガルール間に2020年3月就航、ボーイング787-8型機、インドで2番目のJAL直行路線 | ✅ | "成田 ベンガルール 直行便 ANA" ＋独立検証 "JAL Narita Bengaluru route launched March 2020 first flight history" | https://www.bengaluru.in.emb-japan.go.jp/itpr_en/00_000136.html（在ベンガルール日本国総領事館公式ページで2020年就航を確認）／ ANAはベンガルール線を運航していないことも確認 |
| ベンガルール | 直行便 | 2026年は時期により週3便〜毎日運航の間で変動、9月から毎日運航化予定、所要時間は成田発9時間55分・ベンガルール発7時間45分 | ✅ | "JAL Narita Bengaluru flight schedule frequency aircraft duration 2026" | https://press.jal.co.jp/en/release/202606/009571.html（2026年3月29日〜8月31日は週3便、9月1日〜10月24日は毎日運航に増便） |
| ベンガルール | 渋滞 | TomTomトラフィック指数2025でベンガルールは世界2位の渋滞都市（スコア74.4）、ラッシュ時平均時速16.6km/h、通勤者は年間168時間を渋滞で損失 | ✅ | "Bengaluru traffic congestion commute time TomTom index" | https://www.downtoearth.org.in/urbanisation/bengaluru-kolkata-among-worlds-slowest-cities-as-india-ranks-high-on-congestion-index（TomTomトラフィック指数2025のデータとして数値を確認） |
| ベンガルール | 冠水 | 2022年9月、Microsoft・Intel・Goldman Sachsなどが集まるOuter Ring Road一帯で大雨による冠水、ボートでの救助が発生 | ✅ | "Bengaluru monsoon flooding Outer Ring Road tech park waterlogging boats" | https://scroll.in/latest/1032055/bengaluru-roads-flooded-again-after-overnight-heavy-rainfall（ORR沿いのMicrosoft・Intel・Goldman Sachs等の拠点周辺の冠水、Varthurでのボート救助を確認） |
| ベンガルール | 日本人会 | バンガロール日本人会（bangalore-nihonjinkai.com） | ✅ | "バンガロール 日本人学校 日本人会" | https://www.bangalore-nihonjinkai.com/ |
| ベンガルール | 補習校 | バンガロール補習授業校（土曜校、Trio World Academy内・Sahakar Nagar所在）、設置主体はバンガロール日本人会 | ✅ | "バンガロール 日本人学校 日本人会" | https://sites.google.com/site/bangalorehoshuko/info（デリー・ムンバイと異なり全日制の日本人学校はなく補習校のみと明記） |
| ベンガルール | 日本語グロサリー | 実店舗を確認できず | ❌（削除） | "日本食料品店 バンガロール 日系スーパー Bangalore Japanese grocery" | オンライン販売のMaindish.in等は確認できたが、実店舗の日系スーパー名は特定できず、`groceries` は空配列とした |
| ベンガルール | GCC・日系企業 | ベンガルールはインド最大のGCC集積地。在ベンガルール日本国総領事・名和浩史氏が2026年、同市のGCCエコシステムが日系企業を引き付ける自然な魅力になっていると発言、半導体・製造・研究開発・人材育成を重点分野として言及 | ✅（GCCの総数はソースにより870〜1,100超と幅があり数値は本文に採用せず、総領事の発言のみを事実として記載） | "Bengaluru Japanese GCC global capability centre leading city corporate" ＋独立検証 ""Consul General" Nawata Bengaluru Japanese companies GCC Deccan Herald" | https://www.deccanherald.com/india/karnataka/bengaluru/bengalurus-gcc-ecosystem-a-natural-lure-for-japanese-companies-says-new-consul-general-4029211（記事見出し・要旨を確認）／ https://www.bengaluru.in.emb-japan.go.jp/itpr_ja/11_000001_00604.html（総領事・名和浩史氏の実在と活動を独立に確認） |
| ベンガルール | 名物料理 | MTR（マーヴァッリ・ティフィン・ルームズ）、1924年マイヤ兄弟が「ブラーミン・コーヒー・クラブ」として創業、第二次大戦中の米不足からラヴァ・イドリーを考案 | ✅ | "MTR Mavalli Tiffin Room masala dosa history 1924 Bangalore" | https://en.wikipedia.org/wiki/Mavalli_Tiffin_Rooms ／ https://thebetterindia.com/food/food-history/origin-invention-story-rava-idli-mtr-bengaluru-10649642 |
| ベンガルール | 工芸 | チャンナパトナの木工玩具、2005年GI登録、18世紀ティプー・スルターンが招いたペルシャ職人の技法に起源とされる | ✅（ペルシャ職人起源説は一部専門家の間で異論もあるため「とされる」と表現） | "Channapatna toys GI tag craft Bangalore Karnataka" | https://en.wikipedia.org/wiki/Channapatna_toys（2005年GI登録）／ http://www.sahapedia.org/channapatna-toys-and-tipu-sultans-persian-connection（ペルシャ起源説は広く流布する一方、地元専門家には異論もあると明記） |
| ベンガルール | 祭事 | ベンガルール・カルガ祭、旧市街ティガラルペーテのダルマラーヤ・スワーミ寺院、チャイトラ月（3〜4月）、寺院は800年以上の歴史 | ✅ | "Karaga festival Bengaluru Dharmaraya Swamy Temple history" | https://en.wikipedia.org/wiki/Dharmaraya_Swamy_Temple ／ https://en.wikipedia.org/wiki/Bangalore_Karaga |
| ベンガルール | 土産 | デヴァナハッリ・ポメロ（チャコッタ）、空港所在地デヴァナハッリ周辺のみで栽培、2009〜10年GI登録、1個2〜2.5kg（最大10kg近く） | ✅ | "Devanahalli Pomelo GI tag Bengaluru" | https://en.wikipedia.org/wiki/Devanahalli_pomelo ／ https://www.shankariasparliament.com/current-affairs/daily-upsc-current-affairs-prelim-bits-27-04-2020（GI登録2009〜10年を確認） |

## ベンガルール（第2パス、執筆者自身による別クエリでの独立再検証）

上記の表は第1パスのセルフチェック。以下は第1パスと異なる検索クエリを用いて、特に確信度の低かった項目（Sakra World Hospitalの出資比率とJCI有無、Fortis病院の開業年、カルガ祭の日程、チャンナパトナ玩具のGI年）を再検証した記録。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 病院 | Sakra World Hospital、豊田通商・セコムの合弁、インド初の100%外資病院、出資比率セコム60%・豊田通商40% | ✅ | ""Sakra World Hospital" "first" FDI hospital India Secom Toyota Tsusho ownership percentage" | https://www.theweek.in/theweek/business/2024/07/13/india-s-first-fully-fdi-hospital-sakra-bengaluru.html（出資比率を再確認）／ https://www.toyota-tsusho.com/english/press/detail/240318_006373.html（第2病院建設計画の発表記事で豊田通商・セコムの合弁関係を再確認） |
| 病院 | Fortis Hospital（バンネルガッタ・ロード）2006年開業、カルナータカ州初のJCI認定 | ✅ | "Fortis Hospital Bangalore Bannerghatta Road opened 2006 history" | 検索結果で2006年設立・カルナータカ州初のJCI認定（6回のJCI認定歴、4回のNABH認定歴）を複数サイトで確認、284床という情報も得た（data.tsには病床数を記載していないため矛盾なし） |
| 祭事 | ベンガルール・カルガ祭、チャイトラ月（3〜4月）、旧市街ティガラルペーテ中心 | ✅ | ""Bangalore Karaga" Thigalarpete Draupadi festival date April March" | https://en.wikipedia.org/wiki/Bangalore_Karaga（3月または4月、チャイトラ月と確認）／ 2026年の開催日程（3月26日〜4月1日）も確認、data.tsは特定年の日付を記載していないため矛盾なし |
| 工芸 | チャンナパトナ木工玩具、2005年GI登録、ラーマナガラ県（ベンガルールから約60km） | ✅ | "Channapatna toys GI tag 2005 Tipu Sultan Persian artisans history" | https://5sensestours.com/channapatna-toys-tour-bangalore-tipu-sultan-folk-art/（ベンガルールから60km、2005年GI登録を再確認） |
| 名物料理 | MTRのラヴァ・イドリー、第二次大戦中（日本軍のビルマ侵攻による）米不足を機に考案 | ✅ | ""Mavalli Tiffin Room" OR MTR rava idli invented World War rice shortage history" | https://thebetterindia.com/food/food-history/origin-invention-story-rava-idli-mtr-bengaluru-10649642（日本のビルマ侵攻による米不足が契機と明記、独立ソースで再確認） |
| 域内交通 | Namma Metroパープルライン、Whitefield(Kadugodi)〜Challaghatta間、37駅・43.49km | ✅ | "Bengaluru Namma Metro Purple Line Whitefield Challaghatta stations" | https://en.wikipedia.org/wiki/Purple_Line_(Namma_Metro)（2023年10月9日全線開業を再確認） |

修正・削除なし。全項目が独立ソース・独立クエリで確認できた。GCCの総数（870〜1,100超とソースにより幅がある）は本文に具体的数値として採用せず、在ベンガルール総領事の発言のみを事実として記載する判断を維持した。Sakra World HospitalのJCI認定は複数の第三者サイトが主張する一方、公式サイト（quality-safetyページ）にはNABH・AACIのみが明記されJCIの記載がないため、`data.ts` にはJCIを記載せずNABHのみとした。`bestMonths`/`avoidMonths`はclimate.tsの数値のみに基づき、外部ソースは使用していない（ベンガルールは年間を通じて温和な気候のため`avoidMonths`は空配列とした）。

## ベンガルール（第3パス、独立ファクトチェッカーによる再検証）

上記2パスは執筆者自身によるセルフチェック。以下は別の担当者（fact-checkerサブエージェント）が、執筆者の調査ログ（`.superpowers/sdd/task-9-report.md`）を読まずに、`lib/cities/data.ts` の `bengaluru` エントリの `specialties`／`living` を独立に再検証した記録。検索クエリは前2パスと異なる言い回しを用い、病院の認定は各病院の公式ページで直接確認した。確認できなかった具体値（空港所要分、直行便の就航年・機材・便数スケジュール、ORR冠水の企業名、総領事の2026年発言、GCC「最大」の順位主張）は削除した。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述（修正前） | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 料理 | MTR、1924年マイヤ兄弟がラールバーグ・フォート・ロードで「ブラーミン・コーヒー・クラブ」として開業、ラヴァ・イドリーは第二次大戦中の米不足を機に考案 | ✅ | "MTR Bangalore Mavalli Tiffin Room history founded 1924 Maiya brothers rava idli invented" / "MTR restaurant Lalbagh Fort Road original location 1924 Brahmin Coffee Club" | https://en.wikipedia.org/wiki/Mavalli_Tiffin_Rooms（1924年ラールバーグ・フォート・ロードでBrahmin Coffee Club開業、WWII米不足でセモリナ製ラヴァ・イドリー考案を確認） |
| 工芸 | チャンナパトナ木工玩具、ラーマナガラ県、ティプー・スルターンが招いたペルシャ職人起源、**2005年GI登録** | ⚠️ 修正（登録年） | "Channapatna toys Ramanagara district GI tag registered year Tipu Sultan Persian craftsmen origin" | https://en.wikipedia.org/wiki/Channapatna_toys（出願07.02.2005、**登録は2006年1月30日**）／ https://search.ipindia.gov.in/GIRPublicSearch/（出願番号23）── 「2005年GI登録」を「2005年出願・2006年登録」に修正 |
| 祭事 | カルガ祭、旧市街ティガラルペーテのダルマラーヤ・スワーミ寺院、チャイトラ月（3〜4月）、**寺院はベンガルール建都(1530年)以前からの800年以上の歴史** | ❌ 削除（年代・建都前の主張） | "Bengaluru Karaga festival Dharmaraya Swamy temple Thigala history age years old" / "Kempegowda founded Bangalore city year 1537" | https://en.wikipedia.org/wiki/Bangalore_Karaga（祭礼地は現ナガラトペーテ〔歴史的名ティガラルペーテ〕）／ http://www.sahapedia.org/bengalurus-karaga-festival-folk-origins-and-rituals（**寺院は18〜19世紀建立とされる**と明記、800年説と矛盾）── ①建都年は1530年でなく**1537年**（Kempegowda、Wikipedia）と誤り、②「建都前・800年以上」は一次寄りのSahapediaが18〜19世紀建立とし矛盾するため、寺院年代の主張ごと削除。地名を「（現ナガラトペーテ）」と補記し祭礼自体の記述は維持 |
| 土産 | デヴァナハッリ・ポメロ（チャコッタ）、空港所在地デヴァナハッリ周辺のみ栽培、2009〜10年GI登録、1個2〜2.5kg（最大10kg近く）、空港開発で希少化 | ✅ | "Devanahalli pomelo chakotta GI tag weight kg airport cultivation declining" | https://en.wikipedia.org/wiki/Devanahalli_pomelo ／ https://bangalorerural.nic.in/en/culinary-delight/devanahalli-chakota/（GI 2009-10、2〜2.5kg・最大10kg、空港建設で栽培減・農家100戸未満を確認） |
| エリア | Indiranagar・Whitefield が駐在員居住エリア | ✅ | "Indiranagar Bangalore expat residential area cafes coworking metro purple line" / "Whitefield Bangalore ITPL international schools gated community expat families" | https://www.away.center/post/thinking-about-coworking-spaces-in-indiranagar-heres-what-you-need-to-know（Indiranagarはパープルライン沿いカフェ・コワーキング集積の駐在員人気エリア）／ https://expatlife.ai/india/cities/bangalore/neighborhoods/whitefield（WhitefieldはITPL隣接・インターナショナルスクール・ゲーテッドコミュニティの駐在員家庭向けエリア） |
| 家賃 | 2BHK（Indiranagar）$335〜680/月（≒₹32,000〜65,000、1USD≈95.5） | ✅ | "Indiranagar 2 bedroom apartment rent per month rupees 2026" | https://www.nestriqo.com/blog/average-rent-2bhk-bangalore-2026 ／ Indiranagar 2BHKは₹35,000〜65,000/月との複数掲載と整合、claim値はそのレンジ内 |
| 家賃 | 2BHK（Whitefield・ゲーテッドコミュニティ）$188〜367/月（≒₹18,000〜35,000） | ✅ | "Whitefield gated community 2BHK rent per month rupees" | https://www.birlaevara.org.in/blog/what-are-the-best-gated-communities-in-whitefield.html（ゲーテッドコミュニティの2BHKは₹18,000〜35,000/月）── claim値とほぼ一致 |
| 治安 | コマーシャル・ストリート／MG Roadのスリ、マジェスティック・シヴァジナガルは夜間回避、Uber/Ola推奨 | ✅ | "Bangalore Commercial Street MG Road pickpocket theft safety tourists" / "Majestic bus stand Shivajinagar Bangalore safety night avoid crime" | https://www.isitsafetovisit.com/cities/bangalore（Commercial St・MG Roadで混雑時のスリ注意）／ https://travel.india.com/guide/destination/shocking-find-out-which-10-places-in-bengaluru-you-should-stay-away-from-7039202/（Majestic・Shivajinagarは夜間の混沌・軽犯罪で単独回避推奨） |
| 病院 | Sakra World Hospital（マラタハリ、ORR）、豊田通商・セコム合弁、2014年開業、インド初の外資100%出資病院、アラビア語・日本語・仏語通訳、**NABH認定**（JCIは記載せず） | ✅（認定は公式で確認） | "Sakra World Hospital Marathahalli Toyota Tsusho Secom first foreign owned hospital India" / 公式quality-safetyページ直接確認 | https://www.theweek.in/theweek/business/2024/07/13/india-s-first-fully-fdi-hospital-sakra-bengaluru.html（2014年3月開業・インド初の100%FDI病院・セコム/豊田通商）／ https://www.sakraworldhospital.com/international-patient-services（日・アラビア・仏語通訳を公式明記）／ https://www.sakraworldhospital.com/quality-safety（**公式にNABH・AACIを掲示、JCIの記載なし**──data.tsがJCIを主張していないのは適切） |
| 病院 | Fortis Hospital（バンネルガッタ・ロード）**2006年開業、2008年にカルナータカ州で初めてJCI認定** | ⚠️ 修正（「2008年・カ州初」を削除） | "Fortis Hospital Bannerghatta Road Bangalore opened 2006 JCI accreditation 2008 Karnataka first" / 公式ページ（Wayback）直接確認 | http://web.archive.org/web/20251121155400/https://www.fortishealthcare.com/location/fortis-hospital-bg-road-bangalore（公式に「2006年操業開始」「JCI・NABH認定」を確認）── ただし「2008年」「カルナータカ州初」は公式に記載なく第三者ディレクトリのみ。一次ソースで裏付けられないため当該具体主張を削除し「2006年開業、JCI・NABH認定を取得した総合病院」に修正 |
| 病院 | Apollo Hospitals（バンネルガッタ・ロード）2007年開業、JCI・NABH認定、**250床**、50以上の診療科 | ⚠️ 修正（病床数） | "Apollo Hospitals Bannerghatta Road Bangalore opened 2007 JCI NABH beds" / 公式ページ直接確認 | https://www.apollohospitals.com/bangalore/best-hospital-in-bannerghatta-road（公式本文に「**350 bedded hospital**」──250床は誤りのため350床に修正）／ https://www.apollohospitals.com/accreditations（公式認定一覧に「Apollo Hospitals, Bannerghatta, Bangalore」がJCI〔直近2023〕・NABH〔2021〕として掲載、JCI・NABHを確認） |
| 域内交通 | Namma Metroパープルライン、Whitefield(Kadugodi)〜Challaghatta | ✅ | "Bengaluru Namma Metro Purple Line Whitefield Challaghatta stations" | https://en.wikipedia.org/wiki/Purple_Line_(Namma_Metro)（Kadugodi〔Whitefield〕〜Challaghatta、全長43.49kmを確認） |
| 空港アクセス | KIAから**Indiranagar約35〜40分・Whitefield約35分（通常時）** | ❌ 削除（具体分） | "Kempegowda International Airport distance from city centre Devanahalli" | https://en.wikipedia.org/wiki/Kempegowda_International_Airport（空港はDevanahalli所在・2008年開業を確認）── 具体的所要分を独立ソースで確認できず（rome2rio/taxifarefinderは応答不可）、分数を削除し「北に離れたデヴァナハッリ所在・渋滞で大きく変動」の定性記述に置換 |
| 直行便 | JAL成田―ベンガルール、**2020年3月就航・787-8・インド2番目・2026年は週3〜毎日で変動・9月から通年毎日・所要成田発9h55m/現地発7h45m**、ANA直行便なし | ⚠️ 修正（就航年・機材・便数の具体を削除） | "Japan Airlines Bengaluru Narita route JL753 JL754" / ANA・JAL就航路線一覧を直接確認 | https://ja.wikipedia.org/wiki/日本航空（就航路線一覧に「成田 - ベンガルール (JL753/754)」を確認）／ https://en.wikipedia.org/wiki/Japan_Airlines_destinations（Bangalore就航中）／ https://ja.wikipedia.org/wiki/全日本空輸（ANA就航路線にベンガルールなし＝ANA直行便なしを確認）── JAL就航（JL753/754）とANA不在は確認できたが、就航年・機材・2026年の便数スケジュール・所要時間は独立に裏付けられず削除 |
| 渋滞 | TomTom指数2025、ベンガルール世界2位（渋滞74.4）、**ラッシュ時平均時速16.6km/h**、年間168時間ロス | ⚠️ 修正（16.6の位置づけ） | "TomTom Traffic Index 2025 Bengaluru ranking congestion" / TomTom公式ページ直接確認 | https://www.tomtom.com/traffic-index/bengaluru-traffic/（渋滞74.4%、rush hourでの損失168時間を確認）／ https://www.tomtom.com/traffic-index/ranking/（cRank:2、c:74.4、v:16.6を確認）── 16.6km/hは年間平均速度であり、ラッシュ時実速は朝14.6・夕13.2km/hと別。「ラッシュ時の平均時速16.6」は誤解を招くため「平均時速16.6km/h」に修正、順位2位・168時間は✅ |
| 渋滞（続き） | **2022年9月、Microsoft・Intel・Goldman SachsのORR IT団地一帯が大雨で冠水、ボート救助** | ❌ 削除 | "Bengaluru Outer Ring Road flooding September 2022 Microsoft boat" / Outer Ring Road Wikipedia直接確認 | https://en.wikipedia.org/wiki/Outer_Ring_Road,_Bangalore（ORR記事に当該2022年9月冠水・企業名・ボート救助の記載なし）── 具体的企業名を伴うこの事象を独立ソースで確認できなかったため文ごと削除 |
| 日本人会 | バンガロール日本人会（bangalore-nihonjinkai.com）が現在も活動中 | ✅ | "バンガロール日本人会 The Japanese Association of Bangalore" | https://www.bangalore-nihonjinkai.com/（2026/07/07更新の活動情報を掲示、稼働中を確認） |
| 日本人学校 | バンガロール補習授業校（土曜校、Trio World Academy内・Sahakar Nagar） | ✅ | "Trio World Academy Japanese Supplementary School Sahakar Nagar" | https://www.trioworldacademy.com/blog/celebrating-cultural-ties-consul-general-of-japan-visits-trio-world-academy/（Trio World Academy内でJapanese Supplementary School〔補習授業校〕が運営、在ベンガルール総領事Hiroshi Nawataが閉講式に出席）／ https://www.trioworldacademy.com/（住所Kodigehalli Main Rd, Sahakar Nagarを確認。「土曜校」の曜日は明記なし〔補習校は通例週末開催〕） |
| 企業集積 | **ベンガルールはインド最大のGCC集積地。総領事・名和浩史氏が2026年に半導体・製造・R&D・人材育成を重点分野と発言** | ❌ 削除（最大の順位主張＋発言） | "Bengaluru largest GCC global capability centre hub India" / Global capability center（Wikipedia）直接確認 | https://en.wikipedia.org/wiki/Global_capability_center（「Bengaluru, Pune, Hyderabad, Noida, Gurgaon, Chennai, Navi Mumbai等の都市に立地」とあり**ベンガルールを最大と断定していない**）── ①「インド最大」の順位主張はグルガオンの「最多」削除と同様に一次裏付けなく削除、②総領事の2026年発言は総領事館サイトが応答不可で独立に確認できず削除。GCC集積都市の一つである点のみ残す |

修正5件・削除3件。すべての削除は「執筆者が出典化できなかった具体値（分数・年・機材・便数・企業名・順位）」に対応する。病院の認定は3院とも各公式ページで直接確認し、Apolloの病床数（250→350）とFortisの認定文言（「2008年・カ州初」削除）を一次ソースに合わせて訂正。`bestMonths`/`avoidMonths`は変更していない。

## チェンナイ（第1パス、執筆者自身によるセルフチェック）

`lib/cities/data.ts` の `chennai` エントリに記載した固有名詞・数値の検証記録。`bestMonths`/`avoidMonths` はタスクブリーフで与えられた `lib/cities/climate.ts` の観測値（2015-2024年平均）をそのまま用いた：最高気温・降水ともに最も穏やかな1月(28.0℃/27mm)・2月(29.6℃/5mm)を`bestMonths`とし、酷暑期の5〜6月(35.1〜35.2℃)と北東モンスーンによる大雨期の10〜12月(190〜357mm)を`avoidMonths`とした。3・4・7〜9月はどちらにも該当しない「準・悪くない月」として残した。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 渡航適期の判断根拠 | climate.tsの数値のみに基づき1〜2月をbestMonths、5〜6月(酷暑)・10〜12月(北東モンスーン)をavoidMonthsとした | ✅（climate.tsの数値のみ、外部ソースなし） | — | lib/cities/climate.ts（chennai slug） |
| 料理 | チェッティナード料理、アンジャッパル(Anjappar)が1964年にロイヤペッタで創業しチェーン化 | ✅ | "Anjappar Chettinad Restaurant founded Chennai history" / "Chettinad cuisine origin Chettinad region Tamil Nadu Nagarathar community history" | https://en.wikipedia.org/wiki/Anjappar_Chettinad_Restaurant（1964年ロイヤペッタ創業）／ https://en.wikipedia.org/wiki/Chettinad_cuisine（料理自体の発祥はシヴァガンガー県・プドゥッコッタイ県のナーガラタル商人） |
| 工芸 | カーンチープラム・シルクサリー、2005〜06年GI登録、チェンナイから約70km、Nalli Silksが1928年にT・ナガルで創業 | ✅ | "Kanchipuram silk saree GI tag registration year Chennai" / "Nalli Silks founded 1928 Chennai T Nagar history" | https://kancheepuram.nic.in/about-district/gi-tag-product-kancheevaram-silks-and-sarees/（2005〜06年GI登録）／ https://www.holidify.com/places/kanchipuram/how-to-reach/chennai-to-kanchipuram-836.html（道路74km）／ Nalli公式サイト等の複数ソースで1928年T・ナガル創業を確認 |
| 祭事 | マルガリ音楽祭(マドラス・ミュージック・シーズン)、1927年マドラス・ミュージック・アカデミー創設が起点、2004〜05年シーズンに約20サバーで約600人による1,200件超の演目 | ✅（「世界最大級」等のUNESCO関連の宣伝的表現は不採用） | "Margazhi music season Chennai December January Carnatic largest cultural festival" | https://en.wikipedia.org/wiki/Madras_Music_Season（1927年創設、2004〜05年に1,200件超の演目・約600人の演者と明記。UNESCO認定の記載はなし） |
| エリア | Adyar・Besant Nagar・OMR(Sholinganallur等)が駐在員向けエリア | ✅ | "Chennai expat neighborhoods rent Adyar Besant Nagar OMR" / "Chennai Japanese expats live area housing OMR ECR Adyar automotive company employees" | https://renteel.com/blog/best-places-in-chennai/ ／ https://www.expat.com/en/guide/asia/india/chennai/（南チェンナイのECR沿い・Alwarpet・Adyar・Besant Nagar・OMRが駐在員に人気と明記） |
| 家賃 | 2BHK(Adyar・Besant Nagar) $260〜520/月(≒₹25,000〜50,000) | ✅ | "Adyar Chennai 2BHK apartment rent per month rupees 2026" / "Besant Nagar Chennai 2BHK rent squareyards nobroker rupees per month" | 複数リスティング(99acres・squareyards・nobroker等)でAdyar ₹16,000〜50,000、Besant Nagar ₹22,000〜50,000のレンジを確認、claim値はこの範囲内 |
| 家賃 | 2BHK(OMR・Sholinganallur) $260〜630/月(≒₹25,000〜60,000) | ✅（市場全体はさらに広いレンジ） | "Sholinganallur OMR Chennai 2BHK apartment rent per month rupees gated community" | https://renteel.com/blog/best-places-in-chennai/（₹25,000〜60,000）／ 99acres・findbhk等でゲーテッドコミュニティは₹22,600〜81,499の幅も確認、claim値は下限〜中位に位置し矛盾なし |
| 為替換算 | USD/INR ≈ 95.5(ムンバイ等の既存エントリと同時点・同レートを再使用) | ✅（既存エントリで確認済みのレートを再使用） | — | ムンバイエントリのファクトチェック時に確認済み（https://www.exchangerates.org.uk/USD-INR-spot-exchange-rates-history-2026.html） |
| 病院 | Apollo Hospitals(グリームズ・ロード)1983年開業、2006年からJCI認定、2024年3月に7回目の再認定 | ✅ | "Chennai hospitals Apollo international patients JCI accreditation" / "Apollo Hospitals Chennai Greams Road address flagship 1983 first corporate hospital India" | https://www.jointcommission.org/en/about-us/recognizing-excellence/stories/apollo-hospitals ／ https://www.healthcareradius.in/compliance-and-accreditation/apollo-hospitals-gets-7th-jci-accreditation |
| 病院 | MIOT International(マナパッカム)1999年2月開業、年間約3,500人(全患者の約25%)の外国人患者、NABH・NABL認定 | ✅ | "MIOT International Hospital Chennai international patients accreditation" | https://en.wikipedia.org/wiki/MIOT_International_Hospital（1999年2月設立）／ 複数の病院紹介サイトで年間3,500人・25%の外国人患者を確認 |
| 病院 | Gleneagles Global Health City(ペルンバッカム)2008年開業、21エーカー、JCI・NABH・NABL認定 | ✅ | "Gleneagles Global Health City Chennai Perumbakkam address founded year" | https://www.ketto.org/blog/global-hospital-chennai（Global Hospitalsが2008年にベンガルール・チェンナイ・ムンバイに三次医療センターを開設したと明記）／ 複数サイトで21エーカー・JCI/NABH/NABL認定を確認 |
| 病院(日本語対応) | いずれの病院も日本語対応スタッフ常駐の確証なし | ✅（未確認のため断定せず注記に留めた） | "Chennai hospital Japanese language interpreter service 日本語 通訳 病院" | 検索結果に日本語対応を公式に明記する病院なし(民間の通訳仲介業者はヒットするが病院公式のサービスではない) |
| 治安 | 北チェンナイ(ロヤプラム・ワシャーマンペット・ヴィヤーサルパーディ・ペランブール)は夜間回避、ジョージタウンのパリーズ・コーナー/バーマ・バザールはスリに注意 | ✅ | "Chennai safety crime pickpocket tourists areas avoid at night" | https://travel.india.com/guide/destination/discover-the-blacklisted-areas-in-chennai-you-shouldnt-dare-to-explore-7003391/ ／ https://theworldtravelindex.com/en/asia/india/chennai/is-chennai-safe |
| 空港アクセス | MAAからAdyarまで約15〜35分、Besant Nagarまで約15〜20分、OMR/Sholinganallurまで約45〜60分 | ✅ | "Chennai Metro airport MAA distance Adyar Besant Nagar OMR drive time minutes" | https://www.rome2rio.com/s/Madras-Airport-MAA/Ady%C4%81r（約13分〜）／ https://www.rome2rio.com/s/Besant-Nagar/Madras-Airport-MAA（約16分）／ https://www.taxibazaar.in/chennai-airport-to-adyar-taxi.php |
| 空港拡張 | チェンナイ国際空港は2026年11月末完了目標で第3ターミナルを含む拡張工事(フェーズII)が進行中 | ✅ | "Chennai airport Chennai International Airport MAA terminal expansion 2026" | https://www.dtnext.in/news/chennai/chennai-airports-3rd-terminal-to-be-fully-operational-by-november-2026-centre-855382 |
| 域内交通 | チェンナイ・メトロ、ブルーライン32.65km・26駅、グリーンライン22km・17駅、2025年12月時点で総延長54.1km | ✅ | "Chennai Metro Rail lines opened stations Blue Line Green Line 2026" | https://en.wikipedia.org/wiki/Blue_Line_(Chennai_Metro)（32.65km・26駅、Wikipedia本文で直接確認）／ https://en.wikipedia.org/wiki/Chennai_Metro（総延長54.1km、2025年12月時点） |
| 直行便 | チェンナイ発着の日本直行便は運航社数0(2026年時点) | ✅ | "direct flight Japan Chennai Narita Haneda nonstop 2026" | https://www.flightsfrom.com/MAA-NRT ／ https://www.flightsfrom.com/NRT-MAA（いずれも運航社数0と明記） |
| モンスーン影響 | 北東モンスーン期(10〜12月)は道路冠水リスク、2015年11〜12月洪水で州政府最終集計421人死亡(2016年1月発表、10月28日〜12月31日)、2015年11月降水量1,049mmは1918年11月(1,088mm)以来の記録的多さ | ✅ | "2015 Chennai floods December cause rainfall record deaths Wikipedia" | https://en.wikipedia.org/wiki/2015_South_India_floods（州政府最終集計421人、2015年11月1,049mm・1918年11月1,088mm以来の記録を確認） |
| 日本人会 | チェンナイ日本人会(chennai-nihonjinkai.com) | ✅ | "チェンナイ 日本人学校 日本人会" | https://www.chennai-nihonjinkai.com/ |
| 補習校 | チェンナイ補習授業校、1975年創立、American International School Chennai内(タラマニ)、2025年度に開校50周年 | ✅ | "チェンナイ 日本人学校 日本人会" / "Chennai Hoshuko history location students" | https://www.jschoolchennai.com/（1975年創立、AISC内・タラマニ所在、2025年度50周年を確認） |
| 日本語グロサリー | 実店舗を確認できず | ❌（削除） | "Chennai Japanese grocery store 日本食料品店 日系スーパー" | "Akasaka"はレストラン・冷凍シーフード卸業者・グロサリーの3つの business categorization が混在し実態を一意に特定できず、公式サイト(akasakastores.com)も名前解決不可のため`groceries`は空配列とした |
| 日系自動車企業 | ルノー・日産アライアンス初の専用工場(オラガダム、2008年設立・600エーカー・2010年生産開始)、2025年8月にルノーが日産保有分51%を追加取得し完全子会社化(日産車生産は継続)、ヤマハがヴァラム・ヴァダガルに3番目のインド工場を2015年開設(177エーカー) | ✅ | "Chennai Japanese companies automotive cluster Nissan Yamaha Oragadam Sriperumbudur" / "Renault Nissan India joint venture stake change 2025 Chennai plant ownership 51%" / "Yamaha Motor India Vallam Vadakkal Chennai plant capacity established" | https://www.renaultgroup.com/en/group/locations/chennai-plant/（2008年設立・600エーカー）／ https://industrywired.com/news/renault-acquires-51-stake-in-nissans-india-jv-gains-full-control-of-chennai-plant-by-2025-8914058（2025年8月にルノーが完全子会社化、日産車生産は継続） ／ https://www.bikewale.com/news/yamaha-inaugurates-its-third-manufacturing-plant-in-tamil-nadu/（2015年、177エーカー） |
| 自動車回廊シェア | 60kmの自動車回廊全体でインドの四輪車生産の約30%、部品生産の約35%を占める | ✅ | "Chennai" automotive corridor "30%" four-wheeler "35%" components India share | https://en.wikipedia.org/wiki/Automotive_industry_in_Chennai（同数値を確認、回廊はグミディプンディ〜マライマライナガルの60km、オラガダムが中核と明記） |
| JETRO | チェンナイ事務所はアンナ・サライのセシャチャラム・センターに所在 | ✅ | "JETRO チェンナイ事務所 所在地 開設 2012" | https://www.jetro.go.jp/jetro/overseas/in_chennai/（Seshachalam Centre 8F, 636/1 Anna Salai, Nandanamと明記） |

## チェンナイ（第2パス、執筆者自身による別クエリでの独立再検証）

上記の表は第1パスのセルフチェック。以下は第1パスと異なる検索クエリを用いて、特に確信度の低かった項目（Chennai Metroのブルーラインの距離・駅数の食い違い、Gleneagles Global Health Cityの開業年、日本語グロサリー、2015年洪水の死者数）を再検証した記録。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 域内交通 | チェンナイ・メトロ、ブルーライン32.65km・26駅 | ✅（他ソースで32.15km・25駅という食い違いがあったためWikipedia本文で直接再確認） | "Chennai Metro network length km stations December 2025 total operational" ＋ Wikipedia本文直接取得 | https://en.wikipedia.org/wiki/Blue_Line_(Chennai_Metro)（本文に32.65km・26 operational stationsと明記。他の二次サイトの32.15km/25駅という数字は不採用とし、一次的なWikipedia本文の数値を採用） |
| 病院 | Gleneagles Global Health City、Global Hospitals Groupが2008年にベンガルール・チェンナイ・ムンバイで三次医療センターを開設 | ✅ | ""Global Hospitals" Chennai Perumbakkam opened year history founded Ravindranath" | https://www.ketto.org/blog/global-hospital-chennai（「Global Hospitals expanded its presence in 2008 with the opening of tertiary care centres in Bengaluru, Chennai, and Mumbai」と明記） |
| 病院 | MIOT International、年間約3,500人(全患者の25%)の外国人患者 | ✅ | "MIOT International Chennai "3,500" foreign patients OR "25%" international IASIOS accreditation" | 複数の病院紹介サイトで同数値を再確認。IASIOS認定(2025年6月取得)はdata.tsには記載していないため矛盾なし |
| 工芸 | カーンチープラム・シルクサリー2005〜06年GI登録 | ✅ | "Kanchipuram silk saree geographical indication registered "2005" OR "2006" official" | 複数の公式・準公式ソース(カーンチープラム県庁サイト含む)で2005年出願・2005〜06年登録を再確認 |
| 祭事 | マルガリ音楽祭、2004〜05年シーズンに1,200件超の演目・約600人の演者 | ✅ | "Madras Music Season 2004-05 statistics 1200 performances 600 artists sabhas" | Wikipedia本文で同数値を再確認（1927年創設、2004〜05年の統計として記載されていることも確認、他年度の数値と取り違えていないことを確認） |
| 料理 | アンジャッパル、1964年ロイヤペッタ創業、M.G.ラーマチャンドランの後押し | ✅ | "Anjappar Chettinad Restaurant Wikipedia founded 1964 M G Ramachandran Royapettah" | https://en.wikipedia.org/wiki/Anjappar_Chettinad_Restaurant（同事実を再確認） |
| 治安 | 北チェンナイ(ロヤプラム・ワシャーマンペット・ペランブール)は夜間回避、パリーズ・コーナー/バーマ・バザールはスリ注意 | ✅ | "Chennai crime areas avoid Royapuram Washermanpet Perambur safety report tourists foreigners" | 前回と同旨の複数サイトを異なるクエリで再確認 |
| モンスーン影響 | 2015年洪水、州政府最終集計421人死亡(10月28日〜12月31日、2016年1月発表) | ✅（現地警察報告ではチェンナイ地域だけで500人超という上振れ推計もあるが、data.tsは州政府の確定値のみを記載しており「ピークを平均と誤記」のような取り違えはない） | ""2015 South India floods" Tamil Nadu death toll 421 government final report" | https://en.wikipedia.org/wiki/2015_South_India_floods（州政府確定値421人と、警察報告ベースの500人超という2系統の数字を確認。data.tsは前者のみを州政府の確定値として明記しており誤記ではない） |
| 補習校 | チェンナイ補習授業校、1975年創立、2025年度に50周年 | ✅ | "Chennai Hoshuko 補習授業校 50周年 2025年度 生徒数 沿革" | https://www.jschoolchennai.com/（1975年創立、2025年度〔令和7年度〕が50周年と再確認。生徒数(76名+14名=90名)はdata.tsに記載していないため矛盾なし） |
| 日本語グロサリー | "Akasaka"は実態不明のため空配列とした判断の再検証 | ✅（削除判断を維持） | "Akasaka Convenience Stores Thiruvanmiyur Chennai Japanese Zomato menu open" / ""Akasaka" Chennai Japanese grocery items sell 日本食品 販売" | Zomatoでは日本食レストランとして掲載される一方、Justdialには冷凍シーフード卸業者としての別法人登録もあり、akasakastores.comは名前解決不可。単一の実態を持つグロサリー店舗として確認できないため、`groceries`を空配列とする第1パスの判断を維持 |
| 日系自動車企業 | ルノー・日産オラガダム工場2008年設立・600エーカー、2025年8月ルノー完全子会社化 | ✅ | "Renault Nissan Chennai plant Oragadam incorporated 2008 first Alliance plant production capacity" | https://www.renaultgroup.com/en/group/locations/chennai-plant/ ／ https://bwautoworld.com/article/renault-completes-acquisition-of-nissans-stake-in-chennai-plant-bets-big-on-india-565937（2025年8月1日付で完全子会社化を発表、R&Dセンターは引き続き日産とのJVで日産車の生産も継続と明記） |

修正・削除は日本語グロサリー1件（実店舗を特定できず空配列を維持）のみ。Chennai Metroブルーラインの距離・駅数は二次サイト間で32.65km/26駅と32.15km/25駅の食い違いがあったが、Wikipedia本文の一次的な記載（32.65km/26駅）を採用し、data.tsの記述と一致することを確認した。2015年洪水の死者数は「州政府確定値421人」と「警察報告ベースの500人超」の2系統があるが、data.tsは前者のみを明記しており、他都市で発見されたような「ピークを平均と誤記」型の混同はない。`bestMonths`/`avoidMonths`はclimate.tsの数値のみに基づき、両パスとも変更していない。


## チェンナイ（Chennai）第3パス — 独立ファクトチェック（2026-07-10）

先行する2パス（本ファイル上部）とは別セッション・別クエリで、`slug: "chennai"` の全項目をゼロから再検証した記録。task-10-report.md は未参照（冷静な独立検証のため）。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 病院 | Apollo Hospitals（グリームズ・ロード）1983年開業、インド初の民間総合病院 | ✅ | "Apollo Hospitals Greams Road Chennai founded 1983 first private hospital India JCI accreditation 2024" | https://en.wikipedia.org/wiki/Apollo_Hospitals ／ https://www.apollohospitals.com/hospitals/apollo-hospitals-greams-road-chennai（1983年設立、インド初の民間（corporate）医療機関という定説を確認） |
| 病院 | Apollo、2006年からJCI認定を継続取得、2024年3月に7回目の再認定 | ✅ | "Apollo Hospitals Chennai JCI accreditation since 2005 OR 2006 reaccredited 2024" | https://medicalbuyer.co.in/apollo-hospitals-group-receives-seventh-jci-accreditation-in-a-row/ ／ https://medicaldialogues.in/news/health/hospital-diagnostics/apollo-hospitals-group-bags-seventh-consecutive-jci-accreditation-127697（チェンナイのJCI取得は2006年開始、2024年3月に7回目の再認定と一致） |
| 病院 | Apollo、国際患者向けに通訳手配・ビザ支援の窓口 | ✅ | "Apollo Hospitals Chennai international patients interpreter visa assistance services" | https://www.apollohospitals.com/international-patient-services（通訳・医療ビザ招聘状発行・空港送迎等の一式を確認） |
| 病院 | MIOT International（マナパッカム）1999年2月開業 | ✅ | "MIOT International Manapakkam Chennai hospital founded 1999 international patients percentage" | https://en.wikipedia.org/wiki/MIOT_International_Hospital（1999年2月開業と一致） |
| 病院 | MIOT、年間約3,500人(全患者の約25%)の外国人患者、空港送迎の無料手配 | ✅ | "MIOT International Chennai international patients free airport pickup interpreter services" | https://www.miotinternational.com/ipc-2/（3,500人/25%の数値と無料空港送迎を確認） |
| 病院 | MIOT、NABH・NABL認定 | ✅ | "MIOT International Chennai NABH NABL accreditation" | https://www.miotinternational.com/corporate/accreditations/（NABH第5版認証、有効期限2025/2/18〜2029/2/17を確認） |
| 病院 | Gleneagles Global Health City（ペルンバッカム）2008年開業、21エーカー | ✅ | ""Gleneagles Global Health City" Chennai history established year hospital "2008"" | https://www.gleneagleshospitals.co.in/chennai/perumbakkam（21エーカーの敷地と一致。開業年はグループが2008年にベンガルール・チェンナイ・ムンバイで三次医療センターを開設した旨の複数ソースで裏付け） |
| 病院 | Gleneagles、JCI・NABH・NABL認定、通訳手配の窓口 | ✅ | "Gleneagles Global Health City Chennai international patients interpreter language assistance" | https://www.gleneagleshospitals.co.in/international（NABH/NABL/JCIとアラビア語・ロシア語等の通訳手配を確認） |
| 病院（日本語対応） | いずれの病院も日本語対応スタッフ常駐の確証なし（断定を避ける注記） | ✅（誠実な留保であり削除対象のヘッジではない） | 上記各病院検索の過程で日本語対応の明記は見つからず | — |
| 日本人会 | チェンナイ日本人会（chennai-nihonjinkai.com） | ✅ | "チェンナイ日本人会 chennai-nihonjinkai.com" | https://www.chennai-nihonjinkai.com/ |
| 補習校 | チェンナイ補習授業校、タラマニのAmerican International School Chennai内、2025年度に開校50周年 | ✅ | "チェンナイ補習授業校 タラマニ American International School Chennai 開校 周年" ／ "チェンナイ日本人会 タラマニ 補習授業校 開校50周年 2025" | https://www.jschoolchennai.com/（1975年6月創立「マドラス日本語補習教室」→1998年4月改称、令和7年度=2025年度が50周年で生徒数90名と一致） |
| エリア | Adyar・Besant Nagar・OMR（IT・自動車部品企業回廊）が駐在員向け高級エリア | ✅ | "Chennai Adyar Besant Nagar 2BHK rent expat monthly USD 2026" ／ "OMR Sholinganallur Chennai 2BHK rent expat IT corridor monthly" | https://www.squareyards.com/blog/cost-of-living-in-chennai（Adyar/Besant Nagarをベンガル湾沿いの高級住宅地、OMRをIT回廊と紹介する複数の独立ソースで一致） |
| 家賃 | 2BHK（Adyar・Besant Nagar、駐在員向け）$260〜520/月 | ✅ | 同上 | 99acres/NoBroker等でBesant Nagarの2BHKが月₹25,000〜175,000（プレミアム海沿い物件は₹40,000〜65,000）と一致するレンジ |
| 家賃 | 2BHK（OMR・Sholinganallur、駐在員向け）$260〜630/月 | ✅ | 同上 | 99acres等でOMRの2BHKが月₹14,200〜96,550のレンジと一致 |
| 直行便 | チェンナイ発着の日本直行便なし（2026年時点）、デリー・ムンバイ・ベンガルール経由が一般的 | ✅ | "Chennai Delhi Mumbai Bengaluru direct flight Japan ANA JAL 2026 no direct flight" | ANA/JAL公式サイトほか複数ソースでデリー・ムンバイ・ベンガルールに直行便、チェンナイには直行便なしと一致 |
| 空港アクセス | MAAからAdyar約15〜35分、Besant Nagar約15〜20分、OMR/Sholinganallur渋滞時45〜60分 | ✅ | "Chennai airport to Adyar Besant Nagar OMR Sholinganallur drive time minutes distance" | 複数の距離・所要時間サイトでオフピーク22〜34分、ピーク時45〜60分という数値と整合 |
| 空港拡張 | 2026年11月末完了目標の第3ターミナル含む拡張工事(フェーズII) | ✅ | "Chennai airport terminal 3 expansion phase 2 completion November 2026" | https://www.dtnext.in/news/chennai/chennai-airports-3rd-terminal-to-be-fully-operational-by-november-2026-centre-855382（民間航空担当閣外大臣の答弁として2026年11月完了目標を確認。一部報道は遅延で2026年末〜2027年初めともするが、"目標"という記述と矛盾しない） |
| 域内交通 | チェンナイ・メトロ ブルーライン(空港〜ウィムコナガル、32.65km・26駅)、グリーンライン(セントラル〜セント・トーマス・マウント、22km・17駅)、2025年12月時点で総延長54.1km | ✅ | "Chennai Metro total network length December 2025 54.1 km Green Line 17 stations" | https://en.wikipedia.org/wiki/Blue_Line_(Chennai_Metro) ／ https://en.wikipedia.org/wiki/Green_Line_(Chennai_Metro)（全数値が一致） |
| 治安 | 北チェンナイのロヤプラム・ワシャーマンペット・ヴィヤーサルパーディは夜間の単独行動を避けたい | ✅ | "Chennai Royapuram Washermanpet Vyasarpadi Perambur safety crime avoid night" | https://travel.india.com/guide/destination/discover-the-blacklisted-areas-in-chennai-you-shouldnt-dare-to-explore-7003391/ ほか複数ソースでRoyapuram・Washermanpetの治安不安を確認、Vyasarpadiも窃盗・暴力の多さを個別に確認 |
| 治安 | （既存文言にあった）ペランブール(Perambur)を同リストに含める記述 | ⚠️ 修正（削除） | "Perambur Chennai neighborhood safety crime area reputation" ／ ""Perambur" Chennai "dangerous" OR "avoid" OR "unsafe" area list blacklisted"" | 「危険エリア」を列挙する独立記事(travel.india.com等)はRoyapuram/Washermanpetを名指しする一方Peramburには言及せず。Perambur単体の評判調査では「低犯罪率」「安全な住宅地」という評価が複数の不動産サイト(99acres, squareyards, sprindia)で優勢。一部の検索結果は夜間回避を示唆したが出典が特定できず根拠薄弱と判断し、data.tsのsafetyNoteからPeramburの記載を削除した（注: 本ファイル上部の先行2パスでは同項目を確認済としていたが、本パスでは独立に再検証した結果、判断を変更） |
| 治安 | George Town（パリーズ・コーナー、バーマ・バザール）でのスリ・置き引き注意 | ✅ | "George Town Chennai Parrys Corner Burma Bazaar pickpocket theft crowded market" | https://en.wikipedia.org/wiki/Burma_Bazaar（混雑した市場・スマホ窃盗の多発地帯という記述を確認） |
| 気候・洪水 | 2015年11〜12月のタミル・ナードゥ州洪水、州政府最終集計(2016年1月)で421人死亡(10月28日〜12月31日) | ✅ | "Tamil Nadu floods 2015 death toll 421 October December final tally January 2016" | https://www.thenewsminute.com/article/how-many-lives-have-been-lost-tamil-nadu-floods-36721（2016年1月の州政府最終発表として421人・10/28〜12/31の期間を確認） |
| 気候 | 2015年11月の月間降水量1,049mm、1918年11月(1,088mm)以来の記録的多さ | ✅ | "Chennai November 2015 rainfall 1049mm record since 1918 1088mm" | https://www.downtoearth.org.in/climate-change/chennai-may-break-its-own-record-for-november-rainfall-80169（1918年1,088.4mmが史上最多、2015年1,049mmが史上2位という数値と一致） |
| 工芸 | カーンチープラム・シルクサリー、チェンナイから約70km、2005〜06年GI登録 | ✅ | "Kanchipuram silk saree GI registration 2005 2006 geographical indication" | https://kancheepuram.nic.in/about-district/gi-tag-product-kancheevaram-silks-and-sarees/（2005年出願・2005〜06年公式登録を確認） |
| 工芸 | ナリ・チンナサミ・チェッティが1928年にT・ナガルでNalli Silksを創業、Usman Road沿い | ✅ | "Nalli Silks founder Nalli Chinnasami Chetty 1928 T Nagar Usman Road history" | https://en.wikipedia.org/wiki/Nalli_(wardrobe_store)（1928年T Nagar創業を確認）／ https://www.mappls.com/2l2gji（本店住所100, N Usman Road, T Nagarを確認） |
| 料理 | アンジャッパル、1964年チェンナイ・ロイヤペッタ創業 | ✅ | "Anjappar restaurant founded 1964 Royapettah Chennai Chettinad cuisine history" | https://en.wikipedia.org/wiki/Anjappar_Chettinad_Restaurant（1964年Royapettah創業を確認） |
| 祭事 | マドラス・ミュージック・アカデミー1927年設立、2004〜05年シーズンに約600人の演者・1,200件超の演目 | ✅ | "Madras Music Academy 1927 Margazhi music season sabhas 2004-05 season 600 performers 1200 events" | https://en.wikipedia.org/wiki/Madras_Music_Season（"In 2004–2005, there were over 1200 performances by about 600 artists" と完全一致） |
| 祭事 | （既存文言にあった）2004〜05年シーズンが「約20のサバー」で開催されたという記述 | ❌ 削除（未確認） | ""Madras Music Season" 2004-2005 sabhas number "twenty" OR "20"" ／ Wikipedia本文直接取得 | Wikipedia本文を直接取得し確認したが、2004〜05年シーズンの演者数・演目数の統計にサバー数への言及はなく、他のどのソースにも「約20」という数値の裏付けが見つからなかったため削除 |
| 自動車 | ルノー・日産オラガダム工場、世界初の専用生産拠点、2008年設立・600エーカー、2010年生産開始 | ✅ | "Renault Nissan Oragadam plant 2008 600 acres production started 2010 world's first exclusive" | https://www.renaultgroup.com/en/group/locations/chennai-plant/（"first dedicated Alliance plant globally"、2008年8月26日起工、600エーカー、2010年5月量産開始を確認） |
| 自動車 | 2025年8月にルノーが日産保有分51%を追加取得し完全子会社化、日産車の生産は継続 | ✅ | "Renault Nissan India August 2025 Renault acquires Nissan 51% stake Oragadam wholly owned subsidiary" | https://media.renaultgroup.com/renault-group-strengthens-its-presence-in-india-to-support-its-international-ambitions/（2025年8月1日付でルノーが日産の残り51%を取得し完全子会社化、日産は引き続き同工場から供給を受けると明記） |
| 自動車 | ヤマハがチェンナイ近郊ヴァラム・ヴァダガルに3番目のインド工場を2015年開設 | ✅ | "Yamaha Vallam Vadagal Chennai third India plant 2015" | https://www.autocarpro.in/news-national/yamaha-motor-wheeler-plant-tamil-nadu-india-9234（2015年9月開設、インド国内3番目の工場と一致） |
| 自動車 | 60kmの自動車回廊全体でインドの四輪車生産の約30%、自動車部品生産の約35%を占める | ✅ | "Chennai automotive corridor 30% four-wheeler production 35% auto components India" | https://en.wikipedia.org/wiki/Automotive_industry_in_Chennai（"forms the base of 30% of India's automobile industry and 35% of its automobile component industry"と一致） |
| JETRO | ジェトロ・チェンナイ事務所がアンナ・サライ所在 | ✅ | "JETRO チェンナイ事務所 アンナ・サライ Anna Salai" | https://www.jetro.go.jp/jetro/overseas/in_chennai/map.html（Seshachalam Centre 8F, 636/1 Anna Salai, Nandanamを確認） |
| GDP/人口（参考） | pop: 1,170万、gdp: $840億（本パスのチェック対象チェックリスト外の基礎メタデータのため未変更） | ⚠️（要検討・未修正） | "Chennai metropolitan area population 2024 11.7 million" ／ "Chennai metropolitan area GDP billion 2024 2025 fourth largest India economy" | 人口(1,170万)はチェンナイ都市圏の複数推計(12.1〜12.6M)とほぼ整合。GDP($840億)は現行の複数推計($103B〜$143B、2023-25年)より明確に低い。ただし他都市(Pune/Hyderabad/Ahmedabad/Kolkata)のgdpフィールドも同様の一貫した(おそらく古い基準年の)データソースに基づく可能性があり、本タスクの対象（living/specialties/climate配下の固有名詞・数値）外のトップレベル項目のため今回は変更していない。別途の統一的な見直しを推奨 |

### 変更サマリー（第3パス）
- ❌ 削除: マルガリ音楽祭ノートの「約20のサバーで」（未確認のため削除、確認済みの「約600人の演者による1,200件超の演目」は維持）
- ⚠️ 修正: safetyNoteから「ペランブール(Perambur)」を削除（危険エリア一覧記事に不掲載、個別レビューでは安全な住宅地との評価が優勢という矛盾する根拠に基づく）
- ✅ 上記以外の全項目（病院3件の開業年・認証・国際患者対応、日本人会・補習校、家賃、直行便、空港アクセス・拡張、メトロ路線データ、治安（Perambur以外）、2015年洪水・11月降水量、特産3件（チェッティナード料理／カーンチープラム・シルク／マルガリ音楽祭の確認済み部分）、自動車クラスター（ルノー日産・ヤマハ・回廊シェア）、JETRO所在地）は独立クエリで再確認済み

## プネ（Pune）第1パス（執筆者自身によるセルフチェック）

`lib/cities/data.ts` の `pune` エントリに記載した固有名詞・数値の検証記録。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 直行便 | プネ発着の日本直行便は現状なし | ✅ | "Pune airport direct flight Japan Tokyo Narita Haneda" | https://www.flightroutes.com/PNQ-NRT ／ https://www.rome2rio.com/s/Pune/Japan（いずれもPNQ-NRT/HND間に直行便なし、デリー・ムンバイ・ベンガルール経由の乗継が一般的と一致） |
| ムンバイ経由 | ムンバイ(CSMIA)〜プネ市街は陸路約150km、ヤシュワントラオ・チャヴァン(ムンバイ・プネ)高速道路経由で好条件下2〜2.5時間、渋滞時3時間超 | ✅ | "Pune Mumbai airport distance drive time train" ／ "Pune Mumbai expressway drive time hours traffic Yashwantrao Chavan" | https://www.yatra.com/distance-between/distance-from-pune-to-mumbai.html（148km）／ https://orbitmiles.in/blogs/mumbai-pune-expressway-best-time-to-travel/（高速道路利用で2〜2.5時間に短縮、金曜・日曜夕方は渋滞、モンスーン期は+30〜45分と明記） |
| ミサル | プネリ・ミサルはゴダ・マサラを使い、カレー(カット)を具材と別添えで供す | ✅ | "Pune famous food misal pav specialty history origin" ／ "Puneri misal style spicy characteristics distinct from other misal" | https://en.wikipedia.org/wiki/Puneri_misal（独立記事として存在、goda masala・別添え提供の特徴を確認） |
| ミサル（老舗） | ヴァイディヤ・ウパハル・グルハが1910年代創業 | ✅（1910/1912/1914年説が併存するため「1910年代」に丸めて記載） | "Vaidya Upahar Gruha Pune misal 1910 history oldest" | https://www.mypunepulse.com/vaidya-upahar-gruha-a-113-year-journey-of-perfecting-punes-classic-misal-pav/ ／ https://socialmaharaj.com/2023/11/02/vaidya-upahar-gruh-pune/（複数サイトで1910〜1914年の間で表記揺れがあり、確定できる範囲として「1910年代」を採用） |
| 工芸 | タンバット・アリの銅細工、サワーイー・マーダヴラーオ期(1774〜1795年)にコンカン地方から移住した銅細工師(タンバット)の職人街 | ✅ | "Pune traditional craft Bohri Ali brass Tulshibaug handicraft" ／ "Tulshibaug Peshwa era coppersmith Kasar brass craft 18th century Pune history" | https://kevinstandagephotography.wordpress.com/2022/04/23/tambat-ali-the-coppersmiths-of-pune/（サワーイー・マーダヴラーオ治世に移住と明記。「約400年」という別の言及もあったが年代が矛盾するため採用せず） |
| 祭事 | ダグドゥシェート・ハルワーイー・ガナパティ、1893年2月19日にティラクが開眼式を主宰、サルヴァジャニック(公共)祭への転換点 | ✅ | "Pune Ganeshotsav history Lokmanya Tilak 1893 public festival origin Dagdusheth" | https://newspatron.com/dagdusheth-halwai-ganpati-pune/ ／ https://zeezest.com/culture/how-death-and-devotion-created-pune-s-iconic-dagdusheth-halwai-ganpati-4247（開眼式の日付・主宰者が一致） |
| 土産 | チタレー・バンドゥ、1950年バジラーオ・ロード創業、1970年からバクルワディ販売、当初1日200kg→現在約3,000kg/日 | ✅ | "Chitale Bandhu Mithaiwale Bakarwadi Pune history founded year" | https://en.wikipedia.org/wiki/Chitale_Bandhu_Mithaiwale（創業年・バクルワディ発売年・生産量の推移が一致） |
| 病院 | Noble Hospitals and Research Centre（ハダプサル）、2023年11月JCI認定、プネ初の三次医療機関JCI・州10番目 | ✅ | "Pune hospitals international patients JCI accreditation" | https://medicalbuyer.co.in/noble-hrc-pune-bags-jci-accreditation/ |
| 病院 | Ruby Hall Clinic（サッスーン・ロード）、1959年4床の診療所として開業、現在約600床、NABH・NABL認定 | ✅ | "Ruby Hall Clinic Pune Noble Hospital international patients accreditation" | https://rubyhall.com/（国際患者向けサービスを確認）／ https://tgine.com/about-ruby-hall-clinic.php（1959年開業を確認） |
| 病院 | Jehangir Hospital（サッスーン・ロード）、1946年開業、350床、2013年NABH認定、国際患者窓口 | ✅ | "Jehangir Hospital Pune international patients accreditation NABH" | https://www.jehangirhospital.com/about-us/ |
| エリア | Koregaon Park・Kalyani Nagarが駐在員向け人気エリア、空港から車で20〜35分 | ✅ | "Pune expat neighborhoods Koregaon Park rent" ／ "Pune airport PNQ Lohegaon to Koregaon Park Kalyani Nagar drive time minutes" | https://bhatnagars.co.in/top-expat-property-location-in-pune-to-invest-in-bhatnagars-real-estate/ ／ https://www.rome2rio.com/s/Pune-Airport-PNQ/Koregaon-Park |
| 家賃 | 2BHK（Koregaon Park、駐在員向け）$300〜650/月 | ✅ | "Koregaon Park 2BHK rent per month rupees 2026" | https://www.99acres.com/2-bhk-flats-for-rent-in-koregaon-park-pune-ffid（₹22,000〜80,000/月のレンジ内。claim値はこのレンジの中位〜上位に位置） |
| 家賃 | 2BHK（Kalyani Nagar、駐在員向け）$300〜550/月 | ✅ | "Kalyani Nagar 2BHK rent per month rupees 2026" | https://www.99acres.com/2-bhk-flats-for-rent-in-kalyani-nagar-pune-ffid（₹22,000〜75,000/月のレンジ内。claim値はこのレンジの中位に位置） |
| 為替換算 | USD/INR ≈ 95.5（ムンバイ・デリー案件と同時点のレートを再使用） | ✅ | ムンバイ・デリー首都圏エントリのファクトチェック時に確認済み | https://www.exchangerates.org.uk/USD-INR-spot-exchange-rates-history-2026.html |
| メトロ | プネメトロ、パープルライン(PCMCバワン〜スワルゲート、17.4km・12駅)とアクアライン(ヴァナズ〜ラームワディ、15.7km・16駅)、2022年3月開業 | ✅ | "Pune Metro lines status 2026 operational length" | https://en.wikipedia.org/wiki/Pune_Metro（別ソースでは17.5km/14駅という表記もあったが、Wikipedia本文の一次記載を採用） |
| 通勤 | 自動車工業団地チャカン(Chakan MIDC)までKoregaon Parkから車で約30〜40分 | ✅ | "Koregaon Park Chakan MIDC drive time minutes commute" | https://www.rome2rio.com/s/Koregaon-Park/Ch%C4%81kan（30〜38分の複数推計） |
| モンスーン | 6〜9月はプネ市警察が指定する市内26カ所の冠水多発地点で道路冠水・渋滞が発生 | ✅ | "Pune traffic congestion monsoon waterlogging flooding rainy season problem" | https://www.mypunepulse.com/pune-traffic-police-flag-26-waterlogging-hotspots-ahead-of-peak-monsoon-seek-pmcs-urgent-intervention/ |
| 日本人会 | プネ日本人会（punejapan.com、2025年12月にpune-japan.comから移転） | ✅ | "プネ 日本人会 日本人学校" ／ "\"pune-japan.com\" プネ日本人会 概要 設立" | https://www.punejapan.com/（旧pune-japan.comは第三者によるなりすましサイトとして注意喚起されている旨を本文で確認） |
| 日本人会（理事会企業） | 川崎重工(インドカワサキモータース)・矢崎(Yazaki India)・エンケイホイールズ・JFE商事スチールインディア・三菱電機インディア・ニプロインディア・オリエンタル酵母インディア・ブリヂストンインディア・ヤマザキマザックインディア・タタオートコンプGYバッテリーズが理事会企業として掲載 | ✅ | プネ日本人会公式サイトを直接取得 | https://www.punejapan.com/rijikai |
| 補習校・日本語グロサリー | プネに補習授業校・特定グロサリー店舗の存在は確認できず | ✅（未確認のため空配列を採用） | "Pune Japanese school hoshuko 補習校 日本食料品店" | 検索結果に該当情報なし。`schools`／`groceries` は空配列とした |
| JETRO | プネ単独のJETRO事務所は確認できず | ✅（未確認のため記載せず） | "JETRO プネ事務所 所在地" | ジェトロの拠点はニューデリー・ムンバイ・ベンガルール・チェンナイ・アーメダバードの5カ所のみで、プネ単独事務所は検索結果に見当たらなかったため`data.ts`には記載しなかった |
| 工作機械 | ヤマザキマザックが2023年3月からプネ近郊ランジャンガーオン工業団地(タルカ・シルール)で新工場の生産を開始、国内市場向け立形マシニングセンタ | ✅ | "Yamazaki Mazak India Pune plant OR Makino India Pune OR DMG Mori India Pune machine tool" ／ "Yamazaki Mazak Pune plant address Talegaon Chakan location" | https://seisanzai-japan.com/article/p3958/（2023年3月操業開始、VC-Ezシリーズ、月産40台）／ https://www.mazak.com/in-en/about-us/production-facilities/india/（ランジャンガーオン工業団地の住所を確認。当初想定していたチャカンではなくランジャンガーオンだったため記述を修正） |
| 自動車部品 | ブリヂストンが2013年2月開業のチャカン(MIDC)タイヤ工場、日立アステモもチャカン等にオフィス | ✅ | "Bridgestone Pune plant Hitachi Astemo Pune Japanese company location" | https://www.bridgestone.com/corporate/news/2013020501.html（公式プレスリリース、2013年2月5日開所式） ／ https://www.hitachiastemo.com/en/groups/asia/ |

## プネ（Pune）第2パス（執筆者自身による別クエリでの独立再検証）

上記の記述のうち特に確信度の低かった項目（治安、家賃レンジ、病院の開業年・認証、メトロの数値、ヤマザキマザックの所在地）について、第1パスと異なる言い回しのクエリで再検証した記録。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 治安 | Koregaon Park周辺は比較的治安が安定 | ✅ | "Pune Koregaon Park safety crime area avoid neighborhoods" | https://www.99acres.com/koregaon-park-pune-reviews-and-ratings-wrffid（低犯罪率・夜間の警備良好との住民評価を確認） |
| 治安（特定エリア回避） | 「Hadapsar・Pimpri-Chinchwadは避けるべき」という不動産系ブログの主張 | ❌ 削除（採用せず） | "Hadapsar Pune safety crime rate area" | https://www.sobha.com/blog/safest-areas-to-live-in-pune/（自社物件販促ブログが唯一の出典で、独立に再検索するとHadapsarは「治安良好・街灯整備・警邏あり」という真逆の評価（99acres系記事）が優勢だったため、特定エリアを名指しで「避けるべき」とする記述は`data.ts`に採用しなかった |
| 病院 | Noble Hospitals、2023年11月22日JCI認定、プネで唯一・初の三次医療JCI | ✅ | "Noble Hospitals Hadapsar Pune JCI accreditation tertiary care first" | https://healthcareeureka.in/noble-hospitals-and-research-centre-punes-first-jci-accredited-tertiary-care-centre-with-progressive-technology-and-compassionate-innovation/（日付・順位とも第1パスと一致） |
| 病院 | Ruby Hall Clinic、1959年開業（当初2床、後に4床）、600床規模 | ✅ | "Ruby Hall Clinic Pune Wikipedia founded 1959 four bed nursing home history" | https://en.wikipedia.org/wiki/Ruby_Hall_Clinic（創業者Keki Byramjee Grant、1959年、General David Sassoon所有の邸宅「Ruby Hall」で開業と一致） |
| 病院 | Jehangir Hospital、住所32 Sassoon Road | ✅ | "Jehangir Hospital Pune address Sassoon Road location" | https://www.mappls.com/place-jehangir+hospital-32+sassoon+road-near+railway+station-sangamvadi-pune-maharashtra-411001-AS6DBA |
| 病院 | Ruby Hall Clinic、住所40 Sassoon Road | ✅ | "Ruby Hall Clinic main hospital address Sassoon Road Pune" | https://www.mappls.com/pzcn44 |
| 家賃 | 2BHK（Koregaon Park）₹22,000〜80,000/月のレンジ | ✅（claim値は範囲内） | "Koregaon Park 2 BHK apartment rent Pune 2026 rupees range" | 複数の不動産サイト集計で同レンジを再確認 |
| 家賃 | 2BHK（Kalyani Nagar）₹22,000〜75,000/月のレンジ | ✅（claim値は範囲内） | "Kalyani Nagar 2 BHK apartment rent Pune 2026 rupees range" | 複数の不動産サイト集計で同レンジを再確認 |
| メトロ | 合計約33km・28駅、2022年3月開業 | ✅（別ソースでは17.5km/14駅の表記もあり微差あるが、Wikipedia一次記載と内部整合性のある17.4km/12駅を採用） | "Pune Metro Purple Line Aqua Line stations km Wikipedia" | https://en.wikipedia.org/wiki/Pune_Metro |
| 工作機械 | ヤマザキマザック新工場はランジャンガーオン工業団地(村カレガオン、タルカ・シルール)所在、空港から約1.5時間 | ✅ | "Yamazaki Mazak India Pune plant address Ranjangaon" | https://www.mazak.com/in-en/about-us/production-facilities/india/（住所・空港からの所要時間を確認。第1パス執筆時に想定していたチャカンではないことを確定） |
| ブリヂストン | チャカン工場、2013年2月5日開所式、投資額約2,600クロールルピー | ✅ | "Bridgestone India Chakan plant opening ceremony February 2013 tire" | https://www.autocarpro.in/feature/bridgestone-india-radial-tyre-plant-chakan-pune-3448 ／ https://www.business-standard.com/article/companies/bridgestone-begins-tyre-production-from-chakan-113020701096_1.html |
| モンスーン | 26カ所の冠水多発地点 | ✅ | "Pune monsoon 2026 waterlogging spots traffic police list flood prone" | https://www.modernforce.com/traffic-police-identify-26-critical-waterlogging-locations-across-pune-city-share-data-with-pmc-for-corrective-measures/（同一の26カ所を独立記事でも確認） |
| 日本人会 | punejapan.com（旧pune-japan.com）、理事会企業リスト | ✅ | "punejapan.com プネ日本人会 理事会企業" | https://www.punejapan.com/rijikai（本文を直接取得し再確認） |

### 変更サマリー（プネ）
- ⚠️ 修正: ヤマザキマザックの新工場所在地を「チャカン」から正しい所在地「ランジャンガーオン工業団地」に訂正（第1パスの想定が誤りだったため第2パスで是正）
- ❌ 削除（不採用）: 「Hadapsar・Pimpri-Chinchwadは避けるべき」という不動産ブログ単独の主張（独立ソースで真逆の評価が優勢だったため safetyNote には特定エリアの「避けるべき」表現を含めなかった）
- ❌ 記載見送り: プネ単独のJETRO事務所、補習授業校、日本語グロサリー店舗（いずれも存在を確認できず、`data.ts`では省略または空配列とした）
- ✅ 上記以外の全項目（渡航適期の気候判断、ミサル・銅細工・ガネーショーツァヴ・バクルワディの特産4件、病院3件、家賃2件、メトロ、直行便なし・ムンバイ経由の実態、通勤・モンスーン情報、日本人会と理事会企業）は独立クエリで再確認済み
- `bestMonths`/`avoidMonths`はclimate.tsの数値（12〜2月が高温28.8〜31.8℃・低温15.1〜16.8℃・降水3〜10mmの快適期、4月が最高気温37.4℃、6〜9月が降水205〜281mmのモンスーン期）のみに基づき判断。11月は降水17mmと少ないがclimate.ts記載の値のみで11月を涼季と断定する根拠は薄いため、Mumbaiの判断パターン（11〜2月をbestMonths）を踏襲した

## プネ（Pune）第3パス — 独立ファクトチェック（2026-07-10）

先行する2パス（本ファイル上記）とは別セッション・別クエリで、`slug: "pune"` の全項目をゼロから再検証した記録。task-11-report.md は未参照（冷静な独立検証のため）。病院は各病院自身の公式サイトで、日本人会は現行の公式サイト(punejapan.com/rijikai)を直接取得して裏取りした。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 病院 | Noble Hospitals and Research Centre（ハダプサル）、2023年11月にJCI認定、プネの三次医療機関としては初、マハーラーシュトラ州で10番目 | ✅ | "Noble Hospitals Hadapsar Pune JCI accreditation 2023" | https://medicalbuyer.co.in/noble-hrc-pune-bags-jci-accreditation/ ／ https://www.punekarnews.in/punes-first-tertiary-care-hospital-achieves-jci-gold-seal-of-approval/（2023年11月22日、プネ初の三次医療JCI・州10番目の全要素が一致） |
| 病院 | Ruby Hall Clinic（サッスーン・ロード）、1959年に4床の診療所として開業、現在約600床規模、NABH・NABL認定、渡航・宿泊手配を含む国際患者サービス | ✅ | "Ruby Hall Clinic Pune founded 1959 beds history" ／ 公式サイト直接取得 | https://rubyhall.com/about-us/（病院公式サイトで「Starting as a four-bedded nursing home...expanded to a 600-bedded multi-speciality medical centre」「first nationally accredited...hold 9 NABH and NABL certifications」を確認。Wikipedia等は「2床」説も併存するが、病院自身の公式記述である「4床」を採用） ／ https://rubyhall.com/international-patients/（空港送迎、長期・短期滞在向け宿泊施設、航空券手配・ビザ延長支援を確認） |
| 病院 | Jehangir Hospital（サッスーン・ロード）、1946年開業、350床、2013年にNABH認定、外国人患者向け専用窓口 | ⚠️ 修正（「中東・アフリカなどから」を削除） | "Jehangir Hospital Pune 1946 NABH accreditation 2013" ／ 公式サイト直接取得 | https://www.jehangirhospital.com/about-us/（1946年2月6日開業、350床、NABH/NABL認定を確認）／ https://www.jehangirhospital.com/international-patients/（"Dedicated International Patient Services helpdesk"を確認したが、対応地域を「中東・アフリカ」等に限定する記述はなく「world中からの患者」という一般的表現のみだったため、地域を特定する記述を`data.ts`から削除） |
| 日本人会 | プネ日本人会（punejapan.com、2025年12月にpune-japan.comから移転） | ✅ | "プネ日本人会 punejapan.com" ／ 旧ドメインへの直接アクセス確認 | https://www.punejapan.com/（2025年12月の移転を複数ソースで確認）／ 旧pune-japan.comは名前解決不能(ENOTFOUND)で、移転が完了し旧ドメインが失効していることを確認 |
| 日本人会（理事会企業） | インドカワサキモータース・矢崎(Yazaki India)・エンケイホイールズ・JFE商事スチールインディア・三菱電機インディア・ニプロインディア | ✅ | プネ日本人会公式サイト(punejapan.com/rijikai)を直接取得 | https://www.punejapan.com/rijikai（2025年ボード名簿として、記載の6社すべてを含む10社の理事会企業リストを確認。ブリヂストンインディア・ヤマザキマザックインディア・オリエンタル酵母インディア・タタオートコンプGYバッテリーズも掲載されているが`data.ts`側は例示列挙のため問題なし） |
| 工作機械 | ヤマザキマザックが2023年3月からプネ近郊ランジャンガーオン工業団地の新工場で国内市場向け立形マシニングセンタの生産を開始 | ✅（執筆者が自己申告した「チャカンと迷った」点はランジャンガーオンが正しいと再確認） | "Yamazaki Mazak Pune plant location Ranjangaon Chakan" ／ "Yamazaki Mazak India Ranjangaon plant March 2023 vertical machining center production start" | https://www.mazak.com/in-en/news-media/news/india_factory_20230118/（2023年3月操業開始、国内市場向けVC Ez 410 IP／VC Ez 510 IPの生産開始と一致）／ https://www.mazak.com/in-en/about-us/production-facilities/india/（Plot No. A-100 MIDC, Ranjangaon Industrial Area, Village Karegaon, Taluka Shirurの住所を確認。チャカンではない） |
| 自動車部品 | ブリヂストンが2013年開業のタイヤ工場をチャカンに構え、日立アステモもチャカンおよび市内シヴァージーナガルにオフィスを置く | ✅ | "Bridgestone Pune tire plant Chakan 2013" ／ "Hitachi Astemo India Chakan Shivajinagar office Pune" | https://www.bridgestone.com/corporate/news/2013020501.html（2013年2月5日チャカン第2工場の開所式）／ Hitachi Astemo Chakanオフィス(Nighoje)とShivajinagarオフィス(Senapati Bapat Road, MCCIA Trade Towers)の両方の住所を確認 |
| メトロ | パープルライン(PCMCバワン〜スワルゲート、17.4km・14駅)、アクアライン(ヴァナズ〜ラームワディ、15.7km・16駅)、2022年3月開業 | ⚠️ 修正（パープルラインの駅数を「12駅」から「14駅」に訂正） | "Pune Metro Purple Line PCMC Swargate number of stations" ／ "Pune Metro 2025 total length km stations current network" | https://www.mypunepulse.com/pune-metro-purple-line-pcmc-to-swargate-route-station-list-travel-time-connectivity-whats-next/（2025年12月時点の一次記載で「17.4 km, 14 stations: 9 elevated, 5 underground」と明記）／ 先行2パスはWikipedia本文の「17.4km・12駅」表記を採用していたが、同じWikipedia記事内の別箇所や他の現行ソースでは一貫して14駅（9高架＋5地下）とされており、12駅は執筆者側の読み取り誤りと判断 |
| 直行便 | プネ発着の日本直行便はなく、羽田・成田からデリー・ムンバイ・ベンガルールなどでANA/JAL/エア・インディア便から国内線に乗り継ぐのが一般的 | ✅ | "Pune airport PNQ no direct international flights transfer Mumbai Delhi" ／ "ANA JAL Haneda Narita Mumbai Delhi Bengaluru flights India route 2026" | PNQに日本直行便なしを確認。JALが羽田-デリー・成田-ベンガルール・成田-デリー(2026年1月新規)、ANAが成田-ムンバイ(2026年3月から毎日)・羽田-デリーを運航しており、羽田・成田からデリー/ムンバイ/ベンガルールへの直行後、国内線でプネへ接続するルート構成と一致 |
| 空港アクセス | ムンバイ(CSMIA)からプネ市内へ陸路約150km、好条件下2〜2.5時間、金曜・日曜夕方は3時間超 | ✅ | "CSMIA Mumbai airport to Pune city distance km road" ／ "Mumbai Pune Expressway distance km travel time Yashwantrao Chavan" | 複数ソースでCSMIA-プネ間146〜159km（「約150km」と整合）、高速道路利用で通常2〜3時間との記載を確認 |
| モンスーン（高速道路） | モンスーン期(6〜9月)の高速道路遅延 | ⚠️ 修正（「さらに30〜45分の遅れ」という未確認の具体数値を、土砂崩れによる通行止め等の実際のリスクを反映した記述に置き換え） | "Mumbai Pune Expressway monsoon delay traffic jam extra time rain" | https://www.freepressjournal.in/pune/pune-mumbai-expressway-chaos-travellers-face-hours-long-delays-as-heavy-rain-landslides-disrupt-traffic（2026年7月、ムンバイ・プネ高速道路のミッシングリンク区間が土砂崩れで通行止めとなり、通常2〜3時間の行程が数時間規模まで延びた実例を確認。「+30〜45分」という先行パスの具体数値は独立ソースで裏付けられず、実際のリスクはそれを上回りうるため、具体的な分数を削除し閉鎖・大幅遅延リスクの注記に修正） |
| 域内交通・通勤 | 市内26カ所の冠水多発地点（プネ市警察指定）、チャカン(Chakan MIDC)まで市中心部/Koregaon Parkから車で約30〜40分 | ✅ | "Pune waterlogging flood prone spots police list 26 locations monsoon" ／ "Koregaon Park to Chakan MIDC drive time distance km" | https://www.mypunepulse.com/pune-traffic-police-flag-26-waterlogging-hotspots-ahead-of-peak-monsoon-seek-pmcs-urgent-intervention/（プネ交通警察が26カ所の冠水多発地点をPMCに提出、と完全一致）／ Koregaon Park-Chakan間は32〜38分との複数推計で「30〜40分」と整合 |
| エリア・家賃 | Koregaon Park・Kalyani Nagarは実在する駐在員向け高級エリア、2BHK Koregaon Park $300〜650/月、Kalyani Nagar $300〜550/月 | ✅ | "Koregaon Park Kalyani Nagar Pune expat expensive neighborhood rent" ／ "Pune 2BHK rent Koregaon Park Kalyani Nagar expat monthly rupees" | 複数の不動産サイトでKoregaon Park・Kalyani Nagarはプネ屈指の高級・駐在員向けエリアと一致。2BHK賃料はKoregaon Parkで₹22,000〜80,000超、Kalyani Nagarの実例で₹48,000程度が確認でき、claim値（$300〜650・$300〜550）はこのレンジ内に収まる |
| 治安 | Koregaon Park・Kalyani Nagar一帯は治安が安定した住宅地、混雑した市場・公共交通機関でのスリ・置き引きに注意 | ⚠️ 修正（「安定しているとされる」という未確認風のヘッジ表現を、複数の独立ソースで裏付けが取れたため「安定した住宅地」という直接表現に修正） | "Koregaon Park Pune safety crime pickpocket safe area" | 複数の不動産・治安レビューサイトでKoregaon Parkは低犯罪率・良好な夜間警備との評価が一致。混雑した市場・交通結節点でのスリ・置き引きリスクも一般的な注意喚起として確認 |
| 通勤（削除項目） | 「チャカン工業団地に勤務する駐在員もこの一帯に居住して通勤するケースが多い」 | ❌ 削除 | "Chakan MIDC industrial area Pune expat residence commute pattern" | Koregaon Park/Kalyani Nagar在住者のチャカン通勤比率・傾向を裏付ける一次資料は見つからず、執筆者の推測と判断されるため`data.ts`から削除 |
| 特産（ミサル） | プネリ・ミサル、1910年代創業のヴァイディヤ・ウパハル・グルハなど100年超の歴史を持つ専門店が複数現存 | ✅ | "Vaidya Upahar Griha Pune misal 1910s oldest" | https://www.mypunepulse.com/vaidya-upahar-gruha-a-113-year-journey-of-perfecting-punes-classic-misal-pav/（1910〜1914年で表記揺れがあるが「1910年代」の範囲内） |
| 特産（銅細工） | タンバット・アリ、サワーイー・マーダヴラーオ期(1774〜1795年)にコンカン地方から招かれた銅細工師の職人街 | ✅ | "Tambat Ali Pune copper craftsmen Peshwa history Sawai Madhavrao" | https://kevinstandagephotography.wordpress.com/2022/04/23/tambat-ali-the-coppersmiths-of-pune/（"during the rule of Sawai Madhavrao (1774–1795)"、コンカン地方出身との記述が完全一致） |
| 特産（祭事） | 1893年2月19日、ダグドゥシェート・ハルワーイーが亡き息子を悼み安置したガネーシャ神像の開眼式をティラクが主宰、サルヴァジャニック祭への転換点 | ✅ | "Sarvajanik Ganeshotsav 1893 Dagdusheth Halwai Tilak history" | 複数ソースで日付・経緯（息子の死・ティラクの主宰）が完全一致。なお1892年に別の人物(Bhausaheb Rangari)による先行例があったとする説も存在するが、`data.ts`の記述は「ティラクが開眼式を主宰した」という事実のみを主張しており矛盾しない |
| 特産（土産） | チタレー・バンドゥ・ミターイワーレー、1950年バジラーオ・ロード創業、1970年からバクルワディ発売、1日200kg→現在約3,000kg | ✅ | "Chitale Bandhu Mithaiwale Bakarwadi history 1950 1970" ／ "Chitale Bandhu Mithaiwale Bajirao Road Pune shop location" | https://www.chitalebandhu.in/pages/stores（バジラーオ・ロード店が創業1950年の旗艦1号店と確認）／ 1970年バクルワディ発売、当初1日200kg生産という記述と一致 |
| 参考（人口・GDP） | pop: 720万、gdp: $690億（本パスのチェック対象外の基礎メタデータ） | ✅（参考確認のみ、未変更） | "Pune metropolitan area population GDP 2025 million" ／ "Bajaj Auto Volkswagen Tata Motors plant Pune location" | 人口はMacrotrends等の2025年推計7.53Mとほぼ整合。GDPは公的な確定値を見つけられなかったが、プネがインド5位の都市経済規模である点と桁は整合。`note`欄のBajaj・Volkswagen・Tata Motorsは3社ともチャカン/ピンプリ周辺に実在する工場を確認 |

### 変更サマリー（第3パス）
- ⚠️ 修正: パープルラインの駅数を「12駅」→「14駅」に訂正（現行の一次資料で9高架+5地下=14駅と確認。先行2パスはWikipedia本文の読み取りを誤っていた）
- ⚠️ 修正: Jehangir Hospitalの国際患者窓口の記述から「中東・アフリカなどから」を削除（病院公式サイトが地域を特定していないため）
- ⚠️ 修正: モンスーン期のムンバイ・プネ高速道路の遅延について、未確認の「+30〜45分」という具体数値を、土砂崩れによる通行止め・大幅遅延という実際に確認できたリスクの記述に置き換え
- ⚠️ 修正: safetyNoteの「治安が安定しているとされるが」というヘッジ表現を、複数ソースで裏付けが取れたため「治安が安定した住宅地だが」という直接表現に修正
- ❌ 削除: 「チャカン工業団地に勤務する駐在員もこの一帯に居住して通勤するケースが多い」という一次資料で裏付けられない通勤パターンの主張
- ✅ 上記以外の全項目（病院3件のうちNoble/Ruby Hallの開業年・認証・国際患者対応、日本人会と理事会企業6社、ヤマザキマザックのランジャンガーオン所在地、ブリヂストン/日立アステモ、アクアラインの数値、直行便なしの実態、CSMIA経由の距離・所要時間、冠水地点26カ所とチャカン通勤時間、Koregaon Park/Kalyani Nagarの実在性と家賃レンジ、特産4件）は独立クエリ・病院公式サイト直接取得で再確認済み

## ハイデラバード（Hyderabad）第1パス（`WebSearch` による初回調査）

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 気候・渡航適期 | bestMonths: 11,12,1,2 / avoidMonths: 4,5,6,7,8,9 | ✅ | （`climate.ts`の数値のみ参照、WebSearch対象外） | ブリーフ記載の2015-2024 Open-Meteo平均（4-5月が最高気温36.5-37.1℃、6-9月が降水142-220mm、11-2月が28.2-31.3℃・降水3-17mmの快適期） |
| 特産（料理） | ハイデラバード・ビリヤニ、ニザーム宮廷起源の伝承、ダム・プフト技法、パラダイス(Paradise)1953年セカンダラーバード創業 | ✅ | "Hyderabadi biryani history origin Nizam Paradise Bawarchi" ／ "Paradise restaurant Hyderabad biryani founded year history Secunderabad" | https://en.wikipedia.org/wiki/Hyderabadi_biryani ／ https://www.zomato.com/hyderabad/paradise-biryani-a-legend-since-1953-begumpet（1953年創業を複数ソースで確認。「Nizamの料理人が考案」は伝承(folklore)であり史実確定ではない旨を明記） |
| 特産（工芸） | ポチャンパリー・イカット、ハイデラバード近郊約45km、2005年テランガナ州初のGI登録 | ✅ | "Pochampally Ikat GI tag Telangana Hyderabad craft history" | https://en.wikipedia.org/wiki/Pochampally_sari（GI登録2005年、州初のGI産品と一致） |
| 特産（祭事） | ボーナル祭、1813年疫病流行時の軍隊の祈願伝承、ゴルコンダ砦、ウッジャイニー・マハーカーリー寺院、2014年州祭指定 | ✅ | "Bonalu festival Hyderabad Golconda history Telangana" | https://en.wikipedia.org/wiki/Bonalu（1813年伝承・2014年州祭指定を確認。ただしKrishnadevaraya期の碑文にボーナル関連儀礼の記録があり19世紀起源説より古い可能性がある旨も確認したため、`data.ts`では「伝承がある」と表現し断定を避けた） |
| 特産（土産） | ハイデラバード・パール、「真珠の都」、1591年クトゥブ・シャーヒー朝、バスラなどペルシャ湾岸交易 | ✅ | "Hyderabad pearls city of pearls Nizam trade history" | https://en.wikipedia.org/wiki/Hyderabad（都市建設1591年）／ https://mangatrai.com/blogs/blog/the-history-of-hyderabad-pearls-a-legacy-of-nizams-and-maharajas |
| エリア | Gachibowli（IT・GCC集積地、HITECシティ隣接）、Jubilee Hills（高級住宅・商業エリア） | ✅ | "Hyderabad expat neighborhoods Gachibowli Banjara Hills rent" | https://www.sobha.com/blog/posh-areas-to-live-in-hyderabad/ ／ https://www.rentomojo.com/blog/posh-areas-in-hyderabad/ |
| 家賃 | 2BHK（Gachibowli）$260〜630/月、2BHK（Jubilee Hills）$280〜580/月 | ✅ | "Gachibowli 2BHK rent per month rupees 2026" ／ "Jubilee Hills Banjara Hills 2BHK rent per month rupees 2026" | 99acres/squareyards等の集計で₹25,000〜60,000（Gachibowli）、₹26,000〜55,000（Jubilee Hills）のレンジを確認。USD/INR≈95.5で換算 |
| 為替換算 | USD/INR ≈ 95.5 | ✅ | "USD INR exchange rate July 2026" | https://www.exchangerates.org.uk/USD-INR-spot-exchange-rates-history-2026.html（2026年7月上旬95.2〜95.6で推移） |
| 病院 | Apollo Hospitals（ジュビリーヒルズ）1988年開業、550床、JCI・NABH・NABL認定、2024年3月7回目のJCI再認証 | ✅ | "Apollo Hospitals Jubilee Hills Hyderabad JCI accreditation founded international patients" ／ "\"Apollo Health City\" OR \"Apollo Hospitals\" Jubilee Hills JCI reaccredited news 2024 2025" | 複数の第三者集約サイトで1988年・550床が一致。2024年3月の7回目JCI再認証はApollo公式ニュースページのタイトルから確認（公式ページ本体は403で直接取得できず） |
| 病院 | Yashoda Hospitals、1989年ラオ兄弟創業、市内4拠点、JCI・NABH・NABL認定 | ✅ | "Yashoda Hospitals Hyderabad international patients JCI founded" | https://www.yashodahospitals.com/international-patient/（公式サイト直接取得）／ https://yourstory.com/smbstory/yashoda-hospitals-telangana-hyderabad-healthcare（1989年創業を確認） |
| 病院 | KIMS Hospitals（セカンダラーバード）2004年開業、約1,000床、NABH・AACI認定 | ⚠️ 修正（JCI認定の記載を削除） | "KIMS Hospitals Secunderabad 1000 bed 2004 quaternary care flagship" | https://en.wikipedia.org/wiki/Krishna_Institute_of_Medical_Sciences_(hospital_group)（JCIの記載なし、NABH/NABLのみ）／ https://www.kimshospitals.com/about-us/（公式サイト直接取得。NABH・AACI認定は確認できたがJCIの記載はなし。第三者集約サイトの「JCI認定」表記は公式情報と不一致のため`data.ts`では採用しなかった） |
| 空港アクセス | RGIA(シャムシャバード)からGachibowliまで約35〜45分、Jubilee Hillsまで約35分、Banjara Hillsまで約30〜35分 | ✅ | "Hyderabad Rajiv Gandhi International Airport Shamshabad to Gachibowli distance drive time" ／ "Rajiv Gandhi International Airport to Jubilee Hills Banjara Hills distance drive time" | rome2rio集計（Gachibowli約23分〜1時間の幅、Jubilee Hills約35分、Banjara Hills約31分の複数推計） |
| メトロ | ハイデラバード・メトロ、レッド・ブルー・グリーンの3路線、総延長約67.2km・57駅、ブルーラインがHITECシティ・Gachibowli方面をカバー | ✅ | "Hyderabad Metro Rail lines number of stations km 2026" | https://en.wikipedia.org/wiki/Hyderabad_Metro（運行中3路線・57駅・67.21kmと明記。路線別の駅数合計(27+23+10=60)と総駅数(57)に差があるのは共用の乗換駅を重複カウントしないためと判断し、`data.ts`には整合性のある総数のみ記載） |
| 直行便 | ハイデラバード発着の日本直行便はなし | ✅ | "direct flight Japan Hyderabad Narita Haneda ANA JAL no direct flight" ／ "Hyderabad no direct flight Japan Tokyo confirm 2026 route network HYD airport international destinations" | 複数の航空券検索サイトで直行便なしを確認。香港・バンコク・デリー・ムンバイ・ベンガルール経由が一般的 |
| 通勤 | TomTomトラフィック指数2025でハイデラバードは世界47位(アジア15位)、ラッシュ時平均時速16.1km/h、年間約123時間を渋滞で損失 | ✅ | "Hyderabad traffic congestion TomTom index 2025 ranking" | https://www.telanganatribune.com/hyderabad-ranks-47th-globally-in-traffic-congestion-tomtom-traffic-index-2025/ |
| 治安 | 新市街(Jubilee Hills・Banjara Hills・Gachibowli・Kondapur・Madhapur)は比較的安定、旧市街(チャルミナール周辺)は夜間のスリ・雑踏事故に注意 | ✅ | "Hyderabad safety crime rate expat safe city index 2025" ／ "\"Old City\" Hyderabad safety avoid area crime tourists" | Numbeo Crime Index（ハイデラバードは治安スケール57.39でデリー等より良好）／ 複数の旅行ガイドでOld City(Charminar/Laad Bazaar一帯)の夜間の人混み・スリ注意を確認。特定エリアを「危険」と断定する記述は避け、混雑・時間帯に基づく注意喚起にとどめた |
| 日本人会 | ハイデラバード日本人会の存在は確認したが、現行の公式サイトや会員数・活動状況を裏付ける一次情報は得られず | ✅（未確認のため`data.ts`に記載せず） | "ハイデラバード 日本人会 日本人学校" ／ "ハイデラバード日本人会 2026 現状" | 個人ブログ(2019-2021年)で「ホームページが機能していない」との記述があり、2026年時点の現況を裏付ける一次情報が見つからなかったため association フィールドは省略した |
| 日本人学校・補習校 | ハイデラバードに認定日本人学校・補習校の存在は確認できず | ✅（未確認のため空配列を採用） | "ハイデラバード 日本人会 日本人学校" | https://www.mext.go.jp/content/000352298.pdf（文科省認定の在外教育施設一覧にインドはニューデリー・ムンバイの2校のみ記載、ハイデラバードは含まれず） |
| 日本食料品店 | ハイデラバード市内に確証の持てる実店舗の日本食料品店は確認できず | ✅（未確認のため空配列を採用） | "Japanese grocery store Hyderabad 日本食料品" | 検索結果はオンライン配送(MAINDISH.in等)が中心で、実店舗の存在を裏付ける情報は得られなかった |
| 日系企業（DNP） | 大日本印刷が2026年4月、IITハイデラバード校「テクノロジーリサーチパーク」に海外2カ所目のR&D拠点を開設。EV向け無線給電と医薬品原薬合成ルート開発を担う | ✅ | "Genome Valley Hyderabad Japanese pharmaceutical company Eisai Takeda investment" ／ "DNP 大日本印刷 インド工科大学ハイデラバード校 研究開発拠点 2026年4月" | https://www.dnp.co.jp/news/detail/20178057_1587.html（公式プレスリリース直接取得）／ https://www.jetro.go.jp/biznews/2026/05/a1ade0a8e7c1d248.html |
| 日系企業（武田薬品） | 武田薬品工業がハイデラバード地盤のBiological E社と提携し、デング熱ワクチン(TAK-003)の技術移管・増産を推進 | ✅（製造拠点をGenome Valley/Shamirpetと特定する記述は避けた） | "Biological E Takeda dengue vaccine Genome Valley Hyderabad" ／ "Biological E Shamirpet Genome Valley Takeda dengue vaccine manufacturing tech transfer location" | https://www.takeda.com/newsroom/newsreleases/2024/collaboration-to-accelerate-access-to-dengue-vaccine/（公式プレスリリース）。Biological E社の本社・一部工場がGenome Valley/Shamirpetにあることは別途確認したが、デング熱ワクチンの製造をその工場に特定する一次情報は見つからなかったため、`data.ts`では拠点名を明示せず「ハイデラバード地盤のBiological E社」とするにとどめた |
| 日系企業（IT） | NTT DATAとFujitsuがマドハプル/HITECシティ周辺にオフィスを構える | ✅ | "Japanese IT companies Hyderabad NTT Data Fujitsu GCC office" | NTT DATA公式所在地情報（Soft Sol Tower 2, Madhapur, Hi-Tech City）／ Fujitsuのオフショア拠点一覧（Noida・Pune・Hyderabad・Chennai・Bangalore） |
| JETRO | ハイデラバード単独のJETRO事務所は確認できず、2026年2月のBio Asiaでは JETROベンガルール事務所が日本人スタートアップの訪印を支援 | ✅（未確認のため記載せず） | "JETRO Hyderabad office 事務所" ／ "ハイデラバード日本人会 2026 現状" | https://www.jetro.go.jp/biznews/2026/03/a949741160bd09f6.html（JETRO記事本文でJETROベンガルール事務所が調整役を務めたと明記。ジェトロの拠点はニューデリー・ムンバイ・ベンガルール・チェンナイ・アーメダバードの5カ所のみで、プネと同様ハイデラバード単独事務所は見当たらなかった） |
| 半導体（不採用） | Telangana州への日系半導体ファブ投資（当初の想定） | ❌ 削除（採用せず） | "Telangana semiconductor fab investment Japanese company 2025 2026" ／ "Indichip Yitoa SiC fab Telangana Hyderabad location" | https://www.digitimes.com/news/a20250113VL204/sic-fab-manufacturing-plant-investment.html（Indichip社と日本のYitoa Micro Technologyによる半導体ファブ投資は、テランガナ州ではなく隣接するアンドラ・プラデーシュ州クルヌール県が立地地点と判明したため、`data.ts`のcorporateNoteには含めなかった） |

## ハイデラバード（Hyderabad）第2パス（執筆者自身による別クエリでの独立再検証）

上記の記述のうち特に確信度の低かった項目（病院の認証、メトロの数値、家賃レンジ、Bonalu祭の起源、DNP・武田薬品の事実関係）について、第1パスと異なる言い回しのクエリ、または病院・企業の公式サイト直接取得で再検証した記録。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 病院 | Apollo Hospitals Jubilee Hills、1988年開業、550床 | ✅ | "\"Apollo Hospitals\" Jubilee Hills Hyderabad 1988 founded 550 beds history" | 複数の第三者集約サイトで開業年・病床数が一致（Apollo公式サイトは403で直接確認不可だったが、Apollo公式ニュースの「2024年3月7回目JCI再認証」記事タイトルで組織としてのJCI認定は独立に裏付けられた） |
| 病院 | Yashoda Hospitals、1989年創業、JCI・NABH・NABL認定 | ✅ | "Yashoda Hospitals Hyderabad founded 1989 Dr Surender Rao Secunderabad history" | https://www.yashodahospitals.com/accreditation-certification/（公式サイト直接取得でJCI・NABH・NABLの3認定を確認）／ https://yourstory.com/smbstory/yashoda-hospitals-telangana-hyderabad-healthcare |
| 病院 | KIMS Hospitals、NABH・AACI認定（JCIは記載なし） | ✅（第1パスの修正を再確認） | "KIMS Hospitals Secunderabad 1000 bed 2004 quaternary care flagship" | https://www.kimshospitals.com/about-us/（公式サイト直接取得。NABH・AACIのみでJCIの記載なしを再確認） |
| メトロ | 3路線・57駅・67.2km | ✅ | "Hyderabad Metro Wikipedia 57 stations 67 km three lines Red Blue Green" | https://en.wikipedia.org/wiki/Hyderabad_Metro（別クエリでも同数値を再確認） |
| 家賃（Gachibowli） | 2BHK平均₹44,400/月、レンジ₹20,000〜60,000程度 | ✅（claim値$260〜630はこのレンジ内） | "Gachibowli apartment rent Hyderabad expat IT professional monthly budget" | 99acres集計値を独立クエリで再確認 |
| 家賃（Jubilee Hills） | 2BHK平均₹27,500〜40,500/月、レンジ₹26,000〜55,000程度 | ✅（claim値$280〜580はこのレンジ内） | "Jubilee Hills Hyderabad apartment rent expat high-end monthly rupees" | 99acres/nobroker集計値を独立クエリで再確認 |
| ボーナル祭 | 1813年疫病流行の伝承 | ✅（ただし考古学的にはより古い起源の可能性がある旨も確認済み） | "Bonalu festival 1813 plague Ujjaini Mahankali temple Secunderabad history" | https://en.wikipedia.org/wiki/Bonalu（クリシュナデーヴァラーヤ王期の碑文に関連儀礼の記録があるとの記述を確認したため、`data.ts`では19世紀起源説を「伝承」と位置づけ、唯一の起源として断定していない） |
| 特産（工芸） | ポチャンパリー・イカット、2005年GI登録、ハイデラバードから約45km | ✅ | "Pochampally Ikat first Telangana GI tag 2005 handloom Bhoodan Pochampally Hyderabad distance" | Wikipedia・rome2rio集計で距離(約28マイル・車で約45分)を再確認 |
| 日系企業（DNP） | IITハイデラバード校TRP、2026年4月開設、EV無線給電・医薬原薬合成ルート | ✅ | "DNP 大日本印刷 インド工科大学ハイデラバード校 研究開発拠点 2026年4月" | https://prtimes.jp/main/html/rd/p/000000979.000069194.html ／ 日本経済新聞・マークラインズ等の複数報道で一致 |
| 日系企業（武田薬品） | Biological E社との提携、デング熱ワクチン技術移管 | ✅ | "Biological E Takeda dengue vaccine Genome Valley Hyderabad" | https://www.deccanherald.com/business/japanese-pharma-giant-takeda-hyderabads-biological-e-join-hands-to-make-dengue-vaccine-2913642（「Hyderabad's Biological E」との表現を確認したが、製造拠点固有名は明示されないためdata.ts側もそこまで踏み込んでいない） |
| ビリヤニ | パラダイス、1953年、セカンダラーバードの映画館付設食堂として創業 | ✅ | "Paradise restaurant Hyderabad biryani founded year history Secunderabad" | https://www.paradisefoodcourt.in/history.html（公式サイト系の情報でも1953年を確認） |

### 変更サマリー（ハイデラバード）
- ⚠️ 修正: KIMS Hospitalsの認定を「JCI」から公式サイトで確認できた「NABH・AACI」に訂正（第三者集約サイトのJCI表記は同院の公式ページ・Wikipedia双方と不一致だったため）
- ❌ 削除（採用せず）: テランガナ州への日系半導体ファブ投資（Indichip/Yitoa案件は隣接するアンドラ・プラデーシュ州クルヌール県が実際の立地だったため、corporateNoteには含めなかった）
- ❌ 記載見送り: ハイデラバード日本人会（現況を裏付ける一次情報なし）、日本人学校・補習校、日本食料品実店舗、単独のJETROハイデラバード事務所（いずれも存在を確認できず、`data.ts`では省略または空配列とした）
- ❌ 記載見送り: Apollo Hospitals JubileeHillsの「世界初のJCI DCSC(脳卒中)認証」という具体的な最上級表現（医療ツーリズム系の第三者サイトのみでの言及にとどまり、病院公式サイトでの直接確認ができなかったため採用しなかった）
- ⚠️ 留意: ボーナル祭の「1813年疫病流行」起源は広く流布した伝承として記載したが、考古学的にはより古い起源の可能性がある旨をこのログに記録し、`data.ts`では断定表現を避けた
- ⚠️ 留意: 武田薬品とBiological E社の提携について、製造拠点をGenome Valley/Shamirpetと名指しする一次情報は見つからなかったため、`data.ts`では拠点名を明示していない
- ✅ 上記以外の全項目（渡航適期の気候判断、ビリヤニ・ポチャンパリー・ボーナル・真珠の特産4件、病院3件の開業年・病床数・国際患者対応、家賃2件、メトロ、直行便なしの実態、空港アクセス、渋滞統計、治安、DNP・武田薬品・NTT DATA/Fujitsuの日系企業情報）は独立クエリまたは病院・企業公式サイト直接取得で再確認済み


## ハイデラバード（Hyderabad）第3パス（独立ファクトチェック、2026-07-10、`task-12-report.md`は未参照）

第1・第2パスとは別の担当（独立検証者）が、既存パスの結果を一切参照せず `data.ts` のhyderabadエントリのみを対象に、独自の言い回しで再度全項目をWebSearch/WebFetchで再検証した記録。既存行は変更していない。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ（例） | 出典URL |
|---|---|---|---|---|
| 病院 | Apollo Hospitals（ジュビリーヒルズ）1988年開業、550床、JCI・NABH・NABL認定 | ✅ | "Apollo Hospitals Jubilee Hills Hyderabad founded 1988 beds JCI accreditation" | https://www.apollohospitals.com/region/hyderabad/hospitals/jubilee-hills/about-us/ ／ 複数第三者集約サイトで1988年・550床・JCI/NABH/NABL一致 |
| 病院 | Apollo、2024年3月に7回目のJCI再認証 | ✅ | "Apollo Hospitals Hyderabad sixth JCI accreditation Telangana Today" | https://telanganatoday.com/apollo-hospitals-hyderabad-gets-jci-accreditation-for-sixth-time（2021年5月に6回目→3年周期で2024年3月に7回目、チェンナイと同時取得）https://medicaldialogues.in/news/health/hospital-diagnostics/apollo-hospitals-group-bags-seventh-consecutive-jci-accreditation-127697 |
| 病院 | Yashoda Hospitals、1989年ラオ兄弟創業、ソマジグダ・セカンダラーバード・マラクペット・ヒテックシティの4拠点、JCI・NABH・NABL認定 | ✅ | "Yashoda Hospitals Hyderabad Rao brothers founded 1989 locations" | https://en.wikipedia.org/wiki/Yashoda_Hospitals ／ https://yourstory.com/smbstory/yashoda-hospitals-telangana-hyderabad-healthcare（4拠点・1989年創業一致） |
| 病院 | KIMS Hospitals（セカンダラーバード）2004年開業、約1,000床、NABH・AACI認定（JCI記載なし） | ✅（第1パスの修正内容と一致） | "KIMS Hospitals Secunderabad founded 2004 beds AACI accreditation" | https://www.kimshospitals.com/about-us/ ／ AACI認定2023年取得を確認、JCIへの言及なし |
| 日本人学校・補習校 | 空配列（記載なし） | ✅（空欄が妥当） | "日本人学校 ハイデラバード" | https://www.mext.go.jp/content/000352298.pdf（文科省認定校はニューデリー・ムンバイの2校のみ） |
| 日本食料品店 | 空配列（記載なし） | ✅（空欄が妥当、確証店舗なし） | "Hyderabad Japanese grocery store Japanese association community India" | 日本食材の実店舗はデリー・グルガオン中心（Yamatoya、Sekai Ichiba等）。ハイデラバード市内の実店舗を裏付ける一次情報は見つからず |
| 家賃 | 2BHK（Gachibowli）$260〜630/月 | ✅（同水準） | "Gachibowli Hyderabad 2BHK rent per month expat 2025" | 99acres等の集計で₹51,900〜60,000/月（≈$625〜723）を確認。駐在員向け上限帯とclaim値の上限がほぼ一致 |
| 家賃 | 2BHK（Jubilee Hills）$280〜580/月 | ✅（同水準） | "Jubilee Hills Hyderabad 2BHK apartment rent 2025" | 99acres集計で平均₹27,500/月、レンジ₹19,000〜45,000（≈$230〜540）を確認、claim値と同水準 |
| 直行便 | 日本との直行便は現在なし | ✅ | "direct flight Hyderabad Japan airline 2026" | 複数の航空券検索サイトでHYD⇄NRT/HNDに直行便なし、香港・デリー・ムンバイ・ベンガルール経由が確認された |
| エリア | Gachibowli（HITECシティ隣接、Microsoft・Amazon・Accenture等の外資オフィス集積） | ✅ | "Microsoft Amazon Accenture Gachibowli HITEC City Hyderabad office" | Microsoft R&Dキャンパス、Amazon最大級キャンパス、Accenture等がGachibowli/HITECシティ一帯に所在することを確認 |
| エリア | Jubilee Hills（高級住宅・商業エリア、駐在員に選ばれやすい） | ✅ | "Jubilee Hills Hyderabad upscale expat premium residential area" | 複数の不動産メディアで「ハイデラバード最高級エリア」「駐在員・富裕層に人気」と一致 |
| 特産（料理） | ハイデラバード・ビリヤニ、ニザームル・ムルクの料理人考案という伝承、ダム・プフト技法、パラダイス1953年セカンダラーバード創業 | ✅（伝承として適切にヘッジ済み） | "Paradise restaurant Hyderabad biryani founded 1953 Secunderabad cinema" ／ "Hyderabadi biryani origin Nizam-ul-Mulk 18th century dum pukht history" | パラダイスの1953年9月1日創業・映画館併設カフェとしての起源を確認。ニザーム料理人考案説は複数ソースで「local folklore」と明記されており、`data.ts`の「伝承では…という」という表現は事実の水準として適切 |
| 特産（工芸） | ポチャンパリー・イカット、車で約45分、2005年テランガナ州初のGI登録 | ✅（要留意） | "Pochampally Ikat geographical indication GI tag 2005 first Andhra Pradesh Telangana" | https://en.wikipedia.org/wiki/Pochampally_sari（WebFetchで本文確認：「received…GI status in 2005」と明記）。距離は約42km・約44分でclaimの「約45分」と一致。**留意**: 繊維省の登録リスト(handlooms.nic.in)には登録日が2004年12月31日と記載されたものもあり出典間で1年の揺れがあるが、Wikipedia本文の明示的な記述に基づき2005年を優先し、`data.ts`は変更しなかった（一度2004年へ修正しかけたが、一次資料の性質を精査した上で2005年表記を維持） |
| 特産（祭事） | ボーナル祭、1813年疫病流行時の軍隊派遣伝承、ゴルコンダ砦、ウッジャイニー・マハーカーリー寺院、2014年州祭指定 | ✅ | "Bonalu festival Hyderabad Ujjaini Mahakali temple Secunderabad 1813 origin history army" ／ "Bonalu declared state festival Telangana 2014" | 1813年伝承・ゴルコンダ砦での開幕・2014年6月26日付政府命令(GO No.5)による州祭指定を確認 |
| 特産（土産） | ハイデラバード・パール、「真珠の都」、1591年クトゥブ・シャーヒー朝、バスラ等ペルシャ湾岸交易 | ✅ | "Hyderabad city of pearls history 1591 Qutb Shahi Persian Gulf Basra pearl trade" | 1591年ムハンマド・クリー・クトゥブ・シャーによる都市建設、ペルシャ湾岸（バスラ含む）からの真珠輸入の歴史を確認 |
| 主要記述 | 「テランガナ州主導でファブ誘致と製薬クラスターを拡大」（半導体ファブの誘致活動であり、稼働中ファブの存在は主張していない） | ✅（地理的誤りなし） | "Hyderabad semiconductor fab Telangana investment 2025 2026" | Telangana州のFab City（Tukkuguda）再編、半導体人材大学・デザインハブ・ATMPユニット等のロードマップ（2025-2030）を複数ソースで確認。第1パスで削除された日系ファブ案件（Indichip/Yitoa、実際はアーンドラ・プラデーシュ州クルヌール県）のような他州との地理的誤認は、現行のcorporateNote・noteには見当たらない |
| 日系企業（DNP） | 2026年4月、IITハイデラバード校TRPに海外2カ所目のR&D拠点開設、EV無線給電・医薬品原薬合成ルート開発 | ✅ | "Dai Nippon Printing DNP IIT Hyderabad research development 2026 wireless power EV pharmaceutical API" | https://www.global.dnp/en/news/detail/2026/03/05/（2026年4月27日開設、オランダ(2025年9月)に次ぐ海外2拠点目と明記） |
| 日系企業（武田薬品） | Biological E社（ハイデラバード地盤）とのTAK-003技術移管・増産提携 | ✅ | "Takeda Biological E dengue vaccine TAK-003 technology transfer Hyderabad" | https://www.takeda.com/newsroom/newsreleases/2024/collaboration-to-accelerate-access-to-dengue-vaccine/（2024年2月発表、年産最大5,000万回分への増産） |
| JETRO | ハイデラバード単独事務所は確認できず | ✅ | "JETRO overseas offices list India Ahmedabad Bengaluru Chennai Delhi Mumbai" | JETRO公式サイトでインドの拠点はニューデリー・ムンバイ・ベンガルール・チェンナイ・アーメダバードの5カ所のみと確認、ハイデラバードは含まれず |
| 日系企業（IT） | NTT DATA・Fujitsuがマドハプル/HITECシティ周辺にオフィス | ✅ | "NTT DATA Fujitsu office Hyderabad Madhapur HITEC City" | NTT DATA（Cyber Towers/Soft Sol Tower、Madhapur）、Fujitsu（Raheja Mindspace、Hi-Tech City/Madhapur）の所在地を確認 |
| 空港アクセス | RGIA(シャムシャバード)からGachibowliまで約35〜45分、Jubilee Hillsまで約35分、Banjara Hillsまで約30〜35分（渋滞状況により変動） | ✅ | "Rajiv Gandhi International Airport Shamshabad to Gachibowli distance drive time" ／ "Hyderabad airport RGIA to Jubilee Hills Banjara Hills travel time minutes traffic" | 最速時24〜29分、渋滞考慮で45分〜1時間との情報も確認。claimは既に「渋滞状況により変動」と幅を持たせて記載されており、実測レンジと整合 |
| 通勤 | TomTomトラフィック指数2025で世界47位(アジア15位)、ラッシュ時平均時速16.1km/h、年間約123時間損失 | ✅（数値完全一致） | "TomTom Traffic Index 2025 Hyderabad rank congestion average speed" | https://www.telanganatribune.com/hyderabad-ranks-47th-globally-in-traffic-congestion-tomtom-traffic-index-2025/ |
| メトロ | レッド・ブルー・グリーンの3路線、総延長約67.2km・57駅、ブルーラインがHITECシティ・Gachibowli方面をカバー | ✅（数値完全一致） | "Hyderabad Metro total length 67.2 km 57 stations" | https://en.wikipedia.org/wiki/Hyderabad_Metro（乗換駅の重複を除いた実駅数57・総延長67.21kmを確認） |

### 変更サマリー（ハイデラバード・第3パス）
- `data.ts` への変更なし。第1・第2パスの記述（誤って未読の`task-12-report.md`ではなく、この`city-fact-check-2026-07.md`の既存行のみ）はすべて独立クエリで再確認でき、矛盾は見つからなかった。
- 唯一のヒヤリハット: ポチャンパリー・イカットのGI登録年について、繊維省の登録リストが2004年12月31日と読める点を見つけ、一度2005→2004へ書き換えたが、Wikipedia本文の明示的な文言（"received...GI status in 2005"）を精査した結果、出典間の年ズレ（登録受理日と正式なGIジャーナル公示年の違いによると推定）と判断し、2005年表記に戻した。データは変更していないが、判断根拠としてこのログに残す。
- 半導体ファブについては、第1パスで既に地理的誤り（テランガナ州ではなくアーンドラ・プラデーシュ州クルヌール県）を理由に不採用としており、本パスの再検証でも現行の`data.ts`本文に同種の地理的誤認は見当たらなかった。

## アフマダーバード（Ahmedabad）第1パス（初回クエリでの一次調査）

情報が乏しく削除が多くなる見込みの都市という前提のもと、密度を他都市に揃えるための推測補完は行わない方針で調査。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除（不採用）

| 項目 | 記述 | 判定 | 検索クエリ（例） | 出典URL |
|---|---|---|---|---|
| 渡航適期 | bestMonths [12,1,2]（高27.1〜31.0℃・低13.6〜16.4℃・降水ほぼゼロ）、avoidMonths [4-9]（酷暑4-6月・モンスーン7-9月） | ✅（`climate.ts`の測定値のみで判断、生成値は変更せず） | （climate.ts記載の2015-2024平均を直接参照、Web検索なし） | `lib/cities/climate.ts` |
| 特産（料理） | チャンドラヴィラス、1900年頃チマンラール・ヘームラージ・ジョーシー創業、1901年にグジャラーティー・ターリー形式を市内で初めて提供、ガーンディー・サルダール・パテールも来訪 | ✅ | "Chandra Vilas Ahmedabad 1901 Gujarati thali restaurant history founded" | https://www.knocksense.com/ahmedabad/chandravillas-a-journey-celebrating-123-years-of-introducing-gujarati-thali-to-ahmedabad ／ https://www.slurrp.com/article/chandravilas-exploring-ahmedabads-oldest-iconic-eatery-serving-gujarati-cuisine-1726817676541 |
| 特産（工芸） | バンダニー（絞り染め）、クシャトリー(Khatri)コミュニティが担い手、ジャームナガル・カッチが主産地だがアフマダーバードも産地の一つ、市内にハトリー・バンダニー／マンガルヤー・ヘリテージ等の専門店 | ✅（「アフマダーバードが主産地」とは書かず「産地の一つ」に限定） | "Bandhani tie-dye Ahmedabad Jamalpur history craft artisans origin" ／ "Khatri Mangalya Heritage Bandhani Ahmedabad Jamalpur location shop" | 複数の工芸解説サイトで「Ahmedabad and outskirts are known as production centers」との記述を確認。主産地は依然ジャームナガル／カッチと明記されるため、data.tsでもその序列を維持 |
| 特産（祭事） | ウッタラーヤン国際カイト・フェスティバル、1989年からグジャラート州観光局が開催、サバルマティ・リバーフロントが近年の主要会場 | ✅ | "Uttarayan kite festival Ahmedabad International Kite Festival history January" ／ "International Kite Festival Ahmedabad 1989 first edition Gujarat Tourism history" | https://en.wikipedia.org/wiki/International_Kite_Festival_in_Gujarat_%E2%80%93_Uttarayan（1989年開始を明記） |
| 特産（土産） | インドゥベン・カークラーワーラー、カークラー（グジャラート伝統煎餅風スナック） | ⚠️（創業年を要再検証） | "Induben Khakhrawala history founded 1955 CG Road story" | 公式サイト系は「1955年創業」、The Better India記事は「1965年、43歳で開業、1981年53歳で死去」と年齢的に整合する詳細な創業譚を記載しており出典間に矛盾あり。第2パスで再検証 |
| 住居エリア | Bodakdev・Satellite・Prahladnagar、SGハイウェイ沿いのオフィス・商業集積エリア | ✅ | "Ahmedabad expat housing rent Bodakdev Prahladnagar Satellite 2BHK" | 99acres・SquareYards等の集計 |
| 家賃（Bodakdev） | 2BHK $210〜370/月 | ✅ | "Bodakdev Ahmedabad 2BHK rent range ₹ per month 99acres nobroker" | 99acres集計（₹19,000〜35,000程度の実勢レンジ、1USD=95.5円換算） |
| 家賃（Satellite/Prahladnagar） | 2BHK $210〜470/月 | ✅ | "Ahmedabad Prahladnagar Satellite Vastrapur 2BHK rent per month expat 2025" | 99acres・SquareYards集計（₹20,000〜45,000程度） |
| 空港アクセス | SVPI空港からBodakdevまで車で約15分、Satellite/Prahladnagarまで約30分 | ✅ | "Ahmedabad airport SVPI access Bodakdev Prahladnagar drive time minutes" ／ "Ahmedabad airport Prahladnagar Satellite Vastrapur distance drive time minutes rome2rio" | rome2rio集計（Bodakdev約14分、Prahladnagar約19km/29分、Satellite約17km/30分） |
| 病院 | Apollo Hospitals International Ltd, Ahmedabad（GIDCバット、ガンディーナガル〜アフマダーバード道路沿い）、2003年開設、289床（ICU87床）、JCI・NABL認定 | ⚠️（「36年の実績」「月150人の外国人患者」は不採用） | "Ahmedabad hospitals international patients JCI NABH Apollo Sterling CIMS Zydus" ／ "Apollo Hospitals International Ahmedabad founded year 1988 beds JCI history" | https://www.apollohospitals.com/hospitals/apollo-hospitals-international-ltd-ahmedabad（2003年設立の記載）／ 医療ツーリズム集客サイトmedicaltourismco.comは「36年の実績」「月150人の国際患者」と記載するが、2003年開設なら2026年時点で23年目であり矛盾。同サイトの記述は他院にも使い回されている定型文の疑いがあり、data.tsには採用しなかった |
| 病院 | Marengo CIMS Hospital（旧CIMS Hospital、ソラ地区）、JCI・NABH・NABL認定、East/West/North3棟の「グリーンホスピタル」 | ⚠️（病床数は出典間で350/480/500と不一致のため記載せず） | "Ahmedabad hospitals international patients JCI NABH Apollo Sterling CIMS Zydus" ／ "\"Marengo CIMS\" Ahmedabad hospital beds JCI NABH history renamed CIMS" | 公式サイトcims.org、Facebook等で500床の記載がある一方、他の集約サイトは480床・350床と表記が割れており、確度の高い数値に絞れなかったため`data.ts`には病床数を記載しなかった |
| 病院 | Zydus Hospital（市内旗艦拠点）、550床、2016年9月NABH認定、外国人患者向けにビザ・FRRO・空港送迎込みパッケージ | ✅ | "Zydus Hospital Ahmedabad beds founded history international patients" | https://m.thewire.in/article/ptiprnews/medicine-beyond-borders-zydus-hospital-ahmedabad-emerges-as-a-preferred-destination-for-international-patients（550床、NABH認定2016年9月、FRRO/ビザ/空港送迎パッケージを明記） |
| メトロ | フェーズ1(ブルー21.16km・18駅、レッド18.87km・15駅)が2024年12月開業、2026年1月にフェーズ2(イエロー・バイオレット)全通、4路線・総延長約67.6km、ガンディーナガル・GIFT Cityまで接続 | ✅ | "Ahmedabad Metro lines stations km 2026 phase 1 phase 2" | Wikipedia「Ahmedabad Metro」集計と複数の2026年時点ニュース記事で一致 |
| BRTS | Janmarg、市内を広くカバーする専用レーンバス | ✅（具体的km数値はdata.tsに記載せず） | "Ahmedabad metro BRTS Janmarg public transport 2026" | 総延長160km・日次乗客数約34.9万人（2023年時点、Wikipedia）を確認したが、直近年次の裏付けが弱いため`data.ts`本文には数値を書かずBRTSの存在と機能のみ記載 |
| 直行便 | アフマダーバード発着の日本直行便はなし | ✅ | "Ahmedabad direct flight Japan Narita Haneda 2026" | 複数の航空券検索サイトでAMD-NRT/HND間の直行便0件、デリー・ベンガルール経由が中心と確認 |
| 通勤 | 自動車・二輪の集積地マンダル・ベチャラジ（Suzuki Motor Gujarat＝ハンサルプル、Honda Motorcycle & Scooter India第4工場＝ヴィタラプル、いずれもアフマダーバード県内）まで市中心部から車で1.5〜2時間 | ✅ | "Suzuki Motor Gujarat plant Hansalpur Mandal Becharaji location district" ／ "Honda Motorcycle Scooter India Gujarat plant Mandal Becharaji Vithalapur" | Wikipedia「Suzuki Motor Gujarat」でハンサルプル＝アフマダーバード県マンダル郡と確認／ Honda公式の第4工場所在地情報でヴィタラプル＝同じくアフマダーバード県マンダル郡と確認。JETRO記事（後掲）の「1.5〜2時間」との記述とも整合 |
| 生活実態（郊外） | 日系駐在員はマンダル・ベチャラジ工業団地周辺の「MIKADO」「Le Tokyo」等の和食提供ホテルや企業借上げの寮アパートに居住するケースがあり、日本人学校はなく市内はインターナショナルスクールのみ | ✅ | （JETRO記事を直接WebFetch） | https://www.jetro.go.jp/biz/areareports/2022/184b72a22637776c.html（2022年時点のレポート） |
| 日本人会 | アーメダバード日本人会（amd-japan.com）、2014年11月15日に会員47名で発足、隔月第3水曜「三水会」、フットサル・テニス等のサークル活動、法人会員制度あり | ✅ | "アフマダーバード 日本人会 日本人学校" ／ "アーメダバード日本人会 三水会 法人会員 活動" | https://amd-japan.com/（公式サイト直接取得）／ https://www.nna.jp/news/135637（発足時のNNA報道） |
| 日本人学校・補習校 | アフマダーバードに日本人学校はなく、学齢期の子はMahatma Gandhi International School(MGIS)等のIB系インターナショナルスクールに通うのが一般的 | ✅（空配列を採用） | "アフマダーバード 日本人 学校" | https://amd-japan.com/ahmedabad/%E5%AD%A6%E6%A0%A1（公式サイトで「日本人学校がないため、すべてインターナショナルスクール」と明記） |
| 日本食料品店 | 確証の持てる実店舗は確認できず | ✅（未確認のため空配列を採用） | "Japanese grocery store Ahmedabad 日本食料品" | 検索結果はオンライン配送(MAINDISH.in等)が中心で、デリー・グルガオン等の実店舗情報のみ。アフマダーバード市内の実店舗は確認できず |
| 日系企業（自動車・二輪） | Suzuki Motor Gujarat、Honda Motorcycle & Scooter India第4工場、いずれもアフマダーバード県マンダル・ベチャラジ地区 | ✅（上記「通勤」項目と同一出典） | 同上 | 同上 |
| 日系企業（半導体） | ターター・エレクトロニクスが台湾PSMCと提携し、アフマダーバード県内ドーレラで半導体ファブを建設中、東京エレクトロンが成膜・エッチング装置等を供給 | ✅（ファブの立地県を自ら確認、他州との混同なし） | "Tata Electronics Dholera semiconductor fab Gujarat Japanese investment" ／ "Dholera distance from Ahmedabad km district location" | https://www.tata.com/newsroom/business/first-indian-fab-semiconductor-dholera（Tokyo Electron社の装置供給に言及）／ Wikipedia「Dholera」でアフマダーバード県内の町と確認 |
| JETRO | ジェトロ・アーメダバード事務所、2013年開設、Prahladnagar(SGハイウェイ) | ✅ | "JETRO Ahmedabad office 事務所" | https://www.jetro.go.jp/jetro/overseas/in_ahmedabad/（公式所在地・沿革） |
| グジャラート禁酒法・パーミット | グジャラート州は禁酒法（ボンベイ禁酒法）を施行する「ドライステート」。外国人旅行者・NRIは州公式ポータル(eps.gujarat.gov.in)からオンラインでリカーパーミットを無料申請可能、7日間有効・最大3回延長で通算28日 | ✅ | "Gujarat prohibition alcohol permit foreigners tourists rule 2026" ／ "Gujarat liquor permit foreign tourist how long valid duration days FL permit" | インド政府バーミンガム総領事館公式ページ(cgibirmingham.gov.in)でパーミット制度自体を確認／ 有効期間・延長回数・無料の扱いは複数の旅行者向け解説サイトで一致（公式ポータルeps.gujarat.gov.inは直接WebFetch時に接続エラーのため到達できず、二次情報源での裏取りに留まる点に留意） |

## アフマダーバード（Ahmedabad）第2パス（別クエリでの独立再検証）

第1パスで確度に留保を付けた項目（カークラーの創業年、禁酒法パーミットの詳細、日本人会の沿革）を中心に、異なる言い回しのクエリで再検証。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 特産（土産） | インドゥベン・カークラーワーラー、1965年創業（43歳のインドゥベン・ジャヴェリーが夫の病気を機に自宅で開業、1970年にミタカリ/ナヴランプラーへ移転拡大、1981年53歳で死去） | ✅（1965年を採用、公式サイトの「1955年」は不採用） | "Induben Khakhrawala history founded 1955 CG Road story"（The Better India記事を直接WebFetch） | https://thebetterindia.com/297756/induben-jhaveri-khakhrawala-iconic-brands-gujarat-homemaker-woman-entrepreneur/（開業年齢43歳・死去年1981年/53歳という年齢の整合性から1965年創業説の方が内的整合性が高いと判断） |
| グジャラート禁酒法・パーミット | 7日間有効、最大3回延長（通算28日）、外国人は手数料無料、21歳以上・パスポート/インドビザが必要 | ✅（第1パスと同一の数値を別クエリで再確認） | "Gujarat liquor permit tourists 7 days renewal free foreigners official portal eps.gujarat.gov.in" | 複数の独立した旅行者向け解説サイト（saitravelsahmedabad、travelmedia.in等）で同一の「7日間・3回まで延長・無料」という記述が一致 |
| 特産（料理） | チャンドラヴィラス、1900年創業・1901年ターリー導入、ガーンディー・ロード沿い、120年超の老舗 | ✅ | "Chandravilas Ahmedabad history Chimanlal Joshi Gandhi Sardar Patel visited thali 1901" | 複数の独立記事（knocksense、slurrp）で創業年・立地・著名来訪者のエピソードが一致 |
| 日本人会 | 2014年11月15日発足、会員47名 | ✅ | "アーメダバード日本人会 三水会 法人会員 活動" | https://www.nna.jp/news/135637（発足時の報道記事で日付・会員数を確認） |
| 半導体ファブ（地理確認） | ドーレラはアフマダーバード県内（アフマダーバード市から約100〜110km、車で1.5〜2時間） | ✅（他州との地理的誤認なし） | "Dholera distance from Ahmedabad km district location" | 複数の距離計算サイトおよびWikipediaで「Dholera is a town in Ahmedabad district」と一致 |

### 変更サマリー（アフマダーバード）
- ⚠️ 修正: インドゥベン・カークラーワーラーの創業年は、公式サイトの「1955年」ではなく、創業者の年齢・没年から内的整合性の取れるThe Better India記事の「1965年」を採用した。
- ❌ 不採用: Apollo Hospitals International Ahmedabadの「36年の実績」「月150人の外国人患者」（医療ツーリズム集客サイトの定型文と思われ、公式サイトの2003年開設という記載と年数が矛盾するため）。
- ❌ 不採用: Marengo CIMS Hospitalの病床数（出典間で350/480/500床と不一致のため、認定情報のみ記載し病床数は書かなかった）。
- ❌ 不採用: BRTS「Janmarg」の総延長・日次乗客数の具体的数値（直近年次の裏付けが弱いため、存在と機能のみ記載）。
- ❌ 記載見送り: 日本人学校・補習校（存在しないことを確認済みのため空配列）、日本食料品実店舗（確証の持てる情報なし、空配列）。
- ✅ 上記以外の全項目（渡航適期の気候判断、特産4件、住居エリア・家賃2件、空港アクセス、病院3件のうち採用した情報、メトロ、直行便なしの実態、マンダル・ベチャラジへの通勤時間、日本人会の沿革、日系企業（自動車・二輪・半導体）、JETRO事務所、グジャラート禁酒法パーミットの詳細）は独立クエリまたは公式サイト直接取得で確認済み。

## アフマダーバード（Ahmedabad）第3パス（独立ファクトチェック、2026-07-12、`task-13-report.md`は未参照）

第1・第2パスとは別の担当（独立検証者）が、既存パスの結果を一切参照せず `data.ts` のahmedabadエントリのみを対象に、独自の言い回しで再度全項目をWebSearch/WebFetchで再検証した記録。既存行は変更していない。詳細な検索クエリ・出典の全項目表は `.superpowers/sdd/task-13-verify.md` を参照。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ（例） | 出典URL |
|---|---|---|---|---|
| JETROアーメダバード事務所 | 開設年 | ⚠️修正 | "JETRO アーメダバード事務所 2013年 開設 Prahladnagar" | JETRO公式プレスリリース一覧見出し「ジェトロがアーメダバード事務所を新たに開設｜2017年」／ 日本経済新聞「ジェトロ、アーメダバードに事務所開設 11月」(2017年8月)／ DeshGujarat記事。3出典が一致して2017年11月開設であり、data.tsの「2013年開設」は誤りだったため「2017年11月開設」に修正 |
| 日系企業数「約57社」の出典 | (JETRO調べ)と記載していたが | ⚠️修正 | JETRO 2022年報告書を直接WebFetch (jetro.go.jp/biz/areareports/2022/184b72a22637776c.html) | 報告書本文が「57社（2022年5月時点、アーメダバード日本人会調べ）」と明記しており、JETRO自身の調査ではなくアーメダバード日本人会の調べだったため、data.tsの表記を「(アーメダバード日本人会調べ、JETROレポートに掲載)」に修正 |
| 病院3件（Apollo/Marengo CIMS/Zydus）の開設年・病床数・認定 | 既存記述どおり | ✅ | "Apollo Hospitals International" Ahmedabad GIDC Bhat established 2003 beds ICU 等 | 各公式サイト・複数独立報道で再確認。Apolloの「36年の実績」等の自己矛盾する定型文は既にdata.tsに含まれておらず、再混入なしを確認 |
| グジャラート禁酒法パーミット | eps.gujarat.gov.in、7日間有効・最大3回延長 | ✅ | "Gujarat liquor permit foreign tourist eps.gujarat.gov.in online application validity days 2026" | 複数独立解説サイトで一致 |
| 家賃(Bodakdev / Satellite・Prahladnagar) | $210〜370 / $210〜470 | ✅ | "Bodakdev Ahmedabad 2BHK apartment rent" 等 | 99acres/squareyards集計と近似レンジで整合（駐在員向け上位物件を考慮） |
| 直行便 | 日本直行便なし | ✅ | "Ahmedabad direct flight Tokyo Narita Haneda 2026 airline" | 複数航空券検索サイトで直行便0件を確認 |
| 近隣3エリア | Bodakdev/Satellite/Prahladnagarの高級・駐在員向け実態 | ✅ | "Bodakdev Satellite Prahladnagar Ahmedabad posh premium expat residential area" | 複数不動産メディアで確認 |
| バンダニー | ジャームナガル/カッチが主要産地、アフマダーバードは産地の一つという書き分け | ✅（誇張なし） | "Bandhani tie-dye Ahmedabad Jamnagar Kutch main production centre history" | Jamnagarが「バンダニーの首都」との一致を確認、data.tsの記述は正確 |
| 特産店舗（ハトリー・バンダニー／マンガルヤー・ヘリテージ） | 実在確認 | ✅ | "Khatri Bandhani" / "Mangalyaa Heritage" Ahmedabad | いずれも実在するバンダニー専門店と確認 |
| GIFT City半導体/データセンター拡張 | 記述どおり | ✅ | "GIFT City Gandhinagar data center financial hub expansion 2026" | Gujarat Data Centre Policy 2026-29等で確認 |
| ドーレラの半導体ファブ地理 | アフマダーバード県内、他州との混同なし | ✅ | "Tata Electronics semiconductor fab Dholera Gujarat PSMC Tokyo Electron" | Tata公式で確認 |
| メトロ総延長・フェーズ2全通時期 | 2026年1月全通、約67.6km | ✅ | "Ahmedabad Metro phase 2 opening January 2026 yellow violet line" | Yellow Line最終区間が2026年1月11日開通、総延長67.56kmで一致 |

### 変更サマリー（アフマダーバード・第3パス）
- ⚠️ 修正: JETROアーメダバード事務所の開設年を「2013年」から、3つの独立出典（JETRO公式プレスリリース見出し・日本経済新聞・DeshGujarat）が一致する「2017年11月」に訂正した。
- ⚠️ 修正: 日系企業数「約57社」の出典表記を、JETRO 2022年報告書本文の記載に基づき「(JETRO調べ)」から「(アーメダバード日本人会調べ、JETROレポートに掲載)」に訂正した。
- ✅ 上記2件以外の全項目（病院3件、禁酒法パーミット、家賃2件、直行便、近隣3エリア、バンダニーの産地表現・専門店の実在、GIFT City、半導体ファブの地理、メトロ）は独立クエリで再確認済み、変更なし。削除対象となる未検証ヘッジ表現は見当たらなかった。

## コルカタ（Kolkata）第1パス（初回クエリでの一次調査）

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 気候・渡航適期 | bestMonths: 11,12,1,2 / avoidMonths: 4,5,6,7,8,9 | ✅ | （`climate.ts`の数値のみ参照、WebSearch対象外） | ブリーフ記載の2015-2024 Open-Meteo平均。11月(28.8/18.9℃・32mm)がFeb(28.9/16.9℃・25mm)と同水準の快適さだったため、ブリーフの「Dec-Feb」に加えて11月もbestMonthsに含めた。3月・10月は温度・降水量とも中間的なためどちらのリストにも含めていない |
| 特産（料理） | ロショゴッラ／ションデシュ、1868年ノビン・チョンドロ・ドッシュがバグバザールで考案、2017年11月「バングラル・ロショゴッラ」でGI登録 | ✅ | "rasgulla sandesh Kolkata sweets history GI tag" ／ "K.C. Das Nobin Chandra Das rasgulla shop history 1868 founded" | https://en.wikipedia.org/wiki/Rasgulla（1868年考案・2017年11月14日GI登録を明記）／ https://en.wikipedia.org/wiki/Nobin_Chandra_Das |
| 特産（工芸） | カーリーガート絵画、1809年建立のカーリーガート寺院周辺で19世紀前半に発生、20世紀初頭に石版画の普及で衰退、V&A博物館が世界最大級のコレクションを所蔵 | ✅ | "Kalighat painting patachitra Kolkata art history GI" ／ "Kalighat Kali Temple built year history patuas paintings origin 19th century" | https://en.wikipedia.org/wiki/Kalighat_painting（寺院1809年建立、絵画は19世紀前半発生、V&A所蔵約645点を確認） |
| 特産（祭事） | ドゥルガー・プージャー、2021年12月にユネスコ無形文化遺産代表一覧表に「コルカタのドゥルガー・プージャー」として記載 | ✅ | "Durga Puja Kolkata UNESCO intangible cultural heritage 2021" | https://ich.unesco.org/en/RL/durga-puja-in-kolkata-00703（2021年12月15日の第16回政府間委員会で記載を確認） |
| 特産（土産） | バルチャリ・サリー、18世紀にムルシダーバード近郊バルチャルで発祥、飢饉・洪水で衰退後20世紀前半にアクシャイ・クマール・ダスがビシュヌプルで再興、2011年GI登録 | ✅ | "Baluchari sari Bishnupur GI tag history West Bengal weaving" ／ "Baluchari sari Akshay Kumar Das Subho Thakur revival Bishnupur Murshidabad decline history" | https://en.wikipedia.org/wiki/Baluchari_sari（GI登録2011年、Bishnupur再興の経緯を確認）。「飢饉・洪水で衰退」は独立した2サイト(delhi-fun-dos、livehistoryindia系)で一致したが、Wikipedia本文はこの経緯を明記しないため、`data.ts`では衰退理由を単純化して記載した |
| エリア | Ballygunge・Alipore（南コルカタの高級住宅地）、Salt Lake（ビドハンナゴル、Sector V ITハブ）、New Town（ラジャルハット） | ✅ | "Kolkata expat neighborhoods Salt Lake New Town rent apartment 2026" ／ "Alipore Ballygunge Kolkata rent 2BHK 3BHK expat diplomatic area" | https://www.nobroker.in/blog/posh-areas-in-kolkata/（Alipore=「Kolkata's most prestigious address」・外交官居住区、Ballygunge=高級住宅地と明記） |
| 家賃 | 2BHK（Ballygunge・Alipore）$260〜470/月、2BHK（Salt Lake・New Town）$170〜295/月 | ✅ | "Ballygunge Kolkata 2BHK rent per month rupees 2026 expat" ／ "Salt Lake Sector 1 2 3 Kolkata 2BHK apartment rent per month 2026" | nobroker記事で Alipore/Ballygunge 2BHK ₹25,000〜45,000、Salt Lake/New Town 2BHK ₹16,000〜28,000 の集計を確認。USD/INR≈95.5で換算 |
| 為替換算 | USD/INR ≈ 95.5 | ✅ | "USD to INR exchange rate today July 2026" | https://www.exchangerates.org.uk/USD-INR-spot-exchange-rates-history-2026.html（2026年7月上旬95.2〜95.6で推移、他都市と同じレートを採用） |
| 病院 | Apollo Multispeciality Hospitals（カナル・サーキュラー・ロード）2003年開業、Apollo・パークウェイヘルス合弁、700床、東インド唯一のJCI認定、NABH認定 | ✅ | "Kolkata hospitals international patients JCI NABH accreditation" ／ "Apollo Multispeciality Hospitals Kolkata JCI accredited only hospital eastern India 2003" | 複数の第三者集約サイトで2003年開業・700床・Parkway Health合弁・東インド唯一のJCIが一致（Apollo公式サイトは直接確認できず） |
| 病院 | RTIICS（ムクンダプル）2000年開業(当初100床)、現在681床、ナラヤナ・ヘルス系列、2023年JCI認定・NABL2006年から、バングラデシュ等周辺国患者を受入 | ✅ | "Rabindranath Tagore International Institute Cardiac Sciences RTIICS Kolkata founded year international patients" ／ "RTIICS Rabindranath Tagore hospital Mukundapur beds Narayana Health JCI NABH international patients Bangladesh" | https://en.wikipedia.org/wiki/Rabindranath_Tagore_International_Institute_of_Cardiac_Sciences（2000年設立、681床、2023年JCI認定、NABL2006年からを確認） |
| 空港アクセス | ネタジ・スバス・チャンドラ・ボース国際空港(CCU)は市中心部の北へ約17km、車で約40分。Ballygunge・Aliporeへは渋滞状況により45〜60分 | ✅ | "Kolkata airport Netaji Subhas Chandra Bose International Airport access city center" | Wikipedia・複数の空港ガイドで「約17km・約40分」の記述を確認 |
| メトロ | 5路線(ブルー・グリーン・パープル・イエロー・オレンジ)、総延長73.42km・58駅（2026年時点） | ✅ | "Kolkata Metro lines stations length 2026" | https://en.wikipedia.org/wiki/Kolkata_Metro（5路線・58駅・73.42kmを確認） |
| 直行便 | コルカタ発着の日本直行便はなし | ✅ | "Kolkata direct flight from Japan Tokyo Narita Haneda" | 複数の航空券検索サイトで直行便0件、バンコク・デリー・ムンバイ等経由が中心と確認 |
| 治安 | 外務省危険レベル1(十分注意)、サダル・ストリート/ニューマーケット周辺でのスリ・置き引き、飲食物への薬物混入による強盗被害の報告 | ✅ | "\"外務省\" 海外安全 コルカタ 治安情報" | 外務省海外安全ホームページの検索結果に基づく要約。Sealdah/Howrah/Sonagachiを「危険エリア」とする記述は個人ブログ・旅行アグリゲーターのみでの言及にとどまり出典の質が低いため、`data.ts`には採用しなかった |
| 通勤 | 2025年9月23日未明の記録的豪雨（24時間で最大332mm、1988年以来最悪）で市内広範囲が冠水、感電などで市内9人死亡、一部地域で3日間冠水継続 | ✅ | "Kolkata monsoon waterlogging flooding city roads 2024 2025" ／ "Kolkata September 23 2025 flood rainfall mm 1988 record nine dead electrocution" | https://en.wikipedia.org/wiki/September_2025_Kolkata_cloudburst（日時・降水量地点別数値・死者数の内訳・冠水継続日数を確認）／ NBC News・The Watchers等の報道でも死者数・降水量が一致 |
| 日本人会 | Japan Club Kolkata、在コルカタ総領事公邸での餅つき会(2024年11月16日)・BBQ大会(2019年2月17日、96名参加)を開催 | ✅ | "コルカタ 日本人会 日本人学校 在住日本人" ／ "Kolkata Japan Club BBQ mochi tsuki association members activities" | https://www.kolkata.in.emb-japan.go.jp/itpr_en/11_000001_00813.html（在コルカタ総領事館公式サイトで2024年餅つき会を確認） |
| 日本人学校・補習校 | コルカタに現行の認定日本人学校・補習校の存在は確認できず | ✅（未確認のため空配列を採用） | "コルカタ補習授業校" ／ "\"コルカタ補習授業校\" OR \"カルカッタ補習授業校\" 文部科学省 認定 在外教育施設" | 「2020年3月より休校中」というWebSearch要約が出たが、一次情報（総領事館・文科省CLARINETデータベース）で裏付けられず、断定を避けて空配列とした |
| 日本食料品店 | コルカタ市内に確証の持てる実店舗は確認できず | ✅（未確認のため空配列を採用） | "Kolkata Japanese restaurant grocery store Japanese community expat" | 検索結果はWasabee等の日本食レストラン(飲食店)のみで、食料品店(グロッサリー)の実店舗情報は得られなかった |
| 日系企業（岡倉天心・史的関係） | 1901〜02年に岡倉天心がタゴール家に滞在、ラビンドラナート・タゴールと親交、ベンガル派の画家(アバニンドラナート・タゴール等)に日本画の技法を伝授 | ✅ | "コルカタ 日本国総領事館 在コルカタ日本国総領事館" ／ "Okakura Tenshin Kolkata Calcutta Tagore 1902 visit history" ／ "岡倉天心 インド 1901年 カルカッタ タゴール 訪問" | 在コルカタ総領事館サイトの検索スニペット、および東京外国語大学・茨城県天心記念五浦美術館等の日本語学術情報源で「1901〜02年インド滞在・カルカッタでタゴールと交流」が一致。ただし総領事館公式ページ本体は403で直接確認できず（間接確認にとどまる） |
| 日系企業（Tata Hitachi） | タタ・モーターズ40%／日立建機60%出資のタタ日立建設機械カラグプル工場、コルカタから西へ約120km、2009年稼働、20t級油圧ショベル等を生産 | ✅ | "Hitachi Construction Machinery West Bengal Kolkata factory Dankuni" | https://www.tatahitachi.co.in/manufacturing-facilities/（カラグプル工場2009年稼働を確認）／ https://en.wikipedia.org/wiki/Tata_Hitachi_Construction_Machinery（出資比率40:60を確認）／ 距離約120kmはrome2rio等の複数の距離計算サイトで確認 |
| JETRO | コルカタ単独のJETRO事務所は確認できず、インド国内拠点はニューデリー・ムンバイ・ベンガルール・チェンナイ・アーメダバードの5カ所のみ | ✅（未確認のため「単独事務所なし」と記載） | "JETRO Kolkata office West Bengal Japanese companies" ／ "jetro.go.jp overseas office India list Chennai Bengaluru Mumbai Kolkata New Delhi" | JETRO公式サイトの拠点一覧でコルカタが含まれないことを確認（ハイデラバード・プネと同様のパターン） |
| Mitsubishi Chemical半導体投資（不採用） | Mitsubishi Chemical Groupが西ベンガル州(ドゥルガープル/パナガル)での半導体投資を検討中 | ❌ 削除（採用せず） | "Mitsubishi Chemical West Bengal plant Kolkata location carbon black" | communicationstoday.co.in・electronicsforyou.bizとも403でWebFetch本文が確認できず、X(旧Twitter)投稿の見出しのみでの言及にとどまるため、`data.ts`のcorporateNoteには含めなかった |

## コルカタ（Kolkata）第2パス（執筆者自身による別クエリでの独立再検証）

上記の記述のうち特に確信度の低かった項目（Okakura Tenshinの滞在時期、バルチャリ・サリーの衰退経緯、病院の認証年、日本人会・補習校の現況、メトロ・家賃の数値）について、第1パスと異なる言い回しのクエリで再検証した記録。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 岡倉天心 | 「1902年」単年ではなく「1901〜02年（2年間）」のインド滞在、タゴール家に滞在 | ⚠️ 修正 | English Wikipedia "Okakura Kakuzō" | https://en.wikipedia.org/wiki/Okakura_Kakuz%C5%8D（"lived two years in India"、Vivekananda・Tagoreとの対話を確認。第1パスの日本語ソースでの「1901〜02年」という期間表記と整合するため、単年の「1902年」ではなく期間表記を`data.ts`で採用した） |
| バルチャリ・サリー | 飢饉・洪水による衰退→ビシュヌプルへの移住、という経緯 | ✅（第1パスの2サイトに加え3件目で再確認） | "Baluchari sari Akshay Kumar Das Subho Thakur revival Bishnupur Murshidabad decline history" | delhi-fun-dos.comの記述で「a series of famines, floods and earthquakes devastated the weaving industry in Baluchar forcing the local weavers to move to...Bishnupur around 200 kms away」を確認。Wikipedia本文は経緯を詳述しないが、矛盾する記述もないため`data.ts`の簡潔な表現（衰退→再興）はこの経緯と整合的と判断した |
| 病院（Apollo） | 2003年開業、Parkway Health（シンガポール）との合弁、700床 | ✅ | "Apollo Gleneagles Hospital Kolkata renamed Apollo Multispeciality history 2003 joint venture" | 複数の第三者集約サイトでApollo Group・Parkway Health合弁・2003年設立・700床が一致。「Apollo Gleneagles」「Apollo Multispeciality」は同一施設の別称であることを確認 |
| 病院（RTIICS） | 2023年JCI認定を再確認 | ✅ | "RTIICS Rabindranath Tagore hospital Mukundapur beds Narayana Health JCI NABH international patients Bangladesh" | 独立クエリでも「received JCI accreditation in 2023」の記述を再確認 |
| メトロ | 5路線・58駅・73.42km | ✅ | "Kolkata Metro Wikipedia total length stations 2026 news" | 別クエリでも同一の5路線・58駅・73.42kmを再確認 |
| 家賃（Salt Lake・New Town） | 2BHK ₹16,000〜28,000/月レンジ | ✅（個別リスティングにはより低い値もあるがレンジ内） | "Salt Lake Sector 1 2 3 Kolkata 2BHK apartment rent per month 2026" | Sector V個別リスティングで₹11,200〜17,000等の値も見られたが、renterfinder記事の「新築・駐在員向け」レンジ₹16,000〜28,000をclaim値として採用（個別安値リスティングは築古・非駐在員向けと判断） |
| 家賃（Ballygunge・Alipore） | 2BHK ₹25,000〜45,000/月レンジ | ✅ | "Ballygunge Kolkata 2BHK rent per month rupees 2026 expat" | squareyards集計で「₹25,000以上」「フル家具付きで₹35,000〜40,000」を確認、claim値のレンジ内 |
| 日本人会 | Japan Club Kolkataの実在と活動（餅つき会・BBQ大会） | ✅ | "Kolkata Japan Club BBQ mochi tsuki association members activities" | 在コルカタ総領事館公式サイト(kolkata.in.emb-japan.go.jp)で2024年11月の餅つき会を確認。会公式サイト(japan-club-kolkata.com)はSSL証明書期限切れで直接確認できなかったが、総領事館側の一次情報で存在は裏付けられる |
| コルカタ補習授業校の現況（不採用） | 「2020年3月より休校中」という具体的な記述 | ❌ 削除（採用せず） | "コルカタ補習授業校 休校 2020年3月" ／ "\"コルカタ補習授業校\"" | 文科省の在外教育施設認定リストにも該当校が見当たらず、休校時期を裏付ける一次情報が得られなかったため、`data.ts`では学校名を一切記載せず空配列のみとした |

### 変更サマリー（コルカタ）
- ⚠️ 修正: 岡倉天心のインド滞在を単年の「1902年」ではなく、英語版Wikipediaと日本語学術情報源の双方が一致する「1901〜02年」という期間表記に統一した。
- ❌ 削除（採用せず）: Mitsubishi Chemical Groupの西ベンガル州半導体投資検討（一次情報にWebFetchで到達できず、見出しのみの言及にとどまったため）。
- ❌ 記載見送り: コルカタ補習授業校の現況（休校時期を含め一次情報で裏付けられず、学校名を出さず空配列を採用）、日本食料品実店舗（確証の持てる実店舗なし、空配列）。
- ⚠️ 留意: バルチャリ・サリーの「飢饉・洪水による衰退」という経緯は、Wikipedia本文には明記がなく独立した2次資料2件での一致にとどまるため、`data.ts`では経緯を簡潔化し断定的な詳細（具体的な災害年など）は含めていない。
- ⚠️ 留意: Okakura Tenshin関連の総領事館公式ページは403で直接WebFetchできず、検索エンジンのスニペットおよび独立した日本語学術情報源（東京外国語大学・天心記念五浦美術館等）での間接確認にとどまる。
- ✅ 上記以外の全項目（渡航適期の気候判断、特産4件、住居エリア・家賃2件、空港アクセス、病院2件、メトロ、直行便なしの実態、治安、2025年9月豪雨の通勤リスク、Japan Club Kolkata、Tata Hitachiカラグプル工場、JETRO単独事務所なしの実態）は独立クエリで再確認済み、変更なし。

## コルカタ（Kolkata）第3パス（独立ファクトチェッカーによる再検証、既存パスは未参照）

上記2パスとは無関係に、`lib/cities/data.ts` の kolkata エントリを冒頭から精読し、固有名詞・数字を独自の言い回しのクエリで再検証した記録。既存パスの結論に引きずられないよう、既存の検証メモは意図的に読まずに実施した。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 項目 | 記述 | 判定 | 検索クエリ | 出典URL |
|---|---|---|---|---|
| 特産（料理） | ロショゴッラ、1868年ノビン・チョンドロ・ドッシュがバグバザールで考案、2017年11月GI登録 | ✅ | "Roshogolla history 1868 Nabin Chandra Das Bagbazar Kolkata GI tag 2017 Banglar Rosogolla" | https://www.dailyo.in/lifestyle/rosogolla-west-bengal-odisha-mamata-banerjee-naveen-pattanaik-20576（1868年発明、Bagbazar、2017年11月14日GI登録を確認） |
| 特産（工芸） | カーリーガート絵画、1809年建立の寺院周辺、19世紀前半発生、20世紀初頭に安価な石版画で衰退、V&Aが世界最大級コレクション | ✅ | "Kalighat painting Patachitra origin temple 1809 Victoria and Albert Museum largest collection" ／ "Kalighat painting decline early 20th century cheap lithographs printing technology competition" | https://en.wikipedia.org/wiki/Kalighat_painting（寺院建立は19世紀第1〜第2四半期と推定、1809年説と整合。20世紀初頭にドイツ製等の安価な石版画の流入で衰退、V&A所蔵645点が世界最大と明記） |
| 特産（祭事） | ドゥルガー・プージャー、2021年12月にユネスコ無形文化遺産代表一覧表に記載 | ✅ | "Durga Puja Kolkata UNESCO intangible cultural heritage December 2021" | https://www.unesco.org/en/articles/durga-puja-inscribed-unesco-representative-list-intangible-cultural-heritage-humanity（2021年12月13-18日の第16回政府間委員会で記載を確認） |
| 特産（土産） | バルチャリ・サリー、18世紀ムルシダーバード近郊バルチャル発祥、**飢饉・洪水**による衰退、20世紀前半にアクシャイ・クマール・ダスが再興、2011年GI登録 | ⚠️ 修正 | "Baluchari sari Murshidabad decline famine flood 1897 Subho Thakur revival Bishnupur history" | https://www.parinita.co.in/pages/baluchari 、https://en.wikipedia.org/wiki/Baluchari_sari ほか複数の独立サイトで衰退原因は「バギラティ川の洪水による移転」「絹糸の質低下・流行の変化・英国統治下の政治経済的要因」であり、「飢饉」を裏付ける記述は見つからず。`data.ts`から「飢饉」を削除し、洪水による移転のみを記載する形に修正した |
| 住居エリア | Ballygunge・Alipore（総領事館・外資系駐在員が多い） | ✅ | "在コルカタ日本国総領事館 住所 Ballygunge OR Alipore location address" ／ "consulate general Alipore Kolkata list foreign consulates located" | https://www.kolkata.in.emb-japan.go.jp/（日本総領事館はTollygunge、Alipore・Ballygungeに隣接する南コルカタの旧英領邸宅街）／ ドイツ総領事館はAlipore（Hastings Park Road）に所在を確認。米・英はHo Chi Minh Sarani（同じ南コルカタの外交街区）。「総領事館が多い」という記述は複数の在外公館の実在で裏付けられる |
| 住居エリア | Salt Lake（Sector VのITハブ）、New Town（ラジャルハット） | ✅ | "Salt Lake Bidhannagar Sector V IT hub New Town Rajarhat planned city Kolkata expat" | https://en.wikipedia.org/wiki/Salt_Lake_Sector-V （東インドのITハブと明記）／ New TownはSalt Lakeに次ぐ第2のITハブとして複数のIT大手が進出済みと確認 |
| 家賃 | 2BHK Ballygunge・Alipore $260-470、Salt Lake・New Town $170-295、USD/INR≈95.5 | ✅（概ねのレンジで独立確認） | "Kolkata expat rent 2BHK Ballygunge Alipore Salt Lake New Town monthly rupees dollars 2025" ／ "USD INR exchange rate July 2026" | renterfinder.com（Salt Lake・New Town 2BHK ₹15,000-25,000、Ballygunge等 ₹25,000超）／ alanchand.com・x-rates.com（2026年7月上旬のUSD/INRは95.2-95.6）。円換算後のレンジと概ね整合 |
| 治安 | 外務省危険レベル1、サダル・ストリート/ニューマーケットでのスリ・置き引き、飲食物への薬物混入の被害報告 | ✅ | "Kolkata Sadar Street New Market pickpocketing theft drink spiking tourists warning" ／ "コルカタ サダルストリート ニューマーケット 睡眠薬 混入 強盗 日本人 被害" | 外務省海外安全ホームページ（インド大都市を危険レベル1に指定、サダル・ストリート等での薬物混入強盗事例を明記）／ 独立の旅行安全サイト複数でサダル・ストリート/ニューマーケットでの窃盗多発を確認 |
| 病院（Apollo） | 2003年開業、Apollo・パークウェイヘルス(シンガポール)合弁、**700床**、東インド唯一のJCI認定、NABH認定 | ⚠️ 修正 | "Apollo Multispeciality Hospitals Kolkata Canal Circular Road JCI accreditation history" ／ Apollo公式サイト直接取得（`curl`でapollohospitals.com/kolkata/about-us/を取得） | https://www.apollohospitals.com/kolkata/about-us/ を直接取得したところ、同一ページ内でJSON-LDメタ記述は「700-bedded」、本文コピーは「750-bedded」と**病院自身の公式サイト内で数値が矛盾**。第三者サイトも700/750で割れており確定できないため、`data.ts`からベッド数の記載を削除した（開業年2003・Parkway Health合弁・JCI唯一認定・NABH認定は本文で確認でき変更なし） |
| 病院（RTIICS） | 2000年開業(当初100床の心臓専門病院)、現在681床、ナラヤナ・ヘルス系列、2023年JCI認定・NABL2006年から、バングラデシュ等周辺国患者を受入 | ✅ | "Rabindranath Tagore International Institute of Cardiac Sciences RTIICS Mukundapur Narayana Health JCI 2023" ／ "RTIICS Mukundapur \"100 bed\" cardiac hospital 2000 Asia Heart Foundation Devi Shetty original" | https://en.wikipedia.org/wiki/Rabindranath_Tagore_International_Institute_of_Cardiac_Sciences（2000年4月設立・681床・NABH認定を確認）／ 独立記事で当初100床のAsia Heart Foundation系施設として開業、2023年JCI認定、NABL2006年から、バングラデシュ・ブータン・ネパール・ミャンマー・アフリカからの患者受入を確認 |
| 空港アクセス | CCU空港は市中心部の北へ約17km、車で約40分 | ✅ | "Kolkata Netaji Subhas Chandra Bose International Airport distance city center Dum Dum km" | 複数の空港ガイドで15〜17kmのレンジを確認、「約17km」は妥当 |
| メトロ | 5路線、総延長73.42km・58駅、インド最古の地下鉄網 | ✅ | "Kolkata Metro 5 lines Blue Green Purple Yellow Orange total length km stations 2026" ／ "Kolkata Metro India's oldest metro system first opened 1984" | https://en.wikipedia.org/wiki/Kolkata_Metro（73.42km・58駅・5路線、1984年開業でインド初の地下鉄と明記） |
| 直行便 | コルカタ発着の日本直行便なし、バンコク・シンガポール・香港等の第三国ハブ経由が一般的 | ✅ | "Kolkata direct flight Japan Narita Haneda nonexistent connecting Bangkok Singapore Hong Kong" | flightroutes.com等でCCU-NRT/HND間の直行便0件を確認、タイ国際航空によるバンコク経由が主要ルートの一つと確認 |
| 通勤（2025年9月豪雨） | 一部地点で**3時間程度**に300mm超、24時間で最大332mm、**1988年以来最も激しい降雨**、感電等で9人死亡、バンドロニ・ジャドブプル等で3日間冠水継続 | ⚠️ 修正 | "Kolkata flood September 23 2025 record rainfall 300mm deaths electrocution" ／ "Kolkata September 2025 flood \"1988\" comparison worst rainfall since record" ／ "Kolkata flood 2025 Bansdroni Jadavpur waterlogging three days persisted" | https://en.wikipedia.org/wiki/September_2025_Kolkata_cloudburst（最大332mmはガリア・カムダハリ地区の観測値、降雨は「数時間」で集中と記載され「3時間」の明記なし。「1988年以来」は複数の報道で「1986年以来」「1988年以来」と表記が割れ確定できず）。9人死亡・感電・バンドロニ/ジャドブプル等3日間冠水は複数の独立報道で一致し変更なし。`data.ts`では「3時間程度」を「数時間のうちに」に、332mmの地点を明記し、「1988年以来」の一文を削除した |
| 日本人会 | Japan Club Kolkata、総領事公邸での餅つき会等を開催 | ✅ | "Japan Club Kolkata 在コルカタ日本人会" | https://www.kolkata.in.emb-japan.go.jp/itpr_en/11_000001_00813.html（2024年11月16日の総領事公邸餅つき会を確認） |
| **日本・コルカタ関係史（岡倉天心）** | 「1901〜02年に岡倉天心がタゴール家に滞在してラビンドラナート・タゴールと親交を結び、**ベンガル派の画家たちに日本画の技法を伝えた**」 | ⚠️ 修正（重要） | "Okakura Tenshin 1901 1902 stayed Tagore family Jorasanko Kolkata Rabindranath" ／ "Okakura Kakuzo Bengal School painters Japanese painting technique wash Yokoyama Taikan Hishida Shunso" ／ "Okakura Kakuzo sent Taikan Hishida Calcutta 1903 wash technique Abanindranath Tagore Bengal school" | 岡倉天心は1901年12月31日にインドへ到着し、ジョラサンコのタゴール家に約9か月滞在してラビンドラナート・タゴールと親交を結んだ点は確認（Another Asia: Rabindranath Tagore and Okakura Tenshin ほか）。しかし、ベンガル派の画家（アバニンドラナート・タゴール、ガガネンドラナート・タゴール）に日本画の没骨（ウォッシュ）技法を実際に伝えたのは、岡倉が帰国後の**1903年**に派遣した弟子の**横山大観・菱田春草**であり、Britannica系の記述でも「Yokoyama and Hishida visited Calcutta in 1903 and their watercolor techniques inspired Abanindranath Tagore」「taught the techniques of Japanese brush-n-ink works and watercolour wash」と明記されている。岡倉自身が1901〜02年の滞在中に技法を直接教えたとする記述の裏付けは取れず、事実関係が「誰が・いつ」の点で不正確だった。`data.ts`を「1901〜02年に岡倉が滞在しタゴールと親交→帰国後1903年に横山大観・菱田春草を派遣し、両者が技法を伝えた」という2段階の記述に訂正した |
| 日系企業（Tata Hitachi） | タタ・モーターズ40%／日立建機60%出資、カラグプル工場、コルカタから西へ約120km、2009年稼働 | ✅ | "Tata Hitachi Construction Machinery Kharagpur plant West Bengal 2009 joint venture 40% 60%" ／ "Kharagpur distance from Kolkata km west" | en.wikipedia.org/wiki/Tata_Hitachi_Construction_Machinery（2009年稼働、2010年の資本再編でHitachi60%/Tata40%を確認）／ 直線距離約119-120km、道路距離約138kmを複数の距離計算サイトで確認、「約120km」は妥当 |
| JETRO | コルカタに単独事務所なし、インド国内拠点はニューデリー・ムンバイ・ベンガルール・チェンナイ・アーメダバードの5カ所 | ✅ | "JETRO India offices New Delhi Mumbai Bengaluru Chennai Ahmedabad list" | jetro.go.jp記載の拠点情報で5都市（コルカタを含まず）を確認、`data.ts`の記述と完全一致 |

### 変更サマリー（コルカタ・第3パス）
- ⚠️ 修正（最重要）: 「岡倉天心がベンガル派の画家に日本画の技法を伝えた」という一文を、事実関係の主体を訂正。岡倉本人が1901〜02年の滞在中に技法を教えたのではなく、帰国後の1903年に派遣した横山大観・菱田春草がアバニンドラナート・タゴールらに没骨（ウォッシュ）技法を伝えたというのが独立した英語圏の学術・百科事典系情報源の一致した記述。
- ⚠️ 修正: バルチャリ・サリーの衰退原因から「飢饉」を削除し、複数の独立情報源が一致する「バギラティ川の洪水による移転」のみを記載。
- ⚠️ 修正: Apolloホスピタル（カナル・サーキュラー・ロード）の病床数「700床」を削除。病院自身の公式サイト内でJSON-LDメタと本文コピーの記載が700/750で矛盾しており確定できないため。
- ⚠️ 修正: 2025年9月コルカタ豪雨の記述から、根拠不明瞭な「3時間程度」を「数時間のうちに」へ、また複数報道で1986年/1988年と表記が割れる「1988年以来最も激しい降雨」という一文を削除。332mmの観測地点（ガリア・カムダハリ）を明記して精度を上げた。
- ✅ 上記以外の全項目（気候適期、特産3件、住居エリア2件、家賃2件、治安、RTIICS、空港アクセス、メトロ、直行便、Japan Club Kolkata、Tata Hitachi、JETRO）は独立クエリで再確認し、変更なし。

## 名物画像（Wikimedia Commons キュレーション）

`lib/cities/types.ts` の `CitySpecialty.imageUrl` / `imageCredit` に採用した画像の検証記録。Wikimedia Commons API（`action=query&prop=imageinfo&iiprop=url|extmetadata`）でライセンスと被写体を個別確認し、CC BY / CC BY-SA（バージョン問わず）/ CC0 / パブリックドメインのみを採用。NC・ND・政府公開データライセンス（GODL-India 等、上記4種に該当しないもの）は不採用とした。

### ムンバイ

| 都市 | 名物 | File名 | ライセンス | 作者 | 判定 | ファイルページURL |
|---|---|---|---|---|---|---|
| ムンバイ | ヴァダパヴ | Vada_pav_01.jpg | CC BY-SA 4.0 | Marajozkee | 採用 | https://commons.wikimedia.org/wiki/File:Vada_pav_01.jpg |
| ムンバイ | ボンビル（ボンベイダック） | Fried_Bombay_Duck.JPG | CC BY-SA 4.0 | Durvankur2012 | 採用（揚げ調理済みの状態を確認、note の「揚げた郷土料理」と一致） | https://commons.wikimedia.org/wiki/File:Fried_Bombay_Duck.JPG |
| ムンバイ | コルハープリ・チャッパル | Kolhapuri_Chappals_in_roadside_shop_in_Kolhapur1.jpg | CC BY-SA 4.0 | सुबोध कुलकर्णी | 採用 | https://commons.wikimedia.org/wiki/File:Kolhapuri_Chappals_in_roadside_shop_in_Kolhapur1.jpg |
| ムンバイ | ガネーシュ・チャトゥルティ | Lalbaugcha_Raja_Mumbai_Ganesh_Utsav_2024.jpg | CC BY-SA 4.0 | Recordkarnabhai | 採用（ムンバイの実際の神像・祭礼を撮影） | https://commons.wikimedia.org/wiki/File:Lalbaugcha_Raja_Mumbai_Ganesh_Utsav_2024.jpg |

### デリー首都圏

| 都市 | 名物 | File名 | ライセンス | 作者 | 判定 | ファイルページURL |
|---|---|---|---|---|---|---|
| デリー首都圏 | バターチキン | Butter_Chicken.jpg | CC BY-SA 4.0 | Baruah1993 | 採用 | https://commons.wikimedia.org/wiki/File:Butter_Chicken.jpg |
| デリー首都圏 | パランテワーリー・ガリー | Dal_Parantha_from_Paranthe_Wali_Gali,_Chandni_Chowk,_India.jpg | CC BY-SA 4.0 | Ravi Dwivedi | 採用（当該小路で撮影されたパラーターの実写） | https://commons.wikimedia.org/wiki/File:Dal_Parantha_from_Paranthe_Wali_Gali,_Chandni_Chowk,_India.jpg |
| デリー首都圏 | クンダン・ミーナーカーリー細工（ダリバー・カラーン） | — | — | — | 見送り：クンダン技法とミーナーカーリー技法を明確に併記した画像がCommons上に見つからなかった。関連候補（イラン式ミーナーカーリー、ムガル期宝飾品の博物館展示写真）は被写体が異なる／技法の明記がなく被写体ゲートを満たさないため不採用 | — |
| デリー首都圏 | 共和国記念日パレード | — | — | — | 見送り：候補画像（山車・戦車・観閲式典）はすべてインド政府（国防省／PIB）撮影で `GODL-India` ライセンスのみ。CC BY/BY-SA/CC0/PDのいずれにも該当せず、ライセンスゲートで不採用 | — |

### グルガオン

| 都市 | 名物 | File名 | ライセンス | 作者 | 判定 | ファイルページURL |
|---|---|---|---|---|---|---|
| グルガオン | シータラー・マーター寺院の祭礼（メーラー） | — | — | — | 見送り：Commons上の「Sheetla Mata Temple」該当画像はグワリオル・パティアラ・カウシャンビー等の同名別寺院で、グルガオンの当該寺院を撮影した画像が見つからなかったため被写体ゲート不合格 | — |
| グルガオン | バルジー（Baljee）のチョーレー・バトゥーレー | Chole_Bhature_1.jpg | CC BY-SA 4.0 | Gaurav Dhwaj Khadka | 採用（バルジー店舗自体の写真は見つからず、note が「北インド一帯の定番料理」と位置付けるチョーレー・バトゥーレーそのものの一般的な写真として採用） | https://commons.wikimedia.org/wiki/File:Chole_Bhature_1.jpg |

採用7件・見送り3件（合計10特産品）。

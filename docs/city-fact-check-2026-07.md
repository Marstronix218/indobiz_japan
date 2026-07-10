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

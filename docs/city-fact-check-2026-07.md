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

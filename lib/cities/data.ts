import type { City } from "./types"

export const CITIES: City[] = [
  {
    slug: "mumbai",
    name: "Mumbai",
    jp: "ムンバイ",
    tag: "金融・港湾",
    pop: "2,041万",
    gdp: "$3,100億",
    note: "西部回廊の物流ハブ。港湾混雑が緩和傾向で完成車・部品の輸送リードタイムが安定化。",
    tone: "warm",
    lat: 19.076,
    lon: 72.8777,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2b/Mumbai_Bandra-Worli_Sea_Link.jpg",
    imageCredit: "Bandra-Worli Sea Link · Wikimedia",
    bestMonths: [11, 12, 1, 2],
    avoidMonths: [6, 7, 8, 9],
    specialties: [
      {
        jp: "ヴァダパヴ",
        kind: "料理",
        note: "じゃがいものコロッケをパンに挟んだムンバイ発祥のファストフード。1966年にダーダル駅前で売られ始めたのが起源とされ、市内に屋台が多数ある。",
      },
      {
        jp: "ボンビル（ボンベイダック）",
        kind: "料理",
        note: "ムンバイ沿岸で獲れるヒメエソ科の魚を揚げた郷土料理。「ボンベイダック」の名で知られるが実際は魚。",
      },
      {
        jp: "コルハープリ・チャッパル",
        kind: "工芸",
        note: "隣接するコルハープル地方発祥の牛革サンダルで、2019年に地理的表示(GI)登録された。コラバ・コーズウェイなどムンバイ市内の老舗店で購入できる。",
      },
      {
        jp: "ガネーシュ・チャトゥルティ",
        kind: "祭事",
        note: "8〜9月にムンバイで最大規模に祝われるヒンドゥー教の祭礼。ムンバイ市当局（BMC）の2024年統計では公共（サルヴァジャニック）神像だけで6万体超が設置され、家庭用を含めると年間15万体超が海への投入で幕を閉じる。",
      },
    ],
    living: {
      housing: {
        areas: ["Bandra West", "Powai", "Lower Parel"],
        rents: [
          { layout: "2BHK（Powai、駐在員向け）", minUsd: 580, maxUsd: 950 },
          {
            layout: "2BHK（Bandra West、駐在員向け）",
            minUsd: 950,
            maxUsd: 1900,
          },
        ],
        note: "Powaiは日本人学校や日系オフィスの集積地として駐在員に人気。Bandra Westは商業施設やBKCへのアクセスに優れるが家賃はPowaiより高め。",
      },
      safetyHealth: {
        safetyNote: "大都市としては比較的安全だが、駅や市場などの人混みでのスリ・置き引きに注意が必要。深夜はアプリ配車や指定タクシー乗り場を利用し、カマティプラやダラヴィなど治安の弱いエリアの単独徒歩は避けたい。",
        hospitals: [
          {
            name: "Kokilaben Dhirubhai Ambani Hospital（アンデリー西）",
            note: "JCI認定の総合病院で国際患者向け窓口を持つ。Powai・Bandra方面からもアクセス可能。",
          },
          {
            name: "P. D. Hinduja Hospital（マーヒム）",
            note: "1951年開業の大規模総合病院。国際患者部門があり通訳手配やビザ書類支援に対応。",
          },
          {
            name: "Lilavati Hospital & Research Centre（バンドラ）",
            note: "空港から車で約20分。国際患者向け専用デスクと通訳サポートを備える。",
          },
        ],
        healthNote: "いずれの病院も国際患者向け窓口を備えるが、日本語対応スタッフが常駐しているとの確証は得られなかった。英語での症状説明に不安がある場合は、海外旅行保険の医療アシスタンスサービス経由で通訳付き受診を手配するのが安全。",
      },
      transport: {
        fromAirport: "CSMIA（チャトラパティ・シヴァージー国際空港）からBandraまで車で約20〜45分、Powaiまで約25〜40分。渋滞状況により変動する。",
        inCity: "郊外電車（西線・中央線）とムンバイメトロが基幹交通。Uber・Olaなどアプリ配車も広く普及しているが、道路渋滞が慢性的。",
        directFlightFromJapan: "ANA（全日空）が成田―ムンバイ間で直行便を運航（2026年は季節により週3〜7便の間で変動、3月末〜7月中旬は毎日運航に増便）。2026年6月15日からはエア・インディアが羽田―ムンバイ間で週4便の直行便を新規就航しており、成田便のみが選択肢ではない。所要時間はいずれも片道約9〜10時間。",
        commuteNote: "モンスーン期（6〜9月）は道路冠水や鉄道運休で通勤に大幅な遅れが生じやすく、雨季の出張日程には余裕を持たせたい。平常時も渋滞で移動に30〜60分の上乗せを見込む必要がある。",
      },
      japaneseCommunity: {
        association: "ムンバイ日本人会（mumbai-japan.in）",
        schools: ["ムンバイ日本人学校（Powai・ヒランダーニ地区）"],
        groceries: [],
        corporateNote: "JETROムンバイ事務所はBKC（バンドラ・クルラ・コンプレックス）に所在し、日系企業の進出相談窓口となっている。日本人学校や日本人会もPowai周辺に集積しており、駐在員はPowai・Bandra一帯に生活基盤を置くケースが多い。",
      },
      verifiedAt: "2026-07",
    },
  },
  {
    slug: "delhi-ncr",
    name: "Delhi NCR",
    jp: "デリー首都圏",
    tag: "二輪・電装・行政",
    pop: "3,200万",
    gdp: "$3,700億",
    note: "Honda・Yamaha・Maruti Suzuki の量産拠点が集中。中央官庁との折衝・規制対応の起点。",
    tone: "cool",
    lat: 28.6139,
    lon: 77.209,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/40/Jama_Masjid_2011.jpg",
    imageCredit: "Jama Masjid · Wikimedia",
    bestMonths: [2, 3],
    avoidMonths: [1, 4, 5, 6, 7, 8, 9, 11, 12],
    specialties: [
      {
        jp: "バターチキン",
        kind: "料理",
        note: "1947年の印パ分離独立後にデリーへ移転した名店モティ・マハル(Moti Mahal)の初代シェフ、クンダン・ラル・グジュラールが考案したとされる料理。タンドールで焼いた鶏肉が乾燥するのを防ぐため、トマト・バター・クリームのグレービーに漬け込んだのが始まりとされる。",
      },
      {
        jp: "パランテワーリー・ガリー",
        kind: "料理",
        note: "オールドデリーのチャンドニーチョークにある揚げパラーター(パラタ)専門店が並ぶ小路。1870年代創業の老舗が現在も営業を続け、じゃがいもやカリフラワー、ラブリー(練乳)など多彩な具材を詰めたパラーターを提供する。",
      },
      {
        jp: "クンダン・ミーナーカーリー細工（ダリバー・カラーン）",
        kind: "工芸",
        note: "17世紀ムガル帝国シャー・ジャハーン治世に発展した、チャンドニーチョークの宝飾品街ダリバー・カラーンに伝わる金銀細工。金箔で宝石を留める「クンダン」技法と、彩色エナメルを施す「ミーナーカーリー」技法が特徴。",
      },
      {
        jp: "共和国記念日パレード",
        kind: "祭事",
        note: "1950年1月26日のインド憲法施行を記念し、毎年1月26日にデリー中心部のカルタヴィヤ・パト(旧ラージパト)で開催される軍事・文化パレード。インドで最も重要な国家式典の一つとされる。",
      },
    ],
    living: {
      housing: {
        areas: ["Vasant Kunj", "Defence Colony", "Gurgaon（Golf Course Road）"],
        rents: [
          {
            layout: "3LDK（Defence Colony、駐在員向け）",
            minUsd: 1360,
            maxUsd: 1730,
          },
          {
            layout: "3LDK（Gurgaon・Park Place、駐在員向け）",
            minUsd: 1410,
            maxUsd: 1470,
          },
        ],
        note: "Vasant Kunjは空港に近くニューデリー日本人学校が所在するため駐在員に選ばれやすい。Defence Colonyは南デリーの高級住宅街で日本人駐在員の入居例が多い。グルガオンではゴルフコースロード周辺のコンドミニアムに住む日本人駐在員が多いとされる。",
      },
      safetyHealth: {
        safetyNote: "Vasant Kunj・Defence Colonyなど南デリー・中央デリーは駐在員も多く比較的治安が安定している。デリーメトロは進行方向先頭車両が女性専用となっているが、混雑する市場や駅ではスリ・置き引きに注意が必要。夜間の一人歩きは避け、Uber・Olaなどアプリ配車の利用が推奨される。",
        hospitals: [
          {
            name: "Indraprastha Apollo Hospital（サリタ・ヴィハール、マトゥラー・ロード）",
            note: "2005年にインドで初めてJCI(国際病院評価機構)認定を取得した総合病院。年間約9,500人の国際患者を受け入れ、通訳・ビザ手続き支援などの窓口を備える。",
          },
          {
            name: "Medanta – The Medicity（グルガオン）",
            note: "2009年開業、JCI・NABH・NABL認定を取得した43エーカーの大規模病院。年間2万人超の国際患者を受け入れ、心臓外科・肝移植・脳神経外科などに強みを持つ。",
          },
          {
            name: "Max Super Speciality Hospital, Saket（南デリー）",
            note: "2017年にJCI認定を取得(NABH・NABL認定も保有)。500床超の総合病院で、腫瘍内科・脳神経内科・腎臓内科など幅広い診療科を持つ。",
          },
        ],
        healthNote: "デリー首都圏は例年10月末から翌1月にかけて大気汚染が深刻化する。インドの環境シンクタンクCSE(Centre for Science and Environment)の分析では、2025年は10〜11月の平均PM2.5が163µg/m³、12月は210µg/m³まで上昇し、12月14日には大気質指数(AQI)が「深刻」水準の461を記録した。2026年1月も月平均PM2.5が211.77µg/m³に達しており、WHOの年平均基準値(5µg/m³)を大きく上回る。2〜3月にかけて季節風が強まり大気質は改善傾向となる(2026年2月平均129.75µg/m³、3月平均79.03µg/m³)。子供連れや呼吸器疾患のある駐在員は、12〜1月の外出時にマスク着用や室内空気清浄機の使用を検討したい。",
      },
      transport: {
        fromAirport: "IGI(インディラ・ガンディー国際空港)からVasant Kunjまで車で約10分、Defence Colonyまで約20〜30分、グルガオンまで約20〜45分(渋滞状況により変動)。",
        inCity: "デリーメトロが市内・グルガオン方面まで広くカバーする基幹交通網。Uber・Olaなどアプリ配車も普及しているが、道路渋滞は慢性的。",
        directFlightFromJapan: "JAL(日本航空)が2026年1月17日より成田―デリー間にボーイング787-8型機で新規就航し、毎日運航・所要約10時間15分。ANA(全日空)は羽田―デリー間(NH837/838便、エア・インディアとのコードシェアではAI8003便)を運航しており、所要時間は概ね9〜10時間。",
        commuteNote: "冬季(12月中旬〜2月上旬)は濃霧により空港運用に大きな影響が出ることがあり、2026年1月2日には視界不良で66便が欠航するなど大規模な遅延・欠航が発生した。出張日程には余裕を持たせたい。モンスーン期(7〜9月)は道路冠水による渋滞も生じやすい。",
      },
      japaneseCommunity: {
        association: "デリー日本人会（delhinihonjinkai.in）",
        schools: ["ニューデリー日本人学校（Vasant Kunj）"],
        groceries: [
          "大和屋（Yamato-ya、デリー店：Green Park・2002年開店／グルガオン店：Boom Plaza 2F・2010年開店）",
        ],
        corporateNote: "JETROニューデリー事務所はネルー・プレイスのEros Corporate Towerに所在し、日系企業の進出相談窓口となっている。ニューデリー日本人学校はデリー日本人会が1964年に設立し、Vasant Kunjに校舎を置く。日本人駐在員はデリー南部(Vasant Kunj・Defence Colony)またはグルガオンのゴルフコースロード周辺に生活基盤を置くケースが多い。",
      },
      verifiedAt: "2026-07",
    },
  },
  {
    slug: "gurgaon",
    name: "Gurgaon",
    jp: "グルガオン",
    tag: "IT・GCC・R&D",
    pop: "150万",
    gdp: "$420億",
    note: "NCR の高層オフィス集積地。日系を含む GCC や外資系本社機能の受け皿として存在感が強い。",
    tone: "cool",
    lat: 28.4595,
    lon: 77.0266,
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/DLF%20Cyber%20Hub,%20Gurgaon%202.jpg",
    imageCredit: "DLF Cyber Hub, Gurgaon · Wikimedia",
  },
  {
    slug: "bengaluru",
    name: "Bengaluru",
    jp: "ベンガルール",
    tag: "IT・GCC・R&D",
    pop: "1,330万",
    gdp: "$1,100億",
    note: "日系GCC(グローバル・キャパビリティ・センター)設置の最有力候補。女性エンジニア比率が上昇傾向。",
    tone: "green",
    lat: 12.9716,
    lon: 77.5946,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/cd/View_from_Visvesvaraya_Industrial_and_Technological_Museum_%282025%29_02.jpg",
    imageCredit: "Bengaluru skyline · Wikimedia",
  },
  {
    slug: "chennai",
    name: "Chennai",
    jp: "チェンナイ",
    tag: "自動車・部品",
    pop: "1,170万",
    gdp: "$840億",
    note: "日系自動車・部品の集積地。タミル・ナードゥ州が人材定着・電動化補助の制度運用で先行。",
    tone: "cool",
    lat: 13.0827,
    lon: 80.2707,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/32/Chennai_Central.jpg",
    imageCredit: "Chennai Central · Wikimedia",
  },
  {
    slug: "pune",
    name: "Pune",
    jp: "プネ",
    tag: "製造・自動車",
    pop: "720万",
    gdp: "$690億",
    note: "Bajaj・Volkswagen・Tata Motors の重工業ベルト。日系工作機械・部品メーカーの集積も進む。",
    tone: "warm",
    lat: 18.5204,
    lon: 73.8567,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Pune_West_skyline_-_March_2017.jpg/1280px-Pune_West_skyline_-_March_2017.jpg",
    imageCredit: "Pune West skyline · Wikimedia",
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    jp: "ハイデラバード",
    tag: "IT・製薬・半導体",
    pop: "1,100万",
    gdp: "$750億",
    note: "テランガナ州主導でファブ誘致と製薬クラスターを拡大。日系製薬・素材の現地化検討が増加。",
    tone: "green",
    lat: 17.385,
    lon: 78.4867,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/88/Downtown_hyderabad_drone.png",
    imageCredit: "Hyderabad downtown · Wikimedia",
  },
  {
    slug: "ahmedabad",
    name: "Ahmedabad",
    jp: "アフマダーバード",
    tag: "半導体・化学",
    pop: "850万",
    gdp: "$680億",
    note: "グジャラート州の半導体クラスター形成が加速。GIFT City で金融・データセンター特区も拡張中。",
    tone: "warm",
    lat: 23.0225,
    lon: 72.5714,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sabarmati_riverside.jpg/1280px-Sabarmati_riverside.jpg",
    imageCredit: "Sabarmati Riverside · Wikimedia",
  },
  {
    slug: "kolkata",
    name: "Kolkata",
    jp: "コルカタ",
    tag: "東部物流・素材",
    pop: "1,500万",
    gdp: "$1,500億",
    note: "東インド・ASEAN接続の起点。鉄鋼・化学の集積地で、北東州への物流ハブとしての存在感が再評価。",
    tone: "cool",
    lat: 22.5726,
    lon: 88.3639,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d7/Kolkata_maidan.jpg",
    imageCredit: "Kolkata Maidan · Wikimedia",
  },
]

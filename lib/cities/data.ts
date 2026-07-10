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
    bestMonths: [2, 3],
    avoidMonths: [1, 4, 5, 6, 7, 8, 9, 11, 12],
    specialties: [
      {
        jp: "シータラー・マーター寺院の祭礼（メーラー）",
        kind: "祭事",
        note: "グルガオン旧市街のシータラー・マーター寺院で、ヒンドゥー暦チャイトラ月（3〜4月）に開かれる大規模な縁日。伝承では「グルガオン」の地名自体がグル・ドローナ（ドローナーチャーリヤ）に由来するとされ、同寺院は師の妻クリピー（シータラー女神）を祀るとされる、都市の起源伝承と結びついた祭礼として知られる。",
      },
      {
        jp: "バルジー（Baljee）のチョーレー・バトゥーレー",
        kind: "料理",
        note: "旧グルガオンのサダル・バザールで1970年代創業とされる老舗食堂。ひよこ豆カレー（チョーレー）を揚げパン（バトゥーレー）と共に供する北インド一帯の定番料理だが、高層オフィス街として再開発される以前からの数少ない旧市街の食文化として地元で知られる。",
      },
    ],
    living: {
      housing: {
        areas: [
          "DLFゴルフコースロード（セクター42・53〜56）",
          "スシャント・ロック（セクター43）",
          "ゴルフコース・エクステンション・ロード",
        ],
        rents: [
          {
            layout: "2BHK（ゴルフコースロード、駐在員向け）",
            minUsd: 310,
            maxUsd: 840,
          },
          {
            layout: "3BHK（DLFパークプレイス・セクター54、駐在員向け）",
            minUsd: 960,
            maxUsd: 1280,
          },
        ],
        note: "ニューデリー日本人学校のスクールバスは2024年度、グルガオン地区でベレール（DLF The Belaire）・ICON・パームスプリングス・パークプレイス・ピナクル・ウェストエンドハイツ・クレストなど、いずれもゴルフコースロード沿いのDLF系コンドミニアムに停車しており、日本人駐在員家庭はこの一帯に集住する傾向がうかがえる。",
      },
      safetyHealth: {
        safetyNote: "新興セクターのゲーテッドコミュニティは警備員・監視カメラを備え比較的安全とされる一方、旧市街（オールド・グルガオン）や急速に市街化が進むエリアは治安面でやや劣るとされる。混雑する市場や駅でのスリ・ひったくりに注意し、夜間の一人歩きは避けてUber・Olaなどアプリ配車を利用するのが望ましい。",
        hospitals: [
          {
            name: "Medanta – The Medicity（セクター38）",
            note: "2009年開業、JCI・NABH・NABL認定を取得した43エーカーの大規模病院。年間2万人超の国際患者を受け入れ、心臓外科・肝移植・脳神経外科などに強みを持つ。デリーメトロ・イエローラインのミレニアム・シティ・センター駅から車で約10分。",
          },
          {
            name: "Fortis Memorial Research Institute（セクター44、HUDAシティセンター向かい）",
            note: "2013年開業のJCI・NABH認定病院。クアタナリーケア（高度専門医療）を掲げる大規模総合病院で、国際患者の受け入れ体制を備える。",
          },
          {
            name: "Artemis Hospital（セクター51）",
            note: "2007年開業、9エーカーの敷地に400床超を有する総合病院。2013年にグルガオンで初めてJCI認定を取得し、2017年にNABH認定も取得した。",
          },
        ],
        healthNote: "グルガオンもデリー首都圏の一部として、例年10月末から翌1月にかけて同様の深刻な大気汚染に見舞われる（季節ごとの汚染度合いの詳細はデリー首都圏の項目を参照）。グルグラム市域にはセクター51・ヴィカス・サダン・NISEグワルパハリなど独自の大気質モニタリング局があり、CPCBのデリー市内局とは別に観測データを公表しているが、月次平均値を確認できる一次資料は見つからなかったため具体的な数値はここには記載しない。2〜3月にかけて季節風により大気質が改善する傾向はデリーと共通する。",
      },
      transport: {
        fromAirport: "グルガオン自体に空港はなく、最寄り空港はデリーのIGI（インディラ・ガンディー国際空港）。ゴルフコースロード・DLFサイバーシティ方面まで車で通常20〜45分（NH-48・マヒパルプール経由、渋滞状況により変動）。",
        inCity: "ラピッドメトロ・グルガオン（2013年開業、2017年にセクター55-56まで延伸）がデリーメトロ・イエローラインとシカンダルプル駅で接続し、DLFサイバーシティ方面のフィーダー路線となっている。デリーメトロ・イエローライン自体もグルガオン市内まで乗り入れ、Medanta最寄りのミレニアム・シティ・センター駅などがある。Uber・Olaなどアプリ配車も広く普及。",
        directFlightFromJapan: "グルガオン発着の直行便はなく、日本からの直行便はいずれもデリー（IGI）発着（JAL成田便・ANA羽田便。便数・所要時間の詳細はデリー首都圏の項目を参照）。IGIからグルガオンまでは車で約20〜45分。",
        commuteNote: "冬季の濃霧・大気汚染やモンスーン期（7〜9月）の道路冠水など、空港アクセスにおける季節要因はデリー中心部と共通する（詳細はデリー首都圏の項目を参照）。ゴルフコースロードなど市内幹線道路は通勤時間帯（9〜11時、18〜20時）の渋滞が特に激しく、移動には余裕を持たせたい。",
      },
      japaneseCommunity: {
        schools: [
          "ニューデリー日本人学校（Vasant Kunj）※グルガオン地区にもスクールバスを運行",
        ],
        groceries: ["大和屋（Yamato-ya）グルガオン店（Boom Plaza 2F、セクター57）"],
        corporateNote: "グルガオンはNCRにおけるGCC（グローバル・キャパビリティ・センター）集積の中核で、DLFサイバーシティ・ゴルフコースロード・ウドヨグ・ビハール一帯にGCCが集中する。ハリヤナ州は2025年に「Haryana GCC Policy」を打ち出し、グルガオンを技術ハブとして強化する方針を示した。GCC・バックオフィス機能の受け皿としての実務的な重要性が、デリー首都圏の一部でありながらこのページを独立して設ける理由となっている。",
      },
      verifiedAt: "2026-07",
    },
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
    bestMonths: [12, 1, 2],
    avoidMonths: [],
    specialties: [
      {
        jp: "MTR（マーヴァッリ・ティフィン・ルームズ）のマサラ・ドーサとラヴァ・イドリー",
        kind: "料理",
        note: "1924年にマイヤ兄弟がラールバーグ・フォート・ロードで開いた「ブラーミン・コーヒー・クラブ」を起源とするベンガルールの老舗食堂。第二次大戦中の米不足を機に考案したラヴァ・イドリー（セモリナ粉のイドリー）は南インドの定番朝食として全国に広まった。",
      },
      {
        jp: "チャンナパトナの木工玩具",
        kind: "工芸",
        note: "ベンガルール近郊ラーマナガラ県チャンナパトナで作られる、天然のラック染料で彩色した木製玩具・人形。18世紀にマイソール藩王ティプー・スルターンが招いたペルシャ職人の技法に起源を持つとされ、2005年に地理的表示(GI)登録された。",
      },
      {
        jp: "ベンガルール・カルガ祭",
        kind: "祭事",
        note: "旧市街ティガラルペーテのダルマラーヤ・スワーミ寺院を中心に、ヒンドゥー暦チャイトラ月（3〜4月）に開かれる祭礼。女神に扮した男性が花で飾った水瓶（カルガ）を頭上に載せて練り歩く儀礼で知られ、寺院自体はベンガルール建都(1530年)以前からの800年以上の歴史を持つとされる。",
      },
      {
        jp: "デヴァナハッリ・ポメロ（チャコッタ）",
        kind: "土産",
        note: "ベンガルール国際空港のあるデヴァナハッリ地区周辺でのみ栽培される柑橘で、2009〜10年に地理的表示(GI)登録された。1個2〜2.5kg（大きいもので10kg近く）にもなる大玉が特徴で、空港開発による農地転用で栽培面積が減少し希少化が進んでいる。",
      },
    ],
    living: {
      housing: {
        areas: ["Indiranagar", "Whitefield"],
        rents: [
          {
            layout: "2BHK（Indiranagar、駐在員向け）",
            minUsd: 335,
            maxUsd: 680,
          },
          {
            layout: "2BHK（Whitefield・ゲーテッドコミュニティ、駐在員向け）",
            minUsd: 188,
            maxUsd: 367,
          },
        ],
        note: "Indiranagarは地下鉄パープルラインが通る中心部の高級住宅・商業エリアでカフェやコワーキングスペースが集積し、駐在員に人気。Whitefieldは東部のITパーク(ITPL等)一帯に隣接する新興エリアで、インターナショナルスクールやゲーテッドコミュニティが多く、Indiranagarより家賃が抑えられるため、GCCオフィスに近く子供連れの駐在員家庭にも選ばれやすい。",
      },
      safetyHealth: {
        safetyNote: "インドの大都市の中では比較的治安が安定しているとされるが、コマーシャル・ストリートやMG Road周辺の繁華街ではスリ・置き引きに注意が必要。旧市街のマジェスティック(バススタンド周辺)やシヴァジナガルは夜間の単独行動を避けたい。深夜の移動はUber・Olaなどアプリ配車の利用が推奨される。",
        hospitals: [
          {
            name: "Sakra World Hospital（アウター・リング・ロード、マラタハリ）",
            note: "豊田通商とセコムグループの合弁で2014年開業した、インド初の外資100%出資病院。国際患者向けにアラビア語・日本語・フランス語の通訳サービスを提供しており、日系駐在員にとって数少ない日本語対応の選択肢となる。NABH認定。",
          },
          {
            name: "Fortis Hospital（バンネルガッタ・ロード）",
            note: "2006年開業、2008年にカルナータカ州で初めてJCI(国際病院評価機構)認定を取得した総合病院。",
          },
          {
            name: "Apollo Hospitals（バンネルガッタ・ロード）",
            note: "2007年開業、JCI・NABH認定を取得した250床の総合病院。50以上の診療科を持つ。",
          },
        ],
        healthNote: "Sakra World Hospitalは日本語通訳サービスを公式に提供しているため、英語での症状説明に不安がある場合の有力な選択肢となる。他の病院では日本語対応スタッフの常駐は確認できておらず、海外旅行保険の医療アシスタンス経由での通訳手配が無難。",
      },
      transport: {
        fromAirport: "KIA(ケンペゴウダ国際空港)からIndiranagarまで車で約35〜40分、Whitefieldまで約35分(通常時)。渋滞状況により大きく変動する。",
        inCity: "地下鉄Namma Metroが拡大中で、パープルラインはWhitefieldからChallaghattaまでを結ぶ。Uber・Olaなどアプリ配車も広く普及しているが、道路渋滞が慢性的。",
        directFlightFromJapan: "JAL(日本航空)が成田―ベンガルール間に2020年3月、ボーイング787-8型機で直行便を就航(インドで2番目のJAL直行路線)。2026年は時期により週3便〜毎日運航の間で変動し、9月からは通年毎日運航化の予定。所要時間は成田発9時間55分・ベンガルール発7時間45分。ANAの直行便はない。",
        commuteNote: "TomTomトラフィック指数2025によれば、ベンガルールは世界で2番目に渋滞の激しい都市(渋滞スコア74.4)。ラッシュ時の平均時速は16.6km/hまで低下し、通勤者は年間168時間を渋滞で失う計算となる。2022年9月にはMicrosoft・Intel・Goldman Sachsなどの拠点が集まるOuter Ring Road(ORR)沿いのIT団地一帯で大雨による冠水が発生し、ボートでの救助が出るほどの混乱となった。オフィスと居住地の距離をできるだけ縮めることが、他都市以上に重要な判断材料となる。",
      },
      japaneseCommunity: {
        association: "バンガロール日本人会（bangalore-nihonjinkai.com）",
        schools: ["バンガロール補習授業校（土曜校、Trio World Academy内・Sahakar Nagar）"],
        groceries: [],
        corporateNote: "ベンガルールはインド最大のGCC(グローバル・キャパビリティ・センター)集積地。在ベンガルール日本国総領事の名和浩史氏は2026年、同市のGCCエコシステムやスタートアップ文化、厚みのあるエンジニア人材が日系企業を引き付ける自然な魅力になっていると述べ、半導体・製造・研究開発・人材育成などを重点分野に挙げた。",
      },
      verifiedAt: "2026-07",
    },
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

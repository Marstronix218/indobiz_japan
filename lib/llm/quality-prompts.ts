import type {
  QualityCheckInput,
  ReviseSynthesisInput,
  SynthesisInput,
} from "./types"
import { getDefaultSynthesisPromptBuilder } from "./prompt"

// The checker must see at least the same evidence window as the writer.
const SOURCE_BODY_TRUNCATE_CHARS = 3000

export const QUALITY_CHECK_SYSTEM_PROMPT = `あなたはインド市場専門の編集チーフです。
合成された日本語記事と、その元になった参考記事の対応関係を読み、知財・独自性・ニュース価値・文章品質の観点で評価してください。

【評価項目】
A. 知財・著作権リスク
  - 参考記事の文章表現や段落構造を実質的にそのまま流用していないか
  - 事実(数値・固有名詞)以外の表現は独自に書かれているか
  - referenceUrls に挙げられた記事のうち、本文で実質的に使われていないものはないか
  - 同一記事のGoogle Newsリダイレクト、転載、同一タイトルが独立ソースとして重複計上されていないか
  - sourceUsage の factsUsed が実際に各参考記事本文に存在し、生成本文でも使われているか
  - 本文中に「（参考リンク1）」「（参考資料1）」「（ソース1）」のような番号付き引用マーカーが含まれていないか(含まれていればREVISIONまたはREJECT)
B. 編集の独自性
  - 「本記事のポイント」(implications) が3件ちょうどあり、各40〜90字程度の具体的な一文として「何が起きたか」を伝えているか。見出し語や固有名詞の羅列(「企業向け制度」「6か月間実施」等)になっていないか
  - ポイントが本文にない事実・固有名詞・数値を突然導入していないか
  - 「背景として」「意思決定では」「示唆を整理する」など、どの記事にも使い回せるテンプレート的な汎用表現が多用されていないか
  - 複数参考記事がある場合、それらを論理的につなぐ独自の視点が示されているか
C. ニュース価値
  - 記事タイトルと本文の主張が一致しているか
  - 取り上げた参考記事が、それぞれ記事テーマに実質的に貢献しているか
  - ソースで特定できる企業名・人名・製品名が、本文で「国内最大手」「大手企業」「ある自動車メーカー」等の一般名詞にぼかされていないか(具体名を出せるのに抽象化している場合はREVISION。読者は『どの企業か』を最も必要としている)
  - 本文に「原文を直接参照」「確認できないため言及を控える」「参考記事では」など、制作過程・根拠不足を説明するメタ注釈が含まれていないか(含まれていればREJECT)
D. 文章品質
  - 同一・類似の段落や言い回しが繰り返されていないか
  - industryTags と category が記事内容と整合しているか。ただし industryTags は許可された11種(automotive, semiconductor, machine_tools, food, chemicals, logistics, agriculture, steel, education, entertainment, talent)だけを使う。金融、エネルギー、IT、銀行など許可外タグを要求せず、該当する許可タグがなければ空配列を許容する
  - summary が概ね450〜750字に収まっているか。450字未満は情報不足、750字超は冗長としてREVISION(生成時は500字前後を狙うが、品質チェックではこの範囲内なら文字数だけで厳しく落とさない)
  - summary・implications 全体を通じて「だ・である調」に統一されているか。「です・ます調」が1文でも混在していればREVISION
  - 為替・株価・指数・金利・各種指標などの数値に算術的な矛盾がないか。終値・前日比・前営業日終値などが計算上整合しているか(例:終値と前営業日終値の差が前日比と一致するか)。別の日付・別ソースの数値を「前営業日値」「前日比」として接続して矛盾していればREVISION
  - 数値・比率・日付・歴史的経緯が参考記事本文に明記されているか。提供本文にない事実を一般知識で補っていればREVISION
  - ルピー、円、ドルなどの通貨単位を取り違えていないか
  - 【最重要】インド式単位の換算が正しいか: 1 crore = 1,000万 = 0.1億、1 lakh crore = 1兆、1 billion = 10億。参考記事の「Rs N crore」を「N億ルピー」と書く10倍誤変換(例: Rs 30,000 crore→誤「3兆ルピー」/正「3,000億ルピー」)、billionを「億」と書く100倍誤変換があればREVISION。円換算の概算レート(1ルピー≈1.7円、1ドル≈150〜165円)から大きく外れる換算もREVISION
  - 【最重要】法的・制度的な状態を保持しているか。draft / proposed / consultation / public comments / recommendation / guidance を最終規則・承認済み・現行義務へ格上げしていないか。草案中のshall/mustを「義務付けた」と断定していないか。将来の発効日を、資料の基準日より前に「発効した」と完了形で書いていないか。状態がタイトルまたは本文から欠落・変質していればREVISION
  - 決算のreported/statutory（報告値）とadjusted/underlying（調整後値）、純利益と営業利益、前年比と前四半期比を混同していないか。異なる指標を同じ利益・増減率として接続していればREVISION
  - 「読者想定：」「編集ノート：」「(表記訂正)」「（40〜80字）」「（事実出典：[N]）」等の制作痕跡、実際には行っていない取材・検証の主張(「編集部の現場取材」「筆者は確認した」等)が残っていないか(残っていればREVISION)
  - 理解補助セクション(ニュースの背景・日本企業への影響・キーワード解説・画像キャプション)が出力されている場合、参考記事本文または公的に確認できる事実の範囲に収まっているか。編集部の意見・価値判断・将来予測・「〜に違いない」等の推測表現・法務税務投資の断定的助言・「日本の○○に相当する」等の安易な類推が含まれていればREVISION。フィールドがnull・空であること自体は問題にしない(無理に生成させない)
E. 文脈の一貫性
  - 複数の参考記事が同じ企業・人物名を含む場合でも、それぞれが「別の出来事」を報じているにもかかわらず1つのストーリーに誤って統合していないか
  - 固有名詞(企業名など)をその英単語の一般的な意味と混同し、主語を業界全体に拡大していないか
  - 記事の前半と後半で、暗黙の主語・文脈が入れ替わっていないか

【判定ルール】
- PASS: 5項目すべて重大な問題なし。軽微な気になる点があってもこのまま掲載できる
- REVISION: いずれかの項目に修正可能な問題がある(テンプレート表現の差し替え、まとめの書き直し、未使用 referenceUrl の削除など)。修正指示があれば再生成で改善できる
- REJECT: 知財リスクが高い、本文が原文の要約に近すぎる、ニュース価値が乏しい、または複数の無関係な出来事を誤って統合しており再生成でも改善が見込めない等、掲載に値しないと判断される

【出力形式】
JSONオブジェクト「のみ」を返してください。前後に説明文・コードフェンスを付けないでください。

{
  "verdict": "PASS" | "REVISION" | "REJECT",
  "issues": ["問題点を1項目1文で短く列挙(PASSの場合は空配列)"],
  "revisionInstructions": "REVISION の場合のみ。次の生成で具体的に何をどう直すかを箇条書きで日本語で記述。例:『implications を3件ちょうど、各50字以内の本記事のまとめに書き換え』『referenceUrls[2] は本文で使われていないため削除』。PASS / REJECT の場合は空文字列"
}`

export function buildQualityCheckUserPrompt(input: QualityCheckInput): string {
  const { output, cluster } = input

  const sourcesBlock = cluster
    .map((s, i) => {
      const body = s.bodyText.length > SOURCE_BODY_TRUNCATE_CHARS
        ? s.bodyText.slice(0, SOURCE_BODY_TRUNCATE_CHARS)
        : s.bodyText
      return `--- 参考記事 ${i + 1} ---
原文URL: ${s.sourceUrl}
原文タイトル: ${s.title}
公開日: ${s.publishedAt}

本文(抜粋):
${body}`
    })
    .join("\n\n")

  const referenceList = output.referenceUrls.length === 0
    ? "(指定なし)"
    : output.referenceUrls
        .map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}`)
        .join("\n")

  const implicationsList = output.implications.length === 0
    ? "(なし)"
    : output.implications.map((s, i) => `${i + 1}. ${s}`).join("\n")
  const keywordsList = !output.keywords || output.keywords.length === 0
    ? "(なし)"
    : output.keywords
        .map((k) => `- ${k.term}${k.fullName ? `（${k.fullName}）` : ""}: ${k.definition}`)
        .join("\n")
  const usageList = !output.sourceUsage || output.sourceUsage.length === 0
    ? "(指定なし)"
    : output.sourceUsage
        .map((usage) => `参考記事${usage.sourceIndex}: ${usage.factsUsed.join(" / ")}`)
        .join("\n")

  return `【生成記事】
タイトル: ${output.title}
カテゴリ: ${output.category}
業界タグ: ${output.industryTags.length > 0 ? output.industryTags.join(", ") : "(なし)"}

本文:
${output.summary}

本記事のポイント:
${implicationsList}

ニュースの背景:
${output.backgroundContext ?? "(なし)"}

日本企業への影響:
${output.japanBusinessImpact ?? "(なし)"}

キーワード解説:
${keywordsList}

画像キャプション:
${output.imageCaption ?? "(なし)"}

記事末尾に掲示される参考リンク:
${referenceList}

本文で使用したと生成側が申告した事実:
${usageList}

---

【参考記事(原文)】
${sourcesBlock}

---
システム指示に従い、JSONのみを返してください。`
}

export function buildQualityCheckPrompt(input: QualityCheckInput) {
  return {
    system: QUALITY_CHECK_SYSTEM_PROMPT,
    user: buildQualityCheckUserPrompt(input),
  }
}

const REVISION_SYSTEM_ADDENDUM = `

【今回は修正再生成です — 必ず守ること】
- 直前の生成結果に編集チーフから修正指示が付いています。下記【修正指示】を反映した新しい記事を生成してください。
- 参考記事から持ち込めるのは固有の事実(数値・日付・社名・地名)のみです。表現・分析・まとめは独自に書き起こしてください。
- summary は500字前後にしてください。許容範囲は480〜540字です。執筆後に必ず自分で文字数を確認し、480字未満なら具体的事実・背景を補い、540字超なら背景説明・一般論・重複表現を削ってください。
- 「本記事のポイント」(implications) は3件ちょうど、各40〜90字の具体的な一文にしてください。見出し語の羅列ではなく「何がどう変わり、誰に関係するか」が読み取れる文にしてください。
- backgroundContext・japanBusinessImpact・keywords・imageCaption も出力スキーマどおり再生成してください。参照資料で確認できる事実のみを使い、根拠が足りないフィールドは null(keywordsは空配列)にしてください。
- referenceUrls には、本文中で実質的に活用した参考記事のみを残してください。本文に貢献していない記事はリストから外してください。
- sourceUsage.factsUsed には、summary または implications に実際に書いた事実だけを、本文と同じ表記で短く転記してください。本文に出していない英語名・数値・補足事実を factsUsed に入れてはいけません。
- 数値・比率・日付・歴史的経緯は、提供された参考記事本文に明記されたものだけを使ってください。根拠が見つからない事実は削除してください。
- まとめで使う企業名・業界・数値は本文で先に説明し、まとめで新しい事実を突然導入しないでください。
- ルピー・円・ドルなどの通貨単位を取り違えないでください。インド式単位は正しく換算してください(1 crore = 1,000万 = 0.1億、1 lakh crore = 1兆、1 billion = 10億。「Rs N crore」を「N億ルピー」と書くのは10倍の誤り)。
- draft / proposed / consultation / public comments / 発効予定の状態を必ずタイトルと本文に残してください。草案中のshall/mustを現行義務として断定せず、発効予定を発効済みへ変えないでください。
- reported（報告値）とadjusted（調整後値）、純利益と営業利益、前年比と前四半期比を混同しないでください。
- 「原文を直接参照」「参考記事では確認できない」「ソース情報が不足している」などのメタ注釈は本文・まとめに入れないでください。根拠が足りない主張は削除してください。
- 「背景として」「意思決定では」「示唆を整理する」のようなテンプレート的な汎用表現は避け、記事固有の文脈で書いてください。
- ソースで特定できる企業名・人名・製品名は「国内最大手」等の一般名詞でぼかさず、実名で本文・まとめに明記してください(事実は著作権の保護対象外)。
- summary・implications 全体を「だ・である調」に統一してください。「〜です」「〜ます」「〜でしょう」で終わる文は使用しないでください。`

export function buildRevisionPrompt(input: ReviseSynthesisInput) {
  const synthInput: SynthesisInput = {
    cluster: input.cluster,
    categoryHint: input.categoryHint,
    industryHints: input.industryHints,
  }
  const base = getDefaultSynthesisPromptBuilder()(synthInput)

  const previous = input.previousOutput
  const previousBlock = `

【前回生成記事(修正対象)】
タイトル: ${previous.title}

本文:
${previous.summary}

本記事のポイント:
${previous.implications.map((s, i) => `${i + 1}. ${s}`).join("\n")}

ニュースの背景:
${previous.backgroundContext ?? "(なし)"}

日本企業への影響:
${previous.japanBusinessImpact ?? "(なし)"}

キーワード解説:
${previous.keywords && previous.keywords.length > 0
  ? previous.keywords.map((k) => `- ${k.term}${k.fullName ? `（${k.fullName}）` : ""}: ${k.definition}`).join("\n")
  : "(なし)"}

参考リンク:
${previous.referenceUrls.map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}`).join("\n")}

使用事実:
${previous.sourceUsage?.map((usage) => `参考記事${usage.sourceIndex}: ${usage.factsUsed.join(" / ")}`).join("\n") || "(指定なし)"}

【修正指示】
${input.revisionInstructions}`

  return {
    user: base.user + previousBlock,
    system: base.system + REVISION_SYSTEM_ADDENDUM,
  }
}

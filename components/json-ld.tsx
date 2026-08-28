import type { JsonLdObject } from "@/lib/structured-data"

/**
 * 構造化データを <script type="application/ld+json"> として出力する。
 * `<` をエスケープして、記事タイトル等に紛れたHTMLでスクリプトが閉じないようにする。
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const payload = Array.isArray(data) ? data : [data]
  return (
    <>
      {payload.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  )
}

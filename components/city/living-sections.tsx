import type { CityLiving } from "@/lib/cities"

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-border bg-card p-5">
      <h3 className="mb-3 border-b border-border pb-2 font-serif text-base font-bold">{title}</h3>
      {children}
    </section>
  )
}

export function LivingSections({ living }: { living: CityLiving }) {
  const { housing, safetyHealth, transport, japaneseCommunity } = living

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {housing && (
        <Block title="住居・家賃相場">
          <p className="text-xs text-muted-foreground">主な駐在エリア</p>
          <p className="mt-1 text-sm">{housing.areas.join("・")}</p>
          {housing.rents.length > 0 && (
            <dl className="mt-3 space-y-1 font-mono text-xs">
              {housing.rents.map((rent) => (
                <div key={rent.layout} className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{rent.layout}</dt>
                  <dd className="tabular-nums">${rent.minUsd.toLocaleString()}〜${rent.maxUsd.toLocaleString()}/月</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{housing.note}</p>
        </Block>
      )}

      {safetyHealth && (
        <Block title="治安・医療">
          <p className="text-sm leading-relaxed text-muted-foreground">{safetyHealth.safetyNote}</p>
          {safetyHealth.hospitals.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {safetyHealth.hospitals.map((hospital) => (
                <li key={hospital.name} className="text-sm">
                  <span className="font-bold">{hospital.name}</span>
                  <span className="text-muted-foreground"> — {hospital.note}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{safetyHealth.healthNote}</p>
        </Block>
      )}

      {transport && (
        <Block title="交通・空港アクセス">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">空港から市内</dt>
              <dd className="leading-relaxed">{transport.fromAirport}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">市内移動</dt>
              <dd className="leading-relaxed">{transport.inCity}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">日本からの直行便</dt>
              <dd className="leading-relaxed">{transport.directFlightFromJapan}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">通勤</dt>
              <dd className="leading-relaxed">{transport.commuteNote}</dd>
            </div>
          </dl>
        </Block>
      )}

      {japaneseCommunity && (
        <Block title="日本人コミュニティ">
          {japaneseCommunity.association && (
            <p className="text-sm">
              <span className="text-xs text-muted-foreground">日本人会</span>
              <br />
              {japaneseCommunity.association}
            </p>
          )}
          {japaneseCommunity.schools.length > 0 && (
            <p className="mt-2 text-sm">
              <span className="text-xs text-muted-foreground">学校</span>
              <br />
              {japaneseCommunity.schools.join("・")}
            </p>
          )}
          {japaneseCommunity.groceries.length > 0 && (
            <p className="mt-2 text-sm">
              <span className="text-xs text-muted-foreground">日本食材</span>
              <br />
              {japaneseCommunity.groceries.join("・")}
            </p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{japaneseCommunity.corporateNote}</p>
        </Block>
      )}
    </div>
  )
}

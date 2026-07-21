"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface SurveyState {
  role: string
  industry: string
  indiaStage: string
  usefulness: string
  trust: string
  desiredInformation: string
  feedback: string
  privacyConsent: boolean
}

const initialState: SurveyState = {
  role: "",
  industry: "",
  indiaStage: "",
  usefulness: "",
  trust: "",
  desiredInformation: "",
  feedback: "",
  privacyConsent: false,
}

export function BetaSurveyForm({ nextPath }: { nextPath: string }) {
  const router = useRouter()
  const [form, setForm] = useState(initialState)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof SurveyState>(key: K, value: SurveyState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    if (
      !form.role ||
      !form.indiaStage ||
      !form.usefulness ||
      !form.trust ||
      !form.desiredInformation.trim() ||
      !form.privacyConsent
    ) {
      setError("必須項目をすべて入力してください。")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/beta/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          usefulness: Number(form.usefulness),
          trust: Number(form.trust),
        }),
      })
      const result = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) throw new Error(result.error || "回答を送信できませんでした。")
      router.replace(nextPath)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "回答を送信できませんでした。")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <SurveySelect
        id="role"
        label="あなたの役割"
        value={form.role}
        onChange={(value) => update("role", value)}
        options={[
          ["executive", "経営・役員"],
          ["business_development", "事業開発・海外事業"],
          ["research", "調査・企画"],
          ["other", "その他"],
        ]}
      />

      <div className="space-y-2">
        <Label htmlFor="industry">業界（任意）</Label>
        <Input
          id="industry"
          value={form.industry}
          maxLength={80}
          onChange={(event) => update("industry", event.target.value)}
          placeholder="例：製造業、IT、金融"
        />
      </div>

      <SurveySelect
        id="indiaStage"
        label="インド事業の現在地"
        value={form.indiaStage}
        onChange={(value) => update("indiaStage", value)}
        options={[
          ["considering", "情報収集・検討中"],
          ["preparing", "進出・事業開始を準備中"],
          ["operating", "すでに事業を展開中"],
          ["none", "現時点では予定なし"],
        ]}
      />

      <RatingSelect
        id="usefulness"
        label="記事は業務や意思決定に役立ちそうですか？"
        value={form.usefulness}
        onChange={(value) => update("usefulness", value)}
      />

      <RatingSelect
        id="trust"
        label="記事の信頼性・納得感をどう評価しますか？"
        value={form.trust}
        onChange={(value) => update("trust", value)}
      />

      <div className="space-y-2">
        <Label htmlFor="desiredInformation">今後、どのような情報を読みたいですか？</Label>
        <Textarea
          id="desiredInformation"
          value={form.desiredInformation}
          maxLength={500}
          onChange={(event) => update("desiredInformation", event.target.value)}
          placeholder="例：州別の規制変更、日系企業の事例、現地採用情報"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback">改善してほしい点・感想（任意）</Label>
        <Textarea
          id="feedback"
          value={form.feedback}
          maxLength={1000}
          onChange={(event) => update("feedback", event.target.value)}
          placeholder="率直なご意見をお聞かせください"
        />
      </div>

      <div className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-4">
        <Checkbox
          id="privacyConsent"
          checked={form.privacyConsent}
          onCheckedChange={(checked) => update("privacyConsent", checked === true)}
        />
        <Label htmlFor="privacyConsent" className="text-sm font-normal leading-6">
          回答をIndoBizの品質改善・β版評価に利用することに同意します。営業配信への同意ではありません。
        </Label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "送信中…" : "回答してフルアクセスを開放"}
      </Button>
    </form>
  )
}
function SurveySelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<[string, string]>
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>
        <SelectContent>
          {options.map(([optionValue, optionLabel]) => (
            <SelectItem key={optionValue} value={optionValue}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function RatingSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <SurveySelect
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      options={[
        ["1", "1 — 低い"],
        ["2", "2"],
        ["3", "3 — 普通"],
        ["4", "4"],
        ["5", "5 — 高い"],
      ]}
    />
  )
}

"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DIGEST_FREQUENCY_LABELS,
  type DigestFrequency,
  type MembershipSignup,
} from "@/lib/site-config"
import { submitWeb3Form } from "@/lib/web3forms"

const EMPTY_SIGNUP: MembershipSignup = {
  companyName: "",
  contactName: "",
  email: "",
  frequency: "weekly",
}

export function MembershipCaptureForm() {
  const [form, setForm] = useState<MembershipSignup>(EMPTY_SIGNUP)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.contactName.trim() || !form.email.trim()) {
      toast.error("担当者名とメールアドレスを入力してください。")
      return
    }

    setIsSubmitting(true)
    try {
      const companyName = form.companyName.trim() || "未入力"

      await submitWeb3Form({
        subject: `【IndoBiz Japan】後援会入会フォーム - ${companyName}`,
        from_name: form.contactName,
        replyto: form.email,
        フォーム種別: "後援会入会フォーム",
        会社名: companyName,
        担当者名: form.contactName,
        メールアドレス: form.email,
        配信頻度: DIGEST_FREQUENCY_LABELS[form.frequency],
      })

      toast.success("無料会員登録を受け付けました。ダイジェスト配信の案内をお送りします。")
      setForm(EMPTY_SIGNUP)
    } catch (error) {
      console.error("Failed to submit membership form", error)
      toast.error("送信できませんでした。時間をおいて再度お試しください。")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">無料会員登録</h3>
        <p className="text-base leading-8 text-muted-foreground">
          日次または週次のダイジェストを受け取り、法人向けパイロット情報も先行で確認できます。
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="membershipCompany">会社名</Label>
        <Input
          id="membershipCompany"
          value={form.companyName}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              companyName: event.target.value,
            }))
          }
          placeholder="株式会社サンプル"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="membershipName">担当者名</Label>
        <Input
          id="membershipName"
          value={form.contactName}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              contactName: event.target.value,
            }))
          }
          placeholder="山田 太郎"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="membershipEmail">メールアドレス</Label>
        <Input
          id="membershipEmail"
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              email: event.target.value,
            }))
          }
          placeholder="name@company.co.jp"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="membershipFrequency">配信頻度</Label>
        <Select
          value={form.frequency}
          onValueChange={(value) =>
            setForm((current) => ({
              ...current,
              frequency: value as DigestFrequency,
            }))
          }
        >
          <SelectTrigger id="membershipFrequency" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(DIGEST_FREQUENCY_LABELS) as DigestFrequency[]).map(
              (frequency) => (
                <SelectItem key={frequency} value={frequency}>
                  {DIGEST_FREQUENCY_LABELS[frequency]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "送信中..." : "無料で登録する"}
      </Button>
    </form>
  )
}

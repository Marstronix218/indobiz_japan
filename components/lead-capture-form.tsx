"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitWeb3Form } from "@/lib/web3forms"
import { type LeadInquiry } from "@/lib/site-config"

interface LeadCaptureFormProps {
  title?: string
  description?: string
  compact?: boolean
}

const EMPTY_INQUIRY: LeadInquiry = {
  companyName: "",
  contactName: "",
  email: "",
  message: "",
}

export function LeadCaptureForm({
  title = "お問い合わせフォーム",
  description = "ご相談内容を自由にご記入ください。",
  compact = false,
}: LeadCaptureFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<LeadInquiry>(EMPTY_INQUIRY)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.contactName.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("お名前・メールアドレス・お問い合わせ内容を入力してください。")
      return
    }

    setIsSubmitting(true)
    try {
      const companyName = form.companyName.trim() || "未入力"

      await submitWeb3Form({
        subject: `【IndoBiz Japan】お問い合わせフォーム - ${companyName}`,
        from_name: form.contactName,
        replyto: form.email,
        フォーム種別: "お問い合わせフォーム",
        会社名: companyName,
        お名前: form.contactName,
        メールアドレス: form.email,
        お問い合わせ内容: form.message,
      })

      toast.success("お問い合わせを受け付けました。24時間以内を目安にご連絡します。")
      router.push("/contact/thanks")
    } catch (error) {
      console.error("Failed to submit contact form", error)
      toast.error("送信できませんでした。時間をおいて再度お試しください。")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-base leading-8 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "md:grid-cols-2"}`}>
        <div className="space-y-2">
          <Label htmlFor="contactName">お名前</Label>
          <Input
            id="contactName"
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
          <Label htmlFor="companyName">
            会社名・団体名
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              （任意）
            </span>
          </Label>
          <Input
            id="companyName"
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              email: event.target.value,
            }))
          }
          placeholder="name@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">お問い合わせ内容</Label>
        <Textarea
          id="message"
          value={form.message}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              message: event.target.value,
            }))
          }
          placeholder="ご相談・ご質問の内容を自由にご記入ください。"
          className="min-h-40"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "送信する"}
        </Button>
      </div>
    </form>
  )
}

export const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY

export type Web3FormsPayload = Record<string, string>

export async function submitWeb3Form(payload: Web3FormsPayload) {
  if (!WEB3FORMS_ACCESS_KEY) {
    throw new Error("NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY is not configured")
  }

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      ...payload,
    }),
  })
  const responseText = await response.text()
  let data: { success?: boolean; message?: string } = {}

  try {
    data = JSON.parse(responseText) as { success?: boolean; message?: string }
  } catch {
    throw new Error(
      `Web3Forms returned ${response.status}: ${responseText.slice(0, 160)}`,
    )
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || "web3forms submit failed")
  }

  return data
}

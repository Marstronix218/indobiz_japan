import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site-config"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/login",
        "/signup",
        "/profile",
        "/extend-code",
        "/contact/thanks",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
